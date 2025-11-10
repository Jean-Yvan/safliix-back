import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PurchaseModule } from '../../purchase/purchase.module';
import { SubscriptionModule } from '../../subscription/subscription.module';

@Module({
  imports: [PurchaseModule, SubscriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
