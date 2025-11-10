import { ICommand } from '@nestjs/cqrs';

export class MarkUserVideoViewAsCompletedCommand implements ICommand {
  constructor(public readonly viewId: string) {}
}
