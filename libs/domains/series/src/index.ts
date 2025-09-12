export * from './lib/series.module';


export { CreateSerieHandler } from './lib/application/handlers/create-serie.handler';
export { UpdateSerieHandler } from './lib/application/handlers/update-serie.handler';
export { DeleteSerieHandler } from './lib/application/handlers/delete-serie.handler';

export { AddSeasonHandler } from './lib/application/handlers/add-season.handler';
export { UpdateSeasonHandler } from './lib/application/handlers/update-season.handler';
export { DeleteSeasonHandler } from './lib/application/handlers/delete-season.handler';
export { FindSeasonbyIdHandler } from './lib/application/handlers/find-season-by-id.handler';
export { FindSeasonsbySerieHandler } from './lib/application/handlers/find-season-by-serieId.handler';

export { AddEpisodeHandler } from './lib/application/handlers/add-episode.handler';
export { UpdateEpisodeHandler } from './lib/application/handlers/update-episode.handler';
export { DeleteEpisodeHandler } from './lib/application/handlers/delete-episode.handler';
export { FindEpisodebyIdHandler } from './lib/application/handlers/find-episode-by-id.handler';
export { FindEpisodesbySeasonHandler } from './lib/application/handlers/find-episodes-by-season.handler';
export { FindSerieByIdHandler } from './lib/application/handlers/find-serie-by-id.handler';

export { CreateSerieDto } from './lib/interfaces/create-serie.dto';
export { AddSeasonDto }  from './lib/interfaces/add-season.dto';
export { AddEpisodeDto }  from './lib/interfaces/add-episode.dto';
export { UpdateSeasonDto } from './lib/interfaces/update-season.dto';
export { UpdateSerieDto } from './lib/interfaces/update-serie.dto';
export { UpdateEpisodeDto } from './lib/interfaces/update-episode.dto';

export { AddEpisodeCommand } from './lib/application/cqrs/commands/add-episode.command';
export { AddSeasonCommand } from './lib/application/cqrs/commands/add-season.command';
export { CreateSerieCommand } from './lib/application/cqrs/commands/add-serie.command';

export { DeleteEpisodeCommand } from './lib/application/cqrs/commands/delete-episode.command';
export { DeleteSeasonCommand } from './lib/application/cqrs/commands/delete-season.command';
export { DeleteSerieCommand } from './lib/application/cqrs/commands/delete-serie.command';

export { UpdateEpisodeCommand } from './lib/application/cqrs/commands/update-episode.command';
export { UpdateSeasonCommand } from './lib/application/cqrs/commands/update-season.command';
export { UpdateSerieCommand } from './lib/application/cqrs/commands/update-serie.command';

export { MoveEpisodeCommand } from './lib/application/cqrs/commands/move-episode.command';

export { FindEpisodeByIdQuery } from './lib/application/cqrs/queries/find-episode-by-id.query';
export { FindSeasonByIdQuery } from './lib/application/cqrs/queries/find-season-by-id.query';
export { ListSerieQuery } from './lib/application/cqrs/queries/list-serie.query';
export { FindEpisodesBySeasonId } from './lib/application/cqrs/queries/find-episode-by-seasonId.query';
export { FindSeasonsBySerieId } from './lib/application/cqrs/queries/find-season-by-serieId.query';
export { FindSerieByIdQuery } from './lib/application/cqrs/queries/find-serie-by-id.query';
export { ListSeriesHandler } from './lib/application/handlers/list-series.handler';