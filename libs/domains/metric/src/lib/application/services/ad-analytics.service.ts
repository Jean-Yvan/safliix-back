import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { AdPerformance, CountryMetric } from '../../interfaces/analytics.interfaces';

@Injectable()
export class AdAnalyticsService {
  private readonly logger = new Logger(AdAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAdPerformanceMetrics(): Promise<AdPerformance> {
    try {
      const [totalViews, top4AdCountriesRaw] = await Promise.all([
        this.prisma.adView.count(),
        this.prisma.adView.groupBy({
          by: ['country'],
          where: { country: { not: null } },
          _count: { country: true },
          orderBy: [{ _count: { country: 'desc' } }],
          take: 4,
        }),
      ]);

      const topCountries: CountryMetric[] = top4AdCountriesRaw
        .filter((item) => Boolean(item.country))
        .map((item) => ({
          country: item.country as string,
          count: item._count.country,
        }));

      return { totalViews, topCountries };
    } catch (error) {
      this.logger.error('Failed to retrieve ad performance metrics', error as Error);
      return { totalViews: 0, topCountries: [] };
    }
  }
}
