
import { VideoPart } from './video-process.interface';  
import { Profile } from '@safliix-back/video-process-type';


export interface PartReadyPayload {
  s3Key: string;
  partIndex: number;
  totalParts: number;
  info: any;
  error?: string;
  stage?: string;
}

export interface GenericPayload {
  s3Key: string;
  totalParts?: number;
  error?: string;
  stage?: string;
}

export interface IngestJobPayload {
  s3Key: string;
  userId?: string;
  priority?: number;
}

export interface DownloadedPayload {
  s3Key: string;
  localPath: string;
  size: number;
  hlsOutputDir: string;
  userId?: string;
}



export interface SplittedPayload {
  s3Key: string;
  localPath: string;
  assemblyDir: string;
  parts: VideoPart[];
  resolutions: string[];
  userId?: string;
}

export interface PartEncodedInfo {
  partIndex: number;
  hlsOutputDir: string;
  profiles: Profile[];
  playlistPath: string;
  totalSize?: number;
  totalEncodingTime: number; // en secondes
}

export interface SegmentedPayload {
  s3Key: string;
  assemblyDir: string;
  totalParts: number;
  profiles: Profile[];
  userId?: string;
}

export interface PlaylistResult {
  s3Key: string;
  masterPlaylistPath: string;
  outputDir: string;
  totalSize?: number;
}

export interface PartProcessPayload {
  part: SplittedPayload['parts'][number];    // VideoPart
  priority?: number;
  resolutions: string[];
  hlsOutputDir: string;
  originalFile: string;
  userId?: string;
}