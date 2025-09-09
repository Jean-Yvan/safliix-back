import { PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import { IsBoolean, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsDateString()
  lastLoginAt?:string

  @IsBoolean()
  isVerified?:boolean
}
