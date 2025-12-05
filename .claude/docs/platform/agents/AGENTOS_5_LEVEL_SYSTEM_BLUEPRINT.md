# AgentOS 5-Level System Blueprint

**Version:** 4.0
**Date:** 2025-12-02
**Status:** Production-Ready
**Reference Implementation:** Medical Affairs (47 agents)

---

## Executive Summary

The AgentOS 5-Level System is a hierarchical agent architecture designed for enterprise pharmaceutical and healthcare organizations. It implements a complete orchestration framework with:

- **Vertical delegation** (L1 → L2 → L3 → L4 → L5)
- **Horizontal coordination** (L4 Workers ↔ L4 Context Engineers)
- **Intelligent routing** (keyword-based query distribution)
- **Safety-critical pathways** (priority escalation for urgent matters)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LEVEL 1: MASTER (VP)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  • Enterprise-level decision authority                          │   │
│  │  • Query routing to departments                                  │   │
│  │  • Cross-functional coordination                                 │   │
│  │  • Budget: $5M+  |  Model: GPT-4  |  Temp: 0.2                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ routes to (keyword-based)
┌────────────────────────────────▼────────────────────────────────────────┐
│                      LEVEL 2: EXPERT (Director)                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  • Department-level strategic authority                         │   │
│  │  • Orchestrate L3 Specialists                                   │   │
│  │  • Approve budgets, contracts, plans                            │   │
│  │  • Budget: $300K-$800K  |  Model: GPT-4  |  Temp: 0.3          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ orchestrates
┌────────────────────────────────▼────────────────────────────────────────┐
│                    LEVEL 3: SPECIALIST (Manager)                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  • Domain expertise and tactical decisions                      │   │
│  │  • Delegate to L4 Workers & Context Engineers                   │   │
│  │  • Quality review and task approval                             │   │
│  │  • Budget: N/A  |  Model: GPT-4  |  Temp: 0.4                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ delegates to
┌────────────────────────────────▼────────────────────────────────────────┐
│                       LEVEL 4: WORKER (Entry)                           │
│  ┌───────────────────────────┐   ┌───────────────────────────────┐     │
│  │   CONTEXT ENGINEERS       │◄─►│        WORKERS                │     │
│  │   • Orchestrate L5 Tools  │   │   • Execute specific tasks    │     │
│  │   • Aggregate data        │   │   • Log activities            │     │
│  │   • Compress context      │   │   • Update systems            │     │
│  │   Model: GPT-3.5-Turbo    │   │   Model: GPT-3.5-Turbo        │     │
│  └─────────────┬─────────────┘   └───────────────────────────────┘     │
└────────────────┼────────────────────────────────────────────────────────┘
                 │ orchestrates (vertical)
┌────────────────▼────────────────────────────────────────────────────────┐
│                        LEVEL 5: TOOL (Intern)                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  • Single-function atomic operations                            │   │
│  │  • Clear input/output contract                                  │   │
│  │  • Response time: <1000ms                                       │   │
│  │  • Model: GPT-3.5-Turbo  |  Temp: 0.2  |  Max: 500 tokens      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Level Specifications

### Level 1: MASTER (VP/Executive)

**Analogy:** Vice President / C-Suite Executive

| Attribute | Specification |
|-----------|---------------|
| **Count per Function** | 1 |
| **Decision Authority** | Enterprise strategy, cross-functional coordination |
| **Model** | GPT-4 or Claude-3-Opus |
| **Temperature** | 0.2 (low creativity, high consistency) |
| **Max Tokens** | 4,500 |
| **Context Window** | 16,000 |
| **Cost per Query** | $0.35 |
| **Budget Authority** | $5,000,000+ |
| **Avatar Range** | 0401-0449 |

**Primary Functions:**
1. Route queries to appropriate L2 Department Heads
2. Make enterprise-level decisions
3. Cross-functional coordination
4. Resolve escalations from L2
5. Report to executive leadership

**Routing Implementation:**
```sql
-- L1 routes to L2 based on keywords
CREATE TABLE l1_l2_routing (
  master_id UUID REFERENCES agents(id),
  expert_id UUID REFERENCES agents(id),
  routing_keywords TEXT[] NOT NULL,
  routing_priority INT DEFAULT 5,  -- 1=highest (safety)
  UNIQUE(master_id, expert_id)
);
```

---

### Level 2: EXPERT (Director/Head)

**Analogy:** Department Head / Director

