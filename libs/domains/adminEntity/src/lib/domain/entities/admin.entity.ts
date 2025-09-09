import { Result, Err, Ok } from "oxide.ts";
import { AdminWithRelation } from "@safliix-back/database";
import { CreateAdminDto } from "../../interfaces/dto/create-admin.dto";
import { UpdateAdminDto } from "../../interfaces/dto/update-admin.dto";

export class AdminEntity {
  private constructor(
    public readonly id: string | undefined,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly country: string,
    public readonly city: string,
    public readonly state: string,
    public readonly phoneNumber: string,
    public readonly address: string,
    public readonly lastLoginAt: Date | null,
    public readonly isVerified: boolean
  ) {}

  // Création d'un admin
  static create(dto: CreateAdminDto): Result<AdminEntity, Error> {
    if (!dto.email) {
      return Err(new Error("L'email est obligatoire"));
    }
    if (!dto.password) {
      return Err(new Error("Le mot de passe est obligatoire"));
    }

    return Ok(
      new AdminEntity(
        undefined,
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.country,
        dto.city,
        dto.state ?? '',
        dto.phoneNumber ?? '',
        dto.address ?? '',
        null, // lastLoginAt vide à la création
        false // par défaut non vérifié
      )
    );
  }

  // Restauration depuis Prisma
  static restore(data: AdminWithRelation): AdminEntity {
    return new AdminEntity(
      data.id,
      data.email,
      data.password_hash,
      data.firstName,
      data.lastName,
      data.country,
      data.city,
      data.state,
      data.phoneNumber,
      data.address,
      data.lastLoginAt,
      data.isVerified
    );
  }

  // Mise à jour
  updateWith(dto: UpdateAdminDto): Result<AdminEntity, Error> {
    const newEmail = dto.email ?? this.email;
    const newPasswordHash = dto.password ?? this.passwordHash;
    const newFirstName = dto.firstName ?? this.firstName;
    const newLastName = dto.lastName ?? this.lastName;
    const newCountry = dto.country ?? this.country;
    const newCity = dto.city ?? this.city;
    const newState = dto.state ?? this.state;
    const newPhoneNumber = dto.phoneNumber ?? this.phoneNumber;
    const newAddress = dto.address ?? this.address;
    const newLastLoginAt = dto.lastLoginAt ?? this.lastLoginAt;
    const newIsVerified = dto.isVerified ?? this.isVerified;

    if (!newEmail) {
      return Err(new Error("L'email est obligatoire"));
    }
    if (!newPasswordHash) {
      return Err(new Error("Le mot de passe est obligatoire"));
    }

    return Ok(
      new AdminEntity(
        this.id,
        newEmail,
        newPasswordHash,
        newFirstName,
        newLastName,
        newCountry,
        newCity,
        newState,
        newPhoneNumber,
        newAddress,
        newLastLoginAt,
        newIsVerified
      )
    );
  }
}
