-- =========================================================================
-- LEGACY PROMPTS MIGRATION - HIGH PRIORITY DIGITAL HEALTH PROMPTS
-- =========================================================================
-- Purpose: Migrate 48 high-priority legacy prompts from the 'prompts' table
--          into the PROMPTS™ framework structure (dh_prompt table)
-- Target: FORGE™, VALUE™, PROOF™ framework prompts for digital health
-- Version: 1.0.0
-- Date: November 3, 2025
-- =========================================================================

-- =========================================================================
-- STEP 1: SESSION SETUP
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'session_config') THEN
    CREATE TEMP TABLE session_config (tenant_id UUID);
  END IF;
END$$;

DELETE FROM session_config;

INSERT INTO session_config (tenant_id)
SELECT id FROM dh_tenant WHERE slug = 'digital-health-startup' LIMIT 1;

-- =========================================================================
-- STEP 2: VERIFY TENANT
-- =========================================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM session_config LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant not found. Please ensure digital-health-startup tenant exists.';
  END IF;
  
  RAISE NOTICE 'Using tenant ID: %', v_tenant_id;
END$$;

-- =========================================================================
-- STEP 3: ENSURE FORGE™ SUITE EXISTS
-- =========================================================================

INSERT INTO dh_prompt_suite (
    tenant_id,
    unique_id,
    name,
    description,
    category,
    tags,
    metadata,
    is_active,
    position
)
SELECT
    sc.tenant_id,
    'SUITE-FORGE',
    'FORGE™ - Digital Health Development',
    'Navigate the unique challenges of digital health, digital therapeutics (DTx), and software as a medical device (SaMD).',
    'Digital Health',
    ARRAY['digital_health', 'DTx', 'SaMD', 'digital_biomarker', 'FDA_Digital_Health'],
    jsonb_build_object(
        'acronym', 'FORGE™',
        'full_name', 'Foresight in Outcomes, Regulation, Growth & Endpoint Excellence',
        'tagline', 'Navigate Digital Health Innovation',
        'domain', 'Digital Health & DTx',
        'function', 'DIGITAL_HEALTH',
        'prompt_count_estimate', 200,
        'key_areas', jsonb_build_array(
            'Digital therapeutics (DTx) development',
            'Software as a Medical Device (SaMD) pathways',
            'Digital biomarker validation',
            'Mobile health app development',
            'Clinical validation of digital health',
            'FDA Digital Health Center of Excellence guidance'
        ),
        'target_roles', jsonb_build_array(
            'Digital Health Developers',
            'DTx Clinical Teams',
            'SaMD Regulatory Specialists'
        )
    ),
    TRUE,
    10
FROM session_config sc
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata;

-- =========================================================================
-- STEP 4: CREATE SUB-SUITES FOR FORGE™
-- =========================================================================

-- Get the FORGE suite ID
WITH forge_suite AS (
    SELECT id as suite_id
    FROM dh_prompt_suite
    WHERE unique_id = 'SUITE-FORGE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
)
INSERT INTO dh_prompt_subsuite (
    tenant_id,
    suite_id,
    unique_id,
    name,
    description,
    tags,
    metadata,
    is_active,
    position
)
SELECT
    sc.tenant_id,
    fs.suite_id,
    subsuite_data.unique_id,
    subsuite_data.name,
    subsuite_data.description,
    subsuite_data.tags,
    subsuite_data.metadata,
    TRUE as is_active,
    subsuite_data.position
FROM session_config sc
CROSS JOIN forge_suite fs
CROSS JOIN (VALUES
    (
        'SUBSUITE-FORGE-REGULATE',
        'FORGE_REGULATE - Regulatory Pathways',
        'FDA regulatory pathways for digital health products: SaMD classification, 510(k), De Novo, breakthrough designation',
        ARRAY['regulatory', 'FDA', 'SaMD', '510k', 'De_Novo'],
        jsonb_build_object(
            'focus', 'Regulatory Strategy & FDA Pathways',
            'prompt_count_estimate', 50
        ),
        1
    ),
    (
        'SUBSUITE-FORGE-DEVELOP',
        'FORGE_DEVELOP - Product Development',
        'Digital health product strategy, architecture, and concept development',
        ARRAY['product_strategy', 'DTx_development', 'architecture'],
        jsonb_build_object(
            'focus', 'Product Strategy & Development',
            'prompt_count_estimate', 40
        ),
        2
    ),
    (
        'SUBSUITE-FORGE-VALIDATE',
        'FORGE_VALIDATE - Clinical Validation',
        'Digital biomarker validation, DTx clinical validation, endpoint selection, RCT design',
        ARRAY['clinical_validation', 'digital_biomarker', 'endpoint_selection', 'RCT_design'],
        jsonb_build_object(
            'focus', 'Clinical Validation & Evidence',
            'prompt_count_estimate', 60
        ),
        3
    )
) AS subsuite_data(unique_id, name, description, tags, metadata, position)
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata;

