/**
 * Logger - Central export for all logging utilities
 * 
 * This file provides a clean interface for importing logging utilities
 * throughout the application.
 */

// Secure logger
export { 
  SecureLogger,
  logger,
  createSecureLogger,
  sanitizeForLogging,
  type LogLevel,
  type LogContext
} from './secure-logger';

// Structured logger
export { 
  StructuredLogger,
  structuredLogger,
  createStructuredLogger,
  createTracingLogger,
  type StructuredLogEntry,
  type LogMetrics
} from './structured-logger';
