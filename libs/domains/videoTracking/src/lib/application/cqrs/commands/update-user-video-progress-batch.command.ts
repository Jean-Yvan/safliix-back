import { ICommand } from '@nestjs/cqrs';

export type UserVideoProgressUpdate = {
  id: string;
  progress: number;
};

export class UpdateUserVideoProgressBatchCommand implements ICommand {
  constructor(public readonly updates: UserVideoProgressUpdate[]) {}
}
