import { PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import { AdminRole } from '../../utils/types';

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsDateString()
  lastLoginAt?:string

  @IsBoolean()
  isVerified?:boolean

  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @IsEnum(AdminRole)
  @IsOptional()
  public override role?: AdminRole;

  @IsString()
  @IsOptional()
  public override keycloakId?: string;
}
