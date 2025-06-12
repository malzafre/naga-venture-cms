// filepath: components/errorBoundaries/types.ts
import { ErrorInfo, ReactNode } from 'react';

/**
 * Error Boundary Types - Phase 4 Implementation
 *
 * Type definitions for the error boundary system with comprehensive error handling.
 */

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number | null;
  isRetrying?: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  onRetry?: (retryCount: number) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  isolateErrors?: boolean;
  featureName?: string;
  name?: string;
  isolateProps?: Record<string, unknown>;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  onRetry: () => void;
  onReport: () => void;
  canRetry: boolean;
  featureName?: string;
  variant?: 'inline' | 'fullscreen' | 'minimal' | 'card';
}

export interface ErrorReportData {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  userAgent: string;
  url: string;
  featureName?: string;
  additionalContext?: Record<string, unknown>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLogEntry {
  id: string;
  error: Error;
  errorInfo: ErrorInfo;
  severity: ErrorSeverity;
  timestamp: number;
  context: Record<string, unknown>;
  resolved: boolean;
}
