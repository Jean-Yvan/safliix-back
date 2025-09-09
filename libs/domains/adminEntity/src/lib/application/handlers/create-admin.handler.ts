// cqrs/handlers/save-admin.handler.ts
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import { CreateAdminCommand } from '../cqrs/command/create-admin.command';
import type { AdminRepository } from '../../domain/port/admin.repository';
import { AdminEntity as Admin } from '../../domain/entities/admin.entity';
import { ADMIN_REPOSITORY } from '../../utils/types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler extends BaseHandler<
  CreateAdminCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
  ) {
    super();
  }

  protected override async handle(
    command: CreateAdminCommand,
  ): Promise<Result<void, Error>> {
    const adminResult = Admin.create(command.payload);
    if(adminResult.isErr()){
      return Err(adminResult.unwrapErr());
    }
    const safe = await Result.safe(this.repository.create(adminResult.unwrap()));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }
}
