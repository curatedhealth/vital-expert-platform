-- =====================================================================================
-- 07_cd_002_biomarker_validation_part2.sql
-- UC-02: Digital Biomarker Validation - Assignments (Agents, Personas, Tools, RAG, KPIs, Dependencies)
-- =====================================================================================
-- Purpose: Seed task assignments for UC_CD_002
-- Dependencies:
--   - 07_cd_002_biomarker_validation.sql (workflows and tasks)
--   - Foundation tables: agents, personas, tools, RAG sources, KPIs
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: SESSION CONFIGURATION
-- =====================================================================================

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
-- SECTION 1: TASK DEPENDENCIES
-- =====================================================================================

INSERT INTO dh_task_dependency (
  tenant_id,
  task_id,
  depends_on_task_id,
  note
)
SELECT
  sc.tenant_id,
  t_curr.id as task_id,
  t_dep.id as depends_on_task_id,
  dep_data.note
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Phase 1 Dependencies
    ('TSK-CD-002-P1-02', 'TSK-CD-002-P1-01', 'Requires approved Intended Use Document'),
    ('TSK-CD-002-P1-03', 'TSK-CD-002-P1-02', 'Requires approved Verification Protocol'),
    
    -- Phase 2 Dependencies
    ('TSK-CD-002-P2-01', 'TSK-CD-002-P1-03', 'Requires V1 Verification to pass'),
    ('TSK-CD-002-P2-02', 'TSK-CD-002-P2-01', 'Requires approved Analytical Validation Protocol'),
    
    -- Phase 3 Dependencies
    ('TSK-CD-002-P3-01', 'TSK-CD-002-P2-02', 'Requires V2 Analytical Validation to pass'),
    ('TSK-CD-002-P3-02', 'TSK-CD-002-P3-01', 'Requires approved Clinical Validation Protocol'),
    ('TSK-CD-002-P3-03', 'TSK-CD-002-P3-02', 'Requires V3 Clinical Validation complete; only for primary endpoints'),
    ('TSK-CD-002-P3-04', 'TSK-CD-002-P3-02', 'Requires V3 Clinical Validation complete'),
    ('TSK-CD-002-P3-04', 'TSK-CD-002-P3-03', 'Incorporate FDA feedback into publication')
) AS dep_data(task_code, depends_on_code, note)
JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
JOIN dh_task t_dep ON t_dep.code = dep_data.depends_on_code AND t_dep.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id)
DO UPDATE SET
  note = EXCLUDED.note;

