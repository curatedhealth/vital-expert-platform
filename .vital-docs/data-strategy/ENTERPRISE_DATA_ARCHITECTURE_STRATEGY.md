# VITAL Platform - Enterprise Data Architecture Strategy
## Multi-Tenant Healthcare SaaS with 3-Level Hierarchy

**Version:** 1.0
**Date:** 2025-11-26
**Status:** Strategic Recommendation
**Audience:** CTO, VP Engineering, Data Architecture Team, Platform Orchestrator

---

## Executive Summary

This document defines the enterprise data architecture strategy for VITAL's multi-tenant healthcare SaaS platform serving pharmaceutical, digital health, and medical device companies. The platform operates at 3 tenancy levels (Platform → Industry Vertical → Organization → Solutions) with 500+ AI agents, 30+ RAG systems, and BYOAI integration capabilities.

**Key Strategic Decisions:**

1. **Hybrid Multi-Tenancy Model**: Database-per-vertical for data sovereignty + shared platform resources
2. **Resource Sharing Model**: Copy-on-Write for tenant→org forking with full data lineage tracking
3. **Compliance Architecture**: Tenant-configurable policies (HIPAA, GDPR, 21 CFR Part 11, USCDI)
4. **BYOAI Integration**: Federated query architecture with data virtualization layer
5. **Analytics Strategy**: Separate analytical data plane with anonymized cross-tenant benchmarking

**Business Impact:**
- Scalability: Support 100+ organizations per tenant, 1000s of users
- Flexibility: Tenant-specific compliance rules without platform fragmentation
- Security: Zero cross-tenant data leaks via multi-level RLS + network isolation
- Customer Experience: <200ms query response time with clear data ownership

---

## Table of Contents