-- =========================================================================
-- STEP 5: MIGRATE HIGH-PRIORITY FORGE™ REGULATORY PROMPTS
-- =========================================================================

-- Get subsuite IDs
WITH forge_regulate_subsuite AS (
    SELECT id as subsuite_id
    FROM dh_prompt_subsuite
    WHERE unique_id = 'SUBSUITE-FORGE-REGULATE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
),
forge_develop_subsuite AS (
    SELECT id as subsuite_id
    FROM dh_prompt_subsuite
    WHERE unique_id = 'SUBSUITE-FORGE-DEVELOP'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
),
forge_validate_subsuite AS (
    SELECT id as subsuite_id
    FROM dh_prompt_subsuite
    WHERE unique_id = 'SUBSUITE-FORGE-VALIDATE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
),
forge_suite AS (
    SELECT id as suite_id
    FROM dh_prompt_suite
    WHERE unique_id = 'SUITE-FORGE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
)
-- Insert/update prompts from legacy 'prompts' table
INSERT INTO dh_prompt (
    tenant_id,
    task_id, -- Will be NULL for now, linked later per use case
    name,
    pattern,
    system_prompt,
    user_template,
    metadata,
    unique_id,
    category,
    tags,
    version_label,
    owner,
    model_config,
    guardrails,
    evals,
    rollout
)
SELECT
    sc.tenant_id,
    NULL as task_id, -- Not linked to tasks yet
    lp.display_name as name,
    'CoT' as pattern, -- Default to Chain-of-Thought for FORGE prompts
    E'**ROLE**: You are a digital health expert with deep knowledge of ' || lp.category || E'.\n\n**TASK**: ' || lp.display_name || E'\n\n**INSTRUCTIONS**: Provide expert guidance on this digital health topic.' as system_prompt,
    E'**INPUT**: {user_context}\n\n**YOUR RESPONSE**:' as user_template,
    jsonb_build_object(
        'suite', 'FORGE™',
        'sub_suite', CASE
            WHEN lp.name LIKE '%regulate%' OR lp.name LIKE '%samd%' OR lp.name LIKE '%510%' OR lp.name LIKE '%de-novo%' OR lp.name LIKE '%fda%' THEN 'FORGE_REGULATE'
            WHEN lp.name LIKE '%develop%' OR lp.name LIKE '%product%' OR lp.name LIKE '%architecture%' THEN 'FORGE_DEVELOP'
            WHEN lp.name LIKE '%validate%' OR lp.name LIKE '%biomarker%' OR lp.name LIKE '%endpoint%' OR lp.name LIKE '%rct%' THEN 'FORGE_VALIDATE'
            ELSE 'FORGE_GENERAL'
        END,
        'legacy_id', lp.id::text,
        'legacy_name', lp.name,
        'complexity', lp.complexity_level,
        'prerequisite_prompts', COALESCE(lp.prerequisite_prompts, '[]'::jsonb),
        'prerequisite_capabilities', lp.prerequisite_capabilities,
        'migrated_from', 'legacy_prompts_table',
        'migration_date', '2025-11-03'
    ) as metadata,
    'PRM-FORGE-LEGACY-' || lpad(ROW_NUMBER() OVER (ORDER BY lp.name)::text, 3, '0') as unique_id,
    lp.category as category,
    ARRAY['digital_health', 'FORGE', lp.complexity_level, lp.domain] as tags,
    lp.version as version_label,
    jsonb_build_array('P06_DTXCMO', 'P03_RA') as owner, -- Default owners for digital health
    jsonb_build_object(
        'model', 'claude-3-5-sonnet-20241022',
        'max_tokens', 4000,
        'temperature', 0.3
    ) as model_config,
    jsonb_build_object(
        'content_safety', true,
        'pii_detection', true,
        'compliance_check', jsonb_build_array('HIPAA', 'FDA_guidelines')
    ) as guardrails,
    jsonb_build_object(
        'evaluation_criteria', jsonb_build_array(
            'Regulatory accuracy',
            'Clinical relevance',
            'Actionability',
            'Completeness'
        )
    ) as evals,
    jsonb_build_object(
        'environment', 'production',
        'rollout_percentage', 100,
        'enabled', true
    ) as rollout
