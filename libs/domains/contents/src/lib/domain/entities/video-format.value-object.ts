import { Result,Ok,Err } from 'oxide.ts';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@safliix-back/database';

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
    public readonly id: string,
    private _format: string,
    private _description?: string
  ) {}

  // === Factory Methods ===
  static create(
    format: string,
    description?: string,
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
        uuidv4(),
        normalizedFormat,
        description
      )
    );
  }

  static fromPrisma(
    data: Prisma.VideoFormatGetPayload<object>
  ): Result<VideoFormat, Error> {
    try {
      const createResult = VideoFormat.create(data.format, data.description ?? undefined);
      
      if (createResult.isErr()) {
        return Err(createResult.unwrapErr());
      }

      const format = createResult.unwrap();
      // Override the generated ID with the one from Prisma
      (format as any).id = data.id;
      
      return Ok(format);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to create from Prisma'));
    }
  }

  // === Accessors ===
  get format(): string {
    return this._format;
  }

  get description(): string | undefined {
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
  toPrisma(): Prisma.VideoFormatCreateInput {
    return {
      format: this._format,
      description: this._description,
    };
  }

  // === Business Logic ===
  matches(searchTerm: string): boolean {
    return this._format.includes(searchTerm.toUpperCase()) || 
          (this._description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
  }
}