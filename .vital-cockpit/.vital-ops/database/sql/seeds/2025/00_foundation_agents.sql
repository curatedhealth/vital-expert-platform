-- =====================================================================================
-- 00_foundation_agents.sql
-- Foundation AI Agents - Cross-Domain Reusable Agents
-- =====================================================================================
-- Purpose: Seed foundational AI agents that can be used across multiple use cases
-- Dependencies: Tenant must exist, dh_agent table must be created
-- Execution Order: 0 (foundation - before use case specific seeds)
-- =====================================================================================
-- 
-- AGENT CATEGORIES:
-- 1. ORCHESTRATOR: Master agents that coordinate multi-agent workflows
-- 2. SPECIALIST: Domain-specific expert agents  
-- 3. VALIDATOR: Quality/compliance checking agents
-- 4. EXECUTOR: Task execution agents
-- 5. RETRIEVER: Information gathering agents
-- 6. SYNTHESIZER: Analysis and synthesis agents
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: TENANT LOOKUP & SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_tenant_slug TEXT := 'digital-health-startup';
BEGIN
  SELECT id INTO v_tenant_id 
  FROM tenants 
  WHERE slug = v_tenant_slug;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant with slug "%" not found. Please create tenant first.', v_tenant_slug;
  END IF;
  
  RAISE NOTICE 'Using tenant: % (ID: %)', v_tenant_slug, v_tenant_id;
END $$;

-- Store tenant_id for session use
CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

DELETE FROM session_config;

INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- =====================================================================================
-- SECTION 1: ORCHESTRATOR AGENTS
-- =====================================================================================
-- Master agents that coordinate workflows across multiple specialist agents

