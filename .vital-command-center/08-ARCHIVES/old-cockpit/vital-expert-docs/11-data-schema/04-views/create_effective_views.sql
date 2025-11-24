-- =====================================================================
-- PHASE 4: CREATE EFFECTIVE VIEWS
-- Combines role baselines with persona deltas using the override pattern
-- These views show the "effective" (actual) data for each persona
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CREATING EFFECTIVE VIEWS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. EFFECTIVE PERSONA RESPONSIBILITIES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating v_effective_persona_responsibilities...'; END $$;

CREATE OR REPLACE VIEW public.v_effective_persona_responsibilities AS
WITH role_baseline AS (
    -- Get all role-level responsibilities
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        r.id as role_id,
        r.name as role_name,
        rr.id as item_id,
        rr.responsibility_id,
        rr.responsibility_text,
        rr.responsibility_type,
        rr.time_allocation_percent,
        rr.is_mandatory,
        rr.sequence_order,
        'role' as source
    FROM personas p
    JOIN org_roles r ON p.role_id = r.id
    JOIN role_responsibilities rr ON rr.role_id = r.id
    WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL
),
persona_overrides AS (
    -- Get persona-specific overrides and additions
    SELECT 
        pr.persona_id,
        pr.id as item_id,
        pr.responsibility_id,
        pr.responsibility_text,
        pr.responsibility_type,
        pr.time_allocation_percent,
        pr.is_additional,
        pr.overrides_role,
        pr.sequence_order,
        CASE 
            WHEN pr.is_additional THEN 'persona_addition'
            WHEN pr.overrides_role THEN 'persona_override'
            ELSE 'persona'
        END as source
    FROM persona_responsibilities pr
)
-- Combine: Role items (unless overridden) + Persona additions + Persona overrides
SELECT 
    rb.persona_id,
    rb.persona_name,
    rb.role_id,
    rb.role_name,
    COALESCE(po.item_id, rb.item_id) as item_id,
    COALESCE(po.responsibility_id, rb.responsibility_id) as responsibility_id,
    COALESCE(po.responsibility_text, rb.responsibility_text) as responsibility_text,
    COALESCE(po.responsibility_type, rb.responsibility_type) as responsibility_type,
    COALESCE(po.time_allocation_percent, rb.time_allocation_percent) as time_allocation_percent,
    COALESCE(po.sequence_order, rb.sequence_order) as sequence_order,
    COALESCE(po.source, rb.source) as source
FROM role_baseline rb
LEFT JOIN persona_overrides po ON 
    po.persona_id = rb.persona_id 
    AND po.overrides_role = TRUE 
    AND po.responsibility_id = rb.responsibility_id
WHERE po.persona_id IS NULL OR po.overrides_role = TRUE  -- Exclude overridden role items

UNION ALL

-- Add persona-only additions
SELECT 
    po.persona_id,
    p.name as persona_name,
    p.role_id,
    r.name as role_name,
    po.item_id,
    po.responsibility_id,
    po.responsibility_text,
    po.responsibility_type,
    po.time_allocation_percent,
    po.sequence_order,
    po.source
FROM persona_overrides po
JOIN personas p ON p.id = po.persona_id
JOIN org_roles r ON r.id = p.role_id
WHERE po.is_additional = TRUE;

DO $$ BEGIN RAISE NOTICE '  ✓ v_effective_persona_responsibilities created'; END $$;

-- =====================================================================
-- 2. EFFECTIVE PERSONA TOOLS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating v_effective_persona_tools...'; END $$;

