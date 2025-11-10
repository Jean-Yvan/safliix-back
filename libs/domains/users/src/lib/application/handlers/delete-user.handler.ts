import { BaseHandler } from "@safliix-back/cqrs";
import { DeleteUserCommand } from "../cqrs/commands/delete-user.command";
import { Result } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { USER_REPOSITORY } from "../../utils/types";

@CommandHandler(DeleteUserCommand)
@Injectable()
export class DeleteUserHandler extends BaseHandler<DeleteUserCommand, Result<boolean, Error>> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: IUserRepository
  ) {
    super();
  }

  protected async handle(command: DeleteUserCommand): Promise<Result<boolean, Error>> {
    return this.repository.delete(command.userId);
  }
}
