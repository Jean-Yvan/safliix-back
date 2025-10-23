// workers/base.worker.ts
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, Job, WorkerOptions } from 'bullmq';
import { FileLogger } from '../utils/logger';
import { Redis } from 'ioredis';

/**
 * Classe de base pour tous les Workers BullMQ.
 * - Gère l'initialisation, les logs, et la fermeture du worker BullMQ.
 * - La fermeture de la connexion Redis reste à la charge des classes dérivées.
 */
export abstract class WorkerBase<TData = any, TResult = any>
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly worker: Worker<TData, TResult>;
  protected readonly logger: FileLogger;

  constructor(
    protected readonly queueName: string,
    protected readonly redisConnection: Redis,
    protected readonly workerName: string,
    protected readonly concurrency = 1,
    protected readonly options?: WorkerOptions
  ) {
    this.logger = new FileLogger(workerName);

    const mergedOptions: WorkerOptions = {
      connection: this.redisConnection,
      concurrency: this.concurrency,
      ...this.options,
    };

    // ⚙️ Création du worker BullMQ
    this.worker = new Worker<TData, TResult>(
      this.queueName,
      async (job) => await this.safeProcess(job),
      mergedOptions
    );

    this.setupEventHandlers();
    this.logger.log(`🎯 ${workerName} initialized for queue "${queueName}"`);
  }

  // --- Cycle de vie NestJS ---

  async onModuleInit() {
    this.logger.log(`🚀 ${this.workerName} started and listening`);
  }

  async onModuleDestroy() {
    this.logger.log(`🛑 Shutting down ${this.workerName}...`);
    await this.gracefulShutdown();
    // ❗ La fermeture de Redis reste au worker dérivé
  }

  // --- Traitement du job ---

  private async safeProcess(job: Job<TData, TResult>): Promise<TResult> {
    this.logger.debug(`🎬 Processing job ${job.id} from queue "${this.queueName}"`);
    this.logger.debug(`📦 Job data: ${JSON.stringify(job.data)}`);

    try {
      const result = await this.processJob(job);
      this.logger.log(`✅ Job ${job.id} completed successfully`);
      return result;
    } catch (err) {
      this.logger.error(`💥 Job ${job.id} failed`, err);
      throw err;
    }
  }

  /**
   * Implémenté par chaque worker dérivé.
   * Contient la logique métier spécifique au job.
   */
  protected abstract processJob(job: Job<TData, TResult>): Promise<TResult>;

  // --- Gestion des événements BullMQ ---

  protected setupEventHandlers() {
    this.worker.on('ready', () => {
      this.logger.log('👂 Worker ready and waiting for jobs');
    });

    this.worker.on('active', (job) => {
      this.logger.log(`🏃 Job ${job.id} started`);
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`✅ Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`❌ Job ${job?.id ?? 'unknown'} failed`, err);
    });
  }

  // --- Contrôle et état ---

  async pause() {
    await this.worker.pause();
    this.logger.log('⏸️ Worker paused');
  }

  async resume() {
    await this.worker.resume();
    this.logger.log('▶️ Worker resumed');
  }

  isRunning(): boolean {
    return this.worker.isRunning();
  }

  getState() {
    return {
      queue: this.queueName,
      isRunning: this.isRunning(),
      concurrency: this.worker.opts?.concurrency,
    };
  }

  // --- Fermeture ---

  protected async gracefulShutdown() {
    try {
      await this.worker.close(true);
      this.logger.log('✅ Worker closed gracefully');
    } catch (error) {
      this.logger.error('💥 Error during graceful shutdown', error);
      try {
        await this.worker.close(false);
        this.logger.log('⚠️ Forced worker shutdown completed');
      } catch (forceError) {
        this.logger.error('💀 Forced shutdown failed', forceError);
      }
    }
  }
}
