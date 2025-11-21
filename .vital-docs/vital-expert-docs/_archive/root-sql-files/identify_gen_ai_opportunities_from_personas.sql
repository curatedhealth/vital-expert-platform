-- =====================================================================
-- IDENTIFY GEN AI OPPORTUNITIES FROM EXISTING PERSONAS
-- Based on: PERSONA_STRATEGY_GOLD_STANDARD.md archetype framework
-- Purpose: Discover Gen AI opportunities by analyzing persona attributes
-- =====================================================================

-- =====================================================================
-- STEP 1: CREATE VIEW FOR ARCHETYPE INFERENCE
-- =====================================================================

-- Create a view that can be reused across queries
CREATE OR REPLACE VIEW v_persona_archetype_scores AS
WITH persona_archetype_scores AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        p.role_id,
        r.name as role_name,
        
        -- Work Complexity Score (0-100)
        -- Higher = more strategic, Lower = more routine
        (
            -- Seniority weight (0-30 points)
            CASE 
                WHEN p.seniority_level = 'entry' THEN 10
                WHEN p.seniority_level = 'mid' THEN 20
                WHEN p.seniority_level = 'senior' THEN 30
                WHEN p.seniority_level = 'director' THEN 40
                WHEN p.seniority_level = 'executive' THEN 50
                WHEN p.seniority_level = 'c_suite' THEN 60
                ELSE 20
            END +
            -- Team size weight (0-20 points)
            COALESCE(
                CASE 
                    WHEN p.team_size_typical = 0 THEN 5
                    WHEN p.team_size_typical BETWEEN 1 AND 5 THEN 10
                    WHEN p.team_size_typical BETWEEN 6 AND 15 THEN 20
                    WHEN p.team_size_typical > 15 THEN 30
                    ELSE 10
                END, 10
            ) +
            -- Budget authority weight (0-20 points)
            CASE 
                WHEN p.budget_authority = 'none' THEN 5
                WHEN p.budget_authority = 'limited' THEN 10
                WHEN p.budget_authority = 'moderate' THEN 20
                WHEN p.budget_authority = 'significant' THEN 30
                ELSE 10
            END +
            -- Years of experience weight (0-20 points)
            COALESCE(
                CASE 
                    WHEN p.years_of_experience < 3 THEN 5
                    WHEN p.years_of_experience BETWEEN 3 AND 7 THEN 10
                    WHEN p.years_of_experience BETWEEN 8 AND 12 THEN 20
                    WHEN p.years_of_experience > 12 THEN 30
                    ELSE 10
                END, 10
            )
        ) as work_complexity_score,
        
        -- AI Maturity Score (0-100)
        -- Higher = more AI-ready, Lower = more cautious
        (
            -- Technology adoption weight (0-40 points)
            CASE 
                WHEN p.technology_adoption = 'laggard' THEN 10
                WHEN p.technology_adoption = 'late_majority' THEN 20
                WHEN p.technology_adoption = 'early_majority' THEN 40
                WHEN p.technology_adoption = 'early_adopter' THEN 60
                WHEN p.technology_adoption = 'innovator' THEN 80
                ELSE 30
            END +
            -- Risk tolerance weight (0-30 points)
            CASE 
                WHEN p.risk_tolerance = 'very_conservative' THEN 10
                WHEN p.risk_tolerance = 'conservative' THEN 20
                WHEN p.risk_tolerance = 'moderate' THEN 40
                WHEN p.risk_tolerance = 'aggressive' THEN 60
                ELSE 30
            END +
            -- Change readiness weight (0-30 points)
            CASE 
                WHEN p.change_readiness = 'low' THEN 10
                WHEN p.change_readiness = 'moderate' THEN 30
                WHEN p.change_readiness = 'high' THEN 50
                ELSE 25
            END
        ) as ai_maturity_score
        
    FROM public.personas p
    LEFT JOIN public.org_roles r ON p.role_id = r.id
    WHERE p.deleted_at IS NULL
),