CREATE OR REPLACE VIEW public.v_effective_persona_tools AS
WITH role_baseline AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        r.id as role_id,
        r.name as role_name,
        rt.id as item_id,
        rt.tool_id,
        rt.tool_name,
        rt.usage_frequency,
        rt.proficiency_level,
        rt.is_required,
        rt.sequence_order,
        'role' as source,
        NULL::INTEGER as satisfaction_level
    FROM personas p
    JOIN org_roles r ON p.role_id = r.id
    JOIN role_tools rt ON rt.role_id = r.id
    WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL
),
persona_overrides AS (
    SELECT 
        pt.persona_id,
        pt.id as item_id,
        pt.tool_id,
        pt.tool_name,
        pt.usage_frequency,
        pt.proficiency_level,
        pt.satisfaction_level,
        pt.is_additional,
        pt.overrides_role,
        pt.sequence_order,
        CASE 
            WHEN pt.is_additional THEN 'persona_addition'
            WHEN pt.overrides_role THEN 'persona_override'
            ELSE 'persona'
        END as source
    FROM persona_tools pt
)
SELECT 
    rb.persona_id,
    rb.persona_name,
    rb.role_id,
    rb.role_name,
    COALESCE(po.item_id, rb.item_id) as item_id,
    COALESCE(po.tool_id, rb.tool_id) as tool_id,
    COALESCE(po.tool_name, rb.tool_name) as tool_name,
    COALESCE(po.usage_frequency, rb.usage_frequency) as usage_frequency,
    COALESCE(po.proficiency_level, rb.proficiency_level) as proficiency_level,
    po.satisfaction_level,
    COALESCE(po.sequence_order, rb.sequence_order) as sequence_order,
    COALESCE(po.source, rb.source) as source
FROM role_baseline rb
LEFT JOIN persona_overrides po ON 
    po.persona_id = rb.persona_id 
    AND po.overrides_role = TRUE 
    AND po.tool_id = rb.tool_id
WHERE po.persona_id IS NULL OR po.overrides_role = TRUE

UNION ALL

SELECT 
    po.persona_id,
    p.name as persona_name,
    p.role_id,
    r.name as role_name,
    po.item_id,
    po.tool_id,
    po.tool_name,
    po.usage_frequency,
    po.proficiency_level,
    po.satisfaction_level,
    po.sequence_order,
    po.source
FROM persona_overrides po
JOIN personas p ON p.id = po.persona_id
JOIN org_roles r ON r.id = p.role_id
WHERE po.is_additional = TRUE;

DO $$ BEGIN RAISE NOTICE '  ✓ v_effective_persona_tools created'; END $$;

-- =====================================================================
-- 3. EFFECTIVE PERSONA SKILLS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating v_effective_persona_skills...'; END $$;

CREATE OR REPLACE VIEW public.v_effective_persona_skills AS
WITH role_baseline AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        r.id as role_id,
        r.name as role_name,
        rs.id as item_id,
        rs.skill_id,
        rs.skill_name,
        rs.required_proficiency,
        rs.is_mandatory,
        rs.years_experience_min,
        rs.sequence_order,
        'role' as source
    FROM personas p
    JOIN org_roles r ON p.role_id = r.id
    JOIN role_skills rs ON rs.role_id = r.id
    WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL
),
persona_overrides AS (
    SELECT 
        ps.persona_id,
        ps.id as item_id,
        ps.skill_id,
        ps.skill_name,
        ps.proficiency_level,
        ps.years_experience,
        ps.is_additional,
        ps.overrides_role,
        ps.sequence_order,
        CASE 
            WHEN ps.is_additional THEN 'persona_addition'
            WHEN ps.overrides_role THEN 'persona_override'
            ELSE 'persona'
        END as source
    FROM persona_skills ps
)
SELECT 
    rb.persona_id,
    rb.persona_name,
    rb.role_id,
    rb.role_name,
    COALESCE(po.item_id, rb.item_id) as item_id,
    COALESCE(po.skill_id, rb.skill_id) as skill_id,
    COALESCE(po.skill_name, rb.skill_name) as skill_name,
    COALESCE(po.proficiency_level, rb.required_proficiency) as proficiency_level,
    COALESCE(po.years_experience, rb.years_experience_min) as years_experience,
    COALESCE(po.sequence_order, rb.sequence_order) as sequence_order,
    COALESCE(po.source, rb.source) as source
