// libs/shared/bullmq/src/lib/interfaces/video-processing-job.interface.ts
export interface VideoProcessingJobData {
  // Identifiants
  videoFileId: string;
  s3Key: string;
  originalName: string;
  
  // Contexte métier
  context: {
    type: 'movie' | 'serie' | 'episode' | 'ad' | 'trailer';
    id: string;
    title?: string; // Optionnel pour le logging
  };
  
  // Métadonnées techniques
  fileSize: number;
  format: string;
  
  // Options de processing
  priority?: number; // 1 = haute, 5 = basse
  qualityPreset?: 'low' | 'medium' | 'high' | 'ultra';
  generateThumbnails?: boolean;
  generateWatermark?: boolean;
  outputFormats?: string[]; // ['1080p', '720p', '480p']
  
  // Timestamps
  createdAt: Date;
  uploadedBy?: string; // ID utilisateur
}

// Types de jobs disponibles
export enum VideoJobType {
  PROCESS_VIDEO = 'process-video',
  GENERATE_THUMBNAILS = 'generate-thumbnails',
  EXTRACT_METADATA = 'extract-metadata',
  CONVERT_FORMAT = 'convert-format',
}

// Priorités des jobs
export enum JobPriority {
  HIGH = 1,
  MEDIUM = 3, 
  LOW = 5
}