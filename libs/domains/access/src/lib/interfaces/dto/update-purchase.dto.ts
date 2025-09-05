import { PartialType } from "@nestjs/mapped-types";
import { CreatePurchaseDto } from "./create-purchase.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto){

  @ApiProperty({example:"123456",required:true})
  @IsString({message:"L'id de la location est requis"})
  @IsNotEmpty({message:"L'id de la location est requis"})
  id!:string;
}