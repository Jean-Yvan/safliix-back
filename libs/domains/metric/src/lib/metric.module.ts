import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { PlatformAnalyticsService } from './application/services/platform-analytics.service';
import { MovieAnalyticsService } from './application/services/movie-analytics.service';
import { AdAnalyticsService } from './application/services/ad-analytics.service';
import { PrismaVideoViewRepository } from './infrastructure/prisma-video-view.repository';
import { VIDEO_VIEW_REPOSITORY } from './utils/tokens';

@Module({
  imports: [SafliixBackDatabaseModule],
  providers: [
    PlatformAnalyticsService,
    MovieAnalyticsService,
    AdAnalyticsService,
    PrismaVideoViewRepository,
    {
      provide: VIDEO_VIEW_REPOSITORY,
      useExisting: PrismaVideoViewRepository,
    },
  ],
  exports: [
    PlatformAnalyticsService,
    MovieAnalyticsService,
    AdAnalyticsService,
    PrismaVideoViewRepository,
    VIDEO_VIEW_REPOSITORY,
  ],
})
export class SafliixBackMetricDomainModule {}
