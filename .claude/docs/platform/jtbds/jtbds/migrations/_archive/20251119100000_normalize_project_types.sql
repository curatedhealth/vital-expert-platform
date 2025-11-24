-- =====================================================================================
-- Migration: Normalize project_types from check constraint to reference table
-- Purpose: Make project_type dynamic and evolvable
-- Date: 2025-11-19
-- =====================================================================================

-- =====================================================================================
-- STEP 1: Create project_types reference table
-- =====================================================================================

CREATE TABLE IF NOT EXISTS project_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'digital_health', 'clinical', 'analytics'
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint per tenant (or global if tenant_id is NULL)
    UNIQUE(tenant_id, code)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_project_types_code ON project_types(code);
CREATE INDEX IF NOT EXISTS idx_project_types_tenant ON project_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_types_active ON project_types(is_active) WHERE is_active = true;

-- =====================================================================================
-- STEP 2: Seed initial project types (from existing check constraint)
-- =====================================================================================

INSERT INTO project_types (tenant_id, code, name, description, category, display_order)
VALUES
    (NULL, 'digital_therapeutic', 'Digital Therapeutic', 'Software-based therapeutic interventions', 'digital_health', 1),
    (NULL, 'ai_diagnostic', 'AI Diagnostic', 'AI-powered diagnostic tools', 'digital_health', 2),
    (NULL, 'clinical_decision_support', 'Clinical Decision Support', 'Systems supporting clinical decisions', 'clinical', 3),
    (NULL, 'remote_monitoring', 'Remote Monitoring', 'Remote patient monitoring solutions', 'digital_health', 4),
    (NULL, 'telemedicine_platform', 'Telemedicine Platform', 'Virtual care delivery platforms', 'digital_health', 5),
    (NULL, 'health_analytics', 'Health Analytics', 'Healthcare data analytics solutions', 'analytics', 6)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- =====================================================================================
-- STEP 3: Add project_type_id column to projects table
-- =====================================================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_type_id UUID REFERENCES project_types(id);

-- =====================================================================================
-- STEP 4: Migrate existing data from project_type text to project_type_id
-- =====================================================================================

UPDATE projects p
SET project_type_id = pt.id
FROM project_types pt
WHERE p.project_type = pt.code
AND p.project_type_id IS NULL;

-- =====================================================================================
-- STEP 5: Drop the check constraint (if exists)
-- =====================================================================================

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;

-- =====================================================================================
-- STEP 6: Comments
-- =====================================================================================

COMMENT ON TABLE project_types IS 'Reference table for project types - normalized from check constraint for dynamic evolution';
COMMENT ON COLUMN project_types.tenant_id IS 'NULL for global types, or tenant_id for tenant-specific types';
COMMENT ON COLUMN project_types.code IS 'Machine-readable code for the project type';
COMMENT ON COLUMN project_types.category IS 'Grouping category for UI organization';

COMMENT ON COLUMN projects.project_type_id IS 'FK to project_types - replaces project_type text column';
COMMENT ON COLUMN projects.project_type IS 'DEPRECATED - use project_type_id instead. Will be removed in future migration.';

-- =====================================================================================
-- STEP 7: Helper function to get project type by code
-- =====================================================================================

CREATE OR REPLACE FUNCTION get_project_type_id(p_code TEXT, p_tenant_id UUID DEFAULT NULL)
RETURNS UUID
LANGUAGE SQL STABLE AS $$
    SELECT id FROM project_types
    WHERE code = p_code
    AND (tenant_id = p_tenant_id OR tenant_id IS NULL)
    ORDER BY tenant_id NULLS LAST
    LIMIT 1;
$$;

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM project_types;
    RAISE NOTICE 'project_types table created with % initial types', v_count;
    RAISE NOTICE 'projects.project_type_id column added';
    RAISE NOTICE 'Check constraint removed - project_type is now dynamic';
    RAISE NOTICE 'Use get_project_type_id(code) to resolve type IDs';
END $$;
