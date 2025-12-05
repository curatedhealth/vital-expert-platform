-- ============================================================================
-- VALUE DRIVERS SCHEMA
-- Pharmaceutical Value Driver Tree Integration
-- Location: .claude/docs/platform/enterprise_ontology/sql/
-- ============================================================================

-- ============================================================================
-- SECTION 1: VALUE DRIVER HIERARCHY
-- ============================================================================

-- Main Value Drivers Table (Hierarchical Tree)
-- Step 1: Create table without self-referential FK
CREATE TABLE IF NOT EXISTS value_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,               -- 'VD-REV-001', 'VD-CST-010', 'VD-RSK-070', etc.
    name TEXT NOT NULL,                       -- 'Sustainable Business', 'Revenue Growth', etc.
    description TEXT,
    parent_id UUID,                           -- Self-reference added below
    level INTEGER NOT NULL,                   -- 0, 1, 2, 3, 4, 5
    driver_type TEXT NOT NULL DEFAULT 'lever', -- 'outcome', 'lever', 'tactic', 'enabler'
    value_category TEXT,                      -- 'revenue', 'cost', 'risk'
    unit TEXT,                                -- '$M/y', '%', '#'
    is_quantifiable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    tenant_id UUID,                           -- FK added below if tenants table exists
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT value_drivers_level_check CHECK (level BETWEEN 0 AND 6),
    CONSTRAINT value_drivers_type_check CHECK (driver_type IN ('outcome', 'lever', 'tactic', 'enabler'))
);

-- ============================================================================
-- Step 2: ENSURE ALL COLUMNS EXIST (for tables created in prior failed runs)
-- CREATE TABLE IF NOT EXISTS does NOT add missing columns to existing tables
-- ============================================================================

DO $$
BEGIN
    -- parent_id (for self-reference)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN parent_id UUID;
    END IF;

    -- level
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'level'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN level INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- driver_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'driver_type'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN driver_type TEXT NOT NULL DEFAULT 'lever';
    END IF;

    -- value_category
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'value_category'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN value_category TEXT;
    END IF;

    -- unit
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'unit'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN unit TEXT;
    END IF;

    -- is_quantifiable
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'is_quantifiable'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN is_quantifiable BOOLEAN DEFAULT true;
    END IF;

    -- is_active
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- display_order
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN display_order INTEGER;
    END IF;

    -- tenant_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN tenant_id UUID;
    END IF;

    -- metadata
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'description'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN description TEXT;
    END IF;

    -- created_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'value_drivers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE value_drivers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END$$;

-- ============================================================================
-- Step 3: ADD CONSTRAINTS (only if not already present)
-- ============================================================================

-- Add level check constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'value_drivers_level_check'
        AND table_name = 'value_drivers'
    ) THEN
        ALTER TABLE value_drivers ADD CONSTRAINT value_drivers_level_check CHECK (level BETWEEN 0 AND 6);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Constraint may already exist or have issues
    NULL;
END$$;

-- Add driver_type check constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'value_drivers_type_check'
        AND table_name = 'value_drivers'
    ) THEN
        ALTER TABLE value_drivers ADD CONSTRAINT value_drivers_type_check CHECK (driver_type IN ('outcome', 'lever', 'tactic', 'enabler'));
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END$$;

-- ============================================================================
-- Step 4: ADD FOREIGN KEYS
-- ============================================================================

-- Add self-referential FK (after column exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'value_drivers_parent_id_fkey'
        AND table_name = 'value_drivers'
    ) THEN
        ALTER TABLE value_drivers
        ADD CONSTRAINT value_drivers_parent_id_fkey
        FOREIGN KEY (parent_id) REFERENCES value_drivers(id);
    END IF;
END$$;

-- Step 5: Add tenant FK if tenants table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'value_drivers_tenant_id_fkey'
            AND table_name = 'value_drivers'
        ) THEN
            ALTER TABLE value_drivers
            ADD CONSTRAINT value_drivers_tenant_id_fkey
            FOREIGN KEY (tenant_id) REFERENCES tenants(id);
        END IF;
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_value_drivers_parent ON value_drivers(parent_id);
CREATE INDEX IF NOT EXISTS idx_value_drivers_code ON value_drivers(code);
CREATE INDEX IF NOT EXISTS idx_value_drivers_category ON value_drivers(value_category);
CREATE INDEX IF NOT EXISTS idx_value_drivers_level ON value_drivers(level);

