import { Episode } from "../domain/entities/episode.entity";
import { EpisodeWithRelations, EpisodeToPrisma } from "@safliix-back/database";
import { Err, Ok, Result } from "oxide.ts";
import { VideoMetadataMapper,VideoFileMapper } from "@safliix-back/contents"

export class EpisodeMapper {
  static toDomain(
    prismaEpisode: EpisodeWithRelations
  ): Result<Episode, Error> {
    try {
      const metadataResult = prismaEpisode.metadata 
        ? VideoMetadataMapper.toDomain(prismaEpisode.metadata)
        : undefined;

      if (metadataResult?.isErr()) {
        return Err(metadataResult.unwrapErr());
      }

      const videoFile = VideoFileMapper.toDomain(prismaEpisode.videoFile);
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

  static toPrisma(episode: Episode): EpisodeToPrisma {
    const prismaEpisode: EpisodeToPrisma = {
      number: episode.number,
      season: { connect: { id: episode.seasonId } },
      videoFile: {
        create: VideoFileMapper.toPrisma(episode.videoFile),
        
      },
      title: episode.title,
      metadata: undefined as any, // placeholder, will be set below
    };

    if (episode.metadata) {
      prismaEpisode.metadata = {
        create: VideoMetadataMapper.toPrisma(episode.metadata),
      };
    } 

    return prismaEpisode;
  }
}

 

