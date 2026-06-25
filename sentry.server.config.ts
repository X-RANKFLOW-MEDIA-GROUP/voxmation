import * as Sentry from "@sentry/nextjs";

export function initSentryServer() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV !== "production",
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
  });
}

/**
 * Capture server-side exception
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
