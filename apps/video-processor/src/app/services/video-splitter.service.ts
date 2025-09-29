// services/video-splitter.service.ts
import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { spawn } from 'child_process';
import { BullMQService } from '@safliix-back/bullmq';
import { VideoProcessingOptions, VideoSegment, EncodingJobData, VideoAnalysisResult } from '../interfaces/video-process.interface';


@Injectable()
export class VideoSplitterService {
  private readonly logger = new Logger(VideoSplitterService.name);
  
  // STRATÉGIE BASÉE UNIQUEMENT SUR LA DURÉE
  private readonly DURATION_BASED_STRATEGY = [
    // Format: [duréeMin, duréeMax, segmentLength, description]
    { min: 0, max: 30, segmentLength: 0, description: 'Très court - pas de découpage' },
    { min: 30, max: 300, segmentLength: 30, description: 'Court - segments 30s' },
    { min: 300, max: 900, segmentLength: 60, description: 'Moyen - segments 1min' },
    { min: 900, max: 1800, segmentLength: 120, description: 'Long - segments 2min' },
    { min: 1800, max: 3600, segmentLength: 180, description: 'Très long - segments 3min' },
    { min: 3600, max: 7200, segmentLength: 300, description: 'Extra long - segments 5min' },
    { min: 7200, max: Infinity, segmentLength: 600, description: 'Géant - segments 10min' }
  ];

  private readonly MAX_SEGMENTS = 100;
  private readonly MIN_SEGMENT_LENGTH = 10;
  private readonly MAX_SEGMENT_DURATION = 900; // 15 minutes max
  private readonly FFMPEG_TIMEOUT = 300000; // 5 minutes

  constructor(private readonly bullMQService: BullMQService) {}

