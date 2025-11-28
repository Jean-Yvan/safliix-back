import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PurchaseModule } from '../../purchase/purchase.module';
import { SubscriptionModule } from '../../subscription/subscription.module';
import { ViewTrackingModule } from '../../viewTracking/view-tracking.module';
import { ProfileModule } from '../../profile/profile.module';
import { AuthModule } from '../../auth/auth.module';
import { CatalogModule } from '../../catalog/catalog.module';
import { ContentModule } from '../../content/content.module';
import { InteractionsModule } from '../../interactions/interactions.module';
import { CheckoutModule } from '../../checkout/checkout.module';
import { UserModule } from '../../user/user.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PurchaseModule,
    SubscriptionModule,
    ViewTrackingModule,
    ProfileModule,
    AuthModule,
    CatalogModule,
    ContentModule,
    InteractionsModule,
    CheckoutModule,
    UserModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
