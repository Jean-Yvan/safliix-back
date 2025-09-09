import { Module } from '@nestjs/common';
import { PrismaSubscriptionPlanRepository } from './infrastructure/prisma-subscription-plan.repository';
import { SUBPLAN_REPOSITORY } from './utils/types';
import { SafliixBackDatabaseModule } from '@safliix-back/database';

import { CreateSubscriptionPlanHandler } from './application/handlers/create-subscription-plan.handler';
import { UpdateSubscriptionPlanHandler } from './application/handlers/update-subscription-plan.handler';
import { DeleteSubscriptionPlanHandler } from './application/handlers/delete-subscription-plan.handler';

import { ListSubscriptionPlansHandler } from './application/handlers/list-subscription-plan.handler';
import { ListSubscriptionPlanByIdHandler } from './application/handlers/list-subscription-plan-by-id.handler';
import { ListSubscriptionPlanByNameHandler } from './application/handlers/list-subscription-plan-by-name.handler';


@Module({
  imports:[SafliixBackDatabaseModule],
  providers: [
    {
      provide:SUBPLAN_REPOSITORY,
      useClass: PrismaSubscriptionPlanRepository
    },
    CreateSubscriptionPlanHandler,
    UpdateSubscriptionPlanHandler,
    DeleteSubscriptionPlanHandler,
    ListSubscriptionPlanByIdHandler,
    ListSubscriptionPlanByNameHandler,
    ListSubscriptionPlansHandler
  ],
  exports: [
    CreateSubscriptionPlanHandler,
    UpdateSubscriptionPlanHandler,
    DeleteSubscriptionPlanHandler,
    ListSubscriptionPlanByIdHandler,
    ListSubscriptionPlanByNameHandler,
    ListSubscriptionPlansHandler
  ],
})
export class SafliixBackAccessModule {}
