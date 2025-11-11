// application/commands/impl/index.ts

import { ICommand } from '@nestjs/cqrs';
import { CreateAdDto } from '../../../interfaces/dto/create-ad.dto';
import { CreateAdViewDto } from '../../../interfaces/dto/create-ad-view.dto';
import { UpdateAdDto } from '../../../interfaces/dto/update-ad.dto';

export class CreateAdCommand implements ICommand {
  constructor(public readonly payload: CreateAdDto) {}
}

export class UpdateAdCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateAdDto
  ) {}
}

export class DeleteAdCommand implements ICommand {
  constructor(public readonly id: string) {}
}

export class TrackAdViewCommand implements ICommand {
  constructor(public readonly payload: CreateAdViewDto) {}
}

export class ActivateAdCommand implements ICommand {
  constructor(public readonly id: string) {}
}

export class DeactivateAdCommand implements ICommand {
  constructor(public readonly id: string) {}
}