-- ============================================================================
-- SECTION 2: VALUE DRIVER TACTICS (Leaf-Level Actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_driver_tactics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value_driver_id UUID NOT NULL REFERENCES value_drivers(id) ON DELETE CASCADE,
    code TEXT NOT NULL,                       -- 'VD-TAC-REV-111-01', etc.
    name TEXT NOT NULL,
    description TEXT,
    tactic_type TEXT,                         -- 'data_analytics', 'digital_platform', 'ai_automation'
    ai_enablement_potential TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    implementation_complexity TEXT DEFAULT 'medium',
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT value_driver_tactics_unique UNIQUE (value_driver_id, code),
    CONSTRAINT ai_potential_check CHECK (ai_enablement_potential IN ('high', 'medium', 'low')),
    CONSTRAINT complexity_check CHECK (implementation_complexity IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS idx_value_driver_tactics_driver ON value_driver_tactics(value_driver_id);

-- ============================================================================
-- SECTION 3: JTBD ↔ VALUE DRIVER MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_value_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL,                   -- FK added conditionally below
    value_driver_id UUID NOT NULL,           -- FK added below

    -- Contribution Metrics
    contribution_type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'indirect', 'enabling'
    impact_score NUMERIC(3,1),               -- 1-10 scale
    confidence_level TEXT DEFAULT 'medium',  -- 'high', 'medium', 'low'

    -- Value Quantification
    estimated_value_pct NUMERIC(5,2),        -- % contribution to driver
    estimated_value_amount NUMERIC(12,2),    -- $ amount if known
    value_unit TEXT DEFAULT '$K',            -- '$M', '$K', 'hours', 'FTE'

    -- Evidence & Audit
    evidence_source TEXT,
    evidence_date DATE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT jtbd_value_drivers_unique UNIQUE (jtbd_id, value_driver_id),
    CONSTRAINT contribution_type_check CHECK (contribution_type IN ('direct', 'indirect', 'enabling')),
    CONSTRAINT confidence_level_check CHECK (confidence_level IN ('high', 'medium', 'low'))
);

-- CLEANUP: Remove orphaned jtbd references before adding FK
-- This handles cases where jtbd_value_drivers has invalid jtbd_id references
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        -- Delete rows referencing non-existent JTBDs
        DELETE FROM jtbd_value_drivers
        WHERE jtbd_id NOT IN (SELECT id FROM jtbd);
        RAISE NOTICE 'Cleaned up orphaned jtbd_value_drivers references';
    ELSE
        -- If jtbd table doesn't exist, clear all rows (can't have valid references)
        DELETE FROM jtbd_value_drivers;
        RAISE NOTICE 'Cleared jtbd_value_drivers (jtbd table does not exist)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Table might not exist yet
    NULL;
END$$;

-- CLEANUP: Remove orphaned value_driver references (handle both column names)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'value_driver_id') THEN
        DELETE FROM jtbd_value_drivers
        WHERE value_driver_id NOT IN (SELECT id FROM value_drivers);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'driver_id') THEN
        DELETE FROM jtbd_value_drivers
        WHERE driver_id NOT IN (SELECT id FROM value_drivers);
    END IF;
    RAISE NOTICE 'Cleaned up orphaned value_driver references';
EXCEPTION WHEN OTHERS THEN
    NULL;
END$$;

-- Add FK to jtbd if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jtbd_value_drivers_jtbd_id_fkey') THEN
            ALTER TABLE jtbd_value_drivers ADD CONSTRAINT jtbd_value_drivers_jtbd_id_fkey FOREIGN KEY (jtbd_id) REFERENCES jtbd(id) ON DELETE CASCADE;
        END IF;
    END IF;
END$$;

