// libs/domains/src/users/dtos/create-user.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsAlpha,IsBoolean, IsStrongPassword } from "class-validator";
//import { UserRole } from "../enums/user-role.enum";

export class CreateUserDto {

  @ApiProperty({example:"jeanaulivan@gmail.com",required:true})
  @IsEmail({},{message:"L'email doit être valide"})
  email!: string;

  @ApiProperty({example:"password123",required:true})
  @IsStrongPassword({minLength:6},{message:"Le mot de passe n'est pas assez fort"})
  password!: string;

  @ApiProperty({example:"jeana",required:true})
  @IsAlpha(undefined,{message:"Le nom doit être une chaine de charactère valide"})
  name!: string;

  @ApiProperty({example:"https://www.image.com",required:true})
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  
}
