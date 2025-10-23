import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FfmpegService } from './ffmpeg.service';
import { FileLogger } from '../utils/logger';
import {
  PartProcessPayload,
  Profile,
  PartEncodedInfo,
} from '@safliix-back/video-process-type';
import { PermanentProcessingError } from '../utils/errors';

@Injectable()
export class VideoEncodingService {
  private readonly logger = new FileLogger(VideoEncodingService.name);

  constructor(private readonly ffmpegService: FfmpegService) {}

  /**
   * 🚀 Traite un job d'encodage d'une partie vidéo en utilisant le seeking temporel.
   * Les segments sont écrits directement dans le répertoire d'assemblage partagé (assemblyDir).
   */
  async processPartEncodingJob(data: PartProcessPayload): Promise<PartEncodedInfo> {
    // 💡 assemblyDir est le répertoire de sortie HLS centralisé
    const { part, resolutions, hlsOutputDir } = data; 
    // 💡 Récupération des coordonnées de découpage : startTime et duration
    const { path: inputFile, index: partIndex, startTime, duration } = part;
    
    // Identifiant unique pour cette partie, utilisé pour nommer les fichiers temporaires
    const formattedPartId = `part_${partIndex.toString().padStart(3, '0')}`;

    this.logger.log(`🎬 Début encodage partie #${partIndex} (Input: ${path.basename(inputFile)}, Start: ${startTime}s, Dur: ${duration}s)`);
    const start = Date.now();

    // Le répertoire de sortie HLS est le répertoire d'assemblage partagé
    //const hlsOutputDir = assemblyDir; 

    try {
      // Étape 1 : Vérification et analyse du fichier d'entrée (inchangée)
      await this.verifyInputFile(inputFile);

      const videoInfo = await this.ffmpegService.analyzeVideo(inputFile);

      // Étape 2 : Préparation des profils d'encodage (inchangée)
      const encodingProfiles = this.ffmpegService.getEncodingProfiles();
      const profiles: Profile[] = resolutions
        .map((res) => {
          const base = (encodingProfiles as any)[res];
          if (!base) {
            this.logger.warn(`Profil "${res}" non trouvé — ignoré`);
            return null;
          }
          return {
            resolution: res,
            width: base.width,
            height: base.height,
            bitrate: base.bitrate,
            preset: base.preset,
            crf: base.crf,
          } as Profile;
        })
        .filter((p): p is Profile => p !== null);

      if (profiles.length === 0) {
        throw new InternalServerErrorException('Aucun profil d’encodage disponible');
      }

      const hasAudio = videoInfo.hasAudio ?? true;
      const framerate =
        typeof videoInfo.framerate === 'number' && !Number.isNaN(videoInfo.framerate)
          ? videoInfo.framerate
          : 25;

      // Étape 3 : Encodage HLS adaptatif avec seeking (-ss et -t)
      const hlsResult = await this.ffmpegService.runAdaptiveHLSEncoding(
        inputFile,
        hlsOutputDir, // Répertoire de sortie centralisé
        partIndex,
        framerate,
        profiles,
        4, // segmentDuration
        hasAudio,
        startTime, // 💡 Passé à FfmpegService pour le -ss
        duration   // 💡 Passé à FfmpegService pour le -t
      );

      this.logger.log(
        `✅ Encodage HLS terminé (partie ${partIndex}) — ${hlsResult.segmentCount} segments, ${hlsResult.resolutions.length} résolutions`
      );

      // Étape 4 : Finalisation et validation
      
      // Nous vérifions la playlist temporaire générée par ce worker pour cette partie.
      const primaryResolution = profiles[0].height + 'p'; 
      const playlistPath = path.join(hlsOutputDir, primaryResolution, `${formattedPartId}_playlist.m3u8`);
      
      const exists = await fs
        .access(playlistPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        throw new PermanentProcessingError(`Playlist temporaire non trouvée: ${playlistPath}. FFmpeg a-t-il échoué ?`);
      }

      const totalSize = await this.getDirectorySize(hlsOutputDir);

      const totalTime = Date.now() - start;
      this.logger.log(`🎉 Partie ${partIndex} encodée avec succès (${totalTime}ms)`);
      
      const encodedInfo: PartEncodedInfo = {
        partIndex,
        hlsOutputDir, // Le chemin du répertoire d'assemblage
        playlistPath, // Chemin de la playlist temporaire (pour référence par l'assembleur)
        totalSize, // Taille totale mise à jour du dossier d'assemblage
        totalEncodingTime: totalTime,
        profiles,
      };
      return encodedInfo;
    } catch (error) {
      this.logger.error(`💥 Échec encodage partie ${partIndex}: ${error}`);
      //await this.cleanupOnError(inputFile); // Nettoyage ajusté
      throw error;
    }
  }

  // ===================================================================
  // 🧰 MÉTHODES UTILITAIRES REFONDUES
  // ===================================================================

  /**
   
  /**
   * 📏 Calcule la taille totale d’un dossier (méthode inchangée).
   */
  private async getDirectorySize(dir: string): Promise<number> {
    let total = 0;
    // La logique récursive précédente est plus précise, mais si celle-ci fonctionne
    // dans votre environnement, on la garde pour l'instant :
    const files = await fs.readdir(dir); 
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        // NOTE: Une vraie implémentation doit être récursive pour l'assemblage HLS
        total += await this.getDirectorySize(filePath); 
      } else {
        total += stats.size;
      }
    }
    return total;
  }

  /**
   * 🧹 Nettoyage en cas d’erreur (simplifié).
   * Nous ne supprimons PAS le répertoire d'assemblage partagé (hlsOutputDir/assemblyDir) ici.
   */
  private async cleanupOnError(inputFile: string): Promise<void> {
    this.logger.warn(`⚠️ Nettoyage pour échec de partie ${path.basename(inputFile)}. Les segments temporaires ne sont pas supprimés pour éviter les conflits avec d'autres workers.`);
  }

  /**
   * 🔍 Vérifie que le fichier vidéo est valide (inchangée).
   */
  private async verifyInputFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size === 0) throw new PermanentProcessingError('Fichier vide');
      const ext = path.extname(filePath).toLowerCase();
      const allowed = ['.mp4', '.mov', '.mkv', '.webm'];
      if (!allowed.includes(ext)) throw new PermanentProcessingError(`Extension non supportée: ${ext}`);
    } catch(e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new PermanentProcessingError(`Input file not found at expected path: ${filePath}`);
      }
      throw e;
    }
  }
}