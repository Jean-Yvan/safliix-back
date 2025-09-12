import { BaseHandler } from "@safliix-back/cqrs";
import { MoveEpisodeCommand } from "../cqrs/commands/move-episode.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(MoveEpisodeCommand)
export class DeleteSerieHandler extends BaseHandler<MoveEpisodeCommand,Result<void,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: MoveEpisodeCommand): Promise<Result<void, Error>> {
    const result = await Result.safe(this.repository.moveEpisode(command.episodeId,command.seasonId));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}