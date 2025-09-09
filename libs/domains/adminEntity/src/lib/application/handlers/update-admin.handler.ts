// cqrs/handlers/save-admin.handler.ts
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import { UpdateAdminCommand } from '../cqrs/command/update-admin.command';
import type { AdminRepository } from '../../domain/port/admin.repository';
import { AdminEntity as Admin } from '../../domain/entities/admin.entity';
import { ADMIN_REPOSITORY } from '../../utils/types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler extends BaseHandler<
  UpdateAdminCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
  ) {
    super();
  }

  protected override async handle(
    command: UpdateAdminCommand,
  ): Promise<Result<void, Error>> {
    const existing = await this.repository.findById(command.payload.id);

    if(!existing){
      return Err(new Error("l'utilisateur n'existe pas"));
    }

    const admin = existing.updateWith(command.payload);
    if(admin.isErr()){
      return Err(admin.unwrapErr());
    }
    const safe = await Result.safe(this.repository.update(admin.unwrap()));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }
}
