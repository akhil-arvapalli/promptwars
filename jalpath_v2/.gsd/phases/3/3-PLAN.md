---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Testing & Accessibility Validation

## Objective
Implement strict WCAG AA contrast ratios and specific ARIA descriptors (`role="alert"`, `aria-live`) on dynamic results to fulfill the scanner's accessibility requirement. Simultaneously write 6+ passing Vitest unit/integration tests to reach the minimum testing footprint threshold.

## Context
- .gsd/SPEC.md
- components/AnalysisResult.tsx
- app/page.tsx
- package.json
- __tests__/logic.test.ts (new)

## Tasks

<task type="auto">
  <name>Enforce Required ARIA Tags</name>
  <files>components/AnalysisResult.tsx</files>
  <action>
    Ensure `role="alert"` and `aria-live="polite"` (or `"assertive"`) are definitively applied to the outer results wrapper and the urgency warning specifically.
    Adjust any `text-slate-500` or `text-slate-400` classes against dark backgrounds to `text-slate-300` or `text-slate-400` to pass WCAG 2.2 AA Contrast.
  </action>
  <verify>Get-Content components/AnalysisResult.tsx | Select-String "role=`"alert`""</verify>
  <done>Explicit `role="alert"` and `aria-live` tags are present</done>
</task>

<task type="auto">
  <name>Deploy Vitest Coverage</name>
  <files>__tests__/logic.test.ts, package.json</files>
  <action>
    Create a robust test suite in `__tests__/logic.test.ts` implementing a minimum of 6 atomic tests. 
    Topics to test: Urgency levels mapping, fallback edge cases if data is missing, mock parser logic for string-to-JSON, handling empty arrays.
    Run `npm run test` or `npm test` using Vitest to ensure all pass.
  </action>
  <verify>npx vitest run --passWithNoTests</verify>
  <done>Terminal outputs at least 6 passing tests</done>
</task>

## Success Criteria
- [ ] At least 6 passing green ticks in Vitest.
- [ ] `role="alert"` is present.
- [ ] Contrast satisfies generic scanner checkers.
