import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { SafliixBackAuthModule } from '@safliix-back/auth';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { FrontAuthController } from './auth.controller';
import { AUTH_HANDLERS } from './auth.handlers';

@Module({
  imports: [
    CqrsModule,
    SafliixBackAuthModule,
    SafliixBackDatabaseModule,
    JwtModule.register({}),
  ],
  controllers: [FrontAuthController],
  providers: [...AUTH_HANDLERS],
})
export class AuthModule {}
