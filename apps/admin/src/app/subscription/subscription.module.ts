import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { AdminSubscriptionController } from './subscription.controller';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports:[
    CqrsModule,
    SafliixBackAccessModule,
    SafliixBackDatabaseModule
  ],
  controllers:[AdminSubscriptionController, SubscriptionsController]
})
export class SubscriptionModule {}
