# Schema Normalization Migration Plan

**Date**: 2025-11-17
**Purpose**: Migrate personas schema from hybrid JSONB/TEXT[] to fully normalized schema
**Priority**: High
**Effort**: Medium (2-3 days)
**Risk**: Low (with proper backup and testing)

---

## 🎯 Objective

Transform the `personas` table and related data from a **hybrid schema** (mixing JSONB, TEXT[], and scalar columns) to a **fully normalized schema** compliant with our Database Golden Rules.

**Golden Rule #1**: ZERO JSONB columns for structured data

---

## 📊 Current State (Hybrid Schema)

### Current personas Table Structure

```sql
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,

    -- Foreign keys (GOOD ✅)
    role_id UUID REFERENCES org_roles(id),
    function_id UUID REFERENCES org_functions(id),
    department_id UUID REFERENCES org_departments(id),

    -- Scalar attributes (GOOD ✅)
    seniority_level TEXT,
    years_of_experience INTEGER,
    typical_organization_size TEXT,

    -- HYBRID ISSUE: TEXT[] with structured data
    key_responsibilities TEXT[],  -- ⚠️ Was JSONB with metadata, now TEXT[]
    preferred_tools TEXT[],       -- ✅ OK: Simple strings
    tags TEXT[],                  -- ✅ OK: Simple strings

    -- VIOLATES GOLDEN RULE: JSONB for structured data
    pain_points JSONB,            -- ❌ Should be persona_pain_points table
    goals JSONB,                  -- ❌ Should be persona_goals table
    challenges JSONB,             -- ❌ Should be persona_challenges table
    communication_preferences JSONB,  -- ❌ Should be persona_communication_prefs table
    metadata JSONB,               -- ⚠️ Catch-all (should be normalized)

    -- Audit fields (GOOD ✅)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### What's Wrong?

1. **JSONB columns storing structured data** (pain_points, goals, challenges, communication_preferences)
2. **Metadata JSONB** contains structured fields that should be columns or separate tables
3. **Lost metadata** - key_responsibilities had time_allocation data, now lost in TEXT[]

---

## 🎯 Target State (Fully Normalized)

### New personas Table (Lean)

```sql
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    tagline TEXT,

    -- Foreign keys to lookup tables
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

    -- Scalar attributes only
    seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid', 'senior', 'executive')),
    years_of_experience INTEGER CHECK (years_of_experience >= 0 AND years_of_experience <= 60),
    typical_organization_size TEXT CHECK (typical_organization_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    decision_making_style TEXT,

    -- Simple TEXT[] for tags only (no metadata)
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Audit fields
    is_active BOOLEAN DEFAULT true NOT NULL,
    validation_status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    UNIQUE(tenant_id, slug)
);
```

### New Normalized Tables

#### 1. persona_responsibilities
```sql
CREATE TABLE persona_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    responsibility TEXT NOT NULL,
    time_allocation_percent INTEGER CHECK (time_allocation_percent >= 0 AND time_allocation_percent <= 100),
    priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_responsibility UNIQUE(persona_id, responsibility)
);

CREATE INDEX idx_responsibilities_persona ON persona_responsibilities(persona_id);
CREATE INDEX idx_responsibilities_priority ON persona_responsibilities(priority_level) WHERE priority_level IN ('high', 'critical');

ALTER TABLE persona_responsibilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_responsibilities ON persona_responsibilities
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 2. persona_pain_points
```sql
CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    pain_point TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'rarely')),
    impact_description TEXT,
    root_cause TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_pain UNIQUE(persona_id, pain_point)
);

CREATE INDEX idx_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX idx_pain_points_severity ON persona_pain_points(severity) WHERE severity IN ('high', 'critical');

ALTER TABLE persona_pain_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_pain_points ON persona_pain_points
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 3. persona_goals
```sql
CREATE TABLE persona_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    goal TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    timeframe TEXT CHECK (timeframe IN ('immediate', '3_months', '6_months', '12_months', '18_months', '24_months', 'ongoing')),
    success_criteria TEXT,
    progress_status TEXT CHECK (progress_status IN ('not_started', 'in_progress', 'blocked', 'completed')),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_goal UNIQUE(persona_id, goal)
);

CREATE INDEX idx_goals_persona ON persona_goals(persona_id);
CREATE INDEX idx_goals_priority ON persona_goals(priority) WHERE priority IN ('high', 'critical');
CREATE INDEX idx_goals_status ON persona_goals(progress_status);

