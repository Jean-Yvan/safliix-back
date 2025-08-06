import { Result,Ok,Err } from 'oxide.ts';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@safliix-back/database';

// Définition des erreurs métier
export class EmptyCategoryError extends Error {
  constructor() {
    super('Category cannot be empty');
    this.name = 'EmptyCategoryError';
  }
}

export class DuplicateCategoryError extends Error {
  constructor(category: string) {
    super(`Category "${category}" already exists`);
    this.name = 'DuplicateCategoryError';
  }
}

export class InvalidCategoryError extends Error {
  constructor(reason: string) {
    super(`Invalid category: ${reason}`);
    this.name = 'InvalidCategoryError';
  }
}

export class VideoCategory {
  private constructor(
    public readonly id: string,
    private _category: string,
    private _description?: string
  ) {}

  // === Factory Methods ===
  static create(
    category: string,
    existingCategories: string[] = [],
    description?: string
  ): Result<VideoCategory, EmptyCategoryError | DuplicateCategoryError | InvalidCategoryError> {
    const normalizedCategory = category.trim();

    // Validation des règles métier
    if (!normalizedCategory) {
      return Err(new EmptyCategoryError());
    }

    if (existingCategories.includes(normalizedCategory)) {
      return Err(new DuplicateCategoryError(normalizedCategory));
    }

    if (normalizedCategory.length > 50) {
      return Err(new InvalidCategoryError('Category too long (max 50 chars)'));
    }

    if (description && description.length > 500) {
      return Err(new InvalidCategoryError('Description too long (max 500 chars)'));
    }

    return Ok(
      new VideoCategory(
        uuidv4(),
        normalizedCategory,
        description
      )
    );
  }

  static fromPrisma(
    data: Prisma.VideoCategoryGetPayload<object>
  ): Result<VideoCategory, Error> {
    try {
      const createResult = VideoCategory.create(
        data.category,
        [],
        data.description ?? undefined
      );

      if (createResult.isErr()) {
        return Err(createResult.unwrapErr());
      }

      const category = createResult.unwrap();
      // On conserve l'ID original de Prisma
      (category as any).id = data.id;

      return Ok(category);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error('Failed to create from Prisma'));
    }
  }

  // === Accessors ===
  get category(): string {
    return this._category;
  }

  get description(): string | undefined {
    return this._description;
  }

  updateDescription(description: string): Result<void, InvalidCategoryError> {
    if (description.length > 500) {
      return Err(new InvalidCategoryError('Description too long (max 500 chars)'));
    }
    this._description = description;
    return Ok(undefined);
  }

  // === Persistence ===
  toPrisma(): Prisma.VideoCategoryCreateInput {
    return {
      id: this.id,
      category: this._category,
      description: this._description,
    };
  }

  // === Business Logic ===
  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return this._category.toLowerCase().includes(term) || 
          (this._description?.toLowerCase().includes(term) ?? false);
  }
}