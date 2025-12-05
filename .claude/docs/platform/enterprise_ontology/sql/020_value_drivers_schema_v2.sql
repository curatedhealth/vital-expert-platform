-- ============================================================================
-- VALUE DRIVERS SCHEMA v2 (Compatible with Existing Database)
-- This schema ADAPTS to existing tables, not replaces them
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD MISSING COLUMNS TO EXISTING value_drivers TABLE
-- Existing columns: id, code, name, driver_type, description, primary_category_id
-- ============================================================================

-- Add hierarchical columns to existing value_drivers
DO $$
BEGIN
    -- parent_id for hierarchical tree
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'parent_id') THEN
        ALTER TABLE value_drivers ADD COLUMN parent_id UUID;
    END IF;

    -- level for hierarchy depth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'level') THEN
        ALTER TABLE value_drivers ADD COLUMN level INTEGER DEFAULT 0;
    END IF;

    -- value_category for revenue/cost/risk classification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'value_category') THEN
        ALTER TABLE value_drivers ADD COLUMN value_category TEXT;
    END IF;

    -- unit for measurement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'unit') THEN
        ALTER TABLE value_drivers ADD COLUMN unit TEXT;
    END IF;

    -- is_quantifiable flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'is_quantifiable') THEN
        ALTER TABLE value_drivers ADD COLUMN is_quantifiable BOOLEAN DEFAULT true;
    END IF;

    -- is_active flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'is_active') THEN
        ALTER TABLE value_drivers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- display_order for sorting
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'display_order') THEN
        ALTER TABLE value_drivers ADD COLUMN display_order INTEGER;
    END IF;

    -- tenant_id for multi-tenancy
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'tenant_id') THEN
        ALTER TABLE value_drivers ADD COLUMN tenant_id UUID;
    END IF;

    -- metadata for flexible storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_drivers' AND column_name = 'metadata') THEN
        ALTER TABLE value_drivers ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END$$;

-- Add self-referential FK for parent_id (if not exists)
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add parent_id FK: %', SQLERRM;
END$$;

-- Add tenant FK (if tenants table exists and FK not present)
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add tenant_id FK: %', SQLERRM;
END$$;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_value_drivers_parent ON value_drivers(parent_id);
CREATE INDEX IF NOT EXISTS idx_value_drivers_category ON value_drivers(value_category);
CREATE INDEX IF NOT EXISTS idx_value_drivers_level ON value_drivers(level);

-- ============================================================================
-- SECTION 2: ADD MISSING COLUMNS TO EXISTING jtbd_value_drivers TABLE
-- Existing: id, jtbd_id, driver_id, driver_name, impact_strength, quantified_value,
--           value_unit, confidence_level, rationale, evidence_source_id
-- ============================================================================

DO $$
BEGIN
    -- contribution_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'contribution_type') THEN
        ALTER TABLE jtbd_value_drivers ADD COLUMN contribution_type TEXT DEFAULT 'direct';
    END IF;

    -- impact_score (numeric version of impact_strength)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'impact_score') THEN
        ALTER TABLE jtbd_value_drivers ADD COLUMN impact_score NUMERIC(3,1);
    END IF;

    -- estimated_value_pct
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'estimated_value_pct') THEN
        ALTER TABLE jtbd_value_drivers ADD COLUMN estimated_value_pct NUMERIC(5,2);
    END IF;

    -- estimated_value_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'estimated_value_amount') THEN
        ALTER TABLE jtbd_value_drivers ADD COLUMN estimated_value_amount NUMERIC(12,2);
    END IF;

    -- evidence_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'evidence_date') THEN
        ALTER TABLE jtbd_value_drivers ADD COLUMN evidence_date DATE;
    END IF;

    -- created_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_value_drivers' AND column_name = 'created_by') THEN
        ALTER TABLE jtbd_value_drivers ADD COLUMN created_by TEXT;
    END IF;
END$$;

-- ============================================================================
-- SECTION 3: VALUE DRIVER TACTICS (NEW TABLE - Leaf-Level Actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_driver_tactics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value_driver_id UUID NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tactic_type TEXT,
    ai_enablement_potential TEXT DEFAULT 'medium',
    implementation_complexity TEXT DEFAULT 'medium',
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT value_driver_tactics_unique UNIQUE (value_driver_id, code),
    CONSTRAINT ai_potential_check CHECK (ai_enablement_potential IN ('high', 'medium', 'low')),
    CONSTRAINT complexity_check CHECK (implementation_complexity IN ('high', 'medium', 'low'))
);

-- Add FK for value_driver_tactics
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'value_driver_tactics_value_driver_id_fkey') THEN
        ALTER TABLE value_driver_tactics ADD CONSTRAINT value_driver_tactics_value_driver_id_fkey FOREIGN KEY (value_driver_id) REFERENCES value_drivers(id) ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

CREATE INDEX IF NOT EXISTS idx_value_driver_tactics_driver ON value_driver_tactics(value_driver_id);

