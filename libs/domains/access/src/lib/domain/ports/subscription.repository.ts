
import { Subscription } from "../entities/subscription.entity";


export interface ISubscriptionRepository {
  create(subscription: Subscription): Promise<Subscription>;

  update(id: string, subscription: Partial<Subscription>): Promise<Subscription>;

  delete(id: string): Promise<void>;

  findById(id: string): Promise<Subscription>;

  findActiveByUser(userId: string): Promise<Subscription>

  findExpired(): Promise<Subscription[]>

  //cancel(id: string): Promise<void>

  //renew(id: string, newEndDate: Date): Promise<Subscription>

  isUserSubscribedToPlan(userId: string, planId: string): Promise<boolean>

}