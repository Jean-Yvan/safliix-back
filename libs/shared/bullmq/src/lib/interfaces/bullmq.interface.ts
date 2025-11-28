// src/interfaces/bullmq.interface.ts

import { JobsOptions, WorkerOptions } from 'bullmq';
// src/interfaces/job-type-map.ts
import {
  IngestJobPayload,
  DownloadedPayload,
  SplittedPayload,
  PartReadyPayload,
  SegmentedPayload,
  PartProcessPayload,
  PlaylistResult,
  VideoQueues,
  GenericPayload
} from '@safliix-back/video-process-type';

/**
 * JobTypeMap — map strict des noms de jobs -> payload attendu.
 * Ne pas ajouter d'index signature [key: string]: any afin de forcer le typage strict.
 */
export type JobTypeMap = {
  // Pipeline vidéo / events
  [VideoQueues.VIDEO_INGEST_QUEUE]: IngestJobPayload;          
  [VideoQueues.VIDEO_DOWNLOADED_QUEUE]: DownloadedPayload;     
  [VideoQueues.VIDEO_SPLITTED_QUEUE]: SplittedPayload;         
  [VideoQueues.VIDEO_PART_READY_QUEUE]: PartProcessPayload;    
  [VideoQueues.VIDEO_SEGMENTED_QUEUE]: SegmentedPayload;       
  [VideoQueues.VIDEO_PLAYLIST_ASSEMBLED_QUEUE]: PlaylistResult;
  [VideoQueues.VIDEO_PROCESSING_FAILED_QUEUE]: { s3Key: string; error: string };
  [VideoQueues.VIDEO_PROGRESS_QUEUE]: { s3Key: string; stage: string; progress: number; message?: string };
  [VideoQueues.VIDEO_QUEUE] : GenericPayload | PartReadyPayload;
  // Jobs utilitaires / autres
  processImage: { file: string; format: string };
  sendEmail: { to: string; subject: string; body: string };
};

export interface QueueJob<T extends keyof JobTypeMap> {
  name: string;
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
  prefix?: string;
  maxRetriesPerRequest: number | null;
  retryDelay: number;
  commandTimeout: number;
  connectTimeout: number;
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