import { BaseQueryHandler } from "@safliix-back/cqrs";
import { FindSerieByIdQuery } from "../cqrs/queries/find-serie-by-id.query";
import { Result, Err, Ok } from "oxide.ts";
import { Injectable,Inject, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISerieRepository } from "../../domain/ports/serie.repository";
import { SERIE_REPOSITORY } from "../../utils/types";
import { Serie } from "../../domain/entities/serie.entity";

@Injectable()
@QueryHandler(FindSerieByIdQuery)
export class FindSerieByIdHandler extends BaseQueryHandler<FindSerieByIdQuery,Result<Serie,Error>>{
  protected override logger = new Logger(FindSerieByIdHandler.name);
  
  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository:ISerieRepository
  ){
    super();
  }
  protected override async handle(query: FindSerieByIdQuery): Promise<Result<Serie, Error>> {
    const result = await Result.safe(this.repository.findById(query.id));
    
    if(result.isErr()){
      return Err(result.unwrapErr());
    }

    const serie = result.unwrap();
    if(serie){
      return Ok(serie);
    }

    return Err(new Error(`La série ${query.id} n'existe pas dans la base de données`));
    
  }
  
}