1. [Business Context](#1-business-context)
2. [Data Architecture Principles](#2-data-architecture-principles)
3. [Multi-Tenancy Model](#3-multi-tenancy-model)
4. [Resource Sharing Strategy](#4-resource-sharing-strategy)
5. [Data Ownership & Lifecycle](#5-data-ownership-lifecycle)
6. [Master Data Management](#6-master-data-management)
7. [Integration Patterns (BYOAI)](#7-integration-patterns-byoai)
8. [Analytics & Reporting Architecture](#8-analytics-reporting-architecture)
9. [Compliance & Governance](#9-compliance-governance)
10. [Migration Strategy](#10-migration-strategy)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Business Context

### 1.1 Platform Architecture

```
VITAL Platform (Multi-Tenant Healthcare SaaS)
│
├─ 4 Product Layers
│  ├─ Ask Agent (Single expert queries)
│  ├─ Virtual Advisory Boards (Multi-expert panels)
│  ├─ Workflow Orchestration (Automated processes)
│  └─ Solution Building (Custom applications)
│
├─ 5 Horizontal Capabilities
│  ├─ 500+ AI Agents (136 active, tiered by complexity)
│  ├─ 30+ RAG Knowledge Bases (domain-specific)
│  ├─ Prompt Library (reusable templates)
│  ├─ Use Case Library (industry best practices)
│  └─ Capabilities Registry (tools, skills, integrations)
│
└─ BYOAI (Bring Your Own AI)
   ├─ Customer proprietary LLMs
   ├─ Customer RAG systems
   └─ External data sources
```

### 1.2 Multi-Tenant Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      VITAL PLATFORM                             │
│                   (Platform Administration)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼─────────┐            ┌─────────▼──────────┐
│ PHARMA TENANT   │            │ DIGITAL-HEALTH     │
│ (Vertical)      │            │ TENANT (Vertical)  │
└────────┬────────┘            └─────────┬──────────┘
         │                               │
    ┌────┴─────┬─────────┐         ┌────┴─────┬─────────┐
    │          │         │         │          │         │
┌───▼────┐ ┌──▼─────┐ ┌─▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌─▼───┐
│Novartis│ │ Pfizer │ │J&J  │ │Startup │ │Verily  │ │...  │
│ ORG    │ │ ORG    │ │ ORG │ │ ORG    │ │ ORG    │ │     │
└───┬────┘ └────────┘ └─────┘ └───┬────┘ └────────┘ └─────┘
    │                              │
┌───▼────────┐                ┌───▼────────┐
│ Solution A │                │ Solution X │
│ Solution B │                │ Solution Y │
│ Solution C │                │ Solution Z │
└────────────┘                └────────────┘
```

**Tenant Characteristics:**

| Level | Scope | Data Isolation | Compliance |
|-------|-------|----------------|------------|
| **Platform** | System-wide resources | Admin-only access | ISO 27001, SOC 2 |
| **Vertical Tenant** | Industry-specific (pharma, digital-health) | Complete DB separation | Vertical-specific (21 CFR Part 11, HIPAA) |
| **Organization** | Company-specific | RLS + encryption | Org-specific policies |
| **Solution/Project** | Initiative-specific | Logical partition | Inherits from org |

### 1.3 Current State Assessment

**Strengths:**
- ✅ Row-Level Security (RLS) implemented for multi-tenancy
- ✅ Normalized schema (3NF) with junction tables (zero JSONB for structured data)
- ✅ 136 active agents with evidence-based model selection
- ✅ Comprehensive JTBD framework linking roles → personas → workflows
- ✅ Audit logging infrastructure in place

**Data Strategy Gaps:**
- ❌ No formal resource sharing model (tenant→org forking)
- ❌ Data retention policies undefined (7yr pharma vs 6yr digital health?)
- ❌ BYOAI integration architecture not designed
- ❌ Cross-tenant analytics approach unclear
- ❌ Data lineage tracking incomplete
- ❌ Master data versioning strategy missing
- ❌ Data residency requirements not addressed (EU vs US)

---

## 2. Data Architecture Principles

### 2.1 Foundational Principles

**Principle 1: Multi-Tenant by Design**
- All user-facing tables MUST have `tenant_id` with RLS policies
- Platform resources (`platform` tenant) visible to all via `is_public` flag
- Vertical tenants completely isolated (separate databases recommended)
- Organizations isolated via RLS + row-level encryption

**Principle 2: Zero Ambiguity on Data Ownership**
- Every piece of data has ONE authoritative owner (tenant, org, or platform)
- Shared resources use `created_by_tenant_id` + access grants
- Forked resources create new records with `forked_from_id` lineage

**Principle 3: Compliance as First-Class Entity**
- Tenant-level compliance profiles (HIPAA, GDPR, 21 CFR Part 11)
- Data classification enforced at schema level (Public, Internal, Confidential, PHI)
- Audit logs immutable and tamper-evident (blockchain-style hashing)

**Principle 4: Performance at Scale**
- <200ms p95 query latency for 1000+ concurrent users
- Horizontal sharding for vertical tenants (1 DB per vertical)
- Read replicas for analytics workloads
- Materialized views for complex aggregations

**Principle 5: Data Portability by Default**
- Export APIs for all tenant data (GDPR Article 20)
- Standard formats: FHIR R4 (healthcare), JSON-LD (general)
- Incremental export support for large datasets

### 2.2 Technology Stack Alignment

**Database Layer:**
- **Primary OLTP**: PostgreSQL 15+ (Supabase-managed)
- **Analytics OLAP**: Amazon Redshift or Snowflake
- **Vector Storage**: Pinecone (RAG embeddings)
- **Graph Database**: Neo4j (agent relationships, lineage)
- **Cache Layer**: Redis (session state, hot data)

**Data Processing:**
- **ETL/ELT**: AWS Glue, Apache Airflow
- **Streaming**: Kafka/Kinesis for real-time events
- **Data Lake**: S3 (raw, processed, curated layers)

**Governance:**
- **Data Catalog**: AWS Glue Data Catalog
- **Lineage**: Apache Atlas or AWS DataZone
- **Quality**: Great Expectations
- **Masking**: PostgreSQL dynamic data masking + Vault

---

## 3. Multi-Tenancy Model

### 3.1 Recommended Architecture: Hybrid Model

**Rationale:**
- Pharma and digital health have DIFFERENT compliance requirements (21 CFR Part 11 vs HIPAA)
- Data residency requirements vary (EU pharma needs EU data centers)
- Blast radius containment (vertical tenant breach doesn't affect others)
- Independent scaling (pharma may have 10x more data than digital health)

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     VITAL PLATFORM LAYER                         │
│  - Shared metadata (agent definitions, capabilities registry)    │
│  - Global search index (cross-tenant, anonymized)                │
│  - Platform admin console                                        │
│  Database: vital_platform_db (PostgreSQL)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼─────────────────┐    ┌─────────▼──────────────────┐
│ PHARMA VERTICAL DB      │    │ DIGITAL-HEALTH VERTICAL DB │
│ - Separate database     │    │ - Separate database        │
│ - 21 CFR Part 11        │    │ - HIPAA compliant          │
│ - Encrypted at rest     │    │ - Encrypted at rest        │
│ - US East region        │    │ - Multi-region (US, EU)    │
│                         │    │                            │
│ Multi-org isolation:    │    │ Multi-org isolation:       │
│ - RLS by org_id         │    │ - RLS by org_id            │
│ - Encrypted columns     │    │ - Encrypted columns        │
│ - Audit logging         │    │ - Audit logging            │
└─────────────────────────┘    └────────────────────────────┘
```

### 3.2 Database Schema Pattern

**Shared Platform Tables (vital_platform_db):**

```sql
-- Platform-level master data (public, read-only for tenants)
CREATE TABLE agent_definitions (
  id UUID PRIMARY KEY,
  agent_slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  model TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false, -- Public to all tenants
  created_by_tenant_id UUID REFERENCES tenants(id),
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  metadata JSONB, -- model_justification, model_citation, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-tenant resource catalog (metadata only)
CREATE TABLE resource_catalog (
  id UUID PRIMARY KEY,
  resource_type TEXT CHECK (resource_type IN ('agent', 'rag_kb', 'prompt', 'workflow')),
  resource_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  is_public BOOLEAN DEFAULT false,
  is_shareable BOOLEAN DEFAULT false,
  search_vector TSVECTOR, -- For cross-tenant search
  metadata JSONB
);

-- Tenant registry
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  tenant_type TEXT CHECK (tenant_type IN ('platform', 'pharma', 'digital-health', 'medical-device')),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  database_name TEXT UNIQUE NOT NULL, -- Separate DB per vertical
  compliance_profile TEXT[] DEFAULT ARRAY['HIPAA'], -- HIPAA, GDPR, 21CFR11, USCDI
  data_residency TEXT CHECK (data_residency IN ('us-east', 'us-west', 'eu-central', 'ap-south')),
  retention_policy_years INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization-level tenancy (stored in vertical DB, replicated here for catalog)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  compliance_overrides TEXT[], -- Additional compliance requirements
  data_retention_years INTEGER, -- Override tenant default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);
```

**Vertical Tenant Database Schema (vital_pharma_db, vital_digitalhealth_db):**

```sql
-- Organization table (in vertical DB)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL, -- References tenants in platform DB
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  compliance_profile TEXT[] DEFAULT ARRAY['HIPAA'],
  data_classification_default TEXT CHECK (data_classification_default IN ('Public', 'Internal', 'Confidential', 'PHI')),
  encryption_key_id TEXT, -- AWS KMS key ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Agent instances (org-specific deployments)
CREATE TABLE agent_instances (
  id UUID PRIMARY KEY,
  agent_definition_id UUID NOT NULL, -- References agent_definitions in platform DB
  organization_id UUID NOT NULL REFERENCES organizations(id),
  custom_system_prompt TEXT, -- Override platform prompt
  custom_config JSONB, -- Overrides for temperature, max_tokens, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAG knowledge bases (org-specific)
CREATE TABLE rag_knowledge_bases (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  kb_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  vector_store_namespace TEXT UNIQUE NOT NULL, -- Pinecone namespace
  document_count INTEGER DEFAULT 0,
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, kb_slug)
);

-- User data (org-scoped)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL,
  encrypted_pii TEXT, -- Name, phone, etc. encrypted with org key
  role TEXT CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, email)
);

-- RLS Policies
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation_agent_instances ON agent_instances
  USING (organization_id = (current_setting('app.current_org_id', TRUE)::UUID));

ALTER TABLE rag_knowledge_bases ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation_rag ON rag_knowledge_bases
  USING (organization_id = (current_setting('app.current_org_id', TRUE)::UUID));

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation_users ON users
  USING (organization_id = (current_setting('app.current_org_id', TRUE)::UUID));
```

### 3.3 Tenant Context Management

**Session Context Pattern:**

```typescript
// middleware/tenant-context.ts
export async function setTenantContext(req: Request) {
  const { tenantId, organizationId } = await extractFromAuth(req);

  // Set PostgreSQL session variables for RLS
  await db.query(`
    SELECT set_config('app.current_tenant_id', $1, FALSE);
    SELECT set_config('app.current_org_id', $2, FALSE);
  `, [tenantId, organizationId]);

  // Route to correct database
  const tenant = await getTenant(tenantId);
  const dbConnection = getConnectionForTenant(tenant.database_name);

  return { tenantId, organizationId, db: dbConnection };
}
```

### 3.4 Scaling Considerations

**When to Add New Vertical Database:**

Trigger: Vertical tenant reaches any of:
- 100+ organizations
- 10TB+ data volume
- 10,000+ users
- Different compliance regime (e.g., EU MDR)

**Sharding Strategy (Future):**
- Horizontal sharding by organization ID hash
- Keeps related data (org + users + agents) co-located
- Shard routing at application layer

---

## 4. Resource Sharing Strategy

### 4.1 Sharing Model Overview

**3 Sharing Patterns:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     RESOURCE SHARING PATTERNS                    │
└─────────────────────────────────────────────────────────────────┘

1. PUBLIC (Platform → All Tenants)
   - Platform creates agent/prompt/workflow
   - Marked as is_public = true
   - All tenants can USE (read-only)
   - Tenants CANNOT modify
   - Example: VITAL's 136 core agents

2. SHARED (Tenant → Specific Orgs)
   - Tenant creates resource
   - Grants access to specific organizations
   - Recipients can USE (read-only)
   - Recipients CANNOT modify
   - Example: Pharma tenant shares regulatory framework with all pharma orgs

3. FORKED (Org → Customized Copy)
   - Organization creates COPY of shared/public resource
   - Full customization rights
   - Maintains link to original (forked_from_id)
   - Does NOT affect original
   - Example: Novartis forks FDA agent, adds custom system prompt
```

### 4.2 Copy-on-Write Implementation

**Schema Design:**

```sql
-- Resource lineage tracking
CREATE TABLE resource_lineage (
  id UUID PRIMARY KEY,
  resource_type TEXT CHECK (resource_type IN ('agent', 'rag_kb', 'prompt', 'workflow')),
  resource_id UUID NOT NULL,
  forked_from_id UUID, -- Points to original resource
  forked_by_org_id UUID REFERENCES organizations(id),
  fork_reason TEXT, -- User-provided reason for fork
  divergence_summary TEXT, -- Automated diff summary
  fork_timestamp TIMESTAMPTZ DEFAULT NOW(),
  last_sync_timestamp TIMESTAMPTZ, -- Last time synced with upstream
  is_synced BOOLEAN DEFAULT false, -- Can receive upstream updates?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Forking an agent
CREATE OR REPLACE FUNCTION fork_agent(
  p_agent_id UUID,
  p_org_id UUID,
  p_fork_reason TEXT
) RETURNS UUID AS $$
DECLARE
  v_new_agent_id UUID;
  v_original_agent RECORD;
BEGIN
  -- Get original agent
  SELECT * INTO v_original_agent FROM agent_instances WHERE id = p_agent_id;

  -- Create copy
  INSERT INTO agent_instances (
    agent_definition_id,
    organization_id,
    custom_system_prompt,
    custom_config,
    is_active
  ) VALUES (
    v_original_agent.agent_definition_id,
    p_org_id,
    v_original_agent.custom_system_prompt, -- Copy current state
    v_original_agent.custom_config,
    TRUE
  ) RETURNING id INTO v_new_agent_id;

  -- Record lineage
  INSERT INTO resource_lineage (
    resource_type,
    resource_id,
    forked_from_id,
    forked_by_org_id,
    fork_reason
  ) VALUES (
    'agent',
    v_new_agent_id,
    p_agent_id,
    p_org_id,
    p_fork_reason
  );

  RETURN v_new_agent_id;
END;
$$ LANGUAGE plpgsql;
```

**Forking Workflow:**

```typescript
// services/resource-management/fork-service.ts
export async function forkResource(
  resourceType: 'agent' | 'rag_kb' | 'prompt' | 'workflow',
  sourceId: string,
  targetOrgId: string,
  customizations: Record<string, any>
): Promise<{ forkedResourceId: string; lineage: ResourceLineage }> {

  // 1. Validate access to source
  const canAccess = await checkAccess(resourceType, sourceId, targetOrgId);
  if (!canAccess) throw new Error('Access denied');

  // 2. Copy resource
  const forkedId = await db.query(`
    SELECT fork_${resourceType}($1, $2, $3)
  `, [sourceId, targetOrgId, customizations.reason]);

  // 3. Apply customizations
  await applyCustomizations(resourceType, forkedId, customizations);

  // 4. Track lineage
  const lineage = await createLineageRecord(resourceType, forkedId, sourceId);

  // 5. Audit log
  await logAuditEvent({
    action: 'resource.fork',
    resourceType,
    sourceId,
    targetId: forkedId,
    organizationId: targetOrgId
  });

  return { forkedResourceId: forkedId, lineage };
}
```

### 4.3 Data Lineage Tracking

**Lineage Visualization:**

```
Platform Agent: "FDA 510k Expert" (agent_v1.2.3)
│
├─ Pharma Tenant: Shared with all pharma orgs (read-only)
│  │
│  ├─ Novartis Org: Forked → "Novartis FDA 510k Expert"
│  │  ├─ Customization: Added company-specific system prompt
│  │  ├─ Customization: Connected to internal regulatory KB
│  │  └─ Sync Status: Not synced (diverged)
│  │
│  ├─ Pfizer Org: Uses shared version (no fork)
│  │  └─ Sync Status: Auto-synced with upstream
│  │
│  └─ J&J Org: Forked → "J&J Device Regulatory Expert"
│     ├─ Customization: Modified for medical devices
│     └─ Sync Status: Selective sync (receives security patches only)
│
└─ Digital Health Tenant: Not shared (industry-specific)
```

**Lineage Query API:**

```typescript
// api/lineage/[resourceId].ts
export async function getResourceLineage(resourceId: string) {
  const lineage = await db.query(`
    WITH RECURSIVE lineage_tree AS (
      -- Base case: Current resource
      SELECT
        rl.resource_id,
        rl.forked_from_id,
        rl.forked_by_org_id,
        o.display_name as org_name,
        rl.fork_timestamp,
        rl.divergence_summary,
        0 as depth
      FROM resource_lineage rl
      JOIN organizations o ON rl.forked_by_org_id = o.id
      WHERE rl.resource_id = $1

      UNION ALL

      -- Recursive case: Walk up the chain
      SELECT
        rl.resource_id,
        rl.forked_from_id,
        rl.forked_by_org_id,
        o.display_name,
        rl.fork_timestamp,
        rl.divergence_summary,
        lt.depth + 1
      FROM resource_lineage rl
      JOIN lineage_tree lt ON rl.resource_id = lt.forked_from_id
      JOIN organizations o ON rl.forked_by_org_id = o.id
    )
    SELECT * FROM lineage_tree ORDER BY depth DESC
  `, [resourceId]);

  return buildLineageTree(lineage.rows);
}
```

### 4.4 Data Portability (Org Exit)

**When Organization Leaves Tenant:**

**Step 1: Data Export**
```typescript
export async function exportOrganizationData(orgId: string) {
  return {
    agents: await exportOrgAgents(orgId),
    ragKnowledgeBases: await exportOrgRAGKnowledgeBases(orgId),
    prompts: await exportOrgPrompts(orgId),
    workflows: await exportOrgWorkflows(orgId),
    users: await exportOrgUsers(orgId), // Anonymized if needed
    auditLogs: await exportOrgAuditLogs(orgId),
    metadata: {
      exportDate: new Date().toISOString(),
      organizationId: orgId,
      format: 'FHIR R4 + JSON-LD',
      encryption: 'AES-256-GCM'
    }
  };
}
```

**Step 2: Data Cleanup Options**
```typescript
export async function handleOrgExit(orgId: string, options: {
  deleteData: boolean; // true = hard delete, false = soft delete
  retainAuditLogs: boolean; // Regulatory requirement
  notifyDownstream: boolean; // Notify orgs using forked resources
}) {
  // 1. Soft delete (set deleted_at)
  if (!options.deleteData) {
    await db.query(`
      UPDATE organizations SET deleted_at = NOW() WHERE id = $1;
      UPDATE agent_instances SET deleted_at = NOW() WHERE organization_id = $1;
      -- ... other tables
    `, [orgId]);
  }

  // 2. Hard delete (after retention period)
  if (options.deleteData) {
    await db.transaction(async (trx) => {
      // Delete in dependency order
      await trx.query(`DELETE FROM rag_knowledge_bases WHERE organization_id = $1`, [orgId]);
      await trx.query(`DELETE FROM agent_instances WHERE organization_id = $1`, [orgId]);
      await trx.query(`DELETE FROM users WHERE organization_id = $1`, [orgId]);

      // Retain audit logs per retention policy
      if (!options.retainAuditLogs) {
        await trx.query(`DELETE FROM audit_logs WHERE organization_id = $1`, [orgId]);
      }

      await trx.query(`DELETE FROM organizations WHERE id = $1`, [orgId]);
    });
  }

  // 3. Notify downstream dependencies
  if (options.notifyDownstream) {
    const downstreamOrgs = await findOrgsUsingForkedResources(orgId);
    await notifyOrgExit(downstreamOrgs, orgId);
  }
}
```

---

## 5. Data Ownership & Lifecycle

### 5.1 Data Ownership Model

**Ownership Matrix:**

| Resource Type | Owner | Forkable? | Modifiable by Org? | Retention |
|---------------|-------|-----------|-------------------|-----------|
| **Platform Agents** | VITAL Platform | ✅ Yes (copy-on-write) | ❌ No (fork required) | Permanent |
| **Tenant-Shared Agents** | Vertical Tenant | ✅ Yes | ❌ No (fork required) | Per tenant policy |
| **Org-Created Agents** | Organization | ✅ Yes (within tenant) | ✅ Yes | Per org policy |
| **RAG Knowledge Bases** | Organization | ❌ No | ✅ Yes | Per org policy |
| **Prompts** | Creator (Platform/Tenant/Org) | ✅ Yes | Depends on creator | Per creator policy |
| **Workflows** | Creator | ✅ Yes | Depends on creator | Per creator policy |
| **User Data** | Organization | ❌ No | ✅ Yes | Per compliance profile |
| **Audit Logs** | Platform (immutable) | ❌ No | ❌ No (read-only) | 7 years (regulatory) |

### 5.2 Data Retention Policies

**Tenant-Level Defaults:**

```typescript
const RETENTION_POLICIES = {
  'pharma': {
    defaultRetentionYears: 7, // FDA requirement
    auditLogRetention: 7,
    userDataRetention: 7,
    workflowHistoryRetention: 5,
    ragDocumentRetention: 7,
    chatHistoryRetention: 2
  },
  'digital-health': {
    defaultRetentionYears: 6, // HIPAA requirement
    auditLogRetention: 6,
    userDataRetention: 6,
    workflowHistoryRetention: 3,
    ragDocumentRetention: 6,
    chatHistoryRetention: 1
  }
};
```

**Automated Retention Enforcement:**

```sql
-- Create retention policy enforcement job (runs daily)
CREATE OR REPLACE FUNCTION enforce_retention_policies() RETURNS void AS $$
DECLARE
  v_org RECORD;
  v_retention_years INTEGER;
  v_cutoff_date TIMESTAMPTZ;
BEGIN
  FOR v_org IN SELECT id, data_retention_years FROM organizations WHERE is_active = true
  LOOP
    v_retention_years := COALESCE(v_org.data_retention_years, 7);
    v_cutoff_date := NOW() - (v_retention_years || ' years')::INTERVAL;

    -- Delete old chat history
    DELETE FROM chat_sessions
    WHERE organization_id = v_org.id
      AND created_at < v_cutoff_date;

    -- Soft delete old workflow runs
    UPDATE workflow_runs
    SET deleted_at = NOW()
    WHERE organization_id = v_org.id
      AND created_at < v_cutoff_date
      AND deleted_at IS NULL;

    -- Archive old RAG documents (move to S3 Glacier)
    INSERT INTO rag_documents_archive
    SELECT * FROM rag_documents
    WHERE organization_id = v_org.id
      AND created_at < v_cutoff_date;

    DELETE FROM rag_documents
    WHERE organization_id = v_org.id
      AND created_at < v_cutoff_date;

    RAISE NOTICE 'Enforced retention policy for org %', v_org.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily via pg_cron
SELECT cron.schedule('enforce-retention', '0 2 * * *', 'SELECT enforce_retention_policies()');
```

### 5.3 Soft Delete vs Hard Delete

**Strategy:**

- **Soft Delete** (default): Set `deleted_at` timestamp, filter in queries
- **Hard Delete** (after retention): Physical deletion after retention period
- **Audit Logs**: NEVER deleted (immutable, retained per compliance)

**Implementation:**

```sql
-- Soft delete trigger
CREATE OR REPLACE FUNCTION soft_delete_cascade() RETURNS TRIGGER AS $$
BEGIN
  -- When organization is soft deleted, cascade to related records
  UPDATE agent_instances SET deleted_at = NEW.deleted_at
  WHERE organization_id = NEW.id AND deleted_at IS NULL;

  UPDATE rag_knowledge_bases SET deleted_at = NEW.deleted_at
  WHERE organization_id = NEW.id AND deleted_at IS NULL;

  UPDATE users SET deleted_at = NEW.deleted_at
  WHERE organization_id = NEW.id AND deleted_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_soft_delete_cascade
AFTER UPDATE OF deleted_at ON organizations
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_cascade();

-- RLS policy respects soft delete
CREATE POLICY org_isolation_agents ON agent_instances
  USING (
    organization_id = (current_setting('app.current_org_id', TRUE)::UUID)
    AND deleted_at IS NULL -- Exclude soft-deleted records
  );
```

---

## 6. Master Data Management

### 6.1 Master Data Strategy

**Master Data Entities:**

| Entity | Master Location | Versioning | Distribution |
|--------|----------------|------------|--------------|
| **Agent Definitions** | Platform DB | Semantic versioning (v1.2.3) | Replicated to vertical DBs |
| **Capabilities Registry** | Platform DB | Immutable (append-only) | Replicated |
| **Healthcare Standards** | Platform DB | Version + effective date | Replicated |
| **ICD-10 Codes** | Platform DB | Annual updates (WHO) | Replicated |
| **CPT Codes** | Platform DB | Annual updates (AMA) | Replicated |
| **LOINC Codes** | Platform DB | Biannual updates | Replicated |
| **Drug Reference (RxNorm)** | Platform DB | Monthly updates (NLM) | Replicated |
| **Org Roles (Template)** | Platform DB | Version + industry | Forked to orgs |
| **JTBD Catalog** | Platform DB | Version + industry | Forked to orgs |

### 6.2 Versioning Strategy

**Semantic Versioning for Master Data:**

```
v<MAJOR>.<MINOR>.<PATCH>

MAJOR: Breaking changes (schema changes, removed fields)
MINOR: New features (added fields, new agents)
PATCH: Bug fixes (corrected data, performance improvements)
```

**Version Schema:**

```sql
CREATE TABLE agent_definition_versions (
  id UUID PRIMARY KEY,
  agent_definition_id UUID NOT NULL REFERENCES agent_definitions(id),
  version TEXT NOT NULL, -- e.g., "1.2.3"
  changes_summary TEXT NOT NULL,
  breaking_changes TEXT[], -- List of breaking changes
  published_at TIMESTAMPTZ DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ, -- When this version is deprecated
  end_of_life_at TIMESTAMPTZ, -- When version is no longer supported
  schema_snapshot JSONB NOT NULL, -- Full schema at this version
  created_by UUID REFERENCES users(id),
  UNIQUE(agent_definition_id, version)
);

-- Example: Agent version evolution
INSERT INTO agent_definition_versions (agent_definition_id, version, changes_summary, breaking_changes, schema_snapshot)
VALUES (
  'fda-510k-expert-id',
  '2.0.0',
  'Upgraded to GPT-4 Turbo, added sub-agent support, removed deprecated fields',
  ARRAY['Removed legacy_config field', 'Changed system_prompt structure'],
  '{"agent_slug": "fda-510k-expert", "model": "gpt-4-turbo", ...}'::jsonb
);
```

**Version Pinning for Organizations:**

```sql
CREATE TABLE org_agent_version_pins (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_definition_id UUID NOT NULL REFERENCES agent_definitions(id),
  pinned_version TEXT NOT NULL, -- e.g., "1.5.2"
  auto_upgrade_minor BOOLEAN DEFAULT true, -- Auto-upgrade to 1.6.x?
  auto_upgrade_patch BOOLEAN DEFAULT true, -- Auto-upgrade to 1.5.3?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, agent_definition_id)
);

-- Function to resolve agent version for org
CREATE OR REPLACE FUNCTION get_agent_version_for_org(
  p_org_id UUID,
  p_agent_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_pinned_version TEXT;
  v_latest_version TEXT;
BEGIN
  -- Check if org has pinned version
  SELECT pinned_version INTO v_pinned_version
  FROM org_agent_version_pins
  WHERE organization_id = p_org_id AND agent_definition_id = p_agent_id;

  IF v_pinned_version IS NOT NULL THEN
    RETURN v_pinned_version;
  END IF;

  -- Otherwise, return latest stable version
  SELECT version INTO v_latest_version
  FROM agent_definition_versions
  WHERE agent_definition_id = p_agent_id
    AND deprecated_at IS NULL
  ORDER BY published_at DESC
  LIMIT 1;

  RETURN v_latest_version;
END;
$$ LANGUAGE plpgsql;
```

### 6.3 Master Data Synchronization

**Replication Strategy:**

```
Platform DB (Master)
│
├─ Every 6 hours: Full sync of master data to vertical DBs
├─ Real-time: Critical updates (security patches, compliance changes)
└─ Nightly: Incremental sync of large datasets (ICD-10, drug reference)
```

**Sync Implementation:**

```typescript
// services/master-data/sync-service.ts
export async function syncMasterDataToVertical(
  verticalTenantId: string,
  dataType: 'agents' | 'capabilities' | 'healthcare_codes'
) {
  const platformDb = getPlatformDbConnection();
  const verticalDb = getVerticalDbConnection(verticalTenantId);

  // 1. Get last sync timestamp
  const lastSync = await verticalDb.query(
    `SELECT last_sync_at FROM sync_status WHERE data_type = $1`,
    [dataType]
  );

  // 2. Fetch changed records from platform
  const changes = await platformDb.query(`
    SELECT * FROM ${dataType}
    WHERE updated_at > $1 OR created_at > $1
  `, [lastSync?.last_sync_at || '1970-01-01']);

  // 3. Upsert into vertical DB
  await verticalDb.transaction(async (trx) => {
    for (const record of changes.rows) {
      await trx.query(`
        INSERT INTO ${dataType} (id, ...)
        VALUES ($1, ...)
        ON CONFLICT (id) DO UPDATE SET ...
      `, [record.id, ...]);
    }

    // Update sync status
    await trx.query(`
      INSERT INTO sync_status (data_type, last_sync_at)
      VALUES ($1, NOW())
      ON CONFLICT (data_type) DO UPDATE SET last_sync_at = NOW()
    `, [dataType]);
  });

  // 4. Verify sync integrity
  await verifySyncIntegrity(platformDb, verticalDb, dataType);
}
```

### 6.4 Conflict Resolution

**Conflict Scenarios:**

1. **Org Modified Forked Resource + Upstream Updated**
   - Resolution: Org's changes take precedence (diverged fork)
   - Notification: Alert org of upstream changes, offer merge

2. **Two Orgs Fork Same Resource + Modify Differently**
   - Resolution: No conflict (independent forks)
   - Tracking: Both tracked in lineage separately

3. **Master Data Update Breaks Org's Custom Logic**
   - Resolution: Version pinning prevents auto-upgrade
   - Notification: Breaking change alert, manual upgrade required

**Merge Tool (Manual Resolution):**

```typescript
export async function proposeUpstreamMerge(forkedResourceId: string) {
  const forked = await getResource(forkedResourceId);
  const original = await getResource(forked.forked_from_id);

  // Generate 3-way diff
  const diff = generateDiff({
    base: forked.forked_at_snapshot, // Snapshot at fork time
    theirs: original.current_state,  // Upstream changes
    yours: forked.current_state      // Org's changes
  });

  return {
    conflicts: diff.conflicts, // Fields changed in both
    safeToMerge: diff.safeChanges, // Non-conflicting changes
    suggestedResolution: generateMergeProposal(diff)
  };
}
```

---

## 7. Integration Patterns (BYOAI)

### 7.1 BYOAI Architecture

**Bring Your Own AI (BYOAI) enables customers to:**
- Integrate proprietary LLMs (fine-tuned models)
- Connect custom RAG systems (internal knowledge bases)
- Link external data sources (CRM, EHR, clinical trials DBs)

**Architecture Pattern: Federated Query Layer**

```
┌─────────────────────────────────────────────────────────────────┐
│                     VITAL Platform                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           Unified Query Interface (GraphQL)            │     │
│  └──────┬──────────────────────────────┬──────────────────┘     │
│         │                              │                        │
│  ┌──────▼────────┐            ┌────────▼──────────┐            │
│  │ VITAL Agents  │            │ VITAL RAG Systems │            │
│  │ (Native)      │            │ (Pinecone)        │            │
│  └───────────────┘            └───────────────────┘            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │          Data Virtualization Layer                     │     │
│  │  - Query routing                                       │     │
│  │  - Schema mapping                                      │     │
│  │  - Authentication delegation                           │     │
│  │  - Data quality validation                             │     │
│  └──────┬──────────────────────────────┬─────────────────┘     │
└─────────┼──────────────────────────────┼────────────────────────┘
          │                              │
┌─────────▼───────────┐        ┌─────────▼────────────┐
│ Customer LLM        │        │ Customer RAG         │
│ (BYOAI)             │        │ (BYOAI)              │
│ - Custom GPT        │        │ - Internal docs      │
│ - Fine-tuned BERT   │        │ - EHR data           │
│ - BioGPT variant    │        │ - Clinical trials DB │
└─────────────────────┘        └──────────────────────┘
```

### 7.2 BYOAI Integration Schema

**External Resource Registry:**

```sql
CREATE TABLE external_llm_integrations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  integration_name TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('openai-compatible', 'huggingface', 'azure', 'aws-bedrock', 'custom')),
  endpoint_url TEXT NOT NULL, -- Customer's API endpoint
  authentication_type TEXT CHECK (authentication_type IN ('api_key', 'oauth2', 'iam_role', 'mTLS')),
  credentials_secret_id TEXT NOT NULL, -- AWS Secrets Manager or Vault
  model_name TEXT NOT NULL,
  capabilities TEXT[] DEFAULT ARRAY['completion'], -- completion, chat, embedding, classification
  rate_limit_per_minute INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, integration_name)
);

CREATE TABLE external_rag_integrations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  integration_name TEXT NOT NULL,
  data_source_type TEXT CHECK (data_source_type IN ('elasticsearch', 'weaviate', 'custom_api', 'sql_database', 's3')),
  connection_config JSONB NOT NULL, -- { "host": "...", "port": "...", "index": "..." }
  authentication_secret_id TEXT NOT NULL,
  schema_mapping JSONB NOT NULL, -- Maps customer schema to VITAL schema
  data_classification TEXT CHECK (data_classification IN ('Public', 'Internal', 'Confidential', 'PHI')),
  requires_phi_access BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, integration_name)
);

-- Data quality validation rules
CREATE TABLE byoai_validation_rules (
  id UUID PRIMARY KEY,
  integration_id UUID NOT NULL, -- References external_llm_integrations or external_rag_integrations
  integration_type TEXT CHECK (integration_type IN ('llm', 'rag')),
  rule_type TEXT CHECK (rule_type IN ('schema', 'response_format', 'latency', 'content_filter')),
  rule_config JSONB NOT NULL,
  is_blocking BOOLEAN DEFAULT false, -- If true, reject invalid responses
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 Federated Query Implementation

**Query Routing Logic:**

```typescript
// services/byoai/federated-query-router.ts
export async function routeQuery(query: {
  organizationId: string;
  agentId: string;
  userQuery: string;
  requiresPHI: boolean;
}) {
  // 1. Determine if agent uses BYOAI resources
  const agent = await getAgent(query.agentId);
  const byoaiConfigs = await getBYOAIIntegrations(query.organizationId);

  // 2. Build execution plan
  const plan: ExecutionPlan = {
    nativeResources: [],
    externalLLMs: [],
    externalRAGSources: []
  };

  // Check if agent is configured to use customer LLM
  if (agent.custom_config?.use_org_llm) {
    const llmIntegration = byoaiConfigs.llms.find(
      l => l.integration_name === agent.custom_config.org_llm_name
    );
    if (llmIntegration) plan.externalLLMs.push(llmIntegration);
  }

  // Check if RAG query should include customer data
  if (agent.rag_enabled && agent.custom_config?.include_org_rag) {
    const ragIntegrations = byoaiConfigs.rags.filter(
      r => r.is_active && (!query.requiresPHI || r.requires_phi_access)
    );
    plan.externalRAGSources.push(...ragIntegrations);
  }

  // 3. Execute federated query
  const results = await Promise.all([
    // Query native VITAL resources
    queryVITALAgents(agent, query.userQuery),

    // Query customer LLM (if configured)
    ...plan.externalLLMs.map(llm =>
      queryExternalLLM(llm, query.userQuery)
    ),

    // Query customer RAG (if configured)
    ...plan.externalRAGSources.map(rag =>
      queryExternalRAG(rag, query.userQuery)
    )
  ]);

  // 4. Validate and merge results
  const validated = await validateBYOAIResponses(results, plan);
  const merged = await mergeResponses(validated);

  // 5. Audit log
  await logBYOAIQuery({
    organizationId: query.organizationId,
    agentId: query.agentId,
    externalLLMsUsed: plan.externalLLMs.map(l => l.integration_name),
    externalRAGsUsed: plan.externalRAGSources.map(r => r.integration_name),
    latency: merged.totalLatencyMs
  });

  return merged.response;
}
```

**External LLM Connector (OpenAI-Compatible API):**

```typescript
// services/byoai/external-llm-connector.ts
async function queryExternalLLM(
  integration: ExternalLLMIntegration,
  query: string
): Promise<ExternalLLMResponse> {
  // 1. Get credentials from secrets manager
  const credentials = await getSecret(integration.credentials_secret_id);

  // 2. Build request (OpenAI-compatible format)
  const request = {
    model: integration.model_name,
    messages: [{ role: 'user', content: query }],
    max_tokens: 1000,
    temperature: 0.7
  };

  // 3. Call external API with timeout
  try {
    const response = await fetch(integration.endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.api_key}`
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(integration.timeout_seconds * 1000)
    });

    if (!response.ok) {
      throw new Error(`External LLM error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Validate response format
    await validateLLMResponse(data, integration.id);

    return {
      provider: integration.integration_name,
      response: data.choices[0].message.content,
      latencyMs: response.headers.get('X-Response-Time'),
      tokensUsed: data.usage?.total_tokens
    };

  } catch (error) {
    // Log error but don't fail entire query
    await logBYOAIError({
      integrationId: integration.id,
      error: error.message,
      query
    });

    return {
      provider: integration.integration_name,
      error: 'External LLM unavailable',
      fallbackToNative: true
    };
  }
}
```

**External RAG Connector (Generic):**

```typescript
// services/byoai/external-rag-connector.ts
async function queryExternalRAG(
  integration: ExternalRAGIntegration,
  query: string
): Promise<ExternalRAGResponse> {
  switch (integration.data_source_type) {
    case 'elasticsearch':
      return queryElasticsearch(integration, query);

    case 'weaviate':
      return queryWeaviate(integration, query);

    case 'custom_api':
      return queryCustomAPI(integration, query);

    case 'sql_database':
      return querySQLDatabase(integration, query);

    default:
      throw new Error(`Unsupported RAG type: ${integration.data_source_type}`);
  }
}

async function queryElasticsearch(
  integration: ExternalRAGIntegration,
  query: string
): Promise<ExternalRAGResponse> {
  const credentials = await getSecret(integration.authentication_secret_id);
  const config = integration.connection_config;

  // Build Elasticsearch query
  const esQuery = {
    index: config.index,
    body: {
      query: {
        multi_match: {
          query: query,
          fields: config.search_fields || ['title', 'content']
        }
      },
      size: 10
    }
  };

  // Execute query
  const client = new ElasticsearchClient({
    node: config.host,
    auth: {
      username: credentials.username,
      password: credentials.password
    }
  });

  const response = await client.search(esQuery);

  // Map results to VITAL schema
  const documents = response.hits.hits.map(hit => ({
    id: hit._id,
    title: hit._source[config.title_field],
    content: hit._source[config.content_field],
    score: hit._score,
    metadata: extractMetadata(hit._source, integration.schema_mapping)
  }));

  return {
    provider: integration.integration_name,
    documents,
    totalResults: response.hits.total.value
  };
}
```

### 7.4 Data Quality Validation

**BYOAI Response Validation:**

```typescript
// services/byoai/data-quality-validator.ts
export async function validateBYOAIResponses(
  responses: ExternalResponse[],
  plan: ExecutionPlan
) {
  const validatedResponses = [];

  for (const response of responses) {
    const integration = findIntegration(response.provider, plan);
    const rules = await getValidationRules(integration.id);

    let isValid = true;
    const validationResults = [];

    for (const rule of rules) {
      const result = await applyValidationRule(rule, response);
      validationResults.push(result);

      if (!result.passed && rule.is_blocking) {
        isValid = false;
        break;
      }
    }

    if (isValid) {
      validatedResponses.push(response);
    } else {
      // Log validation failure
      await logValidationFailure({
        integrationId: integration.id,
        response,
        validationResults
      });

      // Optionally fallback to native VITAL resource
      if (integration.fallback_to_native) {
        const fallback = await queryNativeResource(response.originalQuery);
        validatedResponses.push(fallback);
      }
    }
  }

  return validatedResponses;
}

async function applyValidationRule(
  rule: BYOAIValidationRule,
  response: ExternalResponse
): Promise<ValidationResult> {
  switch (rule.rule_type) {
    case 'schema':
      return validateSchema(response, rule.rule_config.schema);

    case 'response_format':
      return validateFormat(response, rule.rule_config.format);

    case 'latency':
      return validateLatency(response, rule.rule_config.max_latency_ms);

    case 'content_filter':
      return validateContent(response, rule.rule_config.filters);

    default:
      return { passed: true, message: 'No validation' };
  }
}
```

### 7.5 BYOAI Security & Compliance

**Security Controls:**

```typescript
// Credential Management (AWS Secrets Manager)
export async function storeBYOAICredentials(
  organizationId: string,
  integrationName: string,
  credentials: {
    api_key?: string;
    username?: string;
    password?: string;
    oauth_token?: string;
  }
) {
  const secretName = `byoai/${organizationId}/${integrationName}`;

  // Encrypt credentials
  const encrypted = await kms.encrypt({
    KeyId: getOrgEncryptionKey(organizationId),
    Plaintext: JSON.stringify(credentials)
  });

  // Store in Secrets Manager
  await secretsManager.createSecret({
    Name: secretName,
    SecretString: encrypted.CiphertextBlob,
    Tags: [
      { Key: 'OrganizationId', Value: organizationId },
      { Key: 'IntegrationType', Value: 'BYOAI' }
    ]
  });

  return secretName;
}

// Network Security (VPC PrivateLink for AWS-hosted customer resources)
export async function setupPrivateLink(
  organizationId: string,
  customerVPCEndpoint: string
) {
  // Create VPC endpoint service
  const endpoint = await ec2.createVpcEndpointService({
    NetworkLoadBalancerArns: [VITAL_NLB_ARN],
    AcceptanceRequired: true
  });

  // Store endpoint mapping
  await db.query(`
    INSERT INTO byoai_vpc_endpoints (organization_id, vpc_endpoint_id, customer_vpc_endpoint)
    VALUES ($1, $2, $3)
  `, [organizationId, endpoint.ServiceId, customerVPCEndpoint]);

  return endpoint;
}
```

---

## 8. Analytics & Reporting Architecture

### 8.1 Analytical Data Plane

**Separation of Concerns:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRANSACTIONAL PLANE (OLTP)                     │
│  PostgreSQL (Supabase)                                           │
│  - User queries                                                  │
│  - Agent operations                                              │
│  - Real-time workflows                                           │
│  - <200ms latency requirement                                    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ CDC (Change Data Capture)
                         │ AWS DMS or Debezium
                         │ Real-time streaming
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICAL PLANE (OLAP)                       │
│  Amazon Redshift / Snowflake                                     │
│  - Historical reporting                                          │
│  - Cross-tenant benchmarking (anonymized)                        │
│  - Predictive analytics                                          │
│  - Latency tolerance: seconds to minutes                         │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Data Warehouse Architecture

**Dimensional Model:**

```sql
-- Fact Tables
CREATE TABLE fact_agent_queries (
  query_id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  date_key INTEGER NOT NULL, -- References dim_date

  -- Dimensions (foreign keys)
  tenant_key INTEGER REFERENCES dim_tenant(tenant_key),
  organization_key INTEGER REFERENCES dim_organization(org_key),
  agent_key INTEGER REFERENCES dim_agent(agent_key),
  user_key INTEGER REFERENCES dim_user(user_key),

  -- Metrics
  latency_ms INTEGER NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  was_successful BOOLEAN NOT NULL,
  confidence_score DECIMAL(3,2),

  -- Degenerate dimensions
  query_mode TEXT, -- mode1, mode2, mode3, mode4
  device_type TEXT, -- web, mobile, api

  -- Audit
  loaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fact_workflow_executions (
  execution_id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  date_key INTEGER NOT NULL,

  -- Dimensions
  tenant_key INTEGER REFERENCES dim_tenant(tenant_key),
  organization_key INTEGER REFERENCES dim_organization(org_key),
  workflow_key INTEGER REFERENCES dim_workflow(workflow_key),

  -- Metrics
  duration_seconds INTEGER NOT NULL,
  steps_executed INTEGER NOT NULL,
  steps_failed INTEGER DEFAULT 0,
  agents_invoked INTEGER NOT NULL,
  total_cost_usd DECIMAL(10,2) NOT NULL,
  was_successful BOOLEAN NOT NULL,

  loaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dimension Tables (Type 2 SCD - track history)
CREATE TABLE dim_agent (
  agent_key SERIAL PRIMARY KEY, -- Surrogate key
  agent_id UUID NOT NULL, -- Business key
  agent_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  model TEXT NOT NULL,
  specialty TEXT[],

  -- SCD Type 2 columns
  effective_date DATE NOT NULL,
  expiration_date DATE, -- NULL = current
  is_current BOOLEAN DEFAULT true,

  -- Slowly changing attributes
  status TEXT,
  cost_per_query DECIMAL(10,4),

  UNIQUE(agent_id, effective_date)
);

CREATE TABLE dim_organization (
  org_key SERIAL PRIMARY KEY,
  organization_id UUID NOT NULL,
  tenant_key INTEGER NOT NULL REFERENCES dim_tenant(tenant_key),
  org_name TEXT NOT NULL,
  industry_vertical TEXT,
  organization_size TEXT, -- startup, small, medium, large, enterprise

  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_current BOOLEAN DEFAULT true,

  UNIQUE(organization_id, effective_date)
);

CREATE TABLE dim_tenant (
  tenant_key SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL UNIQUE,
  tenant_slug TEXT NOT NULL,
  tenant_type TEXT NOT NULL,
  compliance_profile TEXT[]
);

CREATE TABLE dim_date (
  date_key INTEGER PRIMARY KEY,
  full_date DATE NOT NULL UNIQUE,
  day_of_week TEXT NOT NULL,
  day_of_month INTEGER NOT NULL,
  month_number INTEGER NOT NULL,
  month_name TEXT NOT NULL,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  is_weekend BOOLEAN NOT NULL,
  is_holiday BOOLEAN DEFAULT false,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER
);
```

### 8.3 ETL Pipeline (CDC from OLTP to OLAP)

**Change Data Capture Architecture:**

```typescript
// services/analytics/cdc-pipeline.ts
import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';
import { kafkaConsumer } from './kafka-client';

/**
 * CDC Pipeline: PostgreSQL → Kinesis → Redshift
 *
 * Flow:
 * 1. PostgreSQL logical replication (pgoutput) → Debezium
 * 2. Debezium → Kafka topic (per table)
 * 3. Kafka consumer → Transform → Kinesis Firehose
 * 4. Kinesis Firehose → S3 (staging) → Redshift COPY
 */

export async function startCDCPipeline() {
  const consumer = kafkaConsumer({
    groupId: 'vital-analytics-cdc',
    topics: [
      'pg.vital_pharma.agent_instances',
      'pg.vital_pharma.chat_sessions',
      'pg.vital_pharma.workflow_runs'
    ]
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const changeEvent = JSON.parse(message.value.toString());

      // Transform from OLTP schema to dimensional model
      const transformed = await transformForAnalytics(changeEvent);

      // Anonymize PII if required
      if (transformed.containsPII) {
        transformed.data = await anonymizePII(transformed.data);
      }

      // Stream to Kinesis Firehose
      await streamToFirehose(transformed);
    }
  });
}

async function transformForAnalytics(changeEvent: CDCEvent) {
  switch (changeEvent.table) {
    case 'chat_sessions':
      return transformChatSessionToFact(changeEvent);

    case 'workflow_runs':
      return transformWorkflowToFact(changeEvent);

    case 'agent_instances':
      return transformAgentToDimension(changeEvent);

    default:
      return null;
  }
}

async function transformChatSessionToFact(event: CDCEvent) {
  const session = event.after; // New row state

  return {
    table: 'fact_agent_queries',
    operation: event.op, // INSERT, UPDATE, DELETE
    data: {
      query_id: session.id,
      timestamp: session.created_at,
      date_key: generateDateKey(session.created_at),

      // Lookup dimension keys
      tenant_key: await lookupTenantKey(session.tenant_id),
      organization_key: await lookupOrgKey(session.organization_id),
      agent_key: await lookupAgentKey(session.agent_id, session.created_at),
      user_key: await lookupUserKey(session.user_id),

      // Metrics
      latency_ms: session.latency_ms,
      tokens_used: session.tokens_used,
      cost_usd: session.cost_usd,
      was_successful: session.status === 'completed',
      confidence_score: session.confidence_score,

      // Degenerate dimensions
      query_mode: session.mode,
      device_type: session.device_type
    }
  };
}
```

### 8.4 Cross-Tenant Analytics (Anonymized)

**Benchmarking Queries (Safe):**

```sql
-- Anonymized cross-tenant benchmarking
CREATE VIEW v_tenant_benchmarks AS
SELECT
  t.tenant_type, -- pharma, digital-health (NO tenant name/ID)
  o.organization_size, -- startup, small, medium, large (NO org name/ID)
  DATE_TRUNC('month', f.timestamp) as month,

  -- Aggregated metrics (no individual data)
  AVG(f.latency_ms) as avg_latency_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY f.latency_ms) as median_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY f.latency_ms) as p95_latency_ms,

  AVG(f.tokens_used) as avg_tokens_per_query,
  AVG(f.cost_usd) as avg_cost_per_query,

  SUM(f.was_successful::INTEGER) / COUNT(*)::FLOAT as success_rate,

  COUNT(*) as total_queries
FROM fact_agent_queries f
JOIN dim_tenant t ON f.tenant_key = t.tenant_key
JOIN dim_organization o ON f.organization_key = o.org_key
WHERE f.timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY t.tenant_type, o.organization_size, DATE_TRUNC('month', f.timestamp)
HAVING COUNT(*) >= 100 -- k-anonymity: require at least 100 queries
ORDER BY month DESC, tenant_type, organization_size;

-- Per-organization dashboard (NOT shared)
CREATE VIEW v_org_performance AS
SELECT
  o.org_name,
  a.display_name as agent_name,
  a.tier,
  DATE_TRUNC('day', f.timestamp) as date,

  COUNT(*) as queries_executed,
  AVG(f.latency_ms) as avg_latency_ms,
  SUM(f.cost_usd) as total_cost_usd,
  AVG(f.confidence_score) as avg_confidence,
  SUM(f.was_successful::INTEGER) / COUNT(*)::FLOAT as success_rate
FROM fact_agent_queries f
JOIN dim_organization o ON f.organization_key = o.org_key AND o.is_current = true
JOIN dim_agent a ON f.agent_key = a.agent_key AND a.is_current = true
WHERE f.timestamp >= CURRENT_DATE - INTERVAL '30 days'
  AND o.organization_id = (current_setting('app.current_org_id', TRUE)::UUID) -- RLS
GROUP BY o.org_name, a.display_name, a.tier, DATE_TRUNC('day', f.timestamp)
ORDER BY date DESC, queries_executed DESC;
```

### 8.5 Real-Time Analytics (Hot Path)

**Materialized Views (Refreshed Every 5 Minutes):**

```sql
-- Real-time agent usage (last 15 minutes)
CREATE MATERIALIZED VIEW mv_agent_usage_realtime AS
SELECT
  a.agent_slug,
  a.display_name,
  COUNT(*) as query_count,
  AVG(cs.latency_ms) as avg_latency_ms,
  MAX(cs.created_at) as last_query_at
FROM chat_sessions cs
JOIN agent_instances ai ON cs.agent_id = ai.id
JOIN agent_definitions a ON ai.agent_definition_id = a.id
WHERE cs.created_at >= NOW() - INTERVAL '15 minutes'
  AND cs.deleted_at IS NULL
GROUP BY a.agent_slug, a.display_name;

-- Refresh every 5 minutes
SELECT cron.schedule('refresh-realtime-analytics', '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_usage_realtime');

-- API endpoint for real-time dashboard
-- GET /api/analytics/realtime/agent-usage
export async function getRealtimeAgentUsage(organizationId: string) {
  return await db.query(`
    SELECT * FROM mv_agent_usage_realtime
    WHERE agent_slug IN (
      SELECT DISTINCT ai.agent_slug
      FROM agent_instances ai
      WHERE ai.organization_id = $1 AND ai.deleted_at IS NULL
    )
    ORDER BY query_count DESC
    LIMIT 20
  `, [organizationId]);
}
```

---

## 9. Compliance & Governance

### 9.1 Compliance Profiles

**Tenant-Specific Compliance Requirements:**

```typescript
const COMPLIANCE_PROFILES = {
  'pharma': {
    regulations: ['HIPAA', '21CFR11', 'GxP', 'GDPR'],
    requirements: {
      auditTrail: 'immutable', // Cannot delete/modify audit logs
      dataRetention: 7, // years
      electronicSignatures: true, // 21 CFR Part 11
      dataIntegrityControls: true, // ALCOA+ principles
      changeControl: 'formal', // Validated changes only
      userAccessReview: 'quarterly',
      encryptionAtRest: 'AES-256',
      encryptionInTransit: 'TLS 1.3',
      backupFrequency: 'daily',
      disasterRecoveryRTO: '4 hours',
      disasterRecoveryRPO: '1 hour'
    }
  },
  'digital-health': {
    regulations: ['HIPAA', 'HITECH', 'GDPR', 'USCDI'],
    requirements: {
      auditTrail: 'immutable',
      dataRetention: 6, // years
      electronicSignatures: false,
      patientAccessRights: true, // HIPAA Right of Access
      breachNotification: '60 days', // HIPAA Breach Notification Rule
      dataSegmentation: true, // Substance abuse, mental health
      userAccessReview: 'semi-annual',
      encryptionAtRest: 'AES-256',
      encryptionInTransit: 'TLS 1.3',
      backupFrequency: 'daily',
      disasterRecoveryRTO: '8 hours',
      disasterRecoveryRPO: '4 hours'
    }
  }
};
```

### 9.2 Data Classification & Encryption

**Automatic Data Classification:**

```sql
-- Data classification rules
CREATE TABLE data_classification_rules (
  id UUID PRIMARY KEY,
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  classification TEXT CHECK (classification IN ('Public', 'Internal', 'Confidential', 'PHI')) NOT NULL,
  requires_encryption BOOLEAN DEFAULT false,
  encryption_algorithm TEXT CHECK (encryption_algorithm IN ('AES-256-GCM', 'RSA-2048', 'NONE')),
  pii_type TEXT, -- SSN, credit_card, email, phone, name, dob, mrn
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert classification rules
INSERT INTO data_classification_rules (table_name, column_name, classification, requires_encryption, pii_type) VALUES
  ('users', 'email', 'Confidential', true, 'email'),
  ('users', 'encrypted_pii', 'PHI', true, 'name|phone|dob'),
  ('chat_sessions', 'user_query', 'Confidential', true, NULL),
  ('chat_sessions', 'agent_response', 'Confidential', true, NULL),
  ('rag_documents', 'content', 'Confidential', true, NULL),
  ('agent_definitions', 'system_prompt', 'Internal', false, NULL);

-- Encryption at column level (PostgreSQL pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt function (uses org-specific encryption key from AWS KMS)
CREATE OR REPLACE FUNCTION encrypt_column(
  plaintext TEXT,
  organization_id UUID
) RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get org-specific encryption key from KMS
  SELECT get_org_encryption_key(organization_id) INTO encryption_key;

  -- Encrypt using AES-256-GCM
  RETURN encode(
    encrypt_iv(
      plaintext::bytea,
      encryption_key::bytea,
      gen_random_bytes(16), -- IV
      'aes-gcm'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt function
CREATE OR REPLACE FUNCTION decrypt_column(
  ciphertext TEXT,
  organization_id UUID
) RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  SELECT get_org_encryption_key(organization_id) INTO encryption_key;

  RETURN convert_from(
    decrypt_iv(
      decode(ciphertext, 'base64'),
      encryption_key::bytea,
      decode(substring(ciphertext, 1, 24), 'base64'), -- Extract IV
      'aes-gcm'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 9.3 Audit Logging (Tamper-Evident)

**Immutable Audit Log Schema:**

```sql
-- Immutable audit log (append-only, no updates/deletes allowed)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Who
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  user_id UUID,
  service_account TEXT, -- For system actions
  ip_address INET,
  user_agent TEXT,

  -- What
  action TEXT NOT NULL, -- CREATE, READ, UPDATE, DELETE, EXECUTE, EXPORT
  resource_type TEXT NOT NULL, -- agent, rag_kb, user, workflow, etc.
  resource_id UUID NOT NULL,
  resource_name TEXT,

  -- Context
  operation_status TEXT CHECK (operation_status IN ('success', 'failure', 'partial')),
  error_message TEXT,
  request_payload JSONB, -- Sanitized (no PII/PHI)
  response_summary JSONB,

  -- Compliance
  compliance_flags TEXT[], -- HIPAA_ACCESS, 21CFR11_CHANGE, GDPR_EXPORT
  requires_signature BOOLEAN DEFAULT false,
  electronic_signature TEXT, -- Digital signature (21 CFR Part 11)

  -- Tamper detection (blockchain-style)
  previous_log_hash TEXT, -- SHA-256 hash of previous log entry
  current_log_hash TEXT, -- SHA-256 hash of this entry

  -- Performance
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent updates/deletes (immutable)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER audit_log_immutable_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Tamper detection function
CREATE OR REPLACE FUNCTION calculate_audit_log_hash(
  p_log RECORD
) RETURNS TEXT AS $$
BEGIN
  -- Concatenate critical fields and hash
  RETURN encode(
    digest(
      p_log.id::TEXT ||
      p_log.timestamp::TEXT ||
      p_log.user_id::TEXT ||
      p_log.action ||
      p_log.resource_type ||
      p_log.resource_id::TEXT ||
      COALESCE(p_log.previous_log_hash, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate hash on insert
CREATE OR REPLACE FUNCTION set_audit_log_hash() RETURNS TRIGGER AS $$
DECLARE
  prev_hash TEXT;
BEGIN
  -- Get previous log hash
  SELECT current_log_hash INTO prev_hash
  FROM audit_logs
  WHERE organization_id = NEW.organization_id
  ORDER BY timestamp DESC
  LIMIT 1;

  NEW.previous_log_hash := prev_hash;
  NEW.current_log_hash := calculate_audit_log_hash(NEW);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_set_hash
BEFORE INSERT ON audit_logs
FOR EACH ROW EXECUTE FUNCTION set_audit_log_hash();
```

**Audit Log API:**

```typescript
// services/audit/audit-logger.ts
export async function logAuditEvent(event: {
  tenantId: string;
  organizationId: string;
  userId?: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'EXPORT';
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  operationStatus: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  complianceFlags?: string[];
  requiresSignature?: boolean;
}) {
  // Sanitize payloads (remove PII/PHI)
  const sanitizedPayload = await sanitizeForAudit(event);

  // Insert audit log
  await db.query(`
    INSERT INTO audit_logs (
      tenant_id,
      organization_id,
      user_id,
      ip_address,
      user_agent,
      action,
      resource_type,
      resource_id,
      resource_name,
      operation_status,
      error_message,
      compliance_flags,
      requires_signature
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `, [
    event.tenantId,
    event.organizationId,
    event.userId,
    event.ipAddress,
    event.userAgent,
    event.action,
    event.resourceType,
    event.resourceId,
    event.resourceName,
    event.operationStatus,
    event.errorMessage,
    event.complianceFlags || [],
    event.requiresSignature || false
  ]);

  // Replicate to immutable storage (S3 + Glacier)
  await replicateToImmutableStorage(event);
}
```

### 9.4 Data Residency

**Geographic Data Isolation:**

```typescript
const DATA_RESIDENCY_RULES = {
  'EU': {
    regions: ['eu-central-1', 'eu-west-1'],
    regulations: ['GDPR', 'EU MDR'],
    restrictions: {
      dataTransferToUS: 'prohibited', // Unless Standard Contractual Clauses
      dataTransferWithinEU: 'allowed',
      dataProcessingLocation: 'EU-only'
    }
  },
  'US': {
    regions: ['us-east-1', 'us-west-2'],
    regulations: ['HIPAA', '21 CFR Part 11'],
    restrictions: {
      dataTransferToEU: 'allowed', // With adequate safeguards
      dataTransferToNonEEA: 'case-by-case',
      dataProcessingLocation: 'US-preferred'
    }
  }
};

// Tenant creation with data residency
export async function createTenant(input: {
  tenantSlug: string;
  tenantType: 'pharma' | 'digital-health';
  dataResidency: 'US' | 'EU' | 'APAC';
  complianceProfile: string[];
}) {
  // Select database region based on residency
  const dbRegion = DATA_RESIDENCY_RULES[input.dataResidency].regions[0];

  // Create database in correct region
  const database = await createDatabaseInRegion(
    `vital_${input.tenantSlug}_db`,
    dbRegion
  );

  // Create tenant record
  await db.query(`
    INSERT INTO tenants (
      slug,
      tenant_type,
      database_name,
      compliance_profile,
      data_residency
    ) VALUES ($1, $2, $3, $4, $5)
  `, [
    input.tenantSlug,
    input.tenantType,
    database.name,
    input.complianceProfile,
    input.dataResidency
  ]);

  // Configure cross-region replication if needed
  if (input.dataResidency === 'EU' && input.complianceProfile.includes('GDPR')) {
    await configureCrossRegionReplication(database, 'eu-west-1', 'eu-central-1');
  }
}
```

---

## 10. Migration Strategy

### 10.1 Current State to Target State

**Current Architecture:**
- Single PostgreSQL database (Supabase)
- RLS for multi-tenancy
- All tenants in same database

**Target Architecture:**
- Hybrid: Separate databases per vertical tenant
- Shared platform database for global resources
- Analytical data plane (Redshift)

**Migration Phases:**

```
Phase 1: Platform Database Extraction (Weeks 1-2)
├─ Create vital_platform_db
├─ Migrate agent_definitions (master data)
├─ Migrate capabilities registry
├─ Migrate healthcare reference data (ICD-10, CPT, etc.)
└─ Test platform → vertical sync

Phase 2: Vertical Database Creation (Weeks 3-4)
├─ Provision vital_pharma_db (separate Supabase project)
├─ Provision vital_digitalhealth_db
├─ Replicate schema to vertical DBs
└─ Test RLS policies

Phase 3: Data Migration (Weeks 5-8)
├─ Export data from monolithic DB (by tenant)
├─ Transform data for new schema
├─ Import to vertical DBs
├─ Validate data integrity
└─ Parallel run (old + new system)

Phase 4: Application Updates (Weeks 9-10)
├─ Update connection pooling (route by tenant)
├─ Update RLS context setting
├─ Update BYOAI integration endpoints
└─ Update analytics ETL pipeline

Phase 5: Cutover (Week 11)
├─ Final sync (CDC)
├─ Switch DNS/routing
├─ Monitor for 72 hours
├─ Decommission old database
└─ Update documentation
```

### 10.2 Zero-Downtime Migration

**Strategy: Blue-Green Deployment with CDC**

```typescript
// Migration orchestrator
export async function executeZeroDowntimeMigration() {
  // Phase 1: Setup CDC from old DB to new DBs
  await setupCDC({
    source: 'vital_monolithic_db',
    targets: [
      { name: 'vital_platform_db', filter: 'tenant_id IS NULL OR is_public = true' },
      { name: 'vital_pharma_db', filter: "tenant_type = 'pharma'" },
      { name: 'vital_digitalhealth_db', filter: "tenant_type = 'digital-health'" }
    ]
  });

  // Phase 2: Initial bulk load (historical data)
  await bulkLoadHistoricalData({
    batchSize: 10000,
    parallelism: 4,
    validateChecksums: true
  });

  // Phase 3: Real-time sync (CDC catches up)
  await waitForCDCCatchup({ maxLagSeconds: 10 });

  // Phase 4: Dual-write mode (write to both old and new)
  await enableDualWriteMode({ durationMinutes: 60 });

  // Phase 5: Validation
  const validation = await validateMigration({
    sampleSize: 10000,
    checksumValidation: true,
    functionalTests: true
  });

  if (!validation.passed) {
    await rollbackMigration();
    throw new Error('Migration validation failed');
  }

  // Phase 6: Cutover (flip routing)
  await updateDatabaseRouting({
    oldDB: 'readonly', // Set old DB to read-only
    newDBs: 'primary'  // Route all writes to new DBs
  });

  // Phase 7: Monitor (24 hours)
  await monitorPostMigration({ durationHours: 24 });

  // Phase 8: Decommission old DB (after 7 days)
  await scheduleDecommission('vital_monolithic_db', { delayDays: 7 });
}
```

### 10.3 Data Validation

**Validation Queries:**

```sql
-- Row count validation
CREATE OR REPLACE FUNCTION validate_row_counts() RETURNS TABLE (
  table_name TEXT,
  source_count BIGINT,
  target_count BIGINT,
  difference BIGINT,
  validation_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH source_counts AS (
    SELECT 'agent_instances' as tbl, COUNT(*) as cnt FROM old_db.agent_instances
    UNION ALL
    SELECT 'rag_knowledge_bases', COUNT(*) FROM old_db.rag_knowledge_bases
    -- ... other tables
  ),
  target_counts AS (
    SELECT 'agent_instances' as tbl, COUNT(*) as cnt FROM new_db.agent_instances
    UNION ALL
    SELECT 'rag_knowledge_bases', COUNT(*) FROM new_db.rag_knowledge_bases
    -- ... other tables
  )
  SELECT
    s.tbl as table_name,
    s.cnt as source_count,
    t.cnt as target_count,
    s.cnt - t.cnt as difference,
    CASE
      WHEN s.cnt = t.cnt THEN 'PASS'
      ELSE 'FAIL'
    END as validation_status
  FROM source_counts s
  JOIN target_counts t ON s.tbl = t.tbl
  ORDER BY table_name;
END;
$$ LANGUAGE plpgsql;

-- Checksum validation (sample records)
CREATE OR REPLACE FUNCTION validate_checksums(sample_size INTEGER DEFAULT 1000) RETURNS TABLE (
  table_name TEXT,
  record_id UUID,
  source_checksum TEXT,
  target_checksum TEXT,
  match BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH sample_records AS (
    SELECT id FROM old_db.agent_instances
    ORDER BY RANDOM() LIMIT sample_size
  )
  SELECT
    'agent_instances'::TEXT,
    s.id,
    md5(old_db.agent_instances::TEXT) as source_checksum,
    md5(new_db.agent_instances::TEXT) as target_checksum,
    md5(old_db.agent_instances::TEXT) = md5(new_db.agent_instances::TEXT) as match
  FROM sample_records s
  JOIN old_db.agent_instances old_rec ON s.id = old_rec.id
  JOIN new_db.agent_instances new_rec ON s.id = new_rec.id;
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Implementation Roadmap

### 11.1 Phase 1: Foundation (Months 1-2)

**Objectives:**
- Establish data architecture principles
- Create platform database
- Implement resource sharing model

**Deliverables:**
- [ ] Platform database provisioned (vital_platform_db)
- [ ] Master data schema designed and implemented
- [ ] Resource lineage tracking implemented
- [ ] Copy-on-write fork functionality implemented
- [ ] Platform → vertical sync mechanism tested
- [ ] Documentation: Data Ownership Guide, Sharing Patterns

**Success Criteria:**
- Platform database operational
- Can create agent definitions in platform DB
- Can fork agents to vertical DBs
- Lineage tracking captures all forks

### 11.2 Phase 2: Vertical Isolation (Months 3-4)

**Objectives:**
- Create separate databases for pharma and digital health verticals
- Implement tenant-specific compliance profiles
- Migrate existing data

**Deliverables:**
- [ ] Pharma vertical database provisioned (vital_pharma_db)
- [ ] Digital health vertical database provisioned (vital_digitalhealth_db)
- [ ] Compliance profiles implemented (HIPAA, 21 CFR Part 11, GDPR)
- [ ] Data classification rules configured
- [ ] Encryption at rest and in transit verified
- [ ] Data migration completed (zero downtime)
- [ ] Documentation: Multi-Tenant Architecture Guide, Compliance Handbook

**Success Criteria:**
- All pharma orgs on separate database
- All digital health orgs on separate database
- Zero cross-tenant data leaks verified
- Compliance audits passed (HIPAA, 21 CFR Part 11)

### 11.3 Phase 3: BYOAI Integration (Months 5-6)

**Objectives:**
- Enable customers to integrate proprietary AI models and data sources
- Implement federated query architecture
- Ensure data quality and security

**Deliverables:**
- [ ] BYOAI integration schema implemented
- [ ] External LLM connector (OpenAI-compatible API)
- [ ] External RAG connector (Elasticsearch, Weaviate, custom API)
- [ ] Data virtualization layer operational
- [ ] Validation rules configured per integration
- [ ] Security controls tested (credential management, network isolation)
- [ ] Documentation: BYOAI Integration Guide, API Reference

**Success Criteria:**
- Can integrate customer's custom LLM
- Can query customer's internal RAG system
- Federated queries complete in <2 seconds
- Data quality validation blocks malformed responses

### 11.4 Phase 4: Analytics Platform (Months 7-8)

**Objectives:**
- Build analytical data plane for historical reporting and cross-tenant benchmarking
- Implement ETL pipelines from OLTP to OLAP

**Deliverables:**
- [ ] Redshift cluster provisioned
- [ ] Dimensional model implemented (star schema)
- [ ] CDC pipeline operational (PostgreSQL → Kafka → Redshift)
- [ ] Anonymization for cross-tenant analytics
- [ ] Real-time dashboards (materialized views)
- [ ] Historical reports (Redshift queries)
- [ ] Documentation: Analytics Architecture Guide, Query Examples

**Success Criteria:**
- CDC lag <30 seconds
- Cross-tenant benchmarks published (k-anonymity >= 100)
- Per-org dashboards operational
- Query performance <5 seconds (p95)

### 11.5 Phase 5: Advanced Features (Months 9-12)

**Objectives:**
- Implement advanced data lifecycle features
- Optimize performance and cost
- Enhance governance

**Deliverables:**
- [ ] Automated data retention enforcement
- [ ] Data archival to S3 Glacier
- [ ] Hot/warm/cold data tiering
- [ ] Predictive analytics foundation (ML pipelines)
- [ ] Data catalog with automated lineage (Apache Atlas)
- [ ] Self-service data access (Superset or Metabase)
- [ ] Cost optimization (query caching, index tuning)
- [ ] Documentation: Data Lifecycle Guide, Cost Optimization Playbook

**Success Criteria:**
- Data retention automated (0 manual intervention)
- Storage costs reduced 40% (via tiering)
- Data catalog adoption >80%
- Query costs reduced 30% (via caching)

---

## Appendix A: Key Decisions Summary

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Hybrid Multi-Tenancy** | Separate DBs per vertical for compliance + shared platform resources | Higher operational complexity vs absolute isolation |
| **Copy-on-Write Forking** | Preserves lineage, enables customization without breaking upstream | Storage overhead vs flexibility |
| **Separate Analytical Plane** | Isolates analytics queries from transactional workload | Data duplication vs performance |
| **Federated BYOAI Queries** | Enables customer proprietary data without ingestion | Latency risk vs data sovereignty |
| **Immutable Audit Logs** | Tamper-evident for 21 CFR Part 11 compliance | Cannot delete vs regulatory compliance |

---

## Appendix B: Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **OLTP Database** | PostgreSQL 15 (Supabase) | ACID guarantees, RLS, JSON support, proven scale |
| **OLAP Database** | Amazon Redshift | Columnar storage, MPP, integrates with AWS ecosystem |
| **Vector Database** | Pinecone | Managed, scalable, best-in-class semantic search |
| **Graph Database** | Neo4j | Lineage tracking, agent relationships, complex queries |
| **Cache** | Redis | Sub-millisecond latency, persistence, pub/sub |
| **Streaming** | Apache Kafka / AWS Kinesis | Durability, replay, at-least-once delivery |
| **ETL Orchestration** | Apache Airflow / AWS Glue | Workflow DAGs, managed ETL, lineage tracking |
| **Data Catalog** | AWS Glue Data Catalog | Schema registry, metadata management, Athena integration |
| **Secrets Management** | AWS Secrets Manager | Encrypted storage, automatic rotation, IAM integration |
| **Encryption** | AWS KMS | FIPS 140-2 validated, org-specific keys, audit logs |

---

## Appendix C: Compliance Checklist

**HIPAA Compliance:**
- [ ] Access controls (RLS)
- [ ] Audit logging (immutable)
- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.3)
- [ ] Backup and recovery (tested)
- [ ] Breach notification procedures
- [ ] Business Associate Agreements (BAAs)

**21 CFR Part 11 Compliance (Pharma):**
- [ ] Electronic signatures
- [ ] Audit trail (tamper-evident)
- [ ] System validation documentation
- [ ] Change control procedures
- [ ] User access reviews (quarterly)
- [ ] Data integrity controls (ALCOA+)

**GDPR Compliance:**
- [ ] Data portability (export API)
- [ ] Right to erasure (deletion workflow)
- [ ] Data processing agreements
- [ ] Data residency (EU region)
- [ ] Consent management
- [ ] Breach notification (72 hours)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Next Review:** 2026-02-26
**Owner:** VP Engineering / CTO
**Contributors:** Data Architecture Team, Platform Orchestrator, Compliance Officer
