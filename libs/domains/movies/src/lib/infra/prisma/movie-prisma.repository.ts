import { Injectable } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { IMovieRepository } from '../../domain/ports/movie.repository';
import { Result } from 'oxide.ts';
import { Logger } from '@nestjs/common';
import { MovieFilters } from 'src/lib/utils/types';

@Injectable()
export class MovieRepository implements IMovieRepository {
  private readonly logger = new Logger(MovieRepository.name);

  constructor(private readonly prisma: PrismaService)  {}
  
  update(movie: MovieAggregate): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  async findAll(filters?: MovieFilters): Promise<MovieAggregate[]> {
    const movies = await this.prisma.movie.findMany({
      where: {
        status: filters?.status,
        isPremiere: filters?.isPremiere,
        metadata: filters?.category 
          ? { category: { id: filters.category } } 
          : undefined,
      },
      include: { metadata: {
        include: {
          format: true,
          category: true,
          actors: {
            include: {
              actor: true,
            },
          },
        },
      }, videoFile: true,  },
    });
    return movies.map((movie) => {
      const movieResult = MovieAggregate.fromPrisma(movie);
      if (movieResult.isErr()) {
        this.logger.error(
          `Failed to reconstruct aggregate for movie ${movie.id}: ${movieResult.unwrapErr().message}`,
        );
        throw movieResult.unwrapErr();
      }
      return movieResult.unwrap();
    });
    //return movies.map(MovieMapper.toDomain);
  }


  async findById(id: string): Promise<MovieAggregate | null> {
    try {
      const movieData = await this.prisma.movie.findUnique({
        where: { id },
        include: {
          metadata: {
            include: {
              format: true,
              category: true,
              actors: {
                include: {
                  actor: true,
                },
              },
            },
          },
          videoFile: true,
        },
      });

      if (!movieData) {
        return null;
      }

      const movieResult = MovieAggregate.fromPrisma(movieData);
      if (movieResult.isErr()) {
        this.logger.error(
          `Failed to reconstruct aggregate for movie ${id}: ${movieResult.unwrapErr().message}`,
        );
        throw movieResult.unwrapErr();
      }

      return movieResult.unwrap();
    } catch (error) {
      this.logger.error(`Error finding movie ${id}: ${error}`);
      throw error;
    }
  }

  async create(movie: MovieAggregate): Promise<void> {
    const videoFileResult = movie.videoFile.toPrisma();
    if (videoFileResult.isErr()) {
      this.logger.error(
        `Error converting video file to Prisma format: ${videoFileResult.unwrapErr().message}`,
      );
      throw videoFileResult.unwrapErr();
    }

    const movieResult = movie.toPrisma();
    if (movieResult.isErr()) {
      this.logger.error(
        `Error converting movie to Prisma format: ${movieResult.unwrapErr().message}`,
      );
      throw movieResult.unwrapErr();
    }
    const moviePrisma = movieResult.unwrap();

    await Result.safe(
      this.prisma.$transaction(async (tx) => {
        // 1. Upsert du fichier vidéo
        await tx.videoFile.upsert({
          where: { id: movie.videoFile.id },
          create: videoFileResult.unwrap(),
          update: videoFileResult.unwrap(),
        });

        // 2. Upsert des acteurs
        const actorsUpsert = movie.actors.map((actor) => ({
          where: { id: actor.actorId },
          create: { id: actor.actorId, name: actor.name },
          update: { name: actor.name },
        }));
        await Promise.all(actorsUpsert.map((actor) => tx.actor.upsert(actor)));

        // 3. Vérifier et upsert VideoFormat et VideoCategory (important pour éviter l’erreur)

        // Upsert VideoFormat
        await tx.videoFormat.upsert({
          where: { id: movie.metadata.format?.id },
          create: {
            id: movie.metadata.format?.id,
            format: movie.metadata.format!.format,
          },
          update: {
            // champs à mettre à jour si besoin
            // ex : name: movie.metadata._format.name,
          },
        });

        // Upsert VideoCategory
        await tx.videoCategory.upsert({
          where: { id: movie.metadata.category?.id },
          create: {
            id: movie.metadata.category?.id,
            category: movie.metadata.category!.category,
            // champs requis de VideoCategory,
          },
          update: {
            // mise à jour si besoin
          },
        });

        // 4. Upsert Movie avec metadata, en connectant les format et category déjà upsertés
        const metadataCreateInput = this.buildMetadataCreateInput(movie);

        await tx.movie.upsert({
          where: { id: movie.id },
          create: {
            id: movie.id,
            status: movie.status,
            isPremiere: movie.isPremiere,
            rentalPrice: movie.rentalPrice,
            metadata: {
              create: metadataCreateInput,
            },
            videoFile: {
              connect: { id: movie.videoFile.id },
            },
          },
          update: {
            status: movie.status,
            isPremiere: movie.isPremiere,
            rentalPrice: movie.rentalPrice,
            metadata: {
              update: {
                ...metadataCreateInput,
                actors: {
                  deleteMany: {},
                  create: movie.actors.map(actor => ({
                    actor: { connect: { id: actor.actorId } },
                    role: actor.role,
                  })),
                },
              },
            },
          },
        });

      }),
    ).catch((e) => {
      this.logger.error(`Error saving movie ${movie.id}: ${e.message}`);
      throw e;
    });
}

