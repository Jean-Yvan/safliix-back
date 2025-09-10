// libs/movie/interfaces/rest/dto/update-movie.dto.ts
import { IsOptional, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';


export class UpdateMovieDto extends PartialType(CreateMovieDto) {

  @IsString({message:"L'id est obligatoire"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  id!:string

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}