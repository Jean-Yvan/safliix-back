import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject,Injectable } from '@nestjs/common';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { GetMoviesQuery } from '../queries/get-movies.query';
import { MOVIE_REPOSITORY } from '../../utils/types';
//import { MovieAggregate } from 'src/lib/domain/entities/movie.aggregate';

@Injectable()
@QueryHandler(GetMoviesQuery)
export class GetMoviesHandler implements IQueryHandler<GetMoviesQuery> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository
  ) {}

  async execute(query: GetMoviesQuery) {
    const movies = await this.repository.findAll(query.filters);
    return movies;
  }
}