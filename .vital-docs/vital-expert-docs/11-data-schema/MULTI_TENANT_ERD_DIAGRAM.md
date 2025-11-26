# Multi-Tenant Entity Relationship Diagram

## Overview

This document provides the complete Entity-Relationship Diagram (ERD) for VITAL's hierarchical multi-tenant database schema.

## Core Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HIERARCHICAL MULTI-TENANCY                           │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                         ORGANIZATIONS (Core Hierarchy)                  │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  parent_organization_id    UUID → organizations.id (RESTRICT)       │
│     organization_type          ENUM (platform, tenant, organization)   │
│     name                      TEXT NOT NULL                            │
│     slug                      TEXT UNIQUE NOT NULL                     │
│     settings                  JSONB                                    │
│     is_active                 BOOLEAN                                  │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ (soft delete)                │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - platform type has parent_organization_id = NULL                     │
│  - non-platform types must have parent_organization_id                 │
│  - max hierarchy depth = 3 (platform > tenant > organization)          │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_organizations_parent (parent_organization_id)                   │
│  - idx_organizations_type (organization_type)                          │
│  - idx_organizations_slug (slug) UNIQUE                                │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     USER_ORGANIZATIONS (Membership)                     │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                UUID                                             │
│ FK  user_id           UUID → users.id (CASCADE)                        │
│ FK  organization_id   UUID → organizations.id (CASCADE)                │
│     role              TEXT (admin, member, viewer)                     │
│     permissions       JSONB                                            │
│     is_active         BOOLEAN                                          │
│     created_at        TIMESTAMPTZ                                      │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - UNIQUE(user_id, organization_id)                                    │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_user_orgs_user (user_id, is_active) INCLUDE (org_id, role)     │
│  - idx_user_orgs_org (organization_id, is_active)                     │
└────────────────────────────────────────────────────────────────────────┘

