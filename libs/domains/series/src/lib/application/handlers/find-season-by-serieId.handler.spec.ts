import { FindSeasonsbySerieHandler } from './find-season-by-serieId.handler';
import { FindSeasonsBySerieId } from '../cqrs/queries/find-season-by-serieId.query';
import type { ISerieRepository } from '../../domain/ports/serie.repository';
import { Season } from '../../domain/entities/season.entity';

describe('FindSeasonsbySerieHandler', () => {
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

  it('renvoie les saisons associées', async () => {
    const repo = buildRepo();
    const seasons = [{ id: 's1' } as Season];
    repo.findSeasonsBySerieId.mockResolvedValue(seasons);

    const handler = new FindSeasonsbySerieHandler(repo as any);
    const result = await handler.execute(new FindSeasonsBySerieId('serie1'));

    expect(repo.findSeasonsBySerieId).toHaveBeenCalledWith('serie1');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(seasons);
  });

  it('remonte une Err si le repo rejette', async () => {
    const repo = buildRepo();
    repo.findSeasonsBySerieId.mockRejectedValue(new Error('db error'));

    const handler = new FindSeasonsbySerieHandler(repo as any);
    const result = await handler.execute(new FindSeasonsBySerieId('serie1'));

    expect(result.isErr()).toBe(true);
  });
});
