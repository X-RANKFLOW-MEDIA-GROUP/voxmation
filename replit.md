# Voxmation — AI Voice Agent Platform

## Overview
Voxmation is a React + TypeScript SPA for an AI voice agent platform targeting home service businesses. It includes a marketing site, an interactive demo with ElevenLabs TTS, and a client portal backed by Supabase.

## Architecture

### Frontend (Vite + React + TypeScript)
- **Port:** 5000
- **Entry:** `src/main.tsx` → `src/App.tsx`
- **Routing:** React Router v6
- **Auth:** Supabase Auth (client-side, `src/contexts/AuthContext.tsx`)
- **DB queries:** Direct Supabase client calls from portal pages
- **Realtime:** Supabase Realtime subscriptions in Dashboard and VoiceAgent pages
- **UI:** shadcn/ui + Tailwind CSS + Framer Motion

### Backend API Server (Express + TypeScript)
- **Port:** 3001
- **Entry:** `server/index.ts`
- **Routes:**
  - `POST /api/tts` — ElevenLabs text-to-speech proxy (keeps API key server-side)
  - `GET /health` — Health check

### Supabase (External)
- Authentication, PostgreSQL database, Realtime
- Project ID: `aydosserhcfdbvonslgx`
- URL stored in `VITE_SUPABASE_URL` env var

## Key Pages
| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/Index.tsx` | Marketing homepage |
| `/demo` | `src/pages/Demo.tsx` | Interactive voice demo with ElevenLabs TTS |
| `/pricing` | `src/pages/Pricing.tsx` | Pricing page |
| `/auth` | `src/pages/Auth.tsx` | Login / signup |
| `/portal` | `src/pages/portal/Dashboard.tsx` | Client portal dashboard |
| `/portal/voice-agent` | `src/pages/portal/VoiceAgent.tsx` | Call recordings & transcripts |
| `/portal/leads` | `src/pages/portal/Leads.tsx` | Lead management |
| `/portal/bookings` | `src/pages/portal/Bookings.tsx` | Appointment bookings |

## Environment Variables & Secrets
| Key | Type | Where |
|-----|------|-------|
| `VITE_SUPABASE_URL` | Env var | Replit env vars |
| `VITE_SUPABASE_PROJECT_ID` | Env var | Replit env vars |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Secret | Replit Secrets |
| `ELEVENLABS_API_KEY` | Secret | Replit Secrets |
| `DATABASE_URL` | Secret | Replit-managed (provisioned DB) |

## Development
```bash
npm run dev        # Starts both Vite (port 5000) and Express API (port 3001)
npm run dev:vite   # Vite only
npm run dev:server # Express API only
```

## Deployment
- Build: `npm run build` (Vite)
- Run: `node ./dist/index.cjs`
- Target: Autoscale
