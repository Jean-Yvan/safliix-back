import { PartialType } from "@nestjs/mapped-types";
import { CreateSubscriptionDto } from "./create-subscription.dto";
import { IsString,IsNotEmpty, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto){

  @ApiProperty()
  @IsNotEmpty({message:"L'id ne doit pas être vide"})
  @IsString({message:"L'id doit être une chaine de charactère"})
  id!:string;

  @ApiProperty({example:"2025-04-03",required:false})
  @IsDateString({},{message:"La date de démarrage n'est pas au bon format"})
  startDate?:string;

  @ApiProperty({example:"2025-04-03",required:false})
  @IsDateString({},{message:"La date de démarrage n'est pas au bon format"})
  endDate?:string;

  @ApiProperty({example:"2025-04-03",required:false})
  @IsString({message:"La date de démarrage n'est pas au bon format"})
  renewalStatus?:string;




}