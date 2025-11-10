// src/auth/interfaces/dto/profile-pin-login.dto.ts

import { IsString, IsInt, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfilePinLoginDto {
  @ApiProperty({ description: 'ID du compte utilisateur principal (payeur)' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Nom du profil à connecter' })
  @IsString()
  @IsNotEmpty()
  profileName!: string;

  @ApiProperty({ description: 'Code PIN en clair du profil' })
  @IsInt()
  @IsNotEmpty()
  pinCode!: number;
}