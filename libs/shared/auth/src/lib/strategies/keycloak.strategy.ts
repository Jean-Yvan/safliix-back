import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// @ts-ignore Missing type declarations for passport-jwt in offline environment
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('KEYCLOAK_JWT_SECRET') ?? 'INSECURE_FALLBACK';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: unknown) {
    return payload;
  }
}
