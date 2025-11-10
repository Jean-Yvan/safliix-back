import { BaseHandler } from "@safliix-back/cqrs";
import { UpdateUserCommand } from "../cqrs/commands/update-user.command";
import { Err, Result } from "oxide.ts";
import { User } from "../../domain/entities/user.entity";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { USER_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler extends BaseHandler<UpdateUserCommand,Result<User,Error>>{

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository : IUserRepository
  ){
    super();
  }

  protected override async handle(command: UpdateUserCommand): Promise<Result<User, Error>> {
    const existingResult = await this.repository.findById(command.payload.id);

    if (existingResult.isErr()) {
      return Err(existingResult.unwrapErr());
    }

    const existing = existingResult.unwrap();
    await existing.updateWith(command.payload);

    return this.repository.save(existing);
  }
  
}
