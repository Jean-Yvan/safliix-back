import { Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@safliix-back/database';
import {
  GetDashboardMetricsQuery,
  GetDashboardHighlightsQuery,
  GetDashboardRepartitionQuery,
  GetFilmStatsQuery,
  GetRevenueStatsQuery,
  GetRevenueByContentQuery,
  GetAdsStatsQuery,
  GetAdsStatsByIdQuery,
  GetUserStatsQuery,
} from '../cqrs/queries/dashboard.queries';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { PlatformAnalyticsService } from '../services/platform-analytics.service';
import { AdAnalyticsService } from '../services/ad-analytics.service';

type DateRange = { from?: Date; to?: Date };

@QueryHandler(GetDashboardMetricsQuery)
export class GetDashboardMetricsHandler extends BaseQueryHandler<GetDashboardMetricsQuery, any> {
  protected override logger = new Logger(GetDashboardMetricsHandler.name);

  constructor(
    private readonly platformAnalytics: PlatformAnalyticsService,
  ) {
    super();
  }

  protected override async handle(query: GetDashboardMetricsQuery) {
    // range is informational; for now metrics stay global. Hooks here if date filters become needed.
    const range = query.from && query.to ? { start: query.from, end: query.to } : undefined;

    const [
      revenueTotal,
      newUsers,
      newProducts,
      watching,
      minutes,
      trend,
    ] = await Promise.all([
      this.platformAnalytics.getTotalMonthlyRevenue(range),
      this.platformAnalytics.getNewUsersCount(range),
      this.platformAnalytics.getNewContentCount(range),
      this.platformAnalytics.getCurrentViewingCount(),
      this.platformAnalytics.getTotalMinutesWatched(),
      this.platformAnalytics.getTop3WatchedContentByTime(),
    ]);

    return {
      revenueTotal,
      newUsers,
      newProducts,
      watching,
      minutes,
      trend,
    };
  }
}

@QueryHandler(GetDashboardHighlightsQuery)
export class GetDashboardHighlightsHandler extends BaseQueryHandler<GetDashboardHighlightsQuery, any> {
  protected override logger = new Logger(GetDashboardHighlightsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adAnalytics: AdAnalyticsService,
  ) {
    super();
  }

  protected override async handle() {
    const [recentMovies, recentSeries, adPerf] = await Promise.all([
      this.prisma.movie.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { metadata: { include: { category: true } } },
      }),
      this.prisma.serie.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { metadata: { include: { category: true } } },
      }),
      this.adAnalytics.getAdPerformanceMetrics(),
    ]);

    const recentContents = [
      ...recentMovies.map((m) => ({
        id: m.id,
        title: m.metadata.title,
        type: 'movie',
        status: m.status,
        price: m.rentalPrice ?? 0,
        date: m.createdAt,
        publisher: m.metadata.productionHouse,
        stats: {},
      })),
      ...recentSeries.map((s) => ({
        id: s.id,
        title: s.metadata.title,
        type: 'serie',
        status: s.status,
        price: s.rentalPrice ?? 0,
        date: s.createdAt,
        publisher: s.metadata.productionHouse,
        stats: {},
      })),
    ].sort((a, b) => Number(b.date) - Number(a.date));

    const [rentalCount, subscriptionCount, topCountries] = await Promise.all([
      this.prisma.purchase.count(),
      this.prisma.subscription.count(),
      this.prisma.userVideoView.groupBy({
        by: ['country'],
        _count: { country: true },
        orderBy: [{ _count: { country: 'desc' } }],
        take: 5,
      }),
    ]);

    return {
      recentContents,
      donuts: {
        rentals: rentalCount,
        subscriptions: subscriptionCount,
        ads: adPerf.totalViews,
      },
      topCountries: topCountries
        .filter((c) => c.country)
        .map((c) => ({ name: c.country as string, value: c._count.country })),
    };
  }
}

@QueryHandler(GetDashboardRepartitionQuery)
export class GetDashboardRepartitionHandler extends BaseQueryHandler<GetDashboardRepartitionQuery, any> {
  protected override logger = new Logger(GetDashboardRepartitionHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetDashboardRepartitionQuery) {
    const range: DateRange = { from: query.from, to: query.to };
    const whereDate =
      range.from || range.to
        ? { gte: range.from, lte: range.to }
        : undefined;

    const [countries, rentalCount, subscriptionCount] = await Promise.all([
      this.prisma.userVideoView.groupBy({
        by: ['country'],
        where: {
          country: { not: null },
          startedAt: whereDate,
        },
        _count: { country: true },
        orderBy: [{ _count: { country: 'desc' } }],
        take: 10,
      }),
      this.prisma.purchase.count({ where: { purchaseDate: whereDate } }),
      this.prisma.subscription.count({ where: { startDate: whereDate } }),
    ]);

    return {
      countries: countries
        .filter((c) => c.country)
        .map((c) => ({ name: c.country as string, value: c._count.country })),
      locationVsSubscription: [
        { name: 'location', series: [{ name: 'total', value: rentalCount }] },
        {
          name: 'subscription',
          series: [{ name: 'total', value: subscriptionCount }],
        },
      ],
    };
  }
}

