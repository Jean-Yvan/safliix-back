import { PartialType } from "@nestjs/swagger";
import { CreateSerieDto } from "./create-serie.dto";
import { IsString,IsNotEmpty } from "class-validator";

export class UpdateSerieDto extends PartialType(CreateSerieDto) {
  @IsString({message:"L'id de la série est obligatoire"})
  @IsNotEmpty({message:"L'id ne peut être vide"})
  id!:string;
}