FROM role_baseline rb
LEFT JOIN persona_overrides po ON 
    po.persona_id = rb.persona_id 
    AND po.overrides_role = TRUE 
    AND po.skill_id = rb.skill_id
WHERE po.persona_id IS NULL OR po.overrides_role = TRUE

UNION ALL

SELECT 
    po.persona_id,
    p.name as persona_name,
    p.role_id,
    r.name as role_name,
    po.item_id,
    po.skill_id,
    po.skill_name,
    po.proficiency_level,
    po.years_experience,
    po.sequence_order,
    po.source
FROM persona_overrides po
JOIN personas p ON p.id = po.persona_id
JOIN org_roles r ON r.id = p.role_id
WHERE po.is_additional = TRUE;

DO $$ BEGIN RAISE NOTICE '  ✓ v_effective_persona_skills created'; END $$;

-- =====================================================================
-- 4. EFFECTIVE PERSONA STAKEHOLDERS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating v_effective_persona_stakeholders...'; END $$;

CREATE OR REPLACE VIEW public.v_effective_persona_stakeholders AS
WITH role_baseline AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        r.id as role_id,
        r.name as role_name,
        rs.id as item_id,
        rs.stakeholder_id,
        rs.stakeholder_name,
        rs.relationship_type,
        rs.influence_level,
        rs.interaction_frequency,
        rs.collaboration_quality_baseline as collaboration_quality,
        rs.sequence_order,
        'role' as source
    FROM personas p
    JOIN org_roles r ON p.role_id = r.id
    JOIN role_stakeholders rs ON rs.role_id = r.id
    WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL
),
persona_overrides AS (
    SELECT 
        ps.persona_id,
        ps.id as item_id,
        ps.stakeholder_id,
        ps.stakeholder_name,
        ps.relationship_type,
        ps.influence_level,
        ps.interaction_frequency,
        ps.collaboration_quality,
        ps.is_additional,
        ps.overrides_role,
        ps.sequence_order,
        CASE 
            WHEN ps.is_additional THEN 'persona_addition'
            WHEN ps.overrides_role THEN 'persona_override'
            ELSE 'persona'
        END as source
    FROM persona_stakeholders ps
)
SELECT 
    rb.persona_id,
    rb.persona_name,
    rb.role_id,
    rb.role_name,
    COALESCE(po.item_id, rb.item_id) as item_id,
    COALESCE(po.stakeholder_id, rb.stakeholder_id) as stakeholder_id,
    COALESCE(po.stakeholder_name, rb.stakeholder_name) as stakeholder_name,
    COALESCE(po.relationship_type, rb.relationship_type) as relationship_type,
    COALESCE(po.influence_level, rb.influence_level) as influence_level,
    COALESCE(po.interaction_frequency, rb.interaction_frequency) as interaction_frequency,
    COALESCE(po.collaboration_quality, rb.collaboration_quality) as collaboration_quality,
    COALESCE(po.sequence_order, rb.sequence_order) as sequence_order,
    COALESCE(po.source, rb.source) as source
FROM role_baseline rb
LEFT JOIN persona_overrides po ON 
    po.persona_id = rb.persona_id 
    AND po.overrides_role = TRUE 
    AND po.stakeholder_id = rb.stakeholder_id
WHERE po.persona_id IS NULL OR po.overrides_role = TRUE

UNION ALL

SELECT 
    po.persona_id,
    p.name as persona_name,
    p.role_id,
    r.name as role_name,
    po.item_id,
    po.stakeholder_id,
    po.stakeholder_name,
    po.relationship_type,
    po.influence_level,
    po.interaction_frequency,
    po.collaboration_quality,
    po.sequence_order,
    po.source
FROM persona_overrides po
JOIN personas p ON p.id = po.persona_id
JOIN org_roles r ON r.id = p.role_id
WHERE po.is_additional = TRUE;

