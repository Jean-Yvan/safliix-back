import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AdminRole } from "../../utils/types";

export class CreateAdminDto {
  @ApiProperty({ example: "admin@example.com", description: "Adresse email de l'administrateur" })
  @IsEmail({}, { message: "Email invalide" })
  email!: string;

  @ApiProperty({ example: "2b0d9181-e9c5-4e0d-9efc-9e76c5e9e1f5", description: "Identifiant Keycloak associé", required: false })
  @IsString()
  @IsOptional()
  keycloakId?: string;

  @ApiProperty({ example: "hashedpassword123", description: "Mot de passe hashé" })
  @IsString()
  @IsNotEmpty({ message: "Le mot de passe est obligatoire" })
  password!: string;

  @ApiProperty({ example: "Jean", description: "Prénom de l'administrateur" })
  @IsString()
  @IsNotEmpty({ message: "Le prénom est obligatoire" })
  firstName!: string;

  @ApiProperty({ example: "Dupont", description: "Nom de famille de l'administrateur" })
  @IsString()
  @IsNotEmpty({ message: "Le nom est obligatoire" })
  lastName!: string;

  @ApiProperty({ example: "Bénin", description: "Pays de l'administrateur" })
  @IsString()
  @IsNotEmpty({ message: "Le pays est obligatoire" })
  country!: string;

  @ApiProperty({ example: "Cotonou", description: "Ville de l'administrateur" })
  @IsString()
  @IsNotEmpty({ message: "La ville est obligatoire" })
  city!: string;

  @ApiProperty({ example: "Atlantique", description: "État ou région" })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: "+22961234567", description: "Numéro de téléphone" })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: "10 rue des Fleurs", description: "Adresse de résidence" })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: AdminRole.SUPER_ADMIN, enum: AdminRole, required: false })
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
