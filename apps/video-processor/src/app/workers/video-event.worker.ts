// src/workers/video-event.worker.ts
import { Job, WorkerOptions } from 'bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { TaskProgressCoordinator, VIDEO_STAGES } from '../services/task-progess-coordinator.service';
//import { VideoSegmentCoordinator } from '../services/video-segment-coordinator.service';
import { VideoEvents, VideoQueues } from '@safliix-back/video-process-type';
import { Redis } from 'ioredis';
import { WorkerBase } from './base.worker';
import { RedisManager } from '../services/redis-manager';
import { ConfigService } from '@nestjs/config';
import { GenericPayload, PartReadyPayload } from '@safliix-back/video-process-type';
//import { FileLogger } from '../utils/logger';
// ... (PROGRESS_VALUES, PartReadyPayload, GenericPayload restent inchangés)

const PROGRESS_VALUES = {
  INIT: 0,
  DOWNLOADED: 15,
  SPLITTED: 30,
  ENCODING_START: 30,
  ENCODING_END: 85,
  SEGMENTED: 85,
  PLAYLIST_ASSEMBLED: 95,
  COMPLETED: 100,
} as const;



@Injectable()
export class VideoEventWorker extends WorkerBase<GenericPayload | PartReadyPayload, void> implements OnModuleDestroy {

  // Définition statique des options pour le constructeur parent
  
  private static readonly WORKER_CONCURRENCY = 2;
  private static readonly WORKER_NAME = 'VideoEventWorker';
  private readonly dedicatedRedisConnection: Redis;
  constructor(
    // 💡 L'instance Redis est requise par WorkerBase
    redisManager: RedisManager,
    configService: ConfigService, 
    private readonly coordinator: TaskProgressCoordinator,
    //private readonly segmentCoordinator: VideoSegmentCoordinator,
  ) {
    const connection = redisManager.createConnectionForWorker();
    // 1. Définir les options BullMQ ici
    const workerOptions: WorkerOptions = {
      connection: connection,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 250 },
    };

    // 2. Appel à super() pour initialiser le BullMQ.Worker 
    super(
      VideoQueues.VIDEO_QUEUE,
      connection, // Passé au parent (WorkerBase.redisConnection)
      VideoEventWorker.WORKER_NAME,
      VideoEventWorker.WORKER_CONCURRENCY,
      workerOptions
    );
    
