-- Migration: 20251201_032_workflow_tasks_pilot.sql
-- Purpose: Add atomic workflow tasks for 2 pilot workflows with service layer mapping
-- Pilots: WF-MAI-001 (BAU) and WF-XFI-001 (Project)
-- Service Layers: L1_expert, L2_panel, L3_workflow, L4_solution

-- ============================================================================
-- STEP 1: Enhance workflow_tasks table with service layer and AI columns
-- ============================================================================

ALTER TABLE workflow_tasks
  ADD COLUMN IF NOT EXISTS service_layer TEXT CHECK (service_layer IN ('L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution')),
  ADD COLUMN IF NOT EXISTS ai_automation_score INTEGER CHECK (ai_automation_score >= 0 AND ai_automation_score <= 100),
  ADD COLUMN IF NOT EXISTS is_hitl_checkpoint BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hitl_reason TEXT,
  ADD COLUMN IF NOT EXISTS input_artifacts TEXT[],
  ADD COLUMN IF NOT EXISTS output_artifacts TEXT[],
  ADD COLUMN IF NOT EXISTS required_role TEXT,
  ADD COLUMN IF NOT EXISTS tool_category TEXT;

-- ============================================================================
-- STEP 2: Create task code column for easier reference
-- ============================================================================

ALTER TABLE workflow_tasks
  ADD COLUMN IF NOT EXISTS task_code TEXT UNIQUE;

-- ============================================================================
-- STEP 3: PILOT 1 - WF-MAI-001 KOL Engagement Analysis (BAU/Routine)
-- Monthly workflow: 20 hours total, 4 stages, ~20 tasks
-- ============================================================================

