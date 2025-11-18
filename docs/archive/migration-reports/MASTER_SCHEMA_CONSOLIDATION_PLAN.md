# Master Schema Consolidation Plan 🎯
## Multi-Tenant SDK with Shared Asset Registry Architecture

**Date**: November 9, 2025  
**Vision**: One shared backend AI engine with reusable assets across multiple industries  
**Architecture**: Multi-tenant SaaS with industry-specific vertical agents

---

## 🎯 Core Vision

### The Power of Shared Assets
```
ONE Persona → MANY Industries (Pharmaceutical, Digital Health, Biotech...)
ONE Agent → MANY Industries (with industry-specific configurations)
ONE Prompt → MANY Use Cases (across different industries)
ONE Workflow → MANY Contexts (customized per industry)
ONE Task → MANY Workflows (reusable building blocks)
```

### Key Principles
1. **Single Source of Truth**: One clean table per entity type
2. **Multi-Industry Support**: Via mapping tables (like prompts ✅)
3. **Multi-Tenancy**: Full tenant isolation with shared assets
4. **Reusability**: Same asset used across industries with different configurations
5. **Vertical Specialization**: Industry-specific metadata & configurations

---

## 📊 Current State Analysis

### What We Have (Dual Architecture) ❌
```
Legacy DH-Specific:          Clean/Shared:           Status:
├── dh_personas (59 cols)    org_personas           ⚠️ Duplicate
├── dh_agent                 agents                 ⚠️ Duplicate
├── dh_prompt                prompts                ✅ Migrated!
├── dh_workflow              workflows              ⚠️ Duplicate
├── dh_task                  (none)                 ❌ No clean version
├── dh_domain                domains                ⚠️ Duplicate
├── dh_use_case              (none)                 ❌ No clean version
├── dh_skill                 (none)                 ❌ Legacy only
├── dh_tool                  (none)                 ❌ Legacy only
└── + 55 more dh_* tables    
```

### What We Need (Clean Multi-Industry) ✅
```
Core Entity Tables:          Industry Mapping:       Tenant Mapping:
├── personas                 persona_industry        persona_tenant
├── agents                   agent_industry          agent_tenant
├── prompts ✅               prompt_industry ✅      prompt_tenant
├── workflows                workflow_industry       workflow_tenant
├── tasks                    task_industry           task_tenant
├── jobs_to_be_done          jtbd_industry           jtbd_tenant
├── skills                   skill_industry          skill_tenant
├── tools                    tool_industry           tool_tenant
├── knowledge_sources        knowledge_industry      knowledge_tenant
└── use_cases                use_case_industry       use_case_tenant
```

---

## 🏗️ Target Architecture

### 1. Core Entity Tables (Single Source of Truth)

Each entity has:
- **Core attributes** (industry-neutral)
- **JSONB metadata** (flexible industry-specific data)
- **Multi-tenant support** (tenant_id)
- **Audit trails** (created_at, updated_at, etc.)

### 2. Industry Mapping Tables (Many-to-Many)

Each entity can be mapped to multiple industries:
- Which industries use this asset?
- Industry-specific configurations
- Industry-specific metadata

### 3. Tenant Mapping Tables (Multi-Tenancy)

Each tenant can:
- Use shared assets from registry
- Create custom private assets
- Override configurations per tenant

### 4. Cross-Entity Relationships

Assets can relate to each other:
- Agents → Prompts → Tasks → Workflows
- Personas → Roles → JTBDs
- Skills → Tools → Knowledge

---

## 📋 Consolidation Plan by Entity

## Entity 1: Personas 👤

### Current State ❌
```sql
-- Legacy: DH-specific (59 columns!)
dh_personas (
    id, persona_name, industry_id, 
    digital_health_id, pharma_id, biotech_id,
    + 53 more columns including responsibilities, pain_points, goals
)

-- Also exists: Org-specific
org_personas (
    id, persona_name, industry_id, primary_role_id,
    + fewer columns
)
```

### Target State ✅
```sql
-- Single clean personas table
CREATE TABLE personas (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- Core Attributes (industry-neutral)
    persona_type VARCHAR(50), -- 'professional', 'patient', 'researcher'
    seniority_level VARCHAR(50), -- 'executive', 'senior', 'mid', 'junior'
    decision_authority VARCHAR(50), -- 'final', 'advisory', 'informational'
    
    -- Description
    description TEXT,
    short_bio TEXT,
    
    -- Profile Data (flexible JSONB)
    profile JSONB, -- {experience_years, education, certifications}
    responsibilities JSONB, -- [{id, title, description, priority}]
    pain_points JSONB, -- [{id, category, description, severity}]
    goals JSONB, -- [{id, type, description, priority, metrics}]
    attributes JSONB, -- {risk_tolerance, tech_savvy, etc.}
    
    -- Behavioral Traits
    communication_style JSONB,
    work_patterns JSONB,
    preferences JSONB,
    
    -- AI Interaction
    ai_interaction_profile JSONB, -- {preferred_tone, complexity_level}
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false, -- Public = shared registry
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id), -- Who created it
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    
    -- Constraints
    CONSTRAINT personas_name_not_empty CHECK (length(name) > 0),
    CONSTRAINT personas_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

-- Indexes
CREATE INDEX idx_personas_tenant ON personas(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_active ON personas(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_public ON personas(is_public) WHERE is_active = true;
CREATE INDEX idx_personas_profile ON personas USING GIN (profile);
CREATE INDEX idx_personas_search ON personas USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);
```

