import { Module } from '@nestjs/common';
import { ADMIN_REPOSITORY } from './utils/types';
import { PrismaAdminRepository } from './infrastructure/prisma-admin.repository';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { SafliixBackAuthModule } from '@safliix-back/auth';
import { CreateAdminHandler } from './application/handlers/create-admin.handler';
import { UpdateAdminHandler } from './application/handlers/update-admin.handler';
import { DeleteAdminHandler } from './application/handlers/delete-admin.handler';
import { ListAdminByEmailHandler } from './application/handlers/list-admin-by-mail.handler';
import { ListAdminByIdHandler } from './application/handlers/list-admin-by-id.handler';
import { ListAdminHandler } from './application/handlers/list-admin.handler';

@Module({
  imports:[SafliixBackDatabaseModule, SafliixBackAuthModule],
  providers: [
    {
      provide:ADMIN_REPOSITORY,
      useClass: PrismaAdminRepository
    },
    CreateAdminHandler,
    UpdateAdminHandler,
    DeleteAdminHandler,
    ListAdminByEmailHandler,
    ListAdminByIdHandler,
    ListAdminHandler
  ],
  exports: [
    CreateAdminHandler,
    UpdateAdminHandler,
    DeleteAdminHandler,
    ListAdminByEmailHandler,
    ListAdminByIdHandler,
    ListAdminHandler
  ],
})
export class SafliixBackAdminEntityModule {}
