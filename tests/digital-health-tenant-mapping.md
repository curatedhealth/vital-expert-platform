# 🏥 DIGITAL HEALTH TENANT: COMPLETE ORGANIZATIONAL MAPPING

**Tenant-Specific Organizational Structure for Digital Health Industry**

---

## 📊 **QUERY 1: Digital Health Tenant Overview**

```sql
-- Get tenant statistics for Digital Health industry
SELECT 
    'Tenant' as entity,
    t.name as tenant_name,
    t.slug as tenant_slug
FROM tenants t
WHERE t.slug = 'digital-health-startup'

UNION ALL

SELECT 
    'Business Functions',
    COUNT(*)::text,
    ''
FROM org_functions

UNION ALL

SELECT 
    'Departments',
    COUNT(*)::text,
    ''
FROM org_departments

UNION ALL

SELECT 
    'Roles',
    COUNT(*)::text,
    ''
FROM org_roles
WHERE is_active = true

UNION ALL

SELECT 
    'Personas (Digital Health)',
    COUNT(*)::text,
    ''
FROM dh_persona p
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')

UNION ALL

SELECT 
    'Agents (Digital Health)',
    COUNT(*)::text,
    ''
FROM agents a
WHERE a.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
    AND a.is_active = true;
```

---

## 👥 **QUERY 2: Agents → Personas → Roles Complete Mapping**

```sql
-- ============================================================================
-- COMPLETE MAPPING: Agents → Personas → Roles → Departments → Functions
-- For Digital Health Tenant
-- ============================================================================

WITH tenant_context AS (
    SELECT id as tenant_id 
    FROM tenants 
    WHERE slug = 'digital-health-startup'
)
SELECT 
    -- Persona Information
    p.name as persona_name,
    p.expertise_level,
    p.years_experience,
    p.department as persona_department,
    p.typical_titles->0 as primary_title,
    
    -- Role Matching
    r.role_name as matched_role,
    r.seniority_level as role_seniority,
    
    -- Department & Function
    d.department_name as department,
    f.department_name as business_function,
    
    -- Agent Count
    COUNT(DISTINCT a.id) as agent_count,
    array_agg(DISTINCT a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL) as agents
    
FROM dh_persona p
CROSS JOIN tenant_context tc
LEFT JOIN agents a ON (
    a.tenant_id = tc.tenant_id
    AND a.is_active = true
    AND (
        a.metadata->>'persona_id' = p.id::text
        OR a.metadata->>'persona' = p.name
    )
)
LEFT JOIN org_roles r ON (
    r.role_name = p.typical_titles->>0
    OR r.role_title = p.typical_titles->>0
    OR r.department_name = p.department
)
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON d.function_id = f.id

WHERE p.tenant_id = tc.tenant_id

GROUP BY 
    p.id, p.name, p.expertise_level, p.years_experience, p.department, p.typical_titles,
    r.role_name, r.seniority_level, d.department_name, f.department_name
    
ORDER BY agent_count DESC, p.expertise_level, p.name
LIMIT 50;
```

---

## 🎯 **QUERY 3: Personas by Expertise Level**

```sql
-- Group personas by expertise level for Digital Health
SELECT 
    p.expertise_level,
    COUNT(*) as persona_count,
    array_agg(p.name ORDER BY p.name) as personas,
    array_agg(DISTINCT p.department ORDER BY p.department) FILTER (WHERE p.department IS NOT NULL) as departments
FROM dh_persona p
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
GROUP BY p.expertise_level
ORDER BY 
    CASE p.expertise_level
        WHEN 'EXPERT' THEN 1
        WHEN 'ADVANCED' THEN 2
        WHEN 'INTERMEDIATE' THEN 3
        WHEN 'FOUNDATIONAL' THEN 4
        ELSE 5
    END;
```

---

## 🏢 **QUERY 4: Persona Distribution by Department**

```sql
-- Show which departments have which personas (Digital Health specific)
SELECT 
    p.department,
    COUNT(*) as persona_count,
    array_agg(p.name || ' (' || COALESCE(p.expertise_level, 'N/A') || ')' ORDER BY p.expertise_level, p.name) as personas,
    COUNT(DISTINCT a.id) as agent_count
FROM dh_persona p
LEFT JOIN agents a ON (
    a.tenant_id = p.tenant_id
    AND a.is_active = true
    AND (
        a.metadata->>'persona_id' = p.id::text
        OR a.metadata->>'persona' = p.name
    )
)
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
GROUP BY p.department
ORDER BY persona_count DESC, p.department;
```

