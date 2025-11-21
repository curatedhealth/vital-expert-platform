-- ============================================================================
-- VITAL Ask Panel - Templates & Configuration Schema
-- Created: 2025-11-10
-- Description: Enhanced panel templates, management types, and presets
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Panel Type Enum (already exists in database.types.ts)
DO $$ BEGIN
  CREATE TYPE panel_type AS ENUM (
    'structured',   -- Sequential, moderated discussion
    'open',         -- Parallel exploration
    'socratic',     -- Iterative questioning
    'adversarial',  -- Structured debate
    'delphi',       -- Anonymous iterative rounds
    'hybrid'        -- Combined human-AI
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Panel Management Type
DO $$ BEGIN
  CREATE TYPE panel_management_type AS ENUM (
    'ai_only',           -- Fully AI-orchestrated
    'human_moderated',   -- Human moderator with AI experts
    'hybrid_facilitated',-- Mixed human-AI facilitation
    'human_expert'       -- Human experts with AI support
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Facilitation Pattern
DO $$ BEGIN
  CREATE TYPE facilitation_pattern AS ENUM (
    'sequential',        -- One at a time
    'parallel',          -- All at once
    'round_robin',       -- Rotating order
    'consensus_driven',  -- Continue until agreement
    'time_boxed'         -- Fixed duration
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PANEL TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS panel_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Template Identity
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,

  -- Panel Configuration
  panel_type panel_type NOT NULL,
  management_type panel_management_type NOT NULL DEFAULT 'ai_only',
  facilitation_pattern facilitation_pattern NOT NULL DEFAULT 'sequential',

  -- Expert Configuration
  suggested_agents TEXT[] NOT NULL DEFAULT '{}',
  min_experts INT NOT NULL DEFAULT 3,
  max_experts INT NOT NULL DEFAULT 8,
  optimal_experts INT NOT NULL DEFAULT 5,

  -- Timing Configuration
  duration_min INT, -- minutes
  duration_typical INT, -- minutes
  duration_max INT, -- minutes
  max_rounds INT DEFAULT 3,

  -- Behavior Configuration
  requires_moderator BOOLEAN DEFAULT false,
  parallel_execution BOOLEAN DEFAULT false,
  enable_consensus BOOLEAN DEFAULT true,
  consensus_threshold DECIMAL DEFAULT 0.75,

  -- Use Cases & Examples
  use_cases TEXT[] DEFAULT '{}',
  example_scenarios JSONB DEFAULT '[]',

  -- Metadata
  is_public BOOLEAN DEFAULT true,
  is_preset BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  industry_id UUID REFERENCES industries(id),

  -- Usage Stats
  usage_count INT DEFAULT 0,
  avg_rating DECIMAL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_duration CHECK (
    (duration_min IS NULL AND duration_typical IS NULL AND duration_max IS NULL) OR
    (duration_min <= duration_typical AND duration_typical <= duration_max)
  ),
  CONSTRAINT valid_experts CHECK (min_experts <= optimal_experts AND optimal_experts <= max_experts)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_panel_templates_tenant_id ON panel_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_panel_templates_panel_type ON panel_templates(panel_type);
CREATE INDEX IF NOT EXISTS idx_panel_templates_management_type ON panel_templates(management_type);
CREATE INDEX IF NOT EXISTS idx_panel_templates_category ON panel_templates(category);
CREATE INDEX IF NOT EXISTS idx_panel_templates_is_public ON panel_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_panel_templates_is_preset ON panel_templates(is_preset);
CREATE INDEX IF NOT EXISTS idx_panel_templates_industry_id ON panel_templates(industry_id);
CREATE INDEX IF NOT EXISTS idx_panel_templates_tags ON panel_templates USING GIN(tags);

-- ============================================================================
-- PANEL MANAGEMENT PATTERNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS panel_management_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pattern Identity
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  management_type panel_management_type NOT NULL,

  -- Configuration
  requires_human_moderator BOOLEAN DEFAULT false,
  requires_human_experts BOOLEAN DEFAULT false,
  ai_orchestration_level TEXT, -- 'none', 'low', 'medium', 'high', 'full'

  -- Capabilities
  capabilities JSONB DEFAULT '{}',
  limitations JSONB DEFAULT '{}',
  best_use_cases TEXT[] DEFAULT '{}',

  -- Examples
  example_implementations JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER PANEL CUSTOMIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_panel_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES panel_templates(id) ON DELETE SET NULL,

  -- Customization
  custom_name TEXT NOT NULL,
  custom_description TEXT,
  custom_agents TEXT[] DEFAULT '{}',
  custom_configuration JSONB DEFAULT '{}',

  -- Metadata
  is_favorite BOOLEAN DEFAULT false,
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_panel_customizations_user_id ON user_panel_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panel_customizations_tenant_id ON user_panel_customizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_panel_customizations_template_id ON user_panel_customizations(template_id);
CREATE INDEX IF NOT EXISTS idx_user_panel_customizations_is_favorite ON user_panel_customizations(is_favorite);

-- ============================================================================
-- SEED DATA - Panel Types Information
-- ============================================================================

-- Insert panel management patterns
INSERT INTO panel_management_patterns (name, description, management_type, requires_human_moderator, requires_human_experts, ai_orchestration_level, capabilities, best_use_cases)
VALUES
  (
    'Fully AI-Orchestrated',
    'Autonomous AI panel with AI moderator and AI experts',
    'ai_only',
    false,
    false,
    'full',
    '{"autonomous": true, "scalable": true, "24_7_available": true, "consistent": true}'::jsonb,
    ARRAY['High-volume queries', 'Standard scenarios', 'Quick consultations']
  ),
  (
    'Human-Moderated AI Panel',
    'AI experts with human moderator guiding discussion',
    'human_moderated',
    true,
    false,
    'high',
    '{"human_judgment": true, "ai_analysis": true, "guided_discussion": true}'::jsonb,
    ARRAY['Complex decisions', 'Strategic planning', 'Risk assessment']
  ),
  (
    'Hybrid Facilitated',
    'Mixed human and AI experts with AI facilitation',
    'hybrid_facilitated',
    false,
    true,
    'medium',
    '{"balanced_perspectives": true, "human_creativity": true, "ai_data_processing": true}'::jsonb,
    ARRAY['Innovation sessions', 'Research planning', 'Multi-stakeholder decisions']
  ),
  (
    'Human Expert Panel',
    'Human experts with AI analytical support',
    'human_expert',
    true,
    true,
    'low',
    '{"expert_judgment": true, "ai_insights": true, "collaborative": true}'::jsonb,
    ARRAY['Board-level decisions', 'Clinical trials', 'Regulatory submissions']
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA - Preset Panel Templates
-- ============================================================================

-- Structured Panel Templates
INSERT INTO panel_templates (
  name, description, category, panel_type, management_type, facilitation_pattern,
  suggested_agents, min_experts, max_experts, optimal_experts,
  duration_min, duration_typical, duration_max, max_rounds,
  requires_moderator, parallel_execution, enable_consensus,
  use_cases, is_public, is_preset, tags
)
VALUES
  (
    'FDA Regulatory Strategy Panel',
    'Sequential moderated discussion for FDA submission pathways and regulatory decisions',
    'Regulatory Affairs',
    'structured',
    'ai_only',
    'sequential',
    ARRAY['FDA Regulatory Strategist', 'Clinical Development Expert', 'Regulatory CMC Expert', 'Quality/Compliance Expert', 'Reimbursement Specialist'],
    3, 7, 5,
    10, 15, 30, 3,
    true, false, true,
    ARRAY['510(k) vs PMA pathway selection', 'Breakthrough Therapy Designation', 'FDA meeting preparation', 'Compliance verification'],
    true, true,
    ARRAY['regulatory', 'fda', 'structured', 'medical-affairs']
  ),
  (
    'Clinical Trial Design Panel',
    'Structured review of clinical trial protocols and study designs',
    'Clinical Development',
    'structured',
    'human_moderated',
    'sequential',
    ARRAY['Clinical Trial Designer', 'Biostatistician', 'Medical Monitor', 'Oncology Specialist', 'Patient Recruitment Strategist'],
    3, 7, 5,
    15, 20, 30, 3,
    true, false, true,
    ARRAY['Phase 3 protocol review', 'Endpoint selection', 'Sample size determination', 'Study optimization'],
    true, true,
    ARRAY['clinical-trials', 'protocol', 'structured', 'research']
  );

-- Open Panel Templates
INSERT INTO panel_templates (
  name, description, category, panel_type, management_type, facilitation_pattern,
  suggested_agents, min_experts, max_experts, optimal_experts,
  duration_min, duration_typical, duration_max, max_rounds,
  requires_moderator, parallel_execution, enable_consensus,
  use_cases, is_public, is_preset, tags
)
VALUES
  (
    'Innovation Brainstorming Panel',
    'Free-flowing parallel exploration for creative problem-solving and innovation',
    'Innovation & Strategy',
    'open',
    'ai_only',
    'parallel',
    ARRAY['Digital Health Innovator', 'Patient Experience Designer', 'Behavioral Scientist', 'Mobile Health Expert', 'Data Analytics Lead', 'Medical Education Designer'],
    5, 8, 6,
    5, 10, 20, NULL,
    false, true, false,
    ARRAY['Patient support program innovation', 'Digital biomarker development', 'Medical education platform design'],
    true, true,
    ARRAY['innovation', 'brainstorming', 'open', 'creative']
  ),
  (
    'Real-World Evidence Study Design',
    'Exploratory discussion for novel RWE generation approaches',
    'Evidence Generation',
    'open',
    'hybrid_facilitated',
    'parallel',
    ARRAY['Real World Evidence Expert', 'Health Economist', 'EMR Integration Specialist', 'Biostatistician', 'Payer Strategy Expert', 'Clinical Investigator'],
    5, 8, 6,
    8, 12, 20, NULL,
    false, true, false,
    ARRAY['Registry development', 'Outcomes research design', 'Comparative effectiveness studies'],
    true, true,
    ARRAY['rwe', 'evidence', 'open', 'research']
  );

-- Socratic Panel Templates
INSERT INTO panel_templates (
  name, description, category, panel_type, management_type, facilitation_pattern,
  suggested_agents, min_experts, max_experts, optimal_experts,
  duration_min, duration_typical, duration_max, max_rounds,
  requires_moderator, parallel_execution, enable_consensus,
  use_cases, is_public, is_preset, tags
)
VALUES
  (
    'Clinical Trial Failure Analysis',
    'Deep analysis through systematic questioning to understand trial failures',
    'Clinical Development',
    'socratic',
    'human_moderated',
    'round_robin',
    ARRAY['Clinical Development Leader', 'Biostatistician', 'Medical Monitor', 'Regulatory Scientist'],
    3, 4, 4,
    15, 20, 30, 5,
    true, false, true,
    ARRAY['Phase 3 endpoint failure', 'Enrollment challenges', 'Protocol deviation analysis'],
    true, true,
    ARRAY['analysis', 'socratic', 'clinical-trials', 'investigation']
  ),
  (
    'Market Access Barrier Investigation',
    'Iterative questioning to uncover deep payer resistance factors',
    'Market Access',
    'socratic',
    'ai_only',
    'round_robin',
    ARRAY['Market Access Director', 'Health Economist', 'Payer Strategy Expert', 'Value Evidence Strategist'],
    3, 4, 4,
    15, 18, 25, 5,
    true, false, true,
    ARRAY['Limited payer coverage', 'Pricing objections', 'Formulary barriers'],
    true, true,
    ARRAY['market-access', 'socratic', 'analysis', 'payer']
  );

-- Adversarial Panel Templates
INSERT INTO panel_templates (
  name, description, category, panel_type, management_type, facilitation_pattern,
  suggested_agents, min_experts, max_experts, optimal_experts,
  duration_min, duration_typical, duration_max, max_rounds,
  requires_moderator, parallel_execution, enable_consensus,
  use_cases, is_public, is_preset, tags
)
VALUES
  (
    'Go/No-Go Decision Panel',
    'Structured debate format with pro/con sides for critical investment decisions',
    'Strategic Planning',
    'adversarial',
    'human_moderated',
    'sequential',
    ARRAY['Commercial Strategy Lead', 'Chief Medical Officer', 'Regulatory Affairs Director', 'Financial Analyst', 'Market Access Director', 'Legal Counsel'],
    4, 8, 6,
    10, 15, 30, 4,
    true, false, true,
    ARRAY['Label expansion decisions', 'Pipeline prioritization', 'Investment decisions'],
    true, true,
    ARRAY['decision', 'adversarial', 'debate', 'strategic']
  ),
  (
    'Risk Assessment Panel',
    'Adversarial analysis for comprehensive risk evaluation',
    'Risk Management',
    'adversarial',
    'ai_only',
    'sequential',
    ARRAY['Risk Management Director', 'Pharmacovigilance Officer', 'Legal Counsel', 'Clinical Expert', 'Regulatory Expert', 'Operations Manager'],
    4, 8, 6,
    10, 15, 25, 4,
    true, false, true,
    ARRAY['Expanded access programs', 'Investigator-initiated trials', 'Off-label communications'],
    true, true,
    ARRAY['risk', 'adversarial', 'safety', 'compliance']
  );

-- Delphi Panel Templates
INSERT INTO panel_templates (
  name, description, category, panel_type, management_type, facilitation_pattern,
  suggested_agents, min_experts, max_experts, optimal_experts,
  duration_min, duration_typical, duration_max, max_rounds,
  requires_moderator, parallel_execution, enable_consensus, consensus_threshold,
  use_cases, is_public, is_preset, tags
)
VALUES
  (
    'Treatment Guideline Consensus',
    'Anonymous multi-round consensus building for clinical guidelines',
    'Medical Affairs',
    'delphi',
    'ai_only',
    'consensus_driven',
    ARRAY['Disease Expert 1', 'Disease Expert 2', 'Disease Expert 3', 'Clinical Researcher', 'Patient Advocate', 'Health Economist', 'Regulatory Expert', 'Payer Representative'],
    5, 12, 8,
    15, 20, 25, 3,
    false, true, true, 0.80,
    ARRAY['Rare disease management guidelines', 'Treatment algorithms', 'Best practice development'],
    true, true,
    ARRAY['consensus', 'delphi', 'guidelines', 'medical-affairs']
  ),
  (
    'Market Adoption Forecast',
    'Multi-expert forecasting with statistical convergence',
    'Commercial Strategy',
    'delphi',
    'ai_only',
    'consensus_driven',
    ARRAY['Market Access Expert 1', 'Market Access Expert 2', 'Payer Representative 1', 'Payer Representative 2', 'Clinical Leader', 'HTA Specialist', 'Pricing Strategist', 'Launch Strategist'],
    5, 12, 8,
    15, 20, 25, 3,
    false, true, true, 0.75,
    ARRAY['5-year uptake prediction', 'Peak sales forecasting', 'Market share analysis'],
    true, true,
    ARRAY['forecasting', 'delphi', 'market', 'commercial']
  );

-- Hybrid Panel Templates
INSERT INTO panel_templates (
  name, description, category, panel_type, management_type, facilitation_pattern,
  suggested_agents, min_experts, max_experts, optimal_experts,
  duration_min, duration_typical, duration_max, max_rounds,
  requires_moderator, parallel_execution, enable_consensus,
  use_cases, is_public, is_preset, tags
)
VALUES
  (
    'M&A Due Diligence Panel',
    'Combined human-AI panel for critical asset evaluation',
    'Business Development',
    'hybrid',
    'human_expert',
    'sequential',
    ARRAY['Clinical Trial Analyzer (AI)', 'Regulatory Intelligence (AI)', 'Market Landscape Scanner (AI)', 'Patent Analyzer (AI)', 'Chief Medical Officer', 'BD Director', 'Regulatory Head'],
    3, 8, 5,
    30, 45, 60, 4,
    true, false, true,
    ARRAY['Pipeline acquisition', 'Asset valuation', 'Clinical program assessment'],
    true, true,
    ARRAY['hybrid', 'ma', 'bd', 'strategic']
  ),
  (
    'Breakthrough Therapy Designation Strategy',
    'High-stakes regulatory strategy with human-AI collaboration',
    'Regulatory Affairs',
    'hybrid',
    'human_expert',
    'sequential',
    ARRAY['FDA Precedent Analyzer (AI)', 'Clinical Data Synthesizer (AI)', 'Regulatory Requirements Checker (AI)', 'Regulatory Strategy Director', 'Clinical Development Head', 'Biostatistics Director'],
    3, 6, 4,
    20, 30, 45, 4,
    true, false, true,
    ARRAY['BTD submission strategy', 'Fast Track applications', 'Priority Review requests'],
    true, true,
    ARRAY['hybrid', 'regulatory', 'fda', 'submission']
  );

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE panel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_management_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_panel_customizations ENABLE ROW LEVEL SECURITY;

-- Public templates visible to all
CREATE POLICY "Public templates are viewable by everyone"
  ON panel_templates FOR SELECT
  USING (is_public = true);

-- Users can view templates in their tenant
CREATE POLICY "Users can view their tenant templates"
  ON panel_templates FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

-- Users can create templates in their tenant
CREATE POLICY "Users can create templates in their tenant"
  ON panel_templates FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

-- Users can update their own templates
CREATE POLICY "Users can update their own templates"
  ON panel_templates FOR UPDATE
  USING (created_by = auth.uid());

-- Management patterns are viewable by all authenticated users
CREATE POLICY "Management patterns are viewable by authenticated users"
  ON panel_management_patterns FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- User customizations
CREATE POLICY "Users can view their own customizations"
  ON user_panel_customizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own customizations"
  ON user_panel_customizations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own customizations"
  ON user_panel_customizations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own customizations"
  ON user_panel_customizations FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE panel_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update customization last used
CREATE OR REPLACE FUNCTION update_customization_usage(customization_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_panel_customizations
  SET usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
  WHERE id = customization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular templates
CREATE OR REPLACE FUNCTION get_popular_templates(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  panel_type panel_type,
  usage_count INT,
  avg_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.id,
    pt.name,
    pt.description,
    pt.category,
    pt.panel_type,
    pt.usage_count,
    pt.avg_rating
  FROM panel_templates pt
  WHERE pt.is_public = true
  ORDER BY pt.usage_count DESC, pt.avg_rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_panel_templates_updated_at
  BEFORE UPDATE ON panel_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_panel_customizations_updated_at
  BEFORE UPDATE ON user_panel_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE panel_templates IS 'Preset and custom panel templates with configuration';
COMMENT ON TABLE panel_management_patterns IS 'Different human-AI management patterns for panels';
COMMENT ON TABLE user_panel_customizations IS 'User-specific panel customizations and favorites';

COMMENT ON TYPE panel_type IS 'Six types of panel orchestration: structured, open, socratic, adversarial, delphi, hybrid';
COMMENT ON TYPE panel_management_type IS 'Management patterns: ai_only, human_moderated, hybrid_facilitated, human_expert';
COMMENT ON TYPE facilitation_pattern IS 'How the discussion is facilitated: sequential, parallel, round_robin, consensus_driven, time_boxed';
