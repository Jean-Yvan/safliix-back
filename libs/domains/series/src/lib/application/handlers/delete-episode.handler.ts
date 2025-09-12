import { BaseHandler } from "@safliix-back/cqrs";
import { DeleteEpisodeCommand } from "../cqrs/commands/delete-episode.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(DeleteEpisodeCommand)
export class DeleteEpisodeHandler extends BaseHandler<DeleteEpisodeCommand,Result<void,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: DeleteEpisodeCommand): Promise<Result<void, Error>> {
    
    const result = await Result.safe(this.repository.deleteEpisode(command.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(undefined);
  }
  
}