FROM session_config sc
CROSS JOIN prompts lp
WHERE (
    lp.name LIKE 'forge-%'
    OR lp.name LIKE '%samd%'
    OR lp.name LIKE '%dtx%'
    OR lp.name LIKE '%digital-biomarker%'
    OR lp.name LIKE '%digital-endpoint%'
)
AND lp.domain = 'general' -- Only migrate general domain FORGE prompts
AND lp.status = 'active'
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET
    name = EXCLUDED.name,
    pattern = EXCLUDED.pattern,
    metadata = EXCLUDED.metadata,
    version_label = EXCLUDED.version_label,
    model_config = EXCLUDED.model_config;

-- =========================================================================
-- STEP 6: CREATE SUITE-PROMPT LINKS
-- =========================================================================

-- Link FORGE prompts to FORGE suite
WITH forge_suite AS (
    SELECT id as suite_id
    FROM dh_prompt_suite
    WHERE unique_id = 'SUITE-FORGE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
),
forge_regulate_subsuite AS (
    SELECT id as subsuite_id
    FROM dh_prompt_subsuite
    WHERE unique_id = 'SUBSUITE-FORGE-REGULATE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
),
forge_develop_subsuite AS (
    SELECT id as subsuite_id
    FROM dh_prompt_subsuite
    WHERE unique_id = 'SUBSUITE-FORGE-DEVELOP'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
),
forge_validate_subsuite AS (
    SELECT id as subsuite_id
    FROM dh_prompt_subsuite
    WHERE unique_id = 'SUBSUITE-FORGE-VALIDATE'
    AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
    LIMIT 1
)
INSERT INTO dh_prompt_suite_prompt (
    tenant_id,
    suite_id,
    subsuite_id,
    prompt_id,
    position
)
SELECT DISTINCT
    p.tenant_id,
    fs.suite_id,
    CASE
        WHEN p.metadata->>'sub_suite' = 'FORGE_REGULATE' THEN fr.subsuite_id
        WHEN p.metadata->>'sub_suite' = 'FORGE_DEVELOP' THEN fd.subsuite_id
        WHEN p.metadata->>'sub_suite' = 'FORGE_VALIDATE' THEN fv.subsuite_id
        ELSE NULL
    END as subsuite_id,
    p.id as prompt_id,
    ROW_NUMBER() OVER (PARTITION BY p.metadata->>'sub_suite' ORDER BY p.unique_id) as position
FROM dh_prompt p
CROSS JOIN forge_suite fs
LEFT JOIN forge_regulate_subsuite fr ON p.metadata->>'sub_suite' = 'FORGE_REGULATE'
LEFT JOIN forge_develop_subsuite fd ON p.metadata->>'sub_suite' = 'FORGE_DEVELOP'
LEFT JOIN forge_validate_subsuite fv ON p.metadata->>'sub_suite' = 'FORGE_VALIDATE'
WHERE p.unique_id LIKE 'PRM-FORGE-LEGACY-%'
AND p.tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
ON CONFLICT (tenant_id, suite_id, prompt_id) DO NOTHING;

-- =========================================================================
-- VERIFICATION QUERIES
-- =========================================================================

-- Show migrated prompts
SELECT 
    'FORGE™ Prompts Migrated' as metric,
    COUNT(*) as count
FROM dh_prompt
WHERE unique_id LIKE 'PRM-FORGE-LEGACY-%'
AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1);

-- Show prompts by sub-suite
SELECT 
    metadata->>'sub_suite' as sub_suite,
    COUNT(*) as prompt_count,
    array_agg(DISTINCT metadata->>'complexity') as complexity_levels
FROM dh_prompt
WHERE unique_id LIKE 'PRM-FORGE-LEGACY-%'
AND tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
GROUP BY metadata->>'sub_suite'
ORDER BY prompt_count DESC;

-- Show suite-prompt links
SELECT 
    ps.name as suite_name,
    pss.name as subsuite_name,
    COUNT(*) as linked_prompts
FROM dh_prompt_suite_prompt psp
INNER JOIN dh_prompt_suite ps ON psp.suite_id = ps.id
LEFT JOIN dh_prompt_subsuite pss ON psp.subsuite_id = pss.id
WHERE ps.unique_id = 'SUITE-FORGE'
AND ps.tenant_id = (SELECT tenant_id FROM session_config LIMIT 1)
GROUP BY ps.name, pss.name
ORDER BY linked_prompts DESC;

-- =========================================================================
-- END OF MIGRATION
-- =========================================================================

RAISE NOTICE '✅ Legacy FORGE™ prompts migrated successfully!';

