import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAccessModule } from '@safliix-back/access';
import { SafliixBackMoviesModule } from '@safliix-back/movies';
import { SafliixBackSeriesModule } from '@safliix-back/series';
import { SafliixBackContentsModule } from '@safliix-back/contents';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    CqrsModule,
    SafliixBackAccessModule,
    SafliixBackMoviesModule,
    SafliixBackSeriesModule,
    SafliixBackContentsModule,
  ],
  controllers: [CatalogController],
})
export class CatalogModule {}
