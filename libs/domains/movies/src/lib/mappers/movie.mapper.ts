import { MovieWithRelations, MovieToPrisma, CreateToPrisma, UpdateToPrisma } from '@safliix-back/database';
import { VideoMetadataMapper, VideoFileMapper } from '@safliix-back/contents';

import { MovieAggregate } from '../domain/entities/movie.aggregate';


export class MovieMapper {
  static toDomain(
    data: MovieWithRelations,
  ): MovieAggregate {
    
    
    const metadataResult = VideoMetadataMapper.toDomain(data.metadata);
    const videoFileRsult = VideoFileMapper.toDomain(data.videoFile);
    

  
    // 2. Création de l'agrégat MovieAggregate

    const rentalPrice = data.rentalPrice == null ? 0 : data.rentalPrice;
    const movie = MovieAggregate.restore({
      id:data.id,
      metadata: metadataResult,
      videoFile: videoFileRsult,
      rentalPrice: rentalPrice,
      status: data.status,
      type: data.type
    });

    return movie;
  }

  static toPrismaCreate(data: MovieAggregate): CreateToPrisma<"Movie"> {
    return {
      metadata: {
        create: VideoMetadataMapper.toPrismaCreate(data.metadata),
      },
      videoFile: {
        create: VideoFileMapper.toPrismaCreate(data.videoFile),
      },
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
      videoFile: {
        create: VideoFileMapper.toPrismaCreate(data.videoFile),
      },
      rentalPrice: data.rentalPrice,
      status: data.status,
      type: data.type,
      }
    }
  }
}