import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ProfileContext,
  ProfileContextService,
  ProfileSessionService,
  ProfileTokenPayload,
  ProfileTokenService,
} from '@safliix-back/profile';

export interface RequestWithProfileContext extends Request {
  profileContext?: ProfileContext;
  profileTokenPayload?: ProfileTokenPayload;
  user?: any;
}

@Injectable()
export class ProfileContextGuard implements CanActivate {
  constructor(
    private readonly profileContextService: ProfileContextService,
    private readonly profileTokenService: ProfileTokenService,
    private readonly profileSessionService: ProfileSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithProfileContext>();
    const principalPayload = request.user;
    const profileToken = this.extractProfileToken(request);

    if (!profileToken) {
      throw new UnauthorizedException('Jeton de profil requis.');
    }

    const profilePayload =
      request.profileTokenPayload ??
      (await this.profileTokenService.verifyProfileToken(profileToken));

    await this.profileSessionService.assertActiveSession(profilePayload.sid, profilePayload.sub);

    if (principalPayload) {
      this.ensureOwnership(profilePayload, principalPayload);
    }

    request.profileTokenPayload = profilePayload;
    request.profileContext = await this.profileContextService.resolveProfile(profilePayload);
    return true;
  }

  private extractProfileToken(request: Request): string | null {
    const rawHeader =
      request.headers['x-profile-token'] ?? request.headers['X-Profile-Token'] ?? null;

    if (Array.isArray(rawHeader)) {
      return rawHeader[0] ?? null;
    }

    return rawHeader as string | null;
  }

  private ensureOwnership(profilePayload: ProfileTokenPayload, keycloakPayload: any): void {
    const principalId = keycloakPayload?.sub ?? keycloakPayload?.id;

    if (!principalId) {
      throw new UnauthorizedException('Impossible de déterminer le compte principal.');
    }

    if (profilePayload.account_id !== principalId) {
      throw new UnauthorizedException(
        'Ce profil ne correspond pas au compte principal authentifié.',
      );
    }
  }
}
