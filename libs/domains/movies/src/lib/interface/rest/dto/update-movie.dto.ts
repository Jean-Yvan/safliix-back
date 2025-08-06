// libs/movie/interfaces/rest/dto/update-movie.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';


export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}