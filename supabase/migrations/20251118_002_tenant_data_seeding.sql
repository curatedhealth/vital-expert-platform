-- ============================================================================
-- PHASE 2: Tenant-Specific Data Seeding
-- Date: 2025-11-18
-- Purpose: Seed appropriate data for each tenant
-- ============================================================================

BEGIN;

-- ============================================================================
-- Define Tenant IDs
-- ============================================================================
DO $$
DECLARE
  platform_tenant UUID := '00000000-0000-0000-0000-000000000001';
  startup_tenant UUID := '11111111-1111-1111-1111-111111111111';
  pharma_tenant UUID := 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
BEGIN

  -- ============================================================================
  -- DIGITAL HEALTH STARTUP TENANT DATA
  -- ============================================================================

  -- Clone relevant tools for Digital Health Startup
  INSERT INTO public.tools (
    tool_key,
    name,
    description,
    category,
    category_id,
    tool_type,
    implementation_path,
    requires_api_key,
    api_key_env_var,
    input_schema,
    output_format,
    timeout_seconds,
    is_active,
    tenant_id,
    slug,
    implementation_type,
    status
  )
  SELECT
    tool_key || '_startup',
    name,
    description || ' (Digital Health Startup Edition)',
    category,
    category_id,
    tool_type,
    implementation_path,
    requires_api_key,
    api_key_env_var,
    input_schema,
    output_format,
    timeout_seconds,
    is_active,
    startup_tenant, -- Assign to startup tenant
    LOWER(REPLACE(name, ' ', '-')) || '-startup',
    COALESCE(tool_type, 'function'),
    'active'
  FROM public.tools
  WHERE tenant_id = platform_tenant
    AND category IN ('Digital Health', 'Clinical Trials', 'Evidence Research')
    AND NOT EXISTS (
      SELECT 1 FROM public.tools t2
      WHERE t2.tenant_id = startup_tenant
      AND t2.tool_key = tools.tool_key || '_startup'
    );

  -- Clone relevant agents for Digital Health Startup
  INSERT INTO public.agents (
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    business_function,
    department,
    role,
    tier,
    status,
    is_public,
    tenant_id
  )
  SELECT
    name || '_startup',
    display_name || ' (Startup)',
    description || ' - Optimized for digital health startups',
    avatar,
    color,
    system_prompt || '\n\nContext: You are supporting a digital health startup focused on innovative clinical trials and digital endpoints.',
    model,
    temperature,
    max_tokens,
    capabilities,
    business_function,
    department,
    role,
    tier,
    status,
    false, -- Private to tenant
    startup_tenant
  FROM public.agents
  WHERE tenant_id = platform_tenant
    AND business_function IN (
      'Clinical Operations',
      'Digital Medicine',
      'Clinical Development',
      'Regulatory Affairs'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.agents a2
      WHERE a2.tenant_id = startup_tenant
      AND a2.name = agents.name || '_startup'
    )
  LIMIT 10; -- Clone top 10 relevant agents

  -- Create startup-specific personas
  INSERT INTO public.personas (name, description, goals, pain_points, tenant_id)
  VALUES
    ('Digital Health Innovator', 'Early-stage startup founder in digital health',
     ARRAY['Rapid clinical validation', 'Regulatory pathway clarity', 'Cost-effective trials'],
     ARRAY['Limited resources', 'Regulatory uncertainty', 'Need for clinical credibility'],
     startup_tenant),
    ('Clinical Trial Coordinator', 'Manages decentralized clinical trials',
     ARRAY['Patient recruitment', 'Remote monitoring', 'Data quality'],
     ARRAY['Technology adoption', 'Patient compliance', 'Multi-site coordination'],
     startup_tenant),
    ('Digital Biomarker Developer', 'Creates and validates digital endpoints',
     ARRAY['Endpoint validation', 'FDA acceptance', 'Clinical meaningfulness'],
     ARRAY['Lack of precedent', 'Validation requirements', 'Clinical adoption'],
     startup_tenant)
  ON CONFLICT DO NOTHING;

  -- Create startup-specific JTBD
  INSERT INTO public.jobs_to_be_done (
    job_statement,
    actor,
    action,
    context,
    expected_outcome,
    tenant_id
  )
  VALUES
    ('When I need to validate a digital biomarker for FDA submission, I want comprehensive evidence and precedent cases so that I can build a strong regulatory case',
     'Digital Health Product Manager', 'validate digital biomarker', 'FDA submission preparation',
     'Strong regulatory submission package', startup_tenant),
    ('When I am designing a decentralized clinical trial, I want best practices and technology recommendations so that I can ensure high quality data collection',
     'Clinical Operations Lead', 'design decentralized trial', 'Trial protocol development',
     'Robust DCT protocol', startup_tenant),
    ('When I need to demonstrate clinical utility, I want real-world evidence strategies so that I can prove value to payers and providers',
     'Chief Medical Officer', 'demonstrate clinical utility', 'Market access planning',
     'Clear value proposition', startup_tenant)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- PHARMACEUTICAL COMPANY TENANT DATA
  -- ============================================================================

  -- Clone relevant tools for Pharma
  INSERT INTO public.tools (
    tool_key,
    name,
    description,
    category,
    category_id,
    tool_type,
    implementation_path,
    requires_api_key,
    api_key_env_var,
    input_schema,
    output_format,
    timeout_seconds,
    is_active,
    tenant_id,
    slug,
    implementation_type,
    status
  )
  SELECT
    tool_key || '_pharma',
    name,
    description || ' (Pharmaceutical Enterprise Edition)',
    category,
    category_id,
    tool_type,
    implementation_path,
    requires_api_key,
    api_key_env_var,
    input_schema,
    output_format,
    timeout_seconds,
    is_active,
    pharma_tenant, -- Assign to pharma tenant
    LOWER(REPLACE(name, ' ', '-')) || '-pharma',
    COALESCE(tool_type, 'function'),
    'active'
  FROM public.tools
  WHERE tenant_id = platform_tenant
    AND category IN ('Regulatory & Standards', 'Evidence Research', 'Knowledge Management')
    AND NOT EXISTS (
      SELECT 1 FROM public.tools t2
      WHERE t2.tenant_id = pharma_tenant
      AND t2.tool_key = tools.tool_key || '_pharma'
    );

  -- Clone relevant agents for Pharma
  INSERT INTO public.agents (
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    business_function,
    department,
    role,
    tier,
    status,
    is_public,
    tenant_id
  )
  SELECT
    name || '_pharma',
    display_name || ' (Pharma)',
    description || ' - Enterprise pharmaceutical expertise',
    avatar,
    color,
    system_prompt || '\n\nContext: You are supporting a major pharmaceutical company with extensive drug development pipeline and global regulatory needs.',
    model,
    temperature,
    max_tokens,
    capabilities,
    business_function,
    department,
    role,
    tier,
    status,
    false, -- Private to tenant
    pharma_tenant
  FROM public.agents
  WHERE tenant_id = platform_tenant
    AND business_function IN (
      'Regulatory Affairs',
      'Clinical Development',
      'Drug Safety',
      'Medical Affairs',
      'Market Access'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.agents a2
      WHERE a2.tenant_id = pharma_tenant
      AND a2.name = agents.name || '_pharma'
    )
  LIMIT 15; -- Clone top 15 relevant agents

  -- Create pharma-specific personas
  INSERT INTO public.personas (name, description, goals, pain_points, tenant_id)
  VALUES
    ('Regulatory Affairs Director', 'Leads global regulatory strategy for drug portfolio',
     ARRAY['Global approval strategy', 'Regulatory compliance', 'Expedited pathways'],
     ARRAY['Changing regulations', 'Multi-region coordination', 'Resource allocation'],
     pharma_tenant),
    ('Clinical Development Lead', 'Manages Phase II-III clinical programs',
     ARRAY['Trial efficiency', 'Patient recruitment', 'Data quality'],
     ARRAY['Rising costs', 'Site management', 'Protocol complexity'],
     pharma_tenant),
    ('Medical Science Liaison', 'Bridges clinical research and commercial teams',
     ARRAY['KOL engagement', 'Scientific communication', 'Evidence dissemination'],
     ARRAY['Data interpretation', 'Stakeholder alignment', 'Competitive intelligence'],
     pharma_tenant),
    ('Pharmacovigilance Manager', 'Ensures drug safety monitoring and reporting',
     ARRAY['Signal detection', 'Regulatory reporting', 'Risk management'],
     ARRAY['Data volume', 'Global requirements', 'Timeline pressures'],
     pharma_tenant)
  ON CONFLICT DO NOTHING;

  -- Create pharma-specific JTBD
  INSERT INTO public.jobs_to_be_done (
    job_statement,
    actor,
    action,
    context,
    expected_outcome,
    tenant_id
  )
  VALUES
    ('When I am preparing for FDA advisory committee, I want comprehensive benefit-risk analysis so that I can present a compelling case for approval',
     'Regulatory Affairs Director', 'prepare advisory committee materials', 'FDA AdCom preparation',
     'Successful advisory committee outcome', pharma_tenant),
    ('When I need to design a global Phase III program, I want regulatory requirements across regions so that I can create a harmonized protocol',
     'Clinical Development VP', 'design global trial program', 'Phase III planning',
     'Efficient global development plan', pharma_tenant),
    ('When I am evaluating a safety signal, I want comprehensive adverse event analysis so that I can determine if regulatory action is needed',
     'Drug Safety Director', 'evaluate safety signal', 'Pharmacovigilance assessment',
     'Clear safety assessment and action plan', pharma_tenant),
    ('When I need to demonstrate drug value, I want health economics data and payer insights so that I can secure favorable reimbursement',
     'Market Access Lead', 'demonstrate drug value', 'Payer negotiations',
     'Positive coverage decisions', pharma_tenant)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- Create Sample Prompts for Each Tenant
  -- ============================================================================

  -- Startup-specific prompts
  INSERT INTO public.prompts (
    title,
    content,
    category,
    tags,
    is_public,
    tenant_id
  )
  VALUES
    ('Digital Endpoint Validation Framework',
     'Create a comprehensive validation plan for [DIGITAL ENDPOINT] including: V3 framework components, clinical meaningfulness evidence, FDA precedents, and statistical analysis plan',
     'Digital Medicine', ARRAY['digital-endpoints', 'validation', 'FDA'],
     true, startup_tenant),
    ('DCT Protocol Template',
     'Design a decentralized clinical trial protocol for [INDICATION] including: remote monitoring plan, digital consent process, home health integration, and data management strategy',
     'Clinical Trials', ARRAY['DCT', 'protocol', 'remote-monitoring'],
     true, startup_tenant)
  ON CONFLICT DO NOTHING;

  -- Pharma-specific prompts
  INSERT INTO public.prompts (
    title,
    content,
    category,
    tags,
    is_public,
    tenant_id
  )
  VALUES
    ('Global Regulatory Strategy',
     'Develop a global regulatory strategy for [DRUG NAME] targeting [INDICATION] including: FDA, EMA, PMDA pathways, harmonized development plan, and risk mitigation strategies',
     'Regulatory', ARRAY['global', 'regulatory-strategy', 'multi-region'],
     true, pharma_tenant),
    ('Benefit-Risk Assessment',
     'Conduct comprehensive benefit-risk assessment for [DRUG] including: efficacy analysis, safety profile, comparative effectiveness, and structured benefit-risk framework',
     'Drug Safety', ARRAY['benefit-risk', 'safety', 'efficacy'],
     true, pharma_tenant),
    ('Market Access Dossier',
     'Create market access dossier for [DRUG] including: value proposition, health economics model, payer insights, and pricing strategy across major markets',
     'Market Access', ARRAY['pricing', 'reimbursement', 'HEOR'],
     true, pharma_tenant)
  ON CONFLICT DO NOTHING;

