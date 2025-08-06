export abstract class MovieCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MovieCreationError';
  }
}

export class MovieValidationError extends MovieCreationError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'MovieValidationError';
  }
}

export class MovieSaveError extends MovieCreationError {
  constructor(message: string) {
    super(`Save failed: ${message}`);
    this.name = 'MovieSaveError';
  }
}