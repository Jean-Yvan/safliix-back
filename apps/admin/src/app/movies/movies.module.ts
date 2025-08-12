import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdminMovieController } from './movie.controller';
import { SafliixBackMoviesModule } from '@safliix-back/movies';

@Module({
  imports:[
    CqrsModule,
    SafliixBackMoviesModule
  ],
  controllers:[AdminMovieController],
  
})
export class MoviesModule {}
