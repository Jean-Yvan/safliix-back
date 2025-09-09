import { CreateAdminDto } from "../../../interfaces/dto/create-admin.dto";
import { ICommand } from "@nestjs/cqrs";

export class CreateAdminCommand implements ICommand{
  constructor(
    public readonly payload: CreateAdminDto
  ){}
}