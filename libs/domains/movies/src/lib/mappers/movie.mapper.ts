import { MovieWithRelations, CreateToPrisma, UpdateToPrisma } from '@safliix-back/database';
import { VideoMetadataMapper } from '@safliix-back/contents';

import { MovieAggregate } from '../domain/entities/movie.aggregate';


export class MovieMapper {
  static toDomain(
    data: MovieWithRelations,
  ): MovieAggregate {
    return MovieAggregate.restore(data)
  }

  static toPrismaCreate(data: MovieAggregate): CreateToPrisma<"Movie"> {
    return {
      metadata: {
        create: VideoMetadataMapper.toPrismaCreate(data.metadata),
      },
      // videoAttachment can be omitted or set to undefined if not provided
      rentalPrice: data.rentalPrice,
      status: data.status,
      type: data.type,
    }
  }

  static toPrismaUpdate(id:string,data:MovieAggregate): UpdateToPrisma<"Movie">{
    return {
      where: {id},
      data:{
        metadata: {
        create: VideoMetadataMapper.toPrismaCreate(data.metadata),
      },
      
      rentalPrice: data.rentalPrice,
      status: data.status,
      type: data.type,
      }
    }
  }
}