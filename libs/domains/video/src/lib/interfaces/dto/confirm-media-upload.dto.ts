import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmUploadDto {
  @ApiProperty({ description: "ID du fichier vidéo uploadé", example: "987e6543-e21b-32d3-a456-426614174999" })
  @IsNotEmpty()
  @IsString()
  mediaFileId!: string;
}
