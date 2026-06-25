# Sentry Integration - Complete Implementation

Comprehensive error tracking and monitoring system for your application.

## Overview

This project now includes a **complete Sentry integration** for real-time error tracking, monitoring, and performance analysis.

### What is Sentry?

Sentry is an error tracking platform that:
- Captures errors automatically from your application
- Groups similar errors together
- Tracks affected users
- Shows complete stack traces and context
- Provides performance monitoring
- Sends real-time alerts
- Integrates with your workflow tools (Slack, GitHub, etc.)

## Quick Links

### Getting Started
- **[SENTRY_QUICK_START.md](./SENTRY_QUICK_START.md)** - Setup in 5 minutes
- **[SENTRY_INTEGRATION_GUIDE.md](./SENTRY_INTEGRATION_GUIDE.md)** - Complete integration guide

### Reference
- **[SENTRY_API_REFERENCE.md](./SENTRY_API_REFERENCE.md)** - Function signatures and examples
- **[SENTRY_CONFIGURATION.md](./SENTRY_CONFIGURATION.md)** - Configuration options
- **[SENTRY_VISUAL_GUIDE.md](./SENTRY_VISUAL_GUIDE.md)** - Diagrams and flowcharts

### Implementation Details
- **[SENTRY_IMPLEMENTATION_SUMMARY.md](./SENTRY_IMPLEMENTATION_SUMMARY.md)** - What was implemented

## Features Implemented

### 1. Server-Side Tracking (Express.js)
- [x] Automatic error capturing
- [x] Request/response tracking
- [x] Exception handling middleware
- [x] Test endpoint for verification
- [x] Global error handler

**File:** `server/index.ts` (modified)

### 2. Client-Side Tracking (React/Next.js)
- [x] Automatic error capturing
- [x] Console error tracking
- [x] Promise rejection handling
- [x] Performance monitoring
- [x] Session replay

**File:** `sentry.client.config.ts`

### 3. Error Boundary
- [x] React component error catching
- [x] User-friendly error UI
- [x] Error ID for support reference
- [x] Recovery options (Try Again, Go Home)
- [x] Development debug information

**File:** `docvault/components/error-boundary.tsx`

### 4. Error Handling Utilities
- [x] Custom hook for error handling
- [x] Synchronous error handling
- [x] Async/Promise error handling
- [x] User context management
- [x] Custom context attachment

**Files:**
- `docvault/lib/use-error-handler.ts`
- `sentry.client.config.ts`

### 5. Example Component
- [x] 6+ error handling scenarios
- [x] Interactive demonstration
- [x] User context examples
- [x] API error handling
- [x] Documentation

**File:** `docvault/components/error-examples.tsx`

## Project Structure

```
voxmation/
├── Core Files
│   ├── sentry.client.config.ts          (Client-side config)
│   ├── sentry.server.config.ts          (Server-side config)
│   └── .env.sentry.example              (Environment template)
│
├── Server (Express.js)
│   └── server/index.ts                  (MODIFIED)
│
├── Frontend (Next.js)
│   └── docvault/
│       ├── app/
│       │   ├── layout.tsx               (MODIFIED)
│       │   └── providers.tsx            (MODIFIED)
│       │
│       ├── components/
│       │   ├── error-boundary.tsx       (NEW)
│       │   └── error-examples.tsx       (NEW)
│       │
│       └── lib/
│           └── use-error-handler.ts     (NEW)
│
└── Documentation
    ├── SENTRY_README.md                 (This file)
    ├── SENTRY_QUICK_START.md            (5-minute setup)
    ├── SENTRY_INTEGRATION_GUIDE.md      (Complete guide)
    ├── SENTRY_CONFIGURATION.md          (Configuration)
    ├── SENTRY_API_REFERENCE.md          (API docs)
    ├── SENTRY_VISUAL_GUIDE.md           (Diagrams)
    └── SENTRY_IMPLEMENTATION_SUMMARY.md (Implementation)
```

## Installation Status

✅ **All packages installed:**
```json
{
  "@sentry/node": "^10.60.0",
  "@sentry/nextjs": "^10.60.0",
  "@sentry/react": "^10.60.0"
}
```

## Setup Steps

### Step 1: Create Sentry Account (2 min)
1. Go to https://sentry.io
2. Sign up with email
3. Create new organization

### Step 2: Create Project (1 min)
1. Click "Create Project"
2. Select platform (Node.js or JavaScript)
3. Copy your DSN

