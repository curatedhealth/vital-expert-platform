# 5-Level Agent Hierarchy - Database Schema Design

## Overview
This document defines the database schema to support VITAL's 5-level deep agent architecture as specified in the Ask Expert PRD v2.0.

---

## Core Schema Design Principles

1. **Hierarchical Flexibility**: Support 5 levels (Master → Expert → Specialist → Worker → Tool)
2. **Dynamic Relationships**: Agents can have multiple parents and children
3. **Relationship Types**: Different delegation patterns (delegates_to, supervises, collaborates_with, consults, escalates_to, uses)
4. **Agent Capabilities**: Store reasoning capabilities, spawning permissions, performance metrics
5. **Multi-Tenant Support**: Organizational isolation
6. **Performance Optimization**: Denormalized fields for quick access

---

## 1. AGENTS Table (Enhanced)

### Existing Schema (Confirmed from DB):
```sql
-- Core fields (EXISTING)
id                      UUID PRIMARY KEY
tenant_id               UUID (nullable)
name                    TEXT (unique)
slug                    TEXT (unique)
tagline                 TEXT
description             TEXT
title                   TEXT

-- Organizational mapping (EXISTING)
role_id                 UUID
function_id             UUID
department_id           UUID
persona_id              UUID
function_name           TEXT
department_name         TEXT
role_name               TEXT

-- Expertise (EXISTING)
expertise_level         TEXT ('beginner', 'intermediate', 'expert', 'master')
years_of_experience     INTEGER

-- Visual (EXISTING)
avatar_url              TEXT
avatar_description      TEXT

-- AI Configuration (EXISTING)
system_prompt           TEXT
base_model              TEXT (default: 'gpt-4')
temperature             NUMERIC (default: 0.70)
max_tokens              INTEGER (default: 4000)
communication_style     TEXT

-- Status (EXISTING)
status                  TEXT ('development', 'testing', 'active', 'deprecated')
validation_status       TEXT ('draft', 'pending', 'validated')
deleted_at              TIMESTAMP

-- Metrics (EXISTING)
usage_count             INTEGER
average_rating          NUMERIC
total_conversations     INTEGER

-- Metadata (EXISTING)
metadata                JSONB
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

### NEW COLUMNS TO ADD:
```sql
-- 5-Level Hierarchy
agent_level             TEXT NOT NULL DEFAULT 'expert'
                        CHECK (agent_level IN ('master', 'expert', 'specialist', 'worker', 'tool'))

-- Master Agent (for Levels 2-5)
master_agent_id         UUID REFERENCES agents(id) ON DELETE SET NULL
master_agent_name       TEXT  -- Denormalized

-- Industry Vertical
industry_vertical       TEXT CHECK (industry_vertical IN (
                            'pharmaceuticals', 'medical_devices', 'biotechnology',
                            'digital_health', 'diagnostics', 'healthcare_services',
                            'health_insurance', 'hospital_systems', 'clinical_research',
                            'regulatory_affairs'
                        ))

-- Agent Capabilities (NEW)
reasoning_capabilities  JSONB DEFAULT '{
    "chain_of_thought": false,
    "tree_of_thoughts": false,
    "self_critique": false,
    "constitutional_ai": false
}'

-- Sub-Agent Spawning (NEW)
can_spawn_specialists   BOOLEAN DEFAULT false
can_spawn_workers       BOOLEAN DEFAULT false
max_spawned_agents      INTEGER DEFAULT 0

-- Performance Benchmarks (NEW)
accuracy_score          NUMERIC(4,2)  -- 0.00-1.00
response_time_p50       INTEGER       -- milliseconds
response_time_p95       INTEGER       -- milliseconds
satisfaction_rating     NUMERIC(3,2)  -- 0.00-5.00

-- Specialized Capabilities
domain_expertise        TEXT[]        -- ['FDA', 'EMA', 'Clinical Trials']
certifications          TEXT[]        -- ['RAC', 'PMP', 'PhD']
knowledge_sources       TEXT[]        -- ['FDA.gov', 'PubMed', 'ICH']

