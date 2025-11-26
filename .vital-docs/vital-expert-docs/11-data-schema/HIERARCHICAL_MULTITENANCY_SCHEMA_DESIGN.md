# Hierarchical Multi-Tenancy Database Schema Design

## Executive Summary

This document provides the complete database schema design for VITAL's 3-level hierarchical multi-tenant architecture supporting platform-level, tenant-level, and organization-level data isolation with proper sharing mechanisms.

## Architecture Overview

### 3-Level Hierarchy

```
Platform (UUID: 00000000-0000-0000-0000-000000000001)
├── Tenant: Pharmaceuticals (tenant_key: 'pharma')
│   ├── Organization: Novartis (org_key: 'novartis')
│   └── Organization: Pfizer (org_key: 'pfizer')
│
└── Tenant: Digital Health (tenant_key: 'digital-health')
    ├── Organization: Mayo Clinic (org_key: 'mayo-clinic')
    └── Organization: Kaiser (org_key: 'kaiser')
```

### Data Isolation Requirements

| Level | Scope | Access Pattern |
|-------|-------|----------------|
| **Platform** | System-wide | All users across all tenants |
| **Tenant** | Pharma-wide or Digital Health-wide | All organizations within the tenant |
| **Organization** | Novartis-only or Pfizer-only | Single organization users only |

### Design Decisions

After careful analysis, here are the key architectural decisions:

#### 1. Unified Organizations Table (RECOMMENDED)

**Decision:** Use a single `organizations` table with a `parent_organization_id` for the hierarchy.

**Rationale:**
- **Simplicity**: Single table to manage, fewer joins
- **Flexibility**: Easy to add more hierarchy levels if needed
- **Query Efficiency**: Self-referential join is performant with proper indexes
- **Maintenance**: Easier to understand and maintain than separate tables

**Trade-offs:**
```sql
-- CHOSEN APPROACH: Unified table with parent_id
organizations
  - id (tenant Pfizer)
  - parent_organization_id (points to tenant Pharma)
  - organization_type ('platform' | 'tenant' | 'organization')

Pros:
✓ Single source of truth
✓ Easy recursive queries (WITH RECURSIVE)
✓ Simpler foreign key relationships
✓ Natural tree structure

Cons:
✗ Self-referential FK can be confusing
✗ Need to validate hierarchy depth in triggers
```

vs.

```sql
-- REJECTED: Separate tenants and organizations tables
tenants (id, name)
organizations (id, tenant_id, name)

Pros:
✓ Clear separation of concerns
✓ Explicit relationship

Cons:
✗ More complex queries (always need 2 tables)
✗ Harder to extend hierarchy
✗ Duplicate data (platform is both tenant AND org)
```

#### 2. Sharing Scope Strategy (RECOMMENDED)

**Decision:** Use `sharing_scope` ENUM + `owner_organization_id` pattern.

**Rationale:**
- **Clarity**: Explicit declaration of sharing level
- **Performance**: Single column filter in queries
- **Consistency**: Same pattern across all multi-tenant tables
- **Validation**: Database-enforced via ENUM constraint

**Schema Pattern:**
```sql
-- CHOSEN APPROACH: sharing_scope ENUM
CREATE TYPE sharing_scope_type AS ENUM ('platform', 'tenant', 'organization');

agents
  - id
  - owner_organization_id (who created/owns it)
  - sharing_scope ('platform' | 'tenant' | 'organization')

Query Logic:
- scope='platform' → visible to all
- scope='tenant' → visible to all orgs in same tenant tree
- scope='organization' → visible only to owner_organization_id
```

**Rejected Alternatives:**
```sql
-- Option B: Boolean flags
is_tenant_shared BOOLEAN
is_platform_shared BOOLEAN

Cons:
✗ Ambiguous combinations (both true? both false?)
✗ Harder to extend (what about region-level?)
✗ More complex query logic

-- Option C: Array of organization IDs
shared_with_organization_ids UUID[]

Cons:
✗ Hard to maintain as orgs change
✗ Complex queries (array contains, unnest)
✗ Denormalized data (duplication)
```

#### 3. Column Naming Standardization

**Decision:** Use `owner_organization_id` universally (not `tenant_id`).

**Rationale:**
- **Consistency**: Every resource has exactly one owner
- **Clarity**: `owner_organization_id` + `sharing_scope` makes intent clear
- **Simplicity**: Don't need both `tenant_id` AND `organization_id`

**Pattern:**
```sql
-- ALL multi-tenant tables follow this pattern:
CREATE TABLE {resource} (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL REFERENCES organizations(id),
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',
  -- ... other columns
);
```

#### 4. Foreign Key Cascade Strategy

**Decision:** Use `ON DELETE RESTRICT` for organization deletions, with explicit cleanup workflows.

**Rationale:**
- **Data Safety**: Prevent accidental data loss
- **HIPAA Compliance**: Audit trail required before deletion
- **Intentionality**: Force explicit decision-making

**Pattern:**
```sql
-- Organization hierarchy
ALTER TABLE organizations
  ADD CONSTRAINT fk_parent_organization
  FOREIGN KEY (parent_organization_id)
  REFERENCES organizations(id)
  ON DELETE RESTRICT; -- Prevent deletion if children exist

-- Resource ownership
ALTER TABLE agents
  ADD CONSTRAINT fk_owner_organization
  FOREIGN KEY (owner_organization_id)
  REFERENCES organizations(id)
  ON DELETE RESTRICT; -- Prevent deletion if resources exist

-- Cleanup workflow:
-- 1. Admin initiates org deletion
-- 2. System identifies all owned resources
-- 3. Admin chooses: migrate to another org OR delete all
-- 4. Audit log records decision
-- 5. Deletion proceeds
```

#### 5. User Memberships Strategy

**Decision:** Use `user_organizations` table with hierarchical access via function.

**Rationale:**
- **Explicit**: Users explicitly belong to specific organizations
- **Hierarchical**: Access computed via recursive query
- **Auditable**: Track when users joined/left organizations

