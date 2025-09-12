import { Module } from '@nestjs/common';
import { AdminSerieController } from './serie.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackSeriesModule } from '@safliix-back/series';

@Module({
  imports:[
    CqrsModule,
    SafliixBackSeriesModule
  ],
  controllers:[AdminSerieController],

})
export class SerieModule {}
