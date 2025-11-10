// domain/mappers/user-video-view.mapper.ts
import { UserVideoView } from "../entities/user-video-view";
import { CreateToPrisma, UpdateToPrisma, UserVideoViewWithRelation } from "@safliix-back/database";

export class UserVideoViewMapper {

  static toDomain(prismaUserVideoView: UserVideoViewWithRelation): UserVideoView {
    return UserVideoView.restore(prismaUserVideoView);
  }

  static toPrismaCreate(userVideoView: UserVideoView): CreateToPrisma<"UserVideoView"> {
    return {
      userId: userVideoView.userId,
      videoId: userVideoView.videoId,
      profileId: userVideoView.profileId,
      progress: userVideoView.progress,
      completed: userVideoView.completed,
      country: userVideoView.country,
      device: userVideoView.device,
      rating: userVideoView.rating,
      startedAt: userVideoView.startedAt,
      endedAt: userVideoView.endedAt,
    };
  }

  static toPrismaUpdate(id: string, userVideoView: UserVideoView): UpdateToPrisma<"UserVideoView"> {
    return {
      where: { id },
      data: {
        progress: userVideoView.progress,
        completed: userVideoView.completed,
        rating: userVideoView.rating,
        endedAt: userVideoView.endedAt,
        // Note: Les champs suivants sont généralement immuables après création
        // userId, videoId, profileId, country, device, startedAt
        // On ne les inclut donc pas dans l'update
      }
    };
  }
}