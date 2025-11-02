-- =====================================================================================
-- 03_cd_005_pro_selection_tasks.sql
-- UC_CD_005: Patient-Reported Outcome (PRO) Instrument Selection - Complete Tasks
-- =====================================================================================
-- Purpose: Seed all tasks, agents, tools, prompts, and mappings for UC_CD_005
-- Dependencies: 
--   - 01_all_domains_and_usecases.sql (domains and use cases)
--   - 02_usecases_workflows.sql (workflows for CD domain)
-- Execution Order: 3 of N
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
-- SECTION 1: ROLES (AI AGENTS + HUMAN PERSONAS) FOR UC_CD_005
-- =====================================================================================

INSERT INTO dh_role (tenant_id, code, name, agent_type, description, metadata)
SELECT 
  sc.tenant_id,
  r_data.code,
  r_data.name,
  r_data.agent_type,
  r_data.description,
  r_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- =================================================================================
    -- AI AGENTS (AGT-*) - These actually execute tasks
    -- =================================================================================
    
    -- AGT-CLINICAL-CONSTRUCT: Clinical Construct Definition Agent
    (
      'AGT-CLINICAL-CONSTRUCT',
      'Clinical Construct Definition Agent',
      'AI_AGENT',
      'AI agent specialized in defining clinical constructs for PRO selection, translating DTx mechanisms into measurable outcomes',
      jsonb_build_object(
        'agent_category', 'CLINICAL_ANALYSIS',
        'capabilities', json_build_array(
          'Clinical construct identification',
          'Domain decomposition',
          'Clinical meaningfulness assessment',
          'Mechanism-to-outcome mapping'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'specialized_training', json_build_array(
          'FDA PRO Guidance',
          'Clinical endpoint methodology',
          'Patient-centered outcomes'
        ),
        'knowledge_domains', json_build_array('clinical-development', 'pro-methodology', 'endpoint-selection'),
        'typical_use_cases', json_build_array('Construct definition', 'Domain identification', 'COA type selection')
      )
    ),
    
    -- AGT-LITERATURE-SEARCH: PRO Literature Search Agent
    (
      'AGT-LITERATURE-SEARCH',
      'PRO Literature Search Agent',
      'AI_AGENT',
      'AI agent specialized in systematic literature search for validated PRO instruments',
      jsonb_build_object(
        'agent_category', 'RESEARCH',
        'capabilities', json_build_array(
          'Literature database querying',
          'PRO instrument identification',
          'Validation study extraction',
          'Comparative analysis'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'data_sources', json_build_array('PubMed', 'PROQOLID', 'ePROVIDE', 'Cochrane'),
        'knowledge_domains', json_build_array('literature-search', 'pro-instruments', 'psychometrics'),
        'search_strategies', json_build_array('Boolean search', 'MeSH terms', 'Systematic review methodology')
      )
    ),
    
    -- AGT-PSYCHOMETRIC: Psychometric Evaluation Agent
    (
      'AGT-PSYCHOMETRIC',
      'Psychometric Evaluation Agent',
      'AI_AGENT',
      'AI agent specialized in evaluating psychometric properties of PRO instruments (reliability, validity, responsiveness)',
      jsonb_build_object(
        'agent_category', 'STATISTICAL_ANALYSIS',
        'capabilities', json_build_array(
          'Reliability assessment (Cronbach alpha, ICC)',
          'Validity evaluation (content, construct, criterion)',
          'Responsiveness analysis (MCID, effect sizes)',
          'Floor/ceiling effects detection'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'statistical_methods', json_build_array(
          'Internal consistency',
          'Factor analysis',
          'Known-groups validity',
          'Anchor-based MCID'
        ),
        'knowledge_domains', json_build_array('psychometrics', 'biostatistics', 'measurement-theory'),
        'quality_thresholds', jsonb_build_object(
          'cronbach_alpha', 0.80,
          'test_retest_icc', 0.70,
          'floor_ceiling_max', 0.15
        )
      )
    ),
    
    -- AGT-REGULATORY: FDA Regulatory Compliance Agent
    (
      'AGT-REGULATORY',
      'FDA Regulatory Compliance Agent',
      'AI_AGENT',
      'AI agent specialized in assessing FDA regulatory compliance for PRO instruments',
      jsonb_build_object(
        'agent_category', 'COMPLIANCE',
        'capabilities', json_build_array(
          'FDA guidance interpretation',
          'Regulatory precedent analysis',
          'ePRO validation assessment',
          'Qualification program review'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'regulatory_frameworks', json_build_array(
          'FDA PRO Guidance 2009',
          'FDA Digital Health',
          'FDA DDT Qualification',
          '21 CFR Part 11'
        ),
        'knowledge_domains', json_build_array('regulatory-affairs', 'fda-guidance', 'pro-validation'),
        'precedent_databases', json_build_array('FDA.gov', 'Drugs@FDA', 'Device Approvals')
      )
    ),
    
    -- AGT-DIGITAL-FEASIBILITY: Digital Feasibility Agent
    (
      'AGT-DIGITAL-FEASIBILITY',
      'Digital Feasibility Agent',
      'AI_AGENT',
      'AI agent specialized in assessing digital implementation feasibility for ePRO instruments',
      jsonb_build_object(
        'agent_category', 'TECHNICAL_ASSESSMENT',
        'capabilities', json_build_array(
          'UI/UX feasibility assessment',
          'Platform compatibility analysis',
          'ePRO validation requirements',
          'Data capture design'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-sonnet'),
        'technical_domains', json_build_array(
          'Mobile app development',
          'ePRO implementation',
          'Accessibility standards',
          'Data security'
        ),
        'knowledge_domains', json_build_array('product-development', 'ux-design', 'digital-health'),
        'standards', json_build_array('WCAG 2.1 AA', '21 CFR Part 11', 'HIPAA')
      )
    ),
    
    -- AGT-PATIENT-BURDEN: Patient Burden Assessment Agent
    (
      'AGT-PATIENT-BURDEN',
      'Patient Burden Assessment Agent',
      'AI_AGENT',
      'AI agent specialized in evaluating patient burden and acceptability of PRO instruments',
      jsonb_build_object(
        'agent_category', 'PATIENT_EXPERIENCE',
        'capabilities', json_build_array(
          'Time burden calculation',
          'Cognitive burden assessment',
          'Accessibility evaluation',
          'Patient preference analysis'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'assessment_dimensions', json_build_array(
          'Time burden',
          'Cognitive complexity',
          'Emotional burden',
          'Technology burden',
          'Cultural appropriateness'
        ),
        'knowledge_domains', json_build_array('patient-engagement', 'patient-experience', 'accessibility'),
        'burden_thresholds', jsonb_build_object(
          'max_time_minutes', 10,
          'max_reading_level', 8,
          'dropout_risk_threshold', 0.25
        )
      )
    ),
    
    -- AGT-PRO-SYNTHESIS: PRO Selection Synthesis Agent
    (
      'AGT-PRO-SYNTHESIS',
      'PRO Selection Synthesis Agent',
      'AI_AGENT',
      'AI agent specialized in synthesizing all analyses to recommend final PRO selection',
      jsonb_build_object(
        'agent_category', 'DECISION_SUPPORT',
        'capabilities', json_build_array(
          'Multi-criteria decision analysis',
          'Trade-off evaluation',
          'Risk assessment',
          'Justification document generation'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'decision_criteria', json_build_array(
          'Psychometric quality (25%)',
          'FDA acceptability (25%)',
          'Digital feasibility (20%)',
          'Patient burden (20%)',
          'Cost (10%)'
        ),
        'knowledge_domains', json_build_array('clinical-development', 'decision-analysis', 'pro-selection'),
        'output_formats', json_build_array('Decision matrix', 'Executive summary', 'Risk analysis')
      )
    ),
    
    -- AGT-LICENSING: PRO Licensing Strategy Agent
    (
      'AGT-LICENSING',
      'PRO Licensing Strategy Agent',
      'AI_AGENT',
      'AI agent specialized in PRO licensing strategy and intellectual property considerations',
      jsonb_build_object(
        'agent_category', 'LEGAL_COMPLIANCE',
        'capabilities', json_build_array(
          'License requirement identification',
          'Usage rights assessment',
          'Cost estimation',
          'Contract negotiation support'
        ),
        'primary_models', json_build_array('gpt-4', 'claude-3-opus'),
        'licensing_aspects', json_build_array(
          'Ownership identification',
          'Usage rights',
          'Translation permissions',
          'ePRO adaptation rights',
          'Publication rights'
        ),
        'knowledge_domains', json_build_array('intellectual-property', 'licensing', 'regulatory-affairs'),
        'cost_models', json_build_array('Per-use fees', 'Flat fees', 'Perpetual license')
      )
    ),
    
    -- =================================================================================
    -- HUMAN PERSONAS (P*) - These supervise and make final decisions
    -- =================================================================================
    
    -- P01_CMO: Chief Medical Officer
    (
      'P01_CMO',
      'Chief Medical Officer',
      'HUMAN_EXPERT',
      'Chief Medical Officer responsible for clinical construct definition and final PRO selection decision',
      jsonb_build_object(
        'persona_type', 'LEADERSHIP',
        'expertise', json_build_array('Clinical Strategy', 'Endpoint Selection', 'Regulatory', 'Medical Affairs'),
        'experience_years', '15+',
        'decision_authority', 'HIGH',
        'typical_tasks', json_build_array('Clinical Construct Definition', 'Final Selection Decision', 'Strategic Clinical Decisions'),
        'knowledge_domains', json_build_array('clinical-development', 'regulatory-affairs', 'medical-affairs')
      )
    ),
    -- P02_VPCLIN: VP Clinical Development
    (
      'P02_VPCLIN',
      'VP Clinical Development',
      'HUMAN_EXPERT',
      'VP Clinical Development responsible for literature search and PRO identification',
      jsonb_build_object(
        'persona_type', 'LEADERSHIP',
        'expertise', json_build_array('Clinical Research', 'Literature Review', 'PRO Methodology', 'Trial Design'),
        'experience_years', '12-15',
        'decision_authority', 'MEDIUM-HIGH',
        'typical_tasks', json_build_array('Literature Search', 'PRO Analysis', 'Clinical Evidence Synthesis'),
        'knowledge_domains', json_build_array('clinical-development', 'clinical-research')
      )
    ),
    -- P04_BIOSTAT: Biostatistician
    (
      'P04_BIOSTAT',
      'Biostatistician',
      'HUMAN_EXPERT',
      'Biostatistician responsible for psychometric evaluation and statistical analysis',
      jsonb_build_object(
        'persona_type', 'TECHNICAL_EXPERT',
        'expertise', json_build_array('Psychometrics', 'Statistical Analysis', 'Reliability', 'Validity', 'MCID'),
        'experience_years', '8-12',
        'decision_authority', 'MEDIUM',
        'typical_tasks', json_build_array('Psychometric Evaluation', 'Statistical Analysis', 'MCID Assessment'),
        'knowledge_domains', json_build_array('biostatistics', 'psychometrics', 'clinical-development')
      )
    ),
    -- P05_REGDIR: Regulatory Director
    (
      'P05_REGDIR',
      'Regulatory Affairs Director',
      'HUMAN_EXPERT',
      'Regulatory Director responsible for FDA compliance assessment and licensing strategy',
      jsonb_build_object(
        'persona_type', 'COMPLIANCE_EXPERT',
        'expertise', json_build_array('FDA Regulations', 'PRO Guidance', 'ePRO Validation', 'Licensing', 'IP'),
        'experience_years', '10-15',
        'decision_authority', 'HIGH',
        'typical_tasks', json_build_array('FDA Compliance Assessment', 'Licensing Strategy', 'Regulatory Submissions'),
        'knowledge_domains', json_build_array('regulatory-affairs', 'fda-guidance', 'compliance')
      )
    ),
    -- P06_VPPRODUCT: VP Product
    (
      'P06_VPPRODUCT',
      'VP Product',
      'HUMAN_EXPERT',
      'VP Product responsible for digital feasibility assessment',
      jsonb_build_object(
        'persona_type', 'LEADERSHIP',
        'expertise', json_build_array('Product Management', 'UX Design', 'ePRO Implementation', 'Digital Platforms'),
        'experience_years', '10-12',
        'decision_authority', 'MEDIUM-HIGH',
        'typical_tasks', json_build_array('Digital Feasibility Assessment', 'UX Design', 'Product Requirements'),
        'knowledge_domains', json_build_array('product-development', 'ux-design', 'digital-health')
      )
    ),
    -- P07_CTO: Chief Technology Officer
    (
      'P07_CTO',
      'Chief Technology Officer',
      'HUMAN_EXPERT',
      'CTO responsible for technical implementation assessment',
      jsonb_build_object(
        'persona_type', 'LEADERSHIP',
        'expertise', json_build_array('Software Architecture', 'API Integration', 'Data Security', 'HIPAA'),
        'experience_years', '15+',
        'decision_authority', 'HIGH',
        'typical_tasks', json_build_array('Technical Implementation Assessment', 'Architecture Design', 'Security'),
        'knowledge_domains', json_build_array('technical-architecture', 'data-security', 'digital-health')
      )
    ),
    -- P10_PATADV: Patient Advocate
    (
      'P10_PATADV',
      'Patient Advocate',
      'HUMAN_EXPERT',
      'Patient Advocate responsible for patient burden assessment and preference integration',
      jsonb_build_object(
        'persona_type', 'STAKEHOLDER',
        'expertise', json_build_array('Patient Experience', 'Patient Preferences', 'Accessibility', 'Advocacy'),
        'experience_years', '5-10',
        'decision_authority', 'MEDIUM',
        'typical_tasks', json_build_array('Patient Burden Assessment', 'Patient Preference Integration', 'Accessibility Review'),
        'knowledge_domains', json_build_array('patient-engagement', 'patient-advocacy', 'accessibility')
      )
    )
) AS r_data(code, name, agent_type, description, metadata)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  agent_type = EXCLUDED.agent_type,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: TOOLS FOR UC_CD_005
-- =====================================================================================

INSERT INTO dh_tool (tenant_id, code, name, category, vendor, description, metadata)
SELECT 
  sc.tenant_id,
  t_data.code,
  t_data.name,
  t_data.category,
  t_data.vendor,
  t_data.description,
  t_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Literature Search Tools
    (
      'TOOL_PUBMED',
      'PubMed/MEDLINE',
      'RESEARCH_DATABASE',
      'NIH/NLM',
      'Medical literature database for PRO instrument research',
      jsonb_build_object(
        'url', 'https://pubmed.ncbi.nlm.nih.gov',
        'access_type', 'PUBLIC',
        'search_capabilities', json_build_array('Boolean', 'MeSH Terms', 'Filters'),
        'typical_use', 'Literature search for validated PRO instruments'
      )
    ),
    (
      'TOOL_PROQOLID',
      'PROQOLID',
      'PRO_DATABASE',
      'Mapi Research Trust',
      'Patient-Reported Outcomes and Quality of Life Instruments Database',
      jsonb_build_object(
        'url', 'https://eprovide.mapi-trust.org/instruments',
        'access_type', 'SUBSCRIPTION',
        'content', 'Validated PRO instruments with psychometric properties',
        'typical_use', 'PRO instrument identification and evaluation'
      )
    ),
    (
      'TOOL_EPROVIDE',
      'ePROVIDE',
      'PRO_DATABASE',
      'Mapi Research Trust',
      'Electronic PRO library with licensing information',
      jsonb_build_object(
        'url', 'https://eprovide.mapi-trust.org',
        'access_type', 'SUBSCRIPTION',
        'features', json_build_array('ePRO Validation Status', 'Licensing Info', 'Translations'),
        'typical_use', 'ePRO validation assessment'
      )
    ),
    (
      'TOOL_COCHRANE',
      'Cochrane Library',
      'RESEARCH_DATABASE',
      'Cochrane',
      'Systematic reviews and clinical trial database',
      jsonb_build_object(
        'url', 'https://www.cochranelibrary.com',
        'access_type', 'SUBSCRIPTION',
        'content', 'High-quality systematic reviews',
        'typical_use', 'Evidence synthesis for PRO validation'
      )
    ),
    -- Statistical Analysis Tools
    (
      'TOOL_SAS',
      'SAS',
      'STATISTICAL_SOFTWARE',
      'SAS Institute',
      'Statistical analysis software for psychometric evaluation',
      jsonb_build_object(
        'capabilities', json_build_array('Cronbach Alpha', 'Factor Analysis', 'ICC', 'Validity Tests'),
        'typical_use', 'Psychometric properties analysis'
      )
    ),
    (
      'TOOL_R',
      'R Statistical Software',
      'STATISTICAL_SOFTWARE',
      'R Foundation',
      'Open-source statistical software with psychometric packages',
      jsonb_build_object(
        'packages', json_build_array('psych', 'ltm', 'CTT', 'irtoys'),
        'access_type', 'OPEN_SOURCE',
        'typical_use', 'Psychometric analysis, reliability, validity'
      )
    ),
    -- Regulatory Tools
    (
      'TOOL_FDA_GOV',
      'FDA.gov',
      'REGULATORY_DATABASE',
      'FDA',
      'FDA website for regulatory precedent research',
      jsonb_build_object(
        'url', 'https://www.fda.gov',
        'search_areas', json_build_array('Drug Approvals', 'Device Clearances', 'Guidance Documents'),
        'typical_use', 'FDA precedent analysis for PRO acceptance'
      )
    ),
    (
      'TOOL_DRUGS_FDA',
      'Drugs@FDA',
      'REGULATORY_DATABASE',
      'FDA',
      'FDA drug approvals database',
      jsonb_build_object(
        'url', 'https://www.accessdata.fda.gov/scripts/cder/daf/',
        'content', 'Approval letters, labels, reviews',
        'typical_use', 'PRO endpoint precedent research'
      )
    ),
    -- Digital Implementation Tools
    (
      'TOOL_FIGMA',
      'Figma',
      'DESIGN_TOOL',
      'Figma Inc.',
      'UI/UX design tool for ePRO prototyping',
      jsonb_build_object(
        'url', 'https://www.figma.com',
        'capabilities', json_build_array('Prototyping', 'Collaboration', 'Mobile Design'),
        'typical_use', 'ePRO UI/UX design'
      )
    ),
    (
      'TOOL_REDCAP',
      'REDCap',
      'EDC_SYSTEM',
      'Vanderbilt University',
      'Electronic data capture system with ePRO capabilities',
      jsonb_build_object(
        'capabilities', json_build_array('ePRO', 'Mobile App', 'Validation', 'Compliance'),
        'typical_use', 'ePRO implementation and data collection'
      )
    ),
    -- Document Collaboration
    (
      'TOOL_GOOGLE_DOCS',
      'Google Docs',
      'COLLABORATION',
      'Google',
      'Collaborative document editing for PRO selection documentation',
      jsonb_build_object(
        'capabilities', json_build_array('Real-time Collaboration', 'Version Control', 'Comments'),
        'typical_use', 'PRO selection justification document'
      )
    ),
    (
      'TOOL_EXCEL',
      'Microsoft Excel',
      'ANALYSIS_TOOL',
      'Microsoft',
      'Spreadsheet tool for PRO comparison tables',
      jsonb_build_object(
        'capabilities', json_build_array('Tables', 'Charts', 'Analysis'),
        'typical_use', 'PRO psychometric comparison tables'
      )
    )
) AS t_data(code, name, category, vendor, description, metadata)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  vendor = EXCLUDED.vendor,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: RAG SOURCES FOR UC_CD_005
-- =====================================================================================

INSERT INTO dh_rag_source (tenant_id, code, name, source_type, url, description, unique_id, metadata)
SELECT 
  sc.tenant_id,
  rag_data.code,
  rag_data.name,
  rag_data.source_type,
  rag_data.url,
  rag_data.description,
  rag_data.unique_id,
  rag_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- FDA Guidance Documents
    (
      'RAG_FDA_PRO_2009',
      'FDA PRO Guidance (2009)',
      'REGULATORY_GUIDANCE',
      'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/patient-reported-outcome-measures-use-medical-product-development-support-labeling-claims',
      'FDA guidance on PRO measures for medical product development',
      'RAG-FDA-PRO-2009',
      jsonb_build_object(
        'document_type', 'FDA_GUIDANCE',
        'year', 2009,
        'key_topics', json_build_array('PRO Development', 'Validation', 'Content Validity', 'Psychometric Properties'),
        'authority', 'FDA CDER/CBER',
        'version', 'Final',
        'citation', 'FDA. (2009). Guidance for industry: Patient-reported outcome measures.'
      )
    ),
    (
      'RAG_FDA_DIGITAL_HEALTH',
      'FDA Digital Health Guidance',
      'REGULATORY_GUIDANCE',
      'https://www.fda.gov/medical-devices/digital-health-center-excellence',
      'FDA digital health guidance including ePRO considerations',
      'RAG-FDA-DH-2020',
      jsonb_build_object(
        'document_type', 'FDA_GUIDANCE',
        'topics', json_build_array('Digital Health', 'ePRO', 'Mobile Apps'),
        'authority', 'FDA CDRH'
      )
    ),
    -- Psychometric Standards
    (
      'RAG_COSMIN',
      'COSMIN Checklist',
      'METHODOLOGY',
      'https://www.cosmin.nl',
      'COnsensus-based Standards for the selection of health Measurement INstruments',
      'RAG-COSMIN',
      jsonb_build_object(
        'document_type', 'METHODOLOGY',
        'purpose', 'PRO quality assessment',
        'key_criteria', json_build_array('Reliability', 'Validity', 'Responsiveness', 'Interpretability')
      )
    ),
    -- Clinical Trial Databases
    (
      'RAG_CLINICALTRIALS_GOV',
      'ClinicalTrials.gov',
      'RESEARCH_DATABASE',
      'https://clinicaltrials.gov',
      'Clinical trial registry for PRO endpoint precedent research',
      'RAG-CT-GOV',
      jsonb_build_object(
        'search_use', 'PRO endpoint analysis',
        'data_available', json_build_array('Primary Endpoints', 'Secondary Endpoints', 'Outcome Measures')
      )
    ),
    -- PRO Knowledge Bases
    (
      'RAG_PROMIS',
      'PROMIS (Patient-Reported Outcomes Measurement Information System)',
      'PRO_FRAMEWORK',
      'https://www.healthmeasures.net/explore-measurement-systems/promis',
      'NIH-funded PRO measurement system with item banks',
      'RAG-PROMIS',
      jsonb_build_object(
        'sponsor', 'NIH',
        'content', json_build_array('Item Banks', 'CAT', 'Short Forms'),
        'validation_status', 'Extensive',
        'use_cases', json_build_array('Clinical Trials', 'Clinical Practice', 'Research')
      )
    ),
    -- Academic Literature
    (
      'RAG_PRO_LITERATURE',
      'PRO Validation Literature',
      'ACADEMIC_LITERATURE',
      NULL,
      'Curated collection of PRO validation studies and psychometric papers',
      'RAG-PRO-LIT',
      jsonb_build_object(
        'sources', json_build_array('PubMed', 'Scopus', 'Web of Science'),
        'key_journals', json_build_array('Quality of Life Research', 'Value in Health', 'Health and Quality of Life Outcomes'),
        'search_strategy', 'Systematic literature review methodology'
      )
    )
) AS rag_data(code, name, source_type, url, description, unique_id, metadata)
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  source_type = EXCLUDED.source_type,
  url = EXCLUDED.url,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: TASKS FOR UC_CD_005 WORKFLOWS
-- =====================================================================================

-- Note: We'll create tasks for the first workflow (WFL-CD-005-001: Define Clinical Construct)
-- as a complete example. Additional workflows would follow same pattern.

-- Get workflow ID for "Clinical Construct Definition"
DO $$
DECLARE
  v_workflow_id UUID;
  v_use_case_id UUID;
BEGIN
  -- Get use case ID for UC_CD_005
  SELECT uc.id INTO v_use_case_id
  FROM dh_use_case uc
  JOIN dh_domain d ON uc.domain_id = d.id
  WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
    AND d.code = 'CD'
    AND uc.code = 'UC_CD_005';
    
  IF v_use_case_id IS NULL THEN
    RAISE EXCEPTION 'Use case UC_CD_005 not found';
  END IF;
  
  -- Get or create workflow for Clinical Construct Definition
  -- This would typically be created in 02_usecases_workflows.sql
  -- For now, we'll check if it exists
  SELECT id INTO v_workflow_id
  FROM dh_workflow
  WHERE use_case_id = v_use_case_id
    AND position = 1;
    
  IF v_workflow_id IS NULL THEN
    RAISE NOTICE 'Workflow not found - will be created by tasks';
  ELSE
    RAISE NOTICE 'Found workflow: %', v_workflow_id;
  END IF;
END $$;

-- Insert Tasks for Workflow 1: Clinical Construct Definition
INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  title,
  objective,
  position,
  complexity,
  estimated_duration_minutes,
  unique_id,
  extra,
  metadata
)
SELECT 
  sc.tenant_id,
  w.id as workflow_id,
  task_data.code,
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.complexity,
  task_data.estimated_duration_minutes,
  task_data.unique_id,
  task_data.extra,
  task_data.metadata
FROM session_config sc
CROSS JOIN dh_workflow w
CROSS JOIN dh_use_case uc
CROSS JOIN dh_domain d
CROSS JOIN (
  VALUES
    -- TASK 1: Define Primary Clinical Construct
    (
      'TSK_CD_005_001_01',
      'Define Primary Clinical Construct',
      'Clearly define the primary clinical construct that needs to be measured by the PRO instrument, including what specific symptom, function, or outcome is being targeted and why it is clinically meaningful.',
      1,
      'Basic'::dh_complexity_level,
      15,
      'TSK-CD-005-001-01',
      jsonb_build_object(
        'rag_domains', json_build_array('clinical-development', 'pro-methodology')
      ),
      jsonb_build_object(
        'input_requirements', json_build_array(
          'DTx product description',
          'Target indication',
          'Mechanism of action',
          'Patient population'
        ),
        'output_artifacts', json_build_array(
          'Clinical construct definition statement',
          'Rationale for construct selection'
        ),
        'decision_points', json_build_array(
          'Is this construct patient-reported vs clinician-observed?',
          'Does this align with DTx mechanism of action?'
        ),
        'quality_criteria', json_build_array(
          'Construct is specific and measurable',
          'Clinically meaningful to patients',
          'Aligned with regulatory expectations'
        )
      )
    ),
    -- TASK 2: Identify Construct Domains and Sub-Facets
    (
      'TSK_CD_005_001_02',
      'Identify Construct Domains',
      'Break down the primary construct into 3-5 key domains or sub-facets that comprehensively cover the clinical construct.',
      2,
      'Intermediate'::dh_complexity_level,
      20,
      'TSK-CD-005-001-02',
      jsonb_build_object(
        'rag_domains', json_build_array('clinical-development', 'clinical-science')
      ),
      jsonb_build_object(
        'input_requirements', json_build_array(
          'Clinical construct definition from Task 1',
          'Disease pathophysiology understanding',
          'Patient experience research'
        ),
        'output_artifacts', json_build_array(
          'List of 3-5 construct domains',
          'Description of each domain',
          'Importance rating of each domain'
        ),
        'examples', json_build_object(
          'depression', json_build_array('Mood', 'Anhedonia', 'Sleep', 'Energy', 'Concentration'),
          'pain', json_build_array('Intensity', 'Interference', 'Quality', 'Duration')
        )
      )
    ),
    -- TASK 3: Determine PRO vs Other COA Types
    (
      'TSK_CD_005_001_03',
      'Determine PRO vs Other COA Types',
      'Decide whether this construct should be measured via Patient-Reported Outcome (PRO), Clinician-Reported Outcome (ClinRO), Observer-Reported Outcome (ObsRO), or Performance Outcome (PerfO), with clear rationale.',
      3,
      'Intermediate'::dh_complexity_level,
      15,
      'TSK-CD-005-001-03',
      jsonb_build_object(
        'rag_domains', json_build_array('regulatory-affairs', 'fda-guidance', 'pro-methodology')
      ),
      jsonb_build_object(
        'input_requirements', json_build_array(
          'Construct domains from Task 2',
          'FDA COA guidance',
          'Nature of symptoms (subjective vs objective)'
        ),
        'output_artifacts', json_build_array(
          'COA type selection (PRO/ClinRO/ObsRO/PerfO)',
          'Justification for selection'
        ),
        'decision_criteria', json_build_object(
          'PRO', 'Subjective symptoms known only to patient',
          'ClinRO', 'Observable signs requiring clinical judgment',
          'ObsRO', 'Behaviors observable by caregivers',
          'PerfO', 'Objective task performance'
        ),
        'fda_validation_implications', 'PRO requires highest content validity scrutiny'
      )
    ),
    -- TASK 4: Define Temporal Characteristics
    (
      'TSK_CD_005_001_04',
      'Define Temporal Characteristics',
      'Specify the appropriate recall period (right now, past 7 days, past 30 days) and assessment frequency (daily, weekly, monthly) for the PRO, with rationale.',
      4,
      'Intermediate'::dh_complexity_level,
      10,
      'TSK-CD-005-001-04',
      jsonb_build_object(
        'rag_domains', json_build_array('clinical-development', 'trial-design')
      ),
      jsonb_build_object(
        'input_requirements', json_build_array(
          'Construct definition',
          'Treatment duration',
          'Expected speed of effect'
        ),
        'output_artifacts', json_build_array(
          'Recall period recommendation',
          'Assessment frequency recommendation',
          'Rationale for timing choices'
        ),
        'recall_period_tradeoffs', jsonb_build_object(
          'right_now', jsonb_build_object('pros', 'Most accurate', 'cons', 'Snapshot bias'),
          '7_days', jsonb_build_object('pros', 'Balance recency and representativeness', 'cons', 'Some recall bias'),
          '30_days', jsonb_build_object('pros', 'Comprehensive', 'cons', 'Significant recall bias')
        )
      )
    ),
    -- TASK 5: Specify Contextual Factors
    (
      'TSK_CD_005_001_05',
      'Specify Contextual Factors',
      'Define relevant contextual factors such as disease severity level, age range, and comorbidity considerations that may affect PRO selection.',
      5,
      'Basic'::dh_complexity_level,
      10,
      'TSK-CD-005-001-05',
      jsonb_build_object(
        'rag_domains', json_build_array('clinical-development')
      ),
      jsonb_build_object(
        'input_requirements', json_build_array(
          'Target patient population',
          'Inclusion/exclusion criteria',
          'Disease characteristics'
        ),
        'output_artifacts', json_build_array(
          'Contextual factors specification',
          'Impact assessment on PRO selection'
        ),
        'contextual_factors_checklist', json_build_array(
          'Disease severity (mild/moderate/severe)',
          'Age range (pediatric/adult/geriatric)',
          'Comorbidity profile',
          'Prior treatment history'
        )
      )
    ),
    -- TASK 6: Document Measurement Requirements
    (
      'TSK_CD_005_001_06',
      'Document Measurement Requirements',
      'Compile all elements into a comprehensive measurement requirements statement that will guide PRO instrument selection.',
      6,
      'Intermediate'::dh_complexity_level,
      20,
      'TSK-CD-005-001-06',
      jsonb_build_object(
        'rag_domains', json_build_array('clinical-development', 'documentation')
      ),
      jsonb_build_object(
        'input_requirements', json_build_array(
          'All outputs from Tasks 1-5',
          'DTx product profile'
        ),
        'output_artifacts', json_build_array(
          'Clinical Construct Definition Document (1-2 pages)',
          'Measurement requirements statement',
          'Success criteria for PRO selection'
        ),
        'template_sections', json_build_array(
          'Primary Clinical Construct',
          'Construct Domains (3-5)',
          'COA Type Justification',
          'Temporal Characteristics',
          'Contextual Factors',
          'Measurement Requirement Statement',
          'Key Properties Required (reliability, validity, MCID, FDA acceptance, time burden)'
        ),
        'quality_gates', json_build_array(
          'Construct is specific and measurable',
          'Aligns with DTx mechanism of action',
          'Feasible to assess in trial timeframe',
          'Clinically meaningful to patients'
        )
      )
    )
) AS task_data(code, title, objective, position, complexity, estimated_duration_minutes, unique_id, extra, metadata)
WHERE d.tenant_id = sc.tenant_id
  AND d.code = 'CD'
  AND uc.domain_id = d.id
  AND uc.code = 'UC_CD_005'
  AND w.use_case_id = uc.id
  AND w.position = 1  -- First workflow: Clinical Construct Definition
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  complexity = EXCLUDED.complexity,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
  extra = EXCLUDED.extra,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 5: TASK DEPENDENCIES
-- =====================================================================================

-- Create dependencies between tasks in Workflow 1
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT 
  sc.tenant_id,
  t_child.id as task_id,
  t_parent.id as depends_on_task_id,
  dep_data.dependency_type
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 2 depends on Task 1
    ('TSK-CD-005-001-02', 'TSK-CD-005-001-01', 'SEQUENTIAL'::dh_dependency_type),
    -- Task 3 depends on Task 2
    ('TSK-CD-005-001-03', 'TSK-CD-005-001-02', 'SEQUENTIAL'::dh_dependency_type),
    -- Task 4 depends on Task 1 (can work in parallel with Task 2-3)
    ('TSK-CD-005-001-04', 'TSK-CD-005-001-01', 'SEQUENTIAL'::dh_dependency_type),
    -- Task 5 depends on Task 1
    ('TSK-CD-005-001-05', 'TSK-CD-005-001-01', 'SEQUENTIAL'::dh_dependency_type),
    -- Task 6 depends on all previous tasks
    ('TSK-CD-005-001-06', 'TSK-CD-005-001-01', 'SEQUENTIAL'::dh_dependency_type),
    ('TSK-CD-005-001-06', 'TSK-CD-005-001-02', 'SEQUENTIAL'::dh_dependency_type),
    ('TSK-CD-005-001-06', 'TSK-CD-005-001-03', 'SEQUENTIAL'::dh_dependency_type),
    ('TSK-CD-005-001-06', 'TSK-CD-005-001-04', 'SEQUENTIAL'::dh_dependency_type),
    ('TSK-CD-005-001-06', 'TSK-CD-005-001-05', 'SEQUENTIAL'::dh_dependency_type)
) AS dep_data(child_unique_id, parent_unique_id, dependency_type)
JOIN dh_task t_child ON t_child.tenant_id = sc.tenant_id AND t_child.unique_id = dep_data.child_unique_id
JOIN dh_task t_parent ON t_parent.tenant_id = sc.tenant_id AND t_parent.unique_id = dep_data.parent_unique_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id)
DO NOTHING;

-- =====================================================================================
-- SECTION 6: TASK-AGENT ASSIGNMENTS (AI Agents Executing Tasks)
-- =====================================================================================

INSERT INTO dh_task_agent_assignment (
  tenant_id,
  task_id,
  agent_id,
  assignment_type,
  priority,
  required_capabilities,
  required_knowledge,
  expected_output_format,
  quality_thresholds,
  metadata
)
SELECT 
  sc.tenant_id,
  t.id as task_id,
  agent.id as agent_id,
  ta_data.assignment_type,
  ta_data.priority,
  ta_data.required_capabilities,
  ta_data.required_knowledge,
  ta_data.expected_output_format,
  ta_data.quality_thresholds,
  ta_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 1: Define Primary Clinical Construct -> AGT-CLINICAL-CONSTRUCT
    (
      'TSK-CD-005-001-01',
      'AGT-CLINICAL-CONSTRUCT',
      'PRIMARY',
      1,
      json_build_array(
        'Clinical construct identification',
        'Domain decomposition',
        'Clinical meaningfulness assessment'
      ),
      json_build_array('clinical-development', 'pro-methodology', 'endpoint-selection'),
      'Structured document with sections',
      jsonb_build_object(
        'completeness_score', 0.9,
        'clinical_relevance_score', 0.85,
        'regulatory_alignment_score', 0.8
      ),
      jsonb_build_object(
        'model_preference', 'gpt-4',
        'temperature', 0.3,
        'max_tokens', 2000,
        'requires_rag', true,
        'rag_sources', json_build_array('RAG-FDA-PRO-2009'),
        'validation_required', true,
        'human_review_required', true,
        'reviewer_role', 'P01_CMO'
      )
    ),
    
    -- Task 2: Identify Construct Domains -> AGT-CLINICAL-CONSTRUCT
    (
      'TSK-CD-005-001-02',
      'AGT-CLINICAL-CONSTRUCT',
      'PRIMARY',
      1,
      json_build_array(
        'Domain decomposition',
        'Clinical meaningfulness assessment'
      ),
      json_build_array('clinical-development', 'clinical-science'),
      'List with descriptions and importance ratings',
      jsonb_build_object(
        'domain_count_min', 3,
        'domain_count_max', 5,
        'description_completeness', 0.9
      ),
      jsonb_build_object(
        'model_preference', 'gpt-4',
        'temperature', 0.4,
        'requires_rag', false,
        'human_review_required', true,
        'reviewer_role', 'P01_CMO'
      )
    ),
    
    -- Task 3: Determine PRO vs Other COA Types -> AGT-REGULATORY
    (
      'TSK-CD-005-001-03',
      'AGT-REGULATORY',
      'PRIMARY',
      1,
      json_build_array(
        'FDA guidance interpretation',
        'COA type classification'
      ),
      json_build_array('regulatory-affairs', 'fda-guidance', 'pro-methodology'),
      'Decision with regulatory justification',
      jsonb_build_object(
        'regulatory_compliance_score', 0.95,
        'justification_quality', 0.9
      ),
      jsonb_build_object(
        'model_preference', 'gpt-4',
        'temperature', 0.2,
        'requires_rag', true,
        'rag_sources', json_build_array('RAG-FDA-PRO-2009'),
        'validation_required', true,
        'human_review_required', true,
        'reviewer_role', 'P05_REGDIR'
      )
    ),
    
    -- Task 4: Define Temporal Characteristics -> AGT-CLINICAL-CONSTRUCT
    (
      'TSK-CD-005-001-04',
      'AGT-CLINICAL-CONSTRUCT',
      'PRIMARY',
      1,
      json_build_array(
        'Clinical protocol design',
        'Temporal parameter selection'
      ),
      json_build_array('clinical-development', 'trial-design'),
      'Recommendations with rationale',
      jsonb_build_object(
        'rationale_quality', 0.85,
        'feasibility_score', 0.8
      ),
      jsonb_build_object(
        'model_preference', 'gpt-4',
        'temperature', 0.3,
        'human_review_required', true,
        'reviewer_role', 'P02_VPCLIN'
      )
    ),
    
    -- Task 5: Specify Contextual Factors -> AGT-CLINICAL-CONSTRUCT
    (
      'TSK-CD-005-001-05',
      'AGT-CLINICAL-CONSTRUCT',
      'PRIMARY',
      1,
      json_build_array(
        'Population characterization',
        'Context specification'
      ),
      json_build_array('clinical-development'),
      'Structured specification',
      jsonb_build_object(
        'completeness_score', 0.9
      ),
      jsonb_build_object(
        'model_preference', 'gpt-4',
        'temperature', 0.3,
        'human_review_required', true,
        'reviewer_role', 'P01_CMO'
      )
    ),
    
    -- Task 6: Document Measurement Requirements -> AGT-PRO-SYNTHESIS
    (
      'TSK-CD-005-001-06',
      'AGT-PRO-SYNTHESIS',
      'PRIMARY',
      1,
      json_build_array(
        'Document synthesis',
        'Quality criteria definition',
        'Template generation'
      ),
      json_build_array('clinical-development', 'documentation'),
      'Comprehensive measurement requirements document',
      jsonb_build_object(
        'completeness_score', 0.95,
        'document_quality', 0.9,
        'actionability_score', 0.85
      ),
      jsonb_build_object(
        'model_preference', 'gpt-4',
        'temperature', 0.3,
        'requires_rag', true,
        'rag_sources', json_build_array('RAG-FDA-PRO-2009'),
        'validation_required', true,
        'human_review_required', true,
        'reviewer_role', 'P02_VPCLIN'
      )
    )
) AS ta_data(
  task_unique_id, agent_code, assignment_type, priority,
  required_capabilities, required_knowledge, expected_output_format,
  quality_thresholds, metadata
)
JOIN dh_task t ON t.tenant_id = sc.tenant_id AND t.unique_id = ta_data.task_unique_id
JOIN dh_role agent ON agent.tenant_id = sc.tenant_id AND agent.code = ta_data.agent_code
ON CONFLICT (tenant_id, task_id, agent_id)
DO UPDATE SET
  assignment_type = EXCLUDED.assignment_type,
  priority = EXCLUDED.priority,
  required_capabilities = EXCLUDED.required_capabilities,
  required_knowledge = EXCLUDED.required_knowledge,
  expected_output_format = EXCLUDED.expected_output_format,
  quality_thresholds = EXCLUDED.quality_thresholds,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 7: TASK-ROLE ASSIGNMENTS (Human Supervisors/Reviewers)
