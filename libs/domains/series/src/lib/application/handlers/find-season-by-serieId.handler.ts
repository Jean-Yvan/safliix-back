import { BaseQueryHandler } from "@safliix-back/cqrs";
import { FindSeasonsBySerieId } from "../cqrs/queries/find-season-by-serieId.query";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Season } from "../../domain/entities/season.entity";

@Injectable()
@QueryHandler(FindSeasonsBySerieId)
export class FindSeasonsbySerieHandler extends BaseQueryHandler<FindSeasonsBySerieId,Result<Season[],Error>>{
  protected override logger = new Logger(FindSeasonsbySerieHandler.name);
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: FindSeasonsBySerieId): Promise<Result<Season[], Error>> {
    const result = await Result.safe(this.repository.findSeasonsBySerieId(command.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}