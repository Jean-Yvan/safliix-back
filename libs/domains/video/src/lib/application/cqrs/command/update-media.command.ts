import { ICommand } from "@nestjs/cqrs";
import { UpdateMediaFileDto } from "../../../interfaces/dto/update-media-file.dto";

export class UpdateMediaFileCommand implements ICommand {
  constructor(
    public readonly payload: UpdateMediaFileDto,
  ) {}
}