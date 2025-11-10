import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { CreateUserHandler } from './application/handlers/create-user.handler';
import { ListUserByIdHandler } from './application/handlers/list-user-by-id.handler';
import { ListUserHandler } from './application/handlers/list-user.handler';
import { UpdateUserHandler } from './application/handlers/update-user.handler';
import { USER_REPOSITORY } from './utils/types';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { DeleteUserHandler } from './application/handlers/delete-user.handler';
import { ListUserByEmailHandler } from './application/handlers/list-user-by-email.handler';

@Module({
  imports:[
    SafliixBackDatabaseModule
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository
    },
    CreateUserHandler,
    ListUserByIdHandler,
    ListUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    ListUserByEmailHandler
  ],
  exports: [
    CreateUserHandler,
    ListUserByIdHandler,
    ListUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    ListUserByEmailHandler
  ],
})
export class SafliixBackUsersModule {}
