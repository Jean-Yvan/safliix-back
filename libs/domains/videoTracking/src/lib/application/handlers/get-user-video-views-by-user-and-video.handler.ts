import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetUserVideoViewsByUserAndVideoQuery } from '../cqrs/queries/get-user-video-views-by-user-and-video.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import type { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetUserVideoViewsByUserAndVideoQuery)
export class GetUserVideoViewsByUserAndVideoHandler extends BaseQueryHandler<
  GetUserVideoViewsByUserAndVideoQuery,
  Result<UserVideoView[], Error>
> {
  protected override logger = new Logger(GetUserVideoViewsByUserAndVideoHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetUserVideoViewsByUserAndVideoQuery,
  ): Promise<Result<UserVideoView[], Error>> {
    return this.repository.findByUserAndVideo(query.userId, query.videoId);
  }
}
