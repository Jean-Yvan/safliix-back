import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ConfirmPasswordResetCommand,
  LoginCommand,
  LogoutCommand,
  RegisterCommand,
  RequestPasswordResetCommand,
  VerifyPasswordResetCommand,
} from './cqrs/commands';
import { GetMeQuery } from './cqrs/queries';
import {
  LoginDto,
  RegisterDto,
  PasswordResetRequestDto,
  PasswordResetVerifyDto,
  PasswordResetConfirmDto,
} from '@safliix-back/auth';

type AuthenticatedRequest = Request & { user?: { sub?: string; email?: string; roles?: string[] } };

@Controller('auth')
export class FrontAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('keycloak'))
  async me(@Req() req: AuthenticatedRequest) {
    return this.queryBus.execute(
      new GetMeQuery(req.user?.sub, req.user?.email, req.user?.roles)
    );
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password)
    );
    this.setSessionCookie(res, result.token);
    return result;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.displayName)
    );
    this.setSessionCookie(res, result.token);
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');
    return this.commandBus.execute(new LogoutCommand());
  }

  @Post('password-reset/request')
  async requestReset(@Body() dto: PasswordResetRequestDto) {
    return this.commandBus.execute(
      new RequestPasswordResetCommand(dto.email)
    );
  }

  @Post('password-reset/verify')
  async verifyReset(@Body() dto: PasswordResetVerifyDto) {
    return this.commandBus.execute(
      new VerifyPasswordResetCommand(dto.email, dto.code)
    );
  }

  @Post('password-reset/confirm')
  async confirmReset(@Body() dto: PasswordResetConfirmDto) {
    return this.commandBus.execute(
      new ConfirmPasswordResetCommand(dto.token, dto.newPassword)
    );
  }

  private setSessionCookie(res: Response, token: string) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
