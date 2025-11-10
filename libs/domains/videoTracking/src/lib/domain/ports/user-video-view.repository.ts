// domain/ports/user-video-view.repository.ts
import { UserVideoView } from "../entities/user-video-view";
import { Result } from "oxide.ts";

export interface IUserVideoViewRepository {
  // CRUD Operations
  create(userVideoView: UserVideoView): Promise<Result<UserVideoView, Error>>;
  update(id: string, userVideoView: UserVideoView): Promise<Result<UserVideoView, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
  findById(id: string): Promise<Result<UserVideoView, Error>>;

  // Query Methods
  findByUserAndVideo(userId: string, videoId: string): Promise<Result<UserVideoView[], Error>>;
  findUserProgress(userId: string, videoId: string): Promise<Result<UserVideoView, Error>>;
  getWatchHistory(userId: string, limit?: number): Promise<Result<UserVideoView[], Error>>;
  getCompletedViews(userId: string): Promise<Result<UserVideoView[], Error>>;
  getInProgressViews(userId: string): Promise<Result<UserVideoView[], Error>>;
  
  // Analytics & Reporting
  getVideoStatistics(videoId: string): Promise<Result<VideoStatistics, Error>>;
  getUserWatchTime(userId: string, period?: 'day' | 'week' | 'month'): Promise<Result<number, Error>>;
  getRecentViews(userId: string, days?: number): Promise<Result<UserVideoView[], Error>>;
  
  // Batch Operations
  updateProgressBatch(updates: Array<{ id: string; progress: number }>): Promise<Result<void, Error>>;
  markMultipleAsCompleted(viewIds: string[]): Promise<Result<void, Error>>;
}

// Types pour les statistiques
export interface VideoStatistics {
  videoId: string;
  totalViews: number;
  completedViews: number;
  averageProgress: number;
  averageRating: number;
  totalWatchTime: number;
  uniqueViewers: number;
}

export interface WatchTimeResult {
  totalSeconds: number;
  period: string;
}