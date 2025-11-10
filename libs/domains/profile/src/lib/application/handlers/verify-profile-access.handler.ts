import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { VerifyProfileAccessQuery } from '../cqrs/queries/verify-profile-access.query';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@QueryHandler(VerifyProfileAccessQuery)
export class VerifyProfileAccessHandler extends BaseHandler<
  VerifyProfileAccessQuery,
  Result<boolean, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    query: VerifyProfileAccessQuery,
  ): Promise<Result<boolean, Error>> {
    return this.sharedAccountRepository.verifyAccess(query.profileId, query.pinCode);
  }
}