ALTER TABLE persona_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_goals ON persona_goals
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 4. persona_challenges
```sql
CREATE TABLE persona_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    challenge TEXT NOT NULL,
    impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    category TEXT CHECK (category IN ('technical', 'organizational', 'resource', 'external', 'other')),
    mitigation_strategy TEXT,
    is_addressed BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_challenge UNIQUE(persona_id, challenge)
);

CREATE INDEX idx_challenges_persona ON persona_challenges(persona_id);
CREATE INDEX idx_challenges_impact ON persona_challenges(impact_level) WHERE impact_level IN ('high', 'critical');
CREATE INDEX idx_challenges_addressed ON persona_challenges(is_addressed) WHERE is_addressed = false;

ALTER TABLE persona_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_challenges ON persona_challenges
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 5. persona_tools (was preferred_tools TEXT[])
```sql
CREATE TABLE persona_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    tool_name TEXT NOT NULL,
    tool_category TEXT CHECK (tool_category IN ('software', 'platform', 'framework', 'service', 'hardware', 'other')),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
    is_preferred BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_tool UNIQUE(persona_id, tool_name)
);

CREATE INDEX idx_tools_persona ON persona_tools(persona_id);
CREATE INDEX idx_tools_preferred ON persona_tools(is_preferred) WHERE is_preferred = true;

ALTER TABLE persona_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tools ON persona_tools
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 6. persona_communication_preferences
```sql
CREATE TABLE persona_communication_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    channel_type TEXT NOT NULL CHECK (channel_type IN ('email', 'slack', 'teams', 'phone', 'video_call', 'in_person', 'other')),
    preference_level TEXT CHECK (preference_level IN ('avoid', 'acceptable', 'preferred', 'required')),
    response_time_expectation TEXT,
    best_time_of_day TEXT CHECK (best_time_of_day IN ('morning', 'midday', 'afternoon', 'evening', 'flexible')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_channel UNIQUE(persona_id, channel_type)
);

CREATE INDEX idx_comm_prefs_persona ON persona_communication_preferences(persona_id);
CREATE INDEX idx_comm_prefs_level ON persona_communication_preferences(preference_level) WHERE preference_level = 'preferred';

ALTER TABLE persona_communication_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_comm_prefs ON persona_communication_preferences
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 7. persona_attributes (for metadata JSONB fields)
```sql
-- For any additional attributes that don't fit above
CREATE TABLE persona_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    attribute_key TEXT NOT NULL,
    attribute_value TEXT,
    attribute_type TEXT CHECK (attribute_type IN ('string', 'number', 'boolean', 'date')),
    category TEXT, -- 'demographic', 'psychographic', 'behavioral', etc.

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_persona_attribute UNIQUE(persona_id, attribute_key)
);

CREATE INDEX idx_attributes_persona ON persona_attributes(persona_id);
CREATE INDEX idx_attributes_key ON persona_attributes(attribute_key);
CREATE INDEX idx_attributes_category ON persona_attributes(category);

ALTER TABLE persona_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_attributes ON persona_attributes
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

## 🔄 Migration Steps

### Phase 1: Create New Tables (Non-Destructive)
**Duration**: 30 minutes
**Risk**: Low

```sql
-- Execute: 01_create_normalized_persona_tables.sql
-- Creates all new tables alongside existing personas table
-- No data modification yet
```

### Phase 2: Data Migration (Read-Only on personas)
**Duration**: 1-2 hours
**Risk**: Low

