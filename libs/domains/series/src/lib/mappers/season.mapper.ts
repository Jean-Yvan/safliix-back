import { Season } from "../domain/entities/season.entity";
import { Episode } from "../domain/entities/episode.entity";
import { VideoFile, VideoMetadata } from "@safliix-back/contents";
import { Result, Err, Ok } from "oxide.ts";
import { SeasonWithRelations,SeasonToPrisma } from "@safliix-back/database";
export class SeasonMapper{

  static toDomain (prismaSeason: SeasonWithRelations): Result<Season, Error> {
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

  static toPrisma(season: Season, includeEpisodes = false): SeasonToPrisma {
    const data: SeasonToPrisma = {
      id: season.id,
      number: season.number,
      serieId: season.serieId,
      title: season.title,
    };

    if (includeEpisodes && season.episodes.length > 0) {
      data.episodes = {
        create: season.episodes.map((ep) => ({
          id: ep.id,
          number: ep.number,
          seasonId: ep.seasonId,
          title: ep.title,
          videoFileId: ep.videoFile?.id,
          metadataId: ep.metadata?.id
        })),
      };
    }

    return data;
  }

}