### Industry Mapping ✅
```sql
CREATE TABLE persona_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    -- Industry-specific attributes
    is_primary BOOLEAN DEFAULT false,
    industry_specific_id VARCHAR(100), -- pharma_id, dh_id, biotech_id
    industry_title VARCHAR(255), -- Industry-specific job title
    industry_metadata JSONB, -- Industry-specific data
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id, industry_id)
);

CREATE INDEX idx_persona_industry_persona ON persona_industry_mapping(persona_id);
CREATE INDEX idx_persona_industry_industry ON persona_industry_mapping(industry_id);
CREATE INDEX idx_persona_industry_primary ON persona_industry_mapping(industry_id, is_primary);
```

### Role Mapping ✅
```sql
CREATE TABLE persona_role_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    responsibilities JSONB, -- Role-specific responsibilities
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id, role_id)
);
```

### Migration Strategy
```sql
-- Step 1: Create new personas table
-- Step 2: Migrate from dh_personas
INSERT INTO personas (
    unique_id, name, description, 
    seniority_level, decision_authority,
    profile, responsibilities, pain_points, goals,
    tenant_id, created_at
)
SELECT 
    COALESCE(unique_id, 'DH_' || id::text),
    persona_name,
    description,
    seniority_level,
    decision_authority,
    jsonb_build_object(
        'experience_years', experience_years,
        'education', education_level
    ),
    responsibilities,
    pain_points,
    goals,
    tenant_id,
    created_at
FROM dh_personas
WHERE deleted_at IS NULL;

-- Step 3: Create industry mappings
INSERT INTO persona_industry_mapping (persona_id, industry_id, industry_specific_id, is_primary)
SELECT 
    p.id,
    dp.industry_id,
    CASE 
        WHEN dp.pharma_id IS NOT NULL THEN dp.pharma_id
        WHEN dp.digital_health_id IS NOT NULL THEN dp.digital_health_id
        WHEN dp.biotech_id IS NOT NULL THEN dp.biotech_id
    END,
    true
FROM personas p
JOIN dh_personas dp ON p.unique_id = COALESCE(dp.unique_id, 'DH_' || dp.id::text);

-- Step 4: Migrate from org_personas
-- (Similar process)

-- Step 5: Deprecate old tables (after validation)
-- ALTER TABLE dh_personas RENAME TO _deprecated_dh_personas;
-- ALTER TABLE org_personas RENAME TO _deprecated_org_personas;
```

---

## Entity 2: Agents 🤖

### Current State ❌
```sql
agents (36 columns) -- Clean version exists!
dh_agent (34 columns) -- Legacy DH version
ai_agents (17 columns) -- Another variant?
```

### Target State ✅
```sql
CREATE TABLE agents (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- Classification
    agent_type VARCHAR(50), -- 'specialist', 'generalist', 'coordinator'
    category VARCHAR(100), -- 'medical_affairs', 'clinical_ops', etc.
    specialization VARCHAR(100),
    
    -- Core Config
    description TEXT,
    system_prompt TEXT,
    model_config JSONB, -- {model, temperature, max_tokens}
    
    -- Capabilities
    capabilities JSONB, -- [{capability_id, proficiency_level}]
    skills JSONB, -- [{skill_id, proficiency}]
    tools JSONB, -- [{tool_id, config}]
    
    -- Behavior
    personality_traits JSONB,
    communication_style JSONB,
    decision_making_style VARCHAR(50),
    
    -- Performance
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('Low', 'Medium', 'High')),
    performance_metrics JSONB,
    
    -- Orchestration
    can_delegate BOOLEAN DEFAULT false,
    delegation_rules JSONB,
    escalation_rules JSONB,
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_agent_id UUID REFERENCES agents(id), -- For variants/forks
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT agents_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

-- Indexes
CREATE INDEX idx_agents_tenant ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_category ON agents(category) WHERE is_active = true;
CREATE INDEX idx_agents_public ON agents(is_public, is_featured);
CREATE INDEX idx_agents_capabilities ON agents USING GIN (capabilities);
CREATE INDEX idx_agents_search ON agents USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);
```

### Industry Mapping ✅
```sql
CREATE TABLE agent_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    industry_config JSONB, -- Industry-specific agent configuration
    performance_metrics JSONB, -- Industry-specific metrics
    
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    avg_response_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, industry_id)
);
```

### Prompt Mapping (Already exists!) ✅
```sql
-- This already exists from your recent migration
agent_prompts (
    agent_id REFERENCES agents(id),
    prompt_id REFERENCES prompts(id),
    ...
)
```

---

## Entity 3: Prompts 💬 (ALREADY DONE! ✅)

### Current State ✅
**You already migrated this correctly!**

```sql
prompts -- Clean table ✅
prompt_industry_mapping ✅
prompt_workflow_mapping ✅
prompt_task_mapping ✅
```

