# Agent Schema Complete Guide

**Last Updated**: November 26, 2025  
**Status**: ✅ Production-Ready & Verified  
**Total Tables**: 35+ agent-related tables  
**Total Agents**: 1,138 (892 active, fully enriched)  
**Multi-Tenant**: 5 tenants with proper isolation  
**Vector Embeddings**: 600 in Pinecone (vital-medical-agents index)

---

## Table of Contents

1. [Core Agent Table Schema](#1-core-agent-table-schema)
2. [Agent Level System](#2-agent-level-system)
3. [Organizational Structure](#3-organizational-structure)
4. [Capabilities & Skills System](#4-capabilities--skills-system)
5. [Knowledge Domains & Expertise](#5-knowledge-domains--expertise)
6. [System Prompts & Templates](#6-system-prompts--templates)
7. [Agent Relationships & Workflows](#7-agent-relationships--workflows)
8. [LLM Configuration](#8-llm-configuration)
9. [Multi-Tenancy System](#9-multi-tenancy-system)
10. [Complete Table Reference](#10-complete-table-reference)
11. [Entity Relationship Diagram](#11-entity-relationship-diagram)
12. [Usage Examples](#12-usage-examples)

---

## 1. Core Agent Table Schema

### `agents` Table (Primary)

The `agents` table is the central hub for all agent data. It contains **40+ columns** organized into logical sections:

#### Core Identity (7 columns)
```sql
id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4()
tenant_id               UUID REFERENCES organizations(id) -- Multi-tenancy
name                    TEXT NOT NULL                     -- Internal identifier
slug                    TEXT NOT NULL                     -- URL-friendly name
tagline                 TEXT                              -- One-line description
description             TEXT                              -- Full description
title                   TEXT                              -- Professional title
```

**Example**:
```sql
id:          '123e4567-e89b-12d3-a456-426614174000'
tenant_id:   '00000000-0000-0000-0000-000000000001'
name:        'regulatory-affairs-director'
slug:        'regulatory-affairs-director'
tagline:     'Strategic regulatory expert for global submissions'
description: 'Expert in FDA, EMA, and global regulatory strategies...'
title:       'Regulatory Affairs Director'
```

#### Organizational Mapping (10 columns)
```sql
-- Foreign Keys (Normalized)
role_id                 UUID REFERENCES org_roles(id)
function_id             UUID REFERENCES org_functions(id)
department_id           UUID REFERENCES org_departments(id)
persona_id              UUID REFERENCES personas(id)
agent_level_id          UUID REFERENCES agent_levels(id)

-- Denormalized Names (Performance Optimization)
function_name           TEXT    -- Cached from org_functions
department_name         TEXT    -- Cached from org_departments
role_name               TEXT    -- Cached from org_roles

-- Experience & Seniority
expertise_level         TEXT    -- 'beginner', 'intermediate', 'expert', 'master'
years_of_experience     INTEGER -- 1-30+
```

**5-Level Agent Hierarchy**:
- **L1 MASTER** - Top-level orchestrators (strategic, executive)
- **L2 EXPERT** - Deep domain specialists (complex analysis)
- **L3 SPECIALIST** - Focused sub-domain experts (task execution)
- **L4 WORKER** - Routine task executors (operational)
- **L5 TOOL** - Automated tool agents (atomic operations)

**Note**: Actual distribution across 1,138 agents verified in PostgreSQL/Supabase.
Agent levels stored in `agent_levels` table using `level_number` (1-5).

#### Visual & Avatar (3 columns)
```sql
avatar_url              TEXT    -- DiceBear API or custom URL
avatar_description      TEXT    -- Alt text for accessibility
color_scheme            JSONB   -- Brand colors (deprecated, in metadata now)
```

**Example**:
```sql
avatar_url:         'https://api.dicebear.com/7.x/bottts/svg?seed=reg-affairs-director'
avatar_description: 'Blue and silver robot with confident expression'
```

#### AI Configuration (5 columns)
```sql
system_prompt           TEXT                    -- Full system prompt (legacy)
base_model              TEXT DEFAULT 'gpt-4'   -- LLM model name
temperature             NUMERIC(3,2) DEFAULT 0.7
max_tokens              INTEGER DEFAULT 4000
communication_style     TEXT                    -- 'formal', 'conversational', etc.
```

#### AgentOS 3.0 System Prompt System (3 columns - NEW)
```sql
system_prompt_template_id   UUID REFERENCES system_prompt_templates(id)
system_prompt_override      TEXT    -- Complete override for testing
prompt_variables            JSONB   -- Dynamic template variables
```

**Example**:
```sql
system_prompt_template_id: '456e7890-e89b-12d3-a456-426614174111'
prompt_variables: {
  "domain": "FDA Regulatory Affairs",
  "specialty": "510(k) Submissions",
  "tone": "authoritative"
}
```

#### Status & Validation (3 columns)
```sql
status                  TEXT    -- 'development', 'testing', 'active', 'deprecated'
validation_status       TEXT    -- 'draft', 'pending', 'validated', 'in_review', 'expired'
deleted_at              TIMESTAMPTZ -- Soft delete
```

#### Usage Metrics (3 columns)
```sql
usage_count             INTEGER DEFAULT 0
average_rating          NUMERIC(3,2)
total_conversations     INTEGER DEFAULT 0
```

#### Documentation (2 columns)
```sql
documentation_path      TEXT    -- Local docs path
documentation_url       TEXT    -- External URL
```

**Example**:
```sql
documentation_path: '/docs/agents/regulatory/master/regulatory-affairs-director.md'
documentation_url:  'https://docs.vital.ai/agents/regulatory-affairs-director'
```

#### Metadata & Timestamps (4 columns)
```sql
metadata                JSONB DEFAULT '{}'
created_at              TIMESTAMPTZ DEFAULT NOW()
updated_at              TIMESTAMPTZ DEFAULT NOW()
deleted_at              TIMESTAMPTZ
```

**Total**: **40+ columns**

---

## 2. Agent Level System

### `agent_levels` Table

Defines the 5-level agent hierarchy with capabilities and model requirements.

```sql
CREATE TABLE agent_levels (
    id                  UUID PRIMARY KEY,
    level_number        INTEGER NOT NULL UNIQUE,    -- 1, 2, 3, 4, 5
    level_name          TEXT NOT NULL UNIQUE,       -- 'Master', 'Expert', etc.
    description         TEXT,
    
    -- Capabilities by level
    can_delegate        BOOLEAN DEFAULT FALSE,
    can_spawn_subagents BOOLEAN DEFAULT FALSE,
    can_use_tools       BOOLEAN DEFAULT FALSE,
    
    -- Model requirements
    min_model_tier      TEXT,                      -- 'gpt-4', 'claude-3-opus'
    default_temperature NUMERIC(3,2) DEFAULT 0.7,
    max_context_tokens  INTEGER DEFAULT 4000,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

#### Agent Level Data (Current)

| Level | Name | Count | Can Delegate | Can Spawn | Can Use Tools | Min Model |
|-------|------|-------|--------------|-----------|---------------|-----------|
| 1 | Master | 24 | ✅ | ✅ | ✅ | gpt-4-turbo |
| 2 | Expert | 110 | ✅ | ✅ | ✅ | gpt-4 |
| 3 | Specialist | 266 | ❌ | ❌ | ✅ | gpt-4 |
| 4 | Worker | 39 | ❌ | ❌ | ✅ | gpt-3.5-turbo |
| 5 | Tool | 50 | ❌ | ❌ | N/A | function-call |

**Delegation Patterns**:
- L1 → L2, L3, L4, L5 (Master can delegate to any)
- L2 → L3, L4, L5 (Expert can delegate to Specialist, Worker, Tool)
- L3 → L4, L5 (Specialist can use Workers and Tools)
- L4 → L5 (Worker can use Tools)
- L5 → N/A (Tool is terminal, no delegation)

### `agent_level_models` Junction Table

Links agent levels to approved LLM models.

```sql
CREATE TABLE agent_level_models (
    id              UUID PRIMARY KEY,
    agent_level_id  UUID REFERENCES agent_levels(id),
    llm_model_id    UUID REFERENCES llm_models(id),
    is_default      BOOLEAN DEFAULT FALSE,
    is_fallback     BOOLEAN DEFAULT FALSE,
    priority_order  INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Organizational Structure

### `org_functions` Table

Top-level organizational functions (e.g., "Regulatory Affairs", "Clinical Development").

```sql
CREATE TABLE org_functions (
    id              UUID PRIMARY KEY,
    tenant_id       UUID REFERENCES organizations(id),
    function_name   TEXT NOT NULL,
    function_code   TEXT,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Functions** (Pharma Tenant):
- Regulatory Affairs
- Clinical Development
- Market Access & HEOR
- Medical Affairs
- Safety & Pharmacovigilance
- Manufacturing & Quality
- Commercial Operations
- Digital Health & Innovation

### `org_departments` Table

Mid-level departments within functions.

```sql
CREATE TABLE org_departments (
    id              UUID PRIMARY KEY,
    tenant_id       UUID REFERENCES organizations(id),
    function_id     UUID REFERENCES org_functions(id),
    department_name TEXT NOT NULL,
    department_code TEXT,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Example** (Regulatory Affairs Function):
- Drug Regulatory
- Device Regulatory
- Global Submissions
- CMC Regulatory
- Advertising & Promotion

### `org_roles` Table

Specific job roles within departments.

```sql
CREATE TABLE org_roles (
    id                  UUID PRIMARY KEY,
    tenant_id           UUID REFERENCES organizations(id),
    department_id       UUID REFERENCES org_departments(id),
    function_id         UUID REFERENCES org_functions(id),
    role_name           TEXT NOT NULL,
    role_code           TEXT,
    seniority_level     TEXT,            -- 'Entry', 'Mid', 'Senior', 'Lead', 'Director'
    description         TEXT,
    responsibilities    TEXT[],
    required_skills     TEXT[],
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Example** (Drug Regulatory Department):
- Regulatory Affairs Associate
- Senior Regulatory Affairs Specialist
- Regulatory Affairs Manager
- Regulatory Affairs Director
- VP, Regulatory Strategy

**Hierarchy**:
```
org_functions (8 functions)
    └── org_departments (~50 departments)
            └── org_roles (~200 roles)
                    └── agents (489 agents)
```

---

## 4. Capabilities & Skills System

### `capabilities` Table (Parent)

High-level capability categories that group skills.

```sql
CREATE TABLE capabilities (
    id                  UUID PRIMARY KEY,
    capability_name     TEXT NOT NULL UNIQUE,
    capability_slug     TEXT NOT NULL UNIQUE,
    display_name        TEXT,
    category            TEXT,           -- 'Clinical', 'Regulatory', 'Technical', etc.
    description         TEXT,
    complexity_level    TEXT,           -- 'Basic', 'Intermediate', 'Advanced', 'Expert'
    parent_capability_id UUID REFERENCES capabilities(id), -- Hierarchical
    icon                TEXT,
    color               TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Capabilities** (30+ defined):
- FDA Regulatory Strategy
- Clinical Trial Design
- Real-World Evidence Generation
- Pharmacovigilance
- Health Economics & Outcomes Research
- Market Access Strategy
- Medical Writing
- Statistical Analysis

### `skills` Table (Child)

Granular, task-level skills linked to capabilities.

```sql
CREATE TABLE skills (
    id                  UUID PRIMARY KEY,
    skill_name          TEXT NOT NULL UNIQUE,
    skill_slug          TEXT NOT NULL UNIQUE,
    display_name        TEXT,
    category            TEXT,
    description         TEXT,
    skill_type          TEXT,           -- 'Technical', 'Communication', 'Analytical', 'Tool'
    complexity_level    TEXT,
    invocation_method   TEXT,           -- 'function_call', 'prompt_template', 'api_call'
    function_definition JSONB,          -- OpenAI function schema
    prerequisites       UUID[],         -- Other skill IDs
    related_tools       UUID[],         -- Tool IDs
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Skills** (150+ defined):
- FDA 510(k) Submission Preparation
- IND Application Review
- Clinical Protocol Development
- Adverse Event Case Processing
- HEOR Model Building
- Payer Evidence Dossier Creation
- Medical Writing - CSR
- Statistical Power Calculation

### `agent_capabilities` Junction Table

Links agents to capabilities with proficiency tracking.

```sql
CREATE TABLE agent_capabilities (
    id                  UUID PRIMARY KEY,
    agent_id            UUID REFERENCES agents(id) ON DELETE CASCADE,
    capability_id       UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    proficiency_level   TEXT DEFAULT 'intermediate', -- 'basic', 'intermediate', 'advanced', 'expert'
    is_primary          BOOLEAN DEFAULT FALSE,
    years_of_experience INTEGER,
    certification_level TEXT,
    usage_count         INTEGER DEFAULT 0,
    success_rate        NUMERIC(5,2),
    last_used_at        TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, capability_id)
);
```

### `agent_skills` Junction Table

Links agents to specific skills with proficiency tracking.

```sql
CREATE TABLE agent_skills (
    id                  UUID PRIMARY KEY,
    agent_id            UUID REFERENCES agents(id) ON DELETE CASCADE,
    skill_id            UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level   TEXT DEFAULT 'intermediate',
    is_primary          BOOLEAN DEFAULT FALSE,
    usage_count         INTEGER DEFAULT 0,
    success_rate        NUMERIC(5,2),
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, skill_id)
);
```

**Current Assignment Stats**:
- **Agent Capabilities**: 2,352 assignments (avg 4.8 per agent)
- **Agent Skills**: ~7,350 assignments (avg 15 per agent)

### `capability_skills` Junction Table

Links capabilities to their child skills.

```sql
CREATE TABLE capability_skills (
    id                  UUID PRIMARY KEY,
    capability_id       UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    skill_id            UUID REFERENCES skills(id) ON DELETE CASCADE,
    relationship_type   TEXT DEFAULT 'contains', -- 'contains', 'requires', 'enhances'
    importance_level    TEXT DEFAULT 'core',     -- 'core', 'supplementary', 'optional'
    usage_context       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(capability_id, skill_id)
);
```

**Hierarchy**:
```
Capability: "FDA Regulatory Strategy"
    ├── Skill: "FDA 510(k) Submission Preparation"
    ├── Skill: "IND Application Review"
    ├── Skill: "NDA Preparation & Filing"
    ├── Skill: "Regulatory Authority Negotiation"
    └── Skill: "FDA Meeting Strategy & Execution"
```

---

## 5. Knowledge Domains & Expertise

### `knowledge_domains` Table

Specialized knowledge areas agents can master.

```sql
CREATE TABLE knowledge_domains (
    id                  UUID PRIMARY KEY,
    domain_code         TEXT NOT NULL UNIQUE,
    domain_name         TEXT NOT NULL,
    domain_slug         TEXT NOT NULL UNIQUE,
    category            TEXT,           -- 'Clinical', 'Regulatory', 'Technical', etc.
    tier                INTEGER,        -- 1 (broad) to 5 (highly specialized)
    priority            INTEGER,        -- Importance ranking
    description         TEXT,
    parent_domain_id    UUID REFERENCES knowledge_domains(id),
    rag_namespace       TEXT,           -- Pinecone namespace for RAG
    vector_count        INTEGER,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Knowledge Domains** (50+ defined):
- FDA Regulatory Affairs (Tier 1)
  - 510(k) Medical Device Submissions (Tier 3)
  - IND & NDA Submissions (Tier 3)
  - Drug-Device Combination Products (Tier 4)
- Clinical Development (Tier 1)
  - Phase I-IV Trial Design (Tier 2)
  - Adaptive Trial Design (Tier 3)
  - Rare Disease Trials (Tier 4)
- Pharmacovigilance (Tier 1)
  - Adverse Event Detection (Tier 2)
  - Signal Management (Tier 3)

### `agent_knowledge_domains` Junction Table

Links agents to knowledge domains with proficiency.

```sql
CREATE TABLE agent_knowledge_domains (
    id                  UUID PRIMARY KEY,
    agent_id            UUID REFERENCES agents(id) ON DELETE CASCADE,
    knowledge_domain_id UUID REFERENCES knowledge_domains(id) ON DELETE CASCADE,
    domain_name         TEXT,           -- Cached for performance
    proficiency_level   TEXT DEFAULT 'intermediate',
    is_primary_domain   BOOLEAN DEFAULT FALSE,
    certification_level TEXT,
    years_of_experience INTEGER,
    specialization_notes TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, knowledge_domain_id)
);
```

**Current Stats**:
- **Knowledge Domains**: 50+ domains defined
- **Agent Assignments**: 1,467 assignments (avg 3.0 per agent)
- **Proficiency Distribution**: 
  - Expert: 30%
  - Advanced: 40%
  - Intermediate: 25%
  - Basic: 5%

---

## 6. System Prompts & Templates

### `system_prompt_templates` Table

Gold standard system prompt templates for each agent level (AgentOS 3.0).

```sql
CREATE TABLE system_prompt_templates (
    id                              UUID PRIMARY KEY,
    
    -- Template Identification
    template_name                   TEXT NOT NULL UNIQUE,
    agent_level                     TEXT NOT NULL,  -- 'L1', 'L2', 'L3', 'L4', 'L5'
    agent_level_name                TEXT NOT NULL,  -- 'MASTER', 'EXPERT', etc.
    version                         TEXT DEFAULT '2.0',
    
    -- Prompt Content (Structured)
    base_prompt                     TEXT NOT NULL,
    level_specific_prompt           TEXT NOT NULL,
    deepagents_tools_section        TEXT,
    examples_section                TEXT,
    
    -- Agent Hierarchy Instructions
    delegation_instructions         TEXT,
    escalation_instructions         TEXT,
    collaboration_instructions      TEXT,
    
    -- Context Management (DeepAgents)
    context_management_instructions TEXT,
    memory_instructions             TEXT,
    filesystem_instructions         TEXT,
    
    -- Communication Protocols
    output_format_instructions      TEXT,
    communication_style             TEXT,
    
    -- Safety & Boundaries
    boundaries_and_limitations      TEXT,
    ethical_guidelines              TEXT,
    
    -- Configuration
    token_budget_min                INTEGER NOT NULL,
    token_budget_max                INTEGER NOT NULL,
    allowed_models                  JSONB DEFAULT '[]',
    
    -- Capabilities
    can_spawn_levels                TEXT[],         -- ['L2', 'L3'] for L1
    can_use_worker_pool             BOOLEAN DEFAULT FALSE,
    can_use_tool_registry           BOOLEAN DEFAULT FALSE,
    is_stateless                    BOOLEAN DEFAULT FALSE,
    is_tenant_agnostic              BOOLEAN DEFAULT FALSE,
    
    -- Usage Guidelines
    when_to_use                     TEXT,
    prohibited_actions              TEXT[],
    success_criteria                TEXT[],
    
    -- Metadata
    framework_basis                 TEXT[],         -- ['Claude Code', 'Deep Research', 'Manus', 'OpenAI']
    is_active                       BOOLEAN DEFAULT TRUE,
    created_at                      TIMESTAMPTZ DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ DEFAULT NOW()
);
```

**5 Templates Defined** (One per level):
1. **L1_MASTER_v2.0** - Orchestration, strategic planning, multi-agent coordination
2. **L2_EXPERT_v2.0** - Deep domain analysis, evidence synthesis, expert reasoning
3. **L3_SPECIALIST_v2.0** - Focused task execution, domain-specific operations
4. **L4_WORKER_v2.0** - Routine task execution, data processing
5. **L5_TOOL_v2.0** - Stateless function execution, API calls

**Dynamic Rendering**:

Agents reference templates via `system_prompt_template_id` and inject custom variables via `prompt_variables` JSONB field.

**Example**:
```sql
-- Agent record
system_prompt_template_id: 'L2_EXPERT_v2.0'
prompt_variables: {
  "domain": "FDA 510(k) Submissions",
  "tone": "authoritative",
  "output_format": "structured_report"
}

-- Rendered prompt combines:
-- 1. Base template from system_prompt_templates
-- 2. Agent-specific variables
-- 3. Dynamic context (knowledge domains, skills, capabilities)
```

---

## 7. Agent Relationships & Workflows

### `agent_relationships` Table

Defines parent-child, peer, and delegation relationships between agents.

```sql
CREATE TABLE agent_relationships (
    id                      UUID PRIMARY KEY,
    
    -- Relationship Parties
    parent_agent_id         UUID REFERENCES agents(id) ON DELETE CASCADE,
    child_agent_id          UUID REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Relationship Type
    relationship_type       TEXT NOT NULL CHECK (relationship_type IN (
        'orchestrates',      -- L1 orchestrates L2 Experts
        'delegates_to',      -- Higher level delegates to lower (L1->L3, L2->L3, L3->L4)
        'uses_worker',       -- L1/L2 directly uses L4 Workers
        'uses_tool',         -- Any level (L1-L4) uses L5 Tools
        'supervises',        -- Supervision relationship
        'collaborates_with', -- Peer collaboration (same level)
        'escalates_to',      -- Lower escalates to higher
        'consults',          -- Advisory relationship
        'spawns_subagent'    -- Dynamic subagent creation
    )),
    
    -- Delegation Settings
    can_delegate            BOOLEAN DEFAULT TRUE,
    can_receive_results     BOOLEAN DEFAULT TRUE,
    requires_approval       BOOLEAN DEFAULT FALSE,
    
    -- Context Isolation (DeepAgents)
    context_isolation       BOOLEAN DEFAULT TRUE,
    share_memory            BOOLEAN DEFAULT FALSE,
    share_filesystem        BOOLEAN DEFAULT FALSE,
    
    -- Priority & Ordering
    priority                INTEGER DEFAULT 0,
    execution_order         INTEGER,
    
    -- Activation Conditions
    activation_conditions   JSONB DEFAULT '{}',
    
    -- Metadata
    description             TEXT,
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT no_self_relationship CHECK (parent_agent_id != child_agent_id),
    CONSTRAINT unique_relationship UNIQUE (parent_agent_id, child_agent_id, relationship_type)
);
```

**Current Stats**:
- **Total Relationships**: 440 defined
- **Delegation Chains**: L1 → L2 → L3 → L4 → L5
- **Direct Worker Access**: L1 and L2 can directly invoke L4 Workers and L5 Tools

**Example**:
```sql
-- L1 Master delegates to L2 Expert
parent_agent_id:     'regulatory-affairs-master'
child_agent_id:      'fda-510k-expert'
relationship_type:   'delegates_to'
activation_conditions: {
  "task_complexity": "high",
  "domain": "FDA 510(k)",
  "confidence_threshold": 0.85
}
```

### `agent_workflows` Table

Multi-step task orchestration workflows.

```sql
CREATE TABLE agent_workflows (
    id                  UUID PRIMARY KEY,
    tenant_id           UUID REFERENCES organizations(id),
    workflow_name       TEXT NOT NULL,
    workflow_slug       TEXT NOT NULL,
    description         TEXT,
    workflow_type       TEXT,           -- 'sequential', 'parallel', 'conditional', 'graph'
    trigger_conditions  JSONB,
    input_schema        JSONB,
    output_schema       JSONB,
    version             TEXT DEFAULT '1.0',
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### `workflow_steps` Table

Individual steps within workflows.

```sql
CREATE TABLE workflow_steps (
    id                  UUID PRIMARY KEY,
    workflow_id         UUID REFERENCES agent_workflows(id) ON DELETE CASCADE,
    step_number         INTEGER NOT NULL,
    step_name           TEXT NOT NULL,
    step_type           TEXT,           -- 'agent_invocation', 'tool_call', 'decision', 'human_review'
    assigned_agent_id   UUID REFERENCES agents(id),
    assigned_tool_id    UUID,
    step_config         JSONB,
    dependencies        UUID[],         -- Other step IDs
    timeout_seconds     INTEGER,
    retry_config        JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### `agent_task_templates` Table

Reusable task templates for common agent operations.

```sql
CREATE TABLE agent_task_templates (
    id                  UUID PRIMARY KEY,
    template_name       TEXT NOT NULL,
    template_slug       TEXT NOT NULL UNIQUE,
    description         TEXT,
    agent_level_id      UUID REFERENCES agent_levels(id),
    task_category       TEXT,
    input_schema        JSONB,
    output_schema       JSONB,
    execution_steps     JSONB,
    estimated_duration  INTEGER,        -- Seconds
    complexity_score    INTEGER,
    required_capabilities UUID[],
    required_skills     UUID[],
    success_criteria    TEXT[],
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. LLM Configuration

### `llm_providers` Table

AI model providers (OpenAI, Anthropic, Google, etc.).

```sql
CREATE TABLE llm_providers (
    id                  UUID PRIMARY KEY,
    provider_name       TEXT NOT NULL UNIQUE,
    provider_slug       TEXT NOT NULL UNIQUE,
    description         TEXT,
    website_url         TEXT,
    api_base_url        TEXT,
    api_version         TEXT,
    auth_method         TEXT,           -- 'api_key', 'oauth', 'service_account'
    rate_limits         JSONB,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Current Providers** (10+ supported):
- OpenAI
- Anthropic (Claude)
- Google (Gemini)
- Mistral AI
- Meta (Llama)
- Cohere
- HuggingFace
- Together AI
- Groq
- Perplexity

### `llm_models` Table

Specific LLM models with capabilities and pricing.

```sql
CREATE TABLE llm_models (
    id                  UUID PRIMARY KEY,
    provider_id         UUID REFERENCES llm_providers(id),
    model_name          TEXT NOT NULL,
    model_version       TEXT,
    model_id            TEXT NOT NULL UNIQUE,    -- e.g., 'gpt-4-turbo-2024-04-09'
    display_name        TEXT,
    description         TEXT,
    
    -- Model Capabilities
    context_window      INTEGER,                 -- Max tokens
    max_output_tokens   INTEGER,
    supports_function_calling BOOLEAN DEFAULT FALSE,
    supports_vision     BOOLEAN DEFAULT FALSE,
    supports_streaming  BOOLEAN DEFAULT FALSE,
    
    -- Performance & Cost
    input_cost_per_1k   NUMERIC(10,6),          -- USD per 1K input tokens
    output_cost_per_1k  NUMERIC(10,6),          -- USD per 1K output tokens
    avg_latency_ms      INTEGER,
    rate_limit_rpm      INTEGER,                 -- Requests per minute
    
    -- Quality Metrics
    quality_tier        TEXT,                    -- 'flagship', 'production', 'experimental'
    benchmark_scores    JSONB,                   -- {mmlu: 0.92, humaneval: 0.85, ...}
    
    -- Availability
    is_active           BOOLEAN DEFAULT TRUE,
    release_date        DATE,
    deprecation_date    DATE,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Models** (50+ defined):

**OpenAI**:
- gpt-4-turbo-2024-04-09 (128K context, $10/$30 per 1M tokens)
- gpt-4-0613 (8K context, flagship)
- gpt-3.5-turbo-0125 (16K context, production)
- gpt-4o (multimodal, vision)

**Anthropic**:
- claude-3-opus-20240229 (200K context, flagship)
- claude-3-sonnet-20240229 (200K context, production)
- claude-3-haiku-20240307 (200K context, fast)

**Google**:
- gemini-1.5-pro (2M context, experimental)
- gemini-1.5-flash (1M context, fast)

**Meta**:
- llama-3.1-405b-instruct (OSS, flagship)
- llama-3.1-70b-instruct (OSS, production)

**Mistral**:
- mistral-large-2402 (32K context, flagship)
- mixtral-8x22b (64K context, MoE)

---

## 9. Multi-Tenancy System

### `organizations` Table (Tenants)

Multi-tenant isolation for pharma companies, digital health startups, etc.

```sql
CREATE TABLE organizations (
    id                  UUID PRIMARY KEY,
    tenant_key          TEXT NOT NULL UNIQUE,    -- 'pharma', 'digital-health', etc.
    tenant_type         TEXT NOT NULL,           -- 'biopharma', 'medtech', 'healthtech'
    organization_name   TEXT NOT NULL,
    display_name        TEXT,
    logo_url            TEXT,
    website_url         TEXT,
    industry_sector     TEXT,
    company_size        TEXT,                    -- 'startup', 'mid-market', 'enterprise'
    is_active           BOOLEAN DEFAULT TRUE,
    settings            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Current Tenants**:
1. **Pharma** (tenant_key: 'pharma')
   - Type: Biopharma
   - Agents: 400+
   - Functions: 8 (Clinical, Regulatory, Market Access, etc.)

2. **Digital Health** (tenant_key: 'digital-health')
   - Type: Healthtech
   - Agents: 89
   - Functions: 6 (Product, Engineering, Clinical, Regulatory, etc.)

### `tenant_agents` Junction Table

Maps which agents are available to which tenants.

```sql
CREATE TABLE tenant_agents (
    id                  UUID PRIMARY KEY,
    tenant_id           UUID REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id            UUID REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Access Control
    is_enabled          BOOLEAN DEFAULT TRUE,
    
    -- Custom Configuration
    custom_config       JSONB DEFAULT '{}',
    
    -- Usage Tracking
    usage_count         INTEGER DEFAULT 0,
    last_used_at        TIMESTAMPTZ,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, agent_id)
);
```

**Shared Resources** (Multi-Tenant):
- L4 Worker Agents (e.g., "Data Processor", "Report Generator")
- L5 Tool Agents (e.g., "PDF Extractor", "API Caller")
- Skills, Capabilities, Knowledge Domains
- System Prompt Templates

**Tenant-Specific**:
- L1 Master Agents
- L2 Expert Agents
- L3 Specialist Agents
- Organizational Structure (Functions, Departments, Roles)

---

## 10. Complete Table Reference

### Core Agent System (10 tables)
1. **agents** - Primary agent table (489 agents)
2. **agent_levels** - 5-level hierarchy (L1-L5)
3. **agent_level_models** - Approved LLM models per level
4. **agent_level_characteristics** - Level-specific characteristics
5. **agent_level_use_cases** - Use cases per level
6. **agent_relationships** - Parent-child, delegation, collaboration (440 relationships)
7. **agent_workflows** - Multi-step task orchestration
8. **workflow_steps** - Individual workflow steps
9. **agent_task_templates** - Reusable task templates
10. **user_agents** - User favorites and custom agents

### Organizational Structure (3 tables)
11. **org_functions** - Top-level functions (8 functions)
12. **org_departments** - Departments within functions (~50 departments)
13. **org_roles** - Specific roles (~200 roles)

### Capabilities & Skills (8 tables)
14. **capabilities** - High-level capability categories (30+ capabilities)
15. **agent_capabilities** - Agent-capability assignments (2,352 assignments)
16. **capability_skills** - Capability-skill relationships
17. **capability_tags** - Tagging system
18. **skills** - Granular task/tool skills (150+ skills)
19. **agent_skills** - Agent-skill assignments (~7,350 assignments)
20. **skill_tags** - Skill tagging
21. **skill_prerequisites** - Skill dependencies

### Knowledge Domains (2 tables)
22. **knowledge_domains** - Specialized knowledge areas (50+ domains)
23. **agent_knowledge_domains** - Agent domain assignments (1,467 assignments)

### System Prompts (1 table)
24. **system_prompt_templates** - Gold standard prompts (5 templates, L1-L5)

### LLM Configuration (2 tables)
25. **llm_providers** - AI model providers (10+ providers)
26. **llm_models** - Specific LLM models (50+ models)

### Multi-Tenancy (3 tables)
27. **organizations** - Tenants (2 tenants: Pharma, Digital Health)
28. **tenant_agents** - Tenant-agent mapping
29. **tenant_configs** - Tenant-specific configurations

### Supporting Tables (6 tables)
30. **characteristics** - Agent characteristics
31. **use_cases** - Agent use cases
32. **tags** - Universal tagging system
33. **personas** - User personas (deprecated, use roles)
34. **feature_flags** - Feature toggles
35. **tenant_feature_flags** - Tenant-specific features

**Total**: **35+ tables** in the agent ecosystem

---

## 11. Entity Relationship Diagram

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

                          ┌──────────────────────────┐
                          │        agents            │ (Core Agent Table)
                          ├──────────────────────────┤
                          │ id (PK)                  │
                          │ tenant_id (FK)           │
                          │ name                     │
                          │ slug                     │
                          │ tagline                  │
                          │ description              │
                          │ agent_level_id (FK)      │
                          │ function_id (FK)         │
                          │ department_id (FK)       │
                          │ role_id (FK)             │
                          │ system_prompt            │
                          │ system_prompt_template_id│ ← NEW (AgentOS 3.0)
                          │ prompt_variables (JSONB) │ ← NEW
                          │ base_model               │
                          │ status                   │
                          └────┬──────┬──────┬───────┘
                               │      │      │
        ┌──────────────────────┘      │      └──────────────────────┐
        │                             │                             │
        │                             │                             │
┌───────▼──────────┐     ┌────────────▼──────────┐    ┌────────────▼──────────┐
│ agent_levels     │     │ agent_capabilities    │    │ agent_knowledge       │
│ (hierarchy)      │     │ (proficiency)         │    │ _domains              │
├──────────────────┤     ├───────────────────────┤    ├───────────────────────┤
│ level_number     │     │ agent_id (FK)         │    │ agent_id (FK)         │
│ level_name       │     │ capability_id (FK)    │    │ knowledge_domain_id   │
│ can_delegate     │     │ proficiency_level     │    │ proficiency_level     │
│ can_spawn        │     │ is_primary            │    │ is_primary_domain     │
└──────┬───────────┘     └──────────┬────────────┘    └──────────┬────────────┘
       │                             │                            │
       │                 ┌───────────▼────────────┐  ┌────────────▼───────────┐
       │                 │   capabilities         │  │  knowledge_domains     │
       │                 │   (categories)         │  │  (domains)             │
       │                 ├────────────────────────┤  ├────────────────────────┤
       │                 │ capability_name        │  │ domain_code            │
       │                 │ category               │  │ domain_name            │
       │                 │ complexity_level       │  │ tier                   │
       │                 │ parent_capability_id   │  │ rag_namespace          │
       │                 └────────────┬───────────┘  └────────────────────────┘
       │                              │
       │                 ┌────────────▼────────────┐
       │                 │  capability_skills      │
       │                 │  (capability → skill)   │
       │                 ├─────────────────────────┤
       │                 │ capability_id (FK)      │
       │                 │ skill_id (FK)           │
       │                 │ importance_level        │
       │                 └────────────┬────────────┘
       │                              │
       │                 ┌────────────▼────────────┐
       │                 │      skills             │
       │                 │   (task/tools)          │
       │                 ├─────────────────────────┤
       │                 │ skill_name              │
       │                 │ skill_type              │
       │                 │ invocation_method       │
       │                 │ function_definition     │
       │                 └─────────────────────────┘
       │
       │
┌──────▼─────────────────────────────────────────────────────────────────┐
│                 AGENTOS 3.0: SYSTEM PROMPTS                             │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────┐
                    │  system_prompt_templates      │
                    ├────────────────────────────────┤
                    │ id (PK)                        │
                    │ template_name                  │
                    │ agent_level ('L1'-'L5')        │
                    │ base_prompt                    │
                    │ level_specific_prompt          │
                    │ delegation_instructions        │
                    │ deepagents_tools_section       │
                    │ can_spawn_levels[]             │
                    │ token_budget_min/max           │
                    └────────────────────────────────┘
                             ▲
                             │ Referenced by agents.system_prompt_template_id
                             │


┌─────────────────────────────────────────────────────────────────────────┐
│                   AGENT RELATIONSHIPS & WORKFLOWS                       │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────┐
                    │  agent_relationships          │
                    ├────────────────────────────────┤
                    │ parent_agent_id (FK)           │
                    │ child_agent_id (FK)            │
                    │ relationship_type              │
                    │   - orchestrates               │
                    │   - delegates_to               │
                    │   - uses_worker                │
                    │   - uses_tool                  │
                    │   - spawns_subagent            │
                    │ context_isolation              │
                    │ share_memory                   │
                    │ activation_conditions (JSONB)  │
                    └────────────────────────────────┘
                             │
                             ├──► L1 MASTER → L2 EXPERT
                             ├──► L1 MASTER → L4 WORKER (direct)
                             ├──► L2 EXPERT → L3 SPECIALIST
                             ├──► L3 SPECIALIST → L5 TOOL
                             └──► L4 WORKER → L5 TOOL


                    ┌────────────────────────────────┐
                    │  agent_workflows              │
                    ├────────────────────────────────┤
                    │ workflow_name                  │
                    │ workflow_type                  │
                    │   - sequential                 │
                    │   - parallel                   │
                    │   - conditional                │
                    │   - graph                      │
                    │ trigger_conditions (JSONB)     │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────▼───────────────────┐
                    │  workflow_steps               │
                    ├────────────────────────────────┤
                    │ step_number                    │
                    │ step_type                      │
                    │ assigned_agent_id (FK)         │
                    │ dependencies[]                 │
                    │ step_config (JSONB)            │
                    └────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        LLM CONFIGURATION                                │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────┐
                    │  llm_providers                │
                    ├────────────────────────────────┤
                    │ provider_name                  │
                    │   - OpenAI                     │
                    │   - Anthropic                  │
                    │   - Google                     │
                    │   - Mistral                    │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────▼───────────────────┐
                    │  llm_models                   │
                    ├────────────────────────────────┤
                    │ model_id                       │
                    │   - gpt-4-turbo                │
                    │   - claude-3-opus              │
                    │   - gemini-1.5-pro             │
                    │ context_window                 │
                    │ input_cost_per_1k              │
                    │ output_cost_per_1k             │
                    │ supports_function_calling      │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────▼───────────────────┐
                    │  agent_level_models           │
                    ├────────────────────────────────┤
                    │ agent_level_id (FK)            │
                    │ llm_model_id (FK)              │
                    │ is_default                     │
                    │ priority_order                 │
                    └────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                   ORGANIZATIONAL STRUCTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────┐
                    │  org_functions                │
                    │  (8 functions)                │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────▼───────────────────┐
                    │  org_departments              │
                    │  (~50 departments)            │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────▼───────────────────┐
                    │  org_roles                    │
                    │  (~200 roles)                 │
                    └────────────────────────────────┘
                                 ▲
                                 │
                            Referenced by
                        agents.function_id,
                        agents.department_id,
                        agents.role_id
```

---

## 12. Usage Examples

### Example 1: Create a New L2 Expert Agent

```sql
INSERT INTO agents (
    tenant_id,
    name,
    slug,
    tagline,
    description,
    agent_level_id,
    function_id,
    department_id,
    role_id,
    system_prompt_template_id,
    prompt_variables,
    base_model,
    status
)
VALUES (
    '00000000-0000-0000-0000-000000000001',  -- Pharma tenant
    'pdufa-strategy-expert',
    'pdufa-strategy-expert',
    'PDUFA strategy and FDA lifecycle management specialist',
    'Expert in PDUFA regulatory strategy, FDA meeting management...',
    (SELECT id FROM agent_levels WHERE level_number = 2),  -- L2 Expert
    (SELECT id FROM org_functions WHERE function_name = 'Regulatory Affairs'),
    (SELECT id FROM org_departments WHERE department_name = 'Drug Regulatory'),
    (SELECT id FROM org_roles WHERE role_name = 'Senior Regulatory Affairs Specialist'),
    (SELECT id FROM system_prompt_templates WHERE agent_level = 'L2'),
    '{"domain": "PDUFA & FDA Lifecycle", "tone": "authoritative"}'::jsonb,
    'gpt-4-turbo-2024-04-09',
    'active'
);
```

### Example 2: Assign Capabilities to Agent

```sql
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
    (SELECT id FROM agents WHERE slug = 'pdufa-strategy-expert'),
    c.id,
    'expert',
    TRUE
FROM capabilities c
WHERE c.capability_slug IN (
    'fda-regulatory-strategy',
    'pdufa-lifecycle-management',
    'regulatory-authority-negotiation'
);
```

### Example 3: Assign Knowledge Domains

```sql
INSERT INTO agent_knowledge_domains (agent_id, knowledge_domain_id, proficiency_level, is_primary_domain)
SELECT
    (SELECT id FROM agents WHERE slug = 'pdufa-strategy-expert'),
    kd.id,
    'expert',
    (kd.domain_code = 'FDA_REGULATORY')  -- Primary domain
FROM knowledge_domains kd
WHERE kd.domain_code IN ('FDA_REGULATORY', 'PDUFA_STRATEGY', 'REGULATORY_NEGOTIATIONS');
```

### Example 4: Query All L2 Experts in Regulatory Affairs

```sql
SELECT
    a.id,
    a.name,
    a.tagline,
    al.level_name,
    f.function_name,
    d.department_name,
    r.role_name,
    spt.template_name,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'capability', c.capability_name,
            'proficiency', ac.proficiency_level
        ))
        FROM agent_capabilities ac
        JOIN capabilities c ON ac.capability_id = c.id
        WHERE ac.agent_id = a.id
    ) as capabilities,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'domain', kd.domain_name,
            'proficiency', akd.proficiency_level
        ))
        FROM agent_knowledge_domains akd
        JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
        WHERE akd.agent_id = a.id
    ) as knowledge_domains
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
JOIN org_functions f ON a.function_id = f.id
JOIN org_departments d ON a.department_id = d.id
JOIN org_roles r ON a.role_id = r.id
LEFT JOIN system_prompt_templates spt ON a.system_prompt_template_id = spt.id
WHERE al.level_number = 2  -- L2 Expert
  AND f.function_name = 'Regulatory Affairs'
  AND a.status = 'active';
```

### Example 5: Find Agent Delegation Chain

```sql
WITH RECURSIVE delegation_chain AS (
    -- Base case: Start with L1 Master
    SELECT
        a.id,
        a.name,
        a.tagline,
        al.level_number,
        al.level_name,
        NULL::UUID as parent_id,
        0 as depth
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE a.slug = 'regulatory-affairs-master'
    
    UNION ALL
    
    -- Recursive case: Find children
    SELECT
        child.id,
        child.name,
        child.tagline,
        child_level.level_number,
        child_level.level_name,
        dc.id as parent_id,
        dc.depth + 1
    FROM delegation_chain dc
    JOIN agent_relationships ar ON dc.id = ar.parent_agent_id
    JOIN agents child ON ar.child_agent_id = child.id
    JOIN agent_levels child_level ON child.agent_level_id = child_level.id
    WHERE ar.relationship_type IN ('orchestrates', 'delegates_to')
      AND ar.is_active = TRUE
)
SELECT
    REPEAT('  ', depth) || level_name || ': ' || name as hierarchy,
    tagline,
    depth,
    level_number
FROM delegation_chain
ORDER BY depth, level_number;
```

**Output**:
```
Master: regulatory-affairs-master | Strategic regulatory orchestrator | 0 | 1
  Expert: fda-510k-expert | FDA 510(k) submission specialist | 1 | 2
  Expert: pdufa-strategy-expert | PDUFA strategy specialist | 1 | 2
    Specialist: ind-nda-specialist | IND/NDA preparation specialist | 2 | 3
    Specialist: regulatory-writing-specialist | Regulatory writing expert | 2 | 3
      Worker: document-reviewer | Automated document review | 3 | 4
        Tool: pdf-extractor | PDF text extraction tool | 4 | 5
```

### Example 6: Render System Prompt for Agent

```sql
SELECT
    a.name,
    spt.base_prompt,
    spt.level_specific_prompt,
    spt.delegation_instructions,
    a.prompt_variables,
    -- Inject capabilities
    (
        SELECT string_agg(c.display_name, ', ')
        FROM agent_capabilities ac
        JOIN capabilities c ON ac.capability_id = c.id
        WHERE ac.agent_id = a.id
          AND ac.proficiency_level IN ('expert', 'advanced')
    ) as agent_capabilities,
    -- Inject knowledge domains
    (
        SELECT string_agg(kd.domain_name, ', ')
        FROM agent_knowledge_domains akd
        JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
        WHERE akd.agent_id = a.id
          AND akd.is_primary_domain = TRUE
    ) as primary_domains
FROM agents a
JOIN system_prompt_templates spt ON a.system_prompt_template_id = spt.id
WHERE a.slug = 'pdufa-strategy-expert';
```

**Result**: A fully rendered system prompt combining:
1. Base template (from `system_prompt_templates`)
2. Agent-specific variables (from `prompt_variables`)
3. Dynamic context (capabilities, domains, skills)

---

## Summary

This guide covers **35+ tables** in the agent ecosystem, including:

✅ **Core Agent System** (10 tables, 489 agents)  
✅ **5-Level Hierarchy** (L1 Master → L5 Tool)  
✅ **Organizational Structure** (8 functions, 50 departments, 200 roles)  
✅ **Capabilities & Skills** (30+ capabilities, 150+ skills, 9,702 assignments)  
✅ **Knowledge Domains** (50+ domains, 1,467 assignments)  
✅ **AgentOS 3.0 System Prompts** (5 gold standard templates)  
✅ **Agent Relationships** (440 delegation/collaboration relationships)  
✅ **LLM Configuration** (10+ providers, 50+ models)  
✅ **Multi-Tenancy** (2 tenants: Pharma, Digital Health)  

**Total Database Records**: **8,022+** agent enrichment records

**Status**: ✅ **Production-Ready**

---

**For more details, see**:
- `AGENT_SCHEMA_DIAGRAM.md` - Visual ERD
- `AGENT_SCHEMA_QUICK_REFERENCE.md` - SQL snippets
- `AGENT_ENRICHMENT_COMPLETE_CERTIFIED.md` - Enrichment status
- `AGENTOS_3.0_FIVE_LEVEL_AGENT_HIERARCHY.md` - Level system docs

---

*Last updated: November 26, 2025*

