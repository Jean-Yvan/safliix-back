import { ICommand } from "@nestjs/cqrs";
import { UpdateSerieDto } from "../../../interfaces/update-serie.dto";

export class UpdateSerieCommand implements ICommand{
  constructor(
    public readonly payload:UpdateSerieDto
  ){}
}