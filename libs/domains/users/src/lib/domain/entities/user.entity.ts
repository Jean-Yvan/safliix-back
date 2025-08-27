export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public name: string,
    public avatarUrl: string,
    public lastLoginAt: Date,
    public isVerified = false,
    public isMainAccount = true,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