-- =====================================================================================
-- SECTION 2: TASK-AGENT ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_agent (
  tenant_id,
  task_id,
  agent_id,
  assignment_type,
  execution_order,
  requires_human_approval,
  approval_persona_code,
  metadata
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  a.id as agent_id,
  ta_data.assignment_type,
  ta_data.execution_order,
  ta_data.requires_human_approval,
  ta_data.approval_persona_code,
  ta_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 1: Define Intended Use & Context of Use
    ('TSK-CD-002-P1-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 'P06_PMDIG', 
     jsonb_build_object(
       'role', 'Regulatory endpoint classification and pathway analysis',
       'expected_output', 'Intended Use Statement draft with regulatory strategy'
     )),
    ('TSK-CD-002-P1-01', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, null,
     jsonb_build_object(
       'role', 'Search for precedent digital biomarkers and validation approaches',
       'expected_output', 'Literature summary on similar digital biomarkers'
     )),
    
    -- Task 2: Design Verification Study (V1)
    ('TSK-CD-002-P1-02', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 'P07_VPMA',
     jsonb_build_object(
       'role', 'Draft verification study protocol structure',
       'expected_output', 'Verification Protocol draft sections'
     )),
    ('TSK-CD-002-P1-02', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Sample size calculation and statistical analysis plan',
       'expected_output', 'ICC-based sample size calculation and SAP'
     )),
    
    -- Task 3: Execute Verification Study & Analysis
    ('TSK-CD-002-P1-03', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Conduct ICC, Bland-Altman, and reliability analyses',
       'expected_output', 'Statistical analysis results and interpretation'
     )),
    ('TSK-CD-002-P1-03', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, true, 'P11_MEDICAL_WRITER',
     jsonb_build_object(
       'role', 'Draft Verification Report',
       'expected_output', 'Verification Report (V1) draft'
     )),
    ('TSK-CD-002-P1-03', 'AGT-QUALITY-VALIDATOR', 'VALIDATOR', 3, true, 'P13_QA',
     jsonb_build_object(
       'role', 'Validate verification results meet success criteria',
       'expected_output', 'Quality validation report'
     )),
    
    -- Task 4: Design Analytical Validation Study (V2)
    ('TSK-CD-002-P2-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 'P08_HEOR',
     jsonb_build_object(
       'role', 'Draft analytical validation study protocol',
       'expected_output', 'Analytical Validation Protocol draft'
     )),
    ('TSK-CD-002-P2-01', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Psychometric validation SAP (factor analysis, validity, reliability)',
       'expected_output', 'Psychometric SAP with sample size justification'
     )),
    
    -- Task 5: Execute Analytical Validation
    ('TSK-CD-002-P2-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Conduct factor analysis, validity, and reliability analyses',
       'expected_output', 'Psychometric analysis results'
     )),
    ('TSK-CD-002-P2-02', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, true, 'P11_MEDICAL_WRITER',
     jsonb_build_object(
       'role', 'Draft Analytical Validation Report',
       'expected_output', 'Analytical Validation Report (V2) draft'
     )),
    ('TSK-CD-002-P2-02', 'AGT-STATISTICAL-VALIDATOR', 'VALIDATOR', 3, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Validate psychometric results meet DiMe V2 criteria',
       'expected_output', 'Statistical validation report'
     )),
    
    -- Task 6: Design Clinical Validation Study (V3)
    ('TSK-CD-002-P3-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 'P02_VPCLIN',
     jsonb_build_object(
       'role', 'Draft clinical validation study protocol',
       'expected_output', 'Clinical Validation Protocol draft'
     )),
    ('TSK-CD-002-P3-01', 'AGT-CLINICAL-ENDPOINT', 'CO_EXECUTOR', 2, true, 'P01_CMO',
     jsonb_build_object(
       'role', 'Define clinical utility outcomes and MCID anchors',
       'expected_output', 'Clinical outcomes definition and MCID methodology'
     )),
    ('TSK-CD-002-P3-01', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 3, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Clinical validation SAP with MCID determination methods',
       'expected_output', 'Clinical validation SAP'
     )),
    
    -- Task 7: Execute Clinical Validation & MCID Determination
    ('TSK-CD-002-P3-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 'P04_BIOSTAT',
     jsonb_build_object(
       'role', 'Conduct clinical outcome analyses and MCID determination',
       'expected_output', 'Clinical validation statistical results with MCID'
     )),
    ('TSK-CD-002-P3-02', 'AGT-EVIDENCE-SYNTHESIZER', 'CO_EXECUTOR', 2, true, 'P08_HEOR',
     jsonb_build_object(
       'role', 'Synthesize clinical utility evidence and health economics implications',
       'expected_output', 'Clinical utility summary and HE evidence'
     )),
    ('TSK-CD-002-P3-02', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 3, true, 'P11_MEDICAL_WRITER',
     jsonb_build_object(
       'role', 'Draft Clinical Validation Report',
       'expected_output', 'Clinical Validation Report (V3) draft'
     )),
    
    -- Task 8: Regulatory Strategy & FDA Pre-Submission
    ('TSK-CD-002-P3-03', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 'P05_REGAFF',
     jsonb_build_object(
       'role', 'Prepare FDA Pre-Submission package',
       'expected_output', 'FDA Pre-Sub package draft'
     )),
    ('TSK-CD-002-P3-03', 'AGT-SUBMISSION-COMPILER', 'CO_EXECUTOR', 2, true, 'P05_REGAFF',
     jsonb_build_object(
       'role', 'Compile validation reports and evidence summaries',
       'expected_output', 'Pre-Sub package with all validation evidence'
     )),
    ('TSK-CD-002-P3-03', 'AGT-REGULATORY-INTELLIGENCE', 'CO_EXECUTOR', 3, false, null,
     jsonb_build_object(
       'role', 'Research FDA precedent and digital biomarker guidance',
       'expected_output', 'Regulatory intelligence summary'
     )),
    
    -- Task 9: Validation Report & Publication
    ('TSK-CD-002-P3-04', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 'P11_MEDICAL_WRITER',
     jsonb_build_object(
       'role', 'Draft comprehensive validation report and manuscript',
       'expected_output', 'Validation report and manuscript draft'
     )),
    ('TSK-CD-002-P3-04', 'AGT-EVIDENCE-SYNTHESIZER', 'CO_EXECUTOR', 2, true, 'P01_CMO',
     jsonb_build_object(
       'role', 'Synthesize V1+V2+V3 evidence into cohesive narrative',
       'expected_output', 'Evidence synthesis for publication'
     )),
    ('TSK-CD-002-P3-04', 'AGT-DOCUMENT-VALIDATOR', 'VALIDATOR', 3, true, 'P13_QA',
     jsonb_build_object(
       'role', 'Validate manuscript meets journal guidelines and DiMe standards',
       'expected_output', 'Quality review report'
     ))
) AS ta_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval, approval_persona_code, metadata)
JOIN dh_task t ON t.code = ta_data.task_code AND t.tenant_id = sc.tenant_id
JOIN dh_agent a ON a.code = ta_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)
DO UPDATE SET
  execution_order = EXCLUDED.execution_order,
  requires_human_approval = EXCLUDED.requires_human_approval,
  approval_persona_code = EXCLUDED.approval_persona_code,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: TASK-PERSONA ASSIGNMENTS (Human Experts)
