// src/interfaces/bullmq.interface.ts

import { JobsOptions, WorkerOptions } from 'bullmq';

// --- NOUVEAU: Typage strict des Jobs ---
// Définissez ici une carte de tous les types de jobs de votre application.
// Cela renforce la sécurité des types en garantissant que les données correspondent au nom du job.
export type JobTypeMap = {
  'processImage': { file: string; format: string };
  'sendEmail': { to: string; subject: string; body: string };
  // ... ajoutez d'autres types de jobs ici ...
  [key: string]: any; // Fallback générique pour les jobs non typés si nécessaire
};

export interface QueueJob<T extends keyof JobTypeMap> {
  name: T;
  data: JobTypeMap[T];
  opts?: JobsOptions;
}

// --- NOUVEAU: Configuration centralisée des files d'attente ---
export interface BullMQQueueConfig {
  defaultJobOptions?: JobsOptions;
  workerOptions?: WorkerOptions;
}

// --- Configuration générale du service BullMQ ---
export interface BullMQConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  prefix: string;
  maxRetriesPerRequest: number | null;
  retryDelay: number;
}

export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface JobResult {
  id: string;
  name: string;
  data: any;
  state: JobState;
  progress: number;
  returnvalue: any;
  failedReason?: string;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
}

// cela finit par ici

// interfaces/bullmq.interface.ts





export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}



export interface QueueStatus {
  name: string;
  metrics: QueueMetrics;
  isPaused: boolean;
  workerCount: number;
}