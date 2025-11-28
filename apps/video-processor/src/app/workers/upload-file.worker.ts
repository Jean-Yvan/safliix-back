import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { WorkerBase } from './base.worker';
//import { S3Service } from '@safliix-back/aws'; // ton service interne S3
import { VideoEvents, PlaylistResult } from '@safliix-back/video-process-type';
import * as path from 'path';
import * as fs from 'fs/promises';
import { RedisManager } from '../services/redis-manager';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploaderWorker extends WorkerBase<PlaylistResult,void> {
  //private override readonly logger = new FileLoger(UploaderWorker.name);
  //private readonly s3 = new S3Service();
  private readonly dedicatedRedisConnection: Redis;
  constructor(
    redisManager: RedisManager,
    configService: ConfigService,
  ) {
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
      removeOnComplete: { count: configService.get('VIDEO_ENCODING_REMOVE_ON_COMPLETE', 100) },
      removeOnFail: { count: configService.get('VIDEO_ENCODING_REMOVE_ON_FAIL', 1000) },
    };
    super(
      
      VideoEvents.VIDEO_ASSEMBLY_DONE,
      workerOptions.connection,
      'UploadWorker',
      workerOptions.concurrency,
      workerOptions
    );
    this.dedicatedRedisConnection = connection;
    this.logger.log(`🚀 UploaderWorker prêt — écoute ${VideoEvents.VIDEO_ASSEMBLY_DONE}`);
  }

  async processJob(job: Job<PlaylistResult>): Promise<void> {
    const { outputDir, masterPlaylistPath: _masterPlaylistPath, s3Key, } = job.data;
    this.logger.log(`📤 Upload de la vidéo ${s3Key} pour user ${s3Key}..`);

    try {
      const uploadedFiles: string[] = [];
      const files = await this.collectFiles(outputDir);

      for (const file of files) {
        const relativePath = path.relative(outputDir, file);
        const s3Path = path.join('videos', s3Key, relativePath);
        //await this.s3.uploadFile(file, s3Path);
        uploadedFiles.push(s3Path);
      }

      this.logger.log(`✅ Upload terminé (${uploadedFiles.length} fichiers)`);

      // émettre un nouvel event (pipeline)
      

    } catch (err) {
      this.logger.error(`❌ Erreur d'upload S3: ${(err as Error).message}`);
      throw err;
    }
  }

  private async collectFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) results.push(...await this.collectFiles(p));
      else results.push(p);
    }
    return results;
  }

  override async onModuleDestroy() {
    // 1. Fermer le Worker BullMQ (appel à la méthode WorkerBase)
    await super.onModuleDestroy(); 

    // 2. Fermer la connexion Redis dédiée (responsabilité du dérivé)
    await this.dedicatedRedisConnection.quit();
    this.logger.log('✅ Dedicated Redis connection closed');
  }
}
