import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectProfileDto {
  @ApiProperty({
    description: 'Identifiant du profil à activer pour la session',
  })
  @IsString()
  @IsNotEmpty()
  profileId!: string;
}
