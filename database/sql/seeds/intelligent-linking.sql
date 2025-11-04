-- ============================================================================
-- INTELLIGENT AGENT → PERSONA → ROLE LINKING
-- Advanced matching algorithm for Digital Health industry
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║           🔗 INTELLIGENT LINKING: AGENTS → PERSONAS → ROLES                 ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- STEP 1: Link Agents to Personas (AI-Powered Matching)
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'STEP 1: Linking Agents → Personas'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Create temporary matching table
CREATE TEMP TABLE agent_persona_matches AS
WITH agent_keywords AS (
    SELECT 
        a.id as agent_id,
        a.name as agent_name,
        a.category,
        -- Extract keywords from agent name
        string_to_array(replace(a.name, '_', ' '), ' ') as name_tokens
    FROM agents a
    WHERE a.is_active = true
),
persona_keywords AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        p.department,
        p.expertise_level,
        p.typical_titles,
        -- Extract keywords from persona
        string_to_array(lower(p.name), ' ') as name_tokens,
        string_to_array(lower(COALESCE(p.typical_titles->>0, '')), ' ') as title_tokens
    FROM dh_persona p
    WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
),
matches AS (
    SELECT 
        ak.agent_id,
        ak.agent_name,
        ak.category,
        pk.persona_id,
        pk.persona_name,
        pk.department,
        pk.expertise_level,
        -- Calculate match score
        (
            -- Category to department match (50 points)
            CASE 
                WHEN ak.category = 'regulatory' AND pk.department LIKE '%Regulatory%' THEN 50
                WHEN ak.category = 'clinical' AND pk.department LIKE '%Clinical%' THEN 50
                WHEN ak.category = 'technical' AND pk.department IN ('Data Science', 'Engineering') THEN 50
                WHEN ak.category = 'medical' AND pk.department = 'Medical Affairs' THEN 50
                WHEN ak.category = 'commercial' AND pk.department IN ('Commercial', 'Product') THEN 50
                ELSE 0
            END +
            -- Name token overlap (10 points per token)
            (SELECT COUNT(*) * 10 FROM unnest(ak.name_tokens) t1 
             WHERE t1 = ANY(pk.name_tokens) OR t1 = ANY(pk.title_tokens)) +
            -- Specific keyword matches (20 points each)
            CASE WHEN 'data' = ANY(ak.name_tokens) AND 'scientist' = ANY(ak.name_tokens) AND pk.persona_name LIKE '%Data Scientist%' THEN 20 ELSE 0 END +
            CASE WHEN 'clinical' = ANY(ak.name_tokens) AND pk.persona_name LIKE '%Clinical%' THEN 20 ELSE 0 END +
            CASE WHEN 'regulatory' = ANY(ak.name_tokens) AND pk.persona_name LIKE '%Regulatory%' THEN 20 ELSE 0 END +
            CASE WHEN 'medical' = ANY(ak.name_tokens) AND pk.persona_name LIKE '%Medical%' THEN 20 ELSE 0 END +
            CASE WHEN 'product' = ANY(ak.name_tokens) AND pk.persona_name LIKE '%Product%' THEN 20 ELSE 0 END
        ) as match_score,
        ROW_NUMBER() OVER (PARTITION BY ak.agent_id ORDER BY (
            CASE 
                WHEN ak.category = 'regulatory' AND pk.department LIKE '%Regulatory%' THEN 50
                WHEN ak.category = 'clinical' AND pk.department LIKE '%Clinical%' THEN 50
                WHEN ak.category = 'technical' AND pk.department IN ('Data Science', 'Engineering') THEN 50
                WHEN ak.category = 'medical' AND pk.department = 'Medical Affairs' THEN 50
                WHEN ak.category = 'commercial' AND pk.department IN ('Commercial', 'Product') THEN 50
                ELSE 0
            END +
            (SELECT COUNT(*) * 10 FROM unnest(ak.name_tokens) t1 
             WHERE t1 = ANY(pk.name_tokens) OR t1 = ANY(pk.title_tokens))
        ) DESC) as rank
    FROM agent_keywords ak
    CROSS JOIN persona_keywords pk
)
SELECT 
    agent_id,
    agent_name,
    category,
    persona_id,
    persona_name,
    department,
    expertise_level,
    match_score
