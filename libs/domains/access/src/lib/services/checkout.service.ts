import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { randomUUID } from 'crypto';

export type CheckoutPlanType = 'subscription' | 'location';

export interface CheckoutIntentPayload {
  planId: string;
  planType: CheckoutPlanType;
  target: 'me' | 'friend';
  friend?: { email?: string; accountId?: string };
  paymentMethod: 'card' | 'fedapay' | 'mobile_money';
  userId: string;
}

interface CheckoutIntent {
  id: string;
  planId: string;
  planType: CheckoutPlanType;
  target: 'me' | 'friend';
  friend?: { email?: string; accountId?: string };
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  userId: string;
}

@Injectable()
export class CheckoutService {
  private readonly intents = new Map<string, CheckoutIntent>();

  constructor(private readonly prisma: PrismaService) {}

  async createIntent(
    payload: CheckoutIntentPayload
  ): Promise<Omit<CheckoutIntent, 'userId'>> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: payload.planId },
    });

    const intent: CheckoutIntent = {
      id: randomUUID(),
      planId: payload.planId,
      planType: payload.planType,
      target: payload.target,
      friend: payload.friend,
      amount: plan?.price ?? 0,
      currency: 'XOF',
      status: 'pending',
      userId: payload.userId,
    };

    this.intents.set(intent.id, intent);
    return { ...intent, userId: undefined! };
  }

  async confirmIntent(
    intentId: string,
    paymentStatus: string
  ): Promise<{ status: 'paid' | 'failed'; subscriptionId?: string; rentalId?: string }> {
    const intent = this.intents.get(intentId);

    if (!intent) {
      throw new NotFoundException('Checkout intent not found');
    }

    if (paymentStatus !== 'paid' && paymentStatus !== 'succeeded') {
      intent.status = 'failed';
      return { status: 'failed' };
    }

    intent.status = 'paid';
    const targetUserId =
      intent.target === 'friend'
        ? intent.friend?.accountId ?? intent.userId
        : intent.userId;

    let subscriptionId: string | undefined;
    let rentalId: string | undefined;

    if (intent.planType === 'subscription') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const created = await this.prisma.subscription.create({
        data: {
          userId: targetUserId,
          planId: intent.planId,
          startDate: new Date(),
          endDate,
          renewalStatus: 'AUTO_RENEW',
          country: 'unknown',
        },
      });
      subscriptionId = created.id;
    } else {
      const movie = await this.prisma.movie.findUnique({
        where: { id: intent.planId },
      });

      if (movie) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 2);

        const created = await this.prisma.purchase.create({
          data: {
            userId: targetUserId,
            movieId: movie.id,
            country: 'unknown',
            expirationDate,
          },
        });
        rentalId = created.id;
      }
    }

    return { status: 'paid', subscriptionId, rentalId };
  }
}
