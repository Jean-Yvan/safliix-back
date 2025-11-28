// infrastructure/repositories/prisma-user-video-view.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService, userVideoViewInclude } from "@safliix-back/database";
import { UserVideoView } from "../domain/entities/user-video-view";
import { IUserVideoViewRepository, VideoStatistics } from "../domain/ports/user-video-view.repository";
import { UserVideoViewMapper } from "../domain/mappers/user-video-view.mapper";
import { Result } from "oxide.ts";
import { Ok, Err } from "oxide.ts";

@Injectable()
export class PrismaUserVideoViewRepository implements IUserVideoViewRepository {

  constructor(
    private readonly prisma: PrismaService
  ) {}

  private handleError(rawError: unknown): Err<Error> {
    const errAny = rawError as any;

    // Handle common Prisma unique constraint error (P2002)
    if (errAny?.code === 'P2002') {
      const target = Array.isArray(errAny?.meta?.target)
        ? errAny.meta.target.join(', ')
        : String(errAny?.meta?.target ?? errAny.message);
      return Err(new Error(`Unique constraint failed on the fields: ${target}`));
    }

    // Handle record not found error (P2025)
    if (errAny?.code === 'P2025') {
      return Err(new Error(`Record not found: ${errAny.message ?? String(errAny)}`));
    }

    // Handle foreign key constraint error (P2003)
    if (errAny?.code === 'P2003') {
      return Err(new Error(`Foreign key constraint failed: ${errAny.message ?? String(errAny)}`));
    }

    // Handle other known Prisma client errors by code if needed
    if (typeof errAny?.code === 'string') {
      return Err(new Error(`Database error (code: ${errAny.code}): ${errAny.message ?? String(errAny)}`));
    }

    // Fallback for Error instances or unknown values
    if (rawError instanceof Error) {
      return Err(rawError);
    }

    return Err(new Error(String(rawError)));
  }

