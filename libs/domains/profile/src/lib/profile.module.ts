import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';

import { SharedAccountRepositoryImpl } from './infrastructure/prisma-shared-account.repository';
import { SHARED_ACCOUNT_REPOSITORY } from './utils/types';
import { CreateSharedAccountHandler } from './application/handlers/create-shared-account.handler';
import { DeleteSharedAccountHandler } from './application/handlers/delete-shared-account.handler';
import { RemoveProfileHandler } from './application/handlers/remove-profile.handler';
import { UpdateProfileHandler } from './application/handlers/update-profile.handler';
import { AddProfileToAccountHandler } from './application/handlers/profile-command.handler';
import { GetSharedAccountByIdHandler } from './application/handlers/get-shared-account-by-id.handler';
import { ListProfilesHandler } from './application/handlers/list-profiles.handler';
import { ProfileLoginHandler } from './application/handlers/profile-login.handler';
import { VerifyProfileAccessHandler } from './application/handlers/verify-profile-access.handler';

const handlers = [
  CreateSharedAccountHandler,
  DeleteSharedAccountHandler,
  RemoveProfileHandler,
  UpdateProfileHandler,
  AddProfileToAccountHandler,
  GetSharedAccountByIdHandler,
  ListProfilesHandler,
  ProfileLoginHandler,
  VerifyProfileAccessHandler,
];

@Module({
  imports: [SafliixBackDatabaseModule],
  providers: [
    {
      provide: SHARED_ACCOUNT_REPOSITORY,
      useClass: SharedAccountRepositoryImpl,
    },
    ...handlers,
  ],
  exports: handlers,
})
export class SafliixBackProfileModule {}
