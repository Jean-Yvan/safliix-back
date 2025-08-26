import { SeasonView } from '../entities/season-view.entity';
import { SerieView } from '..//entities/serie-view.entity';
import { UserVideoView } from '../entities/user-video-view.entity';

export interface IMetricsRepository {
  // === SeasonView ===
  saveSeasonView(view: SeasonView): Promise<void>;
  findSeasonView(userId: string, seasonId: string): Promise<SeasonView | null>;

  // === SeriesView ===
  saveSeriesView(view: SerieView): Promise<void>;
  findSeriesView(userId: string, seriesId: string): Promise<SerieView | null>;

  // === User Video Progress / Session View ===
  saveUserVideoProgress(progress: UserVideoView): Promise<void>;
  findLastVideoProgress(userId: string, videoId: string): Promise<UserVideoView | null>;

  // === Stats / analytics ===
  countEpisodesWatchedInSeason(userId: string, seasonId: string): Promise<number>;
  countEpisodesWatchedInSeries(userId: string, seriesId: string): Promise<number>;
  totalTimeSpentOnSeason(userId: string, seasonId: string): Promise<number>;
  totalTimeSpentOnSeries(userId: string, seriesId: string): Promise<number>;
}
