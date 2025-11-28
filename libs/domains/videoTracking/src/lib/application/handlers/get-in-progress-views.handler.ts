import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetInProgressViewsQuery } from '../cqrs/queries/get-in-progress-views.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import type { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetInProgressViewsQuery)
export class GetInProgressViewsHandler extends BaseQueryHandler<
  GetInProgressViewsQuery,
  Result<UserVideoView[], Error>
> {
  protected override logger = new Logger(GetInProgressViewsHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetInProgressViewsQuery,
  ): Promise<Result<UserVideoView[], Error>> {
    return this.repository.getInProgressViews(query.userId);
  }
}
