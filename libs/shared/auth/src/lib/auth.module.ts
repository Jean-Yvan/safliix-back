import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KeycloakProvisioningService } from './services/keycloak-admin-service';
import { ProfileTokenStrategy } from './strategies/profile-token.strategy';
import { KeycloakStrategy } from './strategies/keycloak.strategy';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [KeycloakProvisioningService, ProfileTokenStrategy, KeycloakStrategy],
  exports: [KeycloakProvisioningService],
})
export class SafliixBackAuthModule {}
