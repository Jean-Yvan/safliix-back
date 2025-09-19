import { ICommand } from "@nestjs/cqrs";
import { ConfirmUploadDto } from "../../../interfaces/dto/confirm-media-upload.dto";

export class ConfirmUploadCommand implements ICommand{
  constructor(public readonly dto: ConfirmUploadDto) {}
}
