import { ICommand } from "@nestjs/cqrs";
import { UpdateSeasonDto } from "../../../interfaces/update-season.dto";

export class UpdateSeasonCommand implements ICommand{
  constructor(
    public readonly payload:UpdateSeasonDto
  ){}
}