    // 💡 Les handlers d'événements sont gérés par WorkerBase.setupEventHandlers()
    // 💡 WorkerBase gère la propriété this.worker et this.logger
    this.dedicatedRedisConnection = connection;
    this.logger.log(`🚀 ${VideoEventWorker.WORKER_NAME} initialisé`);
    this.setupFailureHandler();
  }
  
  // 💡 Le contrat de WorkerBase est de déléguer la logique de job à processJob
  //    Nous devons donc encapsuler la logique de handleJob/processEvent dans processJob.
  protected async processJob(job: Job<GenericPayload | PartReadyPayload, void>): Promise<void> {
    const { name, data } = job;
    
    try {
        await this.processEvent(name, data);
    } catch (error) {
        const s3Key = data.s3Key || 'N/A';
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        this.logger.error(`❌ Échec de la mise à jour de l'état pour ${s3Key} (Event: ${name}). Raison: ${errorMessage}`, error);
        
        // 💡 L'objectif est TOUJOURS de relancer pour que BullMQ tente à nouveau, 
        // car l'échec est probablement transitoire (DB/Redis).
        throw error;
    }
  }

  // NOTE: Les méthodes privées handleJob, initializeWorker et onModuleDestroy doivent être supprimées/adaptées.


  private setupFailureHandler() {
    this.worker.on('failed', async (job, error) => {
        const data = job?.data as GenericPayload;
        const s3Key = data.s3Key || 'N/A';
        
        // 🛑 ALERTE CRITIQUE : Le coordinateur d'état n'a pas pu traiter l'événement
        // Cela signifie que nous avons raté une mise à jour d'état (progression ou échec).
        this.logger.error(
            `🤯 Le job d'événement #${job?.id} (${job?.name}) a ÉCHOUÉ DÉFINITIVEMENT après tentatives. 
            Vidéo: ${s3Key}. Le statut de cette vidéo est maintenant incohérent.`, 
            error
        );

        // NOTE: On n'appelle PAS le coordinator.markFailed ici, car le job échoué 
        // pourrait être le job 'VIDEO_PROCESSING_FAILED' lui-même. 
        // Loguer l'erreur est suffisant pour le moment.
    });
}
  private async processEvent(name: string, data: GenericPayload | PartReadyPayload) {
    switch (name) {
      case VideoEvents.VIDEO_INGEST:
        await this.coordinator.init(data.s3Key);
        this.logger.log(`✅ Initialisation de l’ingestion pour ${data.s3Key}`);
        break;
      
      case VideoEvents.VIDEO_DOWNLOADED:
        await this.coordinator.updateProgress(
          data.s3Key,
          VIDEO_STAGES.DOWNLOAD,
          PROGRESS_VALUES.DOWNLOADED,
          'Fichier téléchargé depuis S3'
        );
        this.logger.log(`✅ Mise à jour de la progression du téléchargement pour ${data.s3Key}`);
        break;

      case VideoEvents.VIDEO_SPLITTED:
        await this.coordinator.updateProgress(
          data.s3Key,
          VIDEO_STAGES.SPLIT,
          PROGRESS_VALUES.SPLITTED,
          `${data.totalParts} parties créées`
        );
        this.logger.log(`✅ Mise à jour de la progression du découpage pour ${data.s3Key}`);
        break;

      case VideoEvents.VIDEO_PART_READY:
        await this.handlePartReady(data as PartReadyPayload);
        this.logger.log(`✅ Partie encodée prête pour ${data.s3Key}`);
        break;

      case VideoEvents.VIDEO_SEGMENTED:
        await this.coordinator.updateProgress(
          data.s3Key,
          VIDEO_STAGES.PROCESSING,
          PROGRESS_VALUES.SEGMENTED,
          'Toutes les parties encodées'
        );
        this.logger.log(`✅ Mise à jour de la progression du segmentation pour ${data.s3Key}`);
        break;

      case VideoEvents.VIDEO_PLAYLIST_ASSEMBLED:
        await this.coordinator.updateProgress(
          data.s3Key,
          'playlist',
          PROGRESS_VALUES.PLAYLIST_ASSEMBLED,
          'Playlist assemblée'
        );
        this.logger.log(`✅ Mise à jour de la progression de l’assemblage de la playlist pour ${data.s3Key}`);
        break;

      case VideoEvents.VIDEO_ASSEMBLY_DONE:
        await this.coordinator.markCompleted(data.s3Key, 'Upload terminé');
        await this.coordinator.clearProgress(data.s3Key);
        break;

      case VideoEvents.VIDEO_PROCESSING_FAILED:
        // Ce worker traite l'événement final d'échec et nettoie l'état
        await this.coordinator.markFailed(data.s3Key, data.error || 'Erreur inconnue');
        await this.coordinator.clearProgress(data.s3Key);
        break;

      default:
        this.logger.warn(`⚠️ Event non géré: ${name}`, data);
    }
  }

  private async handlePartReady(data: PartReadyPayload) {
    const adjustedIndex = data.partIndex + 1;

    const encodingProgress = this.calculateEncodingProgress(adjustedIndex, data.totalParts);

    await this.coordinator.updateProgress(
      data.s3Key,
      VIDEO_STAGES.PROCESSING,
      encodingProgress,
      `Partie ${adjustedIndex}/${data.totalParts} encodée`
    );

    
  }

  private calculateEncodingProgress(partIndex: number, totalParts: number): number {
    const encodingRange = PROGRESS_VALUES.ENCODING_END - PROGRESS_VALUES.ENCODING_START;
    const progress = PROGRESS_VALUES.ENCODING_START + Math.floor((partIndex / totalParts) * encodingRange);
    return Math.min(progress, PROGRESS_VALUES.ENCODING_END);
  }

  // Utiliser pour les erreurs internes du worker (ex: erreur DB lors de la mise à jour de la progression)
  private async handleProcessingError(eventName: string, data: GenericPayload, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    this.logger.error(`❌ Erreur interne lors du traitement de l'event ${eventName}:`, error);

    if (data?.videoId) {
      // Nous ne devons pas marquer la vidéo comme échouée si le job échoue. 
      // Le job "VIDEO_PROCESSING_FAILED" est responsable de cela. 
      // Ici, on gère juste le cas où la mise à jour de progression elle-même échoue.
      
      // Laisser l'erreur se propager pour le logging BullMQ.
    }
  }

  override async onModuleDestroy() {
    this.logger.log('🛑 Shutting down VideoEventWorker...');
    await super.onModuleDestroy();
    await this.dedicatedRedisConnection.quit();
    this.logger.log('✅ Dedicated Redis connection closed');
  }

  // 💡 Suppression de la méthode onModuleDestroy car elle est gérée par WorkerBase
  //    qui appelle this.gracefulShutdown().
}