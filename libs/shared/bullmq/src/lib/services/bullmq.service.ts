// src/services/bullmq.service.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, QueueEvents, Job, JobsOptions, WorkerOptions } from 'bullmq';
import Redis, { Redis as RedisType } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import type { BullMQConfig, QueueJob, QueueMetrics, JobResult, JobState, BullMQQueueConfig, JobTypeMap } from '../interfaces/bullmq.interface';

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
    
    this.redisConnection = this.createRedisClient();
    this.setupRedisEventHandlers();
  }

  async onModuleInit() {
    this.logger.log('BullMQ Service initializing...');
    
    try {
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

  /**
   * Charge la configuration Redis depuis ConfigService
   */
  private loadRedisConfig(): BullMQConfig {
    return {
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB') || 0,
      prefix: this.configService.get<string>('REDIS_PREFIX') || 'bullmq',
      maxRetriesPerRequest: null,
      retryDelay: this.configService.get<number>('REDIS_RETRY_DELAY') || 1000
    };
  }

  /**
   * Charge la configuration des queues depuis ConfigService
   * NOTE: Pour plus de flexibilité, cette config peut être plus complexe.
   * Ici, elle est simple pour l'exemple.
   */
  private loadQueueConfigs(): Record<string, BullMQQueueConfig> {
    return {
      // Configuration par défaut, utilisée si aucune autre n'est spécifiée
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
      // Exemple de configuration pour une queue spécifique
      'processImageQueue': {
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1, // Moins d'essais pour une tâche critique
        },
      }
    };
  }

  /**
   * Crée le client Redis avec typage correct
   */
  private createRedisClient(): RedisType {
    return new Redis({
      host: this.redisConfig.host,
      port: this.redisConfig.port,
      password: this.redisConfig.password,
      db: this.redisConfig.db,
      maxRetriesPerRequest: this.redisConfig.maxRetriesPerRequest,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000
    });
  }

  /**
   * Configure les gestionnaires d'événements Redis
   */
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

  /**
   * Teste la connexion Redis
   */
  private async testConnection(): Promise<void> {
    try {
      await this.redisConnection.ping();
      this.logger.log('✅ Redis connection test successful');
    } catch (error) {
      this.logger.error('❌ Redis connection test failed:', error);
      throw error;
    }
  }

  /**
   * Obtient ou crée une queue avec typage et configuration correcte
   */
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

  /**
   * Configure les écouteurs d'événements pour une queue
   */
  private setupQueueEventListeners(queue: Queue, queueName: string): void {
    const queueEvents = new QueueEvents(queueName, {
      connection: this.redisConnection,
      prefix: this.redisConfig.prefix
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
   * Ajoute un job à une queue avec typage corrigé
   */
  async addJobToQueue<T extends keyof JobTypeMap>(
    queueName: string,
    job: QueueJob<T>
  ): Promise<Job<JobTypeMap[T]>> {
    try {
      const queue = this.getQueue<T>(queueName);
      
      const jobInstance = await queue.add(
        job.name as any,
        job.data,
        job.opts
      );

      this.logger.log(`Job ${jobInstance.id} added to queue "${queueName}"`);
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
   * Ajoute plusieurs jobs en lot avec typage corrigé
   */
  async addBulkToQueue<T extends keyof JobTypeMap>(
    queueName: string, 
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
          name: job.name as any,
          data: job.data,
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
   * Crée un worker avec typage correct
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
      connection: this.redisConnection,
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

  /**
   * Obtient les métriques d'une queue
   */
  async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
    try {
      const queue = this.getQueue(queueName);
      
      const [waiting, active, completed, failed, delayed,] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
        
      ]);

      return { 
        waiting, 
        active, 
        completed, 
        failed, 
        delayed,
        paused:0 
      };

    } catch (error) {
      this.logger.error(`Error getting metrics for queue "${queueName}":`, error);
      throw error;
    }
  }

  /**
   * Obtient les jobs d'une queue
   */
  async getQueueJobs(
    queueName: string,
    states: JobState[] = ['waiting'],
    start = 0,
    end = 50
  ): Promise<JobResult[]> {
    try {
      const queue = this.getQueue(queueName);
      const jobs: Job[] = [];

      for (const state of states) {
        const stateJobs = await queue.getJobs([state], start, end);
        jobs.push(...stateJobs);
      }

      const jobResults = await Promise.all(
        jobs.map(async (job) => {
          const state = await job.getState();
          return {
            id: job.id!,
            name: job.name,
            data: job.data,
            state: state as JobState,
            progress: typeof job.progress === 'number' ? job.progress : 0,
            returnvalue: job.returnvalue,
            failedReason: job.failedReason,
            timestamp: job.timestamp,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn
          };
        })
      );

      return jobResults;

    } catch (error) {
      this.logger.error(`Error getting jobs from queue "${queueName}":`, error);
      throw error;
    }
  }

  /**
   * Supprime un job
   */
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.getJob(jobId);
      
      if (!job) {
        this.logger.warn(`Job ${jobId} not found in queue "${queueName}"`);
        return false;
      }

      await job.remove();
      this.logger.log(`Job ${jobId} removed from queue "${queueName}"`);
      return true;

    } catch (error) {
      this.logger.error(`Error removing job ${jobId} from queue "${queueName}":`, error);
      throw error;
    }
  }

  async isQueuePaused(queueName: string): Promise<boolean> {
    const queue = this.getQueue(queueName);
    return queue.isPaused();
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    this.logger.log(`Queue "${queueName}" paused`);
  }
  
  async resumeQueue(queueName: string): Promise<void> { 
    const queue = this.getQueue(queueName);
    await queue.resume();
    this.logger.log(`Queue "${queueName}" resumed`);
  }

  async getQueueSize(queueName: string): Promise<number> {
    const metrics = await this.getQueueMetrics(queueName);
    return metrics.waiting + metrics.active + metrics.delayed;
  }


  /**
   * Ferme toutes les connexions
   */
  private async closeAllConnections(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const [name, worker] of this.workers) {
      closePromises.push(
        worker.close().then(() => {
          this.logger.log(`Worker "${name}" closed`);
        }).catch(error => {
          this.logger.error(`Error closing worker "${name}":`, error);
        })
      );
    }

    for (const [name, queueEvents] of this.queueEvents) {
      closePromises.push(
        queueEvents.close().then(() => {
          this.logger.log(`QueueEvents "${name}" closed`);
        }).catch(error => {
          this.logger.error(`Error closing QueueEvents "${name}":`, error);
        })
      );
    }

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