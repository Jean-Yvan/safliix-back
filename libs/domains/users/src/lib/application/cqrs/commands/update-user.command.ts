import { UpdateUserDto } from "../../../interfaces/dto/update-user.dto";


export class UpdateUserCommand{
  constructor(
    public readonly payload: UpdateUserDto
  ){}
}