DO $$ BEGIN RAISE NOTICE '  ✓ v_effective_persona_stakeholders created'; END $$;

-- =====================================================================
-- 5. EFFECTIVE PERSONA AI MATURITY
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Creating v_effective_persona_ai_maturity...'; END $$;

CREATE OR REPLACE VIEW public.v_effective_persona_ai_maturity AS
SELECT 
    p.id as persona_id,
    p.name as persona_name,
    r.id as role_id,
    r.name as role_name,
    
    -- Use persona values if they exist and override, else use role values
    CASE 
        WHEN pam.overrides_role = TRUE THEN pam.ai_maturity_score
        ELSE COALESCE(pam.ai_maturity_score, ram.ai_maturity_score)
    END as ai_maturity_score,
    
    CASE 
        WHEN pam.overrides_role = TRUE THEN pam.work_complexity_score
        ELSE COALESCE(pam.work_complexity_score, ram.work_complexity_score)
    END as work_complexity_score,
    
    CASE 
        WHEN pam.overrides_role = TRUE THEN 'persona_override'
        WHEN pam.persona_id IS NOT NULL THEN 'persona'
        ELSE 'role'
    END as source,
    
    COALESCE(pam.rationale, ram.rationale) as rationale,
    COALESCE(pam.assessed_at, ram.assessed_at) as assessed_at

FROM personas p
JOIN org_roles r ON p.role_id = r.id
LEFT JOIN role_ai_maturity ram ON ram.role_id = r.id
LEFT JOIN persona_ai_maturity pam ON pam.persona_id = p.id
WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL;

DO $$ BEGIN RAISE NOTICE '  ✓ v_effective_persona_ai_maturity created'; END $$;

-- =====================================================================
-- 6. EFFECTIVE PERSONA VPANES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Creating v_effective_persona_vpanes...'; END $$;

CREATE OR REPLACE VIEW public.v_effective_persona_vpanes AS
WITH all_dimensions AS (
    -- Get all dimension combinations (persona x dimension)
    SELECT DISTINCT
        p.id as persona_id,
        p.name as persona_name,
        r.id as role_id,
        r.name as role_name,
        d.id as dimension_id,
        d.dimension_name,
        d.dimension_code
    FROM personas p
    JOIN org_roles r ON p.role_id = r.id
    CROSS JOIN vpanes_dimensions d
    WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL
)
SELECT 
    ad.persona_id,
    ad.persona_name,
    ad.role_id,
    ad.role_name,
    ad.dimension_id,
    ad.dimension_name,
    ad.dimension_code,
    
    -- Use persona score if it exists and overrides, else use role score
    CASE 
        WHEN pvs.overrides_role = TRUE THEN pvs.score
        ELSE COALESCE(pvs.score, rvs.score)
    END as score,
    
    CASE 
        WHEN pvs.overrides_role = TRUE THEN 'persona_override'
        WHEN pvs.persona_id IS NOT NULL THEN 'persona'
        WHEN rvs.role_id IS NOT NULL THEN 'role'
        ELSE 'not_assessed'
    END as source,
    
    COALESCE(pvs.scoring_rationale, rvs.scoring_rationale) as scoring_rationale,
    COALESCE(pvs.assessed_at, rvs.assessed_at) as assessed_at

FROM all_dimensions ad
LEFT JOIN role_vpanes_scores rvs ON 
    rvs.role_id = ad.role_id 
    AND rvs.dimension_id = ad.dimension_id
LEFT JOIN persona_vpanes_scores pvs ON 
    pvs.persona_id = ad.persona_id 
    AND pvs.dimension_id = ad.dimension_id;

DO $$ BEGIN RAISE NOTICE '  ✓ v_effective_persona_vpanes created'; END $$;

-- =====================================================================
-- 7. COMPLETE PERSONA CONTEXT VIEW
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Creating v_persona_complete_context...'; END $$;

