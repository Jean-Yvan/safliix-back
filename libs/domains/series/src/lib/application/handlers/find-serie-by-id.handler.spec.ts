import { FindSerieByIdHandler } from './find-serie-by-id.handler';
import { FindSerieByIdQuery } from '../cqrs/queries/find-serie-by-id.query';
import type { ISerieRepository } from '../../domain/ports/serie.repository';
import { Serie } from '../../domain/entities/serie.entity';

describe('FindSerieByIdHandler', () => {
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

  it('retourne la série si trouvée', async () => {
    const repo = buildRepo();
    const serie = { id: 'serie1' } as unknown as Serie;
    repo.findById.mockResolvedValue(serie);

    const handler = new FindSerieByIdHandler(repo as any);
    const result = await handler.execute(new FindSerieByIdQuery('serie1'));

    expect(repo.findById).toHaveBeenCalledWith('serie1');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(serie);
  });

  it('retourne une erreur si non trouvé', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);

    const handler = new FindSerieByIdHandler(repo as any);
    const result = await handler.execute(new FindSerieByIdQuery('missing'));

    expect(result.isErr()).toBe(true);
  });
});
