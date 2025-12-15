-- ============================================================================
-- VITAL Platform: Comprehensive Agent Schema Migration
-- ============================================================================
-- Date: 2025-11-26
-- Description: Fully normalized schema for agent configuration UI
--              Supports form-based prompt building, personality/style attributes,
--              slider-adjustable parameters, and agent relationships
--
-- IMPORTANT: This migration is IDEMPOTENT - safe to run multiple times
-- ============================================================================

-- ============================================================================
-- SECTION 1: PERSONA ARCHETYPES (Lookup Table)
-- ============================================================================
-- The 10 core persona archetypes that define agent communication style

CREATE TABLE IF NOT EXISTS persona_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_code TEXT UNIQUE NOT NULL,
  archetype_name TEXT NOT NULL,
  description TEXT,

  -- Default tone characteristics (0-100 scale)
  default_tone TEXT NOT NULL,
  default_formality INTEGER DEFAULT 70 CHECK (default_formality BETWEEN 0 AND 100),
  default_empathy INTEGER DEFAULT 50 CHECK (default_empathy BETWEEN 0 AND 100),
  default_directness INTEGER DEFAULT 70 CHECK (default_directness BETWEEN 0 AND 100),

  -- Typical domains (for suggestions)
  typical_functions TEXT[],

  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed persona archetypes (idempotent with ON CONFLICT)
INSERT INTO persona_archetypes (archetype_code, archetype_name, description, default_tone, default_formality, default_empathy, default_directness, typical_functions, display_order) VALUES
  ('clinical_expert', 'Clinical Expert', 'Medical/pharmaceutical specialists with evidence-focused, compassionate communication', 'professional', 80, 70, 75, ARRAY['Medical Affairs', 'R&D', 'Clinical Operations'], 1),
  ('regulatory_authority', 'Regulatory Authority', 'FDA, EMA, compliance specialists with formal, precise communication', 'formal', 90, 40, 85, ARRAY['Regulatory Affairs', 'Quality', 'Compliance'], 2),
  ('data_analyst', 'Data Analyst', 'Metrics and analytics specialists with data-driven, objective communication', 'professional', 70, 40, 80, ARRAY['Analytics', 'Business Intelligence', 'Finance'], 3),
  ('safety_officer', 'Safety Officer', 'Risk and pharmacovigilance specialists with cautious, thorough communication', 'formal', 85, 60, 70, ARRAY['Pharmacovigilance', 'Safety', 'Risk Management'], 4),
  ('research_specialist', 'Research Specialist', 'Clinical trials and R&D specialists with scientific, methodical communication', 'professional', 75, 50, 75, ARRAY['R&D', 'Clinical Development', 'Biostatistics'], 5),
  ('business_strategist', 'Business Strategist', 'Commercial and market access specialists with strategic, ROI-oriented communication', 'professional', 70, 45, 85, ARRAY['Commercial', 'Market Access', 'Business Development'], 6),
  ('operations_manager', 'Operations Manager', 'Manufacturing and supply chain specialists with process-oriented, practical communication', 'professional', 65, 50, 80, ARRAY['Manufacturing', 'Supply Chain', 'Quality Assurance'], 7),
  ('compliance_guardian', 'Compliance Guardian', 'Legal and regulatory compliance specialists with risk-averse, policy-focused communication', 'formal', 90, 35, 75, ARRAY['Legal', 'Compliance', 'Privacy'], 8),
  ('innovation_advisor', 'Innovation Advisor', 'Digital health and technology specialists with forward-thinking, solution-oriented communication', 'accessible', 55, 60, 70, ARRAY['Digital Health', 'IT', 'Innovation'], 9),
  ('patient_advocate', 'Patient Advocate', 'Patient engagement specialists with accessible, empathetic, health-literacy focused communication', 'accessible', 45, 90, 60, ARRAY['Patient Engagement', 'Medical Information', 'Education'], 10)
