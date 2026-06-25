# Sentry Visual Guide

Visual diagrams and flowcharts for understanding Sentry integration.

## 1. Error Flow Diagram

### From Error to Sentry Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER TRIGGERS ERROR                                            │
│  ↓                                                              │
│  ┌─────────────────────────────────────┐                       │
│  │ Error Occurs (Component/API/Async)  │                       │
│  └────────────┬────────────────────────┘                       │
│               │                                                 │
│               ↓                                                 │
│  ┌────────────────────────────────────┐                        │
│  │ Error Handler / Error Boundary      │                       │
│  │ - Catches error                     │                       │
│  │ - Adds context                      │                       │
│  │ - Adds breadcrumbs                  │                       │
│  └────────────┬────────────────────────┘                       │
│               │                                                 │
│               ↓                                                 │
│  ┌────────────────────────────────────┐                        │
│  │ Sentry SDK (Client/Server)          │                       │
│  │ - Prepares error data               │                       │
│  │ - Adds device/browser info          │                       │
│  │ - Composes request                  │                       │
│  └────────────┬────────────────────────┘                       │
│               │                                                 │
│               ↓                                                 │
│  ┌────────────────────────────────────┐                        │
│  │ Network Request                     │                       │
│  │ POST https://ingest.sentry.io       │                       │
│  │ (Sent over HTTPS)                   │                       │
│  └────────────┬────────────────────────┘                       │
│               │                                                 │
└───────────────┼─────────────────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────────────────────────┐
│ SENTRY.IO SERVICE                                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────┐                         │
│  │ Receive Error Event                 │                        │
│  │ - Validate DSN                      │                        │
│  │ - Parse request                     │                        │
│  └────────────┬────────────────────────┘                        │
│               │                                                  │
│               ↓                                                  │
│  ┌────────────────────────────────────┐                         │
│  │ Process Event                       │                        │
│  │ - Extract stack trace               │                        │
│  │ - Parse breadcrumbs                 │                        │
│  │ - Create fingerprint                │                        │
│  └────────────┬────────────────────────┘                        │
│               │                                                  │
│               ↓                                                  │
│  ┌────────────────────────────────────┐                         │
│  │ Store Event                         │                        │
│  │ - Database storage                  │                        │
│  │ - Index for search                  │                        │
│  └────────────┬────────────────────────┘                        │
│               │                                                  │
│               ↓                                                  │
│  ┌────────────────────────────────────┐                         │
│  │ Update Issue (Group similar events) │                        │
│  │ - Count occurrences                 │                        │
│  │ - Track affected users              │                        │
│  │ - Calculate trends                  │                        │
│  └────────────┬────────────────────────┘                        │
│               │                                                  │
│               ↓                                                  │
│  ┌────────────────────────────────────┐                         │
│  │ Send Notifications                  │                        │
│  │ - Email alerts                      │                        │
│  │ - Slack messages                    │                        │
│  │ - PagerDuty incidents               │                        │
│  └────────────┬────────────────────────┘                        │
│               │                                                  │
└───────────────┼──────────────────────────────────────────────────┘
                │
                ↓
        ┌──────────────────┐
        │ YOUR TEAM SEES   │
        │ - Alert          │
        │ - Dashboard      │
        │ - Can investigate│
        └──────────────────┘
```

## 2. Component Architecture

### Server-Side Error Tracking

```
Express.js Server
│
├─ Sentry.init()
│  └─ Initialize Sentry on startup
│
├─ app.use(Sentry.Handlers.requestHandler())
│  └─ Middleware: Capture request metadata
│
├─ Routes
│  ├─ GET /api/data
│  │  └─ Can throw errors
│  ├─ POST /api/users
│  │  └─ Can throw validation errors
│  └─ GET /api/test-error (Testing)
│     └─ Deliberately throws error
│
├─ app.use(Sentry.Handlers.errorHandler())
│  └─ Middleware: Capture thrown errors
│
└─ Global Error Handler
   └─ Catch any unhandled errors
```

### Client-Side Error Tracking

```
Browser / Next.js App
│
├─ RootLayout
│  │
│  └─ Sentry.init() called in Providers
│     └─ Initialize on app load
│
├─ ErrorBoundary
│  └─ Catches React component errors
│
├─ Components
│  ├─ useErrorHandler()
│  │  ├─ handleError(error)
│  │  └─ handleAsyncError(promise)
│  │
│  └─ User Interactions
│     ├─ Clicks
│     ├─ Form submissions
│     └─ Network requests
│
└─ Sentry Automatic Capture
   ├─ Console errors
   ├─ Unhandled rejections
   └─ Performance metrics
```

## 3. User Context Flow

```
User Registration / Login
│
├─ User Authenticates
│  └─ Get user data: { id, email, name }
│
├─ Call setUserContext()
│  └─ Store in Sentry
│
├─ App Uses
│  └─ All subsequent errors linked to user
│
└─ User Logout
   ├─ Clear context
   │  └─ clearUserContext()
   │
   └─ New errors won't be linked
      └─ Privacy protected
