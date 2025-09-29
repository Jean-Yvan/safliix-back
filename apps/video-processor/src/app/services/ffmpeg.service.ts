// services/ffmpeg.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface VideoAnalysisResult {
  duration: number;
  resolution: string;
  hasAudio: boolean;
  codec: string;
}

export interface VideoSegment {
  path: string;
  index: number;
  startTime: number;
  duration: number;
  totalSegments: number;
}

@Injectable()
export class FfmpegService {
  private readonly logger = new Logger(FfmpegService.name);
  private readonly FFMPEG_TIMEOUT = 300_000; // 5min max

  /**
   * Analyse une vidéo avec ffprobe
   */
  async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name',
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
            codec,
          });
        } catch (err) {
          reject(new Error(`Erreur parsing ffprobe: ${(err as Error).message}`));
        }
      });
    });
  }

  /**
   * Découpe une vidéo en segments
   */
  async splitVideo(
    inputPath: string,
    outputDir: string,
    segmentLength: number,
    totalDuration: number,
  ): Promise<VideoSegment[]> {
    const totalSegments = Math.ceil(totalDuration / segmentLength);
    const segments: VideoSegment[] = [];

    this.logger.log(`Découpage en ${totalSegments} segments de ${segmentLength}s`);

    for (let i = 0; i < totalSegments; i++) {
      const startTime = i * segmentLength;
      const remaining = totalDuration - startTime;
      const duration = Math.min(segmentLength, remaining);
      if (duration <= 0.5) break;

      const segmentPath = path.join(outputDir, `segment_${i.toString().padStart(4, '0')}.mp4`);

      await this.extractSegment(inputPath, segmentPath, startTime, duration, i);

      segments.push({
        path: segmentPath,
        index: i,
        startTime,
        duration,
        totalSegments,
      });
    }

    return segments;
  }

  /**
   * Extrait un segment avec ffmpeg
   */
  private async extractSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
    index: number,
  ): Promise<void> {
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

    await this.runFFmpeg(args, `segment-${index}`);

    // Vérification du fichier créé
    const stats = await fs.stat(outputPath);
    if (stats.size === 0) {
      await fs.unlink(outputPath);
      throw new Error(`Segment ${index} vide`);
    }
  }

  /**
   * Encode un segment en plusieurs résolutions
   */
  async encodeSegment(inputPath: string, outputDir: string, resolutions: string[]): Promise<string[]> {
    const outputs: string[] = [];

    for (const res of resolutions) {
      const [height] = res.match(/\d+/) || [];
      if (!height) continue;

      const outFile = path.join(outputDir, `${path.basename(inputPath, '.mp4')}_${res}.mp4`);
      const args = [
        '-i', inputPath,
        '-vf', `scale=-2:${height}`,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-y',
        outFile,
      ];

      await this.runFFmpeg(args, `encode-${res}`);
      outputs.push(outFile);
    }

    return outputs;
  }

  /**
   * Crée une playlist HLS à partir des segments
   */
  async createPlaylist(segments: VideoSegment[], playlistPath: string): Promise<void> {
    const content = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-TARGETDURATION:10',
      '#EXT-X-MEDIA-SEQUENCE:0',
      ...segments.map((s) => [`#EXTINF:${s.duration},`, path.basename(s.path)]).flat(),
      '#EXT-X-ENDLIST',
    ].join('\n');

    await fs.writeFile(playlistPath, content, 'utf8');
    this.logger.log(`Playlist créée: ${playlistPath}`);
  }

  /**
   * Lance un process ffmpeg
   */
  private async runFFmpeg(args: string[], context: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';

      const timeout = setTimeout(() => {
        ffmpeg.kill('SIGKILL');
        reject(new Error(`FFmpeg timeout [${context}]`));
      }, this.FFMPEG_TIMEOUT);

      ffmpeg.stderr.on('data', (d) => (stderr += d.toString()));

      ffmpeg.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          this.logger.log(`FFmpeg [${context}] terminé avec succès`);
          resolve();
        } else {
          reject(new Error(`FFmpeg [${context}] échoué: ${stderr.substring(0, 500)}`));
        }
      });
    });
  }
}
