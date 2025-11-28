import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result, Err } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { RateUserVideoViewCommand } from '../cqrs/commands/rate-user-video-view.command';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';
import type { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';

@Injectable()
@CommandHandler(RateUserVideoViewCommand)
export class RateUserVideoViewHandler extends BaseHandler<
  RateUserVideoViewCommand,
  Result<UserVideoView, Error>
> {
  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override async handle(
    command: RateUserVideoViewCommand,
  ): Promise<Result<UserVideoView, Error>> {
    const existingResult = await this.repository.findById(command.viewId);

    if (existingResult.isErr()) {
      return existingResult;
    }

    const view = existingResult.unwrap();

    try {
      view.rateVideo(command.rating);
    } catch (error) {
      return Err(error as Error);
    }

    return this.repository.update(command.viewId, view);
  }
}
