# Sentry Configuration Guide

Detailed configuration options and advanced setup.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Server Configuration](#server-configuration)
3. [Client Configuration](#client-configuration)
4. [Advanced Options](#advanced-options)
5. [Integration Settings](#integration-settings)

## Environment Variables

### Required Variables

```env
# Server-side tracking (Express.js API)
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Client-side tracking (Next.js/React)
# Safe to expose - this is a public key
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### Optional Variables

```env
# Execution environment
NODE_ENV=development  # or 'production'

# Debug mode (logs Sentry activity)
SENTRY_DEBUG=true

# Enable/disable error tracking
SENTRY_ENABLED=true

# Sample rate for transactions (0.0 - 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1

# Session replay sample rate (0.0 - 1.0)
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0

# Release version (for release tracking)
SENTRY_RELEASE=1.0.0
```

## Server Configuration

**File:** `sentry.server.config.ts`

### Basic Setup

```typescript
import * as Sentry from "@sentry/node";

export function initSentryServer() {
  Sentry.init({
    // DSN - where to send errors
    dsn: process.env.SENTRY_DSN,

    // Environment for filtering in Sentry
    environment: process.env.NODE_ENV || "development",

    // Sample 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable console logs for debugging
    debug: process.env.NODE_ENV !== "production",

    // Enable specific integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],

    // Release version for issue tracking
    release: process.env.SENTRY_RELEASE,
  });
}
```

### Advanced Server Options

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Ignore certain errors
  ignoreErrors: [
    "Non-Error promise rejection detected",
    "NetworkError",
    "TimeoutError",
  ],

  // Filter what gets sent
  beforeSend(event, hint) {
    // Don't send 404 errors
    if (event.request?.url?.includes("404")) {
      return null;
    }
    return event;
  },

  // Attach breadcrumbs for context
  maxBreadcrumbs: 50,

  // Capture unhandled promise rejections
  attachStacktrace: true,

  // Include server version info
  serverName: process.env.HOSTNAME,

  // Set tags for organization
  tags: {
    service: "api-server",
    region: "us-east-1",
  },
});
```

## Client Configuration

**File:** `sentry.client.config.ts`

### Basic Setup

```typescript
import * as Sentry from "@sentry/nextjs";

export function initSentryClient() {
  if (typeof window === "undefined") return;

  Sentry.init({
    // DSN - public key is safe here
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment filtering
    environment: process.env.NODE_ENV || "development",

    // Sample transactions
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Debug logging
    debug: process.env.NODE_ENV !== "production",

    // Session replay
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Record 10% of sessions + 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### Advanced Client Options

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ignore certain errors (console errors, network timeouts)
  ignoreErrors: [
    "Non-Error promise rejection detected",
    "Network request failed",
    "ResizeObserver loop limit exceeded",
  ],

  // Filter before sending
  beforeSend(event, hint) {
    // Don't send localhost errors to production Sentry
    if (window.location.hostname === "localhost") {
      return null;
    }
    return event;
  },

  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb, hint) {
    // Don't record console.log calls
    if (breadcrumb.category === "console") {
      return null;
    }
    return breadcrumb;
  },

  // Session replay options
  integrations: [
    Sentry.replayIntegration({
      // Mask all user input
      maskAllText: true,
      // Block all media playback
      blockAllMedia: true,
      // Mask canvas elements
      maskAllInputs: true,
    }),
  ],

  // Performance monitoring
  maxBreadcrumbs: 100,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE,

  // Custom tags
  tags: {
    app: "docvault",
    version: "1.0.0",
  },
});
```

## Advanced Options

### 1. Custom Error Filtering

Only send errors you care about:

```typescript
Sentry.init({
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Skip test errors
    if (error?.message?.includes("test")) {
      return null;
    }

    // Skip 404s
    if (event.status === 404) {
      return null;
    }

    // Add custom context
    if (error instanceof NetworkError) {
      event.tags = event.tags || {};
      event.tags.error_type = "network";
    }

    return event;
  },
});
```

### 2. Performance Monitoring

Track slow operations:

```typescript
// In a function you want to monitor
const transaction = Sentry.startTransaction({
  op: "database.query",
  name: "Fetch User Data",
});

try {
  const data = await fetchData();
  transaction.finish();
} catch (error) {
  transaction.finish("error");
  throw error;
}
```

### 3. User Identification

Better correlate errors with users:

```typescript
import { setUserContext } from "@/sentry.client.config";

// After login
const user = await login(credentials);
setUserContext(user.id, user.email, user.username);

// After logout
logout();
clearUserContext();
```

### 4. Custom Context

Add arbitrary data to errors:

```typescript
Sentry.setContext("user_session", {
  sessionId: "abc123",
  tier: "premium",
  lastAction: "payment_processing",
});

Sentry.setTag("payment_method", "credit_card");
Sentry.setTag("country", "US");
```

### 5. Custom Integrations

```typescript
const customIntegration = {
  name: "CustomIntegration",
  setupOnce() {
    Sentry.addBreadcrumb({
      message: "Custom event",
      level: "info",
    });
  },
};

Sentry.init({
  integrations: [customIntegration],
});
```

## Integration Settings

### Express.js Integration

```typescript
import { expressIntegration } from "@sentry/node";

// Captures request metadata
Sentry.init({
  integrations: [
    expressIntegration({
      // Track request performance
      request: true,
      // Include response status
      response: true,
    }),
  ],
});
```

### HTTP Integration

```typescript
import { httpIntegration } from "@sentry/node";

Sentry.init({
  integrations: [
    httpIntegration({
      // Track outgoing HTTP requests
      request: true,
      // Include response data
      response: true,
    }),
  ],
});
```

### Session Replay

```typescript
import { replayIntegration } from "@sentry/nextjs";

Sentry.init({
  integrations: [
    replayIntegration({
      // Mask all text input
      maskAllText: true,

      // Block media playback
      blockAllMedia: true,

      // Mask form inputs
      maskAllInputs: true,

      // Custom masking rules
      maskFn: (text) => {
        if (text.includes("secret")) {
          return "***";
        }
        return text;
      },
    }),
  ],

  // Session sampling
  replaysSessionSampleRate: 0.1,    // 10% of sessions
  replaysOnErrorSampleRate: 1.0,    // 100% of errored sessions
});
```

## Environment-Specific Configuration

### Development

```typescript
// sentry.client.config.ts (development)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: "development",
  
  // Sample 100% in development
  tracesSampleRate: 1.0,
  
  // Log everything
  debug: true,
  
  // Capture all replays
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});
```

### Staging

```typescript
// sentry.client.config.ts (staging)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: "staging",
  
  // Sample 50%
  tracesSampleRate: 0.5,
  
  // Less aggressive replay
  replaysSessionSampleRate: 0.5,
});
```

### Production

```typescript
// sentry.client.config.ts (production)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: "production",
  
  // Sample 10%
  tracesSampleRate: 0.1,
  
  // Minimal replays
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,  // But 100% on errors
  
  // Disable debug
  debug: false,
});
```

## Rate Limiting

Control data usage:

```typescript
Sentry.init({
  // Sample 10% of transactions
  tracesSampleRate: 0.1,

  // Sample 1% of sessions
  replaysSessionSampleRate: 0.01,

  // Sample 50% of errored sessions
  replaysOnErrorSampleRate: 0.5,

  // Ignore common errors
  ignoreErrors: [
    "NetworkError",
    "TimeoutError",
    "ResizeObserver loop limit exceeded",
  ],

  // Filter in beforeSend
  beforeSend(event) {
    // Don't send low-priority errors
    if (event.level === "debug") {
      return null;
    }
    return event;
  },
});
```

## Debugging

Enable debug mode to see Sentry operations:

```typescript
Sentry.init({
  debug: true,  // Logs to console

  // Verbose SDK initialization
  integrations: (integrations) => {
    console.log("Sentry integrations:", integrations);
    return integrations;
  },
});
```

Check browser console for logs like:
```
[Sentry SDK] Initializing SDK with url https://xxx.ingest.sentry.io
[Sentry SDK] Event captured: EventId
[Sentry SDK] Transport sending event
```

## Testing Configuration

Create a test configuration:

```typescript
if (process.env.NODE_ENV === "test") {
  Sentry.init({
    dsn: undefined,  // Disable in tests
    integrations: [],
    beforeSend() {
      return null;  // Don't send anything
    },
  });
}
```

## Troubleshooting Configuration

### Not Capturing Errors

1. Check DSN is correct
2. Enable debug mode: `debug: true`
3. Check browser console for errors
4. Verify DNS isn't being filtered

### Too Much Data

1. Reduce `tracesSampleRate`
2. Disable session replay
3. Add `beforeSend` filter
4. Add `ignoreErrors`

### Source Maps Not Working

1. Build with source maps enabled
2. Upload source maps to Sentry
3. Check paths in `uploadSourceMaps` configuration

## Additional Resources

- [Sentry SDK Configuration](https://docs.sentry.io/platforms/javascript/configuration/)
- [Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
