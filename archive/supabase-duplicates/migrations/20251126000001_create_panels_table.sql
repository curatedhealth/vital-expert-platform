-- ============================================================================
-- Create Panels Table for Ask Panel Feature
-- ============================================================================
-- This migration creates the panels table to store panel templates
-- so we can remove hardcoded fallbacks from .env.local

-- Create panels table
CREATE TABLE IF NOT EXISTS public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),
  suggested_agents TEXT[] DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_panels_slug ON public.panels(slug);
CREATE INDEX IF NOT EXISTS idx_panels_category ON public.panels(category);
CREATE INDEX IF NOT EXISTS idx_panels_mode ON public.panels(mode);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_panels_updated_at
  BEFORE UPDATE ON public.panels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all authenticated users to read panels
CREATE POLICY "Allow authenticated users to read panels"
  ON public.panels
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow service role to manage panels
CREATE POLICY "Allow service role to manage panels"
  ON public.panels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert the 6 panel templates from constants
INSERT INTO public.panels (slug, name, description, category, mode, framework, suggested_agents, default_settings, metadata)
VALUES
  (
    'structured_panel',
    'Structured Panel',
    'Structured multi-expert panel with moderator, opening statements, multiple discussion rounds, consensus and documentation.',
    'panel',
    'sequential',
    'langgraph',
    ARRAY[
      'fda-regulatory-strategist',
      'clinical-trial-designer',
      'hipaa-compliance-officer',
      'biostatistician-digital-health',
      'medical-science-liaison',
      'health-economics-modeler',
      'real-world-evidence-analyst',
      'product-launch-strategist',
      'payer-strategy-advisor',
      'risk-management-officer'
    ],
    '{"userGuidance": "high", "allowDebate": true, "maxRounds": 3, "requireConsensus": true}'::jsonb,
    '{"icon": "👥", "tags": ["panel", "structured", "consensus", "multi-expert"], "popularity": 92}'::jsonb
  ),
  (
    'open_panel',
    'Open Panel',
    'Open, collaborative panel format optimized for brainstorming, innovation and exploratory discussions.',
    'panel',
    'collaborative',
    'autogen',
    ARRAY[
      'product-launch-strategist',
      'digital-marketing-strategist',
      'real-world-evidence-analyst',
      'clinical-trial-designer',
      'fda-regulatory-strategist',
      'payer-strategy-advisor',
      'health-economics-modeler',
      'medical-science-liaison',
      'personalized-medicine-specialist',
      'nlp-expert'
    ],
    '{"userGuidance": "medium", "allowDebate": true, "maxRounds": 4, "requireConsensus": false}'::jsonb,
    '{"icon": "💬", "tags": ["panel", "open-discussion", "brainstorming", "innovation"], "popularity": 88}'::jsonb
  ),
  (
    'expert_panel',
    'Expert Panel',
    'Focused expert consensus panel where domain specialists provide opinions and converge on a recommendation.',
    'panel',
    'sequential',
    'langgraph',
    ARRAY[
      'clinical-trial-designer',
      'fda-regulatory-strategist',
      'health-economics-modeler',
      'biostatistician-digital-health',
      'hipaa-compliance-officer',
      'payer-strategy-advisor',
      'product-launch-strategist',
      'real-world-evidence-analyst',
      'medical-science-liaison',
      'risk-management-officer'
    ],
    '{"userGuidance": "high", "allowDebate": true, "maxRounds": 3, "requireConsensus": true}'::jsonb,
    '{"icon": "🧠", "tags": ["panel", "expert", "consensus", "advisory-board"], "popularity": 94}'::jsonb
  ),
  (
    'socratic_panel',
    'Socratic Panel',
    'Panel focused on structured questioning, probing assumptions and refining ideas through iterative Q&A.',
    'panel',
    'sequential',
    'langgraph',
    ARRAY[
      'clinical-trial-designer',
      'real-world-evidence-analyst',
      'biostatistician-digital-health',
      'fda-regulatory-strategist',
      'health-economics-modeler',
      'nlp-expert',
      'personalized-medicine-specialist',
      'medical-science-liaison',
      'clinical-operations-coordinator',
      'data-visualization-specialist'
    ],
    '{"userGuidance": "medium", "allowDebate": true, "maxRounds": 4, "requireConsensus": false}'::jsonb,
    '{"icon": "❓", "tags": ["panel", "socratic", "questioning", "debate"], "popularity": 86}'::jsonb
  ),
  (
    'devils_advocate_panel',
    'Devil''s Advocate Panel',
    'Panel configuration where one or more experts are assigned to challenge assumptions and stress-test proposals.',
    'panel',
    'collaborative',
    'autogen',
    ARRAY[
      'risk-management-officer',
      'fda-regulatory-strategist',
      'clinical-trial-designer',
      'hipaa-compliance-officer',
      'payer-strategy-advisor',
      'health-economics-modeler',
      'biostatistician-digital-health',
      'product-launch-strategist',
      'real-world-evidence-analyst',
      'breakthrough-therapy-advisor'
    ],
    '{"userGuidance": "medium", "allowDebate": true, "maxRounds": 4, "requireConsensus": false}'::jsonb,
    '{"icon": "⚖️", "tags": ["panel", "devils-advocate", "risk", "challenge"], "popularity": 84}'::jsonb
  ),
  (
    'structured_ask_expert_panel',
    'Structured Ask Expert',
    'Single-expert structured consultation with clear phases, from initial assessment to recommendation and next steps.',
    'panel',
    'sequential',
    'langgraph',
    ARRAY[
      'clinical-trial-designer',
      'fda-regulatory-strategist',
      'medical-science-liaison',
      'health-economics-modeler',
      'biostatistician-digital-health',
      'product-launch-strategist',
      'real-world-evidence-analyst',
      'hipaa-compliance-officer',
      'payer-strategy-advisor',
      'risk-management-officer'
    ],
    '{"userGuidance": "high", "allowDebate": false, "maxRounds": 3, "requireConsensus": false}'::jsonb,
    '{"icon": "📌", "tags": ["ask-expert", "structured", "consultation"], "popularity": 90}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.panels IS 'Panel templates for Ask Panel feature';
COMMENT ON COLUMN public.panels.slug IS 'Unique identifier for the panel template';
COMMENT ON COLUMN public.panels.suggested_agents IS 'Array of agent slugs/IDs suggested for this panel';
COMMENT ON COLUMN public.panels.default_settings IS 'Default panel configuration settings';
COMMENT ON COLUMN public.panels.metadata IS 'Additional metadata (icon, tags, popularity, etc.)';

