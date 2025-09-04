import {
  Result, Err, Ok
} from 'oxide.ts'

import { User } from './user.entity';
import { SessionWithUser } from '@safliix-back/database';

export class Session {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly refreshToken: string,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly expiresAt: Date,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly user : User | null
  ) {}

  // Factory pour créer une nouvelle session
  static create(data: {
    userId: string;
    refreshToken: string;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: Date;
  }): Result<Session,Error> {
    const now = new Date();

    if(data.userId.length < 1 || data.refreshToken.length < 1){
      return Err(new Error("parameters are not valid"))
    }
    return Ok(new Session(
      undefined,
      data.userId,
      data.refreshToken,
      data.ipAddress ?? null,
      data.userAgent ?? null,
      data.expiresAt,
      now,
      now,
      null
    ));
  }

  // Restore depuis la DB (Prisma ou autre source)
  static restore(data: SessionWithUser): Session {
    return new Session(
      data.id,
      data.userId,
      data.refreshToken,
      data.ipAddress ?? null,
      data.userAgent ?? null,
      data.expiresAt,
      data.createdAt,
      data.updatedAt,
      User.restore(data.user)
    );
  }
}