FROM matches
WHERE rank = 1 AND match_score >= 20;  -- Only keep best match if score is reasonable

-- Apply the matches
UPDATE agents a
SET metadata = jsonb_set(
    jsonb_set(
        COALESCE(a.metadata, '{}'::jsonb),
        '{persona_id}',
        to_jsonb(m.persona_id::text)
    ),
    '{persona_name}',
    to_jsonb(m.persona_name)
)
FROM agent_persona_matches m
WHERE a.id = m.agent_id;

-- Show results
SELECT 
    '✅ Agents → Personas Linked' as status,
    COUNT(*) as linked_count,
    ROUND(AVG(match_score), 1) as avg_match_score
FROM agent_persona_matches;

\echo ''
\echo 'Sample Agent → Persona links:'
SELECT 
    agent_name,
    category,
    persona_name,
    department,
    expertise_level,
    match_score
FROM agent_persona_matches
ORDER BY match_score DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- STEP 2: Link Personas to Roles (Smart Title Matching)
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'STEP 2: Linking Personas → Roles'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Create matching table for personas and roles
CREATE TEMP TABLE persona_role_matches AS
WITH persona_data AS (
    SELECT 
        p.id as persona_id,
        p.name as persona_name,
        p.department,
        p.typical_titles->>0 as primary_title,
        p.expertise_level
    FROM dh_persona p
    WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
),
role_data AS (
    SELECT 
        r.id as role_id,
        r.role_name,
        r.role_title,
        r.department_name,
        r.seniority_level
    FROM org_roles r
    WHERE r.is_active = true
),
matches AS (
    SELECT 
        pd.persona_id,
        pd.persona_name,
        pd.primary_title,
        pd.department as persona_department,
        rd.role_id,
        rd.role_name,
        rd.department_name as role_department,
        -- Calculate match score
        (
            -- Exact title match (100 points)
            CASE WHEN rd.role_name = pd.primary_title THEN 100
                 WHEN rd.role_title = pd.primary_title THEN 100
                 ELSE 0 END +
            -- Department match (50 points)
            CASE WHEN rd.department_name = pd.department THEN 50
                 WHEN rd.department_name LIKE '%' || pd.department || '%' THEN 30
                 ELSE 0 END +
            -- Seniority match (20 points)
            CASE WHEN rd.seniority_level = pd.expertise_level THEN 20 ELSE 0 END +
            -- Common title keywords (10 points each)
            CASE WHEN rd.role_name LIKE '%Director%' AND pd.primary_title LIKE '%Director%' THEN 10 ELSE 0 END +
            CASE WHEN rd.role_name LIKE '%Manager%' AND pd.primary_title LIKE '%Manager%' THEN 10 ELSE 0 END +
            CASE WHEN rd.role_name LIKE '%VP%' AND pd.primary_title LIKE '%VP%' THEN 10 ELSE 0 END +
            CASE WHEN rd.role_name LIKE '%Chief%' AND pd.primary_title LIKE '%Chief%' THEN 10 ELSE 0 END
        ) as match_score,
        ROW_NUMBER() OVER (PARTITION BY pd.persona_id ORDER BY (
            CASE WHEN rd.role_name = pd.primary_title THEN 100
                 WHEN rd.role_title = pd.primary_title THEN 100
                 ELSE 0 END +
            CASE WHEN rd.department_name = pd.department THEN 50
                 WHEN rd.department_name LIKE '%' || pd.department || '%' THEN 30
                 ELSE 0 END
        ) DESC) as rank
    FROM persona_data pd
    CROSS JOIN role_data rd
)
SELECT 
    persona_id,
    persona_name,
    primary_title,
    persona_department,
    role_id,
    role_name,
    role_department,
    match_score
FROM matches
WHERE rank = 1 AND match_score >= 30;

-- Apply persona-role links
UPDATE dh_persona p
SET metadata = jsonb_set(
    jsonb_set(
        COALESCE(p.metadata, '{}'::jsonb),
        '{role_id}',
        to_jsonb(m.role_id::text)
    ),
    '{role_name}',
    to_jsonb(m.role_name)
)
FROM persona_role_matches m
WHERE p.id = m.persona_id;

