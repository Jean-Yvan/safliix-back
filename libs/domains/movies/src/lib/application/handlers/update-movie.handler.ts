import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { UpdateMovieCommand } from '../commands/update-movie.command';
import { MOVIE_REPOSITORY } from '../..//utils/types';
import { MovieNotFoundError } from '../../errors/movie.errors';

@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler implements ICommandHandler<UpdateMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository
  ) {}

  async execute(command: UpdateMovieCommand) {
    const movie = await this.repository.findById(command.movieId);
    if (!movie) {
      throw new MovieNotFoundError(command.movieId);
    }

    const updated = movie.update(command.payload);
   // await this.repository.save(updated);
    
    return updated;
  }
}