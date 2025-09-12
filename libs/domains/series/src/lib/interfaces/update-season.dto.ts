import { PartialType,ApiProperty } from "@nestjs/swagger";
import { AddSeasonDto } from "./add-season.dto";
import { IsString,IsNotEmpty } from "class-validator";

export class UpdateSeasonDto extends PartialType(AddSeasonDto){

  @ApiProperty({example:"1234",required:true})
  @IsString({message:"L'id est requis"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  id!:string;

}