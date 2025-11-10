import { IQuery } from '@nestjs/cqrs';

export class GetInProgressViewsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
