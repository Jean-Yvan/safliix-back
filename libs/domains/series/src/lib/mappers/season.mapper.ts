import { Prisma } from "@safliix-back/database";
import { Season } from "../domain/entities/season.entity";
import { Episode } from "../domain/entities/episode.entity";
import { VideoFile, VideoMetadata } from "@safliix-back/contents";
import { Result, Err, Ok } from "oxide.ts";

export class SeasonMapper{

  toDomain (prismaSeason: Prisma.SeasonGetPayload<{
    include: {
      episodes: {
        include: {
          videoFile: true;
          metadata: {
            include: {
              format: true;
              category: true;
              actors: {
                include: {
                  actor: true;
                };
              };
            };
          };
        };
      };
    };
  }>): Result<Season, Error> {
    try {
      const season = new Season(
        prismaSeason.id,
        prismaSeason.number,
        prismaSeason.seriesId
      );

      if (prismaSeason.episodes) {
        prismaSeason.episodes.forEach(ep => {
          const videoFile = VideoFile.fromPrisma(ep.videoFile);
          if (videoFile.isErr()) {
            return Err(new Error(`Failed to map Episode video file: ${videoFile.unwrapErr().message}`));
          }
          const episode = new Episode(
            ep.id,
            ep.metadata.title,
            ep.seasonId,
            ep.number,
            videoFile.unwrap(),
            VideoMetadata.fromPrisma(ep.metadata).unwrap()
          );
          season.addEpisode(episode);
        });
      }

      return Ok(season);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Season mapping failed'));
    }
  }
}