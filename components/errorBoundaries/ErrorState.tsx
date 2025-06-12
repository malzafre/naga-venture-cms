// filepath: components/errorBoundaries/ErrorState.tsx
/**
 * ErrorState Component - Phase 4 Implementation
 *
 * Standardized error state component for consistent error display
 * across the application without using error boundaries.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ErrorStateVariant = 'fullscreen' | 'card' | 'inline' | 'minimal';

export interface ErrorStateProps {
  error?: Error | string | null;
  title?: string;
  message?: string;
  variant?: ErrorStateVariant;
  showRetry?: boolean;
  retryText?: string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  height?: number;
  icon?: string;
  children?: React.ReactNode;
}

/**
 * Standardized Error State Component
 *
 * Use this component for displaying error states in components
 * that need to show errors without using error boundaries.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title,
  message,
  variant = 'card',
  showRetry = true,
  retryText = 'Try Again',
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  height,
  icon = '⚠️',
  children,
}) => {
  // Determine error message
  const errorMessage =
    message ||
    (typeof error === 'string' ? error : error?.message) ||
    'Something went wrong';

  // Determine title
  const errorTitle = title || (variant === 'minimal' ? '' : 'Error');

  const isMaxRetries = retryCount >= maxRetries;
  const showRetryButton = showRetry && onRetry && !isMaxRetries;

  // Get container styles based on variant
  const getContainerStyles = () => {
    const baseStyle = [styles.container];

    switch (variant) {
      case 'fullscreen':
        return [...baseStyle, styles.fullscreenContainer];
      case 'card':
        return [...baseStyle, styles.cardContainer];
      case 'inline':
        return [...baseStyle, styles.inlineContainer];
      case 'minimal':
        return [...baseStyle, styles.minimalContainer];
      default:
        return baseStyle;
    }
  };

  // Get text styles based on variant
  const getTitleStyles = () => {
    const baseStyle = [styles.title];
    if (variant === 'minimal') return [...baseStyle, styles.minimalTitle];
    if (variant === 'fullscreen') return [...baseStyle, styles.fullscreenTitle];
    return baseStyle;
  };

  const getMessageStyles = () => {
    const baseStyle = [styles.message];
    if (variant === 'minimal') return [...baseStyle, styles.minimalMessage];
    if (variant === 'fullscreen')
      return [...baseStyle, styles.fullscreenMessage];
    return baseStyle;
  };

  const getButtonStyles = () => {
    const baseStyle = [styles.retryButton];
    if (variant === 'minimal') return [...baseStyle, styles.minimalRetryButton];
    if (variant === 'fullscreen')
      return [...baseStyle, styles.fullscreenRetryButton];
    return baseStyle;
  };

  const getButtonTextStyles = () => {
    const baseStyle = [styles.retryButtonText];
    if (variant === 'minimal') return [...baseStyle, styles.minimalRetryText];
    if (variant === 'fullscreen')
      return [...baseStyle, styles.fullscreenRetryText];
    return baseStyle;
  };
  return (
    <View
      style={[getContainerStyles(), height ? { height } : undefined].filter(
        Boolean
      )}
    >
      {/* Custom children content */}
      {children}

      {/* Default error content */}
      {!children && (
        <>
          {/* Icon (except for minimal variant) */}
          {variant !== 'minimal' && (
            <Text
              style={[
                styles.icon,
                variant === 'fullscreen' && styles.fullscreenIcon,
              ]}
            >
              {icon}
            </Text>
          )}

          {/* Title */}
          {errorTitle && <Text style={getTitleStyles()}>{errorTitle}</Text>}

          {/* Error Message */}
          <Text style={getMessageStyles()}>
            {__DEV__ && error instanceof Error
              ? `${errorMessage}\n\n${error.stack}`
              : errorMessage}
          </Text>

          {/* Retry Count Info (dev mode only) */}
          {__DEV__ && retryCount > 0 && (
            <Text style={styles.retryInfo}>
              Retry attempt: {retryCount}/{maxRetries}
            </Text>
          )}

          {/* Retry Button */}
          {showRetryButton && (
            <TouchableOpacity style={getButtonStyles()} onPress={onRetry}>
              <Text style={getButtonTextStyles()}>{retryText}</Text>
            </TouchableOpacity>
          )}

          {/* Max Retries Reached */}
          {isMaxRetries && showRetry && (
            <Text style={styles.maxRetriesText}>
              Maximum retry attempts reached
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base container styles
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  // Variant-specific container styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 32,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  inlineContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 80,
  },
  minimalContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    padding: 8,
    minHeight: 40,
  },

  // Icon styles
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  fullscreenIcon: {
    fontSize: 48,
    marginBottom: 24,
  },

  // Title styles
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
    textAlign: 'center',
  },
  fullscreenTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  minimalTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },

  // Message styles
  message: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  fullscreenMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 400,
  },
  minimalMessage: {
    fontSize: 11,
    marginBottom: 8,
  },

  // Retry button styles
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  fullscreenRetryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 16,
  },
  minimalRetryButton: {
    backgroundColor: '#856404',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },

  // Retry button text styles
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  fullscreenRetryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  minimalRetryText: {
    fontSize: 10,
    fontWeight: '400',
  },

  // Additional styles
  retryInfo: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  maxRetriesText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ErrorState;
