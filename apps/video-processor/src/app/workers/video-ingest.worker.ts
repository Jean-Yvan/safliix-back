// workers/ingest.worker.ts
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { WorkerBase } from './base.worker'; // Assurez-vous que ce chemin est correct
import { VideoEventDispatcher } from '../services/video-event-dispatcher.service'; // Assurez-vous que ce chemin est correct
import { VideoEvents, VideoQueues, IngestJobPayload } from '@safliix-back/video-process-type'; // Assurez-vous que ce chemin est correct
import { JobTypeMap } from '@safliix-back/bullmq';
import { FileLogger } from '../utils/logger'; // Assurez-vous que ce chemin est correct
import { RedisManager } from '../services/redis-manager'; // Assurez-vous que ce chemin est correct


@Injectable()
export class IngestWorker extends WorkerBase<IngestJobPayload, void> implements OnModuleDestroy {
  protected override readonly logger = new FileLogger(IngestWorker.name);
  
  private readonly dedicatedRedisConnection: Redis;
  
  constructor(
    redisManager: RedisManager,
    configService: ConfigService, 
    private readonly dispatcher: VideoEventDispatcher
  ) {
    const connection = redisManager.createConnectionForWorker();
    
    // 💡 Définition des options BullMQ, y compris les retries par défaut
    const workerOptions = {
      connection: connection,
      concurrency: configService.get('VIDEO_ENCODING_CONCURRENCY', 2),
      // ... autres options BullMQ (limiter, lockDuration, etc.) ...
      
      // La stratégie de ré-essai doit être configurée lors de l'ajout du job,
      // mais ces options s'appliquent au worker :
      removeOnComplete: { count: configService.get('VIDEO_ENCODING_REMOVE_ON_COMPLETE', 100) },
      removeOnFail: { count: configService.get('VIDEO_ENCODING_REMOVE_ON_FAIL', 1000) },
      
      // Assurez-vous que le job d'Ingest est créé avec des "attempts" (ex: 3)
    };
    
    super(VideoQueues.VIDEO_INGEST_QUEUE, connection, 'IngestWorker', workerOptions.concurrency, workerOptions);
    this.dedicatedRedisConnection = connection;
    this.logger.log(`🚀 IngestWorker prêt — écoute ${VideoQueues.VIDEO_INGEST_QUEUE}`);

    // 💡 Configuration du gestionnaire d'échec définitif
    this.setupFailureHandler(); 
  }

  /**
   * 🚨 GESTION D'ERREUR CENTRALE : Appelé lorsque TOUTES les tentatives de ré-essai ont échoué.
   */
  private setupFailureHandler() {
    this.worker.on('failed', async (job, error) => {
      this.logger.error(`❌ Job ${job?.id} (Ingest) failed permanently. Reason: ${error.message}`);  
        const { s3Key } = job?.data as IngestJobPayload;

        // 1. Émettre l'événement d'échec définitif vers la queue du coordinateur
        await this.dispatcher.emit(
            VideoQueues.VIDEO_QUEUE, // Queue du VideoEventWorker/Coordinateur
            VideoEvents.VIDEO_PROCESSING_FAILED, 
            {
              s3Key: s3Key,
              error: error.message,
              stage: IngestWorker.name, // Contexte: Worker qui a échoué
            }
        );
    });
  }

  override async onModuleDestroy() {
    await super.onModuleDestroy(); 
    await this.dedicatedRedisConnection.quit();
    this.logger.log('✅ Dedicated Redis connection closed');
  }
  

  protected async processJob(job: Job<IngestJobPayload, void>) {
    const { s3Key, userId } = job.data;
    this.logger.log(`Processing ingest job for s3Key=${s3Key}`);
    
    const APP_ROOT = process.cwd();
    const WORK_DIR_NAME = 'temp-work';
    const SHARED_TEMP_DIR = path.resolve(APP_ROOT, WORK_DIR_NAME);

    try {
      // 1. Logique de préparation du Workspace
      // (Création de répertoires, chemins, etc. - Inchangé)
      if(!(await fs.stat(SHARED_TEMP_DIR).catch(() => false))) {
        await fs.mkdir(SHARED_TEMP_DIR, { recursive: true });
      }
      const source = path.resolve('videos', s3Key);
      const videoUUID = uuidv4();
      const workspaceDir = path.join(SHARED_TEMP_DIR, `job_${videoUUID}`);
      const sourceDir = path.join(workspaceDir, 'source');
      const hlsOutputDir = path.join(workspaceDir, 'hls_output');
      await Promise.all([fs.mkdir(sourceDir, { recursive: true }), fs.mkdir(hlsOutputDir, { recursive: true })]);
      const destPath = path.join(sourceDir, path.basename(s3Key));

      // 2. Tâche critique : Copie/Téléchargement
      await fs.copyFile(source, destPath); // Simule le téléchargement S3
      const stats = await fs.stat(destPath);
      this.logger.log(`Downloaded ${s3Key} => ${destPath} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);

      const downloadedPayload: JobTypeMap[VideoQueues.VIDEO_DOWNLOADED_QUEUE] = {
        s3Key,
        localPath: destPath,
        hlsOutputDir,
        size: stats.size,
        userId,
      };

      await this.dispatcher.emit(VideoQueues.VIDEO_DOWNLOADED_QUEUE,VideoEvents.VIDEO_DOWNLOADED, downloadedPayload);
      await this.dispatcher.emit(VideoQueues.VIDEO_QUEUE,VideoEvents.VIDEO_DOWNLOADED, downloadedPayload);
      this.logger.log(`✅ Ingest completed for ${s3Key}`);
      
      this.logger.log(`✅ Ingest completed for ${s3Key}`);
    } 
    catch (err) {
      this.logger.error(`Ingest failed for ${s3Key}. BullMQ will retry if attempts remain.`, err);

      // 🚨 GESTION DE L'ERREUR TRANSITOIRE
      // On NE notifie PAS d'échec définitif ici. 
      // On laisse l'erreur se propager pour que BullMQ tente un ré-essai.
      throw err; 
    }
  }
}


    