INSERT INTO dh_agent (
  tenant_id,
  code,
  name,
  unique_id,
  agent_type,
  framework,
  description,
  capabilities,
  autonomy_level,
  model_config,
  tags,
  status,
  metadata
)
SELECT 
  sc.tenant_id,
  a_data.code,
  a_data.name,
  a_data.unique_id,
  a_data.agent_type,
  a_data.framework,
  a_data.description,
  a_data.capabilities,
  a_data.autonomy_level,
  a_data.model_config,
  a_data.tags,
  a_data.status,
  a_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- AGT-WORKFLOW-ORCHESTRATOR: Workflow Orchestration Agent
    (
      'AGT-WORKFLOW-ORCHESTRATOR',
      'Workflow Orchestration Agent',
      'AGT-WORKFLOW-ORCHESTRATOR',
      'ORCHESTRATOR',
      'langgraph',
      'Master orchestrator that coordinates multi-agent workflows, manages task dependencies, and handles error recovery',
      json_build_array(
        'Workflow planning and decomposition',
        'Agent task assignment',
        'Dependency management',
        'Error recovery and retry logic',
        'Progress tracking and reporting'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.2,
        'max_tokens', 4000
      ),
      ARRAY['orchestration', 'workflow', 'coordination']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('clinical_development', 'regulatory_affairs', 'medical_affairs'),
        'can_delegate_to', json_build_array('SPECIALIST', 'EXECUTOR', 'RETRIEVER'),
        'max_concurrent_tasks', 10,
        'retry_strategy', 'exponential_backoff'
      )
    ),
    
    -- AGT-PROJECT-COORDINATOR: Project Coordination Agent
    (
      'AGT-PROJECT-COORDINATOR',
      'Project Coordination Agent',
      'AGT-PROJECT-COORDINATOR',
      'ORCHESTRATOR',
      'langgraph',
      'Coordinates cross-functional project activities, manages stakeholder communications, and tracks deliverables',
      json_build_array(
        'Project planning',
        'Stakeholder coordination',
        'Timeline management',
        'Resource allocation',
        'Status reporting'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.3,
        'max_tokens', 3000
      ),
      ARRAY['project_management', 'coordination', 'stakeholder']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('clinical_development', 'regulatory_affairs', 'medical_affairs', 'commercial_strategy'),
        'notification_channels', json_build_array('email', 'slack'),
        'escalation_enabled', true
      )
    )
) AS a_data(
  code, name, unique_id, agent_type, framework, description,
  capabilities, autonomy_level, model_config, tags, status, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  agent_type = EXCLUDED.agent_type,
  framework = EXCLUDED.framework,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  autonomy_level = EXCLUDED.autonomy_level,
  model_config = EXCLUDED.model_config,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: CLINICAL DEVELOPMENT SPECIALIST AGENTS
-- =====================================================================================

INSERT INTO dh_agent (
  tenant_id,
  code,
  name,
  unique_id,
  agent_type,
  framework,
  description,
  capabilities,
  autonomy_level,
  model_config,
  tags,
  status,
  metadata
)
SELECT 
  sc.tenant_id,
  a_data.code,
  a_data.name,
  a_data.unique_id,
  a_data.agent_type,
  a_data.framework,
  a_data.description,
  a_data.capabilities,
  a_data.autonomy_level,
  a_data.model_config,
  a_data.tags,
  a_data.status,
  a_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- AGT-CLINICAL-ENDPOINT: Clinical Endpoint Selection Agent
    (
      'AGT-CLINICAL-ENDPOINT',
      'Clinical Endpoint Selection Agent',
      'AGT-CLINICAL-ENDPOINT',
      'SPECIALIST',
      'langgraph',
      'Specialist in selecting and validating clinical endpoints for trials, ensuring regulatory acceptability and clinical meaningfulness',
      json_build_array(
        'Endpoint identification and selection',
        'Clinical meaningfulness assessment',
        'Regulatory precedent analysis',
        'MCID determination',
        'Surrogate endpoint validation'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.2,
        'max_tokens', 3000
      ),
      ARRAY['clinical_development', 'endpoints', 'trial_design']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('clinical_development', 'regulatory_affairs'),
        'regulatory_guidance', json_build_array('FDA Guidance for Industry', 'ICH E9'),
        'knowledge_sources', json_build_array('clinicaltrials.gov', 'fda.gov', 'pubmed')
      )
    ),
    
    -- AGT-PROTOCOL-DESIGNER: Protocol Design Agent
    (
      'AGT-PROTOCOL-DESIGNER',
      'Protocol Design Agent',
      'AGT-PROTOCOL-DESIGNER',
      'SPECIALIST',
      'langgraph',
      'Designs comprehensive clinical trial protocols aligned with ICH-GCP and regulatory requirements',
      json_build_array(
        'Protocol structure development',
        'Inclusion/exclusion criteria definition',
        'Study design optimization',
        'Statistical considerations',
        'Safety monitoring plans'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.3,
        'max_tokens', 4000
      ),
      ARRAY['clinical_development', 'protocol', 'trial_design']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('clinical_development'),
        'standards', json_build_array('ICH-GCP', 'FDA 21 CFR Part 312'),
        'output_formats', json_build_array('Word', 'PDF', 'Structured')
      )
    ),
    
    -- AGT-BIOSTATISTICS: Biostatistics Analysis Agent
    (
      'AGT-BIOSTATISTICS',
      'Biostatistics Analysis Agent',
      'AGT-BIOSTATISTICS',
      'SPECIALIST',
      'langgraph',
      'Expert in statistical analysis planning, sample size calculations, and data interpretation for clinical trials',
      json_build_array(
        'Sample size calculation',
        'Statistical analysis plan development',
        'Power analysis',
        'Interim analysis planning',
        'Subgroup analysis strategy'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.1,
        'max_tokens', 3000
      ),
      ARRAY['biostatistics', 'clinical_development', 'analysis']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('clinical_development', 'biostatistics'),
        'statistical_methods', json_build_array('ANCOVA', 'Mixed Models', 'Survival Analysis', 'Bayesian Methods'),
        'software_integration', json_build_array('R', 'SAS', 'Python')
      )
    )
) AS a_data(
  code, name, unique_id, agent_type, framework, description,
  capabilities, autonomy_level, model_config, tags, status, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  agent_type = EXCLUDED.agent_type,
  framework = EXCLUDED.framework,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  autonomy_level = EXCLUDED.autonomy_level,
  model_config = EXCLUDED.model_config,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: REGULATORY SPECIALIST AGENTS
-- =====================================================================================

INSERT INTO dh_agent (
  tenant_id,
  code,
  name,
  unique_id,
  agent_type,
  framework,
  description,
  capabilities,
  autonomy_level,
  model_config,
  tags,
  status,
  metadata
)
SELECT 
  sc.tenant_id,
  a_data.code,
  a_data.name,
  a_data.unique_id,
  a_data.agent_type,
  a_data.framework,
  a_data.description,
  a_data.capabilities,
  a_data.autonomy_level,
  a_data.model_config,
  a_data.tags,
  a_data.status,
  a_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- AGT-REGULATORY-STRATEGY: Regulatory Strategy Agent
    (
      'AGT-REGULATORY-STRATEGY',
      'Regulatory Strategy Agent',
      'AGT-REGULATORY-STRATEGY',
      'SPECIALIST',
      'langgraph',
      'Develops comprehensive regulatory strategies for product development and approval across global markets',
      json_build_array(
        'Regulatory pathway selection',
        'FDA/EMA strategy development',
        'Breakthrough designation assessment',
        'Regulatory precedent analysis',
        'Agency interaction planning'
      )::jsonb,
      'HUMAN_APPROVAL_REQUIRED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.1,
        'max_tokens', 3000
      ),
      ARRAY['regulatory_affairs', 'strategy', 'fda', 'ema']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('regulatory_affairs'),
        'regions', json_build_array('US', 'EU', 'Japan', 'China'),
        'product_types', json_build_array('Drug', 'Biologic', 'Device', 'DTx'),
        'citation_required', true
      )
    ),
    
    -- AGT-SUBMISSION-COMPILER: Regulatory Submission Compiler Agent
    (
      'AGT-SUBMISSION-COMPILER',
      'Regulatory Submission Compiler Agent',
      'AGT-SUBMISSION-COMPILER',
      'EXECUTOR',
      'langgraph',
      'Compiles and organizes regulatory submission documents according to CTD/eCTD format',
      json_build_array(
        'CTD/eCTD document compilation',
        'Module organization',
        'Cross-reference validation',
        'Completeness checking',
        'Format compliance verification'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.1,
        'max_tokens', 2000
      ),
      ARRAY['regulatory_affairs', 'submission', 'ectd']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('regulatory_affairs'),
        'formats', json_build_array('CTD', 'eCTD', 'NeeS'),
        'validation_rules', json_build_array('FDA Technical Specifications', 'EMA Requirements')
      )
    ),
    
    -- AGT-REGULATORY-COMPLIANCE: Regulatory Compliance Checker Agent
    (
      'AGT-REGULATORY-COMPLIANCE',
      'Regulatory Compliance Checker Agent',
      'AGT-REGULATORY-COMPLIANCE',
      'VALIDATOR',
      'langgraph',
      'Validates compliance with regulatory requirements and identifies gaps or risks',
      json_build_array(
        'Regulatory compliance assessment',
        'Gap analysis',
        'Risk identification',
        'Requirements traceability',
        'Audit trail verification'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.1,
        'max_tokens', 2500
      ),
      ARRAY['regulatory_affairs', 'compliance', 'validation']::TEXT[],
      'active',
      jsonb_build_object(
        'domains', json_build_array('regulatory_affairs', 'quality_management'),
        'regulations', json_build_array('21 CFR Part 11', '21 CFR Part 820', 'EU MDR', 'ISO 13485'),
        'output_format', 'Compliance matrix with risk scoring'
      )
    )
) AS a_data(
  code, name, unique_id, agent_type, framework, description,
  capabilities, autonomy_level, model_config, tags, status, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  agent_type = EXCLUDED.agent_type,
  framework = EXCLUDED.framework,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  autonomy_level = EXCLUDED.autonomy_level,
  model_config = EXCLUDED.model_config,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: RETRIEVER AGENTS
-- =====================================================================================

INSERT INTO dh_agent (
  tenant_id,
  code,
  name,
  unique_id,
  agent_type,
  framework,
  description,
  capabilities,
  autonomy_level,
  model_config,
  tags,
  status,
  metadata
)
SELECT 
  sc.tenant_id,
  a_data.code,
  a_data.name,
  a_data.unique_id,
  a_data.agent_type,
  a_data.framework,
  a_data.description,
  a_data.capabilities,
  a_data.autonomy_level,
  a_data.model_config,
  a_data.tags,
  a_data.status,
  a_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- AGT-LITERATURE-SEARCH: Literature Search Agent
    (
      'AGT-LITERATURE-SEARCH',
      'Literature Search Agent',
      'AGT-LITERATURE-SEARCH',
      'RETRIEVER',
      'langgraph',
      'Conducts systematic literature searches across multiple databases and synthesizes findings',
      json_build_array(
        'Database querying (PubMed, Embase, Cochrane)',
        'Boolean search strategy development',
        'Citation management',
        'Abstract screening',
        'Evidence synthesis'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.2,
        'max_tokens', 3000
      ),
      ARRAY['research', 'literature', 'evidence']::TEXT[],
      'active',
      jsonb_build_object(
        'databases', json_build_array('PubMed', 'Embase', 'Cochrane', 'ClinicalTrials.gov'),
        'search_methods', json_build_array('Boolean', 'MeSH', 'Keywords', 'Citation Tracking'),
        'output_formats', json_build_array('PRISMA flow', 'Evidence table', 'Summary report')
      )
    ),
    
    -- AGT-REGULATORY-INTELLIGENCE: Regulatory Intelligence Agent
    (
      'AGT-REGULATORY-INTELLIGENCE',
      'Regulatory Intelligence Agent',
      'AGT-REGULATORY-INTELLIGENCE',
      'RETRIEVER',
      'langgraph',
      'Monitors and retrieves regulatory guidance, precedents, and approval data from global agencies',
      json_build_array(
        'Regulatory database searching',
        'Guidance document retrieval',
        'Approval precedent analysis',
        'Regulatory landscape monitoring',
        'Competitive intelligence gathering'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.2,
        'max_tokens', 2500
      ),
      ARRAY['regulatory_affairs', 'intelligence', 'research']::TEXT[],
      'active',
      jsonb_build_object(
        'sources', json_build_array('FDA.gov', 'EMA.europa.eu', 'Drugs@FDA', 'EMA Product Database'),
        'update_frequency', 'weekly',
        'alert_triggers', json_build_array('New guidance', 'Approval decisions', 'Warning letters')
      )
    ),
    
    -- AGT-CLINICAL-DATA-RETRIEVER: Clinical Data Retrieval Agent
    (
      'AGT-CLINICAL-DATA-RETRIEVER',
      'Clinical Data Retrieval Agent',
      'AGT-CLINICAL-DATA-RETRIEVER',
      'RETRIEVER',
      'langgraph',
      'Retrieves and structures clinical trial data from EDC systems and clinical databases',
      json_build_array(
        'EDC data extraction',
        'SDTM/ADaM dataset retrieval',
        'Query resolution',
        'Data quality verification',
        'Cross-study data linkage'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-3.5-turbo',
        'temperature', 0.1,
        'max_tokens', 2000
      ),
      ARRAY['clinical_development', 'data', 'retrieval']::TEXT[],
      'active',
      jsonb_build_object(
        'edc_systems', json_build_array('Medidata Rave', 'Oracle Clinical', 'REDCap'),
        'data_standards', json_build_array('CDISC SDTM', 'CDISC ADaM', 'HL7 FHIR'),
        'security_compliance', json_build_array('HIPAA', 'GDPR', '21 CFR Part 11')
      )
    )
) AS a_data(
  code, name, unique_id, agent_type, framework, description,
  capabilities, autonomy_level, model_config, tags, status, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  agent_type = EXCLUDED.agent_type,
  framework = EXCLUDED.framework,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  autonomy_level = EXCLUDED.autonomy_level,
  model_config = EXCLUDED.model_config,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 5: SYNTHESIZER AGENTS
-- =====================================================================================

INSERT INTO dh_agent (
  tenant_id,
  code,
  name,
  unique_id,
  agent_type,
  framework,
  description,
  capabilities,
  autonomy_level,
  model_config,
  tags,
  status,
  metadata
)
SELECT 
  sc.tenant_id,
  a_data.code,
  a_data.name,
  a_data.unique_id,
  a_data.agent_type,
  a_data.framework,
  a_data.description,
  a_data.capabilities,
  a_data.autonomy_level,
  a_data.model_config,
  a_data.tags,
  a_data.status,
  a_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- AGT-EVIDENCE-SYNTHESIZER: Evidence Synthesis Agent
    (
      'AGT-EVIDENCE-SYNTHESIZER',
      'Evidence Synthesis Agent',
      'AGT-EVIDENCE-SYNTHESIZER',
      'SYNTHESIZER',
      'langgraph',
      'Synthesizes evidence from multiple sources into comprehensive, actionable insights',
      json_build_array(
        'Multi-source evidence integration',
        'Strength of evidence grading',
        'Gap analysis',
        'Recommendation generation',
        'Evidence summary creation'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.3,
        'max_tokens', 4000
      ),
      ARRAY['synthesis', 'evidence', 'analysis']::TEXT[],
      'active',
      jsonb_build_object(
        'grading_systems', json_build_array('GRADE', 'Oxford CEBM'),
        'output_formats', json_build_array('Executive summary', 'Evidence table', 'PRISMA'),
        'citation_style', 'Vancouver'
      )
    ),
    
    -- AGT-CLINICAL-REPORT-WRITER: Clinical Report Writing Agent
    (
      'AGT-CLINICAL-REPORT-WRITER',
      'Clinical Report Writing Agent',
      'AGT-CLINICAL-REPORT-WRITER',
      'SYNTHESIZER',
      'langgraph',
      'Generates comprehensive clinical study reports from trial data and analyses',
      json_build_array(
        'CSR writing (ICH E3 format)',
        'Statistical results interpretation',
        'Safety narrative generation',
        'Efficacy summary creation',
        'Figure and table generation'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.2,
        'max_tokens', 8000
      ),
      ARRAY['clinical_development', 'writing', 'reporting']::TEXT[],
      'active',
      jsonb_build_object(
        'report_types', json_build_array('CSR', 'DSUR', 'IB Update', 'Protocol Amendment'),
        'standards', json_build_array('ICH E3', 'ICH E2F'),
        'quality_checks', json_build_array('Consistency', 'Completeness', 'Citation accuracy')
      )
    ),
    
    -- AGT-DECISION-SYNTHESIZER: Decision Synthesis Agent
    (
      'AGT-DECISION-SYNTHESIZER',
      'Decision Synthesis Agent',
      'AGT-DECISION-SYNTHESIZER',
      'SYNTHESIZER',
      'langgraph',
      'Synthesizes complex information and trade-offs to support strategic decision-making',
      json_build_array(
        'Multi-criteria decision analysis',
        'Risk-benefit assessment',
        'Option comparison',
        'Sensitivity analysis',
        'Recommendation generation with rationale'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.3,
        'max_tokens', 3000
      ),
      ARRAY['decision_support', 'synthesis', 'analysis']::TEXT[],
      'active',
      jsonb_build_object(
        'decision_frameworks', json_build_array('MCDA', 'Decision Tree', 'Risk Matrix'),
        'output_format', 'Structured decision memo with evidence tiers',
        'stakeholder_perspectives', true
      )
    )
) AS a_data(
  code, name, unique_id, agent_type, framework, description,
  capabilities, autonomy_level, model_config, tags, status, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  agent_type = EXCLUDED.agent_type,
  framework = EXCLUDED.framework,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  autonomy_level = EXCLUDED.autonomy_level,
  model_config = EXCLUDED.model_config,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 6: VALIDATOR AGENTS
-- =====================================================================================

INSERT INTO dh_agent (
  tenant_id,
  code,
  name,
  unique_id,
  agent_type,
  framework,
  description,
  capabilities,
  autonomy_level,
  model_config,
  tags,
  status,
  metadata
)
SELECT 
  sc.tenant_id,
  a_data.code,
  a_data.name,
  a_data.unique_id,
  a_data.agent_type,
  a_data.framework,
  a_data.description,
  a_data.capabilities,
  a_data.autonomy_level,
  a_data.model_config,
  a_data.tags,
  a_data.status,
  a_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- AGT-QUALITY-VALIDATOR: Quality Validation Agent
    (
      'AGT-QUALITY-VALIDATOR',
      'Quality Validation Agent',
      'AGT-QUALITY-VALIDATOR',
      'VALIDATOR',
      'langgraph',
      'Validates quality and completeness of deliverables against predefined criteria',
      json_build_array(
        'Completeness checking',
        'Consistency validation',
        'Quality scoring',
        'Gap identification',
        'Remediation recommendations'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.1,
        'max_tokens', 2500
      ),
      ARRAY['quality', 'validation', 'qa']::TEXT[],
      'active',
      jsonb_build_object(
        'validation_types', json_build_array('Document QC', 'Data QC', 'Process QC'),
        'quality_standards', json_build_array('ISO 9001', 'ICH-GCP', 'FDA 21 CFR Part 11'),
        'scoring_method', 'Weighted checklist with severity levels'
      )
    ),
    
    -- AGT-STATISTICAL-VALIDATOR: Statistical Validation Agent
    (
      'AGT-STATISTICAL-VALIDATOR',
      'Statistical Validation Agent',
      'AGT-STATISTICAL-VALIDATOR',
      'VALIDATOR',
      'langgraph',
      'Validates statistical analyses, assumptions, and interpretations for clinical studies',
      json_build_array(
        'Statistical method validation',
        'Assumption verification',
        'Results replication',
        'Interpretation review',
        'SAP compliance checking'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-4',
        'temperature', 0.1,
        'max_tokens', 2500
      ),
      ARRAY['biostatistics', 'validation', 'qa']::TEXT[],
      'active',
      jsonb_build_object(
        'validation_checks', json_build_array('Normality assumptions', 'Missing data handling', 'Multiplicity adjustments', 'Sensitivity analyses'),
        'software', json_build_array('R', 'SAS', 'Python'),
        'regulatory_standards', json_build_array('ICH E9', 'FDA Statistical Guidance')
      )
    ),
    
    -- AGT-DOCUMENT-VALIDATOR: Document Validation Agent
    (
      'AGT-DOCUMENT-VALIDATOR',
      'Document Validation Agent',
      'AGT-DOCUMENT-VALIDATOR',
      'VALIDATOR',
      'langgraph',
      'Validates document structure, formatting, citations, and compliance with templates',
      json_build_array(
        'Template compliance checking',
        'Citation verification',
        'Cross-reference validation',
        'Formatting consistency',
        'Version control verification'
      )::jsonb,
      'SUPERVISED',
      jsonb_build_object(
        'model', 'gpt-3.5-turbo',
        'temperature', 0.1,
        'max_tokens', 2000
      ),
      ARRAY['documentation', 'validation', 'qa']::TEXT[],
      'active',
      jsonb_build_object(
        'document_types', json_build_array('Protocol', 'CSR', 'Regulatory Submission', 'SOP'),
        'validation_rules', json_build_array('Mandatory sections', 'Citation format', 'Numbering consistency'),
        'output_format', 'Validation report with line-level issues'
      )
    )
) AS a_data(
  code, name, unique_id, agent_type, framework, description,
  capabilities, autonomy_level, model_config, tags, status, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  agent_type = EXCLUDED.agent_type,
  framework = EXCLUDED.framework,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  autonomy_level = EXCLUDED.autonomy_level,
  model_config = EXCLUDED.model_config,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Summary by agent type
SELECT 
  'Foundation Agents by Type' as status,
  agent_type,
  COUNT(*) as total_agents
FROM dh_agent
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'AGT-%'
GROUP BY agent_type
ORDER BY total_agents DESC;

-- Summary by domain
SELECT 
  'Foundation Agents by Domain' as status,
  jsonb_array_elements_text(metadata->'domains') as domain,
  COUNT(*) as agent_count
FROM dh_agent
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'AGT-%'
GROUP BY domain
ORDER BY agent_count DESC;

-- Overall summary
SELECT 
  'Foundation Agents Seeded' as status,
  jsonb_build_object(
    'total_agents', COUNT(*),
    'orchestrators', COUNT(*) FILTER (WHERE agent_type = 'ORCHESTRATOR'),
    'specialists', COUNT(*) FILTER (WHERE agent_type = 'SPECIALIST'),
    'validators', COUNT(*) FILTER (WHERE agent_type = 'VALIDATOR'),
    'retrievers', COUNT(*) FILTER (WHERE agent_type = 'RETRIEVER'),
    'synthesizers', COUNT(*) FILTER (WHERE agent_type = 'SYNTHESIZER'),
    'executors', COUNT(*) FILTER (WHERE agent_type = 'EXECUTOR')
  ) as summary
FROM dh_agent
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'AGT-%';

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================
-- Next Steps:
-- 1. Run use case specific seed files (e.g., 03_cd_005_pro_selection_tasks.sql)
-- 2. These foundation agents can be referenced by their code or unique_id
-- 3. Use case specific agents (like AGT-PSYCHOMETRIC) remain in their specific seeds
-- =====================================================================================

