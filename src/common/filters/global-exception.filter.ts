import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseHelper } from '../helpers/api-response.helper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let responseCode = '500';
    let isOperational = false;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || exception.message;
        responseCode = responseObj.responseCode || status.toString();
      } else {
        message = exception.message;
        responseCode = status.toString();
      }

      // Mark HTTP exceptions as operational (expected errors)
      isOperational = true;
    } else if (exception instanceof Error) {
      message = exception.message;
      responseCode = '500';
      isOperational = false;
    }

    // Clean up error message for user consumption
    const userMessage = this.cleanErrorMessage(message || 'An unexpected error occurred');
    
    // Log the error appropriately based on type
    if (isOperational) {
      // Operational errors (HTTP exceptions) - log as info/warn
      this.logger.warn(
        `Operational error: ${userMessage}`,
        {
          path: request.url,
          method: request.method,
          statusCode: status,
          userAgent: request.get('User-Agent'),
          timestamp: new Date().toISOString(),
        },
        'GlobalExceptionFilter',
      );
    } else {
      // System errors - log as error with stack trace
      this.logger.error(
        `System error: ${message}`,
        exception instanceof Error ? exception.stack : 'Unknown error',
        'GlobalExceptionFilter',
      );
    }

    // Return standardized ApiResponse format
    const errorResponse = ApiResponseHelper.error(
      userMessage,
      responseCode,
      null,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Clean error messages for user consumption
   * Removes technical details and makes messages more user-friendly
   */
  private cleanErrorMessage(message: string): string {
    // Handle null/undefined messages
    if (!message || typeof message !== 'string') {
      return 'An unexpected error occurred.';
    }

    // Common error message cleanups
    const cleanups = [
      // Remove technical prefixes
      { pattern: /^ForbiddenException: /, replacement: '' },
      { pattern: /^UnauthorizedException: /, replacement: '' },
      { pattern: /^NotFoundException: /, replacement: '' },
      { pattern: /^BadRequestException: /, replacement: '' },
      { pattern: /^ConflictException: /, replacement: '' },
      
      // Make messages more user-friendly
      { pattern: /Access denied\. Required roles: (.+)\. User role: (.+)/, replacement: 'Access denied. You need $1 permissions to perform this action.' },
      { pattern: /Invalid credentials/, replacement: 'Invalid email or password' },
      { pattern: /Account is deactivated/, replacement: 'Your account has been deactivated. Please contact support.' },
      { pattern: /User not found/, replacement: 'User not found' },
      { pattern: /Professional not found/, replacement: 'Professional not found' },
      { pattern: /Service not found/, replacement: 'Service not found' },
      { pattern: /Booking not found/, replacement: 'Booking not found' },
      { pattern: /Availability not found/, replacement: 'Availability not found' },
      
      // Generic technical error cleanup
      { pattern: /^[A-Z][a-z]+Exception: /, replacement: '' },
    ];

    let cleanedMessage = message;
    
    for (const cleanup of cleanups) {
      if (cleanup.pattern.test(cleanedMessage)) {
        cleanedMessage = cleanedMessage.replace(cleanup.pattern, cleanup.replacement);
        break; // Only apply first matching cleanup
      }
    }

    // Ensure message starts with capital letter and ends properly
    if (cleanedMessage.length > 0) {
      cleanedMessage = cleanedMessage.charAt(0).toUpperCase() + cleanedMessage.slice(1);
      
      if (!cleanedMessage.endsWith('.') && !cleanedMessage.endsWith('!') && !cleanedMessage.endsWith('?')) {
        cleanedMessage += '.';
      }
    }

    return cleanedMessage;
  }
}
