import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result, Err, Ok } from 'oxide.ts';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { CreateMovieCommand } from '../commands/create-movie.command';
import { MOVIE_REPOSITORY } from '../../utils/types';
//import { MovieCreatedEvent } from '../events/movie-created.event';
import { 
  MovieCreationError,
  MovieValidationError,
  MovieSaveError 
} from '../../errors/movie.errors'; 

@Injectable()
@CommandHandler(CreateMovieCommand)
export class CreateMovieHandler extends BaseHandler<CreateMovieCommand, Result<MovieAggregate, MovieCreationError>> {
  protected readonly logger = new Logger(CreateMovieHandler.name);

  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository,
    eventBus: EventBus
  ) {
    super(eventBus);
  }

  protected async handle(
    command: CreateMovieCommand
  ): Promise<Result<MovieAggregate, Error>> {
    // 1. Création de l'agrégat
    const movieResult = MovieAggregate.create(command);
    if (movieResult.isErr()) {
      this.logger.error(`Validation failed for movie ${command.movieId}: ${movieResult.unwrapErr().message}`);
      return Err(new MovieValidationError(movieResult.unwrapErr().message));
    }

    const movie = movieResult.unwrap();

    // 2. Persistance
    const saveResult = await Result.safe(this.repository.save(movie));
    if (saveResult.isErr()) {
      this.logger.error(`Failed to save movie ${command.movieId}: ${saveResult.unwrapErr().message}`);
      return Err(new MovieSaveError(saveResult.unwrapErr().message));
    }

    // 3. Publication de l'événement
    /* this.eventBus.publish(
      new MovieCreatedEvent(
        movie.id,
        movie.title,
        movie.status
      )
    ); */

    return Ok(movie);
  }
}