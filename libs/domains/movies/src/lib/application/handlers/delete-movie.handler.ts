import { CommandHandler } from '@nestjs/cqrs';
import { Inject,Injectable } from '@nestjs/common';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { DeleteMovieCommand } from '../commands/delete-movie.command';
import { MOVIE_REPOSITORY } from '../../utils/types';
import { BaseHandler } from '@safliix-back/cqrs';
import { Result,Err,Ok } from 'oxide.ts';

@Injectable()
@CommandHandler(DeleteMovieCommand)
export class DeleteMovieHandler extends BaseHandler<DeleteMovieCommand,Result<void,Error>> {

  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository
  ) {
    super();
  }

  protected override async handle(command: DeleteMovieCommand): Promise<Result<void,Error>> {
    const deleted = await Result.safe(this.repository.delete(command.movieId));
    if (deleted.isErr()) {
      return Err(deleted.unwrapErr())
    }
    return Ok(undefined);
    
  }
  
}