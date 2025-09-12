import { ApiProperty, PartialType } from "@nestjs/swagger";
import { AddEpisodeDto } from "./add-episode.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateEpisodeDto extends PartialType(AddEpisodeDto){

  @ApiProperty({example:"1234",required:true})
  @IsString({message:"L'id est obligatoire"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  id!:string;
}