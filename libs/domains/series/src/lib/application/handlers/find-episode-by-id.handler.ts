import { BaseQueryHandler } from "@safliix-back/cqrs";
import { FindEpisodeByIdQuery } from "../cqrs/queries/find-episode-by-id.query";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Episode } from "../../domain/entities/episode.entity";

@Injectable()
@QueryHandler(FindEpisodeByIdQuery)
export class FindEpisodebyIdHandler extends BaseQueryHandler<FindEpisodeByIdQuery,Result<Episode,Error>>{
  protected override logger = new Logger(FindEpisodebyIdHandler.name);
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(query: FindEpisodeByIdQuery): Promise<Result<Episode, Error>> {
    const result = await Result.safe(this.repository.findEpisodeById(query.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }
    const episode = result.unwrap();
    if(episode) return Ok(episode);
    return Err(new Error(`L'episode ${query.id} n'existe pas dans la base de données`));
    
  }
  
}