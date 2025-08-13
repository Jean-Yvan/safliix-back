import { IsInt, Min, IsString,IsOptional,IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AddSeasonDto {

  @ApiProperty({ example: 'Saison 1', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Description de la saison 1', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({required: true })
  @IsString({ message: 'L\'ID de la série doit être une chaîne.' })
  @IsNotEmpty({ message: 'L\'ID de la série est requis.' })
  seriesId!: string;
}