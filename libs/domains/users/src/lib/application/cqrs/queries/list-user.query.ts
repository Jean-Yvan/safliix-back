import { ListUserDto } from "../../../interfaces/dto/list-user.dto";

import { IQuery } from "@nestjs/cqrs";

export class ListUserQuery implements IQuery{
  constructor(
    public readonly payload : ListUserDto
  ){}
}