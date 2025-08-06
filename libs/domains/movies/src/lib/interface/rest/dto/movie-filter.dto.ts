// libs/movie/interfaces/rest/dto/movie-filter.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class MovieFilterDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  director?: string;

  @IsOptional()
  format?: string;

  @IsOptional()
  @IsInt()
  minDuration?: number; // en secondes
}