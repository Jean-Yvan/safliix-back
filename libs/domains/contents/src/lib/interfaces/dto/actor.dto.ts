import { ApiProperty } from "@nestjs/swagger";
import { IsUUID,IsOptional,IsString,IsNotEmpty } from "class-validator"

export class ActorDto {
  @ApiProperty({ required: false, description: "ID de l'acteur s'il existe déjà" })
  @IsUUID()
  @IsOptional()
  actorId?: string;

  @ApiProperty({ description: "Nom de l'acteur" })
  @IsString()
  @IsNotEmpty()
  name!: string;
}