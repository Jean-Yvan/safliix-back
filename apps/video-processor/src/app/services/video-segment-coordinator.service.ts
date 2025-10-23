// services/video-segment-coordinator.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisManager } from './redis-manager';
import { VideoEventDispatcher } from './video-event-dispatcher.service';
import { PartEncodedInfo, VideoEvents, VideoQueues, Profile } from '@safliix-back/video-process-type';
import { FileLogger } from '../utils/logger';
@Injectable()
export class VideoSegmentCoordinator {
  private readonly logger = new FileLogger(VideoSegmentCoordinator.name);
  private readonly redis: Redis;

  // 🔧 Constantes pour la configuration
  private readonly REDIS_KEY_PREFIX = 'video:parts:';
  private readonly REDIS_KEY_EXPIRE_SECONDS = 3600; // 1h
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(
    private readonly redisManager: RedisManager,
    private readonly dispatcher: VideoEventDispatcher
  ) {
    this.redis = this.redisManager.createConnectionForWorker();
    
    // 🔧 Gestion des erreurs Redis
    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`, error.stack);
    });
  }

  private getRedisKey(videoId: string): string {
    return `${this.REDIS_KEY_PREFIX}${videoId}`;
  }

  // 🔧 AMÉLIORATION: Script LUA plus robuste avec gestion d'erreur
  private readonly LUA_SCRIPT = `
    local key = KEYS[1]
    local field = ARGV[1]
    local value = ARGV[2]
    local totalParts = tonumber(ARGV[3])
    local expireTime = tonumber(ARGV[4])

    -- Validation des arguments
    if not key or not field or not value or not totalParts or not expireTime then
      return redis.error_reply("Missing required arguments")
    end

    -- Vérifier si la clé existe déjà et récupérer son TTL actuel
    local currentTtl = redis.call('TTL', key)
    local newTtl = expireTime
    
    -- Si la clé existe déjà, préserver le TTL le plus long
    if currentTtl > 0 and currentTtl > expireTime then
      newTtl = currentTtl
    end

    -- Enregistrer la partie encodée
    redis.call('HSET', key, field, value)
    redis.call('EXPIRE', key, newTtl)

    -- Vérifier le nombre de parties encodées
    local encodedParts = redis.call('HLEN', key)

    -- Retourner le statut et le compteur pour le debugging
    return {encodedParts, totalParts, encodedParts == totalParts and 1 or 0}
  `;

  /**
   * Enregistre une partie encodée et vérifie l'achèvement atomiquement.
   */
  async registerEncodedPart(
    s3Key: string, 
    partIndex: number, 
    totalParts: number, 
    info: PartEncodedInfo,
    profiles: Profile[]
  ): Promise<void> {
    const key = this.getRedisKey(s3Key);

    // 🔧 VALIDATION: Vérification des paramètres critiques
    if (partIndex < 0 || partIndex >= totalParts) {
      this.logger.error(`Invalid partIndex: ${partIndex} for totalParts: ${totalParts}`);
      throw new Error(`Invalid partIndex: ${partIndex} for totalParts: ${totalParts}`);
    }

    if (!info?.hlsOutputDir) {
      this.logger.error(`PartEncodedInfo must include assemblyDir`);
      throw new Error('PartEncodedInfo must include assemblyDir');
    }

    try {
      // 🔧 AMÉLIORATION: Retry logic pour les pannes réseau temporaires
      const result = await this.executeWithRetry(async () => {
        return await this.redis.eval(
          this.LUA_SCRIPT,
          1,
          key,
          partIndex.toString(),
          JSON.stringify(info),
          totalParts.toString(),
          this.REDIS_KEY_EXPIRE_SECONDS.toString()
        );
      });

      // 🔧 AMÉLIORATION: Meilleure gestion de la réponse LUA
      const [encodedParts, expectedParts, isComplete] = this.parseLuaResult(result);

      this.logger.debug(`Part ${partIndex}/${totalParts} registered for ${s3Key} (${encodedParts} encoded)`);

      if (isComplete === 1) {
        await this.handleEncodingCompletion(s3Key, totalParts, profiles);
      }

    } catch (error) {
      this.logger.error(
        `Failed to register encoded part ${partIndex} for ${s3Key}: ${error}`,
        
      );
      throw error;
    }
  }

  // 🔧 NOUVEAU: Méthode dédiée pour la gestion de la complétion
  private async handleEncodingCompletion(
    s3Key: string,
    totalParts: number,
    profiles: Profile[]
  ): Promise<void> {
    const key = this.getRedisKey(s3Key);

    try {
      // Récupérer toutes les parties avec validation
      const partsData = await this.redis.hgetall(key);
      const parts = this.parsePartsData(partsData, totalParts);

      if (parts.length !== totalParts) {
        this.logger.warn(
          `Data inconsistency for ${s3Key}: expected ${totalParts}, got ${parts.length}`
        );
        // 🔧 DECISION: On continue malgré l'incohérence
      }

      // Émettre l'événement de complétion
      await this.dispatcher.emit(VideoQueues.VIDEO_SEGMENTED_QUEUE, VideoEvents.VIDEO_SEGMENTED, {
        s3Key,
        assemblyDir: parts[0].hlsOutputDir,
        totalParts: parts.length, // Utiliser le compte réel
        profiles,
      });

      await this.dispatcher.emit(VideoQueues.VIDEO_QUEUE, VideoEvents.VIDEO_SEGMENTED, {
        s3Key,
        totalParts: parts.length, // Utiliser le compte réel
      });

      this.logger.log(`Video segmentation completed for ${s3Key} with ${parts.length} parts`);

      // 🔧 AMÉLIORATION: Nettoyage avec gestion d'erreur
      await this.cleanupKey(key);

    } catch (error) {
      this.logger.error(
        `Error during encoding completion for ${s3Key}: ${error}`,
      );
      // 🔧 IMPORTANT: Ne pas supprimer la clé en cas d'erreur
      throw error;
    }
  }

  // 🔧 NOUVEAU: Parsing sécurisé des résultats LUA
  private parseLuaResult(result: any): [number, number, number] {
    if (!Array.isArray(result) || result.length !== 3) {
      throw new Error(`Invalid LUA script result: ${JSON.stringify(result)}`);
    }

    const [encodedParts, expectedParts, isComplete] = result.map(Number);
    
    if (isNaN(encodedParts) || isNaN(expectedParts) || isNaN(isComplete)) {
      throw new Error(`Invalid numeric values in LUA result: ${JSON.stringify(result)}`);
    }

    return [encodedParts, expectedParts, isComplete];
  }

  // 🔧 NOUVEAU: Parsing sécurisé des données des parties
  private parsePartsData(partsData: Record<string, string>, totalParts: number): PartEncodedInfo[] {
    const parts: PartEncodedInfo[] = [];

    for (let i = 0; i < totalParts; i++) {
      const partData = partsData[i.toString()];
      if (!partData) {
        this.logger.warn(`Missing data for part ${i}`);
        continue;
      }

      try {
        const parsedInfo: PartEncodedInfo = JSON.parse(partData);
        
        // Validation basique des données requises
        if (!parsedInfo.hlsOutputDir) {
          this.logger.warn(`Invalid PartEncodedInfo for part ${i}: missing hlsOutputDir`);
          continue;
        }

        parts.push(parsedInfo);
      } catch (parseError) {
        this.logger.warn(`Failed to parse PartEncodedInfo for part ${i}: ${parseError}`);
      }
    }

    return parts.sort((a, b) => a.partIndex - b.partIndex);
  }

  // 🔧 NOUVEAU: Retry logic pour la résilience
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempts: number = this.MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === attempts) {
          throw error;
        }
        
        this.logger.warn(
          `Redis operation failed (attempt ${attempt}/${attempts}), retrying...: ${error}`
        );
        
        // Backoff exponentiel
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        );
      }
    }
    
    throw new Error(`All ${attempts} retry attempts failed`);
  }

  // 🔧 NOUVEAU: Nettoyage sécurisé
  private async cleanupKey(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Failed to delete Redis key ${key}: ${error}`);
      // Ne pas propager l'erreur pour le nettoyage
    }
  }

  // 🔧 NOUVEAU: Méthode utilitaire pour le monitoring
  async getEncodingProgress(s3Key: string): Promise<{ encoded: number; total: number }> {
    const key = this.getRedisKey(s3Key);
    
    try {
      const partsData = await this.redis.hgetall(key);
      const encodedCount = Object.keys(partsData).length;
      
      // Note: On ne connaît pas le total exact ici, on retourne juste le comptage
      return { encoded: encodedCount, total: encodedCount }; 
    } catch (error) {
      this.logger.error(`Failed to get encoding progress for ${s3Key}: ${error}`);
      return { encoded: 0, total: 0 };
    }
  }

  // 🔧 NOUVEAU: Méthode de nettoyage manuel (pour les jobs orphelins)
  async cleanupOrphanedEncoding(s3Key: string): Promise<void> {
    const key = this.getRedisKey(s3Key);
    await this.cleanupKey(key);
    this.logger.log(`Cleaned up orphaned encoding for ${s3Key}`);
  }
}