-- Tool Integration (for Level 5)
tool_type               TEXT CHECK (tool_type IN (
                            'database', 'search', 'calculator', 'generator',
                            'analyzer', 'validator', 'integration'
                        ))
tool_endpoint           TEXT          -- API endpoint for tool agents
tool_auth_method        TEXT          -- OAuth, API Key, etc.
tool_rate_limit         INTEGER       -- Requests per minute

-- Cost & Quota
cost_per_query          NUMERIC(10,4)
monthly_quota           INTEGER       -- Max queries per month
```

---

## 2. AGENT_HIERARCHIES Table (Enhanced)

### Current Schema (Confirmed):
```sql
CREATE TABLE agent_hierarchies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Relationship (EXISTING)
    parent_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    child_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Relationship Type (EXISTING)
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'delegates_to',
        'supervises',
        'collaborates_with',
        'consults',
        'escalates_to'
    )),
    
    -- Delegation Rules (EXISTING)
    delegation_trigger TEXT,
    auto_delegate BOOLEAN DEFAULT false,
    confidence_threshold NUMERIC(3,2),
    
    -- Timestamps (EXISTING)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints (EXISTING)
    CONSTRAINT no_self_hierarchy CHECK (parent_agent_id != child_agent_id),
    UNIQUE(parent_agent_id, child_agent_id, relationship_type)
);
```

### NEW COLUMNS TO ADD:
```sql
-- Hierarchy Level Context
parent_level            TEXT CHECK (parent_level IN ('master', 'expert', 'specialist', 'worker', 'tool'))
child_level             TEXT CHECK (child_level IN ('master', 'expert', 'specialist', 'worker', 'tool'))

-- Enhanced Relationship Type (ADD 'uses' for Level 5)
relationship_type       TEXT NOT NULL CHECK (relationship_type IN (
    'delegates_to',       -- Master → Expert, Expert → Specialist, Specialist → Worker
    'supervises',         -- Management oversight
    'collaborates_with',  -- Peer-to-peer (shared sub-agents)
    'consults',          -- Expert consultation
    'escalates_to',      -- Upward escalation
    'uses'               -- Worker → Tool (NEW)
))

-- Spawning Context (for dynamic specialists/workers)
is_dynamic_spawn        BOOLEAN DEFAULT false  -- Created on-the-fly vs pre-defined
spawn_condition         JSONB                   -- Conditions that trigger spawning
max_concurrent_spawns   INTEGER DEFAULT 1      -- Limit parallel spawns

-- Execution Context
execution_order         INTEGER                 -- Sequential execution order
is_parallel             BOOLEAN DEFAULT false   -- Can execute in parallel
timeout_seconds         INTEGER DEFAULT 60      -- Max execution time

-- Performance & Priority
priority_score          INTEGER DEFAULT 50      -- 0-100, for tie-breaking
weight                  NUMERIC(3,2) DEFAULT 1.0 -- For weighted consensus

-- Conditional Routing
routing_rules           JSONB                   -- Complex routing logic
fallback_agent_id       UUID REFERENCES agents(id) -- If primary fails

