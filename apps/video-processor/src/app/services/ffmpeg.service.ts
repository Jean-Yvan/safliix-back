// services/ffmpeg.service.ts
import { Injectable } from '@nestjs/common';
import { spawn,exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileLogger } from '../utils/logger';
import { promisify } from 'util';
import { 
  VideoAnalysisResult,
  HLSStreamResult,
  EncodingOptions,
  Profile  
} 
  from '@safliix-back/video-process-type';

@Injectable()
export class FfmpegService {
  private readonly logger = new FileLogger(FfmpegService.name);
  private readonly FFMPEG_TIMEOUT = 3000_000; // 5 min

  // Configurations d'encodage prédéfinies
  private readonly ENCODING_PROFILES: Record<string, Omit<EncodingOptions, 'resolution'>> = {
    '1080p': { width: 1920, height: 1080, bitrate: '4000k', preset: 'medium', crf: 23 },
    '720p': { width: 1280, height: 720, bitrate: '2500k', preset: 'medium', crf: 23 },
    '480p': { width: 854, height: 480, bitrate: '1200k', preset: 'fast', crf: 25 },
    '360p': { width: 640, height: 360, bitrate: '800k', preset: 'fast', crf: 27 },
    '240p': { width: 426, height: 240, bitrate: '400k', preset: 'fast', crf: 28 }
  };

  