  async delete(id: string): Promise<boolean> {
    const result = await this.prisma.movie.delete({
      where: { id },
    });
    return !!result;
  }



buildMetadataCreateInput(movie: MovieAggregate) {
  return {
    id: movie.metadata.id,
    title: movie.metadata.title,
    description: movie.metadata.description,
    thumbnailUrl: movie.metadata.thumbnail,
    secondaryImage: movie.metadata.secondaryImage,
    releaseDate: movie.metadata.releaseDate,
    platformDate: movie.metadata.platformDate,
    duration: movie.metadata.duration,
    productionHouse: movie.metadata.productionHouse,
    director: movie.metadata.director,
    productionCountry: 'Unknown',
    status: 'DRAFT',
    ageRating: 'G',
    format: { connect: { id: movie.metadata.format?.id } },
    category: { connect: { id: movie.metadata.category?.id } },
    actors: {
      create: movie.actors.map(actor => ({
        actor: { connect: { id: actor.actorId } },
        role: actor.role,
      })),
    },
  };
}



  /* async save(movie: MovieAggregate): Promise<void> {


    const videoFileResult = movie.videoFile.toPrisma();
    
    if (videoFileResult.isErr()) {
      this.logger.error(
        `Error converting video file to Prisma format: ${videoFileResult.unwrapErr().message}`,
      );
      throw videoFileResult.unwrapErr();
    }
    const transactionResult = await Result.safe(
      this.prisma.$transaction(async (tx) => {
        // 1. Sauvegarde du fichier vidéo
        await tx.videoFile.upsert({
          where: { id: movie.videoFile.id },
          create: videoFileResult.unwrap(),
          update: videoFileResult.unwrap(),
        });

        // 2. Sauvegarde des acteurs (en parallèle si possible)
        const actors = movie.actors.map((actor) => ({
          where: { id: actor.actorId },
          create: { id: actor.actorId, name: actor.name },
          update: { name: actor.name },
        }));

        await Promise.all(
          actors.map((actor) => tx.actor.upsert(actor)),
        );

        const movieResult = movie.toPrisma();
        this.logger.debug(JSON.stringify(movieResult.unwrap(), null, 2));

        if (movieResult.isErr()) {
          this.logger.error(
            `Error converting movie to Prisma format: ${movieResult.unwrapErr().message}`,
          );
          
          throw movieResult.unwrapErr();
        }
        // 3. Sauvegarde du film et des métadonnées
        await tx.movie.upsert({
          where: { id: movie.id },
          create: movieResult.unwrap(),
          update: {
            status: movie.status,
            isPremiere: movie.isPremiere,
            rentalPrice: movie.rentalPrice,
            metadata: {
              update: {
                ...movie.metadata.toPrisma(),
                actors: {
                  deleteMany: {},
                  create: movie.actors.map((actor) => ({
                    actor: { connect: { id: actor.actorId } },
                    role: actor.role,
                  })),
                },
              },
            },
          },
        });
      }),
    );

    if (transactionResult.isErr()) {
      this.logger.error(
        `Error saving movie ${movie.id}: ${transactionResult.unwrapErr().message}`,
      );
      throw transactionResult.unwrapErr();
    }
  } */
}