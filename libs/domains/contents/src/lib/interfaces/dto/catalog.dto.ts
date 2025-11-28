import { IsIn, IsOptional, IsString } from 'class-validator';

export type CatalogSectionKey =
  | 'recommended'
  | 'most-searched'
  | 'no-boredom'
  | 'imdb-top-movies'
  | 'imdb-top-series'
  | 'favorites'
  | 'rewatch';

export class CatalogSectionQuery {
  @IsOptional()
  @IsIn(['film', 'serie', 'all'])
  type?: 'film' | 'serie' | 'all';

  @IsOptional()
  @IsIn(['recommended', 'most-searched', 'no-boredom', 'imdb-top-movies', 'imdb-top-series', 'favorites', 'rewatch'])
  section?: CatalogSectionKey;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class SearchQuery {
  @IsString()
  q!: string;

  @IsOptional()
  @IsIn(['film', 'serie'])
  type?: 'film' | 'serie';

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  badge?: string;

   @IsOptional()
   @IsString()
   userId?: string;
}
