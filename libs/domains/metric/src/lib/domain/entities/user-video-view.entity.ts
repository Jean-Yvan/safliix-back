import { UserVideoViewWithRelation } from '@safliix-back/database';
import { Err, Ok, Result } from 'oxide.ts';

export class UserVideoView {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly videoId: string,
    public readonly profileId: string | undefined,
    public readonly country: string | undefined,
    public readonly device: string | undefined,
    public progress: number,
    public completed: boolean,
    public rating: number | null,
    public startedAt: Date | undefined,
    public endedAt: Date | undefined,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined,
  ) {}

  static create(params: {
    userId: string;
    videoId: string;
    profileId?: string;
    country?: string;
    device?: string;
    progress?: number;
    completed?: boolean;
    rating?: number;
    startedAt?: Date;
    endedAt?: Date;
  }): Result<UserVideoView, Error> {
    if (params.rating !== undefined && (params.rating < 0 || params.rating > 5)) {
      return Err(new Error('Rating must be between 0 and 5'));
    }

    const view = new UserVideoView(
      undefined,
      params.userId,
      params.videoId,
      params.profileId,
      params.country,
      params.device,
      params.progress ?? 0,
      params.completed ?? false,
      params.rating ?? null,
      params.startedAt ?? new Date(),
      params.endedAt,
      undefined,
      undefined,
    );

    return Ok(view);
  }

  static restore(props: UserVideoViewWithRelation): UserVideoView {
    return new UserVideoView(
      props.id,
      props.userId,
      props.videoId,
      props.profileId ?? undefined,
      props.country ?? undefined,
      props.device ?? undefined,
      props.progress ?? 0,
      props.completed ?? false,
      props.rating ?? null,
      props.startedAt ?? undefined,
      props.endedAt ?? undefined,
      props.createdAt ?? undefined,
      props.updatedAt ?? undefined,
    );
  }

  markAsCompleted(): void {
    this.completed = true;
    this.endedAt = new Date();
  }

  updateProgress(progress: number): void {
    if (progress < 0) {
      throw new Error('Progress cannot be negative');
    }
    this.progress = progress;
  }

  rate(rating: number): void {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    this.rating = rating;
  }
}
