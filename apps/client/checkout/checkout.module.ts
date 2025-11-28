import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { CheckoutController } from './checkout.controller';

@Module({
  imports: [CqrsModule, SafliixBackAccessModule],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
