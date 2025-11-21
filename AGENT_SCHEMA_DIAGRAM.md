# Agent Schema Relationship Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MULTITENANCY FOUNDATION                          │
└─────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │  organizations   │ (Tenants)
                          │  (tenants)       │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ tenant_key       │
                          │ tenant_type      │
                          │ is_active        │
                          └────────┬─────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
       ┌─────────▼─────────┐  ┌───▼──────────┐  ┌──▼───────────────┐
       │ tenant_agents     │  │tenant_configs │  │ tenant_feature   │
       │ (junction)        │  │               │  │ _flags           │
       ├───────────────────┤  ├───────────────┤  ├──────────────────┤
       │ tenant_id (FK)    │  │ tenant_id (FK)│  │ tenant_id (FK)   │
       │ agent_id (FK)     │  │ ui_config     │  │ feature_flag_id  │
       │ is_enabled        │  │ enabled_apps  │  │ enabled          │
       │ custom_config     │  │ agent_tiers   │  └──────────────────┘
       └─────────┬─────────┘  └───────────────┘
                 │
                 │
┌────────────────▼───────────────────────────────────────────────────────┐
│                           AGENT SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │     agents       │ (Core Agent Table)
                          ├──────────────────┤
                          │ id (PK)          │
                          │ tenant_id (FK)   │
                          │ name (unique)    │
                          │ display_name     │
                          │ tier (1-5)       │
                          │ capabilities[]   │ Array of capability slugs
                          │ domain_expertise[]│ Array of domains
                          │ system_prompt    │
                          │ model            │
                          │ metadata (JSONB) │
                          │ status           │
                          └────┬──────┬──────┘
                               │      │
                    ┌──────────┘      └──────────┐
                    │                            │
    ┌───────────────▼────────┐    ┌──────────────▼───────────┐
    │ agent_capabilities     │    │ agent_knowledge_domains  │
    │ (proficiency tracking) │    │ (domain expertise)       │
    ├────────────────────────┤    ├──────────────────────────┤
    │ agent_id (FK)          │    │ agent_id (FK)            │
    │ capability_id (FK)     │    │ knowledge_domain_id (FK) │
    │ proficiency_level      │    │ domain_name              │
    │ is_primary             │    │ proficiency_level        │
    │ usage_count            │    │ is_primary_domain        │
    │ success_rate           │    └────────────┬─────────────┘
    └────────────┬───────────┘                 │
                 │                              │
    ┌────────────▼───────────┐    ┌────────────▼─────────────┐
    │   capabilities         │    │  knowledge_domains       │
    │   (capability registry)│    │  (domain registry)       │
    ├────────────────────────┤    ├──────────────────────────┤
    │ id (PK)                │    │ id (PK)                  │
    │ capability_name        │    │ code                     │
    │ capability_slug        │    │ name                     │
    │ display_name           │    │ slug                     │
    │ category               │    │ tier                     │
    │ complexity_level       │    │ priority                 │
    │ required_model         │    │ rag_namespace            │
    └────────────┬───────────┘    └──────────────────────────┘
                 │
    ┌────────────▼───────────┐
    │  capability_skills     │
    │  (capability → skill)  │
    ├────────────────────────┤
    │ capability_id (FK)     │
    │ skill_id (FK)          │
    │ relationship_type      │
    │ importance_level       │
    │ usage_context          │
    └────────────┬───────────┘
                 │
    ┌────────────▼───────────┐
    │      skills            │
    │   (tools/functions)    │
    ├────────────────────────┤
    │ id (PK)                │
    │ skill_name             │
    │ skill_slug             │
    │ category               │
    │ invocation_method      │
    │ required_model         │
    └────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────────┘

                     ┌──────────────────────┐
                     │ workflow_instances   │ (Ask Expert/Panel execution)
                     ├──────────────────────┤
                     │ id (PK)              │
                     │ tenant_id (FK)       │
                     │ user_id              │
                     │ workflow_type        │ ask_expert, ask_panel, etc.
                     │ workflow_mode        │ 1, 2, 3, 4 (for Ask Panel)
                     │ input_data (JSONB)   │ Question, context, params
                     │ status               │ pending, running, completed
                     │ output_data (JSONB)  │ Aggregated results
                     │ started_at           │
                     │ completed_at         │
                     │ duration_seconds     │ Auto-calculated
                     └──────┬──────┬────────┘
                            │      │
                 ┌──────────┘      └──────────┐
                 │                            │
   ┌─────────────▼────────┐      ┌────────────▼──────────┐
   │  workflow_steps      │      │  agent_assignments    │
   │  (sequential steps)  │      │  (parallel execution) │
   ├──────────────────────┤      ├───────────────────────┤
   │ workflow_instance_id │◄─────┤ workflow_instance_id  │
   │ step_number          │      │ workflow_step_id (FK) │
   │ step_type            │      │ agent_id (FK) ────────┼──┐
   │ assigned_agent_id    │      │ assignment_role       │  │
   │ input_data (JSONB)   │      │ status                │  │
   │ output_data (JSONB)  │      │ agent_response (JSONB)│  │
   │ status               │      │ response_summary      │  │
   │ duration_seconds     │      │ confidence_score      │  │
   └──────────────────────┘      │ duration_seconds      │  │
                                 └───────────────────────┘  │
                                                            │
                                              ┌─────────────┘
                                              │ (Links back to agents table)
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │     agents       │
                                    └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      QUERY PATTERNS & FLOWS                             │
