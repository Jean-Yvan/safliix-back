import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FileLogger } from '../utils/logger';
import { PlaylistResult, Profile } from '@safliix-back/video-process-type';
import { PermanentProcessingError } from '../utils/errors';

@Injectable()
export class PlaylistAssemblerService {
  private readonly logger = new FileLogger(PlaylistAssemblerService.name);

  async assemblePlaylists(
    assemblyDir: string,
    totalParts: number,
    profiles: Profile[],
    s3Key: string,
    dryRun = false
  ): Promise<PlaylistResult> {
    this.logger.log(`Assemblage des playlists ${dryRun ? '(dry-run)' : ''} dans : ${assemblyDir}`);

    await this.validateAssemblyDirectory(assemblyDir);
    const resolutions = profiles.map(p => p.height + 'p');
    const finalMasterPlaylistPath = path.join(assemblyDir, 'master.m3u8');

    await this.assembleResolutionPlaylists(assemblyDir, totalParts, resolutions, dryRun);
    await this.createMasterPlaylist(assemblyDir, profiles, finalMasterPlaylistPath, dryRun);

    if (!dryRun) {
      await this.cleanupTempFiles(assemblyDir, totalParts);
    }

    this.logger.log(`✅ Assemblage terminé ${dryRun ? '(simulation)' : ''}. Master Playlist: ${finalMasterPlaylistPath}`);
    return {
      s3Key: s3Key,
      masterPlaylistPath: finalMasterPlaylistPath,
      outputDir: assemblyDir,
    };
  }

  private async validateAssemblyDirectory(assemblyDir: string): Promise<void> {
    try {
      await fs.access(assemblyDir);
      const stats = await fs.stat(assemblyDir);
      if (!stats.isDirectory()) {
        throw new PermanentProcessingError(`Assembly target ${assemblyDir} exists but is not a directory.`);
      }
    } catch (e) {
      // Si l'erreur n'est pas déjà un PermanentProcessingError (par exemple, ENOENT), on le convertit.
      if ((e as Error).name !== 'PermanentProcessingError') {
         this.logger.error(`Validation d'assemblage échouée pour ${assemblyDir}`, e);
         throw new PermanentProcessingError(`Répertoire d'assemblage inaccessible: ${assemblyDir}`);
      }
      throw e; // Relancer PermanentProcessingError existante
    }
  }

  private async assembleResolutionPlaylists(
    assemblyDir: string,
    totalParts: number,
    resolutions: string[],
    dryRun: boolean
  ): Promise<void> {
    for (const res of resolutions) {
      const resDir = path.join(assemblyDir, res);
      const finalPlaylistPath = path.join(resDir, `index.m3u8`);

      try {
        await fs.access(resDir);
      } catch (e) {
        // Si le répertoire de résolution n'existe pas, cela signifie qu'aucune partie n'a été encodée pour cette résolution.
        // C'est critique pour l'assemblage HLS.
        this.logger.error(`Répertoire de résolution absent: ${resDir}. Encodage incomplet ou échec de l'encodage.`, e);
        throw new PermanentProcessingError(`Échec d'assemblage: Répertoire de résolution manquant pour ${res}. Pipeline incomplet.`);
      }

      let finalContent = `#EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:${this.calculateTargetDuration(4)}
        #EXT-X-MEDIA-SEQUENCE:0
        #EXT-X-PLAYLIST-TYPE:VOD\n`;

      for (let i = 0; i < totalParts; i++) {
        const formattedPartId = `part_${i.toString().padStart(3, '0')}`;
        const tempPlaylistPath = path.join(resDir, `${formattedPartId}_playlist.m3u8`);

        try {
          const partContent = await fs.readFile(tempPlaylistPath, 'utf-8');
          const cleanedContent = this.cleanPartPlaylist(partContent);

          if (i > 0) {
            finalContent += `#EXT-X-DISCONTINUITY\n`;
          }

          finalContent += cleanedContent;

          if (!dryRun) {
            // Suppression de la playlist de partie après son ajout au contenu final
            await fs.unlink(tempPlaylistPath); 
          } else {
            this.logger.debug(`[Dry-run] Suppression simulée de ${tempPlaylistPath}`);
          }
        } catch (error) {
          // 🚨 POINT CRITIQUE : Si une playlist de partie est manquante, l'assemblage est impossible.
          this.logger.error(`Playlist de partie manquante: ${tempPlaylistPath}`, error);
          throw new PermanentProcessingError(`Échec de l'assemblage: Playlist de partie ${i} pour ${res} est manquante. Encodage incomplet.`);
        }
      }

      finalContent += `#EXT-X-ENDLIST\n`;

      if (!dryRun) {
        // Écriture du fichier final de résolution
        const tempPath = `${finalPlaylistPath}.tmp`;
        // Les erreurs d'écriture de fichier seront des erreurs I/O, gérées par le catch externe (BullMQ retry)
        await fs.writeFile(tempPath, finalContent); 
        await fs.rename(tempPath, finalPlaylistPath);
      } else {
        this.logger.debug(`[Dry-run] Écriture simulée de ${finalPlaylistPath}`);
      }

      this.logger.log(`Playlist de résolution créée: ${res}.m3u8`);
    }
  }

