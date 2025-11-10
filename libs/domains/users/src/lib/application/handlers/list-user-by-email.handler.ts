import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListUserByEmailQuery } from "../cqrs/queries/list-user-by-email.query";
import { Result } from "oxide.ts";
import { User } from "../../domain/entities/user.entity";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { USER_REPOSITORY } from "../../utils/types";

@Injectable()
@QueryHandler(ListUserByEmailQuery)
export class ListUserByEmailHandler extends BaseQueryHandler<ListUserByEmailQuery, Result<User, Error>> {
  protected override logger = new Logger(ListUserByEmailHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: IUserRepository
  ) {
    super();
  }

  protected override async handle(query: ListUserByEmailQuery): Promise<Result<User, Error>> {
    return this.repository.findByEmail(query.email);
  }
}
