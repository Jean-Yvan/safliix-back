import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';

import {
  CreateUserVideoViewHandler,
  UpdateUserVideoProgressHandler,
  MarkUserVideoViewAsCompletedHandler,
  RateUserVideoViewHandler,
  DeleteUserVideoViewHandler,
  UpdateUserVideoProgressBatchHandler,
  MarkMultipleViewsAsCompletedHandler,
  GetUserVideoViewByIdHandler,
  GetUserVideoViewsByUserAndVideoHandler,
  GetUserVideoProgressHandler,
  GetWatchHistoryHandler,
  GetCompletedViewsHandler,
  GetInProgressViewsHandler,
  GetVideoStatisticsHandler,
  GetUserWatchTimeHandler,
  GetRecentViewsHandler,
} from './application';
import { USER_VIDEO_VIEW_REPOSITORY } from './utils/types';
import { PrismaUserVideoViewRepository } from './infrastructure/prisma-user-video-view.repository';

const commandHandlers = [
  CreateUserVideoViewHandler,
  UpdateUserVideoProgressHandler,
  MarkUserVideoViewAsCompletedHandler,
  RateUserVideoViewHandler,
  DeleteUserVideoViewHandler,
  UpdateUserVideoProgressBatchHandler,
  MarkMultipleViewsAsCompletedHandler,
];

const queryHandlers = [
  GetUserVideoViewByIdHandler,
  GetUserVideoViewsByUserAndVideoHandler,
  GetUserVideoProgressHandler,
  GetWatchHistoryHandler,
  GetCompletedViewsHandler,
  GetInProgressViewsHandler,
  GetVideoStatisticsHandler,
  GetUserWatchTimeHandler,
  GetRecentViewsHandler,
];

const providers = [
  {
    provide: USER_VIDEO_VIEW_REPOSITORY,
    useClass: PrismaUserVideoViewRepository,
  },
  ...commandHandlers,
  ...queryHandlers,
];

@Module({
  imports: [SafliixBackDatabaseModule],
  providers,
  exports: [...commandHandlers, ...queryHandlers],
})
export class SafliixBackVideoTrackingModule {}
