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
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est requise.' })
  description!: string;

  @IsInt({ message: 'La durée doit être un entier (en secondes).' })
  duration!: number;

  @IsString()
  @IsNotEmpty({ message: 'Le format est requis.' })
  format!: string;

  @IsIn(['G', 'PG', 'PG-13', 'R', 'NC-17'], {
    message: 'La classification d’âge est invalide.',
  })
  ageRating!: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

  @IsUrl({}, { message: 'L’URL de la miniature est invalide.' })
  thumbnailUrl!: string;

  @IsOptional()
  @IsUrl({}, { message: 'L’URL de l’image secondaire est invalide.' })
  secondaryImageUrl?: string;

  @IsArray({ message: 'Les noms des acteurs doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque nom d’acteur doit être une chaîne.' })
  @ArrayNotEmpty({ message: 'La liste des acteurs ne peut pas être vide.' })
  actorNames!: string[];

  @IsString()
  @IsNotEmpty({ message: 'Le nom du réalisateur est requis.' })
  director!: string;

  @IsBoolean({ message: 'Le champ isPremiere doit être un booléen.' })
  isPremiere!: boolean;

  @IsOptional()
  @IsInt({ message: 'Le prix de location doit être un entier.' })
  rentalPrice?: number;

  @IsArray({ message: 'Les langues des sous-titres doivent être un tableau.' })
  @IsString({ each: true, message: 'Chaque langue doit être une chaîne.' })
  subtitleLanguages!: string[];
}
