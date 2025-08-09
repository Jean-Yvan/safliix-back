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

// Erreurs métier spécifiques
export class MoviePremiereRequiresPriceError extends Error {
  constructor() {
    super('Premiere movies require a rental price');
    this.name = 'MoviePremiereRequiresPriceError';
  }
}

export class InvalidDurationError extends Error {
  constructor() {
    super('Duration must be positive');
    this.name = 'InvalidDurationError';
  }
}

export class MissingRequiredFieldError extends Error {
  constructor(field: string) {
    super(`Missing required field: ${field}`);
    this.name = 'MissingRequiredFieldError';
  }
}

export class InvalidActorError extends Error {
  constructor(reason: string) {
    super(`Invalid actor: ${reason}`);
    this.name = 'InvalidActorError';
  }
}

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