import { SeasonView } from '../entities/season-view.entity';
import { SeriesView } from '../entities/serie-view.entity';
import { UserVideoView } from '../entities/user-video-view.entity';

export interface SeasonStats {
  episodesWatched: number;
  totalTimeSpent: number; // en secondes ou minutes selon ton modèle
}

export interface SeriesStats {
  episodesWatched: number;
  totalTimeSpent: number;
}

export type UserSerieStats = SeasonStats | SeriesStats;



export interface IVideoViewRepository {
  // === SeasonView ===
  saveSeasonView(view: SeasonView): Promise<void>;
  findSeasonView(userId: string, seasonId: string): Promise<SeasonView | null>;

  // === SeriesView ===
  saveSeriesView(view: SeriesView): Promise<void>;
  findSeriesView(userId: string, seriesId: string): Promise<SeriesView | null>;
  
  // === User Video Progress / Session View ===
  saveUserVideoView(progress: UserVideoView): Promise<void>;
  findLastVideoView(userId: string, videoId: string): Promise<UserVideoView | null>;
  findAllVideoViewsByUser(userId: string): Promise<UserVideoView[]>;
  
  findUserStats(userId:string, options: { seasonId?: string; seriesId?: string }) : Promise<UserSerieStats>;
}
