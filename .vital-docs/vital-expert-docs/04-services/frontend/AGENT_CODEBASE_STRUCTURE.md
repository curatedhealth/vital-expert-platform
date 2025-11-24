# VITAL Agent Codebase Structure Analysis

**Date:** 2025-11-24
**Analysis Type:** Complete Codebase & Worktree Structure

---

## Git Worktree Configuration

```bash
# Main repository
/Users/hichamnaim/Downloads/Cursor/VITAL path (main branch: b353ae38)

# Cursor worktrees (3 detached HEAD instances)
/Users/hichamnaim/.cursor/worktrees/VITAL_path/LfaJf  (b353ae38 - detached HEAD)
/Users/hichamnaim/.cursor/worktrees/VITAL_path/T19UM  (b353ae38 - detached HEAD)
/Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF  (b353ae38 - detached HEAD)
```

**Note:** Multiple Cursor worktrees indicate concurrent editing sessions. All are on the same commit (b353ae38).

---

## Frontend Agent Structure (apps/vital-system)

### 1. Main Agents Page

```
apps/vital-system/src/app/(app)/agents/
└── page.tsx                                   # Main agents dashboard (7 tabs)
```

**Key Features:**
- 7 tabs: Overview, Grid, List, Table, Kanban, Analytics, Graph
- Integrates Phase 2 & Phase 3 components
- Virtual scrolling for 10,000+ agents
- Knowledge Graph visualization (just re-enabled)

### 2. Agent Components

```
apps/vital-system/src/features/agents/components/

Phase 1 (Original):
├── AgentCard.tsx                             # Agent card component
├── AgentImport.tsx                           # Agent import functionality
├── agent-details-modal.tsx                   # Original agent detail modal
├── agent-rag-configuration.tsx               # RAG configuration UI
├── agents-board.tsx                          # Board view for agents
├── agents-overview.tsx                       # Overview dashboard
├── agents-table.tsx                          # Standard table (non-virtualized)
├── enhanced-capability-management.tsx        # Capability editor
├── virtual-advisory-boards.tsx               # Advisory board management
└── index.ts                                  # Component exports

Phase 2 (Performance & UX):
├── agents-table-virtualized.tsx              # ✅ Virtual scrolling (react-window v2)
├── agents-kanban.tsx                         # ✅ Drag-and-drop kanban board
├── agent-creation-wizard.tsx                 # ⏳ Multi-step creation wizard
├── agents-bulk-actions.tsx                   # ⏳ Bulk operations UI
├── agent-detail-modal.tsx                    # ⏳ Enhanced detail modal
├── agents-page-enhanced.tsx                  # ⏳ Enhanced page wrapper
└── agents-table-enhanced.tsx                 # ⏳ Enhanced table wrapper

Phase 3 (Analytics & Visualization):
├── agents-analytics-dashboard.tsx            # ✅ Analytics dashboard
└── knowledge-graph-view.tsx                  # ✅ KG visualization (Neo4j + Pinecone)
```

**Legend:**
- ✅ = Integrated and working
- ⏳ = Created but not integrated yet

### 3. Agent Services

```
apps/vital-system/src/features/agents/services/
├── agent-service.ts                          # Main agent API client
└── [other service files]
```

**Key Methods:**
- `getActiveAgents()` - Fetch agents from `/api/agents-crud`
- `fetchWithRetry()` - Retry logic for cold starts
- Currently experiencing HTTP 500 errors (RLS issue)

### 4. Agent Types

```
apps/vital-system/src/features/agents/types/
└── agent-schema.ts                           # ✅ Type adapter (Phase 2/3)
```

**Key Functions:**
- `convertToClientAgent()` - Store → Client type conversion
- `convertToStoreAgent()` - Client → Store type conversion
- `generateMockUsageData()` - Mock analytics data (TODO: replace with real data)

### 5. Agent Hooks

```
apps/vital-system/src/features/agents/hooks/
└── [agent-related hooks]
```

---

## Backend API Routes (Next.js)

### 1. Primary Agent API Routes

```
apps/vital-system/src/app/api/

agents/                                        # Main agents route
├── [id]/                                     # Individual agent operations
│   ├── route.ts                              # GET/PUT/DELETE specific agent
│   └── [nested routes]
├── check-databases/                          # Database health check
├── query-hybrid/                             # Hybrid search
├── rag-config/                               # RAG configuration
├── recommend/                                # Agent recommendations
├── registry/                                 # Agent registry
├── route.ts                                  # GET all agents (WORKS)
├── search/                                   # Search agents
├── search-hybrid/                            # Hybrid search (v2)
└── sync-to-pinecone/                         # Pinecone sync

agents-crud/                                   # CRUD with auth middleware
├── route.ts                                  # GET/POST agents (HTTP 500 issue)
└── route.secured.ts.disabled                 # Secured version (disabled)

agents-bulk/                                   # Bulk operations
└── route.ts                                  # Bulk update/delete

user-agents/                                   # User-specific agents
└── route.ts                                  # User's custom agents
```

