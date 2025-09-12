import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';

import { SERIE_REPOSITORY } from './utils/types';
import { PrismaSerieRepository } from './infrastructure/prisma-serie.repository';
import { CreateSerieHandler } from './application/handlers/create-serie.handler';
import { UpdateSerieHandler } from './application/handlers/update-serie.handler';
import { DeleteSerieHandler } from './application/handlers/delete-serie.handler';
import { FindSerieByIdHandler } from './application/handlers/find-serie-by-id.handler';

import { AddSeasonHandler } from './application/handlers/add-season.handler';
import { UpdateSeasonHandler } from './application/handlers/update-season.handler';
import { DeleteSeasonHandler } from './application/handlers/delete-season.handler';
import { FindSeasonbyIdHandler } from './application/handlers/find-season-by-id.handler';
import { FindSeasonsbySerieHandler } from './application/handlers/find-season-by-serieId.handler';

import { AddEpisodeHandler } from './application/handlers/add-episode.handler';
import { UpdateEpisodeHandler } from './application/handlers/update-episode.handler';
import { DeleteEpisodeHandler } from './application/handlers/delete-episode.handler';
import { FindEpisodebyIdHandler } from './application/handlers/find-episode-by-id.handler';
import { FindEpisodesbySeasonHandler } from './application/handlers/find-episodes-by-season.handler';
import { ListSeriesHandler } from './application/handlers/list-series.handler';

@Module({
  imports: [
    SafliixBackDatabaseModule
  ],
  providers: [
    {
      provide:SERIE_REPOSITORY,
      useClass: PrismaSerieRepository
    },
    CreateSerieHandler,
    UpdateSerieHandler,
    DeleteSerieHandler,
    ListSeriesHandler,
    FindSerieByIdHandler,
    //season
    AddSeasonHandler,
    UpdateSeasonHandler,
    DeleteSeasonHandler,
    FindSeasonbyIdHandler,
    FindSeasonsbySerieHandler,

    //episode

    AddEpisodeHandler,
    UpdateEpisodeHandler,
    DeleteEpisodeHandler,
    FindEpisodebyIdHandler,
    FindEpisodesbySeasonHandler
  ],
  exports: [
    CreateSerieHandler,
    UpdateSerieHandler,
    DeleteSerieHandler,
    FindSerieByIdHandler,
    //season
    AddSeasonHandler,
    UpdateSeasonHandler,
    DeleteSeasonHandler,
    FindSeasonbyIdHandler,
    FindSeasonsbySerieHandler,

    //episode

    AddEpisodeHandler,
    UpdateEpisodeHandler,
    DeleteEpisodeHandler,
    FindEpisodebyIdHandler,
    FindEpisodesbySeasonHandler,
    ListSeriesHandler,
  ],
})
export class SafliixBackSeriesModule {}
