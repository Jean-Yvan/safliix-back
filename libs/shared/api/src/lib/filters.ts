import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessError } from '@safliix-back/errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. Typage de l'exception
    const error = this.normalizeException(exception);

    // 2. Log l'erreur complète
    this.logger.error(error);

    // 3. Gestion des erreurs métier
    if (error instanceof BusinessError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        errorType: error.constructor.name,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Erreurs de validation
    if (error instanceof BadRequestException) {
      type ValidationErrorResponse = {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };
      const responseMessage = error.getResponse() as ValidationErrorResponse;
      
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        errorType: 'ValidationError',
        message: typeof responseMessage === 'object' 
          ? responseMessage['message'] 
          : responseMessage,
        timestamp: new Date().toISOString(),
      });
    }

    // 5. Erreurs HTTP standard
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return response.status(status).json({
        statusCode: status,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // 6. Erreur serveur inattendue
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeException(exception: unknown): Error {
    if (exception instanceof Error) {
      return exception;
    }
    
    if (typeof exception === 'string') {
      return new Error(exception);
    }

    return new Error('Unknown error occurred');
  }
}