// libs/shared/keycloak-security/src/lib/profile-token.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
// @ts-ignore Missing type declarations for passport-jwt in offline environment
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Payload attendu du JWT signé par NestJS
export interface ProfileTokenPayload {
  sub: string;         // ID du SharedAccountUser (profileId)
  account_id: string;  // ID du User (accountId)
  auth_type: 'PROFILE_PIN'; // Type pour identification
}

@Injectable()
export class ProfileTokenStrategy extends PassportStrategy(Strategy, 'profile-token') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 🔑 Utilisation du secret unique stocké dans l'environnement
      secretOrKey: configService.get<string>('PROFILE_TOKEN_SECRET') || 'FALLBACK_SECRET', 
      ignoreExpiration: false,
    });
  }

  // Si le jeton est valide (signature + expiration)
  async validate(payload: ProfileTokenPayload) {
    if (payload.auth_type !== 'PROFILE_PIN') {
      throw new UnauthorizedException('Type de jeton de profil invalide.');
    }
    
    // Le payload est retourné. Il contient profileId et accountId.
    return payload; 
  }
}
