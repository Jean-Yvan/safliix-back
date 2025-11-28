import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackUsersModule } from '@safliix-back/users';
import { AdminUserController } from './user.controller';
import { SafliixBackDatabaseModule } from '@safliix-back/database';

@Module({
  imports:[
    CqrsModule,
    SafliixBackUsersModule,
    SafliixBackDatabaseModule
  ],
  controllers:[
    AdminUserController
  ]
})
export class UsersModule {
  
}