-- Metrics
total_delegations       INTEGER DEFAULT 0
successful_delegations  INTEGER DEFAULT 0
avg_delegation_time     INTEGER                 -- milliseconds
```

---

## 3. NEW TABLE: AGENT_LEVELS (Reference Table)

```sql
CREATE TABLE agent_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 5),
    level_name TEXT NOT NULL UNIQUE,
    level_description TEXT,
    
    -- Capabilities by Level
    can_spawn_children BOOLEAN DEFAULT false,
    max_children INTEGER,
    default_reasoning_capabilities JSONB,
    
    -- Performance Targets
    target_response_time_p50 INTEGER,  -- milliseconds
    target_response_time_p95 INTEGER,
    target_accuracy NUMERIC(4,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO agent_levels (level_number, level_name, level_description, can_spawn_children, max_children) VALUES
(1, 'master', 'Orchestrators - coordinate multiple experts', true, 50),
(2, 'expert', 'Domain Specialists - 136+ specialized agents', true, 10),
(3, 'specialist', 'Sub-Experts - dynamically spawned as needed', true, 5),
(4, 'worker', 'Task Executors - parallel task execution', true, 10),
(5, 'tool', 'Integration Tools - 100+ specialized tools', false, 0);
```

---

## 4. NEW TABLE: AGENT_CAPABILITIES

```sql
CREATE TABLE agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Capability Definition
    capability_name TEXT NOT NULL,
    capability_type TEXT CHECK (capability_type IN (
        'reasoning',      -- Chain-of-thought, Tree-of-thoughts
        'action',         -- Execute tasks, spawn agents
        'integration',    -- External tools
        'domain_knowledge' -- Expertise areas
    )),
    capability_description TEXT,
    
    -- Proficiency
    proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    
    -- Validation
    is_validated BOOLEAN DEFAULT false,
    validation_score NUMERIC(3,2),
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, capability_name)
);

CREATE INDEX idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX idx_agent_capabilities_type ON agent_capabilities(capability_type);
```

---

## 5. NEW TABLE: AGENT_VERTICAL_MAPPING

```sql
CREATE TABLE agent_vertical_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Vertical Assignment
    industry_vertical TEXT NOT NULL CHECK (industry_vertical IN (
        'pharmaceuticals',
        'medical_devices',
        'biotechnology',
        'digital_health',
        'diagnostics',
        'healthcare_services',
        'health_insurance',
        'hospital_systems',
        'clinical_research',
        'regulatory_affairs'
    )),
    
    -- Vertical-Specific Config
    vertical_expertise_level TEXT CHECK (vertical_expertise_level IN ('beginner', 'intermediate', 'expert', 'master')),
    vertical_priority INTEGER DEFAULT 50,  -- Primary vs secondary vertical
    
    -- Usage in Vertical
    queries_in_vertical INTEGER DEFAULT 0,
    avg_rating_in_vertical NUMERIC(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, industry_vertical)
);

CREATE INDEX idx_agent_vertical_agent ON agent_vertical_mapping(agent_id);
CREATE INDEX idx_agent_vertical_industry ON agent_vertical_mapping(industry_vertical);
```

---

## 6. NEW TABLE: AGENT_SPAWN_HISTORY

```sql
CREATE TABLE agent_spawn_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Spawn Context
    parent_agent_id UUID NOT NULL REFERENCES agents(id),
    spawned_agent_id UUID NOT NULL REFERENCES agents(id),
    spawn_reason TEXT,
    spawn_trigger JSONB,
    
    -- Session Context
    conversation_id UUID,  -- Links to conversation
    user_query TEXT,
    
    -- Lifecycle
    spawned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Result
    spawn_successful BOOLEAN,
    output_summary TEXT,
    
    -- Performance
    response_time_ms INTEGER,
    tokens_used INTEGER,
    cost NUMERIC(10,4)
);

CREATE INDEX idx_spawn_history_parent ON agent_spawn_history(parent_agent_id);
CREATE INDEX idx_spawn_history_spawned ON agent_spawn_history(spawned_agent_id);
CREATE INDEX idx_spawn_history_conversation ON agent_spawn_history(conversation_id);
```

---

## 7. Enhanced AGENT_GRAPHS Table (Already Exists from AgentOS 2.0)

```sql
-- Add new columns for 5-level support
ALTER TABLE agent_graphs ADD COLUMN IF NOT EXISTS
    graph_level TEXT CHECK (graph_level IN ('master', 'expert', 'specialist', 'worker', 'tool')),
    supports_spawning BOOLEAN DEFAULT false,
    max_execution_time INTEGER DEFAULT 300;  -- seconds
