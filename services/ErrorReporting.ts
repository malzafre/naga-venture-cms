// filepath: services/ErrorReporting.ts
/**
 * Error Reporting Service - Phase 4 Implementation
 *
 * Integration with external error reporting services for production monitoring.
 * Supports multiple providers and graceful fallbacks.
 */

interface ErrorReportData {
  error: Error;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  timestamp: string;
  sessionId: string;
  appVersion?: string;
  platform?: string;
}

interface ErrorReportingProvider {
  name: string;
  isEnabled: boolean;
  reportError: (data: ErrorReportData) => Promise<void>;
}

/**
 * Sentry Error Reporting Provider
 */
class SentryProvider implements ErrorReportingProvider {
  name = 'Sentry';
  isEnabled = false; // Will be enabled when Sentry is configured

  async reportError(data: ErrorReportData): Promise<void> {
    try {
      // Example Sentry integration (would require @sentry/react-native)
      console.log('[Sentry] Would report error:', {
        error: data.error.message,
        context: data.context,
        severity: data.severity,
        user: data.user,
      });

      // In a real implementation:
      // Sentry.withScope(scope => {
      //   scope.setTag('severity', data.severity);
      //   scope.setContext('errorContext', data.context);
      //   if (data.user) {
      //     scope.setUser(data.user);
      //   }
      //   Sentry.captureException(data.error);
      // });
    } catch (reportError) {
      console.error('[Sentry] Failed to report error:', reportError);
    }
  }
}

/**
 * Custom API Error Reporting Provider
 */
class CustomAPIProvider implements ErrorReportingProvider {
  name = 'CustomAPI';
  isEnabled = true; // Can be enabled immediately

