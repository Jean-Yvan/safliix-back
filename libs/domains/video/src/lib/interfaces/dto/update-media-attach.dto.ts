import { PartialType } from "@nestjs/swagger";
import { AttachMediaToElementDto } from "./attach-media-to-elmt.dto";


export class UpdateMediaAttachDto extends PartialType(AttachMediaToElementDto){}