import { Prisma } from "@safliix-back/database";
import { Serie } from "../domain/entities/serie.entity";
import { Season } from "../domain/entities/season.entity";
import { Episode } from "../domain/entities/episode.entity";
import { VideoFile, VideoMetadata } from "@safliix-back/contents";
import { Result, Err,Ok } from "oxide.ts";

export class SerieMapper {
  static toDomain(
    data: Prisma.SeriesGetPayload<{
      include: {
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
        seasons: {
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
                  }
                };

              }
            };
          };
        };
      };
    }>
  ): Result<Serie,Error> {
    // Création de la Serie
    const metadata = VideoMetadata.fromPrisma(data.metadata);
    if(metadata.isErr()) {
      return Err(new Error(`Failed to map Serie metadata: ${metadata.unwrapErr().message}`));
    }
    const serie = new Serie(
      data.id,
      metadata.unwrap()
    );

    // Ajout des saisons et épisodes
    if (data.seasons) {
      data.seasons.forEach(s => {
        const season = new Season(
          s.id, 
          s.number,
          data.id,
        );

        if (s.episodes) {
          s.episodes.forEach(ep => {
            const videoFile = VideoFile.fromPrisma(ep.videoFile);
            if (videoFile.isErr()) {
              Err(new Error(`Failed to map Episode video file: ${videoFile.unwrapErr().message}`));
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

        serie.addSeason(season);
      });
    }

    return Ok(serie);
  }
}
