-- =====================================================================================
-- FOUNDATION AGENTS - NEW DB SCHEMA
-- =====================================================================================
-- Manually adapted for NEW DB (Vital-expert) schema
-- Target tenant: digital-health-startup (11111111-1111-1111-1111-111111111111)
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = v_tenant_id) THEN
    RAISE EXCEPTION 'Tenant with ID % not found. Please create tenant first.', v_tenant_id;
  END IF;

  RAISE NOTICE 'Using tenant: digital-health-startup (ID: %)', v_tenant_id;
END $$;

-- =====================================================================================
-- FOUNDATION AGENTS
-- =====================================================================================

INSERT INTO agents (
  tenant_id,
  name,
  slug,
  tagline,
  description,
  specializations,
  system_prompt,
  base_model,
  temperature,
  max_tokens,
  tags,
  status,
  validation_status,
  metadata
)
VALUES
-- 1. Workflow Orchestration Agent
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Workflow Orchestration Agent',
  'workflow-orchestration-agent',
  'Master orchestrator for multi-agent workflows',
  'Master orchestrator that coordinates multi-agent workflows, manages task dependencies, and handles error recovery',
  ARRAY['Workflow planning', 'Agent task assignment', 'Dependency management', 'Error recovery', 'Progress tracking']::TEXT[],
  'You are a workflow orchestration agent responsible for coordinating multi-agent workflows and managing task dependencies.',
  'gpt-4',
  0.2,
  4000,
  ARRAY['orchestration', 'workflow', 'coordination']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domains', ARRAY['clinical_development', 'regulatory_affairs', 'medical_affairs'],
    'can_delegate_to', ARRAY['SPECIALIST', 'EXECUTOR', 'RETRIEVER'],
    'max_concurrent_tasks', 10,
    'retry_strategy', 'exponential_backoff'
  )
),

-- 2. Project Coordination Agent
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Project Coordination Agent',
  'project-coordination-agent',
  'Coordinates cross-functional project activities',
  'Coordinates cross-functional project activities, manages stakeholder communications, and tracks deliverables',
  ARRAY['Project planning', 'Stakeholder coordination', 'Timeline management', 'Resource allocation', 'Status reporting']::TEXT[],
  'You are a project coordination agent that helps manage cross-functional projects and stakeholder communications.',
  'gpt-4',
  0.3,
  3000,
  ARRAY['project_management', 'coordination', 'stakeholder']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domains', ARRAY['clinical_development', 'regulatory_affairs', 'medical_affairs', 'commercial_strategy'],
    'notification_channels', ARRAY['email', 'slack'],
    'escalation_enabled', true
  )
),

-- 3. Clinical Data Analyst Agent
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Clinical Data Analyst Agent',
  'clinical-data-analyst-agent',
  'Analyzes clinical trial data and generates insights',
  'Specialist agent for analyzing clinical trial data, identifying trends, and generating actionable insights',
  ARRAY['Data analysis', 'Statistical modeling', 'Trend identification', 'Insight generation', 'Reporting']::TEXT[],
  'You are a clinical data analyst specializing in analyzing trial data and generating insights.',
  'gpt-4',
  0.3,
  4000,
  ARRAY['clinical_trials', 'data_analysis', 'statistics']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domain', 'clinical_development',
    'data_sources', ARRAY['EDC', 'CTMS', 'eCRF'],
    'analysis_types', ARRAY['descriptive', 'inferential', 'predictive']
  )
),

-- 4. Regulatory Compliance Validator
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Regulatory Compliance Validator',
  'regulatory-compliance-validator',
  'Validates regulatory compliance and documentation',
  'Validator agent that checks regulatory submissions for compliance with FDA, EMA, and other regulatory requirements',
  ARRAY['Compliance checking', 'Document validation', 'Regulatory assessment', 'Risk identification', 'Gap analysis']::TEXT[],
  'You are a regulatory compliance validator responsible for ensuring submissions meet regulatory standards.',
  'gpt-4',
  0.1,
  3000,
  ARRAY['regulatory', 'compliance', 'validation', 'FDA', 'EMA']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domain', 'regulatory_affairs',
    'regulations', ARRAY['FDA 21 CFR Part 11', 'ICH GCP', 'EMA Guidelines'],
    'check_types', ARRAY['completeness', 'accuracy', 'compliance']
  )
),

