import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { CreateSharedAccountCommand } from '../cqrs/commands/create-shared-account.command';
import { SharedAccount, SharedAccountProps } from '../../domain/entities/shared-account.entity';
import { SharedAccountStatus } from '../../domain/enums/shared-account-status.enum';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@CommandHandler(CreateSharedAccountCommand)
export class CreateSharedAccountHandler extends BaseHandler<
  CreateSharedAccountCommand,
  Result<SharedAccount, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    command: CreateSharedAccountCommand,
  ): Promise<Result<SharedAccount, Error>> {
    const payload = command.payload;

    const props: SharedAccountProps = {
      ownerUserId: payload.ownerUserId,
      subscriptionId: payload.subscriptionId,
      status: payload.status ? (payload.status as SharedAccountStatus) : undefined,
    };

    const sharedAccount = SharedAccount.create(props);
    return this.sharedAccountRepository.createSharedAccount(sharedAccount);
  }
}