```

## Multi-Tenant Resource Pattern

All resource tables follow this standard pattern:

```
┌────────────────────────────────────────────────────────────────────────┐
│                  MULTI-TENANT RESOURCE PATTERN                          │
│                  (applies to all sharable resources)                    │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     [resource-specific columns...]                                     │
│ FK  created_by                UUID → users.id                          │
│ FK  updated_by                UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ (soft delete)                │
├────────────────────────────────────────────────────────────────────────┤
│ SHARING LOGIC:                                                          │
│  - platform    → visible to all users across all tenants               │
│  - tenant      → visible to all orgs within same tenant                │
│  - organization → visible only to users in owner_organization_id       │
├────────────────────────────────────────────────────────────────────────┤
│ STANDARD INDEXES:                                                       │
│  - idx_{table}_owner_org (owner_organization_id)                       │
│  - idx_{table}_sharing_scope (sharing_scope)                           │
│  - idx_{table}_created_by (created_by)                                 │
└────────────────────────────────────────────────────────────────────────┘
```

## Agent Resources

```
┌────────────────────────────────────────────────────────────────────────┐
│                              AGENTS                                     │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     name                      VARCHAR(100) NOT NULL                    │
│     display_name              VARCHAR(100) NOT NULL                    │
│     description               TEXT NOT NULL                            │
│     system_prompt             TEXT NOT NULL                            │
│     tier                      ENUM (tier_1, tier_2, tier_3)            │
│     status                    ENUM (active, inactive, archived, draft) │
│     knowledge_domains         TEXT[] NOT NULL                          │
│     capabilities              TEXT[] NOT NULL                          │
│     avatar_url                TEXT                                     │
│     priority                  INTEGER (0-1000)                         │
│     embedding                 vector(1536)                             │
│     metadata                  JSONB                                    │
│ FK  created_by, updated_by    UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ                              │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - knowledge_domains array must not be empty                           │
│  - priority BETWEEN 0 AND 1000                                         │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_agents_owner_org (owner_organization_id)                        │
│  - idx_agents_sharing_scope (sharing_scope)                            │
│  - idx_agents_tier (tier) WHERE active                                 │
│  - idx_agents_knowledge_domains GIN(knowledge_domains)                 │
│  - idx_agents_search GIN(to_tsvector(name, display_name, desc))       │
│  - idx_agents_org_list (owner_org, status, sharing_scope) COVERING    │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ N:M
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          USER_AGENTS (Junction)                         │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                UUID                                             │
│ FK  user_id           UUID → users.id (CASCADE)                        │
│ FK  agent_id          UUID → agents.id (CASCADE)                       │
│     created_at        TIMESTAMPTZ                                      │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - UNIQUE(user_id, agent_id)                                           │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                         TENANT_AGENTS (Junction)                        │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                UUID                                             │
│ FK  tenant_id         UUID → organizations.id (CASCADE)                │
│ FK  agent_id          UUID → agents.id (CASCADE)                       │
│     is_enabled        BOOLEAN                                          │
│     custom_config     JSONB                                            │
│     usage_count       INTEGER                                          │
│     last_used_at      TIMESTAMPTZ                                      │
│     created_at        TIMESTAMPTZ                                      │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - UNIQUE(tenant_id, agent_id)                                         │
├────────────────────────────────────────────────────────────────────────┤
│ PURPOSE:                                                                │
│  - Maps which agents are enabled for which tenants                     │
│  - Allows tenant-specific configuration overrides                      │
│  - Tracks usage metrics per tenant                                     │
└────────────────────────────────────────────────────────────────────────┘
```

## Knowledge & Content Resources

```
┌────────────────────────────────────────────────────────────────────────┐
│                       KNOWLEDGE_DOCUMENTS                               │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     title                     TEXT NOT NULL                            │
│     content                   TEXT                                     │
│     summary                   TEXT                                     │
│ FK  domain_id                 UUID → knowledge_domains.id              │
│     document_type             TEXT (text, pdf, docx, url)              │
│     status                    ENUM (draft, processing, indexed, etc.)  │
│     file_url, file_size       TEXT, INTEGER                            │
│     mime_type                 TEXT                                     │
│     chunk_count               INTEGER                                  │
│     embedding_model           TEXT                                     │
│     processed_at              TIMESTAMPTZ                              │
│     metadata                  JSONB                                    │
│ FK  created_by, updated_by    UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ                              │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_knowledge_owner_org (owner_organization_id)                     │
│  - idx_knowledge_sharing_scope (sharing_scope)                         │
│  - idx_knowledge_domain (domain_id)                                    │
│  - idx_knowledge_search GIN(to_tsvector(title, summary, content))     │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                              PROMPTS                                    │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     name                      VARCHAR(255) NOT NULL                    │
│     display_name              VARCHAR(255) NOT NULL                    │
│     description               TEXT NOT NULL                            │
│     category                  VARCHAR(100) NOT NULL                    │
│     system_prompt             TEXT NOT NULL                            │
│     user_prompt_template      TEXT                                     │
│     execution_instructions    JSONB                                    │
│     success_criteria          JSONB                                    │
│     model_requirements        JSONB                                    │
│     input_schema, output_schema JSONB                                  │
│     validation_rules          JSONB                                    │
│     complexity_level          ENUM (basic, intermediate, advanced...)  │
│     domain                    VARCHAR(100)                             │
│     estimated_tokens          INTEGER                                  │
│     prerequisite_prompts      UUID[]                                   │
│     prerequisite_capabilities TEXT[]                                   │
│     related_capabilities      TEXT[]                                   │
│     required_context          TEXT[]                                   │
│     usage_count               INTEGER                                  │
│     average_rating            NUMERIC(3,2)                             │
│     last_used_at              TIMESTAMPTZ                              │
│     version                   INTEGER                                  │
│ FK  parent_prompt_id          UUID → prompts.id (versioning)           │
│     is_latest                 BOOLEAN                                  │
│     is_active                 BOOLEAN                                  │
│     metadata                  JSONB                                    │
│     tags                      TEXT[]                                   │
│ FK  created_by, updated_by    UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ                              │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - UNIQUE(name, owner_organization_id)                                 │
│  - average_rating BETWEEN 0 AND 5                                      │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_prompts_owner_org (owner_organization_id)                       │
│  - idx_prompts_sharing_scope (sharing_scope)                           │
│  - idx_prompts_category (category) WHERE is_active                     │
│  - idx_prompts_tags GIN(tags)                                          │
└────────────────────────────────────────────────────────────────────────┘
```

## Workflows & Use Cases

```
┌────────────────────────────────────────────────────────────────────────┐
│                            USE_CASES                                    │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     code                      VARCHAR(50) UNIQUE (e.g., UC_RA_001)     │
│     title                     TEXT NOT NULL                            │
│     description               TEXT NOT NULL                            │
│     domain                    VARCHAR(100) NOT NULL                    │
│     category                  VARCHAR(100)                             │
│     complexity                INTEGER (1-5)                            │
│     jobs_to_be_done           TEXT[]                                   │
│     pain_points               TEXT[]                                   │
│     success_criteria          TEXT[]                                   │
│     required_agents           UUID[]                                   │
│     required_capabilities     TEXT[]                                   │
│     required_tools            TEXT[]                                   │
│ FK  default_workflow_id       UUID → workflows.id                      │
│     implementation_count      INTEGER                                  │
│     success_rate              NUMERIC(5,2)                             │
│     is_active                 BOOLEAN                                  │
│     maturity_level            TEXT (concept, pilot, production)        │
│     metadata                  JSONB                                    │
│     tags                      TEXT[]                                   │
│ FK  created_by, updated_by    UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ                              │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            WORKFLOWS                                    │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     name                      TEXT NOT NULL                            │
│     description               TEXT                                     │
│     framework                 ENUM (langgraph, autogen, crewai...)     │
│     workflow_definition       JSONB NOT NULL (nodes, edges, config)    │
│     tags                      TEXT[]                                   │
│     category                  TEXT                                     │
│ FK  use_case_id               UUID → use_cases.id                      │
│     status                    ENUM (draft, active, testing, etc.)      │
│     is_template               BOOLEAN                                  │
│     execution_count           INTEGER                                  │
│     success_rate              NUMERIC(5,2)                             │
│     average_duration_ms       INTEGER                                  │
│     metadata                  JSONB                                    │
│ FK  created_by, updated_by    UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ                              │
└────────────────────────────────────────────────────────────────────────┘
```

## Conversations (Private to Organization)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CONVERSATIONS                                   │
│                         (NO SHARING SCOPE)                              │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     NOTE: No sharing_scope - always private to organization            │
│ FK  user_id                   UUID → users.id (CASCADE)                │
│ FK  persistent_agent_id       UUID → agents.id (SET NULL)              │
│     title                     VARCHAR(200) NOT NULL                    │
│     mode                      ENUM (single, router, panel, workflow)   │
│     status                    ENUM (active, paused, completed, etc.)   │
│     compliance_level          ENUM (standard, hipaa, gdpr, enterprise) │
│     metadata                  JSONB                                    │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     archived_at, deleted_at   TIMESTAMPTZ                              │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - status = 'deleted' requires deleted_at IS NOT NULL                  │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_conversations_owner_org (owner_organization_id)                 │
│  - idx_conversations_user (user_id)                                    │
│  - idx_conversations_user_org (user_id, owner_org, created_at DESC)   │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            MESSAGES                                     │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                UUID                                             │
│ FK  conversation_id   UUID → conversations.id (CASCADE)                │
│     role              ENUM (user, assistant, system)                   │
│     content           TEXT NOT NULL                                    │
│ FK  agent_id          UUID → agents.id (SET NULL)                      │
│     reasoning         TEXT[]                                           │
│     citations         TEXT[]                                           │
│     confidence        NUMERIC(3,2) (0.00-1.00)                         │
│     tokens_prompt     INTEGER                                          │
│     tokens_completion INTEGER                                          │
│     tokens_total      INTEGER                                          │
│     estimated_cost    NUMERIC(10,6)                                    │
│     latency_ms        INTEGER                                          │
│     metadata          JSONB                                            │
│     created_at        TIMESTAMPTZ                                      │
├────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINTS:                                                            │
│  - content NOT empty (length(trim(content)) > 0)                       │
│  - confidence BETWEEN 0 AND 1                                          │
│  - tokens >= 0                                                         │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES:                                                                │
│  - idx_messages_conversation (conversation_id, created_at)             │
│  - idx_messages_agent (agent_id)                                       │
└────────────────────────────────────────────────────────────────────────┘
```