-- =====================================================================================

INSERT INTO dh_task_role (tenant_id, task_id, role_id, responsibility, is_primary)
SELECT 
  sc.tenant_id,
  t.id as task_id,
  r.id as role_id,
  tr_data.responsibility,
  tr_data.is_primary
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 1: Define Primary Clinical Construct (P01_CMO as Lead)
    ('TSK-CD-005-001-01', 'P01_CMO', 'Lead', true),
    ('TSK-CD-005-001-01', 'P02_VPCLIN', 'Contributor', false),
    
    -- Task 2: Identify Construct Domains (P01_CMO as Lead)
    ('TSK-CD-005-001-02', 'P01_CMO', 'Lead', true),
    ('TSK-CD-005-001-02', 'P02_VPCLIN', 'Contributor', false),
    
    -- Task 3: Determine PRO vs Other COA Types (P05_REGDIR as Lead)
    ('TSK-CD-005-001-03', 'P05_REGDIR', 'Lead', true),
    ('TSK-CD-005-001-03', 'P01_CMO', 'Reviewer', false),
    
    -- Task 4: Define Temporal Characteristics (P02_VPCLIN as Lead)
    ('TSK-CD-005-001-04', 'P02_VPCLIN', 'Lead', true),
    ('TSK-CD-005-001-04', 'P04_BIOSTAT', 'Contributor', false),
    
    -- Task 5: Specify Contextual Factors (P01_CMO as Lead)
    ('TSK-CD-005-001-05', 'P01_CMO', 'Lead', true),
    
    -- Task 6: Document Measurement Requirements (P02_VPCLIN as Lead)
    ('TSK-CD-005-001-06', 'P02_VPCLIN', 'Lead', true),
    ('TSK-CD-005-001-06', 'P01_CMO', 'Reviewer', false)
) AS tr_data(task_unique_id, role_code, responsibility, is_primary)
JOIN dh_task t ON t.tenant_id = sc.tenant_id AND t.unique_id = tr_data.task_unique_id
JOIN dh_role r ON r.tenant_id = sc.tenant_id AND r.code = tr_data.role_code
ON CONFLICT (tenant_id, task_id, role_id)
DO UPDATE SET
  responsibility = EXCLUDED.responsibility,
  is_primary = EXCLUDED.is_primary,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 7: TASK-TOOL MAPPINGS
