import { Inject, Injectable } from "@nestjs/common";
import { Err, Ok, Result } from "oxide.ts";

import { ActiveStream } from "../domain/entities/active-stream.entity";
import type { ActiveStreamRepository } from "../domain/ports/active-stream.repository";
import { ACTIVE_STREAM_REPOSITORY } from "../utils/types";

export class TooManyActiveStreamsError extends Error {
  constructor(public readonly maxAllowed: number) {
    super(`Maximum simultaneous streams (${maxAllowed}) reached for this account.`);
    this.name = "TooManyActiveStreamsError";
  }
}

export class ActiveStreamNotFoundError extends Error {
  constructor(public readonly profileId: string) {
    super(`No active stream found for profile ${profileId}.`);
    this.name = "ActiveStreamNotFoundError";
  }
}

type StartStreamParams = {
  profileId: string;
  accountId: string;
  videoId: string | null;
  timeoutMinutes: number;
  maxAllowedStreams: number;
};

type HeartbeatParams = {
  profileId: string;
  timeoutMinutes: number;
};

@Injectable()
export class ActiveStreamService {
  constructor(
    @Inject(ACTIVE_STREAM_REPOSITORY)
    private readonly repository: ActiveStreamRepository
  ) {}

  async startStream(params: StartStreamParams): Promise<Result<ActiveStream, Error>> {
    if (params.maxAllowedStreams <= 0) {
      return Err(new TooManyActiveStreamsError(params.maxAllowedStreams));
    }

    const existingStream = await this.repository.findActiveByProfileId(params.profileId);
    const activeCount = await this.repository.countActiveByAccount(params.accountId);
    const effectiveCount = existingStream ? Math.max(0, activeCount - 1) : activeCount;

    if (effectiveCount >= params.maxAllowedStreams) {
      return Err(new TooManyActiveStreamsError(params.maxAllowedStreams));
    }

    const streamResult = ActiveStream.create({
      profileId: params.profileId,
      accountId: params.accountId,
      videoId: params.videoId,
      timeoutMinutes: params.timeoutMinutes,
    });

    if (streamResult.isErr()) {
      return streamResult;
    }

    const saved = await this.repository.save(streamResult.unwrap());
    return Ok(saved);
  }

  async heartbeat(params: HeartbeatParams): Promise<Result<ActiveStream, Error>> {
    const current = await this.repository.findActiveByProfileId(params.profileId);
    if (!current) {
      return Err(new ActiveStreamNotFoundError(params.profileId));
    }

    const renewedResult = current.updateExpiration(params.timeoutMinutes);
    if (renewedResult.isErr()) {
      return renewedResult;
    }

    const saved = await this.repository.save(renewedResult.unwrap());
    return Ok(saved);
  }

  async stop(profileId: string): Promise<void> {
    await this.repository.deleteByProfileId(profileId);
  }

  async cleanupExpired(referenceDate?: Date): Promise<number> {
    return this.repository.deleteExpired(referenceDate);
  }
}