**Pattern:**
```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL, -- 'admin', 'member', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Helper function: Get all organizations user can access
CREATE FUNCTION get_user_accessible_organizations(p_user_id UUID)
RETURNS TABLE (organization_id UUID, access_level TEXT) AS $$
WITH RECURSIVE org_tree AS (
  -- Direct memberships
  SELECT uo.organization_id, uo.role as access_level, o.parent_organization_id
  FROM user_organizations uo
  JOIN organizations o ON o.id = uo.organization_id
  WHERE uo.user_id = p_user_id

  UNION ALL

  -- Parent organizations (tenant/platform)
  SELECT o.id, 'inherited', o.parent_organization_id
  FROM organizations o
  JOIN org_tree ot ON ot.parent_organization_id = o.id
)
SELECT DISTINCT organization_id, access_level FROM org_tree;
$$ LANGUAGE sql STABLE;
```

## Complete Schema Design

### Core Tables

#### 1. Organizations Table (Enhanced)

```sql
-- ============================================================================
-- ORGANIZATIONS TABLE (3-Level Hierarchy)
-- ============================================================================
CREATE TYPE organization_type AS ENUM ('platform', 'tenant', 'organization');
CREATE TYPE sharing_scope_type AS ENUM ('platform', 'tenant', 'organization');

CREATE TABLE IF NOT EXISTS organizations (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hierarchy
  parent_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
  organization_type organization_type NOT NULL DEFAULT 'organization',

  -- Core attributes
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-safe identifier
  organization_key TEXT UNIQUE, -- Legacy: maps to tenant_key

  -- Business metadata
  domain TEXT, -- e.g., 'novartis.com'
  industry TEXT,
  size TEXT, -- 'small', 'medium', 'large', 'enterprise'
  country TEXT,

  -- Configuration
  settings JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete for compliance

  -- Constraints
  CONSTRAINT org_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT org_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),

  -- Hierarchy validation: platform has no parent, others must have parent
  CONSTRAINT org_hierarchy_valid CHECK (
    (organization_type = 'platform' AND parent_organization_id IS NULL) OR
    (organization_type != 'platform' AND parent_organization_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_organizations_parent ON organizations(parent_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_type ON organizations(organization_type)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_slug ON organizations(slug)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_key ON organizations(organization_key)
  WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE organizations IS 'Hierarchical multi-tenant organization structure: platform > tenant > organization';
COMMENT ON COLUMN organizations.organization_type IS 'Hierarchy level: platform (VITAL), tenant (Pharma/Digital Health), organization (Novartis/Pfizer)';
COMMENT ON COLUMN organizations.parent_organization_id IS 'Self-referential FK: organizations belong to tenants, tenants belong to platform';
COMMENT ON COLUMN organizations.organization_key IS 'Legacy compatibility: maps to old tenant_key column';
```

#### 2. User Organizations (Membership)

```sql
-- ============================================================================
-- USER ORGANIZATIONS (Membership & Roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_organizations (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Access control
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}', -- Granular permissions

  -- Status
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, organization_id)
);

-- Indexes
CREATE INDEX idx_user_orgs_user ON user_organizations(user_id)
  WHERE is_active = true;
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id)
  WHERE is_active = true;
CREATE INDEX idx_user_orgs_role ON user_organizations(role);

-- Comments
COMMENT ON TABLE user_organizations IS 'User membership in organizations with role-based access control';
COMMENT ON COLUMN user_organizations.role IS 'User role: admin (full control), member (standard access), viewer (read-only)';
```

### Multi-Tenant Resource Tables

All resource tables follow this standard pattern:

```sql
-- ============================================================================
-- MULTI-TENANT RESOURCE PATTERN
-- ============================================================================
-- Pattern applies to: agents, knowledge_documents, prompts, workflows,
--                     conversations, use_cases, capabilities

CREATE TABLE {resource_name} (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Resource-specific columns
  -- ...

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Constraints specific to resource
  -- ...
);

-- Standard indexes for multi-tenancy
CREATE INDEX idx_{resource}_owner_org ON {resource_name}(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_{resource}_sharing_scope ON {resource_name}(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_{resource}_created_by ON {resource_name}(created_by);
```

#### 3. Agents Table (Enhanced)

```sql
-- ============================================================================
-- AGENTS TABLE (AI Experts)
-- ============================================================================
CREATE TYPE agent_tier AS ENUM ('tier_1', 'tier_2', 'tier_3');
CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'archived', 'draft');

CREATE TABLE IF NOT EXISTS agents (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Core attributes
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,

  -- Classification
  tier agent_tier NOT NULL DEFAULT 'tier_3',
  status agent_status NOT NULL DEFAULT 'active',
  knowledge_domains TEXT[] NOT NULL DEFAULT '{}',
  capabilities TEXT[] NOT NULL DEFAULT '{}',

  -- Presentation
  avatar_url TEXT,
  priority INTEGER NOT NULL DEFAULT 0,

  -- Search & Discovery
  embedding vector(1536), -- OpenAI text-embedding-3-large

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT agents_knowledge_domains_not_empty
    CHECK (array_length(knowledge_domains, 1) > 0),
  CONSTRAINT agents_priority_range
    CHECK (priority BETWEEN 0 AND 1000)
);

-- Indexes
CREATE INDEX idx_agents_owner_org ON agents(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_sharing_scope ON agents(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_tier ON agents(tier)
  WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_agents_status ON agents(status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_knowledge_domains ON agents USING GIN(knowledge_domains);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX idx_agents_created_by ON agents(created_by);

-- Full-text search
CREATE INDEX idx_agents_search ON agents USING GIN(
  to_tsvector('english', name || ' ' || display_name || ' ' || description)
);

-- Comments
COMMENT ON TABLE agents IS 'AI expert agents with hierarchical sharing (org/tenant/platform)';
COMMENT ON COLUMN agents.sharing_scope IS 'Visibility: organization (private), tenant (pharma-wide), platform (all users)';
COMMENT ON COLUMN agents.owner_organization_id IS 'Organization that created/owns this agent';
```

