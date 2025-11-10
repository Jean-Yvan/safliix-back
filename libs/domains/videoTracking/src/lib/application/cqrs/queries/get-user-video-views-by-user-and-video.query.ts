import { IQuery } from '@nestjs/cqrs';

export class GetUserVideoViewsByUserAndVideoQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly videoId: string,
  ) {}
}