**This is the gold standard!** Just need to deprecate `dh_prompt*` tables.

---

## Entity 4: Workflows 🔄

### Current State ❌
```sql
dh_workflow (with tenant_id, use_case_id)
workflows (organization-specific, different schema)
```

### Target State ✅
```sql
CREATE TABLE workflows (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE, -- WF001, WF002
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- Classification
    workflow_type VARCHAR(50), -- 'standard', 'template', 'custom'
    category VARCHAR(100), -- 'clinical', 'regulatory', 'commercial'
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('Low', 'Medium', 'High')),
    
    -- Description
    description TEXT,
    objective TEXT,
    success_criteria JSONB,
    
    -- Structure
    phases JSONB, -- [{id, name, description, sequence}]
    total_tasks INTEGER DEFAULT 0,
    estimated_duration_minutes INTEGER,
    
    -- Configuration
    prerequisites JSONB, -- Required conditions to start
    inputs JSONB, -- Required input data
    outputs JSONB, -- Expected outputs
    validation_rules JSONB,
    
    -- Orchestration
    automation_level VARCHAR(50), -- 'fully_automated', 'semi_automated', 'manual'
    parallel_execution BOOLEAN DEFAULT false,
    branching_rules JSONB,
    
    -- Performance
    sla_minutes INTEGER,
    priority_level VARCHAR(20),
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    
    -- Relations
    use_case_id UUID, -- Optional: link to use case
    parent_workflow_id UUID REFERENCES workflows(id), -- For sub-workflows
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT workflows_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

-- Indexes
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_category ON workflows(category) WHERE is_active = true;
CREATE INDEX idx_workflows_template ON workflows(is_template) WHERE is_active = true;
CREATE INDEX idx_workflows_complexity ON workflows(complexity_level);
```

### Industry Mapping ✅
```sql
CREATE TABLE workflow_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    industry_customization JSONB, -- Industry-specific steps/rules
    regulatory_requirements JSONB, -- Industry-specific compliance
    
    usage_count INTEGER DEFAULT 0,
    avg_completion_time_minutes INTEGER,
    success_rate DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workflow_id, industry_id)
);
```

### Persona Mapping ✅
```sql
CREATE TABLE workflow_persona_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    
    role_in_workflow VARCHAR(50), -- 'owner', 'contributor', 'reviewer', 'approver'
    decision_authority VARCHAR(50) CHECK (decision_authority IN ('FINAL', 'ADVISORY', 'INFORMATIONAL')),
    responsibilities JSONB,
    
    escalation_to_persona_id UUID REFERENCES personas(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workflow_id, persona_id, role_in_workflow)
);
```

---

## Entity 5: Tasks ✅

### Current State ❌
```sql
dh_task + 18 related tables (over-normalized!)
```

### Target State ✅
```sql
CREATE TABLE tasks (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50), -- T1001, T2000
    title VARCHAR(255) NOT NULL,
    
    -- Hierarchy
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    phase_name VARCHAR(100), -- Which phase of the workflow
    position INTEGER, -- Order within workflow
    
    -- Description
    description TEXT,
    objective TEXT,
    success_criteria JSONB,
    
    -- Classification
    task_type VARCHAR(50), -- 'analysis', 'decision', 'creation', 'review'
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('Low', 'Medium', 'High')),
    automation_level VARCHAR(50), -- 'fully_automated', 'assisted', 'manual'
    
    -- Execution
    estimated_duration_minutes INTEGER,
    effort_hours DECIMAL(10,2),
    required_skills JSONB, -- [{skill_id, proficiency_required}]
    required_tools JSONB, -- [{tool_id, config}]
    
    -- Configuration
    inputs JSONB, -- Required inputs
    outputs JSONB, -- Expected outputs
    validation_rules JSONB,
    quality_checks JSONB,
    
    -- Agent Assignment
    assigned_agents JSONB, -- [{agent_id, role, priority}]
    delegation_rules JSONB,
    escalation_rules JSONB,
    
    -- Status & Performance
    sla_minutes INTEGER,
    priority_level VARCHAR(20),
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT tasks_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

-- Simplified supporting tables (instead of 18!)
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50), -- 'blocking', 'optional', 'parallel'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(task_id, depends_on_task_id)
);

CREATE TABLE task_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    output_name VARCHAR(255),
    output_type VARCHAR(50),
    schema JSONB,
    template_id UUID,
    is_required BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Industry Mapping ✅
```sql
CREATE TABLE task_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    industry_config JSONB, -- Industry-specific task config
    regulatory_requirements JSONB,
    
    usage_count INTEGER DEFAULT 0,
    avg_completion_time_minutes INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(task_id, industry_id)
);
```

**Reduction**: 18 tables → 3 tables + JSONB! 🎉

---

## Entity 6: Jobs-to-be-Done (JTBD) 💼

### Current State ✅
**Already well structured!** Just needs industry mapping enhancement.

```sql
jtbd_library -- Good core table
jtbd_persona_mapping -- Already has mappings
jtbd_org_persona_mapping
+ 13 related tables (good detail)
```

### Enhancement ✅
```sql
-- Rename for clarity
ALTER TABLE jtbd_library RENAME TO jobs_to_be_done;

