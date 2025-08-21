import { Result,Ok,Err } from 'oxide.ts';



// Définition des erreurs métier
export class EmptyFormatError extends Error {
  constructor() {
    super('Format cannot be empty');
    this.name = 'EmptyFormatError';
  }
}

export class DuplicateFormatError extends Error {
  constructor(format: string) {
    super(`Format ${format} already exists`);
    this.name = 'DuplicateFormatError';
  }
}

export class InvalidFormatError extends Error {
  constructor(reason: string) {
    super(`Invalid format: ${reason}`);
    this.name = 'InvalidFormatError';
  }
}

export class VideoFormat {
  private constructor(
    public readonly id: string | undefined,
    private _format: string,
    private _description: string | null
  ) {}

  // === Factory Methods ===
  static create(
    id: string | undefined,
    format: string,
    description: string | null,
    existingFormats: string[] = []
  ): Result<VideoFormat, EmptyFormatError | DuplicateFormatError | InvalidFormatError> {
    const normalizedFormat = format.trim().toUpperCase();

    if (!normalizedFormat) {
      return Err(new EmptyFormatError());
    }

    if (existingFormats.includes(normalizedFormat)) {
      return Err(new DuplicateFormatError(normalizedFormat));
    }

    if (normalizedFormat.length > 20) {
      return Err(new InvalidFormatError('Format too long (max 20 chars)'));
    }

    return Ok(
      new VideoFormat(
        id,
        normalizedFormat,
        description
      )
    );
  }

  

  // === Accessors ===
  get format(): string {
    return this._format;
  }

  get description(): string | null {
    return this._description;
  }

  setDescription(description: string): Result<void, InvalidFormatError> {
    if (description.length > 500) {
      return Err(new InvalidFormatError('Description too long (max 500 chars)'));
    }
    this._description = description;
    return Ok(undefined);
  }

  // === Persistence ===
  

  // === Business Logic ===
  matches(searchTerm: string): boolean {
    return this._format.includes(searchTerm.toUpperCase()) || 
          (this._description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
  }
}