#### 4. Knowledge Documents Table (Enhanced)

```sql
-- ============================================================================
-- KNOWLEDGE DOCUMENTS TABLE (RAG Content)
-- ============================================================================
CREATE TYPE document_status AS ENUM ('draft', 'processing', 'indexed', 'failed', 'archived');

CREATE TABLE IF NOT EXISTS knowledge_documents (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Core attributes
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,

  -- Classification
  domain_id UUID REFERENCES knowledge_domains(id),
  document_type TEXT DEFAULT 'text', -- 'text', 'pdf', 'docx', 'url'
  status document_status DEFAULT 'draft',

  -- File metadata
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,

  -- Processing metadata
  chunk_count INTEGER DEFAULT 0,
  embedding_model TEXT, -- 'text-embedding-3-large'
  processed_at TIMESTAMPTZ,

  -- Search metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT knowledge_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Indexes
CREATE INDEX idx_knowledge_owner_org ON knowledge_documents(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sharing_scope ON knowledge_documents(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domain ON knowledge_documents(domain_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_status ON knowledge_documents(status);
CREATE INDEX idx_knowledge_created_by ON knowledge_documents(created_by);

-- Full-text search
CREATE INDEX idx_knowledge_search ON knowledge_documents USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
);

-- Comments
COMMENT ON TABLE knowledge_documents IS 'RAG knowledge base with org/tenant/platform sharing';
COMMENT ON COLUMN knowledge_documents.sharing_scope IS 'Visibility: organization (private), tenant (shared across tenant), platform (public)';
```

#### 5. Prompts Table (Enhanced)

```sql
-- ============================================================================
-- PROMPTS TABLE (Prompt Library)
-- ============================================================================
CREATE TYPE prompt_complexity AS ENUM ('basic', 'intermediate', 'advanced', 'expert');

CREATE TABLE IF NOT EXISTS prompts (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Core identity
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,

  -- Prompt definition
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT,
  execution_instructions JSONB DEFAULT '{}',
  success_criteria JSONB DEFAULT '{}',

  -- Configuration
  model_requirements JSONB DEFAULT '{"model": "gpt-4", "temperature": 0.7}',
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',

  -- Classification
  complexity_level prompt_complexity DEFAULT 'intermediate',
  domain VARCHAR(100) DEFAULT 'general',
  estimated_tokens INTEGER DEFAULT 1000,

  -- Relationships
  prerequisite_prompts UUID[], -- Array of prompt IDs
  prerequisite_capabilities TEXT[],
  related_capabilities TEXT[],
  required_context TEXT[],

  -- Usage metrics
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2),
  last_used_at TIMESTAMPTZ,

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_prompt_id UUID REFERENCES prompts(id),
  is_latest BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT prompts_name_org_unique UNIQUE(name, owner_organization_id),
  CONSTRAINT prompts_rating_range CHECK (average_rating IS NULL OR average_rating BETWEEN 0 AND 5)
);

-- Indexes
CREATE INDEX idx_prompts_owner_org ON prompts(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_sharing_scope ON prompts(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_category ON prompts(category)
  WHERE is_active = true;
CREATE INDEX idx_prompts_domain ON prompts(domain);
CREATE INDEX idx_prompts_complexity ON prompts(complexity_level);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_created_by ON prompts(created_by);

-- Comments
COMMENT ON TABLE prompts IS 'Prompt engineering library with org/tenant/platform sharing';
```

#### 6. Workflows Table (Enhanced)

```sql
-- ============================================================================
-- WORKFLOWS TABLE (JTBD-Based Workflows)
-- ============================================================================
CREATE TYPE workflow_framework AS ENUM ('langgraph', 'autogen', 'crewai', 'custom');
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'testing', 'deprecated', 'archived');

CREATE TABLE IF NOT EXISTS workflows (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Core attributes
  name TEXT NOT NULL,
  description TEXT,
  framework workflow_framework NOT NULL DEFAULT 'langgraph',

  -- Workflow definition
  workflow_definition JSONB NOT NULL,

  -- Classification
  tags TEXT[],
  category TEXT,

  -- Relationships
  use_case_id UUID REFERENCES use_cases(id),

  -- Status
  status workflow_status DEFAULT 'draft',
  is_template BOOLEAN DEFAULT false,

  -- Usage metrics
  execution_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5, 2),
  average_duration_ms INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT workflows_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT workflows_success_rate_range CHECK (success_rate IS NULL OR success_rate BETWEEN 0 AND 100)
);

-- Indexes
CREATE INDEX idx_workflows_owner_org ON workflows(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_sharing_scope ON workflows(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_use_case ON workflows(use_case_id);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);

-- Comments
COMMENT ON TABLE workflows IS 'JTBD-based agent workflows with multi-level sharing';
```

#### 7. Conversations Table (Enhanced)

```sql
-- ============================================================================
-- CONVERSATIONS TABLE (Chat Sessions)
-- ============================================================================
CREATE TYPE conversation_status AS ENUM ('active', 'paused', 'completed', 'archived', 'deleted');
CREATE TYPE orchestration_mode AS ENUM ('single', 'router', 'panel', 'workflow');
CREATE TYPE compliance_level AS ENUM ('standard', 'hipaa', 'gdpr', 'enterprise');

CREATE TABLE IF NOT EXISTS conversations (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy (conversations belong to single org, NOT shared)
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  -- NOTE: conversations do NOT have sharing_scope - always private to organization

  -- Relationships
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persistent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Core attributes
  title VARCHAR(200) NOT NULL,
  mode orchestration_mode NOT NULL,
  status conversation_status NOT NULL DEFAULT 'active',
  compliance_level compliance_level NOT NULL DEFAULT 'standard',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT conversations_deleted_check CHECK (
    (status = 'deleted' AND deleted_at IS NOT NULL) OR
    (status != 'deleted' AND deleted_at IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_conversations_owner_org ON conversations(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_user ON conversations(user_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Comments
COMMENT ON TABLE conversations IS 'User chat sessions - always private to organization (no sharing)';
COMMENT ON COLUMN conversations.owner_organization_id IS 'Organization where conversation occurred - NOT shared across tenants';
```