```sql
-- Execute: 02_migrate_jsonb_to_normalized_tables.sql

BEGIN;

-- Migrate pain_points JSONB → persona_pain_points table
INSERT INTO persona_pain_points (persona_id, tenant_id, pain_point, severity, frequency)
SELECT
    p.id,
    p.tenant_id,
    pp->>'pain_point',
    pp->>'severity',
    pp->>'frequency'
FROM personas p
CROSS JOIN LATERAL jsonb_array_elements(p.pain_points) AS pp
WHERE p.pain_points IS NOT NULL
  AND jsonb_array_length(p.pain_points) > 0;

-- Migrate goals JSONB → persona_goals table
INSERT INTO persona_goals (persona_id, tenant_id, goal, priority, timeframe)
SELECT
    p.id,
    p.tenant_id,
    g->>'goal',
    g->>'priority',
    g->>'timeframe'
FROM personas p
CROSS JOIN LATERAL jsonb_array_elements(p.goals) AS g
WHERE p.goals IS NOT NULL
  AND jsonb_array_length(p.goals) > 0;

-- Migrate challenges JSONB → persona_challenges table
INSERT INTO persona_challenges (persona_id, tenant_id, challenge, impact_level)
SELECT
    p.id,
    p.tenant_id,
    c->>'challenge',
    c->>'impact_level'
FROM personas p
CROSS JOIN LATERAL jsonb_array_elements(p.challenges) AS c
WHERE p.challenges IS NOT NULL
  AND jsonb_array_length(p.challenges) > 0;

-- Migrate key_responsibilities TEXT[] → persona_responsibilities table
INSERT INTO persona_responsibilities (persona_id, tenant_id, responsibility, sequence_order)
SELECT
    p.id,
    p.tenant_id,
    unnest(p.key_responsibilities),
    generate_series(1, array_length(p.key_responsibilities, 1))
FROM personas p
WHERE p.key_responsibilities IS NOT NULL
  AND array_length(p.key_responsibilities, 1) > 0;

-- Migrate preferred_tools TEXT[] → persona_tools table
INSERT INTO persona_tools (persona_id, tenant_id, tool_name, is_preferred)
SELECT
    p.id,
    p.tenant_id,
    unnest(p.preferred_tools),
    true
FROM personas p
WHERE p.preferred_tools IS NOT NULL
  AND array_length(p.preferred_tools, 1) > 0;

-- Migrate communication_preferences JSONB → persona_communication_preferences
INSERT INTO persona_communication_preferences (persona_id, tenant_id, channel_type, preference_level)
SELECT
    p.id,
    p.tenant_id,
    cp.key,
    cp.value
FROM personas p
CROSS JOIN LATERAL jsonb_each_text(p.communication_preferences) AS cp
WHERE p.communication_preferences IS NOT NULL
  AND jsonb_typeof(p.communication_preferences) = 'object';

-- Migrate metadata JSONB → persona_attributes (for non-standard fields)
INSERT INTO persona_attributes (persona_id, tenant_id, attribute_key, attribute_value)
SELECT
    p.id,
    p.tenant_id,
    m.key,
    m.value
FROM personas p
CROSS JOIN LATERAL jsonb_each_text(p.metadata) AS m
WHERE p.metadata IS NOT NULL
  AND jsonb_typeof(p.metadata) = 'object';

-- Validation: Check row counts
DO $$
DECLARE
    v_pain_count INTEGER;
    v_goal_count INTEGER;
    v_challenge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_pain_count FROM persona_pain_points;
    SELECT COUNT(*) INTO v_goal_count FROM persona_goals;
    SELECT COUNT(*) INTO v_challenge_count FROM persona_challenges;

    RAISE NOTICE 'Migrated % pain points', v_pain_count;
    RAISE NOTICE 'Migrated % goals', v_goal_count;
    RAISE NOTICE 'Migrated % challenges', v_challenge_count;

    IF v_pain_count = 0 THEN
        RAISE WARNING 'No pain points migrated - check source data';
    END IF;
END $$;

COMMIT;
```

### Phase 3: Validation (Verify Data Integrity)
**Duration**: 30 minutes
**Risk**: None (read-only)

```sql
-- Execute: 03_validate_migration.sql

-- Verify all personas have related records
SELECT
    p.id,
    p.name,
    COUNT(DISTINCT pp.id) as pain_count,
    COUNT(DISTINCT g.id) as goal_count,
    COUNT(DISTINCT c.id) as challenge_count,
    COUNT(DISTINCT r.id) as responsibility_count
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_goals g ON g.persona_id = p.id
LEFT JOIN persona_challenges c ON c.persona_id = p.id
LEFT JOIN persona_responsibilities r ON r.persona_id = p.id
GROUP BY p.id, p.name
ORDER BY p.name;

-- Check for orphaned records (should be 0)
SELECT COUNT(*) as orphaned_pain_points
FROM persona_pain_points pp
WHERE NOT EXISTS (SELECT 1 FROM personas p WHERE p.id = pp.persona_id);

-- Verify foreign key integrity
SELECT
    'persona_pain_points' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT persona_id) as unique_personas
FROM persona_pain_points
UNION ALL
SELECT
    'persona_goals',
    COUNT(*),
    COUNT(DISTINCT persona_id)
FROM persona_goals
UNION ALL
SELECT
    'persona_challenges',
    COUNT(*),
    COUNT(DISTINCT persona_id)
FROM persona_challenges;
```

