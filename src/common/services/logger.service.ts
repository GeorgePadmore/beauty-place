import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    
    switch (envLevel) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      case 'verbose': return LogLevel.VERBOSE;
      default: return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level} ${contextStr} ${message}`;
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage('ERROR', message, context);
      console.error(formattedMessage);
      if (trace) {
        console.error(trace);
      }
    }
  }

  warn(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage('WARN', message, context);
      console.warn(formattedMessage);
    }
  }

  log(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage('INFO', message, context);
      console.log(formattedMessage);
    }
  }

  debug(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage('DEBUG', message, context);
      console.log(formattedMessage);
    }
  }

  verbose(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      const formattedMessage = this.formatMessage('VERBOSE', message, context);
      console.log(formattedMessage);
    }
  }

  // Custom methods for different log types
  success(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage('SUCCESS', `✅ ${message}`, context);
      console.log(formattedMessage);
    }
  }

  info(message: any, context?: string): void {
    this.log(message, context);
  }

  // Method to check if debug logging is enabled
  isDebugEnabled(): boolean {
    return this.shouldLog(LogLevel.DEBUG);
  }

  // Method to check if verbose logging is enabled
  isVerboseEnabled(): boolean {
    return this.shouldLog(LogLevel.VERBOSE);
  }
}
