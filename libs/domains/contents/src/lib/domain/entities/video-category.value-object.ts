import { Result,Ok,Err } from 'oxide.ts';


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
    public readonly id: string | undefined,
    private _category: string,
    private _description: string | null
  ) {}

  // === Factory Methods ===
  static create(
    id: string | undefined,
    category: string,
    description: string | null
    
    
  ): Result<VideoCategory, EmptyCategoryError | DuplicateCategoryError | InvalidCategoryError> {
    const normalizedCategory = category.trim();

    // Validation des règles métier
    if (!normalizedCategory) {
      return Err(new EmptyCategoryError());
    }

    

    if (normalizedCategory.length > 50) {
      return Err(new InvalidCategoryError('Category too long (max 50 chars)'));
    }

    if (description && description.length > 500) {
      return Err(new InvalidCategoryError('Description too long (max 500 chars)'));
    }

    return Ok(
      new VideoCategory(
        id,
        normalizedCategory,
        description
      )
    );
  }

  

  // === Accessors ===
  get category(): string {
    return this._category;
  }

  get description(): string | null {
    return this._description;
  }

  updateDescription(description: string): Result<void, InvalidCategoryError> {
    if (description.length > 500) {
      return Err(new InvalidCategoryError('Description too long (max 500 chars)'));
    }
    this._description = description;
    return Ok(undefined);
  }


  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return this._category.toLowerCase().includes(term) || 
          (this._description?.toLowerCase().includes(term) ?? false);
  }
}