#### 8. Use Cases Table (Enhanced)

```sql
-- ============================================================================
-- USE CASES TABLE (Use Case Library)
-- ============================================================================
CREATE TABLE IF NOT EXISTS use_cases (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Core attributes
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'UC_RA_001'
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Classification
  domain VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  complexity INTEGER, -- 1-5

  -- JTBD Components
  jobs_to_be_done TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  success_criteria TEXT[] DEFAULT '{}',

  -- Relationships
  required_agents UUID[], -- Array of agent IDs
  required_capabilities TEXT[],
  required_tools TEXT[],

  -- Workflow
  default_workflow_id UUID REFERENCES workflows(id),

  -- Usage metrics
  implementation_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5, 2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  maturity_level TEXT, -- 'concept', 'pilot', 'production'

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT use_cases_complexity_range CHECK (complexity BETWEEN 1 AND 5)
);

-- Indexes
CREATE INDEX idx_use_cases_owner_org ON use_cases(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_use_cases_sharing_scope ON use_cases(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_use_cases_domain ON use_cases(domain);
CREATE INDEX idx_use_cases_tags ON use_cases USING GIN(tags);
CREATE INDEX idx_use_cases_created_by ON use_cases(created_by);

-- Comments
COMMENT ON TABLE use_cases IS 'Use case library with JTBD methodology and multi-level sharing';
```

#### 9. Capabilities Table (Enhanced)

```sql
-- ============================================================================
-- CAPABILITIES TABLE (Capabilities Registry)
-- ============================================================================
CREATE TABLE IF NOT EXISTS capabilities (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  owner_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  sharing_scope sharing_scope_type NOT NULL DEFAULT 'organization',

  -- Core attributes
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'CAP_ANALYZE_CLINICAL_DATA'
  name TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Classification
  category VARCHAR(100) NOT NULL,
  domain VARCHAR(100),

  -- Implementation
  implementation_type TEXT, -- 'prompt', 'tool', 'workflow', 'api'
  implementation_reference TEXT, -- ID or URL of implementation

  -- Relationships
  prerequisite_capabilities UUID[], -- Array of capability IDs
  enabled_by_tools TEXT[],

  -- Maturity
  maturity_level TEXT, -- 'experimental', 'beta', 'stable', 'deprecated'

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_capabilities_owner_org ON capabilities(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_sharing_scope ON capabilities(sharing_scope)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_category ON capabilities(category);
CREATE INDEX idx_capabilities_domain ON capabilities(domain);
CREATE INDEX idx_capabilities_tags ON capabilities USING GIN(tags);
CREATE INDEX idx_capabilities_created_by ON capabilities(created_by);

-- Comments
COMMENT ON TABLE capabilities IS 'Platform capabilities registry with org/tenant/platform sharing';
```

## Helper Functions

### 1. Get Organization Hierarchy

```sql
-- ============================================================================
-- FUNCTION: Get complete organization hierarchy path
-- ============================================================================
CREATE OR REPLACE FUNCTION get_organization_hierarchy(p_organization_id UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  organization_type organization_type,
  level INTEGER
) AS $$
WITH RECURSIVE org_tree AS (
  -- Start with the given organization
  SELECT
    id,
    name,
    organization_type,
    parent_organization_id,
    0 as level
  FROM organizations
  WHERE id = p_organization_id

  UNION ALL

  -- Recursively get parents
  SELECT
    o.id,
    o.name,
    o.organization_type,
    o.parent_organization_id,
    ot.level + 1
  FROM organizations o
  JOIN org_tree ot ON o.id = ot.parent_organization_id
)
SELECT id, name, organization_type, level
FROM org_tree
ORDER BY level DESC; -- Platform first, then tenant, then org
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_organization_hierarchy IS 'Returns full hierarchy path from organization to platform';
```

### 2. Get Organization Tenant

```sql
-- ============================================================================
-- FUNCTION: Get the tenant for any organization
-- ============================================================================
CREATE OR REPLACE FUNCTION get_organization_tenant(p_organization_id UUID)
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  WITH RECURSIVE org_tree AS (
    SELECT id, parent_organization_id, organization_type
    FROM organizations
    WHERE id = p_organization_id

    UNION ALL

    SELECT o.id, o.parent_organization_id, o.organization_type
    FROM organizations o
    JOIN org_tree ot ON o.id = ot.parent_organization_id
  )
  SELECT id INTO v_tenant_id
  FROM org_tree
  WHERE organization_type = 'tenant'
  LIMIT 1;

  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_organization_tenant IS 'Returns the tenant UUID for any organization in hierarchy';
```

### 3. Check Resource Access

```sql
-- ============================================================================
-- FUNCTION: Check if user can access a resource
-- ============================================================================
CREATE OR REPLACE FUNCTION can_user_access_resource(
  p_user_id UUID,
  p_resource_owner_org_id UUID,
  p_resource_sharing_scope sharing_scope_type
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_org_ids UUID[];
  v_resource_tenant_id UUID;
  v_user_tenant_ids UUID[];
BEGIN
  -- Get user's organization IDs
  SELECT array_agg(organization_id) INTO v_user_org_ids
  FROM user_organizations
  WHERE user_id = p_user_id AND is_active = true;

  -- Platform scope: accessible to all authenticated users
  IF p_resource_sharing_scope = 'platform' THEN
    RETURN true;
  END IF;

  -- Organization scope: user must be in same organization
  IF p_resource_sharing_scope = 'organization' THEN
    RETURN p_resource_owner_org_id = ANY(v_user_org_ids);
  END IF;

  -- Tenant scope: user must be in same tenant hierarchy
  IF p_resource_sharing_scope = 'tenant' THEN
    -- Get resource's tenant
    SELECT get_organization_tenant(p_resource_owner_org_id) INTO v_resource_tenant_id;

    -- Get user's tenants
    SELECT array_agg(DISTINCT get_organization_tenant(organization_id))
    INTO v_user_tenant_ids
    FROM user_organizations
    WHERE user_id = p_user_id AND is_active = true;

    RETURN v_resource_tenant_id = ANY(v_user_tenant_ids);
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION can_user_access_resource IS 'Check if user can access resource based on sharing scope';
```

