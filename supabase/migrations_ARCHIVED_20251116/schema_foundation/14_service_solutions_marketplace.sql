-- =============================================================================
-- PHASE 14: Service - Solutions Marketplace (Junction Tables)
-- =============================================================================
-- PURPOSE: Connect solutions to agents, workflows, prompts, templates, knowledge
-- TABLES: 6 tables (solution_agents, solution_workflows, solution_prompts, solution_templates, solution_knowledge, subscription_tiers)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- JUNCTION TABLE 1: solution_agents (agents included in solutions)
-- =============================================================================
CREATE TABLE solution_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Role in Solution
  agent_role TEXT, -- 'primary', 'supporting', 'optional'
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Configuration Override
  custom_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, agent_id)
);

-- Indexes
CREATE INDEX idx_solution_agents_solution ON solution_agents(solution_id);
CREATE INDEX idx_solution_agents_agent ON solution_agents(agent_id);
CREATE INDEX idx_solution_agents_featured ON solution_agents(is_featured) WHERE is_featured = true;

COMMENT ON TABLE solution_agents IS 'Agents included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 2: solution_workflows (workflows in solutions)
-- =============================================================================
CREATE TABLE solution_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Configuration
  is_default BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, workflow_id)
);

-- Indexes
CREATE INDEX idx_solution_workflows_solution ON solution_workflows(solution_id);
CREATE INDEX idx_solution_workflows_workflow ON solution_workflows(workflow_id);
CREATE INDEX idx_solution_workflows_default ON solution_workflows(is_default) WHERE is_default = true;

COMMENT ON TABLE solution_workflows IS 'Workflows included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 3: solution_prompts (prompts in solutions)
-- =============================================================================
CREATE TABLE solution_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Organization
  category TEXT,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, prompt_id)
);

-- Indexes
CREATE INDEX idx_solution_prompts_solution ON solution_prompts(solution_id);
CREATE INDEX idx_solution_prompts_prompt ON solution_prompts(prompt_id);
CREATE INDEX idx_solution_prompts_category ON solution_prompts(category);

COMMENT ON TABLE solution_prompts IS 'Prompts included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 4: solution_templates (templates in solutions)
-- =============================================================================
CREATE TABLE solution_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,

  -- Organization
  category TEXT,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, template_id)
);

-- Indexes
CREATE INDEX idx_solution_templates_solution ON solution_templates(solution_id);
CREATE INDEX idx_solution_templates_template ON solution_templates(template_id);

COMMENT ON TABLE solution_templates IS 'Templates included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 5: solution_knowledge (knowledge sources in solutions)
-- =============================================================================
CREATE TABLE solution_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_required BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, source_id)
);

-- Indexes
CREATE INDEX idx_solution_knowledge_solution ON solution_knowledge(solution_id);
CREATE INDEX idx_solution_knowledge_source ON solution_knowledge(source_id);
CREATE INDEX idx_solution_knowledge_score ON solution_knowledge(relevance_score DESC);

COMMENT ON TABLE solution_knowledge IS 'Knowledge sources included in solution packages';

-- =============================================================================
-- TABLE 1: subscription_tiers (pricing and feature tiers)
-- =============================================================================
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Tier Level
  tier_level INTEGER NOT NULL, -- 0=free, 1=starter, 2=professional, 3=enterprise, 4=white_label

  -- Pricing
  price_usd_monthly NUMERIC(10,2),
  price_usd_annually NUMERIC(10,2),
  billing_period TEXT DEFAULT 'monthly', -- 'monthly', 'annually', 'custom'

  -- Limits
  max_users INTEGER,
  max_agents INTEGER,
  max_storage_gb INTEGER,
  max_api_calls_per_month INTEGER,
  max_workflows INTEGER,
  max_panels INTEGER,

  -- Features
  features JSONB DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "custom_agents": true,
  --   "panel_discussions": true,
  --   "workflow_automation": true,
  --   "white_label": false,
  --   "sso": false,
  --   "api_access": true,
  --   "priority_support": false
  -- }

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_subscription_tiers_slug ON subscription_tiers(slug);
CREATE INDEX idx_subscription_tiers_level ON subscription_tiers(tier_level);
CREATE INDEX idx_subscription_tiers_active ON subscription_tiers(is_active) WHERE is_active = true;

COMMENT ON TABLE subscription_tiers IS 'Subscription tier definitions with pricing and limits';

-- =============================================================================
-- SEED DATA: Subscription Tiers
-- =============================================================================

INSERT INTO subscription_tiers (id, name, slug, description, tier_level, price_usd_monthly, price_usd_annually, max_users, max_agents, max_storage_gb, max_api_calls_per_month, max_workflows, max_panels, features) VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'Free',
    'free',
    'Get started with basic features',
    0,
    0.00,
    0.00,
    5,
    10,
    1,
    1000,
    5,
    0,
    jsonb_build_object(
      'custom_agents', false,
      'panel_discussions', false,
      'workflow_automation', true,
      'white_label', false,
      'sso', false,
      'api_access', false,
      'priority_support', false
    )
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Starter',
    'starter',
    'For small teams getting started',
    1,
    49.00,
    490.00,
    10,
    25,
    10,
    10000,
    20,
    5,
    jsonb_build_object(
      'custom_agents', true,
      'panel_discussions', true,
      'workflow_automation', true,
      'white_label', false,
      'sso', false,
      'api_access', true,
      'priority_support', false
    )
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'Professional',
    'professional',
    'For growing teams',
    2,
    199.00,
    1990.00,
    50,
    100,
    100,
    50000,
    100,
    25,
    jsonb_build_object(
      'custom_agents', true,
      'panel_discussions', true,
      'workflow_automation', true,
      'white_label', false,
      'sso', true,
      'api_access', true,
      'priority_support', true
    )
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    'Enterprise',
    'enterprise',
    'For large organizations',
    3,
    NULL, -- Custom pricing
    NULL,
    999999,
    999999,
    999999,
    999999999,
    999999,
    999999,
    jsonb_build_object(
      'custom_agents', true,
      'panel_discussions', true,
      'workflow_automation', true,
      'white_label', true,
      'sso', true,
      'api_access', true,
      'priority_support', true,
      'dedicated_support', true,
      'custom_integrations', true,
      'sla', true
    )
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    tier_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('solution_agents', 'solution_workflows', 'solution_prompts', 'solution_templates', 'solution_knowledge', 'subscription_tiers');

    SELECT COUNT(*) INTO tier_count FROM subscription_tiers;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 14 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Subscription tiers seeded: %', tier_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Solutions Marketplace Features:';
    RAISE NOTICE '  - Solution-agent mapping';
    RAISE NOTICE '  - Solution-workflow mapping';
    RAISE NOTICE '  - Solution-prompt mapping';
    RAISE NOTICE '  - Solution-template mapping';
    RAISE NOTICE '  - Solution-knowledge mapping';
    RAISE NOTICE '  - Subscription tiers (Free, Starter, Professional, Enterprise)';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 83 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 15 (Agent Relationships)';
    RAISE NOTICE '';
END $$;
