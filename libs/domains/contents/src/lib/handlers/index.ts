import { Module } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@safliix-back/database';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { ListCatalogSectionsQuery } from '../application/cqrs/queries/list-catalog-sections.query';
import { SearchCatalogQuery } from '../application/cqrs/queries/search-catalog.query';
import { GetContentQuery } from '../application/cqrs/queries/get-content.query';
import { GetEpisodesQuery } from '../application/cqrs/queries/get-episodes.query';
import { GetRecommendationsQuery } from '../application/cqrs/queries/get-recommendations.query';
import { GetReviewsQuery } from '../application/cqrs/queries/get-reviews.query';
import { AddReviewCommand } from '../application/cqrs/commands/add-review.command';
import { ToggleFavoriteCommand } from '../application/cqrs/commands/toggle-favorite.command';
import type { CatalogSectionKey } from '../interfaces/dto/catalog.dto';
import type { Prisma } from '@safliix-back/database';
import { ListFavoritesQuery } from '../application/cqrs/queries/list-favorites.query';
import { CreateFavoriteCommand } from '../application/cqrs/commands/create-favorite.command';
import { DeleteFavoriteCommand } from '../application/cqrs/commands/delete-favorite.command';
import { FavoriteDto } from '../interfaces/dto/favorite.dto';
import { GetPlaybackQuery } from '../application/cqrs/queries/get-playback.query';

const SECTION_TITLES: Record<CatalogSectionKey, string> = {
  recommended: 'Recommandés pour vous',
  'most-searched': 'Les plus recherchés',
  'no-boredom': "Vous n'allez pas vous ennuyer",
  'imdb-top-movies': 'IMDb Top Movies',
  'imdb-top-series': 'IMDb Top Séries',
  favorites: 'Dans vos favoris',
  rewatch: 'À revoir',
};

@QueryHandler(ListCatalogSectionsQuery)
export class ListCatalogSectionsHandler extends BaseQueryHandler<ListCatalogSectionsQuery, any> {
  protected override logger = new Logger(ListCatalogSectionsHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: ListCatalogSectionsQuery) {
    const type = query.type ?? 'all';
    const section: CatalogSectionKey = query.section ?? 'recommended';

    const items = await this.buildSectionItems(section, type, query.userId);
    const title = SECTION_TITLES[section];

    const sections = items.length ? [{ key: section, title, items }] : [];

    return { sections };
  }

  private mapMovie(movie: any) {
    return {
      id: movie.id,
      type: 'film' as const,
      title: movie.metadata.title,
      image: movie.metadata.thumbnailUrl,
      badge: movie.metadata.category?.category,
    };
  }

  private mapSerie(serie: any) {
    return {
      id: serie.id,
      type: 'serie' as const,
      title: serie.metadata.title,
      image: serie.metadata.thumbnailUrl,
      badge: serie.metadata.category?.category,
    };
  }

  private async buildSectionItems(section: CatalogSectionKey, type: 'film' | 'serie' | 'all', userId?: string) {
    switch (section) {
      case 'recommended':
        return this.getRecommended(type);
      case 'most-searched':
        return this.getMostSearched(type);
      case 'no-boredom':
        return this.getNoBoredom(type);
      case 'imdb-top-movies':
        return type === 'serie' ? [] : this.getTopRatedMovies();
      case 'imdb-top-series':
        return type === 'film' ? [] : this.getTopRatedSeries();
      case 'favorites':
        return this.getFavorites(type, userId);
      case 'rewatch':
        return this.getRewatch(type, userId);
      default:
        return this.getRecommended(type);
    }
  }

  private async getRecommended(type: 'film' | 'serie' | 'all') {
    const [movies, series] = await Promise.all([
      type !== 'serie'
        ? this.prisma.movie.findMany({
            where: { status: 'PUBLISHED' },
            include: { metadata: { include: { category: true } } },
            take: 20,
            orderBy: { createdAt: 'desc' },
          })
        : [],
      type !== 'film'
        ? this.prisma.serie.findMany({
            where: { status: 'published' },
            include: { metadata: { include: { category: true } } },
            take: 20,
            orderBy: { createdAt: 'desc' },
          })
        : [],
    ]);

    const movieItems = movies.map((movie) => this.mapMovie(movie));
    const seriesItems = series.map((serie) => this.mapSerie(serie));

    return [...movieItems, ...seriesItems].slice(0, 20);
  }

