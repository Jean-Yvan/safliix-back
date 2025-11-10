import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { ProfileLoginQuery } from '../cqrs/queries/profile-login.query';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SharedAccountUser } from '../../domain/entities/shared-account-user.entity';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';

@Injectable()
@QueryHandler(ProfileLoginQuery)
export class ProfileLoginHandler extends BaseHandler<
  ProfileLoginQuery,
  Result<SharedAccountUser, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    query: ProfileLoginQuery,
  ): Promise<Result<SharedAccountUser, Error>> {
    return this.sharedAccountRepository.loginWithProfile(
      query.accountId,
      query.profileName,
      query.pinCode,
    );
  }
}