-- =====================================================================================

INSERT INTO dh_task_tool (tenant_id, task_id, tool_id, purpose, is_required)
SELECT 
  sc.tenant_id,
  t.id as task_id,
  tool.id as tool_id,
  tt_data.purpose,
  tt_data.is_required
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 1: Define Primary Clinical Construct
    ('TSK-CD-005-001-01', 'TOOL_GOOGLE_DOCS', 'Document clinical construct definition', true),
    
    -- Task 2: Identify Construct Domains
    ('TSK-CD-005-001-02', 'TOOL_GOOGLE_DOCS', 'Document construct domains', true),
    ('TSK-CD-005-001-02', 'TOOL_EXCEL', 'Create domain comparison table', false),
    
    -- Task 3: Determine PRO vs Other COA Types
    ('TSK-CD-005-001-03', 'TOOL_FDA_GOV', 'Research FDA COA guidance', true),
    ('TSK-CD-005-001-03', 'TOOL_GOOGLE_DOCS', 'Document COA type selection rationale', true),
    
    -- Task 4: Define Temporal Characteristics
    ('TSK-CD-005-001-04', 'TOOL_GOOGLE_DOCS', 'Document temporal recommendations', true),
    
    -- Task 5: Specify Contextual Factors
    ('TSK-CD-005-001-05', 'TOOL_GOOGLE_DOCS', 'Document contextual factors', true),
    
    -- Task 6: Document Measurement Requirements
    ('TSK-CD-005-001-06', 'TOOL_GOOGLE_DOCS', 'Compile final measurement requirements document', true),
    ('TSK-CD-005-001-06', 'TOOL_EXCEL', 'Create summary tables', false)
) AS tt_data(task_unique_id, tool_code, purpose, is_required)
JOIN dh_task t ON t.tenant_id = sc.tenant_id AND t.unique_id = tt_data.task_unique_id
JOIN dh_tool tool ON tool.tenant_id = sc.tenant_id AND tool.code = tt_data.tool_code
ON CONFLICT (tenant_id, task_id, tool_id)
DO UPDATE SET
  purpose = EXCLUDED.purpose,
  is_required = EXCLUDED.is_required,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 8: TASK-RAG MAPPINGS
