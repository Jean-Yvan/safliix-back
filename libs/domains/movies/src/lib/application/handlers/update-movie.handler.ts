import { CommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { Result, Ok, Err } from "oxide.ts";
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { UpdateMovieCommand } from '../cqrs/commands/update-movie.command';
import { MOVIE_REPOSITORY } from '../../utils/types';
import { MovieNotFoundError } from '../../errors/movie.errors';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { BaseHandler } from '@safliix-back/cqrs';

@Injectable()
@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler extends BaseHandler<UpdateMovieCommand,Result<MovieAggregate,Error>> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository
  ) {super()}

  protected override async handle(command: UpdateMovieCommand): Promise<Result<MovieAggregate, Error>> {
    const movieResult = await Result.safe(this.repository.findById(command.payload.id));
    if(movieResult.isErr()){
      return Err(movieResult.unwrapErr());
    }

    const movie = movieResult.unwrap();
    if (!movie) {
      return Err(new MovieNotFoundError(command.payload.id));
    }

  

    const merged = movie.updateWith(command.payload);

    if (merged.isErr()) {
      return Err(merged.unwrapErr());
    }

    const result = await Result.safe(this.repository.update(command.payload.id,merged.unwrap()));
    if(result.isErr()){
      return Err(result.unwrapErr());
    }else{
      return Ok(result.unwrap());
    }
    
  }

  
} 