ON CONFLICT (archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  description = EXCLUDED.description,
  default_tone = EXCLUDED.default_tone,
  default_formality = EXCLUDED.default_formality,
  default_empathy = EXCLUDED.default_empathy,
  default_directness = EXCLUDED.default_directness,
  typical_functions = EXCLUDED.typical_functions,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Index for persona archetypes
CREATE INDEX IF NOT EXISTS idx_persona_archetypes_active ON persona_archetypes(is_active) WHERE is_active = true;

-- ============================================================================
-- SECTION 2: COMMUNICATION STYLES (Lookup Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS communication_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT UNIQUE NOT NULL,
  style_name TEXT NOT NULL,
  description TEXT,

  -- Style characteristics (0-100 scale)
  verbosity_level INTEGER DEFAULT 50 CHECK (verbosity_level BETWEEN 0 AND 100),
  technical_level INTEGER DEFAULT 50 CHECK (technical_level BETWEEN 0 AND 100),
  structure_preference TEXT DEFAULT 'balanced' CHECK (structure_preference IN ('bullet_points', 'narrative', 'tables', 'balanced')),

  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed communication styles
INSERT INTO communication_styles (style_code, style_name, description, verbosity_level, technical_level, structure_preference, display_order) VALUES
  ('concise_technical', 'Concise Technical', 'Brief, technical responses for expert audiences', 30, 90, 'bullet_points', 1),
  ('detailed_technical', 'Detailed Technical', 'Comprehensive technical explanations with full context', 80, 90, 'narrative', 2),
  ('concise_accessible', 'Concise Accessible', 'Brief, easy-to-understand responses', 30, 30, 'bullet_points', 3),
  ('detailed_accessible', 'Detailed Accessible', 'Thorough explanations in plain language', 80, 30, 'narrative', 4),
  ('balanced', 'Balanced', 'Moderate detail with appropriate technical level', 50, 50, 'balanced', 5),
  ('executive_summary', 'Executive Summary', 'High-level insights with actionable recommendations', 40, 60, 'bullet_points', 6),
  ('educational', 'Educational', 'Teaching-oriented with examples and context', 70, 50, 'narrative', 7),
  ('data_driven', 'Data-Driven', 'Evidence-focused with statistics and citations', 60, 70, 'tables', 8)
ON CONFLICT (style_code) DO UPDATE SET
  style_name = EXCLUDED.style_name,
  description = EXCLUDED.description,
  verbosity_level = EXCLUDED.verbosity_level,
  technical_level = EXCLUDED.technical_level,
  structure_preference = EXCLUDED.structure_preference,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================================================
-- SECTION 3: TONE MODIFIERS (Lookup Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tone_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_code TEXT UNIQUE NOT NULL,
  modifier_name TEXT NOT NULL,
  description TEXT,

  -- Impact on base personality (additive, -50 to +50)
  formality_adjustment INTEGER DEFAULT 0 CHECK (formality_adjustment BETWEEN -50 AND 50),
  empathy_adjustment INTEGER DEFAULT 0 CHECK (empathy_adjustment BETWEEN -50 AND 50),
  directness_adjustment INTEGER DEFAULT 0 CHECK (directness_adjustment BETWEEN -50 AND 50),

  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed tone modifiers
INSERT INTO tone_modifiers (modifier_code, modifier_name, description, formality_adjustment, empathy_adjustment, directness_adjustment, display_order) VALUES
  ('urgent', 'Urgent', 'For time-sensitive communications', 10, -10, 20, 1),
  ('reassuring', 'Reassuring', 'For sensitive or concerning topics', -5, 30, -10, 2),
  ('educational', 'Educational', 'For teaching and explanation', -10, 20, -5, 3),
  ('analytical', 'Analytical', 'For data-heavy discussions', 10, -15, 15, 4),
  ('collaborative', 'Collaborative', 'For team-based work', -10, 20, -10, 5),
  ('advisory', 'Advisory', 'For recommendations and guidance', 5, 10, 10, 6),
  ('compliance_focused', 'Compliance-Focused', 'For regulatory and legal matters', 20, -10, 15, 7),
  ('patient_facing', 'Patient-Facing', 'For patient communications', -20, 40, -15, 8)
ON CONFLICT (modifier_code) DO UPDATE SET
  modifier_name = EXCLUDED.modifier_name,
  description = EXCLUDED.description,
  formality_adjustment = EXCLUDED.formality_adjustment,
  empathy_adjustment = EXCLUDED.empathy_adjustment,
  directness_adjustment = EXCLUDED.directness_adjustment,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================================================
-- SECTION 4: AGENT LEVEL DEFAULTS (Lookup Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_level_defaults (
  level_number INTEGER PRIMARY KEY CHECK (level_number BETWEEN 1 AND 5),
  level_name TEXT NOT NULL,
  level_code TEXT NOT NULL,  -- 'L1', 'L2', etc.

  -- Model defaults
  default_model TEXT NOT NULL,
  default_temperature NUMERIC(3,2) NOT NULL CHECK (default_temperature BETWEEN 0 AND 2),
  default_max_tokens INTEGER NOT NULL,
  default_context_window INTEGER NOT NULL,
  default_cost_per_query NUMERIC(6,4) NOT NULL,

  -- Token budget defaults
  default_token_budget_min INTEGER NOT NULL,
  default_token_budget_max INTEGER NOT NULL,
  default_token_budget_recommended INTEGER NOT NULL,

  -- Spawning defaults
  default_can_spawn_l2 BOOLEAN DEFAULT false,
  default_can_spawn_l3 BOOLEAN DEFAULT false,
  default_can_spawn_l4 BOOLEAN DEFAULT false,
  default_can_use_worker_pool BOOLEAN DEFAULT false,
  default_can_escalate_to TEXT,

  -- Description
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed level defaults
INSERT INTO agent_level_defaults (level_number, level_name, level_code, default_model, default_temperature, default_max_tokens, default_context_window, default_cost_per_query, default_token_budget_min, default_token_budget_max, default_token_budget_recommended, default_can_spawn_l2, default_can_spawn_l3, default_can_spawn_l4, default_can_use_worker_pool, default_can_escalate_to, description) VALUES
  (1, 'MASTER', 'L1', 'gpt-4', 0.20, 4000, 16000, 0.3500, 2000, 2500, 2200, true, true, true, true, 'HITL', 'Strategic coordinator agents that orchestrate complex multi-domain tasks'),
  (2, 'EXPERT', 'L2', 'gpt-4', 0.40, 3000, 8000, 0.1200, 1500, 2000, 1700, false, true, true, true, 'L1', 'Domain experts providing deep specialized knowledge'),
  (3, 'SPECIALIST', 'L3', 'gpt-4-turbo', 0.40, 2000, 8000, 0.1000, 1000, 1500, 1200, false, false, false, true, 'L2', 'Focused task specialists for specific domain work'),
  (4, 'WORKER', 'L4', 'gpt-3.5-turbo', 0.60, 2000, 4000, 0.0150, 300, 500, 400, false, false, false, false, NULL, 'Stateless workers for high-volume data tasks'),
  (5, 'TOOL', 'L5', 'none', 0.00, 200, 1000, 0.0010, 100, 200, 150, false, false, false, false, NULL, 'Deterministic tools with no LLM required')
ON CONFLICT (level_number) DO UPDATE SET
  level_name = EXCLUDED.level_name,
  level_code = EXCLUDED.level_code,
  default_model = EXCLUDED.default_model,
  default_temperature = EXCLUDED.default_temperature,
  default_max_tokens = EXCLUDED.default_max_tokens,
  default_context_window = EXCLUDED.default_context_window,
  default_cost_per_query = EXCLUDED.default_cost_per_query,
  default_token_budget_min = EXCLUDED.default_token_budget_min,
  default_token_budget_max = EXCLUDED.default_token_budget_max,
  default_token_budget_recommended = EXCLUDED.default_token_budget_recommended,
  default_can_spawn_l2 = EXCLUDED.default_can_spawn_l2,
  default_can_spawn_l3 = EXCLUDED.default_can_spawn_l3,
  default_can_spawn_l4 = EXCLUDED.default_can_spawn_l4,
  default_can_use_worker_pool = EXCLUDED.default_can_use_worker_pool,
  default_can_escalate_to = EXCLUDED.default_can_escalate_to,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================================
-- SECTION 5: SUCCESS CRITERIA TEMPLATES (Per Level)
-- ============================================================================

CREATE TABLE IF NOT EXISTS success_criteria_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_level INTEGER NOT NULL CHECK (agent_level BETWEEN 1 AND 5),
  metric_code TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_description TEXT,

  -- Default values (0-100 scale)
  default_target NUMERIC(5,2) NOT NULL CHECK (default_target BETWEEN 0 AND 100),
  default_min_acceptable NUMERIC(5,2) CHECK (default_min_acceptable BETWEEN 0 AND 100),

  -- Measurement info
  measurement_unit TEXT DEFAULT '%',
  measurement_method TEXT,

  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agent_level, metric_code)
);

-- Seed success criteria templates per level
INSERT INTO success_criteria_templates (agent_level, metric_code, metric_name, metric_description, default_target, default_min_acceptable, measurement_unit, display_order, is_required) VALUES
  -- L1 MASTER criteria
  (1, 'strategic_alignment', 'Strategic Alignment', 'Recommendations align with organizational goals', 100.00, 95.00, '%', 1, true),
  (1, 'delegation_accuracy', 'Delegation Accuracy', 'Correct agent selected for sub-tasks', 95.00, 90.00, '%', 2, true),
  (1, 'synthesis_quality', 'Synthesis Quality', 'Cross-domain insights are coherent and actionable', 90.00, 85.00, '%', 3, true),
  (1, 'verify_compliance', 'VERIFY Compliance', 'All claims include evidence and confidence', 100.00, 100.00, '%', 4, true),
  (1, 'escalation_appropriateness', 'Escalation Appropriateness', 'HITL escalations are necessary and complete', 95.00, 90.00, '%', 5, true),

  -- L2 EXPERT criteria
  (2, 'domain_accuracy', 'Domain Accuracy', 'Accuracy within specialized domain', 95.00, 90.00, '%', 1, true),
  (2, 'evidence_citation_rate', 'Evidence Citation Rate', 'Claims supported by citations', 100.00, 95.00, '%', 2, true),
  (2, 'confidence_calibration', 'Confidence Calibration', 'Confidence scores within acceptable variance', 90.00, 85.00, '%', 3, true),
  (2, 'escalation_appropriateness', 'Escalation Appropriateness', 'L1 escalations are appropriate', 90.00, 85.00, '%', 4, true),
  (2, 'in_domain_resolution', 'In-Domain Resolution', 'Queries resolved without escalation', 85.00, 80.00, '%', 5, true),

  -- L3 SPECIALIST criteria
  (3, 'task_accuracy', 'Task Accuracy', 'Accuracy on focused tasks', 90.00, 85.00, '%', 1, true),
  (3, 'citation_rate', 'Citation Rate', 'All claims properly cited', 100.00, 95.00, '%', 2, true),
  (3, 'in_scope_resolution', 'In-Scope Resolution', 'Tasks completed within scope', 85.00, 80.00, '%', 3, true),
  (3, 'escalation_quality', 'Escalation Quality', 'Escalations include complete context', 90.00, 85.00, '%', 4, true),

  -- L4 WORKER criteria
  (4, 'task_completion_rate', 'Task Completion Rate', 'Tasks completed successfully', 99.00, 95.00, '%', 1, true),
  (4, 'response_latency', 'Response Latency', 'Responses within target time', 95.00, 90.00, '%', 2, true),
  (4, 'error_rate_inverse', 'Error-Free Rate', 'Tasks without errors', 99.00, 95.00, '%', 3, true),

  -- L5 TOOL criteria
  (5, 'deterministic_accuracy', 'Deterministic Accuracy', 'Same input produces same output', 100.00, 99.00, '%', 1, true),
  (5, 'schema_validation', 'Schema Validation', 'All outputs pass schema validation', 100.00, 100.00, '%', 2, true)
ON CONFLICT (agent_level, metric_code) DO UPDATE SET
  metric_name = EXCLUDED.metric_name,
  metric_description = EXCLUDED.metric_description,
  default_target = EXCLUDED.default_target,
  default_min_acceptable = EXCLUDED.default_min_acceptable,
  measurement_unit = EXCLUDED.measurement_unit,
  display_order = EXCLUDED.display_order,
  is_required = EXCLUDED.is_required,
  updated_at = NOW();

-- ============================================================================
-- SECTION 6: AGENT TABLE ALTERATIONS
-- ============================================================================
-- Add all new columns to the agents table

-- 6.0: Model Configuration (if not exists)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS context_window INTEGER DEFAULT 8000;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS cost_per_query NUMERIC(8,4) DEFAULT 0.12;

-- 6.1: Token Budget (normalized columns, not JSONB)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_budget_min INTEGER DEFAULT 1000;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_budget_max INTEGER DEFAULT 2000;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS token_budget_recommended INTEGER DEFAULT 1500;

-- 6.2: Safety Flags (normalized columns, not JSONB)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hipaa_compliant BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS audit_trail_enabled BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS data_classification TEXT DEFAULT 'internal'
  CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted'));

-- 6.3: Model Evidence
ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_justification TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_citation TEXT;

-- 6.4: 6-Section Prompt Builder Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_section_you_are TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_section_you_do TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_section_you_never TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_section_success_criteria TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_section_when_unsure TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_section_evidence TEXT;

-- 6.5: Agent Hierarchy & Spawning
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reports_to_agent_id UUID REFERENCES agents(id);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS can_escalate_to TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS can_spawn_l2 BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS can_spawn_l3 BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS can_spawn_l4 BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS can_use_worker_pool BOOLEAN DEFAULT false;

-- 6.6: Persona & Communication Style (Foreign Keys)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS persona_archetype_id UUID REFERENCES persona_archetypes(id);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS communication_style_id UUID REFERENCES communication_styles(id);

-- 6.7: Personality Sliders (0-100 scale)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_formality INTEGER DEFAULT 70
  CHECK (personality_formality IS NULL OR personality_formality BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_empathy INTEGER DEFAULT 50
  CHECK (personality_empathy IS NULL OR personality_empathy BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_directness INTEGER DEFAULT 70
  CHECK (personality_directness IS NULL OR personality_directness BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_detail_orientation INTEGER DEFAULT 60
  CHECK (personality_detail_orientation IS NULL OR personality_detail_orientation BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_proactivity INTEGER DEFAULT 50
  CHECK (personality_proactivity IS NULL OR personality_proactivity BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_risk_tolerance INTEGER DEFAULT 30
  CHECK (personality_risk_tolerance IS NULL OR personality_risk_tolerance BETWEEN 0 AND 100);

-- 6.8: Communication Sliders (0-100 scale)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS comm_verbosity INTEGER DEFAULT 50
  CHECK (comm_verbosity IS NULL OR comm_verbosity BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS comm_technical_level INTEGER DEFAULT 50
  CHECK (comm_technical_level IS NULL OR comm_technical_level BETWEEN 0 AND 100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS comm_warmth INTEGER DEFAULT 50
  CHECK (comm_warmth IS NULL OR comm_warmth BETWEEN 0 AND 100);

-- 6.9: Response Preferences
ALTER TABLE agents ADD COLUMN IF NOT EXISTS preferred_response_format TEXT DEFAULT 'balanced'
  CHECK (preferred_response_format IN ('bullet_points', 'narrative', 'tables', 'balanced'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS include_citations BOOLEAN DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS include_confidence_scores BOOLEAN DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS include_limitations BOOLEAN DEFAULT true;

-- 6.10: Experience & Expertise
ALTER TABLE agents ADD COLUMN IF NOT EXISTS expertise_years INTEGER DEFAULT 10;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS expertise_level TEXT DEFAULT 'senior'
  CHECK (expertise_level IN ('entry', 'mid', 'senior', 'expert', 'thought_leader'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS geographic_scope TEXT DEFAULT 'global'
  CHECK (geographic_scope IN ('local', 'regional', 'national', 'global'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS industry_specialization TEXT DEFAULT 'pharmaceuticals';

-- 6.11: Version (if not exists)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';

-- ============================================================================
-- SECTION 7: AGENT SUCCESS CRITERIA (Per-Agent Instance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_success_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Metric identity
  metric_code TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_description TEXT,

  -- Slider-adjustable values (0-100 scale)
  target_value NUMERIC(5,2) NOT NULL DEFAULT 90.00 CHECK (target_value BETWEEN 0 AND 100),
  min_acceptable NUMERIC(5,2) DEFAULT 75.00 CHECK (min_acceptable BETWEEN 0 AND 100),

  -- Measurement info
  measurement_unit TEXT DEFAULT '%',
  measurement_method TEXT,

  -- UI ordering
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agent_id, metric_code)
);

-- Index for agent success criteria
CREATE INDEX IF NOT EXISTS idx_agent_success_criteria_agent ON agent_success_criteria(agent_id);

-- ============================================================================
-- SECTION 8: AGENT RELATIONSHIP TABLES
-- ============================================================================

-- 8.1: Peer Agents (many-to-many)
CREATE TABLE IF NOT EXISTS agent_peer_relationships (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  peer_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'peer' CHECK (relationship_type IN ('peer', 'collaborator', 'advisor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (agent_id, peer_agent_id),
  CHECK (agent_id != peer_agent_id)
);

-- 8.2: Managed Agents (manager -> managed)
CREATE TABLE IF NOT EXISTS agent_management_relationships (
  manager_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  managed_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  delegation_type TEXT DEFAULT 'on_demand' CHECK (delegation_type IN ('direct', 'on_demand', 'supervised')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (manager_agent_id, managed_agent_id),
  CHECK (manager_agent_id != managed_agent_id)
);

-- 8.3: Agent Tone Modifiers (many-to-many)
CREATE TABLE IF NOT EXISTS agent_tone_modifiers (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tone_modifier_id UUID NOT NULL REFERENCES tone_modifiers(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  context_trigger TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (agent_id, tone_modifier_id)
);

-- 8.4: Agent Escalation Triggers (one-to-many)
CREATE TABLE IF NOT EXISTS agent_escalation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  trigger_condition TEXT NOT NULL,
  trigger_type TEXT DEFAULT 'automatic' CHECK (trigger_type IN ('automatic', 'manual', 'conditional')),
  priority INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, trigger_condition)
);

-- 8.5: Agent Regulatory Jurisdictions (one-to-many, normalized from array)
CREATE TABLE IF NOT EXISTS agent_regulatory_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  jurisdiction_code TEXT NOT NULL,
  jurisdiction_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, jurisdiction_code)
);

-- Seed common jurisdictions
CREATE TABLE IF NOT EXISTS regulatory_jurisdictions (
  jurisdiction_code TEXT PRIMARY KEY,
  jurisdiction_name TEXT NOT NULL,
  region TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO regulatory_jurisdictions (jurisdiction_code, jurisdiction_name, region, display_order) VALUES
  ('FDA', 'US Food and Drug Administration', 'North America', 1),
  ('EMA', 'European Medicines Agency', 'Europe', 2),
  ('PMDA', 'Pharmaceuticals and Medical Devices Agency (Japan)', 'Asia Pacific', 3),
  ('NMPA', 'National Medical Products Administration (China)', 'Asia Pacific', 4),
  ('HC', 'Health Canada', 'North America', 5),
  ('TGA', 'Therapeutic Goods Administration (Australia)', 'Asia Pacific', 6),
  ('MHRA', 'Medicines and Healthcare products Regulatory Agency (UK)', 'Europe', 7),
  ('ANVISA', 'Brazilian Health Regulatory Agency', 'Latin America', 8),
  ('WHO', 'World Health Organization', 'Global', 9),
  ('ICH', 'International Council for Harmonisation', 'Global', 10)
ON CONFLICT (jurisdiction_code) DO UPDATE SET
  jurisdiction_name = EXCLUDED.jurisdiction_name,
  region = EXCLUDED.region,
  display_order = EXCLUDED.display_order;

-- ============================================================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agents_persona_archetype ON agents(persona_archetype_id);
CREATE INDEX IF NOT EXISTS idx_agents_communication_style ON agents(communication_style_id);
CREATE INDEX IF NOT EXISTS idx_agents_reports_to ON agents(reports_to_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_level_status ON agents(agent_level_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_peer_relationships_peer ON agent_peer_relationships(peer_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_management_managed ON agent_management_relationships(managed_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_escalation_triggers_agent ON agent_escalation_triggers(agent_id);

-- ============================================================================
-- SECTION 10: HELPER VIEWS
-- ============================================================================

-- View: Agent with resolved persona and communication style
-- NOTE: Only selecting columns that we ADD in this migration + basic identity columns
CREATE OR REPLACE VIEW v_agent_personality AS
SELECT
  a.id,
  a.name,
  al.level_number AS agent_level,

  -- Persona info (from lookup table)
  pa.archetype_code,
  pa.archetype_name,
  pa.default_tone AS persona_tone,

  -- Communication style info (from lookup table)
  cs.style_code,
  cs.style_name,
  cs.structure_preference,

  -- Personality sliders (new columns added by this migration)
  a.personality_formality,
  a.personality_empathy,
  a.personality_directness,
  a.personality_detail_orientation,
  a.personality_proactivity,
  a.personality_risk_tolerance,

  -- Communication sliders (new columns added by this migration)
  a.comm_verbosity,
  a.comm_technical_level,
  a.comm_warmth,

  -- Preferences (new columns added by this migration)
  a.preferred_response_format,
  a.include_citations,
  a.include_confidence_scores,
  a.include_limitations

FROM agents a
LEFT JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN persona_archetypes pa ON a.persona_archetype_id = pa.id
LEFT JOIN communication_styles cs ON a.communication_style_id = cs.id;

-- View: Agent with level defaults
-- Provides easy access to default values based on agent's level
CREATE OR REPLACE VIEW v_agent_with_defaults AS
SELECT
  a.id,
  a.name,
  a.agent_level_id,
  al.level_number,
  ald.level_name,
  ald.level_code,
  ald.default_model,
  ald.default_temperature,
  ald.default_max_tokens,
  ald.default_context_window,
  ald.default_cost_per_query,
  ald.default_token_budget_min,
  ald.default_token_budget_max,
  ald.default_token_budget_recommended,
  -- Current agent values (base_model is the DB column name)
  a.base_model,
  a.temperature,
  a.max_tokens,
  a.context_window,
  a.cost_per_query,
  a.token_budget_min,
  a.token_budget_max,
  a.token_budget_recommended
FROM agents a
LEFT JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_level_defaults ald ON al.level_number = ald.level_number;

-- ============================================================================
-- SECTION 11: TRIGGER FOR AUTO-POPULATING SUCCESS CRITERIA
-- ============================================================================

-- Function to auto-populate success criteria when agent is created
CREATE OR REPLACE FUNCTION fn_populate_agent_success_criteria()
RETURNS TRIGGER AS $$
DECLARE
  v_level_number INTEGER;
BEGIN
  -- Get level_number from agent_levels table via agent_level_id
  SELECT al.level_number INTO v_level_number
  FROM agent_levels al
  WHERE al.id = NEW.agent_level_id;

  -- Default to level 3 (SPECIALIST) if not found
  v_level_number := COALESCE(v_level_number, 3);

  -- Insert default success criteria based on agent level
  INSERT INTO agent_success_criteria (agent_id, metric_code, metric_name, metric_description, target_value, min_acceptable, measurement_unit, display_order)
  SELECT
    NEW.id,
    sct.metric_code,
    sct.metric_name,
    sct.metric_description,
    sct.default_target,
    sct.default_min_acceptable,
    sct.measurement_unit,
    sct.display_order
  FROM success_criteria_templates sct
  WHERE sct.agent_level = v_level_number
  ON CONFLICT (agent_id, metric_code) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to make idempotent)
DROP TRIGGER IF EXISTS trg_populate_agent_success_criteria ON agents;
CREATE TRIGGER trg_populate_agent_success_criteria
  AFTER INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION fn_populate_agent_success_criteria();

-- ============================================================================
-- SECTION 12: FUNCTION TO APPLY LEVEL DEFAULTS
-- ============================================================================

-- Function to apply level defaults to an agent
CREATE OR REPLACE FUNCTION fn_apply_agent_level_defaults(p_agent_id UUID)
RETURNS VOID AS $$
DECLARE
  v_level_number INTEGER;
BEGIN
  -- Get agent's level_number by joining through agent_level_id
  SELECT al.level_number INTO v_level_number
  FROM agents a
  JOIN agent_levels al ON a.agent_level_id = al.id
  WHERE a.id = p_agent_id;

  -- Default to level 3 if not found
  v_level_number := COALESCE(v_level_number, 3);

  -- Apply defaults from level_defaults table
  -- Note: agents table uses 'base_model' not 'model'
  UPDATE agents a
  SET
    base_model = COALESCE(a.base_model, ald.default_model),
    temperature = COALESCE(a.temperature, ald.default_temperature),
    max_tokens = COALESCE(a.max_tokens, ald.default_max_tokens),
    context_window = COALESCE(a.context_window, ald.default_context_window),
    cost_per_query = COALESCE(a.cost_per_query, ald.default_cost_per_query),
    token_budget_min = COALESCE(a.token_budget_min, ald.default_token_budget_min),
    token_budget_max = COALESCE(a.token_budget_max, ald.default_token_budget_max),
    token_budget_recommended = COALESCE(a.token_budget_recommended, ald.default_token_budget_recommended),
    can_spawn_l2 = COALESCE(a.can_spawn_l2, ald.default_can_spawn_l2),
    can_spawn_l3 = COALESCE(a.can_spawn_l3, ald.default_can_spawn_l3),
    can_spawn_l4 = COALESCE(a.can_spawn_l4, ald.default_can_spawn_l4),
    can_use_worker_pool = COALESCE(a.can_use_worker_pool, ald.default_can_use_worker_pool),
    can_escalate_to = COALESCE(a.can_escalate_to, ald.default_can_escalate_to)
  FROM agent_level_defaults ald
  WHERE a.id = p_agent_id
    AND ald.level_number = v_level_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE persona_archetypes IS 'Lookup table for the 10 core agent persona archetypes';
COMMENT ON TABLE communication_styles IS 'Lookup table for agent communication style presets';
COMMENT ON TABLE tone_modifiers IS 'Lookup table for context-specific tone adjustments';
COMMENT ON TABLE agent_level_defaults IS 'Default configuration values per agent level (L1-L5)';
COMMENT ON TABLE success_criteria_templates IS 'Default success criteria metrics per agent level';
COMMENT ON TABLE agent_success_criteria IS 'Per-agent success criteria with adjustable targets';
COMMENT ON TABLE agent_peer_relationships IS 'Many-to-many peer agent relationships';
COMMENT ON TABLE agent_management_relationships IS 'Manager-to-managed agent relationships';
COMMENT ON TABLE agent_tone_modifiers IS 'Agent-specific tone modifier assignments';
COMMENT ON TABLE agent_escalation_triggers IS 'Conditions that trigger agent escalation';
COMMENT ON TABLE agent_regulatory_jurisdictions IS 'Regulatory jurisdictions an agent is knowledgeable about';
COMMENT ON TABLE regulatory_jurisdictions IS 'Lookup table for regulatory bodies worldwide';
