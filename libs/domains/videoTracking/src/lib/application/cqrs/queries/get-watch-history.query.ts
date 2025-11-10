import { IQuery } from '@nestjs/cqrs';

export class GetWatchHistoryQuery implements IQuery {
  constructor(public readonly userId: string, public readonly limit?: number) {}
}
