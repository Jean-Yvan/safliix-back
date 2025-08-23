import { Injectable, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { MOVIE_REPOSITORY, MovieFilter } from '../../utils/types';
import { Inject } from '@nestjs/common';
import { GetMoviesQuery } from '../queries/get-movies.query';



@Injectable()
export class GetMoviesHandler extends BaseQueryHandler<GetMoviesQuery, Result<MovieAggregate[], Error>> {
  protected logger = new Logger(GetMoviesHandler.name);

  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository,
  ) {
    super();
  }

  protected async handle(query: GetMoviesQuery): Promise<Result<MovieAggregate[], Error>> {
    const dto = query.filters;
    
      const filter: MovieFilter = {
      page: dto?.page ?? 0,
      limit: dto?.limit ?? 10,
      director: dto?.director,
      format: dto?.format,
      minDuration: dto?.minDuration,
      status: dto?.status,
    };

     const saveResult = await Result.safe(this.repository.findAll(filter));
      if (saveResult.isErr()) {
        this.logger.error(`Failed to retrieve movies: ${saveResult.unwrapErr().message}`);
        return Err(saveResult.unwrapErr());
      }
      return Ok(saveResult.unwrap());
    
      
    
  }
}
