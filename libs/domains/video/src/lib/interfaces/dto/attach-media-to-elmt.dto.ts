// src/application/dto/attach-video-to-element.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsIn } from "class-validator";
import type { ElementType, AttachmentType } from "../../utils/types";

export class AttachMediaToElementDto {
  @ApiProperty({
    description: "ID du fichier vidéo",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsString()
  mediaFileId!: string;

  @ApiProperty({
    description: "Type d’élément auquel la vidéo sera attachée",
    enum: ["MOVIE", "EPISODE", "AD"],
    example: "MOVIE",
  })
  @IsNotEmpty()
  @IsIn(["MOVIE", "EPISODE", "AD"])
  elementType!: ElementType;

  @ApiProperty({
    description: "ID de l’élément (Movie, Episode, Ad, etc.)",
    example: "987e6543-e21b-32d3-a456-426614174999",
  })
  @IsNotEmpty()
  @IsString()
  elementId!: string;

  @ApiProperty({
    description: "Type d’attachement de la vidéo",
    enum: ["MAIN", "TRAILER", "BONUS"],
    example: "MAIN",
  })
  @IsNotEmpty()
  @IsIn(["MAIN", "TRAILER", "BONUS"])
  type!: AttachmentType;
}
