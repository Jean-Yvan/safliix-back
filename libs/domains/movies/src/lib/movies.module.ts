import { Module } from '@nestjs/common';
import { MovieRepository } from './infra/prisma/movie-prisma.repository';
import { CreateMovieHandler } from './application/handlers/create-movie.handler';
import { MOVIE_REPOSITORY } from './utils/types';
import { SafliixBackDatabaseModule } from "@safliix-back/database";
import { UpdateMovieHandler } from './application/handlers/update-movie.handler';
import { DeleteMovieHandler } from './application/handlers/delete-movie.handler';
import { GetMoviesHandler } from './application/handlers/get-movies.handler';
import { ListMovieByIdHandler } from './application/handlers/list-movie-by-id.handler';
@Module({
  imports: [SafliixBackDatabaseModule],
  providers: [
    {
      provide: MOVIE_REPOSITORY,
      useClass: MovieRepository,
    },
    CreateMovieHandler,
    UpdateMovieHandler,
    DeleteMovieHandler,
    GetMoviesHandler,
    ListMovieByIdHandler
  ],
  exports: [
    CreateMovieHandler,
    UpdateMovieHandler,
    DeleteMovieHandler,
    GetMoviesHandler,
    MOVIE_REPOSITORY,
    ListMovieByIdHandler
  ],
})
export class SafliixBackMoviesModule {}
