<!-- PRODUCTION_TAG: PRODUCTION_READY -->
<!-- LAST_VERIFIED: 2025-12-14 -->
<!-- CATEGORY: roadmap -->
<!-- VERSION: 3.0.0 -->

# Modes 1-4: Path to 100% Production Readiness

**Scope:** Unified roadmap across all Ask Expert modes (Mode 1/2 interactive, Mode 3/4 autonomous).

## Current Status (2025-12-14)
- Backend pytest: green with smoke coverage (197 collected, 15 skipped). Skipped areas: hybrid search performance/API benchmarks, phase5 perf, DB/Redis-dependent services, integration/tenant/E2E API suites.
- Functionality hardening:
  - Mode 1: SSE proxy `/api/expert/interactive` with tenant/auth headers; no hardcoded tenant IDs.
  - Mode 3: Template proxy fallback validated; runner imports/`ValidationError` export validated; tenant context used.
  - Mode 2/4: Hybrid search, graph builder, AB testing fail-open if DB/Redis unavailable; `_calculate_overall_score` added; helper methods added; PersonalityConfig defaults `max_tokens` (L2); SearchCache disables gracefully if Redis missing.
- Remaining risks: Hybrid search performance unvalidated; integration/API tests skipped; DB/Redis dependencies not exercised; E2E still skipped.

## Gaps to 100% (all modes)
1) Testing & Coverage
   - Restore skipped suites with fakes or rewrites (hybrid search perf, DB/Redis services, integration/tenant/E2E).
   - Add meaningful coverage for memory integration and RAG config (beyond smoke).
2) Performance & Resilience
   - Validate hybrid search latency/accuracy with real data.
   - Add in-memory fallbacks for cache/DB in tests; keep fail-open behavior in prod.
3) Integration Alignment
   - ASGI httpx fixtures for API tests; ensure required app attributes (supabase_client, etc.).
4) Autonomy & Templates (Modes 3/4)
   - Verify active templates in DB; ensure runner families used in mission registry are live.
5) Frontend E2E (Modes 1-4)
   - Re-enable Playwright once port coordination is solved; cover Mode 2/4 auto-selection flows.

## Next Actions
- Add fakes for DB/Redis to re-enable services/hybrid search tests.
- Relax/parameterize performance assertions; validate on real or seeded data.
- Rewrite integration API suites to use ASGI httpx fixture and stubbed app attrs.
- Expand smoke tests for memory/RAG into functional coverage once fixtures are stable.
