import { ICommand } from "@nestjs/cqrs";
import { RequestUploadDto } from "../../../interfaces/dto/request-media-upload.dto"

export class RequestUploadCommand implements ICommand{
  constructor(public readonly dto: RequestUploadDto) {}
}