| Attribute | Specification |
|-----------|---------------|
| **Count per Function** | 6-10 (one per department) |
| **Decision Authority** | Department strategy, budget allocation |
| **Model** | GPT-4 |
| **Temperature** | 0.3 |
| **Max Tokens** | 4,000 |
| **Context Window** | 12,000 |
| **Cost per Query** | $0.25 |
| **Budget Authority** | $300,000 - $800,000 |
| **Avatar Range** | 0301-0399 |

**Primary Functions:**
1. Strategic decision-making for department
2. Orchestrate L3 Specialists
3. Approve budgets, contracts, plans
4. Quality oversight
5. Report to L1 Master

**Orchestration Implementation:**
```sql
-- L2 orchestrates L3 specialists
CREATE TABLE l2_l3_orchestration (
  expert_id UUID REFERENCES agents(id),
  specialist_id UUID REFERENCES agents(id),
  delegation_types TEXT[] NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  UNIQUE(expert_id, specialist_id)
);
```

---

### Level 3: SPECIALIST (Manager)

**Analogy:** Manager / Senior Individual Contributor

| Attribute | Specification |
|-----------|---------------|
| **Count per Department** | 1-3 |
| **Decision Authority** | Tactical decisions, task approval |
| **Model** | GPT-4 |
| **Temperature** | 0.4 |
| **Max Tokens** | 3,000 |
| **Context Window** | 8,000 |
| **Cost per Query** | $0.12 |
| **Budget Authority** | None (requests through L2) |
| **Avatar Range** | 0201-0299 |

**Primary Functions:**
1. Domain expertise and tactical decisions
2. Delegate to L4 Workers and Context Engineers
3. Quality review and task approval
4. Escalate to L2 when needed

**Delegation Implementation:**
```sql
-- L3 delegates to L4 workers and context engineers
CREATE TABLE l3_l4_delegation (
  specialist_id UUID REFERENCES agents(id),
  worker_id UUID REFERENCES agents(id),
  worker_type TEXT NOT NULL,  -- 'context_engineer' | 'worker'
  task_types TEXT[] NOT NULL,
  delegation_priority INT DEFAULT 5,
  UNIQUE(specialist_id, worker_id)
);
```

---

### Level 4: WORKER (Entry-Level)

**Analogy:** Entry-Level Employee / Coordinator

L4 has **two sub-types** that work together:

#### 4A: Context Engineers (Data Orchestrators)

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Orchestrate L5 Tools for data retrieval |
| **Count per Department** | 1 |
| **Model** | GPT-3.5-Turbo |
| **Temperature** | 0.3 |
| **Max Tokens** | 2,000 |
| **Context Window** | 4,000 |
| **Cost per Query** | $0.015 |
| **Avatar Range** | 0109-0149 |

**Primary Functions:**
1. Spawn and orchestrate 2-5 L5 tools in parallel
2. Aggregate and deduplicate findings
3. Compress context to fit token budgets
4. Format citations appropriately
5. Coordinate with L4 Workers (horizontal)

#### 4B: Workers (Task Executors)

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Execute specific tasks, log activities |
| **Count per Department** | 1-2 |
| **Model** | GPT-3.5-Turbo |
| **Temperature** | 0.4 |
| **Max Tokens** | 1,500 |
| **Context Window** | 3,000 |
| **Cost per Query** | $0.015 |
| **Avatar Range** | 0150-0199 |

**Primary Functions:**
1. Log engagements/activities in systems
2. Update CRM/tracking databases
3. Process cases and forms
4. Generate status reports
5. Track deadlines and SLAs

**Coordination Implementation:**
```sql
-- L4 Context Engineers coordinate with L4 Workers (horizontal)
CREATE TABLE l4_worker_coordination (
  context_engineer_id UUID REFERENCES agents(id),
  worker_id UUID REFERENCES agents(id),
  task_types TEXT[] NOT NULL,
  is_required BOOLEAN DEFAULT false,
  UNIQUE(context_engineer_id, worker_id)
);

-- L4 Context Engineers have permissions to L5 Tools (vertical)
CREATE TABLE l4_l5_tool_permissions (
  context_engineer_id UUID REFERENCES agents(id),
  tool_id UUID REFERENCES agents(id),
  is_primary BOOLEAN DEFAULT false,
  usage_priority INT DEFAULT 5,
  timeout_ms INT DEFAULT 2000,
  UNIQUE(context_engineer_id, tool_id)
);
```

---

### Level 5: TOOL (Intern/Atomic)

