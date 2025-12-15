# Ask Expert Service Audit

Date: 2025-xx-xx  
Scope: AI Engine (FastAPI), API Gateway (Express), Next.js frontend (`apps/vital-system`), database, scripts/tests.

---

## 1) Architecture vs. One-Engine Philosophy
- **Expected (System Context)**: Modular monolith, single front door; agents hydrated from DB → ~7 archetype classes; L1–L5 chain of command; two engines (Interactive Modes 1/2, Mission Modes 3/4) sharing L4/L5 tools; safety gates and observability baked in.
- **Observed**:
  - Frontdoor split: `/ask-expert` Next routes (`/api/ask-expert`, `/api/ask-expert/stream`, `/api/ask-expert/hitl-response`) often call `AI_ENGINE_URL` directly, bypassing Gateway controls.
  - Gateway (`services/api-gateway/src/index.js`): Generic routes/logging; no ask-expert auth/quotas; not consistently used.
  - AI Engine: Mode routes (e.g., `services/ai-engine/src/api/routes/mode1_manual_interactive.py`) stream SSE and hit Supabase; Mode 1 imports a legacy workflow (`_legacy_archive/.../ask_expert_mode1_workflow.py`).
  - Data-as-config: Supabase tables plus migrations for archetypes/configs, L5 registries, workflow templates; client code sometimes bypasses RLS.
  - Frontend: Context + mode services manage sessions/agents; deprecated stream shim translates JSON→SSE instead of consuming engine SSE directly.

---

## 2) Critical Findings (Must Fix)
- **Unauthenticated session access**: `apps/vital-system/src/app/api/ask-expert/route.ts` uses the Supabase service-role key and trusts `userId` from querystring; any caller can read others’ conversations. No tenant binding.
- **Service-role in client paths**: `apps/vital-system/src/features/ask-expert/mode-1/services/session-manager.ts` and `.../message-manager.ts` call Supabase directly from the client with user-supplied IDs; assumes privileged access.
- **Gateway bypass**: `/api/ask-expert/stream` and HITL proxy route traffic straight to `AI_ENGINE_URL` without auth/rate limits; Gateway controls and logging are skipped.
- **Legacy workflow dependency**: Mode 1 route imports from `_legacy_archive/.../ask_expert_mode1_workflow.py`; production depends on archived code with drift risk.
- **Unchecked HITL proxy**: `apps/vital-system/src/app/api/ask-expert/hitl-response/route.ts` forwards approvals/rejections with minimal validation and no auth/rate limits.

---

## 3) Additional Risks / Gaps
- **Tenant/user verification missing in engine**: `get_supabase_client` (Mode 1 route) requires the service-role key and trusts `tenant_id`/`user_id` from the request; no membership check before DB access.
- **Deprecated stream shim**: `apps/vital-system/src/app/api/ask-expert/stream/route.ts` manually translates JSON→SSE and is the default `STREAM_API_URL`; future engine field changes may silently break UI.
- **Observability**: SSE uses manual JSON; errors lack correlation IDs. When gateway is bypassed, logging/metrics are lost.
- **Testing**: No tests cover Next API proxies (session listing, stream, HITL). Load tests hit ask-expert without auth context; RLS/auth protection untested.

---

## 4) Data & Schema Notes
- Agent archetypes/config added in `database/migrations/20251208_agent_archetypes_config.sql`; ensure application reads/uses new columns before feature flags.
- L5 tools registry sync in `database/migrations/20251206_sync_l5_tools_registry.sql`; engine must register referenced modules.
- Workflow templates for modes 1–4 in `database/migrations/024_seed_prebuilt_workflows.sql`; frontend workflow builder references same IDs.

---

## 5) Action Plan (Priority Order)
1. **Lock Supabase access**: Remove service-role from client-facing routes/client code. Require authenticated user/tenant context server-side; validate `userId` from auth, not query params; enforce RLS.
2. **Force gateway path**: Route ask-expert traffic through API Gateway with JWT/tenant checks, rate limits, and audit logs. Deprecate direct `AI_ENGINE_URL` calls from Next routes.
3. **Unarchive workflows**: Move Ask Expert workflows into maintained modules; update imports in engine routes; add regression tests for modes 1–4.
4. **Harden HITL**: Add schema validation, auth, audit logging, and rate limits; consider handling approvals entirely in gateway/backend instead of proxying to engine.
5. **Remove deprecated stream shim**: Point `/ask-expert` UI to mode-specific endpoints; delete JSON→SSE compatibility layer after migration.
6. **Add targeted tests**: Playwright/API tests for session access control, HITL flows, Mode1/Mode3 streaming (happy path + error). Include auth/tenant headers in load tests.
7. **Improve observability**: Add request IDs/correlation to SSE events; structured error events; ensure gateway/engine logs capture ask-expert traffic.

---

## 6) File References
- Next API: `apps/vital-system/src/app/api/ask-expert/route.ts`, `.../stream/route.ts`, `.../hitl-response/route.ts`
- Frontend state/services: `apps/vital-system/src/contexts/ask-expert-context.tsx`, `apps/vital-system/src/features/ask-expert/mode-1/services/{session-manager.ts,message-manager.ts}`
- AI Engine routes: `services/ai-engine/src/api/routes/mode1_manual_interactive.py` (and other mode routes)
- Legacy workflow: `services/ai-engine/src/_legacy_archive/langgraph_workflows/ask_expert/ask_expert_mode1_workflow.py`
- Gateway: `services/api-gateway/src/index.js`
- Migrations: `database/migrations/20251208_agent_archetypes_config.sql`, `20251206_sync_l5_tools_registry.sql`, `024_seed_prebuilt_workflows.sql`

---

## 7) Verification Checklist
- **Auth/RLS**: Authenticated user cannot read others’ sessions via `/api/ask-expert?userId=...`.
- **Streaming**: Mode1/Mode3 SSE matches UI expectations after removing proxy.
- **HITL**: Auth required; malformed payloads rejected; approvals/audits recorded.
- **Load**: k6/Locust through gateway with auth headers; rate limits and RLS enforced.

---

## 8) Alignment with VITAL System Context (One Engine, L1–L5, Modes 1–4)
- **One Engine vs. Split Frontdoor**: The intended single ingress is fragmented; direct Next→Engine calls bypass Gateway controls, breaking the modular-monolith boundary.
- **Agent Hydration vs. Hard Dependencies**: Data-as-config is present (agents table, archetype/config migrations), but Mode 1 is still bound to a legacy workflow module, risking divergence from the ~7 archetype classes pattern.
- **L1–L5 Chain of Command**: Hierarchy is encoded, but safety/authority checks (e.g., L1/L3 strategy, L4 worker execution) are undermined when requests skip auth/tenant validation and RLS.
- **Modes 1/2 (Interactive “Enrich-then-Generate”)**: UI relies on deprecated stream shim; latency path uses legacy workflow import. Needs migration to maintained Mode 1/2 graphs, direct SSE from engine via Gateway.
- **Modes 3/4 (Plan-Execute-Synthesize)**: HITL path lacks auth/validation; no explicit PreFlight enforcement at the proxy layer. Gateway bypass reduces observability of mission safety/cost controls.
- **Safety & Observability**: Documentation promises PreFlight/CircuitBreaker and Langfuse traces; current SSE/error handling lacks request IDs and skips Gateway telemetry when bypassed.
