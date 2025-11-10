import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { GetSharedAccountByIdQuery } from '../cqrs/queries/get-shared-account-by-id.query';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SharedAccount } from '../../domain/entities/shared-account.entity';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@QueryHandler(GetSharedAccountByIdQuery)
export class GetSharedAccountByIdHandler extends BaseHandler<
  GetSharedAccountByIdQuery,
  Result<SharedAccount, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    query: GetSharedAccountByIdQuery,
  ): Promise<Result<SharedAccount, Error>> {
    return this.sharedAccountRepository.getSharedAccountById(query.accountId);
  }
}
