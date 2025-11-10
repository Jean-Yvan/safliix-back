import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { ClientSubscriptionController } from './subscription.controller';

@Module({
  imports: [CqrsModule, SafliixBackAccessModule],
  controllers: [ClientSubscriptionController],
})
export class SubscriptionModule {}
