import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PurchaseModule } from '../../purchase/purchase.module';
import { SubscriptionModule } from '../../subscription/subscription.module';
import { ViewTrackingModule } from '../../viewTracking/view-tracking.module';
import { ProfileModule } from '../../profile/profile.module';

@Module({
  imports: [PurchaseModule, SubscriptionModule, ViewTrackingModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