-- Add industry mapping (if not already optimal)
CREATE TABLE jtbd_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    industry_context JSONB, -- Industry-specific context
    success_metrics JSONB, -- Industry-specific KPIs
    
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(jtbd_id, industry_id)
);
```

---

## Entity 7: Skills 🎓

### Current State ❌
```sql
dh_skill (legacy only)
```

### Target State ✅
```sql
CREATE TABLE skills (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Classification
    skill_category VARCHAR(100), -- 'technical', 'domain', 'soft'
    skill_type VARCHAR(50), -- 'analytical', 'creative', 'operational'
    complexity_level VARCHAR(20),
    
    -- Description
    description TEXT,
    learning_path JSONB,
    prerequisites JSONB, -- [{skill_id, proficiency_required}]
    
    -- Proficiency Levels
    proficiency_levels JSONB, -- [{level, description, capabilities}]
    
    -- Assessment
    assessment_criteria JSONB,
    certification_requirements JSONB,
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT skills_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

CREATE TABLE skill_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    industry_importance VARCHAR(20), -- 'critical', 'important', 'nice_to_have'
    demand_level VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(skill_id, industry_id)
);
```

---

## Entity 8: Tools 🔧

### Current State ❌
```sql
dh_tool (legacy)
tools_legacy (another legacy!)
```

### Target State ✅
```sql
CREATE TABLE tools (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Classification
    tool_category VARCHAR(100), -- 'api', 'library', 'service', 'function'
    tool_type VARCHAR(50),
    
    -- Description
    description TEXT,
    documentation_url TEXT,
    
    -- Technical
    integration_type VARCHAR(50), -- 'rest_api', 'graphql', 'grpc', 'function'
    endpoint_url TEXT,
    authentication_type VARCHAR(50),
    
    -- Configuration
    config_schema JSONB, -- Required configuration
    input_schema JSONB,
    output_schema JSONB,
    
    -- Capabilities
    capabilities JSONB,
    limitations JSONB,
    rate_limits JSONB,
    
    -- Performance
    avg_response_time_ms INTEGER,
    reliability_score DECIMAL(3,2),
    cost_per_call DECIMAL(10,4),
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT tools_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

CREATE TABLE tool_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    industry_config JSONB, -- Industry-specific configuration
    compliance_notes TEXT,
    
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tool_id, industry_id)
);
```

---

## Entity 9: Knowledge Sources 📚

### Current State ❌
**10 different RAG/document tables!**
```sql
dh_rag_source
knowledge_documents
knowledge_base_documents
document_chunks
document_chunks_langchain
document_embeddings
rag_documents
rag_knowledge_bases
rag_knowledge_sources
rag_knowledge_chunks
```

### Target State ✅
```sql
CREATE TABLE knowledge_sources (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Classification
    source_type VARCHAR(50), -- 'document', 'url', 'api', 'database', 'structured'
    content_type VARCHAR(50), -- 'pdf', 'html', 'markdown', 'json', 'csv'
    category VARCHAR(100), -- 'research', 'clinical', 'regulatory', 'commercial'
    
    -- Source Details
    source_url TEXT,
    file_path TEXT,
    external_id VARCHAR(255),
    
    -- Content
    title TEXT,
    description TEXT,
    author VARCHAR(255),
    published_date DATE,
    
    -- Processing
    processing_status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
    total_chunks INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    embedding_model VARCHAR(100),
    
    -- Metadata
    metadata JSONB,
    tags TEXT[],
    
    -- Access Control
    is_public BOOLEAN DEFAULT false,
    access_level VARCHAR(50), -- 'public', 'tenant', 'private'
    allowed_roles JSONB,
    
    -- Quality
    quality_score DECIMAL(3,2),
    review_status VARCHAR(50),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT knowledge_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

CREATE TABLE knowledge_chunks (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    
    -- Embedding
    embedding VECTOR(1536), -- pgvector extension
    embedding_model VARCHAR(100),
    
    -- Context
    section_title VARCHAR(500),
    page_number INTEGER,
    
    -- Metadata
    metadata JSONB,
    token_count INTEGER,
    
    -- Quality
    quality_score DECIMAL(3,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT knowledge_chunks_unique UNIQUE (source_id, chunk_index)
);

-- Indexes for vector similarity search
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_knowledge_chunks_source ON knowledge_chunks(source_id);

CREATE TABLE knowledge_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    relevance_score DECIMAL(3,2),
    industry_tags TEXT[],
    
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(knowledge_source_id, industry_id)
);
```

**Reduction**: 10 tables → 3 tables! 🎉

---

## Entity 10: Use Cases 🎯

### Current State ❌
```sql
dh_use_case (legacy)
```

### Target State ✅
```sql
CREATE TABLE use_cases (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE, -- UC001, UC002
    name VARCHAR(255) NOT NULL,
    
    -- Classification
    use_case_type VARCHAR(50), -- 'operational', 'strategic', 'analytical'
    category VARCHAR(100),
    priority_level VARCHAR(20),
    
    -- Description
    description TEXT,
    business_value TEXT,
    success_criteria JSONB,
    
    -- Scope
    target_personas JSONB, -- [{persona_id, role}]
    required_workflows JSONB, -- [{workflow_id, sequence}]
    required_capabilities JSONB,
    
    -- Implementation
    complexity_level VARCHAR(20),
    implementation_effort VARCHAR(50),
    estimated_roi DECIMAL(10,2),
    
    -- Performance
    kpi_metrics JSONB,
    success_stories JSONB,
    
    -- Registry
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Multi-Tenancy
    tenant_id UUID REFERENCES tenants(id),
    owner_tenant_id UUID REFERENCES tenants(id),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT use_cases_unique_per_tenant UNIQUE (unique_id, tenant_id)
);

CREATE TABLE use_case_industry_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false,
    adoption_rate DECIMAL(5,2),
    maturity_level VARCHAR(50),
    regulatory_considerations TEXT,
    
    case_studies JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(use_case_id, industry_id)
);
```

---

## 🔗 Cross-Entity Relationships

### Agent-Persona Mapping
```sql
CREATE TABLE agent_persona_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    
    relationship_type VARCHAR(50), -- 'supports', 'assists', 'collaborates_with'
    interaction_patterns JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, persona_id)
);
```

### Workflow-JTBD Mapping
```sql
CREATE TABLE workflow_jtbd_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    
    contribution_level VARCHAR(50), -- 'primary', 'secondary', 'supporting'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workflow_id, jtbd_id)
);
```

### Task-Agent-Prompt Orchestration
```sql
CREATE TABLE task_agent_prompt_orchestration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id),
    
    execution_sequence INTEGER,
    execution_config JSONB,
    fallback_agent_id UUID REFERENCES agents(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(task_id, agent_id, execution_sequence)
);
```

---

## 🏢 Multi-Tenant Architecture

### Tenant Hierarchy
```sql
-- Already exists, enhance if needed
tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    parent_tenant_id UUID REFERENCES tenants(id), -- For hierarchical tenants
    tenant_type VARCHAR(50), -- 'platform', 'organization', 'team'
    
    -- Configuration
    config JSONB,
    allowed_industries UUID[], -- Which industries can this tenant access?
    
    -- Subscription
    subscription_tier VARCHAR(50),
    features_enabled JSONB,
    
    -- Resource Limits
    max_users INTEGER,
    max_agents INTEGER,
    max_storage_gb INTEGER,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Asset Sharing Model
