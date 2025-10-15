/**
 * Secure Logger - PII-safe logging utilities
 * 
 * This logger automatically removes or masks Personally Identifiable Information (PII)
 * and sensitive data from log entries, ensuring compliance with privacy regulations.
 */

import crypto from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogContext = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  metadata?: {
    service: string;
    version: string;
    environment: string;
    requestId?: string;
    userId?: string;
    sessionId?: string;
  };
}

export class SecureLogger {
  private static readonly SENSITIVE_FIELDS = [
    // Authentication & Authorization
    'password', 'passwd', 'pwd', 'secret', 'token', 'key', 'auth',
    'authorization', 'bearer', 'jwt', 'session', 'cookie',
    
    // Personal Information
    'email', 'e-mail', 'mail', 'phone', 'telephone', 'mobile',
    'ssn', 'social', 'security', 'national', 'id', 'identifier',
    'name', 'firstname', 'lastname', 'fullname', 'username',
    'address', 'street', 'city', 'state', 'zip', 'postal',
    'birth', 'dob', 'dateofbirth', 'age', 'gender',
    
    // Financial Information
    'credit', 'card', 'cvv', 'cvc', 'expiry', 'expiration',
    'bank', 'account', 'routing', 'iban', 'swift',
    'payment', 'billing', 'invoice', 'transaction',
    
    // Health Information
    'medical', 'health', 'diagnosis', 'condition', 'treatment',
    'prescription', 'medication', 'symptoms', 'history',
    
    // System Information
    'ip', 'ipaddress', 'mac', 'device', 'fingerprint',
    'useragent', 'browser', 'os', 'platform',
    
    // API Keys & Secrets
    'apikey', 'api_key', 'accesskey', 'secretkey',
    'privatekey', 'publickey', 'certificate',
    
    // Chat & Messages
    'message', 'content', 'text', 'body', 'query',
    'prompt', 'response', 'answer', 'conversation',
    
    // Identifiers
    'userid', 'user_id', 'sessionid', 'session_id',
    'requestid', 'request_id', 'traceid', 'trace_id',
    'correlationid', 'correlation_id'
  ];

