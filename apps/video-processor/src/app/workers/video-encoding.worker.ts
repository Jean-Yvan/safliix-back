// workers/video-encoding.worker.ts
import { Injectable } from '@nestjs/common';
import { WorkerBase } from './base.worker';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';

import { VideoEncodingService } from '../services/video-encoding.service';
import { RedisManager } from '../services/redis-manager';
import { ConfigService } from '@nestjs/config';
import { PartEncodedInfo, PartProcessPayload, VideoEvents, VideoQueues } from '@safliix-back/video-process-type';
import { VideoSegmentCoordinator } from '../services/video-segment-coordinator.service';
import { VideoEventDispatcher } from '../services/video-event-dispatcher.service';
import { PermanentProcessingError } from '../utils/errors';

@Injectable()
export class VideoEncodingWorker extends WorkerBase<PartProcessPayload, PartEncodedInfo>  {

  //protected override readonly  redisConnection = this.redisManager.createConnectionForWorker();
  private readonly dedicatedRedisConnection: Redis; 

  constructor(
    private readonly videoEncodingService: VideoEncodingService,
    redisManager: RedisManager,
    configService: ConfigService,
    private readonly coordinator: VideoSegmentCoordinator,
    private readonly dispatcher: VideoEventDispatcher
  ) {
    
    // Préparer les options BullMQ personnalisées
    const connection = redisManager.createConnectionForWorker();
    const workerOptions = {
      connection: connection,
      concurrency: configService.get('VIDEO_ENCODING_CONCURRENCY', 2),
      limiter: {
        max: configService.get('VIDEO_ENCODING_MAX_JOBS_PER_SECOND', 5),
        duration: 1000,
      },
      lockDuration: configService.get('VIDEO_ENCODING_LOCK_DURATION', 900_000),
      stalledInterval: configService.get('VIDEO_ENCODING_STALLED_INTERVAL', 30_000),
      removeOnComplete: {
        count: configService.get('VIDEO_ENCODING_REMOVE_ON_COMPLETE', 100),
      },
      removeOnFail: {
        count: configService.get('VIDEO_ENCODING_REMOVE_ON_FAIL', 1000),
      },
    };

    super(
      VideoQueues.VIDEO_PART_READY_QUEUE, 
      workerOptions.connection, 'VideoEncodingWorker', workerOptions.concurrency, workerOptions);
    this.dedicatedRedisConnection = connection;
    this.setupFailureHandler();
    this.logger.log(`🚀 VideoEncodingWorker prêt — écoute ${VideoEvents.VIDEO_PART_READY}`);
  }

  

  protected async processJob(job: Job<PartProcessPayload, PartEncodedInfo>): Promise<PartEncodedInfo> {
    

    this.logger.log(`🎯 Processing job ${job.id} for part ${job.data.part.index + 1}/${job.data.part.totalParts}`);

    try {
      // Validation des données du job
      this.validateJobData(job.data);

      // Traitement principal
      const result = await this.videoEncodingService.processPartEncodingJob(job.data);

      this.logger.log(`🎉 Job ${job.id} encoded successfully in ${result.totalEncodingTime}ms`);
      await this.coordinator.registerEncodedPart(
        job.data.part.s3Key,
        result.partIndex,
        job.data.part.totalParts,
        result,
        result.profiles
      );

      await this.dispatcher.emit(VideoQueues.VIDEO_QUEUE, VideoEvents.VIDEO_PART_READY, {
        s3Key: job.data.part.s3Key,
        partIndex: result.partIndex,
        totalParts: job.data.part.totalParts,
      });

      return result;

    } catch (err) {
      const isPermanent = err instanceof PermanentProcessingError;
      if(isPermanent) {
        this.logger.error(`💥 Job ${job.id} failed with permanent error: ${(err as Error).message}`);
        await this.dispatcher.emit(
          VideoQueues.VIDEO_QUEUE,
          VideoEvents.VIDEO_PROCESSING_FAILED,
          { s3Key:job.data.part.s3Key, error: err.message, stage: VideoEncodingWorker.name }
        );
        throw err; // Propager l'erreur pour marquer le job comme échoué définitivement
      }
      this.logger.error(`💥 Job ${job.id} failed`, err);
      throw err;
    }
  }


  private setupFailureHandler() {
    this.worker.on('failed', async (job, error) => {
      const s3Key = (job?.data as PartProcessPayload)?.part?.s3Key;
      const partIndex = (job?.data as PartProcessPayload)?.part?.index;
      
      this.logger.error(`❌ Job ${job?.id} (Encoding Part ${partIndex}) failed permanently after retries. Reason: ${error.message}`);
      
      if (!s3Key) {
          this.logger.error('Could not get s3Key for failed job.');
          return;
      }

      // Émettre l'événement d'échec définitif au coordinateur
      await this.dispatcher.emit(
          VideoQueues.VIDEO_QUEUE,
          VideoEvents.VIDEO_PROCESSING_FAILED, 
          {
              s3Key: s3Key,
              error: `Encoding of part ${partIndex} failed after retries: ${error.message}`,
              stage: VideoEncodingWorker.name,
          }
      );
    });
  }

  private validateJobData(jobData: PartProcessPayload): void {
    const { part, resolutions } = jobData;
    
  
    if (!part || !part.path) throw new PermanentProcessingError('Part data missing');
    if (!resolutions?.length) throw new PermanentProcessingError('At least one resolution required');
    
    const supported = this.videoEncodingService['ffmpegService'].getSupportedResolutions();
    const invalid = resolutions.filter((r) => !supported.includes(r));
    if (invalid.length) throw new PermanentProcessingError(`Unsupported resolutions: ${invalid.join(', ')}`);
  }

  override async onModuleDestroy() {
    // 1. Fermer le Worker BullMQ (appel à la méthode WorkerBase)
    await super.onModuleDestroy(); 

    // 2. Fermer la connexion Redis dédiée (responsabilité du dérivé)
    await this.dedicatedRedisConnection.quit(); 
    this.logger.log('✅ Dedicated Redis connection closed');
  }
}
