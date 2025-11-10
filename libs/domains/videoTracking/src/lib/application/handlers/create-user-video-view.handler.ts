import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { CreateUserVideoViewCommand } from '../cqrs/commands/create-user-video-view.command';
import type { IUserVideoViewRepository } from '../../domain/ports/user-video-view.repository';
import { UserVideoView } from '../../domain/entities/user-video-view';
import { USER_VIDEO_VIEW_REPOSITORY } from '../../utils/types';

@Injectable()
@CommandHandler(CreateUserVideoViewCommand)
export class CreateUserVideoViewHandler extends BaseHandler<
  CreateUserVideoViewCommand,
  Result<UserVideoView, Error>
> {
  constructor(
    @Inject(USER_VIDEO_VIEW_REPOSITORY)
    private readonly repository: IUserVideoViewRepository,
  ) {
    super();
  }

  protected override async handle(
    command: CreateUserVideoViewCommand,
  ): Promise<Result<UserVideoView, Error>> {
    const entity = UserVideoView.create(command.payload);
    return this.repository.create(entity);
  }
}
