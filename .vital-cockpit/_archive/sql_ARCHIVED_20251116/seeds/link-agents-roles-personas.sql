-- ============================================================================
-- LINK AGENTS → ROLES → PERSONAS
-- Comprehensive linking for Digital Health Tenant
-- ============================================================================

-- Get the tenant ID
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'digital-health-startup';
    RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;
END $$;

-- ============================================================================
-- PART 1: LINK AGENTS → ROLES (Based on Agent Name/Category)
-- ============================================================================

-- Update agents metadata with role assignments based on intelligent matching
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{role_id}',
    to_jsonb(r.id::text)
)
FROM org_roles r
WHERE a.is_active = true
AND (
    -- Match by category and role name patterns
    (a.category = 'regulatory' AND r.department_name LIKE '%Regulatory%')
    OR (a.category = 'clinical' AND r.department_name LIKE '%Clinical%')
    OR (a.category = 'technical' AND r.department_name LIKE '%IT%')
    OR (a.category = 'commercial' AND r.department_name LIKE '%Commercial%')
    OR (a.category = 'medical' AND r.department_name LIKE '%Medical%')
    
    -- Match specific agent names to roles
    OR (a.name LIKE '%strategist%' AND r.role_name LIKE '%Strategy%')
    OR (a.name LIKE '%director%' AND r.role_name LIKE '%Director%')
    OR (a.name LIKE '%manager%' AND r.role_name LIKE '%Manager%')
    OR (a.name LIKE '%specialist%' AND r.role_name LIKE '%Specialist%')
    OR (a.name LIKE '%analyst%' AND r.role_name LIKE '%Analyst%')
    OR (a.name LIKE '%data_scientist%' AND r.role_name = 'Data Scientist')
)
AND r.is_active = true
LIMIT 1;  -- Take first matching role

-- Verify agent-role links
SELECT 
    '✅ Agents linked to Roles' as status,
    COUNT(*) as count
FROM agents
WHERE is_active = true
    AND metadata->>'role_id' IS NOT NULL;


-- ============================================================================
-- PART 2: LINK PERSONAS → ROLES (Based on Title Matching)
-- ============================================================================

-- Update personas metadata with role assignments
UPDATE dh_persona p
SET metadata = jsonb_set(
    COALESCE(p.metadata, '{}'::jsonb),
    '{role_id}',
    to_jsonb(r.id::text)
)
FROM org_roles r
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
AND (
    -- Direct title match
    r.role_name = p.typical_titles->>0
    OR r.role_title = p.typical_titles->>0
    
    -- Department match + seniority
    OR (r.department_name = p.department AND r.seniority_level = p.expertise_level)
    
    -- Fuzzy matching common roles
    OR (p.typical_titles->>0 LIKE '%CEO%' AND r.role_name LIKE '%Chief Executive%')
    OR (p.typical_titles->>0 LIKE '%CMO%' AND r.role_name LIKE '%Chief Medical%')
    OR (p.typical_titles->>0 LIKE '%CFO%' AND r.role_name = 'CFO')
    OR (p.typical_titles->>0 LIKE '%CIO%' AND r.role_name = 'CIO')
    OR (p.typical_titles->>0 LIKE '%VP%' AND r.role_name LIKE 'VP %')
    OR (p.typical_titles->>0 LIKE '%Director%' AND r.role_name LIKE '%Director%')
    OR (p.typical_titles->>0 LIKE '%Manager%' AND r.role_name LIKE '%Manager%')
    OR (p.typical_titles->>0 LIKE '%Data Scientist%' AND r.role_name = 'Data Scientist')
    OR (p.typical_titles->>0 LIKE '%Product Manager%' AND r.role_name = 'Product Manager')
)
AND r.is_active = true
LIMIT 1;

-- Verify persona-role links
SELECT 
    '✅ Personas linked to Roles' as status,
    COUNT(*) as count
FROM dh_persona
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
    AND metadata->>'role_id' IS NOT NULL;


-- ============================================================================
-- PART 3: LINK AGENTS → PERSONAS (Intelligent Matching)
-- ============================================================================

