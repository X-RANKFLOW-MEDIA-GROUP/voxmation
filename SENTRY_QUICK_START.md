# Sentry Quick Start

Get up and running with Sentry error tracking in 5 minutes.

## Step 1: Create Sentry Account (2 minutes)

1. Go to https://sentry.io
2. Click "Sign Up"
3. Create account with email
4. Create a new organization

## Step 2: Create a Project (1 minute)

1. In Sentry dashboard, click "Create Project"
2. Select platform: **Node.js** (for server) or **JavaScript - React** (for client)
3. Click "Create Project"
4. Copy your **DSN** (looks like: `https://key@project.ingest.sentry.io/123456`)

## Step 3: Add Environment Variables (1 minute)

Create or update `.env.local`:

```env
SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/your-id
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/your-id
```

## Step 4: Test the Integration (1 minute)

### Test Server-side Error

```bash
curl http://localhost:3001/api/test-error
```

You should see the error in Sentry within 30 seconds.

### Test Client-side Error

Create a test file `docvault/app/test-error/page.tsx`:

```typescript
"use client";

export default function TestError() {
  return (
    <button onClick={() => { throw new Error("Test error"); }}>
      Click to trigger error
    </button>
  );
}
```

Visit `http://localhost:3000/test-error` and click the button.

## View Errors in Sentry

1. Go to your Sentry project: https://sentry.io/organizations/your-org/issues/
2. You'll see your errors listed
3. Click an error to see full details:
   - Stack trace
   - User context
   - Browser info
   - Custom data

## Common Tasks

### Set User Context After Login

```typescript
import { setUserContext } from "@/sentry.client.config";

// After user logs in
setUserContext(user.id, user.email, user.name);
```

### Capture Custom Errors

```typescript
import { captureException } from "@/sentry.client.config";

try {
  // your code
} catch (error) {
  captureException(error, {
    userId: user.id,
    action: "payment",
  });
}
```

### Use Error Handler Hook

```typescript
import { useErrorHandler } from "@/lib/use-error-handler";

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleClick = () => {
    try {
      // something
    } catch (error) {
      handleError(error, { action: "click" });
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

## That's it!

Your app now sends errors to Sentry. Every error is automatically:

- Captured with full stack trace
- Tagged with environment (dev/prod)
- Associated with the affected user
- Grouped by similarity
- Alerted to your team

For more details, see [SENTRY_INTEGRATION_GUIDE.md](./SENTRY_INTEGRATION_GUIDE.md).
