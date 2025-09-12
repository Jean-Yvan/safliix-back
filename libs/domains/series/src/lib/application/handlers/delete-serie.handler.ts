import { BaseHandler } from "@safliix-back/cqrs";
import { DeleteSerieCommand } from "../cqrs/commands/delete-serie.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(DeleteSerieCommand)
export class DeleteSerieHandler extends BaseHandler<DeleteSerieCommand,Result<void,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: DeleteSerieCommand): Promise<Result<void, Error>> {
    const result = await Result.safe(this.repository.deleteById(command.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}