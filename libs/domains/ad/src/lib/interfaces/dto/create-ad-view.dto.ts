import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateAdViewDto {
  @ApiProperty({ description: 'Identifier of the viewed ad' })
  @IsUUID()
  adId!: string;

  @ApiProperty({
    description: 'Viewer user id when authenticated',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Profile identifier when using shared accounts',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiProperty({
    description: 'ISO country code detected for the view',
    required: false,
    example: 'BJ',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @ApiProperty({
    description: 'Exact timestamp when the impression occurred',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  viewedAt?: Date;
}
