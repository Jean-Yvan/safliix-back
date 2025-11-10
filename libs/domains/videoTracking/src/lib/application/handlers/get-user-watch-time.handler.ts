import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseQueryHandler } from '@safliix-back/cqrs';

import { GetUserWatchTimeQuery } from '../cqrs/queries/get-user-watch-time.query';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';

@Injectable()
@QueryHandler(GetUserWatchTimeQuery)
export class GetUserWatchTimeHandler extends BaseQueryHandler<
  GetUserWatchTimeQuery,
  Result<number, Error>
> {
  protected override logger = new Logger(GetUserWatchTimeHandler.name);

  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override handle(
    query: GetUserWatchTimeQuery,
  ): Promise<Result<number, Error>> {
    return this.repository.getUserWatchTime(query.userId, query.period);
  }
}