CREATE OR REPLACE VIEW public.v_persona_complete_context AS
SELECT 
    -- Persona identity
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.title,
    p.tagline,
    
    -- Org structure (inherited from role, but stored on persona)
    r.id as role_id,
    r.name as role_name,
    p.function_id,
    p.function_name,
    p.department_id,
    p.department_name,
    
    -- Persona specifics
    p.archetype,
    p.seniority_level,
    p.years_of_experience,
    p.work_pattern,
    p.ai_maturity_score as persona_ai_score,
    
    -- Effective AI maturity
    eam.ai_maturity_score as effective_ai_score,
    eam.work_complexity_score as effective_complexity_score,
    eam.source as ai_source,
    
    -- Counts of effective items
    (SELECT COUNT(*) FROM v_effective_persona_responsibilities epr WHERE epr.persona_id = p.id) as responsibility_count,
    (SELECT COUNT(*) FROM v_effective_persona_tools ept WHERE ept.persona_id = p.id) as tool_count,
    (SELECT COUNT(*) FROM v_effective_persona_skills eps WHERE eps.persona_id = p.id) as skill_count,
    (SELECT COUNT(*) FROM v_effective_persona_stakeholders epst WHERE epst.persona_id = p.id) as stakeholder_count,
    
    -- Persona-only counts
    (SELECT COUNT(*) FROM persona_goals pg WHERE pg.persona_id = p.id) as goal_count,
    (SELECT COUNT(*) FROM persona_pain_points ppp WHERE ppp.persona_id = p.id) as pain_point_count,
    (SELECT COUNT(*) FROM persona_challenges pc WHERE pc.persona_id = p.id) as challenge_count,
    
    -- Evidence count
    (SELECT COUNT(DISTINCT pes.evidence_source_id) 
     FROM persona_evidence_sources pes 
     WHERE pes.persona_id = p.id) as evidence_source_count,
    
    -- Metadata
    p.is_active,
    p.created_at,
    p.updated_at

FROM personas p
JOIN org_roles r ON p.role_id = r.id
LEFT JOIN v_effective_persona_ai_maturity eam ON eam.persona_id = p.id
WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL;

DO $$ BEGIN RAISE NOTICE '  ✓ v_persona_complete_context created'; END $$;

-- =====================================================================
-- 8. SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_personas INTEGER;
    total_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_personas FROM public.personas WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'EFFECTIVE VIEWS CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Effective Views (Role + Persona Combined):';
    RAISE NOTICE '  ✓ v_effective_persona_responsibilities';
    RAISE NOTICE '  ✓ v_effective_persona_tools';
    RAISE NOTICE '  ✓ v_effective_persona_skills';
    RAISE NOTICE '  ✓ v_effective_persona_stakeholders';
    RAISE NOTICE '  ✓ v_effective_persona_ai_maturity';
    RAISE NOTICE '  ✓ v_effective_persona_vpanes';
    RAISE NOTICE '  ✓ v_persona_complete_context (master view)';
    RAISE NOTICE '';
    RAISE NOTICE 'Usage Example:';
    RAISE NOTICE '  SELECT * FROM v_effective_persona_responsibilities';
    RAISE NOTICE '  WHERE persona_id = ''<persona-uuid>''';
    RAISE NOTICE '  ORDER BY sequence_order;';
    RAISE NOTICE '';
    RAISE NOTICE 'Source Field Values:';
    RAISE NOTICE '  • role = Inherited from role baseline';
    RAISE NOTICE '  • persona_addition = Added by persona only';
    RAISE NOTICE '  • persona_override = Persona replaces role value';
    RAISE NOTICE '';
    RAISE NOTICE 'Statistics:';
    RAISE NOTICE '  • Total roles: %', total_roles;
    RAISE NOTICE '  • Total personas: %', total_personas;
    RAISE NOTICE '';
    RAISE NOTICE 'Schema is now complete and ready for data!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
