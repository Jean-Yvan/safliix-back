import { ICommand } from '@nestjs/cqrs';

import { CreateUserVideoViewDto } from '../../../interfaces/dto/create-user-video-view.dto';

export class CreateUserVideoViewCommand implements ICommand {
  constructor(public readonly payload: CreateUserVideoViewDto) {}
}
