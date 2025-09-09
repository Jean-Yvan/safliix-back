import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAdminEntityModule } from '@safliix-back/adminEntity';
import { AdminController } from './admin.controller';
@Module({
  imports:[
    CqrsModule,
    SafliixBackAdminEntityModule
  ],
  controllers:[AdminController]
})
export class AdminConnectModule {}
