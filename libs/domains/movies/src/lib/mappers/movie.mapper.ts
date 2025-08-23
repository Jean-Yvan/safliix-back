import { MovieWithRelations, MovieToPrisma } from '@safliix-back/database';
import { InvalidFormatError, VideoMetadataMapper, VideoFileMapper } from '@safliix-back/contents';
import { Result,Err,Ok } from 'oxide.ts';
import { MissingRequiredFieldError, InvalidActorError, InvalidDurationError, MoviePremiereRequiresPriceError } from '../errors/movie.errors';
import { MovieAggregate } from '../domain/entities/movie.aggregate';


export class MovieMapper {
  static toDomain(
    data: MovieWithRelations,
  ): Result<MovieAggregate, MoviePremiereRequiresPriceError | InvalidDurationError | MissingRequiredFieldError | InvalidActorError | InvalidFormatError> {
    
    
    const metadataResult = VideoMetadataMapper.toDomain(data.metadata);
    const videoFileRsult = VideoFileMapper.toDomain(data.videoFile);
    if(metadataResult.isErr()){
      return Err(metadataResult.unwrapErr());
    }
    if(videoFileRsult.isErr()){
      return Err(videoFileRsult.unwrapErr());
    }

  
    // 2. Création de l'agrégat MovieAggregate

    const rentalPrice = data.rentalPrice == null ? 0 : data.rentalPrice;
    const movie = MovieAggregate.restore({
      id:data.id,
      metadata: metadataResult.unwrap(),
      videoFile: videoFileRsult.unwrap(),
      rentalPrice: rentalPrice,
      status: data.status,
      type: data.type
    });

    return Ok(movie);
  }

  static toPrisma(data: MovieAggregate): MovieToPrisma {
    return {
      id: data.id, // Si l'id est undefined, Prisma le générera
      metadata: {
        create: VideoMetadataMapper.toPrisma(data.metadata),
      },
      videoFile: {
        create: VideoFileMapper.toPrisma(data.videoFile),
      },
      rentalPrice: data.rentalPrice,
      status: data.status,
      type: data.type,
    }
  }
}