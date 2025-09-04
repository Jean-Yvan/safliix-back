import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ListUserDto{

  @ApiProperty({example:"",required:false})
  @IsString({message:"Le statut doit ếtre une chaine de charactère"})
  @IsOptional()
  status?:string;
}