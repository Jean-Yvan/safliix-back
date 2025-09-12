import { IsInt, Min,IsEnum, IsString,IsDateString,IsOptional,IsNotEmpty, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ContentStatus } from '@safliix-back/common';

export class AddEpisodeDto {

  @ApiProperty({ example: 'Le dernier de la fratrie', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Le titre de la saison est requis.' })
  title!: string;

  @ApiProperty({ example: 'Description de l\'épisode', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://wwww.s3.com', required: false })
  @IsUrl({}, { message: 'L\'URL de la miniature doit être une URL valide.' })
  thumbnailUrl!: string;

  @ApiProperty({ example: 'https://wwww.s3.com', required: false })
  @IsUrl({}, { message: "L'URL de la bande d'annonce doit être une URL valide." })
  @IsOptional()
  thrailerPath!: string;

  @ApiProperty({ example: true, required: true })
  @IsBoolean({ message: 'Le statut de la série doit être un booléen.' })
  isCustomProduction!: boolean;

  @ApiProperty({example:"DRAFT",required:false})
  @IsEnum(["DRAFT","PUBLISHED"],{message:"status must be DRAFT or PUBLISHED"})
  @IsOptional()
  status?: ContentStatus;

  @ApiProperty({required: true })
  @IsString({ message: 'L\'ID de la season doit être une chaîne.' })
  @IsNotEmpty({ message: 'L\'ID de la season est requis.' })
  seasonId!: string;

  @ApiProperty({ example: 1, required: true })
  @IsInt({ message: 'La durée doit doit être un entier.' })
  @Min(1, { message: 'La durée doit être supérieur ou égal à 1.' })
  duration!: number;

  @ApiProperty({ example: "2024-02-25", required: true })
  @IsDateString()
  releaseDate!: string;

  @ApiProperty({ example: "2024-02-25", required: true })
  @IsDateString()
  plateformDate!: string;

  @ApiProperty({ example: 1, required: true })
  @IsString({ message: 'Le nom du directeur de production est une chaine.' })
  director!: string;

  @ApiProperty({ example: 'https://www.s3.com', required: true })
  @IsUrl({},{ message: 'Le lien du fichier vidéo doit être une URL valide.' })
  videoFileUrl!: string;

  @ApiProperty({example:2,required:true})
  @IsInt({message:"Le numéro de l'épisode doit être un entier"})
  @Min(1,{message:"Le numéro de l'épisode doit être supérieur ou égal à 1"})
  episodeNumber!:number;
  
}