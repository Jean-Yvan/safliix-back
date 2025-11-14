// cqrs/handlers/save-admin.handler.ts
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import { CreateAdminCommand } from '../cqrs/command/create-admin.command';
import type { AdminRepository } from '../../domain/port/admin.repository';
import { AdminEntity as Admin } from '../../domain/entities/admin.entity';
import { ADMIN_REPOSITORY, AdminRole } from '../../utils/types';
import { Inject, Injectable } from '@nestjs/common';
import { KeycloakProvisioningService } from '@safliix-back/auth';

@Injectable()
@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler extends BaseHandler<
  CreateAdminCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository,
    private readonly keycloakProvisioningService: KeycloakProvisioningService,
  ) {
    super();
  }

  protected override async handle(
    command: CreateAdminCommand,
  ): Promise<Result<void, Error>> {
    const targetRole = command.payload.role ?? AdminRole.ADMIN;

    if (targetRole === AdminRole.OWNER) {
      const existingOwnerResult = await Result.safe(
        this.repository.find({ role: AdminRole.OWNER }),
      );

      if (existingOwnerResult.isErr()) {
        return Err(existingOwnerResult.unwrapErr());
      }

      if (existingOwnerResult.unwrap().length > 0) {
        return Err(new Error('Un compte OWNER existe déjà.'));
      }
    }

    let keycloakId = command.payload.keycloakId ?? null;
    let provisionedExternally = false;

    if (!keycloakId) {
      const provisionResult = await Result.safe(
        this.keycloakProvisioningService.createUser(
          {
            email: command.payload.email,
            password: command.payload.password,
            firstName: command.payload.firstName,
            lastName: command.payload.lastName,
          },
          this.getKeycloakRoles(targetRole),
          this.getRequiredKeycloakRoles(targetRole),
        ),
      );

      if (provisionResult.isErr()) {
        return Err(provisionResult.unwrapErr());
      }

      keycloakId = provisionResult.unwrap();
      provisionedExternally = true;
    }

    const adminResult = Admin.create({
      ...command.payload,
      keycloakId: keycloakId ?? undefined,
    });
    if(adminResult.isErr()){
      await this.rollbackKeycloakUser(provisionedExternally, keycloakId);
      return Err(adminResult.unwrapErr());
    }
    const safe = await Result.safe(this.repository.create(adminResult.unwrap()));

    if (safe.isErr()) {
      await this.rollbackKeycloakUser(provisionedExternally, keycloakId);
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
  }

  private async rollbackKeycloakUser(created: boolean, keycloakId: string | null) {
    if (!created || !keycloakId) {
      return;
    }

    await Result.safe(this.keycloakProvisioningService.deleteUser(keycloakId));
  }

  private getKeycloakRoles(role: AdminRole): string[] {
    switch (role) {
      case AdminRole.OWNER:
        return ['owner'];
      case AdminRole.SUPER_ADMIN:
        return ['super_admin'];
      default:
        return ['admin'];
    }
  }

  private getRequiredKeycloakRoles(role: AdminRole): string[] {
    if (role === AdminRole.OWNER) {
      return ['owner'];
    }
    return [];
  }
}
