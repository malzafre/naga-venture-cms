// filepath: components/errorBoundaries/index.ts
/**
 * Error Boundary Components - Phase 4 Implementation
 *
 * Comprehensive error handling system for production-grade error recovery.
 * Implements hierarchical error boundaries with logging and user-friendly fallbacks.
 */

export { default as ComponentErrorBoundary } from './ComponentErrorBoundary';
export { ErrorState, default as ErrorStateComponent } from './ErrorState';
export { default as FeatureErrorBoundary } from './FeatureErrorBoundary';
export { default as GlobalErrorBoundary } from './GlobalErrorBoundary';

// Re-export types for convenience
export type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorFallbackProps,
} from './types';

export type { ErrorStateProps, ErrorStateVariant } from './ErrorState';
