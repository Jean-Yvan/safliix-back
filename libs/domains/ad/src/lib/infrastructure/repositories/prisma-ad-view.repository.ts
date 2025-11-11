import { Injectable } from '@nestjs/common';
import { PrismaService, adViewInclude } from '@safliix-back/database';
import { AdView } from '../../domain/entities/ad-view.entity';
import type {
  AdViewRepository,
  ViewsRange,
} from '../../domain/port/ad-view.repository';
import { AdViewMapper } from '../../domain/mappers/ad-view.mapper';

@Injectable()
export class PrismaAdViewRepository implements AdViewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(view: AdView): Promise<AdView> {
    const data = AdViewMapper.toCreatePrisma(view);
    const created = await this.prisma.adView.create({
      data,
      include: adViewInclude,
    });
    return AdViewMapper.toDomain(created);
  }

  async findByAd(adId: string): Promise<AdView[]> {
    const views = await this.prisma.adView.findMany({
      where: { adId },
      include: adViewInclude,
      orderBy: { viewed_at: 'desc' },
    });
    return views.map(AdViewMapper.toDomain);
  }

  async countByAd(adId: string): Promise<number> {
    return this.prisma.adView.count({
      where: { adId },
    });
  }

  async uniqueViewersCount(adId: string): Promise<number> {
    const distinct = await this.prisma.adView.findMany({
      where: {
        adId,
        userId: { not: null },
      },
      distinct: ['userId'],
      select: { userId: true },
    });
    return distinct.length;
  }

  async viewsByDate(
    adId: string,
    range?: ViewsRange,
  ): Promise<Record<string, number>> {
    const where: Record<string, unknown> = { adId };
    if (range?.from || range?.to) {
      where.viewed_at = {};
      if (range.from) {
        (where.viewed_at as Record<string, Date>).gte = range.from;
      }
      if (range.to) {
        (where.viewed_at as Record<string, Date>).lte = range.to;
      }
    }

    const samples = await this.prisma.adView.findMany({
      where,
      select: { viewed_at: true },
    });

    return samples.reduce<Record<string, number>>((acc, item) => {
      const key = item.viewed_at.toISOString().slice(0, 10);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }

  async viewsByCountry(adId: string): Promise<Record<string, number>> {
    const grouped = await this.prisma.adView.groupBy({
      by: ['country'],
      where: {
        adId,
        country: { not: null },
      },
      _count: { country: true },
    });

    return grouped.reduce<Record<string, number>>((acc, item) => {
      if (!item.country) {
        return acc;
      }
      acc[item.country] = item._count.country ?? 0;
      return acc;
    }, {});
  }
}
