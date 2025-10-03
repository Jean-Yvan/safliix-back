// services/video-encoding.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FfmpegService } from './ffmpeg.service';
import { 
  EncodingJobData, 
  EncodingResult, 
  WorkerProgress,
  EncodingStats 
} from '../interfaces/video-process.interface';
import { FileLogger } from '../utils/logger';

@Injectable()
export class VideoEncodingService {
  private readonly logger = new FileLogger(VideoEncodingService.name);
  private readonly MAX_CONCURRENT_ENCODINGS = 2;

  constructor(private readonly ffmpegService: FfmpegService) {}

  /**
   * Traite un job d'encodage d'une partie vidéo
   */
  async processPartEncodingJob(job: Job<EncodingJobData>): Promise<EncodingResult> {
    const { part, userId, originalFile, hlsOutputDir, resolutions } = job.data;
    const { path: file, index: partIndex, duration } = part;
    const startTime = Date.now();

    this.logger.log(`🚀 Début encodage partie ${partIndex} pour ${userId}: ${path.basename(file)}`);

    try {
      // Étape 1: Vérification et analyse du fichier source
      await job.updateProgress({
        stage: 'analyzing',
        progress: 0,
        partIndex
      } as WorkerProgress);

      await this.verifyInputFile(file);
      const videoInfo = await this.ffmpegService.analyzeVideo(file);
      
      // Étape 2: Encodage HLS adaptatif multi-résolutions
      await job.updateProgress({
        stage: 'encoding',
        progress: 20,
        currentResolution: 'HLS adaptatif',
        partIndex
      } as WorkerProgress);

      this.logger.debug(`🎬 Génération HLS adaptatif pour partie ${partIndex}`);

      // Utiliser createAdaptiveHLS pour générer le flux complet
      const hlsResult = await this.ffmpegService.createAdaptiveHLS(
        file,
        hlsOutputDir,
        resolutions,
        4 // segments de 4 secondes
      );

      this.logger.log(`✅ HLS adaptatif généré pour partie ${partIndex}: ${hlsResult.segmentCount} segments, ${hlsResult.resolutions.length} résolutions`);

      // Étape 3: Upload vers le storage
      await job.updateProgress({
        stage: 'uploading',
        progress: 80,
        partIndex
      } as WorkerProgress);

      const uploadResults = await this.uploadHLSFiles(hlsResult, originalFile, partIndex);

      // Étape 4: Nettoyage des fichiers temporaires
      await job.updateProgress({
        stage: 'cleaning',
        progress: 95,
        partIndex
      } as WorkerProgress);

      await this.cleanupTempFiles([file]);

      const totalTime = Date.now() - startTime;

      const result: EncodingResult = {
        partIndex,
        inputFile: file,
        outputFiles: uploadResults,
        hlsResult,
        encodedAt: new Date().toISOString(),
        totalEncodingTime: totalTime,
        success: true
      };

      this.logger.log(
        `🎉 Partie ${partIndex} encodée avec succès en ${totalTime}ms ` +
        `(${hlsResult.resolutions.length} résolutions, ${this.formatFileSize(hlsResult.totalSize || 0)})`
      );

      return result;

    } catch (error) {
      this.logger.error(`💥 Échec encodage partie ${partIndex}:`, error);
      
      // Nettoyage en cas d'erreur
      await this.cleanupOnError(file, hlsOutputDir);
      throw error;
    }
  }

  /**
   * Encode un fichier vidéo complet (sans découpage) en HLS adaptatif
   */
  async encodeFullVideoToHLS(
    inputPath: string,
    outputDir: string,
    userId: string,
    originalFileName: string
  ): Promise<EncodingResult> {
    const startTime = Date.now();

    this.logger.log(`🚀 Début encodage HLS vidéo complète: ${path.basename(inputPath)}`);

    try {
      await this.verifyInputFile(inputPath);
      const videoInfo = await this.ffmpegService.analyzeVideo(inputPath);

      // Déterminer les résolutions appropriées
      const resolutions = this.getResolutionsForVideo(videoInfo);
      
      this.logger.log(`📊 Résolutions sélectionnées: ${resolutions.join(', ')}`);

      // Générer le HLS adaptatif complet
      const hlsResult = await this.ffmpegService.createAdaptiveHLS(
        inputPath,
        outputDir,
        resolutions,
        4 // segments de 4 secondes
      );

      // Upload des fichiers générés
      const uploadResults = await this.uploadHLSFiles(hlsResult, originalFileName, 0);
      
      await this.cleanupTempFiles([inputPath]);

      const totalTime = Date.now() - startTime;

      const result: EncodingResult = {
        partIndex: 0,
        inputFile: inputPath,
        outputFiles: uploadResults,
        hlsResult,
        encodedAt: new Date().toISOString(),
        totalEncodingTime: totalTime,
        success: true
      };

      this.logger.log(
        `🎉 Vidéo complète encodée en HLS avec succès en ${totalTime}ms ` +
        `(${resolutions.length} résolutions, ${hlsResult.segmentCount} segments)`
      );

      return result;

    } catch (error) {
      this.logger.error(`💥 Échec encodage HLS vidéo complète:`, error);
      await this.cleanupOnError(inputPath, outputDir);
      throw error;
    }
  }

