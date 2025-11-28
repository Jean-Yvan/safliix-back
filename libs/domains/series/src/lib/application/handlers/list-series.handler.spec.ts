import { ListSeriesHandler } from './list-series.handler';
import { ListSerieQuery } from '../cqrs/queries/list-serie.query';
import type { ISerieRepository } from '../../domain/ports/serie.repository';
import { Result } from 'oxide.ts';

describe('ListSeriesHandler', () => {
  it('passe les filtres au repository et renvoie les séries', async () => {
    const repository: jest.Mocked<ISerieRepository> = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findSeasonsBySerieId: jest.fn(),
      findEpisodesBySeasonId: jest.fn(),
      findEpisodeById: jest.fn(),
      findSeasonById: jest.fn(),
      countSeasons: jest.fn(),
      countEpisodes: jest.fn(),
      createSeason: jest.fn(),
      updateSeason: jest.fn(),
      deleteSeason: jest.fn(),
      createEpisode: jest.fn(),
      updateEpisode: jest.fn(),
      deleteEpisode: jest.fn(),
      moveEpisode: jest.fn(),
    };

    const series = [{ id: 's1', metadata: { title: 'Serie' } }] as any;
    repository.findAll.mockResolvedValue(series);

    const handler = new ListSeriesHandler(repository as any);
    const filters = { q: 'ser', category: 'drame', genre: 'thriller' };
    const result = await handler.execute(new ListSerieQuery(filters));

    expect(repository.findAll).toHaveBeenCalledWith(filters);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(series);
  });

  it('retourne une Err en cas de rejet', async () => {
    const repository: jest.Mocked<ISerieRepository> = {
      findById: jest.fn(),
      findAll: jest.fn().mockRejectedValue(new Error('db error')),
      save: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findSeasonsBySerieId: jest.fn(),
      findEpisodesBySeasonId: jest.fn(),
      findEpisodeById: jest.fn(),
      findSeasonById: jest.fn(),
      countSeasons: jest.fn(),
      countEpisodes: jest.fn(),
      createSeason: jest.fn(),
      updateSeason: jest.fn(),
      deleteSeason: jest.fn(),
      createEpisode: jest.fn(),
      updateEpisode: jest.fn(),
      deleteEpisode: jest.fn(),
      moveEpisode: jest.fn(),
    };

    const handler = new ListSeriesHandler(repository as any);
    const result = await handler.execute(new ListSerieQuery());
    expect(result.isErr()).toBe(true);
  });
});
