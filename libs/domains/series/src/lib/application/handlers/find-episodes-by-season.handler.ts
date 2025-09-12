import { BaseQueryHandler } from "@safliix-back/cqrs";
import { FindEpisodesBySeasonId } from "../cqrs/queries/find-episode-by-seasonId.query";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Episode } from "../../domain/entities/episode.entity";

@Injectable()
@QueryHandler(FindEpisodesBySeasonId)
export class FindEpisodesbySeasonHandler extends BaseQueryHandler<FindEpisodesBySeasonId,Result<Episode[],Error>>{
  protected override logger = new Logger(FindEpisodesbySeasonHandler.name);
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: FindEpisodesBySeasonId): Promise<Result<Episode[], Error>> {
    const result = await Result.safe(this.repository.findEpisodesBySeasonId(command.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}