-- ============================================================================
-- SECTION 4: FUNCTION ↔ VALUE DRIVER MAPPING (NEW TABLE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS function_value_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_id UUID NOT NULL,
    value_driver_id UUID NOT NULL,
    ownership_type TEXT NOT NULL DEFAULT 'supporting',
    accountability_level TEXT,
    target_contribution_pct NUMERIC(5,2),
    actual_contribution_pct NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT function_value_drivers_unique UNIQUE (function_id, value_driver_id),
    CONSTRAINT ownership_type_check CHECK (ownership_type IN ('primary', 'supporting', 'consulted'))
);

-- Add FKs for function_value_drivers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'org_functions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'function_value_drivers_function_id_fkey') THEN
            ALTER TABLE function_value_drivers ADD CONSTRAINT function_value_drivers_function_id_fkey FOREIGN KEY (function_id) REFERENCES org_functions(id) ON DELETE CASCADE;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'function_value_drivers_value_driver_id_fkey') THEN
        ALTER TABLE function_value_drivers ADD CONSTRAINT function_value_drivers_value_driver_id_fkey FOREIGN KEY (value_driver_id) REFERENCES value_drivers(id) ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

CREATE INDEX IF NOT EXISTS idx_function_value_drivers_function ON function_value_drivers(function_id);
CREATE INDEX IF NOT EXISTS idx_function_value_drivers_driver ON function_value_drivers(value_driver_id);

-- ============================================================================
-- SECTION 5: VALUE REALIZATION TRACKING (NEW TABLE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_realization_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value_driver_id UUID NOT NULL,
    jtbd_id UUID,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'quarterly',
    target_value NUMERIC(12,2),
    actual_value NUMERIC(12,2),
    variance_pct NUMERIC(5,2),
    value_unit TEXT DEFAULT '$K',
    ai_contribution_pct NUMERIC(5,2),
    attribution_method TEXT,
    measurement_method TEXT,
    data_source TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FKs for value_realization_tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'value_realization_tracking_value_driver_id_fkey') THEN
        ALTER TABLE value_realization_tracking ADD CONSTRAINT value_realization_tracking_value_driver_id_fkey FOREIGN KEY (value_driver_id) REFERENCES value_drivers(id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'value_realization_tracking_jtbd_id_fkey') THEN
            ALTER TABLE value_realization_tracking ADD CONSTRAINT value_realization_tracking_jtbd_id_fkey FOREIGN KEY (jtbd_id) REFERENCES jtbd(id);
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

CREATE INDEX IF NOT EXISTS idx_value_realization_driver ON value_realization_tracking(value_driver_id);
CREATE INDEX IF NOT EXISTS idx_value_realization_period ON value_realization_tracking(period_start, period_end);

-- ============================================================================
-- SECTION 6: ANALYTICAL VIEWS
-- ============================================================================

-- View: Value Driver Hierarchy (with new columns)
CREATE OR REPLACE VIEW v_value_driver_hierarchy AS
WITH RECURSIVE driver_tree AS (
    SELECT
        id, code, name, parent_id, COALESCE(level, 0) AS level,
        value_category, driver_type,
        ARRAY[code] AS path,
        name AS full_path,
        1 AS depth
    FROM value_drivers
    WHERE parent_id IS NULL

    UNION ALL

    SELECT
        vd.id, vd.code, vd.name, vd.parent_id, COALESCE(vd.level, dt.level + 1),
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

-- View: JTBD Value Summary (using existing column names)
CREATE OR REPLACE VIEW v_jtbd_value_driver_summary AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.opportunity_score,
    j.functional_area,
    COUNT(DISTINCT jvd.driver_id) AS value_driver_count,
    STRING_AGG(DISTINCT vd.value_category, ', ') AS value_categories,
    STRING_AGG(DISTINCT vd.code, ', ') AS value_driver_codes,
    SUM(jvd.quantified_value) AS total_quantified_value,
    AVG(jvd.impact_strength) AS avg_impact_strength
FROM jtbd j
LEFT JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = j.id
LEFT JOIN value_drivers vd ON vd.id = jvd.driver_id
GROUP BY j.id, j.code, j.name, j.opportunity_score, j.functional_area;

-- View: Value Driver with JTBD Count
CREATE OR REPLACE VIEW v_value_driver_jtbd_coverage AS
SELECT
    vd.code,
    vd.name,
    COALESCE(vd.level, 0) AS level,
    vd.value_category,
    vd.driver_type,
    COUNT(DISTINCT jvd.jtbd_id) AS mapped_jtbd_count,
    SUM(jvd.quantified_value) AS total_value,
    AVG(jvd.impact_strength) AS avg_impact
FROM value_drivers vd
LEFT JOIN jtbd_value_drivers jvd ON jvd.driver_id = vd.id
GROUP BY vd.id, vd.code, vd.name, vd.level, vd.value_category, vd.driver_type
ORDER BY vd.code;

-- ============================================================================
-- SECTION 7: UPDATE TRIGGER
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
-- END OF SCHEMA v2
-- ============================================================================
SELECT 'Value Drivers Schema v2 Applied Successfully' AS status;
