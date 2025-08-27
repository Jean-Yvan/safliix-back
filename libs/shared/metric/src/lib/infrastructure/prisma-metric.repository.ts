import { PrismaService } from "@safliix-back/database";
import { UserVideoView } from "../domain/entities/user-video-view.entity";
import { SeasonView } from "../domain/entities/season-view.entity";
import { SeriesView } from "../domain/entities/serie-view.entity";
import { IVideoViewRepository, UserSerieStats } from "../domain/port/user-video-view.repository";
import { VideoViewMapper } from "../domain/mappers/user-video-view.mapper";
import { SeasonViewMapper } from "../domain/mappers/season-view.mapper";
import { SeriesViewMapper } from "../domain/mappers/serie-view.mapper";

export class PrismaVideoViewRepository implements IVideoViewRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  
  
  async findUserStats(userId: string, options: { seasonId?: string; seriesId?: string; }): Promise<UserSerieStats> {
    throw new Error();

    /* if (options.seasonId) {
    const record = await this.prisma.seasonView.findUnique({
      where: { userId_seasonId: { userId, seasonId: options.seasonId } },
    });

    if (!record) return null;

    return {
      episodesWatched: record.episodesWatched,
      totalTimeSpent: record.totalTimeSpent,
    };
  }

  if (options.seriesId) {
    const record = await this.prisma.seriesView.findUnique({
      where: { userId_seriesId: { userId, seriesId: options.seriesId } },
    });

    if (!record) return null;

    return {
      episodesWatched: record.episodesWatched,
      totalTimeSpent: record.totalTimeSpent,
    }; */
  }
  

  // Vidéo
  async saveUserVideoView(videoView: UserVideoView): Promise<void> {
    const persistence = VideoViewMapper.toPrisma(videoView);
    await this.prisma.userVideoView.upsert({
      where: { id: persistence.id },
      create: persistence,
      update: persistence,
    });
  }

  async findLastVideoView(userId: string, videoId: string): Promise<UserVideoView | null> {
    const record = await this.prisma.userVideoView.findFirst({
      where: { userId, videoId },
      orderBy: { createdAt: "desc" },
    });
    return record ? VideoViewMapper.toDomain(record) : null;
  }

  async findAllVideoViewsByUser(userId: string): Promise<UserVideoView[]> {
    const records = await this.prisma.userVideoView.findMany({ where: { userId } });
    return records.map(VideoViewMapper.toDomain);
  }

  // Saison
  async saveSeasonView(seasonView: SeasonView): Promise<void> {
    const persistence = SeasonViewMapper.toPrisma(seasonView);
    await this.prisma.seasonView.upsert({
      where: { id: persistence.id },
      create: persistence,
      update: persistence,
    });
  }

  async findSeasonView(userId: string, seasonId: string): Promise<SeasonView | null> {
    const record = await this.prisma.seasonView.findUnique({
      where: { seasonId_userId: { seasonId, userId } },
    });
    return record ? SeasonViewMapper.toDomain(record) : null;
  }

  // Série
  async saveSeriesView(serieView: SeriesView): Promise<void> {
    const persistence = SeriesViewMapper.toPrisma(serieView);
    await this.prisma.seriesView.upsert({
      where: { id: persistence.id },
      create: persistence,
      update: persistence,
    });
  }

  async findSeriesView(userId: string, serieId: string): Promise<SeriesView | null> {
    const record = await this.prisma.seriesView.findUnique({
      where: { seriesId_userId: { seriesId: serieId, userId } },
    });
    return record ? SeriesViewMapper.toDomain(record) : null;
  }
}