persona_archetypes AS (
    SELECT 
        *,
        -- Infer archetype based on scores
        CASE 
            WHEN work_complexity_score < 50 AND ai_maturity_score >= 50 THEN 'AUTOMATOR'
            WHEN work_complexity_score >= 50 AND ai_maturity_score >= 50 THEN 'ORCHESTRATOR'
            WHEN work_complexity_score < 50 AND ai_maturity_score < 50 THEN 'LEARNER'
            WHEN work_complexity_score >= 50 AND ai_maturity_score < 50 THEN 'SKEPTIC'
            ELSE 'LEARNER' -- Default to Learner if unclear
        END as inferred_archetype,
        
        -- Confidence score (0-100)
        CASE 
            WHEN ABS(work_complexity_score - 50) > 20 AND ABS(ai_maturity_score - 50) > 20 THEN 90
            WHEN ABS(work_complexity_score - 50) > 15 AND ABS(ai_maturity_score - 50) > 15 THEN 75
            WHEN ABS(work_complexity_score - 50) > 10 AND ABS(ai_maturity_score - 50) > 10 THEN 60
            ELSE 50
        END as confidence_score
    FROM persona_archetype_scores
)
SELECT * FROM persona_archetypes;

-- =====================================================================
-- STEP 2: IDENTIFY GEN AI OPPORTUNITIES BY ARCHETYPE
-- =====================================================================

SELECT 
    '=== ARCHETYPE DISTRIBUTION ===' as section;

SELECT 
    inferred_archetype,
    COUNT(*) as persona_count,
    ROUND(AVG(work_complexity_score), 1) as avg_work_complexity,
    ROUND(AVG(ai_maturity_score), 1) as avg_ai_maturity,
    ROUND(AVG(confidence_score), 1) as avg_confidence,
    COUNT(CASE WHEN confidence_score >= 75 THEN 1 END) as high_confidence_count
FROM v_persona_archetype_scores
GROUP BY inferred_archetype
ORDER BY persona_count DESC;

-- =====================================================================
-- STEP 3: ANALYZE PAIN POINTS BY ARCHETYPE (Gen AI Opportunities)
-- =====================================================================

SELECT 
    '=== GEN AI OPPORTUNITIES FROM PAIN POINTS ===' as section;

-- Note: This assumes you have a pain_points table linked to personas
-- Adjust based on your actual schema

SELECT 
    pa.inferred_archetype,
    pp.pain_point_text as pain_text,
    COUNT(DISTINCT pa.persona_id) as affected_personas,
    -- Categorize pain points into Gen AI opportunity types
    CASE 
        WHEN pp.pain_point_text ILIKE '%manual%' OR pp.pain_point_text ILIKE '%repetitive%' OR pp.pain_point_text ILIKE '%routine%' THEN 'Automation'
        WHEN pp.pain_point_text ILIKE '%synthesize%' OR pp.pain_point_text ILIKE '%analyze%' OR pp.pain_point_text ILIKE '%complex%' THEN 'Augmentation'
        WHEN pp.pain_point_text ILIKE '%learn%' OR pp.pain_point_text ILIKE '%understand%' OR pp.pain_point_text ILIKE '%guidance%' THEN 'Learning'
        WHEN pp.pain_point_text ILIKE '%trust%' OR pp.pain_point_text ILIKE '%verify%' OR pp.pain_point_text ILIKE '%validate%' THEN 'Transparency'
        ELSE 'Other'
    END as gen_ai_opportunity_type
FROM v_persona_archetype_scores pa
LEFT JOIN public.persona_pain_points pp ON pp.persona_id = pa.persona_id
WHERE pp.pain_point_text IS NOT NULL
GROUP BY pa.inferred_archetype, pp.pain_point_text, gen_ai_opportunity_type
ORDER BY pa.inferred_archetype, affected_personas DESC
LIMIT 50;

-- =====================================================================
-- STEP 4: IDENTIFY ROLES NEEDING 4 PERSONAS (One per Archetype)
-- =====================================================================

SELECT 
    '=== ROLES NEEDING COMPLETE PERSONA SET (4 per role) ===' as section;

WITH role_archetype_counts AS (
    SELECT 
        r.id as role_id,
        r.name as role_name,
        COUNT(DISTINCT pa.inferred_archetype) as archetype_count,
        COUNT(DISTINCT pa.persona_id) as total_personas,
        STRING_AGG(DISTINCT pa.inferred_archetype, ', ' ORDER BY pa.inferred_archetype) as existing_archetypes,
        CASE 
            WHEN COUNT(DISTINCT pa.inferred_archetype) < 4 THEN 'INCOMPLETE'
            ELSE 'COMPLETE'
        END as status
    FROM public.org_roles r
    LEFT JOIN v_persona_archetype_scores pa ON pa.role_id = r.id
    WHERE r.deleted_at IS NULL
    GROUP BY r.id, r.name
    HAVING COUNT(DISTINCT pa.persona_id) > 0
)

