import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateSharedAccountDto{

  @ApiProperty({example:"dsd-dffd-dfdf",required:true})
  @IsString({message:"L'id de l'utilisateur est une chaine de charactère"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  ownerUserId!:string;

  @ApiProperty({example:"dsd-dffd-dfdf",required:true})
  @IsString({message:"L'id de l'abonnement est une chaine de charactère"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  subscriptionId!:string;

  @ApiProperty({example:"PENDING",required:true})
  @IsDate({message:"Le status du compte est requis"})
  status!:string;

}