-- Add FK to value_drivers (note: existing table uses 'driver_id' not 'value_driver_id')
DO $$
BEGIN
    -- First check if value_driver_id column exists, if not use driver_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jtbd_value_drivers' AND column_name = 'value_driver_id'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jtbd_value_drivers_value_driver_id_fkey') THEN
            ALTER TABLE jtbd_value_drivers ADD CONSTRAINT jtbd_value_drivers_value_driver_id_fkey FOREIGN KEY (value_driver_id) REFERENCES value_drivers(id) ON DELETE CASCADE;
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jtbd_value_drivers' AND column_name = 'driver_id'
    ) THEN
        -- Use existing driver_id column
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jtbd_value_drivers_driver_id_fkey') THEN
            -- Clean up orphaned driver_id references first
            DELETE FROM jtbd_value_drivers
            WHERE driver_id NOT IN (SELECT id FROM value_drivers);
            -- Add FK constraint
            ALTER TABLE jtbd_value_drivers ADD CONSTRAINT jtbd_value_drivers_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES value_drivers(id) ON DELETE CASCADE;
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add FK for jtbd_value_drivers: %', SQLERRM;
END$$;

CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_jtbd ON jtbd_value_drivers(jtbd_id);
-- Create index on appropriate column (driver_id or value_driver_id depending on schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'value_driver_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_driver ON jtbd_value_drivers(value_driver_id)';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'driver_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_driver ON jtbd_value_drivers(driver_id)';
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END$$;
-- Create contribution_type index only if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'contribution_type') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_contribution ON jtbd_value_drivers(contribution_type)';
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

-- ============================================================================
-- SECTION 4: FUNCTION ↔ VALUE DRIVER MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS function_value_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_id UUID NOT NULL,               -- FK added conditionally below
    value_driver_id UUID NOT NULL,           -- FK added below

    -- Ownership
    ownership_type TEXT NOT NULL DEFAULT 'supporting', -- 'primary', 'supporting', 'consulted'
    accountability_level TEXT,               -- 'accountable', 'responsible', 'contributor'

    -- Target Metrics
    target_contribution_pct NUMERIC(5,2),
    actual_contribution_pct NUMERIC(5,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT function_value_drivers_unique UNIQUE (function_id, value_driver_id),
    CONSTRAINT ownership_type_check CHECK (ownership_type IN ('primary', 'supporting', 'consulted'))
);

-- CLEANUP: Remove orphaned function references before adding FK
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'org_functions') THEN
        DELETE FROM function_value_drivers
        WHERE function_id NOT IN (SELECT id FROM org_functions);
    ELSE
        DELETE FROM function_value_drivers;
    END IF;
    -- Also cleanup orphaned value_driver references
    DELETE FROM function_value_drivers
    WHERE value_driver_id NOT IN (SELECT id FROM value_drivers);
EXCEPTION WHEN OTHERS THEN
    NULL;
END$$;

-- Add FK to org_functions if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'org_functions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'function_value_drivers_function_id_fkey') THEN
            ALTER TABLE function_value_drivers ADD CONSTRAINT function_value_drivers_function_id_fkey FOREIGN KEY (function_id) REFERENCES org_functions(id) ON DELETE CASCADE;
        END IF;
    END IF;
END$$;

-- Add FK to value_drivers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'function_value_drivers_value_driver_id_fkey') THEN
        ALTER TABLE function_value_drivers ADD CONSTRAINT function_value_drivers_value_driver_id_fkey FOREIGN KEY (value_driver_id) REFERENCES value_drivers(id) ON DELETE CASCADE;
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_function_value_drivers_function ON function_value_drivers(function_id);
CREATE INDEX IF NOT EXISTS idx_function_value_drivers_driver ON function_value_drivers(value_driver_id);

-- ============================================================================
-- SECTION 5: VALUE IMPACT TYPES (Per JTBD)
-- ============================================================================