  private async getMostSearched(type: 'film' | 'serie' | 'all') {
    const searchStatRepo = (this.prisma as any).searchStat as
      | {
          findMany: (args: any) => Promise<Array<{ contentId: string; contentType: string }>>;
        }
      | undefined;

    const whereType =
      type === 'all'
        ? {}
        : {
            contentType: type === 'film' ? 'film' : 'serie',
          };

    const stats =
      searchStatRepo &&
      (await searchStatRepo.findMany({
        where: whereType,
        orderBy: [{ count: 'desc' }, { lastSearchedAt: 'desc' }],
        take: 60,
      }));

    // Fallback to view counts if the dedicated stats table is empty or unavailable
    if (!stats || stats.length === 0) {
      const fallback = await this.prisma.userVideoView.groupBy({
        by: ['videoId'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 60,
      });
      return this.resolveVideoIds(fallback.map((s) => s.videoId), type).slice(0, 20);
    }

    const ids = stats.map((s) => s.contentId);
    return this.resolveVideoIds(ids, type).slice(0, 20);
  }

  private async resolveVideoIds(ids: string[], type: 'film' | 'serie' | 'all') {
    const [movies, series] = await Promise.all([
      type !== 'serie'
        ? this.prisma.movie.findMany({
            where: { id: { in: ids }, status: 'PUBLISHED' },
            include: { metadata: { include: { category: true } } },
          })
        : [],
      type !== 'film'
        ? this.prisma.serie.findMany({
            where: { id: { in: ids }, status: 'published' },
            include: { metadata: { include: { category: true } } },
          })
        : [],
    ]);

    const movieById = new Map(movies.map((m) => [m.id, this.mapMovie(m)]));
    const serieById = new Map(series.map((s) => [s.id, this.mapSerie(s)]));

    return ids
      .map((id) => movieById.get(id) ?? serieById.get(id))
      .filter(Boolean) as Array<{ id: string; type: 'film' | 'serie'; title: string; image: string | null; badge?: string }>;
  }

  private async getNoBoredom(type: 'film' | 'serie' | 'all') {
    const preferredGenres = ['Action', 'Adventure', 'Aventure', 'Comédie', 'Comedy', 'Thriller'];

    const [movies, series] = await Promise.all([
      type !== 'serie'
        ? this.prisma.movie.findMany({
            where: {
              status: 'PUBLISHED',
              metadata: { gender: { name: { in: preferredGenres } } },
            },
            include: { metadata: { include: { category: true } } },
            take: 20,
            orderBy: { updatedAt: 'desc' },
          })
        : [],
      type !== 'film'
        ? this.prisma.serie.findMany({
            where: {
              status: 'published',
              metadata: { gender: { name: { in: preferredGenres } } },
            },
            include: { metadata: { include: { category: true } } },
            take: 20,
            orderBy: { updatedAt: 'desc' },
          })
        : [],
    ]);

    return [...movies.map((m) => this.mapMovie(m)), ...series.map((s) => this.mapSerie(s))].slice(0, 20);
  }

  private async getTopRatedMovies() {
    const ratingStats = await this.prisma.userVideoView.groupBy({
      by: ['videoId'],
      where: { rating: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
      orderBy: [{ _avg: { rating: 'desc' } }, { _count: { _all: 'desc' } }],
      take: 60,
    });

    const ids = ratingStats.map((s) => s.videoId);
    const movies = await this.prisma.movie.findMany({
      where: { id: { in: ids }, status: 'PUBLISHED' },
      include: { metadata: { include: { category: true } } },
    });

    const movieById = new Map(movies.map((m) => [m.id, this.mapMovie(m)]));
    const ordered = ratingStats
      .map((stat) => movieById.get(stat.videoId))
      .filter(Boolean) as Array<{ id: string; type: 'film'; title: string; image: string | null; badge?: string }>;

    return ordered.slice(0, 20);
  }

  private async getTopRatedSeries() {
    const ratingStats = await this.prisma.serieView.groupBy({
      by: ['seriesId'],
      where: { rating: { not: null } },
      _avg: { rating: true },
      _count: { _all: true },
      orderBy: [{ _avg: { rating: 'desc' } }, { _count: { _all: 'desc' } }],
      take: 60,
    });

    const ids = ratingStats.map((s) => s.seriesId);
    const series = await this.prisma.serie.findMany({
      where: { id: { in: ids }, status: 'published' },
      include: { metadata: { include: { category: true } } },
    });

    const serieById = new Map(series.map((s) => [s.id, this.mapSerie(s)]));
    const ordered = ratingStats
      .map((stat) => serieById.get(stat.seriesId))
      .filter(Boolean) as Array<{ id: string; type: 'serie'; title: string; image: string | null; badge?: string }>;

    return ordered.slice(0, 20);
  }

  private async getFavorites(type: 'film' | 'serie' | 'all', userId?: string) {
    if (!userId) {
      return [];
    }

    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const movieIds = favorites
      .filter((f) => f.contentType?.toLowerCase().includes('film') || f.contentType?.toLowerCase().includes('movie'))
      .map((f) => f.contentId);
    const serieIds = favorites
      .filter((f) => f.contentType?.toLowerCase().includes('serie'))
      .map((f) => f.contentId);

    const [movies, series] = await Promise.all([
      type !== 'serie'
        ? this.prisma.movie.findMany({
            where: { id: { in: movieIds }, status: 'PUBLISHED' },
            include: { metadata: { include: { category: true } } },
          })
        : [],
      type !== 'film'
        ? this.prisma.serie.findMany({
            where: { id: { in: serieIds }, status: 'published' },
            include: { metadata: { include: { category: true } } },
          })
        : [],
    ]);

    const movieById = new Map(movies.map((m) => [m.id, this.mapMovie(m)]));
    const serieById = new Map(series.map((s) => [s.id, this.mapSerie(s)]));

    const ordered = favorites
      .map((fav) => movieById.get(fav.contentId) ?? serieById.get(fav.contentId))
      .filter(Boolean) as Array<{ id: string; type: 'film' | 'serie'; title: string; image: string | null; badge?: string }>;

    return ordered.slice(0, 20);
  }

  private async getRewatch(type: 'film' | 'serie' | 'all', userId?: string) {
    if (!userId) {
      return [];
    }

    const views = await this.prisma.userVideoView.findMany({
      where: { userId, completed: true },
      orderBy: { updatedAt: 'desc' },
      take: 60,
    });

    const ids = views.map((v) => v.videoId);
    const [movies, series] = await Promise.all([
      type !== 'serie'
        ? this.prisma.movie.findMany({
            where: { id: { in: ids }, status: 'PUBLISHED' },
            include: { metadata: { include: { category: true } } },
          })
        : [],
      type !== 'film'
        ? this.prisma.serie.findMany({
            where: { id: { in: ids }, status: 'published' },
            include: { metadata: { include: { category: true } } },
          })
        : [],
    ]);

    const movieById = new Map(movies.map((m) => [m.id, this.mapMovie(m)]));
    const serieById = new Map(series.map((s) => [s.id, this.mapSerie(s)]));

    const ordered = views
      .map((view) => movieById.get(view.videoId) ?? serieById.get(view.videoId))
      .filter(Boolean) as Array<{ id: string; type: 'film' | 'serie'; title: string; image: string | null; badge?: string }>;

    return ordered.slice(0, 20);
  }
}

@QueryHandler(SearchCatalogQuery)
export class SearchCatalogHandler extends BaseQueryHandler<SearchCatalogQuery, any> {
  protected override logger = new Logger(SearchCatalogHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: SearchCatalogQuery) {
    const whereCommon: any = {
      metadata: {
        title: { contains: query.payload.q, mode: 'insensitive' },
      },
    };

    if (query.payload.genre) {
      whereCommon.metadata.gender = {
        name: { contains: query.payload.genre, mode: 'insensitive' },
      };
    }

    if (query.payload.badge) {
      whereCommon.metadata.category = {
        category: { contains: query.payload.badge, mode: 'insensitive' },
      };
    }

    const results: Array<{ id: string; type: 'film' | 'serie'; title: string; image: string | null }> = [];

    if (!query.payload.type || query.payload.type === 'film') {
      const movies = await this.prisma.movie.findMany({
        where: whereCommon,
        include: { metadata: { include: { category: true } } },
        take: 20,
      });

      results.push(
        ...movies.map((movie) => ({
          id: movie.id,
          type: 'film' as const,
          title: movie.metadata.title,
          image: movie.metadata.thumbnailUrl,
        }))
      );
    }

    if (!query.payload.type || query.payload.type === 'serie') {
      const series = await this.prisma.serie.findMany({
        where: whereCommon,
        include: { metadata: { include: { category: true } } },
        take: 20,
      });

      results.push(
        ...series.map((serie) => ({
          id: serie.id,
          type: 'serie' as const,
          title: serie.metadata.title,
          image: serie.metadata.thumbnailUrl,
        }))
      );
    }

    await this.logSearch(query.payload, results);

    return { items: results };
  }

  private async logSearch(
    payload: {
      q: string;
      type?: 'film' | 'serie';
      genre?: string;
      badge?: string;
      userId?: string;
    },
    results: Array<{ id: string; type: 'film' | 'serie'; title: string; image: string | null }>
  ) {
    if (!payload.q?.trim()) {
      return;
    }

    const now = new Date();

    const searchEvent: Prisma.SearchEventCreateInput = {
      q: payload.q,
      type: payload.type,
      genre: payload.genre,
      badge: payload.badge,
      results: results.length,
      searchedAt: now,
      userId: payload.userId,
    };

    const statUpdates = results.slice(0, 20).map((item) =>
      this.prisma.searchStat.upsert({
        where: { contentId_contentType: { contentId: item.id, contentType: item.type } },
        update: { count: { increment: 1 }, lastSearchedAt: now },
        create: { contentId: item.id, contentType: item.type, count: 1, lastSearchedAt: now },
      })
    );

    await this.prisma.$transaction([
      this.prisma.searchEvent.create({ data: searchEvent }),
      ...statUpdates,
    ]);
  }
}

@QueryHandler(GetContentQuery)
export class GetContentHandler extends BaseQueryHandler<GetContentQuery, any> {
  protected override logger = new Logger(GetContentHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetContentQuery) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: query.id },
      include: {
        metadata: { include: { category: true, gender: true } },
        attachment: { include: { mediaFile: true } },
        tags: { include: { tag: true } },
      },
    });

    if (movie) {
      const mediaFile = movie.attachment.at(0)?.mediaFile;
      return {
        id: movie.id,
        type: 'film',
        title: movie.metadata.title,
        synopsis: movie.metadata.description,
        duration: mediaFile?.duration ?? null,
        genres: movie.metadata.gender ? [movie.metadata.gender.name] : [],
        tags: movie.tags.map((tag) => tag.tag.name),
        poster: movie.metadata.thumbnailUrl,
        country: movie.metadata.productionCountry,
        audio: [],
        availableFor: movie.type,
      };
    }

    const serie = await this.prisma.serie.findUnique({
      where: { id: query.id },
      include: {
        metadata: { include: { category: true, gender: true } },
        attachment: { include: { mediaFile: true } },
        tags: { include: { tag: true } },
      },
    });

    if (serie) {
      const mediaFile = serie.attachment.at(0)?.mediaFile;
      return {
        id: serie.id,
        type: 'serie',
        title: serie.metadata.title,
        synopsis: serie.metadata.description,
        duration: mediaFile?.duration ?? null,
        genres: serie.metadata.gender ? [serie.metadata.gender.name] : [],
        tags: serie.tags.map((tag) => tag.tag.name),
        poster: serie.metadata.thumbnailUrl,
        country: serie.metadata.productionCountry,
        audio: [],
        availableFor: serie.type,
      };
    }

    throw new Error('Content not found');
  }
}

