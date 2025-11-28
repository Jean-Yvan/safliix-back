import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { PlatformAnalyticsService } from './application/services/platform-analytics.service';
import { MovieAnalyticsService } from './application/services/movie-analytics.service';
import { AdAnalyticsService } from './application/services/ad-analytics.service';

import { VIDEO_VIEW_REPOSITORY } from './utils/tokens';
import {
  GetAdsStatsByIdHandler,
  GetAdsStatsHandler,
  GetDashboardHighlightsHandler,
  GetDashboardMetricsHandler,
  GetDashboardRepartitionHandler,
  GetFilmStatsHandler,
  GetRevenueByContentHandler,
  GetRevenueStatsHandler,
  GetUserStatsHandler,
} from './application/handlers/dashboard.handlers';

const DASHBOARD_HANDLERS = [
  GetDashboardMetricsHandler,
  GetDashboardHighlightsHandler,
  GetDashboardRepartitionHandler,
  GetFilmStatsHandler,
  GetRevenueStatsHandler,
  GetRevenueByContentHandler,
  GetAdsStatsHandler,
  GetAdsStatsByIdHandler,
  GetUserStatsHandler,
];

@Module({
  imports: [SafliixBackDatabaseModule, CqrsModule],
  providers: [
    PlatformAnalyticsService,
    MovieAnalyticsService,
    AdAnalyticsService,
    ...DASHBOARD_HANDLERS,
  ],
  exports: [
    PlatformAnalyticsService,
    MovieAnalyticsService,
    AdAnalyticsService,
    VIDEO_VIEW_REPOSITORY,
    ...DASHBOARD_HANDLERS,
  ],
})
export class SafliixBackMetricDomainModule {}
