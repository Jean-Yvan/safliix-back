import { BaseHandler } from "@safliix-back/cqrs";
import { CreateUserCommand } from "../cqrs/commands/create-user.command";
import { Injectable,Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../utils/types";
import type { IUserRepository } from "../../domain/ports/user.repository";
import { EventBus,CommandHandler } from "@nestjs/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { User } from "../../domain/entities/user.entity";


@CommandHandler(CreateUserCommand)
@Injectable()
export class CreateUserHandler extends BaseHandler<CreateUserCommand,Result<User,Error>>{
  
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository : IUserRepository,
    eventBus: EventBus
  ){
    super(eventBus);
  }
  
  protected async handle(command: CreateUserCommand): Promise<Result<User,Error>> {
   const userResult = await User.create(command.payload);
   
   if(userResult.isErr()){
    return Err(userResult.unwrapErr());
   }

   const user = userResult.unwrap();

   const userCreated = await Result.safe(this.repository.save(user));

   if(userCreated.isErr()){
    return Err(userCreated.unwrapErr());
   }

   //return Ok(userCreated.unwrap());
   return Ok(userCreated.unwrap());
  }
  
  
  
}