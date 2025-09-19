import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayNotEmpty, ValidateNested, IsString, IsUUID, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export enum MediaAttachmentType {
  MAIN = "MAIN",
  TRAILER = "TRAILER",
  BONUS = "BONUS",
  MAKING_OF = "MAKING_OF",
  CLIP = "CLIP",
  PREVIEW = "PREVIEW",
  ADVERTISEMENT = "ADVERTISEMENT",
}

export class FileUploadRequest {
  @ApiProperty({ example: "movie.mp4", description: "Nom du fichier à uploader" })
  @IsString()
  fileName!: string;

  @ApiProperty({ enum: MediaAttachmentType, example: MediaAttachmentType.MAIN, description: "Type du fichier vidéo" })
  @IsEnum(MediaAttachmentType)
  type!: MediaAttachmentType;
}

export class RequestUploadDto {
  @ApiProperty({ description: "ID du film ou épisode associé", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  elementId!: string;

  @ApiProperty({
    description: "Liste des fichiers à uploader avec leur type",
    type: [FileUploadRequest],
    example: [
      { fileName: "movie.mp4", type: "MAIN" },
      { fileName: "trailer.mp4", type: "TRAILER" },
      { fileName: "making_of.mp4", type: "MAKING_OF" },
      { fileName: "thumbnail1.jpg", type: "PREVIEW" }
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FileUploadRequest)
  files!: FileUploadRequest[];
}
