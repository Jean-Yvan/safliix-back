import { BaseHandler } from "@safliix-back/cqrs";
import { AddSeasonCommand } from "../cqrs/commands/add-season.command";
import { Season } from "../../domain/entities/season.entity";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(AddSeasonCommand)
export class AddSeasonHandler extends BaseHandler<AddSeasonCommand,Result<Season,Error>>{
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(command: AddSeasonCommand): Promise<Result<Season, Error>> {
    const season = Season.create(command.payload);
    if(season.isErr()){
      return Err(season.unwrapErr())
    }
    const result = await Result.safe(this.repository.createSeason(season.unwrap()));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}