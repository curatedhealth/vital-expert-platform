# 🔍 CORRECT SQL QUERIES FOR ORGANIZATIONAL HIERARCHY

Based on your actual database schema with `org_functions`, `org_departments`, and `org_roles` tables.

---

## 📊 **QUERY 1: Complete Hierarchy Overview**

```sql
-- ============================================================================
-- ORGANIZATIONAL HIERARCHY: Functions → Departments → Roles → Agents
-- ============================================================================

SELECT 
    f.department_name as business_function,  -- Yes, this is confusing but it's the function name
    f.id as function_id,
    d.department_name as department,
    d.id as department_id,
    r.role_name as role,
    r.role_title as role_title,
    r.id as role_id,
    r.seniority_level,
    COUNT(DISTINCT a.id) as agent_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
LEFT JOIN agents a ON (
    a.metadata->>'role_id' = r.id::text 
    OR a.metadata->>'role_name' = r.role_name
)
GROUP BY f.id, f.department_name, d.id, d.department_name, r.id, r.role_name, r.role_title, r.seniority_level
ORDER BY f.department_name, d.department_name, r.seniority_level, r.role_name
LIMIT 100;
```

---

## 📋 **QUERY 2: Statistics Summary**

```sql
-- Count entities at each level
SELECT 
    'Business Functions' as level,
    COUNT(*) as count
FROM org_functions

UNION ALL

SELECT 
    'Departments',
    COUNT(*)
FROM org_departments

UNION ALL

SELECT 
    'Roles',
    COUNT(*)
FROM org_roles
WHERE is_active = true

UNION ALL

SELECT 
    'Active Agents',
    COUNT(*)
FROM agents
WHERE is_active = true;
```

---

## 📂 **QUERY 3: View All Business Functions**

```sql
SELECT 
    id,
    unique_id,
    department_name as function_name,
    description,
    migration_ready,
    created_at
FROM org_functions
ORDER BY department_name;
```

---

## 🏢 **QUERY 4: Functions → Departments Mapping**

```sql
SELECT 
    f.department_name as business_function,
    COUNT(d.id) as department_count,
    array_agg(d.department_name ORDER BY d.department_name) FILTER (WHERE d.department_name IS NOT NULL) as departments
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
GROUP BY f.id, f.department_name
ORDER BY f.department_name;
```

---

## 🏛️ **QUERY 5: Departments → Roles Mapping**

```sql
SELECT 
    f.department_name as business_function,
    d.department_name as department,
    COUNT(r.id) as role_count,
    array_agg(r.role_name ORDER BY r.seniority_level, r.role_name) FILTER (WHERE r.role_name IS NOT NULL) as roles
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE r.is_active = true OR r.is_active IS NULL
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;
```

---

## 👥 **QUERY 6: Roles → Agents Mapping**

```sql
SELECT 
    r.role_name as role,
    r.role_title,
    r.seniority_level,
    COUNT(a.id) as agent_count,
    array_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL) as agents
FROM org_roles r
LEFT JOIN agents a ON (
    a.metadata->>'role_id' = r.id::text 
    OR a.metadata->>'role_name' = r.role_name
)
WHERE r.is_active = true
GROUP BY r.id, r.role_name, r.role_title, r.seniority_level
HAVING COUNT(a.id) > 0
ORDER BY COUNT(a.id) DESC, r.role_name
LIMIT 50;
```

---

## 🌳 **QUERY 7: Visual Hierarchy Tree**

```sql
-- Create a visual tree structure
SELECT 
    '📂 ' || f.department_name as hierarchy_level,
    NULL as count
FROM org_functions f
GROUP BY f.department_name

UNION ALL

SELECT 
    '  └─ 🏢 ' || d.department_name,
    NULL
FROM org_departments d
GROUP BY d.department_name

UNION ALL

SELECT 
    '      └─ 👤 ' || r.role_name || ' (' || COALESCE(r.seniority_level, 'N/A') || ')',
    COUNT(DISTINCT a.id)::text
FROM org_roles r
LEFT JOIN agents a ON (
    a.metadata->>'role_id' = r.id::text 
    OR a.metadata->>'role_name' = r.role_name
)
WHERE r.is_active = true
GROUP BY r.role_name, r.seniority_level
ORDER BY hierarchy_level
LIMIT 100;
```

---

## 🔍 **QUERY 8: Find Agents Without Organizational Assignment**

```sql
-- Agents not assigned to any role
SELECT 
    a.id,
    a.name,
    a.category,
    a.metadata->>'role' as metadata_role,
    a.metadata->>'role_id' as metadata_role_id,
    a.metadata->>'role_name' as metadata_role_name
FROM agents a
WHERE a.is_active = true
    AND (
        (a.metadata->>'role_id' IS NULL OR a.metadata->>'role_id' = '')
        AND (a.metadata->>'role_name' IS NULL OR a.metadata->>'role_name' = '')
    )
ORDER BY a.name
LIMIT 50;
```

---

## 📊 **QUERY 9: Detailed Role Information**

```sql
-- Get detailed information about roles with their requirements
SELECT 
    f.department_name as business_function,
    d.department_name as department,
    r.role_name,
    r.role_title,
    r.seniority_level,
    r.years_experience_min || '-' || r.years_experience_max as experience_range,
    r.required_skills,
    r.required_certifications,
    r.is_active,
    COUNT(DISTINCT a.id) as agent_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
LEFT JOIN agents a ON (
    a.metadata->>'role_id' = r.id::text 
    OR a.metadata->>'role_name' = r.role_name
)
WHERE r.is_active = true
GROUP BY f.department_name, d.department_name, r.id, r.role_name, r.role_title, 
         r.seniority_level, r.years_experience_min, r.years_experience_max, 
         r.required_skills, r.required_certifications, r.is_active
ORDER BY f.department_name, d.department_name, r.seniority_level, r.role_name;
```

---

## 🎯 **QUERY 10: Most Common Roles by Agent Count**

```sql
-- Top 20 roles by number of agents
SELECT 
    r.role_name,
    r.role_title,
    d.department_name,
    f.department_name as business_function,
    r.seniority_level,
    COUNT(DISTINCT a.id) as agent_count,
    array_agg(DISTINCT a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL) as agent_names
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON d.function_id = f.id
LEFT JOIN agents a ON (
    a.metadata->>'role_id' = r.id::text 
    OR a.metadata->>'role_name' = r.role_name
)
WHERE r.is_active = true AND a.is_active = true
GROUP BY r.role_name, r.role_title, d.department_name, f.department_name, r.seniority_level
HAVING COUNT(DISTINCT a.id) > 0
ORDER BY agent_count DESC, r.role_name
LIMIT 20;
```

---

## 🚀 **RUN ALL IN CURSOR AI:**

```
Execute these queries one by one from the file: 
- Query 1 for complete hierarchy overview
- Query 2 for statistics
- Query 3-10 for detailed analysis
```

---

## 💡 **KEY NOTES:**

1. **Column Naming:**
   - `org_functions.department_name` → Actually the **function name** (confusing!)
   - `org_departments.department_name` → The **department name**
   - `org_roles.role_name` → The **role name**
   - `org_roles.role_title` → More descriptive role title

2. **Agent Assignment:**
   - Agents are linked via `metadata->>'role_id'` or `metadata->>'role_name'`
   - Not all agents may have role assignments

3. **Active Filters:**
   - Use `is_active = true` for roles
   - Use `is_active = true` for agents

---

**Start with Query 1 to see the complete hierarchy!** 🎯