  async reportError(data: ErrorReportData): Promise<void> {
    try {
      // Report to custom backend endpoint
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.error.message,
          stack: data.error.stack,
          context: data.context,
          severity: data.severity,
          user: data.user,
          timestamp: data.timestamp,
          sessionId: data.sessionId,
          appVersion: data.appVersion,
          platform: data.platform,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to report error: ${response.statusText}`);
      }

      console.log('[CustomAPI] Error reported successfully');
    } catch (reportError) {
      console.error('[CustomAPI] Failed to report error:', reportError);

      // Fallback to local storage for later retry
      this.storeErrorForRetry(data);
    }
  }

  private storeErrorForRetry(data: ErrorReportData): void {
    try {
      const stored = localStorage.getItem('pendingErrorReports') || '[]';
      const pendingReports = JSON.parse(stored);

      pendingReports.push({
        ...data,
        error: {
          message: data.error.message,
          stack: data.error.stack,
          name: data.error.name,
        },
        retryCount: 0,
      });

      // Keep only last 50 pending reports
      if (pendingReports.length > 50) {
        pendingReports.splice(0, pendingReports.length - 50);
      }

      localStorage.setItem(
        'pendingErrorReports',
        JSON.stringify(pendingReports)
      );
    } catch (storageError) {
      console.error(
        '[CustomAPI] Failed to store error for retry:',
        storageError
      );
    }
  }
}

/**
 * Console Error Reporting Provider (for development)
 */
class ConsoleProvider implements ErrorReportingProvider {
  name = 'Console';
  isEnabled = __DEV__; // Only enabled in development

  async reportError(data: ErrorReportData): Promise<void> {
    const logLevel = this.getLogLevel(data.severity);

    console.group(
      `🚨 [${this.name}] Error Report - ${data.severity.toUpperCase()}`
    );
    console[logLevel]('Error:', data.error);
    console.log('Context:', data.context);
    console.log('User:', data.user);
    console.log('Session:', data.sessionId);
    console.log('Timestamp:', data.timestamp);
    if (data.error.stack) {
      console.log('Stack:', data.error.stack);
    }
    console.groupEnd();
  }

  private getLogLevel(
    severity: ErrorReportData['severity']
  ): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low':
        return 'log';
      case 'medium':
        return 'warn';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'log';
    }
  }
}

/**
 * Main Error Reporting Service
 */
export class ErrorReportingService {
  private providers: ErrorReportingProvider[] = [];
  private sessionId: string;
  private appVersion: string;
  private platform: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.appVersion = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';
    this.platform = 'react-native';

    // Initialize providers
    this.providers = [
      new ConsoleProvider(),
      new SentryProvider(),
      new CustomAPIProvider(),
    ];

    // Retry pending error reports on initialization
    this.retryPendingReports();
  }

  /**
   * Report an error to all enabled providers
   */
  async reportError(
    data: Omit<
      ErrorReportData,
      'timestamp' | 'sessionId' | 'appVersion' | 'platform'
    >
  ): Promise<void> {
    const fullData: ErrorReportData = {
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      appVersion: this.appVersion,
      platform: this.platform,
    };

    // Report to all enabled providers in parallel
    const reportPromises = this.providers
      .filter((provider) => provider.isEnabled)
      .map((provider) => this.safeReport(provider, fullData));

    await Promise.allSettled(reportPromises);
  }

  /**
   * Safely report to a provider with error handling
   */
  private async safeReport(
    provider: ErrorReportingProvider,
    data: ErrorReportData
  ): Promise<void> {
    try {
      await provider.reportError(data);
    } catch (error) {
      console.error(`[${provider.name}] Error reporting failed:`, error);
    }
  }

  /**
   * Add or update a reporting provider
   */
  addProvider(provider: ErrorReportingProvider): void {
    const existingIndex = this.providers.findIndex(
      (p) => p.name === provider.name
    );

    if (existingIndex >= 0) {
      this.providers[existingIndex] = provider;
    } else {
      this.providers.push(provider);
    }
  }

  /**
   * Enable or disable a provider
   */
  setProviderEnabled(providerName: string, enabled: boolean): void {
    const provider = this.providers.find((p) => p.name === providerName);
    if (provider) {
      provider.isEnabled = enabled;
    }
  }

  /**
   * Get list of available providers
   */
  getProviders(): { name: string; isEnabled: boolean }[] {
    return this.providers.map((provider) => ({
      name: provider.name,
      isEnabled: provider.isEnabled,
    }));
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Retry pending error reports
   */
  private async retryPendingReports(): Promise<void> {
    try {
      const stored = localStorage.getItem('pendingErrorReports');
      if (!stored) return;

      const pendingReports = JSON.parse(stored);
      const successfullyReported: number[] = [];

      for (let i = 0; i < pendingReports.length; i++) {
        const report = pendingReports[i];

        // Skip if too many retries
        if (report.retryCount >= 3) {
          successfullyReported.push(i);
          continue;
        }

        try {
          // Reconstruct error object
          const error = new Error(report.error.message);
          error.stack = report.error.stack;
          error.name = report.error.name;

          await this.reportError({
            error,
            context: { ...report.context, retryAttempt: report.retryCount + 1 },
            severity: report.severity,
            user: report.user,
          });

          successfullyReported.push(i);
        } catch (retryError) {
          // Increment retry count
          pendingReports[i].retryCount = (report.retryCount || 0) + 1;
        }
      }

      // Remove successfully reported or max retry reached items
      const remainingReports = pendingReports.filter(
        (_: any, index: number) => !successfullyReported.includes(index)
      );

      localStorage.setItem(
        'pendingErrorReports',
        JSON.stringify(remainingReports)
      );
    } catch (error) {
      console.error('[ErrorReporting] Failed to retry pending reports:', error);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    sessionId: string;
    appVersion: string;
    platform: string;
    providersCount: number;
    enabledProvidersCount: number;
  } {
    return {
      sessionId: this.sessionId,
      appVersion: this.appVersion,
      platform: this.platform,
      providersCount: this.providers.length,
      enabledProvidersCount: this.providers.filter((p) => p.isEnabled).length,
    };
  }
}

// Singleton instance
export const errorReportingService = new ErrorReportingService();

export default errorReportingService;