---

## 🔗 **QUERY 5: Persona → Role Mapping (Digital Health)**

```sql
-- Map Digital Health personas to organizational roles
SELECT 
    p.name as persona_name,
    p.typical_titles as persona_titles,
    p.department as persona_department,
    p.expertise_level,
    
    r.role_name as matched_role_name,
    r.role_title as matched_role_title,
    r.seniority_level as matched_role_seniority,
    d.department_name as role_department,
    f.department_name as role_function,
    
    CASE 
        WHEN r.id IS NOT NULL THEN '✅ Matched'
        ELSE '❌ No Match'
    END as match_status
    
FROM dh_persona p
LEFT JOIN org_roles r ON (
    r.role_name = p.typical_titles->>0
    OR r.role_title = p.typical_titles->>0
    OR (r.department_name = p.department AND r.seniority_level = p.expertise_level)
)
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON d.function_id = f.id

WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')

ORDER BY 
    CASE WHEN r.id IS NOT NULL THEN 0 ELSE 1 END,
    p.department, 
    p.expertise_level,
    p.name;
```

---

## 🎯 **QUERY 6: Find Unassigned Agents (No Persona)**

```sql
-- Agents that don't have a persona assigned (Digital Health tenant)
SELECT 
    a.id,
    a.name as agent_name,
    a.category as agent_category,
    a.metadata->>'persona' as metadata_persona,
    a.metadata->>'persona_id' as metadata_persona_id,
    a.metadata->>'role' as metadata_role,
    a.created_at
FROM agents a
WHERE a.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
    AND a.is_active = true
    AND (
        (a.metadata->>'persona_id' IS NULL OR a.metadata->>'persona_id' = '')
        AND (a.metadata->>'persona' IS NULL OR a.metadata->>'persona' = '')
    )
ORDER BY a.created_at DESC
LIMIT 50;
```

---

## 📋 **QUERY 7: Detailed Persona Information**

```sql
-- Get comprehensive persona details for Digital Health
SELECT 
    p.name as persona_name,
    p.unique_id,
    p.expertise_level,
    p.years_experience,
    p.department,
    p.typical_titles,
    p.education,
    p.key_responsibilities,
    p.capabilities,
    p.decision_authority,
    p.reports_to,
    p.typical_availability_hours,
    p.response_time_sla_hours,
    p.description
FROM dh_persona p
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
ORDER BY 
    CASE p.expertise_level
        WHEN 'EXPERT' THEN 1
        WHEN 'ADVANCED' THEN 2
        WHEN 'INTERMEDIATE' THEN 3
        WHEN 'FOUNDATIONAL' THEN 4
        ELSE 5
    END,
    p.name;
```

---

## 🏥 **QUERY 8: Digital Health Specific Departments**

```sql
-- Show all Digital Health industry-specific departments and their personas
SELECT 
    p.department,
    COUNT(*) as persona_count,
    COUNT(DISTINCT CASE WHEN p.expertise_level = 'EXPERT' THEN p.id END) as expert_personas,
    COUNT(DISTINCT CASE WHEN p.expertise_level = 'ADVANCED' THEN p.id END) as advanced_personas,
    COUNT(DISTINCT CASE WHEN p.expertise_level = 'INTERMEDIATE' THEN p.id END) as intermediate_personas,
    array_agg(DISTINCT p.name ORDER BY p.name) as all_personas
FROM dh_persona p
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
    AND p.department IS NOT NULL
GROUP BY p.department
ORDER BY persona_count DESC, p.department;
```

---

## 🔍 **QUERY 9: Executive Level Personas**