@QueryHandler(GetEpisodesQuery)
export class GetEpisodesHandler extends BaseQueryHandler<GetEpisodesQuery, any> {
  protected override logger = new Logger(GetEpisodesHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetEpisodesQuery) {
    const serie = await this.prisma.serie.findUnique({ where: { id: query.id } });
    if (!serie) {
      return { episodes: [] };
    }

    const episodes = await this.prisma.episode.findMany({
      where: { season: { serieId: query.id } },
      include: { season: true, attachment: { include: { mediaFile: true } } },
      orderBy: [{ season: { number: 'asc' } }, { number: 'asc' }],
    });

    return {
      episodes: episodes.map((episode) => ({
        id: episode.id,
        title: episode.title ?? `Episode ${episode.number}`,
        duration: episode.attachment.at(0)?.mediaFile?.duration ?? null,
        synopsis: episode.description,
        image: episode.attachment.at(0)?.mediaFile?.s3Key ?? null,
        season: episode.season.number,
        number: episode.number,
      })),
    };
  }
}

@QueryHandler(GetRecommendationsQuery)
export class GetRecommendationsHandler extends BaseQueryHandler<GetRecommendationsQuery, any> {
  protected override logger = new Logger(GetRecommendationsHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetRecommendationsQuery) {
    const base = await this.prisma.movie.findUnique({
      where: { id: query.id },
      include: { metadata: { include: { category: true } } },
    });

    const serieBase =
      base ??
      (await this.prisma.serie.findUnique({
        where: { id: query.id },
        include: { metadata: { include: { category: true } } },
      }));

    if (!serieBase) {
      return { items: [] };
    }

    const sameCategory = serieBase.metadata.category?.category;
    const movies = await this.prisma.movie.findMany({
      where: {
        id: { not: serieBase.id },
        metadata: sameCategory
          ? { category: { category: { equals: sameCategory, mode: 'insensitive' } } }
          : undefined,
      },
      include: { metadata: true },
      take: 10,
    });

    const series = await this.prisma.serie.findMany({
      where: {
        id: { not: serieBase.id },
        metadata: sameCategory
          ? { category: { category: { equals: sameCategory, mode: 'insensitive' } } }
          : undefined,
      },
      include: { metadata: true },
      take: 10,
    });

    const items = [
      ...movies.map((movie) => ({
        id: movie.id,
        type: 'film' as const,
        title: movie.metadata.title,
        image: movie.metadata.thumbnailUrl,
      })),
      ...series.map((serie) => ({
        id: serie.id,
        type: 'serie' as const,
        title: serie.metadata.title,
        image: serie.metadata.thumbnailUrl,
      })),
    ];

    return { items };
  }
}

