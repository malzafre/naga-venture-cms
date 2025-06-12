// filepath: components/errorBoundaries/FeatureErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CMSButton } from '@/components/atoms';
import { errorService } from '@/services/ErrorService';

import {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorFallbackProps,
} from './types';

/**
 * Feature Error Boundary - Phase 4 Implementation
 *
 * Feature-specific error boundary that isolates errors within specific app features.
 * Provides targeted error handling and recovery without affecting the entire application.
 */

class FeatureErrorBoundary extends Component<
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
    const { onError, featureName, isolateErrors = true } = this.props;

    // Log error to service with feature context
    const errorId = errorService.logError(error, errorInfo, {
      featureName: featureName || 'unknown-feature',
      component: 'FeatureErrorBoundary',
      retryCount: this.state.retryCount,
      isolated: isolateErrors,
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
      console.group(`🚨 Feature Error Boundary [${featureName}]`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.groupEnd();
    }
  }

  handleRetry = (): void => {
    const { maxRetries = 2, retryDelay = 500 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn(
        `Feature [${this.props.featureName}] maximum retry attempts reached`
      );
      return;
    }

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    } // Increment retry count
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
    }, retryDelay);
  };

  handleReportError = (): void => {
    const { errorId } = this.state;
    const { featureName } = this.props;

    if (errorId) {
      errorService.markErrorResolved(errorId);

      if (__DEV__) {
        alert(`Error in feature "${featureName}" reported to development team`);
      }
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
      featureName = 'Unknown Feature',
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
        featureName,
        variant: 'inline',
      };

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }

      // Default feature error fallback
      return <FeatureErrorFallback {...fallbackProps} />;
    }

    return children;
  }
}

/**
 * Default Feature Error Fallback Component
 */
const FeatureErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  retryCount,
  onRetry,
  onReport,
  canRetry,
  featureName,
}) => {
  return (
    <View style={styles.featureErrorContainer}>
      <View style={styles.featureErrorContent}>
        <Text style={styles.featureErrorIcon}>⚠️</Text>{' '}
        <Text style={styles.featureErrorTitle}>{featureName} Error</Text>
        <Text style={styles.featureErrorMessage}>
          This feature encountered an error and couldn&apos;t load properly.
        </Text>
        {__DEV__ && error && (
          <View style={styles.featureErrorDetails}>
            <Text style={styles.featureErrorLabel}>Error:</Text>
            <Text style={styles.featureErrorValue}>{error.message}</Text>

            <Text style={styles.featureErrorLabel}>ID:</Text>
            <Text style={styles.featureErrorValue}>{errorId}</Text>
          </View>
        )}
        <View style={styles.featureErrorActions}>
          {canRetry && (
            <CMSButton
              title={retryCount > 0 ? `Retry (${retryCount + 1})` : 'Retry'}
              onPress={onRetry}
              variant="primary"
              size="small"
              style={styles.featureRetryButton}
            />
          )}

          <CMSButton
            title="Report"
            onPress={onReport}
            variant="secondary"
            size="small"
            style={styles.featureReportButton}
          />
        </View>
      </View>
    </View>
  );
};

// Styles for Feature Error Boundary
const styles = StyleSheet.create({
  featureErrorContainer: {
    flex: 1,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  featureErrorContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureErrorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureErrorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureErrorMessage: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureErrorDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    width: '100%',
  },
  featureErrorLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 4,
  },
  featureErrorValue: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  featureErrorActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  featureRetryButton: {
    minWidth: 80,
  },
  featureReportButton: {
    minWidth: 80,
  },
});

export default FeatureErrorBoundary;
