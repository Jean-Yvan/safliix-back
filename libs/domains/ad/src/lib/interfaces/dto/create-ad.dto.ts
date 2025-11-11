import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateAdDto {
  @ApiProperty({
    example: 'Back-to-school offer',
    description: 'Display title for the advertisement',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/ads/asset.png',
    description: 'URL of the creative asset (image/video)',
  })
  @IsUrl()
  imageUrl!: string;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Start date of the campaign',
  })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({
    example: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    description: 'End date of the campaign',
  })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the ad is enabled right away',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
