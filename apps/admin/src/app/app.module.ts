import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@safliix-back/api';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';
import { SafliixBackBullmqModule } from '@safliix-back/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionModule } from './subscription/subscription.module';
import { AdminConnectModule } from './adminConnect/admin-connect.module';
import { SerieModule } from './serie/serie.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    SafliixBackBullmqModule.forRoot(),
    MoviesModule,
    UsersModule,
    SubscriptionModule,
    AdminConnectModule,
    SerieModule,
    VideosModule,
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
