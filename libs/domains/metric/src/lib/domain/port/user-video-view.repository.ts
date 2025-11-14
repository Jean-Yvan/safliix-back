import { SeasonView, SeriesView, UserVideoView } from '../entities';

export interface SeasonStats {
  episodesWatched: number;
  totalTimeSpent: number;
}

export interface SeriesStats {
  seasonsWatched: number;
  episodesWatched: number;
  totalTimeSpent: number;
}

export interface IVideoViewRepository {
  saveSeasonView(view: SeasonView): Promise<void>;
  findSeasonView(userId: string, seasonId: string): Promise<SeasonView | null>;

  saveSeriesView(view: SeriesView): Promise<void>;
  findSeriesView(userId: string, seriesId: string): Promise<SeriesView | null>;

  saveUserVideoView(view: UserVideoView): Promise<void>;
  findLastVideoView(userId: string, videoId: string): Promise<UserVideoView | null>;
  findAllVideoViewsByUser(userId: string): Promise<UserVideoView[]>;

  findUserSeasonStats(userId: string, seasonId: string): Promise<SeasonStats | null>;
  findUserSeriesStats(userId: string, seriesId: string): Promise<SeriesStats | null>;
}
