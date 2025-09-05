
import { Subscription } from "../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../domain/ports/subscription.repository";
import { PrismaService } from "@safliix-back/database";
import { Injectable } from "@nestjs/common";
import { SubscriptionMapper } from "../domain/mappers/subscription.mapper";


@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {

  constructor(
    private readonly prisma : PrismaService
  ){}
  
  

  async create(subscription: Subscription): Promise<Subscription> {
    try {
      const prismaSub = SubscriptionMapper.toPrismaCreate(subscription);
      const created = await this.prisma.subscription.create({
        data: prismaSub,
        include:{
          user:true,
          plan:true
        }
      });
      return SubscriptionMapper.toDomain(created);
    } catch (error) {
      throw (error as Error);
    }
  }

  async update(id: string, subscription: Subscription): Promise<Subscription> {
    try {
      const data = {
        ...subscription,
        id
      };
      const prismaSub = SubscriptionMapper.toPrismaUpdate(data);
      if(prismaSub.isErr()){
        throw(prismaSub.unwrapErr());
      }
      const updated = await this.prisma.subscription.update({
        ...prismaSub.unwrap(),
        include:{
          user:true,
          plan:true,
        }
      });
      
      return SubscriptionMapper.toDomain(updated);
    } catch (error) {
      throw (error as Error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.subscription.delete({
        where: { id },
      });
      
    } catch (error) {
      throw error as Error;
    }
  }

  async findById(id: string): Promise<Subscription>{
    try {
      const found = await this.prisma.subscription.findUnique({
        where: { id },
        include:{
          user:true,
          plan:true
        }
      });
      if (!found) throw(new Error("Subscription not found"));
      return SubscriptionMapper.toDomain(found);
    } catch (error) {
      throw(error as Error);
    }
  }

  async findActiveByUser(userId: string): Promise<Subscription> {
    try {
      const found = await this.prisma.subscription.findFirst({
        where: {
          userId,
          createdAt: { gt: new Date() },
        },
        include:{
          user:true,plan:true
        }
      });
      if (!found) throw (new Error("Active subscription not found"));
      return SubscriptionMapper.toDomain(found);
    } catch (error) {
      throw (error as Error);
    }
  }

  async findExpired(): Promise<Subscription[]> {
    try {
      const expired = await this.prisma.subscription.findMany({
        where: {
          createdAt: { lt: new Date() },
        },
        include:{
          user:true,plan:true
        }
      });
      return expired.map(SubscriptionMapper.toDomain);
    } catch (error) {
      throw (error as Error);
    }
  }

  

    

  async isUserSubscribedToPlan(userId: string, planId: string): Promise<boolean> {
    try {
      const found = await this.prisma.subscription.findFirst({
        where: {
          userId,
          planId,
          createdAt: { gt: new Date() },
        },
      });
      return !!found;
    } catch (error) {
      throw error as Error;
    }
  }
}
  