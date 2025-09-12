import { BaseQueryHandler } from "@safliix-back/cqrs";
import { FindSeasonByIdQuery } from "../cqrs/queries/find-season-by-id.query";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Season } from "../../domain/entities/season.entity";

@Injectable()
@QueryHandler(FindSeasonByIdQuery)
export class FindSeasonbyIdHandler extends BaseQueryHandler<FindSeasonByIdQuery,Result<Season,Error>>{
  protected override logger = new Logger(FindSeasonbyIdHandler.name);
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(query: FindSeasonByIdQuery): Promise<Result<Season, Error>> {
    const result = await Result.safe(this.repository.findSeasonById(query.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }
    const season = result.unwrap();
    if(season) return Ok(season);
    return Err(new Error(`La saison ${query.id} n'existe pas dans la base de données`));
    
  }
  
}