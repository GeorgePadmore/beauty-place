/**
 * Logging Configuration
 * 
 * Environment Variables:
 * - NODE_ENV: Set to 'development' for debug logging, 'production' for info only
 * - LOG_LEVEL: Set to one of: 'error', 'warn', 'info', 'debug', 'verbose'
 * 
 * Examples:
 * - LOG_LEVEL=debug (shows all logs)
 * - LOG_LEVEL=info (shows info, warn, error only)
 * - LOG_LEVEL=error (shows only errors)
 * 
 * Default behavior:
 * - Development: LOG_LEVEL=debug
 * - Production: LOG_LEVEL=info
 */

export const LOGGING_CONFIG = {
  // Default log level based on environment
  DEFAULT_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  
  // Available log levels
  LEVELS: ['error', 'warn', 'info', 'debug', 'verbose'] as const,
  
  // Log level from environment variable
  CURRENT_LEVEL: process.env.LOG_LEVEL?.toLowerCase() || 'debug',
  
  // Whether to show timestamps
  SHOW_TIMESTAMPS: true,
  
  // Whether to show context
  SHOW_CONTEXT: true,
};
