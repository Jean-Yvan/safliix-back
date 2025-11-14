import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { TopWatchedContent } from '../../interfaces/analytics.interfaces';
import { getMonthRange } from '../../utils/date-range.util';

@Injectable()
export class PlatformAnalyticsService {
  private readonly logger = new Logger(PlatformAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async calculateRentalRevenue(startDate: Date, endDate: Date): Promise<number> {
    const purchases = await this.prisma.purchase.findMany({
      where: { purchaseDate: { gte: startDate, lte: endDate } },
      select: {
        movie: { select: { rentalPrice: true } },
        serie: { select: { rentalPrice: true } },
      },
    });

    return purchases.reduce((total, purchase) => {
      const price = purchase.movie?.rentalPrice ?? purchase.serie?.rentalPrice ?? 0;
      return total + price;
    }, 0);
  }

  private async calculateSubscriptionRevenue(startDate: Date, endDate: Date): Promise<number> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { startDate: { gte: startDate, lte: endDate } },
      select: { plan: { select: { price: true } } },
    });

    return subscriptions.reduce((total, subscription) => total + (subscription.plan?.price ?? 0), 0);
  }

  private async getTotalWatchedSeconds(): Promise<number> {
    const totalSeconds = await this.prisma.userVideoView.aggregate({
      _sum: { progress: true },
    });
    return totalSeconds._sum.progress ?? 0;
  }

  async getTotalMonthlyRevenue(): Promise<number> {
    try {
      const currentMonth = getMonthRange(new Date());
      const [rentalRevenue, subscriptionRevenue] = await Promise.all([
        this.calculateRentalRevenue(currentMonth.start, currentMonth.end),
        this.calculateSubscriptionRevenue(currentMonth.start, currentMonth.end),
      ]);
      return rentalRevenue + subscriptionRevenue;
    } catch (error) {
      this.logger.error('Failed to calculate total monthly revenue', error as Error);
      return 0;
    }
  }

  async getNewUsersCount(): Promise<number> {
    try {
      const currentMonth = getMonthRange(new Date());
      return this.prisma.user.count({
        where: { createdAt: { gte: currentMonth.start, lte: currentMonth.end } },
      });
    } catch (error) {
      this.logger.error('Failed to count new users', error as Error);
      return 0;
    }
  }

  async getNewContentCount(): Promise<number> {
    try {
      const currentMonth = getMonthRange(new Date());
      const [newMovies, newSeries] = await Promise.all([
        this.prisma.movie.count({ where: { createdAt: { gte: currentMonth.start, lte: currentMonth.end } } }),
        this.prisma.serie.count({ where: { createdAt: { gte: currentMonth.start, lte: currentMonth.end } } }),
      ]);
      return newMovies + newSeries;
    } catch (error) {
      this.logger.error('Failed to count new content', error as Error);
      return 0;
    }
  }

  async getCurrentViewingCount(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return this.prisma.userVideoView.count({
        where: {
          completed: false,
          updatedAt: { gte: fiveMinutesAgo },
          endedAt: null,
        },
      });
    } catch (error) {
      this.logger.error('Failed to count current viewings', error as Error);
      return 0;
    }
  }

  async getTotalMinutesWatched(): Promise<number> {
    try {
      const totalSeconds = await this.getTotalWatchedSeconds();
      return Math.round(totalSeconds / 60);
    } catch (error) {
      this.logger.error('Failed to calculate total minutes watched', error as Error);
      return 0;
    }
  }

  async getTop3WatchedContentByTime(): Promise<TopWatchedContent[]> {
    try {
      const [topTimesRaw, totalSecondsWatched] = await Promise.all([
        this.prisma.userVideoView.groupBy({
          by: ['videoId'],
          _sum: { progress: true },
          orderBy: [{ _sum: { progress: 'desc' } }],
          take: 3,
        }),
        this.getTotalWatchedSeconds(),
      ]);

      return topTimesRaw.map((item) => {
        const secondsWatched = item._sum.progress ?? 0;
        const minutesWatched = Math.round(secondsWatched / 60);
        const platformSharePercentage = totalSecondsWatched > 0
          ? parseFloat(((secondsWatched / totalSecondsWatched) * 100).toFixed(2))
          : 0;

        return {
          videoId: item.videoId,
          minutesWatched,
          platformSharePercentage,
        };
      });
    } catch (error) {
      this.logger.error('Failed to get top 3 watched content by time', error as Error);
      return [];
    }
  }
}
