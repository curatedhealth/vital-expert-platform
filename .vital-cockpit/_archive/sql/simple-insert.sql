-- Simple data insertion only
-- Copy and paste this EXACT content into Supabase SQL Editor

INSERT INTO public.llm_providers (name, provider_type, is_active, models, rate_limits, pricing) VALUES
  ('OpenAI', 'openai', true, '["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]', '{}', '{}'),
  ('Anthropic', 'anthropic', true, '["claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus"]', '{}', '{}'),
  ('Google', 'google', true, '["gemini-pro", "gemini-pro-vision"]', '{}', '{}'),
  ('Meta', 'meta', true, '["llama-2-70b", "llama-2-13b"]', '{}', '{}')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.knowledge_domains (name, slug, description, is_active, metadata) VALUES
  ('Regulatory Affairs', 'regulatory-affairs', 'FDA, EMA, and global regulatory requirements', true, '{}'),
  ('Clinical Development', 'clinical-development', 'Clinical trial design and execution', true, '{}'),
  ('Quality Assurance', 'quality-assurance', 'Quality management systems and compliance', true, '{}'),
  ('Market Access', 'market-access', 'Reimbursement and market access strategies', true, '{}'),
  ('Digital Health', 'digital-health', 'Digital therapeutics and health technologies', true, '{}'),
  ('Medical Devices', 'medical-devices', 'Medical device development and regulation', true, '{}'),
  ('Pharmacovigilance', 'pharmacovigilance', 'Drug safety and adverse event monitoring', true, '{}'),
  ('Health Economics', 'health-economics', 'Economic evaluation and outcomes research', true, '{}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.agents (name, display_name, description, avatar, color, system_prompt, model, temperature, max_tokens, capabilities, business_function, department, role, tier, status, is_public, is_custom, metadata) VALUES
  ('fda-regulatory-strategist', 'FDA Regulatory Strategist', 'Expert FDA regulatory strategist with 15+ years experience in medical device submissions.', '🏛️', '#DC2626', 'You are an expert FDA Regulatory Strategist with 15+ years experience in medical device submissions.', 'gpt-4', 0.3, 2000, ARRAY['FDA Strategy', '510(k) Submissions', 'PMA Applications'], 'Regulatory Affairs', 'Regulatory Strategy', 'Senior Regulatory Strategist', 1, 'active', true, false, '{}'),
  ('clinical-protocol-designer', 'Clinical Protocol Designer', 'Expert clinical research professional specializing in digital health clinical trial design.', '🔬', '#059669', 'You are an expert Clinical Protocol Designer specializing in digital health and medical device clinical trials.', 'gpt-4', 0.4, 2000, ARRAY['Protocol Design', 'Statistical Planning', 'Endpoint Selection'], 'Clinical Development', 'Clinical Operations', 'Senior Clinical Research Manager', 1, 'active', true, false, '{}'),
  ('quality-systems-architect', 'Quality Systems Architect', 'ISO 13485 and FDA QSR expert who designs and implements comprehensive quality management systems.', '⚙️', '#7C3AED', 'You are a Quality Systems Architect with deep expertise in ISO 13485 and FDA Quality System Regulation.', 'gpt-4', 0.3, 2000, ARRAY['ISO 13485', 'FDA QSR', 'Risk Management'], 'Quality Assurance', 'Quality Management', 'Senior Quality Systems Manager', 1, 'active', true, false, '{}'),
  ('market-access-strategist', 'Market Access Strategist', 'Healthcare economics and reimbursement expert who develops comprehensive market access strategies.', '💰', '#EA580C', 'You are a Market Access Strategist specializing in healthcare economics and reimbursement for digital health technologies.', 'gpt-4', 0.4, 2000, ARRAY['Market Access', 'Reimbursement Strategy', 'HEOR Analysis'], 'Commercial', 'Market Access', 'Senior Market Access Director', 1, 'active', true, false, '{}'),
  ('hipaa-compliance-officer', 'HIPAA Compliance Officer', 'Healthcare privacy and security expert who ensures full HIPAA compliance.', '🔒', '#DC2626', 'You are a HIPAA Compliance Officer with extensive experience in healthcare privacy and security.', 'gpt-4', 0.3, 2000, ARRAY['HIPAA Compliance', 'Privacy Protection', 'Security Safeguards'], 'Compliance', 'Privacy & Security', 'Senior Compliance Officer', 1, 'active', true, false, '{}')
ON CONFLICT (name) DO NOTHING;

SELECT 'LLM Providers' as table_name, COUNT(*) as count FROM public.llm_providers
UNION ALL
SELECT 'Knowledge Domains' as table_name, COUNT(*) as count FROM public.knowledge_domains
UNION ALL
SELECT 'Agents' as table_name, COUNT(*) as count FROM public.agents;
