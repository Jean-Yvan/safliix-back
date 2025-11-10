import { ICommand } from '@nestjs/cqrs';

export class RateUserVideoViewCommand implements ICommand {
  constructor(
    public readonly viewId: string,
    public readonly rating: number,
  ) {}
}
