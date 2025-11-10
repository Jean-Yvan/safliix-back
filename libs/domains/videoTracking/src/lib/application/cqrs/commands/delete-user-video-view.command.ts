import { ICommand } from '@nestjs/cqrs';

export class DeleteUserVideoViewCommand implements ICommand {
  constructor(public readonly viewId: string) {}
}