-- Create enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'value_impact_type') THEN
        CREATE TYPE value_impact_type AS ENUM (
            'smarter',    -- Better decisions
            'faster',     -- Reduced cycle time
            'better',     -- Improved quality/outcomes
            'efficient',  -- Cost reduction
            'safer',      -- Risk/compliance
            'scalable'    -- Capacity increase
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS jtbd_value_impacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL,                   -- FK added conditionally below
    impact_type TEXT NOT NULL,               -- Using TEXT for flexibility

    -- Quantification
    baseline_metric NUMERIC,
    baseline_unit TEXT,
    target_metric NUMERIC,
    target_unit TEXT,
    improvement_pct NUMERIC(5,2),

    -- AI Contribution
    ai_automation_pct NUMERIC(5,2),          -- % automatable
    ai_augmentation_pct NUMERIC(5,2),        -- % augmentable

    -- Value Translation
    monetary_value NUMERIC(12,2),
    value_unit TEXT DEFAULT '$K/year',

    -- Metadata
    calculation_method TEXT,
    assumptions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT jtbd_value_impacts_unique UNIQUE (jtbd_id, impact_type),
    CONSTRAINT impact_type_check CHECK (impact_type IN ('smarter', 'faster', 'better', 'efficient', 'safer', 'scalable'))
);

-- CLEANUP: Remove orphaned jtbd references in jtbd_value_impacts before adding FK
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        DELETE FROM jtbd_value_impacts
        WHERE jtbd_id NOT IN (SELECT id FROM jtbd);
    ELSE
        DELETE FROM jtbd_value_impacts;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END$$;

-- Add FK to jtbd if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jtbd_value_impacts_jtbd_id_fkey') THEN
            ALTER TABLE jtbd_value_impacts ADD CONSTRAINT jtbd_value_impacts_jtbd_id_fkey FOREIGN KEY (jtbd_id) REFERENCES jtbd(id) ON DELETE CASCADE;
        END IF;
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_jtbd_value_impacts_jtbd ON jtbd_value_impacts(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_impacts_type ON jtbd_value_impacts(impact_type);

-- ============================================================================
-- SECTION 6: VALUE REALIZATION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_realization_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value_driver_id UUID NOT NULL,           -- FK added below
    jtbd_id UUID,                            -- FK added conditionally below

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'quarterly',    -- 'monthly', 'quarterly', 'annual'

    -- Targets vs Actuals
    target_value NUMERIC(12,2),
    actual_value NUMERIC(12,2),
    variance_pct NUMERIC(5,2),
    value_unit TEXT DEFAULT '$K',

    -- Attribution
    ai_contribution_pct NUMERIC(5,2),        -- % attributed to AI/automation
    attribution_method TEXT,

    -- Metadata
    measurement_method TEXT,
    data_source TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLEANUP: Remove orphaned references in value_realization_tracking before adding FK
DO $$
BEGIN
    -- Cleanup value_driver references
    DELETE FROM value_realization_tracking
    WHERE value_driver_id NOT IN (SELECT id FROM value_drivers);

    -- Cleanup jtbd references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        DELETE FROM value_realization_tracking
        WHERE jtbd_id IS NOT NULL AND jtbd_id NOT IN (SELECT id FROM jtbd);
    ELSE
        -- Set jtbd_id to NULL if jtbd table doesn't exist
        UPDATE value_realization_tracking SET jtbd_id = NULL WHERE jtbd_id IS NOT NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END$$;

-- Add FK to value_drivers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'value_realization_tracking_value_driver_id_fkey') THEN
        ALTER TABLE value_realization_tracking ADD CONSTRAINT value_realization_tracking_value_driver_id_fkey FOREIGN KEY (value_driver_id) REFERENCES value_drivers(id);
    END IF;
END$$;

-- Add FK to jtbd if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'value_realization_tracking_jtbd_id_fkey') THEN
            ALTER TABLE value_realization_tracking ADD CONSTRAINT value_realization_tracking_jtbd_id_fkey FOREIGN KEY (jtbd_id) REFERENCES jtbd(id);
        END IF;
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_value_realization_driver ON value_realization_tracking(value_driver_id);
CREATE INDEX IF NOT EXISTS idx_value_realization_period ON value_realization_tracking(period_start, period_end);

-- ============================================================================
-- SECTION 7: ANALYTICAL VIEWS
-- ============================================================================

