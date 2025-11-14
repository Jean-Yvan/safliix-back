import { Injectable } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import {
  IVideoViewRepository,
  SeasonStats,
  SeriesStats,
} from '../domain/port/user-video-view.repository';
import { UserVideoViewMapper } from '../domain/mappers/user-video-view.mapper';
import { SeasonViewMapper } from '../domain/mappers/season-view.mapper';
import { SeriesViewMapper } from '../domain/mappers/serie-view.mapper';
import { UserVideoView } from '../domain/entities/user-video-view.entity';
import { SeasonView } from '../domain/entities/season-view.entity';
import { SeriesView } from '../domain/entities/serie-view.entity';

@Injectable()
export class PrismaVideoViewRepository implements IVideoViewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveUserVideoView(view: UserVideoView): Promise<void> {
    const data = UserVideoViewMapper.toPrisma(view);

    if (data.id) {
      await this.prisma.userVideoView.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
      return;
    }

    await this.prisma.userVideoView.create({ data });
  }

  async findLastVideoView(userId: string, videoId: string): Promise<UserVideoView | null> {
    const record = await this.prisma.userVideoView.findFirst({
      where: { userId, videoId },
      orderBy: { createdAt: 'desc' },
    });
    return record ? UserVideoViewMapper.toDomain(record) : null;
  }

  async findAllVideoViewsByUser(userId: string): Promise<UserVideoView[]> {
    const records = await this.prisma.userVideoView.findMany({ where: { userId } });
    return records.map(UserVideoViewMapper.toDomain);
  }

  async saveSeasonView(view: SeasonView): Promise<void> {
    const data = SeasonViewMapper.toPrisma(view);

    await this.prisma.seasonView.upsert({
      where: {
        seasonId_userId: {
          seasonId: data.seasonId!,
          userId: data.userId!,
        },
      },
      create: data,
      update: {
        episodesWatched: data.episodesWatched,
        totalTimeSpent: data.totalTimeSpent,
        rating: data.rating,
        viewedAt: data.viewedAt,
      },
    });
  }

  async findSeasonView(userId: string, seasonId: string): Promise<SeasonView | null> {
    const record = await this.prisma.seasonView.findUnique({
      where: { seasonId_userId: { seasonId, userId } },
    });
    return record ? SeasonViewMapper.toDomain(record) : null;
  }

  async saveSeriesView(view: SeriesView): Promise<void> {
    const data = SeriesViewMapper.toPrisma(view);

    await this.prisma.seriesView.upsert({
      where: {
        seriesId_userId: {
          seriesId: data.seriesId!,
          userId: data.userId!,
        },
      },
      create: data,
      update: {
        seasonsWatched: data.seasonsWatched,
        episodesWatched: data.episodesWatched,
        totalTimeSpent: data.totalTimeSpent,
        rating: data.rating,
        viewedAt: data.viewedAt,
      },
    });
  }

  async findSeriesView(userId: string, seriesId: string): Promise<SeriesView | null> {
    const record = await this.prisma.seriesView.findUnique({
      where: { seriesId_userId: { seriesId, userId } },
    });
    return record ? SeriesViewMapper.toDomain(record) : null;
  }

  async findUserSeasonStats(userId: string, seasonId: string): Promise<SeasonStats | null> {
    const record = await this.prisma.seasonView.findUnique({
      where: { seasonId_userId: { seasonId, userId } },
      select: { episodesWatched: true, totalTimeSpent: true },
    });

    if (!record) {
      return null;
    }

    return {
      episodesWatched: record.episodesWatched ?? 0,
      totalTimeSpent: record.totalTimeSpent ?? 0,
    };
  }

  async findUserSeriesStats(userId: string, seriesId: string): Promise<SeriesStats | null> {
    const record = await this.prisma.seriesView.findUnique({
      where: { seriesId_userId: { seriesId, userId } },
      select: {
        seasonsWatched: true,
        episodesWatched: true,
        totalTimeSpent: true,
      },
    });

    if (!record) {
      return null;
    }

    return {
      seasonsWatched: record.seasonsWatched ?? 0,
      episodesWatched: record.episodesWatched ?? 0,
      totalTimeSpent: record.totalTimeSpent ?? 0,
    };
  }
}