### 4. Get Accessible Resources

```sql
-- ============================================================================
-- FUNCTION: Get all agents accessible to a user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_accessible_agents(p_user_id UUID)
RETURNS TABLE (
  agent_id UUID,
  agent_name VARCHAR,
  sharing_scope sharing_scope_type,
  access_reason TEXT
) AS $$
DECLARE
  v_user_org_ids UUID[];
  v_user_tenant_ids UUID[];
BEGIN
  -- Get user's organization IDs
  SELECT array_agg(organization_id) INTO v_user_org_ids
  FROM user_organizations
  WHERE user_id = p_user_id AND is_active = true;

  -- Get user's tenant IDs
  SELECT array_agg(DISTINCT get_organization_tenant(organization_id))
  INTO v_user_tenant_ids
  FROM user_organizations
  WHERE user_id = p_user_id AND is_active = true;

  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.sharing_scope,
    CASE
      WHEN a.sharing_scope = 'platform' THEN 'platform-wide'
      WHEN a.sharing_scope = 'tenant' THEN 'tenant-wide'
      WHEN a.sharing_scope = 'organization' THEN 'organization-private'
    END as access_reason
  FROM agents a
  WHERE a.deleted_at IS NULL
    AND a.status = 'active'
    AND (
      -- Platform-wide agents
      a.sharing_scope = 'platform'

      -- Tenant-wide agents (user in same tenant)
      OR (
        a.sharing_scope = 'tenant'
        AND get_organization_tenant(a.owner_organization_id) = ANY(v_user_tenant_ids)
      )

      -- Organization-private agents (user in same org)
      OR (
        a.sharing_scope = 'organization'
        AND a.owner_organization_id = ANY(v_user_org_ids)
      )
    )
  ORDER BY a.priority DESC, a.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_accessible_agents IS 'Returns all agents accessible to user based on sharing scope';
```

## Row Level Security Policies

### Pattern for All Multi-Tenant Tables

```sql
-- ============================================================================
-- RLS PATTERN FOR MULTI-TENANT RESOURCES
-- ============================================================================
-- This pattern applies to: agents, knowledge_documents, prompts, workflows,
--                          use_cases, capabilities

-- Enable RLS
ALTER TABLE {resource_name} ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access
CREATE POLICY "service_role_full_access_{resource}"
  ON {resource_name} FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Users can view accessible resources
CREATE POLICY "users_view_accessible_{resource}"
  ON {resource_name} FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      -- Platform-wide resources
      sharing_scope = 'platform'

      -- Tenant-wide resources (user in same tenant)
      OR (
        sharing_scope = 'tenant'
        AND get_organization_tenant(owner_organization_id) IN (
          SELECT get_organization_tenant(organization_id)
          FROM user_organizations
          WHERE user_id = auth.uid() AND is_active = true
        )
      )

      -- Organization-private resources (user in same org)
      OR (
        sharing_scope = 'organization'
        AND owner_organization_id IN (
          SELECT organization_id
          FROM user_organizations
          WHERE user_id = auth.uid() AND is_active = true
        )
      )
    )
  );

-- Policy 3: Users can create resources in their organizations
CREATE POLICY "users_create_{resource}"
  ON {resource_name} FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid() AND is_active = true
    )
    AND created_by = auth.uid()
  );

-- Policy 4: Users can update their own resources or org admin
CREATE POLICY "users_update_{resource}"
  ON {resource_name} FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      -- Creator can always update
      created_by = auth.uid()

      -- Org admin can update org resources
      OR (
        owner_organization_id IN (
          SELECT organization_id
          FROM user_organizations
          WHERE user_id = auth.uid()
            AND is_active = true
            AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    -- Cannot change owner organization
    owner_organization_id = (SELECT owner_organization_id FROM {resource_name} WHERE id = id)
  );

-- Policy 5: Soft delete for creators and admins
CREATE POLICY "users_delete_{resource}"
  ON {resource_name} FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR owner_organization_id IN (
        SELECT organization_id
        FROM user_organizations
        WHERE user_id = auth.uid()
          AND is_active = true
          AND role = 'admin'
      )
    )
  )
  WITH CHECK (deleted_at IS NOT NULL); -- Soft delete only
```

### Conversations RLS (Special Case)

```sql
-- ============================================================================
-- RLS FOR CONVERSATIONS (No Sharing)
-- ============================================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "service_role_full_access_conversations"
  ON conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only see their own conversations
CREATE POLICY "users_view_own_conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Users can create conversations in their organizations
CREATE POLICY "users_create_conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND owner_organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update/delete their own conversations
CREATE POLICY "users_manage_own_conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## Constraints & Validation

### Hierarchy Validation Trigger

```sql
-- ============================================================================
-- TRIGGER: Validate organization hierarchy depth
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_organization_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_depth INTEGER;
  v_max_depth INTEGER := 3; -- Platform (1) > Tenant (2) > Organization (3)
