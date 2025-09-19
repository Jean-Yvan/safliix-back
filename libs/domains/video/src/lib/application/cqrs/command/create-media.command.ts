import { ICommand } from "@nestjs/cqrs";
import { CreateMediaFileDto } from "../../../interfaces/dto/create-media-file.dto";

export class CreateMediaFileCommand implements ICommand {
  constructor(
    public readonly payload: CreateMediaFileDto,
  ) {}
}