  /**
   * Analyse une vidéo avec ffprobe
   */
  async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
  const startTime = Date.now();
  this.logger.debug('Analyzing video with ffprobe', { filePath });

  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'error',
      '-show_entries', 'stream=width,height,codec_name,codec_type,avg_frame_rate,r_frame_rate:format=duration',
      '-of', 'json',
      filePath,
    ];

    const ffprobe = spawn('ffprobe', args);
    let output = '';
    let errorOutput = '';

    ffprobe.stdout.on('data', (d) => (output += d.toString()));
    ffprobe.stderr.on('data', (d) => (errorOutput += d.toString()));

    ffprobe.on('close', (code) => {
      const analysisTime = Date.now() - startTime;

      if (code !== 0) {
        const err = new Error(`ffprobe error (exit code ${code}): ${errorOutput}`);
        this.logger.error('FFprobe analysis failed', err, {
          filePath,
          analysisTime,
          exitCode: code,
        });
        return reject(err);
      }

      try {
        const result = JSON.parse(output);
        const duration = parseFloat(result.format?.duration || '0');
        const videoStream = (result.streams || []).find((s: any) => s.codec_type === 'video');
        const audioStream = (result.streams || []).find((s: any) => s.codec_type === 'audio');

        // ✅ Framerate robuste
        const parseFramerate = (stream: any): number | null => {
          const rate = stream?.avg_frame_rate || stream?.r_frame_rate;
          if (!rate || rate === '0/0') return null;
          const [num, den] = rate.split('/').map(Number);
          return den && den > 0 ? num / den : null;
        };

        const videoInfo: VideoAnalysisResult = {
          duration: Math.floor(duration),
          resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : null,
          hasAudio: !!audioStream,
          codec: videoStream?.codec_name ?? null,
          width: videoStream?.width ?? null,
          height: videoStream?.height ?? null,
          framerate: parseFramerate(videoStream),
        };

        this.logger.debug('Video analysis completed', {
          filePath,
          analysisTime,
          ...videoInfo,
        });

        resolve(videoInfo);
      } catch (err) {
        this.logger.error('FFprobe parsing failed', err, {
          filePath,
          analysisTime,
          output,
        });
        reject(new Error(`Erreur parsing ffprobe: ${(err as Error).message}`));
      }
    });
  });
}



  /**
   * Extrait un segment d'une vidéo
   */
  async extractSegment(inputPath: string, outputPath: string, startTime: number, duration: number): Promise<void> {
    const segmentId = `segment-${startTime}`;
    this.logger.debug('Extracting video segment', {
      segmentId,
      inputPath,
      outputPath,
      startTime,
      duration
    });

    const args = [
      '-ss', startTime.toString(),
      '-i', inputPath,
      '-c', 'copy',
      '-map', '0',
      '-t', duration.toString(),
      '-avoid_negative_ts', 'make_zero',
      '-y',
      outputPath,
    ];

    try {
      await this.runFFmpeg(args, segmentId);
      const stats = await fs.stat(outputPath);

      if (stats.size === 0) {
        await fs.rm(outputPath, { force: true }).catch(() => null);
        const err = new Error(`Segment vide à ${startTime}s`);
        this.logger.error('Segment extraction produced empty file', err, {
          segmentId,
          inputPath,
          outputPath
        });
        throw err;
      }

      this.logger.debug('Segment extracted successfully', {
        segmentId,
        outputPath,
        fileSize: stats.size
      });

    } catch (error) {
      this.logger.error('Segment extraction failed', error, {
        segmentId,
        inputPath,
        outputPath
      });
      throw error;
    }
  }

  

  /**
   * Crée un HLS simple (une seule résolution)
   */
  async createSimpleHLS(
    inputPath: string,
    outputDir: string,
    resolution= '720p',
    segmentDuration= 6
  ): Promise<HLSStreamResult> {
    const startTime = Date.now();
    const hlsId = `hls-simple-${resolution}`;
    
    this.logger.debug('Creating simple HLS stream', {
      hlsId,
      inputPath,
      outputDir,
      resolution,
      segmentDuration
    });

    if (!this.isResolutionSupported(resolution)) {
      throw new Error(`Résolution non supportée: ${resolution}`);
    }

    await fs.mkdir(outputDir, { recursive: true });

    const profile = this.ENCODING_PROFILES[resolution];
    const args = this.buildSimpleHLSArgs(inputPath, outputDir, profile, segmentDuration);

    try {
      await this.runFFmpeg(args, hlsId);
      
      const playlistPath = path.join(outputDir, 'playlist.m3u8');
      await fs.stat(playlistPath);
      const segmentFiles = await this.countSegments(outputDir);
      const totalSize = await this.calculateTotalSize(outputDir);
      
      const totalTime = Date.now() - startTime;

      this.logger.debug('Simple HLS stream created successfully', {
        hlsId,
        outputDir,
        resolution,
        segmentCount: segmentFiles.length,
        totalSize,
        totalTime
      });

      return {
        masterPlaylistPath: playlistPath,
        outputDir,
        resolutions: [resolution],
        segmentCount: segmentFiles.length,
        totalTime,
        totalSize
      };

    } catch (error) {
      this.logger.error('Simple HLS creation failed', error, {
        hlsId,
        inputPath,
        outputDir
      });
      throw error;
    }
  }

  /**
   * Build args pour HLS adaptatif multi-résolutions - CORRIGÉ
   */
 

 execAsync = promisify(exec);


  // Assurez-vous d'avoir cet import si runAdaptiveHLSEncoding est dans FfmpegService
// ... autres imports ...

