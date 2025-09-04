import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListUserIdQuery } from "../cqrs/queries/list-user-by-id.query";
import { Result, Err, Ok } from 'oxide.ts';
import { User } from "../../domain/entities/user.entity";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { USER_REPOSITORY } from "src/lib/utils/types";

@Injectable()
@QueryHandler(ListUserIdQuery)
export class ListUserByIdHandler extends BaseQueryHandler<ListUserIdQuery,Result<User,Error>>{
  protected override logger = new Logger(ListUserByIdHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository : IUserRepository
  ){
    super();
  }
  protected override async handle(query: ListUserIdQuery): Promise<Result<User, Error>> {
    const id = query.userId;

    const userResult = await Result.safe(this.repository.findById(id));
    if(userResult.isErr()){
      return Err(userResult.unwrapErr());
    }

    const user = userResult.unwrap();

    if(user){
      return Ok(user);
    }else{
      return Err(new Error("utilisateur inexistant"));
    }


    
  }

}