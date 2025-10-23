// workers/playlist-assembler.worker.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { WorkerBase } from './base.worker';
import { Job } from 'bullmq';
import { RedisManager } from '../services/redis-manager';
import { ConfigService } from '@nestjs/config';
import { PlaylistResult, SegmentedPayload, VideoEvents } from '@safliix-back/video-process-type';
import { PlaylistAssemblerService } from '../services/playlist-assembler.service';
import { VideoEventDispatcher } from '../services/video-event-dispatcher.service';
import { VideoQueues } from '@safliix-back/video-process-type';
import { PermanentProcessingError } from '../utils/errors';


@Injectable()
export class PlaylistAssemblerWorker extends WorkerBase<SegmentedPayload, PlaylistResult>
  {

  private readonly dedicatedRedisConnection: Redis;  

  constructor(
    private readonly assemblerService: PlaylistAssemblerService,
    redisManager: RedisManager,
    configService: ConfigService,
    private readonly dispatcher: VideoEventDispatcher,
  ) {
    const connection = redisManager.createConnectionForWorker();
    // ⚙️ Options BullMQ
    const workerOptions = {
      connection: connection,
      concurrency: configService.get('VIDEO_ENCODING_CONCURRENCY', 2),
      limiter: {
        max: configService.get('VIDEO_ENCODING_MAX_JOBS_PER_SECOND', 5),
        duration: 1000,
      },
      lockDuration: configService.get('VIDEO_ENCODING_LOCK_DURATION', 900_000),
      stalledInterval: configService.get('VIDEO_ENCODING_STALLED_INTERVAL', 30_000),
      removeOnComplete: { count: configService.get('VIDEO_ENCODING_REMOVE_ON_COMPLETE', 100) },
      removeOnFail: { count: configService.get('VIDEO_ENCODING_REMOVE_ON_FAIL', 1000) },
    };

    super(
      VideoQueues.VIDEO_SEGMENTED_QUEUE,
      workerOptions.connection,
      'PlaylistAssemblerWorker',
      //workerOptions.concurrency,
      2,
      workerOptions
    );
    this.dedicatedRedisConnection = connection;
    this.setupFailureHandler();
  }

  private setupFailureHandler() {
    this.worker.on('failed', async (job, error) => {
      const s3Key = (job?.data as SegmentedPayload)?.s3Key;
      
      this.logger.error(`❌ Job ${job?.id} (Assembler) failed permanently after retries. Reason: ${error.message}`);
      
      if (!s3Key) {
          this.logger.error('Could not get s3Key for failed assembler job.');
          return;
      }

      // Émettre l'événement d'échec définitif au coordinateur
      await this.dispatcher.emit(
          VideoQueues.VIDEO_QUEUE, // Queue du coordinateur
          VideoEvents.VIDEO_PROCESSING_FAILED, 
          {
              s3Key: s3Key,
              error: `Playlist assembly failed after retries: ${error.message}`,
              stage: PlaylistAssemblerWorker.name,
          }
      );
    });
  }  

  override async onModuleDestroy() {
    this.logger.log('🛑 Shutting down PlaylistAssemblerWorker...');
    
    await super.onModuleDestroy();
    
    await this.dedicatedRedisConnection.quit();
    this.logger.log('✅ Redis connection closed');
  }

  /**
   * 🎬 Processus principal : assembler la playlist à partir des segments encodés
   */
  protected async processJob(job: Job<SegmentedPayload, PlaylistResult>): Promise<PlaylistResult> {
    const jobData = job.data;
    this.logger.log(`🧩 Traitement du job #${job.id} — assemblage de la playlist pour ${jobData.s3Key}`);

    try {
      // 1️⃣ Validation
      this.validateJobData(jobData);
      const { profiles, assemblyDir, totalParts, s3Key } = jobData;
      // 2️⃣ Assemblage de la playlist

      const playlistResult = await this.assemblerService.assemblePlaylists(assemblyDir, totalParts, profiles, s3Key);

      // 3️⃣ Émission de l’événement final
      await this.dispatcher.emit(VideoQueues.VIDEO_PLAYLIST_ASSEMBLED_QUEUE, VideoEvents.VIDEO_PLAYLIST_ASSEMBLED, playlistResult);
      await this.dispatcher.emit(VideoQueues.VIDEO_QUEUE, VideoEvents.VIDEO_PLAYLIST_ASSEMBLED, { s3Key: jobData.s3Key });
      this.logger.log(`✅ Playlist assemblée avec succès pour ${jobData.s3Key}`);

      return playlistResult;

    } catch (error) {
      this.logger.error(`❌ Erreur lors de l’assemblage de la playlist pour ${jobData.s3Key}:`, error);

      // 🚨 STRATÉGIE DE CLASSIFICATION D'ERREUR 🚨
      if (error instanceof PermanentProcessingError) {
          // Cas 1: Erreur Permanente (Validation, segments manquants, I/O irrécupérable)
          this.logger.warn(`🛑 Permanent failure detected (${error.name}). Stopping retries immediately.`);
          
          // 1. Signaler l'échec définitif au coordinateur (court-circuitage)
          await this.dispatcher.emit(
              VideoQueues.VIDEO_QUEUE,
              VideoEvents.VIDEO_PROCESSING_FAILED,
              { s3Key:jobData.s3Key, error: error.message, stage: PlaylistAssemblerWorker.name }
          );
          
          // 2. Signaler l'échec de la tentative à BullMQ
          throw error; 
          
      } else {
          // Cas 2: Erreur Transitoire ou Inconnue (I/O temporaire, Timeout)
          // BullMQ gère les ré-essais.
          this.logger.error(`❓ Non-permanent failure. Relying on BullMQ retries as fallback.`, error);
          throw error;
      }
    }
    
  }

  /**
   * 🧠 Vérifie que les données du job sont valides
   */
  private validateJobData(jobData: SegmentedPayload): void {
    

     
    if (!jobData.assemblyDir || !jobData.s3Key || !Array.isArray(jobData.profiles) || jobData.profiles.length === 0) {
      throw new Error('Payload invalide : segments manquants ou clé S3 absente');
    }

    
  }
}
