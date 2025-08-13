import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject,Injectable } from '@nestjs/common';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { DeleteMovieCommand } from '../commands/delete-movie.command';
import { MOVIE_REPOSITORY } from '../../utils/types';
import { MovieNotFoundError } from '../../errors/movie.errors';

@Injectable()
@CommandHandler(DeleteMovieCommand)
export class DeleteMovieHandler implements ICommandHandler<DeleteMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository
  ) {}

  async execute(command: DeleteMovieCommand) {
    const deleted = await this.repository.delete(command.movieId);
    if (!deleted) {
      throw new MovieNotFoundError(command.movieId);
    }
    return { success: true };
  }
}