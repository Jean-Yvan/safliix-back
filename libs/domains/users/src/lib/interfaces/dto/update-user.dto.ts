import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto){
  @IsString({message:"L'id de l'utilisateur est obligatoire"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  id!:string;
}