  async create(userVideoView: UserVideoView): Promise<Result<UserVideoView, Error>> {
    try {
      const prismaData = UserVideoViewMapper.toPrismaCreate(userVideoView);
      const created = await this.prisma.userVideoView.create({
        data: prismaData,
        include: userVideoViewInclude
      });
      return Ok(UserVideoViewMapper.toDomain(created));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, userVideoView: UserVideoView): Promise<Result<UserVideoView, Error>> {
    try {
      const prismaData = UserVideoViewMapper.toPrismaUpdate(id, userVideoView);
      const updated = await this.prisma.userVideoView.update({...prismaData,include: userVideoViewInclude});
      return Ok(UserVideoViewMapper.toDomain(updated));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.prisma.userVideoView.delete({
        where: { id },
      });
      return Ok(undefined);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async findById(id: string): Promise<Result<UserVideoView, Error>> {
    try {
      const view = await this.prisma.userVideoView.findUnique({
        where: { id },
        include: userVideoViewInclude
      });
      if (!view) {
        return Err(new Error(`UserVideoView with ID ${id} not found`));
      }
      return Ok(UserVideoViewMapper.toDomain(view));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByUserAndVideo(userId: string, videoId: string): Promise<Result<UserVideoView[], Error>> {
    try {
      const views = await this.prisma.userVideoView.findMany({
        where: { 
          userId, 
          videoId 
        },
        orderBy: { createdAt: 'desc' },
        include: userVideoViewInclude
      });
      return Ok(views.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async findUserProgress(userId: string, videoId: string): Promise<Result<UserVideoView, Error>> {
    try {
      const view = await this.prisma.userVideoView.findFirst({
        where: { 
          userId, 
          videoId,
          completed: false, // On cherche la session en cours
        },
        orderBy: { updatedAt: 'desc' },
        include: userVideoViewInclude
      });
      if (!view) {
        return Err(new Error(`No active viewing session found for user ${userId} and video ${videoId}`));
      }
      return Ok(UserVideoViewMapper.toDomain(view));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getWatchHistory(userId: string, limit?: number): Promise<Result<UserVideoView[], Error>> {
    try {
      const views = await this.prisma.userVideoView.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: userVideoViewInclude
      });
      return Ok(views.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCompletedViews(userId: string): Promise<Result<UserVideoView[], Error>> {
    try {
      const views = await this.prisma.userVideoView.findMany({
        where: { 
          userId, 
          completed: true 
        },
        orderBy: { endedAt: 'desc' },
        include: userVideoViewInclude
      });
      return Ok(views.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getInProgressViews(userId: string): Promise<Result<UserVideoView[], Error>> {
    try {
      const views = await this.prisma.userVideoView.findMany({
        where: { 
          userId, 
          completed: false,
          progress: { gt: 0 } // Au moins un peu de progression
        },
        orderBy: { updatedAt: 'desc' },
        include: userVideoViewInclude
      });
      return Ok(views.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getVideoStatistics(videoId: string): Promise<Result<VideoStatistics, Error>> {
    try {
      const stats = await this.prisma.userVideoView.groupBy({
        by: ['videoId'],
        where: { videoId },
        _count: {
          _all: true,
          id: true,
        },
        _avg: {
          progress: true,
          rating: true,
        },
        _sum: {
          progress: true,
        },
      });

      const completedCount = await this.prisma.userVideoView.count({
        where: { 
          videoId, 
          completed: true 
        },
      });

      const uniqueViewers = await this.prisma.userVideoView.groupBy({
        by: ['userId'],
        where: { videoId },
        _count: {
          userId: true,
        },
      });

      if (stats.length === 0) {
        return Ok({
          videoId,
          totalViews: 0,
          completedViews: 0,
          averageProgress: 0,
          averageRating: 0,
          totalWatchTime: 0,
          uniqueViewers: 0,
        });
      }

      const stat = stats[0];
      return Ok({
        videoId,
        totalViews: stat._count._all,
        completedViews: completedCount,
        averageProgress: stat._avg.progress ?? 0,
        averageRating: stat._avg.rating ?? 0,
        totalWatchTime: stat._sum.progress ?? 0,
        uniqueViewers: uniqueViewers.length,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserWatchTime(userId: string, period?: 'day' | 'week' | 'month'): Promise<Result<number, Error>> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default: {
          // Total watch time
          const result = await this.prisma.userVideoView.aggregate({
            where: { userId },
            _sum: { progress: true },
          });
          return Ok(result._sum.progress ?? 0);
        }
      }

      const result = await this.prisma.userVideoView.aggregate({
        where: { 
          userId,
          updatedAt: { gte: startDate }
        },
        _sum: { progress: true },
      });

      return Ok(result._sum.progress ?? 0);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRecentViews(userId: string, days = 7): Promise<Result<UserVideoView[], Error>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const views = await this.prisma.userVideoView.findMany({
        where: { 
          userId,
          updatedAt: { gte: startDate }
        },
        include: userVideoViewInclude,
        orderBy: { updatedAt: 'desc' },
      });
      return Ok(views.map(UserVideoViewMapper.toDomain));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProgressBatch(updates: Array<{ id: string; progress: number }>): Promise<Result<void, Error>> {
    try {
      await this.prisma.$transaction(
        updates.map(update =>
          this.prisma.userVideoView.update({
            where: { id: update.id },
            data: { 
              progress: update.progress,
              updatedAt: new Date(),
              // Auto-complete si nécessaire
              completed: update.progress >= 90, // Seuil à ajuster
              ...(update.progress >= 90 ? { endedAt: new Date() } : {}),
            },
          })
        )
      );
      return Ok(undefined);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markMultipleAsCompleted(viewIds: string[]): Promise<Result<void, Error>> {
    try {
      await this.prisma.userVideoView.updateMany({
        where: { 
          id: { in: viewIds } 
        },
        data: { 
          completed: true,
          endedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return Ok(undefined);
    } catch (error) {
      return this.handleError(error);
    }
  }
}