  /**
   * Point d'entrée principal pour le traitement vidéo
   */
  async processVideo(options: VideoProcessingOptions): Promise<{ 
  jobIds: string[]; 
  segments: number; 
  strategy: string;
  totalDuration: number;
}> {
  const { s3Key, userId, customPriority } = options;

  if (!s3Key?.trim()) {
    throw new BadRequestException('Le paramètre "file" est requis.');
  }

  let localPath: string | undefined;
  let segmentsDir: string | undefined;

  try {
    // 1️⃣ Téléchargement depuis S3
    this.logger.log(`Téléchargement de ${s3Key} depuis S3`);
    localPath = await this.downloadFromS3(s3Key);
    this.logger.log(`Fichier téléchargé localement: ${localPath}`);

    // 2️⃣ Vérification du fichier
    const stats = await fs.stat(localPath);
    if (stats.size === 0) throw new BadRequestException('Le fichier vidéo est vide.');

    // 3️⃣ Analyse de la vidéo
    this.logger.log(`Analyse de la vidéo: ${s3Key}`);
    const videoInfo = await this.analyzeVideo(localPath);
    if (videoInfo.duration <= 0) throw new BadRequestException('Durée de la vidéo invalide.');

    // 4️⃣ Détermination de la stratégie de segmentation
    const strategy = this.determineSegmentationStrategy(videoInfo.duration);
    this.logger.log(`Stratégie: ${strategy.description} (${videoInfo.duration}s)`);

    // 5️⃣ Création du répertoire pour les segments
    segmentsDir = await this.createSegmentsDirectory(localPath);
    this.logger.log(`Répertoire des segments: ${segmentsDir}`);

    // 6️⃣ Découpage ou traitement direct
    let segments: VideoSegment[] = [];
    if (strategy.shouldSplit) {
      segments = await this.splitVideoIntoSegments(
        localPath, 
        segmentsDir, 
        strategy.segmentLength, 
        videoInfo.duration
      );
      this.logger.log(`Découpé en ${segments.length} segments de ${strategy.segmentLength}s`);
    } else {
      segments = [{
        path: localPath,
        index: 0,
        startTime: 0,
        duration: videoInfo.duration,
        totalSegments: 1
      }];
      this.logger.log('Traitement direct sans découpage');
    }

    // 7️⃣ Calcul de la priorité
    const priority = customPriority || this.calculatePriorityByDuration(videoInfo.duration);

    // 8️⃣ Création des jobs en bulk pour la queue
    const bulkJobs = segments.map(segment => ({
      name: 'processVideo' as const,
      data: {
        file: segment.path,
        userId,
        segmentIndex: segment.index,
        originalFile: s3Key,
        priority,
      },
      opts: { priority, attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    }));

    const jobInstances = await this.bullMQService.addBulkToQueue('VIDEO_PROCESSING', bulkJobs);
    const jobIds = jobInstances.map(job => job.id).filter((id): id is string => typeof id === 'string');

    jobInstances.forEach((job, idx) => {
      this.logger.log(`Job ajouté pour le segment ${segments[idx].index} (id=${job.id})`);
    });

    return {
      jobIds,
      segments: segments.length,
      strategy: strategy.description,
      totalDuration: videoInfo.duration
    };

  } catch (error) {
    this.logger.error(`Erreur lors du traitement de ${s3Key}:`, error);
    await this.cleanupOnError(localPath, segmentsDir);
    throw new InternalServerErrorException(`Échec du traitement: ${(error as Error).message}`);
  } finally {
    if (localPath) await this.cleanupLocalFile(localPath);
  }
}


  /**
   * Détermine la stratégie de découpage basée sur la durée
   */
  private determineSegmentationStrategy(duration: number): { 
    shouldSplit: boolean;
    segmentLength: number;
    description: string;
    estimatedSegments: number;
  } {
    const strategy = this.DURATION_BASED_STRATEGY.find(
      s => duration >= s.min && duration <= s.max
    ) || this.DURATION_BASED_STRATEGY[this.DURATION_BASED_STRATEGY.length - 1];

    const shouldSplit = strategy.segmentLength > 0;
    
    let segmentLength = strategy.segmentLength;
    let estimatedSegments = shouldSplit ? Math.ceil(duration / segmentLength) : 1;

    // Ajustement si trop de segments
    if (estimatedSegments > this.MAX_SEGMENTS) {
      segmentLength = Math.ceil(duration / this.MAX_SEGMENTS);
      estimatedSegments = Math.ceil(duration / segmentLength);
      this.logger.warn(`Ajustement automatique: segmentLength=${segmentLength}s`);
    }

    // Validation des limites
    segmentLength = Math.min(segmentLength, this.MAX_SEGMENT_DURATION);
    segmentLength = Math.max(segmentLength, this.MIN_SEGMENT_LENGTH);

    return {
      shouldSplit,
      segmentLength,
      description: strategy.description,
      estimatedSegments
    };
  }

  /**
   * Découpe la vidéo en segments
   */
  private async splitVideoIntoSegments(
    inputPath: string,
    outputDir: string,
    segmentLength: number,
    totalDuration: number
  ): Promise<VideoSegment[]> {
    const totalSegments = Math.ceil(totalDuration / segmentLength);
    const segments: VideoSegment[] = [];

    this.logger.log(`Découpage de ${totalDuration}s en ${totalSegments} segments de ${segmentLength}s`);

    for (let i = 0; i < totalSegments; i++) {
      const startTime = i * segmentLength;
      const remaining = totalDuration - startTime;
      const duration = Math.min(segmentLength, remaining);

      if (duration <= 0.5) break; // Ignorer les segments de moins de 0.5s

      const segmentPath = path.join(outputDir, `segment_${i.toString().padStart(4, '0')}.mp4`);
      this.logger.log(`Création du segment ${i + 1}/${totalSegments}: ${segmentPath} (start: ${startTime}s, duration: ${duration}s)`);
      await this.extractSegment(inputPath, segmentPath, startTime, duration, i);
      
      segments.push({
        path: segmentPath,
        index: i,
        startTime,
        duration,
        totalSegments
      });

      // Log de progression
      if ((i + 1) % 10 === 0 || i === totalSegments - 1) {
        this.logger.log(`Segment ${i + 1}/${totalSegments} créé`);
      }
    }

    return segments;
  }

  /**
   * Extrait un segment vidéo spécifique
   */
  private async extractSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
    segmentIndex: number
  ): Promise<void> {
    const args = [
      '-ss', startTime.toString(),
      '-i', inputPath,
      '-c', 'copy',
      '-map', '0',
      '-t', duration.toString(),
      '-avoid_negative_ts', 'make_zero',
      '-y',
      outputPath
    ];

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout segment ${segmentIndex}`)), this.FFMPEG_TIMEOUT);
    });

    const ffmpegPromise = this.runFFmpeg(args, `segment-${segmentIndex}`);
    
    const { code, stderr } = await Promise.race([ffmpegPromise, timeoutPromise]);
    
    if (code !== 0) {
      throw new Error(`Échec extraction segment ${segmentIndex}: ${stderr.substring(0, 500)}`);
    }

    // Vérification du fichier créé
    try {
      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        await fs.unlink(outputPath);
        throw new Error(`Segment ${segmentIndex} créé vide`);
      }
    } catch (error) {
      throw new Error(`Échec vérification segment ${segmentIndex}: ${(error as Error).message}`);
    }
  }

  /**
   * Crée les jobs BullMQ pour l'encodage
   */
  private async createEncodingJobs(
    segments: VideoSegment[],
    options: {
      originalFile: string;
      durationCategory: string;
      userId: string;
      priority: number;
    }
  ): Promise<string> {
    const jobs = segments.map((segment, index) => {
      const jobData: EncodingJobData = {
        segment,
        originalFile: options.originalFile,
        resolutions: this.getResolutionsForDuration(segment.duration),
        durationCategory: options.durationCategory,
        userId: options.userId
      };

      return {
        name: 'encode-video-segment',
        data: jobData,
        opts: {
          priority: this.calculateJobPriority(options.priority, index, segments.length),
          delay: index * 2000, // Délai progressif
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false
        }
      };
    });

    // Ajout par lots pour éviter la surcharge
    const BATCH_SIZE = 5;
    let mainJobId: string;

    /* for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      //const results = await this.bullMQService.addBulkToQueue('encoding', batch);
      
      if (i === 0) {
        mainJobId = results[0].id;
      }

      // Pause stratégique entre les lots
      if (i + BATCH_SIZE < jobs.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    this.logger.log(`${jobs.length} jobs créés avec succès, mainJobId: ${mainJobId}`);
    return mainJobId; */
    return 'mock-job-id'; // REMOVE THIS LINE WHEN UNCOMMENTING ABOVE
  }

  /**
   * Calcule la priorité basée sur la durée (plus court = plus prioritaire)
   */
  private calculatePriorityByDuration(duration: number): number {
    if (duration <= 60) return 1;       // ≤1 minute : haute priorité
    if (duration <= 300) return 2;      // ≤5 minutes : priorité moyenne
    if (duration <= 1800) return 3;     // ≤30 minutes : priorité normale
    return 4;                           // >30 minutes : basse priorité
  }

  /**
   * Calcule la priorité du job
   */
  private calculateJobPriority(basePriority: number, segmentIndex: number, totalSegments: number): number {
    // Les premiers segments ont plus de priorité (pour preview)
    const segmentMultiplier = segmentIndex === 0 ? 1 : 2;
    return basePriority * segmentMultiplier;
  }

  /**
   * Catégorise la durée pour métriques
   */
  private getDurationCategory(duration: number): string {
    if (duration <= 60) return 'very-short';
    if (duration <= 300) return 'short';
    if (duration <= 1800) return 'medium';
    if (duration <= 3600) return 'long';
    return 'very-long';
  }

  /**
   * Détermine les résolutions d'encodage selon la durée
   */
  private getResolutionsForDuration(duration: number): string[] {
    if (duration <= 60) {
      return ['1080p', '720p']; // Court : pas besoin de 480p
    }
    return ['1080p', '720p', '480p']; // Long : toutes résolutions
  }

  /**
   * Crée un répertoire pour les segments
   */
  private async createSegmentsDirectory(inputPath: string): Promise<string> {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const timestamp = Date.now();

  // Nouveau dossier visible dans le projet
  const segmentsDir = path.join(__dirname, 'videos', 'segments', `${baseName}_${timestamp}`);
  await fs.mkdir(segmentsDir, { recursive: true });

  this.logger.log(`Répertoire des segments créé : ${segmentsDir}`);
  return segmentsDir;
}

  /**
   * Nettoyage en cas d'erreur
   */
  private async cleanupOnError(localPath?: string, segmentsDir?: string): Promise<void> {
    try {
      if (localPath) {
        await fs.unlink(localPath).catch((err) => {
          this.logger.warn(`Erreur lors de la suppression du fichier local ${localPath}:`, err);
        });
      }
      if (segmentsDir) {
        const files = await fs.readdir(segmentsDir).catch(() => []);
        await Promise.all(files.map(file => 
          fs.unlink(path.join(segmentsDir, file)).catch((err) => {
            this.logger.warn(`Erreur lors de la suppression du segment ${file}:`, err);
          })
        ));
        await fs.rmdir(segmentsDir).catch((err) => {
          this.logger.warn(`Erreur lors de la suppression du répertoire des segments ${segmentsDir}:`, err);
        });
      }
    } catch (error) {
      this.logger.warn('Erreur lors du nettoyage:', error);
    }
  }

  // Méthodes utilitaires (à implémenter selon votre infrastructure)
  private async downloadFromS3(s3Key: string): Promise<string> {
  // Simulation locale : on suppose que s3Key est un chemin relatif dans ./videos
    const sourcePath = path.resolve('videos', s3Key);
    const destPath = path.join('/tmp', path.basename(s3Key));

    try {
      await fs.copyFile(sourcePath, destPath);
      this.logger.log(`Fichier copié localement: ${destPath}`);
      return destPath;
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Error(`Impossible de copier ${s3Key} en local: ${errorMessage}`);
    }
  }




private async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,codec_name',
      '-show_entries', 'format=duration',
      '-of', 'json',
      filePath
    ];

    const ffprobe = spawn('ffprobe', args);

    let output = '';
    let errorOutput = '';

    ffprobe.stdout.on('data', (data) => output += data.toString());
    ffprobe.stderr.on('data', (data) => errorOutput += data.toString());

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe error: ${errorOutput}`));
      }

      try {
        const result = JSON.parse(output);
        const duration = parseFloat(result.format.duration);
        const width = result.streams[0]?.width;
        const height = result.streams[0]?.height;
        const codec = result.streams[0]?.codec_name;

        resolve({
          duration: Math.floor(duration),
          resolution: `${width}x${height}`,
          hasAudio: !!result.streams.find((s: any) => s.codec_type === 'audio'),
          codec
        });
      } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : String(err);
        reject(new Error(`Erreur parsing ffprobe: ${errorMessage}`));
      }
    });
  });
}


  private async runFFmpeg(args: string[], context: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', args);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      this.logger.log(`FFmpeg [${context}] terminé avec code ${code}`);
      resolve({ code: code ?? 1, stderr });
    });
  });
}


  private async cleanupLocalFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn(`Impossible de supprimer ${filePath}:`, error);
    }
  }
}