### 2. API Route Status

| Route | Status | Notes |
|-------|--------|-------|
| `/api/agents` | ✅ Working | Returns all agents successfully |
| `/api/agents-crud` | ❌ HTTP 500 | Auth passes, RLS query fails |
| `/api/agents/[id]` | ❓ Unknown | Not tested |
| `/api/agents/search` | ❓ Unknown | Not tested |
| `/api/agents/query-hybrid` | ❓ Unknown | Not tested |

---

## Backend AI Engine (FastAPI)

### 1. Knowledge Graph API

```
services/ai-engine/src/api/routes/
└── knowledge_graph.py                        # ✅ KG routes (just registered)
```

**Endpoints:**
- `GET /v1/knowledge-graph/health` - ✅ Health check
- `GET /v1/agents/{id}/knowledge-graph/stats` - ✅ Agent stats
- `POST /v1/agents/{id}/knowledge-graph/query` - ✅ Query graph
- `GET /v1/agents/{id}/knowledge-graph/neighbors` - ✅ Get neighbors

**Status:** All endpoints working with mock data. Neo4j integration pending.

### 2. FastAPI Main App

```
services/ai-engine/src/
├── main.py                                   # ✅ KG routes registered (line 729-740)
└── api/
    └── routes/
        └── knowledge_graph.py                # KG route handlers
```

---

## Database Schema (Supabase)

### 1. Primary Agent Table

```sql
-- Table: agents
-- Location: Supabase Postgres
-- RLS: Enabled (tenant isolation)

CREATE TABLE agents (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text,
  display_name text,
  description text,
  tagline text,
  avatar text,                                -- Icon reference or emoji
  avatar_url text,                            -- Resolved URL
  system_prompt text NOT NULL,
  base_model text DEFAULT 'gpt-4',
  temperature numeric DEFAULT 0.7,
  max_tokens integer DEFAULT 2000,
  status text DEFAULT 'active',               -- active | testing | inactive | deprecated
  tier integer,                               -- 1 (foundational) | 2 (specialist) | 3 (ultra-specialist)
  capabilities text[],
  knowledge_domains text[],
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Ownership & Multi-tenancy
  created_by uuid REFERENCES auth.users(id),
  tenant_id uuid,
  is_custom boolean DEFAULT false,
  is_library_agent boolean DEFAULT false,

  -- Performance Tracking (from migration 20241124000000)
  avg_response_quality numeric(3,2) DEFAULT 0.0,
  total_interactions integer DEFAULT 0,
  avg_satisfaction_score numeric(3,2) DEFAULT 0.0,
  avg_response_time_ms integer DEFAULT 0,
  total_tokens_used bigint DEFAULT 0,
  last_interaction_at timestamptz,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Agent Performance Metrics

```sql
-- Table: agent_performance_metrics
-- Purpose: Evidence-based agent selection

CREATE TABLE agent_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  interaction_id uuid,

  -- Quality Metrics
  response_quality_score numeric(3,2),        -- 0.0 to 1.0
  user_satisfaction_score integer,            -- 1 to 5
  task_completion_rate numeric(5,2),          -- 0 to 100%

  -- Performance Metrics
  response_time_ms integer,
  tokens_used integer,
  cost_usd numeric(10,4),

  -- Context
  query_text text,
  query_category text,
  feedback_text text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3. AgentOS 3.0 Tables (Neo4j Integration)

```sql
-- Created by migrations: 20241123000000 - 20241123000005

kg_control_plane                              -- Knowledge graph metadata
agent_node_roles                              -- Agent roles in graph
workflow_agent_capabilities                   -- Agent capabilities for workflows
agent_performance_baselines                   -- Performance benchmarks
agent_kg_views                                -- ⏳ KG view definitions (needs data)
graphrag_query_logs                           -- Query audit trail
```

---

## Data Flow

### 1. Agent Loading (Frontend)

```
User opens /agents page
  ↓
AgentsStore.loadAgents()
  ↓
AgentService.getActiveAgents()
  ↓
Fetch /api/agents-crud (with auth)
  ↓
withAgentAuth middleware verifies session
  ↓
Query Supabase agents table (RLS enabled)
  ↓
❌ HTTP 500: RLS query fails
```