```sql
CREATE TABLE asset_sharing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type VARCHAR(50), -- 'agent', 'prompt', 'workflow', etc.
    asset_id UUID NOT NULL,
    
    -- Ownership
    owner_tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    -- Sharing
    sharing_scope VARCHAR(50), -- 'private', 'organization', 'public'
    shared_with_tenant_ids UUID[], -- Specific tenants with access
    
    -- Permissions
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_fork BOOLEAN DEFAULT true,
    can_delete BOOLEAN DEFAULT false,
    
    -- Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📊 Migration Execution Plan

### Phase 1: Foundation (Week 1-2) 🏗️

**Objective**: Set up core infrastructure without breaking existing system

#### Week 1: Preparation
1. **Create new clean tables** (don't touch old ones yet)
   ```bash
   # Run migrations
   ./scripts/01_create_personas_table.sql
   ./scripts/02_create_persona_industry_mapping.sql
   ./scripts/03_create_agents_clean.sql
   ./scripts/04_create_agent_industry_mapping.sql
   # ... etc for all entities
   ```

2. **Set up dual-write system**
   - Write to BOTH old and new tables
   - Ensures no data loss during migration

3. **Create validation scripts**
   - Compare old vs new data
   - Ensure consistency

#### Week 2: Initial Data Migration
4. **Migrate Personas** (highest priority)
   ```bash
   python scripts/migrate_personas_to_clean.py --validate-only
   python scripts/migrate_personas_to_clean.py --execute
   python scripts/validate_persona_migration.py
   ```

5. **Migrate Agents**
   ```bash
   python scripts/migrate_agents_to_clean.py --execute
   ```

6. **Verify Prompts** (already done!)
   ```bash
   python scripts/verify_prompt_migration.py
   ```

**Deliverables**:
- ✅ All new tables created
- ✅ Personas migrated
- ✅ Agents consolidated
- ✅ Dual-write system active

---

### Phase 2: Core Entities (Week 3-6) 🚀

**Objective**: Migrate workflows, tasks, and use cases

#### Week 3: Workflows
7. **Create workflow migration**
   ```bash
   python scripts/migrate_workflows_to_clean.py --execute
   python scripts/create_workflow_industry_mappings.py
   ```

8. **Migrate workflow relationships**
   - Workflow → Persona mappings
   - Workflow → Industry mappings
   - Workflow → Use Case mappings

#### Week 4: Tasks
9. **Consolidate task tables** (18 → 3!)
   ```bash
   python scripts/consolidate_tasks.py --plan
   python scripts/consolidate_tasks.py --execute
   ```

10. **Create task industry mappings**
    ```bash
    python scripts/create_task_industry_mappings.py
    ```

#### Week 5: Skills & Tools
11. **Migrate skills**
    ```bash
    python scripts/migrate_skills_to_clean.py --execute
    ```

12. **Migrate tools**
    ```bash
    python scripts/migrate_tools_to_clean.py --execute
    ```

#### Week 6: Knowledge & Use Cases
13. **Consolidate RAG/Knowledge** (10 → 3 tables)
    ```bash
    python scripts/consolidate_knowledge_sources.py --execute
    ```

14. **Migrate use cases**
    ```bash
    python scripts/migrate_use_cases_to_clean.py --execute
    ```

**Deliverables**:
- ✅ All workflows migrated
- ✅ All tasks consolidated
- ✅ Skills & tools migrated
- ✅ Knowledge sources consolidated
- ✅ Use cases migrated

---

### Phase 3: Cross-Entity Relationships (Week 7-8) 🔗

**Objective**: Create all industry and cross-entity mappings

#### Week 7: Industry Mappings
15. **Create all industry mappings**
    ```bash
    python scripts/create_all_industry_mappings.py
    ```
    
    This creates:
    - persona_industry_mapping ✅
    - agent_industry_mapping
    - workflow_industry_mapping
    - task_industry_mapping
    - jtbd_industry_mapping (enhance existing)
    - skill_industry_mapping
    - tool_industry_mapping
    - knowledge_industry_mapping
    - use_case_industry_mapping

#### Week 8: Cross-Entity Relationships
16. **Create relationship mappings**
    ```bash
    python scripts/create_agent_persona_mappings.py
    python scripts/create_workflow_jtbd_mappings.py
    python scripts/create_task_orchestration.py
    ```

**Deliverables**:
- ✅ All industry mappings created
- ✅ All cross-entity relationships established
- ✅ Data validation complete

---

### Phase 4: Cutover & Cleanup (Week 9-10) ✂️

**Objective**: Switch to new schema and deprecate old tables

#### Week 9: Application Updates
17. **Update application code**
    - Update all queries to use new tables
    - Remove references to old tables
    - Deploy incrementally

18. **Performance testing**
    - Load testing
    - Query optimization
    - Index tuning

#### Week 10: Deprecation
19. **Deprecate old tables**
    ```sql
    -- Rename old tables
    ALTER TABLE dh_personas RENAME TO _deprecated_dh_personas_2025_11;
    ALTER TABLE dh_agent RENAME TO _deprecated_dh_agent_2025_11;
    ALTER TABLE dh_workflow RENAME TO _deprecated_dh_workflow_2025_11;
    -- ... etc
    
    -- After 30 days of monitoring, drop tables
    -- DROP TABLE _deprecated_dh_personas_2025_11;
    ```

20. **Remove duplicate org tables**
    ```sql
    -- Verify no references
    -- Then drop
    DROP TABLE departments CASCADE; -- Keep org_departments
    DROP TABLE roles CASCADE; -- Keep org_roles
    DROP TABLE functions CASCADE; -- Keep org_functions
    DROP TABLE organizational_roles CASCADE; -- Duplicate of org_roles
    DROP TABLE business_functions CASCADE; -- Duplicate of org_functions
    ```

**Deliverables**:
- ✅ Application fully on new schema
- ✅ Old tables deprecated
- ✅ Performance validated
- ✅ Documentation updated

---

### Phase 5: Advanced Features (Week 11-12) ⚡

**Objective**: Add enterprise features

21. **Implement full-text search**
    ```sql
    -- Add tsvector columns
    ALTER TABLE personas ADD COLUMN search_vector tsvector;
    CREATE INDEX idx_personas_search ON personas USING GIN(search_vector);
    ```

22. **Add Row-Level Security (RLS)**
    ```sql
    ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation ON personas
        FOR ALL
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
    ```

23. **Create materialized views**
    ```sql
    CREATE MATERIALIZED VIEW persona_analytics AS
    SELECT 
        p.id,
        p.name,
        COUNT(DISTINCT pim.industry_id) as industry_count,
        COUNT(DISTINCT prm.role_id) as role_count,
        COUNT(DISTINCT jam.jtbd_id) as jtbd_count
    FROM personas p
    LEFT JOIN persona_industry_mapping pim ON p.id = pim.persona_id
    LEFT JOIN persona_role_mapping prm ON p.id = prm.persona_id
    LEFT JOIN jtbd_persona_mapping jam ON p.id = jam.persona_id
    GROUP BY p.id, p.name;
    ```

24. **Implement versioning system**
    ```sql
    CREATE TABLE entity_versions (
        id UUID PRIMARY KEY,
        entity_type VARCHAR(50),
        entity_id UUID,
        version INTEGER,
        data JSONB,
        created_by UUID,
        created_at TIMESTAMPTZ
    );
    ```

**Deliverables**:
- ✅ Full-text search enabled
- ✅ RLS implemented
- ✅ Materialized views for analytics
- ✅ Versioning system active

---

## 📋 Migration Scripts Overview

### Script 1: Persona Migration
```python
# scripts/migrate_personas_to_clean.py

