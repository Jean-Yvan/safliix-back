import { BaseHandler } from "@safliix-back/cqrs";
import { UpdateUserCommand } from "../cqrs/commands/update-user.command";
import { Result, Err, Ok } from "oxide.ts";
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
    const existing = await this.repository.findById(command.payload.id);
    if(!existing){
      return Err(new Error("Utilisateur inexistant"));
    }

    await existing.updateWith(command.payload);

    const userResult = await Result.safe(this.repository.save(existing));
    if(userResult.isErr()){
      return Err(userResult.unwrapErr());
    }

    return Ok(userResult.unwrap());
  }
  
}