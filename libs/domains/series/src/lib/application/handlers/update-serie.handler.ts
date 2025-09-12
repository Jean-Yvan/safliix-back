import { BaseHandler } from "@safliix-back/cqrs";
import { UpdateSerieCommand } from "../cqrs/commands/update-serie.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Serie } from "../../domain/entities/serie.entity";

@Injectable()
@CommandHandler(UpdateSerieCommand)
export class UpdateSerieHandler extends BaseHandler<UpdateSerieCommand,Result<Serie,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: UpdateSerieCommand): Promise<Result<Serie, Error>> {
    const existed = await Result.safe(this.repository.findById(command.payload.id));

    if(existed.isErr()){
      return Err(existed.unwrapErr())
    }

    const serie = existed.unwrap();
    if(serie){
      serie?.updateWith(command.payload);
      const result = await Result.safe(this.repository.update(serie));
    
      if(result.isErr()){
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());  
    }
    return Err(new Error("La série spécifiée n'existe pas dans la base de données"));
    
  }
  
}