/**
 * Centralized Logging and Error Management System
 * Provides structured logging for development and production
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  /**
   * Log debug information (development only)
   */
  debug(message: string, data?: any, context?: string): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context, data);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, context, data);
    console.warn(`⚠️ [${context || 'APP'}] ${message}`, data || '');
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data, error);
    console.error(`❌ [${context || 'APP'}] ${message}`, error || '', data || '');
    
    // Store error in localStorage for debugging
    this.storeError({ message, error, context, data });
  }

  /**
   * Log critical errors that require immediate attention
   */
  critical(message: string, error?: Error, context?: string, data?: any): void {
    this.log(LogLevel.CRITICAL, message, context, data, error);
    console.error(`🔥 [CRITICAL] [${context || 'APP'}] ${message}`, error || '', data || '');
    
    // Store critical error
    this.storeError({ message, error, context, data, critical: true });
    
    // In production, you could send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorTracking({ message, error, context, data });
    }
  }

  /**
   * Internal logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const emoji = this.getLogEmoji(level);
      const contextStr = context ? `[${context}]` : '';
      console.log(`${emoji} ${contextStr} ${message}`, data || '');
    }
  }

  /**
   * Get emoji for log level
   */
  private getLogEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🐛';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      case LogLevel.CRITICAL: return '🔥';
      default: return '📝';
    }
  }

  /**
   * Store error in localStorage for debugging
   */
  private storeError(errorData: any): void {
    if (typeof window === 'undefined') return;

    try {
      const errors = JSON.parse(localStorage.getItem('khazaana_errors') || '[]');
      errors.unshift({
        ...errorData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      // Keep only last 20 errors
      const trimmedErrors = errors.slice(0, 20);
      localStorage.setItem('khazaana_errors', JSON.stringify(trimmedErrors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  /**
   * Send to error tracking service (placeholder)
   */
  private sendToErrorTracking(errorData: any): void {
    // TODO: Integrate with Sentry, LogRocket, or similar service
    console.log('Would send to error tracking:', errorData);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get stored errors from localStorage
   */
  getStoredErrors(): any[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('khazaana_errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('khazaana_errors');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Error boundary wrapper for async functions
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logger.error(
      `Error in ${context}`,
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    return fallback;
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
    logger.debug(`Performance: Started ${label}`, undefined, 'PERF');
  }

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      logger.warn(`Performance: No start mark for ${label}`, undefined, 'PERF');
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '✅';
    logger.debug(
      `Performance: ${emoji} ${label} took ${duration.toFixed(2)}ms`,
      { duration },
      'PERF'
    );

    return duration;
  }
}

export const perfMonitor = new PerformanceMonitor();
