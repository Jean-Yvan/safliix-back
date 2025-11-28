import { PrismaService, SubscriptionPlanWithRelation } from "@safliix-back/database";
import { SubscriptionPlan } from "../domain/entities/subscription-plan.entity";
import { ISubscriptionPlanRepository } from "../domain/ports/subscription-plan.repository";
import { Err } from 'oxide.ts';
import { SubscriptionPlanMapper } from "../domain/mappers/subscription-plan.mapper";
import { Injectable } from "@nestjs/common";


@Injectable()
export class PrismaSubscriptionPlanRepository implements ISubscriptionPlanRepository {

  constructor(
    private readonly prisma: PrismaService
  ){}
  async getAll(): Promise<SubscriptionPlan[]> {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany({
        include:{
          subscriptions:true
        }
      });
      return plans.map((item) => SubscriptionPlanMapper.toDomain(item));
    } catch (e) {
      throw (e as Error);
    }
  }

  async getById(id: string): Promise<SubscriptionPlan> {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id },include:{subscriptions:true} });
      if (!plan) throw new Error("SubscriptionPlan not found");
      return SubscriptionPlanMapper.toDomain(plan);
    } catch (e) {
      throw(e as Error);
    }
  }

  async getByName(name: string): Promise<SubscriptionPlan> {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { name },include:{ subscriptions:true} });
      if (!plan) throw new Error("SubscriptionPlan not found");
      return SubscriptionPlanMapper.toDomain(plan);
    } catch (e) {
      throw Err(e as Error);
    }
  }

  async create(input: SubscriptionPlan): Promise<SubscriptionPlan> {
    try {
      const prismaPlan = SubscriptionPlanMapper.toPrismaCreate(input);
      const created = await this.prisma.subscriptionPlan.create({
        data: prismaPlan,
        include:{
          subscriptions:true
        }
      }
    
    );
      return SubscriptionPlanMapper.toDomain(created);
    } catch (e) {
      throw(e as Error);
    }
  }

  async update(id:string,input: SubscriptionPlan): Promise<SubscriptionPlan> {
    try {
      const partialPlan: Partial<SubscriptionPlan> & { id: string } = {
        id: id,       // id est obligatoire
        name: input.name,   // les autres champs sont optionnels grâce à Partial
        price: input.price,
      };
      const plan = SubscriptionPlanMapper.toPrismaUpdate(partialPlan);
      if(plan.isErr()){
        throw (plan.unwrapErr());
      }
      const updated = await this.prisma.subscriptionPlan.update({...plan.unwrap(),include:{subscriptions:true}});
      return SubscriptionPlanMapper.toDomain(updated);
    } catch (e) {
      throw Err(e as Error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.subscriptionPlan.delete({ where: { id } });
    } catch (e) {
      throw(e as Error);
    }
  }

  async getPlansWithSubscriptions?(): Promise<SubscriptionPlanWithRelation[]> {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany({
        include: { subscriptions: true },
      });
      return plans as SubscriptionPlanWithRelation[];
    } catch (e) {
      throw(e as Error);
    }
  }
}
  