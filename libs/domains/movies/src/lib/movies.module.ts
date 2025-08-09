import { Module } from '@nestjs/common';
import { MovieRepository } from './infra/prisma/movie-prisma.repository';
import { CreateMovieHandler } from './application/handlers/create-movie.handler';
import { MOVIE_REPOSITORY } from './utils/types';
import { SafliixBackDatabaseModule } from "@safliix-back/database";


@Module({
  imports: [SafliixBackDatabaseModule],
  providers: [
    {
      provide: MOVIE_REPOSITORY,
      useClass: MovieRepository,
    },
    CreateMovieHandler,
  ],
  exports: [CreateMovieHandler],
})
export class SafliixBackMoviesModule {}
