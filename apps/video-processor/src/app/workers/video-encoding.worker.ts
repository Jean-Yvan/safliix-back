// video-encoding.worker.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FfmpegService } from '../services/ffmpeg.service';

@Injectable()
@Processor('video-encoding')
export class VideoEncodingWorker extends WorkerHost {
  private readonly logger = new Logger(VideoEncodingWorker.name);

  constructor(private readonly ffmpegService: FfmpegService) {
    super();
  }

  // Cette méthode est appelée pour chaque job de la queue
  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`🎬 Traitement du job ${job.id} - data: ${JSON.stringify(job.data)}`);

    try {
      const { inputPath, outputPath, codec } = job.data;

      await this.ffmpegService.encodeSegment(
        inputPath,
        outputPath,
        codec
      );

      this.logger.log(`✅ Encodage terminé pour ${outputPath}`);

      return { status: 'success', output: outputPath };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`❌ Erreur lors de l’encodage: ${error.message}`, error.stack);
      } else {
        this.logger.error(`❌ Erreur lors de l’encodage: ${JSON.stringify(error)}`);
      }
      throw error;
    }
  }
}
