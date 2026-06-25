import * as Sentry from "@sentry/nextjs";

export function initSentryClient() {
  if (typeof window === "undefined") return;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV !== "production",
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(error: Error | string, context?: Record<string, any>) {
  if (typeof error === "string") {
    Sentry.captureMessage(error);
  } else {
    Sentry.captureException(error);
  }

  if (context) {
    Sentry.setContext("custom", context);
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
