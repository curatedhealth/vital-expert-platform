-- ============================================================================
-- Add Design Thinking Domain and Split Strategy/Foresight
-- ============================================================================
-- Creates "Design Thinking" domain and splits any "Strategy/Foresight" 
-- into two separate domains: "Strategy" and "Strategic Foresight"
-- ============================================================================

-- 1. Create Design Thinking domain
INSERT INTO public.knowledge_domains_new (
  domain_id,
  parent_domain_id,
  function_id,
  function_name,
  domain_name,
  domain_description_llm,
  domain_scope,
  enterprise_id,
  owner_user_id,
  tier,
  tier_label,
  priority,
  maturity_level,
  regulatory_exposure,
  pii_sensitivity,
  lifecycle_stage,
  governance_owner,
  last_review_owner_role,
  embedding_model,
  rag_priority_weight,
  access_policy,
  is_active,
  -- Legacy fields
  code,
  slug,
  name,
  description,
  keywords,
  sub_domains,
  color,
  icon
) VALUES (
  'design_thinking',
  NULL,
  'innovation_product_development',
  'Innovation & Product Development',
  'Design Thinking',
  'Covers human-centered design methodologies, user experience design, ideation processes, prototyping, design sprints, and design-led innovation approaches. Use this domain for questions about how to apply design thinking principles to healthcare solutions, user research methods, and design-driven product development.',
  'global',
  NULL,
  NULL,
  2, -- Tier 2: Specialized
  'Specialized / High Value',
  25, -- Priority within tier
  'Established',
  'Low',
  'Low',
  ARRAY['Pre-Launch', 'Product Development', 'User Research'],
  'Product / Innovation Function',
  'Head of Product Innovation',
  'text-embedding-3-large',
  0.85,
  'public',
  true,
  -- Legacy fields
  'DESIGN_THINKING',
  'design_thinking',
  'Design Thinking',
  'Human-centered design methodologies and design-led innovation for healthcare solutions',
  ARRAY['design thinking', 'user experience', 'UX', 'design sprint', 'ideation', 'prototyping', 'human-centered design'],
  ARRAY[],
  '#8B5CF6', -- Purple
  'lightbulb'
) ON CONFLICT (domain_id) DO UPDATE SET
  domain_name = EXCLUDED.domain_name,
  domain_description_llm = EXCLUDED.domain_description_llm,
  tier = EXCLUDED.tier,
  priority = EXCLUDED.priority,
  updated_at = NOW();

-- 2. Check if Strategy/Foresight domain exists and split it
DO $$
DECLARE
  strategy_foresight_domain RECORD;
  max_priority_tier2 INTEGER;
  max_priority_tier3 INTEGER;
