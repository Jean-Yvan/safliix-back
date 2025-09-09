// cqrs/handlers/save-admin.handler.ts
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import type { AdminRepository } from '../../domain/port/admin.repository';
import { ADMIN_REPOSITORY } from '../../utils/types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ListAdminQuery } from '../cqrs/queries/list-admin.query';

@Injectable()
@QueryHandler(ListAdminQuery)
export class ListAdminHandler extends BaseQueryHandler<
  ListAdminQuery,
  Result<void, Error>
> {
  protected override logger = new Logger(ListAdminHandler.name);
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
  ) {
    super();
  }

  protected override async handle(
    query: ListAdminQuery,
  ): Promise<Result<void, Error>> {
     
    const safe = await Result.safe(this.repository.find(query.payload));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }
}
