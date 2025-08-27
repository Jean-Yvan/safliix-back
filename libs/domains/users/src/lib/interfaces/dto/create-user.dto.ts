// libs/domains/src/users/dtos/create-user.dto.ts

import { IsEmail, IsOptional, IsString, MinLength, IsBoolean } from "class-validator";
//import { UserRole } from "../enums/user-role.enum";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isMainAccount?: boolean;

  
}
