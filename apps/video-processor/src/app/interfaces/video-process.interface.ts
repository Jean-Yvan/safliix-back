// interfaces/video-process.interface.ts
export interface VideoProcessingOptions {
  s3Key: string;
  userId: string;
  customPriority?: number;
}

export interface VideoSegment {
  path: string;
  index: number;
  startTime: number;
  duration: number;
  totalSegments: number;
}

export interface EncodingJobData {
  segment: VideoSegment;
  originalFile: string;
  resolutions: string[];
  durationCategory: string;
  userId: string;
}

export interface VideoAnalysisResult {
  duration: number;
  resolution: string;
  hasAudio: boolean;
  codec: string;
}