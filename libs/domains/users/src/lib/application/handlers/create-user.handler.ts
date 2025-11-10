import { BaseHandler } from "@safliix-back/cqrs";
import { CreateUserCommand } from "../cqrs/commands/create-user.command";
import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "../../utils/types";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { CommandHandler } from "@nestjs/cqrs";
import { Err, Result } from "oxide.ts";
import { User } from "../../domain/entities/user.entity";

@CommandHandler(CreateUserCommand)
@Injectable()
export class CreateUserHandler extends BaseHandler<CreateUserCommand, Result<User, Error>> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: IUserRepository,
    
  ) {
    super();
  }

  protected async handle(command: CreateUserCommand): Promise<Result<User, Error>> {
    const userResult = await User.create(command.payload);

    if (userResult.isErr()) {
      return Err(userResult.unwrapErr());
    }

    return this.repository.save(userResult.unwrap());
  }
}
