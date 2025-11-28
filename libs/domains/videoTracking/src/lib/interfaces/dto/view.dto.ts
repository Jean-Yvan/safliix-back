import { IsIn, IsOptional, IsString } from 'class-validator';

export class ViewDto {
  @IsString()
  id!: string;

  @IsIn(['film', 'serie'])
  type!: 'film' | 'serie';

  @IsIn(['card', 'detail'])
  context!: 'card' | 'detail';

  @IsOptional()
  timestamp?: number;
}
