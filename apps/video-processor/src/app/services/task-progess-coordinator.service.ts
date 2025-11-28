// src/services/task-progress-coordinator.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { FileLogger } from '../utils/logger';
import { RedisManager } from './redis-manager';
interface VideoProgressState {
  stage: string;
  progress: number; // 0 à 100
  status: 'pending' | 'running' | 'completed' | 'failed';
  updatedAt: string;
  message?: string;
}

export const VIDEO_STAGES = {
  INIT: 'init',
  DOWNLOAD: 'download', 
  PROCESSING: 'processing',
  UPLOAD: 'upload',
  SPLIT: 'split',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

@Injectable()
export class TaskProgressCoordinator {
  private readonly logger = new FileLogger(TaskProgressCoordinator.name);
  private readonly TTL = 3600; // 1h en secondes
  private readonly redis: Redis;
  constructor(
    private readonly redisManager: RedisManager
  ) {
    this.redis = this.redisManager.createConnectionForWorker();
  }

  private getRedisKey(s3Key: string) {
    return `video:progress:${s3Key}`;
  }

  private calculateStatus(progress: number): VideoProgressState['status'] {
    if (progress >= 100) return 'completed';
    return progress > 0 ? 'running' : 'pending';
  }

  /** Initialise le suivi d'une vidéo */
  async init(s3Key: string) {
    await this.updateProgress(s3Key, VIDEO_STAGES.INIT, 0, 'Initialisation du suivi');
  }

  /** Met à jour la progression d'une étape */
  async updateProgress(s3Key: string, stage: string, progress: number, message?: string) {
    // Validation et clamp de la progression
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    const state: VideoProgressState = {
      stage,
      progress: clampedProgress,
      status: this.calculateStatus(clampedProgress),
      updatedAt: new Date().toISOString(),
      message,
    };

    try {
      await this.redis.set(this.getRedisKey(s3Key), JSON.stringify(state), 'EX', this.TTL);
      this.logger.debug(`🔄 Progress [${s3Key}] ${stage}: ${clampedProgress}%`);

      /* // Notifier l'admin / dashboard via dispatcher
      await this.dispatcher.emit(VideoEvents.VIDEO_PROGRESS, {
        s3Key,
        stage,
        progress: clampedProgress,
        message,
      }); */
    } catch (error) {
      this.logger.error(`Failed to update progress for ${s3Key}:`, error);
      throw error;
    }
  }

  /** Marque la tâche comme terminée */
  async markCompleted(s3Key: string, message?: string) {
    await this.updateProgress(s3Key, VIDEO_STAGES.COMPLETED, 100, message ?? 'Traitement terminé ✅');
  }

  /** Marque la tâche comme échouée */
  async markFailed(s3Key: string, reason: string) {
    await this.updateProgress(s3Key, VIDEO_STAGES.FAILED, 0, reason ?? 'Erreur inconnue');
    
    try {
      /* await this.dispatcher.emit(VideoEvents.VIDEO_PROCESSING_FAILED, {
        s3Key,
        error: reason,
      }); */
    } catch (error) {
      this.logger.error(`Failed to emit failure event for ${s3Key}:`, error);
      // On ne throw pas ici pour ne pas masquer l'erreur originale
    }
  }

  async markForRetry(s3Key: string): Promise<void> {
  // Met à jour l'état de la vidéo dans Redis/DB
  await this.redis.hset(this.getRedisKey(s3Key), 'status', 'PENDING_RETRY');
  await this.redis.hset(this.getRedisKey(s3Key), 'lastError', 'Job relancé par l\'administrateur');
  // Émettre un événement UI/Socket pour mettre à jour le tableau de bord
  // ...
}

  /** Récupère l'état courant pour l'admin/dashboard */
  async getProgress(s3Key: string): Promise<VideoProgressState | null> {
    try {
      const raw = await this.redis.get(this.getRedisKey(s3Key));
      if (!raw) return null;
      
      return JSON.parse(raw) as VideoProgressState;
    } catch (error) {
      this.logger.error(`Failed to get progress for ${s3Key}:`, error);
      return null;
    }
  }

  /** Supprime l'état du suivi (optionnel après fin du traitement) */
  async clearProgress(s3Key: string) {
    try {
      await this.redis.del(this.getRedisKey(s3Key));
      this.logger.debug(`🧹 Cleared progress for video ${s3Key}`);
    } catch (error) {
      this.logger.error(`Failed to clear progress for ${s3Key}:`, error);
      throw error;
    }
  }

  /** Vérifie si une tâche existe */
  async exists(s3Key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.getRedisKey(s3Key));
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence for ${s3Key}:`, error);
      return false;
    }
  }

  /** Récupère le TTL restant */
  async getTTL(s3Key: string): Promise<number> {
    try {
      return await this.redis.ttl(this.getRedisKey(s3Key));
    } catch (error) {
      this.logger.error(`Failed to get TTL for ${s3Key}:`, error);
      return -1;
    }
  }
}