-- Show results
SELECT 
    '✅ Personas → Roles Linked' as status,
    COUNT(*) as linked_count,
    ROUND(AVG(match_score), 1) as avg_match_score
FROM persona_role_matches;

\echo ''
\echo 'Sample Persona → Role links:'
SELECT 
    persona_name,
    primary_title,
    role_name,
    role_department,
    match_score
FROM persona_role_matches
ORDER BY match_score DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- STEP 3: Link Agents to Roles (Transitive via Personas)
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'STEP 3: Linking Agents → Roles (via Personas)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Link agents to roles through their persona assignment
UPDATE agents a
SET metadata = jsonb_set(
    jsonb_set(
        COALESCE(a.metadata, '{}'::jsonb),
        '{role_id}',
        to_jsonb(p.metadata->>'role_id')
    ),
    '{role_name}',
    to_jsonb(p.metadata->>'role_name')
)
FROM dh_persona p
WHERE a.metadata->>'persona_id' = p.id::text
    AND p.metadata->>'role_id' IS NOT NULL
    AND a.is_active = true;

-- Show results
SELECT 
    '✅ Agents → Roles Linked (via Personas)' as status,
    COUNT(*) as linked_count
FROM agents
WHERE is_active = true
    AND metadata->>'role_id' IS NOT NULL;

\echo ''

-- ============================================================================
-- FINAL VERIFICATION & SUMMARY
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                          📊 LINKING SUMMARY                                  ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- Comprehensive summary
WITH stats AS (
    SELECT 
        COUNT(*) FILTER (WHERE is_active = true) as total_agents,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'persona_id' IS NOT NULL) as agents_with_persona,
        COUNT(*) FILTER (WHERE is_active = true AND metadata->>'role_id' IS NOT NULL) as agents_with_role,
        COUNT(*) FILTER (WHERE is_active = true 
            AND metadata->>'persona_id' IS NOT NULL 
            AND metadata->>'role_id' IS NOT NULL) as agents_fully_linked
    FROM agents
)
SELECT 
    '📈 Linkage Statistics' as section,
    '' as metric,
    '' as count,
    '' as percentage
UNION ALL
SELECT 
    '',
    'Total Active Agents',
    total_agents::text,
    '100%'
FROM stats
UNION ALL
SELECT 
    '',
    'Agents → Personas',
    agents_with_persona::text,
    ROUND(agents_with_persona * 100.0 / total_agents, 1)::text || '%'
FROM stats
UNION ALL
SELECT 
    '',
    'Agents → Roles',
    agents_with_role::text,
    ROUND(agents_with_role * 100.0 / total_agents, 1)::text || '%'
FROM stats
UNION ALL
SELECT 
    '',
    'Fully Linked (Persona + Role)',
    agents_fully_linked::text,
    ROUND(agents_fully_linked * 100.0 / total_agents, 1)::text || '%'
FROM stats;

\echo ''

-- Persona linkage stats
WITH persona_stats AS (
    SELECT 
        COUNT(*) as total_personas,
        COUNT(*) FILTER (WHERE metadata->>'role_id' IS NOT NULL) as personas_with_role
    FROM dh_persona
    WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
)
SELECT 
    '📈 Persona Linkage' as section,
    '' as metric,
    '' as count,
    '' as percentage
UNION ALL
SELECT 
    '',
    'Total Personas',
    total_personas::text,
    '100%'
FROM persona_stats
UNION ALL
SELECT 
    '',
    'Personas → Roles',
    personas_with_role::text,
    ROUND(personas_with_role * 100.0 / total_personas, 1)::text || '%'
FROM persona_stats;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Complete! Sample of linked agents:'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Show sample of fully linked agents
SELECT 
    a.name as agent_name,
    a.category,
    p.name as persona_name,
    p.expertise_level,
    r.role_name,
    d.department_name,
    f.department_name as business_function
FROM agents a
LEFT JOIN dh_persona p ON p.id::text = a.metadata->>'persona_id'
LEFT JOIN org_roles r ON r.id::text = a.metadata->>'role_id'
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE a.is_active = true
    AND p.id IS NOT NULL
    AND r.id IS NOT NULL
ORDER BY f.department_name, d.department_name, r.role_name, a.name
LIMIT 25;

\echo ''
\echo '✅ Linking Complete!'

