// services/video-splitter.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { BullMQService } from '@safliix-back/bullmq';
import { VideoProcessingOptions, VideoPart, Queue } from '../interfaces/video-process.interface';
import { FfmpegService } from './ffmpeg.service';
import { FileLogger } from '../utils/logger';

@Injectable()
export class VideoSplitterService {
  private readonly logger = new FileLogger(VideoSplitterService.name);

  private readonly DURATION_BASED_STRATEGY = [
    { min: 0, max: 30, partLength: 0, description: 'Très court - pas de découpage' },
    { min: 30, max: 300, partLength: 30, description: 'Court - parties 30s' },
    { min: 300, max: 900, partLength: 60, description: 'Moyen - parties 1min' },
    { min: 900, max: 1800, partLength: 120, description: 'Long - parties 2min' },
    { min: 1800, max: 3600, partLength: 180, description: 'Très long - parties 3min' },
    { min: 3600, max: 7200, partLength: 300, description: 'Extra long - parties 5min' },
    { min: 7200, max: Infinity, partLength: 600, description: 'Géant - parties 10min' }
  ];

  private readonly MAX_PARTS = 100;
  private readonly MIN_PART_LENGTH = 10;
  private readonly MAX_PART_DURATION = 900;

  constructor(
    private readonly bullMQService: BullMQService,
    private readonly ffmpegService: FfmpegService
  ) {}

