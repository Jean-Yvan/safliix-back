import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { AdminSubscriptionController } from './subscription.controller';

@Module({
  imports:[
    CqrsModule,
    SafliixBackAccessModule
  ],
  controllers:[AdminSubscriptionController]
})
export class SubscriptionModule {}
