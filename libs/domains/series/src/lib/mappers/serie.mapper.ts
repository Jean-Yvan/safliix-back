
import { Serie } from "../domain/entities/serie.entity";
import { Season } from "../domain/entities/season.entity";
import { Episode } from "../domain/entities/episode.entity";
import { VideoFileMapper, VideoMetadataMapper} from "@safliix-back/contents";
import { Result, Err,Ok } from "oxide.ts";
import { SerieWithRelations, SerieWithMetadataAndSeasonCount, SerieToPrisma } from "@safliix-back/database";

export class SerieMapper {
  static toDomain(
    data: SerieWithRelations | SerieWithMetadataAndSeasonCount
  ): Result<Serie, Error> {
    const metadata = VideoMetadataMapper.toDomain(data.metadata);
    if (metadata.isErr()) {
      return Err(
        new Error(
          `Failed to map Serie metadata: ${metadata.unwrapErr().message}`,
        ),
      );
    }

    const serie = new Serie(
      data.id, 
      metadata.unwrap(), 
      data.rentalPrice,
      data.seasonCount,
      data.type,
      data.status      
    );

    // Cas 1 : on a seasons (SerieWithRelations)
    if ("seasons" in data && data.seasons) {
      this.mapSeasons(data, serie);
    }

    // Cas 2 : on a juste le count (SerieWithMetadataAndSeasonCount)
    if ("_count" in data && data._count) {
      serie.seasonCount = data._count.seasons;
    }

    return Ok(serie);
  }

  static toPrisma(serie: Serie): SerieToPrisma {
    const id = serie.id == null ? undefined : serie.id;
    return {
      id: id ,
      rentalPrice: serie.rentalPrice ?? null,
      metadata: {
        create: VideoMetadataMapper.toPrisma(serie.metadata), // délégué
      },
      status : serie.status,
      type : serie.type,
      seasonCount: serie.seasonCount
};
}


  private static mapSeasons(
    data: SerieWithRelations,
    serie: Serie,
  ): void {
    data.seasons.forEach((s) => {
      const season = new Season(s.id, s.number, data.id);

      if (s.episodes) {
        s.episodes.forEach((ep) => {
          const videoFile = VideoFileMapper.toDomain(ep.videoFile);
          if (videoFile.isErr()) {
            throw new Error(
              `Failed to map Episode video file: ${videoFile.unwrapErr().message}`,
            );
          }

          const episode = new Episode(
            ep.id,
            ep.metadata.title,
            ep.seasonId,
            ep.number,
            videoFile.unwrap(),
            VideoMetadataMapper.toDomain(ep.metadata).unwrap(),
          );
          season.addEpisode(episode);
        });
      }

      serie.addSeason(season);
    });
  }
}
