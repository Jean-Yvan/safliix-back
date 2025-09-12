import { BaseHandler } from "@safliix-back/cqrs";
import { AddEpisodeCommand } from "../cqrs/commands/add-episode.command";
import { Episode } from "../../domain/entities/episode.entity";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(AddEpisodeCommand)
export class AddEpisodeHandler extends BaseHandler<AddEpisodeCommand,Result<Episode,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: AddEpisodeCommand): Promise<Result<Episode, Error>> {
    const episode = Episode.create(command.payload);
    if(episode.isErr()){
      return Err(episode.unwrapErr())
    }
    const result = await Result.safe(this.repository.createEpisode(episode.unwrap()));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}