-- =====================================================================================

INSERT INTO dh_task_rag (tenant_id, task_id, rag_source_id, sections, query_context, is_required, search_config)
SELECT 
  sc.tenant_id,
  t.id as task_id,
  rag.id as rag_source_id,
  tr_data.sections,
  tr_data.query_context,
  tr_data.is_required,
  tr_data.search_config
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 3: Determine PRO vs Other COA Types - needs FDA guidance
    (
      'TSK-CD-005-001-03',
      'RAG-FDA-PRO-2009',
      json_build_array('Section 3: COA Type Classification'),
      'COA type definitions and selection criteria for PRO vs ClinRO vs ObsRO vs PerfO',
      true,
      jsonb_build_object(
        'filters', jsonb_build_object('document_section', 'COA Types'),
        'max_results', 5,
        'relevance_threshold', 0.8
      )
    ),
    -- Task 6: Document Measurement Requirements - needs FDA PRO guidance
    (
      'TSK-CD-005-001-06',
      'RAG-FDA-PRO-2009',
      json_build_array('Section 4: PRO Instrument Requirements'),
      'FDA expectations for PRO instruments including reliability, validity, responsiveness, interpretability',
      true,
      jsonb_build_object(
        'filters', jsonb_build_object('document_section', 'Instrument Requirements'),
        'max_results', 10,
        'relevance_threshold', 0.7
      )
    )
) AS tr_data(task_unique_id, rag_unique_id, sections, query_context, is_required, search_config)
JOIN dh_task t ON t.tenant_id = sc.tenant_id AND t.unique_id = tr_data.task_unique_id
JOIN dh_rag_source rag ON rag.tenant_id = sc.tenant_id AND rag.unique_id = tr_data.rag_unique_id
ON CONFLICT (tenant_id, task_id, rag_source_id)
DO UPDATE SET
  sections = EXCLUDED.sections,
  query_context = EXCLUDED.query_context,
  is_required = EXCLUDED.is_required,
  search_config = EXCLUDED.search_config,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 9: PROMPTS FOR UC_CD_005 TASKS
