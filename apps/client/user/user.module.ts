import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackUsersModule } from '@safliix-back/users';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { UserController } from './user.controller';

@Module({
  imports: [CqrsModule, SafliixBackUsersModule, SafliixBackAccessModule],
  controllers: [UserController],
})
export class UserModule {}
