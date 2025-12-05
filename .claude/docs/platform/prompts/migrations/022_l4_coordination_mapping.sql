-- ============================================================================
-- Migration: L4 Context Engineer Coordination Mappings
-- Date: 2025-12-02
-- Purpose: Create mapping tables for L4 Context Engineer coordination with:
--   - L5 Tools (vertical orchestration)
--   - L4 Workers (horizontal coordination)
-- ============================================================================
--
-- Architecture:
--   L4 Context Engineers coordinate:
--   1. VERTICALLY with L5 Tools → Data retrieval
--   2. HORIZONTALLY with L4 Workers → Task execution
--
-- This migration creates explicit permission/coordination mappings
-- ============================================================================

-- ============================================================================
-- PART 1: L4-L5 TOOL PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS l4_l5_tool_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- L4 Context Engineer reference
  context_engineer_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  context_engineer_slug TEXT NOT NULL,

  -- L5 Tool reference
  tool_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,

  -- Permission details
  is_primary BOOLEAN DEFAULT false,           -- Primary tool (always called) vs secondary
  usage_priority INT DEFAULT 5,               -- 1=highest priority, 10=lowest
  max_calls_per_request INT DEFAULT 1,        -- Rate limiting
  timeout_ms INT DEFAULT 2000,                -- Tool timeout

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(context_engineer_id, tool_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_l4_l5_context_engineer ON l4_l5_tool_permissions(context_engineer_id);
CREATE INDEX IF NOT EXISTS idx_l4_l5_tool ON l4_l5_tool_permissions(tool_id);
CREATE INDEX IF NOT EXISTS idx_l4_l5_primary ON l4_l5_tool_permissions(is_primary) WHERE is_primary = true;

-- ============================================================================
-- PART 2: L4-L4 WORKER COORDINATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS l4_worker_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- L4 Context Engineer reference
  context_engineer_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  context_engineer_slug TEXT NOT NULL,

  -- L4 Worker reference
  worker_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  worker_slug TEXT NOT NULL,

  -- Coordination details
  task_types TEXT[] NOT NULL,                 -- Tasks this worker can be delegated
  is_required BOOLEAN DEFAULT false,          -- Must coordinate vs optional
  coordination_priority INT DEFAULT 5,        -- 1=highest priority

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(context_engineer_id, worker_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_l4_coord_context_engineer ON l4_worker_coordination(context_engineer_id);
CREATE INDEX IF NOT EXISTS idx_l4_coord_worker ON l4_worker_coordination(worker_id);

-- ============================================================================
-- PART 3: POPULATE L4-L5 TOOL PERMISSIONS
-- ============================================================================

-- MSL Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('pubmed-search-tool', true, 1, 2000),
  ('clinicaltrials-search-tool', true, 2, 2000),
  ('kol-profile-tool', true, 3, 1000),
  ('web-search-tool', false, 4, 2000),
  ('rag-search-tool', false, 5, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'msl-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- MedComms Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('pubmed-search-tool', true, 1, 2000),
  ('congress-calendar-tool', true, 2, 1000),
  ('cochrane-search-tool', false, 3, 2000),
  ('web-search-tool', false, 4, 2000),
  ('rag-search-tool', false, 5, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'medcomms-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- MedInfo Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('fda-label-tool', true, 1, 1500),
  ('rag-search-tool', true, 2, 1000),
  ('pubmed-search-tool', true, 3, 2000),
  ('drug-interaction-tool', false, 4, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'medinfo-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- HEOR Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('nice-evidence-tool', true, 1, 2000),
  ('icer-database-tool', true, 2, 2000),
  ('pubmed-search-tool', true, 3, 2000),
  ('cochrane-search-tool', false, 4, 2000),
  ('rag-search-tool', false, 5, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'heor-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- Safety Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('faers-search-tool', true, 1, 3000),
  ('meddra-lookup-tool', true, 2, 1000),
  ('who-umc-tool', true, 3, 3000),
  ('pubmed-search-tool', false, 4, 2000),
  ('drug-interaction-tool', false, 5, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'safety-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- Medical Strategy Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('clinicaltrials-search-tool', true, 1, 2000),
  ('web-search-tool', true, 2, 2000),
  ('pubmed-search-tool', false, 3, 2000),
  ('rag-search-tool', false, 4, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'medstrategy-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- KOL Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('kol-profile-tool', true, 1, 1000),
  ('pubmed-search-tool', true, 2, 2000),
  ('congress-calendar-tool', true, 3, 1000),
  ('web-search-tool', false, 4, 2000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'kol-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- MedEd Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('pubmed-search-tool', true, 1, 2000),
  ('rag-search-tool', true, 2, 1000),
  ('web-search-tool', false, 3, 2000),
  ('congress-calendar-tool', false, 4, 1000)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'meded-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- Generic Context Engineer → Tools
INSERT INTO l4_l5_tool_permissions (context_engineer_id, context_engineer_slug, tool_id, tool_slug, is_primary, usage_priority, timeout_ms)
SELECT
  ce.id, ce.slug,
  t.id, t.slug,
  tool_config.is_primary,
  tool_config.priority,
  tool_config.timeout
FROM agents ce
CROSS JOIN (VALUES
  ('web-search-tool', true, 1, 2000),
  ('rag-search-tool', true, 2, 1000),
  ('calculator-tool', false, 3, 500)
) AS tool_config(slug, is_primary, priority, timeout)
JOIN agents t ON t.slug = tool_config.slug
WHERE ce.slug = 'generic-context-engineer'
ON CONFLICT (context_engineer_id, tool_id) DO NOTHING;

-- ============================================================================
-- PART 4: POPULATE L4-L4 WORKER COORDINATION
-- ============================================================================

-- MSL Context Engineer → Workers
INSERT INTO l4_worker_coordination (context_engineer_id, context_engineer_slug, worker_id, worker_slug, task_types, is_required, coordination_priority)
SELECT
  ce.id, ce.slug,
  w.id, w.slug,
  ARRAY['log_engagement', 'update_crm', 'track_kol_interaction'],
  true,
  1
FROM agents ce, agents w
WHERE ce.slug = 'msl-context-engineer'
  AND w.slug = 'msl-activity-coordinator'
ON CONFLICT (context_engineer_id, worker_id) DO NOTHING;

-- MedInfo Context Engineer → Workers
INSERT INTO l4_worker_coordination (context_engineer_id, context_engineer_slug, worker_id, worker_slug, task_types, is_required, coordination_priority)
SELECT
  ce.id, ce.slug,
  w.id, w.slug,
  ARRAY['log_inquiry', 'process_response', 'track_sla', 'update_metrics'],
  true,
  1
FROM agents ce, agents w
WHERE ce.slug = 'medinfo-context-engineer'
  AND w.slug = 'medical-information-specialist'
ON CONFLICT (context_engineer_id, worker_id) DO NOTHING;

-- ============================================================================
-- PART 5: CREATE VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: L4 Context Engineer Tool Summary
CREATE OR REPLACE VIEW v_context_engineer_tools AS
SELECT
  ce.name as context_engineer,
  ce.slug as ce_slug,
  ce.department_name,
  t.name as tool_name,
  t.slug as tool_slug,
  p.is_primary,
  p.usage_priority,
  p.timeout_ms
FROM l4_l5_tool_permissions p
JOIN agents ce ON ce.id = p.context_engineer_id
JOIN agents t ON t.id = p.tool_id
ORDER BY ce.department_name, p.usage_priority;

-- View: L4 Context Engineer Worker Summary
CREATE OR REPLACE VIEW v_context_engineer_workers AS
SELECT
  ce.name as context_engineer,
  ce.slug as ce_slug,
  ce.department_name,
  w.name as worker_name,
  w.slug as worker_slug,
  c.task_types,
  c.is_required,
  c.coordination_priority
FROM l4_worker_coordination c
JOIN agents ce ON ce.id = c.context_engineer_id
JOIN agents w ON w.id = c.worker_id
ORDER BY ce.department_name, c.coordination_priority;

-- View: Complete L4 Orchestration Map
CREATE OR REPLACE VIEW v_l4_orchestration_map AS
SELECT
  ce.name as context_engineer,
  ce.slug as ce_slug,
  ce.department_name,
  'tool' as coordination_type,
  t.name as target_name,
  t.slug as target_slug,
  p.is_primary as is_primary_required,
  p.usage_priority as priority
FROM l4_l5_tool_permissions p
JOIN agents ce ON ce.id = p.context_engineer_id
JOIN agents t ON t.id = p.tool_id

UNION ALL

SELECT
  ce.name as context_engineer,
  ce.slug as ce_slug,
  ce.department_name,
  'worker' as coordination_type,
  w.name as target_name,
  w.slug as target_slug,
  c.is_required as is_primary_required,
  c.coordination_priority as priority
FROM l4_worker_coordination c
JOIN agents ce ON ce.id = c.context_engineer_id
JOIN agents w ON w.id = c.worker_id

ORDER BY context_engineer, coordination_type, priority;

-- ============================================================================
-- PART 6: VERIFICATION
-- ============================================================================

-- Tool permissions summary
SELECT
  'L4-L5 Tool Permissions' as mapping_type,
  COUNT(*) as total_mappings,
  COUNT(DISTINCT context_engineer_id) as context_engineers,
  COUNT(DISTINCT tool_id) as tools,
  SUM(CASE WHEN is_primary THEN 1 ELSE 0 END) as primary_tools
FROM l4_l5_tool_permissions;

-- Worker coordination summary
SELECT
  'L4-L4 Worker Coordination' as mapping_type,
  COUNT(*) as total_mappings,
  COUNT(DISTINCT context_engineer_id) as context_engineers,
  COUNT(DISTINCT worker_id) as workers,
  SUM(CASE WHEN is_required THEN 1 ELSE 0 END) as required_workers
FROM l4_worker_coordination;

-- Full orchestration map
SELECT * FROM v_l4_orchestration_map ORDER BY context_engineer, coordination_type, priority;
