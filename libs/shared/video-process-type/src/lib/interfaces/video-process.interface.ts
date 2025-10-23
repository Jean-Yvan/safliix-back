// interfaces/video-process.interface.ts
export interface VideoProcessingOptions {
  s3Key: string;
  userId: string;
  customPriority?: number;
}

// src/interfaces/video-process.interface.ts
export interface VideoPart {
  s3Key: string;
  path: string;
  index: number;
  startTime: number;
  duration: number;
  totalParts: number;
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



export interface WorkerProgress {
  stage: 'analyzing' | 'encoding' | 'uploading' | 'finalizing'  | 'cleaning' ;
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

export interface VideoAnalysisResult {
  duration: number;
  resolution: string | null;
  hasAudio: boolean;
  codec: string | null;
  width: number | null;
  height: number | null;
  framerate: number | null;
}

export interface VideoSegment {
  path: string;
  index: number;
  startTime: number;
  duration: number;
  playlistPath?: string;
  totalSegments: number;
}

export interface EncodingOptions {
  resolution: string;
  width: number;
  height: number;
  bitrate: string;
  preset: string;
  crf: number;
}



export interface HLSStreamResult {
  masterPlaylistPath: string;
  outputDir: string;
  resolutions: string[];
  segmentCount: number;
  totalTime: number;
  totalSize?: number;
}

export type Profile = Omit<EncodingOptions, 'resolution'> & { 
  resolution: string;
  audioBitrate?: string;
  maxrate?: string; // Optionnel: maxrate personnalisé
  bufsize?: string; // Optionnel: bufsize personnalisé
};