@QueryHandler(GetReviewsQuery)
export class GetReviewsHandler extends BaseQueryHandler<GetReviewsQuery, any> {
  protected override logger = new Logger(GetReviewsHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetReviewsQuery) {
    const comments = await this.prisma.comment.findMany({
      where: { movieId: query.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reviews: comments.map((comment) => ({
        id: comment.id,
        author: comment.user?.name ?? comment.user?.email ?? 'Anonymous',
        rating: null,
        content: comment.text,
        createdAt: comment.createdAt,
        status: 'published' as const,
      })),
    };
  }
}

@CommandHandler(AddReviewCommand)
export class AddReviewHandler implements ICommandHandler<AddReviewCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddReviewCommand) {
    const review = await this.prisma.comment.create({
      data: {
        movieId: command.contentId,
        userId: command.userId,
        text: command.payload.content,
      },
    });

    return { id: review.id, status: 'published' as const };
  }
}

@QueryHandler(GetPlaybackQuery)
export class GetPlaybackHandler extends BaseQueryHandler<GetPlaybackQuery, any> {
  protected override logger = new Logger(GetPlaybackHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetPlaybackQuery) {
    const attachmentType = query.attachmentType ?? 'MAIN';

    const movie =
      query.type === 'film'
        ? await this.prisma.movie.findUnique({
            where: { id: query.id },
            include: { attachment: { include: { mediaFile: true } } },
          })
        : null;

    if (movie) {
      const media = this.pickMedia(movie.attachment, attachmentType);
      if (!media) throw new Error('Media file not found');
      return this.toPlayback(media);
    }

    const serie =
      query.type === 'serie'
        ? await this.prisma.serie.findUnique({
            where: { id: query.id },
            include: { attachment: { include: { mediaFile: true } } },
          })
        : null;

    if (serie) {
      const media = this.pickMedia(serie.attachment, attachmentType);
      if (!media) throw new Error('Media file not found');
      return this.toPlayback(media);
    }

    const episode =
      query.type === 'episode'
        ? await this.prisma.episode.findUnique({
            where: { id: query.id },
            include: { attachment: { include: { mediaFile: true } } },
          })
        : null;

    if (episode) {
      const media = this.pickMedia(episode.attachment, attachmentType);
      if (!media) throw new Error('Media file not found');
      return this.toPlayback(media);
    }

    const ad =
      query.type === 'ad'
        ? await this.prisma.ad.findUnique({
            where: { id: query.id },
            include: { attachment: { include: { mediaFile: true } } },
          })
        : null;

    if (ad) {
      const media = this.pickMedia(ad.attachment, attachmentType);
      if (!media) throw new Error('Media file not found');
      return this.toPlayback(media);
    }

    throw new Error('Content not found');
  }

