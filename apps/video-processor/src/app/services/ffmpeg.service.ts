// services/ffmpeg.service.ts
import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileLogger } from '../utils/logger';

export interface VideoAnalysisResult {
  duration: number;
  resolution: string | null;
  hasAudio: boolean;
  codec: string | null;
  width: number | null;
  height: number | null;
}

export interface VideoSegment {
  path: string;
  index: number;
  startTime: number;
  duration: number;
  playlistPath?: string;
  totalSegments: number;
}

export interface EncodingOptions {
  resolution: string;
  width: number;
  height: number;
  bitrate: string;
  preset: string;
  crf: number;
}

export interface EncodingResult {
  outputPath: string;
  fileSize: number;
  encodingTime: number;
}

export interface HLSStreamResult {
  masterPlaylistPath: string;
  outputDir: string;
  resolutions: string[];
  segmentCount: number;
  totalTime: number;
  totalSize?: number;
}

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
        '-select_streams', 'v:0,a:0',
        '-show_entries', 'stream=width,height,codec_name,codec_type',
        '-show_entries', 'format=duration',
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
            exitCode: code
          });
          return reject(err);
        }

        try {
          const result = JSON.parse(output);
          const duration = parseFloat(result.format.duration || '0');
          const videoStream = (result.streams || []).find((s: any) => s.codec_type === 'video');
          const audioStream = (result.streams || []).find((s: any) => s.codec_type === 'audio');

          const videoInfo: VideoAnalysisResult = {
            duration: Math.floor(duration),
            resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : null,
            hasAudio: !!audioStream,
            codec: videoStream?.codec_name ?? null,
            width: videoStream?.width ?? null,
            height: videoStream?.height ?? null
          };

          this.logger.debug('Video analysis completed', {
            filePath,
            analysisTime,
            ...videoInfo
          });

          resolve(videoInfo);

        } catch (err) {
          this.logger.error('FFprobe parsing failed', err, {
            filePath,
            analysisTime,
            output
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
   * Crée un flux HLS adaptatif complet avec multiples résolutions
   */
  async createAdaptiveHLS(
    inputPath: string,
    outputDir: string,
    resolutions: string[] = ['240p', '360p', '480p', '720p', '1080p'],
    segmentDuration = 4
  ): Promise<HLSStreamResult> {
    const startTime = Date.now();
    const hlsId = `hls-adaptive-${Date.now()}`;
    
    this.logger.log('Creating adaptive HLS stream', {
      hlsId,
      inputPath,
      outputDir,
      resolutions,
      segmentDuration
    });

    // Validation des résolutions
    const invalidResolutions = resolutions.filter(r => !this.isResolutionSupported(r));
    if (invalidResolutions.length > 0) {
      throw new Error(`Résolutions non supportées: ${invalidResolutions.join(', ')}`);
    }

    // Créer le dossier de sortie
    await fs.mkdir(outputDir, { recursive: true });

    // Analyser la vidéo pour vérifier l'audio
    const videoAnalysis = await this.analyzeVideo(inputPath);
    
    // Récupérer les profils demandés
    type Profile = Omit<EncodingOptions, 'resolution'> & { resolution: string };
    const profiles: Profile[] = resolutions.map(resolution => {
      const profile = this.ENCODING_PROFILES[resolution];
      return { ...profile, resolution };
    });

    const args = this.buildAdaptiveHLSArgs(inputPath, outputDir, profiles, segmentDuration, videoAnalysis.hasAudio);

    try {
      await this.runFFmpeg(args, hlsId);
      
      // Vérifier que les fichiers ont été créés
      const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
      await fs.stat(masterPlaylistPath);

      // Compter les segments et calculer la taille totale
      const segmentFiles = await this.countSegments(outputDir);
      const totalSize = await this.calculateTotalSize(outputDir);
      
      const totalTime = Date.now() - startTime;

      this.logger.log('Adaptive HLS stream created successfully', {
        hlsId,
        outputDir,
        masterPlaylistPath,
        resolutions: resolutions.join(', '),
        segmentCount: segmentFiles.length,
        totalSize,
        totalTime
      });

      return {
        masterPlaylistPath,
        outputDir,
        resolutions,
        segmentCount: segmentFiles.length,
        totalTime,
        totalSize
      };

    } catch (error) {
      this.logger.error('Adaptive HLS creation failed', error, {
        hlsId,
        inputPath,
        outputDir
      });
      
      // Nettoyer en cas d'erreur
      try {
        await fs.rm(outputDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn('Failed to clean up output directory after HLS error', { outputDir, cleanupError });
      }
      
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
  private buildAdaptiveHLSArgs(
    inputPath: string,
    outputDir: string,
    profiles: (Omit<EncodingOptions, 'resolution'> & { resolution: string })[],
    segmentDuration: number,
    hasAudio: boolean
  ): string[] {
    const args = [
      '-i', inputPath,
      '-y',
      '-preset', 'medium',
      '-g', (segmentDuration * 12).toString(),
      '-keyint_min', (segmentDuration * 12).toString(),
      '-sc_threshold', '0',
    ];

    // CORRECTION : Maps uniques pour chaque stream de sortie
    profiles.forEach((profile, index) => {
      const { width, height, bitrate } = profile;
      
      // Map vidéo
      args.push('-map', '0:v:0');
      
      // Map audio seulement si disponible
      if (hasAudio) {
        args.push('-map', '0:a:0');
      }

      // Options vidéo pour ce stream
      args.push(
        `-c:v:${index}`, 'libx264',
        `-b:v:${index}`, bitrate,
        `-maxrate:v:${index}`, `${Math.floor(parseInt(bitrate) * 1.2)}k`,
        `-bufsize:v:${index}`, `${parseInt(bitrate) * 2}k`,
        `-vf:v:${index}`, `scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease:flags=lanczos`,
        `-profile:v:${index}`, 'high',
        `-level:v:${index}`, '4.0'
      );
      
      // Options audio pour ce stream (seulement si audio disponible)
      if (hasAudio) {
        args.push(
          `-c:a:${index}`, 'aac',
          `-b:a:${index}`, '128k',
          `-ac:${index}`, '2',
          `-ar:${index}`, '48000'
        );
      } else {
        // Si pas d'audio, désactiver l'audio pour ce stream
        args.push(`-an:${index}`);
      }
    });

    // Paramètres HLS
    args.push(
      '-f', 'hls',
      '-hls_time', segmentDuration.toString(),
      '-hls_list_size', '0',
      '-hls_segment_filename', path.join(outputDir, 'stream_%v/segment_%03d.ts'),
      '-var_stream_map', this.buildStreamMap(profiles.length, hasAudio),
      '-master_pl_name', 'master.m3u8',
      '-hls_flags', 'independent_segments',
      path.join(outputDir, 'master.m3u8')
    );

    return args;
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
   * Construit la var_stream_map pour HLS - CORRIGÉ
   */
  private buildStreamMap(streamCount: number, hasAudio: boolean): string {
    const streams = [];
    for (let i = 0; i < streamCount; i++) {
      if (hasAudio) {
        streams.push(`v:${i},a:${i}`);
      } else {
        streams.push(`v:${i}`);
      }
    }
    return streams.join(' ');
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