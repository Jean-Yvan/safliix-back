import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { RemoveProfileCommand } from '../cqrs/commands/remove-profile.command';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@CommandHandler(RemoveProfileCommand)
export class RemoveProfileHandler extends BaseHandler<
  RemoveProfileCommand,
  Result<boolean, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    command: RemoveProfileCommand,
  ): Promise<Result<boolean, Error>> {
    return this.sharedAccountRepository.removeProfile(command.profileId);
  }
}
