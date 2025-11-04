-- ============================================================================
-- MAP AGENTS TO BOTH ORGANIZATIONS
-- Intelligent mapping for Pharma and Digital Health structures
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║           🔗 MAPPING AGENTS TO PHARMA & DIGITAL HEALTH ORGS                 ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- PART 1: Map Agents to PHARMA Organization
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'PART 1: Mapping Agents → Pharma Roles'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Add pharma_role_id to agents metadata
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{pharma_role_id}',
    to_jsonb(r.id::text)
)
FROM org_roles r
WHERE a.is_active = true
AND r.unique_id LIKE 'ROLE-PHARMA-%'
AND (
    -- Regulatory matches
    (a.category = 'regulatory' AND r.role_name LIKE '%Regulatory%')
    OR (a.name LIKE '%regulatory%' AND r.role_name LIKE '%Regulatory%')
    OR (a.name LIKE '%compliance%' AND r.role_name LIKE '%Compliance%')
    
    -- Clinical matches
    OR (a.category = 'clinical' AND r.role_name LIKE '%Clinical%')
    OR (a.name LIKE '%clinical%trial%' AND r.role_name = 'Clinical Project Manager')
    OR (a.name LIKE '%clinical%research%' AND r.role_name = 'Clinical Research Associate')
    OR (a.name LIKE '%clinical%operations%' AND r.role_name = 'Clinical Operations Manager')
    
    -- Pharmacovigilance matches
    OR (a.name LIKE '%pharmacovigilance%' AND r.role_name LIKE '%Pharmacovigilance%')
    OR (a.name LIKE '%safety%' AND r.role_name LIKE '%Safety%')
    OR (a.name LIKE '%adverse%event%' AND r.role_name = 'Pharmacovigilance Specialist')
    
    -- Quality matches
    OR (a.name LIKE '%quality%' AND r.role_name LIKE '%Quality%')
    OR (a.name LIKE '%gmp%' AND r.role_name LIKE '%Quality Assurance%')
    
    -- Manufacturing matches
    OR (a.name LIKE '%manufacturing%' AND r.role_name LIKE '%Manufacturing%')
    OR (a.name LIKE '%process%' AND r.role_name = 'Process Engineer')
    
    -- Medical Affairs matches
    OR (a.name LIKE '%medical%writer%' AND r.role_name = 'Medical Writer')
    OR (a.name LIKE '%medical%director%' AND r.role_name = 'Medical Director')
    OR (a.name LIKE '%msl%' AND r.role_name = 'Medical Science Liaison')
    
    -- Commercial matches
    OR (a.name LIKE '%product%manager%' AND r.role_name = 'Product Manager')
    OR (a.name LIKE '%marketing%' AND r.role_name LIKE '%Marketing%')
    OR (a.name LIKE '%sales%' AND r.role_name LIKE '%Sales%')
    OR (a.name LIKE '%heor%' AND r.role_name = 'HEOR Director')
    
    -- Biostatistics matches
    OR (a.name LIKE '%biostatistic%' AND r.role_name = 'Biostatistician')
    OR (a.name LIKE '%data%manager%' AND r.role_name = 'Clinical Data Manager')
    OR (a.name LIKE '%statistics%' AND r.role_name LIKE '%Statistics%')
)
LIMIT 1;

-- Show pharma mapping results
SELECT 
    '✅ Agents mapped to Pharma roles' as status,
    COUNT(*) as mapped_count
FROM agents
WHERE is_active = true
    AND metadata->>'pharma_role_id' IS NOT NULL;

\echo ''

