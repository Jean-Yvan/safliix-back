//import { SharedAccountStatus } from "../enums/shared-account-status.enum";

export class SharedAccount {
  constructor(
    public readonly id: string,
    public ownerUserId: string,
    public subscriptionId: string,
    public status : string,
    public sharedUserId?: string,
    public sharedOn: Date = new Date(),
    public isActive = true,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
