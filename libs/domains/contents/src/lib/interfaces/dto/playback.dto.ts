import { IsIn, IsOptional, IsString } from 'class-validator';

export class PlaybackQueryDto {
  @IsString()
  id!: string;

  @IsIn(['film', 'serie', 'episode', 'ad'])
  type!: 'film' | 'serie' | 'episode' | 'ad';

  @IsOptional()
  @IsIn(['MAIN', 'TRAILER', 'BONUS', 'CLIP', 'ADVERTISEMENT'])
  attachmentType?: 'MAIN' | 'TRAILER' | 'BONUS' | 'CLIP' | 'ADVERTISEMENT';
}
