// filepath: components/errorBoundaries/ComponentErrorBoundary.tsx
/**
 * Component Error Boundary - Phase 4 Implementation
 *
 * Lightweight error boundary for individual components.
 * Provides inline error recovery without breaking the entire feature.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { errorService } from '../../services/ErrorService';

import {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorFallbackProps,
} from './types';

interface ComponentErrorBoundaryProps extends ErrorBoundaryProps {
  variant?: 'inline' | 'minimal' | 'card';
  height?: number;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
}

interface ComponentErrorBoundaryState extends ErrorBoundaryState {
  isRetrying?: boolean;
}

/**
 * Default fallback component for component-level errors
 */
const DefaultComponentFallback: React.FC<
  ErrorFallbackProps & {
    variant: ComponentErrorBoundaryProps['variant'];
    height?: number;
  }
> = ({ error, onRetry, retryCount = 0, variant = 'inline', height }) => {
  const isMinimal = variant === 'minimal';
  const isCard = variant === 'card';
  const containerStyle = [
    styles.container,
    isMinimal && styles.minimalContainer,
    isCard && styles.cardContainer,
    height ? { height } : undefined,
  ];

  return (
    <View style={containerStyle}>
      {!isMinimal && (
        <>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {__DEV__ && error ? error.message : 'Unable to load this component'}
          </Text>
        </>
      )}

      {isMinimal && (
        <Text style={styles.minimalText}>Error loading content</Text>
      )}

      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>
            {retryCount > 0 ? `Retry (${retryCount + 1})` : 'Retry'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

class ComponentErrorBoundary extends Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  private retryTimeouts: number[] = [];

  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ComponentErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, name } = this.props;

    // Log error with component context
    const errorId = errorService.logError(error, errorInfo, {
      componentName: name || 'UnknownComponent',
      component: 'ComponentErrorBoundary',
      retryCount: this.state.retryCount,
    });

    this.setState({
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    if (__DEV__) {
      console.group(`🔴 Component Error Boundary [${name}]`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.groupEnd();
    }
  }

  handleRetry = (): void => {
    const { maxRetries = 3, retryDelay = 300, onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn(
        `Component [${this.props.name}] maximum retry attempts reached`
      );
      return;
    }

    this.setState({ isRetrying: true });

    const timeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: retryCount + 1,
        isRetrying: false,
      });
    }, retryDelay) as unknown as number;

    this.retryTimeouts.push(timeout);

    // Call onRetry callback if provided
    if (onRetry) {
      onRetry(retryCount + 1);
    }
  };

  handleReport = (): void => {
    const { errorId } = this.state;
    if (errorId) {
      errorService.markErrorResolved(errorId);
    }
  };

  componentWillUnmount(): void {
    // Clear all retry timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  render(): ReactNode {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const {
      children,
      fallback: FallbackComponent,
      variant = 'inline',
      height,
      enableRetry = true,
      maxRetries = 3,
    } = this.props;

    if (hasError) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        errorId,
        retryCount,
        onRetry: this.handleRetry,
        onReport: this.handleReport,
        canRetry: enableRetry && retryCount < maxRetries,
        variant,
      };

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }

      // Use default fallback with proper props
      return (
        <DefaultComponentFallback
          {...fallbackProps}
          variant={variant}
          height={height}
        />
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  minimalContainer: {
    minHeight: 40,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d63031',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 12,
  },
  minimalText: {
    fontSize: 12,
    color: '#e17055',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#74b9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ComponentErrorBoundary;
