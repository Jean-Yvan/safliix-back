import { UpdateUserDto } from "../../../interfaces/dto/update-user.dto";

import { ICommand } from "@nestjs/cqrs";

export class UpdateUserCommand implements ICommand{
  constructor(
    public readonly payload: UpdateUserDto
  ){}
}