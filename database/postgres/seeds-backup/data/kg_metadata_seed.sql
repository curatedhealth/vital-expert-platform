-- Seed Knowledge Graph Metadata
-- Populates kg_node_types, kg_edge_types, and agent_kg_views tables

-- ============================================================================
-- KG Node Types
-- ============================================================================

INSERT INTO kg_node_types (name, description, properties, is_active)
VALUES
  (
    'Agent',
    'AI agent node representing a medical affairs expert or specialist',
    '{"schema": ["id", "name", "role", "department", "function", "agent_level"], "required": ["id", "name"]}'::jsonb,
    true
  ),
  (
    'Skill',
    'Skill or capability node representing specific expertise or competencies',
    '{"schema": ["id", "name", "category", "complexity_level"], "required": ["id", "name"]}'::jsonb,
    true
  ),
  (
    'Tool',
    'Tool or instrument node representing software, APIs, or methodologies',
    '{"schema": ["id", "name", "tool_type", "description"], "required": ["id", "name"]}'::jsonb,
    true
  ),
  (
    'KnowledgeDomain',
    'Knowledge domain or subject area representing specialized knowledge',
    '{"schema": ["id", "name", "domain_type", "scope"], "required": ["id", "name"]}'::jsonb,
    true
  ),
  (
    'Drug',
    'Pharmaceutical drug entity with indication and manufacturer information',
    '{"schema": ["id", "name", "generic_name", "indication", "manufacturer", "approval_date"], "required": ["id", "name"]}'::jsonb,
    true
  ),
  (
    'Disease',
    'Medical condition or disease with ICD-10 coding',
    '{"schema": ["id", "name", "icd10_code", "disease_type", "severity"], "required": ["id", "name"]}'::jsonb,
    true
  ),
  (
    'ClinicalTrial',
    'Clinical trial or research study',
    '{"schema": ["id", "nct_id", "title", "phase", "status", "sponsor"], "required": ["id", "nct_id"]}'::jsonb,
    true
  ),
  (
    'Publication',
    'Scientific publication or research paper',
    '{"schema": ["id", "title", "authors", "journal", "publication_date", "pmid"], "required": ["id", "title"]}'::jsonb,
    true
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  properties = EXCLUDED.properties,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- KG Edge Types
-- ============================================================================

INSERT INTO kg_edge_types (name, description, inverse_name, properties, is_active)
VALUES
  ('HAS_SKILL', 'Agent has a specific skill or capability', 'SKILL_OF', '{"source": "Agent", "target": "Skill"}'::jsonb, true),
  ('USES_TOOL', 'Agent uses a specific tool or instrument', 'USED_BY', '{"source": "Agent", "target": "Tool"}'::jsonb, true),
  ('KNOWS_ABOUT', 'Agent has knowledge about a specific domain', 'KNOWN_BY', '{"source": "Agent", "target": "KnowledgeDomain"}'::jsonb, true),
  ('DELEGATES_TO', 'Agent delegates tasks to another agent (hierarchy)', 'RECEIVES_FROM', '{"source": "Agent", "target": "Agent"}'::jsonb, true),
  ('COLLABORATES_WITH', 'Agent collaborates with another agent (peer)', 'COLLABORATES_WITH', '{"source": "Agent", "target": "Agent"}'::jsonb, true),
  ('TREATS', 'Drug treats a specific disease or condition', 'TREATED_BY', '{"source": "Drug", "target": "Disease"}'::jsonb, true),
  ('STUDIED_IN', 'Drug is studied in a clinical trial', 'STUDIES', '{"source": "Drug", "target": "ClinicalTrial"}'::jsonb, true),
  ('INVESTIGATES', 'Clinical trial investigates a disease', 'INVESTIGATED_BY', '{"source": "ClinicalTrial", "target": "Disease"}'::jsonb, true),
  ('PUBLISHED_ABOUT', 'Publication is about a drug', 'SUBJECT_OF', '{"source": "Publication", "target": "Drug"}'::jsonb, true),
  ('CITES', 'Publication cites another publication', 'CITED_BY', '{"source": "Publication", "target": "Publication"}'::jsonb, true),
  ('AUTHORED_BY', 'Publication is authored by an agent/expert', 'AUTHORS', '{"source": "Publication", "target": "Agent"}'::jsonb, true),
  ('HAS_INDICATION', 'Drug has indication for disease', 'INDICATION_FOR', '{"source": "Drug", "target": "Disease"}'::jsonb, true),
  ('HAS_CONTRAINDICATION', 'Drug has contraindication for disease', 'CONTRAINDICATION_FOR', '{"source": "Drug", "target": "Disease"}'::jsonb, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  inverse_name = EXCLUDED.inverse_name,
  properties = EXCLUDED.properties,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- Agent KG Views (Default views for all active agents)
-- ============================================================================

-- Create default KG view for each active agent
-- Uses subqueries to get UUIDs of node and edge types by name

INSERT INTO agent_kg_views (
  agent_id,
  name,
  description,
  include_nodes,
  include_edges,
  max_hops,
  graph_limit,
  depth_strategy,
  is_active
)
SELECT 
  a.id AS agent_id,
  'default_view' AS name,
  'Default knowledge graph view for general agents' AS description,
  -- Get UUIDs for node types: Agent, Skill, Tool, KnowledgeDomain
  ARRAY(
    SELECT id FROM kg_node_types 
    WHERE name IN ('Agent', 'Skill', 'Tool', 'KnowledgeDomain') 
    AND is_active = true
  ) AS include_nodes,
  -- Get UUIDs for edge types: HAS_SKILL, USES_TOOL, KNOWS_ABOUT, DELEGATES_TO, COLLABORATES_WITH
  ARRAY(
    SELECT id FROM kg_edge_types 
    WHERE name IN ('HAS_SKILL', 'USES_TOOL', 'KNOWS_ABOUT', 'DELEGATES_TO', 'COLLABORATES_WITH')
    AND is_active = true
  ) AS include_edges,
  2 AS max_hops,
  100 AS graph_limit,
  'breadth' AS depth_strategy,
  true AS is_active
FROM agents a
WHERE a.status = 'active'
ON CONFLICT (agent_id, name) DO UPDATE SET
  description = EXCLUDED.description,
  include_nodes = EXCLUDED.include_nodes,
  include_edges = EXCLUDED.include_edges,
  max_hops = EXCLUDED.max_hops,
  graph_limit = EXCLUDED.graph_limit,
  depth_strategy = EXCLUDED.depth_strategy,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Create specialized medical view for medical/clinical agents
INSERT INTO agent_kg_views (
  agent_id,
  name,
  description,
  include_nodes,
  include_edges,
  max_hops,
  graph_limit,
  depth_strategy,
  is_active
)
SELECT 
  a.id AS agent_id,
  'medical_view' AS name,
  'Specialized medical knowledge graph view for clinical agents' AS description,
  -- Get UUIDs for medical node types: Agent, Drug, Disease, ClinicalTrial, Publication
  ARRAY(
    SELECT id FROM kg_node_types 
    WHERE name IN ('Agent', 'Drug', 'Disease', 'ClinicalTrial', 'Publication')
    AND is_active = true
  ) AS include_nodes,
  -- Get UUIDs for medical edge types
  ARRAY(
    SELECT id FROM kg_edge_types 
    WHERE name IN ('TREATS', 'STUDIED_IN', 'INVESTIGATES', 'PUBLISHED_ABOUT', 'HAS_INDICATION', 'AUTHORED_BY')
    AND is_active = true
  ) AS include_edges,
  3 AS max_hops,
  200 AS graph_limit,
  'breadth' AS depth_strategy,
  true AS is_active
FROM agents a
WHERE a.status = 'active'
  AND (
    a.name ILIKE '%Medical%'
    OR a.name ILIKE '%Clinical%'
    OR a.name ILIKE '%MSL%'
    OR a.role_name ILIKE '%Medical Science Liaison%'
    OR a.role_name ILIKE '%Medical%'
    OR a.role_name ILIKE '%Clinical%'
    OR a.department_name ILIKE '%Medical Affairs%'
    OR a.department_name ILIKE '%Clinical%'
    OR a.function_name ILIKE '%Medical%'
    OR a.function_name ILIKE '%Clinical%'
  )
ON CONFLICT (agent_id, name) DO UPDATE SET
  description = EXCLUDED.description,
  include_nodes = EXCLUDED.include_nodes,
  include_edges = EXCLUDED.include_edges,
  max_hops = EXCLUDED.max_hops,
  graph_limit = EXCLUDED.graph_limit,
  depth_strategy = EXCLUDED.depth_strategy,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();


-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Count node types
SELECT COUNT(*) as total_node_types FROM kg_node_types WHERE is_active = true;

-- Count edge types
SELECT COUNT(*) as total_edge_types FROM kg_edge_types WHERE is_active = true;

-- Count agent KG views
SELECT COUNT(*) as total_agent_views FROM agent_kg_views WHERE is_active = true;

-- Show distribution of views per agent
SELECT 
  COUNT(DISTINCT agent_id) as agents_with_views,
  COUNT(*) as total_views,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT agent_id), 0), 2) as avg_views_per_agent
FROM agent_kg_views
WHERE is_active = true;

-- Show all node types
SELECT id, name, description FROM kg_node_types WHERE is_active = true ORDER BY name;

-- Show all edge types  
SELECT id, name, description, inverse_name FROM kg_edge_types WHERE is_active = true ORDER BY name;

-- Show sample agent views
SELECT 
  a.name as agent_name,
  v.name as view_name,
  v.max_hops,
  v.graph_limit,
  array_length(v.include_nodes, 1) as num_node_types,
  array_length(v.include_edges, 1) as num_edge_types
FROM agent_kg_views v
JOIN agents a ON v.agent_id = a.id
WHERE v.is_active = true
LIMIT 10;

