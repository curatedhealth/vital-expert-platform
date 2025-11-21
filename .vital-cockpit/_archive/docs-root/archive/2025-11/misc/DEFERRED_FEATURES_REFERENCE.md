# Deferred Features and Removed Columns - Reference Document

**Purpose:** Complete reference for all columns, tables, and features that were identified but NOT implemented in Phase 1 migrations due to schema constraints.

**Status:** FOR FUTURE IMPLEMENTATION
**Priority:** To be determined based on business requirements

---

## Table of Contents
1. [Agents Table - Missing Columns](#agents-table---missing-columns)
2. [Tenants Table - Missing Columns](#tenants-table---missing-columns)
3. [User_Tenants Table - Missing Columns](#user_tenants-table---missing-columns)
4. [Deferred Resource Tables](#deferred-resource-tables)
5. [Deferred Features](#deferred-features)
6. [Future Migration Plans](#future-migration-plans)

---

## Agents Table - Missing Columns

### Current State
**Remote Schema:** 24 columns
**Local Schema:** 91 columns
**Gap:** 67 columns NOT migrated

### Column Categories

#### 1. Identity & Display (7 columns)
```sql
-- Currently in local schema, NOT in remote:
display_name VARCHAR(255),              -- User-friendly display name
avatar_url TEXT,                        -- Agent avatar image URL
icon VARCHAR(100),                      -- Icon identifier
color_scheme VARCHAR(50),               -- UI color theme
badge_text VARCHAR(50),                 -- Badge label
badge_color VARCHAR(50),                -- Badge color
sort_order INTEGER DEFAULT 0            -- Display order
```

**Use Case:** Enhanced UI presentation, branding
**Priority:** Medium
**Migration Complexity:** Low

---

#### 2. Status & Lifecycle (8 columns)
```sql
-- Currently in local schema, NOT in remote:
status agent_status_enum NOT NULL DEFAULT 'draft',
    -- ENUM: 'active', 'inactive', 'draft', 'archived', 'deprecated'
tier INTEGER CHECK (tier IN (1, 2, 3)),    -- Capability tier
lifecycle_stage VARCHAR(50),                 -- development/beta/production/sunset
validation_status VARCHAR(50),               -- validated/pending/failed
is_active BOOLEAN DEFAULT true,              -- Quick active toggle
activated_at TIMESTAMPTZ,                    -- When activated
deactivated_at TIMESTAMPTZ,                  -- When deactivated
deleted_at TIMESTAMPTZ                       -- Soft delete timestamp
```

**Use Case:** Agent lifecycle management, soft deletes, tier-based features
**Priority:** HIGH
**Migration Complexity:** Medium (requires ENUM type creation)

**ENUM Definition Needed:**
```sql
CREATE TYPE agent_status_enum AS ENUM (
    'active',
    'inactive',
    'draft',
    'archived',
    'deprecated'
);
```

---

#### 3. Advanced LLM Configuration (10 columns)
```sql
-- Currently in local schema, NOT in remote:
top_p DECIMAL(3,2),                     -- Nucleus sampling parameter
frequency_penalty DECIMAL(3,2),         -- Frequency penalty
presence_penalty DECIMAL(3,2),          -- Presence penalty
response_format VARCHAR(50),            -- json/text/structured
stop_sequences TEXT[],                  -- Stop token array
streaming_enabled BOOLEAN DEFAULT true, -- Enable streaming
function_calling_enabled BOOLEAN,       -- Allow function calls
parallel_function_calls BOOLEAN,        -- Parallel execution
max_retry_attempts INTEGER DEFAULT 3,   -- Retry logic
timeout_seconds INTEGER DEFAULT 60      -- Request timeout
```

**Use Case:** Fine-grained LLM behavior control
**Priority:** Medium
**Migration Complexity:** Low

---

#### 4. Categorization & Domain (12 columns)
```sql
-- Currently in local schema, NOT in remote:
primary_category VARCHAR(100),          -- Main category
subcategory VARCHAR(100),               -- Subcategory
specialty VARCHAR(100),                 -- Medical specialty
therapeutic_areas TEXT[],               -- Array of therapeutic areas
regulatory_domains TEXT[],              -- FDA, EMA, PMDA, etc.
industry_focus TEXT[],                  -- Pharma, MedTech, Biotech
use_cases TEXT[],                       -- Common use cases
target_audience TEXT[],                 -- Who uses this agent
required_expertise_level VARCHAR(50),   -- beginner/intermediate/expert
compliance_frameworks TEXT[],           -- 21 CFR Part 11, GxP, HIPAA
certifications TEXT[],                  -- ISO, SOC2, etc.
geographic_scope TEXT[]                 -- US, EU, Global
```

**Use Case:** Advanced filtering, search, recommendations
**Priority:** Medium
**Migration Complexity:** Low

---

#### 5. Knowledge & Tools (8 columns)
```sql
-- Currently in local schema, NOT in remote:
knowledge_domains JSONB,                -- Structured knowledge areas
    -- Example: {"regulatory": ["510k", "PMA"], "clinical": ["Phase I", "Phase II"]}
tools JSONB,                            -- Tool configurations
    -- Example: [{"name": "fda_search", "config": {...}}]
tool_ids UUID[],                        -- Array of tool IDs (FK to tools table)
prompt_templates JSONB,                 -- Saved prompt templates
context_window_size INTEGER,            -- Max context tokens
supports_multimodal BOOLEAN,            -- Images, audio, etc.
supported_file_types TEXT[],            -- pdf, docx, csv, etc.
max_file_size_mb INTEGER                -- File upload limit
```

**Use Case:** Tool integration, knowledge management, file handling
**Priority:** HIGH (for tool/prompt integration)
**Migration Complexity:** Medium (requires tools table)

---

#### 6. Business Metadata (9 columns)
```sql
-- Currently in local schema, NOT in remote:
owner_id UUID,                          -- User who owns this agent
organization_id UUID,                   -- Organization/company
department_id UUID,                     -- Department (FK)
business_function_id UUID,              -- Business function (FK)
role_id UUID,                           -- Organizational role (FK)
cost_per_query DECIMAL(10,4),          -- Cost tracking
billing_code VARCHAR(100),              -- Internal billing
budget_allocation_id UUID,              -- Budget tracking
approval_required BOOLEAN DEFAULT false -- Requires approval
```

**Use Case:** Enterprise features, cost tracking, org structure
**Priority:** Low (for MVP)
**Migration Complexity:** High (requires org structure tables)

---

#### 7. Performance & Analytics (10 columns)
```sql
-- Currently in local schema, NOT in remote:
usage_count INTEGER DEFAULT 0,          -- Total uses
success_rate DECIMAL(5,2),              -- Success percentage
avg_response_time_ms INTEGER,           -- Average latency
rating DECIMAL(3,2),                    -- User rating (1-5)
feedback_count INTEGER DEFAULT 0,       -- Number of feedbacks
error_count INTEGER DEFAULT 0,          -- Total errors
last_error_at TIMESTAMPTZ,              -- Last error timestamp
last_success_at TIMESTAMPTZ,            -- Last successful use
performance_score DECIMAL(5,2),         -- Computed score
analytics_enabled BOOLEAN DEFAULT true  -- Track analytics
```

**Use Case:** Performance monitoring, quality metrics, user feedback
**Priority:** Medium
**Migration Complexity:** Low (but needs analytics pipeline)

---

#### 8. Version Control (5 columns)
```sql
-- Currently in local schema, NOT in remote:
version VARCHAR(50) DEFAULT '1.0.0',    -- Semantic version
previous_version_id UUID,               -- Link to previous version
is_latest_version BOOLEAN DEFAULT true, -- Current version flag
changelog TEXT,                         -- Version notes
published_at TIMESTAMPTZ                -- Publication timestamp
```

**Use Case:** Agent versioning, rollback capability
**Priority:** Low (for MVP)
**Migration Complexity:** Medium

---

## Tenants Table - Missing Columns

### Current State
**Remote Schema:** 4 columns (id, name, slug, type)
**Local Schema:** 39 columns
**Gap:** 35 columns NOT migrated

### Essential Missing Columns

```sql
-- Subscription Management
subscription_tier VARCHAR(50) DEFAULT 'standard',
    -- Values: free, standard, professional, enterprise
subscription_status VARCHAR(50) DEFAULT 'active',
    -- Values: active, inactive, trial, suspended, cancelled
trial_ends_at TIMESTAMPTZ,
subscription_started_at TIMESTAMPTZ,
subscription_ends_at TIMESTAMPTZ,
billing_cycle VARCHAR(50),               -- monthly/annual
payment_method_id VARCHAR(255),          -- Stripe payment method
last_payment_at TIMESTAMPTZ,
next_billing_date TIMESTAMPTZ,

-- Tenant Hierarchy
parent_tenant_id UUID REFERENCES tenants(id),  -- For sub-tenants
tenant_level INTEGER DEFAULT 0,          -- Hierarchy depth
tenant_path TEXT,                        -- Materialized path

-- Configuration
resource_access_config JSONB,
    -- Example:
    {
        "shared_resources": {
            "agents": true,
            "tools": true,
            "prompts": true,
            "rag": true
        },
        "custom_resources": {
            "agents": true,
            "max_agents": 50,
            "max_rag_storage_gb": 25
        },
        "sharing": {
            "can_share_resources": false,
            "can_receive_shared": true
        }
    }

features JSONB,
    -- Example:
    {
        "rag_enabled": true,
        "expert_panels": true,
        "workflows": true,
        "analytics": true,
        "api_access": false,
        "white_label": false,
        "multi_model": true,
        "advanced_rag": true
    }

config JSONB,
    -- Example:
    {
        "default_model": "gpt-4",
        "max_concurrent_chats": 10,
        "retention_days": 90,
        "allowed_domains": ["company.com"]
    }

quotas JSONB,
    -- Example:
    {
        "max_users": 100,
        "max_agents": 50,
        "max_documents": 10000,
        "max_api_calls_per_month": 100000,
        "max_storage_gb": 25
    }

-- Business Metadata
domain VARCHAR(255) UNIQUE,              -- Custom domain
industry VARCHAR(100),                   -- Healthcare, Pharma, etc.
company_size VARCHAR(50),                -- startup, small, medium, enterprise
country_code VARCHAR(2),                 -- ISO country code
timezone VARCHAR(100),                   -- Timezone
language_code VARCHAR(10),               -- Primary language

-- Compliance
hipaa_compliant BOOLEAN DEFAULT false,
gdpr_compliant BOOLEAN DEFAULT false,
sox_compliant BOOLEAN DEFAULT false,
iso_certified BOOLEAN DEFAULT false,
compliance_notes TEXT,

-- Status & Lifecycle
status VARCHAR(50) DEFAULT 'active',     -- active, inactive, suspended
activated_at TIMESTAMPTZ,
deactivated_at TIMESTAMPTZ,
suspended_at TIMESTAMPTZ,
suspension_reason TEXT,

-- Contact & Support
primary_contact_email VARCHAR(255),
primary_contact_name VARCHAR(255),
primary_contact_phone VARCHAR(50),
support_tier VARCHAR(50),                -- basic, standard, premium
account_manager_id UUID,                 -- Sales/support contact

-- Analytics
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
last_login_at TIMESTAMPTZ,
user_count INTEGER DEFAULT 0,
active_user_count INTEGER DEFAULT 0,
total_api_calls INTEGER DEFAULT 0,
storage_used_gb DECIMAL(10,2) DEFAULT 0,

-- Metadata
metadata JSONB                           -- Flexible additional data
```

**Priority:** HIGH (for proper tenant management)
**Migration Complexity:** Medium

---

## User_Tenants Table - Missing Columns

### Current State
**Remote Schema:** 3 columns (user_id, tenant_id, role)
**Local Schema:** ~10 columns
**Gap:** 7 columns NOT migrated

```sql
-- Status Management
status VARCHAR(50) DEFAULT 'active',
    -- Values: active, inactive, invited, suspended, pending

-- Timestamps
joined_at TIMESTAMPTZ DEFAULT NOW(),
last_accessed_at TIMESTAMPTZ,
activated_at TIMESTAMPTZ,
deactivated_at TIMESTAMPTZ,

-- Invitation System
invitation_token VARCHAR(255) UNIQUE,
invitation_expires_at TIMESTAMPTZ,
invited_by_user_id UUID,

-- Permissions
permissions JSONB,
    -- Example:
    {
        "can_create_agents": true,
        "can_delete_agents": false,
        "can_manage_users": false,
        "can_view_analytics": true
    }

-- Metadata
metadata JSONB
```

**Priority:** Medium
**Migration Complexity:** Low

---

## Deferred Resource Tables

### 1. Tools Table

```sql
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Multi-tenant
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT false,
    sharing_mode VARCHAR(50) DEFAULT 'private',
    shared_with UUID[],
    resource_type VARCHAR(50) DEFAULT 'custom',

    -- Identity
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    icon VARCHAR(100),

    -- Tool Configuration
    tool_type VARCHAR(50) NOT NULL,
        -- Values: api, function, integration, webhook
    category VARCHAR(100),
        -- Values: Regulatory, Clinical Research, Data Analysis, etc.
    endpoint_url TEXT,
    http_method VARCHAR(10),
    headers JSONB,
    authentication_type VARCHAR(50),
    authentication_config JSONB,
    request_schema JSONB,
    response_schema JSONB,
    timeout_seconds INTEGER DEFAULT 30,
    retry_config JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    enabled BOOLEAN DEFAULT true,

    -- Versioning
    version VARCHAR(50) DEFAULT '1.0.0',

    -- Ownership
    created_by_user_id UUID,

    -- Analytics
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    avg_response_time_ms INTEGER,
    last_used_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Indexes
CREATE INDEX idx_tools_tenant_id ON tools(tenant_id);
CREATE INDEX idx_tools_sharing ON tools(is_shared, sharing_mode);
CREATE INDEX idx_tools_type ON tools(tool_type);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_status ON tools(status, enabled);
```

**Example Platform Tools:**
- FDA Database Search
- ClinicalTrials.gov Search
- PubMed Literature Search
- Regulatory Guidance Lookup
- ICD-10 Code Search
- Drug Interaction Checker

**Priority:** HIGH
**Migration Complexity:** Medium
**Dependencies:** Requires tenant infrastructure (complete)

---

### 2. Prompts Table

```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Multi-tenant
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT false,
    sharing_mode VARCHAR(50) DEFAULT 'private',
    shared_with UUID[],
    resource_type VARCHAR(50) DEFAULT 'custom',

    -- Identity
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
        -- Values: Regulatory, Clinical Research, Medical Writing, etc.
    tags TEXT[],

    -- Prompt Content
    prompt_text TEXT NOT NULL,
    system_prompt TEXT,
    input_variables JSONB,
        -- Example: {"device_name": "string", "indication": "string"}
    output_format VARCHAR(50),
        -- Values: text, json, markdown, structured

    -- Configuration
    model_requirements JSONB,
        -- Example: {"min_context_window": 8000, "supports_functions": true}
    temperature DECIMAL(3,2),
    max_tokens INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'active',

    -- Versioning
    version VARCHAR(50) DEFAULT '1.0.0',

    -- Ownership
    created_by_user_id UUID,

    -- Analytics
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    success_rate DECIMAL(5,2),
    last_used_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Indexes
CREATE INDEX idx_prompts_tenant_id ON prompts(tenant_id);
CREATE INDEX idx_prompts_sharing ON prompts(is_shared, sharing_mode);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
```

**Example Platform Prompts:**
- 510(k) Submission Review
- Clinical Trial Protocol Analysis
- Adverse Event Report Generation
- Regulatory Strategy Development
- Medical Device Classification
- Risk Management File Review

**Priority:** HIGH
**Migration Complexity:** Low
**Dependencies:** Requires tenant infrastructure (complete)

---

### 3. Workflows Table

```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Multi-tenant
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT false,
    sharing_mode VARCHAR(50) DEFAULT 'private',
    shared_with UUID[],
    resource_type VARCHAR(50) DEFAULT 'custom',

    -- Identity
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    icon VARCHAR(100),

    -- Workflow Definition
    workflow_type VARCHAR(50) NOT NULL,
        -- Values: sequential, parallel, conditional, loop
    workflow_definition JSONB NOT NULL,
        -- LangGraph or custom workflow format
    steps JSONB,
        -- Array of workflow steps with agent assignments
    input_schema JSONB,
    output_schema JSONB,

    -- Agent Configuration
    agent_ids UUID[],
    agent_roles JSONB,
        -- Example: {"reviewer": "agent-uuid", "strategist": "agent-uuid"}

    -- Execution Configuration
    timeout_seconds INTEGER DEFAULT 300,
    max_retries INTEGER DEFAULT 3,
    error_handling VARCHAR(50) DEFAULT 'stop',
        -- Values: stop, continue, retry, skip

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    enabled BOOLEAN DEFAULT true,

    -- Versioning
    version VARCHAR(50) DEFAULT '1.0.0',

    -- Ownership
    created_by_user_id UUID,

    -- Analytics
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER,
    last_executed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Indexes
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_workflows_sharing ON workflows(is_shared, sharing_mode);
CREATE INDEX idx_workflows_type ON workflows(workflow_type);
CREATE INDEX idx_workflows_status ON workflows(status, enabled);
CREATE INDEX idx_workflows_agent_ids ON workflows USING GIN(agent_ids);
```

**Example Platform Workflows:**
- 510(k) Submission Preparation (multi-agent)
- Clinical Trial Design & Review
- Regulatory Strategy Development
- Post-Market Surveillance Analysis
- Quality System Audit
- Risk Assessment & Mitigation

**Priority:** Medium
**Migration Complexity:** High
**Dependencies:** Requires agents, tools, prompts tables

---

### 4. RAG Knowledge Sources Table

```sql
CREATE TABLE rag_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Multi-tenant
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT false,
    sharing_mode VARCHAR(50) DEFAULT 'private',
    shared_with UUID[],
    resource_type VARCHAR(50) DEFAULT 'custom',

    -- Identity
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
        -- Values: Guidelines, Regulations, Literature, Internal Docs, etc.
    tags TEXT[],

    -- Source Configuration
    source_type VARCHAR(50) NOT NULL,
        -- Values: file, url, database, api, notion, confluence
    source_url TEXT,
    source_config JSONB,

    -- File Information
    file_path TEXT,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    page_count INTEGER,

    -- Processing
    processing_status VARCHAR(50) DEFAULT 'pending',
        -- Values: pending, processing, completed, failed
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_error TEXT,

    -- Embeddings
    embedding_model VARCHAR(100),
    chunk_size INTEGER DEFAULT 1000,
    chunk_overlap INTEGER DEFAULT 200,
    total_chunks INTEGER,
    vector_store_id VARCHAR(255),

    -- Metadata Extraction
    extracted_metadata JSONB,
    language VARCHAR(10),
    publication_date DATE,
    author TEXT,
    source_organization TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    enabled BOOLEAN DEFAULT true,

    -- Ownership
    created_by_user_id UUID,

    -- Analytics
    query_count INTEGER DEFAULT 0,
    last_queried_at TIMESTAMPTZ,
    avg_relevance_score DECIMAL(5,4),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Indexes
CREATE INDEX idx_rag_sources_tenant_id ON rag_knowledge_sources(tenant_id);
CREATE INDEX idx_rag_sources_sharing ON rag_knowledge_sources(is_shared, sharing_mode);
CREATE INDEX idx_rag_sources_type ON rag_knowledge_sources(source_type);
CREATE INDEX idx_rag_sources_status ON rag_knowledge_sources(status, enabled);
CREATE INDEX idx_rag_sources_processing ON rag_knowledge_sources(processing_status);
```

**Example Platform Knowledge Sources:**
- FDA Guidance Documents
- 21 CFR Regulations
- ICH Guidelines
- ISO 13485 Standards
- PubMed Research Papers
- ClinicalTrials.gov Data

**Priority:** HIGH
**Migration Complexity:** High
**Dependencies:** Requires vector database, embedding service

---

## Deferred Features

### 1. Advanced Subscription Management
**Status:** Not Implemented
**Priority:** HIGH (for SaaS)

**Features:**
- Trial period tracking
- Subscription tier upgrades/downgrades
- Billing cycle management
- Payment method integration (Stripe)
- Usage-based billing
- Quota enforcement
- Overage handling

**Required Tables:**
- subscriptions
- invoices
- usage_logs
- quota_tracking

**Migration Estimate:** 600 lines SQL

---

### 2. User Invitation System
**Status:** Not Implemented
**Priority:** Medium

**Features:**
- Email invitations with tokens
- Invitation expiration
- Role assignment on acceptance
- Bulk invitations
- Invitation tracking

**Required Columns:**
- user_tenants.invitation_token
- user_tenants.invitation_expires_at
- user_tenants.invited_by_user_id
- user_tenants.status

**Migration Estimate:** 200 lines SQL

---

### 3. Materialized Views for Performance
**Status:** Not Implemented
**Priority:** Medium

**Views Needed:**
1. `mv_platform_shared_resources`
   - All globally shared agents, tools, prompts, workflows
   - Refresh: Hourly or on-demand
   - Purpose: Fast access to platform resources

2. `mv_tenant_resource_counts`
   - Aggregated counts per tenant
   - Purpose: Analytics, quota enforcement

3. `mv_popular_agents`
   - Top-used agents by tenant
   - Purpose: Recommendations

**Migration Estimate:** 300 lines SQL

---

### 4. Advanced Analytics & Reporting
**Status:** Not Implemented
**Priority:** Low

**Features:**
- Usage analytics per agent/tool/workflow
- Performance metrics tracking
- Cost attribution
- User behavior analytics
- Custom reports

**Required Tables:**
- usage_events
- performance_metrics
- cost_tracking
- analytics_reports

**Migration Estimate:** 500 lines SQL

---

### 5. Audit Logging (Partial)
**Status:** Partially Implemented
**Priority:** Medium

**Implemented:**
- resource_sharing_audit table (basic)

**Not Implemented:**
- Comprehensive audit logs for all actions
- User activity logs
- System events
- Security events
- Compliance audit trails

**Migration Estimate:** 400 lines SQL

---

## Future Migration Plans

### Migration 5: Complete Schema Sync (Priority: HIGH)
**Goal:** Add remaining 67 columns to agents table
**Estimated Size:** 400 lines SQL
**Complexity:** Medium
**Dependencies:** None

**Steps:**
1. Create agent_status_enum type
2. Add status, tier, lifecycle_stage columns
3. Add display_name, avatar_url, icon columns
4. Add LLM configuration columns
5. Add categorization columns
6. Add knowledge_domains, tools JSONB columns
7. Add performance analytics columns
8. Add version control columns
9. Update indexes
10. Migrate data if needed

---

### Migration 6: Resource Tables (Priority: HIGH)
**Goal:** Create tools, prompts, workflows, rag_knowledge_sources tables
**Estimated Size:** 800 lines SQL
**Complexity:** Medium
**Dependencies:** Migration 5 (optional)

**Steps:**
1. Create tools table with RLS
2. Create prompts table with RLS
3. Create workflows table with RLS
4. Create rag_knowledge_sources table with RLS
5. Seed platform tools (FDA search, PubMed, etc.)
6. Seed platform prompts (510(k) review, etc.)
7. Update agent-tool relationships
8. Create materialized views

---

### Migration 7: Tenant Management (Priority: HIGH)
**Goal:** Add 35 missing columns to tenants table
**Estimated Size:** 600 lines SQL
**Complexity:** Medium
**Dependencies:** None

**Steps:**
1. Add subscription management columns
2. Add tenant hierarchy columns
3. Add configuration JSONB columns (resource_access_config, features, config, quotas)
4. Add business metadata columns
5. Add compliance columns
6. Add contact & support columns
7. Add analytics columns
8. Update tenant policies
9. Create subscription tracking functions

---

### Migration 8: User Management (Priority: Medium)
**Goal:** Add 7 missing columns to user_tenants table
**Estimated Size:** 400 lines SQL
**Complexity:** Low
**Dependencies:** Migration 7

**Steps:**
1. Add status tracking columns
2. Add invitation system columns
3. Add permissions JSONB column
4. Create invitation functions
5. Create user onboarding workflow
6. Update user-tenant RLS policies

---

### Migration 9: Performance Optimization (Priority: Medium)
**Goal:** Materialized views and caching
**Estimated Size:** 300 lines SQL
**Complexity:** Medium
**Dependencies:** Migration 6

**Steps:**
1. Create mv_platform_shared_resources
2. Create mv_tenant_resource_counts
3. Create mv_popular_agents
4. Create refresh functions
5. Set up automated refresh jobs
6. Add caching layer

---

### Migration 10: Analytics & Reporting (Priority: Low)
**Goal:** Comprehensive analytics system
**Estimated Size:** 500 lines SQL
**Complexity:** High
**Dependencies:** All previous migrations

**Steps:**
1. Create usage_events table
2. Create performance_metrics table
3. Create cost_tracking table
4. Create analytics_reports table
5. Create aggregation functions
6. Create reporting views
7. Set up automated aggregation jobs

---

## Total Future Work Estimate

| Migration | Priority | Lines SQL | Complexity | Dependencies |
|-----------|----------|-----------|------------|--------------|
| 5. Schema Sync | HIGH | 400 | Medium | None |
| 6. Resource Tables | HIGH | 800 | Medium | Mig 5 (opt) |
| 7. Tenant Mgmt | HIGH | 600 | Medium | None |
| 8. User Mgmt | Medium | 400 | Low | Mig 7 |
| 9. Performance | Medium | 300 | Medium | Mig 6 |
| 10. Analytics | Low | 500 | High | All |
| **TOTAL** | - | **3,000** | - | - |

---

## Decision Matrix: What to Implement Next

### Immediate Next Steps (Post-Phase 2)
1. **Migration 5** - Complete agent schema
   - Reason: Unlocks tier-based features, soft deletes, better UI
   - Benefit: Full feature parity with local schema

2. **Migration 6** - Resource tables
   - Reason: Enables tool/prompt integration, workflows
   - Benefit: Platform tools usable by all tenants

3. **Migration 7** - Tenant management
   - Reason: Essential for SaaS business model
   - Benefit: Subscription management, billing, quotas

### Medium Term (Q1 2026)
4. **Migration 8** - User management
   - Reason: Better user onboarding, permissions
   - Benefit: Invitation system, fine-grained access control

5. **Migration 9** - Performance optimization
   - Reason: Handle scale, improve response times
   - Benefit: Faster queries, better UX

### Long Term (Q2+ 2026)
6. **Migration 10** - Analytics & reporting
   - Reason: Business intelligence, insights
   - Benefit: Data-driven decisions, customer insights

---

## Rollback Strategy

### If Future Migrations Fail

**Migration 5 Rollback:**
```sql
-- Drop added columns
ALTER TABLE agents
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS tier,
DROP COLUMN IF EXISTS display_name,
...

-- Drop enum type
DROP TYPE IF EXISTS agent_status_enum;
```

**Migration 6 Rollback:**
```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS rag_knowledge_sources CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
```

**General Rollback Principles:**
1. Always create backups before migration
2. Use transactions where possible
3. Test rollback scripts before production
4. Document rollback procedures
5. Keep migration history

---

## Contact & Maintenance

**Document Owner:** Migration Team
**Last Updated:** 2025-10-26
**Next Review:** After Phase 2 completion
**Questions:** Contact development team

---

**END OF REFERENCE DOCUMENT**
