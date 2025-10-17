/**
 * Production-Ready Logging Service for Autonomous Agent
 * 
 * This service provides structured logging with different levels,
 * context tracking, and performance optimization for production use.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  executionId?: string;
  sessionId?: string;
  userId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxEntries: number;
  context: string;
  executionId?: string;
  sessionId?: string;
  userId?: string;
}

export class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private contextStack: string[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxEntries: 1000,
      context: 'autonomous-agent',
      ...config
    };
  }

  /**
   * Set execution context
   */
  setContext(executionId?: string, sessionId?: string, userId?: string): void {
    this.config.executionId = executionId;
    this.config.sessionId = sessionId;
    this.config.userId = userId;
  }

  /**
   * Push context for nested operations
   */
  pushContext(context: string): void {
    this.contextStack.push(context);
  }

  /**
   * Pop context
   */
  popContext(): string | undefined {
    return this.contextStack.pop();
  }

  /**
   * Get current context string
   */
  private getCurrentContext(): string {
    const contexts = [this.config.context, ...this.contextStack];
    return contexts.join(' > ');
  }

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context: this.getCurrentContext(),
      metadata,
      executionId: this.config.executionId,
      sessionId: this.config.sessionId,
      userId: this.config.userId
    };
  }

  /**
   * Process log entry
   */
  private processLogEntry(entry: LogEntry): void {
    // Add to entries array
    this.entries.push(entry);

    // Maintain max entries limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // File output (placeholder for future implementation)
    if (this.config.enableFile) {
      this.outputToFile(entry);
    }

    // Remote output (placeholder for future implementation)
    if (this.config.enableRemote) {
      this.outputToRemote(entry);
    }
  }

  /**
   * Output to console with appropriate formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    
    const message = `${timestamp} ${level} ${context} ${entry.message}${metadata}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message);
        break;
    }
  }

  /**
   * Output to file (placeholder)
   */
  private outputToFile(entry: LogEntry): void {
    // TODO: Implement file logging
    // This would write to a log file in production
  }

  /**
   * Output to remote service (placeholder)
   */
  private outputToRemote(entry: LogEntry): void {
    // TODO: Implement remote logging
    // This would send logs to a remote service like DataDog, Splunk, etc.
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.processLogEntry(this.createLogEntry('debug', message, metadata));
    }
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.processLogEntry(this.createLogEntry('info', message, metadata));
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.processLogEntry(this.createLogEntry('warn', message, metadata));
    }
  }

  /**
   * Error level logging
   */
  error(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.processLogEntry(this.createLogEntry('error', message, metadata));
    }
  }

  /**
   * Fatal level logging
   */
  fatal(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('fatal')) {
      this.processLogEntry(this.createLogEntry('fatal', message, metadata));
    }
  }

  /**
   * Get log entries
   */
  getEntries(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.entries;
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }

  /**
   * Get log statistics
   */
  getStats(): {
    totalEntries: number;
    entriesByLevel: Record<LogLevel, number>;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entriesByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };

    this.entries.forEach(entry => {
      entriesByLevel[entry.level]++;
    });

    return {
      totalEntries: this.entries.length,
      entriesByLevel,
      oldestEntry: this.entries.length > 0 ? this.entries[0].timestamp : null,
      newestEntry: this.entries.length > 0 ? this.entries[this.entries.length - 1].timestamp : null
    };
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable console output
   */
  setConsoleOutput(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }
}

// Create singleton instances for different contexts
export const autonomousLogger = new Logger({
  level: 'info',
  context: 'autonomous-agent'
});

export const taskLogger = new Logger({
  level: 'debug',
  context: 'task-executor'
});

export const memoryLogger = new Logger({
  level: 'debug',
  context: 'memory-manager'
});

export const evidenceLogger = new Logger({
  level: 'debug',
  context: 'evidence-verifier'
});

export const safetyLogger = new Logger({
  level: 'warn',
  context: 'safety-manager'
});

export const performanceLogger = new Logger({
  level: 'info',
  context: 'performance-optimizer'
});

export const monitoringLogger = new Logger({
  level: 'info',
  context: 'monitoring-system'
});
