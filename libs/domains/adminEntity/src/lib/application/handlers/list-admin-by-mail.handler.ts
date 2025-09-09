// cqrs/handlers/save-admin.handler.ts
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import type { AdminRepository } from '../../domain/port/admin.repository';
import { ADMIN_REPOSITORY } from '../../utils/types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ListAdminByEmailQuery } from '../cqrs/queries/list-admin-by-email.query';

@Injectable()
@QueryHandler(ListAdminByEmailQuery)
export class ListAdminByEmailHandler extends BaseQueryHandler<
  ListAdminByEmailQuery,
  Result<void, Error>
> {
  protected override logger = new Logger(ListAdminByEmailHandler.name);
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
  ) {
    super();
  }

  protected override async handle(
    query: ListAdminByEmailQuery,
  ): Promise<Result<void, Error>> {
     
    const safe = await Result.safe(this.repository.findByEmail(query.email));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }
}
