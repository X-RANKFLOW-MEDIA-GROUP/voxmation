import { useCallback } from "react";
import { captureException, captureMessage } from "@/sentry.client.config";

/**
 * Custom hook for handling errors with Sentry integration
 */
export function useErrorHandler() {
  const handleError = useCallback(
    (error: Error | string, context?: Record<string, any>) => {
      console.error("Error captured:", error);

      if (typeof error === "string") {
        captureMessage(error, "error");
      } else {
        captureException(error, context);
      }
    },
    []
  );

  const handleAsyncError = useCallback(
    async <T,>(promise: Promise<T>, errorMessage?: string): Promise<T | null> => {
      try {
        return await promise;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        handleError(errorMessage || err.message, {
          originalError: err.message,
        });
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}