import os
from supabase import create_client
from dotenv import load_dotenv

def migrate_personas():
    """
    Migrate from dh_personas + org_personas → personas
    """
    supabase = get_supabase_client()
    
    # Step 1: Migrate dh_personas
    print("Migrating dh_personas...")
    dh_personas = supabase.table('dh_personas')\
        .select('*')\
        .is_('deleted_at', 'null')\
        .execute()
    
    for dp in dh_personas.data:
        persona = {
            'unique_id': dp.get('unique_id') or f"DH_{dp['id']}",
            'name': dp['persona_name'],
            'description': dp.get('description'),
            'seniority_level': dp.get('seniority_level'),
            'decision_authority': dp.get('decision_authority'),
            'profile': {
                'experience_years': dp.get('experience_years'),
                'education': dp.get('education_level'),
            },
            'responsibilities': dp.get('responsibilities'),
            'pain_points': dp.get('pain_points'),
            'goals': dp.get('goals'),
            'is_public': True,  # Shared registry
            'tenant_id': dp.get('tenant_id'),
            'created_at': dp.get('created_at'),
        }
        
        # Insert into new personas table
        result = supabase.table('personas').insert(persona).execute()
        persona_id = result.data[0]['id']
        
        # Create industry mappings
        if dp.get('industry_id'):
            mapping = {
                'persona_id': persona_id,
                'industry_id': dp['industry_id'],
                'is_primary': True,
                'industry_specific_id': dp.get('pharma_id') or dp.get('digital_health_id'),
            }
            supabase.table('persona_industry_mapping').insert(mapping).execute()
    
    # Step 2: Migrate org_personas (similar process)
    print("Migrating org_personas...")
    # ... similar logic
    
    print("✅ Persona migration complete!")

