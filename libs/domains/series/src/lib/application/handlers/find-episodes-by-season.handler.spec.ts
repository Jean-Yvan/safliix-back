import { FindEpisodesbySeasonHandler } from './find-episodes-by-season.handler';
import { FindEpisodesBySeasonId } from '../cqrs/queries/find-episode-by-seasonId.query';
import type { ISerieRepository } from '../../domain/ports/serie.repository';
import { Episode } from '../../domain/entities/episode.entity';

describe('FindEpisodesbySeasonHandler', () => {
  const buildRepo = () =>
    ({
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
    }) as jest.Mocked<ISerieRepository>;

  it('renvoie les épisodes de la saison', async () => {
    const repo = buildRepo();
    const episodes = [{ id: 'e1' } as Episode];
    repo.findEpisodesBySeasonId.mockResolvedValue(episodes);

    const handler = new FindEpisodesbySeasonHandler(repo as any);
    const result = await handler.execute(new FindEpisodesBySeasonId('season1'));

    expect(repo.findEpisodesBySeasonId).toHaveBeenCalledWith('season1');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(episodes);
  });

  it('remonte une Err si le repo rejette', async () => {
    const repo = buildRepo();
    repo.findEpisodesBySeasonId.mockRejectedValue(new Error('db error'));

    const handler = new FindEpisodesbySeasonHandler(repo as any);
    const result = await handler.execute(new FindEpisodesBySeasonId('season1'));

    expect(result.isErr()).toBe(true);
  });
});
