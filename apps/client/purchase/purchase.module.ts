import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { ClientPurchaseController } from './purchase.controller';

@Module({
  imports: [CqrsModule, SafliixBackAccessModule],
  controllers: [ClientPurchaseController],
})
export class PurchaseModule {}