BEGIN
  -- Find any domain that might be "Strategy/Foresight" or similar
  SELECT * INTO strategy_foresight_domain
  FROM public.knowledge_domains_new
  WHERE domain_id LIKE '%strategy%' 
     OR domain_id LIKE '%foresight%'
     OR domain_name LIKE '%Strategy%Foresight%'
     OR domain_name LIKE '%Strategy/Foresight%'
  LIMIT 1;

  IF FOUND THEN
    -- Get max priority for tier 2 and tier 3
    SELECT COALESCE(MAX(priority), 0) INTO max_priority_tier2
    FROM public.knowledge_domains_new
    WHERE tier = 2;

    SELECT COALESCE(MAX(priority), 0) INTO max_priority_tier3
    FROM public.knowledge_domains_new
    WHERE tier = 3;

    -- Create Strategy domain
    INSERT INTO public.knowledge_domains_new (
      domain_id,
      parent_domain_id,
      function_id,
      function_name,
      domain_name,
      domain_description_llm,
      domain_scope,
      enterprise_id,
      owner_user_id,
      tier,
      tier_label,
      priority,
      maturity_level,
      regulatory_exposure,
      pii_sensitivity,
      lifecycle_stage,
      governance_owner,
      last_review_owner_role,
      embedding_model,
      rag_priority_weight,
      access_policy,
      is_active,
      -- Legacy fields
      code,
      slug,
      name,
      description,
      keywords,
      sub_domains,
      color,
      icon
    ) VALUES (
      'strategy',
      NULL,
      COALESCE(strategy_foresight_domain.function_id, 'corporate_strategy'),
      COALESCE(strategy_foresight_domain.function_name, 'Corporate Strategy'),
      'Strategy',
      'Covers strategic planning, business strategy, competitive strategy, strategic analysis, portfolio strategy, and strategic decision-making frameworks. Use this domain for questions about strategic planning processes, competitive positioning, portfolio management, and strategic frameworks for healthcare organizations.',
      COALESCE(strategy_foresight_domain.domain_scope, 'global'),
      strategy_foresight_domain.enterprise_id,
      strategy_foresight_domain.owner_user_id,
      2, -- Tier 2: Specialized
      'Specialized / High Value',
      max_priority_tier2 + 1,
      COALESCE(strategy_foresight_domain.maturity_level::text, 'Established')::maturity_level,
      COALESCE(strategy_foresight_domain.regulatory_exposure::text, 'Low')::exposure_level,
      COALESCE(strategy_foresight_domain.pii_sensitivity::text, 'Low')::exposure_level,
      COALESCE(strategy_foresight_domain.lifecycle_stage, ARRAY['Corporate Strategy', 'Strategic Planning']),
      COALESCE(strategy_foresight_domain.governance_owner, 'Strategy Function'),
      COALESCE(strategy_foresight_domain.last_review_owner_role, 'Chief Strategy Officer'),
      COALESCE(strategy_foresight_domain.embedding_model, 'text-embedding-3-large'),
      COALESCE(strategy_foresight_domain.rag_priority_weight, 0.85),
      COALESCE(strategy_foresight_domain.access_policy::text, 'public')::access_policy_level,
      true,
      -- Legacy fields
      'STRATEGY',
      'strategy',
      'Strategy',
      'Strategic planning, business strategy, and strategic decision-making',
      ARRAY['strategy', 'strategic planning', 'business strategy', 'competitive strategy', 'portfolio strategy'],
      ARRAY[],
      '#10B981', -- Green
      'target'
    ) ON CONFLICT (domain_id) DO UPDATE SET
      domain_name = EXCLUDED.domain_name,
      domain_description_llm = EXCLUDED.domain_description_llm,
      updated_at = NOW();

    -- Create Strategic Foresight domain
    INSERT INTO public.knowledge_domains_new (
      domain_id,
      parent_domain_id,
      function_id,
      function_name,
      domain_name,
      domain_description_llm,
      domain_scope,
      enterprise_id,
      owner_user_id,
      tier,
      tier_label,
      priority,
      maturity_level,
      regulatory_exposure,
      pii_sensitivity,
      lifecycle_stage,
      governance_owner,
      last_review_owner_role,
      embedding_model,
      rag_priority_weight,
      access_policy,
      is_active,
      -- Legacy fields
      code,
      slug,
      name,
      description,
      keywords,
      sub_domains,
      color,
      icon
    ) VALUES (
      'strategic_foresight',
      NULL,
      COALESCE(strategy_foresight_domain.function_id, 'corporate_strategy'),
      COALESCE(strategy_foresight_domain.function_name, 'Corporate Strategy'),
      'Strategic Foresight',
      'Covers scenario planning, trend analysis, future scanning, horizon scanning, strategic foresight methodologies, weak signal detection, and long-term strategic thinking. Use this domain for questions about anticipating future trends, scenario planning exercises, horizon scanning techniques, and strategic foresight methods for healthcare organizations.',
      COALESCE(strategy_foresight_domain.domain_scope, 'global'),
      strategy_foresight_domain.enterprise_id,
      strategy_foresight_domain.owner_user_id,
      3, -- Tier 3: Emerging
      'Emerging / Fast-Evolving',
      max_priority_tier3 + 1,
      COALESCE(strategy_foresight_domain.maturity_level::text, 'Emerging')::maturity_level,
      COALESCE(strategy_foresight_domain.regulatory_exposure::text, 'Low')::exposure_level,
      COALESCE(strategy_foresight_domain.pii_sensitivity::text, 'Low')::exposure_level,
      COALESCE(strategy_foresight_domain.lifecycle_stage, ARRAY['Corporate Strategy', 'Future Planning']),
      COALESCE(strategy_foresight_domain.governance_owner, 'Strategy / Foresight Function'),
      COALESCE(strategy_foresight_domain.last_review_owner_role, 'Strategic Foresight Lead'),
      COALESCE(strategy_foresight_domain.embedding_model, 'text-embedding-3-large'),
      COALESCE(strategy_foresight_domain.rag_priority_weight, 0.75),
      COALESCE(strategy_foresight_domain.access_policy::text, 'public')::access_policy_level,
      true,
      -- Legacy fields
      'STRATEGIC_FORESIGHT',
      'strategic_foresight',
      'Strategic Foresight',
      'Scenario planning, trend analysis, and strategic foresight methodologies',
      ARRAY['strategic foresight', 'scenario planning', 'trend analysis', 'horizon scanning', 'future scanning', 'weak signal'],
      ARRAY[],
      '#6366F1', -- Indigo
      'telescope'
    ) ON CONFLICT (domain_id) DO UPDATE SET
      domain_name = EXCLUDED.domain_name,
      domain_description_llm = EXCLUDED.domain_description_llm,
      updated_at = NOW();

    -- Optionally, archive or deactivate the original domain
    -- Instead of deleting, we'll just mark it as inactive
    UPDATE public.knowledge_domains_new
    SET 
      is_active = false,
      updated_at = NOW()
    WHERE domain_id = strategy_foresight_domain.domain_id
      AND (domain_id LIKE '%strategy%foresight%' 
        OR domain_id LIKE '%strategy%foresight%'
        OR domain_name LIKE '%Strategy%Foresight%'
        OR domain_name LIKE '%Strategy/Foresight%');

    RAISE NOTICE 'Successfully split Strategy/Foresight domain into Strategy and Strategic Foresight';
  ELSE
    -- If no existing domain found, just create the two new domains
    -- Get max priority for tier 2 and tier 3
    SELECT COALESCE(MAX(priority), 0) INTO max_priority_tier2
    FROM public.knowledge_domains_new
    WHERE tier = 2;

    SELECT COALESCE(MAX(priority), 0) INTO max_priority_tier3
    FROM public.knowledge_domains_new
    WHERE tier = 3;

    -- Create Strategy domain
    INSERT INTO public.knowledge_domains_new (
      domain_id,
      parent_domain_id,
      function_id,
      function_name,
      domain_name,
      domain_description_llm,
      domain_scope,
      tier,
      tier_label,
      priority,
      maturity_level,
      regulatory_exposure,
      pii_sensitivity,
      lifecycle_stage,
      governance_owner,
      last_review_owner_role,
      embedding_model,
      rag_priority_weight,
      access_policy,
      is_active,
      code,
      slug,
      name,
      description,
      keywords,
      color,
      icon
    ) VALUES (
      'strategy',
      NULL,
      'corporate_strategy',
      'Corporate Strategy',
      'Strategy',
      'Covers strategic planning, business strategy, competitive strategy, strategic analysis, portfolio strategy, and strategic decision-making frameworks.',
      'global',
      2,
      'Specialized / High Value',
      max_priority_tier2 + 1,
      'Established',
      'Low',
      'Low',
      ARRAY['Corporate Strategy', 'Strategic Planning'],
      'Strategy Function',
      'Chief Strategy Officer',
      'text-embedding-3-large',
      0.85,
      'public',
      true,
      'STRATEGY',
      'strategy',
      'Strategy',
      'Strategic planning and business strategy',
      ARRAY['strategy', 'strategic planning', 'business strategy'],
      '#10B981',
      'target'
    ) ON CONFLICT (domain_id) DO NOTHING;

    -- Create Strategic Foresight domain
    INSERT INTO public.knowledge_domains_new (
      domain_id,
      parent_domain_id,
      function_id,
      function_name,
      domain_name,
      domain_description_llm,
      domain_scope,
      tier,
      tier_label,
      priority,
      maturity_level,
      regulatory_exposure,
      pii_sensitivity,
      lifecycle_stage,
      governance_owner,
      last_review_owner_role,
      embedding_model,
      rag_priority_weight,
      access_policy,
      is_active,
      code,
      slug,
      name,
      description,
      keywords,
      color,
      icon
    ) VALUES (
      'strategic_foresight',
      NULL,
      'corporate_strategy',
      'Corporate Strategy',
      'Strategic Foresight',
      'Covers scenario planning, trend analysis, future scanning, horizon scanning, strategic foresight methodologies, and long-term strategic thinking.',
      'global',
      3,
      'Emerging / Fast-Evolving',
      max_priority_tier3 + 1,
      'Emerging',
      'Low',
      'Low',
      ARRAY['Corporate Strategy', 'Future Planning'],
      'Strategy / Foresight Function',
      'Strategic Foresight Lead',
      'text-embedding-3-large',
      0.75,
      'public',
      true,
      'STRATEGIC_FORESIGHT',
      'strategic_foresight',
      'Strategic Foresight',
      'Scenario planning and strategic foresight',
      ARRAY['strategic foresight', 'scenario planning', 'trend analysis'],
      '#6366F1',
      'telescope'
    ) ON CONFLICT (domain_id) DO NOTHING;

    RAISE NOTICE 'Created Strategy and Strategic Foresight domains (no existing domain to split)';
  END IF;
END $$;

-- Verify domains were created
DO $$
DECLARE
  design_thinking_count INTEGER;
  strategy_count INTEGER;
  strategic_foresight_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO design_thinking_count
  FROM public.knowledge_domains_new
  WHERE domain_id = 'design_thinking';

  SELECT COUNT(*) INTO strategy_count
  FROM public.knowledge_domains_new
  WHERE domain_id = 'strategy';

  SELECT COUNT(*) INTO strategic_foresight_count
  FROM public.knowledge_domains_new
  WHERE domain_id = 'strategic_foresight';

  RAISE NOTICE 'Domain creation summary:';
  RAISE NOTICE '  - Design Thinking: % (expected: 1)', design_thinking_count;
  RAISE NOTICE '  - Strategy: % (expected: 1)', strategy_count;
  RAISE NOTICE '  - Strategic Foresight: % (expected: 1)', strategic_foresight_count;
END $$;

