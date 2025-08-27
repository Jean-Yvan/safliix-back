// libs/domains/src/users/dtos/create-email-validation.dto.ts
import { IsString, IsUUID, IsDate } from "class-validator";

export class CreateEmailValidationDto {

  @IsString()
  userId!: string;

  @IsUUID()
  token!: string;

  @IsDate()
  expiresAt!: Date;
}