-- View: Value Driver Hierarchy (Recursive CTE)
CREATE OR REPLACE VIEW v_value_driver_hierarchy AS
WITH RECURSIVE driver_tree AS (
    -- Root level
    SELECT
        id, code, name, parent_id, level,
        value_category, driver_type,
        ARRAY[code] AS path,
        name AS full_path,
        1 AS depth
    FROM value_drivers
    WHERE parent_id IS NULL

    UNION ALL

    -- Children
    SELECT
        vd.id, vd.code, vd.name, vd.parent_id, vd.level,
        COALESCE(vd.value_category, dt.value_category) AS value_category,
        vd.driver_type,
        dt.path || vd.code,
        dt.full_path || ' > ' || vd.name,
        dt.depth + 1
    FROM value_drivers vd
    JOIN driver_tree dt ON vd.parent_id = dt.id
)
SELECT * FROM driver_tree
ORDER BY path;

-- View: JTBD Value Summary
CREATE OR REPLACE VIEW v_jtbd_value_summary AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.opportunity_score,
    j.functional_area,

    -- Value Driver Aggregation
    COUNT(DISTINCT jvd.value_driver_id) AS value_driver_count,
    STRING_AGG(DISTINCT vd.value_category, ', ') AS value_categories,
    STRING_AGG(DISTINCT vd.code, ', ') AS value_driver_codes,

    -- Total Value
    SUM(jvd.estimated_value_amount) AS total_estimated_value,
    AVG(jvd.impact_score) AS avg_impact_score,

    -- AI Impact
    AVG(jvi.ai_automation_pct) AS avg_automation_potential,
    AVG(jvi.ai_augmentation_pct) AS avg_augmentation_potential,
    SUM(jvi.monetary_value) AS total_ai_value

FROM jtbd j
LEFT JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = j.id
LEFT JOIN value_drivers vd ON vd.id = jvd.value_driver_id
LEFT JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
GROUP BY j.id, j.code, j.name, j.opportunity_score, j.functional_area;

-- View: Function Value Contribution
CREATE OR REPLACE VIEW v_function_value_contribution AS
SELECT
    f.name AS function_name,
    vd.value_category,
    vd.code AS driver_code,
    vd.name AS driver_name,
    fvd.ownership_type,
    COUNT(DISTINCT jvd.jtbd_id) AS jtbd_count,
    SUM(jvd.estimated_value_amount) AS total_value,
    AVG(jvd.impact_score) AS avg_impact
FROM org_functions f
JOIN function_value_drivers fvd ON fvd.function_id = f.id
JOIN value_drivers vd ON vd.id = fvd.value_driver_id
LEFT JOIN jtbd_value_drivers jvd ON jvd.value_driver_id = vd.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name, vd.value_category, vd.code, vd.name, fvd.ownership_type
ORDER BY f.name, total_value DESC NULLS LAST;

-- View: Value Driver with JTBD Count
CREATE OR REPLACE VIEW v_value_driver_jtbd_coverage AS
SELECT
    vd.code,
    vd.name,
    vd.level,
    vd.value_category,
    COUNT(DISTINCT jvd.jtbd_id) AS mapped_jtbd_count,
    SUM(jvd.estimated_value_amount) AS total_value,
    AVG(jvd.impact_score) AS avg_impact
FROM value_drivers vd
LEFT JOIN jtbd_value_drivers jvd ON jvd.value_driver_id = vd.id
GROUP BY vd.id, vd.code, vd.name, vd.level, vd.value_category
ORDER BY vd.code;

-- ============================================================================
-- SECTION 8: TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_value_driver_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS value_drivers_updated_at ON value_drivers;
CREATE TRIGGER value_drivers_updated_at
    BEFORE UPDATE ON value_drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_value_driver_timestamp();

DROP TRIGGER IF EXISTS jtbd_value_drivers_updated_at ON jtbd_value_drivers;
CREATE TRIGGER jtbd_value_drivers_updated_at
    BEFORE UPDATE ON jtbd_value_drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_value_driver_timestamp();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
SELECT 'Value Drivers Schema Created Successfully' AS status;
