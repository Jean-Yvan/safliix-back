import { Injectable } from '@nestjs/common';
import { PrismaService, adViewInclude } from '@safliix-back/database';
import { AdView } from '../../domain/entities/ad-view.entity';
import type {
  AdViewRepository,
  ViewsRange,
} from '../../domain/port/ad-view.repository';
import { AdViewMapper } from '../../domain/mappers/ad-view.mapper';

type RawAdViewCountArgs = NonNullable<
  Parameters<PrismaService['adView']['count']>[0]
>;
type AdViewWhereInput = RawAdViewCountArgs extends { where?: infer W }
  ? NonNullable<W>
  : never;

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

  async countByAd(adId: string, range?: ViewsRange): Promise<number> {
    return this.prisma.adView.count({
      where: this.buildWhereClause(adId, range),
    });
  }

  async uniqueViewersCount(adId: string, range?: ViewsRange): Promise<number> {
    const baseWhere = this.buildWhereClause(adId, range);

    const [userDistinct, profileDistinct] = await Promise.all([
      this.prisma.adView.findMany({
        where: {
          ...baseWhere,
          userId: { not: null },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.adView.findMany({
        where: {
          ...baseWhere,
          userId: null,
          profileId: { not: null },
        },
        distinct: ['profileId'],
        select: { profileId: true },
      }),
    ]);

    return userDistinct.length + profileDistinct.length;
  }

  async viewsByDate(
    adId: string,
    range?: ViewsRange,
  ): Promise<Record<string, number>> {
    const from = range?.from ?? null;
    const to = range?.to ?? null;

    const rows = await this.prisma.$queryRaw<
      Array<{ day: string; count: bigint }>
    >`
      SELECT
        to_char(date_trunc('day', "viewed_at"), 'YYYY-MM-DD') AS day,
        COUNT(*)::bigint AS count
      FROM "AdView"
      WHERE "adId" = ${adId}
        AND (${from} IS NULL OR "viewed_at" >= ${from})
        AND (${to} IS NULL OR "viewed_at" <= ${to})
      GROUP BY day
      ORDER BY day ASC
    `;

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.day] = Number(row.count);
      return acc;
    }, {});
  }

  async viewsByCountry(
    adId: string,
    range?: ViewsRange,
  ): Promise<Record<string, number>> {
    const grouped = await this.prisma.adView.groupBy({
      by: ['country'],
      where: {
        ...this.buildWhereClause(adId, range),
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

  private buildWhereClause(
    adId: string,
    range?: ViewsRange,
  ): AdViewWhereInput {
    const where: AdViewWhereInput = { adId };
    if (range?.from || range?.to) {
      where.viewed_at = {
        ...(range.from ? { gte: range.from } : {}),
        ...(range.to ? { lte: range.to } : {}),
      };
    }
    return where;
  }
}
