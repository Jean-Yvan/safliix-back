// src/services/bullmq.service.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, QueueEvents, Job, WorkerOptions } from 'bullmq';
import Redis, { Redis as RedisType } from 'ioredis';
import { ConfigService } from '@nestjs/config';
// Assurez-vous que vos types sont définis correctement. 
// J'utilise ici les types génériques pour la clarté.
import type { BullMQConfig, QueueJob, BullMQQueueConfig, JobTypeMap } from '../interfaces/bullmq.interface';

@Injectable()
export class BullMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BullMQService.name);
  private redisConnection: RedisType;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  private readonly redisConfig: BullMQConfig;
  private readonly queueConfigs: Record<string, BullMQQueueConfig>;

  constructor(private readonly configService: ConfigService) {
    this.redisConfig = this.loadRedisConfig();
    this.queueConfigs = this.loadQueueConfigs();
    
    // 1. Connexion centrale pour les Queues/QueueEvents/Service (résiliente)
    this.redisConnection = this.createRedisClient(); 
    this.setupRedisEventHandlers();
  }

  // --- Cycle de Vie ---

  async onModuleInit() {
    this.logger.log('BullMQ Service initializing...');
    
    try {
      // Attendre la connexion. ioredis gère déjà les retries via retryStrategy.
      await this.redisConnection.connect(); 
      await this.testConnection();
      this.logger.log('✅ BullMQ Service initialized successfully');
    } catch (error) {
      this.logger.error('❌ BullMQ Service initialization failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('BullMQ Service shutting down...');
    await this.closeAllConnections();
  }

  // --- Configuration et Client Redis ---

  private loadRedisConfig(): BullMQConfig {
    return {
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB') || 0,
   
      // Nouvelle configuration de résilience
      maxRetriesPerRequest: null,
      retryDelay: this.configService.get<number>('REDIS_RETRY_DELAY') || 1000,
      commandTimeout: this.configService.get<number>('REDIS_COMMAND_TIMEOUT') || 10000, 
      connectTimeout: this.configService.get<number>('REDIS_CONNECT_TIMEOUT') || 10000,
    };
  }

  private loadQueueConfigs(): Record<string, BullMQQueueConfig> {
    return {
      'default': {
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { 
            type: 'exponential', 
            delay: 5000 
          },
        }
      },
      'processImageQueue': {
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1, 
        },
      }
    };
  }

  /**
   * Crée le client Redis avec typage correct et résilience (stratégie de retry).
   */
  private createRedisClient(): RedisType {
    const { host, port, password, db, maxRetriesPerRequest, retryDelay, connectTimeout, commandTimeout } = this.redisConfig;

    return new Redis({
      host,
      port,
      password,
      db,
      
      // 💡 Résilience pour éviter les Command timed out
      maxRetriesPerRequest: maxRetriesPerRequest as number, 
      
      // Stratégie de retry exponentiel pour les reconnexions
      retryStrategy: (times: number) => {
          if (times > (maxRetriesPerRequest as number)) {
              return null; // Arrêter les tentatives après maxRetries
          }
          // Délai progressif : ex: 1000ms, 2000ms, 3000ms... (max 5000ms)
          const delay = Math.min(times * (retryDelay as number), 5000); 
          return delay; 
      },
      
      // Timeouts
      connectTimeout, 
      commandTimeout: commandTimeout as number, 
      keepAlive: 30000, 
      
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  private setupRedisEventHandlers(): void {
    this.redisConnection.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redisConnection.on('error', (error: Error) => {
      this.logger.error('Redis error:', error);
    });

    this.redisConnection.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.redisConnection.on('reconnecting', (delay: number) => {
      this.logger.warn(`Reconnecting to Redis in ${delay}ms`);
    });

    this.redisConnection.on('ready', () => {
      this.logger.log('Redis connection ready');
    });
  }

  private async testConnection(): Promise<void> {
    try {
      await this.redisConnection.ping();
      this.logger.log('✅ Redis connection test successful');
    } catch (error) {
      this.logger.error('❌ Redis connection test failed:', error);
      throw error;
    }
  }

  // --- Gestion des Queues et Jobs ---

  getQueue<T extends keyof JobTypeMap>(queueName: string): Queue<JobTypeMap[T]> {
    const existingQueue = this.queues.get(queueName);
    if (existingQueue) {
      return existingQueue as Queue<JobTypeMap[T]>;
    }

    this.logger.log(`Creating new queue: ${queueName}`);

    const queueConfig = this.queueConfigs[queueName] || this.queueConfigs['default'];

    const queue = new Queue<JobTypeMap[T]>(queueName, {
      connection: this.redisConnection,
      prefix: this.redisConfig.prefix,
      defaultJobOptions: queueConfig.defaultJobOptions,
    });

    this.queues.set(queueName, queue);
    this.setupQueueEventListeners(queue, queueName);

    return queue;
  }

  private setupQueueEventListeners(queue: Queue, queueName: string): void {
    const queueEvents = new QueueEvents(queueName, {
      connection: this.redisConnection
    });

    queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`Job ${jobId} completed in queue ${queueName}`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`Job ${jobId} failed in queue ${queueName}: ${failedReason}`);
    });

    queueEvents.on('stalled', ({ jobId }) => {
      this.logger.warn(`Job ${jobId} stalled in queue ${queueName}`);
    });

    this.queueEvents.set(queueName, queueEvents);
  }

  /**
   * Ajoute un job à une queue avec routage corrigé (utilisation de job.name).
   */
  async addJobToQueue<T extends keyof JobTypeMap>(
    queueName: T,
    job: QueueJob<T>
  ): Promise<Job<JobTypeMap[T]>> {
    try {
      const queue = this.getQueue<T>(queueName);
      
      // 💡 Correction: Utiliser job.name comme nom du job dans BullMQ.
      // Cela permet aux workers de router la tâche correctement même si la queue est partagée.
      const jobInstance = await queue.add(
        job.name as any, 
        job.data as any,
        job.opts
      );

      this.logger.log(`Job ${jobInstance.id} (${queueName}) added to queue "${queueName}"`);
      return jobInstance;

    } catch (error) {
      this.logger.error(`Error adding job to queue "${queueName}":`, error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
      throw new Error(`Failed to add job to queue: ${errorMessage}`);
    }
  }

  /**
   * Ajoute plusieurs jobs en lot avec routage corrigé.
   */
  async addBulkToQueue<T extends keyof JobTypeMap>(
    queueName: T, 
    jobs: QueueJob<T>[]
  ): Promise<Job<JobTypeMap[T]>[]> {
    try {
      const queue = this.getQueue<T>(queueName);
      
      if (jobs.length === 0) {
        this.logger.warn('No jobs to add to queue');
        return [];
      }

      const jobInstances = await queue.addBulk(
        jobs.map(job => ({
          name: job.name as any, // 💡 Correction: Utiliser job.name
          data: job.data as any,
          opts: job.opts
        }))
      );

      this.logger.log(`${jobs.length} jobs added to queue "${queueName}"`);
      return jobInstances;

    } catch (error) {
      this.logger.error(`Error adding bulk jobs to queue "${queueName}":`, error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
      throw new Error(`Failed to add job to queue: ${errorMessage}`);    
    }
  }

  /**
   * Crée un worker (utilisé ici pour la cohérence, mais les workers devraient 
   * idéalement utiliser RedisManager pour leur connexion dédiée).
   */
  async createWorker<T extends keyof JobTypeMap>(
    queueName: string,
    processor: (job: Job<JobTypeMap[T]>) => Promise<any>,
    opts: Partial<WorkerOptions> = {}
  ): Promise<Worker<JobTypeMap[T]>> {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)! as Worker<JobTypeMap[T]>;
    }

    const workerOptions: WorkerOptions = {
      connection: this.redisConnection, // Utilise la connexion centrale
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 1000
      },
      ...opts
    };

    const worker = new Worker<JobTypeMap[T]>(queueName, processor, workerOptions);

    worker.on('completed', (job: Job<JobTypeMap[T]>) => {
      this.logger.log(`Worker: Job ${job.id} completed`);
    });

    worker.on('failed', (job: Job<JobTypeMap[T]> | undefined, error: Error) => {
      const jobId = job?.id || 'unknown';
      this.logger.error(`Worker: Job ${jobId} failed: ${error.message}`);
    });

    worker.on('stalled', (jobId: string) => {
      this.logger.warn(`Worker: Job ${jobId} stalled`);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Worker for "${queueName}" created`);
    
    return worker;
  }

  // ... (getQueueMetrics, getQueueJobs, removeJob, isQueuePaused, pauseQueue, resumeQueue, getQueueSize restent inchangés)

  /**
   * Ferme toutes les connexions (queues, events, workers et la connexion Redis principale)
   */
  private async closeAllConnections(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    // Fermeture des Workers
    for (const [name, worker] of this.workers) {
      closePromises.push(
        worker.close().then(() => {
          this.logger.log(`Worker "${name}" closed`);
        }).catch(error => {
          this.logger.error(`Error closing worker "${name}":`, error);
        })
      );
    }
    
    // Fermeture des QueueEvents
    for (const [name, queueEvents] of this.queueEvents) {
      closePromises.push(
        queueEvents.close().then(() => {
          this.logger.log(`QueueEvents "${name}" closed`);
        }).catch(error => {
          this.logger.error(`Error closing QueueEvents "${name}":`, error);
        })
      );
    }

    // Fermeture des Queues
    for (const [name, queue] of this.queues) {
      closePromises.push(
        queue.close().then(() => {
          this.logger.log(`Queue "${name}" closed`);
        }).catch(error => {
          this.logger.error(`Error closing queue "${name}":`, error);
        })
      );
    }

    await Promise.allSettled(closePromises);

    // Fermeture de la connexion Redis principale du service
    if (this.redisConnection) {
      try {
        await this.redisConnection.quit();
        this.logger.log('Redis connection closed');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
  }
}