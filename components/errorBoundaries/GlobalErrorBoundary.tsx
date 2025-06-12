// filepath: components/errorBoundaries/GlobalErrorBoundary.tsx
/**
 * Global Error Boundary - Phase 4 Implementation
 *
 * Top-level error boundary that catches all unhandled errors in the application.
 * Provides comprehensive error reporting and user-friendly fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CMSButton } from '@/components/atoms';
import { errorService } from '@/services/ErrorService';

import {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorFallbackProps,
} from './types';

/**
 * Global Error Boundary Class Component
 *
 * Catches all unhandled React component errors and provides a fallback UI.
 * Reports errors to external services and allows for application recovery.
 */
class GlobalErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props;

    // Log error to service with global context
    const errorId = errorService.logError(error, errorInfo, {
      component: 'GlobalErrorBoundary',
      severity: 'critical',
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Update state with error details
    this.setState({
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // Log to console in development
    if (__DEV__) {
      console.group('🚨 Global Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.groupEnd();
    }
  }

  handleRetry = (): void => {
    const { maxRetries = 2, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn('Global error boundary: Maximum retry attempts reached');
      return;
    }

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Increment retry count
    this.setState({
      retryCount: retryCount + 1,
    });

    // Retry after delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }, retryDelay) as unknown as number;
  };

  handleReportError = (): void => {
    const { errorId } = this.state;

    if (errorId) {
      errorService.markErrorResolved(errorId);

      if (__DEV__) {
        alert('Error reported to development team');
      }
    }
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render(): ReactNode {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const {
      children,
      fallback: FallbackComponent,
      enableRetry = true,
      maxRetries = 2,
    } = this.props;

    if (hasError) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        errorId,
        retryCount,
        onRetry: this.handleRetry,
        onReport: this.handleReportError,
        canRetry: enableRetry && retryCount < maxRetries,
        variant: 'fullscreen',
      };

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }

      // Default global error fallback
      return <GlobalErrorFallback {...fallbackProps} />;
    }

    return children;
  }
}

/**
 * Default Global Error Fallback Component
 */
const GlobalErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  retryCount,
  onRetry,
  onReport,
  canRetry,
}) => {
  return (
    <ScrollView
      style={styles.globalErrorContainer}
      contentContainerStyle={styles.globalErrorContent}
    >
      <View style={styles.errorHeader}>
        <Text style={styles.errorIcon}>💥</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>
          We&apos;re sorry, but the application encountered an unexpected error.
          Please try again or contact support if the problem persists.
        </Text>
      </View>

      {__DEV__ && error && (
        <View style={styles.errorDetails}>
          <Text style={styles.errorLabel}>Error ID:</Text>
          <Text style={styles.errorValue}>{errorId}</Text>

          {retryCount > 0 && (
            <>
              <Text style={styles.errorLabel}>Retry Attempts:</Text>
              <Text style={styles.errorValue}>{retryCount}</Text>
            </>
          )}

          <Text style={styles.errorLabel}>Error Message:</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>

          {error.stack && (
            <>
              <Text style={styles.errorLabel}>Stack Trace:</Text>
              <Text style={styles.errorStack}>{error.stack}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.errorActions}>
        {canRetry && (
          <CMSButton
            title={retryCount > 0 ? `Retry (${retryCount + 1})` : 'Try Again'}
            onPress={onRetry}
            variant="primary"
            size="medium"
            style={styles.retryButton}
          />
        )}

        <CMSButton
          title="Report Issue"
          onPress={onReport}
          variant="secondary"
          size="medium"
          style={styles.reportButton}
        />

        <CMSButton
          title="Reload App"
          onPress={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          variant="tertiary"
          size="medium"
          style={styles.reloadButton}
        />
      </View>

      <View style={styles.errorFooter}>
        <Text style={styles.errorFooterText}>
          If this error continues to occur, please contact our support team with
          the error ID above.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  globalErrorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  globalErrorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
  },
  errorHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: '100%',
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  errorValue: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  reportButton: {
    minWidth: 120,
  },
  reloadButton: {
    minWidth: 120,
  },
  errorFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  errorFooterText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default GlobalErrorBoundary;
