import { CreateUserVideoViewDto } from '../../interfaces/dto/create-user-video-view.dto';
import { UserVideoViewWithRelation } from '@safliix-back/database';

export class UserVideoView {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly videoId: string,
    public progress: number,
    public completed: boolean,
    public readonly profileId: string | undefined,
    public readonly country: string | undefined,
    public readonly device: string | undefined,
    public rating: number | undefined,
    public readonly startedAt: Date | undefined,
    public endedAt: Date | undefined,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  // Factory pour créer un nouveau UserVideoView
  static create(data: CreateUserVideoViewDto): UserVideoView {
    const now = new Date();
    return new UserVideoView(
      undefined, // id généré par la DB
      data.userId,
      data.videoId,
      data.progress ?? 0,
      data.completed ?? false,
      data.profileId,
      data.country,
      data.device,
      data.rating,
      data.startedAt ?? now,
      data.endedAt,
      null, // createdAt sera défini par la DB
      null, // updatedAt sera défini par la DB
    );
  }

  // Restore depuis la DB (Prisma ou autre source)
  static restore(data: UserVideoViewWithRelation): UserVideoView {
    return new UserVideoView(
      data.id,
      data.userId,
      data.videoId,
      data.progress,
      data.completed,
      data.profileId ?? undefined,
      data.country ?? undefined,
      data.device ?? undefined,
      data.rating ?? undefined,
      data.startedAt ?? undefined,
      data.endedAt ?? undefined,
      data.createdAt,
      data.updatedAt,
    );
  }

  // Méthodes métier
  markAsCompleted(): void {
    this.completed = true;
    this.endedAt = new Date();
  }

  updateProgress(progress: number): void {
    this.progress = progress;
    
    // Auto-complétion si le progrès dépasse un certain seuil (ex: 90%)
    if (progress >= this.getVideoDurationThreshold() && !this.completed) {
      this.markAsCompleted();
    }
  }

  rateVideo(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    this.rating = rating;
  }

  getWatchTime(): number {
    if (!this.startedAt) return 0;
    
    const endTime = this.endedAt || new Date();
    return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000); // en secondes
  }

  isRecentlyWatched(thresholdMinutes = 30): boolean {
    if (!this.updatedAt) return false;
    
    const now = new Date();
    const diffMs = now.getTime() - this.updatedAt.getTime();
    return diffMs < (thresholdMinutes * 60 * 1000);
  }

  private getVideoDurationThreshold(): number {
    // Logique pour déterminer le seuil de complétion
    // Pour l'instant, on utilise 90% du progrès actuel comme exemple
    // Vous pourriez injecter la durée réelle de la vidéo si disponible
    return this.progress * 0.9;
  }

  // Getters pour l'état de l'entité
  get isActive(): boolean {
    return !this.completed && this.progress > 0;
  }

  get hasRating(): boolean {
    return this.rating !== undefined && this.rating !== null;
  }

  get completionPercentage(): number {
    // Retourne le pourcentage de complétion basé sur votre logique métier
    return Math.min(100, (this.progress / this.getVideoDurationThreshold()) * 100);
  }
}