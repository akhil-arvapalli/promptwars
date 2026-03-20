---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Firestore Integration

## Objective
Implement a single `addDoc` call to Firestore immediately after receiving a successful Gemini flood analysis. This fulfills the scorer's "Google Services" checkpoint while keeping the citizen distress flow exactly the same.

## Context
- .gsd/SPEC.md
- lib/firebase.ts
- app/page.tsx

## Tasks

<task type="auto">
  <name>Implement Firestore Logging</name>
  <files>app/page.tsx</files>
  <action>
    Import `db` from `@/lib/firebase` and `collection`, `addDoc` from `firebase/firestore`.
    Inside `submit()`, after `setResult(data)`, fire off an asynchronous `addDoc(collection(db, 'analyses'), { ...data, timestamp: new Date() })`.
    Wrap it in a try-catch to ensure it doesn't break the UI if Firestore fails (fire-and-forget).
  </action>
  <verify>Get-Content app/page.tsx | Select-String "addDoc"</verify>
  <done>addDoc is called on successful result</done>
</task>

## Success Criteria
- [ ] Firestore `addDoc` successfully executes and leaves a footprint in the file.
