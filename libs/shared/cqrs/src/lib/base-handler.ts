// libs/shared/cqrs/src/base.handler.ts
import { Logger } from '@nestjs/common';
import { EventBus, ICommand } from '@nestjs/cqrs';

export abstract class BaseHandler<Command extends ICommand, Response = void> {
  //protected abstract logger: Logger;

  constructor(protected readonly eventBus?: EventBus) {}

  async execute(command: Command): Promise<Response> {
    try {
      return await this.handle(command);
    } catch (error) {
      this.handleError(error, command);
      throw this.normalizeError(error);
    }
  }

  protected abstract handle(command: Command): Promise<Response>;

  protected handleError(error: unknown, command: Command): void {
    const errorMessage = this.getErrorMessage(error);
    const context = {
      command: this.sanitizeCommand(command),
      timestamp: new Date().toISOString()
    };

    /* this.logger.error(`Handler failed: ${errorMessage}`, {
      context,
      stack: error instanceof Error ? error.stack : undefined
    }); */
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error occurred';
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    return new Error(this.getErrorMessage(error));
  }

  private sanitizeCommand(command: Command): Partial<Command> {
    const sanitized: Partial<Command> = { ...command };
    // Exemple : masquer les données sensibles
    if ('password' in command) {
  //    sanitized.password = '*****';
    }
    return sanitized;
  }
}