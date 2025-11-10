import { IQuery } from '@nestjs/cqrs';

export class GetUserVideoProgressQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly videoId: string,
  ) {}
}
