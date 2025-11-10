import { Result } from "oxide.ts";
import { Subscription } from "../entities/subscription.entity";

export interface ISubscriptionRepository {
  create(subscription: Subscription): Promise<Result<Subscription, Error>>;

  update(id: string, subscription: Partial<Subscription>): Promise<Result<Subscription, Error>>;

  delete(id: string): Promise<Result<boolean, Error>>;

  findById(id: string): Promise<Result<Subscription, Error>>;

  findActiveByUser(userId: string): Promise<Result<Subscription, Error>>;

  findExpired(): Promise<Result<Subscription[], Error>>;

  isUserSubscribedToPlan(userId: string, planId: string): Promise<Result<boolean, Error>>;

  getMaxStreamsByAccountId(accountId: string): Promise<Result<number, Error>>
}