-- Match agents to personas based on:
-- 1. Category → Persona Department
-- 2. Agent name patterns → Persona typical titles
-- 3. Knowledge domains → Persona expertise

UPDATE agents a
SET metadata = jsonb_set(
    jsonb_set(
        COALESCE(a.metadata, '{}'::jsonb),
        '{persona_id}',
        to_jsonb(p.id::text)
    ),
    '{persona_name}',
    to_jsonb(p.name)
)
FROM dh_persona p
WHERE a.is_active = true
AND p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
AND (
    -- Category to Department matching
    (a.category = 'regulatory' AND p.department IN ('Regulatory Affairs'))
    OR (a.category = 'clinical' AND p.department IN ('Clinical Development', 'Clinical Operations', 'Clinical Research'))
    OR (a.category = 'technical' AND p.department IN ('Data Science', 'Engineering', 'Information Security'))
    OR (a.category = 'medical' AND p.department IN ('Medical Affairs'))
    OR (a.category = 'commercial' AND p.department IN ('Commercial', 'Product'))
    
    -- Specific name pattern matching
    OR (a.name LIKE '%regulatory%' AND p.typical_titles->>0 LIKE '%Regulatory%')
    OR (a.name LIKE '%clinical%' AND p.typical_titles->>0 LIKE '%Clinical%')
    OR (a.name LIKE '%data_scientist%' AND p.name = 'Data Scientist - Digital Biomarker')
    OR (a.name LIKE '%trial%' AND p.name = 'Clinical Trial Manager')
    OR (a.name LIKE '%medical_writer%' AND p.name = 'Medical Writer')
    OR (a.name LIKE '%product_manager%' AND p.name = 'Product Manager (Digital Health)')
    OR (a.name LIKE '%biostatistician%' AND p.name = 'Principal Biostatistician')
    OR (a.name LIKE '%pharmacovigilance%' AND p.name = 'Pharmacovigilance Director')
    OR (a.name LIKE '%quality%' AND p.name = 'Quality Assurance Director')
    OR (a.name LIKE '%heor%' AND p.name LIKE '%Health Economics%')
)
LIMIT 1;

-- Verify agent-persona links
SELECT 
    '✅ Agents linked to Personas' as status,
    COUNT(*) as count
FROM agents
WHERE is_active = true
    AND metadata->>'persona_id' IS NOT NULL;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Summary of all links
SELECT 
    '📊 LINKING SUMMARY' as section,
    '' as metric,
    '' as count
UNION ALL
SELECT 
    '',
    'Total Active Agents',
    COUNT(*)::text
FROM agents WHERE is_active = true
UNION ALL
SELECT 
    '',
    'Agents → Roles',
    COUNT(*)::text
FROM agents 
WHERE is_active = true AND metadata->>'role_id' IS NOT NULL
UNION ALL
SELECT 
    '',
    'Agents → Personas',
    COUNT(*)::text
FROM agents 
WHERE is_active = true AND metadata->>'persona_id' IS NOT NULL
UNION ALL
SELECT 
    '',
    'Personas → Roles',
    COUNT(*)::text
FROM dh_persona 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
    AND metadata->>'role_id' IS NOT NULL
UNION ALL
SELECT 
    '',
    'Total Personas',
    COUNT(*)::text
FROM dh_persona
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
UNION ALL
SELECT 
    '',
    'Total Roles',
    COUNT(*)::text
FROM org_roles
WHERE is_active = true;


-- Show sample linkages
SELECT 
    a.name as agent_name,
    a.category,
    p.name as persona_name,
    p.expertise_level,
    r.role_name,
    r.department_name
FROM agents a
LEFT JOIN dh_persona p ON p.id::text = a.metadata->>'persona_id'
LEFT JOIN org_roles r ON r.id::text = a.metadata->>'role_id'
WHERE a.is_active = true
    AND (p.id IS NOT NULL OR r.id IS NOT NULL)
ORDER BY a.category, a.name
LIMIT 50;