  /**
   * Encode une vidéo en MP4 simple (pour téléchargement)
   */
  async encodeToMp4(
    inputPath: string,
    outputDir: string,
    resolution = '720p',
    userId: string
  ): Promise<{ outputPath: string; fileSize: number; encodingTime: number }> {
    const startTime = Date.now();

    this.logger.log(`🎬 Encodage MP4 ${resolution}: ${path.basename(inputPath)}`);

    try {
      await this.verifyInputFile(inputPath);

      const baseName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(outputDir, `${baseName}_${resolution}.mp4`);

      // Utiliser la méthode simple d'encodage
      const result = await this.ffmpegService.createSimpleHLS(
        inputPath,
        path.join(outputDir, 'hls_temp'),
        resolution,
        6
      );

      // Pour MP4 simple, on veut un fichier unique, pas du HLS
      // On utilise convertToMp4 à la place
      await this.ffmpegService.convertToMp4(inputPath, outputPath);

      const stats = await fs.stat(outputPath);
      const encodingTime = Date.now() - startTime;

      // Nettoyer le HLS temporaire
      await fs.rm(path.join(outputDir, 'hls_temp'), { recursive: true, force: true });

      this.logger.log(`✅ MP4 ${resolution} généré: ${this.formatFileSize(stats.size)} en ${encodingTime}ms`);

      return {
        outputPath,
        fileSize: stats.size,
        encodingTime
      };

    } catch (error) {
      this.logger.error(`💥 Échec encodage MP4 ${resolution}:`, error);
      throw error;
    }
  }

  /**
   * Génère des miniatures pour une vidéo
   */
  async generateThumbnails(
    inputPath: string,
    outputDir: string,
    timestamps: number[] = [10, 30, 60],
    userId: string
  ): Promise<{ thumbnails: string[]; generatedAt: string }> {
    this.logger.log(`🖼️  Génération de ${timestamps.length} miniatures pour: ${path.basename(inputPath)}`);

    try {
      await this.verifyInputFile(inputPath);

      const thumbnails: string[] = [];
      const baseName = path.basename(inputPath, path.extname(inputPath));

      for (const timestamp of timestamps) {
        const outputPath = path.join(outputDir, `${baseName}_thumb_${timestamp}s.jpg`);
        
        await this.ffmpegService.generateThumbnail(inputPath, outputPath, timestamp);
        
        // Vérification de la miniature
        const stats = await fs.stat(outputPath);
        if (stats.size === 0) {
          await fs.unlink(outputPath);
          throw new Error(`Miniature vide à ${timestamp}s`);
        }

        thumbnails.push(outputPath);
        this.logger.debug(`✅ Miniature générée: ${outputPath}`);
      }

      // Upload des miniatures
      const uploadedThumbnails = await this.uploadThumbnails(thumbnails, userId);

      this.logger.log(`🎉 ${thumbnails.length} miniatures générées avec succès`);

      return {
        thumbnails: uploadedThumbnails,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`💥 Échec génération miniatures:`, error);
      throw error;
    }
  }