  private cleanPartPlaylist(content: string): string {
    return content
      .split('\n')
      .filter(line =>
        !(
          line.startsWith('#EXTM3U') ||
          line.startsWith('#EXT-X-VERSION') ||
          line.startsWith('#EXT-X-ENDLIST') ||
          line.startsWith('#EXT-X-TARGETDURATION') ||
          line.startsWith('#EXT-X-MEDIA-SEQUENCE') ||
          line.startsWith('#EXT-X-PLAYLIST-TYPE') ||
          line.includes('#EXT-X-DISCONTINUITY')
        )
      )
      .join('\n');
  }

  private async createMasterPlaylist(
    assemblyDir: string,
    profiles: Profile[],
    finalMasterPlaylistPath: string,
    dryRun: boolean
  ): Promise<void> {
    let masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-INDEPENDENT-SEGMENTS\n`;

    for (const profile of profiles) {
      const res = profile.height + 'p';
      const relativePlaylistPath = `${res}/index.m3u8`;
      const playlistPath = path.join(assemblyDir, relativePlaylistPath);

      try {
        await fs.access(playlistPath);
      } catch {
        this.logger.warn(`Playlist manquante pour la résolution: ${res}. Ignorée dans le Master.`);
        continue;
      }

      const videoBitrate = this.parseBitrate(profile.bitrate, 1000);
      const audioBitrate = this.parseBitrate(profile.audioBitrate || '128k', 128);
      const totalBandwidth = (videoBitrate + audioBitrate) * 1000;

      masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${totalBandwidth},RESOLUTION=${profile.width}x${profile.height},CODECS="avc1.4d001f,mp4a.40.2"\n`;
      masterContent += `${relativePlaylistPath}\n`;
    }

    if (!dryRun) {
      const tempPath = `${finalMasterPlaylistPath}.tmp`;
      await fs.writeFile(tempPath, masterContent);
      await fs.rename(tempPath, finalMasterPlaylistPath);
    } else {
      this.logger.debug(`[Dry-run] Écriture simulée de ${finalMasterPlaylistPath}`);
    }
  }

  private async cleanupTempFiles(assemblyDir: string, totalParts: number): Promise<void> {
    for (let i = 0; i < totalParts; i++) {
      const formattedPartId = `part_${i.toString().padStart(3, '0')}`;
      const tempMasterPath = path.join(assemblyDir, `master_temp_${formattedPartId}.m3u8`);
      await fs.unlink(tempMasterPath).catch((e) => {
        this.logger.warn(`Échec de la suppression du fichier temporaire: ${tempMasterPath}`, e);
      });
    }

    this.logger.log('Nettoyage des master playlists temporaires terminé');
  }

  private calculateTargetDuration(segmentDuration: number): number {
    return segmentDuration + 2;
  }

  private parseBitrate(value: string, fallback: number): number {
    const parsed = parseInt(value.replace(/k|K/, ''), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
}
