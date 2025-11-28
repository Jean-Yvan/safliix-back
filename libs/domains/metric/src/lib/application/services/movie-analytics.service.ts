import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { CountryMetric, RevenuePerMovie, ViewCountPerVideo } from '../../interfaces/analytics.interfaces';

@Injectable()
export class MovieAnalyticsService {
  private readonly logger = new Logger(MovieAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTotalActiveSubscribers(): Promise<number> {
    const now = new Date();
    return this.prisma.subscription.count({ where: { endDate: { gte: now } } });
  }

  async getRentalRevenueByCategory(): Promise<Record<string, number>> {
    try {
      const purchases = await this.prisma.purchase.findMany({
        select: {
          movie: {
            select: {
              rentalPrice: true,
              metadata: { select: { category: { select: { category: true } } } },
            },
          },
          serie: {
            select: {
              rentalPrice: true,
              metadata: { select: { category: { select: { category: true } } } },
            },
          },
        },
      });

      const revenueMap = new Map<string, number>();

      purchases.forEach((purchase) => {
        const price = purchase.movie?.rentalPrice ?? purchase.serie?.rentalPrice ?? 0;
        if (!price) {
          return;
        }
        const categoryName =
          purchase.movie?.metadata?.category?.category ??
          purchase.serie?.metadata?.category?.category ??
          'Uncategorized';
        revenueMap.set(categoryName, (revenueMap.get(categoryName) ?? 0) + price);
      });

      return Object.fromEntries(revenueMap);
    } catch (error) {
      this.logger.error('Failed to get rental revenue by category', error as Error);
      return {};
    }
  }

  async getTopRevenuePerformers(): Promise<RevenuePerMovie[]> {
    try {
      const groupedPurchases = await this.prisma.purchase.groupBy({
        by: ['movieId'],
        _count: { movieId: true },
      });
      if (groupedPurchases.length === 0) {
        return [];
      }

      const movieIds = groupedPurchases.map((item) => item.movieId).filter((id): id is string => Boolean(id));
      const movies = await this.prisma.movie.findMany({
        where: { id: { in: movieIds } },
        select: { id: true, rentalPrice: true },
      });
      const priceMap = new Map(movies.map((movie) => [movie.id, movie.rentalPrice ?? 0]));

      const revenues = groupedPurchases
        .map((item) => {
          const rentalCount =
            typeof item._count === 'object' && item._count ? item._count.movieId ?? 0 : 0;
          if (!item.movieId || rentalCount === 0) {
            return null;
          }
          const price = priceMap.get(item.movieId) ?? 0;
          return {
            movieId: item.movieId,
            totalRevenue: price * rentalCount,
          };
        })
        .filter((item): item is RevenuePerMovie => {
          if (!item) {
            return false;
          }
          return item.totalRevenue > 0;
        })
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 2);

      return revenues;
    } catch (error) {
      this.logger.error('Failed to get top revenue performers', error as Error);
      return [];
    }
  }

  async getTopViewPerformers(): Promise<ViewCountPerVideo[]> {
    try {
      const groupedViews = await this.prisma.userVideoView.groupBy({
        by: ['videoId'],
        _count: { videoId: true },
        orderBy: [{ _count: { videoId: 'desc' } }],
        take: 2,
      });

      return groupedViews.map((item) => ({
        videoId: item.videoId,
        viewCount: item._count.videoId,
      }));
    } catch (error) {
      this.logger.error('Failed to get top view performers', error as Error);
      return [];
    }
  }

  private async getMostFollowedContentId(): Promise<{ videoId: string | null; totalViews: number }> {
    const topViewRaw = await this.prisma.userVideoView.groupBy({
      by: ['videoId'],
      _count: { videoId: true },
      orderBy: [{ _count: { videoId: 'desc' } }],
      take: 1,
    });

    return topViewRaw.length > 0
      ? { videoId: topViewRaw[0].videoId, totalViews: topViewRaw[0]._count.videoId }
      : { videoId: null, totalViews: 0 };
  }

  async getMostFollowedContentSubscriberPercentage(): Promise<number> {
    try {
      const [topContent, totalActiveSubscribers] = await Promise.all([
        this.getMostFollowedContentId(),
        this.getTotalActiveSubscribers(),
      ]);

      if (!topContent.videoId || totalActiveSubscribers === 0) {
        return 0;
      }

      const uniqueViewers = await this.prisma.userVideoView.groupBy({
        by: ['userId'],
        where: { videoId: topContent.videoId },
      });
      const uniqueViewersCount = uniqueViewers.length;

      const percentage = (uniqueViewersCount / totalActiveSubscribers) * 100;
      return parseFloat(percentage.toFixed(2));
    } catch (error) {
      this.logger.error('Failed to get most followed content subscriber percentage', error as Error);
      return 0;
    }
  }

  async getMostFollowedContentTopCountries(): Promise<(CountryMetric & { percentage: number })[]> {
    try {
      const topContent = await this.getMostFollowedContentId();
      if (!topContent.videoId || topContent.totalViews === 0) {
        return [];
      }

      const topCountriesRaw = await this.prisma.userVideoView.groupBy({
        by: ['country'],
        where: { videoId: topContent.videoId, country: { not: null } },
        _count: { country: true },
        orderBy: [{ _count: { country: 'desc' } }],
        take: 4,
      });

      return topCountriesRaw
        .filter((item) => Boolean(item.country))
        .map((item) => {
          const count = item._count.country;
          const percentage = (count / topContent.totalViews) * 100;
          return {
            country: item.country as string,
            count,
            percentage: parseFloat(percentage.toFixed(2)),
          };
        });
    } catch (error) {
      this.logger.error('Failed to get most followed content top countries', error as Error);
      return [];
    }
  }
}
