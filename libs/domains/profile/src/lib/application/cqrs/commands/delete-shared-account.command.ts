import { ICommand } from '@nestjs/cqrs';

export class DeleteSharedAccountCommand implements ICommand {
  constructor(public readonly accountId: string) {}
}
