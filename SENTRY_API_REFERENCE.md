# Sentry API Reference

Complete API reference for Sentry error tracking utilities in this application.

## Table of Contents

1. [Client Configuration](#client-configuration)
2. [Server Configuration](#server-configuration)
3. [Error Handler Hook](#error-handler-hook)
4. [Sentry Functions](#sentry-functions)

## Client Configuration

**File:** `sentry.client.config.ts`

### `initSentryClient()`

Initialize Sentry on the client side. Must be called before using other Sentry functions.

```typescript
import { initSentryClient } from "@/sentry.client.config";

// Call once on app initialization
useEffect(() => {
  initSentryClient();
}, []);
```

**Returns:** `void`

**Side Effects:**
- Initializes Sentry SDK
- Sets up error handlers
- Enables session replay

**Environment Requirements:**
- `NEXT_PUBLIC_SENTRY_DSN` environment variable must be set

### `captureException(error, context?)`

Capture an exception and send to Sentry.

```typescript
import { captureException } from "@/sentry.client.config";

try {
  performOperation();
} catch (error) {
  captureException(error, {
    userId: user.id,
    action: "operation_name",
  });
}
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `Error \| string` | Yes | Error object or error message string |
| `context` | `Record<string, any>` | No | Additional context data to attach to error |

**Returns:** `void`

**Example:**

```typescript
try {
  await fetchData();
} catch (error) {
  captureException(error, {
    userId: currentUser.id,
    action: "fetch_data",
    endpoint: "/api/data",
    requestId: "req_123",
  });
}
```

### `captureMessage(message, level?)`

Capture a message at a specific severity level.

```typescript
import { captureMessage } from "@/sentry.client.config";

captureMessage("User completed checkout", "info");
captureMessage("Payment processing slow", "warning");
captureMessage("Critical system failure", "error");
```

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | Message to capture |
| `level` | `"info" \| "warning" \| "error"` | `"info"` | Severity level |

**Returns:** `void`

**Severity Levels:**

- **`"info"`** - Informational messages (lowest priority)
- **`"warning"`** - Warning messages (medium priority)
- **`"error"`** - Error messages (highest priority)

**Example:**

```typescript
// Track important user actions
captureMessage("User logged in", "info");
captureMessage("API response time: 5000ms", "warning");
captureMessage("Payment failed", "error");
```

### `setUserContext(userId, email?, username?)`

Associate errors with a user.

```typescript
import { setUserContext } from "@/sentry.client.config";

// After user login
const user = await authenticate();
setUserContext(user.id, user.email, user.username);
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | Yes | Unique user identifier |
| `email` | `string` | No | User email address |
| `username` | `string` | No | User display name |

**Returns:** `void`

**Example:**

```typescript
// Full user context
setUserContext("user_12345", "john@example.com", "john_doe");

// Minimal context
setUserContext("user_12345");
```

**When to Use:**
- After successful authentication
- When switching accounts
- Before operations that might error

### `clearUserContext()`

Remove user context from error tracking.

```typescript
import { clearUserContext } from "@/sentry.client.config";

// After user logout
clearUserContext();
```

**Returns:** `void`

**Example:**

```typescript
const handleLogout = async () => {
  await logout();
  clearUserContext();
  redirectToLogin();
};
```

## Server Configuration

**File:** `sentry.server.config.ts`

### `initSentryServer()`

Initialize Sentry on the server side.

```typescript
import { initSentryServer } from "@/sentry.server.config";

initSentryServer();
```

**Returns:** `void`

**When to Call:**
- At server startup in `server/index.ts`
- Before setting up middleware
- Only once per process

**Example:**

```typescript
import * as Sentry from "@sentry/node";
import { initSentryServer } from "@/sentry.server.config";

// Initialize Sentry early
initSentryServer();

const app = express();

// Add Sentry middleware
app.use(Sentry.Handlers.requestHandler());
```

### `captureException(error, context?)`

Capture server-side exception.

```typescript
import { captureException } from "@/sentry.server.config";

try {
  const result = await databaseOperation();
} catch (error) {
  captureException(error, {
    operation: "database.query",
    query: "SELECT * FROM users",
  });
}
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `Error \| string` | Yes | Error object or message |
| `context` | `Record<string, any>` | No | Additional context data |

**Returns:** `void`

### `captureMessage(message, level?)`

Capture a server-side message.

```typescript
import { captureMessage } from "@/sentry.server.config";

captureMessage("Background job started", "info");
captureMessage("Database connection slow", "warning");
captureMessage("Service offline", "error");
```

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | Message to capture |
| `level` | `"info" \| "warning" \| "error"` | `"info"` | Severity level |

**Returns:** `void`

## Error Handler Hook

**File:** `docvault/lib/use-error-handler.ts`

### `useErrorHandler()`

Custom React hook for handling errors with Sentry integration.

```typescript
import { useErrorHandler } from "@/lib/use-error-handler";

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();

  const handleClick = () => {
    try {
      performAction();
    } catch (error) {
      handleError(error);
    }
  };
}
```

**Returns:**

```typescript
{
  handleError: (error: Error | string, context?: Record<string, any>) => void,
  handleAsyncError: <T>(promise: Promise<T>, errorMessage?: string) => Promise<T | null>
}
```

### `handleError(error, context?)`

Handle synchronous errors.

```typescript
const { handleError } = useErrorHandler();

try {
  // Code that might throw
  JSON.parse(invalidJSON);
} catch (error) {
  handleError(error instanceof Error ? error : "Parse failed", {
    input: invalidJSON,
    component: "JSONParser",
  });
}
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `Error \| string` | Yes | Error object or message |
| `context` | `Record<string, any>` | No | Custom context data |

**Returns:** `void`

**Behavior:**
- Logs error to console
- Sends to Sentry with context
- Does not throw

### `handleAsyncError<T>(promise, errorMessage?)`

Handle async errors and promise rejections.

```typescript
const { handleAsyncError } = useErrorHandler();

// With promise
const data = await handleAsyncError(
  fetch("/api/data").then(r => r.json()),
  "Failed to fetch data"
);

if (data === null) {
  // Error was handled
  return <div>Error occurred</div>;
}

// Use data safely
return <div>{data}</div>;
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `promise` | `Promise<T>` | Yes | Promise to wrap |
| `errorMessage` | `string` | No | Custom error message |

**Returns:** `Promise<T \| null>`

**Return Values:**
- `T` - Promise resolved successfully
- `null` - Promise rejected (error handled)

**Behavior:**
- Wraps promise with try-catch
- Catches rejections automatically
- Sends errors to Sentry
- Returns `null` on error (no throw)

**Example:**

```typescript
const loadUser = async (userId: string) => {
  const { handleAsyncError } = useErrorHandler();

  const user = await handleAsyncError(
    fetch(`/api/users/${userId}`).then(r => r.json()),
    "Failed to load user"
  );

  if (!user) {
    return <div>Could not load user</div>;
  }

  return <div>User: {user.name}</div>;
};
```

## Sentry Core Functions

Direct Sentry SDK functions available:

### Breadcrumbs

Add context about what happened before the error:

```typescript
import * as Sentry from "@sentry/react";

// Automatic breadcrumbs
// - User interactions (clicks, submissions)
// - Network requests (fetch, XMLHttpRequest)
// - Console logs

// Manual breadcrumbs
Sentry.captureMessage("User started payment");
Sentry.captureMessage("Payment form submitted");
```

### Tags

Organize errors by metadata:

```typescript
import * as Sentry from "@sentry/react";

Sentry.setTag("payment_method", "credit_card");
Sentry.setTag("tier", "premium");
```

### Context

Add structured data to errors:

```typescript
import * as Sentry from "@sentry/react";

Sentry.setContext("user_session", {
  sessionId: "abc123",
  loginTime: new Date().toISOString(),
  tier: "premium",
});
```

### Scope

Modify context for specific operations:

```typescript
import * as Sentry from "@sentry/react";

Sentry.withScope((scope) => {
  scope.setTag("operation", "payment");
  scope.setContext("payment_details", {
    amount: 99.99,
    currency: "USD",
  });

  try {
    processPayment();
  } catch (error) {
    Sentry.captureException(error);
  }
});
```

### Transactions (Performance)

Monitor performance of specific operations:

```typescript
import * as Sentry from "@sentry/react";

const transaction = Sentry.startTransaction({
  op: "database.query",
  name: "Fetch user data",
});

try {
  const data = await fetchData();
  transaction.finish("ok");
} catch (error) {
  transaction.finish("error");
  Sentry.captureException(error);
}
```

## Complete Example

```typescript
"use client";

import { useErrorHandler } from "@/lib/use-error-handler";
import { setUserContext } from "@/sentry.client.config";
import { useEffect } from "react";

export function UserDashboard({ userId }: { userId: string }) {
  const { handleError, handleAsyncError } = useErrorHandler();

  // Set user context on mount
  useEffect(() => {
    setUserContext(userId);
  }, [userId]);

  const loadUserData = async () => {
    const data = await handleAsyncError(
      fetch(`/api/users/${userId}`).then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      }),
      "Failed to load user data"
    );

    if (!data) {
      return <div>Could not load user data</div>;
    }

    return <div>{data.name}</div>;
  };

  const processPayment = () => {
    try {
      // Validate input
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Process payment
      const amount = 99.99;
      // payment processing...

    } catch (error) {
      handleError(error instanceof Error ? error : "Payment failed", {
        userId,
        action: "process_payment",
        amount: 99.99,
      });
    }
  };

  return (
    <div>
      <h1>User Dashboard</h1>
      {loadUserData()}
      <button onClick={processPayment}>Pay Now</button>
    </div>
  );
}
```

## Best Practices

### 1. Always Provide Context

```typescript
// Good
captureException(error, {
  userId: user.id,
  action: "payment_processing",
  amount: 99.99,
});

// Avoid
captureException(error); // Missing context
```

### 2. Set User Context Early

```typescript
// In auth/login component
const handleLogin = async (credentials) => {
  const user = await authenticate(credentials);
  setUserContext(user.id, user.email, user.username); // Set immediately
  navigate("/dashboard");
};
```

### 3. Use Appropriate Error Handlers

```typescript
// For sync errors
try {
  performAction();
} catch (error) {
  handleError(error);
}

// For async errors
const result = await handleAsyncError(promise, "Custom message");
```

### 4. Clear Context on Logout

```typescript
const handleLogout = async () => {
  await logout();
  clearUserContext(); // Important for privacy
  navigate("/login");
};
```

### 5. Use Meaningful Messages

```typescript
// Good
captureMessage("Payment processing started", "info");
captureMessage("API response time: 5000ms", "warning");

// Avoid
captureMessage("Error", "error"); // Too vague
```

## Debugging Tips

### Check Sentry Initialization

```typescript
// In browser console
console.log(window.__SENTRY__);  // Check if initialized
```

### Test Error Sending

```typescript
// Trigger test error
import { captureException } from "@/sentry.client.config";

captureException(new Error("Test error"), {
  test: true,
  timestamp: new Date().toISOString(),
});

// Check Sentry dashboard after 30 seconds
```

### View Network Requests

1. Open Developer Tools
2. Go to Network tab
3. Filter by "ingest.sentry.io"
4. Look for POST requests to confirm data is being sent

## Error Codes

When troubleshooting, you might see:

| Code | Meaning | Solution |
|------|---------|----------|
| `Invalid DSN` | DSN format incorrect | Check format in `.env.local` |
| `Auth failed` | DSN doesn't match project | Regenerate DSN in Sentry |
| `Rate limited` | Too much data sent | Reduce sample rate |
| `Invalid JSON` | Event data malformed | Check custom context data |

## Performance Considerations

### Data Usage

- Each error event: ~5-20 KB
- Session replay: ~50-200 KB per session
- Network requests: ~1-5 KB each

### Optimization

```typescript
// Reduce sample rates
tracesSampleRate: 0.05,  // 5% instead of 10%

// Disable session replay
integrations: [],

// Filter non-critical errors
beforeSend(event) {
  if (event.level === "debug") {
    return null;
  }
  return event;
}
```

## Security Considerations

### Sensitive Data

- Never send passwords in context
- Mask credit card numbers
- Exclude PII from custom context
- Use `maskAllText: true` in session replay

### Token Safety

- Never include API keys in events
- Never include auth tokens
- Use `beforeSend` to filter sensitive data

### GDPR Compliance

- Always `clearUserContext()` on logout
- Respect "Do Not Track" settings
- Document data retention in privacy policy
