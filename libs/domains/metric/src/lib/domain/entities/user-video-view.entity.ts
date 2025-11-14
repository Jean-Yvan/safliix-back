import { UserVideoViewToPrisma } from '@safliix-back/database';
import { Result, Err, Ok } from 'oxide.ts';
import { UserVideoProgressDto } from '../../interfaces/user-progress-video.dto';

export class UserVideoView {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly profileId: string | null,
    public readonly videoId: string,
    public readonly progress: number,
    public readonly completed: boolean,
    public readonly country: string | null,
    public readonly device: string | null,
    public readonly rating: number | null,
    public readonly startedAt: Date | null,
    public readonly endedAt: Date | null,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined,
  ) {}

  static create(params: UserVideoProgressDto): Result<UserVideoView, Error> {
    if ((params.progress ?? 0) < 0) {
      return Err(new Error('Progress seconds cannot be negative'));
    }

    if (params.rating !== undefined && (params.rating < 0 || params.rating > 5)) {
      return Err(new Error('Rating must be between 0 and 5'));
    }

    if (params.startedAt && params.endedAt && params.endedAt < params.startedAt) {
      return Err(new Error('endedAt must be after startedAt'));
    }

    const view = new UserVideoView(
      params.id,
      params.userId,
      params.profileId ?? null,
      params.videoId,
      params.progress ?? 0,
      params.isFinished ?? false,
      params.country ?? null,
      params.device ?? null,
      params.rating ?? null,
      params.startedAt ?? null,
      params.endedAt ?? null,
      undefined,
      undefined,
    );

    return Ok(view);
  }

  static restore(props: UserVideoViewToPrisma): UserVideoView {
    return new UserVideoView(
      props.id,
      props.userId,
      props.profileId ?? null,
      props.videoId,
      props.progress ?? 0,
      props.completed ?? false,
      props.country ?? null,
      props.device ?? null,
      props.rating ?? null,
      props.startedAt ?? null,
      props.endedAt ?? null,
      props.createdAt,
      props.updatedAt,
    );
  }
}
