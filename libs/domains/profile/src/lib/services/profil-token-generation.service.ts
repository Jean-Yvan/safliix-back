

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileTokenGenerationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Génère le JWT de profil interne utilisé par les utilisateurs partagés.
   */
  generateProfileToken(profileId: string, accountId: string): string {
    const payload = { 
      sub: profileId,         // ID du SharedAccountUser (le spectateur)
      account_id: accountId,  // ID du User (l'abonné principal)
      auth_type: 'PROFILE_PIN' // Indique au Guard que c'est un jeton interne
    };
    
    // Le secret doit être injecté via la configuration (par exemple, PROFILE_TOKEN_SECRET)
    const secret = this.configService.get<string>('PROFILE_TOKEN_SECRET') || 'FALLBACK_SECRET_NEVER_USE_IN_PROD';
    
    return this.jwtService.sign(payload, { secret, expiresIn: '7d' });
  }
}