  private pickMedia(attachments: Array<{ type: string; mediaFile: any }>, preferred: string) {
    return attachments.find((att) => att.type === preferred)?.mediaFile ?? attachments.at(0)?.mediaFile ?? null;
  }

  private toPlayback(mediaFile: any) {
    return {
      mediaId: mediaFile.id,
      url: mediaFile.s3Key,
      duration: mediaFile.duration ?? null,
      width: mediaFile.width ?? null,
      height: mediaFile.height ?? null,
      status: mediaFile.status,
    };
  }
}

@CommandHandler(ToggleFavoriteCommand)
export class ToggleFavoriteHandler implements ICommandHandler<ToggleFavoriteCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ToggleFavoriteCommand) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId: command.userId, contentId: command.contentId },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    }

    await this.prisma.favorite.create({
      data: {
        userId: command.userId,
        contentId: command.contentId,
        contentType: command.contentType,
        title: command.title,
        image: command.image,
      },
    });
    return { isFavorite: true };
  }
}

@QueryHandler(ListFavoritesQuery)
export class ListFavoritesHandler extends BaseQueryHandler<ListFavoritesQuery, any> {
  protected override logger = new Logger(ListFavoritesHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: ListFavoritesQuery) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId: query.userId,
        ...(query.type && { contentType: query.type }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const items = favorites.map((fav) => ({
      id: fav.contentId,
      type: fav.contentType as 'film' | 'serie',
      title: fav.title ?? null,
      image: fav.image ?? null,
    }));

    return { favorites: items };
  }
}

