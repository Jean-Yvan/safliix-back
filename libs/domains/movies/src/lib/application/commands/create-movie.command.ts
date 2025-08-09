import { Result,Ok,Err } from 'oxide.ts';
import { Prisma } from '@safliix-back/database';
import { VideoCategory, VideoFormat } from "@safliix-back/contents";
import { InvalidActorError, InvalidDurationError, MoviePremiereRequiresPriceError, MissingRequiredFieldError } from '../../errors/movie.errors';

export class CreateMovieCommand {
  private constructor(
    public readonly movieId: string,
    public readonly isPremiere: boolean,
    public readonly metadata: {
      title: string;
      description: string;
      duration: number;
      releaseDate: Date;
      ageRating: string;
      thumbnailUrl: string;
      director: string;
      productionHouse: string;
      platformDate: Date;
      secondaryImage: string | null;
      format: VideoFormat;
      category: VideoCategory;
      actors: {
        name: string;
        role?: string;
        isLead?: boolean;
      }[];
    },
    public readonly videoFileUrl: string,
    public readonly rentalPrice?: number
  ) {}

  static create(params: {
    movieId: string;
    isPremiere: boolean;
    metadata: {
      title: string;
      description: string;
      duration: number;
      releaseDate: Date;
      ageRating: string;
      thumbnailUrl: string;
      director: string;
      productionHouse: string;
      platformDate: Date;
      secondaryImage: string | null;
      format: VideoFormat;
      category: VideoCategory;
      actors: {
        name: string;
        role?: string;
        isLead?: boolean;
      }[];
    };
    videoFileUrl: string;
    rentalPrice?: number;
  }): Result<CreateMovieCommand, 
    MoviePremiereRequiresPriceError | 
    InvalidDurationError |
    MissingRequiredFieldError |
    InvalidActorError
  > {
    // Validation des champs requis
    if (!params.metadata.title) {
      return Err(new MissingRequiredFieldError('metadata.title'));
    }

    if (!params.videoFileUrl) {
      return Err(new MissingRequiredFieldError('videoFileUrl'));
    }

    // Validation des règles métier
    if (params.isPremiere && !params.rentalPrice) {
      return Err(new MoviePremiereRequiresPriceError());
    }

    if (params.metadata.duration <= 0) {
      return Err(new InvalidDurationError());
    }

    // Validation des acteurs
    for (const actor of params.metadata.actors) {
      if (!actor.name) {
        return Err(new InvalidActorError('Name is required'));
      }
    }

    return Ok(new CreateMovieCommand(
      params.movieId,
      params.isPremiere,
      params.metadata,
      params.videoFileUrl,
      params.rentalPrice
    ));
  }

  static fromPrisma(
    data: Prisma.MovieGetPayload<{
      include: { 
        metadata: { 
          include: { 
            format: true, 
            category: true,
            actors: { include: { actor: true } }
          } 
        },
        videoFile: true 
      }
    }>
  ): Result<CreateMovieCommand, Error> {
    try {
      // Conversion des Value Objects
      const formatResult = VideoFormat.fromPrisma(data.metadata.format);
      const categoryResult = VideoCategory.fromPrisma(data.metadata.category);

      if (formatResult.isErr() || categoryResult.isErr()) {
        return Err(new Error('Invalid format or category data'));
      }

      // Construction des acteurs
      const actors = data.metadata.actors.map(actorData => ({
        name: actorData.actor.name,
        role: actorData.role ?? undefined,
      }));

      // Création de la commande
      return CreateMovieCommand.create({
        movieId: data.id,
        isPremiere: data.isPremiere,
        metadata: {
          title: data.metadata.title,
          description: data.metadata.description ?? '',
          duration: data.videoFile.duration,
          releaseDate: data.metadata.releaseDate,
          ageRating: data.metadata.ageRating,
          thumbnailUrl: data.metadata.thumbnailUrl,
          director: data.metadata.director,
          productionHouse: data.metadata.productionHouse,
          secondaryImage: data.metadata.secondaryImage,
          platformDate: data.metadata.platformDate,
          format: formatResult.unwrap(),
          category: categoryResult.unwrap(),
          actors: actors
        },
        videoFileUrl: data.videoFile.filePath,
        rentalPrice: data.rentalPrice ?? undefined
      });

    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to create command from Prisma data'));
    }
  }
}