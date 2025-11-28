import { Module } from '@nestjs/common';
import { AdminSerieController } from './serie.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackSeriesModule } from '@safliix-back/series';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { SafliixBackS3Module } from '@safliix-back/s3';

@Module({
  imports:[
    CqrsModule,
    SafliixBackSeriesModule,
    SafliixBackDatabaseModule,
    SafliixBackS3Module
  ],
  controllers:[AdminSerieController],

})
export class SerieModule {}
