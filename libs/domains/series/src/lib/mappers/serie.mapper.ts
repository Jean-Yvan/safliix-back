
import { Serie } from "../domain/entities/serie.entity";

import { VideoMetadataMapper} from "@safliix-back/contents";
import { SerieWithRelations, SerieWithMetadataAndSeasonCount, CreateToPrisma, UpdateToPrisma } from "@safliix-back/database";

export class SerieMapper {
  static toDomain(
    data: SerieWithRelations | SerieWithMetadataAndSeasonCount
  ): Serie {
    return Serie.restore(data)
  }

  static toPrismaCreate(serie: Serie): CreateToPrisma<"Series"> {
    return {
      rentalPrice: serie.rentalPrice ?? null,
      metadata: {
        create: VideoMetadataMapper.toPrismaCreate(serie.metadata), // délégué
      },
      type : serie.type,
      seasonCount: serie.seasonCount
    };
  }

  static toPrismaUpdate(id:string,serie:Serie): UpdateToPrisma<"Series">{
    return {
      where:{id},
      data:{
        rentalPrice: serie.rentalPrice ?? null,
        metadata: {
          update: VideoMetadataMapper.toPrismaUpdate(serie.metadata.id!,serie.metadata), // délégué
        },
        type : serie.type,
        seasonCount: serie.seasonCount
      }
    }
  }


  
}
