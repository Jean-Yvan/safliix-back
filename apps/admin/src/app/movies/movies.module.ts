import { Module } from '@nestjs/common';
import { CreateMovieHandler } from '@safliix-back/movies';
import { CqrsModule } from '@nestjs/cqrs';
import { AdminMovieController } from './movie.controller';


@Module({
  imports:[
    CqrsModule
  ],
  controllers:[AdminMovieController],
  providers:[CreateMovieHandler]
})
export class MoviesModule {}
