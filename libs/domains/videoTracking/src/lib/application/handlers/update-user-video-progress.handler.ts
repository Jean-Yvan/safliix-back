import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { UpdateUserVideoProgressCommand } from '../cqrs/commands/update-user-video-progress.command';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@CommandHandler(UpdateUserVideoProgressCommand)
export class UpdateUserVideoProgressHandler extends BaseHandler<
  UpdateUserVideoProgressCommand,
  Result<UserVideoView, Error>
> {
  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override async handle(
    command: UpdateUserVideoProgressCommand,
  ): Promise<Result<UserVideoView, Error>> {
    const existingResult = await this.repository.findById(command.viewId);

    if (existingResult.isErr()) {
      return existingResult;
    }

    const view = existingResult.unwrap();
    view.updateProgress(command.progress);

    return this.repository.update(command.viewId, view);
  }
}
