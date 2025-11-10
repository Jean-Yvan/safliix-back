import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { DeleteSharedAccountCommand } from '../cqrs/commands/delete-shared-account.command';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@CommandHandler(DeleteSharedAccountCommand)
export class DeleteSharedAccountHandler extends BaseHandler<
  DeleteSharedAccountCommand,
  Result<boolean, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    command: DeleteSharedAccountCommand,
  ): Promise<Result<boolean, Error>> {
    return this.sharedAccountRepository.deleteSharedAccount(command.accountId);
  }
}
