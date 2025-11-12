// src/videos/domain/entities/active-stream.entity.ts

import { Result, Ok, Err } from "oxide.ts";

const MIN_TIMEOUT_MINUTES = 1;
const MAX_TIMEOUT_MINUTES = 24 * 60; // Limite raisonnable pour éviter les streams infinies.

export class InvalidStreamTimeoutError extends Error {
  constructor(public readonly timeoutMinutes: number) {
    super(`Invalid stream timeout: ${timeoutMinutes} minutes.`);
    this.name = "InvalidStreamTimeoutError";
  }
}

export class ActiveStreamExpiredError extends Error {
  constructor() {
    super("Active stream is already expired and cannot be renewed.");
    this.name = "ActiveStreamExpiredError";
  }
}

export type ActiveStreamPrimitives = {
  id: string | undefined;
  profileId: string;
  accountId: string;
  videoId: string | null;
  startedAt: Date;
  expiresAt: Date;
  updatedAt: Date | null;
};

type RestorePayload = Omit<ActiveStreamPrimitives, "videoId"> & {
  videoId: string | null | undefined;
};

type CreatePayload = {
  profileId: string;
  accountId: string;
  videoId: string | null;
  timeoutMinutes: number;
  startedAt?: Date;
};

export class ActiveStream {
  private constructor(
    public readonly id: string | undefined,
    public readonly profileId: string,
    public readonly accountId: string,
    public readonly videoId: string | null,
    public readonly startedAt: Date,
    public readonly expiresAt: Date,
    public readonly updatedAt: Date | null
  ) {}

  static create(payload: CreatePayload): Result<ActiveStream, InvalidStreamTimeoutError> {
    if (!ActiveStream.isValidTimeout(payload.timeoutMinutes)) {
      return Err(new InvalidStreamTimeoutError(payload.timeoutMinutes));
    }

    const start = payload.startedAt ?? new Date();
    const expiresAt = ActiveStream.computeExpiration(start, payload.timeoutMinutes);

    return Ok(
      new ActiveStream(
        undefined,
        payload.profileId,
        payload.accountId,
        payload.videoId ?? null,
        start,
        expiresAt,
        start
      )
    );
  }

  /**
   * Restaure l'entité depuis les données de la base de données.
   */
  static restore(data: RestorePayload): ActiveStream {
    return new ActiveStream(
      data.id,
      data.profileId,
      data.accountId,
      data.videoId ?? null,
      data.startedAt,
      data.expiresAt,
      data.updatedAt ?? null
    );
  }

  /**
   * Prolonge la durée de vie du stream à la suite d'un ping client.
   */
  updateExpiration(
    timeoutMinutes: number,
    referenceDate: Date = new Date()
  ): Result<ActiveStream, InvalidStreamTimeoutError | ActiveStreamExpiredError> {
    if (!ActiveStream.isValidTimeout(timeoutMinutes)) {
      return Err(new InvalidStreamTimeoutError(timeoutMinutes));
    }

    if (this.isExpired(referenceDate)) {
      return Err(new ActiveStreamExpiredError());
    }

    const expiresAt = ActiveStream.computeExpiration(referenceDate, timeoutMinutes);

    return Ok(
      new ActiveStream(
        this.id,
        this.profileId,
        this.accountId,
        this.videoId,
        this.startedAt,
        expiresAt,
        referenceDate
      )
    );
  }

  isExpired(referenceDate: Date = new Date()): boolean {
    return this.expiresAt.getTime() <= referenceDate.getTime();
  }

  belongsToAccount(accountId: string): boolean {
    return this.accountId === accountId;
  }

  isForProfile(profileId: string): boolean {
    return this.profileId === profileId;
  }

  toPrimitives(): ActiveStreamPrimitives {
    return {
      id: this.id,
      profileId: this.profileId,
      accountId: this.accountId,
      videoId: this.videoId,
      startedAt: this.startedAt,
      expiresAt: this.expiresAt,
      updatedAt: this.updatedAt,
    };
  }

  private static isValidTimeout(timeoutMinutes: number): boolean {
    return (
      Number.isFinite(timeoutMinutes) &&
      timeoutMinutes >= MIN_TIMEOUT_MINUTES &&
      timeoutMinutes <= MAX_TIMEOUT_MINUTES
    );
  }

  private static computeExpiration(start: Date, timeoutMinutes: number): Date {
    const expiresAt = new Date(start.getTime());
    expiresAt.setMinutes(expiresAt.getMinutes() + timeoutMinutes);
    return expiresAt;
  }
}
