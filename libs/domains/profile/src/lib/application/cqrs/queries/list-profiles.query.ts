import { IQuery } from '@nestjs/cqrs';

export class ListProfilesQuery implements IQuery {
  constructor(public readonly accountId: string) {}
}
