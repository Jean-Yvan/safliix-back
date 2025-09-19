// src/application/dto/create-video-file.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from "class-validator";

export class CreateMediaFileDto {
  @ApiProperty({
    description: "Clé S3 unique du fichier vidéo",
    example: "uploads/videos/abcd1234.mp4",
  })
  @IsNotEmpty()
  @IsString()
  s3Key!: string;

  @ApiPropertyOptional({
    description: "Durée de la vidéo en secondes",
    example: 3600,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    description: "Largeur de la vidéo en pixels",
    example: 1920,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({
    description: "Hauteur de la vidéo en pixels",
    example: 1080,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
