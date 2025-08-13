import { Episode } from "../domain/entities/episode.entity";
import { VideoFile, VideoMetadata } from "@safliix-back/contents";
import { Prisma } from "@safliix-back/database";
import { Err, Ok, Result } from "oxide.ts";


export class EpisodeMapper {
  static toDomain(
    prismaEpisode: Prisma.EpisodeGetPayload<{
      include: { 
        metadata: { 
          include: { 
            format: true; 
            category: true,
            actors: {
              include:{
                actor:true
              }
            } 
          } 
        },
        videoFile: true 
      }
    }>
  ): Result<Episode, Error> {
    try {
      const metadataResult = prismaEpisode.metadata 
        ? VideoMetadata.fromPrisma(prismaEpisode.metadata)
        : undefined;

      if (metadataResult?.isErr()) {
        return Err(metadataResult.unwrapErr());
      }

      const videoFile = VideoFile.fromPrisma(prismaEpisode.videoFile);
      if (videoFile.isErr()) {
        return Err(videoFile.unwrapErr());
      }

      return Ok(new Episode(
        prismaEpisode.id,
        prismaEpisode.metadata.title,
        prismaEpisode.seasonId,
        prismaEpisode.number,
        videoFile.unwrap(),
        metadataResult?.unwrap()
      ));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Episode mapping failed'));
    }
  }

  static toPrisma(episode: Episode): Prisma.EpisodeCreateInput {
    return {
      //id: episode.id,
      number: episode.number,
      season: { connect: { id: episode.seasonId } },
      metadata: { connect: { id: episode.metadata?.id } },
      videoFile: { connect: { id: episode.videoFile.id } },
      
    };
  }
}