### Step 3: Add Environment Variables (1 min)
Create or update `.env.local`:
```env
SENTRY_DSN=https://your-key@project.ingest.sentry.io/id
NEXT_PUBLIC_SENTRY_DSN=https://your-key@project.ingest.sentry.io/id
```

### Step 4: Test Integration (1 min)
```bash
# Test server error
curl http://localhost:3001/api/test-error

# Test client error
# Add a test route or use the error-examples component
```

### Step 5: View in Dashboard (30 sec)
1. Log in to https://sentry.io
2. Go to your project
3. Click "Issues" tab
4. You should see errors appearing within 30 seconds

See [SENTRY_QUICK_START.md](./SENTRY_QUICK_START.md) for detailed steps.

## Common Tasks

### Handle Errors in Components

```typescript
import { useErrorHandler } from "@/lib/use-error-handler";

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();

  // Sync error
  const handleClick = () => {
    try {
      // code
    } catch (error) {
      handleError(error, { action: "click" });
    }
  };

  // Async error
  const loadData = async () => {
    const result = await handleAsyncError(
      fetchData(),
      "Failed to load"
    );
    if (!result) return <div>Error</div>;
    return <div>{result}</div>;
  };

  return <div>{/* ... */}</div>;
}
```

### Track User Context

```typescript
import { setUserContext, clearUserContext } from "@/sentry.client.config";

// After login
const user = await authenticate();
setUserContext(user.id, user.email, user.name);

// After logout
clearUserContext();
```

### Send Custom Messages

```typescript
import { captureMessage } from "@/sentry.client.config";

captureMessage("User completed checkout", "info");
captureMessage("API response slow", "warning");
captureMessage("Payment failed", "error");
```

## Viewing Errors

1. **Log in to Sentry:** https://sentry.io/organizations/your-org
2. **Select your project**
3. **Navigate to Issues** - See all errors
4. **Click an issue** to view:
   - Stack trace with line numbers
   - User who experienced it
   - Browser and device info
   - Timeline of events (breadcrumbs)
   - Custom data you attached
5. **Take action:**
   - Assign to team member
   - Create GitHub issue
   - Set alert rules
   - Resolve when fixed

## Key Components

### Error Boundary (`error-boundary.tsx`)

Automatically catches React component errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Shows user-friendly error page with:
- Error message
- Error ID (for support)
- Recovery buttons
- Debug info (development only)

### Error Handler Hook (`use-error-handler.ts`)

Use in components for error handling:

```typescript
const { handleError, handleAsyncError } = useErrorHandler();
```

Methods:
- `handleError(error, context?)` - Sync errors
- `handleAsyncError(promise, message?)` - Async errors

### Configuration Files

**`sentry.client.config.ts`** - Client-side configuration and utilities
- Initialize Sentry
- Capture exceptions
- Capture messages
- Manage user context

**`sentry.server.config.ts`** - Server-side configuration
- Express.js integration
- HTTP request tracking
- Server error handling

## Configuration

### Default Settings

**Development:**
- Sample 100% of errors
- Capture all sessions (100%)
- Enable debug logging
- Show stack traces

**Production:**
- Sample 10% of errors (cost efficient)
- Capture 1% of sessions + 100% on errors
- Disable debug logging
- Compress data

### Customization

Edit `sentry.client.config.ts` or `sentry.server.config.ts`:

```typescript
Sentry.init({
  tracesSampleRate: 0.1,        // Sample rate
  replaysSessionSampleRate: 0.01,  // Session recording
  beforeSend(event) {
    // Filter errors
    if (event.message?.includes("ignored")) {
      return null;
    }
    return event;
  },
});
```

See [SENTRY_CONFIGURATION.md](./SENTRY_CONFIGURATION.md) for all options.

## Security & Privacy

✅ **Safe implementation:**
- Client DSN is public (read-only)
- No passwords sent to Sentry
- No API keys sent to Sentry
- Sensitive text masked in replays
- User context cleared on logout
- GDPR compliant

⚠️ **Best practices:**
- Never log passwords
- Never log API keys
- Use `beforeSend` to filter data
- Mask PII in custom context
- Review what's being captured

## Performance Impact

- **SDK size:** ~50-100 KB (gzipped)
- **Runtime:** <5ms per error
- **Network:** ~5-20 KB per error
- **Memory:** Minimal impact