  /**
   * Convertit un fichier vidéo en MP4 standard
   */
  async convertToStandardMp4(
    inputPath: string,
    outputPath: string,
    userId: string
  ): Promise<{ outputPath: string; fileSize: number; conversionTime: number }> {
    const startTime = Date.now();

    this.logger.log(`🔄 Conversion en MP4 standard: ${path.basename(inputPath)}`);

    try {
      await this.verifyInputFile(inputPath);
      await this.ffmpegService.convertToMp4(inputPath, outputPath);

      const stats = await fs.stat(outputPath);
      const conversionTime = Date.now() - startTime;

      this.logger.log(`✅ Conversion MP4 réussie: ${this.formatFileSize(stats.size)} en ${conversionTime}ms`);

      return {
        outputPath,
        fileSize: stats.size,
        conversionTime
      };

    } catch (error) {
      this.logger.error(`💥 Échec conversion MP4:`, error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques d'encodage pour un fichier
   */
  async getEncodingStats(inputPath: string): Promise<EncodingStats> {
    try {
      await this.verifyInputFile(inputPath);
      const videoInfo = await this.ffmpegService.analyzeVideo(inputPath);
      const stats = await fs.stat(inputPath);

      const supportedResolutions = this.getResolutionsForVideo(videoInfo);
      const estimatedSizes = this.estimateOutputSizes(videoInfo, supportedResolutions);

      return {
        originalFile: path.basename(inputPath),
        originalSize: stats.size,
        duration: videoInfo.duration,
        resolution: videoInfo.resolution || 'unknown',
        supportedResolutions,
        estimatedSizes,
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`💥 Erreur analyse statistiques:`, error);
      throw error;
    }
  }

  /**
   * Valide si un fichier peut être encodé
   */
  async validateVideoFile(filePath: string): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Vérification basique du fichier
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        issues.push('Fichier vide');
      }
      if (stats.size > 2 * 1024 * 1024 * 1024) { // 2GB max
        issues.push('Fichier trop volumineux (> 2GB)');
      }

      // Vérification avec FFprobe
      const videoInfo = await this.ffmpegService.analyzeVideo(filePath);
      
      if (videoInfo.duration > 4 * 60 * 60) { // 4 heures max
        issues.push('Durée trop longue (> 4 heures)');
      }

      // Vérification des codecs supportés
      const supportedVideoCodecs = ['h264', 'hevc', 'mpeg4', 'vp9'];
      if (videoInfo.codec && !supportedVideoCodecs.includes(videoInfo.codec.toLowerCase())) {
        issues.push(`Codec vidéo non supporté: ${videoInfo.codec}`);
      }

    } catch (error) {
      if (error instanceof Error) {
        issues.push(`Fichier vidéo invalide: ${error.message}`);
      } else {
        issues.push('Fichier vidéo invalide: Erreur inconnue');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Nettoie les fichiers temporaires anciens
   */
  async cleanupOldTempFiles(maxAgeHours = 24): Promise<{ deleted: number; errors: number }> {
    const tempDir = '/tmp/video-encoding';
    let deleted = 0;
    let errors = 0;

    try {
      const files = await fs.readdir(tempDir);
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        try {
          const stats = await fs.stat(filePath);
          if (stats.mtimeMs < cutoffTime) {
            await fs.unlink(filePath);
            deleted++;
            this.logger.debug(`🧹 Fichier temporaire supprimé: ${file}`);
          }
        } catch (error) {
          errors++;
          this.logger.warn(`❌ Erreur suppression ${file}:`, error);
        }
      }

      this.logger.log(`🧹 Nettoyage terminé: ${deleted} fichiers supprimés, ${errors} erreurs`);

    } catch (error) {
      this.logger.warn(`❌ Erreur lecture répertoire temporaire:`, error);
    }

    return { deleted, errors };
  }

  // ========== MÉTHODES PRIVÉES ==========

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

  /**
   * Upload les fichiers HLS vers le storage
   */
  private async uploadHLSFiles(
    hlsResult: any,
    originalFile: string,
    partIndex: number
  ): Promise<Array<{ resolution: string; outputPath: string; fileSize: number }>> {
    const results = [];
    
    try {
      // Pour HLS, on upload tout le dossier
      const finalPath = await this.simulateHLSUpload(
        hlsResult.outputDir, 
        originalFile, 
        partIndex
      );
      
      // On retourne les infos pour chaque résolution
      for (const resolution of hlsResult.resolutions) {
        results.push({
          resolution,
          outputPath: `${finalPath}/${resolution}`,
          fileSize: 0 // Difficile à calculer pour HLS
        });
      }
      
      this.logger.debug(`📤 Dossier HLS uploadé: ${finalPath}`);

    } catch (error) {
      this.logger.error(`💥 Erreur upload HLS:`, error);
      throw error;
    }
    
    return results;
  }

  /**
   * Upload les miniatures vers le storage
   */
  private async uploadThumbnails(thumbnails: string[], userId: string): Promise<string[]> {
    const uploadedPaths: string[] = [];
    
    for (const thumbnail of thumbnails) {
      try {
        const finalPath = await this.simulateFileUpload(thumbnail, `thumbnails_${userId}`, 0, 'thumbnail');
        uploadedPaths.push(finalPath);
        
        this.logger.debug(`📤 Miniature uploadée: ${finalPath}`);

      } catch (error) {
        this.logger.error(`💥 Erreur upload miniature:`, error);
        throw error;
      }
    }
    
    return uploadedPaths;
  }

  /**
   * Simule l'upload d'un dossier HLS complet
   */
  private async simulateHLSUpload(
    localDir: string, 
    originalFile: string, 
    partIndex: number
  ): Promise<string> {
    // Simulation - dans la réalité, tu utiliserais AWS S3, etc.
    const outputDir = path.join(process.cwd(), 'output', 'hls');
    const partSuffix = partIndex > 0 ? `_part${partIndex}` : '';
    const finalDir = path.join(outputDir, `${path.basename(originalFile, path.extname(originalFile))}${partSuffix}`);
    
    // Copier récursivement le dossier HLS
    await this.copyDirectory(localDir, finalDir);
    
    return finalDir;
  }

  /**
   * Simule l'upload d'un fichier
   */
  private async simulateFileUpload(
    localPath: string, 
    originalFile: string, 
    partIndex: number, 
    fileType: string
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'output', fileType);
    await fs.mkdir(outputDir, { recursive: true });
    
    const fileName = `${path.basename(originalFile, path.extname(originalFile))}_${fileType}${partIndex > 0 ? `_part${partIndex}` : ''}${path.extname(localPath)}`;
    const finalPath = path.join(outputDir, fileName);
    
    await fs.copyFile(localPath, finalPath);
    return finalPath;
  }

  /**
   * Copie récursivement un dossier
   */
  private async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });
    
    const files = await fs.readdir(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      const stats = await fs.stat(sourcePath);
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  /**
   * Vérifie que le fichier d'entrée existe et est valide
   */
  private async verifyInputFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        throw new BadRequestException('Fichier vide');
      }
      
      // Vérification basique du type de fichier
      const ext = path.extname(filePath).toLowerCase();
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'];
      if (!videoExtensions.includes(ext)) {
        throw new BadRequestException(`Type de fichier non supporté: ${ext}`);
      }

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Fichier non trouvé ou invalide: ${filePath}`);
    }
  }

  /**
   * Nettoie les fichiers temporaires
   */
  private async cleanupTempFiles(filePaths: string[]): Promise<void> {
    const deletePromises = filePaths.map(filePath =>
      fs.unlink(filePath).catch(error => {
        this.logger.warn(`⚠️  Impossible de supprimer ${filePath}:`, error);
      })
    );
    
    await Promise.all(deletePromises);
  }

  /**
   * Nettoie en cas d'erreur
   */
  private async cleanupOnError(inputFile: string, hlsOutputDir?: string): Promise<void> {
    try {
      if (inputFile) {
        await fs.unlink(inputFile);
      }
      
      if (hlsOutputDir) {
        await fs.rm(hlsOutputDir, { recursive: true, force: true }).catch(() => {
          this.logger.warn(`⚠️  Impossible de supprimer le dossier HLS: ${hlsOutputDir}`);
        });
      }
      
      this.logger.debug(`🧹 Fichiers temporaires nettoyés après erreur`);
    } catch (error) {
      this.logger.warn('⚠️  Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Estime les tailles de sortie pour différentes résolutions
   */
  private estimateOutputSizes(videoInfo: any, resolutions: string[]): { [resolution: string]: number } {
    const estimates: { [resolution: string]: number } = {};
    const originalSize = videoInfo.fileSize || 100 * 1024 * 1024; // Estimation par défaut
    
    const sizeFactors: { [key: string]: number } = {
      '1080p': 0.8,
      '720p': 0.5,
      '480p': 0.3,
      '360p': 0.2,
      '240p': 0.1
    };

    for (const resolution of resolutions) {
      estimates[resolution] = Math.floor(originalSize * (sizeFactors[resolution] || 0.3));
    }

    return estimates;
  }

  /**
   * Formate une taille de fichier en format lisible
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}