import { AdminEntity } from '../entities/admin.entity';
import { CreateToPrisma, UpdateToPrisma, AdminWithRelation } from '@safliix-back/database';
import { mapField } from '@safliix-back/common';

export class AdminMapper {
  static toDomain(data: AdminWithRelation): AdminEntity {
    return AdminEntity.restore(data);
  }

  static toCreatePrisma(data: AdminEntity): CreateToPrisma<'Admin'> {
    return {
      email: data.email,
      password_hash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
      city: data.city,
      state: data.state,
      phoneNumber: data.phoneNumber,
      address: data.address,
      lastLoginAt: data.lastLoginAt,
      isVerified: data.isVerified,
    };
  }

  static toUpdatePrisma(id: string, data: AdminEntity): UpdateToPrisma<'Admin'> {
    return {
      where: { id },
      data: {
        email: mapField(data.email),
        password_hash: mapField(data.passwordHash),
        firstName: mapField(data.firstName),
        lastName: mapField(data.lastName),
        country: mapField(data.country),
        city: mapField(data.city),
        state: mapField(data.state),
        phoneNumber: mapField(data.phoneNumber),
        address: mapField(data.address),
        lastLoginAt: mapField(data.lastLoginAt),
        isVerified: mapField(data.isVerified),
      },
    };
  }
}
