import { ToggleFavoriteHandler } from './index';
import { ToggleFavoriteCommand } from '../application/cqrs/commands/toggle-favorite.command';

describe('ToggleFavoriteHandler', () => {
  const buildPrisma = () => {
    const store: any[] = [];
    return {
      favorite: {
        findFirst: jest.fn(({ where }) =>
          Promise.resolve(store.find((f) => f.userId === where.userId && f.contentId === where.contentId) ?? null)
        ),
        delete: jest.fn(({ where }) => {
          const idx = store.findIndex((f) => f.id === where.id);
          if (idx >= 0) store.splice(idx, 1);
          return Promise.resolve();
        }),
        create: jest.fn(({ data }) => {
          store.push({ ...data, id: `${store.length + 1}` });
          return Promise.resolve(data);
        }),
      },
      __store: store,
    };
  };

  it('ajoute un favori quand il nexiste pas', async () => {
    const prisma = buildPrisma();
    const handler = new ToggleFavoriteHandler(prisma as any);

    const result = await handler.execute(
      new ToggleFavoriteCommand('user1', 'content1', 'film', 'Title', 'img')
    );

    expect(result.isFavorite).toBe(true);
    expect(prisma.favorite.create).toHaveBeenCalled();
  });

  it('supprime un favori existant', async () => {
    const prisma = buildPrisma();
    // seed favorite
    await prisma.favorite.create({
      data: { id: '1', userId: 'user1', contentId: 'content1', contentType: 'film', title: 't', image: 'i' },
    });
    prisma.favorite.findFirst.mockResolvedValue({ id: '1', userId: 'user1', contentId: 'content1' });

    const handler = new ToggleFavoriteHandler(prisma as any);
    const result = await handler.execute(
      new ToggleFavoriteCommand('user1', 'content1', 'film')
    );

    expect(result.isFavorite).toBe(false);
    expect(prisma.favorite.delete).toHaveBeenCalled();
  });
});
