import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdminMovieController } from './movie.controller';
import { SafliixBackMoviesModule } from '@safliix-back/movies';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { SafliixBackS3Module } from '@safliix-back/s3';

@Module({
  imports:[
    CqrsModule,
    SafliixBackMoviesModule,
    SafliixBackDatabaseModule,
    SafliixBackS3Module
  ],
  controllers:[AdminMovieController],
  
})
export class MoviesModule {}
