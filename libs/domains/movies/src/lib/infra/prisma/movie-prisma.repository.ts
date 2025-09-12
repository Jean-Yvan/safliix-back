import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { MovieAggregate } from '../../domain/entities/movie.aggregate';
import { IMovieRepository } from '../../domain/ports/movie.repository';
import { MovieMapper } from '../../mappers/movie.mapper';
import { movieInclude } from '@safliix-back/database';
import { MovieFilter } from '../../utils/types';

@Injectable()
export class MovieRepository implements IMovieRepository {
  private readonly logger = new Logger(MovieRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(movie: MovieAggregate): Promise<MovieAggregate> {
    const prismaMovie = MovieMapper.toPrismaCreate(movie);
    this.logger.debug(`Creating movie with data: ${JSON.stringify(prismaMovie)}`);
    
    const result =await this.prisma.movie.create({
      data: prismaMovie,
      include:movieInclude
    });

    return MovieMapper.toDomain(result);
  }

  async update(id:string,movie: MovieAggregate): Promise<MovieAggregate> {
    const prismaMovie = MovieMapper.toPrismaUpdate(id,movie);
    const updated = await this.prisma.movie.update({
      ...prismaMovie,
      include:movieInclude
    });
    return MovieMapper.toDomain(updated)
  }

  async save(movie: MovieAggregate): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async publish(id: string, publicationDate?: Date): Promise<MovieAggregate> {
    const updated = await this.prisma.movie.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        metadata: publicationDate
          ? { update: { releaseDate: publicationDate } }
          : undefined,
      },
      include: movieInclude,
    });

    const restored = MovieMapper.toDomain(updated);
    //if (restored.isErr()) throw restored.unwrapErr();
    return restored;
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.movie.delete({ where: { id } });
    return true;
  }

  async findById(id: string): Promise<MovieAggregate | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: movieInclude
    });

    if (!movie) return null;

    const restored = MovieMapper.toDomain(movie);
    
    return restored;
  }

  async findAll(filters?: MovieFilter): Promise<MovieAggregate[]> {
    const where: Record<string, unknown> = {};

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.director) {
        where.director = {
          contains: filters.director,
          mode: "insensitive", // recherche insensible à la casse
        };
      }

      if (filters.format) {
        where.format = filters.format;
      }

      if (filters.minDuration) {
        where.duration = {
          gte: filters.minDuration,
        };
      }
    }

    const movies = await this.prisma.movie.findMany({
      where,
      skip: filters?.page && filters?.limit ? filters.page * filters.limit : undefined,
      take: filters?.limit,
      include: movieInclude,
    });

    return movies
      .map((m) => MovieMapper.toDomain(m))
      .filter((r) => r)
      .map((r) => r);
    }

}