└─────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════╗
║  FLOW 1: Ask Expert - Single Agent Selection                          ║
╚═══════════════════════════════════════════════════════════════════════╝

User Question ──► get_workflow_compatible_agents()
                         │
                         ├──► Query: agents
                         ├──► Join: agent_knowledge_domains
                         ├──► Join: tenant_agents (RLS)
                         ├──► Calculate: match_score (0-100)
                         │      ├─ Capability match (40 pts)
                         │      ├─ Domain match (40 pts)
                         │      └─ Tier bonus (20 pts)
                         │
                         ├──► Order by: match_score DESC
                         └──► LIMIT 1

                         ▼
                    Best Agent
                         │
                         ▼
              Create workflow_instance
                         │
                         ▼
              Create agent_assignment
                         │
                         ▼
              Execute Agent (LLM call)
                         │
                         ▼
          Update agent_assignment (response)
                         │
                         ▼
         Complete workflow_instance (output)


╔═══════════════════════════════════════════════════════════════════════╗
║  FLOW 2: Ask Panel Mode 2 - SME Panel (3-5 agents)                    ║
╚═══════════════════════════════════════════════════════════════════════╝

User Question ──► get_workflow_compatible_agents()
                         │
                         ├──► p_min_tier: 2
                         ├──► p_max_tier: 3
                         ├──► LIMIT 5
                         │
                         ▼
                Panel Agents (ranked)
                    │
                    ├──► Agent 1 (match_score: 95)
                    ├──► Agent 2 (match_score: 88)
                    ├──► Agent 3 (match_score: 82)
                    ├──► Agent 4 (match_score: 75)
                    └──► Agent 5 (match_score: 70)
                         │
                         ▼
              Create workflow_instance
                (mode: 2, type: ask_panel)
                         │
                         ▼
         Create agent_assignments (parallel)
                    │
                    ├──► Assignment 1 (role: primary)
                    ├──► Assignment 2 (role: specialist)
                    ├──► Assignment 3 (role: specialist)
                    ├──► Assignment 4 (role: reviewer)
                    └──► Assignment 5 (role: reviewer)
                         │
                         ▼
         Execute All Agents in Parallel
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Agent 1        Agent 2        Agent 3 ...
      Response       Response       Response
          │              │              │
          └──────────────┼──────────────┘
                         ▼
         Update agent_assignments (responses)
                         │
                         ▼
              Aggregate Responses
                (in workflow_instance.output_data)
                         │
                         ├─ Consensus: "Agreement on X"
                         ├─ Divergence: "Agent 2 disagrees on Y"
                         └─ Recommendation: "Synthesized answer"
                         │
                         ▼
         Complete workflow_instance


╔═══════════════════════════════════════════════════════════════════════╗
║  FUNCTION: get_workflow_compatible_agents() - Scoring Logic            ║
╚═══════════════════════════════════════════════════════════════════════╝

Input:
  - tenant_id: UUID
  - workflow_type: text
  - required_capabilities: text[]
  - required_domains: text[]
  - min_tier, max_tier: int

Processing:
  1. Filter by tenant_id (via tenant_agents)
  2. Filter by status IN ('active', 'testing')
  3. Filter by tier BETWEEN min_tier AND max_tier

  4. Calculate match_score:

     Capability Score (0-40):
       ├─ Count matching capabilities
       ├─ Each match: +10 points
       └─ Cap at 40 points

     Domain Score (0-40):
       ├─ Count matching domains
       ├─ Each match: +10 points
       └─ Cap at 40 points

     Tier Bonus (0-20):
       ├─ Tier 1: +20 points (Master)
       ├─ Tier 2: +15 points (Expert)
       ├─ Tier 3: +10 points (Specialist)
       └─ Tier 4+: +5 points

  5. Sort by match_score DESC, tier ASC, name ASC