**Issue:** User session doesn't have permission to query agents table even though auth succeeds.

### 2. Knowledge Graph Visualization

```
User selects agent in Grid/List
  ↓
Opens agent detail modal
  ↓
Clicks "Graph" tab
  ↓
KnowledgeGraphVisualization component loads
  ↓
Fetch http://localhost:8000/v1/agents/{id}/knowledge-graph/query
  ↓
FastAPI KG route handler
  ↓
✅ Returns mock data (5 nodes, 5 edges)
  ↓
React Flow renders interactive graph
```

**Status:** Working with mock data. Neo4j integration pending.

---

## Current Issues

### 1. HTTP 500 Errors in Agent Loading

**Route:** `/api/agents-crud`
**Status:** ❌ Failing
**Root Cause:** RLS policy blocks user session queries

**Evidence:**
```bash
# Direct curl (no auth) works:
curl http://localhost:3000/api/agents
# => {"success":true,"agents":[...]}

# Browser (with auth) fails:
# => HTTP 500: Internal Server Error
```

**Fix Options:**
1. **Quick:** Switch AgentService to use `/api/agents` (no auth)
2. **Proper:** Fix RLS policies to allow user sessions

### 2. Neo4j Data Not Loaded

**Tables:** `agent_kg_views` empty
**Status:** ⏳ Schema exists, no data

**Next Steps:**
1. Populate `agent_kg_views` for flagship agents
2. Run Neo4j data loading script
3. Update KG routes to query real Neo4j data

---

## Integration Status

### ✅ Complete

1. **Knowledge Graph Backend** - All 4 endpoints accessible
2. **Knowledge Graph Frontend** - Graph tab re-enabled, component working
3. **Virtual Scrolling** - Table handles 10,000+ agents smoothly
4. **Kanban Board** - Drag-and-drop status management working
5. **Analytics Dashboard** - Metrics display (using mock data)

### ⏳ Pending

1. **Agent CRUD Operations** - Creation wizard not integrated
2. **Bulk Actions** - Component created, not integrated
3. **Enhanced Detail Modal** - Not integrated (using original modal)
4. **HTTP 500 Fix** - RLS policy needs update
5. **Neo4j Data** - Load real graph data
6. **Hybrid Search** - Mode 2/4 automatic selection
7. **Deep Agents** - Hierarchical agent patterns

---

## Recommended Next Actions

### Immediate (30 min)

1. **Fix HTTP 500:** Update RLS policy or switch to `/api/agents`
2. **Test KG Tab:** Verify graph visualization in browser

### Short-Term (2-4 hours)

3. **Populate KG Views:** Add agent_kg_views for flagship agents
4. **Integrate Wizard:** Connect agent-creation-wizard to agents page
5. **Add Bulk Actions:** Connect agents-bulk-actions to table tab

### Medium-Term (1-2 days)

6. **Neo4j Integration:** Load real graph data, update KG routes
7. **Hybrid Search:** Implement Mode 2/4 automatic selection
8. **Replace Mock Data:** Connect analytics to real usage tracking

---

## File Locations Summary

```
Frontend (Next.js):
/apps/vital-system/src/
  ├── app/(app)/agents/page.tsx               # Main page
  ├── app/api/agents/route.ts                 # ✅ Working API
  ├── app/api/agents-crud/route.ts            # ❌ HTTP 500 API
  ├── features/agents/components/             # All UI components
  ├── features/agents/services/               # AgentService
  └── features/agents/types/                  # Type adapters

Backend (FastAPI):
/services/ai-engine/src/
  ├── main.py                                 # ✅ KG routes registered
  └── api/routes/knowledge_graph.py           # KG endpoints

Database:
- Supabase: agents, agent_performance_metrics
- Neo4j: Agent graph data (pending load)
- Pinecone: Agent embeddings (for hybrid search)

Documentation:
/.vital-docs/vital-expert-docs/04-services/frontend/
  ├── INTEGRATION_COMPLETE.md                 # Phase 2/3 integration
  ├── KNOWLEDGE_GRAPH_FIX_SUMMARY.md          # KG fix details
  └── AGENT_CODEBASE_STRUCTURE.md             # This file
```

---

## Questions?

- **Agent service failing?** Check `/api/agents-crud` RLS policies
- **KG not showing?** Ensure backend running on port 8000
- **Missing components?** Check `features/agents/components/`
- **Worktree issues?** Use main repo at `/Users/hichamnaim/Downloads/Cursor/VITAL path`

---

**Last Updated:** 2025-11-24
**Current Commit:** b353ae38