## Capabilities Registry

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CAPABILITIES                                   │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                        UUID                                     │
│ FK  owner_organization_id     UUID → organizations.id (RESTRICT)       │
│     sharing_scope             ENUM (platform, tenant, organization)    │
│     code                      VARCHAR(50) UNIQUE (CAP_ANALYZE_...)     │
│     name                      TEXT NOT NULL                            │
│     description               TEXT NOT NULL                            │
│     category                  VARCHAR(100) NOT NULL                    │
│     domain                    VARCHAR(100)                             │
│     implementation_type       TEXT (prompt, tool, workflow, api)       │
│     implementation_reference  TEXT (ID or URL)                         │
│     prerequisite_capabilities UUID[]                                   │
│     enabled_by_tools          TEXT[]                                   │
│     maturity_level            TEXT (experimental, beta, stable, etc.)  │
│     is_active                 BOOLEAN                                  │
│     metadata                  JSONB                                    │
│     tags                      TEXT[]                                   │
│ FK  created_by, updated_by    UUID → users.id                          │
│     created_at, updated_at    TIMESTAMPTZ                              │
│     deleted_at                TIMESTAMPTZ                              │
└────────────────────────────────────────────────────────────────────────┘
```

## Audit & Compliance

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AUDIT_LOGS                                     │
│                          (Partitioned by month)                         │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id                    BIGSERIAL                                    │
│ FK  organization_id       UUID → organizations.id (RESTRICT)           │
│ FK  user_id               UUID → users.id                              │
│     action                TEXT (create, read, update, delete, share)   │
│     resource_type         TEXT (agent, knowledge_document, etc.)       │
│     resource_id           UUID                                         │
│     old_values            JSONB (before state)                         │
│     new_values            JSONB (after state)                          │
│     changes               JSONB (computed diff)                        │
│     ip_address            INET                                         │
│     user_agent            TEXT                                         │
│     request_id            TEXT                                         │
│     created_at            TIMESTAMPTZ (partition key)                  │
├────────────────────────────────────────────────────────────────────────┤
│ PARTITIONING:                                                           │
│  - Monthly partitions (audit_logs_YYYY_MM)                             │
│  - Automatic partition creation via pg_cron or trigger                 │
│  - Retention policy: 7 years (HIPAA compliance)                        │
├────────────────────────────────────────────────────────────────────────┤
│ INDEXES (per partition):                                                │
│  - idx_audit_logs_user (user_id, created_at DESC)                     │
│  - idx_audit_logs_resource (resource_type, resource_id, created_at)   │
│  - idx_audit_logs_org (organization_id, created_at DESC)               │
│  - idx_audit_logs_action (action, created_at DESC)                    │
└────────────────────────────────────────────────────────────────────────┘
```

