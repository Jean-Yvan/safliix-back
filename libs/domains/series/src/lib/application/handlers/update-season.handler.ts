import { BaseHandler } from "@safliix-back/cqrs";
import { UpdateSeasonCommand } from "../cqrs/commands/update-season.command";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Season } from "../../domain/entities/season.entity";

@Injectable()
@CommandHandler(UpdateSeasonCommand)
export class UpdateSeasonHandler extends BaseHandler<UpdateSeasonCommand,Result<Season,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: UpdateSeasonCommand): Promise<Result<Season, Error>> {
    const existed = await Result.safe(this.repository.findSeasonById(command.payload.id));

    if(existed.isErr()){
      return Err(existed.unwrapErr())
    }

    const season = existed.unwrap();
    if(season){
      season?.updateWith(command.payload);
      const result = await Result.safe(this.repository.updateSeason(season));
    
      if(result.isErr()){
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());  
    }
    return Err(new Error("La saison spécifiée n'existe pas dans la base de données"));
    
  }
  
}