// cqrs/handlers/save-admin.handler.ts
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

import { UpdateAdminCommand } from '../cqrs/command/update-admin.command';
import type { AdminRepository } from '../../domain/port/admin.repository';
import { ADMIN_REPOSITORY, AdminRole } from '../../utils/types';
import { Inject, Injectable } from '@nestjs/common';
import { KeycloakProvisioningService } from '@safliix-back/auth';

@Injectable()
@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler extends BaseHandler<
  UpdateAdminCommand,
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
    command: UpdateAdminCommand,
  ): Promise<Result<void, Error>> {
    const existing = await this.repository.findById(command.payload.id);

    if (!existing) {
      return Err(new Error("l'utilisateur n'existe pas"));
    }

    if (command.payload.role === AdminRole.OWNER && existing.role !== AdminRole.OWNER) {
      const ownerResult = await Result.safe(this.repository.find({ role: AdminRole.OWNER }));
      if (ownerResult.isErr()) {
        return Err(ownerResult.unwrapErr());
      }

      if (ownerResult.unwrap().some((owner) => owner.id !== existing.id)) {
        return Err(new Error('Un compte OWNER existe déjà.'));
      }
    }

    const admin = existing.updateWith(command.payload);
    if (admin.isErr()) {
      return Err(admin.unwrapErr());
    }

    const entity = admin.unwrap();

    if (entity.keycloakId) {
      const roles = this.getKeycloakRoles(entity.role);
      const requiredRoles = this.getRequiredKeycloakRoles(entity.role);

      const keycloakUpdate = await Result.safe(
        this.keycloakProvisioningService.updateUser(
          entity.keycloakId,
          {
            email: entity.email,
            firstName: entity.firstName,
            lastName: entity.lastName,
            password: command.payload.password,
            enabled: entity.isActive,
            emailVerified: entity.isVerified,
          },
          roles,
          requiredRoles,
        ),
      );

      if (keycloakUpdate.isErr()) {
        return Err(keycloakUpdate.unwrapErr());
      }
    }

    const safe = await Result.safe(this.repository.update(entity));

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(undefined);
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
