# Phase 3 Build Fixes Applied

## Issues Fixed

### 1. Token Counter Optional Dependencies
**Problem:** Dynamic imports of optional dependencies (`tiktoken`, `@anthropic-ai/tokenizer`) were causing build-time analysis errors.

**Solution:** 
- Added runtime checks with `.catch(() => null)`
- Added server-side only check (`typeof window === 'undefined'`)
- Proper fallback to estimation method

**Files Modified:**
- `apps/digital-health-startup/src/features/ask-expert/mode-1/utils/token-counter.ts`

### 2. Circuit Breaker Metrics Import
**Problem:** Module-level import of metrics service in circuit-breaker.ts was being analyzed by Next.js for client/server boundaries.

**Solution:**
- Moved to lazy-loaded function (`setupMetricsTracking`)
- Wrapped in Promise.resolve().then() for async execution
- Only executed server-side

**Files Modified:**
- `apps/digital-health-startup/src/features/ask-expert/mode-1/utils/circuit-breaker.ts`

## Verification

Run build:
```bash
npm run build
```

Expected: Build succeeds with warnings only (optional dependencies).

