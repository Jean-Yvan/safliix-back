import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { CreateUserHandler } from './application/handlers/create-user.handler';
import { ListUserByIdHandler } from './application/handlers/list-user-by-id.handler';
import { ListUserHandler } from './application/handlers/list-user.handler';
import { UpdateUserHandler } from './application/handlers/update-user.handler';
import { USER_REPOSITORY } from './utils/types';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';

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
    UpdateUserHandler
  ],
  exports: [
    CreateUserHandler,
    ListUserByIdHandler,
    ListUserHandler,
    UpdateUserHandler
  ],
})
export class SafliixBackUsersModule {}