if __name__ == "__main__":
    migrate_personas()
```

### Script 2: Agent Consolidation
```python
# scripts/migrate_agents_to_clean.py

def consolidate_agents():
    """
    Consolidate agents, dh_agent, ai_agents → agents
    """
    supabase = get_supabase_client()
    
    # Clean 'agents' table already exists!
    # Just need to migrate from dh_agent
    
    dh_agents = supabase.table('dh_agent')\
        .select('*')\
        .execute()
    
    for da in dh_agents.data:
        # Check if already exists in clean agents
        existing = supabase.table('agents')\
            .select('id')\
            .eq('name', da['name'])\
            .execute()
        
        if existing.data:
            print(f"Agent {da['name']} already exists, skipping")
            continue
        
        agent = {
            'unique_id': da.get('unique_id') or f"DH_{da['id']}",
            'name': da['name'],
            'category': da.get('category'),
            'description': da.get('description'),
            'system_prompt': da.get('system_prompt'),
            'model_config': da.get('model_config'),
            'capabilities': da.get('capabilities'),
            'is_public': True,
            'tenant_id': da.get('tenant_id'),
        }
        
        result = supabase.table('agents').insert(agent).execute()
        agent_id = result.data[0]['id']
        
        # Create industry mapping based on category
        if da.get('category') == 'medical_affairs':
            # Map to pharmaceutical industry
            pharma_id = get_industry_id('pharmaceuticals')
            supabase.table('agent_industry_mapping').insert({
                'agent_id': agent_id,
                'industry_id': pharma_id,
                'is_primary': True
            }).execute()
    
    print("✅ Agent consolidation complete!")
```

### Script 3: Create All Industry Mappings
```python
# scripts/create_all_industry_mappings.py

def create_all_industry_mappings():
    """
    Create industry mappings for all entities based on their metadata
    """
    supabase = get_supabase_client()
    
    entities = [
        'personas', 'agents', 'workflows', 'tasks', 
        'jobs_to_be_done', 'skills', 'tools', 
        'knowledge_sources', 'use_cases'
    ]
    
    for entity_type in entities:
        print(f"\nCreating industry mappings for {entity_type}...")
        create_entity_industry_mappings(supabase, entity_type)
    
    print("\n✅ All industry mappings created!")

def create_entity_industry_mappings(supabase, entity_type):
    """
    Create industry mappings for a specific entity type
    """
    # Get all entities
    entities = supabase.table(entity_type)\
        .select('id, metadata, category')\
        .execute()
    
    for entity in entities.data:
        # Determine industries based on metadata, category, etc.
        industries = determine_industries(entity)
        
        # Create mappings
        mapping_table = f"{entity_type.rstrip('s')}_industry_mapping"
        for industry_id, is_primary in industries:
            mapping = {
                f'{entity_type.rstrip("s")}_id': entity['id'],
                'industry_id': industry_id,
                'is_primary': is_primary
            }
            
            try:
                supabase.table(mapping_table).insert(mapping).execute()
                print(f"  ✓ Mapped {entity['id']} to industry {industry_id}")
            except Exception as e:
                if 'duplicate' not in str(e).lower():
                    print(f"  ✗ Error: {e}")
