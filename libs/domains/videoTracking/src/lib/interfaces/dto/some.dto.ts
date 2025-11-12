import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  progress!: number;
}

export class RateViewDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;
}

export class ProgressUpdateItemDto {
  @IsUUID()
  id!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  progress!: number;
}

export class UpdateProgressBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProgressUpdateItemDto)
  updates!: ProgressUpdateItemDto[];
}

export class MarkMultipleCompletedDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  viewIds!: string[];
}

export class WatchHistoryQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class RecentViewsQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;
}

export class WatchTimeQueryDto {
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  period?: 'day' | 'week' | 'month';
}