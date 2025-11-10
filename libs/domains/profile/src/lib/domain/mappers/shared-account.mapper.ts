// domain/mappers/shared-account.mapper.ts
import { CreateToPrisma, SharedAccountWithRelation, UpdateToPrisma } from "@safliix-back/database";
import { SharedAccount } from "../entities/shared-account.entity";
import { mapConnect, mapField } from "@safliix-back/common";


export class SharedAccountMapper {
  // Mapper Prisma → Entité Domain
  static toDomain(data: SharedAccountWithRelation): SharedAccount {
    return SharedAccount.restore(data);
  }

  // Mapper Entité Domain → Prisma
  static toPrismaCreate(entity: SharedAccount): CreateToPrisma<"SharedAccount"> {
    return {
      id: entity.id,
      owner:mapConnect(entity.ownerUserId),
      status: "ACCEPTED",
    };
  }

  static toPrismaUpdate(id:string,entity:Partial<SharedAccount>): UpdateToPrisma<"SharedAccount">{
    return {
      where : {
        id
      },
      data: {
        status:mapField(entity.status)
      }
    }
  }
}
