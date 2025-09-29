import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { BullMQService } from '@safliix-back/bullmq';
import { VideoProcessingOptions, VideoSegment, VideoAnalysisResult } from '../interfaces/video-process.interface';
import { FfmpegService } from './ffmpeg.service';

@Injectable()
export class VideoSplitterService {
  private readonly logger = new Logger(VideoSplitterService.name);

  private readonly DURATION_BASED_STRATEGY = [
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
  private readonly MAX_SEGMENT_DURATION = 900;

  constructor(
    private readonly bullMQService: BullMQService,
    private readonly ffmpegService: FfmpegService
  ) {}

  async processVideo(options: VideoProcessingOptions): Promise<{ jobIds: string[]; segments: number; strategy: string; totalDuration: number }> {
    const { s3Key, userId, customPriority } = options;
    if (!s3Key?.trim()) throw new BadRequestException('Le paramètre "file" est requis.');

    let localPath: string | undefined;
    let segmentsDir: string | undefined;

    try {
      localPath = await this.downloadFromS3(s3Key);
      const stats = await fs.stat(localPath);
      if (stats.size === 0) throw new BadRequestException('Fichier vidéo vide.');

      const videoInfo = await this.ffmpegService.analyzeVideo(localPath);
      if (videoInfo.duration <= 0) throw new BadRequestException('Durée de la vidéo invalide.');

      const strategy = this.determineSegmentationStrategy(videoInfo.duration);
      segmentsDir = await this.createSegmentsDirectory(localPath);

      let segments: VideoSegment[] = [];
      if (strategy.shouldSplit) {
        segments = await this.splitVideoIntoSegments(localPath, segmentsDir, strategy.segmentLength, videoInfo.duration);
      } else {
        const playlistPath = path.join(segmentsDir, 'index.part0.m3u8');
        await this.ffmpegService.createHls(segmentPath, playlistPath, videoInfo.duration);

        segments.push({ path: localPath, index: 0, startTime: 0, duration: videoInfo.duration, playlistPath, totalSegments: 1 });
      }

      const priority = customPriority || this.calculatePriorityByDuration(videoInfo.duration);

      const bulkJobs = segments.map(segment => ({
        name: 'processVideoSegment' as const,
        data: { file: segment.path, playlistPath: segment.playlistPath, userId, segmentIndex: segment.index, originalFile: s3Key, priority },
        opts: { priority, attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      }));

      const jobInstances = await this.bullMQService.addBulkToQueue('VIDEO_PROCESSING', bulkJobs);
      const jobIds = jobInstances.map(job => job.id).filter((id): id is string => typeof id === 'string');

      return { jobIds, segments: segments.length, strategy: strategy.description, totalDuration: videoInfo.duration };
    } catch (error) {
      await this.cleanupOnError(localPath, segmentsDir);
      throw new InternalServerErrorException(`Échec du traitement: ${(error as Error).message}`);
    } finally {
      if (localPath) await this.cleanupLocalFile(localPath);
    }
  }

  private determineSegmentationStrategy(duration: number) {
    const strategy = this.DURATION_BASED_STRATEGY.find(s => duration >= s.min && duration <= s.max)
      || this.DURATION_BASED_STRATEGY[this.DURATION_BASED_STRATEGY.length - 1];

    let segmentLength = strategy.segmentLength;
    let estimatedSegments = segmentLength > 0 ? Math.ceil(duration / segmentLength) : 1;

    if (estimatedSegments > this.MAX_SEGMENTS) {
      segmentLength = Math.ceil(duration / this.MAX_SEGMENTS);
      estimatedSegments = Math.ceil(duration / segmentLength);
      this.logger.warn(`Ajustement automatique: segmentLength=${segmentLength}s`);
    }

    segmentLength = Math.min(segmentLength, this.MAX_SEGMENT_DURATION);
    segmentLength = Math.max(segmentLength, this.MIN_SEGMENT_LENGTH);

    return { shouldSplit: segmentLength > 0, segmentLength, description: strategy.description, estimatedSegments };
  }

  private async splitVideoIntoSegments(inputPath: string, outputDir: string, segmentLength: number, totalDuration: number): Promise<VideoSegment[]> {
    const totalSegments = Math.ceil(totalDuration / segmentLength);
    const segments: VideoSegment[] = [];

    for (let i = 0; i < totalSegments; i++) {
      const startTime = i * segmentLength;
      const duration = Math.min(segmentLength, totalDuration - startTime);
      if (duration <= 0.5) break;

      const segmentPath = path.join(outputDir, `segment_${i.toString().padStart(4, '0')}.mp4`);
      await this.ffmpegService.extractSegment(inputPath, segmentPath, startTime, duration);

      const playlistPath = path.join(outputDir, `index.part${i}.m3u8`);
      await this.ffmpegService.createHls(segmentPath, playlistPath, duration);

      segments.push({ path: segmentPath, index: i, startTime, duration, playlistPath, totalSegments });
    }

    return segments;
  }

  private async createSegmentsDirectory(inputPath: string) {
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const segmentsDir = path.join(__dirname, 'videos', 'segments', `${baseName}_${Date.now()}`);
    await fs.mkdir(segmentsDir, { recursive: true });
    return segmentsDir;
  }

  private async cleanupOnError(localPath?: string, segmentsDir?: string) {
    if (localPath) await fs.unlink(localPath).catch(() => {});
    if (segmentsDir) {
      const files = await fs.readdir(segmentsDir).catch(() => []);
      await Promise.all(files.map(f => fs.unlink(path.join(segmentsDir, f)).catch(() => {})));
      await fs.rmdir(segmentsDir).catch(() => {});
    }
  }

  private async cleanupLocalFile(filePath: string) {
    await fs.unlink(filePath).catch(() => {});
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
}