-- =====================================================================================

INSERT INTO dh_prompt (
  tenant_id,
  pattern,
  system_prompt,
  user_template,
  prompt_identifier,
  version_label,
  task_id,
  temperature,
  max_tokens,
  metadata
)
SELECT 
  sc.tenant_id,
  p_data.pattern,
  p_data.system_prompt,
  p_data.user_template,
  p_data.prompt_identifier,
  p_data.version_label,
  t.id as task_id,
  p_data.temperature,
  p_data.max_tokens,
  p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Prompt for Task 1: Define Primary Clinical Construct
    (
      'CHAIN_OF_THOUGHT',
      'You are a Chief Medical Officer defining the clinical construct to be measured in a DTx trial.

You have deep expertise in:
- Clinical endpoint selection for digital therapeutics
- Translating mechanism of action into measurable outcomes
- FDA expectations for PRO instruments
- Patient-centered outcome assessment

Your approach:
1. Understand the DTx product and mechanism thoroughly
2. Identify the primary clinical benefit from patient perspective
3. Ensure construct is specific, measurable, and clinically meaningful
4. Align construct with regulatory expectations
5. Consider feasibility of measurement in clinical trial setting',
      'Product Context:
- DTx Product: {{dtx_product_name}}
- Indication: {{target_indication}}
- Mechanism of Action: {{moa_description}}
- Target Population: {{patient_demographics}}

Please define the clinical construct with precision:

1. **Primary Clinical Construct**
   - What specific symptom, function, or outcome are we trying to measure?
   - Why is this clinically meaningful to patients?
   - How does this relate to the DTx mechanism of action?

2. **Construct Domains**
   - What are the key sub-domains or facets of this construct?
   - List 3-5 domains with brief descriptions
   - Why are these domains important?

3. **Patient-Reported vs Clinician-Observed**
   - Should this be patient-reported (PRO)?
   - Or clinician-reported (ClinRO)?
   - Or observer-reported (ObsRO)?
   - Or performance-based (PerfO)?
   - Provide clear rationale for choice

4. **Clinical Meaningfulness**
   - Why does this construct matter to patients?
   - How does change in this construct affect patient wellbeing?
   - What magnitude of change would be clinically meaningful?

Output:
- Clinical construct definition document (1-2 paragraphs)
- Clear statement: "We need a {{COA_TYPE}} that measures {{CONSTRUCT}} in {{POPULATION}} over {{TIMEFRAME}}"',
      'PROMPT_CD_005_001_01',
      'v1.0',
      NULL, -- will be linked via task_unique_id
      0.3,
      2000,
      jsonb_build_object(
        'task_unique_id', 'TSK-CD-005-001-01',
        'model_recommendations', json_build_array('gpt-4', 'claude-3-opus'),
        'required_context', json_build_array('DTx product profile', 'Indication details', 'MOA'),
        'expected_output_format', 'Structured document with sections',
        'validation_criteria', json_build_array(
          'Construct is specific and measurable',
          'Rationale is clear and compelling',
          'Aligns with DTx mechanism',
          'Clinically meaningful to patients'
        )
      )
    )
) AS p_data(
  pattern, system_prompt, user_template, prompt_identifier, version_label,
  task_id_placeholder, temperature, max_tokens, metadata
)
LEFT JOIN dh_task t ON t.tenant_id = sc.tenant_id 
  AND t.unique_id = (p_data.metadata->>'task_unique_id')
