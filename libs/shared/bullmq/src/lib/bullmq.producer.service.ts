// libs/shared/bullmq/src/lib/bullmq.producer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Queues } from './queue';
import { VideoProcessingJobData } from './interfaces/video-processing-job.interface';

@Injectable()
export class BullmqProducerService {
  constructor(
    @InjectQueue(Queues.VIDEO_PROCESSING)
    private videoQueue: Queue,
  ) {}

  async addVideoProcessingJob(data: VideoProcessingJobData) {
    return this.videoQueue.add('process-video', data, {
      jobId: `video_${data.videoFileId}`,
      priority: data.priority || 3,
    });
  }

  async getQueueStats() {
    return this.videoQueue.getJobCounts();
  }

  async cleanOldJobs() {
    // Nettoyer les jobs complétés de plus de 7 jours
    await this.videoQueue.clean(1000 * 60 * 60 * 24 * 7,0, 'completed');
  }
}