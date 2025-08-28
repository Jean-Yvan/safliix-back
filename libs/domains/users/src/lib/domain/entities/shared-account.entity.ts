// domain/entities/shared-account.entity.ts
// import { SharedAccountStatus } from "../enums/shared-account-status.enum";

import { SharedAccountWithRelation } from "@safliix-back/database";
import { CreateSharedAccountDto } from "src/lib/interfaces/dto/create-shared-account.dto";

export class SharedAccount {
  private constructor(
    public readonly id: string | undefined,
    public readonly ownerUserId: string,
    public readonly subscriptionId: string,
    public readonly status: string,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  // Factory pour créer un nouveau SharedAccount
  static create(data: CreateSharedAccountDto): SharedAccount {
    return new SharedAccount(
      undefined,
      data.ownerUserId,
      data.subscriptionId,
      data.status ?? "PENDING", // tu peux utiliser SharedAccountStatus.PENDING si enum
      null,
      null,
    );
  }

  // Restore depuis la DB (Prisma ou autre source)
  static restore(data: SharedAccountWithRelation): SharedAccount {
    return new SharedAccount(
      data.id,
      data.ownerUserId,
      data.subscriptionId,
      data.status,
      data.createdAt ?? null,
      data.updatedAt ?? null,
    );
  }
}
