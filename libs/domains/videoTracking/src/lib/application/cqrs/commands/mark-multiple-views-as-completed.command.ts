import { ICommand } from '@nestjs/cqrs';

export class MarkMultipleViewsAsCompletedCommand implements ICommand {
  constructor(public readonly viewIds: string[]) {}
}
