import { VideoFile } from "../entities/video-file.entity";
import { VideoFileStatus } from "../enums/video-file-status.enum";
export interface VideoFileRepository {
  // CRUD basique
  findById(id: string): Promise<VideoFile | null>;
  save(videoFile: VideoFile): Promise<void>;
  update(videoFile: VideoFile): Promise<void>;
  delete(id: string): Promise<void>;

  // Méthodes métier
  updateStatus(id: string, status: VideoFileStatus): Promise<void>;
  markAsProcessing(id: string): Promise<void>;
  //markAsProcessed(id: string, metadata: ProcessingMetadata): Promise<void>;
  markAsFailed(id: string, error?: string): Promise<void>;
  
  // Recherche
  findByS3Key(s3Key: string): Promise<VideoFile | null>;
  findByStatus(status: VideoFileStatus): Promise<VideoFile[]>;
}