import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetUserVideoProgressQuery } from '../cqrs/queries/get-user-video-progress.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetUserVideoProgressQuery)
export class GetUserVideoProgressHandler extends BaseQueryHandler<
  GetUserVideoProgressQuery,
  Result<UserVideoView, Error>
> {
  protected override logger = new Logger(GetUserVideoProgressHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetUserVideoProgressQuery,
  ): Promise<Result<UserVideoView, Error>> {
    return this.repository.findUserProgress(query.userId, query.videoId);
  }
}