-- ============================================================================
-- PART 2: Map Agents to DIGITAL HEALTH Organization
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'PART 2: Mapping Agents → Digital Health Roles'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Add dtx_role_id to agents metadata
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{dtx_role_id}',
    to_jsonb(r.id::text)
)
FROM org_roles r
WHERE a.is_active = true
AND r.unique_id LIKE 'ROLE-DTX-%'
AND (
    -- Product & Engineering matches
    (a.name LIKE '%product%manager%' AND r.role_name LIKE '%Product Manager%')
    OR (a.name LIKE '%software%engineer%' AND r.role_name = 'Software Engineer')
    OR (a.name LIKE '%mobile%' AND r.role_name LIKE '%Mobile Engineer%')
    OR (a.name LIKE '%backend%' AND r.role_name = 'Backend Engineer')
    OR (a.name LIKE '%devops%' AND r.role_name = 'DevOps Engineer')
    OR (a.name LIKE '%ux%' AND r.role_name LIKE '%UX%')
    OR (a.name LIKE '%ui%design%' AND r.role_name = 'UX/UI Designer')
    
    -- Clinical & Medical matches
    OR (a.category = 'clinical' AND r.role_name LIKE '%Clinical%')
    OR (a.name LIKE '%clinical%trial%' AND r.role_name = 'Clinical Trial Manager')
    OR (a.name LIKE '%clinical%research%' AND r.role_name = 'Clinical Research Scientist')
    OR (a.name LIKE '%medical%director%' AND r.role_name = 'Medical Director')
    OR (a.name LIKE '%medical%writer%' AND r.role_name = 'Medical Writer')
    OR (a.name LIKE '%msl%' AND r.role_name = 'Medical Science Liaison')
    
    -- Regulatory matches
    OR (a.category = 'regulatory' AND r.role_name LIKE '%Regulatory%')
    OR (a.name LIKE '%regulatory%' AND r.role_name LIKE '%Regulatory Affairs%')
    OR (a.name LIKE '%samd%' AND r.role_name = 'Regulatory Affairs Manager')
    OR (a.name LIKE '%quality%assurance%' AND r.role_name = 'Quality Assurance Manager')
    OR (a.name LIKE '%qa%engineer%' AND r.role_name = 'QA Engineer')
    
    -- Data Science & AI/ML matches
    OR (a.category = 'technical' AND r.role_name LIKE '%Data Scientist%')
    OR (a.name LIKE '%data%scientist%' AND r.role_name LIKE '%Data Scientist%')
    OR (a.name LIKE '%machine%learning%' AND r.role_name = 'Machine Learning Engineer')
    OR (a.name LIKE '%ml%engineer%' AND r.role_name = 'Machine Learning Engineer')
    OR (a.name LIKE '%ai%' AND r.role_name LIKE '%Machine Learning%')
    OR (a.name LIKE '%digital%biomarker%' AND r.role_name = 'Digital Biomarker Engineer')
    OR (a.name LIKE '%biostatistic%' AND r.role_name = 'Biostatistician')
    
    -- Commercial & Growth matches
    OR (a.name LIKE '%sales%' AND r.role_name LIKE '%Sales%')
    OR (a.name LIKE '%business%development%' AND r.role_name = 'Business Development Manager')
    OR (a.name LIKE '%marketing%' AND r.role_name = 'Marketing Manager')
    OR (a.name LIKE '%growth%' AND r.role_name = 'Growth Lead')
    OR (a.name LIKE '%market%access%' AND r.role_name = 'Market Access Director')
    OR (a.name LIKE '%heor%' AND r.role_name = 'HEOR Manager')
    OR (a.name LIKE '%customer%success%' AND r.role_name = 'Customer Success Manager')
    
    -- Patient Experience matches
    OR (a.name LIKE '%patient%engagement%' AND r.role_name LIKE '%Patient Engagement%')
    OR (a.name LIKE '%behavioral%' AND r.role_name = 'Behavioral Scientist')
    OR (a.name LIKE '%patient%advocate%' AND r.role_name = 'Patient Advocate')
    OR (a.name LIKE '%coach%' AND r.role_name = 'Health Coach')
    
    -- Security & Privacy matches
    OR (a.name LIKE '%security%' AND r.role_name = 'Security Engineer')
    OR (a.name LIKE '%privacy%' AND r.role_name = 'Privacy Officer')
    OR (a.name LIKE '%devsecops%' AND r.role_name = 'DevSecOps Engineer')
    OR (a.name LIKE '%hipaa%' AND r.role_name = 'Privacy Officer')
    OR (a.name LIKE '%gdpr%' AND r.role_name = 'Privacy Officer')
)
LIMIT 1;

-- Show DTx mapping results
SELECT 
    '✅ Agents mapped to Digital Health roles' as status,
    COUNT(*) as mapped_count
FROM agents
WHERE is_active = true
    AND metadata->>'dtx_role_id' IS NOT NULL;

\echo ''

