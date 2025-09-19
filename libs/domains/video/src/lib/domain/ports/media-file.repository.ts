import { MediaFile } from "../entities/media-file.entity";
import { MediaFileStatus } from "@safliix-back/database";

import { ElementType, AttachmentType } from "../../utils/types";


export interface MediaFileRepository {
  // --- CRUD basique ---
  findById(id: string): Promise<MediaFile | null>;
  save(mediaFile: MediaFile): Promise<void>;
  update(mediaFile: MediaFile): Promise<void>;
  delete(id: string): Promise<void>;

  // --- Méthodes métier ---
  updateStatus(id: string, status: MediaFileStatus): Promise<void>;
  markAsProcessing(id: string): Promise<void>;
  markAsFailed(id: string, error?: string): Promise<void>;

  // --- Recherche ---
  findByS3Key(s3Key: string): Promise<MediaFile | null>;
  findByStatus(status: MediaFileStatus): Promise<MediaFile[]>;

  // --- Attachement ---
  attachToElement(
    mediaFileId: string,
    elementType: ElementType,
    elementId: string,
    type: AttachmentType
  ): Promise<void>;

  generateSignedUrl(mediaFileId: string): Promise<string>;
}
