import { VideoFileWithoutRelation } from '@safliix-back/database';
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


export class VideoFile {
  private constructor(
    public readonly id: string | undefined,
    private _filePath: string,
    private _duration: number,
    private _trailerPath: string | null,
    private _width: number | null,
    private _height: number | null,
  ) {}

  // === Factory Methods ===
  static create(
    id: string | undefined,
    filePath: string,
    duration: number,
    trailerPath: string | null,
    width: number | null,
    height: number | null,
  ): Result<VideoFile, InvalidFileFormatError | InvalidDurationError> {
    if (duration <= 0) {
      return Err(new InvalidDurationError());
    }

    return Ok(
      new VideoFile(
        id,
        filePath,
        duration,
        trailerPath,
        width,
        height
      )
    );
  }

  static restore(data: VideoFileWithoutRelation) : VideoFile {
    return new VideoFile(
      data.id,
      data.filePath,
      data.duration,
      data.trailerPath,
      data.width,
      data.height 
    );
  }

  // === Update Method ===
  updateWith(data: {
    filePath?: string;
    duration?: number;
    trailerPath?: string | null;
    width?: number | null;
    height?: number | null;
  }): Result<void, InvalidFileFormatError | InvalidDurationError> {
    if (data.filePath !== undefined) {
      if (!data.filePath.endsWith(".mp4")) {
        return Err(new InvalidFileFormatError());
      }
      this._filePath = data.filePath;
    }

    if (data.duration !== undefined) {
      if (data.duration <= 0) {
        return Err(new InvalidDurationError());
      }
      this._duration = data.duration;
    }

    if (data.trailerPath !== undefined) {
      this._trailerPath = data.trailerPath;
    }

    if (data.width !== undefined) {
      this._width = data.width;
    }

    if (data.height !== undefined) {
      this._height = data.height;
    }

    return Ok(undefined);
  }

  // === Méthodes d'accès ===
  get filePath(): string {
    return this._filePath;
  }

  setFilePath(newPath: string): Result<void, InvalidFileFormatError> {
    if (!newPath.endsWith('.mp4')) {
      return Err(new InvalidFileFormatError());
    }
    this._filePath = newPath;
    return Ok(undefined);
  }

  get duration(): number {
    return this._duration;
  }

  get resolution(): string | null {
    return this._width && this._height 
      ? `${this._width}x${this._height}` 
      : null;
  }

  get trailerPath(): string | null {
    return this._trailerPath;
  }

  get width(): number | null {
    return this._width;
  }

  get height(): number | null {
    return this._height;
  }
}
