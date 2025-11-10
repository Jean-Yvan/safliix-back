import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetCompletedViewsQuery } from '../cqrs/queries/get-completed-views.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetCompletedViewsQuery)
export class GetCompletedViewsHandler extends BaseQueryHandler<
  GetCompletedViewsQuery,
  Result<UserVideoView[], Error>
> {
  protected override logger = new Logger(GetCompletedViewsHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetCompletedViewsQuery,
  ): Promise<Result<UserVideoView[], Error>> {
    return this.repository.getCompletedViews(query.userId);
  }
}
