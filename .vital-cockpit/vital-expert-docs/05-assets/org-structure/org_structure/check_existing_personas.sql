-- =====================================================================
-- CHECK EXISTING PERSONAS IN DATABASE
-- This will help us understand what personas exist and how they're named
-- =====================================================================

-- Check all personas
SELECT 
    'ALL_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    p.role_id,
    p.function_id,
    p.department_id,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
ORDER BY p.name
LIMIT 50;

-- Check personas with "Medical Science Liaison" in name
SELECT 
    'MEDICAL_SCIENCE_LIAISON' as section,
    p.id,
    p.name,
    p.slug,
    p.role_id,
    r.name as role_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.name ILIKE '%medical science liaison%'
   OR p.slug ILIKE '%medical%science%liaison%'
ORDER BY p.name;

-- Check personas with "HEOR" in name
SELECT 
    'HEOR_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    p.role_id,
    r.name as role_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.name ILIKE '%heor%'
   OR p.slug ILIKE '%heor%'
ORDER BY p.name;

-- Check personas with "Market Access" in name
SELECT 
    'MARKET_ACCESS_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    p.role_id,
    r.name as role_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.name ILIKE '%market access%'
   OR p.slug ILIKE '%market%access%'
ORDER BY p.name;

-- Check personas with "Commercial Lead" in name
SELECT 
    'COMMERCIAL_LEAD_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    p.role_id,
    r.name as role_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.name ILIKE '%commercial lead%'
   OR p.slug ILIKE '%commercial%lead%'
ORDER BY p.name;

-- Check personas with "Regulatory" in name
SELECT 
    'REGULATORY_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    p.role_id,
    r.name as role_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.name ILIKE '%regulatory%'
   OR p.slug ILIKE '%regulatory%'
ORDER BY p.name;

-- Check total count
SELECT 
    'TOTAL_COUNT' as section,
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(CASE WHEN role_id IS NULL THEN 1 END) as personas_without_role
FROM public.personas;

-- Check if personas table has tenant_id column
SELECT 
    'SCHEMA_CHECK' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'personas'
ORDER BY ordinal_position;

