import { ActiveStream } from "../entities/active-stream.entity";

export interface ActiveStreamRepository {
  findByProfileId(profileId: string): Promise<ActiveStream | null>;
  findActiveByProfileId(
    profileId: string,
    referenceDate?: Date
  ): Promise<ActiveStream | null>;
  countActiveByAccount(
    accountId: string,
    referenceDate?: Date
  ): Promise<number>;
  save(stream: ActiveStream): Promise<ActiveStream>;
  deleteByProfileId(profileId: string): Promise<void>;
  deleteExpired(referenceDate?: Date): Promise<number>;
}
