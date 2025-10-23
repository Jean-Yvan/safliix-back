// src/services/video-event-dispatcher.service.ts
import { Injectable } from '@nestjs/common';
import { BullMQService, QueueJob, JobTypeMap } from '@safliix-back/bullmq';
import { FileLogger } from '../utils/logger';

@Injectable()
export class VideoEventDispatcher {
  private readonly logger = new FileLogger(VideoEventDispatcher.name);

  constructor(private readonly bull: BullMQService) {}

  /**
   * 📤 Envoie un événement (Job) à une queue cible spécifiée.
   * @param queueName Le nom de la queue BullMQ cible (ex: 'VIDEO_EVENT', 'SPLITTING_QUEUE').
   * @param eventName Le nom du Job (name) que le worker va lire (ex: 'VIDEO_DOWNLOADED').
   * @param payload Les données du Job.
   */
  async emit<T extends keyof JobTypeMap>(
    queueName: T, // 💡 AJOUT: Nom de la queue cible
    eventName: string,
    payload: JobTypeMap[T],
    opts?: QueueJob<T>['opts']
  ): Promise<void> {
    try {
      this.logger.debug(`📩 Dispatching "${String(eventName)}" to queue "${queueName}"`, payload);

      // ✅ CORRECTION: Nous utilisons queueName pour la queue, et eventName pour job.name
      await this.bull.addJobToQueue<T>(queueName, {
        name: eventName, // 💡 Le nom du job est l'événement.
        data: payload,
        opts,
      });

      this.logger.debug(`✅ Event "${String(eventName)}" sent to queue "${queueName}"`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to dispatch event "${String(eventName)}" to queue "${queueName}"`,
        error
      );
      throw error;
    }
  }

  /**
   * 📦 Envoie plusieurs événements en parallèle (bulk)
   */
  async emitBulk<T extends keyof JobTypeMap>(
    // 💡 REMARQUE : Pour le bulk, nous supposons que tous les événements vont à la MÊME queue.
    // Si ce n'est pas le cas, cette méthode doit aussi prendre le queueName ou le mettre dans chaque objet.
    queueName: T, // 💡 AJOUT: Nom de la queue cible pour le bulk
    events: Array<{ eventName: string; payload: JobTypeMap[T]; opts?: QueueJob<T>['opts'] }>
  ): Promise<void> {
    if (events.length === 0) {
      this.logger.warn('⚠️ No events to dispatch (bulk)');
      return;
    }

    try {
      this.logger.debug(`📦 Dispatching ${events.length} bulk events to queue "${queueName}"`);

      await Promise.all(
        events.map((e) =>
          this.bull.addJobToQueue<T>(queueName, {
            name: e.eventName, // 💡 Le nom du job est l'événement.
            data: e.payload,
            opts: e.opts,
          })
        )
      );

      this.logger.debug(`✅ ${events.length} events dispatched successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to dispatch bulk events', error);
      throw error;
    }
  }
}