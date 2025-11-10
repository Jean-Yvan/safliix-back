
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@safliix-back/database";
import { Result, Ok, Err } from "oxide.ts";

import { Subscription } from "../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../domain/ports/subscription.repository";
import { SubscriptionMapper } from "../domain/mappers/subscription.mapper";

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}


  async getMaxStreamsByAccountId(accountId: string): Promise<Result<number, Error>> {
    try {
      const now = new Date();

      // 1. Trouver l'abonnement ACTIF du User (le plus récent ou avec la endDate la plus lointaine)
      const activeSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: accountId, // Lien direct : L'ID de l'abonnement appartient à l'ID du User
          endDate: {
            gt: now, // CRITÈRE D'ACTIVITÉ : L'abonnement doit être en cours
          },
        },
        select: {
          plan: {
            select: {
              maxSharedAccounts: true, // 🔑 La donnée cible
            },
          },
        },
        // Prend l'abonnement dont la fin est la plus éloignée (le plus "actif")
        orderBy: {
          endDate: 'desc', 
        }
      });

      const maxStreams = activeSubscription?.plan?.maxSharedAccounts;

      if (maxStreams === undefined || maxStreams === null) {
        return Err(new Error(`No active subscription found or plan limit is missing for account ID: ${accountId}.`));
      }

      return Ok(maxStreams);
      
    } catch (e) {
      return Err(e instanceof Error ? e : new Error(`Database error fetching active stream limit: ${String(e)}`));
    }
  }

  async create(subscription: Subscription): Promise<Result<Subscription, Error>> {
    try {
      const prismaSub = SubscriptionMapper.toPrismaCreate(subscription);
      const created = await this.prisma.subscription.create({
        data: prismaSub,
        include: {
          user: true,
          plan: true,
        },
      });
      return Ok(SubscriptionMapper.toDomain(created));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(id: string, subscription: Partial<Subscription>): Promise<Result<Subscription, Error>> {
    try {
      const data = { ...subscription, id };
      const prismaSub = SubscriptionMapper.toPrismaUpdate(data);
      if (prismaSub.isErr()) {
        return Err(prismaSub.unwrapErr());
      }

      const updated = await this.prisma.subscription.update({
        ...prismaSub.unwrap(),
        include: {
          user: true,
          plan: true,
        },
      });

      return Ok(SubscriptionMapper.toDomain(updated));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async delete(id: string): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.subscription.delete({
        where: { id },
      });
      return Ok(true);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findById(id: string): Promise<Result<Subscription, Error>> {
    try {
      const found = await this.prisma.subscription.findUnique({
        where: { id },
        include: {
          user: true,
          plan: true,
        },
      });
      if (!found) {
        return Err(new Error("Subscription not found"));
      }
      return Ok(SubscriptionMapper.toDomain(found));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findActiveByUser(userId: string): Promise<Result<Subscription, Error>> {
    try {
      const now = new Date();
      const found = await this.prisma.subscription.findFirst({
        where: {
          userId,
          endDate: { gt: now },
        },
        orderBy: {
          endDate: "desc",
        },
        include: {
          user: true,
          plan: true,
        },
      });
      if (!found) {
        return Err(new Error("Active subscription not found"));
      }
      return Ok(SubscriptionMapper.toDomain(found));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findExpired(): Promise<Result<Subscription[], Error>> {
    try {
      const now = new Date();
      const expired = await this.prisma.subscription.findMany({
        where: {
          endDate: { lte: now },
        },
        include: {
          user: true,
          plan: true,
        },
      });
      const domain = expired.map((item) => SubscriptionMapper.toDomain(item));
      return Ok(domain);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async isUserSubscribedToPlan(userId: string, planId: string): Promise<Result<boolean, Error>> {
    try {
      const now = new Date();
      const found = await this.prisma.subscription.findFirst({
        where: {
          userId,
          planId,
          endDate: { gt: now },
        },
      });
      return Ok(!!found);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
