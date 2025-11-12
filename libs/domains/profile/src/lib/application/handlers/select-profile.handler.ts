import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { BaseHandler } from '@safliix-back/cqrs';

import { SelectProfileQuery } from '../cqrs/queries/select-profile.query';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';
import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SharedAccountUser } from '../../domain/entities/shared-account-user.entity';

@Injectable()
@QueryHandler(SelectProfileQuery)
export class SelectProfileHandler extends BaseHandler<
  SelectProfileQuery,
  Result<SharedAccountUser, Error>
> {
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  protected override async handle(
    query: SelectProfileQuery,
  ): Promise<Result<SharedAccountUser, Error>> {
    return this.sharedAccountRepository.findProfileForOwner(
      query.accountId,
      query.profileId,
    );
  }
}
