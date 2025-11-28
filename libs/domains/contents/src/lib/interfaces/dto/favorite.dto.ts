import { IsIn, IsOptional, IsString } from 'class-validator';

export class FavoriteDto {
  @IsString()
  id!: string;

  @IsIn(['film', 'serie'])
  type!: 'film' | 'serie';

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class ListFavoritesQueryDto {
  @IsOptional()
  @IsIn(['film', 'serie'])
  type?: 'film' | 'serie';
}
