import { IQuery } from '@nestjs/cqrs';

export class GetCompletedViewsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
