import { Injectable } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { MovieAggregate } from 'src/lib/domain/entities/movie.aggregate';
import { IMovieRepository } from 'src/lib/domain/ports/movie.repository';
import { Result } from 'oxide.ts';
import { Logger } from '@nestjs/common';

@Injectable()
export class MovieRepository implements IMovieRepository {
  private readonly logger = new Logger(MovieRepository.name);

  constructor(private readonly prisma: PrismaService)  {}

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

  async save(movie: MovieAggregate): Promise<void> {


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
  }
}