-- Stage 1: Data Collection & Preparation (5 hours)
-- Stage ID: a48dc10e-3151-42fe-8906-0ccdfd3facd9

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 1.1: Extract CRM Data
(
  'a48dc10e-3151-42fe-8906-0ccdfd3facd9', 1, 'MAI001-1-1',
  'Extract CRM Interaction Data',
  'Pull KOL interaction records from Veeva CRM for the reporting period',
  'data_extraction',
  30, 'L3_workflow', 95,
  FALSE, NULL,
  ARRAY['CRM system access', 'Date range parameters'],
  ARRAY['crm_interactions.csv', 'interaction_log.json'],
  'Data Analyst',
  'ETL',
  'Connect to Veeva CRM API, filter by date range, export all KOL interaction types',
  'Complete dataset with no missing mandatory fields'
),
-- Task 1.2: Pull HCP Profile Data
(
  'a48dc10e-3151-42fe-8906-0ccdfd3facd9', 2, 'MAI001-1-2',
  'Pull HCP Profile Information',
  'Retrieve HCP demographic and specialty data for engaged KOLs',
  'data_extraction',
  20, 'L3_workflow', 90,
  FALSE, NULL,
  ARRAY['KOL ID list', 'HCP database access'],
  ARRAY['hcp_profiles.csv', 'specialty_breakdown.json'],
  'Data Analyst',
  'ETL',
  'Query HCP database for profile data, include NPI, specialty, institution',
  'All KOL IDs matched to HCP profiles (>95% match rate)'
),
-- Task 1.3: Aggregate Meeting Notes
(
  'a48dc10e-3151-42fe-8906-0ccdfd3facd9', 3, 'MAI001-1-3',
  'Aggregate and Parse Meeting Notes',
  'Collect MSL meeting notes and extract key discussion themes using NLP',
  'data_processing',
  45, 'L1_expert', 70,
  FALSE, NULL,
  ARRAY['Meeting notes folder', 'NLP model access'],
  ARRAY['parsed_notes.json', 'theme_tags.csv'],
  'Medical Science Liaison',
  'NLP',
  'Use Ask Expert to analyze meeting notes, extract themes, sentiment, and action items',
  'All notes parsed with confidence score >0.8'
),
-- Task 1.4: Validate Data Completeness
(
  'a48dc10e-3151-42fe-8906-0ccdfd3facd9', 4, 'MAI001-1-4',
  'Validate Data Completeness',
  'Review extracted data for completeness, flag missing records',
  'validation',
  30, 'L3_workflow', 85,
  TRUE, 'Human review required to approve data quality before analysis',
  ARRAY['crm_interactions.csv', 'hcp_profiles.csv', 'parsed_notes.json'],
  ARRAY['validation_report.pdf', 'approved_dataset.csv'],
  'Insights Analyst',
  'Validation',
  'Run automated completeness checks, generate exceptions report for human review',
  'Data completeness >95%, all exceptions reviewed and resolved'
),
-- Task 1.5: Standardize Data Formats
(
  'a48dc10e-3151-42fe-8906-0ccdfd3facd9', 5, 'MAI001-1-5',
  'Standardize and Normalize Data',
  'Transform data into analysis-ready format with consistent schemas',
  'data_processing',
  35, 'L3_workflow', 95,
  FALSE, NULL,
  ARRAY['approved_dataset.csv'],
  ARRAY['normalized_dataset.parquet', 'schema_mapping.json'],
  'Data Analyst',
  'ETL',
  'Apply standard transformations, normalize dates, categorize interaction types',
  'All records conform to target schema'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 2: Analysis & Modeling (7 hours)
-- Stage ID: 40d139a7-0297-451e-a006-1d16f6737e19

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 2.1: Calculate Engagement Metrics
(
  '40d139a7-0297-451e-a006-1d16f6737e19', 1, 'MAI001-2-1',
  'Calculate Engagement Metrics',
  'Compute KOL engagement scores, frequency, and recency metrics',
  'analysis',
  45, 'L3_workflow', 90,
  FALSE, NULL,
  ARRAY['normalized_dataset.parquet'],
  ARRAY['engagement_metrics.csv', 'kol_scores.json'],
  'Insights Analyst',
  'Analytics',
  'Calculate RFM scores, engagement index, trend indicators per KOL',
  'All KOLs scored with valid metrics'
),
-- Task 2.2: Segment KOL Tiers
(
  '40d139a7-0297-451e-a006-1d16f6737e19', 2, 'MAI001-2-2',
  'Segment KOLs into Engagement Tiers',
  'Apply clustering algorithm to segment KOLs by engagement level',
  'analysis',
  60, 'L1_expert', 75,
  FALSE, NULL,
  ARRAY['engagement_metrics.csv', 'hcp_profiles.csv'],
  ARRAY['kol_segments.csv', 'segment_profiles.json'],
  'Insights Analyst',
  'ML/Analytics',
  'Use Ask Expert to recommend optimal segmentation, apply K-means or rule-based tiers',
  'Clear tier definitions with >90% KOL assignment'
),
-- Task 2.3: Analyze Territory Coverage
(
  '40d139a7-0297-451e-a006-1d16f6737e19', 3, 'MAI001-2-3',
  'Analyze Territory Coverage Patterns',
  'Map engagement patterns by geography and MSL territory',
  'analysis',
  50, 'L3_workflow', 85,
  FALSE, NULL,
  ARRAY['kol_segments.csv', 'territory_mapping.csv'],
  ARRAY['territory_heatmap.json', 'coverage_gaps.csv'],
  'Field Medical Director',
  'Geospatial',
  'Generate territory coverage map, identify under/over-served areas',
  'All territories mapped with coverage score'
),
-- Task 2.4: Trend Analysis
(
  '40d139a7-0297-451e-a006-1d16f6737e19', 4, 'MAI001-2-4',
  'Perform Trend and Anomaly Analysis',
  'Identify engagement trends, seasonal patterns, and anomalies',
  'analysis',
  60, 'L1_expert', 70,
  FALSE, NULL,
  ARRAY['engagement_metrics.csv', 'historical_data.parquet'],
  ARRAY['trend_report.json', 'anomalies.csv'],
  'Insights Analyst',
  'Analytics',
  'Use Ask Expert to interpret trends, flag significant changes from baseline',
  'Trends identified with statistical significance (p<0.05)'
),
-- Task 2.5: Validate Analysis Results
(
  '40d139a7-0297-451e-a006-1d16f6737e19', 5, 'MAI001-2-5',
  'Validate Analysis Methodology',
  'Review analysis approach and validate statistical methods',
  'validation',
  45, 'L2_panel', 60,
  TRUE, 'Statistical methodology requires expert review before reporting',
  ARRAY['trend_report.json', 'kol_segments.csv', 'methodology_doc.md'],
  ARRAY['validated_analysis.pdf', 'methodology_approval.json'],
  'Medical Affairs Director',
  'Review',
  'Use Ask Panel for cross-functional validation of methodology and findings',
  'Analysis approach approved by Medical Affairs and Analytics leads'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 3: Insight Generation & Reporting (6 hours)
-- Stage ID: b7346dd3-e5ac-4b45-930c-557b7759fa41

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 3.1: Generate Executive Summary
(
  'b7346dd3-e5ac-4b45-930c-557b7759fa41', 1, 'MAI001-3-1',
  'Generate Executive Summary',
  'Create AI-drafted executive summary of key findings',
  'content_generation',
  40, 'L1_expert', 80,
  FALSE, NULL,
  ARRAY['validated_analysis.pdf', 'trend_report.json'],
  ARRAY['exec_summary_draft.docx'],
  'Medical Affairs Director',
  'Content',
  'Use Ask Expert to draft executive summary highlighting top 5 insights',
  'Summary covers all key findings in <2 pages'
),
-- Task 3.2: Create Visualizations
(
  'b7346dd3-e5ac-4b45-930c-557b7759fa41', 2, 'MAI001-3-2',
  'Create Dashboard Visualizations',
  'Generate charts, graphs, and interactive dashboard components',
  'visualization',
  60, 'L3_workflow', 90,
  FALSE, NULL,
  ARRAY['engagement_metrics.csv', 'territory_heatmap.json', 'kol_segments.csv'],
  ARRAY['dashboard_config.json', 'chart_exports/'],
  'Insights Analyst',
  'Visualization',
  'Auto-generate standard report visualizations using template library',
  'All required charts generated with proper formatting'
),
-- Task 3.3: Draft Recommendations
(
  'b7346dd3-e5ac-4b45-930c-557b7759fa41', 3, 'MAI001-3-3',
  'Draft Strategic Recommendations',
  'Formulate actionable recommendations based on insights',
  'content_generation',
  50, 'L2_panel', 65,
  TRUE, 'Strategic recommendations require cross-functional input',
  ARRAY['validated_analysis.pdf', 'exec_summary_draft.docx'],
  ARRAY['recommendations.docx', 'action_items.json'],
  'Field Medical Director',
  'Strategy',
  'Use Ask Panel to gather Commercial/Medical perspectives on recommendations',
  'Recommendations are specific, measurable, and resource-feasible'
),
-- Task 3.4: Compile Final Report
(
  'b7346dd3-e5ac-4b45-930c-557b7759fa41', 4, 'MAI001-3-4',
  'Compile Final Report Package',
  'Assemble all components into final deliverable report',
  'assembly',
  45, 'L3_workflow', 95,
  FALSE, NULL,
  ARRAY['exec_summary_draft.docx', 'chart_exports/', 'recommendations.docx'],
  ARRAY['kol_engagement_report.pdf', 'appendix.xlsx'],
  'Insights Analyst',
  'Document',
  'Auto-assemble report using standard template, apply branding',
  'Report passes quality checklist (formatting, completeness)'
),
-- Task 3.5: Review and Approve Report
(
  'b7346dd3-e5ac-4b45-930c-557b7759fa41', 5, 'MAI001-3-5',
  'Final Report Review and Approval',
  'Medical Affairs leadership reviews and approves final report',
  'approval',
  30, 'L1_expert', 40,
  TRUE, 'Final report requires leadership sign-off before distribution',
  ARRAY['kol_engagement_report.pdf'],
  ARRAY['approved_report.pdf', 'approval_record.json'],
  'Medical Affairs Director',
  'Review',
  'Director reviews report, requests revisions or approves for distribution',
  'Report approved with documented sign-off'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 4: Action Planning & Follow-up (2 hours)
-- Stage ID: 64f65684-38d7-400a-bb83-6fef405ad65e

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 4.1: Distribute Report
(
  '64f65684-38d7-400a-bb83-6fef405ad65e', 1, 'MAI001-4-1',
  'Distribute Report to Stakeholders',
  'Send approved report to distribution list with key highlights',
  'distribution',
  15, 'L3_workflow', 95,
  FALSE, NULL,
  ARRAY['approved_report.pdf', 'distribution_list.csv'],
  ARRAY['distribution_log.json', 'email_confirmations.csv'],
  'Insights Analyst',
  'Communication',
  'Auto-distribute via email with personalized highlights per recipient role',
  'All stakeholders receive report within 24 hours'
),
-- Task 4.2: Schedule Follow-up Actions
(
  '64f65684-38d7-400a-bb83-6fef405ad65e', 2, 'MAI001-4-2',
  'Schedule Follow-up Action Items',
  'Create calendar events and task assignments for recommendations',
  'planning',
  30, 'L1_expert', 75,
  FALSE, NULL,
  ARRAY['action_items.json', 'team_calendar_access'],
  ARRAY['scheduled_tasks.json', 'calendar_invites.ics'],
  'Field Medical Director',
  'Planning',
  'Use Ask Expert to optimize action item scheduling based on team capacity',
  'All high-priority actions scheduled within 2 weeks'
),
-- Task 4.3: Update CRM with Insights
(
  '64f65684-38d7-400a-bb83-6fef405ad65e', 3, 'MAI001-4-3',
  'Update CRM with KOL Insights',
  'Push engagement scores and segment tags back to Veeva CRM',
  'data_sync',
  20, 'L3_workflow', 90,
  FALSE, NULL,
  ARRAY['kol_scores.json', 'kol_segments.csv'],
  ARRAY['crm_update_log.json'],
  'Data Analyst',
  'ETL',
  'Batch update KOL records in CRM with new scores and segment assignments',
  'All KOL records updated with audit trail'
),
-- Task 4.4: Archive Workflow Artifacts
(
  '64f65684-38d7-400a-bb83-6fef405ad65e', 4, 'MAI001-4-4',
  'Archive Analysis Artifacts',
  'Store all workflow outputs in document management system',
  'archival',
  15, 'L3_workflow', 98,
  FALSE, NULL,
  ARRAY['All workflow outputs'],
  ARRAY['archive_manifest.json', 'archive_url'],
  'Insights Analyst',
  'Document',
  'Auto-archive to SharePoint with proper metadata and retention tags',
  'All artifacts archived with searchable metadata'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- STEP 4: PILOT 2 - WF-XFI-001 Customer 360 Platform Build (Project)
-- One-time project: 240 hours total, 5 stages, ~25 tasks
-- ============================================================================

-- Stage 1: Requirements & Design (40 hours)
-- Stage ID: a7f57bc4-6da8-45ec-a618-1d47a225cf38

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 1.1: Stakeholder Discovery
(
  'a7f57bc4-6da8-45ec-a618-1d47a225cf38', 1, 'XFI001-1-1',
  'Conduct Stakeholder Discovery Sessions',
  'Interview key stakeholders to gather requirements across Medical, Commercial, Market Access',
  'discovery',
  480, 'L1_expert', 40,
  TRUE, 'Stakeholder input critical for requirement gathering',
  ARRAY['Stakeholder list', 'Interview guide template'],
  ARRAY['stakeholder_interviews.docx', 'requirements_raw.json'],
  'Project Manager',
  'Research',
  'Use Ask Expert to prepare interview guides, conduct sessions, synthesize findings',
  'All key stakeholders interviewed (min 8 sessions)'
),
-- Task 1.2: Data Source Inventory
(
  'a7f57bc4-6da8-45ec-a618-1d47a225cf38', 2, 'XFI001-1-2',
  'Create Data Source Inventory',
  'Catalog all potential data sources: CRM, ERP, external, syndicated',
  'inventory',
  240, 'L3_workflow', 75,
  FALSE, NULL,
  ARRAY['System documentation', 'IT architecture diagrams'],
  ARRAY['data_source_inventory.xlsx', 'source_metadata.json'],
  'Data Architect',
  'Discovery',
  'Auto-discover data sources from IT CMDB, supplement with manual inventory',
  'All data sources catalogued with owner, refresh frequency, quality score'
),
-- Task 1.3: Define Customer Entity Model
(
  'a7f57bc4-6da8-45ec-a618-1d47a225cf38', 3, 'XFI001-1-3',
  'Define Customer Entity Model',
  'Design unified customer entity model spanning HCP, HCO, Payer types',
  'design',
  360, 'L2_panel', 55,
  TRUE, 'Entity model requires cross-functional agreement',
  ARRAY['requirements_raw.json', 'existing_data_models.pdf'],
  ARRAY['customer_entity_model.json', 'entity_diagram.svg'],
  'Data Architect',
  'Design',
  'Use Ask Panel to build consensus on entity definitions, relationships, attributes',
  'Entity model approved by Medical, Commercial, and Market Access leads'
),
-- Task 1.4: Design Data Architecture
(
  'a7f57bc4-6da8-45ec-a618-1d47a225cf38', 4, 'XFI001-1-4',
  'Design Technical Architecture',
  'Define data lake, integration patterns, technology stack',
  'design',
  480, 'L1_expert', 50,
  TRUE, 'Architecture decisions require IT and business alignment',
  ARRAY['customer_entity_model.json', 'data_source_inventory.xlsx'],
  ARRAY['technical_architecture.pdf', 'tech_stack_decision.md'],
  'Data Architect',
  'Architecture',
  'Use Ask Expert for architecture pattern recommendations, document decisions',
  'Architecture document approved by IT leadership'
),
-- Task 1.5: Create Project Plan
(
  'a7f57bc4-6da8-45ec-a618-1d47a225cf38', 5, 'XFI001-1-5',
  'Develop Detailed Project Plan',
  'Break down project into sprints, assign resources, define milestones',
  'planning',
  240, 'L1_expert', 65,
  FALSE, NULL,
  ARRAY['technical_architecture.pdf', 'resource_availability.csv'],
  ARRAY['project_plan.mpp', 'sprint_backlog.json'],
  'Project Manager',
  'Planning',
  'Use Ask Expert to optimize task sequencing and resource allocation',
  'Plan covers all work streams with clear dependencies'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 2: Data Integration & ETL (80 hours)
-- Stage ID: e4d19e94-0fa4-451a-be34-c540201eee44

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 2.1: Build Data Connectors
(
  'e4d19e94-0fa4-451a-be34-c540201eee44', 1, 'XFI001-2-1',
  'Build Source Data Connectors',
  'Develop ETL connectors for each priority data source',
  'development',
  960, 'L3_workflow', 70,
  FALSE, NULL,
  ARRAY['data_source_inventory.xlsx', 'API documentation'],
  ARRAY['connector_configs/', 'connection_tests.log'],
  'Data Engineer',
  'ETL',
  'Use workflow automation to generate connector boilerplate, customize per source',
  'All priority sources connected with successful test extracts'
),
-- Task 2.2: Implement Identity Resolution
(
  'e4d19e94-0fa4-451a-be34-c540201eee44', 2, 'XFI001-2-2',
  'Implement Customer Identity Resolution',
  'Build matching algorithm to link customer records across sources',
  'development',
  720, 'L2_panel', 60,
  TRUE, 'Matching rules require business validation',
  ARRAY['customer_entity_model.json', 'sample_data_extracts/'],
  ARRAY['identity_resolution_rules.json', 'match_algorithm.py'],
  'Data Scientist',
  'ML/Analytics',
  'Use Ask Panel to define matching rules, implement probabilistic matching',
  'Match rate >90% with <2% false positive rate'
),
-- Task 2.3: Build Master Data Hub
(
  'e4d19e94-0fa4-451a-be34-c540201eee44', 3, 'XFI001-2-3',
  'Build Master Data Management Hub',
  'Implement golden record creation and survivorship rules',
  'development',
  600, 'L3_workflow', 75,
  FALSE, NULL,
  ARRAY['identity_resolution_rules.json', 'customer_entity_model.json'],
  ARRAY['mdm_config.json', 'survivorship_rules.yaml'],
  'Data Engineer',
  'MDM',
  'Configure MDM platform with survivorship rules, implement golden record logic',
  'Golden records created for all matched customers'
),
-- Task 2.4: Implement Data Quality Framework
(
  'e4d19e94-0fa4-451a-be34-c540201eee44', 4, 'XFI001-2-4',
  'Implement Data Quality Framework',
  'Deploy data quality rules, monitoring, and alerting',
  'development',
  480, 'L3_workflow', 85,
  FALSE, NULL,
  ARRAY['data_quality_requirements.docx', 'mdm_config.json'],
  ARRAY['dq_rules.json', 'dq_dashboard_config.json'],
  'Data Engineer',
  'Quality',
  'Auto-generate DQ rules from entity model, configure monitoring dashboards',
  'DQ monitoring active with alerts for threshold breaches'
),
-- Task 2.5: Validate Integrated Data
(
  'e4d19e94-0fa4-451a-be34-c540201eee44', 5, 'XFI001-2-5',
  'Validate Integrated Data Quality',
  'Run comprehensive validation on integrated customer data',
  'validation',
  240, 'L1_expert', 65,
  TRUE, 'Data quality sign-off required before analytics phase',
  ARRAY['Golden records', 'DQ reports'],
  ARRAY['validation_report.pdf', 'data_certification.json'],
  'Data Steward',
  'Validation',
  'Use Ask Expert to interpret DQ results, document data limitations',
  'Data certified for analytics use with documented caveats'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 3: Analytics & Scoring (48 hours)
-- Stage ID: 9a872072-a742-482c-85d3-cbfa49b8f6ae

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 3.1: Build Customer Scoring Models
(
  '9a872072-a742-482c-85d3-cbfa49b8f6ae', 1, 'XFI001-3-1',
  'Develop Customer Scoring Models',
  'Build ML models for value, engagement, and propensity scores',
  'development',
  720, 'L2_panel', 55,
  TRUE, 'Scoring logic requires business input on weighting',
  ARRAY['Golden customer records', 'Historical outcome data'],
  ARRAY['scoring_models/', 'model_documentation.md'],
  'Data Scientist',
  'ML',
  'Use Ask Panel to define score components, build and validate models',
  'Models achieve target accuracy (AUC >0.75 for propensity models)'
),
-- Task 3.2: Implement Segmentation
(
  '9a872072-a742-482c-85d3-cbfa49b8f6ae', 2, 'XFI001-3-2',
  'Implement Customer Segmentation',
  'Apply clustering to create actionable customer segments',
  'development',
  480, 'L1_expert', 65,
  FALSE, NULL,
  ARRAY['scoring_models/', 'customer_attributes.parquet'],
  ARRAY['segment_definitions.json', 'segment_profiles.pdf'],
  'Data Scientist',
  'ML',
  'Use Ask Expert to recommend optimal cluster count, create segment personas',
  'Segments are distinct, actionable, and business-validated'
),
-- Task 3.3: Build Derived Attributes
(
  '9a872072-a742-482c-85d3-cbfa49b8f6ae', 3, 'XFI001-3-3',
  'Generate Derived Customer Attributes',
  'Calculate behavioral, transactional, and engagement metrics',
  'development',
  360, 'L3_workflow', 85,
  FALSE, NULL,
  ARRAY['Golden customer records', 'transaction_history.parquet'],
  ARRAY['derived_attributes.parquet', 'attribute_dictionary.json'],
  'Data Engineer',
  'Analytics',
  'Auto-generate standard derived attributes using attribute library',
  'All planned derived attributes calculated and validated'
),
-- Task 3.4: Validate Analytics Output
(
  '9a872072-a742-482c-85d3-cbfa49b8f6ae', 4, 'XFI001-3-4',
  'Validate Analytics and Scoring Output',
  'Business validation of scores, segments, and derived attributes',
  'validation',
  240, 'L2_panel', 50,
  TRUE, 'Analytics output requires cross-functional sign-off',
  ARRAY['segment_profiles.pdf', 'scoring_models/', 'sample_scored_customers.csv'],
  ARRAY['analytics_validation_report.pdf', 'sign_off.json'],
  'Medical Affairs Director',
  'Validation',
  'Use Ask Panel for Medical, Commercial, Market Access validation sessions',
  'All stakeholder groups approve analytics output'
),
-- Task 3.5: Document Analytics Layer
(
  '9a872072-a742-482c-85d3-cbfa49b8f6ae', 5, 'XFI001-3-5',
  'Document Analytics Layer',
  'Create technical and business documentation for analytics',
  'documentation',
  180, 'L1_expert', 75,
  FALSE, NULL,
  ARRAY['scoring_models/', 'segment_definitions.json', 'attribute_dictionary.json'],
  ARRAY['analytics_documentation.pdf', 'user_guide.pdf'],
  'Data Scientist',
  'Documentation',
  'Use Ask Expert to generate documentation from model artifacts',
  'Documentation complete and accessible to all user groups'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 4: Visualization & Access (48 hours)
-- Stage ID: 0c0e7e41-521a-40b2-8551-bc7bfa89b2aa

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 4.1: Design Dashboard UX
(
  '0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 1, 'XFI001-4-1',
  'Design Dashboard User Experience',
  'Create wireframes and UX flows for Customer 360 dashboard',
  'design',
  480, 'L1_expert', 55,
  TRUE, 'UX design requires user feedback',
  ARRAY['User personas', 'Use case requirements'],
  ARRAY['wireframes/', 'ux_flows.pdf'],
  'UX Designer',
  'Design',
  'Use Ask Expert to generate initial wireframes based on best practices',
  'UX approved by representative users from each function'
),
-- Task 4.2: Build Dashboard Components
(
  '0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 2, 'XFI001-4-2',
  'Develop Dashboard Components',
  'Build reusable visualization components for the platform',
  'development',
  720, 'L3_workflow', 70,
  FALSE, NULL,
  ARRAY['wireframes/', 'component_library.json'],
  ARRAY['dashboard_components/', 'component_tests.log'],
  'Frontend Developer',
  'Development',
  'Use component templates, customize for Customer 360 requirements',
  'All components built and unit tested'
),
-- Task 4.3: Implement Search & Filtering
(
  '0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 3, 'XFI001-4-3',
  'Implement Search and Filter Capabilities',
  'Build advanced search and multi-dimensional filtering',
  'development',
  480, 'L3_workflow', 80,
  FALSE, NULL,
  ARRAY['customer_entity_model.json', 'filter_requirements.docx'],
  ARRAY['search_config.json', 'filter_api.yaml'],
  'Backend Developer',
  'Development',
  'Implement Elasticsearch-based search with faceted filtering',
  'Search returns relevant results in <2 seconds'
),
-- Task 4.4: Configure Access Controls
(
  '0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 4, 'XFI001-4-4',
  'Configure Role-Based Access Controls',
  'Implement RBAC for data and feature access',
  'configuration',
  240, 'L3_workflow', 85,
  TRUE, 'Access controls require compliance review',
  ARRAY['role_definitions.json', 'data_classification.xlsx'],
  ARRAY['rbac_config.json', 'access_matrix.xlsx'],
  'Security Engineer',
  'Security',
  'Auto-generate RBAC from role definitions, configure field-level security',
  'Access controls pass compliance audit'
),
-- Task 4.5: User Acceptance Testing
(
  '0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 5, 'XFI001-4-5',
  'Conduct User Acceptance Testing',
  'Execute UAT with users from Medical, Commercial, Market Access',
  'testing',
  480, 'L1_expert', 35,
  TRUE, 'UAT sign-off required before go-live',
  ARRAY['UAT test scripts', 'Test data'],
  ARRAY['uat_results.xlsx', 'defect_log.json'],
  'Business Analyst',
  'Testing',
  'Use Ask Expert to prioritize test scenarios, coordinate UAT sessions',
  'All critical test cases pass, no severity-1 defects'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- Stage 5: Governance & Maintenance (24 hours)
-- Stage ID: 3fd4208e-261c-4f24-85ac-e06d5345508e

INSERT INTO workflow_tasks (
  stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
) VALUES
-- Task 5.1: Establish Data Governance
(
  '3fd4208e-261c-4f24-85ac-e06d5345508e', 1, 'XFI001-5-1',
  'Establish Data Governance Framework',
  'Define data ownership, stewardship, and quality responsibilities',
  'governance',
  360, 'L2_panel', 45,
  TRUE, 'Governance requires cross-functional agreement',
  ARRAY['Data catalog', 'Organization chart'],
  ARRAY['governance_framework.pdf', 'ownership_matrix.xlsx'],
  'Data Governance Lead',
  'Governance',
  'Use Ask Panel to build consensus on governance model',
  'Governance framework approved by Data Council'
),
-- Task 5.2: Create Operational Runbooks
(
  '3fd4208e-261c-4f24-85ac-e06d5345508e', 2, 'XFI001-5-2',
  'Develop Operational Runbooks',
  'Document operational procedures for monitoring and incident response',
  'documentation',
  240, 'L1_expert', 70,
  FALSE, NULL,
  ARRAY['System architecture', 'Alert configurations'],
  ARRAY['runbooks/', 'escalation_matrix.pdf'],
  'DevOps Engineer',
  'Operations',
  'Use Ask Expert to generate runbook templates, customize for platform',
  'Runbooks cover all critical operational scenarios'
),
-- Task 5.3: Configure Monitoring & Alerts
(
  '3fd4208e-261c-4f24-85ac-e06d5345508e', 3, 'XFI001-5-3',
  'Configure Production Monitoring',
  'Set up monitoring dashboards and alerting for production',
  'configuration',
  180, 'L3_workflow', 90,
  FALSE, NULL,
  ARRAY['runbooks/', 'SLA requirements.docx'],
  ARRAY['monitoring_config.json', 'alert_rules.yaml'],
  'DevOps Engineer',
  'Monitoring',
  'Auto-configure standard monitoring using infrastructure templates',
  'Monitoring covers all critical metrics with appropriate thresholds'
),
-- Task 5.4: Train End Users
(
  '3fd4208e-261c-4f24-85ac-e06d5345508e', 4, 'XFI001-5-4',
  'Conduct End User Training',
  'Train users from Medical, Commercial, Market Access on platform use',
  'training',
  360, 'L1_expert', 50,
  TRUE, 'Training completion required before full rollout',
  ARRAY['user_guide.pdf', 'training_materials/'],
  ARRAY['training_completion.xlsx', 'certification_records.json'],
  'Training Specialist',
  'Training',
  'Use Ask Expert to personalize training paths per user role',
  '>90% of target users complete training'
),
-- Task 5.5: Go-Live and Transition
(
  '3fd4208e-261c-4f24-85ac-e06d5345508e', 5, 'XFI001-5-5',
  'Execute Go-Live and Project Transition',
  'Transition from project to operations with hypercare support',
  'transition',
  180, 'L1_expert', 40,
  TRUE, 'Go-live requires formal approval',
  ARRAY['UAT sign-off', 'Training completion', 'Runbooks'],
  ARRAY['go_live_checklist.pdf', 'transition_complete.json'],
  'Project Manager',
  'Transition',
  'Execute go-live checklist, coordinate hypercare period',
  'Platform live with hypercare support active'
)
ON CONFLICT (task_code) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  description = EXCLUDED.description,
  service_layer = EXCLUDED.service_layer,
  ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- STEP 5: Create summary views for task analysis
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_task_summary AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  ws.stage_name,
  t.task_code,
  t.task_name,
  t.service_layer,
  t.ai_automation_score,
  t.is_hitl_checkpoint,
  t.estimated_duration_minutes,
  t.required_role,
  t.task_type
FROM workflow_tasks t
JOIN workflow_stages ws ON ws.id = t.stage_id
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
ORDER BY wt.code, ws.stage_number, t.task_number;

CREATE OR REPLACE VIEW v_workflow_task_by_service_layer AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  t.service_layer,
  COUNT(*) as task_count,
  ROUND(AVG(t.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(t.estimated_duration_minutes) as total_duration_minutes,
  SUM(CASE WHEN t.is_hitl_checkpoint THEN 1 ELSE 0 END) as hitl_checkpoints
FROM workflow_tasks t
JOIN workflow_stages ws ON ws.id = t.stage_id
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
GROUP BY wt.code, wt.name, wt.work_mode, t.service_layer
ORDER BY wt.code, t.service_layer;

CREATE OR REPLACE VIEW v_workflow_automation_potential AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  COUNT(*) as total_tasks,
  SUM(CASE WHEN t.ai_automation_score >= 80 THEN 1 ELSE 0 END) as high_automation_tasks,
  SUM(CASE WHEN t.ai_automation_score >= 50 AND t.ai_automation_score < 80 THEN 1 ELSE 0 END) as medium_automation_tasks,
  SUM(CASE WHEN t.ai_automation_score < 50 THEN 1 ELSE 0 END) as low_automation_tasks,
  ROUND(AVG(t.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(t.estimated_duration_minutes) as total_duration_minutes,
  SUM(t.estimated_duration_minutes * t.ai_automation_score / 100) as automatable_minutes
FROM workflow_tasks t
JOIN workflow_stages ws ON ws.id = t.stage_id
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
GROUP BY wt.code, wt.name, wt.work_mode
ORDER BY avg_automation_score DESC;

-- ============================================================================
-- STEP 6: Create indexes for task queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_service_layer ON workflow_tasks(service_layer);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_automation_score ON workflow_tasks(ai_automation_score);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_hitl ON workflow_tasks(is_hitl_checkpoint) WHERE is_hitl_checkpoint = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_code ON workflow_tasks(task_code);

-- ============================================================================
-- Verification queries (run after migration)
-- ============================================================================
-- SELECT * FROM v_workflow_task_summary WHERE workflow_code = 'WF-MAI-001';
-- SELECT * FROM v_workflow_task_by_service_layer;
-- SELECT * FROM v_workflow_automation_potential;
