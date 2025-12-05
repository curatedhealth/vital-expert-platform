# JTBD Query Examples

**Last Updated**: 2024-11-21  
**Status**: Complete  
**Related Files**: `COMPLETE_JTBD_ARCHITECTURE.md`, `DATA_OWNERSHIP_GUIDE.md`

---

## Table of Contents

1. [Basic Queries](#basic-queries)
2. [Using Views (Recommended)](#using-views-recommended)
3. [Junction Table Queries](#junction-table-queries)
4. [Aggregation Queries](#aggregation-queries)
5. [Value & AI Queries](#value--ai-queries)
6. [Multi-Tenant Queries](#multi-tenant-queries)
7. [Performance Optimization](#performance-optimization)
8. [Complex Analytics](#complex-analytics)

---

## Basic Queries

### Get All Active JTBDs

```sql
SELECT id, code, name, complexity, frequency, status
FROM jtbd
WHERE deleted_at IS NULL
  AND status = 'active'
ORDER BY code;
```

### Get JTBD by Code

```sql
SELECT *
FROM jtbd
WHERE code = 'MA-001'
  AND deleted_at IS NULL;
```

### Search JTBDs by Name

```sql
SELECT id, code, name, description
FROM jtbd
WHERE name ILIKE '%clinical%'
  AND deleted_at IS NULL
ORDER BY name;
```

### Get JTBDs by Complexity

```sql
SELECT code, name, complexity, frequency
FROM jtbd
WHERE complexity IN ('high', 'very_high')
  AND deleted_at IS NULL
ORDER BY 
  CASE complexity
    WHEN 'very_high' THEN 1
    WHEN 'high' THEN 2
  END,
  name;
```

---

## Using Views (Recommended)

### Get Complete JTBD with All Mappings

```sql
-- Fastest way to get full JTBD data
SELECT *
FROM v_jtbd_complete
WHERE code = 'MA-001';

-- Or by name
SELECT *
FROM v_jtbd_complete
WHERE name ILIKE '%regulatory%'
ORDER BY name;
```

### Get All JTBDs for a Persona

```sql
SELECT 
  persona_name,
  jtbd_code,
  jtbd_name,
  complexity,
  importance,
  role_frequency
FROM v_persona_jtbd_inherited
WHERE persona_name = 'Senior Medical Director - Global'
ORDER BY 
  CASE importance
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END;
```

### Get All JTBDs for a Specific Role

```sql
SELECT 
  entity_name as role_name,
  code,
  name,
  complexity,
  frequency
FROM v_jtbd_by_org
WHERE entity_type = 'role'
  AND entity_name = 'Clinical Research Manager'
ORDER BY name;
```

### Get High-Priority AI Opportunities

```sql
SELECT 
  jtbd_code,
  jtbd_name,
  overall_ai_readiness,
  avg_value_driver_impact,
  priority_score,
  ai_opportunity_count
FROM v_jtbd_value_ai_summary
WHERE overall_ai_readiness > 0.7
  AND ai_opportunity_count > 0
ORDER BY priority_score DESC NULLS LAST
LIMIT 20;
```

### Get Org Hierarchy with JTBD Counts

```sql
SELECT 
  tenant_name,
  function_name,
  department_name,
  role_name,
  persona_count,
  jtbd_count,
  primary_jtbds
FROM v_role_persona_jtbd_hierarchy
WHERE tenant_name = 'Pharmaceuticals'
  AND jtbd_count > 0
ORDER BY function_name, department_name, role_name;
```

---

## Junction Table Queries

### Get All Roles for a JTBD

```sql
SELECT 
  j.code,
  j.name as jtbd_name,
  jr.role_name,
  jr.importance,
  jr.frequency,
  jr.is_primary
FROM jtbd j
JOIN jtbd_roles jr ON j.id = jr.jtbd_id
WHERE j.code = 'MA-001'
ORDER BY 
  CASE jr.importance
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END;
```

### Get All JTBDs for a Function

```sql
SELECT 
  jf.function_name,
  j.code,
  j.name,
  j.complexity,
  jf.relevance_score,
  jf.is_primary
FROM jtbd_functions jf
JOIN jtbd j ON jf.jtbd_id = j.id
WHERE jf.function_name = 'Medical Affairs'
  AND j.deleted_at IS NULL
ORDER BY jf.relevance_score DESC NULLS LAST, j.name;
```

### Find Critical JTBDs for a Department

```sql
SELECT 
  jd.department_name,
  j.code,
  j.name,
  jr.importance,
  COUNT(DISTINCT jr.role_id) as role_count
FROM jtbd_departments jd
JOIN jtbd j ON jd.jtbd_id = j.id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id AND jr.importance = 'critical'
WHERE jd.department_name = 'Clinical Operations'
  AND j.deleted_at IS NULL
GROUP BY jd.department_name, j.id, j.code, j.name, jr.importance
HAVING jr.importance = 'critical'
ORDER BY role_count DESC, j.name;
```

---

## Aggregation Queries

### Count JTBDs by Complexity

```sql
SELECT 
  complexity,
  COUNT(*) as jtbd_count,
  ROUND(AVG(validation_score), 2) as avg_validation_score
FROM jtbd
WHERE deleted_at IS NULL
  AND complexity IS NOT NULL
GROUP BY complexity
ORDER BY 
  CASE complexity
    WHEN 'low' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'high' THEN 3
    WHEN 'very_high' THEN 4
  END;
```

### Get Role with Most JTBDs

```sql
SELECT 
  jr.role_name,
  COUNT(DISTINCT jr.jtbd_id) as jtbd_count,
  COUNT(DISTINCT CASE WHEN jr.is_primary THEN jr.jtbd_id END) as primary_jtbd_count,
  STRING_AGG(DISTINCT j.name, ', ' ORDER BY j.name) FILTER (WHERE jr.is_primary) as primary_jobs
FROM jtbd_roles jr
JOIN jtbd j ON jr.jtbd_id = j.id
WHERE j.deleted_at IS NULL
GROUP BY jr.role_name
ORDER BY jtbd_count DESC
LIMIT 10;
```

### Get Function Coverage

```sql
SELECT 
  jf.function_name,
  COUNT(DISTINCT jf.jtbd_id) as jobs_mapped,
  COUNT(DISTINCT jd.department_id) as departments_involved,
  COUNT(DISTINCT jr.role_id) as roles_involved
FROM jtbd_functions jf
LEFT JOIN jtbd_departments jd ON jf.jtbd_id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON jf.jtbd_id = jr.jtbd_id
GROUP BY jf.function_name
ORDER BY jobs_mapped DESC;
```

### Get Pain Points Summary

```sql
SELECT 
  j.code,
  j.name,
  COUNT(DISTINCT pp.id) as pain_point_count,
  COUNT(DISTINCT CASE WHEN pp.severity IN ('critical', 'high') THEN pp.id END) as high_severity_count,
  STRING_AGG(pp.issue, ' | ' ORDER BY 
    CASE pp.severity
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      ELSE 4
    END
  ) FILTER (WHERE pp.severity IN ('critical', 'high')) as top_pain_points
FROM jtbd j
LEFT JOIN jtbd_pain_points pp ON j.id = pp.jtbd_id
WHERE j.deleted_at IS NULL
GROUP BY j.id, j.code, j.name
HAVING COUNT(pp.id) > 0
ORDER BY high_severity_count DESC, pain_point_count DESC;
```

---

## Value & AI Queries

### Get JTBDs by Value Category

```sql
SELECT 
  vc.name as value_category,
  j.code,
  j.name as jtbd_name,
  jvc.relevance_score
FROM jtbd_value_categories jvc
JOIN jtbd j ON jvc.jtbd_id = j.id
JOIN value_categories vc ON jvc.category_id = vc.id
WHERE vc.code IN ('SMARTER', 'FASTER')
  AND j.deleted_at IS NULL
ORDER BY vc.name, jvc.relevance_score DESC NULLS LAST;
```

### Get JTBDs by Value Driver Impact

```sql
SELECT 
  vd.name as value_driver,
  vd.driver_type,
  j.code,
  j.name as jtbd_name,
  jvd.impact_strength,
  jvd.quantified_value_usd
FROM jtbd_value_drivers jvd
JOIN jtbd j ON jvd.jtbd_id = j.id
JOIN value_drivers vd ON jvd.driver_id = vd.id
WHERE jvd.impact_strength > 0.6
  AND j.deleted_at IS NULL
ORDER BY jvd.impact_strength DESC, vd.name;
```

### Find High AI Readiness JTBDs

```sql
SELECT 
  j.code,
  j.name,
  j.complexity,
  ai.overall_ai_readiness,
  ai.automation_score,
  ai.rag_score,
  ait.name as intervention_type
FROM jtbd j
JOIN jtbd_ai_suitability ai ON j.id = ai.jtbd_id
LEFT JOIN ai_intervention_types ait ON ai.intervention_type_id = ait.id
WHERE ai.overall_ai_readiness >= 0.7
  AND j.deleted_at IS NULL
ORDER BY ai.overall_ai_readiness DESC, j.name;
```

### Get AI Opportunities by Complexity

```sql
SELECT 
  ao.complexity,
  COUNT(*) as opportunity_count,
  AVG(ao.automation_potential) as avg_automation_potential,
  SUM(ao.value_estimate_usd) as total_value_estimate
FROM ai_opportunities ao
JOIN jtbd j ON ao.jtbd_id = j.id
WHERE j.deleted_at IS NULL
GROUP BY ao.complexity
ORDER BY 
  CASE ao.complexity
    WHEN 'low' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'high' THEN 3
    WHEN 'very_high' THEN 4
  END;
```

### Get AI Use Cases for High-Value Opportunities

```sql
SELECT 
  j.name as jtbd_name,
  ao.opportunity_name,
  ao.automation_potential,
  ao.value_estimate_usd,
  ao.complexity,
  auc.use_case_name,
  auc.description as use_case_description
FROM ai_opportunities ao
JOIN jtbd j ON ao.jtbd_id = j.id
LEFT JOIN ai_use_cases auc ON ao.id = auc.opportunity_id
WHERE ao.automation_potential > 0.7
  AND j.deleted_at IS NULL
ORDER BY ao.value_estimate_usd DESC NULLS LAST, ao.opportunity_name;
```

---

## Multi-Tenant Queries

### Get JTBDs for Specific Tenant

```sql
SELECT 
  t.name as tenant_name,
  j.code,
  j.name,
  j.functional_area,
  j.complexity
FROM jtbd j
JOIN tenants t ON j.tenant_id = t.id
WHERE t.name = 'Pharmaceuticals'
  AND j.deleted_at IS NULL
ORDER BY j.code;
```

### Get Role-JTBD Mappings by Tenant

```sql
SELECT 
  t.name as tenant_name,
  jr.role_name,
  COUNT(DISTINCT jr.jtbd_id) as jtbd_count
FROM jtbd_roles jr
JOIN jtbd j ON jr.jtbd_id = j.id
LEFT JOIN tenants t ON jr.tenant_id = t.id
WHERE j.deleted_at IS NULL
GROUP BY t.name, jr.role_name
ORDER BY t.name, jtbd_count DESC;
```

### Compare JTBD Coverage Across Tenants

```sql
SELECT 
  j.code,
  j.name,
  COUNT(DISTINCT jr.tenant_id) as tenant_count,
  STRING_AGG(DISTINCT t.name, ', ' ORDER BY t.name) as tenants
FROM jtbd j
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
LEFT JOIN tenants t ON jr.tenant_id = t.id
WHERE j.deleted_at IS NULL
GROUP BY j.id, j.code, j.name
HAVING COUNT(DISTINCT jr.tenant_id) > 0
ORDER BY tenant_count DESC, j.code;
```

---

## Performance Optimization

### Use Cached Names (Fast)

```sql
-- ✅ GOOD: Uses cached name, no join needed
SELECT 
  j.name,
  STRING_AGG(jr.role_name, ', ') as roles
FROM jtbd j
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
WHERE j.deleted_at IS NULL
GROUP BY j.id, j.name
LIMIT 100;
```

### Avoid Unnecessary Joins

```sql
-- ❌ SLOW: Unnecessary join to org_roles
SELECT j.name, r.name
FROM jtbd j
JOIN jtbd_roles jr ON j.id = jr.jtbd_id
JOIN org_roles r ON jr.role_id = r.id;  -- Unnecessary!

-- ✅ FAST: Use cached name
SELECT j.name, jr.role_name
FROM jtbd j
JOIN jtbd_roles jr ON j.id = jr.jtbd_id;
```

### Index-Friendly Queries

```sql
-- ✅ Uses indexes efficiently
SELECT *
FROM jtbd
WHERE tenant_id = 'specific-uuid'  -- Indexed
  AND status = 'active'             -- Indexed
  AND deleted_at IS NULL            -- Indexed (partial)
  AND code LIKE 'MA-%';             -- Can use index with prefix

-- ❌ Can't use indexes well
SELECT *
FROM jtbd
WHERE LOWER(name) LIKE '%clinical%';  -- Function prevents index use
```

### Limit Results for Large Queries

```sql
-- Always use LIMIT for exploratory queries
SELECT *
FROM v_jtbd_complete
ORDER BY created_at DESC
LIMIT 50;  -- Don't fetch thousands of rows unnecessarily
```

---

## Complex Analytics

### JTBD Prioritization Matrix

```sql
SELECT 
  j.code,
  j.name,
  j.complexity,
  COUNT(DISTINCT jr.role_id) as role_count,
  COUNT(DISTINCT pp.id) as pain_point_count,
  COUNT(DISTINCT CASE WHEN pp.severity IN ('critical', 'high') THEN pp.id END) as high_severity_pain_count,
  AVG(ai.overall_ai_readiness) as avg_ai_readiness,
  COUNT(DISTINCT ao.id) as ai_opportunity_count,
  -- Priority score: roles × pain × AI readiness
  COUNT(DISTINCT jr.role_id) * 
    (COUNT(DISTINCT CASE WHEN pp.severity IN ('critical', 'high') THEN pp.id END) + 1) * 
    COALESCE(AVG(ai.overall_ai_readiness), 0) as priority_score
FROM jtbd j
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
LEFT JOIN jtbd_pain_points pp ON j.id = pp.jtbd_id
LEFT JOIN jtbd_ai_suitability ai ON j.id = ai.jtbd_id
LEFT JOIN ai_opportunities ao ON j.id = ao.jtbd_id
WHERE j.deleted_at IS NULL
  AND j.status = 'active'
GROUP BY j.id, j.code, j.name, j.complexity
HAVING COUNT(DISTINCT jr.role_id) > 0  -- Must be mapped to roles
ORDER BY priority_score DESC
LIMIT 20;
```

### Value Driver Analysis by Function

```sql
SELECT 
  jf.function_name,
  vd.name as value_driver,
  vd.driver_type,
  COUNT(DISTINCT j.id) as jtbd_count,
  AVG(jvd.impact_strength) as avg_impact,
  SUM(jvd.quantified_value_usd) as total_value_usd
FROM jtbd_functions jf
JOIN jtbd j ON jf.jtbd_id = j.id
JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
JOIN value_drivers vd ON jvd.driver_id = vd.id
WHERE j.deleted_at IS NULL
GROUP BY jf.function_name, vd.id, vd.name, vd.driver_type
ORDER BY jf.function_name, total_value_usd DESC NULLS LAST;
```

### Role Workload Analysis

```sql
SELECT 
  jr.role_name,
  COUNT(DISTINCT jr.jtbd_id) as total_jobs,
  COUNT(DISTINCT CASE WHEN jr.importance = 'critical' THEN jr.jtbd_id END) as critical_jobs,
  COUNT(DISTINCT CASE WHEN jr.frequency IN ('daily', 'weekly') THEN jr.jtbd_id END) as frequent_jobs,
  COUNT(DISTINCT CASE WHEN j.complexity IN ('high', 'very_high') THEN jr.jtbd_id END) as complex_jobs,
  -- Workload score
  COUNT(DISTINCT jr.jtbd_id) * 1.0 +
    COUNT(DISTINCT CASE WHEN jr.importance = 'critical' THEN jr.jtbd_id END) * 2.0 +
    COUNT(DISTINCT CASE WHEN j.complexity = 'very_high' THEN jr.jtbd_id END) * 1.5
    as workload_score
FROM jtbd_roles jr
JOIN jtbd j ON jr.jtbd_id = j.id
WHERE j.deleted_at IS NULL
GROUP BY jr.role_name
ORDER BY workload_score DESC;
```

### AI Readiness by Functional Area

```sql
SELECT 
  j.functional_area,
  COUNT(*) as jtbd_count,
  ROUND(AVG(ai.overall_ai_readiness)::NUMERIC, 2) as avg_readiness,
  ROUND(AVG(ai.automation_score)::NUMERIC, 2) as avg_automation,
  COUNT(DISTINCT ao.id) as opportunity_count,
  COUNT(DISTINCT CASE WHEN ao.complexity IN ('low', 'medium') THEN ao.id END) as low_hanging_fruit
FROM jtbd j
LEFT JOIN jtbd_ai_suitability ai ON j.id = ai.jtbd_id
LEFT JOIN ai_opportunities ao ON j.id = ao.jtbd_id
WHERE j.deleted_at IS NULL
  AND j.functional_area IS NOT NULL
GROUP BY j.functional_area
ORDER BY avg_readiness DESC NULLS LAST;
```

### Persona Job Complexity Distribution

```sql
SELECT 
  p.archetype,
  p.seniority_level,
  p.geographic_scope,
  COUNT(DISTINCT j.id) as job_count,
  ROUND(AVG(
    CASE j.complexity
      WHEN 'low' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'high' THEN 3
      WHEN 'very_high' THEN 4
    END
  ), 2) as avg_complexity_score,
  COUNT(DISTINCT CASE WHEN j.complexity IN ('high', 'very_high') THEN j.id END) as high_complexity_jobs
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN jtbd_roles jr ON r.id = jr.role_id
JOIN jtbd j ON jr.jtbd_id = j.id
WHERE p.deleted_at IS NULL
  AND j.deleted_at IS NULL
GROUP BY p.archetype, p.seniority_level, p.geographic_scope
ORDER BY p.seniority_level, p.geographic_scope;
```

---

## Full-Text Search (Advanced)

### Setup: Add tsvector Column

```sql
-- Add full-text search column (run once)
ALTER TABLE jtbd ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX idx_jtbd_search ON jtbd USING GIN(search_vector);

-- Update search vector
UPDATE jtbd 
SET search_vector = 
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(circumstance, '')), 'C');

-- Keep it updated with trigger
CREATE OR REPLACE FUNCTION update_jtbd_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.circumstance, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jtbd_search
  BEFORE INSERT OR UPDATE ON jtbd
  FOR EACH ROW
  EXECUTE FUNCTION update_jtbd_search_vector();
```

### Full-Text Search Queries

```sql
-- Search JTBDs
SELECT 
  code,
  name,
  ts_rank(search_vector, query) as relevance
FROM jtbd, 
  to_tsquery('english', 'clinical & trial & safety') as query
WHERE search_vector @@ query
  AND deleted_at IS NULL
ORDER BY relevance DESC
LIMIT 20;

-- Search with highlighting
SELECT 
  code,
  name,
  ts_headline('english', description, query) as highlighted_description
FROM jtbd,
  to_tsquery('english', 'regulatory & compliance') as query
WHERE search_vector @@ query
  AND deleted_at IS NULL;
```

---

## Quick Reference

### Most Useful Views

```sql
-- Everything about a JTBD
SELECT * FROM v_jtbd_complete WHERE code = '...';

-- Persona's inherited jobs
SELECT * FROM v_persona_jtbd_inherited WHERE persona_name = '...';

-- Jobs by org entity
SELECT * FROM v_jtbd_by_org WHERE entity_name = '...';

-- AI + Value summary
SELECT * FROM v_jtbd_value_ai_summary ORDER BY priority_score DESC;

-- Org hierarchy
SELECT * FROM v_role_persona_jtbd_hierarchy WHERE tenant_name = '...';
```

### Performance Tips

1. **Use views when possible** - Pre-optimized joins
2. **Use cached names** - Avoid joining to org tables
3. **Always filter deleted_at IS NULL** - Uses partial index
4. **Use LIMIT** - Don't fetch unnecessary data
5. **Filter early** - WHERE before JOIN when possible

---

## Need More Examples?

- **Architecture**: `COMPLETE_JTBD_ARCHITECTURE.md`
- **Data Decisions**: `DATA_OWNERSHIP_GUIDE.md`
- **Migration Details**: `06-migrations/MIGRATION_COMPLETE_SUMMARY.md`

---

**Document Version**: 1.0  
**Last Reviewed**: 2024-11-21

