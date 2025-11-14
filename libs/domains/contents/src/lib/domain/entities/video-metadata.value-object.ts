import { Result, Ok, Err } from 'oxide.ts';
import { VideoCategory } from './video-category.value-object';
import { VideoFormat } from './video-format.value-object';
import { MetadataWithRelations } from '@safliix-back/database';
import { VideoCategoryMapper } from '../mappers/video-category.mapper';
import { VideoFormatMapper } from '../mappers/video-format.mapper';
import { ContentStatus } from '@safliix-back/common';
import { VideoGender } from './video-gender.value-object';
import { VideoGenderMapper } from '../mappers/video-gender.mapper';
// Définition des erreurs métier

export class MissingRequiredFieldError extends Error {
  constructor(field: string) {
    super(`Missing required field: ${field}`);
    this.name = 'MissingRequiredFieldError';
  }
}

type ActorProps = { name: string; role?: string; actorId?: string; id?: string };

export type VideoMetadataCreateProps = {
  id?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  secondaryImage?: string | null;
  releaseDate: Date;
  platformDate: Date;
  productionHouse: string;
  productionCountry: string;
  status?: ContentStatus;
  director: string;
  category: VideoCategory;
  format?: VideoFormat | null;
  gender: VideoGender;
  actors?: ActorProps[];
};

export class VideoMetadata {
  private constructor(
    public readonly id: string | undefined,
    public title: string,
    public description: string,
    public thumbnailUrl: string,
    public secondaryImage: string | null,
    public releaseDate: Date,
    public platformDate: Date,
    public productionHouse: string,
    public productionCountry: string,
    public status: ContentStatus,
    public director: string,
    public category: VideoCategory,
    public format: VideoFormat | null,
    public gender: VideoGender,
    public actors: ActorProps[] = []
  ) {}

  // === Factory ===
  static create(props: VideoMetadataCreateProps): Result<VideoMetadata, MissingRequiredFieldError> {
    if (!props.title || !props.title.trim()) {
      return Err(new MissingRequiredFieldError('title'));
    }

    const instance = new VideoMetadata(
      props.id,
      props.title,
      props.description,
      props.thumbnailUrl,
      props.secondaryImage ?? null,
      props.releaseDate,
      props.platformDate,
      props.productionHouse,
      props.productionCountry,
      props.status ?? ContentStatus.DRAFT,
      props.director,
      props.category,
      props.format ?? null,
      props.gender
    );

    if (props.actors) {
      for (const actor of props.actors) {
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
      data.thumbnailUrl,
      data.secondaryImage ?? null,
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
    thumbnailUrl?: string;
    secondaryImage?: string | null;
    releaseDate?: Date;
    platformDate?: Date;
    productionHouse?: string;
    productionCountry?: string;
    status?: ContentStatus;
    director?: string;
    category?: VideoCategory;
    format?: VideoFormat | null;
    gender?: VideoGender;
    actors?: ActorProps[];
  }): Result<VideoMetadata, MissingRequiredFieldError | Error> {
    if (data.title !== undefined) {
      if (!data.title) {
        return Err(new MissingRequiredFieldError('title'));
      }
      this.title = data.title;
    }

    if (data.description !== undefined) {
      this.description = data.description;
    }

    if (data.thumbnailUrl !== undefined) {
      this.thumbnailUrl = data.thumbnailUrl;
    }

    if (data.secondaryImage !== undefined) {
      this.secondaryImage = data.secondaryImage;
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

    if (data.productionCountry !== undefined) {
      this.productionCountry = data.productionCountry;
    }

    if (data.status) {
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
          return Err(new Error('Actor name is required'));
        }
      }
      this.actors = [...data.actors];
    }

    return Ok(this);
  }

  // === Business ===
  addActor(actor: { name: string; role?: string; actorId?: string }): Result<void, Error> {
    if (!actor.name) {
      return Err(new Error('Actor name is required'));
    }

    this.actors.push(actor);
    return Ok(undefined);
  }

  
}