async runAdaptiveHLSEncoding(
  inputPath: string,
  outputDir: string,
  partId: number,
  framerate: number,
  profiles: (Omit<EncodingOptions, 'resolution'> & { resolution: string })[],
  segmentDuration: number,
  hasAudio: boolean,
  startTime: number,
  duration: number
): Promise<HLSStreamResult> {
  // 💡 Note: Le code ici suppose que buildAdaptiveHLSBashScript génère le master temporaire.

  // Calcul nécessaire pour le script Bash et la validation
  const formattedPartId = `part_${partId.toString().padStart(3, '0')}`;
  const scriptPath = path.join(outputDir, `${formattedPartId}_encode_hls.sh`);

  // 1️⃣ Génération du script Bash
  const script = this.buildAdaptiveHLSBashScript(
    inputPath,
    outputDir,
    partId,
    profiles,
    segmentDuration,
    hasAudio,
    framerate,
    startTime,
    duration
  );
  await fs.writeFile(scriptPath, script, { mode: 0o755 });

  const start = Date.now();

  try {
    // 2️⃣ Exécution du script via spawn (inchangée)
    await new Promise<void>((resolve, reject) => {
      const process = spawn(scriptPath, [], { shell: true });

      process.stdout.on('data', data => this.logger.log(`[FFmpeg stdout] ${data.toString()}`));
      process.stderr.on('data', data => this.logger.warn(`[FFmpeg stderr] ${data.toString()}`));

      process.on('close', code => {
        if (code === 0) {
          this.logger.log(`✅ FFmpeg script completed`);
          resolve();
        } else {
          reject(new Error(`FFmpeg script failed with exit code ${code}`));
        }
      });
    });
  } catch (error: any) {
    this.logger.error(`❌ FFmpeg command failed`, error);
    throw new Error(`FFmpeg failed: ${error.message}`);
  } finally {
    // 3️⃣ Suppression du script temporaire
    await fs.unlink(scriptPath).catch(() => {
      this.logger.warn('⚠️ Failed to delete temporary script');
    });
  }

  const totalTime = (Date.now() - start) / 1000;

  // ❌ SECTION 4 SUPPRIMÉE : Nous ne vérifions plus 'master.m3u8'
  // (La vérification de la playlist temporaire est faite dans VideoEncodingService)

  // 5️⃣ Comptage des segments et taille totale (Ajusté pour les noms de dossiers)
  
  // Les dossiers de résolution sont nommés d'après les profils (ex: 240p, 720p)
  const resolutionFolders = profiles.map(p => p.resolution);
  
  // Les segments sont nommés: part_00X_segment_00Y.ts
  const segmentPrefix = `${formattedPartId}_segment_`; 

  let segmentCount = 0;
  let totalSize = 0;

  for (const dirName of resolutionFolders) {
    const fullDir = path.join(outputDir, dirName);
    try {
      const files = await fs.readdir(fullDir);
      
      // Filtrer les fichiers .ts correspondant à cette partie
      const segments = files.filter(f => f.endsWith('.ts') && f.startsWith(segmentPrefix));
      segmentCount += segments.length;

      // Calculer la taille des segments trouvés
      const sizes = await Promise.all(
        segments.map(async seg => {
          const s = await fs.stat(path.join(fullDir, seg));
          return s.size;
        })
      );
      totalSize += sizes.reduce((a, b) => a + b, 0);

    } catch (e) {
      // Ignorer si un dossier de résolution n'a pas été créé (peu probable si l'encodage a réussi)
      this.logger.warn(`Dossier de résolution manquant pour le comptage: ${dirName}`);
    }
  }

  const resolutions = profiles.map(p => p.resolution);

  // 6️⃣ Résultat structuré
  return {
    // Le chemin Master Playlist final sera déterminé par le service d'assemblage
    masterPlaylistPath: path.join(outputDir, 'master.m3u8'), // Le chemin final attendu (non encore créé)
    outputDir,
    resolutions,
    segmentCount,
    totalTime,
    totalSize,
  };
}



  
  private buildAdaptiveHLSBashScript(
    inputPath: string,
    outputDir: string, // Chemin vers le dossier ASSEMBLED_PLAYLISTS/
    partId: number,    // Index de la partie (ex: 0, 1, 2...)
    profiles: Profile[],
    segmentDuration: number,
    hasAudio: boolean,
    framerate: number,
    startTime: number, // 💡 NOUVEAU: Pour -ss
    duration: number   // 💡 NOUVEAU: Pour -t
): string {
    const gopSize = segmentDuration * 2 * framerate;
    // Utiliser toFixed(2) pour startTime et duration si on veut une précision décimale pour FFmpeg
    const formattedStartTime = startTime.toFixed(3);
    const formattedDuration = duration.toFixed(3);

    const formattedPartId = `part_${partId.toString().padStart(3, '0')}`;
    const streamNames = profiles.map(profile => `${profile.height}p`);

    // Fonction utilitaire pour extraire la valeur numérique d'un bitrate
    const getNumericBitrate = (b: string): number => parseInt(b.replace(/k|K/, ''), 10);

    const varStreamMap = profiles
        .map((_, index) =>
            hasAudio
                ? `v:${index},a:${index},name:${streamNames[index]}`
                : `v:${index},name:${streamNames[index]}`
        )
        .join(' ');

    const videoMaps = profiles.map(() => `-map 0:v:0`).join(' ');
    const audioMaps = hasAudio ? profiles.map(() => `-map 0:a:0`).join(' ') : '';

    const encodingLines = profiles.map((profile, index) => {
        const { width, height, bitrate, audioBitrate } = profile;
        const finalAudioBitrate = audioBitrate || '128k';
        const numericBitrate = getNumericBitrate(bitrate);
        const maxrate = Math.floor(numericBitrate * 1.07);
        const bufsize = Math.floor(numericBitrate * 1.5);

        return `\\
-c:v:${index} libx264 -b:v:${index} ${bitrate} -maxrate:v:${index} ${maxrate}k -bufsize:v:${index} ${bufsize}k \\
-vf:v:${index} "scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease:flags=lanczos" \\
-profile:v:${index} high -level:v:${index} 4.0 \\
-x264-params:v:${index} "nal-hrd=cbr" \\
${
    hasAudio
        ? `-c:a:${index} aac -b:a:${index} ${finalAudioBitrate} -ac:${index} 2 -ar:${index} 48000 -strict:a:${index} -2`
        : ''
}`;
    }).join(' ');

    const safeOutputDir = path.resolve(outputDir);

    return `#!/bin/bash
set -e

# Création des sous-dossiers par résolution
mkdir -p "${safeOutputDir}"
${profiles.map(profile => `mkdir -p "${safeOutputDir}/${profile.height}p"`).join('\n')}

# 💡 ARGUMENTS DE SEEKING (-ss et -t) ajoutés avant l'input (-i) pour un seeking plus rapide.
ffmpeg -y -ss ${formattedStartTime} -t ${formattedDuration} -i "${inputPath}" -r ${framerate} -preset medium -tune film -g ${gopSize} -keyint_min ${gopSize} -sc_threshold 0 \\
  ${videoMaps} ${audioMaps} \\
  ${encodingLines} \\
  -f hls -hls_time ${segmentDuration} -hls_list_size 0 -hls_flags independent_segments+program_date_time+discont_start \\
  -hls_segment_filename "${safeOutputDir}/%v/${formattedPartId}_segment_%03d.ts" \\
  -var_stream_map "${varStreamMap}" \\
  -master_pl_name master_temp_${formattedPartId}.m3u8 \\
  "${safeOutputDir}/%v/${formattedPartId}_playlist.m3u8"
`;
}


  /**
   * Build args pour HLS simple (une résolution)
   */
  private buildSimpleHLSArgs(
    inputPath: string,
    outputDir: string,
    profile: Omit<EncodingOptions, 'resolution'>,
    segmentDuration: number
  ): string[] {
    const { width, height, bitrate, preset } = profile;

    return [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-vf', `scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease:flags=lanczos`,
      '-b:v', bitrate,
      '-maxrate', `${Math.floor(parseInt(bitrate) * 1.2)}k`,
      '-bufsize', `${parseInt(bitrate) * 2}k`,
      '-preset', preset,
      '-profile:v', 'high',
      '-level', '4.0',
      '-g', (segmentDuration * 12).toString(),
      '-keyint_min', (segmentDuration * 12).toString(),
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-ar', '48000',
      '-f', 'hls',
      '-hls_time', segmentDuration.toString(),
      '-hls_list_size', '0',
      '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'),
      '-hls_flags', 'independent_segments',
      '-y',
      path.join(outputDir, 'playlist.m3u8')
    ];
  }

  /**
   * Compte les segments générés
   */
  private async countSegments(outputDir: string): Promise<string[]> {
    try {
      const files = await fs.readdir(outputDir);
      return files.filter(file => file.endsWith('.ts'));
    } catch {
      return [];
    }
  }

  /**
   * Calcule la taille totale des segments
   */
  private async calculateTotalSize(outputDir: string): Promise<number> {
    try {
      const segmentFiles = await this.countSegments(outputDir);
      let totalSize = 0;
      
      for (const file of segmentFiles) {
        const filePath = path.join(outputDir, file);
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        } catch {
          // Ignorer les fichiers qui n'existent plus
        }
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  /**
   * Miniature
   */
  async generateThumbnail(inputPath: string, outputPath: string, timestamp = 10): Promise<void> {
    const thumbnailId = `thumbnail-${timestamp}`;
    this.logger.debug('Generating thumbnail', { thumbnailId, inputPath, outputPath });

    const args = ['-ss', timestamp.toString(), '-i', inputPath, '-vframes', '1', '-q:v', '2', '-y', outputPath];

    try {
      await this.runFFmpeg(args, thumbnailId);
      const stats = await fs.stat(outputPath);

      this.logger.debug('Thumbnail generated successfully', { thumbnailId, outputPath, fileSize: stats.size });

    } catch (error) {
      this.logger.error('Thumbnail generation failed', error, { thumbnailId, inputPath });
      throw error;
    }
  }

  /**
   * Conversion MP4
   */
  async convertToMp4(inputPath: string, outputPath: string): Promise<void> {
    const convertId = 'convert-mp4';
    this.logger.debug('Converting to MP4', { convertId, inputPath, outputPath });

    const args = [
      '-i', inputPath, 
      '-c:v', 'libx264', 
      '-c:a', 'aac', 
      '-movflags', '+faststart', 
      '-preset', 'medium', 
      '-crf', '23', 
      '-y', 
      outputPath
    ];

    try {
      await this.runFFmpeg(args, convertId);
      const stats = await fs.stat(outputPath);

      this.logger.debug('MP4 conversion completed', { convertId, outputPath, fileSize: stats.size });

    } catch (error) {
      this.logger.error('MP4 conversion failed', error, { convertId, inputPath });
      throw error;
    }
  }

  /**
   * Run ffmpeg
   */
  private async runFFmpeg(args: string[], context: string): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);
      let stdout = '';
      let stderr = '';

      const timeout = setTimeout(() => {
        ffmpeg.kill('SIGTERM');
        const err = new Error(`FFmpeg [${context}] timeout after ${this.FFMPEG_TIMEOUT}ms`);
        this.logger.error('⏰ FFmpeg timeout', err, { context, executionTime: Date.now() - startTime });
        reject(err);
      }, this.FFMPEG_TIMEOUT);

      const cleanup = (code: number, err?: Error) => {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;
        
        if (err) {
          this.logger.error('⚠️ FFmpeg process could not start', err, {
            context, 
            args: args.slice(0, 10), 
            executionTime
          });
          return reject(err);
        }
        
        if (code === 0) {
          this.logger.debug('✅ FFmpeg command completed successfully', {
            context,
            executionTime,
            args: args.slice(0, 10)
          });
          return resolve();
        }

        const finalErr = new Error(`FFmpeg [${context}] failed (exit code ${code})`);
        this.logger.error('❌ FFmpeg command failed', finalErr, {
          context,
          exitCode: code,
          args: args.slice(0, 10),
          stderr: stderr.slice(-500), 
          executionTime
        });

        reject(finalErr);
      };

      ffmpeg.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === null) {
          return cleanup(-1, new Error('FFmpeg process terminated abnormally'));
        }
        cleanup(code)
      });
      ffmpeg.on('error', (err) => cleanup(-1, err));
    });
  }

  getSupportedResolutions(): string[] {
    return Object.keys(this.ENCODING_PROFILES);
  }

  isResolutionSupported(resolution: string): boolean {
    return resolution in this.ENCODING_PROFILES;
  }

  /**
   * Récupère les profils d'encodage
   */
  getEncodingProfiles(): typeof this.ENCODING_PROFILES {
    return { ...this.ENCODING_PROFILES };
  }
}