SELECT 
    role_name,
    total_personas,
    archetype_count,
    existing_archetypes,
    status,
    CASE 
        WHEN existing_archetypes NOT LIKE '%AUTOMATOR%' THEN 'Missing AUTOMATOR'
        WHEN existing_archetypes NOT LIKE '%ORCHESTRATOR%' THEN 'Missing ORCHESTRATOR'
        WHEN existing_archetypes NOT LIKE '%LEARNER%' THEN 'Missing LEARNER'
        WHEN existing_archetypes NOT LIKE '%SKEPTIC%' THEN 'Missing SKEPTIC'
        ELSE 'Complete'
    END as missing_archetypes
FROM role_archetype_counts
WHERE status = 'INCOMPLETE'
ORDER BY total_personas DESC, archetype_count ASC
LIMIT 50;

-- =====================================================================
-- STEP 5: GEN AI OPPORTUNITY PRIORITIZATION
-- =====================================================================

SELECT 
    '=== GEN AI OPPORTUNITY PRIORITIZATION ===' as section;

-- Opportunities ranked by: Reach × Impact × Adoption Readiness
WITH opportunity_scores AS (
    SELECT 
        CASE 
            WHEN pp.pain_point_text ILIKE '%manual%' OR pp.pain_point_text ILIKE '%repetitive%' THEN 'Workflow Automation'
            WHEN pp.pain_point_text ILIKE '%synthesize%' OR pp.pain_point_text ILIKE '%analyze%' THEN 'Intelligence Augmentation'
            WHEN pp.pain_point_text ILIKE '%learn%' OR pp.pain_point_text ILIKE '%guidance%' THEN 'Guided Learning'
            WHEN pp.pain_point_text ILIKE '%trust%' OR pp.pain_point_text ILIKE '%verify%' THEN 'Transparency & Validation'
            ELSE 'Other'
        END as opportunity_name,
        pa.inferred_archetype,
        COUNT(DISTINCT pa.persona_id) as reach,
        -- Impact score based on archetype
        CASE 
            WHEN pa.inferred_archetype = 'AUTOMATOR' THEN 90  -- High impact for automation
            WHEN pa.inferred_archetype = 'ORCHESTRATOR' THEN 85 -- High impact for augmentation
            WHEN pa.inferred_archetype = 'LEARNER' THEN 70     -- Medium impact for learning
            WHEN pa.inferred_archetype = 'SKEPTIC' THEN 60     -- Lower impact, but critical for trust
            ELSE 50
        END as impact_score,
        -- Adoption readiness based on AI maturity
        pa.ai_maturity_score as adoption_readiness
    FROM v_persona_archetype_scores pa
    LEFT JOIN public.persona_pain_points pp ON pp.persona_id = pa.persona_id
    WHERE pp.pain_point_text IS NOT NULL
    GROUP BY opportunity_name, pa.inferred_archetype, pa.ai_maturity_score
)

SELECT 
    opportunity_name,
    inferred_archetype,
    reach,
    impact_score,
    ROUND(adoption_readiness, 1) as adoption_readiness,
    ROUND((reach * impact_score * adoption_readiness / 10000), 2) as priority_score
FROM opportunity_scores
ORDER BY priority_score DESC
LIMIT 30;

-- =====================================================================
-- STEP 6: RECOMMENDATIONS FOR EACH ARCHETYPE
-- =====================================================================

SELECT 
    '=== RECOMMENDATIONS BY ARCHETYPE ===' as section;

SELECT 
    inferred_archetype,
    COUNT(*) as persona_count,
    CASE 
        WHEN inferred_archetype = 'AUTOMATOR' THEN 
            'Focus: Workflow automation, template generation, batch processing. Service Layer: Workflows. Priority: HIGH (fastest ROI)'
        WHEN inferred_archetype = 'ORCHESTRATOR' THEN 
            'Focus: Multi-agent reasoning, complex synthesis, strategic planning. Service Layer: Ask Panel. Priority: HIGH (high value)'
        WHEN inferred_archetype = 'LEARNER' THEN 
            'Focus: Guided workflows, templates with examples, progressive complexity. Service Layer: Ask Expert + Guided Workflows. Priority: MEDIUM (guided adoption)'
        WHEN inferred_archetype = 'SKEPTIC' THEN 
            'Focus: Transparency, citations, human-in-the-loop, quality assurance. Service Layer: Ask Panel + HITL Workflows. Priority: MEDIUM (critical for trust)'
    END as recommendation
FROM v_persona_archetype_scores
GROUP BY inferred_archetype
ORDER BY persona_count DESC;

