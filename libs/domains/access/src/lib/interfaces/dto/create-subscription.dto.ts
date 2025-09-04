import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateSubscriptionDto{

  @ApiProperty({example:"123456",required:true})
  @IsString({message:"L'id de l'utilisateur est obligatoire"})
  @IsNotEmpty({message:"L'id de l'utilisateur ne peut être vide"})
  userId!:string;

  @ApiProperty({example:"123456",required:true})
  @IsString({message:"L'id du type d'abonnement est obligatoire"})
  @IsNotEmpty({message:"L'id du type d'abonnement ne peut être vide"})
  planId!:string;

  @ApiProperty({example:"Bénin",required:true})
  @IsString({message:"Le pays de provenance doit être une chaine de charactère valide"})
  @IsOptional()
  country?:string;



}