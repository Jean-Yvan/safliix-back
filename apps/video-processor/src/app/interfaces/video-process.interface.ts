// interfaces/video-process.interface.ts
export interface VideoProcessingOptions {
  s3Key: string;
  userId: string;
  customPriority?: number;
}

// src/interfaces/video-process.interface.ts
export interface VideoPart {
  path: string;
  index: number;
  startTime: number;
  duration: number;
  hlsOutputDir: string;  
  totalParts: number;
  // playlistPath optionnel (créé par le splitter / ffmpeg)
  playlistPath?: string;
}


export interface EncodingJobData {
  part: VideoPart;
  file: string;
  hlsOutputDir: string;
  userId: string;
  partIndex: number;
  originalFile: string;
  priority: number;
  resolutions: string[];
}

export interface EncodingResult {
  partIndex: number;
  inputFile: string;
  outputFiles: Array<{ resolution: string; outputPath: string; fileSize: number; encodingTime?: number }>;
  hlsResult?: any; // Résultat HLS complet
  encodedAt: string;
  totalEncodingTime: number;
  success: boolean;
}

export interface VideoAnalysisResult {
  duration: number;
  resolution: string;
  hasAudio: boolean;
  codec: string;
}

export interface WorkerProgress {
  stage: 'analyzing' | 'encoding' | 'uploading' | 'cleaning';
  progress: number;
  currentResolution?: string;
  partIndex: number;
}

export interface EncodingStats {
  originalFile: string;
  originalSize: number;
  duration: number;
  resolution: string | null;
  supportedResolutions: string[];
  estimatedSizes: { [resolution: string]: number };
  analyzedAt: string;
}

export const Queue = {
  VIDEO_SPLITTING: 'video-splitting',
  VIDEO_ENCODING: 'video-encoding',
  THUMBNAIL_EXTRACTION: 'thumbnail-extraction',
};