ON CONFLICT (tenant_id, prompt_identifier, version_label)
DO UPDATE SET
  system_prompt = EXCLUDED.system_prompt,
  user_template = EXCLUDED.user_template,
  pattern = EXCLUDED.pattern,
  temperature = EXCLUDED.temperature,
  max_tokens = EXCLUDED.max_tokens,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Verify AI agents created
SELECT 
  'AI Agents Created' as status,
  COUNT(*) as total_agents
FROM dh_role
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND agent_type = 'AI_AGENT'
  AND code LIKE 'AGT-%';

-- Verify human personas created
SELECT 
  'Human Personas Created' as status,
  COUNT(*) as total_personas
FROM dh_role
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND agent_type = 'HUMAN_EXPERT'
  AND code LIKE 'P%';

-- List AI agents by category
SELECT 
  'AI Agents by Category' as status,
  metadata->>'agent_category' as category,
  COUNT(*) as count
FROM dh_role
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND agent_type = 'AI_AGENT'
GROUP BY metadata->>'agent_category'
ORDER BY count DESC;

-- Verify tools created
SELECT 
  'Tools Created' as status,
  COUNT(*) as total_tools
FROM dh_tool
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- Verify RAG sources created
SELECT 
  'RAG Sources Created' as status,
  COUNT(*) as total_rag_sources
