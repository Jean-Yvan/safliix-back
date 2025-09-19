import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateMediaFileDto } from "./create-media-file.dto";
import { IsString,IsNotEmpty, IsIn } from "class-validator";

export class UpdateMediaFileDto extends PartialType(CreateMediaFileDto){
  @ApiProperty({ required:true, description:"Unique identifier of the video file" })
  @IsString({message:"L'id doit être une chaîne de caractères"})
  @IsNotEmpty({message:"L'id ne peut pas être vide"})
  id!: string;

  @ApiProperty({ required:false, description:"status de la video" })
  @IsIn(['PENDING', 'UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED', 'CANCELLED', 'QUEUED'], {message:"Le status doit être l'un des suivants : PENDING, UPLOADED, PROCESSING, PROCESSED, FAILED, CANCELLED, QUEUED"})
  status?: string;
}