```sql
-- Show all C-level and executive personas for Digital Health
SELECT 
    p.name as persona_name,
    p.typical_titles as titles,
    p.department,
    p.expertise_level,
    p.years_experience,
    p.decision_authority,
    p.reports_to,
    COUNT(DISTINCT a.id) as agent_count
FROM dh_persona p
LEFT JOIN agents a ON (
    a.tenant_id = p.tenant_id
    AND a.is_active = true
    AND (
        a.metadata->>'persona_id' = p.id::text
        OR a.metadata->>'persona' = p.name
    )
)
WHERE p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup')
    AND (
        p.department = 'Executive'
        OR p.typical_titles::text ILIKE '%chief%'
        OR p.typical_titles::text ILIKE '%ceo%'
        OR p.typical_titles::text ILIKE '%cmo%'
        OR p.typical_titles::text ILIKE '%cio%'
        OR p.typical_titles::text ILIKE '%cfo%'
        OR p.typical_titles::text ILIKE '%vp%'
    )
GROUP BY p.id, p.name, p.typical_titles, p.department, p.expertise_level, p.years_experience, p.decision_authority, p.reports_to
ORDER BY agent_count DESC, p.name;
```

---

## 📊 **QUERY 10: Summary Statistics**

```sql
-- Complete statistics for Digital Health tenant organizational structure
WITH tenant_context AS (
    SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup'
),
stats AS (
    SELECT 
        COUNT(DISTINCT f.id) as functions_count,
        COUNT(DISTINCT d.id) as departments_count,
        COUNT(DISTINCT r.id) as roles_count,
        COUNT(DISTINCT p.id) as personas_count,
        COUNT(DISTINCT a.id) as agents_count,
        COUNT(DISTINCT a.id) FILTER (WHERE 
            a.metadata->>'persona_id' IS NOT NULL 
            OR a.metadata->>'persona' IS NOT NULL
        ) as agents_with_persona,
        COUNT(DISTINCT a.id) FILTER (WHERE 
            a.metadata->>'role_id' IS NOT NULL 
            OR a.metadata->>'role_name' IS NOT NULL
        ) as agents_with_role
    FROM tenant_context tc
    CROSS JOIN org_functions f
    CROSS JOIN org_departments d
    CROSS JOIN org_roles r
    LEFT JOIN dh_persona p ON p.tenant_id = tc.tenant_id
    LEFT JOIN agents a ON a.tenant_id = tc.tenant_id AND a.is_active = true
)
SELECT 
    'Business Functions' as level,
    functions_count as count,
    '✅' as status
FROM stats
UNION ALL
SELECT 'Departments', departments_count, '✅' FROM stats
UNION ALL
SELECT 'Roles', roles_count, '✅' FROM stats
UNION ALL
SELECT 'Personas (Digital Health)', personas_count, '✅' FROM stats
UNION ALL
SELECT 'Agents (Active)', agents_count, '✅' FROM stats
UNION ALL
SELECT 'Agents with Persona', agents_with_persona, 
    CASE WHEN agents_with_persona > 0 THEN '✅' ELSE '⚠️' END FROM stats
UNION ALL
SELECT 'Agents with Role', agents_with_role,
    CASE WHEN agents_with_role > 0 THEN '✅' ELSE '⚠️' END FROM stats;
```

---

## 🚀 **HOW TO USE**

### Run in Cursor AI:
```
Execute Query 1 from this file to see tenant overview
Execute Query 2 for complete mapping
Execute Query 10 for summary statistics
```

### Or manually:
```bash
# Copy any query and run via Cursor AI chat
```

---

## 📝 **KEY FINDINGS**

Based on current data:

✅ **Organizational Structure Exists:**
- 12 Business Functions
- 10 Departments  
- 126 Roles
- 35 Personas (Digital Health specific)
- 254 Active Agents

⚠️ **Assignments Needed:**
- 0 agents currently assigned to personas
- 0 agents currently assigned to roles

**Action Required:**
Assign agents to appropriate personas and roles via Agent Creator UI or bulk SQL update.

---

## 🏥 **DIGITAL HEALTH SPECIFIC PERSONAS**

The tenant has 35 specialized personas including:
- **Executive Level:** CEO, CMO, CIO, CFO
- **Clinical:** Clinical Research Scientist, Clinical Trial Manager, Principal Investigator
- **Regulatory:** Regulatory Affairs Director, VP Regulatory Affairs
- **Data & Analytics:** Data Scientist, Data Science Director
- **Medical Affairs:** Medical Director, Medical Writer
- **Quality & Safety:** Quality Assurance Director, Pharmacovigilance Director
- **Commercial:** Product Manager, VP Market Access
- **Patient-Centric:** Patient Advocate

---

**All personas are industry-specific to Digital Health and DTx (Digital Therapeutics)!** 🎯

