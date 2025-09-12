import { Episode } from "../domain/entities/episode.entity";
import { EpisodeWithRelations, CreateToPrisma, UpdateToPrisma } from "@safliix-back/database";
import { VideoFileMapper } from "@safliix-back/contents"
import { mapConnect } from "@safliix-back/common";

export class EpisodeMapper {
  static toDomain(
    prismaEpisode: EpisodeWithRelations
  ): Episode {
   return Episode.restore(prismaEpisode);
  }

  static toPrismaCreate(episode: Episode): CreateToPrisma<"Episode"> {
    return {
      number: episode.number,
      season: mapConnect(episode.seasonId),
      videoFile: {
        create: VideoFileMapper.toPrismaCreate(episode.videoFile),
        
      },
      title: episode.title ?? null,
      isSaFliixProd: episode.isSaFliixProd,
      plateformeDAte: episode.plateformDate,
      releaseDate: episode.releaseDate,
      director: episode.director,
      description: episode.description
      
    };
  }

  static toPrismaUpdate(id:string,episode: Episode) : UpdateToPrisma<"Episode"> {
    return {
      where: {id},
      data: {
        number: episode.number,
        season: mapConnect(episode.seasonId),
        //videoFile: mapConnect(episode.videoFile.id!),
        title: episode.title ?? null,
        isSaFliixProd: episode.isSaFliixProd,
        plateformeDAte: episode.plateformDate,
        releaseDate: episode.releaseDate,
        director: episode.director,
        description: episode.description
      }
    }
  }
}

 

