import { Injectable } from '@nestjs/common';
import { PrismaService, adInclude } from '@safliix-back/database';
import { Ad } from '../../domain/entities/ad.entity';
import type { AdRepository } from '../../domain/port/ad.repository';
import { AdMapper } from '../../domain/mappers/ad.mapper';
import { AdFilter } from '../../domain/types/ad-filter.type';

@Injectable()
export class PrismaAdRepository implements AdRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(ad: Ad): Promise<Ad> {
    const data = AdMapper.toCreatePrisma(ad);
    const created = await this.prisma.ad.create({
      data,
      include: adInclude,
    });
    return AdMapper.toDomain(created);
  }

  async save(ad: Ad): Promise<Ad> {
    const data = AdMapper.toUpdatePrisma(ad);
    const updated = await this.prisma.ad.update({
      ...data,
      include: adInclude,
    });
    return AdMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ad.delete({ where: { id } });
  }

  async findById(id: string): Promise<Ad | null> {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: adInclude,
    });
    return ad ? AdMapper.toDomain(ad) : null;
  }

  async findAll(filters?: AdFilter): Promise<Ad[]> {
    const where = this.buildWhereClause(filters);
    const ads = await this.prisma.ad.findMany({
      where,
      include: adInclude,
      orderBy: { startDate: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });
    return ads.map(AdMapper.toDomain);
  }

  async findActive(referenceDate: Date = new Date()): Promise<Ad[]> {
    const ads = await this.prisma.ad.findMany({
      where: {
        isActive: true,
        startDate: { lte: referenceDate },
        endDate: { gte: referenceDate },
      },
      include: adInclude,
      orderBy: { startDate: 'asc' },
    });
    return ads.map(AdMapper.toDomain);
  }

  async findExpired(referenceDate: Date = new Date()): Promise<Ad[]> {
    const ads = await this.prisma.ad.findMany({
      where: {
        endDate: { lt: referenceDate },
      },
      include: adInclude,
      orderBy: { endDate: 'desc' },
    });
    return ads.map(AdMapper.toDomain);
  }

  private buildWhereClause(filters?: AdFilter): Record<string, unknown> {
    if (!filters) {
      return {};
    }
    const where: Record<string, unknown> = {};

    if (filters.activeOnly) {
      where.isActive = true;
    }

    if (filters.startsAfter || filters.startsBefore) {
      where.startDate = {};
      if (filters.startsAfter) {
        (where.startDate as Record<string, Date>).gte = filters.startsAfter;
      }
      if (filters.startsBefore) {
        (where.startDate as Record<string, Date>).lte = filters.startsBefore;
      }
    }

    if (filters.endsAfter || filters.endsBefore) {
      where.endDate = {};
      if (filters.endsAfter) {
        (where.endDate as Record<string, Date>).gte = filters.endsAfter;
      }
      if (filters.endsBefore) {
        (where.endDate as Record<string, Date>).lte = filters.endsBefore;
      }
    }

    if (filters.includeExpired === false) {
      where.endDate = {
        ...(where.endDate as Record<string, Date>),
        gte: new Date(),
      };
    }

    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.attachmentId) {
      where.attachment = {
        some: { id: filters.attachmentId },
      };
    }

    return where;
  }
}
