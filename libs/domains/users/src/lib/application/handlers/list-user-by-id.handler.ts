import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListUserByIdQuery } from "../cqrs/queries/list-user-by-id.query";
import { Result } from "oxide.ts";
import { User } from "../../domain/entities/user.entity";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { USER_REPOSITORY } from "../../utils/types";

@Injectable()
@QueryHandler(ListUserByIdQuery)
export class ListUserByIdHandler extends BaseQueryHandler<ListUserByIdQuery,Result<User,Error>>{
  protected override logger = new Logger(ListUserByIdHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository : IUserRepository
  ){
    super();
  }
  protected override async handle(query: ListUserByIdQuery): Promise<Result<User, Error>> {
    return this.repository.findById(query.userId);
  }

}
