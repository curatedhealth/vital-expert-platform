-- ============================================================================
-- MIGRATION: Create personality_types and prompt_starters tables
-- Date: 2025-11-26
-- Description: Creates tables for agent personality configuration and prompt starters
-- ============================================================================

-- ============================================================================
-- 1. PERSONALITY TYPES TABLE
-- Stores different personality configurations that affect agent behavior
-- ============================================================================

CREATE TABLE IF NOT EXISTS personality_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Behavioral attributes
  style VARCHAR(50) NOT NULL,  -- analytical, strategic, creative, innovator, etc.
  temperature DECIMAL(2,1) NOT NULL DEFAULT 0.5 CHECK (temperature >= 0 AND temperature <= 1),

  -- Visual attributes
  icon VARCHAR(10),  -- Emoji or icon identifier
  color VARCHAR(20),  -- Primary color for UI

  -- Behavioral descriptors (for system prompts)
  tone_keywords TEXT[],  -- e.g., ['precise', 'methodical', 'data-driven']
  communication_style TEXT,  -- How the agent should communicate
  reasoning_approach TEXT,  -- How the agent should reason

  -- Grouping
  category VARCHAR(50) DEFAULT 'general',  -- general, medical, business, technical

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_personality_types_slug ON personality_types(slug);
CREATE INDEX IF NOT EXISTS idx_personality_types_style ON personality_types(style);
CREATE INDEX IF NOT EXISTS idx_personality_types_category ON personality_types(category);
CREATE INDEX IF NOT EXISTS idx_personality_types_active ON personality_types(is_active);

