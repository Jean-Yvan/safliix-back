// utils/logger.ts
import { LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

export class FileLogger implements LoggerService {
  private logger;

  constructor(private context: string) {
    // Créer le dossier logs s'il n'existe pas
    const logDir = path.join(process.cwd(), 'logs');
    console.log('Log directory:', logDir);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { service: 'video-encoding', context },
      transports: [
        // Logs rotatifs généraux
        new DailyRotateFile({
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: format.combine(
            format.timestamp(),
            format.json()
          )
        }),

        // Logs rotatifs pour erreurs
        new DailyRotateFile({
          dirname: logDir,
          filename: 'errors-%DATE%.log',
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: format.combine(
            format.timestamp(),
            format.json()
          )
        }),

        // Debug (seulement en dev)
        ...(process.env.NODE_ENV !== 'production'
          ? [
              new DailyRotateFile({
                dirname: logDir,
                filename: 'debug-%DATE%.log',
                level: 'debug',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '10m',
                maxFiles: '7d',
                format: format.combine(
                  format.timestamp(),
                  format.json()
                )
              })
            ]
          : []),
      ],
    });

    // En dev → logs console formatés style NestJS
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.printf(({ level, message, timestamp, context, ...meta }) => {
              const metaStr =
                meta && Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
              return `[Nest] ${timestamp} [${context}] ${level.toUpperCase()} ${message}${metaStr}`;
            })
          )
        })
      );
    }
  }

  log(message: string, data?: any) {
    this.logger.info(message, this.serializeData(data));
  }

  error(message: string, error?: any, data?: any) {
    this.logger.error(message, {
      ...this.serializeData(data),
      error: this.serializeError(error),
    });
  }

  warn(message: string, data?: any) {
    this.logger.warn(message, this.serializeData(data));
  }

  debug(message: string, data?: any) {
    this.logger.debug(message, this.serializeData(data));
  }

  private serializeError(error: any): any {
    if (!error) return error;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack:
          process.env.NODE_ENV !== 'production'
            ? error.stack
            : undefined,
      };
    }

    return typeof error === 'object' ? JSON.stringify(error) : String(error);
  }

  private serializeData(data: any): any {
    if (!data) return undefined;
    return typeof data === 'object' ? { ...data } : { value: data };
  }
}
