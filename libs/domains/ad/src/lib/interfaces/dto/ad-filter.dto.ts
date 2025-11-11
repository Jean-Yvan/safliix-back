import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AdFilterDto {
  @ApiPropertyOptional({
    description: 'Only return active ads',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Include archived/expired ads',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean;

  @ApiPropertyOptional({
    description: 'Return ads starting after this ISO date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAfter?: Date;

  @ApiPropertyOptional({
    description: 'Return ads starting before this ISO date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsBefore?: Date;

  @ApiPropertyOptional({
    description: 'Return ads ending after this ISO date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAfter?: Date;

  @ApiPropertyOptional({
    description: 'Return ads ending before this ISO date',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsBefore?: Date;

  @ApiPropertyOptional({
    description: 'Full text search on title',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Limit result size',
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Return only ads attached to given attachment id',
  })
  @IsOptional()
  @IsUUID()
  attachmentId?: string;
}