## Relationship Summary

### One-to-Many Relationships

```
organizations (1) ──────< organizations (N) [parent-child hierarchy]
organizations (1) ──────< user_organizations (N)
users (1) ───────────────< user_organizations (N)
organizations (1) ──────< agents (N) [owner]
organizations (1) ──────< knowledge_documents (N) [owner]
organizations (1) ──────< prompts (N) [owner]
organizations (1) ──────< workflows (N) [owner]
organizations (1) ──────< conversations (N) [owner]
organizations (1) ──────< use_cases (N) [owner]
organizations (1) ──────< capabilities (N) [owner]
users (1) ───────────────< conversations (N)
conversations (1) ──────< messages (N)
use_cases (1) ──────────< workflows (N)
```

### Many-to-Many Relationships

```
users (N) ←─── user_agents ───→ agents (M)
organizations (N) ←─── tenant_agents ───→ agents (M)
```

### Self-Referential Relationships

```
organizations.parent_organization_id → organizations.id
prompts.parent_prompt_id → prompts.id (versioning)
```

## Access Control Flow

```
┌──────────┐
│   USER   │
└────┬─────┘
     │ belongs to (via user_organizations)
     ▼
┌──────────────────┐
│  ORGANIZATION    │  ◄─── has type: platform/tenant/organization
└────┬─────────────┘
     │ parent_organization_id
     │ (hierarchical)
     ▼
┌──────────────────┐
│  TENANT/PLATFORM │
└──────────────────┘

ACCESS LOGIC:
1. User accesses resource
2. Check resource.sharing_scope:
   - platform    → allow all users
   - tenant      → check if user's org is in same tenant tree
   - organization → check if user's org = resource.owner_organization_id
3. RLS policies enforce this at database level
4. Helper functions (get_accessible_agents) optimize queries
```

