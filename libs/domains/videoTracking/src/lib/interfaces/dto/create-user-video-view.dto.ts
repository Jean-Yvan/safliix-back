// interfaces/dto/create-user-video-view.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsBoolean, IsOptional, IsString, Min, Max, IsDate } from 'class-validator';

export class CreateUserVideoViewDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Video ID' })
  @IsUUID()
  videoId!: string;

  @ApiProperty({ description: 'Profile ID (optional)' })
  @IsUUID()
  @IsOptional()
  profileId?: string;

  @ApiProperty({ description: 'Current progress in seconds', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  progress?: number;

  @ApiProperty({ description: 'Whether the video is completed', default: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ description: 'Country code (optional)' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Device information (optional)' })
  @IsString()
  @IsOptional()
  device?: string;

  @ApiProperty({ description: 'User rating 1-5 (optional)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: 'View start time (optional)' })
  @IsDate()
  @IsOptional()
  startedAt?: Date;

  @ApiProperty({ description: 'View end time (optional)' })
  @IsDate()
  @IsOptional()
  endedAt?: Date;
}