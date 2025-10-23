import { Controller, NotFoundException, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { VideoEventDispatcher } from './services/video-event-dispatcher.service';
import { VideoEvents, VideoQueues } from '@safliix-back/video-process-type';
import { randomUUID } from 'crypto';
import { FileLogger } from './utils/logger';
import { BullMQService } from '@safliix-back/shared/bullmq';

@ApiTags('video')
@Controller('video')
export class VideoIngestController {
  private readonly logger = new FileLogger(VideoIngestController.name);

  constructor(
    private readonly dispatcher: VideoEventDispatcher,
    private readonly bullmqService: BullMQService
  ) {}

  @Post('split')
  @ApiQuery({
    name: 'inputFile',
    type: String,
    example: 'movie.mp4',
    description: 'Nom du fichier vidéo dans le bucket S3',
  })
  async ingestVideo(@Query('inputFile') inputFile: string) {
    if (!inputFile) {
      return { success: false, message: 'Paramètre inputFile manquant' };
    }

    // Génère un ID unique pour la vidéo
    const videoId = randomUUID();

    // Log local
    this.logger.log(`🎬 Ingestion initiale démarrée pour ${inputFile} (${videoId})`);
    this.logger.debug(`Détails de l’ingestion: videoId=${videoId}, inputFile=${inputFile}`);
    // Envoie l’événement initial à la file BullMQ
    await this.dispatcher.emit(VideoQueues.VIDEO_INGEST_QUEUE, VideoEvents.VIDEO_INGEST, {
      userId: 'system', // À remplacer par l’ID utilisateur réel si disponible
      s3Key:inputFile,
    });

    // Réponse à l’API
    return {
      success: true,
      videoId,
      message: `Pipeline d’ingestion lancé pour ${inputFile}`,
    };
  }

@Post('retry-failed-job')
  @ApiQuery({
    name: 'queueName',
    type: String,
    example: 'VIDEO_SPLITTING_QUEUE',
    description: 'Nom due la file BullMQ où le job a échoué',
  })
  @ApiQuery({
    name: 'jobId',
    type: String,
    example: '1234567890',
    description: 'ID du job BullMQ à relancer',
  })
  async retryFailedJob(@Query("queueName") queueName: string,@Query("jobId") jobId: string): Promise<void> {
    // 1. Déterminer la queue correcte (pour la simplicité, utilisons juste le splitter)
    const queue = this.bullmqService.getQueue(queueName); // Méthode utilitaire pour trouver la queue
    
    // 2. Récupérer le job
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new NotFoundException(`Job ID ${jobId} not found in queue ${queueName}.`);
    }

    // 3. Cloner le job
    // BullMQ n'a pas de méthode 'retry' directe pour un job FAIL. 
    // La meilleure pratique est de CLONER le job échoué avec les mêmes données.
    
    // Le nom de l'événement est le même que le job d'origine
    const eventName = job.name; 
    const jobData = job.data;
    
    // Vous pouvez optionnellement modifier les options ici (ex: donner plus de tentatives)
    const newOptions = { 
        attempts: 5, // Nouvelles tentatives pour le job relancé
        jobId: `${jobId}-retry-${Date.now()}`, 
    };

    // 4. Ajouter le nouveau job à la file
    await queue.add(eventName, jobData, newOptions);
    
    // 5. Mettre à jour l'état de la vidéo (Marquer comme 'PENDING_RETRY' dans le coordinateur)
    // Ceci est crucial pour l'UI.
    // ... (Appel au TaskProgressCoordinator pour mettre à jour l'état de la vidéo parente)
    
    this.logger.log(`Job ${jobId} cloné et relancé avec succès.`);
  }
}
