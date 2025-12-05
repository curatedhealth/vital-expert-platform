-- ============================================================================
-- Migration: L1 Master - VP Medical Affairs (Top-Level Router)
-- Date: 2025-12-02
-- Purpose: Create L1 Master agent that routes to L2 Experts and makes
--          enterprise-level Medical Affairs decisions
-- ============================================================================
--
-- Architecture:
--   L1 Master (VP) → Routes to L2 Experts (Department Heads)
--   - Enterprise-level decision authority
--   - Cross-functional coordination
--   - Query routing to appropriate departments
--   - Top of Medical Affairs agent hierarchy
--
-- ============================================================================

-- ============================================================================
-- PART 1: VP MEDICAL AFFAIRS (L1 MASTER)
-- ============================================================================

INSERT INTO agents (
  name, slug, tagline, description, function_name, department_name, role_name,
  agent_level_id, status, base_model, system_prompt, temperature, max_tokens,
  context_window, cost_per_query, avatar_url, metadata
)
SELECT
  'VP Medical Affairs',
  'vp-medical-affairs',
  'Medical Affairs Enterprise Leader',
  'L1 Master responsible for Medical Affairs strategy, cross-functional coordination, and routing queries to appropriate department heads. Top of the Medical Affairs agent hierarchy.',
  'Medical Affairs',
  'Executive',
  'Master',
  (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1),
  'active',
  'gpt-4',
  'You are the VP of Medical Affairs, the L1 Master responsible for enterprise Medical Affairs leadership.

YOU ARE:
The top-level Medical Affairs leader with authority over all MA functions: MSL Operations, Medical Information, Medical Communications, Pharmacovigilance, HEOR, KOL Management, Medical Education, and Medical Strategy. You route queries to appropriate L2 Heads, make enterprise decisions, and coordinate cross-functional activities.

YOU DO:
1. ROUTE queries to appropriate L2 Department Heads based on topic:
   - MSL/Field Medical → Head of MSL Operations
   - Medical Inquiries → Head of Medical Information
   - Publications → Head of Medical Communications
   - Safety/AE → Head of Pharmacovigilance (URGENT)
   - Value/HTA → Head of HEOR
   - KOL/Advisory → Head of KOL Management
   - CME/Education → Head of Medical Education
   - Strategy/Competitive → Head of Medical Strategy
2. Make enterprise-level Medical Affairs decisions
3. Approve cross-functional initiatives and budgets
4. Coordinate Medical Affairs alignment with R&D, Commercial, and Regulatory
5. Set Medical Affairs strategy and priorities
6. Resolve escalations from L2 Department Heads
7. Report to executive leadership on Medical Affairs performance

YOU NEVER:
1. Execute department-specific tasks (L2-L5 agents job)
2. Make decisions outside Medical Affairs scope (other functions)
3. Bypass safety escalation protocols
4. Approve promotional activities (outside MA scope)
5. Ignore urgent safety-related queries (ALWAYS route immediately)

ROUTING LOGIC:
- Keywords "MSL", "field", "territory", "HCP engagement" → head-of-msl
- Keywords "inquiry", "response", "label", "prescribing" → head-of-medinfo
- Keywords "publication", "manuscript", "abstract", "congress" → head-of-medcomms
- Keywords "safety", "adverse", "AE", "signal", "pharmacovigilance" → head-of-safety (PRIORITY)
- Keywords "economic", "HTA", "NICE", "ICER", "value" → head-of-heor
- Keywords "KOL", "thought leader", "advisory board", "speaker" → head-of-kol
- Keywords "education", "CME", "training", "learning" → head-of-meded
- Keywords "strategy", "competitive", "pipeline", "landscape" → head-of-medstrategy
- General/unclear → Ask clarifying question OR route to medaffairs-generalist

SUCCESS CRITERIA:
- Routing accuracy: >95% of queries sent to correct department
- Response time: Queries routed within 30 seconds
- Enterprise decisions: Made with full stakeholder input
- Cross-functional alignment: All major initiatives coordinated
- Safety escalation: Zero delays on urgent safety matters

