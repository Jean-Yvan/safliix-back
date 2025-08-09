export abstract class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Exemple d'erreur spécifique
export class MovieNotFoundError extends BusinessError {
  constructor(movieId: string) {
    super(`Movie with ID ${movieId} not found`);
  }
}