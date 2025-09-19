import { AggregateRoot } from '@nestjs/cqrs';
import { VideoMetadata,VideoCategory,VideoFormat,VideoGender } from '@safliix-back/contents';
import { Result,Ok,Err } from 'oxide.ts';
import { CreateMovieDto } from '../../interface/rest/dto/create-movie.dto';
import { UpdateMovieDto } from '../../interface/rest/dto/update-movie.dto';
import { ContentStatus } from '@safliix-back/common';
import { VideoAttachment } from '@safliix-back/video';
import { MovieWithRelations } from '@safliix-back/database';

//import { MoviePublishedEvent } from '../events/movie-published.event';




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
    public readonly  attachments: VideoAttachment[],
    public status: ContentStatus = ContentStatus.DRAFT,
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

    this.status = ContentStatus.PUBLISHED;
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

    const formatResult = VideoFormat.create(
      undefined,
      data.format,
      ''
    );

    const genderResult = VideoGender.create({name:data.gender});


    if (categoryResult.isErr()) {
      return Err(categoryResult.unwrapErr());
    }

    if (formatResult.isErr()) {
      return Err(formatResult.unwrapErr());
    }

    if(genderResult.isErr()){
      return Err(genderResult.unwrapErr());
    }
    const metadataResult = VideoMetadata.create(
      undefined,
      data.title,
      data.description,
      data.thumbnailUrl,
      data.productionHouse,
      data.productionCountry,
      data.status,
      data.director,
      data.secondaryImageUrl ?? '',
      new Date(data.releaseDate),
      new Date(data.plateformDate),
      categoryResult.unwrap(),
      formatResult.unwrap(),
      genderResult.unwrap(),
      data.actors
    );
    
    if (metadataResult.isErr()) {
      return Err(metadataResult.unwrapErr());
    }

    

   
    const movie = new MovieAggregate(
      undefined,
      metadataResult.unwrap(),
      [],
      data.status,
      data.rentalPrice || 0,
      data.type
    );

    

    

    return Ok(movie);
  }
  
  static restore(data: MovieWithRelations): MovieAggregate {

    const s = data.status == "DRAFT" ? ContentStatus.DRAFT : ContentStatus.PUBLISHED;
    const movie = new MovieAggregate(
      data.id,
      VideoMetadata.restore(data.metadata),
      data.videoAttachment.map(va => VideoAttachment.restore(va)),
      s,
      data.rentalPrice ?? 0,
      data.type
    );
    
    return movie;
  }

  updateWith(payload: UpdateMovieDto): Result<MovieAggregate, Error> {
  // Mise à jour metadata
  const formatResult = payload.format ? this.metadata.format?.updateWith({format:payload.format}) : null;
  
  if(formatResult && formatResult.isErr()){
    return Err(formatResult.unwrapErr());
  }

  const categoryResult = payload.category ? this.metadata.category.updateWith({category:payload.category}) : null;
  if(categoryResult && categoryResult.isErr()){
    return Err(categoryResult.unwrapErr());
  }

  const gender = payload.gender ? this.metadata.gender.updateWith(payload.gender) : this.metadata.gender;
  const category = categoryResult?.unwrap() ?? this.metadata.category;
  const format = formatResult?.unwrap() ?? this.metadata.format;
  //let actors = [];

  
  const metadataUpdateResult = this.metadata.updateWith({
    title: payload.title ?? this.metadata.title,
    description: payload.description ?? this.metadata.description,
    thumbnailUrl: payload.thumbnailUrl ?? this.metadata.thumbnailUrl,
    secondaryImage: payload.secondaryImageUrl ?? this.metadata.secondaryImage,
    releaseDate: payload.releaseDate ? new Date(payload.releaseDate) : this.metadata.releaseDate,
    platformDate: payload.plateformDate ? new Date(payload.plateformDate) : this.metadata.platformDate,
    productionHouse: payload.productionHouse ?? this.metadata.productionHouse,
    director: payload.director ?? this.metadata.director,
    category: category,
    format: format ?? undefined ,
    gender,
    actors: payload.actors,
  });

  if (metadataUpdateResult.isErr()) {
    return Err(metadataUpdateResult.unwrapErr());
  }

  // Mise à jour fichier vidéo
  


  // Mise à jour du prix
  if (payload.rentalPrice !== undefined) {
    const priceResult = this.setRentalPrice(payload.rentalPrice);
    if (priceResult.isErr()) {
      return Err(priceResult.unwrapErr());
    }
  }

  // Mise à jour du statut
  if (payload.status) {
    this.status = payload.status;
  }

  // Mise à jour du type
  if (payload.type !== undefined) {
    this.type = payload.type;
  }

  return Ok(this);
}

}