Output:
  - agent_id
  - agent_name
  - display_name
  - tier
  - capabilities[]
  - knowledge_domains[]
  - match_score (0-100)


┌─────────────────────────────────────────────────────────────────────────┐
│                        INDEX STRATEGY                                   │
└─────────────────────────────────────────────────────────────────────────┘

Critical Indexes for Sub-50ms Performance:

agents table:
  ├─ idx_agents_tenant (tenant_id)
  ├─ idx_agents_tier (tier) WHERE tier IS NOT NULL
  ├─ idx_agents_status (status)
  ├─ idx_agents_capabilities (GIN index on capabilities array)
  ├─ idx_agents_domain_expertise (GIN index on domain_expertise array)
  ├─ idx_agents_workflow_selection (tenant_id, status, tier)
  └─ idx_agents_embedding (IVFFlat for vector search)

agent_knowledge_domains:
  ├─ idx_agent_kd_agent (agent_id)
  ├─ idx_agent_kd_domain (knowledge_domain_id)
  ├─ idx_agent_kd_proficiency (proficiency_level)
  └─ idx_agent_kd_primary (is_primary_domain) WHERE is_primary_domain = true

workflow_instances:
  ├─ idx_workflow_instances_tenant (tenant_id)
  ├─ idx_workflow_instances_user (user_id)
  ├─ idx_workflow_instances_type (workflow_type)
  ├─ idx_workflow_instances_status (status)
  └─ idx_workflow_instances_active (tenant_id, status, created_at DESC)
      WHERE status IN ('pending', 'running')

agent_assignments:
  ├─ idx_agent_assignments_workflow (workflow_instance_id)
  ├─ idx_agent_assignments_agent (agent_id)
  ├─ idx_agent_assignments_status (status)
  └─ idx_agent_assignments_active (agent_id, status, assigned_at DESC)
      WHERE status IN ('assigned', 'working')


┌─────────────────────────────────────────────────────────────────────────┐
│                    DATA FLOW SUMMARY                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────►│  API Routes  │────►│  SQL Functions  │
│   (React)   │     │  (Next.js)   │     │  (PostgreSQL)   │
└─────────────┘     └──────────────┘     └─────────────────┘
      │                    │                       │
      │                    │                       │
      ▼                    ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   agents     │  │  workflows   │  │  tenants    │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                         │
│  RLS Policies: Multi-tenant Isolation                  │
│  Indexes: Sub-50ms Query Performance                   │
│  Triggers: Auto-calculate Durations                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Table Size Estimates

```
Expected Production Scale (1 year):

agents:                    ~500 rows       (100 KB)
agent_knowledge_domains:   ~2,000 rows     (200 KB)
agent_capabilities:        ~1,500 rows     (150 KB)
capabilities:              ~100 rows       (50 KB)
skills:                    ~150 rows       (75 KB)
knowledge_domains:         ~50 rows        (25 KB)

workflow_instances:        ~100,000 rows   (50 MB)
workflow_steps:            ~300,000 rows   (150 MB)
agent_assignments:         ~500,000 rows   (250 MB)

Total: ~450 MB for 1 year of workflow history
```

---

## Performance Characteristics

```
Query Type                    Avg Time    Max Time    Index Used
────────────────────────────────────────────────────────────────
Single agent selection        20-30ms     50ms        idx_agents_workflow_selection
Panel selection (5 agents)    60-100ms    150ms       idx_agents_workflow_selection
Workflow creation             30-50ms     100ms       Primary keys
Workflow history              20-40ms     100ms       idx_workflow_instances_user
Agent workload tracking       40-60ms     150ms       idx_agent_assignments_active
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RLS POLICY LAYERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Service Role (Full Access)                       │
│  ────────────────────────────────────────────              │
│  - Bypasses all RLS policies                               │
│  - Used by API routes for admin operations                 │
│                                                             │
│  Layer 2: Tenant Isolation                                 │
│  ────────────────────────────────────────────              │
│  - tenant_agents: Filter by tenant_id                      │
│  - workflow_instances: Filter by tenant_id                 │
│  - Users only see their tenant's data                      │
│                                                             │
│  Layer 3: User Ownership                                   │
│  ────────────────────────────────────────────              │
│  - workflow_instances: WHERE user_id = auth.uid()          │
│  - Users only see their own workflows                      │
│                                                             │
│  Layer 4: Read-Only Public Data                            │
│  ────────────────────────────────────────────              │
│  - knowledge_domains: All authenticated users can read     │
│  - capabilities: All authenticated users can read          │
│  - agent_knowledge_domains: All users can read             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**End of Diagram**