END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION: Check Data Distribution Across Tenants
-- ============================================================================

SELECT
  t.tenant_id,
  CASE
    WHEN t.tenant_id = '00000000-0000-0000-0000-000000000001' THEN 'Platform'
    WHEN t.tenant_id = '11111111-1111-1111-1111-111111111111' THEN 'Digital Health Startup'
    WHEN t.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' THEN 'Pharmaceuticals'
    ELSE 'Unknown'
  END as tenant_name,
  'agents' as entity_type,
  COUNT(*) as count
FROM public.agents t
GROUP BY t.tenant_id

UNION ALL

SELECT
  t.tenant_id,
  CASE
    WHEN t.tenant_id = '00000000-0000-0000-0000-000000000001' THEN 'Platform'
    WHEN t.tenant_id = '11111111-1111-1111-1111-111111111111' THEN 'Digital Health Startup'
    WHEN t.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' THEN 'Pharmaceuticals'
    ELSE 'Unknown'
  END as tenant_name,
  'tools' as entity_type,
  COUNT(*) as count
FROM public.tools t
GROUP BY t.tenant_id

UNION ALL

SELECT
  t.tenant_id,
  CASE
    WHEN t.tenant_id = '00000000-0000-0000-0000-000000000001' THEN 'Platform'
    WHEN t.tenant_id = '11111111-1111-1111-1111-111111111111' THEN 'Digital Health Startup'
    WHEN t.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' THEN 'Pharmaceuticals'
    ELSE 'Unknown'
  END as tenant_name,
  'prompts' as entity_type,
  COUNT(*) as count
FROM public.prompts t
GROUP BY t.tenant_id

ORDER BY tenant_name, entity_type;