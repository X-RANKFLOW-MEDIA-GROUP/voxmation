# Sentry Integration Guide

This guide explains how Sentry is integrated into the application for error tracking and monitoring.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Setup](#setup)
4. [Architecture](#architecture)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [Error Boundary](#error-boundary)
8. [Viewing Errors in Sentry](#viewing-errors-in-sentry)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Overview

Sentry is an error tracking and performance monitoring platform that captures exceptions and sends them to a centralized dashboard. This integration includes:

- **Server-side tracking** (Express.js API)
- **Client-side tracking** (Next.js & React)
- **Error boundaries** for React components
- **User context tracking** for better error correlation
- **Performance monitoring** with sampling
- **Session replay** for understanding user sessions when errors occur

## Installation

Sentry packages have been installed:

```bash
npm install @sentry/node @sentry/nextjs @sentry/react
```

## Setup

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in to your account
3. Create a new project (or use an existing one)
4. Select the appropriate platform when creating a project

### 2. Get Your DSN

1. In your Sentry project settings, go to "Client Keys (DSN)"
2. Copy your DSN (Data Source Name)
3. Format: `https://key@projectid.ingest.sentry.io/projectid`

### 3. Configure Environment Variables

Create or update your `.env.local` file:

```env
# Server-side DSN (for Express.js)
SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/your-project-id

# Client-side DSN (for Next.js/React)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/your-project-id

# Optional: Set environment
NODE_ENV=development
```

**Note:** The `NEXT_PUBLIC_` prefix makes it safe to use on the client side.

## Architecture

### Server-Side (Express.js)

**File:** `server/index.ts`

```typescript
import * as Sentry from "@sentry/node";

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});

// Add request handler early
app.use(Sentry.Handlers.requestHandler());

// Add error handler after all routes
app.use(Sentry.Handlers.errorHandler());
```

### Client-Side (Next.js/React)

**Files:**
- `sentry.client.config.ts` - Client-side configuration and utilities
- `docvault/components/error-boundary.tsx` - React Error Boundary
- `docvault/lib/use-error-handler.ts` - Custom error handling hook

**Initialization in `docvault/app/providers.tsx`:**

```typescript
useEffect(() => {
  initSentryClient()
}, [])
```

## Configuration

### Sentry Configuration Options

#### Server-side (`sentry.server.config.ts`)

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Sample 10% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV !== "production",
  
  // Integrate with Express.js and HTTP requests
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
});
```

#### Client-side (`sentry.client.config.ts`)

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Sample transactions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session replay integration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Replay all sessions in development, only on errors in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Customization

You can modify sampling rates and settings in the config files. For example:

```typescript
// Sample 50% of transactions in production
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 1.0,

// Disable session replay
integrations: [
  Sentry.replayIntegration({
    maskAllText: true,
    blockAllMedia: true,
  }),
],
replaysSessionSampleRate: 0, // Disabled
```

## Usage Examples

### 1. Catching Synchronous Errors

```typescript
import { useErrorHandler } from "@/lib/use-error-handler";

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleClick = () => {
    try {
      // Some operation that throws
      throw new Error("Something went wrong");
    } catch (error) {
      handleError(error instanceof Error ? error : "Unknown error", {
        action: "user_click",
        context: "button_press",
      });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 2. Catching Async Errors

```typescript
const { handleAsyncError } = useErrorHandler();

async function fetchData() {
  const result = await handleAsyncError(
    fetch("/api/data").then(r => r.json()),
    "Failed to fetch data"
  );

  if (!result) {
    console.log("Error was handled by Sentry");
  }
  return result;
}
```

### 3. Capturing Messages

```typescript
import { captureMessage } from "@/sentry.client.config";

captureMessage("User performed important action", "info");
captureMessage("Warning: Resource is low", "warning");
captureMessage("Critical error occurred", "error");
```

### 4. Setting User Context

```typescript
import { setUserContext, clearUserContext } from "@/sentry.client.config";

// After user login
function handleLogin(user) {
  setUserContext(user.id, user.email, user.username);
}

// After user logout
function handleLogout() {
  clearUserContext();
}
```

### 5. Setting Custom Context

```typescript
import * as Sentry from "@sentry/react";

// Set custom context for better error tracking
Sentry.setContext("user_session", {
  sessionId: "abc123",
  tier: "premium",
});

// Or use the helper
import { captureException } from "@/sentry.client.config";

captureException(new Error("Custom error"), {
  userId: user.id,
  action: "payment_processing",
  amount: 99.99,
});
```

### 6. Error Boundary for React Components

The Error Boundary is already set up in `docvault/app/layout.tsx` and wraps the entire app.

```typescript
import ErrorBoundary from "@/components/error-boundary";

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## Error Boundary

### Features

The custom Error Boundary component (`docvault/components/error-boundary.tsx`) includes:

- **Catches React component errors** before they crash the app
- **Sends to Sentry** with full component stack traces
- **User-friendly UI** with error recovery options
- **Error ID display** for support reference
- **Development-only details** showing error messages and stack traces
- **Recovery buttons** to retry or go home

### How It Works

When a component throws an error:

1. The Error Boundary catches it
2. Automatically sends to Sentry with stack trace
3. Shows user-friendly error page
4. Generates Error ID for support reference
5. User can click "Try Again" to recover

### Example Error Page

```
[Error Icon]

Something went wrong

We've been notified about this error and are working to fix it.

[Error ID for Support]: abc123def456

[Try Again] [Go Home]
```

## Viewing Errors in Sentry

### 1. Dashboard Overview

1. Log in to [sentry.io](https://sentry.io)
2. Select your organization and project
3. You'll see the **Issues** dashboard

### 2. Issues List

The Issues page shows:

- **Error title** and count
- **Status** (unresolved, ignored, resolved)
- **Last seen** timestamp
- **Users affected** count
- **Event count** over time

### 3. Viewing Issue Details

Click on any issue to see:

- **Stack trace** with file names and line numbers
- **Breadcrumbs** showing what happened before the error
- **Context** (user, tags, extra data)
- **Sessions** affected
- **Comments** and team collaboration

### 4. Stack Trace Example

```
TypeError: Cannot read property 'email' of undefined

  at processUser (app.js:45)
  at Object.<anonymous> (app.js:23)
  at Module._load (internal/modules/commonjs/loader.js:560)
```

Click on any line to jump to the source code viewer.

### 5. Filtering and Searching

Filter issues by:

- **Status** (Unresolved, Resolved, Ignored)
- **Environment** (production, development)
- **User** (who experienced the error)
- **Time range** (last 24 hours, week, month)
- **Tags** (custom attributes)

### 6. Performance Monitoring

View performance data:

1. Go to **Performance** tab
2. See transaction throughput
3. Find slow operations
4. Track error rates over time

### 7. Alerts and Notifications

Set up alerts in **Alerts** section:

- Alert when new error occurs
- Alert when error frequency increases
- Slack, PagerDuty, or email notifications
- Custom thresholds

### 8. Integration with Code

In the issue details, you can:

- **Create GitHub issue** (if integrated)
- **Assign** to team member
- **Resolve** the issue
- **Ignore** false positives
- **Release tracking** (mark which release it was fixed in)

## Best Practices

### 1. Set User Context

Always set user context when available:

```typescript
// After authentication
setUserContext(user.id, user.email, user.username);

// On logout
clearUserContext();
```

This helps correlate errors with users.

### 2. Add Custom Context

Include relevant context with errors:

```typescript
captureException(error, {
  userId: currentUser.id,
  action: "payment_processing",
  amount: order.total,
  orderId: order.id,
});
```

### 3. Use Tags for Organization

```typescript
Sentry.setTag("payment_system", "stripe");
Sentry.setTag("api_version", "v2");
```

### 4. Ignore Development Errors

In development, non-critical errors can be noisy:

```typescript
if (process.env.NODE_ENV === "development") {
  // Only send critical errors to Sentry
  tracesSampleRate: 0.5,
}
```

### 5. Breadcrumbs for Context

Sentry automatically tracks:

- Navigation changes
- User interactions
- Network requests
- Console logs

You can add custom breadcrumbs:

```typescript
Sentry.captureMessage("User completed checkout", "info");
```

### 6. Performance Monitoring

Use sampling to avoid excessive data:

```typescript
tracesSampleRate: 0.1, // Sample 10% of transactions
```

### 7. Source Maps (Production)

For better stack traces, upload source maps:

```bash
npm install @sentry/cli --save-dev

# Upload source maps
sentry-cli releases files upload-sourcemaps .
```

## Troubleshooting

### Errors Not Appearing in Sentry

**Problem:** Errors aren't showing up in the Sentry dashboard.

**Solutions:**

1. **Check DSN is set**
   ```bash
   echo $SENTRY_DSN
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify environment**
   ```typescript
   // Add to config
   debug: true, // Enable debug logging
   ```

3. **Check browser console** for Sentry initialization logs

4. **Verify DSN format** - should be: `https://key@projectid.ingest.sentry.io/projectid`

5. **Check Sentry project settings** - ensure it's receiving events

### High Data Usage

**Problem:** Sentry quota exceeded or data usage too high.

**Solutions:**

1. **Reduce sample rate**
   ```typescript
   tracesSampleRate: 0.05, // Sample only 5% in production
   ```

2. **Disable session replay**
   ```typescript
   integrations: [], // Remove replayIntegration
   ```

3. **Filter before sending**
   ```typescript
   beforeSend(event) {
     // Filter out certain events
     if (event.message && event.message.includes("ignored")) {
       return null;
     }
     return event;
   }
   ```

### Source Maps Not Available

**Problem:** Stack traces show minified code instead of readable source.

**Solutions:**

1. **Enable inline source maps in build**
   ```javascript
   // next.config.js
   module.exports = {
     productionBrowserSourceMaps: true,
   }
   ```

2. **Upload source maps to Sentry**
   - Use Sentry CLI
   - Or GitHub Actions integration

### Performance Issues

**Problem:** Adding Sentry causes performance issues.

**Solutions:**

1. **Use lazy initialization**
   ```typescript
   if (typeof window !== 'undefined') {
     initSentryClient();
   }
   ```

2. **Reduce sample rates**
   ```typescript
   replaysSessionSampleRate: 0.01, // 1% of sessions
   ```

3. **Disable session replay**
   ```typescript
   integrations: [], // Remove replay integration
   ```

## Testing Error Tracking

Use the example error component to test:

1. Navigate to `/docs/error-examples` (if route is set up)
2. Click different buttons to trigger errors
3. Check Sentry dashboard for the errors

Example route setup (`docvault/app/error-examples/page.tsx`):

```typescript
import { ErrorExamples } from "@/components/error-examples";

export default function ErrorExamplesPage() {
  return <ErrorExamples />;
}
```

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/guides/express/)
- [Sentry React Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry SDK Configuration](https://docs.sentry.io/product/best-practices/getting-started/)

## Support

For issues or questions:

1. Check [Sentry documentation](https://docs.sentry.io)
2. Review [Sentry Community](https://forum.sentry.io)
3. Contact Sentry support in your account settings