  private static readonly MASKING_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi
  };

  private static readonly REDACTION_LEVELS = {
    'email': 'hash',
    'phone': 'mask',
    'ssn': 'redact',
    'creditCard': 'redact',
    'ipAddress': 'hash',
    'uuid': 'hash',
    'message': 'length',
    'content': 'length',
    'text': 'length',
    'query': 'length',
    'prompt': 'length',
    'response': 'length',
    'answer': 'length'
  };

  private service: string;
  private version: string;
  private environment: string;

  constructor(
    service: string = 'vital-expert',
    version: string = '1.0.0',
    environment: string = process.env.NODE_ENV || 'development'
  ) {
    this.service = service;
    this.version = version;
    this.environment = environment;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: this.sanitizeStack(error.stack)
      }
    } : context;
    
    this.log('error', message, errorContext);
  }

  /**
   * Log a fatal message
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: this.sanitizeStack(error.stack)
      }
    } : context;
    
    this.log('fatal', message, errorContext);
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const sanitizedContext = context ? this.sanitizeData(context) : undefined;
    const sanitizedMessage = this.sanitizeMessage(message);

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      context: sanitizedContext,
      metadata: {
        service: this.service,
        version: this.version,
        environment: this.environment
      }
    };

    // Add request context if available
    if (context?.requestId) {
      logEntry.metadata!.requestId = this.hashValue(context.requestId);
    }
    if (context?.userId) {
      logEntry.metadata!.userId = this.hashValue(context.userId);
    }
    if (context?.sessionId) {
      logEntry.metadata!.sessionId = this.hashValue(context.sessionId);
    }

    // Output to console with appropriate level
    this.outputLog(logEntry);
  }

  /**
   * Sanitize data by removing or masking PII
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeMessage(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        
        if (this.isSensitiveField(lowerKey)) {
          sanitized[key] = this.maskSensitiveValue(key, value);
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Sanitize message string by applying pattern-based masking
   */
  private sanitizeMessage(message: string): string {
    let sanitized = message;

    // Apply pattern-based masking
    for (const [patternName, pattern] of Object.entries(this.MASKING_PATTERNS)) {
      const redactionLevel = this.REDACTION_LEVELS[patternName as keyof typeof this.REDACTION_LEVELS];
      
      sanitized = sanitized.replace(pattern, (match) => {
        switch (redactionLevel) {
          case 'hash':
            return this.hashValue(match);
          case 'mask':
            return this.maskValue(match);
          case 'redact':
            return '[REDACTED]';
          case 'length':
            return `[${match.length} chars]`;
          default:
            return '[REDACTED]';
        }
      });
    }

    return sanitized;
  }

  /**
   * Check if a field name is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    return this.SENSITIVE_FIELDS.some(sensitiveField => 
      fieldName.includes(sensitiveField)
    );
  }

  /**
   * Mask sensitive value based on field name
   */
  private maskSensitiveValue(fieldName: string, value: any): string {
    if (typeof value !== 'string') {
      return '[REDACTED]';
    }

    const lowerFieldName = fieldName.toLowerCase();

    // Special handling for different field types
    if (lowerFieldName.includes('email')) {
      return this.maskEmail(value);
    } else if (lowerFieldName.includes('phone')) {
      return this.maskPhone(value);
    } else if (lowerFieldName.includes('ssn') || lowerFieldName.includes('social')) {
      return '[REDACTED]';
    } else if (lowerFieldName.includes('credit') || lowerFieldName.includes('card')) {
      return this.maskCreditCard(value);
    } else if (lowerFieldName.includes('message') || lowerFieldName.includes('content') || 
               lowerFieldName.includes('text') || lowerFieldName.includes('query') ||
               lowerFieldName.includes('prompt') || lowerFieldName.includes('response')) {
      return `[${value.length} chars]`;
    } else if (lowerFieldName.includes('userid') || lowerFieldName.includes('sessionid') ||
               lowerFieldName.includes('requestid') || lowerFieldName.includes('traceid')) {
      return this.hashValue(value);
    } else {
      return '[REDACTED]';
    }
  }

  /**
   * Mask email address
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!domain) return '[REDACTED]';
    
    const maskedLocal = localPart.length > 2 
      ? `${localPart[0]}***${localPart[localPart.length - 1]}`
      : '***';
    
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask phone number
   */
  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return '[REDACTED]';
    
    return `***-***-${digits.slice(-4)}`;
  }

  /**
   * Mask credit card number
   */
  private maskCreditCard(card: string): string {
    const digits = card.replace(/\D/g, '');
    if (digits.length < 13) return '[REDACTED]';
    
    return `****-****-****-${digits.slice(-4)}`;
  }

  /**
   * Mask value with asterisks
   */
  private maskValue(value: string): string {
    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }
    
    return `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
  }

  /**
   * Hash value using SHA-256
   */
  private hashValue(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Sanitize stack trace
   */
  private sanitizeStack(stack?: string): string {
    if (!stack) return '';
    
    return stack
      .split('\n')
      .map(line => {
        // Remove file paths that might contain sensitive information
        return line.replace(/\/[^\s]+/g, '[PATH]');
      })
      .join('\n');
  }

  /**
   * Output log entry to console
   */
  private outputLog(entry: LogEntry): void {
    const logString = JSON.stringify(entry, null, 0);
    
    switch (entry.level) {
      case 'debug':
        console.debug(logString);
        break;
      case 'info':
        console.info(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'error':
        console.error(logString);
        break;
      case 'fatal':
        console.error(logString);
        break;
      default:
        console.log(logString);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): SecureLogger {
    const childLogger = new SecureLogger(this.service, this.version, this.environment);
    
    // Override the log method to include additional context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, message: string, context?: LogContext) => {
      const mergedContext = { ...additionalContext, ...context };
      originalLog(level, message, mergedContext);
    };
    
    return childLogger;
  }

  /**
   * Create a request logger with request context
   */
  static createRequestLogger(
    requestId: string,
    userId?: string,
    sessionId?: string
  ): SecureLogger {
    const logger = new SecureLogger();
    return logger.child({
      requestId,
      userId,
      sessionId
    });
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export utility functions
export function createSecureLogger(
  service: string,
  version: string = '1.0.0',
  environment: string = process.env.NODE_ENV || 'development'
): SecureLogger {
  return new SecureLogger(service, version, environment);
}

export function sanitizeForLogging(data: any): any {
  const tempLogger = new SecureLogger();
  return tempLogger['sanitizeData'](data);
}
