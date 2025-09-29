import { Result,Ok,Err } from 'oxide.ts';
import { VideoCategory } from './video-category.value-object';
import { VideoFormat } from './video-format.value-object';
import { MetadataWithRelations } from '@safliix-back/database';
import { VideoCategoryMapper } from '../mappers/video-category.mapper';
import { VideoFormatMapper } from '../mappers/video-format.mapper';
import { ContentStatus } from "@safliix-back/common";
import { VideoGender } from './video-gender.value-object';
import { VideoGenderMapper } from '../mappers/video-gender.mapper';
// Définition des erreurs métier

export class MissingRequiredFieldError extends Error {
  constructor(field: string) {
    super(`Missing required field: ${field}`);
    this.name = 'MissingRequiredFieldError';
  }
}


export class VideoMetadata {
  private constructor(
    public readonly id: string | undefined,
    public title: string,
    public description: string,
    public releaseDate: Date,
    public platformDate: Date,
    public productionHouse: string,
    public productionCountry: string,
    public status: ContentStatus,     
    public director: string,
    public category: VideoCategory,
    public format: VideoFormat | null,
    public gender: VideoGender,
    public actors: { name: string; role?: string; actorId?: string; id?: string }[] = []
  ) {}

  // === Factory ===
  static create(
    id: string | undefined,
    title: string,
    description: string,
    productionHouse: string,
    productionCountry: string,
    status = ContentStatus.DRAFT,
    director: string,
    releaseDate: Date,
    platformDate: Date,
    category: VideoCategory,
    format: VideoFormat | null,
    gender: VideoGender,
    actors?: { name: string; role?: string; actorId?: string }[],
  ): Result<VideoMetadata, MissingRequiredFieldError> {
    if (!title) {
      return Err(new MissingRequiredFieldError("title"));
    }

    const instance = new VideoMetadata(
      id,
      title,
      description,
      releaseDate,
      platformDate,
      productionHouse,
      productionCountry,
      status,
      director,
      category,
      format,
      gender
    );

    if (actors) {
      for (const actor of actors) {
        const actorResult = instance.addActor(actor);
        if (actorResult.isErr()) {
          return Err(actorResult.unwrapErr());
        }
      }
    }

    return Ok(instance);
  }

  static restore(data:MetadataWithRelations): VideoMetadata {
    const instance = new VideoMetadata(
      data.id,
      data.title,
      data.description,
      data.releaseDate,
      data.platformDate,
      data.productionHouse,
      data.productionCountry,
      data.status as ContentStatus,
      data.director,
      VideoCategoryMapper.toDomain(data.category),
      data.format ? VideoFormatMapper.toDomain(data.format) : null,
      VideoGenderMapper.toDomain(data.gender)
    );

    if (data.actors) {
      for (const actor of data.actors) {
        instance.addActor({name: actor.actor.name,actorId:actor.actor.name});
      }
    }

    return instance;
  }

  // === Update Method ===
  updateWith(data: {
    title?: string;
    description?: string;
    releaseDate?: Date;
    platformDate?: Date;
    productionHouse?: string;
    productionCountry?:string;
    status?: ContentStatus;
    director?: string;
    category?: VideoCategory;
    format?: VideoFormat;
    gender?: VideoGender;
    actors?: { name: string; role?: string; actorId?: string }[];
  }): Result<VideoMetadata, MissingRequiredFieldError | Error> {
    if (data.title !== undefined) {
      if (!data.title) {
        return Err(new MissingRequiredFieldError("title"));
      }
      this.title = data.title;
    }

    if (data.description !== undefined) {
      this.description = data.description;
    }

    

    if (data.releaseDate !== undefined) {
      this.releaseDate = data.releaseDate;
    }

    if (data.platformDate !== undefined) {
      this.platformDate = data.platformDate;
    }

    if (data.productionHouse !== undefined) {
      this.productionHouse = data.productionHouse;
    }

    if(data.productionCountry){
      this.productionCountry = data.productionCountry;
    }

    if(data.status){
      this.status = data.status;
    }

    if (data.director !== undefined) {
      this.director = data.director;
    }

    if (data.category !== undefined) {
      this.category = data.category;
    }

    if (data.format !== undefined) {
      this.format = data.format;
    }

    if (data.actors !== undefined) {
      for (const actor of data.actors) {
        if (!actor.name) {
          return Err(new Error("Actor name is required"));
        }
      }
      this.actors = [...data.actors];
    }

    return Ok(this);
  }

  // === Business ===
  addActor(actor: { name: string; role?: string; actorId?: string }): Result<void, Error> {
    if (!actor.name) {
      return Err(new Error("Actor name is required"));
    }

    this.actors.push(actor);
    return Ok(undefined);
  }

  
}
