import { UserVideoViewToPrisma } from "@safliix-back/database";
import { UserVideoProgressDto } from "../../interfaces/user-progress-video.dto";
import { Result,Err,Ok } from "oxide.ts";

export class UserVideoView {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly profileId: string | null,
    public readonly videoId: string,
    public readonly progress = 0,
    public readonly completed = false,
    public readonly country: string | null,
    public readonly device: string | null,
    public readonly rating: number | null,
    public readonly startedAt: Date,
    public readonly endedAt: Date,
    public readonly createdAt: Date | undefined,
    public readonly updatedAt: Date | undefined,

  ) {}

  static create(params: UserVideoProgressDto): Result<UserVideoView, Error> {
    
    if ((params.progress ?? 0) < 0) {
      return  Err(new Error('Progress seconds cannot be negative'));
    }

    if (params.rating !== undefined && (params.rating < 0 || params.rating > 5)) {
      return Err(new Error('Rating must be between 0 and 5'));
    }

    if (params.endedAt < params.startedAt) {
      return Err(new Error('endedAt must be after startedAt'));
    }

    const profileId = params.profileId ?? null;
    const country = params.country ?? null;
    const device = params.device ?? null;
    const uvp =  new UserVideoView(
      undefined,
      params.userId,
      profileId,
      params.videoId,
      params.progress ?? 0,
      params.isFinished ?? false,
      country,
      device,
      params.rating ?? null,
      params.startedAt,
      params.endedAt,
      undefined,
      undefined,
      
    );

    return Ok(uvp);
  }

  static restore(props: UserVideoViewToPrisma): UserVideoView {
    return new UserVideoView(
      props.id,
      props.userId,
      props.profileId,
      props.videoId,
      props.progress,
      props.completed,
      props.country,
      props.device,
      props.rating,
      props.startedAt,
      props.endedAt,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(
    ));
  }
}
