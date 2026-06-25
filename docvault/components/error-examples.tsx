"use client";

import { useErrorHandler } from "@/lib/use-error-handler";
import { captureException, setUserContext, clearUserContext } from "@/sentry.client.config";
import { Button } from "@/components/ui/button";
import { AlertCircle, Code2, RotateCcw } from "lucide-react";
import { useState } from "react";

/**
 * Example component demonstrating various error handling scenarios
 *
 * This component shows:
 * 1. Catching synchronous errors
 * 2. Catching async/promise errors
 * 3. Capturing messages
 * 4. Setting user context
 * 5. Throwing errors to error boundary
 */
export function ErrorExamples() {
  const { handleError, handleAsyncError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{ id: string; email: string } | null>(null);

  // Example 1: Sync error - caught and sent to Sentry
  const handleSyncError = () => {
    try {
      throw new Error("This is a synchronous error caught by try-catch");
    } catch (error) {
      handleError(error instanceof Error ? error : "Unknown error", {
        type: "synchronous",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Example 2: Async error - caught and sent to Sentry
  const handleAsyncErrorExample = async () => {
    setIsLoading(true);
    const result = await handleAsyncError(
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Async operation failed")), 1000);
      }),
      "Failed to perform async operation"
    );
    setIsLoading(false);

    if (!result) {
      console.log("Error was handled by Sentry");
    }
  };

  // Example 3: Set user context for better error tracking
  const handleSetUserContext = () => {
    const mockUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email: "user@example.com",
    };
    setUserData(mockUser);
    setUserContext(mockUser.id, mockUser.email, "demo-user");
    console.log("User context set in Sentry");
  };

  // Example 4: Clear user context
  const handleClearUserContext = () => {
    setUserData(null);
    clearUserContext();
    console.log("User context cleared from Sentry");
  };

  // Example 5: Throw unhandled error (caught by Error Boundary)
  const handleThrowError = () => {
    throw new Error("This error will be caught by the Error Boundary component");
  };

  // Example 6: API error simulation
  const handleAPIError = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/test-error");
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : "Unknown API error", {
        type: "api",
        endpoint: "/api/test-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6" />
          Sentry Error Handling Examples
        </h2>
        <p className="text-muted-foreground">
          Click buttons below to trigger different types of errors and see them tracked in Sentry
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-100">Set Your SENTRY_DSN</p>
          <p className="text-blue-800 dark:text-blue-200">
            Add your Sentry DSN to the .env.local file to enable error tracking
          </p>
        </div>
      </div>

      {/* User Context Status */}
      {userData && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-900 dark:text-green-100">
            User Context Active: {userData.email}
          </p>
        </div>
      )}

      {/* Error Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync Error */}
        <button
          onClick={handleSyncError}
          className="p-4 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors text-left space-y-2"
        >
          <p className="font-semibold text-amber-900 dark:text-amber-100">1. Sync Error</p>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Throws and catches a synchronous error
          </p>
        </button>

        {/* Async Error */}
        <button
          onClick={handleAsyncErrorExample}
          disabled={isLoading}
          className="p-4 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors text-left space-y-2 disabled:opacity-50"
        >
          <p className="font-semibold text-purple-900 dark:text-purple-100">2. Async Error</p>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Rejects a promise and captures the error
          </p>
        </button>

        {/* Set User Context */}
        <button
          onClick={handleSetUserContext}
          className="p-4 rounded-lg border-2 border-dashed border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 transition-colors text-left space-y-2"
        >
          <p className="font-semibold text-green-900 dark:text-green-100">3. Set User Context</p>
          <p className="text-sm text-green-800 dark:text-green-200">
            Associate errors with a user ID in Sentry
          </p>
        </button>

        {/* Clear User Context */}
        <button
          onClick={handleClearUserContext}
          disabled={!userData}
          className="p-4 rounded-lg border-2 border-dashed border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-left space-y-2 disabled:opacity-50"
        >
          <p className="font-semibold text-red-900 dark:text-red-100">4. Clear User Context</p>
          <p className="text-sm text-red-800 dark:text-red-200">
            Remove user information from error tracking
          </p>
        </button>

        {/* Error Boundary */}
        <button
          onClick={handleThrowError}
          className="p-4 rounded-lg border-2 border-dashed border-rose-300 dark:border-rose-600 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors text-left space-y-2"
        >
          <p className="font-semibold text-rose-900 dark:text-rose-100">5. Error Boundary</p>
          <p className="text-sm text-rose-800 dark:text-rose-200">
            Throws unhandled error (caught by Error Boundary)
          </p>
        </button>

        {/* API Error */}
        <button
          onClick={handleAPIError}
          disabled={isLoading}
          className="p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-left space-y-2 disabled:opacity-50"
        >
          <p className="font-semibold text-blue-900 dark:text-blue-100">6. API Error</p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Calls an API endpoint that triggers an error
          </p>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
        <p className="font-semibold text-sm">How to view errors in Sentry:</p>
        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
          <li>Go to https://sentry.io</li>
          <li>Sign in to your account</li>
          <li>Select your project</li>
          <li>Navigate to "Issues" to see all errors</li>
          <li>Click on an issue to see full details, stack traces, and user context</li>
          <li>Set alerts and integrations in Project Settings</li>
        </ol>
      </div>
    </div>
  );
}
