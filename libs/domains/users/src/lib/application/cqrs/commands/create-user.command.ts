import { CreateUserDto } from "../../../interfaces/dto/create-user.dto";

import { ICommand } from "@nestjs/cqrs";
export class CreateUserCommand implements ICommand{
  constructor(
    public readonly payload: CreateUserDto
  ){}
}