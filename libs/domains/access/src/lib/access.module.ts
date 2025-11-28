import { Module } from '@nestjs/common';
import { PrismaSubscriptionPlanRepository } from './infrastructure/prisma-subscription-plan.repository';
import { PrismaSubscriptionRepository } from './infrastructure/prisma-subscription.repository';
import { PrismaPurchaseRepository } from './infrastructure/prisma-purchase.repository';
import { SUBPLAN_REPOSITORY, SUBSCRIPTION_REPOSITORY, PURCHASE_REPOSITORY } from './utils/types';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { CheckoutService } from './services/checkout.service';

import { CreateSubscriptionPlanHandler } from './application/handlers/create-subscription-plan.handler';
import { UpdateSubscriptionPlanHandler } from './application/handlers/update-subscription-plan.handler';
import { DeleteSubscriptionPlanHandler } from './application/handlers/delete-subscription-plan.handler';

import { ListSubscriptionPlansHandler } from './application/handlers/list-subscription-plan.handler';
import { ListSubscriptionPlanByIdHandler } from './application/handlers/list-subscription-plan-by-id.handler';
import { ListSubscriptionPlanByNameHandler } from './application/handlers/list-subscription-plan-by-name.handler';
import { CreateSubscriptionHandler } from './application/handlers/create-subscription.handler';
import { UpdateSubscriptionHandler } from './application/handlers/update-subscription.handler';
import { DeleteSubscriptionHandler } from './application/handlers/delete-subscription.handler';
import { ListSubscriptionByIdHandler } from './application/handlers/list-subscription-by-id.handler';
import { ListActiveSubscriptionByUserHandler } from './application/handlers/list-active-subscription-by-user.handler';
import { ListExpiredSubscriptionsHandler } from './application/handlers/list-expired-subscription.handler';
import { IsUserSubscribedToPlanHandler } from './application/handlers/is-user-suscribe-plan.handler';
import { CreatePurchaseHandler } from './application/handlers/create-purchase.handler';
import { UpdatePurchaseHandler } from './application/handlers/update-purchase.handler';
import { DeletePurchaseHandler } from './application/handlers/delete-purchase.handler';
import { ListPurchaseByIdHandler } from './application/handlers/list-purchase-by-id.handler';
import { ListPurchasesByUserHandler } from './application/handlers/list-purchases-by-user.handler';
import { FindPurchaseByUserAndVideoHandler } from './application/handlers/find-purchase-by-user-and-video.handler';
import { ListExpiredPurchasesHandler } from './application/handlers/list-expired-purchases.handler';
import { ListPurchasesHandler } from './application/handlers/list-purchases.handler';


@Module({
  imports:[SafliixBackDatabaseModule],
  providers: [
    {
      provide:SUBPLAN_REPOSITORY,
      useClass: PrismaSubscriptionPlanRepository
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: PURCHASE_REPOSITORY,
      useClass: PrismaPurchaseRepository,
    },
    CreateSubscriptionPlanHandler,
    UpdateSubscriptionPlanHandler,
    DeleteSubscriptionPlanHandler,
    ListSubscriptionPlanByIdHandler,
    ListSubscriptionPlanByNameHandler,
    ListSubscriptionPlansHandler,
    CreateSubscriptionHandler,
    UpdateSubscriptionHandler,
    DeleteSubscriptionHandler,
    ListSubscriptionByIdHandler,
    ListActiveSubscriptionByUserHandler,
    ListExpiredSubscriptionsHandler,
    IsUserSubscribedToPlanHandler,
    CreatePurchaseHandler,
    UpdatePurchaseHandler,
    DeletePurchaseHandler,
    ListPurchaseByIdHandler,
    ListPurchasesByUserHandler,
    FindPurchaseByUserAndVideoHandler,
    ListExpiredPurchasesHandler,
    ListPurchasesHandler,
    CheckoutService
  ],
  exports: [
    CreateSubscriptionPlanHandler,
    UpdateSubscriptionPlanHandler,
    DeleteSubscriptionPlanHandler,
    ListSubscriptionPlanByIdHandler,
    ListSubscriptionPlanByNameHandler,
    ListSubscriptionPlansHandler,
    CreateSubscriptionHandler,
    UpdateSubscriptionHandler,
    DeleteSubscriptionHandler,
    ListSubscriptionByIdHandler,
    ListActiveSubscriptionByUserHandler,
    ListExpiredSubscriptionsHandler,
    IsUserSubscribedToPlanHandler,
    CreatePurchaseHandler,
    UpdatePurchaseHandler,
    DeletePurchaseHandler,
    ListPurchaseByIdHandler,
    ListPurchasesByUserHandler,
    FindPurchaseByUserAndVideoHandler,
    ListExpiredPurchasesHandler,
    ListPurchasesHandler,
    CheckoutService
  ],
})
export class SafliixBackAccessModule {}
