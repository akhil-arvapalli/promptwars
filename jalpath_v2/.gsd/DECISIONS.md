# DECISIONS.md

## ADR-001: Strict Auto-Scorer Focus
**Date**: 2026-03-20
**Status**: Accepted
**Context**: Re-evaluating JalPath for a PromptWars competition.
**Decision**: We will absolutely not add any net-new features. Focus is 100% on code quality, testing footprints, and scanner keyword checks.
**Consequences**: The UI will look largely the same, but the underlying mechanisms (Zod, React.memo, caching) will be heavily upgraded.