@CommandHandler(CreateFavoriteCommand)
export class CreateFavoriteHandler implements ICommandHandler<CreateFavoriteCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateFavoriteCommand) {
    await this.prisma.favorite.upsert({
      where: { userId_contentId: { userId: command.userId, contentId: command.contentId } },
      update: {
        contentType: command.contentType,
        title: command.title,
        image: command.image,
      },
      create: {
        userId: command.userId,
        contentId: command.contentId,
        contentType: command.contentType,
        title: command.title,
        image: command.image,
      },
    });
    return { isFavorite: true };
  }
}

@CommandHandler(DeleteFavoriteCommand)
export class DeleteFavoriteHandler implements ICommandHandler<DeleteFavoriteCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteFavoriteCommand) {
    await this.prisma.favorite.delete({
      where: { userId_contentId: { userId: command.userId, contentId: command.contentId } },
    });
    return { isFavorite: false };
  }
}

export const CONTENT_HANDLERS = [
  ListCatalogSectionsHandler,
  SearchCatalogHandler,
  GetContentHandler,
  GetEpisodesHandler,
  GetRecommendationsHandler,
  GetReviewsHandler,
  AddReviewHandler,
  ToggleFavoriteHandler,
  ListFavoritesHandler,
  CreateFavoriteHandler,
  DeleteFavoriteHandler,
];
