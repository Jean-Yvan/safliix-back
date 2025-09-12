import { BaseHandler } from "@safliix-back/cqrs";
import { DeleteSeasonCommand } from "../cqrs/commands/delete-season.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(DeleteSeasonCommand)
export class DeleteSeasonHandler extends BaseHandler<DeleteSeasonCommand,Result<void,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: DeleteSeasonCommand): Promise<Result<void, Error>> {
    const result = await Result.safe(this.repository.deleteSeason(command.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}