import { ICommand } from '@nestjs/cqrs';

export class UpdateUserVideoProgressCommand implements ICommand {
  constructor(
    public readonly viewId: string,
    public readonly progress: number,
  ) {}
}