  async processVideo(options: VideoProcessingOptions): Promise<{ 
    jobIds: string[]; 
    parts: number; 
    strategy: string; 
    totalDuration: number 
  }> {
    const { s3Key, userId, customPriority } = options;
    if (!s3Key?.trim()) throw new BadRequestException('Le paramètre "file" est requis.');

    let localPath: string | undefined;
    let partsDir: string | undefined;

    try {
      localPath = await this.downloadFromS3(s3Key);
      const stats = await fs.stat(localPath);
      if (stats.size === 0) throw new BadRequestException('Fichier vidéo vide.');
      
      this.logger.log(`Fichier téléchargé localement: ${localPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
      
      const videoInfo = await this.ffmpegService.analyzeVideo(localPath);
      if (videoInfo.duration <= 0) throw new BadRequestException('Durée de la vidéo invalide.');
      
      this.logger.log(`Vidéo analysée: durée=${videoInfo.duration}s, résolution=${videoInfo.resolution}, codec=${videoInfo.codec}, audio=${videoInfo.hasAudio}`);

      const strategy = this.determinePartitioningStrategy(videoInfo.duration);
      const resolutions = this.getResolutionsForVideo(videoInfo);
      
      this.logger.log(`Stratégie de partitionnement: ${strategy.description} (${strategy.estimatedParts} parties estimées)`);
      
      partsDir = await this.createPartsDirectory(localPath);
      this.logger.log(`Répertoire des parties créé: ${partsDir}`);
      
      let parts: VideoPart[] = [];
      
      if (strategy.shouldSplit) {
        parts = await this.splitVideoIntoParts(localPath, partsDir, strategy.partLength, videoInfo.duration);
        this.logger.log(`${parts.length} parties créées.`);
      } else {
        // Vidéo courte - pas de découpage, on crée directement le HLS
        const hlsOutputDir = path.join(partsDir, 'part0_hls');
        await fs.mkdir(hlsOutputDir, { recursive: true });
        
        const hlsResult = await this.ffmpegService.createAdaptiveHLS(
          localPath, 
          hlsOutputDir, 
          resolutions,
          4 // segments de 4 secondes
        );

        parts.push({ 
          path: localPath, 
          index: 0, 
          startTime: 0, 
          duration: videoInfo.duration, 
          hlsOutputDir,
          playlistPath: hlsResult.masterPlaylistPath,
          totalParts: 1 
        });
      }

      const priority = customPriority || this.calculatePriorityByDuration(videoInfo.duration);
      this.logger.log(`Priorité des jobs définie à ${priority}`);

      // Préparer les jobs pour chaque partie
      this.logger.log(`Ajout des jobs à la file d'attente...`);
      const bulkJobs = parts.map(part => ({
        name: 'processVideoPart' as const,
        data: { 
          part, 
          file: part.path, 
          hlsOutputDir: part.hlsOutputDir, 
          userId, 
          partIndex: part.index, 
          originalFile: s3Key, 
          priority, 
          resolutions 
        },
        opts: { priority, attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      }));

      const jobInstances = await this.bullMQService.addBulkToQueue(Queue.VIDEO_ENCODING, bulkJobs);
      const jobIds = jobInstances.map(job => job.id).filter((id): id is string => typeof id === 'string');

      return { 
        jobIds, 
        parts: parts.length, 
        strategy: strategy.description, 
        totalDuration: videoInfo.duration 
      };

    } catch (error) {
      await this.cleanupOnError(localPath, partsDir);
      throw new InternalServerErrorException(`Échec du traitement: ${(error as Error).message}`);
    } finally {
      if (localPath) await this.cleanupLocalFile(localPath);
    }
  }

  private determinePartitioningStrategy(duration: number) {
    const strategy = this.DURATION_BASED_STRATEGY.find(s => duration >= s.min && duration <= s.max)
      || this.DURATION_BASED_STRATEGY[this.DURATION_BASED_STRATEGY.length - 1];

    let partLength = strategy.partLength;
    let estimatedParts = partLength > 0 ? Math.ceil(duration / partLength) : 1;

    if (estimatedParts > this.MAX_PARTS) {
      partLength = Math.ceil(duration / this.MAX_PARTS);
      estimatedParts = Math.ceil(duration / partLength);
      this.logger.warn(`Ajustement automatique: partLength=${partLength}s`);
    }

    partLength = Math.min(partLength, this.MAX_PART_DURATION);
    partLength = Math.max(partLength, this.MIN_PART_LENGTH);

    return { 
      shouldSplit: partLength > 0, 
      partLength, 
      description: strategy.description, 
      estimatedParts 
    };
  }

  private async splitVideoIntoParts(
    inputPath: string, 
    outputDir: string, 
    partLength: number, 
    totalDuration: number
  ): Promise<VideoPart[]> {
    const totalParts = Math.ceil(totalDuration / partLength);
    this.logger.log(`Découpage en ${totalParts} parties de ${partLength}s (durée totale: ${totalDuration}s)`);
    
    const parts: VideoPart[] = [];

    for (let i = 0; i < totalParts; i++) {
      const startTime = i * partLength;
      const duration = Math.min(partLength, totalDuration - startTime);
      if (duration <= 0.5) break;

      const partPath = path.join(outputDir, `part_${i.toString().padStart(4, '0')}.mp4`);
      await this.ffmpegService.extractSegment(inputPath, partPath, startTime, duration);

      // Créer un sous-dossier HLS pour cette partie
      const hlsOutputDir = path.join(outputDir, `part${i}_hls`);
      await fs.mkdir(hlsOutputDir, { recursive: true });

      parts.push({ 
        path: partPath, 
        index: i, 
        startTime, 
        duration, 
        hlsOutputDir,
        totalParts 
      });
    }

    return parts;
  }

  private async createPartsDirectory(inputPath: string) {
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const partsDir = path.join(__dirname, 'videos', 'parts', `${baseName}_${Date.now()}`);
    await fs.mkdir(partsDir, { recursive: true });
    return partsDir;
  }

  private async cleanupOnError(localPath?: string, partsDir?: string) {
    if (localPath) await fs.unlink(localPath).catch(() => { /* ignore error */ });
    if (partsDir) {
      await fs.rm(partsDir, { recursive: true, force: true }).catch(() => {
        this.logger.warn(`Impossible de supprimer le répertoire: ${partsDir}`);
      });
    }
  }

  private async cleanupLocalFile(filePath: string) {
    await fs.unlink(filePath).catch(() => {
      this.logger.warn(`Impossible de supprimer le fichier: ${filePath}`);
    });
  }

  private calculatePriorityByDuration(duration: number) {
    if (duration <= 60) return 1;
    if (duration <= 300) return 2;
    if (duration <= 1800) return 3;
    return 4;
  }

  private async downloadFromS3(s3Key: string) {
    const sourcePath = path.resolve('videos', s3Key);
    const destPath = path.join('/tmp', path.basename(s3Key));
    await fs.copyFile(sourcePath, destPath);
    return destPath;
  }

  /**
   * Détermine les résolutions appropriées selon la résolution source
   */
  private getResolutionsForVideo(videoInfo: any): string[] {
    const allResolutions = this.ffmpegService.getSupportedResolutions();
    const sourceHeight = videoInfo.height;

    if (!sourceHeight) {
      this.logger.warn('Hauteur source non détectée, utilisation de toutes les résolutions');
      return allResolutions;
    }

    // Filtrer les résolutions supérieures à la source
    return allResolutions.filter(resolution => {
      const resHeight = parseInt(resolution.replace('p', ''));
      return resHeight <= sourceHeight;
    });
  }
}