-- ============================================================================
-- PART 3: Set Primary Organization for Each Agent
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'PART 3: Setting Primary Organization'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Determine primary organization based on agent characteristics
UPDATE agents
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{primary_organization}',
    to_jsonb(
        CASE 
            -- Digital Health specific indicators
            WHEN name LIKE '%dtx%' THEN 'digital-health'
            WHEN name LIKE '%digital%biomarker%' THEN 'digital-health'
            WHEN name LIKE '%mobile%' THEN 'digital-health'
            WHEN name LIKE '%app%' THEN 'digital-health'
            WHEN name LIKE '%samd%' THEN 'digital-health'
            WHEN name LIKE '%ml%engineer%' THEN 'digital-health'
            WHEN name LIKE '%ux%' THEN 'digital-health'
            WHEN name LIKE '%devops%' THEN 'digital-health'
            WHEN name LIKE '%patient%engagement%' THEN 'digital-health'
            WHEN name LIKE '%behavioral%' THEN 'digital-health'
            
            -- Pharma specific indicators
            WHEN name LIKE '%drug%' THEN 'pharma'
            WHEN name LIKE '%molecule%' THEN 'pharma'
            WHEN name LIKE '%manufacturing%' THEN 'pharma'
            WHEN name LIKE '%gmp%' THEN 'pharma'
            WHEN name LIKE '%cmc%' THEN 'pharma'
            WHEN name LIKE '%api%' AND name NOT LIKE '%api%engineer%' THEN 'pharma'
            WHEN name LIKE '%formulation%' THEN 'pharma'
            WHEN name LIKE '%biologic%' THEN 'pharma'
            WHEN name LIKE '%vaccine%' THEN 'pharma'
            
            -- Shared roles default to both
            ELSE 'both'
        END
    )
)
WHERE is_active = true;

-- Show organization distribution
SELECT 
    '📊 Organization Distribution' as metric,
    metadata->>'primary_organization' as organization,
    COUNT(*) as agent_count
FROM agents
WHERE is_active = true
GROUP BY metadata->>'primary_organization'
ORDER BY agent_count DESC;

\echo ''

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                          📊 MAPPING SUMMARY                                  ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- Comprehensive mapping statistics
WITH mapping_stats AS (
    SELECT 
        COUNT(*) FILTER (WHERE is_active = true) as total_agents,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'pharma_role_id' IS NOT NULL) as pharma_mapped,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'dtx_role_id' IS NOT NULL) as dtx_mapped,
        COUNT(*) FILTER (WHERE is_active = true 
            AND metadata->>'pharma_role_id' IS NOT NULL 
            AND metadata->>'dtx_role_id' IS NOT NULL) as both_mapped,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'primary_organization' = 'pharma') as pharma_primary,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'primary_organization' = 'digital-health') as dtx_primary,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'primary_organization' = 'both') as shared_agents
    FROM agents
)
SELECT 
    '📈 Mapping Statistics' as section,
    '' as metric,
    '' as count,
    '' as percentage
UNION ALL
SELECT 
    '',
    'Total Active Agents',
    total_agents::text,
    '100%'
FROM mapping_stats
UNION ALL
SELECT 
    '',
    'Mapped to Pharma',
    pharma_mapped::text,
    ROUND(pharma_mapped * 100.0 / total_agents, 1)::text || '%'
FROM mapping_stats
UNION ALL
SELECT 
    '',
    'Mapped to Digital Health',
    dtx_mapped::text,
    ROUND(dtx_mapped * 100.0 / total_agents, 1)::text || '%'
FROM mapping_stats
UNION ALL
SELECT 
    '',
    'Mapped to Both',
    both_mapped::text,
    ROUND(both_mapped * 100.0 / total_agents, 1)::text || '%'
FROM mapping_stats
UNION ALL
SELECT 
    '',
    '─────────────',
    '─────',
    '────────'
UNION ALL
SELECT 
    '',
    'Primary: Pharma',
    pharma_primary::text,
    ROUND(pharma_primary * 100.0 / total_agents, 1)::text || '%'
FROM mapping_stats
UNION ALL
SELECT 
    '',
    'Primary: Digital Health',
    dtx_primary::text,
    ROUND(dtx_primary * 100.0 / total_agents, 1)::text || '%'
FROM mapping_stats
UNION ALL
SELECT 
    '',
    'Primary: Both (Shared)',
    shared_agents::text,
    ROUND(shared_agents * 100.0 / total_agents, 1)::text || '%'
FROM mapping_stats;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Sample of mapped agents (showing both organizations):'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Show sample of agents mapped to both organizations
SELECT 
    a.name as agent_name,
    a.category,
    a.metadata->>'primary_organization' as primary_org,
    rp.role_name as pharma_role,
    rd.role_name as dtx_role
FROM agents a
LEFT JOIN org_roles rp ON rp.id::text = a.metadata->>'pharma_role_id'
LEFT JOIN org_roles rd ON rd.id::text = a.metadata->>'dtx_role_id'
WHERE a.is_active = true
    AND (rp.id IS NOT NULL OR rd.id IS NOT NULL)
ORDER BY 
    CASE a.metadata->>'primary_organization'
        WHEN 'pharma' THEN 1
        WHEN 'digital-health' THEN 2
        WHEN 'both' THEN 3
        ELSE 4
    END,
    a.name
LIMIT 30;

\echo ''
\echo '✅ Dual Organization Mapping Complete!'

