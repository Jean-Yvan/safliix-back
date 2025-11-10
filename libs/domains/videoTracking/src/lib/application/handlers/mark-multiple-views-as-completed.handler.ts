import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { MarkMultipleViewsAsCompletedCommand } from '../cqrs/commands/mark-multiple-views-as-completed.command';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';

@Injectable()
@CommandHandler(MarkMultipleViewsAsCompletedCommand)
export class MarkMultipleViewsAsCompletedHandler extends BaseHandler<
  MarkMultipleViewsAsCompletedCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override async handle(
    command: MarkMultipleViewsAsCompletedCommand,
  ): Promise<Result<void, Error>> {
    return this.repository.markMultipleAsCompleted(command.viewIds);
  }
}
