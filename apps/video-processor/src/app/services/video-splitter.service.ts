// services/video-splitter.service.ts
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VideoPart, SplittedPayload } from '@safliix-back/video-process-type';
import { FfmpegService } from './ffmpeg.service';
import { FileLogger } from '../utils/logger';
import { PermanentProcessingError } from '../utils/errors';

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
    private readonly ffmpegService: FfmpegService
  ) {}

  async processVideo(s3Key: string,filePath: string,userId?: string): Promise<SplittedPayload> {
    if (!filePath.trim()){
      this.logger.error('Contrat violé: Le paramètre "filePath" est requis et manquant.');
      throw new PermanentProcessingError('Chemin de fichier (filePath) manquant dans la charge utile. Arrêt.');
    }

  

  
    this.logger.log(`Analyse du fichier vidéo: ${filePath}`);
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new PermanentProcessingError('Fichier vidéo vide.');
    }

    this.logger.log(`Fichier reçu localement: ${filePath} (${(stats.size / (1024*1024)).toFixed(2)} MB)`);

    const videoInfo = await this.ffmpegService.analyzeVideo(filePath).catch(err => {
      this.logger.error('Erreur lors de l’analyse vidéo avec FFmpeg', err);
      throw new PermanentProcessingError('Analyse vidéo échouée.');
    });
    if (videoInfo.duration <= 0) throw new PermanentProcessingError('Durée de la vidéo invalide.');

    const strategy = this.determinePartitioningStrategy(videoInfo.duration);

    // 1. DÉTERMINER ET CRÉER LE DOSSIER D'ASSEMBLAGE HLS FINAL
    // Le dossier sera au même niveau que le fichier source temporaire.
    const videoBaseDir = path.dirname(filePath);
    const assemblyDir = path.join(videoBaseDir, 'assembled_playlists');
    await fs.mkdir(assemblyDir, { recursive: true });
    this.logger.log(`Répertoire d'assemblage HLS créé: ${assemblyDir}`);

    let parts: VideoPart[] = [];
    const resolutions = this.getResolutionsForVideo(videoInfo);
    if (strategy.shouldSplit) {
      // 2. CALCULER les coordonnées de découpage SANS création de fichiers intermédiaires.
      parts = this.calculateVideoParts(s3Key, filePath, strategy.partLength, videoInfo.duration);
      this.logger.log(`Découpage logique défini en ${parts.length} parties.`);
    } else {
      
      parts.push({
        s3Key, 
        path: filePath, 
        index: 0, 
        startTime: 0, 
        duration: videoInfo.duration, 
        totalParts: 1,
        
      });
    }

    return {
      s3Key,
      localPath: filePath,
      parts,
      userId,
      assemblyDir,
      resolutions
    };

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

  

  
  private calculateVideoParts(
    s3Key: string,
    inputPath: string, 
    partLength: number, 
    totalDuration: number
  ): VideoPart[] {
    const totalParts = Math.ceil(totalDuration / partLength);
    
    const parts: VideoPart[] = [];

    for (let i = 0; i < totalParts; i++) {
      const startTime = i * partLength;
      const duration = Math.min(partLength, totalDuration - startTime);
      if (duration <= 0.5) break;

      parts.push({
        s3Key, 
        path: inputPath, // 💡 Référence au fichier source complet
        index: i, 
        startTime, 
        duration, 
        totalParts 
      });
    }

    return parts;
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