BEGIN
  -- Count depth of hierarchy
  WITH RECURSIVE org_tree AS (
    SELECT id, parent_organization_id, 1 as depth
    FROM organizations
    WHERE id = NEW.id

    UNION ALL

    SELECT o.id, o.parent_organization_id, ot.depth + 1
    FROM organizations o
    JOIN org_tree ot ON o.id = ot.parent_organization_id
  )
  SELECT MAX(depth) INTO v_depth FROM org_tree;

  IF v_depth > v_max_depth THEN
    RAISE EXCEPTION 'Organization hierarchy cannot exceed % levels (Platform > Tenant > Organization)', v_max_depth;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_organization_hierarchy
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION validate_organization_hierarchy();
```

### Sharing Scope Validation

```sql
-- ============================================================================
-- TRIGGER: Validate sharing scope consistency
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_sharing_scope()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_org_type organization_type;
BEGIN
  -- Get owner organization type
  SELECT organization_type INTO v_owner_org_type
  FROM organizations
  WHERE id = NEW.owner_organization_id;

  -- Platform organizations can only create platform-scope resources
  IF v_owner_org_type = 'platform' AND NEW.sharing_scope != 'platform' THEN
    RAISE EXCEPTION 'Platform organizations can only create platform-scoped resources';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all multi-tenant tables
CREATE TRIGGER validate_agents_sharing_scope
  BEFORE INSERT OR UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION validate_sharing_scope();

CREATE TRIGGER validate_knowledge_sharing_scope
  BEFORE INSERT OR UPDATE ON knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION validate_sharing_scope();

-- ... apply to other tables
```

## Audit Logging

```sql
-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  -- Identity
  id BIGSERIAL PRIMARY KEY,

  -- Multi-tenancy
  organization_id UUID NOT NULL REFERENCES organizations(id),

  -- Actor
  user_id UUID REFERENCES users(id),

  -- Action
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'share'
  resource_type TEXT NOT NULL, -- 'agent', 'knowledge_document', etc.
  resource_id UUID NOT NULL,

  -- Changes
  old_values JSONB,
  new_values JSONB,
  changes JSONB, -- Computed diff

  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,

  -- Timestamp (partitioned by month)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

) PARTITION BY RANGE (created_at);

