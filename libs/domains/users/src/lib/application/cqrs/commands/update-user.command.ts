import { UpdateUserDto } from "../../../interfaces/dto/update-user.dto";


export class UpdateuserCommand{
  constructor(
    public readonly payload: UpdateUserDto
  ){}
}