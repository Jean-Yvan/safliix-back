import { ListUserDto } from "../../../interfaces/dto/list-user.dto";

export class ListUserQuery{
  constructor(
    public readonly payload : ListUserDto
  ){}
}