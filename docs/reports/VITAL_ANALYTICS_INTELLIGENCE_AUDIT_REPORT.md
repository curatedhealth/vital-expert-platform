# VITAL Analytics, Monitoring & Unified Intelligence Audit Report

Version: 1.0  
Date: 2025-11-01  
Author: Codex CLI – Analytics/Observability Audit

---

## 0) Executive Summary

This report inventories all monitoring, analytics, and intelligence components in the VITAL codebase, compares the current implementation against the “VITAL Unified Intelligence & Tier 1 Implementation Strategy,” and provides a unified architecture, dataflow maps, gaps, and a prioritized remediation plan.

Key takeaways:

- Foundations are strong: Prometheus + Grafana + Alertmanager stack is defined; the Python AI Engine exports rich Prometheus metrics and has Langfuse for LLM observability; the Next.js app exposes a Prometheus‑compatible `/api/metrics` endpoint and has an Agent Analytics dashboard/API.
- Fragmentation remains: The TypeScript/Next structured logger is not yet wired to the Prometheus exporter (so intended Prom metrics may remain sparse); Langfuse is only integrated on Python; API Gateway exposes a minimal `/metrics`; unified warehouse (TimescaleDB) is defined in strategy but not yet migrated.
- Highest impact next steps: (1) Wire logger → Prometheus exporter in Next, (2) enable Langfuse on TS side, (3) adopt prom-client in API Gateway, (4) add Sentry, (5) implement Timescale migrations for unified analytics.

---

## 1) Current Architecture (ASCII)

### 1.1 Observability & Analytics — Current

```
                        ┌──────────────────────────────────────────────┐
                        │                  FRONTEND                    │
                        │        Next.js (apps/digital-health)        │
                        │  ─ /api/metrics (Prom-compatible)            │
                        │  ─ Structured Logger (PII-sanitized)         │
                        │  ─ (Planned) Prom Exporter wiring            │
                        └───────────────┬──────────────────────────────┘
                                        │ HTTP scrape (/api/metrics)
                         ┌──────────────▼──────────────┐
                         │        API GATEWAY          │
                         │ Node/Express                │
                         │  ─ /metrics (basic text)    │
                         └──────────────┬──────────────┘
                                        │ HTTP scrape (/metrics)
                   ┌────────────────────▼────────────────────┐
                   │            PYTHON AI ENGINE             │
                   │ FastAPI                                 │
                   │  ─ /metrics (Prometheus client)         │
                   │  ─ Langfuse (LLM traces, Python)        │
                   └───────────────────┬─────────────────────┘
                                       │
                       ┌───────────────▼────────────────┐
                       │         PROMETHEUS              │
                       │  Scrapes: FE, GW, AI Engine     │
                       └───────────────┬────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │          GRAFANA            │
                        │  Dashboards: RAG, Agents    │
                        └──────────────┬──────────────┘
                                       │ Alerts
                    ┌──────────────────▼──────────────────┐
                    │             ALERTMANAGER            │
                    │ Slack, PagerDuty routes (config)    │
                    └─────────────────────────────────────┘

  (Planned Unified Warehouse)          (LLM Observability – Python Only)
   TimescaleDB (Supabase)  ◀────────  Langfuse (Python) 
```

### 1.2 Unified Intelligence — Strategy (Target)

