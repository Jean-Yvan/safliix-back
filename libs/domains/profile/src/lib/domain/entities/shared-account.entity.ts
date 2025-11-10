// domain/entities/shared-account.entity.ts
import { SharedAccountWithRelation } from "@safliix-back/database";
import { SharedAccountStatus } from "../enums/shared-account-status.enum";

export type SharedAccountProps = {
  ownerUserId: string;
  subscriptionId: string;
  status?: SharedAccountStatus;
};

export class SharedAccount {
  private constructor(
    public readonly id: string | undefined,
    public readonly ownerUserId: string,
    public readonly status: SharedAccountStatus,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  // Factory pour créer un nouveau SharedAccount
  static create(props: SharedAccountProps): SharedAccount {
    return new SharedAccount(
      undefined,
      props.ownerUserId,
      props.status ?? SharedAccountStatus.PENDING,
      null,
      null,
    );
  }

  // Restore depuis la DB (Prisma ou autre source)
  static restore(data: SharedAccountWithRelation): SharedAccount {
    return new SharedAccount(
      data.id,
      data.ownerUserId,
      data.status as SharedAccountStatus,
      data.createdAt ?? null,
      data.updatedAt ?? null,
    );
  }
}
