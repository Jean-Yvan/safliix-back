import { UserVideoView } from '../entities/user-video-view.entity';
import { UserVideoViewToPrisma } from '@safliix-back/database';

export class VideoViewMapper {

  // Reconstruction à partir de Prisma, sans validation
  static toDomain(props: UserVideoViewToPrisma): UserVideoView {
    return UserVideoView.restore(props);
      
  }

  
  

  // Conversion en objet Prisma pour persistance
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
      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      rating: entity.rating,
    };
  }
}
