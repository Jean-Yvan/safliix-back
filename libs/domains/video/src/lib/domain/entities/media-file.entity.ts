import { MediaFileWithoutRelation, MediaFileStatus, MediaType } from '@safliix-back/database';
import { Result, Ok, Err } from 'oxide.ts';

// Définition des erreurs métier
export class InvalidFileFormatError extends Error {
  constructor() {
    super('Only MP4 files are supported');
    this.name = 'InvalidFileFormatError';
  }
}

export class InvalidDurationError extends Error {
  constructor() {
    super('Duration must be positive');
    this.name = 'InvalidDurationError';
  }
}


export class MediaFile {
  private constructor(
    public readonly id: string | undefined,
    public s3Key: string,
    public duration: number | null,
    public width: number | null,
    public height: number | null,
    public status: MediaFileStatus,
    public mediaType: MediaType,

    public createdAt: Date | null,    
    public updatedAt: Date | null,
    
  ) {}

  // === Factory Methods ===
  static create(
    id: string | undefined,
    s3Key: string,
    duration: number,
    width: number | null,
    height: number | null,
    status: MediaFileStatus = MediaFileStatus.PENDING,
    mediaType: MediaType = MediaType.VIDEO
  ): Result<MediaFile, InvalidFileFormatError | InvalidDurationError> {
    if (duration <= 0) {
      return Err(new InvalidDurationError());
    }

    return Ok(
      new MediaFile(
        id,
        s3Key,
        duration,
        width,
        height,
        status,
        mediaType,
        null,
        null
      )
    );
  }

  static restore(data: MediaFileWithoutRelation) : MediaFile {
    return new MediaFile(
      data.id,
      data.s3Key,
      data.duration,
      data.width,
      data.height,
      data.status as MediaFileStatus,
      data.mediaType as unknown as MediaType,
      data.createdAt,
      data.updatedAt
    );
  }

  // === Update Method ===
  updateWith(data: {
    s3Key?: string;
    duration?: number;
    width?: number | null;
    height?: number | null;
  }): Result<void, InvalidFileFormatError | InvalidDurationError> {
    if (data.s3Key !== undefined) {
      if (!data.s3Key.endsWith(".mp4")) {
        return Err(new InvalidFileFormatError());
      }
      this.s3Key = data.s3Key;
    }

    if (data.duration !== undefined) {
      if (data.duration <= 0) {
        return Err(new InvalidDurationError());
      }
      this.duration = data.duration;
    }

    if (data.width !== undefined) {
      this.width = data.width;
    }

    if (data.height !== undefined) {
      this.height = data.height;
    }

    return Ok(undefined);
  }

  // === Méthodes d'accès ===
  
}
