// workers/video-splitter.worker.ts
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { WorkerBase } from './base.worker';
import { ConfigService } from '@nestjs/config';
import { RedisManager } from '../services/redis-manager';
import { VideoSplitterService } from '../services/video-splitter.service';
import { VideoEventDispatcher } from '../services/video-event-dispatcher.service';
import { VideoEvents,VideoQueues,PartProcessPayload,DownloadedPayload } from '@safliix-back/video-process-type';
import { PermanentProcessingError } from '../utils/errors';





@Injectable()
export class VideoSplitterWorker extends WorkerBase<DownloadedPayload, void> {

  private readonly dedicatedRedisConnection: Redis;

  constructor(
    redisManager: RedisManager,
    configService: ConfigService,
    private readonly dispatcher: VideoEventDispatcher,
    private readonly splitter: VideoSplitterService
  ) {
    const connection = redisManager.createConnectionForWorker();
    const workerOptions = {
      connection: connection,
      concurrency: configService.get('VIDEO_SPLITTING_CONCURRENCY', 2),
      limiter: {
        max: configService.get('VIDEO_SPLITTING_MAX_JOBS_PER_SECOND', 5),
        duration: 1000,
      },
      lockDuration: configService.get('VIDEO_SPLITTING_LOCK_DURATION', 900_000),
      stalledInterval: configService.get('VIDEO_SPLITTING_STALLED_INTERVAL', 30_000),
      removeOnComplete: { count: configService.get('VIDEO_SPLITTING_REMOVE_ON_COMPLETE', 100) },
      removeOnFail: { count: configService.get('VIDEO_SPLITTING_REMOVE_ON_FAIL', 1000) },
    };
    
    super(
      VideoQueues.VIDEO_DOWNLOADED_QUEUE, 
      connection, 'VideoSplitterWorker',workerOptions.concurrency, workerOptions);
    this.dedicatedRedisConnection = connection;
    this.logger.log(`🚀 Dedicated Redis connection established for VideoSplitterWorker`);
    this.setupFailureHandler();
  }

  

  protected async processJob(job: Job<DownloadedPayload, void>) {
    const { s3Key, localPath, userId, hlsOutputDir } = job.data;

    this.logger.log(`✂️ Starting split for video ${s3Key} at ${localPath}`);
    
    
    try {
      // Découpage en parties
      const { parts,resolutions } = await this.splitter.processVideo(s3Key, localPath, userId);

      // Créer un tableau de jobs pour chaque partie à encoder
      const bulkJobs: { eventName: VideoEvents.VIDEO_PART_READY; payload: PartProcessPayload }[] =
        parts.map((part) => ({
          eventName: VideoEvents.VIDEO_PART_READY,
          payload: {
            part,                  // type: VideoPart
            originalFile: localPath,
            hlsOutputDir,
            resolutions,       // remplir selon besoin ou profils
            userId
          }
        }));

      // Ajouter tous les jobs à la queue en une seule fois
      await this.dispatcher.emitBulk(VideoQueues.VIDEO_PART_READY_QUEUE,bulkJobs);
      await this.dispatcher.emit(VideoQueues.VIDEO_QUEUE, VideoEvents.VIDEO_SPLITTED, { s3Key, totalParts: parts.length });
      this.logger.log(`✅ Split job for ${s3Key} emitted ${bulkJobs.length} encoding jobs`);
    } catch (err) {
      const error = (err as Error);

      if(error instanceof PermanentProcessingError){
        this.logger.warn(`🛑 Permanent failure detected (${error.name}). Stopping retries immediately.`);
        
        // Notifier l'échec définitif
        await this.dispatcher.emit(
            VideoQueues.VIDEO_QUEUE,
            VideoEvents.VIDEO_PROCESSING_FAILED,
            { s3Key: job.data.s3Key, error: error.message, stage: VideoSplitterWorker.name }
        );
        throw error; // Propager l'erreur pour marquer le job comme échoué définitivement
      }else{
        this.logger.error(`❌ Error during splitting video ${s3Key}: ${error.message}`);
        throw err;
      }
     
      
    }
  }

  // Méthode setupFailureHandler du VideoSplitterWorker
private setupFailureHandler() {
    // 💡 L'écouteur BullMQ 'failed' est défini ici.
  this.worker.on('failed', async (job, error) => {
    this.logger.error(`❌ Job ${job?.id} (Splitter) failed permanently after retries. Reason: ${error.message}`);
      
    const { s3Key } = job?.data as DownloadedPayload;

      // Émission du signal d'échec définitif au coordinateur
    await this.dispatcher.emit(VideoQueues.VIDEO_QUEUE,
      VideoEvents.VIDEO_PROCESSING_FAILED, 
      {
          s3Key: s3Key,
          error: error.message,
          stage: VideoSplitterWorker.name,
      }
    );
  });
}

  override async onModuleDestroy() {
    // 1. Fermer le Worker BullMQ (appel à la méthode WorkerBase)
    await super.onModuleDestroy(); 

    // 2. Fermer la connexion Redis dédiée (responsabilité du dérivé)
    await this.dedicatedRedisConnection.quit();
    this.logger.log('✅ Dedicated Redis connection closed');
  }
}
