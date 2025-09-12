import { AggregateRoot } from '@nestjs/cqrs';
import { VideoMetadata,VideoFile,VideoCategory,VideoFormat,VideoGender } from '@safliix-back/contents';
import { Result,Ok,Err } from 'oxide.ts';
import { CreateMovieDto } from '../../interface/rest/dto/create-movie.dto';
import { UpdateMovieDto } from '../../interface/rest/dto/update-movie.dto';
import { ContentStatus } from '@safliix-back/common';

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
    public readonly  videoFile: VideoFile,
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
    const videoFileResult = VideoFile.create(
      undefined,
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

   
    const movie = new MovieAggregate(
      undefined,
      metadataResult.unwrap(),
      videoFileResult.unwrap(),
      data.status,
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
  if (payload.movieUrl) {
    const fileResult = this.videoFile.setFilePath(payload.movieUrl);
    if (fileResult.isErr()) {
      return Err(fileResult.unwrapErr());
    }
  }

  if (payload.duration !== undefined) {
    if (payload.duration <= 0) {
      return Err(new InvalidDurationError());
    }
    (this.videoFile as any)._duration = payload.duration; // tu peux ajouter un setter plus propre dans VideoFile
  }

  if (payload.thrailerPath !== undefined) {
    (this.videoFile as any)._trailerPath = payload.thrailerPath;
  }



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