WHEN UNSURE:
- If safety-related: ALWAYS route to Head of Pharmacovigilance immediately
- If multiple departments: Identify primary owner, coordinate handoff
- If enterprise impact: Gather input from all affected L2 Heads
- If outside MA scope: Clarify with user or redirect appropriately
- If strategic decision: Ensure alignment with corporate strategy

EVIDENCE REQUIREMENTS:
- Routing decisions logged with rationale
- Enterprise decisions cite strategic alignment
- Cross-functional initiatives documented with stakeholder input
- Performance metrics tracked against approved KPIs',
  0.2,
  4500,
  16000,
  0.35,
  '/icons/png/avatars/avatar_0401.png',
  jsonb_build_object(
    'tier', 3,
    'routes_to_experts', ARRAY['head-of-msl', 'head-of-medinfo', 'head-of-medcomms', 'head-of-safety', 'head-of-heor', 'head-of-kol', 'head-of-meded', 'head-of-medstrategy'],
    'routing_rules', jsonb_build_object(
      'msl_keywords', ARRAY['msl', 'field', 'territory', 'hcp engagement', 'scientific exchange'],
      'medinfo_keywords', ARRAY['inquiry', 'response', 'label', 'prescribing', 'medical information'],
      'medcomms_keywords', ARRAY['publication', 'manuscript', 'abstract', 'congress', 'poster'],
      'safety_keywords', ARRAY['safety', 'adverse', 'ae', 'signal', 'pharmacovigilance', 'serious'],
      'heor_keywords', ARRAY['economic', 'hta', 'nice', 'icer', 'value', 'reimbursement'],
      'kol_keywords', ARRAY['kol', 'thought leader', 'advisory', 'speaker', 'consultant'],
      'meded_keywords', ARRAY['education', 'cme', 'training', 'learning', 'accreditation'],
      'strategy_keywords', ARRAY['strategy', 'competitive', 'pipeline', 'landscape', 'intelligence']
    ),
    'priority_routing', jsonb_build_object(
      'safety', 'IMMEDIATE - head-of-safety',
      'regulatory', 'HIGH - coordinate with head-of-safety and head-of-medinfo',
      'enterprise', 'STANDARD - gather L2 input'
    ),
    'decision_authority', ARRAY['enterprise_strategy', 'budget_approval', 'cross_functional_coordination', 'escalation_resolution', 'performance_management'],
    'budget_authority', 5000000,
    'reports_to', 'chief-medical-officer',
    'model_justification', 'Enterprise leader requiring highest accuracy for routing and strategic decisions. GPT-4 achieves 86.7% on MedQA. Critical for MA leadership.',
    'model_citation', 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774'
  )
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'vp-medical-affairs');

-- ============================================================================
-- PART 2: PROMPT STARTERS FOR L1 MASTER
-- ============================================================================

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('I have a Medical Affairs question - can you help me find the right expert?', '🔀', 'routing', 1),
  ('Define our Medical Affairs strategy for the upcoming product launch', '🎯', 'strategy', 2),
  ('Coordinate cross-functional alignment on our Phase 3 data communication plan', '🤝', 'coordination', 3),
  ('What are the priorities for Medical Affairs this quarter?', '📋', 'planning', 4),
  ('I received an adverse event report - who should handle this?', '⚠️', 'safety_routing', 5),
  ('Approve the budget allocation across Medical Affairs departments', '💰', 'approval', 6),
  ('How should we align our MSL activities with the commercial launch timeline?', '📅', 'alignment', 7),
  ('Resolve this escalation between HEOR and Medical Communications', '⚖️', 'escalation', 8)
) AS starter(text, icon, category, seq)
WHERE a.slug = 'vp-medical-affairs';

-- ============================================================================
-- PART 3: HIERARCHY DELEGATION TABLES
-- ============================================================================

-- Create table for L1-L2 routing relationships
CREATE TABLE IF NOT EXISTS l1_l2_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- L1 Master reference
  master_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  master_slug TEXT NOT NULL,

  -- L2 Expert reference
  expert_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  expert_slug TEXT NOT NULL,

  -- Routing configuration
  department_name TEXT NOT NULL,
  routing_keywords TEXT[] NOT NULL,
  routing_priority INT DEFAULT 5,  -- 1=highest (safety), 10=lowest

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(master_id, expert_id)
);

