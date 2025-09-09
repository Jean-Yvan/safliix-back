// cqrs/handlers/save-admin.handler.ts
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import type { AdminRepository } from '../../domain/port/admin.repository';
import { ADMIN_REPOSITORY } from '../../utils/types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ListAdminByIdQuery } from '../cqrs/queries/list-admin-by-id.query';

@Injectable()
@QueryHandler(ListAdminByIdQuery)
export class ListAdminByIdHandler extends BaseQueryHandler<
  ListAdminByIdQuery,
  Result<void, Error>
> {
  protected override logger = new Logger(ListAdminByIdHandler.name);
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
  ) {
    super();
  }

  protected override async handle(
    query: ListAdminByIdQuery,
  ): Promise<Result<void, Error>> {
     
    const safe = await Result.safe(this.repository.findById(query.id));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }
}