Optimization options:
- Reduce sample rates
- Disable session replay
- Filter before sending
- Use lazy initialization

## API Reference

### Client Functions

```typescript
// Initialize
initSentryClient()

// Capture errors
captureException(error, context?)
captureMessage(message, level?)

// User context
setUserContext(userId, email?, username?)
clearUserContext()
```

### Server Functions

```typescript
// Initialize
initSentryServer()

// Capture errors
captureException(error, context?)
captureMessage(message, level?)
```

### Hook Functions

```typescript
const { handleError, handleAsyncError } = useErrorHandler()

// Usage
handleError(error, context?)
await handleAsyncError(promise, message?)
```

See [SENTRY_API_REFERENCE.md](./SENTRY_API_REFERENCE.md) for complete documentation.

## Troubleshooting

### Errors Not Appearing?

1. Check DSN is set in `.env.local`
2. Verify DSN format is correct
3. Check browser console for errors
4. Enable debug mode: `debug: true`
5. Check Sentry project settings

### Too Much Data?

1. Reduce `tracesSampleRate` (e.g., `0.05`)
2. Disable session replay
3. Add `beforeSend` filter
4. Set `ignoreErrors` list

### Source Maps Missing?

1. Build with source maps enabled
2. Upload to Sentry via CLI
3. Enable in Next.js config

See [SENTRY_INTEGRATION_GUIDE.md](./SENTRY_INTEGRATION_GUIDE.md) for more troubleshooting.

## Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| `SENTRY_QUICK_START.md` | Fast 5-minute setup | 3 min |
| `SENTRY_INTEGRATION_GUIDE.md` | Complete guide | 15 min |
| `SENTRY_CONFIGURATION.md` | Configuration details | 10 min |
| `SENTRY_API_REFERENCE.md` | Function reference | 12 min |
| `SENTRY_VISUAL_GUIDE.md` | Diagrams | 5 min |
| `SENTRY_IMPLEMENTATION_SUMMARY.md` | Implementation details | 8 min |

## Next Steps

1. ✅ **Integration complete** - All code is in place
2. ⭕ **Get Sentry account** - Go to sentry.io
3. ⭕ **Add DSN** - Update `.env.local`
4. ⭕ **Test it** - Trigger test error
5. ⭕ **Configure alerts** - Set up notifications
6. ⭕ **Monitor** - Check dashboard regularly

## Example Usage

### Test Error Endpoint

```bash
curl http://localhost:3001/api/test-error
```

Should create error in Sentry within 30 seconds.

### Error Examples Component

Create route `docvault/app/error-examples/page.tsx`:

```typescript
import { ErrorExamples } from "@/components/error-examples";

export default function ErrorExamplesPage() {
  return <ErrorExamples />;
}
```

Visit the page to test different error scenarios.

## Supported Platforms

- ✅ Express.js (Node.js)
- ✅ Next.js 14+
- ✅ React 18+
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ Server-side rendering

## Integration Ecosystem

Sentry integrates with:
- 📧 Email
- 💬 Slack
- ☎️ PagerDuty
- 🐙 GitHub
- 🚀 Vercel
- 📊 Datadog
- 🔔 Custom webhooks

## Support

### Documentation
- [Sentry Official Docs](https://docs.sentry.io)
- [JavaScript Guide](https://docs.sentry.io/platforms/javascript/)
- [Node.js Guide](https://docs.sentry.io/platforms/node/)
- [React Guide](https://docs.sentry.io/platforms/javascript/guides/react/)

### Community
- [Sentry Forum](https://forum.sentry.io)
- [GitHub Issues](https://github.com/getsentry/sentry)
- [Discord Community](https://discord.com/invite/sentry)

### Your Project
- Config files: `sentry.*.config.ts`
- Implementation: `server/index.ts`, `docvault/app/*`
- Documentation: `SENTRY_*.md` files

## License

Sentry is free for small projects. Pricing plans available at https://sentry.io/pricing

## Summary

Sentry integration is **complete and ready to use**. You now have:

✅ Server-side error tracking
✅ Client-side error tracking
✅ React Error Boundaries
✅ Custom error handling utilities
✅ User context tracking
✅ Session replay capability
✅ Performance monitoring
✅ Comprehensive documentation

All you need to do is:
1. Create a Sentry account
2. Add your DSN to `.env.local`
3. Start tracking errors!

For quick setup, see [SENTRY_QUICK_START.md](./SENTRY_QUICK_START.md).