```

---

## 8. NEW TABLE: MASTER_AGENTS (Level 1 Registry)

```sql
CREATE TABLE master_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL UNIQUE REFERENCES agents(id),
    
    -- Master Identity
    master_domain TEXT NOT NULL UNIQUE CHECK (master_domain IN (
        'regulatory',
        'clinical',
        'market_access',
        'technical',
        'strategic',
        'medical_excellence',
        'operations'
    )),
    
    -- Master Capabilities
    orchestration_strategy TEXT,  -- How master coordinates experts
    max_concurrent_experts INTEGER DEFAULT 5,
    expert_selection_algorithm TEXT DEFAULT 'semantic_routing',
    
    -- Performance
    total_orchestrations INTEGER DEFAULT 0,
    avg_orchestration_time INTEGER,  -- milliseconds
    success_rate NUMERIC(4,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_master_agents_domain ON master_agents(master_domain);
```

---

## 9. Migration Script

```sql
-- Migration: Add 5-level support to existing agents table
ALTER TABLE agents 
    ADD COLUMN IF NOT EXISTS agent_level TEXT NOT NULL DEFAULT 'expert'
        CHECK (agent_level IN ('master', 'expert', 'specialist', 'worker', 'tool')),
    ADD COLUMN IF NOT EXISTS master_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS master_agent_name TEXT,
    ADD COLUMN IF NOT EXISTS industry_vertical TEXT
        CHECK (industry_vertical IN (
            'pharmaceuticals', 'medical_devices', 'biotechnology',
            'digital_health', 'diagnostics', 'healthcare_services',
            'health_insurance', 'hospital_systems', 'clinical_research',
            'regulatory_affairs'
        )),
    ADD COLUMN IF NOT EXISTS reasoning_capabilities JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS can_spawn_specialists BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS can_spawn_workers BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS max_spawned_agents INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS accuracy_score NUMERIC(4,2),
    ADD COLUMN IF NOT EXISTS response_time_p50 INTEGER,
    ADD COLUMN IF NOT EXISTS response_time_p95 INTEGER,
    ADD COLUMN IF NOT EXISTS satisfaction_rating NUMERIC(3,2),
    ADD COLUMN IF NOT EXISTS domain_expertise TEXT[],
    ADD COLUMN IF NOT EXISTS certifications TEXT[],
    ADD COLUMN IF NOT EXISTS knowledge_sources TEXT[],
    ADD COLUMN IF NOT EXISTS tool_type TEXT
        CHECK (tool_type IN (
            'database', 'search', 'calculator', 'generator',
            'analyzer', 'validator', 'integration'
        )),
    ADD COLUMN IF NOT EXISTS tool_endpoint TEXT,
    ADD COLUMN IF NOT EXISTS cost_per_query NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS monthly_quota INTEGER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_level ON agents(agent_level);
CREATE INDEX IF NOT EXISTS idx_agents_master ON agents(master_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_vertical ON agents(industry_vertical);
CREATE INDEX IF NOT EXISTS idx_agents_domain_expertise ON agents USING GIN(domain_expertise);

-- Update agent_hierarchies
ALTER TABLE agent_hierarchies
    ADD COLUMN IF NOT EXISTS parent_level TEXT,
    ADD COLUMN IF NOT EXISTS child_level TEXT,
    ADD COLUMN IF NOT EXISTS is_dynamic_spawn BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS spawn_condition JSONB,
    ADD COLUMN IF NOT EXISTS execution_order INTEGER,
    ADD COLUMN IF NOT EXISTS is_parallel BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS routing_rules JSONB,
    ADD COLUMN IF NOT EXISTS total_delegations INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS successful_delegations INTEGER DEFAULT 0;

-- Update relationship_type to include 'uses'
ALTER TABLE agent_hierarchies DROP CONSTRAINT IF EXISTS agent_hierarchies_relationship_type_check;
ALTER TABLE agent_hierarchies ADD CONSTRAINT agent_hierarchies_relationship_type_check
    CHECK (relationship_type IN ('delegates_to', 'supervises', 'collaborates_with', 'consults', 'escalates_to', 'uses'));

CREATE INDEX IF NOT EXISTS idx_hierarchies_parent_level ON agent_hierarchies(parent_level);
CREATE INDEX IF NOT EXISTS idx_hierarchies_child_level ON agent_hierarchies(child_level);
CREATE INDEX IF NOT EXISTS idx_hierarchies_execution ON agent_hierarchies(execution_order);
```

---

## 10. Views for 5-Level System

```sql
-- View: Complete Agent Hierarchy (5 Levels)
CREATE OR REPLACE VIEW v_agent_hierarchy_complete AS
SELECT 
    a.id,
    a.name,
    a.agent_level,
    a.master_agent_id,
    ma.name as master_agent_name,
    a.industry_vertical,
    a.can_spawn_specialists,
    a.can_spawn_workers,
    
    -- Count children by level
    (SELECT COUNT(*) FROM agent_hierarchies ah 
     WHERE ah.parent_agent_id = a.id AND ah.child_level = 'expert') as expert_children_count,
    (SELECT COUNT(*) FROM agent_hierarchies ah 
     WHERE ah.parent_agent_id = a.id AND ah.child_level = 'specialist') as specialist_children_count,
    (SELECT COUNT(*) FROM agent_hierarchies ah 
     WHERE ah.parent_agent_id = a.id AND ah.child_level = 'worker') as worker_children_count,
    (SELECT COUNT(*) FROM agent_hierarchies ah 
     WHERE ah.parent_agent_id = a.id AND ah.child_level = 'tool') as tool_children_count,
    
    -- Performance
    a.accuracy_score,
    a.satisfaction_rating,
    a.usage_count
    
FROM agents a
LEFT JOIN agents ma ON a.master_agent_id = ma.id
WHERE a.deleted_at IS NULL
ORDER BY 
    CASE a.agent_level
        WHEN 'master' THEN 1
        WHEN 'expert' THEN 2
        WHEN 'specialist' THEN 3
        WHEN 'worker' THEN 4
        WHEN 'tool' THEN 5
    END,
    a.name;

-- View: Agent Routing Map
CREATE OR REPLACE VIEW v_agent_routing_map AS
SELECT 
    pa.name as parent_agent,
    pa.agent_level as parent_level,
    ca.name as child_agent,
    ca.agent_level as child_level,
    ah.relationship_type,
    ah.delegation_trigger,
    ah.auto_delegate,
    ah.confidence_threshold,
    ah.execution_order,
    ah.is_parallel,
    ah.total_delegations,
    ah.successful_delegations,
    CASE 
        WHEN ah.total_delegations > 0 
        THEN ROUND(ah.successful_delegations::NUMERIC / ah.total_delegations * 100, 2)
        ELSE 0
    END as success_rate_pct
FROM agent_hierarchies ah
JOIN agents pa ON ah.parent_agent_id = pa.id
JOIN agents ca ON ah.child_agent_id = ca.id
WHERE pa.deleted_at IS NULL AND ca.deleted_at IS NULL
ORDER BY pa.agent_level, pa.name, ah.execution_order;
```

---

## Summary

### New Tables Created: 5
1. ✅ `agent_levels` - Reference data for 5 levels
2. ✅ `agent_capabilities` - Detailed capability tracking
3. ✅ `agent_vertical_mapping` - Industry vertical assignments
4. ✅ `agent_spawn_history` - Dynamic agent spawning logs
5. ✅ `master_agents` - Level 1 registry

### Existing Tables Enhanced: 2
1. ✅ `agents` - Added 15+ new columns for 5-level support
2. ✅ `agent_hierarchies` - Added 10+ new columns for advanced routing

### New Views: 2
1. ✅ `v_agent_hierarchy_complete` - Full 5-level visualization
2. ✅ `v_agent_routing_map` - Delegation routing with metrics

---

**Next Steps:**
1. Review and approve schema design
2. Create migration SQL file
3. Apply migration to database
4. Seed 5 Master Agents (Level 1)
5. Seed 35 Expert Agents (Level 2)
6. Define Specialist/Worker/Tool relationships

**Ready to proceed with schema migration?** 🎯

