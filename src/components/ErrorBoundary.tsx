'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only catches errors in this subtree
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for graceful error handling
 * Catches errors in child components and displays fallback UI
 *
 * Usage:
 * <ErrorBoundary>
 *   <GamePage />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state so the next render will show the fallback UI
    this.setState({
      error,
      errorInfo,
    });

    // Log error and stack trace to console
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error Info:', errorInfo);

    // Call optional error handler (for Sentry, logging services, etc.)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // This would integrate with Sentry or similar
      // sentryClient.captureException(error, { errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                An unexpected error occurred. Don&apos;t worry, we&apos;re working on it!
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 text-left bg-red-50 dark:bg-red-900 rounded p-4">
                  <p className="text-sm font-mono text-red-900 dark:text-red-100 break-words">
                    <strong>Error:</strong> {this.state.error?.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-red-700 dark:text-red-300 font-semibold">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64 text-red-800 dark:text-red-200">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  className="flex-1"
                >
                  Try again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="secondary"
                  className="flex-1"
                >
                  Go home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper for individual page error boundaries
 * More granular error handling for specific pages
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Page Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page encountered an error. Please try refreshing.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh page
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Wrapper for component error boundaries
 * For smaller error isolation
 */
export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="border border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900">
          <p className="text-red-700 dark:text-red-200 text-sm">
            This component failed to load. Please refresh the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
