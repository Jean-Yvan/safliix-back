import { PartialType } from "@nestjs/mapped-types";
import { CreatePurchaseDto } from "./create-purchase.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto){

  @ApiProperty({example:"123456",required:true})
  @IsString({message:"L'id de la location est requis"})
  @IsNotEmpty({message:"L'id de la location est requis"})
  id!:string;

  @ApiProperty({ example: "2025-04-03T10:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString({},{message:"La date d'expiration n'est pas au bon format"})
  expirationDate?: string | null;
}