```

## 4. Error Handling Decision Tree

```
Error Occurs
│
├─ React Component Error?
│  │
│  └─ Yes ────→ Error Boundary catches it
│             │
│             └─ Shows error UI
│             └─ Sends to Sentry
│             └─ Offers recovery
│
├─ Synchronous Error?
│  │
│  ├─ Yes ────→ try/catch block
│  │          │
│  │          └─ handleError(error)
│  │          └─ Sends to Sentry
│  │
│  └─ No
│     │
│     ↓
├─ Asynchronous Error?
│  │
│  ├─ Yes ────→ await handleAsyncError(promise)
│  │          │
│  │          └─ Wraps in try/catch
│  │          └─ Sends to Sentry
│  │          └─ Returns null on error
│  │
│  └─ No
│     │
│     ↓
└─ Server Error?
   │
   ├─ Yes ────→ Express middleware
   │          │
   │          └─ Sentry.Handlers
   │          └─ Global error handler
   │
   └─ No
      │
      └─ Log and monitor
```

## 5. Sentry Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Sentry.io - Project Dashboard                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Navigation ──────────────────────────────────────────────  │
│ [Issues] [Performance] [Releases] [Settings] [Integrations]│
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ISSUES - All Errors & Events                         │  │
│ ├──────────────────────────────────────────────────────┤  │
│ │ Title              │ Users │ Events │ Last Seen     │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ Cannot read prop   │  2    │  47    │ 2 min ago    │  │
│ │ Network Error      │  5    │ 123    │ 10 sec ago   │  │
│ │ Invalid JSON       │  1    │  15    │ 1 hour ago   │  │
│ │ Payment Failed     │  3    │  28    │ 45 sec ago   │  │
│ └────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ISSUE DETAIL VIEW (Click any issue)                 │  │
│ ├──────────────────────────────────────────────────────┤  │
│ │ Title: Cannot read property 'email' of undefined    │  │
│ │ Status: Unresolved  Users: 2  Occurrences: 47       │  │
│ │                                                      │  │
│ │ Stack Trace:                                         │  │
│ │ ┌─────────────────────────────────────────────────┐ │  │
│ │ │ TypeError: Cannot read property 'email'         │ │  │
│ │ │   at processUser (app.js:45)                    │ │  │
│ │ │   at Object.<anonymous> (app.js:23)             │ │  │
│ │ │   at Module._load (loader.js:560)               │ │  │
│ │ └─────────────────────────────────────────────────┘ │  │
│ │                                                      │  │
│ │ Breadcrumbs: (What happened before error)          │  │
│ │ ─────────────────────────────────────────────────  │  │
│ │ • User clicked button          (click) 0.5s ago    │  │
│ │ • Fetch /api/users             (http) 0.3s ago    │  │
│ │ • Response received            (http) 0.1s ago    │  │
│ │ • Parse response               (log) 0.05s ago    │  │
│ │ • Error thrown                 (error) 0s ago     │  │
│ │                                                      │  │
│ │ User Context:                                       │  │
│ │ ─────────────────────────────────────────────────  │  │
│ │ • User ID: user_12345                              │  │
│ │ • Email: john@example.com                          │  │
│ │ • Name: John Doe                                   │  │
│ │ • Tier: Premium                                    │  │
│ │                                                      │  │
│ │ Device Info:                                        │  │
│ │ ─────────────────────────────────────────────────  │  │
│ │ • Browser: Chrome 120.0                            │  │
│ │ • OS: Windows 11                                   │  │
│ │ • Country: US                                      │  │
│ │                                                      │  │
│ │ [Assign] [Resolve] [Ignore] [Create Issue]         │  │
│ └────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 6. Data Flow Diagram

```
                 APPLICATION LAYER
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
    Sync Errors     Async Errors    React Errors
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ↓
            ┌───────────────────────┐
            │ Error Handler Layer   │
            ├───────────────────────┤
            │ • try/catch           │
            │ • handleError()        │
            │ • handleAsyncError()   │
            │ • Error Boundary      │
            └───────────┬───────────┘
                        │
                        ↓
            ┌───────────────────────┐
            │ Sentry SDK            │
            ├───────────────────────┤
            │ • Capture error       │
            │ • Add context         │
            │ • Add breadcrumbs     │
            │ • Format data         │
            └───────────┬───────────┘
                        │
                        ↓
            ┌───────────────────────┐
            │ Sentry Client         │
            ├───────────────────────┤
            │ • Queue events        │
            │ • Batch them          │
            │ • Compress data       │
            └───────────┬───────────┘
                        │
                        ↓ HTTPS
            ┌───────────────────────┐
            │ Sentry Backend        │
            ├───────────────────────┤
            │ • Validate request    │
            │ • Process event       │
            │ • Store in database   │
            │ • Update statistics   │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
    Dashboard      Notifications    Integrations
    (View)         (Alerts/Slack)   (GitHub/etc)
