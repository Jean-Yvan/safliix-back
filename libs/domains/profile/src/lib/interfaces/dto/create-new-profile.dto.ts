import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString,IsUrl } from 'class-validator';

export class CreateNewProfileDto{

  @ApiProperty({example:"Name of profile", description:"Name of profile", required:true})
  @IsString({message:"Le nom de profile est une chaine de charatère"})
  @IsNotEmpty({message:"Le nom de profile ne doit pas être vide"})
  profileName!:string;

  @ApiProperty({example:"13456",description:"Code for login",required:true})
  @IsInt({message:"Le code pin doit être un nombre"})
  pinCode!:number;

  @ApiProperty({example:"http://www.s3.com",description:"Link for the avatar image"})
  @IsUrl({},{message:"Le lien n'est pas valide"})
  avatarUrl?:string;

  @ApiProperty({example:"sdjksjd-ksdkd-ksd",description:"Id of account"})
  @IsString({message:"L'id doit être une chaine de caractère"})
  @IsNotEmpty({message:"L'id du compte partagé ne peut être vide"})
  shareAccountId!:string;

  @ApiProperty({example:"true",description:"property show if the account is for kid"})
  @IsBoolean({message:"La propriété doit être un booléen"})
  @IsOptional()
  isKidProfile?:boolean;

}