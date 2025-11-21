INSERT INTO public.llm_providers (code, name, slug, description, tier, priority, keywords, is_active, metadata) VALUES
  ('openai', 'OpenAI', 'openai', 'OpenAI language models', 1, 1, ARRAY['gpt-4', 'openai'], true, '{"models": ["gpt-4", "gpt-3.5-turbo"]}'),
  ('anthropic', 'Anthropic', 'anthropic', 'Anthropic Claude models', 1, 2, ARRAY['claude', 'anthropic'], true, '{"models": ["claude-3-5-sonnet"]}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, is_active, metadata) VALUES
  ('regulatory-affairs', 'Regulatory Affairs', 'regulatory-affairs', 'FDA and regulatory requirements', 1, 1, ARRAY['fda', 'regulatory'], true, '{}'),
  ('clinical-development', 'Clinical Development', 'clinical-development', 'Clinical trial design', 1, 2, ARRAY['clinical', 'trials'], true, '{}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.agents (code, name, slug, description, tier, priority, keywords, sub_domains, agent_count_estimate, color, is_active, metadata) VALUES
  ('fda-regulatory-strategist', 'FDA Regulatory Strategist', 'fda-regulatory-strategist', 'Expert FDA regulatory strategist', 1, 1, ARRAY['fda', 'regulatory'], ARRAY['regulatory-affairs'], 1, '#DC2626', true, '{"system_prompt": "You are an expert FDA Regulatory Strategist"}'),
  ('clinical-protocol-designer', 'Clinical Protocol Designer', 'clinical-protocol-designer', 'Expert clinical research professional', 1, 2, ARRAY['clinical', 'protocol'], ARRAY['clinical-development'], 1, '#059669', true, '{"system_prompt": "You are an expert Clinical Protocol Designer"}')
ON CONFLICT (slug) DO NOTHING;
