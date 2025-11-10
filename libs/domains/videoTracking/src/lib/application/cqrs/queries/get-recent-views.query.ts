import { IQuery } from '@nestjs/cqrs';

export class GetRecentViewsQuery implements IQuery {
  constructor(public readonly userId: string, public readonly days?: number) {}
}
