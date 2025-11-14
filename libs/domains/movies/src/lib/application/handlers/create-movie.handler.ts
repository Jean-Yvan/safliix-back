import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result, Err, Ok } from 'oxide.ts';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { CreateMovieCommand } from '../cqrs/commands/create-movie.command';
import { MOVIE_REPOSITORY } from '../../utils/types';
import { MovieCreatedEvent } from '../cqrs/events/movie-created.event';
import { 
  MovieCreationError,
  MovieValidationError,
  MovieSaveError 
} from '../../errors/movie.errors'; 

@Injectable()
@CommandHandler(CreateMovieCommand)
export class CreateMovieHandler extends BaseHandler<CreateMovieCommand, Result<MovieAggregate, MovieCreationError>> {
  //protected logger: Logger;

  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository,
    private readonly eventBus: EventBus
  ) {
    super();
   // this.logger = new Logger(CreateMovieHandler.name);
  }

  protected async handle(
    command: CreateMovieCommand
  ): Promise<Result<MovieAggregate, Error>> {
    // 1. Création de l'agrégat
    const movieResult = MovieAggregate.create(command.payload);
    if (movieResult.isErr()) {
     // this.logger.error(`Validation failed for movie ${command.payload.title}: ${movieResult.unwrapErr().message}`);
      return Err(new MovieValidationError(movieResult.unwrapErr().message));
    }

    const movie = movieResult.unwrap();

    // 2. Persistance
    const saveResult = await Result.safe(this.repository.create(movie));
    
    if (saveResult.isErr()) {
 //     this.logger.error(`Failed to save movie ${command.payload.title}: ${saveResult.unwrapErr().message}`);
      return Err(new MovieSaveError(saveResult.unwrapErr().message));
    }
    const persisted = saveResult.unwrap();
    this.eventBus.publish(new MovieCreatedEvent(persisted.id!, persisted.metadata.title));
    // 3. Retourner le résultat
    return Ok(persisted);
  }
}
