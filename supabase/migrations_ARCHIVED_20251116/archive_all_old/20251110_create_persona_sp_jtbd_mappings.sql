-- ============================================================================
-- Persona-Strategic Pillar and Persona-JTBD Mapping Tables
-- Created: 2025-11-10
-- Purpose: Track relationships between personas, strategic pillars, and JTBDs
-- ============================================================================

-- ============================================================================
-- TABLE: persona_strategic_pillar_mapping
-- Purpose: Track which personas are involved in which strategic pillars
-- ============================================================================

CREATE TABLE IF NOT EXISTS persona_strategic_pillar_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Keys
    persona_id UUID NOT NULL,
    strategic_pillar_id UUID NOT NULL,

    -- Engagement Metrics
    jtbd_count INTEGER DEFAULT 0,
    pain_points_count INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    priority_score NUMERIC(5,2),

    -- Metadata
    engagement_metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    UNIQUE(persona_id, strategic_pillar_id)
);

-- ============================================================================
-- TABLE: persona_jtbd_mapping
-- Purpose: Track which personas are responsible for which JTBDs
-- ============================================================================

CREATE TABLE IF NOT EXISTS persona_jtbd_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Keys
    persona_id UUID NOT NULL,
    jtbd_id UUID NOT NULL,

    -- Role in JTBD
    role_type VARCHAR(50), -- 'primary', 'secondary', 'stakeholder', 'approver'
    is_primary BOOLEAN DEFAULT false,
    responsibility_level VARCHAR(50), -- 'owner', 'contributor', 'informed'

    -- Engagement Details
    pain_points_count INTEGER DEFAULT 0,
    impact_level VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
    frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', etc.

    -- Metadata
    engagement_metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    UNIQUE(persona_id, jtbd_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- persona_strategic_pillar_mapping indexes
CREATE INDEX IF NOT EXISTS idx_persona_sp_mapping_persona
    ON persona_strategic_pillar_mapping(persona_id);

CREATE INDEX IF NOT EXISTS idx_persona_sp_mapping_pillar
    ON persona_strategic_pillar_mapping(strategic_pillar_id);

CREATE INDEX IF NOT EXISTS idx_persona_sp_mapping_primary
    ON persona_strategic_pillar_mapping(is_primary) WHERE is_primary = true;

-- persona_jtbd_mapping indexes
CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_persona
    ON persona_jtbd_mapping(persona_id);

CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_jtbd
    ON persona_jtbd_mapping(jtbd_id);

CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_primary
    ON persona_jtbd_mapping(is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_role
    ON persona_jtbd_mapping(role_type);

CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_impact
    ON persona_jtbd_mapping(impact_level);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_persona_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_persona_sp_mapping_updated_at
    ON persona_strategic_pillar_mapping;
CREATE TRIGGER trigger_persona_sp_mapping_updated_at
    BEFORE UPDATE ON persona_strategic_pillar_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_persona_mapping_updated_at();

DROP TRIGGER IF EXISTS trigger_persona_jtbd_mapping_updated_at
    ON persona_jtbd_mapping;
CREATE TRIGGER trigger_persona_jtbd_mapping_updated_at
    BEFORE UPDATE ON persona_jtbd_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_persona_mapping_updated_at();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Persona with Strategic Pillar summary
CREATE OR REPLACE VIEW persona_strategic_summary AS
SELECT
    p.id as persona_id,
    p.unique_id as persona_unique_id,
    p.name as persona_name,
    COUNT(DISTINCT pspm.strategic_pillar_id) as strategic_pillar_count,
    SUM(pspm.jtbd_count) as total_jtbds,
    SUM(pspm.pain_points_count) as total_pain_points,
    ARRAY_AGG(DISTINCT sp.code) FILTER (WHERE sp.id IS NOT NULL) as strategic_pillars,
    ARRAY_AGG(DISTINCT sp.name) FILTER (WHERE sp.id IS NOT NULL) as pillar_names
FROM personas p
LEFT JOIN persona_strategic_pillar_mapping pspm ON p.id = pspm.persona_id
LEFT JOIN strategic_priorities sp ON pspm.strategic_pillar_id = sp.id
WHERE p.deleted_at IS NULL AND p.is_active = true
GROUP BY p.id, p.unique_id, p.name;

-- View: Persona with JTBD details
CREATE OR REPLACE VIEW persona_jtbd_summary AS
SELECT
    p.id as persona_id,
    p.unique_id as persona_unique_id,
    p.name as persona_name,
    COUNT(DISTINCT pjm.jtbd_id) as total_jtbds,
    COUNT(DISTINCT pjm.jtbd_id) FILTER (WHERE pjm.is_primary = true) as primary_jtbds,
    COUNT(DISTINCT pjm.jtbd_id) FILTER (WHERE pjm.impact_level = 'critical') as critical_jtbds,
    ARRAY_AGG(DISTINCT pjm.role_type) FILTER (WHERE pjm.role_type IS NOT NULL) as roles
FROM personas p
LEFT JOIN persona_jtbd_mapping pjm ON p.id = pjm.persona_id
WHERE p.deleted_at IS NULL AND p.is_active = true
GROUP BY p.id, p.unique_id, p.name;

-- View: Complete persona context with SPs and JTBDs
CREATE OR REPLACE VIEW persona_complete_context AS
SELECT
    p.id,
    p.unique_id,
    p.name,
    p.display_name,
    p.persona_type,
    p.seniority_level,
    p.description,
    pss.strategic_pillar_count,
    pss.total_jtbds as sp_jtbds,
    pss.strategic_pillars,
    pss.pillar_names,
    pjs.total_jtbds as mapped_jtbds,
    pjs.primary_jtbds,
    pjs.critical_jtbds,
    pjs.roles as jtbd_roles,
    jsonb_array_length(COALESCE(p.pain_points, '[]'::jsonb)) as pain_points_count,
    p.is_active,
    p.created_at,
    p.updated_at
FROM personas p
LEFT JOIN persona_strategic_summary pss ON p.id = pss.persona_id
LEFT JOIN persona_jtbd_summary pjs ON p.id = pjs.persona_id
WHERE p.deleted_at IS NULL;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get top personas for a strategic pillar
CREATE OR REPLACE FUNCTION get_top_personas_for_pillar(
    pillar_code VARCHAR,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    persona_id UUID,
    persona_name VARCHAR,
    jtbd_count INTEGER,
    pain_points_count INTEGER,
    engagement_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        pspm.jtbd_count,
        pspm.pain_points_count,
        (pspm.jtbd_count * 2.0 + pspm.pain_points_count * 1.0) as engagement_score
    FROM personas p
    JOIN persona_strategic_pillar_mapping pspm ON p.id = pspm.persona_id
    JOIN strategic_priorities sp ON pspm.strategic_pillar_id = sp.id
    WHERE sp.code = pillar_code
      AND p.deleted_at IS NULL
      AND p.is_active = true
    ORDER BY engagement_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get all JTBDs for a persona
CREATE OR REPLACE FUNCTION get_jtbds_for_persona(
    persona_unique_id VARCHAR
)
RETURNS TABLE (
    jtbd_id UUID,
    jtbd_title VARCHAR,
    role_type VARCHAR,
    is_primary BOOLEAN,
    impact_level VARCHAR,
    strategic_pillar VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.title,
        pjm.role_type,
        pjm.is_primary,
        pjm.impact_level,
        sp.code as strategic_pillar
    FROM personas p
    JOIN persona_jtbd_mapping pjm ON p.id = pjm.persona_id
    JOIN jtbd_library j ON pjm.jtbd_id = j.id
    LEFT JOIN strategic_priorities sp ON j.strategic_priority_id = sp.id
    WHERE p.unique_id = persona_unique_id
      AND p.deleted_at IS NULL
      AND p.is_active = true
    ORDER BY pjm.is_primary DESC, pjm.impact_level DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE persona_strategic_pillar_mapping IS
'Tracks engagement between personas and strategic pillars based on JTBD participation';

COMMENT ON TABLE persona_jtbd_mapping IS
'Tracks which personas are responsible for or involved in specific JTBDs';

COMMENT ON VIEW persona_complete_context IS
'Comprehensive view of persona with all strategic pillar and JTBD relationships';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Persona mapping tables created successfully!';
    RAISE NOTICE '   - persona_strategic_pillar_mapping';
    RAISE NOTICE '   - persona_jtbd_mapping';
    RAISE NOTICE '   - Views: persona_strategic_summary, persona_jtbd_summary, persona_complete_context';
    RAISE NOTICE '   - Functions: get_top_personas_for_pillar, get_jtbds_for_persona';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to populate mappings from operational libraries!';
    RAISE NOTICE '';
END $$;