FROM dh_rag_source
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- Verify tasks created for UC_CD_005
SELECT 
  'Tasks Created for UC_CD_005' as status,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT w.id) as workflows_with_tasks
FROM dh_task t
JOIN dh_workflow w ON t.workflow_id = w.id
JOIN dh_use_case uc ON w.use_case_id = uc.id
JOIN dh_domain d ON uc.domain_id = d.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
  AND uc.code = 'UC_CD_005';

-- Verify task dependencies
SELECT 
  'Task Dependencies' as status,
  COUNT(*) as total_dependencies
FROM dh_task_dependency td
JOIN dh_task t ON td.task_id = t.id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND t.unique_id LIKE 'TSK-CD-005-%';

-- Verify task-role assignments
SELECT 
  'Task-Role Assignments' as status,
  COUNT(*) as total_assignments,
  COUNT(*) FILTER (WHERE is_primary = true) as primary_assignments
FROM dh_task_role tr
JOIN dh_task t ON tr.task_id = t.id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND t.unique_id LIKE 'TSK-CD-005-%';

-- Verify task-tool mappings
SELECT 
  'Task-Tool Mappings' as status,
  COUNT(*) as total_mappings
FROM dh_task_tool tt
JOIN dh_task t ON tt.task_id = t.id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND t.unique_id LIKE 'TSK-CD-005-%';

