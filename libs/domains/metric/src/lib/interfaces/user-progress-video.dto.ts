import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UserVideoProgressDto {
  @ApiPropertyOptional({ description: 'Unique identifier', type: String })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User identifier' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Video identifier' })
  @IsUUID()
  videoId!: string;

  @ApiProperty({ description: 'Progress in seconds', default: 0 })
  @IsInt()
  progress!: number;

  @ApiProperty({ description: 'Whether the video is finished', default: false })
  @IsBoolean()
  isFinished!: boolean;

  @ApiPropertyOptional({ description: 'Shared profile ID' })
  @IsUUID()
  @IsOptional()
  profileId?: string;

  @ApiProperty({ description: 'Start date of the viewing session' })
  @IsDate()
  startedAt!: Date;

  @ApiProperty({ description: 'End date of the viewing session' })
  @IsDate()
  endedAt!: Date;

  @ApiPropertyOptional({ description: 'User rating for the video' })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Country where the viewing happened' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Device used for the viewing' })
  @IsString()
  @IsOptional()
  device?: string;
}
