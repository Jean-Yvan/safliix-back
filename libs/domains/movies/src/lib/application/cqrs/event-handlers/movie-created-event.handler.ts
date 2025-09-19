import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MovieCreatedEvent } from '../events/movie-created.event';
import { BullmqProducerService } from '@safliix-back/bullmq';

@EventsHandler(MovieCreatedEvent)
export class MovieCreatedHandler implements IEventHandler<MovieCreatedEvent> {

  constructor(
    private readonly bullmqProducer: BullmqProducerService,
  ){}

  async handle(event: MovieCreatedEvent) {
    // Exemple : log ou audit
    console.log(`[MovieCreated] MovieID: ${event.movieId}, Title: ${event.title}, At: ${event.createdAt}`);
     await this.bullmqProducer.addVideoProcessingJob({
      videoFileId: "videoFile.id",
      s3Key: "event.s3Key",
      originalName: "event.originalName",
      context: {
        type: "movie",
        id: event.movieId,
        title: event.title,
      },
      priority: 1,
      fileSize: 0,
      format: "mp4",
      createdAt: new Date(),
    });
    // Ici, tu peux appeler un service d'audit ou notifier d'autres systèmes
    // ex: this.auditService.logMovieCreation(event);
  }
}
