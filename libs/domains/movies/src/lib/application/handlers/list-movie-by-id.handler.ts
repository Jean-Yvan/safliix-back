
import { QueryHandler } from "@nestjs/cqrs";
import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListMovieByIdQuery } from "../cqrs/queries/list-movie-by-Id.query";
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result, Err, Ok } from 'oxide.ts';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { MOVIE_REPOSITORY } from '../../utils/types';


@QueryHandler(ListMovieByIdQuery)
@Injectable()
export class ListMovieByIdHandler extends BaseQueryHandler<ListMovieByIdQuery,Result<MovieAggregate,Error>>{
  protected override logger = new Logger(ListMovieByIdHandler.name);
  
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository,
  ) {
    super();
   // this.logger = new Logger(CreateMovieHandler.name);
  }

  protected async handle(
    query: ListMovieByIdQuery
  ): Promise<Result<MovieAggregate,Error>>{
    const findResult = await Result.safe(this.repository.findById(query.id));
    if (findResult.isErr()) {
      return Err(findResult.unwrapErr());
    }
    if(findResult.unwrap() != null){
      return Ok(findResult.unwrap()!);
    }else{
      return Err(new Error("Le film n'existe pas dans la base de donnée"));
    }
    
  }
}