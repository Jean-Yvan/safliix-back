import { Result,Ok,Err } from 'oxide.ts';
import { VideoCategory } from './video-category.value-object';
import { VideoFormat } from './video-format.value-object';
// Définition des erreurs métier

export class MissingRequiredFieldError extends Error {
  constructor(field: string) {
    super(`Missing required field: ${field}`);
    this.name = 'MissingRequiredFieldError';
  }
}

export class VideoMetadata {
  private constructor(
    public readonly id: string | null,
    private _title: string,
    private _description: string,
    private _thumbnailUrl: string,
    private _secondaryImage: string | null,
    private _releaseDate: Date,
    private _platformDate: Date,
    private _productionHouse: string,
    private _director: string,
    private _category?: VideoCategory,
    private _format?: VideoFormat, 
    private _actors: { name: string; role?: string; actorId?: string; id?:string }[] = []
  ) {}

  static create(
    id: string | null,
    title: string,
    description: string,
    thumbnailUrl: string,
    productionHouse: string,
    director: string,
    secondaryImage: string | null,
    releaseDate: Date,
    platformDate: Date,
    category?: VideoCategory,
    format?: VideoFormat,
    actors?: { name: string; role?: string | undefined; actorId?: string }[],
  ): Result<VideoMetadata, MissingRequiredFieldError> {
    // Validation des champs requis
    if (!title) {
      return Err(new MissingRequiredFieldError('title'));
    }

    

    const instance = new VideoMetadata(
      id,
      title,
      description,
      thumbnailUrl,
      secondaryImage,
      releaseDate,
      platformDate,
      productionHouse,
      director,
      category,
      format
    );

    // Ajout des acteurs si fournis
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

  static restore(
    id: string | null,
    title: string,
    description: string,
    thumbnailUrl: string,
    productionHouse: string,
    director: string,
    secondaryImage: string | null,
    releaseDate: Date,
    platformDate: Date,
    category?: VideoCategory,
    format?: VideoFormat,
    actors?: {name: string; role: string | undefined; actorId: string }[],
  ): VideoMetadata {
    
    const instance = new VideoMetadata(
      id,
      title,
      description,
      thumbnailUrl,
      secondaryImage,
      releaseDate,
      platformDate,
      productionHouse,
      director,
      category,
      format
    );

    // Ajout des acteurs si fournis
    if (actors) {
      for (const actor of actors) {
        instance.addActor(actor);
        /* if (actorResult.isErr()) {
          return Err(actorResult.unwrapErr());
        } */
      }
    }

    return instance;
    
  }

  

  

  addActor(actor: { name: string; role?: string; actorId?: string }): Result<void, Error> {
    if (!actor.name) {
      return Err(new Error('Actor name is required'));
    } 

    this._actors.push(actor);
    return Ok(undefined);
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

  

  get category(): VideoCategory | undefined {
    return this._category;
  }

  get format(): VideoFormat | undefined {
    return this._format;
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
  
  get productionHouse(): string {
    return this._productionHouse;
  }
  get director(): string {
    return this._director;
  }


}