-- Verify prompts created
SELECT 
  'Prompts Created' as status,
  COUNT(*) as total_prompts
FROM dh_prompt p
WHERE p.tenant_id = (SELECT tenant_id FROM session_config)
  AND p.prompt_identifier LIKE 'PROMPT_CD_005_%';

-- Verify task-agent assignments
SELECT 
  'Task-Agent Assignments' as status,
  COUNT(*) as total_assignments,
  COUNT(DISTINCT task_id) as tasks_with_agents,
  COUNT(DISTINCT agent_id) as agents_assigned
FROM dh_task_agent_assignment taa
JOIN dh_task t ON taa.task_id = t.id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND t.unique_id LIKE 'TSK-CD-005-%';

-- Show agent assignments by agent
SELECT 
  'Agent Assignment Distribution' as status,
  r.code as agent_code,
  r.name as agent_name,
  COUNT(DISTINCT taa.task_id) as tasks_assigned
FROM dh_task_agent_assignment taa
JOIN dh_task t ON taa.task_id = t.id
JOIN dh_role r ON taa.agent_id = r.id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND t.unique_id LIKE 'TSK-CD-005-%'
  AND r.agent_type = 'AI_AGENT'
GROUP BY r.code, r.name, r.id
ORDER BY tasks_assigned DESC;

-- Summary report
SELECT 
  'UC_CD_005 Seeding Complete' as status,
  jsonb_build_object(
    'ai_agents', (SELECT COUNT(*) FROM dh_role WHERE tenant_id = (SELECT tenant_id FROM session_config) AND agent_type = 'AI_AGENT' AND code LIKE 'AGT-%'),
    'human_personas', (SELECT COUNT(*) FROM dh_role WHERE tenant_id = (SELECT tenant_id FROM session_config) AND agent_type = 'HUMAN_EXPERT' AND code LIKE 'P%'),
    'tools', (SELECT COUNT(*) FROM dh_tool WHERE tenant_id = (SELECT tenant_id FROM session_config)),
    'rag_sources', (SELECT COUNT(*) FROM dh_rag_source WHERE tenant_id = (SELECT tenant_id FROM session_config)),
    'tasks', (SELECT COUNT(*) FROM dh_task t JOIN dh_workflow w ON t.workflow_id = w.id JOIN dh_use_case uc ON w.use_case_id = uc.id WHERE uc.code = 'UC_CD_005'),
    'dependencies', (SELECT COUNT(*) FROM dh_task_dependency td JOIN dh_task t ON td.task_id = t.id WHERE t.unique_id LIKE 'TSK-CD-005-%'),
    'agent_assignments', (SELECT COUNT(*) FROM dh_task_agent_assignment taa JOIN dh_task t ON taa.task_id = t.id WHERE t.unique_id LIKE 'TSK-CD-005-%'),
    'role_assignments', (SELECT COUNT(*) FROM dh_task_role tr JOIN dh_task t ON tr.task_id = t.id WHERE t.unique_id LIKE 'TSK-CD-005-%'),
    'tool_mappings', (SELECT COUNT(*) FROM dh_task_tool tt JOIN dh_task t ON tt.task_id = t.id WHERE t.unique_id LIKE 'TSK-CD-005-%'),
    'prompts', (SELECT COUNT(*) FROM dh_prompt WHERE prompt_identifier LIKE 'PROMPT_CD_005_%')
  ) as summary;

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================
-- Next Steps:
-- 1. Create similar seed files for remaining UC_CD_005 workflows (2-8)
-- 2. Create seed files for other use cases in CD domain
-- 3. Repeat pattern for RA, MA, PD, EG domains
-- =====================================================================================

