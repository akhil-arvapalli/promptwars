# JalPath v2

AI-assisted flood emergency support platform built with Next.js, Gemini, Firebase, and a GIS-driven 3D flood simulation workspace.

JalPath helps users quickly understand flood risk from image + text input, then provides structured escape guidance. It also includes a dedicated map-based simulation mode for selecting an Area of Interest (AOI), loading terrain/building data, and visualizing flood progression.

## What This Project Does

- Accepts optional on-ground photo evidence and/or a text description of a flood scenario.
- Calls Gemini through a server API route and returns structured emergency guidance.
- Displays urgency level, estimated water depth, risk factors, step-by-step escape actions, and do-not-do warnings.
- Logs analysis records to Firestore.
- Provides a separate `/flood-sim` experience with:
  - AOI selection on a map
  - Terrain elevation fetch (Open-Meteo)
  - Building footprint fetch (OpenStreetMap Overpass)
  - 3D flood animation and evacuation visualization controls

## Core Stack

- Framework: Next.js 14 (App Router) + React 18 + TypeScript
- AI: Google Gemini (`@google/generative-ai`)
- Data/Storage: Firebase Firestore + Firebase Storage
- UI/Animation: Tailwind CSS + Framer Motion + Lucide icons
- 3D/GIS: Three.js (`@react-three/fiber`, `@react-three/drei`), Leaflet
- Validation: Zod
- Testing: Vitest + Testing Library

## Key User Flows

### 1) Flood Analysis Flow

1. User uploads image and/or enters text context.
2. Frontend sends request to `POST /api/analyze`.
3. Server route validates payload with Zod.
4. Server calls Gemini model and expects strict JSON output.
5. UI renders structured analysis cards and urgency badges.
6. Result is persisted to Firestore (best effort, non-fatal on log failure).

### 2) Flood Simulation Flow

1. User opens `/flood-sim`.
2. User draws/selects AOI and water source points.
3. App fetches elevation and building data from public geodata APIs.
4. 3D scene initializes with terrain + overlays.
5. User controls flood timeline, mesh visibility, buildings, and evacuation layers.

## Project Structure (Important Paths)

- `app/page.tsx` - Main JalPath analysis UI
- `app/api/analyze/route.ts` - Server route for Gemini analysis
- `app/flood-sim/page.tsx` - GIS/3D simulation entry
- `components/AnalysisResult.tsx` - Structured emergency response rendering
- `components/GISSidebar.tsx` - Simulation controls
- `lib/gemini.ts` - Types + prompt helpers + response parsing
- `lib/firebase.ts` - Firebase client initialization
- `lib/geodata.ts` - Elevation/building fetch logic
- `__tests__/` - Unit/component test coverage

## API Contract

### Analyze Endpoint

- Method: `POST`
- Route: `/api/analyze`
- Request body:

```json
{
  "imageBase64": "<optional-base64-string>",
  "imageMimeType": "image/jpeg",
  "text": "Water is knee deep and moving fast"
}
```

- Typical response shape:

```json
{
  "urgency": "HIGH",
  "waterDepth": "KNEE",
  "depthCm": 55,
  "riskFactors": ["Strong lateral water flow"],
  "escapeActions": [
    { "step": 1, "action": "Move to higher ground", "detail": "...", "icon": "⬆️" }
  ],
  "safetyNote": "Avoid low-lying roads near drains.",
  "doNotDo": ["Do not drive through moving water"],
  "confidence": 82
}
```

Note: Gemini output is expected as raw JSON and parsed server-side.

## Prerequisites

- Node.js 18+
- npm 9+
- Gemini API key
- Firebase project with Firestore and Storage enabled

## Environment Variables

Create `.env.local` using `.env.local.example`:

```bash
# Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase (public client identifiers)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Local Development

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000` for main AI analysis app
- `http://localhost:3000/flood-sim` for simulation workspace

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - Run lint checks
- `npm run test` - Run test suite once
- `npm run test:watch` - Run tests in watch mode

## Testing

Run all tests:

```bash
npm run test
```

Current test folders include:

- `__tests__/gemini.test.ts`
- `__tests__/logic.test.ts`
- `__tests__/UrgencyBadge.test.tsx`

## Deployment Notes

- Can be deployed on Vercel (recommended for Next.js) or any Node-compatible host.
- Ensure all environment variables are configured in the deployment platform.
- Firebase security rules files are included:
  - `firestore.rules`
  - `storage.rules`

## Deploy to Google Cloud Run

This repo now includes a production-ready `Dockerfile` and `.dockerignore` for Cloud Run.

### 1) Prerequisites

- Google Cloud project with billing enabled
- `gcloud` CLI installed and authenticated
- Required APIs enabled: Cloud Run, Artifact Registry, Cloud Build

### 2) Set project variables

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### 3) Build and push container image

Run from `jalpath_v2/`:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/jalpath-v2
```

### 4) Deploy service

```bash
gcloud run deploy jalpath-v2 \
  --image gcr.io/YOUR_PROJECT_ID/jalpath-v2 \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...,NEXT_PUBLIC_FIREBASE_PROJECT_ID=...,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...,NEXT_PUBLIC_FIREBASE_APP_ID=... \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

Recommended: keep `GEMINI_API_KEY` in Secret Manager and inject it with `--set-secrets`.

### 5) Verify deployment

```bash
gcloud run services describe jalpath-v2 --region asia-south1 --format='value(status.url)'
```

Open the returned URL and test:

- Main app: `/`
- Simulation page: `/flood-sim`
- API health check (manual): `POST /api/analyze`

## Safety and Scope Disclaimer

JalPath provides AI-assisted emergency guidance for rapid triage and awareness. It is not a substitute for official emergency response services. In critical conditions, contact local emergency authorities immediately.

## Versioning Context

This folder is the JalPath v2 package created from the challenge-2 implementation and committed under:

- `jalpath_v2/`

Use this directory as the canonical source for the v2 submission in the PromptWars repository.
