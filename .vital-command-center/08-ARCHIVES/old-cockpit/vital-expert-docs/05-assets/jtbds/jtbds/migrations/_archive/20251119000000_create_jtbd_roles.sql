-- =====================================================================================
-- Migration: Create jtbd_roles junction table
-- Purpose: Maps JTBDs to organizational roles (personas inherit JTBDs from their roles)
-- Date: 2025-11-19
-- =====================================================================================

CREATE TABLE IF NOT EXISTS jtbd_roles (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys (NOT NULL for junction table integrity)
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,

    -- Relevance Scoring (matches jtbd_personas pattern: 0.00 to 1.00)
    relevance_score DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (relevance_score BETWEEN 0 AND 1),
    is_primary BOOLEAN DEFAULT false,

    -- Context
    notes TEXT,
    mapping_source TEXT DEFAULT 'manual' CHECK (mapping_source IN ('manual', 'ai_suggested', 'imported', 'derived')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    UNIQUE(jtbd_id, role_id)
);

-- =====================================================================================
-- INDEXES
-- =====================================================================================

CREATE INDEX IF NOT EXISTS idx_jtbd_roles_jtbd ON jtbd_roles(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_role ON jtbd_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_score ON jtbd_roles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_primary ON jtbd_roles(is_primary) WHERE is_primary = true;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_jtbd_primary ON jtbd_roles(jtbd_id, is_primary DESC, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_role_primary ON jtbd_roles(role_id, is_primary DESC, relevance_score DESC);

-- =====================================================================================
-- TRIGGER: Update timestamp on modification
-- =====================================================================================

CREATE OR REPLACE FUNCTION update_jtbd_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jtbd_roles_updated_at ON jtbd_roles;
CREATE TRIGGER trigger_jtbd_roles_updated_at
    BEFORE UPDATE ON jtbd_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_jtbd_roles_updated_at();

-- =====================================================================================
-- HELPER FUNCTIONS
-- =====================================================================================

-- Function to get JTBDs by role
CREATE OR REPLACE FUNCTION get_jtbds_by_role(p_role_id UUID)
RETURNS TABLE(
    id UUID,
    code TEXT,
    name TEXT,
    functional_area functional_area_type,
    relevance_score DECIMAL,
    is_primary BOOLEAN
)
LANGUAGE SQL STABLE AS $$
    SELECT j.id, j.code, j.name, j.functional_area, jr.relevance_score, jr.is_primary
    FROM jobs_to_be_done j
    JOIN jtbd_roles jr ON j.id = jr.jtbd_id
    WHERE jr.role_id = p_role_id
    ORDER BY jr.is_primary DESC, jr.relevance_score DESC, j.code;
$$;

-- Function to get roles by JTBD
CREATE OR REPLACE FUNCTION get_roles_by_jtbd(p_jtbd_id UUID)
RETURNS TABLE(
    id UUID,
    slug VARCHAR,
    name VARCHAR,
    relevance_score DECIMAL,
    is_primary BOOLEAN
)
LANGUAGE SQL STABLE AS $$
    SELECT r.id, r.slug, r.name, jr.relevance_score, jr.is_primary
    FROM org_roles r
    JOIN jtbd_roles jr ON r.id = jr.role_id
    WHERE jr.jtbd_id = p_jtbd_id
    ORDER BY jr.is_primary DESC, jr.relevance_score DESC;
$$;

-- Function to get JTBDs for a persona through their role (inheritance pattern)
CREATE OR REPLACE FUNCTION get_jtbds_for_persona_via_role(p_persona_id UUID)
RETURNS TABLE(
    jtbd_id UUID,
    jtbd_code TEXT,
    jtbd_name TEXT,
    role_id UUID,
    role_name VARCHAR,
    relevance_score DECIMAL,
    is_primary BOOLEAN
)
LANGUAGE SQL STABLE AS $$
    SELECT
        j.id as jtbd_id,
        j.code as jtbd_code,
        j.name as jtbd_name,
        r.id as role_id,
        r.name as role_name,
        jr.relevance_score,
        jr.is_primary
    FROM personas p
    JOIN org_roles r ON p.role_id = r.id
    JOIN jtbd_roles jr ON r.id = jr.role_id
    JOIN jobs_to_be_done j ON jr.jtbd_id = j.id
    WHERE p.id = p_persona_id
    ORDER BY jr.is_primary DESC, jr.relevance_score DESC, j.code;
$$;

-- =====================================================================================
-- TABLE COMMENTS
-- =====================================================================================

COMMENT ON TABLE jtbd_roles IS 'Maps JTBDs to organizational roles. Personas inherit JTBDs from their assigned roles.';
COMMENT ON COLUMN jtbd_roles.relevance_score IS 'Relevance score 0.00-1.00 indicating how relevant this JTBD is to the role';
COMMENT ON COLUMN jtbd_roles.is_primary IS 'Whether this role is the primary executor of this JTBD';

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE 'jtbd_roles table created successfully';
    RAISE NOTICE 'Helper functions: get_jtbds_by_role(), get_roles_by_jtbd(), get_jtbds_for_persona_via_role()';
END $$;
