-- Migration: 20251201_034_remaining_workflows_wbs.sql
-- Purpose: Add complete WBS hierarchy (L3-L5) to remaining 8 workflows
-- Workflows: WF-MAI-002, WF-MAI-003, WF-MAI-004, WF-MAI-005, WF-XFI-002, WF-XFI-003, WF-XFI-004, WF-XFI-005

-- ============================================================================
-- WF-MAI-002: Scientific Literature Monitoring Workflow (BAU - routine)
-- ============================================================================

-- Stage 1: Literature Search & Collection
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('6e94bd19-5f7d-4ade-ae87-4856d2d64f93', 1, 'MAI002-S1-A1', 'Configure Search Strategy', 'Define search terms, databases, and filters', true, 60),
  ('6e94bd19-5f7d-4ade-ae87-4856d2d64f93', 2, 'MAI002-S1-A2', 'Execute Automated Searches', 'Run searches across PubMed, Embase, Cochrane', true, 30),
  ('6e94bd19-5f7d-4ade-ae87-4856d2d64f93', 3, 'MAI002-S1-A3', 'Deduplicate & Import', 'Remove duplicates and import to reference manager', true, 20)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Screening & Prioritization
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('99fae9f8-7023-4f34-ae8a-7f2153568117', 1, 'MAI002-S2-A1', 'AI-Assisted Title/Abstract Screening', 'ML model screens abstracts for relevance', true, 15),
  ('99fae9f8-7023-4f34-ae8a-7f2153568117', 2, 'MAI002-S2-A2', 'Full-Text Review', 'Deep review of shortlisted articles', true, 120),
  ('99fae9f8-7023-4f34-ae8a-7f2153568117', 3, 'MAI002-S2-A3', 'Priority Scoring', 'Score by therapeutic relevance and impact', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Trend Analysis & Synthesis
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('9555782f-7fad-4a28-b164-29cdf8d606c0', 1, 'MAI002-S3-A1', 'Extract Key Findings', 'Systematic extraction of results and conclusions', true, 90),
  ('9555782f-7fad-4a28-b164-29cdf8d606c0', 2, 'MAI002-S3-A2', 'Identify Trends & Patterns', 'AI-assisted trend detection across papers', true, 45),
  ('9555782f-7fad-4a28-b164-29cdf8d606c0', 3, 'MAI002-S3-A3', 'Generate Synthesis Report', 'Create executive summary with implications', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Dissemination & Action
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('1da455df-c6c5-4ee5-bb98-76a904865c87', 1, 'MAI002-S4-A1', 'Format for Stakeholders', 'Tailor outputs for different audiences', true, 30),
  ('1da455df-c6c5-4ee5-bb98-76a904865c87', 2, 'MAI002-S4-A2', 'Distribute via Channels', 'Email alerts, dashboards, newsletters', true, 15),
  ('1da455df-c6c5-4ee5-bb98-76a904865c87', 3, 'MAI002-S4-A3', 'Track Engagement & Actions', 'Monitor reads, downloads, follow-up actions', true, 20)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-MAI-003: Medical Affairs ROI Measurement Workflow (BAU - routine)
-- ============================================================================

-- Stage 1: Define Measurement Framework
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('e27a44e6-c7ce-45c6-a706-274b5a27de22', 1, 'MAI003-S1-A1', 'Define KPIs & Metrics', 'Establish ROI metrics aligned to strategy', true, 90),
  ('e27a44e6-c7ce-45c6-a706-274b5a27de22', 2, 'MAI003-S1-A2', 'Map Data Sources', 'Identify systems containing required data', true, 60),
  ('e27a44e6-c7ce-45c6-a706-274b5a27de22', 3, 'MAI003-S1-A3', 'Set Baseline & Targets', 'Establish current state and improvement goals', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Data Collection & Integration
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('3a658d58-2c7f-4fcd-a14b-1d9b430fe8ca', 1, 'MAI003-S2-A1', 'Extract Activity Data', 'Pull MSL interactions, events, publications', true, 30),
  ('3a658d58-2c7f-4fcd-a14b-1d9b430fe8ca', 2, 'MAI003-S2-A2', 'Extract Outcome Data', 'Pull prescription data, market share, NPS', true, 45),
  ('3a658d58-2c7f-4fcd-a14b-1d9b430fe8ca', 3, 'MAI003-S2-A3', 'Data Quality Validation', 'Check completeness and accuracy', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Analysis & Valuation
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('952eb291-4959-4be3-855d-08cdcc7a1e09', 1, 'MAI003-S3-A1', 'Calculate ROI Metrics', 'Apply formulas to compute ROI indicators', true, 60),
  ('952eb291-4959-4be3-855d-08cdcc7a1e09', 2, 'MAI003-S3-A2', 'Attribution Modeling', 'Attribute outcomes to MA activities', true, 90),
  ('952eb291-4959-4be3-855d-08cdcc7a1e09', 3, 'MAI003-S3-A3', 'Comparative Analysis', 'Benchmark vs prior periods and competitors', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Reporting & Communication
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('bd570f56-aff7-44e2-a69c-c0c6919c6dfd', 1, 'MAI003-S4-A1', 'Generate ROI Dashboard', 'Build interactive visualization', true, 45),
  ('bd570f56-aff7-44e2-a69c-c0c6919c6dfd', 2, 'MAI003-S4-A2', 'Executive Summary Report', 'Create C-suite ready presentation', true, 60),
  ('bd570f56-aff7-44e2-a69c-c0c6919c6dfd', 3, 'MAI003-S4-A3', 'Recommend Optimizations', 'Identify high-ROI activities to scale', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-MAI-004: Field Medical Insights Workflow (BAU - routine)
-- ============================================================================

-- Stage 1: Insight Capture
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('30cc0a49-89b2-4a61-a75f-b49cbf0dbcbf', 1, 'MAI004-S1-A1', 'MSL Interaction Logging', 'Capture insights from HCP conversations', true, 15),
  ('30cc0a49-89b2-4a61-a75f-b49cbf0dbcbf', 2, 'MAI004-S1-A2', 'Congress Insight Collection', 'Document findings from medical congresses', true, 30),
  ('30cc0a49-89b2-4a61-a75f-b49cbf0dbcbf', 3, 'MAI004-S1-A3', 'Ad Board Notes Processing', 'Structure insights from advisory boards', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Insight Aggregation & Quality Review
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('1d554ea6-1620-4ebd-9775-291c84beed9c', 1, 'MAI004-S2-A1', 'AI Deduplication & Clustering', 'Group similar insights automatically', true, 20),
  ('1d554ea6-1620-4ebd-9775-291c84beed9c', 2, 'MAI004-S2-A2', 'Quality & Compliance Check', 'Ensure no PII/PHI, proper attribution', true, 30),
  ('1d554ea6-1620-4ebd-9775-291c84beed9c', 3, 'MAI004-S2-A3', 'Enrichment & Tagging', 'Add therapeutic area, sentiment, urgency tags', true, 25)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Analysis & Theme Identification
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('a6e8d139-a44f-4e78-acd3-ff58d794ba11', 1, 'MAI004-S3-A1', 'Theme Extraction', 'AI identifies recurring themes across insights', true, 30),
  ('a6e8d139-a44f-4e78-acd3-ff58d794ba11', 2, 'MAI004-S3-A2', 'Trend Analysis', 'Track themes over time, detect emerging issues', true, 45),
  ('a6e8d139-a44f-4e78-acd3-ff58d794ba11', 3, 'MAI004-S3-A3', 'Impact Prioritization', 'Rank themes by strategic importance', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Synthesis & Dissemination
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('7e270056-76dd-46ce-b7e7-99aee7970d1b', 1, 'MAI004-S4-A1', 'Generate Insight Report', 'Create actionable insight summary', true, 45),
  ('7e270056-76dd-46ce-b7e7-99aee7970d1b', 2, 'MAI004-S4-A2', 'Cross-Functional Distribution', 'Share with R&D, Commercial, Regulatory', true, 20),
  ('7e270056-76dd-46ce-b7e7-99aee7970d1b', 3, 'MAI004-S4-A3', 'Track Insight Actions', 'Monitor which insights drove decisions', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-MAI-005: KOL Profiling and Mapping Project (Project)
-- ============================================================================

-- Stage 1: Project Scoping & Planning
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('1decb41f-82e8-49a2-940d-78543277094b', 1, 'MAI005-S1-A1', 'Define Therapeutic Scope', 'Identify disease areas and geographies', true, 120),
  ('1decb41f-82e8-49a2-940d-78543277094b', 2, 'MAI005-S1-A2', 'Establish Profiling Criteria', 'Define what makes a KOL (pubs, trials, influence)', true, 90),
  ('1decb41f-82e8-49a2-940d-78543277094b', 3, 'MAI005-S1-A3', 'Resource & Timeline Planning', 'Allocate team and set milestones', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Data Collection
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('61b5125f-1ff4-4ece-8b80-098b1a1a9c3a', 1, 'MAI005-S2-A1', 'Publication Mining', 'Extract authorship from PubMed, journals', true, 180),
  ('61b5125f-1ff4-4ece-8b80-098b1a1a9c3a', 2, 'MAI005-S2-A2', 'Clinical Trial Participation', 'Mine ClinicalTrials.gov for investigators', true, 120),
  ('61b5125f-1ff4-4ece-8b80-098b1a1a9c3a', 3, 'MAI005-S2-A3', 'Congress Speaker History', 'Track presentations at major congresses', true, 90),
  ('61b5125f-1ff4-4ece-8b80-098b1a1a9c3a', 4, 'MAI005-S2-A4', 'Social Media Influence', 'Analyze Twitter/LinkedIn presence', false, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Profiling & Scoring
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('3cf730bb-862b-4df9-bd37-a9a6b706f478', 1, 'MAI005-S3-A1', 'Build KOL Profiles', 'Consolidate data into structured profiles', true, 240),
  ('3cf730bb-862b-4df9-bd37-a9a6b706f478', 2, 'MAI005-S3-A2', 'Apply Scoring Algorithm', 'Calculate influence scores per criteria', true, 60),
  ('3cf730bb-862b-4df9-bd37-a9a6b706f478', 3, 'MAI005-S3-A3', 'Tier Classification', 'Segment into Tier 1/2/3 KOLs', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Mapping & Visualization
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('600c4f88-1406-480e-8ca8-2e08a3e53d96', 1, 'MAI005-S4-A1', 'Network Analysis', 'Map collaboration networks between KOLs', true, 120),
  ('600c4f88-1406-480e-8ca8-2e08a3e53d96', 2, 'MAI005-S4-A2', 'Geographic Mapping', 'Visualize KOL distribution by region', true, 60),
  ('600c4f88-1406-480e-8ca8-2e08a3e53d96', 3, 'MAI005-S4-A3', 'Affiliation Mapping', 'Link KOLs to institutions and societies', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 5: Validation & Rollout
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('e7107781-1112-4748-b9e6-5205de8fcae9', 1, 'MAI005-S5-A1', 'MSL Validation Review', 'Field team validates profile accuracy', true, 180),
  ('e7107781-1112-4748-b9e6-5205de8fcae9', 2, 'MAI005-S5-A2', 'System Integration', 'Load profiles into CRM/engagement platform', true, 60),
  ('e7107781-1112-4748-b9e6-5205de8fcae9', 3, 'MAI005-S5-A3', 'Training & Handoff', 'Train teams on using the KOL database', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-XFI-002: Integrated Evidence Planning Project (Project)
-- ============================================================================

-- Stage 1: Payer Evidence Needs Assessment
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('90640f44-67bc-4742-929a-e7142b4609f5', 1, 'XFI002-S1-A1', 'Payer Landscape Analysis', 'Map key payers and their evidence requirements', true, 180),
  ('90640f44-67bc-4742-929a-e7142b4609f5', 2, 'XFI002-S1-A2', 'HTA Body Requirements', 'Document NICE, ICER, AMNOG evidence standards', true, 120),
  ('90640f44-67bc-4742-929a-e7142b4609f5', 3, 'XFI002-S1-A3', 'Competitive Evidence Benchmark', 'Analyze competitor evidence portfolios', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Evidence Gap Analysis
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('49e35f24-c008-4703-b88b-8a8907a565e8', 1, 'XFI002-S2-A1', 'Current Evidence Inventory', 'Catalog existing clinical and RWE data', true, 120),
  ('49e35f24-c008-4703-b88b-8a8907a565e8', 2, 'XFI002-S2-A2', 'Gap Identification', 'Map evidence gaps vs payer needs', true, 90),
  ('49e35f24-c008-4703-b88b-8a8907a565e8', 3, 'XFI002-S2-A3', 'Prioritize Gaps', 'Rank gaps by market impact and feasibility', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Evidence Generation Planning
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('8f7b9707-3112-4358-985d-65306a40c880', 1, 'XFI002-S3-A1', 'Study Design Selection', 'Choose RCT, RWE, modeling approaches', true, 180),
  ('8f7b9707-3112-4358-985d-65306a40c880', 2, 'XFI002-S3-A2', 'Resource & Budget Planning', 'Estimate costs and timeline per study', true, 120),
  ('8f7b9707-3112-4358-985d-65306a40c880', 3, 'XFI002-S3-A3', 'Vendor Selection', 'Identify CROs, data partners for execution', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Cross-Functional Alignment
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('df32576b-3e5b-476f-90e1-879ea4760d82', 1, 'XFI002-S4-A1', 'Medical Affairs Alignment', 'Ensure MA publication strategy alignment', true, 90),
  ('df32576b-3e5b-476f-90e1-879ea4760d82', 2, 'XFI002-S4-A2', 'Commercial Strategy Integration', 'Align with brand positioning and messaging', true, 90),
  ('df32576b-3e5b-476f-90e1-879ea4760d82', 3, 'XFI002-S4-A3', 'Regulatory Review', 'Ensure regulatory compliance of planned studies', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 5: Execution & Tracking
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('bbac908b-8d9d-4cc2-81ea-39168c4b67a2', 1, 'XFI002-S5-A1', 'Study Launch & Monitoring', 'Initiate studies and track milestones', true, 240),
  ('bbac908b-8d9d-4cc2-81ea-39168c4b67a2', 2, 'XFI002-S5-A2', 'Progress Reporting', 'Regular updates to stakeholders', true, 60),
  ('bbac908b-8d9d-4cc2-81ea-39168c4b67a2', 3, 'XFI002-S5-A3', 'Adaptive Replanning', 'Adjust plan based on emerging needs', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-XFI-003: Integrated Launch Performance Tracking Workflow (BAU - routine)
-- ============================================================================

-- Stage 1: Data Collection
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('86652c39-1415-4cdf-bc2c-f2dd4b9adfc8', 1, 'XFI003-S1-A1', 'Sales Data Extraction', 'Pull prescription and revenue data', true, 30),
  ('86652c39-1415-4cdf-bc2c-f2dd4b9adfc8', 2, 'XFI003-S1-A2', 'Market Access Metrics', 'Collect formulary status, coverage data', true, 30),
  ('86652c39-1415-4cdf-bc2c-f2dd4b9adfc8', 3, 'XFI003-S1-A3', 'Medical Affairs Activity Data', 'Extract MSL interactions, KOL engagements', true, 30),
  ('86652c39-1415-4cdf-bc2c-f2dd4b9adfc8', 4, 'XFI003-S1-A4', 'Marketing Campaign Metrics', 'Pull digital, rep-driven campaign data', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Integration & Analysis
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('4ac8ac85-f7df-4cb0-acfe-ba5850d9af78', 1, 'XFI003-S2-A1', 'Data Integration', 'Merge data sources into unified view', true, 45),
  ('4ac8ac85-f7df-4cb0-acfe-ba5850d9af78', 2, 'XFI003-S2-A2', 'KPI Calculation', 'Compute launch KPIs vs targets', true, 30),
  ('4ac8ac85-f7df-4cb0-acfe-ba5850d9af78', 3, 'XFI003-S2-A3', 'Variance Analysis', 'Identify over/under performance drivers', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Reporting & Communication
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('9c4f3708-80d0-4aaa-b27d-5d6a69572786', 1, 'XFI003-S3-A1', 'Dashboard Update', 'Refresh launch performance dashboards', true, 20),
  ('9c4f3708-80d0-4aaa-b27d-5d6a69572786', 2, 'XFI003-S3-A2', 'Executive Report Generation', 'Create leadership summary report', true, 45),
  ('9c4f3708-80d0-4aaa-b27d-5d6a69572786', 3, 'XFI003-S3-A3', 'Function-Specific Briefs', 'Tailor insights for each function', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Action & Optimization
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('fb2be32d-3633-4a31-a545-8afaa808c477', 1, 'XFI003-S4-A1', 'Identify Optimization Opportunities', 'Pinpoint areas needing intervention', true, 30),
  ('fb2be32d-3633-4a31-a545-8afaa808c477', 2, 'XFI003-S4-A2', 'Cross-Functional Action Planning', 'Coordinate corrective actions', true, 45),
  ('fb2be32d-3633-4a31-a545-8afaa808c477', 3, 'XFI003-S4-A3', 'Track Action Outcomes', 'Monitor effectiveness of interventions', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-XFI-004: Integrated Competitive Intelligence Workflow (BAU - routine)
-- ============================================================================

-- Stage 1: Intelligence Gathering
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('a0037d0d-5a17-4761-aa43-248c645bd5d9', 1, 'XFI004-S1-A1', 'Automated News Monitoring', 'AI scans news, press releases, SEC filings', true, 15),
  ('a0037d0d-5a17-4761-aa43-248c645bd5d9', 2, 'XFI004-S1-A2', 'Clinical Trial Tracking', 'Monitor competitor pipeline progress', true, 30),
  ('a0037d0d-5a17-4761-aa43-248c645bd5d9', 3, 'XFI004-S1-A3', 'Congress & Conference Coverage', 'Capture competitor presentations', true, 60),
  ('a0037d0d-5a17-4761-aa43-248c645bd5d9', 4, 'XFI004-S1-A4', 'Field Intelligence Collection', 'Gather insights from sales and MSL teams', true, 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Analysis & Synthesis
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('0dc97488-4d6f-44c6-877a-fb729f8a441e', 1, 'XFI004-S2-A1', 'Competitive Positioning Analysis', 'Map competitor positioning vs our brands', true, 60),
  ('0dc97488-4d6f-44c6-877a-fb729f8a441e', 2, 'XFI004-S2-A2', 'Pipeline Impact Assessment', 'Evaluate threat level of competitor pipeline', true, 90),
  ('0dc97488-4d6f-44c6-877a-fb729f8a441e', 3, 'XFI004-S2-A3', 'Market Share Implications', 'Model potential market share shifts', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Reporting & Dissemination
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('e1f963cf-16e4-4125-9840-68260cd39d1b', 1, 'XFI004-S3-A1', 'CI Dashboard Update', 'Refresh competitive intelligence portal', true, 20),
  ('e1f963cf-16e4-4125-9840-68260cd39d1b', 2, 'XFI004-S3-A2', 'Alert Distribution', 'Send urgent competitor news alerts', true, 15),
  ('e1f963cf-16e4-4125-9840-68260cd39d1b', 3, 'XFI004-S3-A3', 'Monthly CI Report', 'Comprehensive monthly competitive summary', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Strategic Response Planning
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('e258017d-095e-4d5f-8381-a0a326b56d2b', 1, 'XFI004-S4-A1', 'Scenario Planning', 'Develop response scenarios for key events', true, 90),
  ('e258017d-095e-4d5f-8381-a0a326b56d2b', 2, 'XFI004-S4-A2', 'War Gaming Sessions', 'Conduct cross-functional war games', false, 180),
  ('e258017d-095e-4d5f-8381-a0a326b56d2b', 3, 'XFI004-S4-A3', 'Response Playbook Updates', 'Update competitive response playbooks', true, 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- WF-XFI-005: Integrated Forecasting Model Build Project (Project)
-- ============================================================================

-- Stage 1: Model Design & Planning
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('59dc04e5-adaa-4234-ac74-b1c557d5ebee', 1, 'XFI005-S1-A1', 'Define Forecasting Scope', 'Products, markets, time horizons', true, 120),
  ('59dc04e5-adaa-4234-ac74-b1c557d5ebee', 2, 'XFI005-S1-A2', 'Model Architecture Design', 'Choose bottom-up, top-down, hybrid approach', true, 180),
  ('59dc04e5-adaa-4234-ac74-b1c557d5ebee', 3, 'XFI005-S1-A3', 'Data Requirements Specification', 'Document all required input data', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 2: Data Collection & Preparation
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('ad0234ea-938a-4604-8be7-8d776e9ec42c', 1, 'XFI005-S2-A1', 'Historical Data Assembly', 'Collect 3-5 years of historical data', true, 240),
  ('ad0234ea-938a-4604-8be7-8d776e9ec42c', 2, 'XFI005-S2-A2', 'Market Research Integration', 'Incorporate primary research findings', true, 120),
  ('ad0234ea-938a-4604-8be7-8d776e9ec42c', 3, 'XFI005-S2-A3', 'Data Cleansing & Validation', 'Ensure data quality and consistency', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 3: Model Building & Validation
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('0a992142-4530-4529-b9e6-dc0407a3bc64', 1, 'XFI005-S3-A1', 'Build Base Forecast Model', 'Develop core forecasting algorithms', true, 300),
  ('0a992142-4530-4529-b9e6-dc0407a3bc64', 2, 'XFI005-S3-A2', 'Scenario Modeling', 'Build upside/downside scenarios', true, 180),
  ('0a992142-4530-4529-b9e6-dc0407a3bc64', 3, 'XFI005-S3-A3', 'Backtesting & Calibration', 'Validate model against historical data', true, 120)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 4: Review & Alignment
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('9e73fffe-20c5-4252-ac71-4096a4d82e41', 1, 'XFI005-S4-A1', 'Cross-Functional Review', 'Present to MA, Commercial, Finance', true, 180),
  ('9e73fffe-20c5-4252-ac71-4096a4d82e41', 2, 'XFI005-S4-A2', 'Assumption Validation', 'Validate key assumptions with stakeholders', true, 120),
  ('9e73fffe-20c5-4252-ac71-4096a4d82e41', 3, 'XFI005-S4-A3', 'Model Refinement', 'Incorporate feedback and refine', true, 90)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- Stage 5: Operationalization
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, is_mandatory, estimated_duration_minutes)
VALUES
  ('ef738877-1272-493e-b601-3c8820863cf9', 1, 'XFI005-S5-A1', 'System Integration', 'Connect to data feeds and reporting tools', true, 180),
  ('ef738877-1272-493e-b601-3c8820863cf9', 2, 'XFI005-S5-A2', 'User Training', 'Train analysts on model usage', true, 120),
  ('ef738877-1272-493e-b601-3c8820863cf9', 3, 'XFI005-S5-A3', 'Governance & Maintenance Plan', 'Establish update cadence and ownership', true, 60)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run after migration:
-- SELECT wt.code, COUNT(wa.id) as activity_count
-- FROM workflow_templates wt
-- LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
-- LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
-- GROUP BY wt.code ORDER BY wt.code;
