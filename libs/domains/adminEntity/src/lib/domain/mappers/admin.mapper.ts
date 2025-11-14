import { AdminEntity } from '../entities/admin.entity';
import { CreateToPrisma, UpdateToPrisma, AdminWithRelation } from '@safliix-back/database';
import { mapField } from '@safliix-back/common';

export class AdminMapper {
  static toDomain(data: AdminWithRelation): AdminEntity {
    return AdminEntity.restore(data);
  }

  static toCreatePrisma(data: AdminEntity): CreateToPrisma<'Admin'> {
    return {
      keycloakId: data.keycloakId ?? undefined,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
      city: data.city,
      state: data.state ?? undefined,
      phoneNumber: data.phoneNumber ?? undefined,
      address: data.address ?? undefined,
      lastLoginAt: data.lastLoginAt,
      isVerified: data.isVerified,
      isActive: data.isActive,
      permissions: data.permissions,
      role: data.role as any,
    };
  }

  static toUpdatePrisma(id: string, data: AdminEntity): UpdateToPrisma<'Admin'> {
    return {
      where: { id },
      data: {
        keycloakId: mapField(data.keycloakId ?? undefined),
        email: mapField(data.email),
        firstName: mapField(data.firstName),
        lastName: mapField(data.lastName),
        country: mapField(data.country),
        city: mapField(data.city),
        state: mapField(data.state),
        phoneNumber: mapField(data.phoneNumber),
        address: mapField(data.address),
        lastLoginAt: mapField(data.lastLoginAt),
        isVerified: mapField(data.isVerified),
        isActive: mapField(data.isActive),
        permissions: mapField(data.permissions),
        role: mapField(data.role as any),
      },
    };
  }
}