-- =====================================================================================

INSERT INTO dh_task_persona (
  tenant_id,
  task_id,
  persona_id,
  responsibility,
  review_timing,
  metadata
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  p.id as persona_id,
  tp_data.responsibility,
  tp_data.review_timing,
  tp_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task 1: Define Intended Use & Context of Use
    ('TSK-CD-002-P1-01', 'P06_PMDIG', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Strategic leader; defines validation strategy', 'decision_authority', 'Final approval on validation approach')),
    ('TSK-CD-002-P1-01', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Regulatory pathway validation', 'review_focus', 'FDA endpoint classification')),
    
    -- Task 2: Design Verification Study
    ('TSK-CD-002-P1-02', 'P09_DATASCIENCE', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Technical lead for V1 verification', 'expertise', 'Sensor validation and signal processing')),
    ('TSK-CD-002-P1-02', 'P04_BIOSTAT', 'REVIEW', 'PARALLEL',
     jsonb_build_object('role', 'Statistical design and sample size', 'review_focus', 'ICC sample size and SAP')),
    ('TSK-CD-002-P1-02', 'P08_HEOR', 'PROVIDE_INPUT', 'PARALLEL',
     jsonb_build_object('role', 'Clinical research input', 'expertise', 'Study design best practices')),
    
    -- Task 3: Execute Verification Study
    ('TSK-CD-002-P1-03', 'P09_DATASCIENCE', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Execute data analysis', 'deliverable', 'Verification Report')),
    ('TSK-CD-002-P1-03', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Statistical validation', 'review_focus', 'Analysis correctness and interpretation')),
    ('TSK-CD-002-P1-03', 'P13_QA', 'VALIDATE', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Quality assurance', 'review_focus', 'Success criteria met')),
    
    -- Task 4: Design Analytical Validation Study
    ('TSK-CD-002-P2-01', 'P08_HEOR', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Lead V2 analytical validation design', 'expertise', 'Psychometric validation')),
    ('TSK-CD-002-P2-01', 'P09_DATASCIENCE', 'PROVIDE_INPUT', 'PARALLEL',
     jsonb_build_object('role', 'Technical input on digital measure', 'expertise', 'Algorithm and feature engineering')),
    ('TSK-CD-002-P2-01', 'P04_BIOSTAT', 'REVIEW', 'PARALLEL',
     jsonb_build_object('role', 'Psychometric SAP review', 'review_focus', 'Factor analysis and validity methods')),
    
    -- Task 5: Execute Analytical Validation
    ('TSK-CD-002-P2-02', 'P08_HEOR', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Execute psychometric validation', 'deliverable', 'Analytical Validation Report')),
    ('TSK-CD-002-P2-02', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Statistical validation', 'review_focus', 'DiMe V2 criteria met')),
    ('TSK-CD-002-P2-02', 'P11_MEDICAL_WRITER', 'PROVIDE_INPUT', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Report writing', 'deliverable', 'V2 report draft')),
    
    -- Task 6: Design Clinical Validation Study
    ('TSK-CD-002-P3-01', 'P08_HEOR', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Lead V3 clinical validation design', 'expertise', 'Clinical outcomes and MCID')),
    ('TSK-CD-002-P3-01', 'P06_PMDIG', 'REVIEW', 'PARALLEL',
     jsonb_build_object('role', 'Strategic alignment', 'review_focus', 'Clinical development plan alignment')),
    ('TSK-CD-002-P3-01', 'P01_CMO', 'REVIEW', 'PARALLEL',
     jsonb_build_object('role', 'Clinical utility validation', 'review_focus', 'Clinical meaningfulness')),
    ('TSK-CD-002-P3-01', 'P04_BIOSTAT', 'PROVIDE_INPUT', 'PARALLEL',
     jsonb_build_object('role', 'Clinical validation SAP', 'expertise', 'MCID methodology')),
    
    -- Task 7: Execute Clinical Validation & MCID
    ('TSK-CD-002-P3-02', 'P08_HEOR', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Execute clinical validation', 'deliverable', 'Clinical Validation Report')),
    ('TSK-CD-002-P3-02', 'P04_BIOSTAT', 'PROVIDE_INPUT', 'PARALLEL',
     jsonb_build_object('role', 'Clinical outcome analyses', 'deliverable', 'Statistical results')),
    ('TSK-CD-002-P3-02', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Clinical interpretation', 'review_focus', 'Clinical meaningfulness and utility')),
    ('TSK-CD-002-P3-02', 'P11_MEDICAL_WRITER', 'PROVIDE_INPUT', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Report writing', 'deliverable', 'V3 report draft')),
    
    -- Task 8: Regulatory Strategy & FDA Pre-Submission
    ('TSK-CD-002-P3-03', 'P05_REGAFF', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Lead FDA Pre-Sub preparation', 'deliverable', 'FDA Pre-Sub package')),
    ('TSK-CD-002-P3-03', 'P06_PMDIG', 'REVIEW', 'PARALLEL',
     jsonb_build_object('role', 'Strategic review', 'review_focus', 'Alignment with regulatory strategy')),
    ('TSK-CD-002-P3-03', 'P08_HEOR', 'PROVIDE_INPUT', 'PARALLEL',
     jsonb_build_object('role', 'Validation evidence summary', 'deliverable', 'V1+V2+V3 summary for FDA')),
    ('TSK-CD-002-P3-03', 'P01_CMO', 'REVIEW', 'PARALLEL',
     jsonb_build_object('role', 'Clinical review', 'review_focus', 'Clinical validation adequacy')),
    
    -- Task 9: Validation Report & Publication
    ('TSK-CD-002-P3-04', 'P11_MEDICAL_WRITER', 'APPROVE', 'PARALLEL',
     jsonb_build_object('role', 'Lead manuscript preparation', 'deliverable', 'Peer-reviewed manuscript')),
    ('TSK-CD-002-P3-04', 'P08_HEOR', 'PROVIDE_INPUT', 'PARALLEL',
     jsonb_build_object('role', 'Scientific content', 'expertise', 'Validation methodology')),
    ('TSK-CD-002-P3-04', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Senior author review', 'review_focus', 'Scientific rigor and clinical interpretation')),
    ('TSK-CD-002-P3-04', 'P13_QA', 'VALIDATE', 'AFTER_AGENT_RUNS',
     jsonb_build_object('role', 'Quality review', 'review_focus', 'Journal guidelines and DiMe standards'))
) AS tp_data(task_code, persona_code, responsibility, review_timing, metadata)
JOIN dh_task t ON t.code = tp_data.task_code AND t.tenant_id = sc.tenant_id
JOIN dh_persona p ON p.code = tp_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET
  review_timing = EXCLUDED.review_timing,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: TASK-TOOL MAPPINGS
-- =====================================================================================

INSERT INTO dh_task_tool (
  tenant_id,
  task_id,
  tool_id,
  purpose,
  is_required,
  connection_config
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  tl.id as tool_id,
  tt_data.purpose,
  tt_data.is_required,
  tt_data.connection_config
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Statistical Analysis Tools (Used across multiple tasks)
    ('TSK-CD-002-P1-02', 'TOOL-R-STATS', 'Sample size calculations and statistical analysis planning', true, 
     jsonb_build_object('packages', json_build_array('pwr', 'psych', 'irr'))),
    ('TSK-CD-002-P1-03', 'TOOL-R-STATS', 'ICC, Bland-Altman, correlation analyses', true,
     jsonb_build_object('packages', json_build_array('irr', 'BlandAltmanLeh', 'psych'))),
    ('TSK-CD-002-P2-02', 'TOOL-R-STATS', 'Factor analysis, validity, reliability analyses', true,
     jsonb_build_object('packages', json_build_array('psych', 'lavaan', 'EFA.dimensions'))),
    ('TSK-CD-002-P3-02', 'TOOL-R-STATS', 'Clinical outcome analyses and MCID determination', true,
     jsonb_build_object('packages', json_build_array('lme4', 'nlme', 'MIDquantile'))),
    
    -- Python for Data Science
    ('TSK-CD-002-P1-03', 'TOOL-PYTHON', 'Data processing and visualization', true,
     jsonb_build_object('libraries', json_build_array('pandas', 'numpy', 'scipy', 'pingouin', 'matplotlib', 'seaborn'))),
    ('TSK-CD-002-P2-02', 'TOOL-PYTHON', 'Advanced psychometric analyses', false,
     jsonb_build_object('libraries', json_build_array('factor_analyzer', 'sklearn'))),
    
    -- Literature Search
    ('TSK-CD-002-P1-01', 'TOOL-PUBMED', 'Search precedent digital biomarker validation studies', true,
     jsonb_build_object('search_terms', json_build_array('digital biomarker', 'DiMe V3', 'verification validation'))),
    ('TSK-CD-002-P1-02', 'TOOL-PUBMED', 'Gold standard identification and verification methodology', true,
     jsonb_build_object('search_terms', json_build_array('gold standard', 'accuracy testing', 'ICC validation'))),
    
    -- Clinical Trial Management
    ('TSK-CD-002-P2-02', 'TOOL-EDC-MEDIDATA', 'Analytical validation study data capture', true,
     jsonb_build_object('use_case', 'Psychometric validation data collection')),
    ('TSK-CD-002-P3-02', 'TOOL-EDC-MEDIDATA', 'Clinical validation study data capture', true,
     jsonb_build_object('use_case', 'Longitudinal clinical data and patient-reported outcomes')),
    
    -- Regulatory Tools
    ('TSK-CD-002-P3-03', 'TOOL-REGULATORY-VEEVA', 'FDA Pre-Submission package preparation', true,
     jsonb_build_object('use_case', 'Compile validation reports for FDA meeting')),
    
    -- Writing and Collaboration
    ('TSK-CD-002-P1-03', 'TOOL-MEDICAL-WRITING', 'Verification Report preparation', true,
     jsonb_build_object('template', 'Verification Report V1')),
    ('TSK-CD-002-P2-02', 'TOOL-MEDICAL-WRITING', 'Analytical Validation Report preparation', true,
     jsonb_build_object('template', 'Analytical Validation Report V2')),
    ('TSK-CD-002-P3-02', 'TOOL-MEDICAL-WRITING', 'Clinical Validation Report preparation', true,
     jsonb_build_object('template', 'Clinical Validation Report V3')),
    ('TSK-CD-002-P3-04', 'TOOL-MEDICAL-WRITING', 'Manuscript preparation for peer-reviewed journal', true,
     jsonb_build_object('target_journals', json_build_array('npj Digital Medicine', 'JMIR', 'Lancet Digital Health')))
) AS tt_data(task_code, tool_code, purpose, is_required, connection_config)
JOIN dh_task t ON t.code = tt_data.task_code AND t.tenant_id = sc.tenant_id
JOIN dh_tool tl ON tl.code = tt_data.tool_code AND tl.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)
DO UPDATE SET
  purpose = EXCLUDED.purpose,
  is_required = EXCLUDED.is_required,
  connection_config = EXCLUDED.connection_config;

-- =====================================================================================
-- SECTION 5: TASK-RAG SOURCE MAPPINGS
-- =====================================================================================

INSERT INTO dh_task_rag (
  tenant_id,
  task_id,
  rag_source_id,
  query_context,
  is_required,
  search_config
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  r.id as rag_source_id,
  tr_data.query_context,
  tr_data.is_required,
  tr_data.search_config
FROM session_config sc
CROSS JOIN (
  VALUES
    -- DiMe Framework (Core for all validation tasks)
    ('TSK-CD-002-P1-01', 'RAG-DIME-V3',
     'What are the DiMe V3 requirements for {clinical_construct} in {patient_population}?', true,
     jsonb_build_object('section', 'Intended Use and Context of Use', 'purpose', 'DiMe V3 Framework guidance for intended use definition')),
    ('TSK-CD-002-P1-02', 'RAG-DIME-V3',
     'What are DiMe V1 verification requirements for {sensor_type} measuring {clinical_construct}?', true,
     jsonb_build_object('section', 'V1 Verification', 'purpose', 'DiMe V1 Verification requirements and best practices')),
    ('TSK-CD-002-P2-01', 'RAG-DIME-V3',
     'What are DiMe V2 analytical validation criteria for {biomarker_type}?', true,
     jsonb_build_object('section', 'V2 Analytical Validation', 'purpose', 'DiMe V2 Analytical Validation requirements')),
    ('TSK-CD-002-P3-01', 'RAG-DIME-V3',
     'What are DiMe V3 clinical validation and MCID requirements?', true,
     jsonb_build_object('section', 'V3 Clinical Validation', 'purpose', 'DiMe V3 Clinical Validation requirements')),
    
    -- FDA Digital Health Guidance
    ('TSK-CD-002-P1-01', 'RAG-FDA-DIGITAL-HEALTH',
     'FDA requirements for {endpoint_type} digital biomarkers in {indication}', true,
     jsonb_build_object('guidance_type', 'Digital Health Innovation', 'purpose', 'FDA expectations for digital biomarker endpoints')),
    ('TSK-CD-002-P3-03', 'RAG-FDA-DIGITAL-HEALTH',
     'FDA Pre-Submission requirements for digital biomarker validation', true,
     jsonb_build_object('guidance_type', 'Pre-Submission Process', 'purpose', 'FDA Pre-Submission meeting best practices')),
    
    -- ICH Guidelines (for psychometric validation)
    ('TSK-CD-002-P2-01', 'RAG-ICH-E9',
     'ICH E9 statistical principles for {validation_type}', true,
     jsonb_build_object('section', 'Measurement Properties', 'purpose', 'Statistical principles for analytical validation')),
    ('TSK-CD-002-P3-01', 'RAG-ICH-E9',
     'ICH E9 principles for establishing clinically meaningful differences', true,
     jsonb_build_object('section', 'Clinical Significance', 'purpose', 'Statistical principles for clinical validation')),
    
    -- PRO Guidance (for patient-reported digital measures)
    ('TSK-CD-002-P2-01', 'RAG-FDA-PRO',
     'FDA PRO guidance on {validity_type} and reliability', false,
     jsonb_build_object('applicability', 'If digital biomarker includes patient-reported component', 'purpose', 'Psychometric validation methods')),
    
    -- Real-World Evidence
    ('TSK-CD-002-P3-02', 'RAG-FDA-RWE',
     'FDA RWE framework for digital clinical measures in {setting}', false,
     jsonb_build_object('applicability', 'If validation includes real-world data', 'purpose', 'Real-world evidence considerations')),
    
    -- Literature (PubMed)
    ('TSK-CD-002-P1-02', 'RAG-PUBMED-API',
     'Verification studies for {sensor_type} measuring {clinical_construct}', true,
     jsonb_build_object('search_strategy', 'Gold standard validation ICC Bland-Altman', 'purpose', 'Precedent verification studies')),
    ('TSK-CD-002-P2-01', 'RAG-PUBMED-API',
     'Psychometric validation of {biomarker_type} in {indication}', true,
     jsonb_build_object('search_strategy', 'Convergent divergent validity known-groups', 'purpose', 'Precedent analytical validation studies')),
    ('TSK-CD-002-P3-01', 'RAG-PUBMED-API',
     'MCID determination for {clinical_construct} in {patient_population}', true,
     jsonb_build_object('search_strategy', 'MCID anchor-based distribution-based', 'purpose', 'Precedent MCID studies'))
) AS tr_data(task_code, rag_code, query_context, is_required, search_config)
JOIN dh_task t ON t.code = tr_data.task_code AND t.tenant_id = sc.tenant_id
JOIN dh_rag_source r ON r.code = tr_data.rag_code AND r.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET
  query_context = EXCLUDED.query_context,
  is_required = EXCLUDED.is_required,
  search_config = EXCLUDED.search_config;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

SELECT 
  'UC-02 Task Dependencies' as status,
  COUNT(*) as dependency_count
FROM dh_task_dependency td
JOIN dh_task t ON t.id = td.task_id
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE td.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

SELECT 
  'UC-02 Task-Agent Assignments' as status,
  COUNT(*) as assignment_count
FROM dh_task_agent ta
JOIN dh_task t ON t.id = ta.task_id
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE ta.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

SELECT 
  'UC-02 Task-Persona Assignments' as status,
  COUNT(*) as assignment_count
FROM dh_task_persona tp
JOIN dh_task t ON t.id = tp.task_id
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE tp.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

SELECT 
  'UC-02 Task-Tool Mappings' as status,
  COUNT(*) as mapping_count,
  COUNT(*) FILTER (WHERE is_required = true) as required_tools
FROM dh_task_tool tt
JOIN dh_task t ON t.id = tt.task_id
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE tt.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

SELECT 
  'UC-02 Task-RAG Mappings' as status,
  COUNT(*) as mapping_count,
  COUNT(*) FILTER (WHERE is_required = true) as required_rags
FROM dh_task_rag tr
JOIN dh_task t ON t.id = tr.task_id
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE tr.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

SELECT 
  'UC-02 Complete Assignment Summary' as status,
  jsonb_build_object(
    'dependencies', (SELECT COUNT(*) FROM dh_task_dependency td JOIN dh_task t ON t.id = td.task_id JOIN dh_workflow wf ON wf.id = t.workflow_id WHERE td.tenant_id = (SELECT tenant_id FROM session_config) AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002')),
    'agent_assignments', (SELECT COUNT(*) FROM dh_task_agent ta JOIN dh_task t ON t.id = ta.task_id JOIN dh_workflow wf ON wf.id = t.workflow_id WHERE ta.tenant_id = (SELECT tenant_id FROM session_config) AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002')),
    'persona_assignments', (SELECT COUNT(*) FROM dh_task_persona tp JOIN dh_task t ON t.id = tp.task_id JOIN dh_workflow wf ON wf.id = t.workflow_id WHERE tp.tenant_id = (SELECT tenant_id FROM session_config) AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002')),
    'tool_mappings', (SELECT COUNT(*) FROM dh_task_tool tt JOIN dh_task t ON t.id = tt.task_id JOIN dh_workflow wf ON wf.id = t.workflow_id WHERE tt.tenant_id = (SELECT tenant_id FROM session_config) AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002')),
    'rag_mappings', (SELECT COUNT(*) FROM dh_task_rag tr JOIN dh_task t ON t.id = tr.task_id JOIN dh_workflow wf ON wf.id = t.workflow_id WHERE tr.tenant_id = (SELECT tenant_id FROM session_config) AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002'))
  ) as summary;

-- =====================================================================================
-- END OF SEED FILE
-- =====================================================================================

