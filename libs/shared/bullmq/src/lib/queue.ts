// libs/shared/bullmq/src/lib/queues.ts
export enum Queues {
  VIDEO_PROCESSING = 'video-processing',
  THUMBNAIL_GENERATION = 'thumbnail-generation',
  NOTIFICATIONS = 'notifications',
  EMAILS = 'emails',
}

export const QUEUE_CONFIGS = {
  [Queues.VIDEO_PROCESSING]: {
    name: Queues.VIDEO_PROCESSING,
    defaultJobOptions: {
      timeout: 3600000, // 1 hour
      attempts: 3,
      backoff: { type: 'exponential', delay: 30000 },
    },
  },
  [Queues.THUMBNAIL_GENERATION]: {
    name: Queues.THUMBNAIL_GENERATION,
    defaultJobOptions: {
      timeout: 300000, // 5 minutes
      attempts: 2,
    },
  },
};