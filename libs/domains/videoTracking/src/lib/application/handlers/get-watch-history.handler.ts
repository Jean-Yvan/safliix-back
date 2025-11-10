import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetWatchHistoryQuery } from '../cqrs/queries/get-watch-history.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetWatchHistoryQuery)
export class GetWatchHistoryHandler extends BaseQueryHandler<
  GetWatchHistoryQuery,
  Result<UserVideoView[], Error>
> {
  protected override logger = new Logger(GetWatchHistoryHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetWatchHistoryQuery,
  ): Promise<Result<UserVideoView[], Error>> {
    return this.repository.getWatchHistory(query.userId, query.limit);
  }
}
