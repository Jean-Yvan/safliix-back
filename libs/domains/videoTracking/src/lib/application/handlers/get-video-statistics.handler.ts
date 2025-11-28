import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetVideoStatisticsQuery } from '../cqrs/queries/get-video-statistics.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import type {
  IUserVideoViewRepository,
  VideoStatistics,
} from '../../domain/ports/user-video-view.repository';

@Injectable()
@QueryHandler(GetVideoStatisticsQuery)
export class GetVideoStatisticsHandler extends BaseQueryHandler<
  GetVideoStatisticsQuery,
  Result<VideoStatistics, Error>
> {
  protected override logger = new Logger(GetVideoStatisticsHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetVideoStatisticsQuery,
  ): Promise<Result<VideoStatistics, Error>> {
    return this.repository.getVideoStatistics(query.videoId);
  }
}
