import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackUsersModule } from '@safliix-back/users';
import { AdminUserController } from './user.controller';

@Module({
  imports:[
    CqrsModule,
    SafliixBackUsersModule
  ],
  controllers:[
    AdminUserController
  ]
})
export class UsersModule {
  
}

