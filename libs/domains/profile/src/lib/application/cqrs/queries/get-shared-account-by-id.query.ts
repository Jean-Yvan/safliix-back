import { IQuery } from '@nestjs/cqrs';

export class GetSharedAccountByIdQuery implements IQuery {
  constructor(public readonly accountId: string) {}
}