-- Create table for L2-L3 orchestration relationships
CREATE TABLE IF NOT EXISTS l2_l3_orchestration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- L2 Expert reference
  expert_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  expert_slug TEXT NOT NULL,

  -- L3 Specialist reference
  specialist_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  specialist_slug TEXT NOT NULL,

  -- Orchestration configuration
  department_name TEXT NOT NULL,
  delegation_types TEXT[] NOT NULL,  -- Types of tasks delegated
  is_primary BOOLEAN DEFAULT true,   -- Primary specialist for this expert

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(expert_id, specialist_id)
);

-- Create table for L3-L4 delegation relationships
CREATE TABLE IF NOT EXISTS l3_l4_delegation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- L3 Specialist reference
  specialist_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  specialist_slug TEXT NOT NULL,

  -- L4 Worker/Context Engineer reference
  worker_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  worker_slug TEXT NOT NULL,
  worker_type TEXT NOT NULL,  -- 'context_engineer' or 'worker'

  -- Delegation configuration
  department_name TEXT NOT NULL,
  task_types TEXT[] NOT NULL,
  delegation_priority INT DEFAULT 5,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(specialist_id, worker_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_l1_l2_master ON l1_l2_routing(master_id);
CREATE INDEX IF NOT EXISTS idx_l1_l2_expert ON l1_l2_routing(expert_id);
CREATE INDEX IF NOT EXISTS idx_l2_l3_expert ON l2_l3_orchestration(expert_id);
CREATE INDEX IF NOT EXISTS idx_l2_l3_specialist ON l2_l3_orchestration(specialist_id);
CREATE INDEX IF NOT EXISTS idx_l3_l4_specialist ON l3_l4_delegation(specialist_id);
CREATE INDEX IF NOT EXISTS idx_l3_l4_worker ON l3_l4_delegation(worker_id);

-- ============================================================================
-- PART 4: POPULATE L1-L2 ROUTING
-- ============================================================================

-- VP Medical Affairs → All L2 Heads
INSERT INTO l1_l2_routing (master_id, master_slug, expert_id, expert_slug, department_name, routing_keywords, routing_priority)
SELECT
  m.id, m.slug,
  e.id, e.slug,
  routing.dept,
  routing.keywords,
  routing.priority
FROM agents m
CROSS JOIN (VALUES
  ('head-of-safety', 'Pharmacovigilance', ARRAY['safety', 'adverse', 'ae', 'signal', 'pharmacovigilance', 'serious', 'expedited'], 1),
  ('head-of-msl', 'MSL Operations', ARRAY['msl', 'field', 'territory', 'hcp engagement', 'scientific exchange', 'kol visit'], 3),
  ('head-of-medinfo', 'Medical Information', ARRAY['inquiry', 'response', 'label', 'prescribing', 'medical information', 'drug information'], 4),
  ('head-of-medcomms', 'Medical Communications', ARRAY['publication', 'manuscript', 'abstract', 'congress', 'poster', 'authorship'], 5),
  ('head-of-heor', 'HEOR', ARRAY['economic', 'hta', 'nice', 'icer', 'value', 'reimbursement', 'cost-effectiveness'], 5),
  ('head-of-kol', 'KOL Management', ARRAY['kol', 'thought leader', 'advisory', 'speaker', 'consultant', 'engagement'], 5),
  ('head-of-meded', 'Medical Education', ARRAY['education', 'cme', 'training', 'learning', 'accreditation', 'curriculum'], 6),
  ('head-of-medstrategy', 'Medical Strategy', ARRAY['strategy', 'competitive', 'pipeline', 'landscape', 'intelligence', 'unmet need'], 6)
) AS routing(expert_slug, dept, keywords, priority)
JOIN agents e ON e.slug = routing.expert_slug
WHERE m.slug = 'vp-medical-affairs'
ON CONFLICT (master_id, expert_id) DO NOTHING;

-- ============================================================================
-- PART 5: POPULATE L2-L3 ORCHESTRATION
-- ============================================================================

INSERT INTO l2_l3_orchestration (expert_id, expert_slug, specialist_id, specialist_slug, department_name, delegation_types, is_primary)
SELECT
  e.id, e.slug,
  s.id, s.slug,
  orch.dept,
  orch.task_types,
  orch.is_primary
FROM agents e
CROSS JOIN (VALUES
  ('head-of-msl', 'msl-specialist', 'MSL Operations', ARRAY['engagement_planning', 'content_review', 'activity_oversight'], true),
  ('head-of-medinfo', 'medinfo-scientist', 'Medical Information', ARRAY['response_drafting', 'inquiry_triage', 'template_usage'], true),
  ('head-of-medcomms', 'medical-writer', 'Medical Communications', ARRAY['manuscript_writing', 'abstract_drafting', 'timeline_management'], true),
  ('head-of-safety', 'safety-scientist', 'Pharmacovigilance', ARRAY['causality_assessment', 'signal_evaluation', 'case_review'], true),
  ('head-of-heor', 'health-economist', 'HEOR', ARRAY['model_development', 'evidence_synthesis', 'hta_support'], true),
  ('head-of-kol', 'kol-strategist', 'KOL Management', ARRAY['kol_identification', 'engagement_planning', 'advisory_design'], true),
  ('head-of-meded', 'meded-specialist', 'Medical Education', ARRAY['curriculum_design', 'content_development', 'outcome_evaluation'], true),
  ('head-of-medstrategy', 'medstrategy-analyst', 'Medical Strategy', ARRAY['competitive_analysis', 'insight_generation', 'trend_identification'], true)
) AS orch(expert_slug, specialist_slug, dept, task_types, is_primary)
JOIN agents s ON s.slug = orch.specialist_slug
WHERE e.slug = orch.expert_slug
ON CONFLICT (expert_id, specialist_id) DO NOTHING;

-- ============================================================================
-- PART 6: POPULATE L3-L4 DELEGATION
-- ============================================================================

-- MSL Specialist delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('msl-specialist', 'msl-context-engineer', 'context_engineer', 'MSL Operations', ARRAY['data_retrieval', 'literature_search', 'kol_lookup'], 1),
  ('msl-specialist', 'msl-activity-coordinator', 'worker', 'MSL Operations', ARRAY['log_engagement', 'update_crm', 'track_kol_interaction'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- MedInfo Scientist delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('medinfo-scientist', 'medinfo-context-engineer', 'context_engineer', 'Medical Information', ARRAY['fda_lookup', 'literature_search', 'template_retrieval'], 1),
  ('medinfo-scientist', 'medical-information-specialist', 'worker', 'Medical Information', ARRAY['log_inquiry', 'process_response', 'track_sla'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- Medical Writer delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('medical-writer', 'medcomms-context-engineer', 'context_engineer', 'Medical Communications', ARRAY['literature_search', 'congress_lookup', 'journal_search'], 1),
  ('medical-writer', 'publication-coordinator', 'worker', 'Medical Communications', ARRAY['track_manuscript', 'update_status', 'alert_deadline'], 2),
  ('medical-writer', 'medcomms-coordinator', 'worker', 'Medical Communications', ARRAY['log_submission', 'track_author_forms', 'update_tracker'], 3)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- Safety Scientist delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('safety-scientist', 'safety-context-engineer', 'context_engineer', 'Pharmacovigilance', ARRAY['faers_search', 'meddra_lookup', 'signal_data'], 1),
  ('safety-scientist', 'safety-case-processor', 'worker', 'Pharmacovigilance', ARRAY['log_case', 'code_meddra', 'track_expedited'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- Health Economist delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('health-economist', 'heor-context-engineer', 'context_engineer', 'HEOR', ARRAY['hta_search', 'nice_lookup', 'cochrane_search'], 1),
  ('health-economist', 'heor-coordinator', 'worker', 'HEOR', ARRAY['log_model_input', 'track_hta_submission', 'update_evidence_library'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- KOL Strategist delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('kol-strategist', 'kol-context-engineer', 'context_engineer', 'KOL Management', ARRAY['kol_search', 'publication_lookup', 'congress_calendar'], 1),
  ('kol-strategist', 'kol-engagement-coordinator', 'worker', 'KOL Management', ARRAY['log_interaction', 'update_profile', 'schedule_followup'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- MedEd Specialist delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('meded-specialist', 'meded-context-engineer', 'context_engineer', 'Medical Education', ARRAY['literature_search', 'guideline_lookup', 'congress_calendar'], 1),
  ('meded-specialist', 'meded-coordinator', 'worker', 'Medical Education', ARRAY['log_program', 'track_attendance', 'update_assessments'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- MedStrategy Analyst delegations
INSERT INTO l3_l4_delegation (specialist_id, specialist_slug, worker_id, worker_slug, worker_type, department_name, task_types, delegation_priority)
SELECT
  s.id, s.slug,
  w.id, w.slug,
  del.worker_type,
  del.dept,
  del.task_types,
  del.priority
FROM agents s
CROSS JOIN (VALUES
  ('medstrategy-analyst', 'medstrategy-context-engineer', 'context_engineer', 'Medical Strategy', ARRAY['competitive_search', 'pipeline_lookup', 'news_search'], 1),
  ('medstrategy-analyst', 'strategy-coordinator', 'worker', 'Medical Strategy', ARRAY['log_competitive_intel', 'update_landscape', 'track_milestones'], 2)
) AS del(specialist_slug, worker_slug, worker_type, dept, task_types, priority)
JOIN agents w ON w.slug = del.worker_slug
WHERE s.slug = del.specialist_slug
ON CONFLICT (specialist_id, worker_id) DO NOTHING;

-- ============================================================================
-- PART 7: COMPLETE HIERARCHY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW v_medical_affairs_hierarchy AS
WITH hierarchy AS (
  -- L1 Master
  SELECT
    1 as level_num,
    'L1 Master' as level_name,
    a.id,
    a.name,
    a.slug,
    a.department_name,
    NULL::UUID as reports_to_id,
    NULL::TEXT as reports_to_slug
  FROM agents a
  WHERE a.slug = 'vp-medical-affairs'

  UNION ALL

  -- L2 Experts
  SELECT
    2 as level_num,
    'L2 Expert' as level_name,
    a.id,
    a.name,
    a.slug,
    a.department_name,
    r.master_id as reports_to_id,
    r.master_slug as reports_to_slug
  FROM agents a
  JOIN l1_l2_routing r ON r.expert_id = a.id

  UNION ALL

  -- L3 Specialists
  SELECT
    3 as level_num,
    'L3 Specialist' as level_name,
    a.id,
    a.name,
    a.slug,
    a.department_name,
    o.expert_id as reports_to_id,
    o.expert_slug as reports_to_slug
  FROM agents a
  JOIN l2_l3_orchestration o ON o.specialist_id = a.id

  UNION ALL

  -- L4 Workers/Context Engineers
  SELECT
    4 as level_num,
    'L4 Worker' as level_name,
    a.id,
    a.name,
    a.slug,
    a.department_name,
    d.specialist_id as reports_to_id,
    d.specialist_slug as reports_to_slug
  FROM agents a
  JOIN l3_l4_delegation d ON d.worker_id = a.id
)
SELECT * FROM hierarchy
ORDER BY level_num, department_name, name;

-- ============================================================================
-- PART 8: VERIFICATION
-- ============================================================================

-- Verify L1 Master created
SELECT
  name,
  slug,
  department_name,
  status,
  base_model,
  metadata->>'tier' as tier,
  metadata->>'budget_authority' as budget_authority,
  jsonb_array_length(COALESCE(metadata->'routes_to_experts', '[]'::jsonb)) as expert_count
FROM agents
WHERE slug = 'vp-medical-affairs';

-- Verify hierarchy tables populated
SELECT 'L1-L2 Routing' as relationship, COUNT(*) as count FROM l1_l2_routing
UNION ALL
SELECT 'L2-L3 Orchestration', COUNT(*) FROM l2_l3_orchestration
UNION ALL
SELECT 'L3-L4 Delegation', COUNT(*) FROM l3_l4_delegation;

-- Show complete hierarchy
SELECT
  level_num,
  level_name,
  name,
  slug,
  department_name,
  reports_to_slug
FROM v_medical_affairs_hierarchy
ORDER BY level_num, department_name;

-- Summary by level
SELECT
  level_num,
  level_name,
  COUNT(*) as agent_count
FROM v_medical_affairs_hierarchy
GROUP BY level_num, level_name
ORDER BY level_num;
