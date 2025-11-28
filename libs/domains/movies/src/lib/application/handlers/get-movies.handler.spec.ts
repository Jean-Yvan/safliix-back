import { GetMoviesHandler } from './get-movies.handler';
import { GetMoviesQuery } from '../cqrs/queries/get-movies.query';
import { MOVIE_REPOSITORY, MovieFilter } from '../../utils/types';
import type { IMovieRepository } from '../../domain/ports/movie.repository';
import { Result, Ok } from 'oxide.ts';
import { Logger } from '@nestjs/common';

describe('GetMoviesHandler', () => {
  const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

  afterAll(() => loggerSpy.mockRestore());

  it('transmet les filtres à findAll et renvoie le résultat', async () => {
    const repository: jest.Mocked<IMovieRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      publish: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    const movies = [{ id: 'm1', metadata: { title: 'Film' } }] as any;
    repository.findAll.mockResolvedValue(movies);

    const handler = new GetMoviesHandler(repository as any);
    const filters: Partial<MovieFilter> = { q: 'film', category: 'action', genre: 'thriller', page: 0, limit: 5 };
    const result = await handler.execute(new GetMoviesQuery(filters as any));

    expect(repository.findAll).toHaveBeenCalledWith(expect.objectContaining(filters));
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(movies);
  });

  it('remonte les erreurs du repository', async () => {
    const repository: jest.Mocked<IMovieRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      publish: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockRejectedValue(new Error('db error')),
    } as any;

    const handler = new GetMoviesHandler(repository as any);
    const result = await handler.execute(new GetMoviesQuery({ page: 0, limit: 5 } as any));

    expect(result.isErr()).toBe(true);
  });
});
