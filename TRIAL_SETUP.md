# VOXmation 7-Day Trial Operations

This is the production workflow for accepted trial clients. A trial is **not active when a lead accepts**. The seven-day clock starts only after intake, agent configuration, phone connection, a passed test call, and explicit client go-live approval.

## Lifecycle

`accepted → intake → agent_configured → number_connected → testing → awaiting_approval → live → converted | expired`

The app records every material transition in `client_trial_events`. Staff exceptions and follow-ups live in `client_trial_tasks`.

## Required setup

1. Apply `supabase/migrations/20260713000000_create_client_trial_operations.sql`.
2. Configure the environment variables below.
3. Ensure one VOXmation staff account belongs to an `accounts.type = 'master'` account with role `owner` or `admin`.
4. Start the web app and API (`npm run dev`).
5. Schedule `POST /api/client-trials/operations/run-lifecycle` hourly with `Authorization: Bearer $CRON_SECRET`.

## Environment variables

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

APP_URL=https://voxmation.com
VITE_API_URL=https://api.voxmation.com
CRON_SECRET=generate-a-long-random-secret

ELEVENLABS_API_KEY=
ELEVENLABS_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_AGENT_LLM=gemini-2.0-flash-001
ELEVENLABS_CONVAI_WEBHOOK_SECRET=
ELEVENLABS_WEBHOOK_TOLERANCE_SECONDS=1800

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+1...

EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=
SMTP_FROM_EMAIL=trial@voxmation.com
```

Never expose provider keys in Vite variables. ElevenLabs, Twilio, Stripe, Supabase service-role, and cron secrets are server-only.

## Staff workflow

1. Sign in at `/admin/login`.
2. Open `/trial-builder`.
3. Create and send a secure invite for the accepted client. The API emails it immediately; if delivery fails, the queue creates a manual-delivery task and the UI keeps the link available for copying.
4. The link contains only a random one-time token; no client PII is present in the URL.
5. Watch the launch queue for completed intake.
6. Click **Configure agent**. The server builds a guarded, versioned prompt and creates an ElevenLabs conversational agent in test state.
7. Enter an existing Twilio number in E.164 format and click **Connect**. This imports the number into ElevenLabs but leaves inbound service disconnected until client approval.
8. The client places a test call, reports changes or marks it passed, then explicitly approves go-live.

This implementation deliberately does not purchase phone numbers automatically. Number purchase changes external billing and must remain an intentional Twilio operation. The app connects an existing Twilio number after staff supplies it.

## Client workflow

1. Client opens the secure invite and signs in with the invited email.
2. The invite claim creates/links the client sub-account.
3. Client completes the four-part onboarding at `/portal/onboarding`:
   - business profile and services;
   - hours and exact greeting;
   - call goals, capture fields, booking/pricing/emergency rules;
   - phone strategy, terms, and recording-compliance acknowledgement.
4. VOXmation configures the provider resources.
5. Client requests the outbound test call. Pass/fail unlocks only after the signed post-call webhook confirms completion.
6. Go-live unlocks only when all readiness checks pass; it is the action that assigns the agent to the inbound number.
7. `trial_started_at = live_at` and `trial_ends_at = live_at + 7 days` are written atomically with go-live.

## Lifecycle automation

The hourly lifecycle endpoint:

- expires live trials whose exact end time has passed;
- unassigns the ElevenLabs agent from an expired phone number;
- preserves configuration for reactivation;
- queues state-aware email messages for intake recovery, test readiness, days 1/3/5/6, and expiration;
- deduplicates every message by trial, message key, and channel;
- retries through the operations queue without duplicating sends.

When Stripe reports an active subscription, the webhook marks the trial converted, cancels pending trial messages, and reassigns the preserved agent to the phone number if the trial had expired.

## ElevenLabs post-call ingestion

In ElevenLabs Workspace Settings, create a signed webhook pointing to
`https://<api-host>/api/webhooks/elevenlabs/post-call`. Enable post-call
transcription and call-initiation-failure events, then copy its signing secret
to `ELEVENLABS_CONVAI_WEBHOOK_SECRET`. Completed calls are stored idempotently;
onboarding tests stay out of live metrics, and each of the first five live calls
creates a staff review task.

## Go-live acceptance checklist

- Business description, services, hours, goals, and escalation number are complete.
- Prompt includes anti-hallucination, payment-data, emergency, confirmation, prompt-injection, and transfer-loop guardrails.
- ElevenLabs agent ID is stored and its configuration is versioned.
- Existing Twilio number is imported and assigned to the agent.
- Client completes a real test call.
- Client explicitly marks the call passed.
- Client explicitly approves go-live.
- Portal shows only real calls, leads, bookings, and minutes; demo metrics are never substituted.
- Trial expiration and Stripe reactivation are tested in staging before production.

## Known deployment dependency

The API must run as a persistent Express service or compatible serverless functions. The current static Vercel rewrite serves the Vite frontend only; deploy `server/index.ts` separately (or convert the routes to Vercel functions) and set `VITE_API_URL` to that API origin.
