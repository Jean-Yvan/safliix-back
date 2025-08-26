import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsInt, IsOptional, IsBoolean, IsDate, IsNumber } from 'class-validator';

export class UserVideoProgressDto {
  @ApiPropertyOptional({ description: 'Unique identifier', type: String })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User identifier', type: String })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Video identifier', type: String })
  @IsUUID()
  videoId!: string;

  @ApiProperty({ description: 'Progress in seconds', type: Number, default: 0 })
  @IsInt()
  progress!: number;

  @ApiProperty({ description: 'Whether the video is finished', type: Boolean, default: false })
  @IsBoolean()
  isFinished!: boolean;

  @ApiPropertyOptional({ description: 'Shared profile ID', type: String })
  @IsUUID()
  @IsOptional()
  profileId?: string;

  @ApiProperty({ description: 'Date and time of viewing', type: Date })
  @IsDate()
  startedAt!: Date;

  @ApiProperty({ description: 'Date and time of viewing', type: Date })
  @IsDate()
  endedAt!: Date;

  @ApiPropertyOptional({ description: 'User rating for the video', type: Number })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Country from which user watched', type: String })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Country from which user watched', type: String })
  @IsString()
  @IsOptional()
  device?: string;
}

