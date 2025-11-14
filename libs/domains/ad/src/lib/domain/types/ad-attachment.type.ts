import {
  MediaAttachmentType,
  MediaFileStatus,
  MediaType,
} from '@safliix-back/database';

export interface AdAttachmentPrimitives {
  id: string;
  mediaFileId: string;
  type: MediaAttachmentType;
  mediaFile?: {
    id: string;
    s3Key: string;
    duration?: number | null;
    width?: number | null;
    height?: number | null;
    status: MediaFileStatus;
    mediaType: MediaType;
  };
}
