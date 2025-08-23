// libs/shared/cqrs/src/base-query.handler.ts
import { Logger } from '@nestjs/common';

export abstract class BaseQueryHandler<Query, Response = void> {
  protected abstract logger: Logger;

  async execute(query: Query): Promise<Response> {
    try {
      return await this.handle(query);
    } catch (error) {
      this.handleError(error, query);
      throw this.normalizeError(error);
    }
  }

  protected abstract handle(query: Query): Promise<Response>;

  protected handleError(error: unknown, query: Query): void {
    const errorMessage = this.getErrorMessage(error);
    const context = {
      query,
      timestamp: new Date().toISOString(),
    };
    this.logger.error(`QueryHandler failed: ${errorMessage}`, {
      context,
      stack: error instanceof Error ? error.stack : undefined,
    });
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
}
