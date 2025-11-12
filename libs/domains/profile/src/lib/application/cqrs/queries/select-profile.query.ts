import { IQuery } from '@nestjs/cqrs';

export class SelectProfileQuery implements IQuery {
  constructor(
    public readonly accountId: string,
    public readonly profileId: string,
  ) {}
}