```
┌───────────────────────────────────────────────────────────────────────┐
│                     UNIFIED INTELLIGENCE PLATFORM                      │
│                                                                       │
│   ┌────────────────────────── Real-time Analytics ──────────────────┐ │
│   │  User Behavior • Agent Performance • Cost • Quality • Health    │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                            ▲                          ▲               │
│                            │                          │               │
│   ┌────────────────────────┴───────────────┐  ┌───────┴────────────┐ │
│   │     Unified Data Warehouse (Timescale) │  │  LLM Observability │ │
│   │  Hypertables + MVs + Retention/Compression │  │   (Langfuse)    │ │
│   └─────────────────────────────────────────┘  └────────────────────┘ │
│                 ▲             ▲            ▲            ▲             │
│                 │             │            │            │             │
│   ┌─────────────┴──────┐ ┌────┴────────┐ ┌─┴────────┐ ┌─┴─────────┐ │
│   │ Prometheus Metrics │ │ App Events  │ │ Cost     │ │ Behavior  │ │
│   │ (FE/GW/AI Engine)  │ │ (Supabase)  │ │ Tracking │ │ Analytics │ │
│   └───────────┬────────┘ └────┬────────┘ └──┬───────┘ └──┬─────────┘ │
│               │               │               │           │           │
│      FE ─ GW ─┴─ AI Engine    │               │           │           │
│                 (emit)        │               │           │           │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2) Inventory — What’s Implemented Today

### 2.1 Metrics Endpoints

| Service | Endpoint | Format | Status | File |
|---|---|---|---|---|
| Frontend (Next.js) | `/api/metrics?format=prometheus` | Prometheus text (composed) | Implemented | `apps/digital-health-startup/src/app/api/metrics/route.ts` |
| API Gateway (Node) | `/metrics` | Basic Prom text (manual) | Minimal | `services/api-gateway/src/index.js` |
| Python AI Engine (FastAPI) | `/metrics` | Prometheus client | Implemented | `services/ai-engine/src/main.py`, `core/monitoring.py` |

### 2.2 Prometheus/Grafana/Alertmanager

| Component | Status | Notes | Files |
|---|---|---|---|
| Prometheus | Configured | Scrapes FE, GW, AI Engine; rules loaded | `monitoring/prometheus/prometheus.yml`, `monitoring/prometheus/alerts/*.yml` |
| Grafana | Provisioned | Dashboards for RAG, Agents, AI Engine | `monitoring/grafana/dashboards/*.json` |
| Alertmanager | Configured | Slack/PagerDuty routes in config | `monitoring/alertmanager/alertmanager.yml` |

### 2.3 LLM Observability

| Area | Tech | Status | Files |
|---|---|---|---|
| Python AI Engine | Langfuse | Implemented | `services/ai-engine/src/services/langfuse_monitor.py` |
| TypeScript/Next | Langfuse | Not implemented (planned) | `OBSERVABILITY_INTEGRATION_SUMMARY.md` (plan) |

### 2.4 Frontend (Next) Observability

| Capability | Status | Files |
|---|---|---|
| PII‑aware Structured Logger | Implemented | `apps/digital-health-startup/src/lib/services/observability/structured-logger.ts` |
| Prometheus Exporter (metrics registry) | Implemented | `apps/digital-health-startup/src/lib/services/observability/prometheus-exporter.ts` |
| Logger → Exporter wiring | Missing (should call exporter per log entry) | same as above |
| Sentry | Not integrated | plan docs only |
| Otel (Node/Next) | Packages present in lockfile, not wired | plan docs only |

### 2.5 Analytics & Admin

| Item | Status | Files |
|---|---|---|
| Agent Analytics API | Implemented (combines DB + Prom exporter if present) | `apps/digital-health-startup/src/app/api/analytics/agents/route.ts` |
| Agent Metrics Service (DB detail + aggregation) | Implemented | `apps/digital-health-startup/src/lib/services/observability/agent-metrics-service.ts` |
| Admin Agent Analytics Dashboard (UI) | Implemented | `apps/digital-health-startup/src/components/admin/AgentAnalyticsDashboard.tsx` |

### 2.6 Cost Tracking & RAG Evaluation

| Domain | Status | Files |
|---|---|---|
| Cost Tracking (TS) | Implemented (Supabase + Redis; Gemini/Pinecone/Redis/Cohere) | `apps/digital-health-startup/src/lib/services/monitoring/cost-tracker.ts` |
| RAG Latency/Cost Trackers (TS) | Implemented | referenced by `/api/metrics` route |
| RAGAS Evaluation (TS) | Implemented | `apps/digital-health-startup/src/features/rag/evaluation/ragas-evaluator.ts` |

### 2.7 Unified Warehouse (TimescaleDB)

| Item | Status | Evidence |
|---|---|---|
| Timescale Extension Enablement | Not migrated | strategy SQL present; migrations not found |
| Hypertables (platform_events, tenant_cost_events, agent_executions) | Not migrated | strategy SQL present |
| Retention/Compression Policies | Not migrated | strategy SQL present |

---

## 3) Dataflows — Current (ASCII)

### 3.1 Metrics Flow

```
Client Actions ──▶ Next.js Handlers/Services
     │                     │
     │     (structured logs emitted; PII sanitized)
     ▼                     │
  (Missing) Logger → Prom Exporter (TS)
     │                     │
     └──────────────▶ /api/metrics – Prometheus text (composed) ──▶ Prometheus

API Gateway  ──▶ /metrics (basic uptime/memory) ────────────────▶ Prometheus

Python AI Engine ──▶ /metrics (prom_client: latency, errors, RAG) ─▶ Prometheus

Prometheus ─▶ Grafana Dashboards/Alerts ─▶ Alertmanager ─▶ Slack/PagerDuty
```

### 3.2 LLM Observability Flow (Current)

```
Python AI Engine (LLM calls)
  ├─ trace spans (retrieval, generation)
  ├─ token usage & latency
  └─ Langfuse (Python SDK) ──▶ Langfuse UI (cloud/self-host)

TypeScript/Next.js: Not yet integrated with Langfuse
```

### 3.3 Unified Analytics (Planned)

```
Events & Metrics (FE, GW, AI) ─▶ TimescaleDB Hypertables
        │                             │
        │                             ├─ Retention/Compression
        │                             ├─ MVs (tenant_daily_summary)
        │                             └─ BI Dashboards/Reports
        └─ Cost entries (per tenant/user/query) ─▶ tenant_cost_events
```

---

## 4) Assessment Against Strategy

### 4.1 Phase 1 — Unified Intelligence Foundation

| Strategy Step | Spec Summary | Status | Evidence/Notes |
|---|---|---|---|
| Deploy Monitoring Stack | Prometheus, Grafana, Alertmanager running with dashboards | Configured; deploy to prod pending | `monitoring/docker-compose.yml`, dashboards & alerts exist |
| Enable TimescaleDB | `CREATE EXTENSION`, schemas, hypertables, retention & compression | Not migrated | Strategy SQL present; migrations not found |
| Event Collection Infra | Unified event APIs + Redis buffer | Partial | TS unified-analytics exists in strategy doc; DB tables not created |
| Integrate Analytics into Services | FE/GW/AI emit standardized events | Partial | FE logger → Prom exporter missing; AI Engine OK; GW minimal |
| Alert Routing | Alertmanager routes by severity/category | Implemented | `monitoring/alertmanager/alertmanager.yml` |

### 4.2 Phase 2 — Real-Time Observability

| Area | Strategy | Status | Evidence/Notes |
|---|---|---|---|
| Live dashboards | <1s refresh, P95/P99 | Partial | Dashboards exist; FE metrics may be sparse w/o exporter wiring |
| LLM Observability | Langfuse across services | Partial | Python only; TS pending integration |
| API Gateway metrics | Standard Prom metrics | Partial | basic text; migrate to `prom-client` |

### 4.3 Phase 3 — Business Intelligence Layer

| Area | Strategy | Status | Notes |
|---|---|---|---|
| Unified Warehouse | Timescale hypertables + MVs | Not migrated | Requires Supabase migrations |
| BI Dashboards | Exec dashboards (cost, health, quality) | Partial | Admin Agent Analytics exists; Timescale views pending |

### 4.4 Phase 4 — Tier 1 Agent Tools

| Tool | Purpose | Status |
|---|---|---|
| CostGuard | Cost attribution/optimization | Planned |
| AgentCoach | Agent scoring & improvements | Partial (RAGAS, agent_metrics service) |
| Tenant Health | Health scoring & churn alerts | Planned |
| LLMJudge | Continuous evaluation | Partial (RAGAS) |

---

## 5) Gap Analysis & Risks

| Gap | Impact | Area | Recommendation |
|---|---|---|---|
| FE logger → Prom exporter not wired | Grafana panels/alerts under-report | Frontend | Call `getPrometheusExporter().recordFromLog(logEntry)` within structured logger |
| Langfuse absent in TS | No LLM traces for TS portions | Frontend/Edge | Integrate Langfuse TS SDK with a thin wrapper |
| API Gateway metrics minimal | Limited visibility/SLOs | Gateway | Replace manual `/metrics` with `prom-client` (http latency, reqs, errors) |
| Timescale not enabled | No unified source of truth | DB | Add Supabase migrations for Timescale + hypertables + policies |
| Sentry missing | Error triage slower; poor dev‑ex | FE/GW/AI | Add Sentry across Next/Gateway; optional for Python |
| Consent UX missing | Privacy risk (GDPR/CCPA) | FE | Add consent banner + toggle; only emit product analytics after consent |
| Otel not wired | No end‑to‑end tracing | FE/GW/AI | Add basic Otel Node/Python spans for key flows |

---

## 6) Unified Architecture & Data Model (Proposed)

### 6.1 Standardized Metrics Naming (examples)

| Domain | Metric | Type | Labels |
|---|---|---|---|
| RAG | `rag_latency_milliseconds` | gauge | `component` (`query_embedding`/`vector_search`/`reranking`/`generation`) |
| Agents | `agent_search_duration_ms_bucket` | histogram | `operation`,`method` |
| Agents | `agent_selection_total` | counter | `mode`,`confidence_level` |
| Quality | `agent_response_quality_score` | histogram | `agent_id` |
| Cost | `tenant_daily_cost_usd` | gauge | `tenant_id`,`service` |

### 6.2 TimescaleDB Hypertables (from strategy)

Core tables:

```
analytics.platform_events (time, tenant_id, user_id, event_type, event_category, event_data, ...)
analytics.tenant_cost_events (time, tenant_id, user_id, cost_type, cost_usd, quantity, service, ...)
analytics.agent_executions (time, tenant_id, user_id, agent_id, agent_type, execution_time_ms, success, quality_score, ...)
```

Policies:

- Retention: 3–7 years depending on domain; compression after 30 days.
- Indexes: `(tenant_id, time desc)`, `(event_type, time desc)`, `(agent_id, time desc)`.

### 6.3 End‑to‑End (ASCII)

```
Users → Next (structured logs) → Prom Exporter → /api/metrics  ↘
                                                       Prometheus → Grafana/Alertmanager
API Gateway (prom-client) → /metrics                   ↗
Python AI Engine (prom_client) → /metrics             ↗

LLM calls → Langfuse (TS & Python) → Langfuse UI

App Events/Costs/Executions → Timescale Hypertables → MVs → BI Dashboards/API
```

---

## 7) Prioritized Recommendations & Timeline

### Week 1–2 (Foundation)

- Wire logger → Prom exporter in Next; verify `agent_*`/`graphrag_*` metrics populate.
- Convert API Gateway `/metrics` to `prom-client` (http_server_requests, histograms, errors).
- Enable Sentry in Next + Gateway (server/client/edge configs).
- Confirm Prometheus scrapes FE, GW, AI Engine; import Grafana dashboards; validate alerts fire.

### Week 3–4 (Real‑Time + LLM Observability)

- Integrate Langfuse TS SDK; trace retrieval/generation, token usage, costs.
- Add OpenTelemetry basic tracing across FE/GW/AI; export OTLP → collector (Jaeger/Tempo optional).
- Create incident runbooks and wire Alertmanager routes to teams.

### Week 5–6 (Unified Warehouse & BI)

- Add Supabase migrations to enable Timescale and create hypertables + MVs + policies.
- Add ingestion path from services (e.g., batched inserts, Redis buffers) to Timescale.
- Build Executive dashboards (cost, health, quality) against Timescale views.

### Week 7–8 (Tier 1 Agent Tools)

- CostGuard, AgentCoach (RAGAS + executions), Tenant Health scorer; expose as admin tools/APIs.
- Close-loop actions: A/B suggestions, model/caching recommendations, threshold auto-tuning.

---

## 8) KPI Map (Instrumentation → Outcomes)

| KPI | Metric(s) | Source | SLO/Goal |
|---|---|---|---|
| RAG P95 Latency | `rag_latency_p95_milliseconds` | FE metrics + AI Engine | < 2000 ms |
| Error Rate | `*_errors_total / *_total` | FE/GW/AI | < 1% |
| Cache Hit Rate | `rag_cache_hit_rate` | FE | > 30% |
| Cost per Query | `cost_usd` per success | Timescale + Langfuse | ↓ 15–20% |
| Quality (RAGAS) | context precision/recall, faithfulness, relevancy | RAGAS + Langfuse scores | > 0.8 |
| Tenant Health | aggregate engagement/satisfaction/errors | Timescale MVs | > 80/100 |

---

## 9) Code References (selected)

> Note: Paths are workspace‑relative.

- Monitoring stack: `monitoring/docker-compose.yml`, `monitoring/prometheus/prometheus.yml`, `monitoring/alertmanager/alertmanager.yml`, `monitoring/grafana/dashboards/*.json`
- Python metrics: `services/ai-engine/src/core/monitoring.py`, `services/ai-engine/src/main.py`
- API Gateway metrics (basic): `services/api-gateway/src/index.js`
- Next `/api/metrics`: `apps/digital-health-startup/src/app/api/metrics/route.ts`
- Prom exporter (TS): `apps/digital-health-startup/src/lib/services/observability/prometheus-exporter.ts`
- Structured logger (TS): `apps/digital-health-startup/src/lib/services/observability/structured-logger.ts`
- Agent analytics API/UI: `apps/digital-health-startup/src/app/api/analytics/agents/route.ts`, `apps/digital-health-startup/src/components/admin/AgentAnalyticsDashboard.tsx`
- Langfuse (Python): `services/ai-engine/src/services/langfuse_monitor.py`

---

## 10) Appendix — Minimal Migration Sketch (Timescale)

> Implement as Supabase migrations; adjust schemas as needed and include RLS policies.

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Schemas
CREATE SCHEMA IF NOT EXISTS analytics;

-- Platform events
CREATE TABLE IF NOT EXISTS analytics.platform_events (
  time timestamptz NOT NULL,
  tenant_id uuid NOT NULL,
  user_id uuid,
  event_type text NOT NULL,
  event_category text NOT NULL,
  event_data jsonb NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
SELECT create_hypertable('analytics.platform_events', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_platform_events_tenant_time ON analytics.platform_events (tenant_id, time DESC);

-- Cost events
CREATE TABLE IF NOT EXISTS analytics.tenant_cost_events (
  time timestamptz NOT NULL,
  tenant_id uuid NOT NULL,
  user_id uuid,
  cost_type text NOT NULL,
  cost_usd numeric(10,4) NOT NULL,
  quantity integer,
  service text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
SELECT create_hypertable('analytics.tenant_cost_events', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_cost_events_tenant_time ON analytics.tenant_cost_events (tenant_id, time DESC);

-- Agent executions
CREATE TABLE IF NOT EXISTS analytics.agent_executions (
  time timestamptz NOT NULL,
  tenant_id uuid NOT NULL,
  user_id uuid,
  agent_id text NOT NULL,
  agent_type text NOT NULL,
  execution_time_ms integer NOT NULL,
  success boolean NOT NULL,
  error_type text,
  quality_score numeric(3,2),
  user_rating integer,
  cost_usd numeric(10,4),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
SELECT create_hypertable('analytics.agent_executions', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_agent_exec_agent_time ON analytics.agent_executions (agent_id, time DESC);

-- Retention & compression policies
SELECT add_retention_policy('analytics.platform_events', interval '3 years', if_not_exists => TRUE);
SELECT add_retention_policy('analytics.tenant_cost_events', interval '7 years', if_not_exists => TRUE);
SELECT add_retention_policy('analytics.agent_executions', interval '3 years', if_not_exists => TRUE);

ALTER TABLE analytics.platform_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id'
);
SELECT add_compression_policy('analytics.platform_events', interval '30 days', if_not_exists => TRUE);
```

---

## 11) Closing

By implementing the wiring and migrations above, VITAL will move from a partially wired metrics footprint to a unified, Tier‑1 intelligence platform with real‑time visibility, LLM observability across services, and a durable analytics warehouse underpinning internal AI agents and business decisions.

