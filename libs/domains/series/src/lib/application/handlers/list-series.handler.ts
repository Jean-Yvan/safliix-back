import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListSerieQuery } from "../cqrs/queries/list-serie.query";
import { Serie } from "../../domain/entities/serie.entity";
import {Result, Err, Ok } from 'oxide.ts';
import { Injectable, Inject, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@QueryHandler(ListSerieQuery)
export class ListSeriesHandler extends BaseQueryHandler<ListSerieQuery,Result<Serie[],Error>>{
  protected override logger = new Logger(ListSeriesHandler.name);
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository: ISerieRepository
  ){
    super();
  }
  
  protected override async handle(query: ListSerieQuery): Promise<Result<Serie[], Error>> {
    const result = await Result.safe(this.repository.findAll(query.filters));
    if(result.isErr()){
      return Err(result.unwrapErr());
    }
    return Ok(result.unwrap());    
  }
  
}
