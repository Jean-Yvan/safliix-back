import { PartialType } from '@nestjs/swagger';
import { CreateAdDto } from './create-ad.dto';
import { IsString } from 'class-validator';

export class UpdateAdDto extends PartialType(CreateAdDto){

  @IsString()
  id!: string;
}