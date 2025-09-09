// cqrs/handlers/save-admin.handler.ts
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import { DeleteAdminCommand } from '../cqrs/command/delete-admin.command';
import type { AdminRepository } from '../../domain/port/admin.repository';
import { ADMIN_REPOSITORY } from '../../utils/types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(DeleteAdminCommand)
export class DeleteAdminHandler extends BaseHandler<
  DeleteAdminCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
  ) {
    super();
  }

  protected override async handle(
    command: DeleteAdminCommand,
  ): Promise<Result<void, Error>> {
    
    
    const safe = await Result.safe(this.repository.deleteById(command.id));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }
}
