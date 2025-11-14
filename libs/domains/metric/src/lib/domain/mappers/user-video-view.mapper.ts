import { UserVideoView } from '../entities/user-video-view.entity';
import { UserVideoViewToPrisma } from '@safliix-back/database';

export class UserVideoViewMapper {
  static toDomain(props: UserVideoViewToPrisma): UserVideoView {
    return UserVideoView.restore(props);
  }

  static toPrisma(entity: UserVideoView): UserVideoViewToPrisma {
    return {
      id: entity.id,
      videoId: entity.videoId,
      userId: entity.userId,
      profileId: entity.profileId,
      progress: entity.progress,
      completed: entity.completed,
      country: entity.country,
      device: entity.device,
      rating: entity.rating,
      startedAt: entity.startedAt ?? undefined,
      endedAt: entity.endedAt ?? undefined,
    };
  }
}
