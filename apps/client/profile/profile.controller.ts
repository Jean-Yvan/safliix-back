import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfileAuthApplicationService } from './services/profile-auth.service';
import { ProfilePinLoginDto, ProfileSessionMetadata, SelectProfileDto } from '@safliix-back/profile';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user?: { sub?: string } };

@ApiTags('Profile')
@Controller('profile')
export class ClientProfileController {
  constructor(private readonly profileAuthService: ProfileAuthApplicationService) {}

  @Post('pin-login')
  @ApiOperation({ summary: 'Authentifier un profil secondaire via PIN' })
  @ApiResponse({ status: 200, description: 'Token de profil généré' })
  async authenticateByPin(@Body() dto: ProfilePinLoginDto, @Req() req: AuthenticatedRequest) {
    const metadata = this.extractSessionMetadata(req);
    const profileToken = await this.profileAuthService.authenticateProfile(
      dto.email,
      dto.profileName,
      dto.pinCode,
      metadata,
    );

    return {
      success: true,
      data: { profileToken },
    };
  }

  @Post('select')
  @UseGuards(AuthGuard('keycloak'))
  @ApiOperation({ summary: 'Sélectionner un profil pour un compte principal connecté' })
  @ApiResponse({ status: 200, description: 'Token de profil généré' })
  async selectProfile(@Body() dto: SelectProfileDto, @Req() req: AuthenticatedRequest) {
    const accountId = req.user?.sub;

    if (!accountId) {
      throw new UnauthorizedException('Impossible de déterminer le compte principal.');
    }

    const profileToken = await this.profileAuthService.issueProfileTokenForOwner(
      accountId,
      dto.profileId,
      this.extractSessionMetadata(req),
    );

    return {
      success: true,
      data: { profileToken },
    };
  }
  private extractSessionMetadata(req: AuthenticatedRequest): ProfileSessionMetadata {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipCandidate = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor ?? req.ip;

    return {
      ipAddress: typeof ipCandidate === 'string' ? ipCandidate.split(',')[0]?.trim() ?? null : null,
      userAgent: req.headers['user-agent'] ?? null,
    };
  }
}
