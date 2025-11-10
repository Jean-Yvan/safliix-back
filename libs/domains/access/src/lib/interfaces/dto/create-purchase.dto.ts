import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsOptional } from "class-validator";


export class CreatePurchaseDto{
  @ApiProperty({example:"1sd12",required:true})
  @IsString({message:"L'id de l'utilsateur est une chaine de charactère"})
  @IsNotEmpty({message:"L'id de l'utilsateur ne peut être vide"})
  userId!:string;

  @ApiProperty({example:"1sd12",required:true})
  @IsString({message:"L'id du film est une chaine de charactère"})
  @IsNotEmpty({message:"L'id du film ne peut être vide"})
  videoId!:string;

  @ApiProperty({example:"Bénin",required:false})
  @IsOptional()
  @IsString({message:"Le pays est une chaine de charactère"})
  country?:string;


}
