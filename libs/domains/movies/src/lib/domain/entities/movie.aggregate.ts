import { v4 as uuidv4 } from 'uuid';
import { AggregateRoot } from '@nestjs/cqrs';
import { VideoMetadata,VideoFile } from '@safliix-back/contents';
import { Prisma } from '@safliix-back/database';
import { Result,Ok,Err } from 'oxide.ts';
import { CreateMovieCommand } from 'src/lib/application/commands/create-movie.command';
//import { MoviePublishedEvent } from '../events/movie-published.event';

export type MovieStatus = 'DRAFT' | 'PUBLISHED';
export type MovieActor = { actorId: string; name: string; role?: string };

export class MovieAggregate extends AggregateRoot {
  private _status: MovieStatus = 'DRAFT';
  private _rentalPrice?: number;
  private _actors: MovieActor[] = [];

  private constructor(
    public readonly id: string,
    public readonly metadata: VideoMetadata,
    public readonly  videoFile: VideoFile,
    public readonly isPremiere: boolean
  ) {
    super();
  }

  // === Méthodes Métier ===
  publishMovie(publicationDate: Date = new Date()): Result<void, Error> {
    if (this._status === 'PUBLISHED') {
      return Err(new Error('MOVIE_ALREADY_PUBLISHED'));
    }

    /* if (!this._metadata.isCompleteForPublishing()) {
      return Err(new Error('INCOMPLETE_METADATA_FOR_PUBLISHING'));
    } */

    this._status = 'PUBLISHED';
    //this.addDomainEvent(new MoviePublishedEvent(this.id, publicationDate));
    
    return Ok(undefined);
  }

  setRentalPrice(price: number): Result<void, Error> {
    if (price <= 0) return Err(new Error('INVALID_PRICE'));
    if (!this.isPremiere) return Err(new Error('RENTAL_PRICE_ONLY_FOR_PREMIERES'));
    
    this._rentalPrice = price;
    return Ok(undefined);
  }

  addActor(actor: MovieActor): Result<void, Error> {
    if (this._actors.length >= 20) {
      return Err(new Error('MAX_ACTORS_EXCEEDED'));
    }
    
    if (this._actors.some(a => a.actorId === actor.actorId)) {
      return Err(new Error('ACTOR_ALREADY_ADDED'));
    }

    this._actors.push(actor);
    return Ok(undefined);
  }

  // === Factory Method ===
  static create(command: CreateMovieCommand): Result<MovieAggregate, Error> {
    const metadataResult = VideoMetadata.create(command.metadata);
    const videoFileResult = VideoFile.create({
      id: command.videoFileId,
      duration: command.metadata.duration,
      filePath: command.url 
    });
    if (metadataResult.isErr()) {
      return Err(metadataResult.unwrapErr());
    }

    if (videoFileResult.isErr()) {
      return Err(videoFileResult.unwrapErr());
    }

    const movie = new MovieAggregate(
      command.movieId,
      metadataResult.unwrap(),
      videoFileResult.unwrap(),
      command.isPremiere
    );

    if (command.isPremiere) {
      const priceResult = movie.setRentalPrice(command.rentalPrice!);
      if (priceResult.isErr()) {
        return Err(priceResult.unwrapErr());
      }
    }

    for (const actor of command.metadata.actors) {
      const actorResult = movie.addActor({
        actorId: uuidv4(),
        name: actor.name,
        role: actor.role
      });
      
      if (actorResult.isErr()) {
        return Err(actorResult.unwrapErr());
      }
    }

    return Ok(movie);
  }

  // === Mappers ===
  static fromPrisma(data: Prisma.MovieGetPayload<{include: { 
        metadata: { 
          include: { 
            format: true, 
            category: true,
            actors: { include: { actor: true } }
          } 
        },
        videoFile: true 
      }}>): Result<MovieAggregate, Error> {
    const commandResult = CreateMovieCommand.fromPrisma(data);
    if (commandResult.isErr()) {
      return Err(commandResult.unwrapErr());
    }

    const movieResult = MovieAggregate.create(commandResult.unwrap());
    if (movieResult.isErr()) {
      return Err(movieResult.unwrapErr());
    }

    const movie = movieResult.unwrap();
    if (data.status === 'PUBLISHED' && data.metadata.releaseDate) {
      const publishResult = movie.publishMovie(data.metadata.releaseDate);
      if (publishResult.isErr()) {
        return Err(publishResult.unwrapErr());
      }
    }

    return Ok(movie);
  }

  toPrisma(): Result<Prisma.MovieCreateInput,Error> {

    const metadataPrisma = this.metadata.toPrisma();
    const videoFilePrisma = this.videoFile.toPrisma();
    if(metadataPrisma.isErr() || videoFilePrisma.isErr()) {
      return Err(Error('Invalid metadata or video file data'));
    }
    return Ok({
      id: this.id,
      status: this._status,
      isPremiere: this.isPremiere,
      rentalPrice: this._rentalPrice,
      metadata: {
        create: metadataPrisma.unwrap()
      },
      videoFile: { create: videoFilePrisma.unwrap() },
    });
  }

  // === Getters ===
  get title(): string {
    return this.metadata.title;
  }

  get status(): MovieStatus {
    return this._status;
  }

  get rentalPrice(): number | undefined {
    return this._rentalPrice;
  }

  get actors(): ReadonlyArray<MovieActor> {
    return [...this._actors]; // Retourne une copie pour immutabilité
  }
}