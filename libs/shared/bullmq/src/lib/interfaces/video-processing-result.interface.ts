export interface VideoProcessingResult {
  success: boolean;
  videoFileId: string;
  processingTime: number; // ms
  outputFiles: OutputFileResult[];
  warnings?: string[];
  error?: string;
}

export interface OutputFileResult {
  format: string;
  resolution: string;
  s3Key: string;
  fileSize: number;
  bitrate: number;
  duration: number;
}