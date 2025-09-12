import { BaseHandler } from "@safliix-back/cqrs";
import { UpdateEpisodeCommand } from "../cqrs/commands/update-episode.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Episode } from "../../domain/entities/episode.entity";

@Injectable()
@CommandHandler(UpdateEpisodeCommand)
export class UpdateEpisodeHandler extends BaseHandler<UpdateEpisodeCommand,Result<Episode,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: UpdateEpisodeCommand): Promise<Result<Episode, Error>> {
    const existed = await Result.safe(this.repository.findEpisodeById(command.payload.id));

    if(existed.isErr()){
      return Err(existed.unwrapErr())
    }

    const episode = existed.unwrap();
    if(episode){
      episode?.updateWith(command.payload);
      const result = await Result.safe(this.repository.updateEpisode(episode));
    
      if(result.isErr()){
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());  
    }
    return Err(new Error("La saison spécifiée n'existe pas dans la base de données"));
    
  }
  
}