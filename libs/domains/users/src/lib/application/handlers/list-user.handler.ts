import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListUserQuery } from "../cqrs/queries/list-user.query";
import { Result, Err, Ok } from "oxide.ts";
import { User } from "../../domain/entities/user.entity";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { USER_REPOSITORY } from "../../utils/types";

@Injectable()
@QueryHandler(ListUserQuery)
export class ListUserHandler extends BaseQueryHandler<ListUserQuery,Result<User[],Error>>{
  protected override logger = new Logger(ListUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: IUserRepository
  ){
    super();
  }

  protected override  async handle(query: ListUserQuery): Promise<Result<User[], Error>> {
    const saveResult = await Result.safe(this.repository.findAll());

    if(saveResult.isErr()){
      return Err(saveResult.unwrapErr());
    }

    return Ok(saveResult.unwrap());

  }
  
  
  

}