### Phase 4: Update Application Code (Parallel Work)
**Duration**: 1-2 days
**Risk**: Medium

**Tasks**:
1. Update API queries to JOIN normalized tables instead of accessing JSONB
2. Update create/update endpoints to insert into normalized tables
3. Update GraphQL schema to reflect new structure
4. Update frontend components to consume new API structure
5. Write integration tests for new data model

**Example Query Change**:
```sql
-- OLD (JSONB access)
SELECT
    id,
    name,
    pain_points,
    goals
FROM personas
WHERE id = $1;

-- NEW (JOINs)
SELECT
    p.id,
    p.name,
    json_agg(DISTINCT jsonb_build_object(
        'id', pp.id,
        'pain_point', pp.pain_point,
        'severity', pp.severity,
        'frequency', pp.frequency
    )) as pain_points,
    json_agg(DISTINCT jsonb_build_object(
        'id', g.id,
        'goal', g.goal,
        'priority', g.priority,
        'timeframe', g.timeframe
    )) as goals
FROM personas p
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
LEFT JOIN persona_goals g ON g.persona_id = p.id
WHERE p.id = $1
GROUP BY p.id, p.name;
```

### Phase 5: Drop Old Columns (Final Cleanup)
**Duration**: 15 minutes
**Risk**: High (Destructive - requires backup)

```sql
-- Execute: 04_drop_jsonb_columns.sql
-- ⚠️ ONLY after application code is updated and tested!

BEGIN;

-- Create backup table first
CREATE TABLE personas_backup_20251117 AS SELECT * FROM personas;

-- Drop JSONB columns
ALTER TABLE personas DROP COLUMN key_responsibilities;
ALTER TABLE personas DROP COLUMN pain_points;
ALTER TABLE personas DROP COLUMN goals;
ALTER TABLE personas DROP COLUMN challenges;
ALTER TABLE personas DROP COLUMN preferred_tools;
ALTER TABLE personas DROP COLUMN communication_preferences;
ALTER TABLE personas DROP COLUMN metadata;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'personas'
ORDER BY ordinal_position;

COMMIT;
```

---

## 📋 Rollback Plan

If migration fails at any phase:

### Phase 1-2 Rollback
```sql
-- Simply drop new tables (no data loss)
DROP TABLE IF EXISTS persona_responsibilities CASCADE;
DROP TABLE IF EXISTS persona_pain_points CASCADE;
DROP TABLE IF EXISTS persona_goals CASCADE;
DROP TABLE IF EXISTS persona_challenges CASCADE;
DROP TABLE IF EXISTS persona_tools CASCADE;
DROP TABLE IF EXISTS persona_communication_preferences CASCADE;
DROP TABLE IF EXISTS persona_attributes CASCADE;
```

### Phase 5 Rollback
```sql
-- Restore from backup
DROP TABLE personas;
ALTER TABLE personas_backup_20251117 RENAME TO personas;
```

---

## ✅ Success Criteria

- [ ] All JSONB columns removed from personas table
- [ ] All structured data in normalized tables
- [ ] Zero data loss during migration
- [ ] All foreign key constraints valid
- [ ] RLS policies functioning correctly
- [ ] Application queries working with new schema
- [ ] Performance equal or better than before
- [ ] Backup created and verified

---

## 📊 Benefits After Migration

1. **Data Integrity**: Foreign key constraints prevent invalid data
2. **Query Performance**: Indexed joins faster than JSONB path queries
3. **Schema Evolution**: Add columns with ALTER TABLE instead of data migration
4. **Type Safety**: Database enforces data types and constraints
5. **Reporting**: Easier to write complex analytical queries
6. **Maintainability**: Clear schema = easier for developers to understand

---

## 🎯 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Create Tables | 30 min | Pending |
| 2. Migrate Data | 1-2 hours | Pending |
| 3. Validate | 30 min | Pending |
| 4. Update Code | 1-2 days | Pending |
| 5. Cleanup | 15 min | Pending |
| **Total** | **2-3 days** | Pending |

---

## 📞 Next Steps

1. **Immediate**: Deploy current SQL to get personas into database (with hybrid schema)
2. **Week 1**: Execute Phases 1-3 (create tables, migrate data, validate)
3. **Week 2**: Update application code to use normalized tables
4. **Week 3**: Drop old JSONB columns and complete migration

---

**Created**: 2025-11-17
**Status**: Planning
**Priority**: High
**Assigned**: sql-supabase-specialist + data-architecture-expert
