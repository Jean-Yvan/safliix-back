// apps/video-processor/src/app/video.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { VideoProcessingJobData } from '@safliix-back/bullmq';

@Processor('video-processing')
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    
  ) {
    super();
  }

  async process(job: Job<VideoProcessingJobData>): Promise<any> {
    const { videoFileId, s3Key, context } = job.data;

    try {
      this.logger.log(`Starting processing for job ${job.id}: ${videoFileId}`);

      // 1. Mettre à jour le statut
     

      // 4. Upload des versions processed
      
      this.logger.log(`Processing completed for job ${job.id}`);
      return { success: true, videoFileId };

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      this.logger.error(`Processing failed for job ${job.id}: ${errorMessage}`);
      
      // 6. Marquer comme échoué
    //  await this.videoFileRepository.markAsFailed(videoFileId, errorMessage);
      
      throw error; // BullMQ gère automatiquement les retries
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} has completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} has failed: ${error.message}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Job ${jobId} has stalled`);
  }
}