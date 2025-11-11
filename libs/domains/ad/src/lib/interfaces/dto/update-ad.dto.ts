import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateAdDto } from './create-ad.dto';

export class UpdateAdDto extends PartialType(CreateAdDto) {
  @ApiPropertyOptional({
    description: 'Override for ad title',
    example: 'Black Friday countdown',
  })
  @IsOptional()
  @IsString()
  override title?: string;

  @ApiPropertyOptional({
    description: 'Updated asset URL',
    example: 'https://cdn.example.com/ads/new.png',
  })
  @IsOptional()
  @IsUrl()
  override imageUrl?: string;

  @ApiPropertyOptional({
    description: 'New campaign start date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  override startDate?: Date;

  @ApiPropertyOptional({
    description: 'New campaign end date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  override endDate?: Date;

  @ApiPropertyOptional({
    description: 'Override activation flag',
  })
  @IsOptional()
  @IsBoolean()
  override isActive?: boolean;
}
