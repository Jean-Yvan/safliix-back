import { Result, Err, Ok } from 'oxide.ts';
import { AdminWithRelation } from '@safliix-back/database';
import { CreateAdminDto } from '../../interfaces/dto/create-admin.dto';
import { UpdateAdminDto } from '../../interfaces/dto/update-admin.dto';
import { AdminRole } from '../../utils/types';

export class AdminEntity {
  private constructor(
    public readonly id: string | undefined,
    public readonly keycloakId: string | null,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly country: string,
    public readonly city: string,
    public readonly state: string | null,
    public readonly phoneNumber: string | null,
    public readonly address: string | null,
    public readonly lastLoginAt: Date | null,
    public readonly isVerified: boolean,
    public readonly isActive: boolean,
    public readonly permissions: string[],
    public readonly role: AdminRole,
  ) {}

  static create(dto: CreateAdminDto): Result<AdminEntity, Error> {
    if (!dto.email) {
      return Err(new Error("L'email est obligatoire"));
    }

    return Ok(
      new AdminEntity(
        undefined,
        dto.keycloakId ?? null,
        dto.email,
        dto.firstName,
        dto.lastName,
        dto.country,
        dto.city,
        dto.state ?? null,
        dto.phoneNumber ?? null,
        dto.address ?? null,
        null,
        false,
        true,
        [],
        dto.role ?? AdminRole.ADMIN,
      ),
    );
  }

  static restore(data: AdminWithRelation): AdminEntity {
    return new AdminEntity(
      data.id,
      data.keycloakId ?? null,
      data.email,
      data.firstName,
      data.lastName,
      data.country,
      data.city,
      data.state ?? null,
      data.phoneNumber ?? null,
      data.address ?? null,
      data.lastLoginAt,
      data.isVerified,
      data.isActive,
      data.permissions ?? [],
      data.role as AdminRole,
    );
  }

  updateWith(dto: UpdateAdminDto): Result<AdminEntity, Error> {
    const newEmail = dto.email ?? this.email;
    const newFirstName = dto.firstName ?? this.firstName;
    const newLastName = dto.lastName ?? this.lastName;
    const newCountry = dto.country ?? this.country;
    const newCity = dto.city ?? this.city;
    const newState = dto.state ?? this.state;
    const newPhoneNumber = dto.phoneNumber ?? this.phoneNumber;
    const newAddress = dto.address ?? this.address;
    const newLastLoginAt = dto.lastLoginAt ? new Date(dto.lastLoginAt) : this.lastLoginAt;
    const newIsVerified = dto.isVerified ?? this.isVerified;
    const newIsActive = dto.isActive ?? this.isActive;
    const newPermissions = dto.permissions ?? this.permissions;
    const newRole = dto.role ?? this.role;
    const newKeycloakId = dto.keycloakId ?? this.keycloakId;

    if (!newEmail) {
      return Err(new Error("L'email est obligatoire"));
    }

    return Ok(
      new AdminEntity(
        this.id,
        newKeycloakId ?? null,
        newEmail,
        newFirstName,
        newLastName,
        newCountry,
        newCity,
        newState ?? null,
        newPhoneNumber ?? null,
        newAddress ?? null,
        newLastLoginAt,
        newIsVerified,
        newIsActive,
        newPermissions,
        newRole,
      ),
    );
  }
}
