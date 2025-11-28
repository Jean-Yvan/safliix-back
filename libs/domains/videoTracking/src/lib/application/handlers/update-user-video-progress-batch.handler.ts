import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { UpdateUserVideoProgressBatchCommand } from '../cqrs/commands/update-user-video-progress-batch.command';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import type { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';

@Injectable()
@CommandHandler(UpdateUserVideoProgressBatchCommand)
export class UpdateUserVideoProgressBatchHandler extends BaseHandler<
  UpdateUserVideoProgressBatchCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override async handle(
    command: UpdateUserVideoProgressBatchCommand,
  ): Promise<Result<void, Error>> {
    return this.repository.updateProgressBatch(command.updates);
  }
}
