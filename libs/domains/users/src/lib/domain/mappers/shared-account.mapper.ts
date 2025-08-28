// domain/mappers/shared-account.mapper.ts
import { SharedAccount } from "../entities/shared-account.entity";


export class SharedAccountMapper {
  // Mapper Prisma → Entité Domain
  static toDomain(prisma: any): SharedAccount {
    return SharedAccount.restore({
      id: prisma.id,
      ownerUserId: prisma.ownerUserId,
      subscriptionId: prisma.subscriptionId,
      status: prisma.status, // ou SharedAccountStatus[prisma.status] si enum
      sharedUserId: prisma.sharedUserId ?? undefined,
      sharedOn: prisma.sharedOn,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  // Mapper Entité Domain → Prisma
  static toPrisma(entity: SharedAccount): any {
    return {
      id: entity.id,
      ownerUserId: entity.ownerUserId,
      subscriptionId: entity.subscriptionId,
      status: entity.status, // ou entity.status.value si enum
      sharedUserId: entity.sharedUserId ?? null,
      sharedOn: entity.sharedOn,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
