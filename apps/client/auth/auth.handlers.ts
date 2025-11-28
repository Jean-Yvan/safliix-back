import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import {
  ConfirmPasswordResetCommand,
  LoginCommand,
  LogoutCommand,
  RegisterCommand,
  RequestPasswordResetCommand,
  VerifyPasswordResetCommand,
} from './cqrs/commands';
import { GetMeQuery } from './cqrs/queries';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  async execute(command: LoginCommand) {
    const token = randomUUID();
    return {
      token,
      user: { id: token, email: command.email, displayName: command.email.split('@')[0], roles: ['user'] },
    };
  }
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  async execute(command: RegisterCommand) {
    const token = randomUUID();
    return {
      token,
      user: {
        id: token,
        email: command.email,
        displayName: command.displayName ?? command.email.split('@')[0],
        roles: ['user'],
      },
    };
  }
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  async execute() {
    return { success: true };
  }
}

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  async execute(command: RequestPasswordResetCommand) {
    return { message: 'Reset code sent', channel: 'email', expiresInSeconds: 300, email: command.email };
  }
}

@CommandHandler(VerifyPasswordResetCommand)
export class VerifyPasswordResetHandler implements ICommandHandler<VerifyPasswordResetCommand> {
  async execute(command: VerifyPasswordResetCommand) {
    return { valid: true, token: randomUUID(), email: command.email, code: command.code };
  }
}

@CommandHandler(ConfirmPasswordResetCommand)
export class ConfirmPasswordResetHandler implements ICommandHandler<ConfirmPasswordResetCommand> {
  async execute() {
    return { message: 'Password reset confirmed' };
  }
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  async execute(query: GetMeQuery) {
    if (!query.userId && !query.email) {
      return null;
    }
    return {
      id: query.userId ?? query.email ?? '',
      email: query.email ?? '',
      displayName: query.email?.split('@')[0] ?? 'User',
      roles: query.roles ?? ['user'],
      subscriptionStatus: 'unknown',
    };
  }
}

export const AUTH_HANDLERS = [
  LoginHandler,
  RegisterHandler,
  LogoutHandler,
  RequestPasswordResetHandler,
  VerifyPasswordResetHandler,
  ConfirmPasswordResetHandler,
  GetMeHandler,
];
