import { ICommand } from "@nestjs/cqrs";
import { AttachMediaToElementDto } from "../../../interfaces/dto/attach-media-to-elmt.dto";

export class AttachMediaToElmtCommand implements ICommand {
  constructor(
    public readonly payload: AttachMediaToElementDto
  ){}
}