## Data Flow Examples

### Example 1: Novartis User Accessing Agents

```
1. User: alice@novartis.com
2. User Organizations: [Novartis]
3. Organization Hierarchy:
   - Novartis (org) → Pharma (tenant) → Platform (platform)

4. Accessible Agents:
   ┌─────────────────┬──────────────┬─────────────────────┐
   │ Agent           │ Owner Org    │ Sharing Scope       │
   ├─────────────────┼──────────────┼─────────────────────┤
   │ Novartis RA     │ Novartis     │ organization ✓      │
   │ Pfizer RA       │ Pfizer       │ organization ✗      │
   │ Pharma Strategy │ Pharma       │ tenant       ✓      │
   │ Platform Guide  │ Platform     │ platform     ✓      │
   └─────────────────┴──────────────┴─────────────────────┘

   Alice can access: 3 agents
   - Novartis RA (own org)
   - Pharma Strategy (tenant-wide)
   - Platform Guide (platform-wide)
```

### Example 2: Creating a Tenant-Wide Agent

```
1. User: bob@pfizer.com creates an agent
2. User specifies sharing_scope = 'tenant'
3. System sets:
   - owner_organization_id = Pfizer
   - sharing_scope = tenant
   - created_by = bob's user_id

4. Accessibility:
   ✓ All users in Pfizer (organization)
   ✓ All users in other pharma orgs (same tenant)
   ✗ Users in digital-health tenant
   ✗ Users without any org membership

5. Validation:
   - RLS policy checks bob is member of Pfizer ✓
   - Trigger validates sharing_scope is allowed ✓
   - Audit log records creation event ✓
```

## Index Strategy Summary

### Critical Indexes (must have)
- Organizations: parent_organization_id, organization_type, slug
- Agents: owner_organization_id, sharing_scope, (owner+scope+status) covering
- Knowledge: owner_organization_id, sharing_scope
- Conversations: user_id, owner_organization_id, (user+org+created_at)
- User_Organizations: (user_id, is_active) covering organization_id & role

### Performance Indexes (recommended)
- Agents: knowledge_domains GIN, full-text search GIN
- Knowledge: full-text search GIN
- Messages: (conversation_id, created_at)
- Audit_logs: (organization_id, created_at), (resource_type, resource_id)

### Covering Indexes (for hot queries)
- Agents list by org: (owner_org, status, tier) INCLUDE (id, name, display_name, etc.)
- User org memberships: (user_id, is_active) INCLUDE (org_id, role)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Author**: VITAL Database Architect Agent
