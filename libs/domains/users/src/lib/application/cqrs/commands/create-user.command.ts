import { CreateUserDto } from "../../../interfaces/dto/create-user.dto";

export class CreateUserCommand{
  constructor(
    public readonly payload: CreateUserDto
  ){}
}