import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateAdHandler } from './application/handlers/commands/create-ad.handler';
import { UpdateAdHandler } from './application/handlers/commands/update-ad.handler';
import { DeleteAdHandler } from './application/handlers/commands/delete-ad.handler';
import { ActivateAdHandler } from './application/handlers/commands/activate-ad.handler';
import { DeactivateAdHandler } from './application/handlers/commands/deactivate-ad.handler';
import { TrackAdViewHandler } from './application/handlers/commands/track-ad-view.handler';
import { FindAdByIdHandler } from './application/handlers/queries/find-ad-by-id.handler';
import { FindAllAdsHandler } from './application/handlers/queries/find-all-ads.handler';
import { FindActiveAdsHandler } from './application/handlers/queries/find-active-ads.handler';
import { FindExpiredAdsHandler } from './application/handlers/queries/find-expired-ads.handler';
import { GetAdViewsHandler } from './application/handlers/queries/get-ad-views.handler';
import { GetAdViewsCountHandler } from './application/handlers/queries/get-ad-views-count.handler';
import { GetAdStatisticsHandler } from './application/handlers/queries/get-ad-statistics.handler';
import { PrismaAdRepository } from './infrastructure/repositories/prisma-ad.repository';
import { PrismaAdViewRepository } from './infrastructure/repositories/prisma-ad-view.repository';
import { AD_REPOSITORY, AD_VIEW_REPOSITORY } from './utils/ad.tokens';

const commandHandlers = [
  CreateAdHandler,
  UpdateAdHandler,
  DeleteAdHandler,
  ActivateAdHandler,
  DeactivateAdHandler,
  TrackAdViewHandler,
];

const queryHandlers = [
  FindAdByIdHandler,
  FindAllAdsHandler,
  FindActiveAdsHandler,
  FindExpiredAdsHandler,
  GetAdViewsHandler,
  GetAdViewsCountHandler,
  GetAdStatisticsHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: AD_REPOSITORY, useClass: PrismaAdRepository },
    { provide: AD_VIEW_REPOSITORY, useClass: PrismaAdViewRepository },
  ],
  exports: [...commandHandlers, ...queryHandlers],
})
export class SafliixBackAdModule {}
