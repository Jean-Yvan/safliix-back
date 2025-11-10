import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Err, Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { UpdateProfileCommand } from '../cqrs/commands/update-profile.command';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SharedAccountUser } from '../../domain/entities/shared-account-user.entity';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler extends BaseHandler<
  UpdateProfileCommand,
  Result<SharedAccountUser, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    command: UpdateProfileCommand,
  ): Promise<Result<SharedAccountUser, Error>> {
    if (!command.updates || Object.keys(command.updates).length === 0) {
      return Err(new BadRequestException('Aucune mise à jour fournie.'));
    }

    return this.sharedAccountRepository.updateProfile(command.profileId, command.updates);
  }
}
