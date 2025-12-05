-- Migration: Assign citation/research skills to HEOR/Market Access agents
-- Generated from agents_rows (2).json and skills_rows (1).json
-- This enables agents to generate inline citations with proper evidence sources

-- Step 1: Insert citation skills (if not exist)
INSERT INTO skills (id, name, slug, category, description, skill_type, is_active) VALUES
  ('76bd9aa4-6e95-4524-9840-22100c45cad9', 'Literature Search Strategy', 'literature-search-strategy', 'Research & Evidence', 'Develop comprehensive database search strategies for systematic literature reviews', 'knowledge', true),
  ('83309532-7eb8-41a9-b592-8110a1f23e92', 'Evidence Table Generation', 'evidence-table-generation', 'Research & Evidence', 'Create structured evidence tables from literature including PICOS elements', 'knowledge', true),
  ('9577963e-86bd-47a1-aa8f-4e4bfb2d675b', 'PubMed Literature Search', 'pubmed-literature-search', 'Research & Evidence', 'Search PubMed for medical literature with proper MeSH terms and Boolean operators', 'knowledge', true),
  ('afc3be21-05a2-468d-b4eb-b3aa6179ebc6', 'Scientific Databases Access', 'scientific-databases-access', 'Research & Evidence', 'Access to 26 scientific databases including PubMed, PubChem, UniProt, ChEMBL, AlphaFold', 'knowledge', true),
  ('81093ab4-8aa6-4e16-8ddb-b586ae5b1348', 'Systematic Review Protocol Writing', 'systematic-review-protocol-writing', 'Research & Evidence', 'Write PRISMA-compliant systematic review protocols with proper methodology', 'knowledge', true),
  ('6e5b3f4d-6b17-40b4-ae0d-a07d46a96397', 'Real-World Evidence', 'real-world-evidence', 'Research & Evidence', 'Generating and analyzing RWE studies from healthcare databases and registries', 'knowledge', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Assign citation skills to 58 research/evidence agents (HEOR, Market Access, Value)
-- Each agent receives 6 citation skills: Literature Search, Evidence Tables, PubMed, Scientific DBs, Systematic Review, RWE

INSERT INTO agent_skill_assignments (id, agent_id, skill_id, proficiency_level, proficiency_score, is_enabled, execution_priority)
SELECT
  gen_random_uuid(),
  a.id,
  s.id,
  'expert',
  85,
  true,
  1
FROM agents a
CROSS JOIN skills s
WHERE s.id IN (
  '76bd9aa4-6e95-4524-9840-22100c45cad9',  -- Literature Search Strategy
  '83309532-7eb8-41a9-b592-8110a1f23e92',  -- Evidence Table Generation
  '9577963e-86bd-47a1-aa8f-4e4bfb2d675b',  -- PubMed Literature Search
  'afc3be21-05a2-468d-b4eb-b3aa6179ebc6',  -- Scientific Databases Access
  '81093ab4-8aa6-4e16-8ddb-b586ae5b1348',  -- Systematic Review Protocol Writing
  '6e5b3f4d-6b17-40b4-ae0d-a07d46a96397'   -- Real-World Evidence
)
AND a.status = 'active'
AND (
  -- HEOR agents
  LOWER(a.department_name) LIKE '%heor%'
  OR LOWER(a.department_name) LIKE '%health economics%'
  -- Market Access agents
  OR LOWER(a.department_name) LIKE '%market access%'
  OR LOWER(a.name) LIKE '%market access%'
  -- Value & Evidence agents
  OR LOWER(a.department_name) LIKE '%value%'
  OR LOWER(a.department_name) LIKE '%evidence%'
  -- Pricing & Reimbursement
  OR LOWER(a.department_name) LIKE '%pricing%'
  OR LOWER(a.department_name) LIKE '%reimbursement%'
  -- Research agents
  OR LOWER(a.name) LIKE '%research%'
  OR LOWER(a.name) LIKE '%systematic%'
  OR LOWER(a.name) LIKE '%literature%'
)
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Verify: Count assignments created
-- SELECT COUNT(*) as new_assignments FROM agent_skill_assignments WHERE skill_id IN (
--   '76bd9aa4-6e95-4524-9840-22100c45cad9',
--   '83309532-7eb8-41a9-b592-8110a1f23e92',
--   '9577963e-86bd-47a1-aa8f-4e4bfb2d675b',
--   'afc3be21-05a2-468d-b4eb-b3aa6179ebc6',
--   '81093ab4-8aa6-4e16-8ddb-b586ae5b1348',
--   '6e5b3f4d-6b17-40b4-ae0d-a07d46a96397'
-- );
