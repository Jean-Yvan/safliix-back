/* import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { UpdateMovieCommand } from '../commands/update-movie.command';
import { MOVIE_REPOSITORY } from '../..//utils/types';
import { MovieNotFoundError } from '../../errors/movie.errors';
import { MovieMapper } from 'src/lib/mappers/movie.mapper';
import { MovieAggregate } from 'src/lib/domain/entities/movie.aggregate';

@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler implements ICommandHandler<UpdateMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly repository: IMovieRepository
  ) {}

  async execute(command: UpdateMovieCommand) {
    const movie = await this.repository.findById(command.payload.id);
    if (!movie) {
      throw new MovieNotFoundError(command.payload.id);
    }

  //const updated = movie.update(command.payload);
  const merged = {
    ...movie,
    ...command.payload,
    title: command.payload.title ?? movie.metadata.title,
    productionHouse: command.payload.productionHouse ?? movie.metadata.productionHouse,
    productionCountry: command.payload.productionCountry ?? '',
    releaseDate: command.payload.releaseDate ?? movie.metadata.releaseDate.toDateString(),
    plateformDate: command.payload.plateformDate ?? movie.metadata.platformDate.toDateString(),
    // Add other required fields here as needed, following the same pattern
  };

  const result = MovieAggregate.create(merged);

  if (result.isErr()) {
    throw result.unwrapErr();
  }

  await this.repository.update(command.payload);

  return result.unwrap();
  }
} */