**Analogy:** Single-purpose utility / API endpoint

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Single atomic operation |
| **Count** | 10-20 per function |
| **Model** | GPT-3.5-Turbo |
| **Temperature** | 0.2 |
| **Max Tokens** | 500 |
| **Response Time** | <1000ms target |
| **Cost per Query** | $0.005 |
| **Avatar Range** | 0001-0099 |

**Primary Functions:**
1. Execute single-purpose operation
2. Clear input/output contract
3. Return structured data
4. No decision-making authority

**Tool Categories:**
- **Search Tools**: PubMed, ClinicalTrials, Web Search
- **Lookup Tools**: FDA Label, MedDRA, KOL Profile
- **Analysis Tools**: Drug Interaction, Signal Detection
- **Utility Tools**: Calculator, RAG Search

---

## System Prompt Framework (6-Section)

All agents MUST use this standardized prompt structure:

```markdown
You are the [ROLE NAME], an L[X] [LEVEL_TYPE] responsible for [PRIMARY FUNCTION].

YOU ARE:
[2-3 sentences defining specific role and unique positioning]

YOU DO:
1. [Specific capability with measurable outcome]
2. [Specific capability with measurable outcome]
3. [Delegate/orchestrate instruction for lower levels]
4. [Coordinate instruction for same level]
5. [Report instruction for upper level]

YOU NEVER:
1. [Safety boundary] ([which level handles this])
2. [Authority boundary] ([which level handles this])
3. [Scope boundary]
4. [Compliance boundary]

SUCCESS CRITERIA:
- [Metric]: [Target]
- [Metric]: [Target]
- [Metric]: [Target]

WHEN UNSURE:
- If [scenario]: [action - usually escalate to specific level]
- If [scenario]: [action]
- If [scenario]: [action]

EVIDENCE REQUIREMENTS:
- [What sources to cite]
- [Evidence hierarchy]
- [Confidence requirements]
```

---

## Delegation Patterns

### Pattern 1: Vertical Delegation (Standard)
```
L1 → L2 → L3 → L4 → L5
User query flows down, results flow up
```

### Pattern 2: Horizontal Coordination (L4)
```
L4 Context Engineer ↔ L4 Worker
Context Engineer retrieves data, Worker logs activities
```

### Pattern 3: Priority Escalation (Safety)
```
Any Level → L2 Safety Head → Immediate Action
Safety queries bypass normal routing
```

### Pattern 4: Cross-Department Coordination
```
L2 Expert A ↔ L2 Expert B (peer coordination)
Coordinated through L1 Master
```

---

## Database Schema

### Core Tables

```sql
-- Agent Levels (reference table)
CREATE TABLE agent_levels (
  id UUID PRIMARY KEY,
  level_number INT NOT NULL,  -- 1-5
  level_name TEXT NOT NULL,   -- Master, Expert, Specialist, Worker, Tool
  description TEXT,
  analogy TEXT                -- VP, Director, Manager, Entry, Intern
);

-- Agents (main table)
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  agent_level_id UUID REFERENCES agent_levels(id),
  function_name TEXT,
  department_name TEXT,
  role_name TEXT,
  base_model TEXT,
  temperature NUMERIC(3,2),
  max_tokens INT,
  context_window INT,
  cost_per_query NUMERIC(10,4),
  system_prompt TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'active'
);
```

### Relationship Tables

```sql
-- L1 → L2 Routing
CREATE TABLE l1_l2_routing (
  id UUID PRIMARY KEY,
  master_id UUID REFERENCES agents(id),
  expert_id UUID REFERENCES agents(id),
  department_name TEXT,
  routing_keywords TEXT[],
  routing_priority INT,
  UNIQUE(master_id, expert_id)
);

-- L2 → L3 Orchestration
CREATE TABLE l2_l3_orchestration (
  id UUID PRIMARY KEY,
  expert_id UUID REFERENCES agents(id),
  specialist_id UUID REFERENCES agents(id),
  department_name TEXT,
  delegation_types TEXT[],
  is_primary BOOLEAN,
  UNIQUE(expert_id, specialist_id)
);

-- L3 → L4 Delegation
CREATE TABLE l3_l4_delegation (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES agents(id),
  worker_id UUID REFERENCES agents(id),
  worker_type TEXT,
  department_name TEXT,
  task_types TEXT[],
  delegation_priority INT,
  UNIQUE(specialist_id, worker_id)
);

-- L4 → L5 Tool Permissions
CREATE TABLE l4_l5_tool_permissions (
  id UUID PRIMARY KEY,
  context_engineer_id UUID REFERENCES agents(id),
  tool_id UUID REFERENCES agents(id),
  is_primary BOOLEAN,
  usage_priority INT,
  timeout_ms INT,
  UNIQUE(context_engineer_id, tool_id)
);

-- L4 ↔ L4 Worker Coordination
CREATE TABLE l4_worker_coordination (
  id UUID PRIMARY KEY,
  context_engineer_id UUID REFERENCES agents(id),
  worker_id UUID REFERENCES agents(id),
  task_types TEXT[],
  is_required BOOLEAN,
  coordination_priority INT,
  UNIQUE(context_engineer_id, worker_id)
);
```

