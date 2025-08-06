import { Result, Ok, Err } from 'oxide.ts';
import { Prisma } from '@safliix-back/database';

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
    public readonly id: string,
    private _filePath: string,
    private _duration: number, // en secondes
    private _width?: number,
    private _height?: number
  ) {}

  // === Factory Methods ===
  static create(params: {
    id?: string;
    filePath: string;
    duration: number;
    width?: number;
    height?: number;
  }): Result<VideoFile, InvalidFileFormatError | InvalidDurationError> {
    if (!params.filePath.endsWith('.mp4')) {
      return Err(new InvalidFileFormatError());
    }

    if (params.duration <= 0) {
      return Err(new InvalidDurationError());
    }

    return Ok(
      new VideoFile(
        params.id || '',
        params.filePath,
        params.duration,
        params.width,
        params.height
      )
    );
  }

  static fromPrisma(
    data: Prisma.VideoFileGetPayload<object>
  ): Result<VideoFile, Error> {
    return VideoFile.create({
      id: data.id,
      filePath: data.filePath,
      duration: data.duration,
    });
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

  get resolution(): string | undefined {
    return this._width && this._height 
      ? `${this._width}x${this._height}` 
      : undefined;
  }

  // === Persistence ===
  toPrisma(): Result<Prisma.VideoFileCreateInput,Error> {
    try {
      return Ok({
        id: this.id,
        filePath: this._filePath,
        duration: this._duration,
        width: this._width,
        height: this._height
      });
    }catch (error) {
      return Err(new Error('Failed to convert VideoFile to Prisma format'));
    }
  }
}