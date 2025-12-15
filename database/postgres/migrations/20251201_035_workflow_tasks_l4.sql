-- Migration: 20251201_035_workflow_tasks_l4.sql
-- Purpose: Add L4 tasks for all 108 activities across 8 remaining workflows
-- Each activity gets 1 focused task with AI automation scoring

-- ============================================================================
-- WF-MAI-002: Scientific Literature Monitoring Workflow
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Literature Search & Collection
  ('750881a0-57c9-48e7-b67e-7641512e80ce', 1, 'MAI002-S1-A1-T1', 'Build PubMed/Embase query', 'manual', 'L1_expert', 70, false, NULL, 30, 'Construct Boolean search query with MeSH terms'),
  ('a11cda51-27ef-4727-987a-38a0e09be388', 1, 'MAI002-S1-A2-T1', 'Execute database searches', 'automated', 'L3_workflow', 95, false, NULL, 15, 'Run automated queries across literature databases'),
  ('f5d8f04f-5776-4ba0-92e4-aa550cd0f57c', 1, 'MAI002-S1-A3-T1', 'Deduplicate results', 'automated', 'L3_workflow', 98, false, NULL, 10, 'AI-powered duplicate detection and removal'),

  -- Stage 2: Screening & Prioritization
  ('680b4649-c83c-4dad-8527-b65124eb6477', 1, 'MAI002-S2-A1-T1', 'ML abstract screening', 'automated', 'L3_workflow', 90, false, NULL, 10, 'ML model classifies relevance from abstracts'),
  ('12afefcd-2e55-4a27-adbd-eeebef885598', 1, 'MAI002-S2-A2-T1', 'Review full articles', 'review', 'L1_expert', 40, true, 'Expert judgment needed for inclusion criteria', 60, 'Medical expert reviews full texts for inclusion'),
  ('3b7bbfa2-dac0-428a-b23e-693574975933', 1, 'MAI002-S2-A3-T1', 'Score priority level', 'automated', 'L3_workflow', 85, false, NULL, 15, 'AI scores articles by therapeutic relevance'),

  -- Stage 3: Trend Analysis & Synthesis
  ('2c56e5ac-ec7d-4953-8fbc-6d861a233925', 1, 'MAI002-S3-A1-T1', 'Extract findings with AI', 'automated', 'L3_workflow', 88, false, NULL, 30, 'NLP extraction of key results and conclusions'),
  ('d20f8fac-f349-4baa-a3a8-f8aa8c6b4544', 1, 'MAI002-S3-A2-T1', 'Detect research trends', 'automated', 'L3_workflow', 92, false, NULL, 20, 'AI identifies emerging themes across corpus'),
  ('fefb5e33-9bd2-4c83-8f49-f40e1fc09ad5', 1, 'MAI002-S3-A3-T1', 'Generate synthesis', 'automated', 'L2_panel', 75, true, 'Expert review of AI synthesis for accuracy', 30, 'AI generates executive summary for review'),

  -- Stage 4: Dissemination & Action
  ('9de1af8e-42e9-49d2-af59-365a47110739', 1, 'MAI002-S4-A1-T1', 'Format outputs', 'automated', 'L3_workflow', 95, false, NULL, 15, 'Auto-format for different stakeholder audiences'),
  ('a9274017-bfa8-4b0f-b950-c82ac81aa0ad', 1, 'MAI002-S4-A2-T1', 'Distribute alerts', 'automated', 'L3_workflow', 98, false, NULL, 5, 'Automated email and dashboard distribution'),
  ('01ced00c-6b2c-44b7-ae94-5f7c5e4e8ec7', 1, 'MAI002-S4-A3-T1', 'Track engagement', 'automated', 'L3_workflow', 95, false, NULL, 10, 'Analytics on opens, downloads, actions')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-MAI-003: Medical Affairs ROI Measurement Workflow
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Define Measurement Framework
  ('22e66a36-d172-4ff6-a2e5-20751d26d06b', 1, 'MAI003-S1-A1-T1', 'Define ROI KPIs', 'decision', 'L2_panel', 50, true, 'Strategic KPI selection requires leadership input', 45, 'Facilitate KPI workshop with stakeholders'),
  ('dad4b592-ea3d-41e7-bcd7-c2f5b428abc5', 1, 'MAI003-S1-A2-T1', 'Map data sources', 'manual', 'L1_expert', 65, false, NULL, 30, 'Document systems containing required metrics'),
  ('d0df0322-01b8-487a-8ab1-280726cdb602', 1, 'MAI003-S1-A3-T1', 'Set baseline targets', 'decision', 'L2_panel', 45, true, 'Targets need cross-functional agreement', 30, 'Establish baseline and improvement goals'),

  -- Stage 2: Data Collection & Integration
  ('61f694cf-61db-4ee2-a8c3-7e642444861b', 1, 'MAI003-S2-A1-T1', 'Extract MSL activities', 'automated', 'L3_workflow', 92, false, NULL, 15, 'Pull CRM interactions, events, meetings'),
  ('e2d14e0d-61f3-4086-b846-00c770e981cc', 1, 'MAI003-S2-A2-T1', 'Extract outcome data', 'automated', 'L3_workflow', 90, false, NULL, 20, 'Pull Rx data, market share, NPS scores'),
  ('b94e515a-f0e5-4ebb-bc12-5f15f4f25807', 1, 'MAI003-S2-A3-T1', 'Validate data quality', 'automated', 'L3_workflow', 85, false, NULL, 15, 'AI data quality checks for completeness'),

  -- Stage 3: Analysis & Valuation
  ('ddc198cd-086c-454f-8f26-9dc556ed8b60', 1, 'MAI003-S3-A1-T1', 'Calculate ROI metrics', 'automated', 'L3_workflow', 95, false, NULL, 20, 'Apply ROI formulas to collected data'),
  ('9591ca4b-4824-4891-8480-c4e1c1b31bc0', 1, 'MAI003-S3-A2-T1', 'Run attribution model', 'automated', 'L3_workflow', 80, false, NULL, 30, 'ML attribution of outcomes to activities'),
  ('26fa5ff6-5236-44ba-8245-6a648704765f', 1, 'MAI003-S3-A3-T1', 'Generate comparisons', 'automated', 'L3_workflow', 90, false, NULL, 20, 'Benchmark vs prior periods and industry'),

  -- Stage 4: Reporting & Communication
  ('b6f4e452-429a-4a7e-9a5f-6ebb7810f9e6', 1, 'MAI003-S4-A1-T1', 'Build ROI dashboard', 'automated', 'L3_workflow', 92, false, NULL, 20, 'Auto-generate interactive visualizations'),
  ('428f15c9-3e74-4352-816b-643205a7ccae', 1, 'MAI003-S4-A2-T1', 'Create exec report', 'automated', 'L2_panel', 70, true, 'Executive messaging needs human polish', 30, 'AI draft for leadership presentation'),
  ('7ce43412-f1b0-4d6d-8c4b-73fd942b3797', 1, 'MAI003-S4-A3-T1', 'Recommend optimizations', 'automated', 'L1_expert', 75, false, NULL, 20, 'AI-generated recommendations for review')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-MAI-004: Field Medical Insights Workflow
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Insight Capture
  ('9535d6a7-4b53-4a08-bbfa-0d1e85ef5b73', 1, 'MAI004-S1-A1-T1', 'Capture MSL insights', 'manual', 'L1_expert', 60, false, NULL, 10, 'MSL logs HCP interaction insights'),
  ('64af7d48-441e-4bc5-bc72-ebf3d761c939', 1, 'MAI004-S1-A2-T1', 'Document congress findings', 'manual', 'L1_expert', 55, false, NULL, 20, 'Capture key findings from medical congress'),
  ('e1c220e1-3f3e-4546-9be6-0886efe09337', 1, 'MAI004-S1-A3-T1', 'Process ad board notes', 'automated', 'L3_workflow', 85, false, NULL, 25, 'AI structures raw advisory board notes'),

  -- Stage 2: Insight Aggregation & Quality Review
  ('29710f73-8b8d-49ba-8944-d970ba48c6b3', 1, 'MAI004-S2-A1-T1', 'Cluster similar insights', 'automated', 'L3_workflow', 92, false, NULL, 15, 'AI groups related insights automatically'),
  ('4040a754-6337-4d02-99c9-f43b2100d2f5', 1, 'MAI004-S2-A2-T1', 'Compliance check', 'review', 'L1_expert', 50, true, 'PHI/PII must be human-verified', 20, 'Ensure no protected information in insights'),
  ('a95e6b82-f961-4ae0-982a-6c0019c465f9', 1, 'MAI004-S2-A3-T1', 'Enrich with tags', 'automated', 'L3_workflow', 90, false, NULL, 10, 'Auto-tag by TA, sentiment, urgency'),

  -- Stage 3: Analysis & Theme Identification
  ('0c372274-3e21-4458-8566-7ad1b9b014ea', 1, 'MAI004-S3-A1-T1', 'Extract themes', 'automated', 'L3_workflow', 88, false, NULL, 20, 'NLP identifies recurring themes'),
  ('498f65ba-afbf-435a-b53a-80c54545c95c', 1, 'MAI004-S3-A2-T1', 'Analyze trends', 'automated', 'L3_workflow', 85, false, NULL, 25, 'Track theme evolution over time'),
  ('6fb5230d-8885-4777-b02c-c3db480557ab', 1, 'MAI004-S3-A3-T1', 'Prioritize by impact', 'decision', 'L2_panel', 60, true, 'Strategic prioritization needs human judgment', 20, 'Rank themes by strategic importance'),

  -- Stage 4: Synthesis & Dissemination
  ('20c854fe-9c36-49a2-849c-c0534765717e', 1, 'MAI004-S4-A1-T1', 'Generate insight report', 'automated', 'L3_workflow', 85, false, NULL, 25, 'AI creates actionable insight summary'),
  ('31e8ec16-a5e2-4e2a-ae71-c099a6131b74', 1, 'MAI004-S4-A2-T1', 'Distribute to functions', 'automated', 'L3_workflow', 95, false, NULL, 10, 'Auto-route to relevant teams'),
  ('c68bccfb-a59c-4ad5-9c50-94777f5632ea', 1, 'MAI004-S4-A3-T1', 'Track insight actions', 'automated', 'L3_workflow', 90, false, NULL, 15, 'Monitor which insights drove decisions')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-MAI-005: KOL Profiling and Mapping Project
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Project Scoping & Planning
  ('d0161cb8-91b0-442d-9489-00f642815e83', 1, 'MAI005-S1-A1-T1', 'Define TA scope', 'decision', 'L2_panel', 40, true, 'Therapeutic area selection is strategic', 60, 'Define disease areas and geographies'),
  ('84ff71a9-7b1b-437c-b183-f01166d65e56', 1, 'MAI005-S1-A2-T1', 'Set profiling criteria', 'decision', 'L2_panel', 45, true, 'KOL criteria needs stakeholder alignment', 45, 'Define what constitutes a KOL'),
  ('1bb245c2-d6b2-45cc-8788-3d6f15dc4cf0', 1, 'MAI005-S1-A3-T1', 'Plan resources', 'manual', 'L1_expert', 55, false, NULL, 30, 'Allocate team and set milestones'),

  -- Stage 2: Data Collection
  ('6db272c6-fb8c-451a-a07d-3c024080e758', 1, 'MAI005-S2-A1-T1', 'Mine publications', 'automated', 'L3_workflow', 92, false, NULL, 90, 'AI extracts authorship from PubMed'),
  ('a2f1f2a2-d048-41f2-8659-f5dad78606d2', 1, 'MAI005-S2-A2-T1', 'Extract trial investigators', 'automated', 'L3_workflow', 95, false, NULL, 60, 'Scrape ClinicalTrials.gov for PIs'),
  ('688a9071-6900-40d0-af18-a68175696b80', 1, 'MAI005-S2-A3-T1', 'Track congress speakers', 'automated', 'L3_workflow', 88, false, NULL, 45, 'AI identifies congress presentations'),
  ('a771c8f5-003c-402d-a83b-3c61b1e44b5a', 1, 'MAI005-S2-A4-T1', 'Analyze social presence', 'automated', 'L3_workflow', 85, false, NULL, 30, 'AI analyzes Twitter/LinkedIn influence'),

  -- Stage 3: Profiling & Scoring
  ('acaa85c7-4233-4feb-b9f0-a45867ab3611', 1, 'MAI005-S3-A1-T1', 'Build profiles', 'automated', 'L3_workflow', 80, false, NULL, 120, 'Consolidate data into structured profiles'),
  ('fe06854f-d3cf-474f-a8e8-00b295c4c16b', 1, 'MAI005-S3-A2-T1', 'Apply scoring algorithm', 'automated', 'L3_workflow', 95, false, NULL, 30, 'Calculate influence scores per criteria'),
  ('cd86c361-7b8b-44fd-9349-913f28444eaa', 1, 'MAI005-S3-A3-T1', 'Classify tiers', 'automated', 'L3_workflow', 90, false, NULL, 20, 'Segment into Tier 1/2/3'),

  -- Stage 4: Mapping & Visualization
  ('45a2545d-3d6c-4973-9790-b42b80fac073', 1, 'MAI005-S4-A1-T1', 'Map collaboration network', 'automated', 'L3_workflow', 85, false, NULL, 60, 'AI maps co-authorship networks'),
  ('c1b7caa9-630f-4151-9dfb-9daaf14a01ab', 1, 'MAI005-S4-A2-T1', 'Generate geo mapping', 'automated', 'L3_workflow', 95, false, NULL, 30, 'Visualize KOL distribution by region'),
  ('b6262de9-eeec-4bf4-aa66-cf5dc46b9967', 1, 'MAI005-S4-A3-T1', 'Map affiliations', 'automated', 'L3_workflow', 88, false, NULL, 25, 'Link KOLs to institutions'),

  -- Stage 5: Validation & Rollout
  ('27770ce4-160b-4124-beac-961cda330c42', 1, 'MAI005-S5-A1-T1', 'MSL validation', 'review', 'L1_expert', 35, true, 'Field team validates profile accuracy', 90, 'MSLs review and correct profiles'),
  ('eeb8ccc5-0519-4c79-8641-7c1a35f620c7', 1, 'MAI005-S5-A2-T1', 'Load to CRM', 'automated', 'L3_workflow', 95, false, NULL, 30, 'Integrate profiles into engagement platform'),
  ('a09a27ad-b95c-4d5a-b796-6ac606f20ea2', 1, 'MAI005-S5-A3-T1', 'Train users', 'manual', 'L1_expert', 30, false, NULL, 45, 'Train teams on using KOL database')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-XFI-002: Integrated Evidence Planning Project
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Payer Evidence Needs Assessment
  ('d9dd9b98-95a7-4755-a49e-ada05307a463', 1, 'XFI002-S1-A1-T1', 'Analyze payer landscape', 'automated', 'L2_panel', 70, false, NULL, 90, 'AI maps payer requirements by market'),
  ('6f212b0d-9bf6-400e-8b8f-cc9b37eb5bf9', 1, 'XFI002-S1-A2-T1', 'Document HTA requirements', 'manual', 'L1_expert', 55, false, NULL, 60, 'Compile NICE, ICER, AMNOG standards'),
  ('4d4caed9-27a2-47b0-af42-4e69952bbc50', 1, 'XFI002-S1-A3-T1', 'Benchmark competitor evidence', 'automated', 'L3_workflow', 85, false, NULL, 45, 'AI analyzes competitor evidence portfolios'),

  -- Stage 2: Evidence Gap Analysis
  ('72e86050-101a-4640-9043-47651e498ee2', 1, 'XFI002-S2-A1-T1', 'Inventory current evidence', 'automated', 'L3_workflow', 90, false, NULL, 60, 'Catalog existing clinical and RWE data'),
  ('a43c0367-256f-443a-9a59-2f02c6172790', 1, 'XFI002-S2-A2-T1', 'Identify gaps', 'automated', 'L3_workflow', 85, false, NULL, 45, 'AI maps evidence gaps vs payer needs'),
  ('8d48d938-1be3-468b-9d13-47b6b2e607f4', 1, 'XFI002-S2-A3-T1', 'Prioritize gaps', 'decision', 'L2_panel', 50, true, 'Prioritization requires strategic input', 30, 'Rank gaps by market impact'),

  -- Stage 3: Evidence Generation Planning
  ('b84e71e2-3b9e-481d-bef3-57ddfd4da489', 1, 'XFI002-S3-A1-T1', 'Select study designs', 'decision', 'L2_panel', 45, true, 'Study design selection is strategic', 90, 'Choose RCT, RWE, modeling approaches'),
  ('bfc95a66-b549-4074-8aa8-1be44744edec', 1, 'XFI002-S3-A2-T1', 'Plan budget/timeline', 'manual', 'L1_expert', 60, false, NULL, 60, 'Estimate costs and timeline per study'),
  ('b12ac054-b60f-4ded-a929-2bde71b1d248', 1, 'XFI002-S3-A3-T1', 'Select vendors', 'decision', 'L2_panel', 55, true, 'Vendor selection needs cross-functional input', 45, 'Identify CROs and data partners'),

  -- Stage 4: Cross-Functional Alignment
  ('31d7af3d-1ff3-4945-a23b-9eb00cbaec40', 1, 'XFI002-S4-A1-T1', 'Align with MA', 'decision', 'L2_panel', 40, true, 'Publication alignment is strategic', 45, 'Ensure MA publication strategy alignment'),
  ('ed2a5f61-afeb-4226-b6ba-27fda26e35df', 1, 'XFI002-S4-A2-T1', 'Align with Commercial', 'decision', 'L2_panel', 40, true, 'Brand alignment needs stakeholder input', 45, 'Align with positioning and messaging'),
  ('0e2a8383-8a37-4721-9c1f-1f3ade69aaf8', 1, 'XFI002-S4-A3-T1', 'Regulatory review', 'review', 'L1_expert', 35, true, 'Regulatory compliance is critical', 30, 'Ensure regulatory compliance of studies'),

  -- Stage 5: Execution & Tracking
  ('56648903-3fd8-47f9-934d-9d72c4fe0307', 1, 'XFI002-S5-A1-T1', 'Launch studies', 'manual', 'L1_expert', 40, false, NULL, 120, 'Initiate studies and track milestones'),
  ('154c7377-2336-4a39-b6e3-498856ac9ee3', 1, 'XFI002-S5-A2-T1', 'Report progress', 'automated', 'L3_workflow', 85, false, NULL, 30, 'Automated status updates to stakeholders'),
  ('0230ee3a-4646-4d4a-9d71-568feb8e6990', 1, 'XFI002-S5-A3-T1', 'Adaptive replan', 'decision', 'L2_panel', 45, true, 'Replanning needs stakeholder alignment', 45, 'Adjust plan based on emerging needs')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-XFI-003: Integrated Launch Performance Tracking Workflow
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Data Collection
  ('8fdb9454-1a97-4b2e-b880-3c3a2e3dc817', 1, 'XFI003-S1-A1-T1', 'Extract sales data', 'automated', 'L3_workflow', 95, false, NULL, 15, 'Pull prescription and revenue data'),
  ('5e89e66a-c8e3-4c52-84bb-dcf7558826ad', 1, 'XFI003-S1-A2-T1', 'Collect access metrics', 'automated', 'L3_workflow', 92, false, NULL, 15, 'Pull formulary and coverage data'),
  ('5cc06d59-1f57-4f7d-b5cc-4463f9cbcc2f', 1, 'XFI003-S1-A3-T1', 'Extract MA activity', 'automated', 'L3_workflow', 90, false, NULL, 15, 'Pull MSL interactions, KOL engagements'),
  ('1d9c8481-a27f-45f8-aec9-9306473faa22', 1, 'XFI003-S1-A4-T1', 'Pull marketing data', 'automated', 'L3_workflow', 92, false, NULL, 15, 'Collect digital and field campaign metrics'),

  -- Stage 2: Integration & Analysis
  ('634e3c7f-2c15-418b-b199-f87727566871', 1, 'XFI003-S2-A1-T1', 'Integrate data sources', 'automated', 'L3_workflow', 95, false, NULL, 25, 'Merge into unified launch view'),
  ('e8362e29-21a8-4a76-aef0-849688c2d2ee', 1, 'XFI003-S2-A2-T1', 'Calculate launch KPIs', 'automated', 'L3_workflow', 95, false, NULL, 15, 'Compute KPIs vs targets'),
  ('ef8d2145-d4c9-4b21-a45b-8b87e3d767e0', 1, 'XFI003-S2-A3-T1', 'Analyze variance', 'automated', 'L3_workflow', 88, false, NULL, 25, 'Identify over/under performance drivers'),

  -- Stage 3: Reporting & Communication
  ('9e07cbfe-00f2-44ad-86f8-9ee6933397f3', 1, 'XFI003-S3-A1-T1', 'Update dashboard', 'automated', 'L3_workflow', 98, false, NULL, 10, 'Refresh launch performance dashboards'),
  ('78187642-1952-45e5-bca7-5ef56a3a1803', 1, 'XFI003-S3-A2-T1', 'Generate exec report', 'automated', 'L2_panel', 75, true, 'Executive summary needs human review', 25, 'Create leadership summary report'),
  ('9470cb26-3d86-416d-873f-2f6d05fd988e', 1, 'XFI003-S3-A3-T1', 'Tailor function briefs', 'automated', 'L3_workflow', 85, false, NULL, 20, 'Generate function-specific insights'),

  -- Stage 4: Action & Optimization
  ('018b3962-bbf9-4e9e-8d76-6f3319848cff', 1, 'XFI003-S4-A1-T1', 'Identify opportunities', 'automated', 'L3_workflow', 80, false, NULL, 20, 'AI pinpoints areas needing intervention'),
  ('78b4c101-ee58-406b-b6d5-3ec20b659b11', 1, 'XFI003-S4-A2-T1', 'Plan cross-functional actions', 'decision', 'L2_panel', 45, true, 'Action planning needs cross-functional buy-in', 30, 'Coordinate corrective actions'),
  ('b6cf06d2-a8fb-43f1-b9b0-a7690ef3ecb8', 1, 'XFI003-S4-A3-T1', 'Track action outcomes', 'automated', 'L3_workflow', 90, false, NULL, 15, 'Monitor effectiveness of interventions')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-XFI-004: Integrated Competitive Intelligence Workflow
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Intelligence Gathering
  ('c89ac242-8be9-41cd-b442-64845084f0c2', 1, 'XFI004-S1-A1-T1', 'Monitor news feeds', 'automated', 'L3_workflow', 98, false, NULL, 10, 'AI scans news, press releases, SEC filings'),
  ('63f35283-1631-4406-9e2e-672d707d2de8', 1, 'XFI004-S1-A2-T1', 'Track competitor trials', 'automated', 'L3_workflow', 95, false, NULL, 15, 'Monitor competitor pipeline progress'),
  ('c19209b7-e991-4360-a18c-109bde7d4448', 1, 'XFI004-S1-A3-T1', 'Cover congresses', 'manual', 'L1_expert', 50, false, NULL, 40, 'Capture competitor presentations live'),
  ('44a64f90-7d75-4f68-93e8-b941842cabb8', 1, 'XFI004-S1-A4-T1', 'Collect field intel', 'manual', 'L1_expert', 45, false, NULL, 20, 'Gather insights from sales and MSL teams'),

  -- Stage 2: Analysis & Synthesis
  ('c3dd79bd-e107-4b62-b494-3bb766f2a707', 1, 'XFI004-S2-A1-T1', 'Analyze positioning', 'automated', 'L2_panel', 70, false, NULL, 35, 'AI maps competitor positioning'),
  ('24381438-cb54-492e-9632-a74ae7a3bd68', 1, 'XFI004-S2-A2-T1', 'Assess pipeline impact', 'manual', 'L1_expert', 55, true, 'Threat assessment needs expert judgment', 50, 'Evaluate threat level of competitor pipeline'),
  ('95688286-b9ba-4007-9d2b-21899ae3dcff', 1, 'XFI004-S2-A3-T1', 'Model market share', 'automated', 'L3_workflow', 80, false, NULL, 35, 'AI models potential market share shifts'),

  -- Stage 3: Reporting & Dissemination
  ('73051cf0-2fbd-47e4-ab76-cc59a8615bc0', 1, 'XFI004-S3-A1-T1', 'Update CI dashboard', 'automated', 'L3_workflow', 98, false, NULL, 10, 'Refresh competitive intelligence portal'),
  ('130a417b-4dfa-4c40-88cb-c91ed30006e0', 1, 'XFI004-S3-A2-T1', 'Send alerts', 'automated', 'L3_workflow', 98, false, NULL, 5, 'Distribute urgent competitor news'),
  ('8a844c8a-7834-4a59-b50c-dbee47d95910', 1, 'XFI004-S3-A3-T1', 'Generate monthly CI', 'automated', 'L2_panel', 75, true, 'Monthly summary needs human curation', 35, 'Create comprehensive monthly summary'),

  -- Stage 4: Strategic Response Planning
  ('1b335437-755c-4fd4-a49e-364f301ae492', 1, 'XFI004-S4-A1-T1', 'Develop scenarios', 'manual', 'L1_expert', 40, true, 'Scenario planning requires strategy expertise', 50, 'Develop response scenarios for key events'),
  ('0d717a0c-2871-49ce-acd1-372b408f9c58', 1, 'XFI004-S4-A2-T1', 'Conduct war games', 'manual', 'L2_panel', 25, true, 'War gaming requires cross-functional participation', 90, 'Facilitate competitive war gaming sessions'),
  ('4f8a9162-701e-4df4-8966-b3d084a0b2a2', 1, 'XFI004-S4-A3-T1', 'Update playbooks', 'manual', 'L1_expert', 50, false, NULL, 25, 'Update competitive response playbooks')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- WF-XFI-005: Integrated Forecasting Model Build Project
