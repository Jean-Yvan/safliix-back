import { ICommand } from '@nestjs/cqrs';

export class RemoveProfileCommand implements ICommand {
  constructor(public readonly profileId: string) {}
}
