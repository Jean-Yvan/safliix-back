import { UpdateAdminDto } from "../../../interfaces/dto/update-admin.dto";
import { ICommand } from "@nestjs/cqrs";

export class UpdateAdminCommand implements ICommand{
  constructor(
    public readonly payload: UpdateAdminDto
  ){}
}