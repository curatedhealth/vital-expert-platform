-- ============================================================================
-- Migration: Populate Agent Tool Assignments
-- Date: 2025-11-23
-- Purpose: Create intelligent mappings between agents and tools based on roles
-- Table: agent_tool_assignments (not agent_tools)
-- ============================================================================

BEGIN;

-- ============================================================================
-- Populate agent_tool_assignments Junction Table
-- ============================================================================

-- Map web_search to all agents (universal tool, high auto-use priority)
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  10 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'web_search'
  AND t.is_active = true
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map pubmed_search to medical/clinical agents (high priority primary tool)
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  20 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'pubmed_search'
  AND t.is_active = true
  AND (
    a.department_name ILIKE '%Medical Affairs%'
    OR a.department_name ILIKE '%Clinical%'
    OR a.department_name ILIKE '%Research%'
    OR a.role_name ILIKE '%Medical%'
    OR a.role_name ILIKE '%Clinical%'
    OR a.role_name ILIKE '%Research%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map search_clinical_trials to clinical/regulatory agents
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  20 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'search_clinical_trials'
  AND t.is_active = true
  AND (
    a.department_name ILIKE '%Clinical%'
    OR a.department_name ILIKE '%Regulatory%'
    OR a.department_name ILIKE '%Medical Affairs%'
    OR a.role_name ILIKE '%Clinical%'
    OR a.role_name ILIKE '%Trial%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map fda_guidance_search to regulatory agents
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  20 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'fda_guidance_search'
  AND t.is_active = true
  AND (
    a.department_name ILIKE '%Regulatory%'
    OR a.role_name ILIKE '%Regulatory%'
    OR a.role_name ILIKE '%Compliance%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map ema_guidance_search to regulatory agents (Europe-focused, medium priority)
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  false AS auto_use,
  15 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'ema_guidance_search'
  AND t.is_active = true
  AND (
    a.department_name ILIKE '%Regulatory%'
    OR a.role_name ILIKE '%Regulatory%'
    OR a.role_name ILIKE '%Compliance%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map cochrane_search to evidence-based medicine roles
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  18 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'cochrane_search'
  AND t.is_active = true
  AND (
    a.department_name ILIKE '%Medical Affairs%'
    OR a.department_name ILIKE '%Clinical%'
    OR a.role_name ILIKE '%Medical%'
    OR a.role_name ILIKE '%Evidence%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map drugs_com_search to drug information specialists
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  17 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'drugs_com_search'
  AND t.is_active = true
  AND (
    a.role_name ILIKE '%Drug Information%'
    OR a.role_name ILIKE '%Pharmacist%'
    OR a.role_name ILIKE '%Medical Information%'
    OR a.department_name ILIKE '%Medical Affairs%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map digital_health_search to digital medicine roles
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  20 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'digital_health_search'
  AND t.is_active = true
  AND (
    a.role_name ILIKE '%Digital%'
    OR a.role_name ILIKE '%DHT%'
    OR a.department_name ILIKE '%Digital%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map quality_standards_search to quality/manufacturing roles
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  20 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'quality_standards_search'
  AND t.is_active = true
  AND (
    a.department_name ILIKE '%Quality%'
    OR a.department_name ILIKE '%Manufacturing%'
    OR a.role_name ILIKE '%Quality%'
    OR a.role_name ILIKE '%GMP%'
    OR a.role_name ILIKE '%Validation%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map calculator to quantitative/analytical roles
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  false AS auto_use,
  5 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'calculator'
  AND t.is_active = true
  AND (
    a.role_name ILIKE '%Analyst%'
    OR a.role_name ILIKE '%Statistician%'
    OR a.role_name ILIKE '%Data%'
    OR a.role_name ILIKE '%Scientist%'
    OR a.department_name ILIKE '%Analytics%'
  )
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Map knowledge_base_search to all active agents (internal docs, medium priority)
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
SELECT 
  a.id AS agent_id,
  t.id AS tool_id,
  true AS is_enabled,
  true AS auto_use,
  12 AS priority
FROM agents a
CROSS JOIN tools t
WHERE a.status = 'active'
  AND t.tool_key = 'knowledge_base_search'
  AND t.is_active = true
ON CONFLICT (agent_id, tool_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check total tool assignments
SELECT 
  'agent_tool_assignments' AS table_name,
  COUNT(*) AS total_assignments,
  COUNT(DISTINCT agent_id) AS agents_with_tools,
  COUNT(DISTINCT tool_id) AS tools_assigned
FROM agent_tool_assignments;

-- Show tool distribution
SELECT 
  t.tool_key,
  t.name,
  COUNT(ata.agent_id) AS agent_count,
  COUNT(*) FILTER (WHERE ata.auto_use = true) AS auto_use_count,
  ROUND(AVG(ata.priority)) AS avg_priority
FROM tools t
LEFT JOIN agent_tool_assignments ata ON t.id = ata.tool_id
WHERE t.is_active = true
GROUP BY t.id, t.tool_key, t.name
ORDER BY agent_count DESC;

-- Show agents with most tools
SELECT 
  a.name,
  a.role_name,
  a.department_name,
  COUNT(ata.tool_id) AS tool_count,
  STRING_AGG(t.name, ', ' ORDER BY ata.priority DESC) AS tools
FROM agents a
JOIN agent_tool_assignments ata ON a.id = ata.agent_id
JOIN tools t ON ata.tool_id = t.id
WHERE a.status = 'active'
GROUP BY a.id, a.name, a.role_name, a.department_name
ORDER BY tool_count DESC
LIMIT 10;

-- Show agents without tools (should be zero or very few)
SELECT 
  a.name,
  a.role_name,
  a.department_name,
  a.status
FROM agents a
LEFT JOIN agent_tool_assignments ata ON a.id = ata.agent_id
WHERE a.status = 'active'
  AND ata.id IS NULL;
