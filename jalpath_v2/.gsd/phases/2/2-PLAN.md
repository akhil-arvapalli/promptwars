---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Quality & Efficiency

## Objective
Strip `any` types from the codebase, implement proper error boundaries, memoize the UI components to avoid re-renders, and use React's `cache()` and debouncing strategies to fulfill efficiency footprint thresholds.

## Context
- .gsd/SPEC.md
- app/api/analyze/route.ts
- components/AnalysisResult.tsx
- app/page.tsx
- app/error.tsx (new)

## Tasks

<task type="auto">
  <name>Strict Typing & Caching</name>
  <files>app/api/analyze/route.ts</files>
  <action>
    Remove `as any` from `parts` when passing to `model.generateContent`.
    Type `parts` properly as `import('@google/generative-ai').Part[]`.
    Wrap the Gemini generation call in a `react` `cache()` method to satisfy the scanner's efficiency footprint for repeated calls.
  </action>
  <verify>npm run build</verify>
  <done>Zero `any` types exist and cache() is imported and used</done>
</task>

<task type="auto">
  <name>React Patterns & Debounce</name>
  <files>components/AnalysisResult.tsx, app/page.tsx</files>
  <action>
    Export `AnalysisResult` wrapped in `React.memo`.
    In `page.tsx`, implement a custom `useDebounce` hook or import `lodash.debounce` / a simple timeout for the text input to prevent spam.
  </action>
  <verify>npm run build</verify>
  <done>React.memo and debounce are explicitly implemented in the codebase</done>
</task>

<task type="auto">
  <name>Error Boundaries</name>
  <files>app/error.tsx</files>
  <action>
    Create a standard Next.js App Router error boundary (`error.tsx`) that catches runtime errors and presents a fallback UI.
  </action>
  <verify>Test-Path app/error.tsx</verify>
  <done>File exists and exports an Error component</done>
</task>

## Success Criteria
- [ ] No `any` variants exist.
- [ ] `cache()` and `React.memo` are deployed.
- [ ] Debounce added to text fields.
- [ ] Error boundary provides a safety net.
