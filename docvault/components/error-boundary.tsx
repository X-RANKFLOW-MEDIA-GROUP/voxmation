"use client";

import React, { ReactNode, ReactError } from "react";
import * as Sentry from "@sentry/react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

/**
 * Error Boundary component that catches React errors and sends them to Sentry
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Send error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Capture error ID for user reference
    const eventId = Sentry.lastEventId();
    this.setState({ errorId: eventId || undefined });

    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-card border border-destructive/20 rounded-lg p-8 space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="bg-destructive/10 p-4 rounded-full">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>

              {/* Error Title and Message */}
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">
                  We've been notified about this error and are working to fix it.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-muted/50 rounded-md p-4 space-y-2">
                  <p className="text-xs font-mono text-destructive font-semibold">Error Details:</p>
                  <p className="text-xs font-mono text-muted-foreground break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Error ID for Support */}
              {this.state.errorId && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4">
                  <p className="text-xs text-blue-900 dark:text-blue-200 font-semibold mb-1">
                    Error ID (Reference for support):
                  </p>
                  <p className="text-xs font-mono text-blue-800 dark:text-blue-300 break-all">
                    {this.state.errorId}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={this.resetError}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
