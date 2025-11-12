import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

export interface ProfileTokenPayload {
  sub: string;
  account_id: string;
  auth_type: 'PROFILE_PIN';
  sid: string;
}

@Injectable()
export class ProfileTokenService {
  private readonly jwt: JwtService;
  private readonly secret: string;
  private readonly defaultExpiresIn: string;

  constructor(private readonly config: ConfigService) {
    this.secret =
      this.config.get<string>('PROFILE_TOKEN_SECRET') ??
      (() => {
        throw new Error('PROFILE_TOKEN_SECRET manquant pour ProfileTokenService.');
      })();

    this.defaultExpiresIn = this.config.get<string>('PROFILE_TOKEN_TTL') ?? '15m';
    this.jwt = new JwtService();
  }

  /**
   * Génère un token de profil signé côté backend.
   * Ce token doit TOUJOURS être utilisé conjointement avec le JWT Keycloak du compte principal.
   */
  signProfileToken(
    profileId: string,
    accountId: string,
    sessionId: string,
    options?: Pick<JwtSignOptions, 'expiresIn'>,
  ): string {
    const payload: ProfileTokenPayload = {
      sub: profileId,
      account_id: accountId,
      auth_type: 'PROFILE_PIN',
      sid: sessionId,
    };

    return this.jwt.sign(payload, {
      secret: this.secret,
      expiresIn: options?.expiresIn ?? this.defaultExpiresIn,
    });
  }

  /**
   * Vérifie la signature + expiration et garantit que le payload attendu est présent.
   */
  async verifyProfileToken(token: string): Promise<ProfileTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<ProfileTokenPayload>(token, {
        secret: this.secret,
      });

      if (payload.auth_type !== 'PROFILE_PIN') {
        throw new UnauthorizedException('Type de jeton de profil invalide.');
      }

      if (!payload.sub || !payload.account_id) {
        throw new UnauthorizedException('Jeton de profil incomplet.');
      }

      if (!payload.sid) {
        throw new UnauthorizedException('Session de profil manquante.');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Jeton de profil invalide ou expiré.');
    }
  }
}
