import { AggregateRoot } from '@nestjs/cqrs';
import { VideoMetadata,VideoFile,VideoCategory,VideoFormat } from '@safliix-back/contents';
import { Result,Ok,Err } from 'oxide.ts';
import { CreateMovieDto } from '../../interface/rest/dto/create-movie.dto';

//import { MoviePublishedEvent } from '../events/movie-published.event';

export type MovieStatus = 'DRAFT' | 'PUBLISHED';
export type MovieActor = { actorId: string; name: string; role?: string };

export class InvalidDurationError extends Error {
  constructor() {
    super('Duration must be positive');
    this.name = 'InvalidDurationError';
  }
}


export class MovieAggregate extends AggregateRoot {
  update(payload: { title?: string; status?: "DRAFT" | "PUBLISHED"; }) {
    throw new Error('Method not implemented.');
  }
  
  
  private constructor(
    public readonly id: string | undefined,
    public readonly metadata: VideoMetadata,
    public readonly  videoFile: VideoFile,
    public status: MovieStatus = 'DRAFT',
    public rentalPrice: number,
    public type: string
    
  ) {
    super();
  }

  // === Méthodes Métier ===
  publishMovie(publicationDate: Date = new Date()): Result<void, Error> {
    if (this.status === 'PUBLISHED') {
      return Err(new Error('MOVIE_ALREADY_PUBLISHED'));
    }

    /* if (!this._metadata.isCompleteForPublishing()) {
      return Err(new Error('INCOMPLETE_METADATA_FOR_PUBLISHING'));
    } */

    this.status = 'PUBLISHED';
    //this.addDomainEvent(new MoviePublishedEvent(this.id, publicationDate));
    
    return Ok(undefined);
  }

  setRentalPrice(price: number): Result<void, Error> {
    if (price <= 0) return Err(new Error('INVALID_PRICE'));
    
    
    this.rentalPrice = price;
    return Ok(undefined);
  }

  

  // === Factory Method ===
  static create(data:CreateMovieDto): Result<MovieAggregate, Error> {

    const categoryResult = VideoCategory.create(
      undefined,
      data.category,
      ''
    );

    if (categoryResult.isErr()) {
      return Err(categoryResult.unwrapErr());
    }
    const metadataResult = VideoMetadata.create(
      null,
      data.title,
      data.description,
      data.thumbnailUrl,
      data.productionHouse,
      data.director,
      data.secondaryImageUrl ?? '',
      new Date(data.releaseDate),
      new Date(data.plateformDate),
      categoryResult.unwrap(),
      
    );
    const videoFileResult = VideoFile.create(
      null,
      data.movieUrl,
      data.duration,
      data.thumbnailUrl,
      0,
      0
      
    );
    if (metadataResult.isErr()) {
      return Err(metadataResult.unwrapErr());
    }

    if (videoFileResult.isErr()) {
      return Err(videoFileResult.unwrapErr());
    }

    const status: MovieStatus = data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    const movie = new MovieAggregate(
      undefined,
      metadataResult.unwrap(),
      videoFileResult.unwrap(),
      status,
      data.rentalPrice || 0,
      data.type
    );

    

    

    return Ok(movie);
  }
  
  static restore(props: {
    id: string;
    metadata: VideoMetadata;
    videoFile: VideoFile;
    rentalPrice: number;
    status : string;
    type : string;
  }): MovieAggregate {

    const s = props.status == "DRAFT" ? 'DRAFT' : 'PUBLISHED'
    const movie = new MovieAggregate(
      props.id,
      props.metadata,
      props.videoFile,
      s,
      props.rentalPrice,
      props.type
    );
    
    return movie;
  }
}

