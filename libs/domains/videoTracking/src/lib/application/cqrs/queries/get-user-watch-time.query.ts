import { IQuery } from '@nestjs/cqrs';

export class GetUserWatchTimeQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly period?: 'day' | 'week' | 'month',
  ) {}
}
