// src/services/redis-manager.ts
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisManager {
  private config: ConfigService;

  constructor(configService: ConfigService) {
    this.config = configService;
  }

  /**
   * Crée une instance Redis avec les paramètres communs.
   */
  private createRedisInstance(commandTimeout: number): Redis {
    return new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get('REDIS_PORT', 6379),
      db: this.config.get('REDIS_DB', 0),

      // Résilience
      enableReadyCheck: true,
      lazyConnect: true,
      maxRetriesPerRequest: null,

      retryStrategy: (times: number) => {
        if (times > 5) return null;
        return Math.min(times * 500, 5000); // Exponentiel jusqu’à 5s
      },

      // Timeouts
      connectTimeout: this.config.get('REDIS_CONNECT_TIMEOUT', 30000),
      commandTimeout,
      keepAlive: this.config.get('REDIS_KEEPALIVE', 30000),
    });
  }

  /**
   * Connexion dédiée aux Workers BullMQ (tâches longues).
   */
  public createConnectionForWorker(): Redis {
    const timeoutMs = parseInt(this.config.get('REDIS_WORKER_COMMAND_TIMEOUT', '30000'), 10);
    console.log(`🔧 RedisManager: Worker connection with commandTimeout: ${timeoutMs}ms`);
    return this.createRedisInstance(timeoutMs);
  }

  /**
   * Connexion dédiée aux Queues BullMQ (ajout de jobs).
   */
  public createConnectionForQueue(): Redis {
    const timeoutMs = parseInt(this.config.get('REDIS_QUEUE_COMMAND_TIMEOUT', '5000'), 10);
    console.log(`📦 RedisManager: Queue connection with commandTimeout: ${timeoutMs}ms`);
    return this.createRedisInstance(timeoutMs);
  }

  /**
   * Connexion dédiée au QueueScheduler BullMQ (gestion des délais et des retries).
   */
  public createConnectionForScheduler(): Redis {
    const timeoutMs = parseInt(this.config.get('REDIS_SCHEDULER_COMMAND_TIMEOUT', '10000'), 10);
    console.log(`⏱️ RedisManager: Scheduler connection with commandTimeout: ${timeoutMs}ms`);
    return this.createRedisInstance(timeoutMs);
  }

  /**
   * Connexion dédiée à QueueEvents BullMQ (écoute des événements).
   */
  public createConnectionForEvents(): Redis {
    const timeoutMs = parseInt(this.config.get('REDIS_EVENTS_COMMAND_TIMEOUT', '10000'), 10);
    console.log(`📣 RedisManager: Events connection with commandTimeout: ${timeoutMs}ms`);
    return this.createRedisInstance(timeoutMs);
  }
}
