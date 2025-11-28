import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetRecentViewsQuery } from '../cqrs/queries/get-recent-views.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import type { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetRecentViewsQuery)
export class GetRecentViewsHandler extends BaseQueryHandler<
  GetRecentViewsQuery,
  Result<UserVideoView[], Error>
> {
  protected override logger = new Logger(GetRecentViewsHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetRecentViewsQuery,
  ): Promise<Result<UserVideoView[], Error>> {
    return this.repository.getRecentViews(query.userId, query.days);
  }
}
