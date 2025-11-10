import { IEvent } from '@nestjs/cqrs';

export class UserVideoViewCreatedEvent implements IEvent {
  constructor(
    public readonly viewId: string,
    public readonly userId: string,
    public readonly videoId: string,
    public readonly profileId: string,
    public readonly startedAt: Date,
  ) {}
}

// domain/events/impl/video-completed.event.ts
export class VideoCompletedEvent implements IEvent {
  constructor(
    public readonly viewId: string,
    public readonly userId: string,
    public readonly videoId: string,
    public readonly completedAt: Date,
    public readonly totalWatchTime: number,
  ) {}
}

// domain/events/impl/watch-progress-updated.event.ts
export class WatchProgressUpdatedEvent implements IEvent {
  constructor(
    public readonly viewId: string,
    public readonly userId: string,
    public readonly videoId: string,
    public readonly progress: number,
    public readonly updatedAt: Date,
  ) {}
}

// domain/events/impl/video-rated.event.ts
export class VideoRatedEvent implements IEvent {
  constructor(
    public readonly viewId: string,
    public readonly userId: string,
    public readonly videoId: string,
    public readonly rating: number,
    public readonly ratedAt: Date,
  ) {}
}