```

## 7. Error Context Structure

```
┌─────────────────────────────────────────────────────────┐
│ Error Event in Sentry                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Basic Info                                              │
│ ├─ Title: "Cannot read property 'x' of undefined"       │
│ ├─ Level: error                                         │
│ ├─ Environment: production                              │
│ └─ Timestamp: 2024-06-25 14:30:45 UTC                   │
│                                                         │
│ Error Details                                           │
│ ├─ Type: TypeError                                      │
│ ├─ Value: Cannot read property 'x' of undefined         │
│ └─ Stack Trace (10 frames)                              │
│    ├─ Frame 0: app.js:45 (processUser)                  │
│    ├─ Frame 1: app.js:23 (Object.<anonymous>)          │
│    └─ Frame 2: loader.js:560 (Module._load)             │
│                                                         │
│ User Context                                            │
│ ├─ ID: user_12345                                       │
│ ├─ Email: john@example.com                              │
│ ├─ Name: John Doe                                       │
│ └─ IP Address: 192.168.1.1                              │
│                                                         │
│ Browser/Device                                          │
│ ├─ Browser: Chrome 120.0                                │
│ ├─ OS: Windows 11                                       │
│ ├─ Device: Desktop                                      │
│ └─ User Agent: Mozilla/5.0...                           │
│                                                         │
│ Breadcrumbs (What happened)                             │
│ ├─ [click] Button clicked - "Submit"                    │
│ ├─ [http] GET /api/users - 200 OK                       │
│ ├─ [log] Processing response data                       │
│ ├─ [error] JSON.parse failed                            │
│ └─ [error] Error thrown                                 │
│                                                         │
│ Custom Context                                          │
│ ├─ userId: "user_12345"                                 │
│ ├─ action: "user_processing"                            │
│ ├─ endpoint: "/api/users"                               │
│ └─ tier: "premium"                                      │
│                                                         │
│ Tags                                                    │
│ ├─ environment: production                              │
│ ├─ version: 1.2.3                                       │
│ └─ service: api-server                                  │
│                                                         │
│ Request                                                 │
│ ├─ URL: https://app.example.com/dashboard               │
│ ├─ Method: GET                                          │
│ └─ Headers: { ... }                                     │
│                                                         │
│ Release                                                 │
│ └─ 1.2.3 (linked to GitHub release)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 8. Error Recovery Flow

```
Error Occurs
│
├─ Error Boundary Catches It
│  │
│  ├─ Sends to Sentry
│  │
│  ├─ Stores ErrorId
│  │
│  └─ Renders Error UI
│     │
│     ├─ Shows error message
│     ├─ Displays ErrorId (for support)
│     ├─ Shows "Try Again" button
│     └─ Shows "Go Home" button
│
└─ User Options
   │
   ├─ Click "Try Again"
   │  └─ Reset error state
   │  └─ Retry failed operation
   │  └─ Component re-renders
   │
   ├─ Click "Go Home"
   │  └─ Navigate to home page
   │  └─ Start fresh
   │
   └─ Contact Support
      └─ Use ErrorId to reference issue
      └─ Provide error details
```

## 9. Configuration Levels

```
┌─────────────────────────────────────────────────────┐
│ Environment-Specific Configuration                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Development                                         │
│ ├─ Sample Rate: 100% (all errors)                  │
│ ├─ Debug: Enabled (console logs)                   │
│ ├─ Replays: 100% of sessions                       │
│ └─ Goal: Catch all issues locally                  │
│                                                     │
│ Staging                                             │
│ ├─ Sample Rate: 50% (reduce cost)                  │
│ ├─ Debug: Disabled                                 │
│ ├─ Replays: 50% of sessions                        │
│ └─ Goal: Representative data                       │
│                                                     │
│ Production                                          │
│ ├─ Sample Rate: 10% (cost efficient)               │
│ ├─ Debug: Disabled                                 │
│ ├─ Replays: 1% of sessions + 100% on errors        │
│ └─ Goal: Monitor without excess cost               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 10. Integration Ecosystem

```
                    Sentry.io
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
    Dashboard      Alerts         Integrations
    (View Issues)  (Notify)       (Sync Data)
        │              │              │
        │         ┌─────┼─────┐       │
        │         │     │     │       │
        ↓         ↓     ↓     ↓       ↓
    Your      Email  Slack  Twilio  GitHub
    Browser                          Issues
                                     │
                                     ├─ Auto-create issues
                                     ├─ Link to code
                                     └─ Track fixes
```

## 11. Performance Monitoring

```
Transaction Timeline
│
├─ Start: User clicks button
│  └─ timestamp: 0ms
│
├─ Network Request (fetch /api/data)
│  │  - Send request: 2ms
│  │  - Wait for response: 150ms
│  │  - Receive: 5ms
│  └─ Total: 157ms
│
├─ Processing
│  │  - Parse JSON: 10ms
│  │  - Validate: 5ms
│  └─ Total: 15ms
│
├─ Render Component
│  │  - React render: 8ms
│  │  - Paint: 3ms
│  └─ Total: 11ms
│
└─ Complete: 183ms total
   └─ Status: ok (under threshold)

If Slow:
├─ Identify bottleneck
├─ Create alert
└─ Notify team
```

These visual guides help understand how Sentry integrates with and monitors your application.
