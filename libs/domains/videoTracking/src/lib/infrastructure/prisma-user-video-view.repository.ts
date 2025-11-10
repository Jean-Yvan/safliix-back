import { Injectable } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { Result, Ok, Err } from 'oxide.ts';

import { IUserVideoViewRepository, VideoStatistics } from '../domain/ports/user-video-view.repository';
import { UserVideoView } from '../domain/entities/user-video-view';
import { UserVideoViewMapper } from '../domain/mappers/user-video-view.mapper';

@Injectable()
export class PrismaUserVideoViewRepository implements IUserVideoViewRepository {
  private readonly include = { user: true } as const;

  constructor(private readonly prisma: PrismaService) {}

  async create(userVideoView: UserVideoView): Promise<Result<UserVideoView, Error>> {
    try {
      const data = UserVideoViewMapper.toPrismaCreate(userVideoView);
      const created = await this.prisma.userVideoView.create({
        data,
        include: this.include,
      });

      return Ok(UserVideoViewMapper.toDomain(created));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(id: string, userVideoView: UserVideoView): Promise<Result<UserVideoView, Error>> {
    try {
      const viewId = userVideoView.id ?? id;

      if (!viewId) {
        return Err(new Error('UserVideoView id is required to update the record'));
      }

      const data = UserVideoViewMapper.toPrismaUpdate(viewId, userVideoView);
      const updated = await this.prisma.userVideoView.update({
        ...data,
        include: this.include,
      });

      return Ok(UserVideoViewMapper.toDomain(updated));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.prisma.userVideoView.delete({ where: { id } });
      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findById(id: string): Promise<Result<UserVideoView, Error>> {
    try {
      const record = await this.prisma.userVideoView.findUnique({
        where: { id },
        include: this.include,
      });

      if (!record) {
        return Err(new Error('UserVideoView not found'));
      }

      return Ok(UserVideoViewMapper.toDomain(record));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findByUserAndVideo(userId: string, videoId: string): Promise<Result<UserVideoView[], Error>> {
    try {
      const records = await this.prisma.userVideoView.findMany({
        where: { userId, videoId },
        orderBy: { updatedAt: 'desc' },
        include: this.include,
      });

      return Ok(records.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findUserProgress(userId: string, videoId: string): Promise<Result<UserVideoView, Error>> {
    try {
      const record = await this.prisma.userVideoView.findFirst({
        where: { userId, videoId },
        orderBy: { updatedAt: 'desc' },
        include: this.include,
      });

      if (!record) {
        return Err(new Error('No progress found for this user/video pair'));
      }

      return Ok(UserVideoViewMapper.toDomain(record));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getWatchHistory(userId: string, limit?: number): Promise<Result<UserVideoView[], Error>> {
    try {
      const records = await this.prisma.userVideoView.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: typeof limit === 'number' ? limit : undefined,
        include: this.include,
      });

      return Ok(records.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getCompletedViews(userId: string): Promise<Result<UserVideoView[], Error>> {
    try {
      const records = await this.prisma.userVideoView.findMany({
        where: { userId, completed: true },
        orderBy: { updatedAt: 'desc' },
        include: this.include,
      });

      return Ok(records.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getInProgressViews(userId: string): Promise<Result<UserVideoView[], Error>> {
    try {
      const records = await this.prisma.userVideoView.findMany({
        where: { userId, completed: false },
        orderBy: { updatedAt: 'desc' },
        include: this.include,
      });

      return Ok(records.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getVideoStatistics(videoId: string): Promise<Result<VideoStatistics, Error>> {
    try {
      const aggregate = await this.prisma.userVideoView.aggregate({
        where: { videoId },
        _avg: { progress: true, rating: true },
        _sum: { progress: true },
        _count: { _all: true },
      });

      const completedViews = await this.prisma.userVideoView.count({
        where: { videoId, completed: true },
      });

      const uniqueViewers = await this.prisma.userVideoView.count({
        where: { videoId },
        distinct: ['userId'],
      });

      const statistics: VideoStatistics = {
        videoId,
        totalViews: aggregate._count._all ?? 0,
        completedViews,
        averageProgress: aggregate._avg.progress ?? 0,
        averageRating: aggregate._avg.rating ?? 0,
        totalWatchTime: aggregate._sum.progress ?? 0,
        uniqueViewers,
      };

      return Ok(statistics);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getUserWatchTime(userId: string, period?: 'day' | 'week' | 'month'): Promise<Result<number, Error>> {
    try {
      const threshold = this.computePeriodThreshold(period);
      const where = threshold
        ? { userId, updatedAt: { gte: threshold } }
        : { userId };

      const aggregate = await this.prisma.userVideoView.aggregate({
        where,
        _sum: { progress: true },
      });

      return Ok(aggregate._sum.progress ?? 0);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getRecentViews(userId: string, days = 7): Promise<Result<UserVideoView[], Error>> {
    try {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - days);

      const records = await this.prisma.userVideoView.findMany({
        where: {
          userId,
          updatedAt: { gte: threshold },
        },
        orderBy: { updatedAt: 'desc' },
        include: this.include,
      });

      return Ok(records.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return Err(error as Error);
    }
  }

  async updateProgressBatch(updates: Array<{ id: string; progress: number }>): Promise<Result<void, Error>> {
    try {
      if (!updates.length) {
        return Ok(undefined);
      }

      await this.prisma.$transaction(
        updates.map((update) =>
          this.prisma.userVideoView.update({
            where: { id: update.id },
            data: { progress: update.progress },
          }),
        ),
      );

      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async markMultipleAsCompleted(viewIds: string[]): Promise<Result<void, Error>> {
    try {
      if (!viewIds.length) {
        return Ok(undefined);
      }

      await this.prisma.userVideoView.updateMany({
        where: { id: { in: viewIds } },
        data: {
          completed: true,
          endedAt: new Date(),
        },
      });

      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }

  private computePeriodThreshold(period?: 'day' | 'week' | 'month'): Date | undefined {
    if (!period) {
      return undefined;
    }

    const now = new Date();
    const daysMap: Record<'day' | 'week' | 'month', number> = {
      day: 1,
      week: 7,
      month: 30,
    } as const;

    const days = daysMap[period];
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - days);
    return threshold;
  }
}
