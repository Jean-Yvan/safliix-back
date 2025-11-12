import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@safliix-back/database';
import { randomUUID } from 'crypto';

export type ProfileSessionMetadata = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

const DURATION_UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

@Injectable()
export class ProfileSessionService {
  private readonly defaultTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.defaultTtlMs = this.parseDuration(
      this.configService.get<string>('PROFILE_SESSION_TTL') ?? '7d',
    );
  }

  async startProfileSession(
    profileId: string,
    accountId: string,
    metadata?: ProfileSessionMetadata,
  ): Promise<string> {
    await this.prisma.session.deleteMany({
      where: { profileId },
    });

    const session = await this.prisma.session.create({
      data: {
        profile: { connect: { id: profileId } },
        user: { connect: { id: accountId } },
        refreshToken: randomUUID(),
        ipAddress: metadata?.ipAddress ?? null,
        userAgent: metadata?.userAgent ?? null,
        expiresAt: this.computeExpirationDate(),
        sessionType: 'PROFILE',
      },
      select: { id: true },
    });

    return session.id;
  }

  async assertActiveSession(sessionId: string, profileId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        profileId: true,
        expiresAt: true,
      },
    });

    if (!session || session.profileId !== profileId) {
      throw new UnauthorizedException('Session de profil invalide.');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedException('Session de profil expirée.');
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  private computeExpirationDate(): Date {
    const expiresAt = new Date(Date.now() + this.defaultTtlMs);
    return expiresAt;
  }

  private parseDuration(value: string): number {
    if (!value) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const trimmed = value.trim().toLowerCase();
    const match = trimmed.match(/^(\d+)(ms|s|m|h|d)$/);

    if (match) {
      const [, amount, unit] = match;
      return Number(amount) * DURATION_UNIT_MS[unit];
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    throw new Error(`Durée de session invalide: ${value}`);
  }
}
