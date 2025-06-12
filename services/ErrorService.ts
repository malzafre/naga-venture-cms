// filepath: services/ErrorService.ts
import {
  ErrorLogEntry,
  ErrorReportData,
  ErrorSeverity,
} from '@/components/errorBoundaries/types';
import { ErrorInfo } from 'react';
import { errorReportingService } from './ErrorReporting';

/**
 * Error Service - Phase 4 Implementation
 *
 * Centralized error logging, reporting, and analytics service.
 * Handles error categorization, external reporting, and local storage.
 */

class ErrorService {
  private static instance: ErrorService;
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 100;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Log an error with automatic severity detection
   */
  public logError(
    error: Error,
    errorInfo: ErrorInfo,
    context: Record<string, unknown> = {}
  ): string {
    const errorId = this.generateErrorId();
    const severity = this.determineSeverity(error, errorInfo);

    const logEntry: ErrorLogEntry = {
      id: errorId,
      error,
      errorInfo,
      severity,
      timestamp: Date.now(),
      context: {
        ...context,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      resolved: false,
    };

    this.addToLog(logEntry);
    this.reportToExternalService(logEntry);

    return errorId;
  }
  /**
   * Report error to external monitoring service
   */
  private async reportToExternalService(
    logEntry: ErrorLogEntry
  ): Promise<void> {
    try {
      // Use the new error reporting service
      await errorReportingService.reportError({
        error: logEntry.error,
        context: logEntry.context,
        severity: logEntry.severity,
        user: this.getCurrentUser(),
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
  /**
   * Determine error severity based on error type and context
   */
  private determineSeverity(error: Error, errorInfo: ErrorInfo): ErrorSeverity {
    const errorMessage = error.message.toLowerCase();
    const componentStack = errorInfo.componentStack || '';

    // Critical errors - app-breaking
    if (
      errorMessage.includes('chunk load') ||
      errorMessage.includes('network error') ||
      errorMessage.includes('authentication')
    ) {
      return 'critical';
    }

    // High severity - major feature failure
    if (
      componentStack.includes('ErrorBoundary') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('permission denied')
    ) {
      return 'high';
    }

    // Medium severity - component failure but app continues
    if (
      errorMessage.includes('render') ||
      errorMessage.includes('hook') ||
      errorMessage.includes('state')
    ) {
      return 'medium';
    }

    // Low severity - minor issues
    return 'low';
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorLogEntry[];
    topErrors: { message: string; count: number }[];
  } {
    const errorsBySeverity = this.errorLog.reduce(
      (acc, entry) => {
        acc[entry.severity] = (acc[entry.severity] || 0) + 1;
        return acc;
      },
      {} as Record<ErrorSeverity, number>
    );

    const recentErrors = this.errorLog
      .filter((entry) => Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    const errorCounts = this.errorLog.reduce(
      (acc, entry) => {
        const message = entry.error.message;
        acc[message] = (acc[message] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));

    return {
      totalErrors: this.errorLog.length,
      errorsBySeverity,
      recentErrors,
      topErrors,
    };
  }

  /**
   * Clear resolved errors from log
   */
  public clearResolvedErrors(): void {
    this.errorLog = this.errorLog.filter((entry) => !entry.resolved);
  }

  /**
   * Mark error as resolved
   */
  public markErrorResolved(errorId: string): void {
    const entry = this.errorLog.find((e) => e.id === errorId);
    if (entry) {
      entry.resolved = true;
    }
  }

  /**
   * Add error to local log with size management
   */
  private addToLog(entry: ErrorLogEntry): void {
    this.errorLog.push(entry);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      // Remove oldest resolved errors first, then oldest unresolved
      const resolved = this.errorLog.filter((e) => e.resolved);
      const unresolved = this.errorLog.filter((e) => !e.resolved);

      if (resolved.length > 0) {
        resolved.shift(); // Remove oldest resolved
        this.errorLog = [...resolved, ...unresolved];
      } else {
        this.errorLog.shift(); // Remove oldest overall
      }
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format error data for external service
   */
  private formatForExternal(logEntry: ErrorLogEntry): ErrorReportData {
    return {
      error: logEntry.error,
      errorInfo: logEntry.errorInfo,
      errorId: logEntry.id,
      timestamp: logEntry.timestamp,
      userId: logEntry.context.userId as string,
      sessionId: this.sessionId,
      userAgent: logEntry.context.userAgent as string,
      url: logEntry.context.url as string,
      featureName: logEntry.context.featureName as string,
      additionalContext: logEntry.context,
    };
  }
  /**
   * Get current user information for error reporting
   */
  public getCurrentUser():
    | { id: string; email?: string; role?: string }
    | undefined {
    try {
      // This would integrate with your auth system
      // For now, return undefined or mock data
      const user = {
        id: 'user_' + this.sessionId,
        email: 'user@example.com', // Would come from auth context
        role: 'user', // Would come from auth context
      };
      return user;
    } catch {
      return undefined;
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();
export default errorService;
