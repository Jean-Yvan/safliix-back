import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetUserVideoViewByIdQuery } from '../cqrs/queries/get-user-video-view-by-id.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@QueryHandler(GetUserVideoViewByIdQuery)
export class GetUserVideoViewByIdHandler extends BaseQueryHandler<
  GetUserVideoViewByIdQuery,
  Result<UserVideoView, Error>
> {
  protected override logger = new Logger(GetUserVideoViewByIdHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetUserVideoViewByIdQuery,
  ): Promise<Result<UserVideoView, Error>> {
    return this.repository.findById(query.viewId);
  }
}
