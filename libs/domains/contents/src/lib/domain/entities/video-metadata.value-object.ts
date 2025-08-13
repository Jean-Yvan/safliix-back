import { Result,Ok,Err } from 'oxide.ts';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@safliix-back/database';
import { VideoFormat } from './video-format.value-object';
import { VideoCategory } from './video-category.value-object';

// Définition des erreurs métier
export class InvalidDurationError extends Error {
  constructor() {
    super('Duration must be positive');
    this.name = 'InvalidDurationError';
  }
}

export class MissingRequiredFieldError extends Error {
  constructor(field: string) {
    super(`Missing required field: ${field}`);
    this.name = 'MissingRequiredFieldError';
  }
}

export class VideoMetadata {
  private constructor(
    public readonly id: string,
    private _title: string,
    private _description: string,
    private _thumbnailUrl: string,
    private _secondaryImage: string | null,
    private _releaseDate: Date,
    private _platformDate: Date,
    private _duration: number,
    private _productionHouse: string,
    private _director: string,
    private _format?: VideoFormat,
    private _category?: VideoCategory,
    private _actors: { name: string; role?: string; actorId?: string }[] = []
  ) {}

  static create(props: {
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: number;
    productionHouse: string;
    director: string;
    secondaryImage: string | null;
    releaseDate: Date;
    platformDate: Date;
    format?: VideoFormat;
    category?: VideoCategory;
    actors?: { name: string; role?: string | undefined; actorId?: string }[];
  }): Result<VideoMetadata, InvalidDurationError | MissingRequiredFieldError> {
    // Validation des champs requis
    if (!props.title) {
      return Err(new MissingRequiredFieldError('title'));
    }

    if (props.duration <= 0) {
      return Err(new InvalidDurationError());
    }

    const instance = new VideoMetadata(
      uuidv4(),
      props.title,
      props.description,
      props.thumbnailUrl,
      props.secondaryImage,
      props.releaseDate,
      props.platformDate,
      props.duration,
      props.productionHouse,
      props.director,
      props.format,
      props.category
    );

    // Ajout des acteurs si fournis
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

  static fromPrisma(
    data: Prisma.VideoMetadataGetPayload<{ include: { format: true; category: true, actors: {
      include: { actor: true };
    } } }>
  ): Result<VideoMetadata, Error> {
    try {
      const formatResult = data.format ? VideoFormat.fromPrisma(data.format) : undefined;
      const categoryResult = data.category ? VideoCategory.fromPrisma(data.category) : undefined;

      if ((formatResult && formatResult.isErr()) || (categoryResult && categoryResult.isErr())) {
        return Err(new Error('Invalid format or category data'));
      }

      const metadata = new VideoMetadata(
        data.id,
        data.title,
        data.description || '',
        data.thumbnailUrl,
        data.secondaryImage ?? null,
        data.releaseDate,
        data.platformDate,
        data.duration,
        data.productionHouse,
        data.director,
        formatResult && formatResult.unwrap(),
        categoryResult && categoryResult.unwrap(),
        data.actors.map(actor => ({
          name: actor.actor.name,
          role: actor.role ?? undefined,
          actorId: actor.actor.id
        }))
      );

      

      return Ok(metadata);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  addActor(actor: { name: string; role?: string; actorId?: string }): Result<void, Error> {
    if (!actor.name) {
      return Err(new Error('Actor name is required'));
    } 

    this._actors.push(actor);
    return Ok(undefined);
  }

  toPrisma(): Result<Prisma.VideoMetadataCreateInput, Error> {
    try {
      return Ok({
        title: this.title,
        description: this.description,
        thumbnailUrl: this.thumbnail,
        secondaryImage: this._secondaryImage,
        releaseDate: this._releaseDate,
        platformDate: this._platformDate,
        duration: this._duration,
        productionHouse: this._productionHouse,
        director: this._director,
        format: { connect: { id: this._format?.id } },
        category: { connect: { id: this._category?.id } },
        productionCountry: 'Unknown',
        status: 'DRAFT',
        ageRating: 'G',
        actors: {
          create: this._actors.map((actor) => {
            if (actor.actorId) {
              return {
                actor: { connect: { id: actor.actorId } },
                role: actor.role,
              };
            } else {
              return {
                actor: {
                  create: {
                    name: actor.name,
                  },
                },
                role: actor.role,
              };
            }
          }),
        },
      });
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to create Prisma input'));
    }
  }

  // Getters...
  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get thumbnail(): string {
    return this._thumbnailUrl;
  }

  // Optionnel: Getter pour les actors en lecture seule
  get actors(): ReadonlyArray<{ name: string; role?: string; actorId?: string }> {
    return [...this._actors];
  }

  get format(): VideoFormat | undefined {
    return this._format;
  }

  get category(): VideoCategory | undefined {
    return this._category;
  }

  get secondaryImage(): string | null {
    return this._secondaryImage;
  }
  get releaseDate(): Date {
    return this._releaseDate;
  }
  get platformDate(): Date {
    return this._platformDate;
  }
  get duration(): number {
    return this._duration;
  }
  get productionHouse(): string {
    return this._productionHouse;
  }
  get director(): string {
    return this._director;
  }


}