-- 5. Medical Literature Researcher
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Medical Literature Researcher',
  'medical-literature-researcher',
  'Retrieves and synthesizes medical literature',
  'Retriever agent that searches medical databases, retrieves relevant literature, and synthesizes findings',
  ARRAY['Literature search', 'Database querying', 'Evidence synthesis', 'Citation management', 'Abstract generation']::TEXT[],
  'You are a medical literature researcher that helps find and synthesize relevant medical evidence.',
  'gpt-4',
  0.4,
  4000,
  ARRAY['medical_literature', 'research', 'evidence_synthesis', 'PubMed']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domain', 'medical_affairs',
    'databases', ARRAY['PubMed', 'EMBASE', 'Cochrane', 'ClinicalTrials.gov'],
    'search_strategies', ARRAY['keyword', 'MeSH terms', 'Boolean']
  )
),

-- 6. Document Generator
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Document Generator',
  'document-generator',
  'Generates regulatory and clinical documents',
  'Executor agent that generates regulatory submissions, clinical study reports, and other documentation',
  ARRAY['Document generation', 'Template population', 'Content structuring', 'Quality control', 'Version management']::TEXT[],
  'You are a document generator that creates regulatory and clinical documents from templates and data.',
  'gpt-4',
  0.5,
  4000,
  ARRAY['document_generation', 'regulatory_writing', 'medical_writing']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domain', 'regulatory_affairs',
    'document_types', ARRAY['IND', 'NDA', 'CSR', 'Protocol', 'Informed Consent'],
    'templates_available', true
  )
),

-- 7. Safety Signal Detector
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Safety Signal Detector',
  'safety-signal-detector',
  'Detects and analyzes safety signals',
  'Specialist agent that monitors adverse events, detects safety signals, and performs risk assessment',
  ARRAY['Signal detection', 'Adverse event monitoring', 'Risk assessment', 'Trend analysis', 'Alert generation']::TEXT[],
  'You are a safety signal detector that monitors adverse events and identifies potential safety issues.',
  'gpt-4',
  0.2,
  3000,
  ARRAY['pharmacovigilance', 'safety', 'adverse_events', 'risk_management']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domain', 'medical_affairs',
    'monitoring_sources', ARRAY['spontaneous reports', 'clinical trials', 'literature'],
    'detection_methods', ARRAY['proportional reporting ratio', 'Bayesian', 'temporal analysis']
  )
),

-- 8. Clinical Trial Protocol Designer
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Clinical Trial Protocol Designer',
  'clinical-trial-protocol-designer',
  'Designs and optimizes clinical trial protocols',
  'Synthesizer agent that designs clinical trial protocols, optimizes study designs, and ensures scientific rigor',
  ARRAY['Protocol design', 'Study optimization', 'Endpoint selection', 'Statistical planning', 'Feasibility assessment']::TEXT[],
  'You are a clinical trial protocol designer that helps create scientifically rigorous and feasible study protocols.',
  'gpt-4',
  0.4,
  4000,
  ARRAY['protocol_design', 'clinical_trials', 'study_design', 'biostatistics']::TEXT[],
  'active',
  'approved',
  jsonb_build_object(
    'domain', 'clinical_development',
    'protocol_elements', ARRAY['objectives', 'endpoints', 'inclusion/exclusion', 'assessments', 'statistical plan'],
    'design_types', ARRAY['parallel', 'crossover', 'adaptive', 'factorial']
  )
)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Verification
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM agents
  WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;

  RAISE NOTICE '✅ Foundation agents loaded: % agents', v_count;
END $$;
