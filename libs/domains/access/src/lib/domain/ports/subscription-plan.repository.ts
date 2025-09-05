  import { SubscriptionPlan } from "../entities/subscription-plan.entity";
  import { SubscriptionPlanWithRelation } from "@safliix-back/database";

  export interface ISubscriptionPlanRepository {
    getAll(): Promise<SubscriptionPlan[]>;
    getById(id: string): Promise<SubscriptionPlan>;
    getByName(name: string): Promise<SubscriptionPlan>;

    create(input: SubscriptionPlan): Promise<SubscriptionPlan>;
    update(id:string,input: SubscriptionPlan): Promise<SubscriptionPlan>;
    delete(id: string): Promise<void>;

    getPlansWithSubscriptions?(): Promise<SubscriptionPlanWithRelation[]>;
}
