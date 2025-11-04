# Agent Analytics Status Report

**Date:** January 29, 2025  
**Review Status:** ✅ **ANALYZED**

---

## Current State

### ✅ What Exists

1. **Agent Analytics Dashboard Component**
   - Location: `apps/digital-health-startup/src/components/admin/AgentAnalyticsDashboard.tsx`
   - Status: Complete UI component with tabs, charts, time range selector
   - Features: Overview, Search Performance, GraphRAG Metrics, Mode Execution

2. **Agent Analytics API Endpoint**
   - Location: `apps/digital-health-startup/src/app/api/analytics/agents/route.ts`
   - Status: Partial implementation
   - **Issue**: Returns mostly placeholder/empty data
   - TODO: "Replace with actual Prometheus metrics parsing"

3. **Prometheus Metrics Exporter**
   - Location: `apps/digital-health-startup/src/lib/services/observability/prometheus-exporter.ts`
   - Status: ✅ Complete
   - Metrics defined: `agentMetrics` (search, selection, graphrag, ranking, mode execution)
   - Integrated with structured logger (automatic export)

4. **Database Schema**
   - Table: `agent_metrics` (defined in database types)
   - Schema:
     ```typescript
     {
       id: string;
       agent_id: string;
       tenant_id: string;
       usage_count: number;
       average_latency_ms: number | null;
       satisfaction_score: number | null;
       last_used_at: string | null;
       date: string; // Daily aggregation
       metadata: Json;
       created_at: string;
       updated_at: string;
     }
     ```
   - **Status**: Table definition exists but no migration file found

---

## Gaps Identified

### ❌ Missing Components

1. **Database Migration**
   - ❌ No SQL migration file for `agent_metrics` table
   - The table might not exist in the database
   - Need to verify if table exists, create if not

2. **Agent Metrics Service**
   - ❌ No service to collect and store agent metrics in database
   - Metrics are exported to Prometheus but not persisted
   - Need historical tracking for analytics

3. **Metrics Collection Integration**
   - ❌ Agent operations don't call metrics service
   - Need to integrate recording in:
     - Agent selector service
     - Mode 2/3 services
     - Unified orchestrator
     - Agent search API

4. **Analytics API Enhancement**
   - ⚠️ Currently returns placeholder data
   - Needs to query:
     - Prometheus metrics (real-time)
     - Database `agent_metrics` table (historical)
     - Combine both for comprehensive analytics

---

## Phase 6 Requirements

### 6.1 Database Migration

**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_agent_metrics.sql`

Create `agent_metrics` table matching the TypeScript schema.

### 6.2 Agent Metrics Service

**File:** `apps/digital-health-startup/src/lib/services/observability/agent-metrics-service.ts` (NEW)

**Features:**
- Record agent operation metrics
- Store in database (historical)
- Export to Prometheus (already done via existing exporter)
- Support aggregation queries
- Daily rollup support

**Methods:**
```typescript
class AgentMetricsService {
  async recordOperation(metrics: AgentOperationMetrics): Promise<void>
  async getMetrics(agentId?: string, timeRange?: string): Promise<AgentMetrics[]>
  async getAggregatedMetrics(timeRange: string): Promise<AggregatedMetrics>
}
```

### 6.3 Integration Points

**Files to Update:**
- `agent-selector-service.ts` - Record search metrics
- `mode2-automatic-agent-selection.ts` - Record mode 2 metrics
- `mode3-autonomous-automatic.ts` - Record mode 3 metrics
- `unified-langgraph-orchestrator.ts` - Record orchestrator metrics
- `/api/agents/search/route.ts` - Record API metrics

### 6.4 Analytics API Enhancement

**File:** `apps/digital-health-startup/src/app/api/analytics/agents/route.ts` (UPDATE)

**Enhancements:**
- Query Prometheus metrics (real-time, last N hours)
- Query database `agent_metrics` table (historical)
- Combine both sources
- Calculate aggregates (averages, P95, trends)

---

## Database Schema Comparison

### Current TypeScript Schema
```typescript
agent_metrics: {
  id: string;
  agent_id: string;
  tenant_id: string;
  usage_count: number; // Daily aggregated
  average_latency_ms: number | null;
  satisfaction_score: number | null;
  last_used_at: string | null;
  date: string; // Daily aggregation key
  metadata: Json;
  created_at: string;
  updated_at: string;
}
```

### Phase 6 Plan Schema (from plan document)
```sql
agent_metrics: {
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  tenant_id UUID REFERENCES tenants(id),
  conversation_id UUID,
  user_id UUID REFERENCES auth.users(id),
  query_text TEXT,
  response_time_ms INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10, 6),
  satisfaction_score INTEGER CHECK (1-5),
  error_occurred BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ
}
```

**Difference:** 
- Current schema is **daily aggregated** (one row per agent per day)
- Plan schema is **per-operation** (one row per agent operation)

**Decision Needed:** Which approach?
- Option A: Per-operation (detailed, more storage, better for analysis)
- Option B: Daily aggregated (less storage, summary only)
- Option C: Hybrid (both detailed and aggregated tables)

---

## Recommended Approach

**Hybrid Approach** (Best of both worlds):

1. **Detailed Table** (`agent_metrics`):
   - One row per operation
   - Full detail: query_text, tokens, cost, response_time, etc.
   - Used for detailed analysis

2. **Aggregated Table** (`agent_metrics_daily`):
   - One row per agent per day
   - Rolled up metrics: total_operations, avg_latency, total_cost, etc.
   - Used for dashboard summaries and performance

3. **Rollup Job** (optional):
   - Daily job to aggregate detailed → daily
   - Can be done via Supabase function or scheduled task

---

## Next Steps for Phase 6

1. ✅ **Verify/Create Migration**
   - Check if `agent_metrics` table exists
   - Create detailed table schema (per-operation)
   - Create daily aggregation table (optional)

2. ✅ **Create Metrics Service**
   - Implement `AgentMetricsService`
   - Integrate with Prometheus exporter
   - Store in database

3. ✅ **Integrate Collection**
   - Add metrics recording to all agent operations
   - Fire-and-forget async recording

4. ✅ **Enhance Analytics API**
   - Query both Prometheus and database
   - Combine real-time + historical data
   - Calculate comprehensive statistics

---

**Status:** Ready to proceed with Phase 6 implementation