-- Create partitions for each month
CREATE TABLE audit_logs_2025_11 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE audit_logs_2025_12 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs_2025_11(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs_2025_11(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_org ON audit_logs_2025_11(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs_2025_11(action, created_at DESC);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_resource_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    changes
  ) VALUES (
    COALESCE(NEW.owner_organization_id, OLD.owner_organization_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE
      WHEN TG_OP = 'UPDATE' THEN
        jsonb_object_agg(
          key,
          jsonb_build_object('old', old_val, 'new', new_val)
        )
      ELSE NULL
    END
  )
  FROM jsonb_each(to_jsonb(OLD)) as old_j(key, old_val)
  FULL OUTER JOIN jsonb_each(to_jsonb(NEW)) as new_j(key, new_val) USING (key)
  WHERE old_val IS DISTINCT FROM new_val;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all tables
CREATE TRIGGER audit_agents_changes
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH ROW EXECUTE FUNCTION audit_resource_changes();

CREATE TRIGGER audit_knowledge_changes
  AFTER INSERT OR UPDATE OR DELETE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION audit_resource_changes();

-- ... apply to other tables
```

## Performance Optimization

### 1. Covering Indexes for Common Queries

```sql
-- ============================================================================
-- COVERING INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Get active agents for an organization (most common query)
CREATE INDEX idx_agents_org_list ON agents(owner_organization_id, status, sharing_scope)
  INCLUDE (id, name, display_name, tier, avatar_url)
  WHERE deleted_at IS NULL;

-- Search agents by knowledge domain
CREATE INDEX idx_agents_domain_search ON agents USING GIN(knowledge_domains)
  INCLUDE (id, name, display_name, sharing_scope)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Get user's organizations with role
CREATE INDEX idx_user_orgs_with_role ON user_organizations(user_id, is_active)
  INCLUDE (organization_id, role)
  WHERE is_active = true;

-- Conversation listing for user
CREATE INDEX idx_conversations_user_list ON conversations(user_id, created_at DESC)
  INCLUDE (id, title, status, mode)
  WHERE deleted_at IS NULL;
```

### 2. Materialized Views for Analytics

```sql
-- ============================================================================
-- MATERIALIZED VIEW: Organization Statistics
-- ============================================================================
CREATE MATERIALIZED VIEW organization_stats AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  o.organization_type,
  COUNT(DISTINCT a.id) FILTER (WHERE a.sharing_scope = 'organization') as private_agents_count,
  COUNT(DISTINCT a.id) FILTER (WHERE a.sharing_scope = 'tenant') as tenant_agents_count,
  COUNT(DISTINCT a.id) FILTER (WHERE a.sharing_scope = 'platform') as platform_agents_count,
  COUNT(DISTINCT kd.id) as knowledge_docs_count,
  COUNT(DISTINCT p.id) as prompts_count,
  COUNT(DISTINCT c.id) as conversations_count,
  COUNT(DISTINCT uo.user_id) as active_users_count
FROM organizations o
LEFT JOIN agents a ON a.owner_organization_id = o.id AND a.deleted_at IS NULL
LEFT JOIN knowledge_documents kd ON kd.owner_organization_id = o.id AND kd.deleted_at IS NULL
LEFT JOIN prompts p ON p.owner_organization_id = o.id AND p.deleted_at IS NULL
LEFT JOIN conversations c ON c.owner_organization_id = o.id AND c.deleted_at IS NULL
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.is_active = true
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.organization_type;

CREATE UNIQUE INDEX idx_org_stats_org_id ON organization_stats(organization_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_organization_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY organization_stats;
END;
$$ LANGUAGE plpgsql;

-- Refresh daily
-- (Set up pg_cron or external scheduler)
```

### 3. Connection Pooling Configuration

```sql
-- ============================================================================
-- CONNECTION POOLING RECOMMENDATIONS
-- ============================================================================
-- For Supabase/PgBouncer configuration:

-- Pool mode: Transaction (recommended for serverless)
-- Max client connections: 100 (per tenant/app)
-- Default pool size: 20
-- Reserve pool: 5 (for admin/background jobs)

-- Application-side pooling (Node.js):
-- {
--   "max": 20,
--   "min": 5,
--   "idle": 10000,
--   "acquire": 30000
-- }
```

## Migration Strategy

### Phase 1: Add New Columns

```sql
-- ============================================================================
-- MIGRATION PHASE 1: Add new multi-tenancy columns
-- ============================================================================

-- Add organization hierarchy columns
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS organization_type organization_type DEFAULT 'organization',
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_organizations_slug_unique ON organizations(slug)
  WHERE deleted_at IS NULL;

-- Add sharing scope to agents (if not exists)
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type DEFAULT 'organization';

-- Rename tenant_id to owner_organization_id (if needed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE agents RENAME COLUMN tenant_id TO owner_organization_id;
  END IF;
END $$;

-- Add sharing scope to other tables
ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type DEFAULT 'organization';

ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type DEFAULT 'organization';

ALTER TABLE workflows
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type DEFAULT 'organization';

ALTER TABLE use_cases
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type DEFAULT 'organization';

ALTER TABLE capabilities
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type DEFAULT 'organization';
```

### Phase 2: Backfill Data

```sql
-- ============================================================================
-- MIGRATION PHASE 2: Backfill hierarchy data
-- ============================================================================

-- Set platform organization
UPDATE organizations
SET
  organization_type = 'platform',
  parent_organization_id = NULL,
  slug = 'vital-platform'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Set tenant organizations (based on tenant_type)
UPDATE organizations
SET
  organization_type = 'tenant',
  parent_organization_id = '00000000-0000-0000-0000-000000000001',
  slug = CASE
    WHEN tenant_type = 'digital_health' THEN 'digital-health-tenant'
    WHEN tenant_type = 'pharmaceuticals' THEN 'pharma-tenant'
    ELSE slug
  END
WHERE tenant_type IN ('digital_health', 'pharmaceuticals');

-- Set child organizations
UPDATE organizations
SET
  organization_type = 'organization',
  slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE organization_type IS NULL;

-- Backfill sharing_scope based on existing is_public flag (if exists)
UPDATE agents
SET sharing_scope = CASE
  WHEN metadata->>'is_public' = 'true' THEN 'platform'::sharing_scope_type
  WHEN metadata->>'is_tenant_shared' = 'true' THEN 'tenant'::sharing_scope_type
  ELSE 'organization'::sharing_scope_type
END
WHERE sharing_scope IS NULL;

-- Similar for other tables
UPDATE knowledge_documents
SET sharing_scope = CASE
  WHEN is_public = true THEN 'platform'::sharing_scope_type
  ELSE 'organization'::sharing_scope_type
END
WHERE sharing_scope IS NULL;
```

### Phase 3: Add Constraints & Indexes

```sql
-- ============================================================================
-- MIGRATION PHASE 3: Add constraints and indexes
-- ============================================================================

-- Make columns NOT NULL after backfill
ALTER TABLE organizations
  ALTER COLUMN organization_type SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE agents
  ALTER COLUMN sharing_scope SET NOT NULL;

-- Add hierarchy validation
ALTER TABLE organizations
  ADD CONSTRAINT org_hierarchy_valid CHECK (
    (organization_type = 'platform' AND parent_organization_id IS NULL) OR
    (organization_type != 'platform' AND parent_organization_id IS NOT NULL)
  );

-- Add indexes
CREATE INDEX idx_organizations_parent ON organizations(parent_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_type ON organizations(organization_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_agents_owner_org ON agents(owner_organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_sharing_scope ON agents(sharing_scope)
  WHERE deleted_at IS NULL;

-- ... repeat for other tables
```

### Phase 4: Update RLS Policies

```sql
-- ============================================================================
-- MIGRATION PHASE 4: Update RLS policies
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "users_view_public_agents" ON agents;
DROP POLICY IF EXISTS "users_view_tenant_agents" ON agents;

-- Create new multi-tenant policies
CREATE POLICY "users_view_accessible_agents"
  ON agents FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      sharing_scope = 'platform'
      OR (
        sharing_scope = 'tenant'
        AND get_organization_tenant(owner_organization_id) IN (
          SELECT get_organization_tenant(organization_id)
          FROM user_organizations
          WHERE user_id = auth.uid() AND is_active = true
        )
      )
      OR (
        sharing_scope = 'organization'
        AND owner_organization_id IN (
          SELECT organization_id
          FROM user_organizations
          WHERE user_id = auth.uid() AND is_active = true
        )
      )
    )
  );

-- ... repeat for other tables
```

### Phase 5: Cleanup Old Columns

```sql
-- ============================================================================
-- MIGRATION PHASE 5: Remove deprecated columns
-- ============================================================================

-- Remove old tenant_type column (data moved to organization_type)
ALTER TABLE organizations
  DROP COLUMN IF EXISTS tenant_type;

-- Remove old is_public columns (replaced by sharing_scope)
ALTER TABLE agents
  DROP COLUMN IF EXISTS is_public;

ALTER TABLE knowledge_documents
  DROP COLUMN IF EXISTS is_public;

-- Remove old tenant_key (replaced by slug)
-- Keep for backwards compatibility or drop if safe
-- ALTER TABLE organizations DROP COLUMN IF EXISTS tenant_key;
```

## Testing & Validation

### 1. Data Isolation Tests

```sql
-- ============================================================================
-- TEST: Verify data isolation between organizations
-- ============================================================================

-- Setup test data
DO $$
DECLARE
  v_platform_id UUID := '00000000-0000-0000-0000-000000000001';
  v_pharma_tenant_id UUID;
  v_digital_tenant_id UUID;
  v_novartis_id UUID;
  v_pfizer_id UUID;
  v_user_novartis UUID;
  v_user_pfizer UUID;
  v_agent_novartis UUID;
  v_agent_pfizer UUID;
  v_agent_pharma UUID;
  v_agent_platform UUID;
BEGIN
  -- Create test organizations
  INSERT INTO organizations (name, slug, organization_type, parent_organization_id)
  VALUES
    ('Pharma Tenant', 'pharma-test', 'tenant', v_platform_id)
  RETURNING id INTO v_pharma_tenant_id;

  INSERT INTO organizations (name, slug, organization_type, parent_organization_id)
  VALUES
    ('Novartis Test', 'novartis-test', 'organization', v_pharma_tenant_id),
    ('Pfizer Test', 'pfizer-test', 'organization', v_pharma_tenant_id)
  RETURNING id INTO v_novartis_id, v_pfizer_id;

  -- Create test users
  INSERT INTO users (email) VALUES
    ('novartis@test.com'),
    ('pfizer@test.com')
  RETURNING id INTO v_user_novartis, v_user_pfizer;

  INSERT INTO user_organizations (user_id, organization_id, role) VALUES
    (v_user_novartis, v_novartis_id, 'member'),
    (v_user_pfizer, v_pfizer_id, 'member');

  -- Create test agents with different sharing scopes
  INSERT INTO agents (
    name, display_name, description, system_prompt,
    owner_organization_id, sharing_scope, created_by
  ) VALUES
    ('Novartis Agent', 'Novartis', 'Private to Novartis', 'test',
     v_novartis_id, 'organization', v_user_novartis),
    ('Pfizer Agent', 'Pfizer', 'Private to Pfizer', 'test',
     v_pfizer_id, 'organization', v_user_pfizer),
    ('Pharma Agent', 'Pharma', 'Shared across pharma', 'test',
     v_pharma_tenant_id, 'tenant', v_user_novartis),
    ('Platform Agent', 'Platform', 'Available to all', 'test',
     v_platform_id, 'platform', v_user_novartis)
  RETURNING id INTO v_agent_novartis, v_agent_pfizer, v_agent_pharma, v_agent_platform;

  -- TEST 1: Novartis user should see 3 agents (own + pharma + platform)
  ASSERT (
    SELECT COUNT(*) FROM get_accessible_agents(v_user_novartis)
  ) = 3, 'Novartis user should see 3 agents';

  -- TEST 2: Pfizer user should see 3 agents (own + pharma + platform)
  ASSERT (
    SELECT COUNT(*) FROM get_accessible_agents(v_user_pfizer)
  ) = 3, 'Pfizer user should see 3 agents';

  -- TEST 3: Novartis user should NOT see Pfizer private agent
  ASSERT (
    SELECT COUNT(*) FROM get_accessible_agents(v_user_novartis)
    WHERE agent_id = v_agent_pfizer
  ) = 0, 'Novartis user should NOT see Pfizer agent';

  -- TEST 4: Both should see platform agent
  ASSERT (
    SELECT COUNT(*) FROM get_accessible_agents(v_user_novartis)
    WHERE agent_id = v_agent_platform
  ) = 1, 'Novartis user should see platform agent';

  ASSERT (
    SELECT COUNT(*) FROM get_accessible_agents(v_user_pfizer)
    WHERE agent_id = v_agent_platform
  ) = 1, 'Pfizer user should see platform agent';

  RAISE NOTICE 'All data isolation tests passed!';

  -- Cleanup
  DELETE FROM agents WHERE id IN (v_agent_novartis, v_agent_pfizer, v_agent_pharma, v_agent_platform);
  DELETE FROM user_organizations WHERE user_id IN (v_user_novartis, v_user_pfizer);
  DELETE FROM users WHERE id IN (v_user_novartis, v_user_pfizer);
  DELETE FROM organizations WHERE id IN (v_novartis_id, v_pfizer_id, v_pharma_tenant_id);
END $$;
```

### 2. Performance Benchmarks

```sql
-- ============================================================================
-- BENCHMARK: Query performance with indexes
-- ============================================================================

-- Test 1: Get accessible agents for user (should use indexes)
EXPLAIN ANALYZE
SELECT * FROM get_accessible_agents('some-user-id'::UUID);

-- Test 2: Get organization hierarchy (should use recursive index)
EXPLAIN ANALYZE
SELECT * FROM get_organization_hierarchy('some-org-id'::UUID);

-- Test 3: Filter agents by sharing scope (should use covering index)
EXPLAIN ANALYZE
SELECT id, name, display_name, tier
FROM agents
WHERE owner_organization_id = 'some-org-id'::UUID
  AND sharing_scope = 'organization'
  AND status = 'active'
  AND deleted_at IS NULL;

-- Expected: Index Scan on idx_agents_org_list
-- Cost should be < 10 for <1000 agents
```

## Summary & Recommendations

### Key Design Decisions

1. **Unified Organizations Table**: Single table with `parent_organization_id` for 3-level hierarchy
2. **Sharing Scope ENUM**: Explicit `sharing_scope` column ('platform', 'tenant', 'organization')
3. **Owner Organization Pattern**: Every resource has `owner_organization_id` + `sharing_scope`
4. **ON DELETE RESTRICT**: Prevent accidental deletions, force explicit cleanup workflows
5. **Hierarchical User Access**: Users explicitly join organizations, access computed via recursive queries

### Performance Optimizations

- Covering indexes for common query patterns
- Materialized views for analytics
- Partition audit logs by month
- Connection pooling with transaction mode
- Recursive queries optimized with CTEs

### Security & Compliance

- Row-level security on all tables
- Soft deletes with audit trail
- HIPAA-compliant audit logging
- Encrypted PHI support (add pgcrypto columns as needed)
- Fine-grained role-based access control

### Migration Path

1. Add columns (non-breaking)
2. Backfill data (safe, reversible)
3. Add constraints (validate first)
4. Update RLS policies (test thoroughly)
5. Remove old columns (final step, after validation)

### Next Steps

1. Review and approve schema design
2. Run migration Phase 1-3 in staging
3. Test data isolation and performance
4. Update application code to use new patterns
5. Deploy to production with feature flags
6. Monitor performance and adjust indexes
7. Complete Phase 4-5 after validation

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Author**: VITAL Database Architect Agent
**Status**: Ready for Review
