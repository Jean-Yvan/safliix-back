// libs/movie/interfaces/rest/dto/movie-filter.dto.ts
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minDuration?: number; // en secondes

  @IsOptional()
  @IsString()
  status?: string; // e.g., 'published', 'draft'
}
