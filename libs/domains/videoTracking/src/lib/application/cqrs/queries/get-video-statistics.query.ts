import { IQuery } from '@nestjs/cqrs';

export class GetVideoStatisticsQuery implements IQuery {
  constructor(public readonly videoId: string) {}
}
