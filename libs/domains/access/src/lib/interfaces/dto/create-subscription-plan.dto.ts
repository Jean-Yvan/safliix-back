import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class CreateSubscriptionPlanDto{

  @ApiProperty({example:"premium",required:true})
  @IsString({message:"Le nom du type d'abonnement doit être une chaine de charactère"})
  @IsNotEmpty({message:"Le nom du type d'abonnement est requis"})
  name!:string;

  @ApiProperty({example:"20000",required:true})
  @IsInt({message:"Le prix du type d'abonnement doit être un nombre"})
  price!:number;

  @ApiProperty({example:"2",required:true})
  @IsInt({message:"Le nombre d'écran partagé pour ce plan doit être un entier"})
  maxSharedAccounts!:number;

}