import {
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  ArrayNotEmpty,
  IsDateString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';


export class CreateSerieDto {

  @ApiProperty({example:"Le diable des montagnes",required:true})
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis.' })
  title!: string;

  @ApiProperty({required:true})
  @IsString()
  @IsNotEmpty({ message: 'La description est requise.' })
  description!: string;

  @ApiProperty({example:120,required:true})
  @IsInt({ message: 'La durée doit être un entier (en secondes).' })
  duration!: number;

  @ApiProperty({example:"2024-06-07",required:true})
  @IsDateString({},{message:'La date de publication est incorrecte'})
  releaseDate!: string;

  
  @ApiProperty({example:"2024-06-07",required:true})
  @IsDateString({},{message:'La date de publication sur Safflix est incorrecte'})
  plateformDate!: string;

  @ApiProperty({example:"court-métrage",required:true})
  @IsString()
  @IsNotEmpty({ message: 'Le format est requis.' })
  format!: string;

  @ApiProperty({example:"horreur",required:true})
  @IsString()
  @IsNotEmpty({ message: 'La catégorie est requise.' })
  category!: string;

  @ApiProperty({example:"R",required:false})
  @IsOptional()
  @IsIn(['G', 'PG', 'PG-13', 'R', 'NC-17'], {
    message: 'La classification d’âge est invalide.',
  })
  ageRating!: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

  @ApiProperty({example:"https://www.exemple.com",required:true})
  @IsUrl({}, { message: 'L’URL de la miniature est invalide.' })
  thumbnailUrl!: string;

  @ApiProperty({example:"https://www.exemple.com",required:false})
  @IsOptional()
  @IsUrl({}, { message: 'L’URL de l’image secondaire est invalide.' })
  secondaryImageUrl!: string;

  @ApiProperty({required:false})
  @IsArray({ message: 'Les noms des acteurs doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque nom d’acteur doit être une chaîne.' })
  @ArrayNotEmpty({ message: 'La liste des acteurs ne peut pas être vide.' })
  actorNames!: string[];

  @ApiProperty({example:"John Doe",required:true})
  @IsString()
  @IsNotEmpty({ message: 'Le nom du réalisateur est requis.' })
  director!: string;

  @ApiProperty({required:false})
  @IsBoolean({ message: 'Le champ isPremiere doit être un booléen.' })
  isPremiere!: boolean;

  @ApiProperty({example:"30000",required:false})
  @IsOptional()
  @IsInt({ message: 'Le prix de location doit être un entier.' })
  rentalPrice?: number;

  @ApiProperty({required:false})
  @IsArray({ message: 'Les langues des sous-titres doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque langue doit être une chaîne.' })
  subtitleLanguages!: string[];

  

  @ApiProperty({example:"Safliix",required:true})
  @IsString({message:'La maison de production est requise'})
  productionHouse!: string;

}
