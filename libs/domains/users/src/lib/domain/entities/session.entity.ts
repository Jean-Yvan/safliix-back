export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public refreshToken: string,
    public ipAddress?: string,
    public userAgent?: string,
    public expiresAt?: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