-- ============================================================================
-- 2. PROMPT STARTERS TABLE
-- Stores conversation starters for agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_starters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(200) NOT NULL,
  prompt_text TEXT NOT NULL,
  description TEXT,

  -- Categorization
  category VARCHAR(50),  -- general, greeting, task, question
  tags TEXT[],

  -- Display settings
  icon VARCHAR(10),
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT prompt_starters_agent_or_tenant CHECK (
    (agent_id IS NOT NULL) OR (tenant_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompt_starters_agent ON prompt_starters(agent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_starters_tenant ON prompt_starters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompt_starters_category ON prompt_starters(category);
CREATE INDEX IF NOT EXISTS idx_prompt_starters_active ON prompt_starters(is_active);

-- ============================================================================
-- 3. SEED DATA: PERSONALITY TYPES
-- ============================================================================

INSERT INTO personality_types (name, slug, display_name, description, style, temperature, icon, color, tone_keywords, communication_style, reasoning_approach, category, sort_order) VALUES
-- Core personality types (already in form)
('Analytical', 'analytical', 'Analytical Expert', 'Precise, data-driven, methodical reasoning with focus on accuracy and evidence', 'analytical', 0.2, '📊', '#3B82F6', ARRAY['precise', 'methodical', 'data-driven', 'factual', 'objective'], 'Formal and structured with clear logical flow. Uses data and evidence to support all claims.', 'Systematic analysis, breaking down complex problems into components, evidence-based conclusions.', 'general', 1),

('Strategic', 'strategic', 'Strategic Thinker', 'Big-picture thinking, long-term planning, and comprehensive perspective', 'strategic', 0.4, '🎯', '#8B5CF6', ARRAY['visionary', 'comprehensive', 'forward-thinking', 'holistic', 'balanced'], 'Clear and authoritative with emphasis on implications and outcomes. Balances detail with big picture.', 'Top-down analysis, considering multiple perspectives, weighing trade-offs, long-term impact assessment.', 'general', 2),

('Creative', 'creative', 'Creative Innovator', 'Innovative, outside-the-box thinking with novel solutions', 'creative', 0.7, '💡', '#F59E0B', ARRAY['innovative', 'imaginative', 'unconventional', 'exploratory', 'flexible'], 'Engaging and thought-provoking. Open to exploring unconventional ideas and approaches.', 'Lateral thinking, brainstorming, connecting disparate concepts, exploring possibilities.', 'general', 3),

('Innovator', 'innovator', 'Bold Innovator', 'Experimental, bold ideas, risk-taking with breakthrough potential', 'innovator', 0.9, '🚀', '#EF4444', ARRAY['bold', 'experimental', 'disruptive', 'visionary', 'pioneering'], 'Dynamic and energetic. Challenges assumptions and pushes boundaries. Comfortable with uncertainty.', 'Radical innovation, questioning fundamentals, embracing uncertainty, first-principles thinking.', 'general', 4),

-- Additional personality types
('Empathetic', 'empathetic', 'Empathetic Advisor', 'Patient-centered, compassionate, understanding human context', 'empathetic', 0.5, '💚', '#10B981', ARRAY['compassionate', 'understanding', 'supportive', 'patient', 'considerate'], 'Warm and supportive with emphasis on human impact. Acknowledges emotions and concerns.', 'Human-centered analysis, considering emotional and social factors, stakeholder empathy.', 'medical', 5),

('Pragmatic', 'pragmatic', 'Pragmatic Problem-Solver', 'Practical, action-oriented, focused on feasible solutions', 'pragmatic', 0.4, '🔧', '#6366F1', ARRAY['practical', 'actionable', 'realistic', 'efficient', 'results-oriented'], 'Direct and practical. Focuses on what works and can be implemented. Avoids theoretical tangents.', 'Feasibility analysis, resource optimization, practical constraints, implementation focus.', 'business', 6),

('Cautious', 'cautious', 'Cautious Evaluator', 'Risk-aware, thorough evaluation, safety-first approach', 'cautious', 0.2, '🛡️', '#64748B', ARRAY['careful', 'thorough', 'risk-aware', 'vigilant', 'prudent'], 'Measured and careful. Highlights risks and limitations. Emphasizes safety and due diligence.', 'Risk assessment, worst-case analysis, compliance verification, safety-first evaluation.', 'medical', 7),

('Collaborative', 'collaborative', 'Collaborative Facilitator', 'Team-oriented, consensus-building, integrative approach', 'collaborative', 0.5, '🤝', '#EC4899', ARRAY['cooperative', 'inclusive', 'facilitative', 'integrative', 'consensus-seeking'], 'Inclusive and facilitative. Seeks input from multiple perspectives. Builds on others'' ideas.', 'Stakeholder analysis, perspective integration, consensus building, collaborative problem-solving.', 'business', 8),

('Scientific', 'scientific', 'Scientific Researcher', 'Rigorous methodology, peer-reviewed standards, academic precision', 'scientific', 0.3, '🔬', '#14B8A6', ARRAY['rigorous', 'methodical', 'evidence-based', 'peer-reviewed', 'academic'], 'Academic and precise. Cites sources and methodology. Distinguishes between hypothesis and evidence.', 'Scientific method, hypothesis testing, peer-reviewed evidence, statistical rigor.', 'medical', 9),

('Executive', 'executive', 'Executive Advisor', 'C-suite communication, strategic impact, business outcomes', 'executive', 0.3, '📈', '#0EA5E9', ARRAY['executive', 'strategic', 'impactful', 'concise', 'business-focused'], 'Concise and impactful. Focuses on business outcomes and ROI. Time-efficient communication.', 'Business impact analysis, ROI assessment, strategic alignment, executive summary format.', 'business', 10),

('Technical', 'technical', 'Technical Specialist', 'Deep technical expertise, precise specifications, implementation detail', 'technical', 0.3, '⚙️', '#71717A', ARRAY['technical', 'precise', 'detailed', 'specification-focused', 'systematic'], 'Technical and detailed. Uses precise terminology. Provides implementation-ready specifications.', 'Technical analysis, specification development, system architecture, implementation planning.', 'technical', 11),

('Educational', 'educational', 'Educational Guide', 'Teaching-oriented, explanatory, building understanding', 'educational', 0.5, '📚', '#A855F7', ARRAY['educational', 'explanatory', 'patient', 'step-by-step', 'supportive'], 'Patient and explanatory. Builds from basics to complex. Uses analogies and examples.', 'Scaffolded learning, concept building, worked examples, knowledge verification.', 'general', 12)

ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  temperature = EXCLUDED.temperature,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  tone_keywords = EXCLUDED.tone_keywords,
  communication_style = EXCLUDED.communication_style,
  reasoning_approach = EXCLUDED.reasoning_approach,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================================================
-- 4. ADD PERSONALITY_TYPE_ID TO AGENTS TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'personality_type_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN personality_type_id UUID REFERENCES personality_types(id);
    CREATE INDEX idx_agents_personality_type ON agents(personality_type_id);
  END IF;
END $$;

-- ============================================================================
-- 5. UPDATE TRIGGERS
-- ============================================================================

-- Trigger for personality_types updated_at
CREATE OR REPLACE FUNCTION update_personality_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_personality_types_updated_at ON personality_types;
CREATE TRIGGER trigger_personality_types_updated_at
  BEFORE UPDATE ON personality_types
  FOR EACH ROW
  EXECUTE FUNCTION update_personality_types_updated_at();

-- Trigger for prompt_starters updated_at
CREATE OR REPLACE FUNCTION update_prompt_starters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prompt_starters_updated_at ON prompt_starters;
CREATE TRIGGER trigger_prompt_starters_updated_at
  BEFORE UPDATE ON prompt_starters
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_starters_updated_at();

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

ALTER TABLE personality_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_starters ENABLE ROW LEVEL SECURITY;

-- Personality types are readable by all authenticated users
CREATE POLICY "personality_types_select_all" ON personality_types
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Only service role can modify personality types
CREATE POLICY "personality_types_admin_all" ON personality_types
  FOR ALL TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Prompt starters are readable based on agent/tenant ownership
CREATE POLICY "prompt_starters_select_own" ON prompt_starters
  FOR SELECT TO authenticated
  USING (
    is_active = TRUE AND (
      agent_id IN (SELECT id FROM agents WHERE status = 'active') OR
      tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Service role can manage all prompt starters
CREATE POLICY "prompt_starters_admin_all" ON prompt_starters
  FOR ALL TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