@QueryHandler(GetFilmStatsQuery)
export class GetFilmStatsHandler extends BaseQueryHandler<GetFilmStatsQuery, any> {
  protected override logger = new Logger(GetFilmStatsHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetFilmStatsQuery) {
    const where =
      query.from || query.to
        ? { purchaseDate: { gte: query.from, lte: query.to } }
        : {};

    const purchases = await this.prisma.purchase.groupBy({
      by: ['movieId'],
      _count: { movieId: true },
      where,
    });

    return purchases.map((p) => ({
      movieId: p.movieId,
      count: p._count.movieId,
    }));
  }
}

@QueryHandler(GetRevenueStatsQuery)
export class GetRevenueStatsHandler extends BaseQueryHandler<GetRevenueStatsQuery, any> {
  protected override logger = new Logger(GetRevenueStatsHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetRevenueStatsQuery) {
    const purchaseWhere =
      query.from || query.to
        ? { purchaseDate: { gte: query.from, lte: query.to } }
        : undefined;
    const subscriptionWhere =
      query.from || query.to
        ? { startDate: { gte: query.from, lte: query.to } }
        : undefined;

    const [purchases, subscriptions] = await Promise.all([
      this.prisma.purchase.findMany({
        where: purchaseWhere,
        select: {
          movie: { select: { rentalPrice: true } },
          serie: { select: { rentalPrice: true } },
        },
      }),
      this.prisma.subscription.findMany({
        where: subscriptionWhere,
        select: { plan: { select: { price: true } } },
      }),
    ]);

    const rentals = purchases.reduce((acc, p) => {
      const price = p.movie?.rentalPrice ?? p.serie?.rentalPrice ?? 0;
      return acc + price;
    }, 0);
    const subscriptionRevenue = subscriptions.reduce(
      (acc, sub) => acc + (sub.plan?.price ?? 0),
      0,
    );

    return { location: rentals, abonnement: subscriptionRevenue };
  }
}

@QueryHandler(GetRevenueByContentQuery)
export class GetRevenueByContentHandler extends BaseQueryHandler<GetRevenueByContentQuery, any> {
  protected override logger = new Logger(GetRevenueByContentHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetRevenueByContentQuery) {
    const purchases = await this.prisma.purchase.findMany({
      where: { OR: [{ movieId: query.id }, { serieId: query.id }] },
      select: {
        movie: { select: { rentalPrice: true } },
        serie: { select: { rentalPrice: true } },
      },
    });

    const total = purchases.reduce((acc, p) => {
      const price = p.movie?.rentalPrice ?? p.serie?.rentalPrice ?? 0;
      return acc + price;
    }, 0);

    return { id: query.id, total };
  }
}

@QueryHandler(GetAdsStatsQuery)
export class GetAdsStatsHandler extends BaseQueryHandler<GetAdsStatsQuery, any> {
  protected override logger = new Logger(GetAdsStatsHandler.name);

  constructor(private readonly adAnalytics: AdAnalyticsService) {
    super();
  }

  protected override async handle() {
    return this.adAnalytics.getAdPerformanceMetrics();
  }
}

@QueryHandler(GetAdsStatsByIdQuery)
export class GetAdsStatsByIdHandler extends BaseQueryHandler<GetAdsStatsByIdQuery, any> {
  protected override logger = new Logger(GetAdsStatsByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle(query: GetAdsStatsByIdQuery) {
    const [views, viewsCount] = await Promise.all([
      this.prisma.adView.findMany({
        where: { adId: query.id },
        select: { country: true, viewed_at: true },
      }),
      this.prisma.adView.count({ where: { adId: query.id } }),
    ]);

    const perCountry = views.reduce<Record<string, number>>((acc, view) => {
      if (!view.country) return acc;
      acc[view.country] = (acc[view.country] ?? 0) + 1;
      return acc;
    }, {});

    return {
      id: query.id,
      total: viewsCount,
      topCountries: Object.entries(perCountry).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }
}

@QueryHandler(GetUserStatsQuery)
export class GetUserStatsHandler extends BaseQueryHandler<GetUserStatsQuery, any> {
  protected override logger = new Logger(GetUserStatsHandler.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected override async handle() {
    const perMonth = await this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: { createdAt: true },
    });

    return perMonth.map((item) => ({
      month: item.createdAt,
      count: item._count.createdAt,
    }));
  }
}