-- ============================================================================

INSERT INTO workflow_tasks (activity_id, task_number, task_code, task_name, task_type, service_layer, ai_automation_score, is_hitl_checkpoint, hitl_reason, estimated_duration_minutes, instructions)
VALUES
  -- Stage 1: Model Design & Planning
  ('32e80e3a-486b-4ad3-9dfe-c87072ea0f01', 1, 'XFI005-S1-A1-T1', 'Define forecast scope', 'decision', 'L2_panel', 40, true, 'Scope definition needs stakeholder alignment', 60, 'Define products, markets, time horizons'),
  ('22fafbb9-6ed3-4ede-9b05-1e944c6e375f', 1, 'XFI005-S1-A2-T1', 'Design architecture', 'decision', 'L2_panel', 45, true, 'Architecture choice impacts all downstream', 90, 'Choose bottom-up, top-down, or hybrid'),
  ('019a60fb-7362-41ce-8b03-6cb5090a688a', 1, 'XFI005-S1-A3-T1', 'Specify data requirements', 'manual', 'L1_expert', 55, false, NULL, 45, 'Document all required input data'),

  -- Stage 2: Data Collection & Preparation
  ('2b89def7-9d2e-430c-9fec-b365aad53ec6', 1, 'XFI005-S2-A1-T1', 'Assemble historical data', 'automated', 'L3_workflow', 90, false, NULL, 120, 'Collect 3-5 years of historical data'),
  ('9fb7b245-658d-4618-80b8-44020a911855', 1, 'XFI005-S2-A2-T1', 'Integrate market research', 'manual', 'L1_expert', 55, false, NULL, 60, 'Incorporate primary research findings'),
  ('80b8f702-84ff-480b-8478-c8eef8ac9836', 1, 'XFI005-S2-A3-T1', 'Cleanse and validate', 'automated', 'L3_workflow', 88, false, NULL, 45, 'Ensure data quality and consistency'),

  -- Stage 3: Model Building & Validation
  ('9a01c5d1-2045-4f2c-8a0c-b12771733c3b', 1, 'XFI005-S3-A1-T1', 'Build base model', 'automated', 'L3_workflow', 75, false, NULL, 150, 'Develop core forecasting algorithms'),
  ('ee3c3119-293e-40a0-82b6-b1ac33952bf4', 1, 'XFI005-S3-A2-T1', 'Build scenarios', 'manual', 'L1_expert', 55, false, NULL, 90, 'Create upside/downside scenarios'),
  ('861503bd-1b96-44f0-b6f7-2e5b68c9573f', 1, 'XFI005-S3-A3-T1', 'Backtest model', 'automated', 'L3_workflow', 90, false, NULL, 60, 'Validate against historical data'),

  -- Stage 4: Review & Alignment
  ('64aa9c0f-c218-4279-ba08-017edf242206', 1, 'XFI005-S4-A1-T1', 'Cross-functional review', 'review', 'L2_panel', 35, true, 'Stakeholder buy-in critical for adoption', 90, 'Present to MA, Commercial, Finance'),
  ('de3019c2-aee4-4e2c-a66a-34aec7e7e3a8', 1, 'XFI005-S4-A2-T1', 'Validate assumptions', 'decision', 'L2_panel', 40, true, 'Assumption validation is strategic', 60, 'Validate key assumptions with stakeholders'),
  ('660d9cb0-08ce-4eeb-a14e-b1ebf36f69c6', 1, 'XFI005-S4-A3-T1', 'Refine model', 'manual', 'L1_expert', 50, false, NULL, 45, 'Incorporate feedback and refine'),

  -- Stage 5: Operationalization
  ('04774b2b-254b-4589-a1da-aae8b5f22d41', 1, 'XFI005-S5-A1-T1', 'Integrate systems', 'automated', 'L3_workflow', 85, false, NULL, 90, 'Connect to data feeds and reporting'),
  ('2b498be2-f465-4a2e-9ab3-193c5b11a51c', 1, 'XFI005-S5-A2-T1', 'Train users', 'manual', 'L1_expert', 30, false, NULL, 60, 'Train analysts on model usage'),
  ('2032aa38-7765-4b4f-86d7-8e1298370309', 1, 'XFI005-S5-A3-T1', 'Establish governance', 'manual', 'L1_expert', 35, true, 'Governance needs leadership approval', 30, 'Establish update cadence and ownership')
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, ai_automation_score = EXCLUDED.ai_automation_score;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT wt.code, COUNT(wta.id) as task_count
-- FROM workflow_templates wt
-- LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
-- LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
-- LEFT JOIN workflow_tasks wta ON wta.activity_id = wa.id
-- GROUP BY wt.code ORDER BY wt.code;
