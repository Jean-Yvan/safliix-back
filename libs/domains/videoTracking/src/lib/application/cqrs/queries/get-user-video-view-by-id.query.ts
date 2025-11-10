import { IQuery } from '@nestjs/cqrs';

export class GetUserVideoViewByIdQuery implements IQuery {
  constructor(public readonly viewId: string) {}
}