```

---

## 🎯 Success Metrics

### Pre-Migration Baseline
| Metric | Current | Target |
|--------|---------|--------|
| **Total Tables** | ~200 | ~100 |
| **dh_* Tables** | 64 | 0 |
| **Duplicate Tables** | 15+ | 0 |
| **Task Tables** | 18 | 3 |
| **RAG Tables** | 10 | 3 |
| **Schema Consistency** | 40% | 95% |
| **Industry Mappings** | 10% | 100% |
| **Query Performance** | Baseline | +30% |

### Post-Migration Targets
- ✅ **50% reduction in table count**
- ✅ **100% industry mapping coverage**
- ✅ **Zero duplicate tables**
- ✅ **All entities follow clean architecture**
- ✅ **30% faster queries** (with indexes & materialized views)
- ✅ **Complete audit trail** on all tables
- ✅ **Full multi-tenant isolation**

---

## 📚 Documentation Deliverables

1. **Schema Documentation**
   - Entity-Relationship Diagrams (ERD)
   - Table descriptions
   - Column definitions
   - Relationship mappings

2. **API Documentation**
   - Query patterns
   - Common use cases
   - Performance tips

3. **Migration Guide**
   - Step-by-step instructions
   - Rollback procedures
   - Troubleshooting

4. **Developer Guide**
   - How to add new entities
   - How to add industry mappings
   - Best practices

---

## 🚨 Risk Mitigation

### Risk 1: Data Loss During Migration
**Mitigation**:
- Dual-write system (write to both old and new)
- Full backups before each phase
- Validation scripts after each step
- 30-day retention of deprecated tables

### Risk 2: Application Downtime
**Mitigation**:
- Incremental deployment
- Feature flags for new schema
- Rollback plan at each step
- Blue-green deployment

### Risk 3: Performance Degradation
**Mitigation**:
- Comprehensive indexing
- Materialized views for analytics
- Query optimization
- Load testing before cutover

### Risk 4: Incomplete Industry Mappings
**Mitigation**:
- Automated mapping detection
- Manual review process
- Default to primary industry if ambiguous
- Bulk update tools for corrections

---

## ✅ Acceptance Criteria

### Phase 1 Complete When:
- [ ] All new tables created
- [ ] Personas migrated with 100% data integrity
- [ ] Agents consolidated
- [ ] Validation scripts pass

### Phase 2 Complete When:
- [ ] Workflows, tasks, use cases migrated
- [ ] Skills, tools, knowledge consolidated
- [ ] All data validated

### Phase 3 Complete When:
- [ ] All industry mappings created
- [ ] All cross-entity relationships established
- [ ] Performance benchmarks met

### Phase 4 Complete When:
- [ ] Application fully on new schema
- [ ] Old tables deprecated (not dropped yet)
- [ ] 7 days of production monitoring with no issues
- [ ] Documentation complete

### Final Success When:
- [ ] Old tables dropped (after 30 days)
- [ ] Performance targets exceeded
- [ ] Development velocity increased
- [ ] Zero schema-related bugs
- [ ] Team trained on new architecture

---

## 🎓 Training & Knowledge Transfer

### Week 8-9: Developer Training
1. **Schema Overview Session** (2 hours)
   - New architecture explanation
   - Industry mapping concepts
   - Multi-tenancy model

2. **Hands-On Workshop** (4 hours)
   - Querying new schema
   - Creating industry mappings
   - Adding new entities

3. **Best Practices Guide**
   - Naming conventions
   - When to use JSONB vs columns
   - Index optimization

### Documentation
- **Interactive Schema Explorer** (build with dbdocs.io or similar)
- **Video Tutorials** for common operations
- **Runbook** for operations team

---

## 💰 Estimated Effort

| Phase | Duration | Effort (Hours) | Team Size |
|-------|----------|----------------|-----------|
| **Phase 1: Foundation** | 2 weeks | 80 | 2 developers |
| **Phase 2: Core Entities** | 4 weeks | 160 | 2 developers |
| **Phase 3: Relationships** | 2 weeks | 80 | 2 developers |
| **Phase 4: Cutover** | 2 weeks | 60 | 2 developers + 1 ops |
| **Phase 5: Advanced** | 2 weeks | 60 | 1 developer |
| **TOTAL** | **12 weeks** | **440 hours** | **2-3 people** |

**Cost Savings Post-Migration**:
- 30% faster development (fewer tables to understand)
- 50% fewer schema-related bugs
- 20% better query performance
- Easier onboarding for new developers

**ROI**: Positive after 6 months

---

## 🎯 Next Steps

### This Week (Immediate)
1. **Review and approve this plan** with stakeholders
2. **Set up development environment** for migration
3. **Create backup strategy**
4. **Schedule Phase 1 kickoff**

### Next Week
5. **Start Phase 1 execution**
6. **Daily standup** to track progress
7. **Create first set of migration scripts**

---

## 📞 Support & Questions

**Migration Lead**: [Your Name]  
**Architecture Review**: [Team Lead]  
**Slack Channel**: #schema-migration  
**Documentation**: /docs/schema-migration/

---

**Status**: Ready for execution  
**Approval Required**: Yes  
**Estimated Completion**: 12 weeks from start  
**Priority**: High

---

**Generated**: November 9, 2025  
**Next Review**: Weekly during execution  
**Success Criteria**: All phases complete, performance targets met, zero data loss

---

Let's transform your database into a **world-class, multi-tenant, multi-industry asset registry!** 🚀

