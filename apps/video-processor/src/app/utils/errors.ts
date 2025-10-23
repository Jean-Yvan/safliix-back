// src/errors/permanent-processing.error.ts
export class PermanentProcessingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermanentProcessingError';
    }
}