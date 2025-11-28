// Temporary command definitions for front auth flows
export class LoginCommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

export class RegisterCommand {
  constructor(public readonly email: string, public readonly password: string, public readonly displayName?: string) {}
}

export class LogoutCommand {}

export class RequestPasswordResetCommand {
  constructor(public readonly email: string) {}
}

export class VerifyPasswordResetCommand {
  constructor(public readonly email: string, public readonly code: string) {}
}

export class ConfirmPasswordResetCommand {
  constructor(public readonly token: string, public readonly newPassword: string) {}
}
