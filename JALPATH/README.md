# JalPath

Gemini-powered flood escape guidance app built with Next.js and Firebase.

## Prerequisites

- Node.js 18+
- npm
- Firebase project (Auth, Firestore, Storage)
- Gemini API key

## Local setup

1. Install dependencies:
   npm install
2. Create env file:
   Copy .env.local.example to .env.local and fill all values.
3. Start dev server:
   npm run dev
4. Run tests:
   npm test

## Push to GitHub

1. Initialize git (if not already initialized):
   git init
2. Stage files:
   git add .
3. Create first commit:
   git commit -m "feat: initial jalpath scaffold"
4. Add remote:
   git remote add origin <your-repo-url>
5. Push:
   git branch -M main
   git push -u origin main

## Important

- Do not commit .env.local
- Keep GEMINI_API_KEY only in local/secret environment
