# VITAL Platform - Agent Data Architecture

**Version:** 1.0
**Last Updated:** 2025-11-23
**Owner:** VITAL Data Strategist Agent
**Status:** CANONICAL REFERENCE

---

## Executive Summary

This document defines the **canonical data architecture** for the VITAL platform's agent system. It resolves critical schema mismatches between TypeScript types and actual database schema, establishes clear patterns for metadata vs. column storage, and ensures HIPAA compliance and multi-tenant data isolation.

### Critical Discovery

**Problem:** TypeScript types claim `display_name` and `tier` are direct database columns, but they **don't exist** in the actual `agents` table. They're stored in the `metadata` JSONB column.

**Impact:**
- Frontend queries fail with 500 errors when selecting `display_name` or `tier`
- Type safety is broken (types don't match database reality)
- No clear pattern for what belongs in metadata vs. columns

**Solution:** This architecture document defines:
1. ✅ Clear rules for column vs. metadata storage
2. ✅ Canonical agent data model matching actual database
3. ✅ Migration path from incorrect types to correct implementation
4. ✅ Data access patterns with proper JSONB querying
5. ✅ HIPAA-compliant audit and data classification

---

## Table of Contents

1. [Actual Database Schema](#actual-database-schema)
2. [Data Storage Decision Matrix](#data-storage-decision-matrix)
3. [Agent Metadata Schema](#agent-metadata-schema)
4. [Canonical Data Model](#canonical-data-model)
5. [Data Access Patterns](#data-access-patterns)
6. [Migration Strategy](#migration-strategy)
7. [HIPAA Compliance Requirements](#hipaa-compliance-requirements)
8. [Multi-Tenant Data Isolation](#multi-tenant-data-isolation)

---

## 1. Actual Database Schema

### Agents Table (Ground Truth)

```sql
CREATE TABLE agents (
  -- Core Identity
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL,

  -- Display & Description
  tagline             TEXT,
  description         TEXT,
  title               TEXT,

  -- Organization Structure
  role_id             UUID REFERENCES org_roles(id),
  function_id         UUID REFERENCES org_functions(id),
  department_id       UUID REFERENCES org_departments(id),
  persona_id          UUID REFERENCES personas(id),
  agent_level_id      UUID REFERENCES agent_levels(id),

  -- Cached org names (for join-free queries)
  function_name       TEXT,
  department_name     TEXT,
  role_name           TEXT,

  -- Agent Characteristics
  expertise_level     expertise_level DEFAULT 'intermediate',
  years_of_experience INTEGER,
  communication_style TEXT,

  -- Avatar & Branding
  avatar_url          TEXT,
  avatar_description  TEXT,

  -- AI Configuration
  system_prompt       TEXT,
  base_model          TEXT DEFAULT 'gpt-4',
  temperature         NUMERIC(3,2) DEFAULT 0.7,
  max_tokens          INTEGER DEFAULT 4000,

  -- Status & Validation
  status              agent_status NOT NULL DEFAULT 'development',
  validation_status   validation_status DEFAULT 'draft',

  -- Usage Metrics
  usage_count         INTEGER DEFAULT 0,
  average_rating      NUMERIC(3,2),
  total_conversations INTEGER DEFAULT 0,

  -- Flexible Metadata (JSONB)
  metadata            JSONB DEFAULT '{}'::jsonb,

  -- Documentation
  documentation_path  TEXT,
  documentation_url   TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT agents_temperature_check CHECK (temperature >= 0 AND temperature <= 2)
);

-- Indexes
CREATE INDEX idx_agents_tenant ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_status ON agents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_slug ON agents(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_function ON agents(function_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_expertise ON agents(expertise_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_agent_level_id ON agents(agent_level_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_persona ON agents(persona_id);
CREATE INDEX idx_agents_function_name ON agents(function_name);
CREATE INDEX idx_agents_department_name ON agents(department_name);
CREATE INDEX idx_agents_role_name ON agents(role_name);
CREATE INDEX idx_agents_documentation_url ON agents(documentation_url)
  WHERE documentation_url IS NOT NULL;

-- JSONB Indexes (for metadata queries)
CREATE INDEX idx_agents_metadata_display_name ON agents
  ((metadata->>'display_name'));
CREATE INDEX idx_agents_metadata_tier ON agents
  ((metadata->>'tier'));
CREATE INDEX idx_agents_metadata_tags ON agents
  USING GIN ((metadata->'tags'));
```

### Key Observations

**What EXISTS as direct columns:**
- ✅ `name` - Internal identifier (slug-like)
- ✅ `slug` - URL-safe identifier
- ✅ `description` - Agent description
- ✅ `system_prompt` - AI system prompt
- ✅ `base_model` - AI model name
- ✅ `status` - Agent status (development, testing, active)
- ✅ `validation_status` - Validation state
- ✅ `metadata` - JSONB for flexible attributes

**What DOES NOT EXIST as columns (stored in metadata):**
- ❌ `display_name` - Human-readable name (metadata.display_name)
- ❌ `tier` - Agent tier 1-3 (metadata.tier)
- ❌ `tags` - Categorization tags (metadata.tags)
- ❌ `color` - UI color scheme (metadata.color)
- ❌ `model_justification` - Evidence for model choice (metadata.model_justification)
- ❌ `model_citation` - Academic citation (metadata.model_citation)

---

## 2. Data Storage Decision Matrix

### When to Use Direct Columns vs. Metadata

| Criteria | Direct Column | Metadata JSONB |
|----------|---------------|----------------|
| **Queryability** | Frequently filtered/sorted | Rarely queried or flexible schema |
| **Data Type** | Strongly typed (UUID, INT, ENUM) | Semi-structured or varies by agent |
| **Foreign Keys** | References other tables | No referential integrity needed |
| **Index Performance** | High-performance indexes needed | GIN index acceptable |
| **Schema Stability** | Stable, unlikely to change | Experimental, evolving attributes |
| **HIPAA Audit** | Requires column-level audit | General-purpose metadata |
| **Multi-Tenant** | Tenant isolation required | Tenant-agnostic data |

### Column Storage Rules

**ALWAYS use direct columns for:**

1. **Identity & References**
   - Primary keys (`id`)
   - Foreign keys (`tenant_id`, `role_id`, `function_id`)
   - Slugs and unique identifiers (`slug`, `name`)

2. **High-Query Fields**
   - Status fields (`status`, `validation_status`)
   - Filterable attributes (`expertise_level`)
   - Sortable metrics (`usage_count`, `average_rating`)

3. **Regulatory Compliance**
   - HIPAA-auditable fields (all direct columns are audit-logged)
   - Data classification markers
   - Tenant isolation keys

4. **AI Configuration**
   - Core model settings (`base_model`, `temperature`, `max_tokens`)
   - System prompts (`system_prompt`)

5. **Referential Integrity**
   - Any field that references another table
   - Cached denormalized fields for performance (`function_name`)

### Metadata Storage Rules

**Use metadata JSONB for:**

1. **UI/UX Preferences**
   - Display names (`display_name`)
   - Color schemes (`color`)
   - UI positioning (`sort_order`)

2. **Flexible Taxonomies**
   - Tags (`tags[]`)
   - Specializations (`specializations[]`)
   - Custom attributes per agent type

3. **Evidence & Documentation**
   - Model justification (`model_justification`)
   - Citations (`model_citation`)
   - Benchmark scores (`benchmark_scores`)

4. **Experimental Features**
   - A/B test variants
   - Feature flags
   - Beta attributes

5. **Agent-Specific Configuration**
   - Custom tool settings
   - Persona-specific overrides
   - Context-dependent parameters

---

## 3. Agent Metadata Schema

### Canonical Metadata Structure

```typescript
/**
 * Agent Metadata Schema
 * Stored in agents.metadata JSONB column
 *
 * RULES:
 * - All fields are OPTIONAL (graceful degradation)
 * - Use camelCase for JSON (snake_case for DB columns)
 * - Validate at application layer, not DB constraints
 * - Version metadata for backward compatibility
 */
interface AgentMetadata {
  // Version tracking
  schemaVersion?: string;  // e.g., "1.0"

  // Display & Branding (UI-only)
  displayName?: string;     // Human-readable name (fallback: name)
  tier?: number;            // 1=Foundational, 2=Specialist, 3=Ultra-specialist
  color?: string;           // Hex color for UI (#3B82F6)
  icon?: string;            // Icon identifier

  // Categorization & Discovery
  tags?: string[];          // ["clinical", "regulatory", "safety-critical"]
  specializations?: string[]; // Sub-domain expertise
  keywords?: string[];      // Search keywords

  // Model Evidence (REQUIRED for quality agents)
  modelJustification?: string;  // Why this model was chosen
  modelCitation?: string;       // Academic citation
  benchmarkScores?: {
    [benchmark: string]: number;  // e.g., { "MedQA": 86.7, "MMLU": 86.4 }
  };

  // AI Configuration Extensions
  contextWindow?: number;   // Context window size
  costPerQuery?: number;    // Estimated cost per query
  responseFormat?: string;  // Expected response format

  // Safety & Compliance
  evidenceRequired?: boolean;     // Must cite sources
  hallucninationRate?: number;   // Measured hallucination rate
  accuracyScore?: number;         // Overall accuracy (0-100)
  clinicalValidationStatus?: string; // "validated" | "pending" | "not_required"

  // Performance Metrics
  averageLatencyMs?: number;
  averageResponseTime?: number;
  successRate?: number;
  errorRate?: number;

  // Feature Flags
  ragEnabled?: boolean;
  verifyEnabled?: boolean;
  pharmaEnabled?: boolean;

  // Compliance Flags
  hipaaCompliant?: boolean;
  gdprCompliant?: boolean;
  dataClassification?: "public" | "internal" | "confidential" | "restricted";

  // Escalation & Routing
  escalationRules?: {
    confidenceThreshold?: number;
    escalateTo?: string[];  // Agent IDs
    fallbackAgent?: string;
  };

  // Custom Extensions (agent-specific)
  custom?: {
    [key: string]: any;  // Extensibility for agent-specific needs
  };
}
```

### Metadata Validation Schema (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AgentMetadata",
  "type": "object",
  "properties": {
    "schemaVersion": { "type": "string", "pattern": "^\\d+\\.\\d+$" },
    "displayName": { "type": "string", "minLength": 1, "maxLength": 100 },
    "tier": { "type": "integer", "minimum": 1, "maximum": 3 },
    "color": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    },
    "modelJustification": { "type": "string", "minLength": 50 },
    "modelCitation": { "type": "string", "minLength": 10 },
    "benchmarkScores": {
      "type": "object",
      "patternProperties": {
        "^[A-Za-z0-9_-]+$": { "type": "number", "minimum": 0, "maximum": 100 }
      }
    },
    "hipaaCompliant": { "type": "boolean" },
    "dataClassification": {
      "type": "string",
      "enum": ["public", "internal", "confidential", "restricted"]
    }
  },
  "additionalProperties": true
}
```

---

## 4. Canonical Data Model

### TypeScript Types (Correct Implementation)

```typescript
// ===========================
// DATABASE TYPES (Raw)
// ===========================

/**
 * Agent Row - Direct mapping to database schema
 * This is what Supabase returns
 */
export interface AgentRow {
  // Core Identity
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;

  // Display & Description
  tagline: string | null;
  description: string | null;
  title: string | null;

  // Organization Structure
  role_id: string | null;
  function_id: string | null;
  department_id: string | null;
  persona_id: string | null;
  agent_level_id: string | null;

  // Cached org names
  function_name: string | null;
  department_name: string | null;
  role_name: string | null;

  // Agent Characteristics
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  years_of_experience: number | null;
  communication_style: string | null;

  // Avatar & Branding
  avatar_url: string | null;
  avatar_description: string | null;

  // AI Configuration
  system_prompt: string | null;
  base_model: string;
  temperature: number;
  max_tokens: number;

  // Status & Validation
  status: 'development' | 'testing' | 'active' | 'inactive' | 'deprecated';
  validation_status: 'draft' | 'pending' | 'approved' | 'rejected' | null;

  // Usage Metrics
  usage_count: number;
  average_rating: number | null;
  total_conversations: number;

  // Flexible Metadata (JSONB)
  metadata: Json;  // AgentMetadata structure

  // Documentation
  documentation_path: string | null;
  documentation_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ===========================
// APPLICATION TYPES (Derived)
// ===========================

/**
 * Agent - Application-level model with computed fields
 * Use this in your frontend/business logic
 */
export interface Agent extends Omit<AgentRow, 'metadata'> {
  // Parsed metadata
  metadata: AgentMetadata;

  // Computed fields (derived from metadata or columns)
  display_name: string;  // metadata.displayName || name
  tier: number;          // metadata.tier || 1
  tags: string[];        // metadata.tags || []
  color: string;         // metadata.color || defaultColor

  // Evidence fields (from metadata)
  model_justification: string | null;  // metadata.modelJustification
  model_citation: string | null;       // metadata.modelCitation

  // AI config (from metadata, fallback to columns)
  context_window: number;   // metadata.contextWindow || 8000
  cost_per_query: number;   // metadata.costPerQuery || 0

  // Compliance flags (from metadata)
  hipaa_compliant: boolean;           // metadata.hipaaCompliant || false
  rag_enabled: boolean;               // metadata.ragEnabled || false
  data_classification: string | null; // metadata.dataClassification
}

/**
 * Agent with Relations - For detailed views
 */
export interface AgentWithRelations extends Agent {
  categories?: AgentCategory[];
  capabilities?: AgentCapability[];
  performance_metrics?: AgentPerformanceMetrics;
  role?: OrgRole;
  function?: OrgFunction;
  department?: OrgDepartment;
  persona?: Persona;
}

// ===========================
// DATA TRANSFORMATION
// ===========================

/**
 * Transform database row to application model
 * This is where we extract metadata fields
 */
export function transformAgentRow(row: AgentRow): Agent {
  const metadata = parseMetadata(row.metadata);

  return {
    ...row,
    metadata,

    // Computed fields
    display_name: metadata.displayName || row.name,
    tier: metadata.tier || 1,
    tags: metadata.tags || [],
    color: metadata.color || getDefaultColor(row.expertise_level),

    // Evidence fields
    model_justification: metadata.modelJustification || null,
    model_citation: metadata.modelCitation || null,

    // AI config
    context_window: metadata.contextWindow || 8000,
    cost_per_query: metadata.costPerQuery || 0,

    // Compliance
    hipaa_compliant: metadata.hipaaCompliant || false,
    rag_enabled: metadata.ragEnabled || false,
    data_classification: metadata.dataClassification || null,
  };
}

/**
 * Safe metadata parser with validation
 */
function parseMetadata(json: Json): AgentMetadata {
  if (!json || typeof json !== 'object') {
    return {};
  }

  // Runtime validation (optional, use Zod for production)
  const metadata = json as AgentMetadata;

  // Validate tier
  if (metadata.tier !== undefined) {
    if (![1, 2, 3].includes(metadata.tier)) {
      console.warn(`Invalid tier: ${metadata.tier}, defaulting to 1`);
      metadata.tier = 1;
    }
  }

  // Validate color format
  if (metadata.color && !/^#[0-9A-Fa-f]{6}$/.test(metadata.color)) {
    console.warn(`Invalid color: ${metadata.color}, removing`);
    delete metadata.color;
  }

  return metadata;
}
```

---

## 5. Data Access Patterns

### Query Patterns

#### 1. Basic Agent Fetch (No Metadata Filtering)

```typescript
// ✅ CORRECT: Query only direct columns
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('status', 'active')
  .order('name');

// Transform to add computed fields
const agents = data?.map(transformAgentRow) || [];
```

#### 2. Filter by Metadata Fields (JSONB Operators)

```typescript
// ✅ CORRECT: Use JSONB operators for metadata queries
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('status', 'active')
  .gte('metadata->tier', 2)  // Tier 2 or higher
  .order('metadata->displayName');

// Filter by tags (array contains)
const { data: taggedAgents } = await supabase
  .from('agents')
  .select('*')
  .contains('metadata->tags', ['clinical', 'safety-critical']);
```

#### 3. Search by Display Name

```typescript
// ✅ CORRECT: Search using JSONB text search
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .ilike('metadata->displayName', `%${searchTerm}%`);

// Or use the indexed field (faster)
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .textSearch('metadata->displayName', searchTerm);
```

#### 4. Complex Filtering (Multiple Metadata Fields)

```typescript
// Filter by tier, HIPAA compliance, and tags
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('status', 'active')
  .eq('metadata->tier', 3)
  .eq('metadata->hipaaCompliant', true)
  .contains('metadata->tags', ['clinical']);
```

### Update Patterns

#### 1. Update Metadata Field (Partial Update)

```typescript
// ✅ CORRECT: Update specific metadata field
const { data, error } = await supabase
  .from('agents')
  .update({
    metadata: {
      ...agent.metadata,
      displayName: newDisplayName,
      tier: newTier,
    }
  })
  .eq('id', agentId);
```

#### 2. Safe Metadata Merge (Preserve Existing Fields)

```typescript
// ✅ BEST PRACTICE: Fetch-merge-update pattern
const { data: agent } = await supabase
  .from('agents')
  .select('metadata')
  .eq('id', agentId)
  .single();

const updatedMetadata = {
  ...agent.metadata,
  modelJustification: newJustification,
  modelCitation: newCitation,
  benchmarkScores: {
    ...agent.metadata.benchmarkScores,
    MedQA: 86.7,
  },
};

await supabase
  .from('agents')
  .update({ metadata: updatedMetadata })
  .eq('id', agentId);
```

#### 3. Bulk Metadata Update (Add Field to All Agents)

```typescript
// Add evidence_required flag to all Tier-3 agents
const { data: tier3Agents } = await supabase
  .from('agents')
  .select('id, metadata')
  .eq('metadata->tier', 3);

for (const agent of tier3Agents) {
  await supabase
    .from('agents')
    .update({
      metadata: {
        ...agent.metadata,
        evidenceRequired: true,
      }
    })
    .eq('id', agent.id);
}
```

### SQL Functions for Common Operations

```sql
-- Function: Get display name (metadata or fallback)
CREATE OR REPLACE FUNCTION get_agent_display_name(agent agents)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(agent.metadata->>'displayName', agent.name);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get tier (metadata or default)
CREATE OR REPLACE FUNCTION get_agent_tier(agent agents)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((agent.metadata->>'tier')::INTEGER, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check if agent is HIPAA compliant
CREATE OR REPLACE FUNCTION is_agent_hipaa_compliant(agent agents)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((agent.metadata->>'hipaaCompliant')::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Usage in queries:
SELECT
  id,
  get_agent_display_name(agents.*) as display_name,
  get_agent_tier(agents.*) as tier,
  is_agent_hipaa_compliant(agents.*) as hipaa_compliant
FROM agents
WHERE status = 'active'
ORDER BY get_agent_tier(agents.*) DESC, get_agent_display_name(agents.*);
```

### Database Views (Materialized for Performance)

```sql
-- View: Agents with computed metadata fields
CREATE OR REPLACE VIEW v_agents_enriched AS
SELECT
  a.*,
  COALESCE(a.metadata->>'displayName', a.name) as display_name,
  COALESCE((a.metadata->>'tier')::INTEGER, 1) as tier,
  COALESCE((a.metadata->'tags')::JSONB, '[]'::JSONB) as tags,
  COALESCE(a.metadata->>'color', '#3B82F6') as color,
  COALESCE((a.metadata->>'hipaaCompliant')::BOOLEAN, FALSE) as hipaa_compliant,
  COALESCE((a.metadata->>'ragEnabled')::BOOLEAN, FALSE) as rag_enabled
FROM agents a
WHERE a.deleted_at IS NULL;

-- Usage:
SELECT * FROM v_agents_enriched
WHERE tier >= 2 AND hipaa_compliant = TRUE;
```

---

## 6. Migration Strategy

### Phase 1: Type Correction (Immediate)

**Objective:** Fix TypeScript types to match actual database schema

**Actions:**

1. **Update database.types.ts**
   ```typescript
   // OLD (INCORRECT):
   export interface Agent {
     display_name: string;  // ❌ Not a DB column
     tier: number;          // ❌ Not a DB column
   }

   // NEW (CORRECT):
   export interface AgentRow {
     metadata: Json;  // ✅ Contains display_name, tier, etc.
   }

   export interface Agent extends AgentRow {
     // Computed fields
     display_name: string;  // Derived from metadata
     tier: number;          // Derived from metadata
   }
   ```

2. **Update agent-service.ts**
   - Add `transformAgentRow()` function
   - Apply transformation to all API responses
   - Remove direct column queries for metadata fields

3. **Update API routes**
   - Ensure all `/api/agents/*` routes return transformed data
   - Add proper JSONB queries for filtering
   - Test with actual database

**Validation:**
```bash
# Test queries don't reference non-existent columns
psql $DATABASE_URL -c "SELECT display_name FROM agents LIMIT 1;"
# Should fail: column "display_name" does not exist

psql $DATABASE_URL -c "SELECT metadata->>'displayName' FROM agents LIMIT 1;"
# Should succeed
```

### Phase 2: Metadata Migration (Week 1)

**Objective:** Ensure all agents have proper metadata structure

**Actions:**

1. **Audit existing metadata**
   ```sql
   -- Check metadata consistency
   SELECT
     id,
     name,
     jsonb_typeof(metadata) as metadata_type,
     metadata ? 'displayName' as has_display_name,
     metadata ? 'tier' as has_tier
   FROM agents
   WHERE deleted_at IS NULL;
   ```

2. **Backfill missing metadata**
   ```sql
   -- Add missing display_name
   UPDATE agents
   SET metadata = metadata || jsonb_build_object('displayName', name)
   WHERE metadata->>'displayName' IS NULL
     AND deleted_at IS NULL;

   -- Add default tier based on expertise_level
   UPDATE agents
   SET metadata = metadata || jsonb_build_object('tier',
     CASE
       WHEN expertise_level = 'expert' THEN 3
       WHEN expertise_level = 'advanced' THEN 2
       ELSE 1
     END
   )
   WHERE metadata->>'tier' IS NULL
     AND deleted_at IS NULL;
   ```

3. **Validate metadata schema**
   ```typescript
   // Run validation script
   const agents = await supabase.from('agents').select('*');

   for (const agent of agents.data) {
     const validation = validateAgentMetadata(agent.metadata);
     if (!validation.valid) {
       console.error(`Agent ${agent.id} has invalid metadata:`, validation.errors);
     }
   }
   ```

### Phase 3: Index Optimization (Week 2)

**Objective:** Optimize JSONB queries with proper indexes

**Actions:**

1. **Create JSONB indexes**
   ```sql
   -- Expression indexes for common metadata queries
   CREATE INDEX CONCURRENTLY idx_agents_metadata_display_name
     ON agents ((metadata->>'displayName'));

   CREATE INDEX CONCURRENTLY idx_agents_metadata_tier
     ON agents (((metadata->>'tier')::INTEGER));

   -- GIN index for tags array
   CREATE INDEX CONCURRENTLY idx_agents_metadata_tags
     ON agents USING GIN ((metadata->'tags'));

   -- Full-text search on display_name
   CREATE INDEX CONCURRENTLY idx_agents_metadata_display_name_fts
     ON agents USING GIN (to_tsvector('english', metadata->>'displayName'));
   ```

2. **Test query performance**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM agents
   WHERE metadata->>'tier' = '3'
     AND metadata @> '{"hipaaCompliant": true}';
   ```

3. **Monitor index usage**
   ```sql
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE tablename = 'agents'
   ORDER BY idx_scan DESC;
   ```

### Phase 4: Cleanup (Week 3)

**Objective:** Remove legacy code and document new patterns

**Actions:**

1. **Remove incorrect type definitions**
2. **Update all API routes to use correct types**
3. **Add JSDoc comments with examples**
4. **Create developer guide for agent queries**
5. **Run regression tests**

---

## 7. HIPAA Compliance Requirements

### Audit Trail for Agent Data

**All agent modifications must be audited:**

```sql
-- Agent audit log table
CREATE TABLE agent_audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id        UUID NOT NULL REFERENCES agents(id),
  action          TEXT NOT NULL,  -- 'created', 'updated', 'deleted'
  changed_by      UUID REFERENCES auth.users(id),
  changed_at      TIMESTAMPTZ DEFAULT NOW(),
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT
);

-- Trigger to log all agent changes
CREATE OR REPLACE FUNCTION log_agent_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO agent_audit_log (agent_id, action, new_values, changed_by)
    VALUES (NEW.id, 'created', row_to_json(NEW)::JSONB, auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO agent_audit_log (agent_id, action, old_values, new_values, changed_by)
    VALUES (NEW.id, 'updated', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO agent_audit_log (agent_id, action, old_values, changed_by)
    VALUES (OLD.id, 'deleted', row_to_json(OLD)::JSONB, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_agent_audit
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH ROW EXECUTE FUNCTION log_agent_changes();
```

### Data Classification in Metadata

**Agents handling PHI must declare data classification:**

```typescript
const clinicalAgent: Agent = {
  // ... other fields
  metadata: {
    dataClassification: 'restricted',  // PHI data
    hipaaCompliant: true,
    auditTrailEnabled: true,
    encryptionRequired: true,
  }
};
```

**Validation rule:**
```sql
-- Ensure HIPAA-compliant agents have proper classification
ALTER TABLE agents ADD CONSTRAINT check_hipaa_classification
  CHECK (
    (metadata->>'hipaaCompliant')::BOOLEAN IS NOT TRUE
    OR metadata->>'dataClassification' IN ('confidential', 'restricted')
  );
```

---

## 8. Multi-Tenant Data Isolation

### Row-Level Security (RLS)

**All agent queries must be tenant-aware:**

```sql
-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see agents in their tenant
CREATE POLICY tenant_isolation_agents ON agents
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = auth.uid()
    )
    OR tenant_id IS NULL  -- Platform-level agents (superadmin only)
  );

-- Policy: Only tenant admins can modify agents
CREATE POLICY tenant_admin_modify_agents ON agents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
        AND tenant_id = agents.tenant_id
        AND role IN ('admin', 'owner')
    )
  );

-- Policy: Superadmins bypass tenant isolation
CREATE POLICY superadmin_all_access ON agents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'superadmin'
    )
  );
```

### Tenant-Aware Queries

**Always filter by tenant_id:**

```typescript
// ✅ CORRECT: Tenant-aware query (RLS enforced)
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('tenant_id', currentTenantId)
  .eq('status', 'active');

// ❌ INCORRECT: Missing tenant filter (relies only on RLS)
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('status', 'active');
// This works but is less explicit
```

### Platform vs. Tenant Agents

**Platform agents (tenant_id = NULL) vs. Tenant-specific agents:**

```sql
-- Platform agents (available to all tenants)
SELECT * FROM agents WHERE tenant_id IS NULL;

-- Tenant-specific agents
SELECT * FROM agents WHERE tenant_id = 'tenant-uuid';

-- All agents accessible to a tenant (platform + tenant-specific)
SELECT * FROM agents
WHERE tenant_id IS NULL
   OR tenant_id = 'tenant-uuid';
```

---

## Summary & Best Practices

### DO ✅

1. **Use `metadata` JSONB for:**
   - Display names, tiers, tags
   - UI preferences and colors
   - Model evidence and citations
   - Experimental features

2. **Use direct columns for:**
   - Foreign keys and references
   - High-query fields (status, expertise_level)
   - HIPAA-auditable data
   - AI core config (base_model, temperature)

3. **Always transform data:**
   - Use `transformAgentRow()` to add computed fields
   - Parse metadata safely with validation
   - Handle missing metadata gracefully

4. **Query metadata properly:**
   - Use JSONB operators (`->`, `->>`, `@>`, `?`)
   - Create expression indexes for common queries
   - Use views for frequently accessed computed fields

5. **Maintain HIPAA compliance:**
   - Audit all agent modifications
   - Classify data in metadata
   - Enforce RLS for tenant isolation

### DON'T ❌

1. **Don't query non-existent columns:**
   - ❌ `SELECT display_name FROM agents`
   - ✅ `SELECT metadata->>'displayName' FROM agents`

2. **Don't bypass tenant isolation:**
   - Always filter by `tenant_id`
   - Don't disable RLS

3. **Don't skip metadata validation:**
   - Validate structure at application layer
   - Use JSON Schema or Zod

4. **Don't mix metadata and columns:**
   - Keep tier in metadata (not a column)
   - Keep base_model as column (not metadata)

5. **Don't overuse JSONB:**
   - Use columns for frequently queried data
   - Reserve JSONB for flexible schemas

---

## Next Steps

1. ✅ **Immediate:** Update TypeScript types to match database
2. ✅ **Week 1:** Migrate existing agents to proper metadata structure
3. ✅ **Week 2:** Create JSONB indexes for performance
4. ✅ **Week 3:** Document patterns and train team
5. ✅ **Ongoing:** Monitor query performance and adjust indexes

---

**Document Version:** 1.0
**Last Review:** 2025-11-23
**Next Review:** 2025-12-23
**Owner:** VITAL Data Strategist Agent
**Approvers:** Platform Orchestrator, Frontend UI Architect, Database Architect