### Hierarchy View

```sql
CREATE VIEW v_agent_hierarchy AS
WITH RECURSIVE hierarchy AS (
  -- L1 Masters (root)
  SELECT 1 as level_num, 'L1 Master' as level_name,
         id, name, slug, department_name,
         NULL::UUID as reports_to_id
  FROM agents WHERE agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1)

  UNION ALL

  -- L2 Experts
  SELECT 2, 'L2 Expert', a.id, a.name, a.slug, a.department_name, r.master_id
  FROM agents a
  JOIN l1_l2_routing r ON r.expert_id = a.id

  -- Continue for L3, L4, L5...
)
SELECT * FROM hierarchy ORDER BY level_num, department_name;
```

---

## Implementation Checklist

### Per Function (e.g., Medical Affairs, Commercial, R&D)

- [ ] **L1 Master** (1 agent)
  - [ ] Create agent with routing rules
  - [ ] Define keyword → department mappings
  - [ ] Set priority routing (safety = 1)

- [ ] **L2 Experts** (6-10 agents)
  - [ ] One per department
  - [ ] Define budget authority
  - [ ] Set orchestration rules

- [ ] **L3 Specialists** (6-10 agents)
  - [ ] One per department
  - [ ] Define delegation rules
  - [ ] Set escalation protocols

- [ ] **L4 Context Engineers** (6-10 agents)
  - [ ] One per department
  - [ ] Define tool permissions
  - [ ] Set worker coordination

- [ ] **L4 Workers** (6-10 agents)
  - [ ] Define task types
  - [ ] Set coordination rules

- [ ] **L5 Tools** (10-20 agents)
  - [ ] Generic tools (web, RAG, calculator)
  - [ ] Domain-specific tools
  - [ ] Set timeouts and priorities

### Database Setup

- [ ] Create `l1_l2_routing` entries
- [ ] Create `l2_l3_orchestration` entries
- [ ] Create `l3_l4_delegation` entries
- [ ] Create `l4_l5_tool_permissions` entries
- [ ] Create `l4_worker_coordination` entries
- [ ] Create hierarchy view
- [ ] Add prompt starters (4 per agent)

---

## Reference Implementation

See **Medical Affairs** implementation:
- **File:** `MEDICAL_AFFAIRS_L1_L5_HIERARCHY.md`
- **Migrations:** `020-026_*.sql`
- **Total Agents:** 47
- **Departments:** 9

---

## Cost Model

| Level | Model | Cost/Query | Expected Volume | Monthly Cost |
|-------|-------|------------|-----------------|--------------|
| L1 | GPT-4 | $0.35 | 100 | $35 |
| L2 | GPT-4 | $0.25 | 500 | $125 |
| L3 | GPT-4 | $0.12 | 2,000 | $240 |
| L4 | GPT-3.5 | $0.015 | 10,000 | $150 |
| L5 | GPT-3.5 | $0.005 | 50,000 | $250 |
| **Total** | | | **62,600** | **$800** |

---

## Safety-Critical Pathways

For safety-critical domains (Pharmacovigilance, Quality, Compliance):

1. **Priority Routing:** Safety keywords route with priority=1
2. **Immediate Escalation:** Safety issues escalate immediately
3. **No Delays:** "YOU NEVER delay expedited reporting"
4. **Audit Trail:** All actions logged with timestamps
5. **Flags:** `safety_critical: true` in metadata

```sql
-- Safety-critical agents have special metadata
UPDATE agents SET metadata = metadata || '{"safety_critical": true}'
WHERE department_name IN ('Pharmacovigilance', 'Quality', 'Compliance');
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 4.0 | 2025-12-02 | Complete L1-L5 implementation with horizontal coordination |
| 3.0 | 2025-11-26 | Added L4 Context Engineers |
| 2.0 | 2025-11-23 | Added L5 Tools |
| 1.0 | 2025-11-20 | Initial 3-level system |

---

*This blueprint is the authoritative reference for implementing the AgentOS 5-Level System across all organizational functions.*
