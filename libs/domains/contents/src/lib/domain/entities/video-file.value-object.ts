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
    public readonly id: string | null,
    private _filePath: string,
    private _duration: number,
    private _trailerPath: string | null,
    private _width: number | null,
    private _height: number | null
  ) {}

  // === Factory Methods ===
  static create(
    id: string | null,
    filePath: string,
    duration: number,
    trailerPath: string | null,
    width: number | null,
    height: number | null,
  ): Result<VideoFile, InvalidFileFormatError | InvalidDurationError> {
    /* if (!params.filePath.endsWith('.mp4')) {
      return Err(new InvalidFileFormatError());
    } */

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

  get trailerPath(): string | null {
    return this._trailerPath;
  }

  get width(): number | null {
    return this._width;
  }

  get height(): number | null {
    return this._height;
  }

  // === Persistence ===
  
}