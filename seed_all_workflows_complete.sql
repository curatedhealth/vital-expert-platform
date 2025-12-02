-- ============================================================================
-- COMPLETE WORKFLOW DATA FOR ALL USE CASES
-- Seeds stages, tasks, agents, tools, and RAG sources for ALL workflows
-- ============================================================================

-- ============================================================================
-- WF-DH-002: DTx Payer Coverage Strategy Workflow
-- ============================================================================

-- Stages
INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Value Proposition Development', 'Define and articulate the clinical and economic value proposition', true, 24),
  (2, 'HEOR Evidence Generation', 'Generate health economics and outcomes research evidence', true, 40),
  (3, 'Payer Landscape Analysis', 'Analyze payer market and identify coverage pathways', true, 20),
  (4, 'Dossier Development', 'Develop payer value dossier and submission materials', true, 24),
  (5, 'Payer Engagement', 'Execute payer engagement and negotiation strategy', true, 12)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-DH-002'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

-- Tasks for WF-DH-002
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  -- Stage 1
  (1, 1, 'DH002-S1-T1', 'Clinical Value Assessment', 'Assess clinical outcomes and differentiation', 'manual', 180),
  (1, 2, 'DH002-S1-T2', 'Economic Value Modeling', 'Develop preliminary economic value model', 'automated', 240),
  (1, 3, 'DH002-S1-T3', 'Value Story Development', 'Create compelling value narrative', 'manual', 120),
  (1, 4, 'DH002-S1-T4', 'Stakeholder Value Mapping', 'Map value drivers by stakeholder', 'manual', 90),
  -- Stage 2
  (2, 1, 'DH002-S2-T1', 'Cost-Effectiveness Analysis', 'Conduct CEA modeling', 'automated', 480),
  (2, 2, 'DH002-S2-T2', 'Budget Impact Analysis', 'Develop budget impact model', 'automated', 360),
  (2, 3, 'DH002-S2-T3', 'RWE Data Analysis', 'Analyze real-world evidence data', 'automated', 300),
  (2, 4, 'DH002-S2-T4', 'HEOR Publication Strategy', 'Plan HEOR publications', 'manual', 120),
  -- Stage 3
  (3, 1, 'DH002-S3-T1', 'Payer Segmentation', 'Segment payers by coverage potential', 'automated', 120),
  (3, 2, 'DH002-S3-T2', 'Coverage Policy Analysis', 'Analyze existing coverage policies', 'automated', 180),
  (3, 3, 'DH002-S3-T3', 'Reimbursement Pathway Mapping', 'Map reimbursement pathways', 'manual', 240),
  (3, 4, 'DH002-S3-T4', 'Competitive Coverage Analysis', 'Analyze competitor coverage', 'automated', 120),
  -- Stage 4
  (4, 1, 'DH002-S4-T1', 'Value Dossier Compilation', 'Compile comprehensive value dossier', 'manual', 480),
  (4, 2, 'DH002-S4-T2', 'AMCP Dossier Development', 'Develop AMCP format dossier', 'manual', 360),
  (4, 3, 'DH002-S4-T3', 'Payer Presentation Materials', 'Create payer presentation deck', 'manual', 180),
  (4, 4, 'DH002-S4-T4', 'Objection Handler Development', 'Develop responses to payer objections', 'manual', 120),
  -- Stage 5
  (5, 1, 'DH002-S5-T1', 'Payer Meeting Preparation', 'Prepare for payer advisory meetings', 'manual', 180),
  (5, 2, 'DH002-S5-T2', 'Contract Negotiation Support', 'Support contract negotiations', 'manual', 240),
  (5, 3, 'DH002-S5-T3', 'Coverage Decision Tracking', 'Track coverage decisions', 'automated', 60),
  (5, 4, 'DH002-S5-T4', 'Post-Coverage Monitoring', 'Monitor post-coverage performance', 'automated', 120)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-002' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-DH-003: Decentralized Clinical Trial Setup Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'DCT Strategy & Design', 'Define decentralized trial strategy and hybrid design', true, 40),
  (2, 'Technology Platform Selection', 'Select and configure DCT technology platforms', true, 32),
  (3, 'Site & Patient Network Setup', 'Establish site network and patient engagement channels', true, 48),
  (4, 'Regulatory & Compliance Setup', 'Address regulatory requirements for DCT elements', true, 32),
  (5, 'Operational Readiness', 'Ensure operational readiness for trial launch', true, 24),
  (6, 'Launch & Monitoring', 'Launch DCT and establish monitoring frameworks', true, 24)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-DH-003'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  -- Stage 1
  (1, 1, 'DH003-S1-T1', 'DCT Feasibility Assessment', 'Assess feasibility of DCT elements', 'manual', 240),
  (1, 2, 'DH003-S1-T2', 'Hybrid Model Design', 'Design optimal hybrid trial model', 'manual', 360),
  (1, 3, 'DH003-S1-T3', 'Digital Endpoint Selection', 'Select and validate digital endpoints', 'review', 180),
  (1, 4, 'DH003-S1-T4', 'Patient Journey Mapping', 'Map decentralized patient journey', 'manual', 120),
  -- Stage 2
  (2, 1, 'DH003-S2-T1', 'ePRO Platform Evaluation', 'Evaluate ePRO/eCOA platforms', 'manual', 240),
  (2, 2, 'DH003-S2-T2', 'Wearable Device Selection', 'Select wearable/sensor devices', 'review', 180),
  (2, 3, 'DH003-S2-T3', 'Telemedicine Integration', 'Configure telemedicine capabilities', 'automated', 120),
  (2, 4, 'DH003-S2-T4', 'Data Integration Architecture', 'Design data integration architecture', 'manual', 240),
  -- Stage 3
  (3, 1, 'DH003-S3-T1', 'Home Health Network Setup', 'Establish home health provider network', 'manual', 360),
  (3, 2, 'DH003-S3-T2', 'Direct-to-Patient Logistics', 'Setup DTP drug delivery logistics', 'manual', 240),
  (3, 3, 'DH003-S3-T3', 'Patient Recruitment Strategy', 'Develop digital recruitment strategy', 'manual', 180),
  (3, 4, 'DH003-S3-T4', 'Patient Engagement Platform', 'Configure patient engagement tools', 'automated', 120),
  -- Stage 4
  (4, 1, 'DH003-S4-T1', 'eConsent Development', 'Develop electronic consent process', 'manual', 240),
  (4, 2, 'DH003-S4-T2', 'Remote Monitoring Validation', 'Validate remote monitoring approach', 'review', 180),
  (4, 3, 'DH003-S4-T3', 'Data Privacy Compliance', 'Ensure GDPR/HIPAA compliance', 'review', 240),
  (4, 4, 'DH003-S4-T4', 'IRB/EC DCT Submission', 'Submit DCT-specific IRB documentation', 'manual', 120),
  -- Stage 5
  (5, 1, 'DH003-S5-T1', 'Technology UAT', 'Conduct user acceptance testing', 'manual', 240),
  (5, 2, 'DH003-S5-T2', 'Staff Training Program', 'Train staff on DCT procedures', 'manual', 180),
  (5, 3, 'DH003-S5-T3', 'Patient Onboarding Process', 'Finalize patient onboarding workflow', 'manual', 120),
  (5, 4, 'DH003-S5-T4', 'Contingency Planning', 'Develop contingency procedures', 'manual', 90),
  -- Stage 6
  (6, 1, 'DH003-S6-T1', 'Soft Launch Execution', 'Execute soft launch at pilot sites', 'manual', 240),
  (6, 2, 'DH003-S6-T2', 'Real-time Data Monitoring', 'Setup real-time data monitoring', 'automated', 60),
  (6, 3, 'DH003-S6-T3', 'Patient Engagement Tracking', 'Monitor patient engagement metrics', 'automated', 45),
  (6, 4, 'DH003-S6-T4', 'Issue Resolution Protocol', 'Implement issue escalation protocol', 'manual', 60)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-003' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-DH-004: SaMD Regulatory Submission Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Regulatory Pathway Determination', 'Determine appropriate regulatory pathway (510k/De Novo/PMA)', true, 32),
  (2, 'Pre-Submission Preparation', 'Prepare and conduct pre-submission meeting with FDA', true, 40),
  (3, 'Technical Documentation', 'Develop software documentation and technical files', true, 80),
  (4, 'Clinical Evidence Compilation', 'Compile clinical evidence and validation data', true, 48),
  (5, 'Submission Assembly', 'Assemble and submit regulatory package', true, 24),
  (6, 'FDA Review Management', 'Manage FDA review process and respond to queries', true, 16)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-DH-004'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  -- Stage 1
  (1, 1, 'DH004-S1-T1', 'Product Classification Analysis', 'Analyze product for FDA classification', 'manual', 240),
  (1, 2, 'DH004-S1-T2', 'Predicate Device Search', 'Identify and evaluate predicate devices', 'automated', 180),
  (1, 3, 'DH004-S1-T3', 'Regulatory Strategy Development', 'Develop regulatory submission strategy', 'manual', 300),
  (1, 4, 'DH004-S1-T4', 'Risk Classification Determination', 'Determine risk classification level', 'review', 120),
  -- Stage 2
  (2, 1, 'DH004-S2-T1', 'Q-Submission Preparation', 'Prepare Q-submission package', 'manual', 480),
  (2, 2, 'DH004-S2-T2', 'Pre-Sub Meeting Request', 'Submit pre-submission meeting request', 'manual', 60),
  (2, 3, 'DH004-S2-T3', 'Briefing Document Development', 'Develop pre-sub briefing document', 'manual', 360),
  (2, 4, 'DH004-S2-T4', 'FDA Meeting Participation', 'Participate in FDA pre-submission meeting', 'manual', 120),
  (2, 5, 'DH004-S2-T5', 'Meeting Minutes Review', 'Review and incorporate FDA feedback', 'review', 180),
  -- Stage 3
  (3, 1, 'DH004-S3-T1', 'Software Requirements Specification', 'Document software requirements', 'manual', 480),
  (3, 2, 'DH004-S3-T2', 'Software Design Documentation', 'Create software design documentation', 'manual', 600),
  (3, 3, 'DH004-S3-T3', 'Cybersecurity Documentation', 'Develop cybersecurity documentation', 'manual', 360),
  (3, 4, 'DH004-S3-T4', 'Verification & Validation Plan', 'Create V&V plan and test protocols', 'manual', 300),
  (3, 5, 'DH004-S3-T5', 'Risk Management File', 'Compile risk management documentation', 'manual', 240),
  (3, 6, 'DH004-S3-T6', 'IEC 62304 Compliance Review', 'Review IEC 62304 compliance', 'review', 180),
  -- Stage 4
  (4, 1, 'DH004-S4-T1', 'Clinical Data Summary', 'Summarize clinical validation data', 'manual', 360),
  (4, 2, 'DH004-S4-T2', 'Performance Testing Results', 'Compile performance testing results', 'manual', 240),
  (4, 3, 'DH004-S4-T3', 'Usability Study Report', 'Document usability study findings', 'manual', 180),
  (4, 4, 'DH004-S4-T4', 'Literature Review Summary', 'Summarize supporting literature', 'automated', 120),
  -- Stage 5
  (5, 1, 'DH004-S5-T1', 'eCopy Assembly', 'Assemble electronic submission copy', 'manual', 240),
  (5, 2, 'DH004-S5-T2', 'Administrative Documents', 'Prepare administrative documents', 'manual', 120),
  (5, 3, 'DH004-S5-T3', 'Quality Review', 'Conduct final quality review', 'review', 180),
  (5, 4, 'DH004-S5-T4', 'Submission to FDA', 'Submit to FDA via ESG', 'manual', 60),
  -- Stage 6
  (6, 1, 'DH004-S6-T1', 'Review Status Monitoring', 'Monitor FDA review status', 'automated', 30),
  (6, 2, 'DH004-S6-T2', 'RTA Response Preparation', 'Prepare refuse to accept responses', 'manual', 240),
  (6, 3, 'DH004-S6-T3', 'AI/Additional Info Response', 'Respond to additional information requests', 'manual', 480),
  (6, 4, 'DH004-S6-T4', 'Clearance Documentation', 'Process clearance documentation', 'manual', 60)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-004' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-MAI-002: Scientific Literature Monitoring Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Search Strategy Setup', 'Configure literature search parameters and alerts', true, 2),
  (2, 'Literature Collection', 'Collect and aggregate publications from multiple sources', true, 3),
  (3, 'Relevance Screening', 'Screen and categorize publications by relevance', true, 4),
  (4, 'Analysis & Synthesis', 'Analyze findings and synthesize insights', true, 2),
  (5, 'Dissemination', 'Distribute findings to stakeholders', true, 1)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-MAI-002'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 1, 'MAI002-S1-T1', 'Define Search Terms', 'Define MeSH terms and keywords', 'manual', 30),
  (1, 2, 'MAI002-S1-T2', 'Configure Database Alerts', 'Setup alerts in PubMed, Embase, etc.', 'automated', 20),
  (1, 3, 'MAI002-S1-T3', 'Congress Calendar Setup', 'Configure congress monitoring calendar', 'manual', 15),
  (2, 1, 'MAI002-S2-T1', 'Execute Database Searches', 'Run automated literature searches', 'automated', 15),
  (2, 2, 'MAI002-S2-T2', 'Congress Abstract Collection', 'Collect congress abstracts and posters', 'automated', 30),
  (2, 3, 'MAI002-S2-T3', 'Preprint Monitoring', 'Monitor preprint servers', 'automated', 10),
  (2, 4, 'MAI002-S2-T4', 'Deduplication', 'Remove duplicate entries', 'automated', 10),
  (3, 1, 'MAI002-S3-T1', 'AI-Assisted Screening', 'Apply ML model for initial screening', 'automated', 20),
  (3, 2, 'MAI002-S3-T2', 'Expert Review', 'Medical expert reviews flagged articles', 'review', 60),
  (3, 3, 'MAI002-S3-T3', 'Categorization', 'Categorize by therapeutic area and topic', 'automated', 15),
  (3, 4, 'MAI002-S3-T4', 'Priority Flagging', 'Flag high-priority publications', 'automated', 10),
  (4, 1, 'MAI002-S4-T1', 'Key Findings Extraction', 'Extract key findings from publications', 'automated', 30),
  (4, 2, 'MAI002-S4-T2', 'Trend Analysis', 'Analyze publication trends', 'automated', 20),
  (4, 3, 'MAI002-S4-T3', 'Competitive Intelligence', 'Identify competitor publications', 'automated', 15),
  (4, 4, 'MAI002-S4-T4', 'Insight Summary', 'Generate insight summary report', 'automated', 20),
  (5, 1, 'MAI002-S5-T1', 'Newsletter Generation', 'Generate literature newsletter', 'automated', 15),
  (5, 2, 'MAI002-S5-T2', 'Stakeholder Distribution', 'Distribute to relevant stakeholders', 'automated', 5),
  (5, 3, 'MAI002-S5-T3', 'Archive Update', 'Update literature archive', 'automated', 10)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-002' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-MAI-003: Medical Affairs ROI Measurement Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Metrics Framework Design', 'Design ROI measurement framework and KPIs', true, 8),
  (2, 'Data Collection & Integration', 'Collect and integrate data from multiple sources', true, 12),
  (3, 'Impact Analysis', 'Analyze medical affairs impact on business outcomes', true, 12),
  (4, 'ROI Calculation', 'Calculate ROI and value metrics', true, 4),
  (5, 'Reporting & Recommendations', 'Generate reports and strategic recommendations', true, 4)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-MAI-003'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 1, 'MAI003-S1-T1', 'Stakeholder Requirements', 'Gather ROI measurement requirements', 'manual', 120),
  (1, 2, 'MAI003-S1-T2', 'KPI Definition', 'Define key performance indicators', 'manual', 90),
  (1, 3, 'MAI003-S1-T3', 'Attribution Model Design', 'Design attribution model for MA activities', 'manual', 180),
  (1, 4, 'MAI003-S1-T4', 'Baseline Establishment', 'Establish measurement baselines', 'manual', 60),
  (2, 1, 'MAI003-S2-T1', 'Activity Data Collection', 'Collect MA activity data', 'automated', 60),
  (2, 2, 'MAI003-S2-T2', 'Outcome Data Integration', 'Integrate business outcome data', 'automated', 90),
  (2, 3, 'MAI003-S2-T3', 'Cost Data Compilation', 'Compile MA cost data', 'manual', 120),
  (2, 4, 'MAI003-S2-T4', 'Data Quality Validation', 'Validate data quality and completeness', 'review', 60),
  (3, 1, 'MAI003-S3-T1', 'KOL Impact Analysis', 'Analyze KOL engagement impact', 'automated', 120),
  (3, 2, 'MAI003-S3-T2', 'Publication Impact Analysis', 'Analyze publication impact metrics', 'automated', 90),
  (3, 3, 'MAI003-S3-T3', 'Advisory Board ROI', 'Calculate advisory board ROI', 'automated', 60),
  (3, 4, 'MAI003-S3-T4', 'Congress Impact Assessment', 'Assess congress activity impact', 'automated', 90),
  (4, 1, 'MAI003-S4-T1', 'ROI Model Execution', 'Execute ROI calculation model', 'automated', 45),
  (4, 2, 'MAI003-S4-T2', 'Sensitivity Analysis', 'Perform sensitivity analysis', 'automated', 30),
  (4, 3, 'MAI003-S4-T3', 'Benchmark Comparison', 'Compare against industry benchmarks', 'automated', 30),
  (5, 1, 'MAI003-S5-T1', 'Executive Dashboard', 'Generate executive ROI dashboard', 'automated', 30),
  (5, 2, 'MAI003-S5-T2', 'Detailed ROI Report', 'Create detailed ROI analysis report', 'automated', 45),
  (5, 3, 'MAI003-S5-T3', 'Optimization Recommendations', 'Generate optimization recommendations', 'manual', 90),
  (5, 4, 'MAI003-S5-T4', 'Stakeholder Presentation', 'Prepare stakeholder presentation', 'manual', 60)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-003' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-FME-001: Field Medical Education Program Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Needs Assessment', 'Assess educational needs and gaps', true, 16),
  (2, 'Curriculum Development', 'Develop educational curriculum and materials', true, 24),
  (3, 'Content Creation', 'Create educational content and resources', true, 20),
  (4, 'Program Delivery', 'Deliver educational program', true, 12),
  (5, 'Assessment & Certification', 'Assess learning and provide certification', true, 8)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-FME-001'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 1, 'FME001-S1-T1', 'Competency Gap Analysis', 'Analyze MSL competency gaps', 'manual', 180),
  (1, 2, 'FME001-S1-T2', 'Learning Objectives Definition', 'Define learning objectives', 'manual', 120),
  (1, 3, 'FME001-S1-T3', 'Stakeholder Input Collection', 'Gather stakeholder input on needs', 'manual', 90),
  (1, 4, 'FME001-S1-T4', 'Needs Assessment Report', 'Compile needs assessment report', 'manual', 60),
  (2, 1, 'FME001-S2-T1', 'Curriculum Framework Design', 'Design curriculum framework', 'manual', 240),
  (2, 2, 'FME001-S2-T2', 'Module Structure Development', 'Develop module structure', 'manual', 180),
  (2, 3, 'FME001-S2-T3', 'Assessment Strategy Design', 'Design assessment strategy', 'manual', 120),
  (2, 4, 'FME001-S2-T4', 'SME Review', 'Subject matter expert review', 'review', 90),
  (3, 1, 'FME001-S3-T1', 'Scientific Content Development', 'Develop scientific content', 'manual', 360),
  (3, 2, 'FME001-S3-T2', 'Case Study Creation', 'Create case studies and scenarios', 'manual', 180),
  (3, 3, 'FME001-S3-T3', 'Interactive Materials', 'Develop interactive learning materials', 'manual', 240),
  (3, 4, 'FME001-S3-T4', 'Medical Legal Review', 'Conduct medical legal review', 'review', 120),
  (4, 1, 'FME001-S4-T1', 'Instructor Preparation', 'Prepare instructors and facilitators', 'manual', 120),
  (4, 2, 'FME001-S4-T2', 'Live Session Delivery', 'Deliver live training sessions', 'manual', 480),
  (4, 3, 'FME001-S4-T3', 'Self-Paced Module Deployment', 'Deploy self-paced modules', 'automated', 30),
  (4, 4, 'FME001-S4-T4', 'Q&A Session Facilitation', 'Facilitate Q&A sessions', 'manual', 60),
  (5, 1, 'FME001-S5-T1', 'Knowledge Assessment', 'Conduct knowledge assessments', 'automated', 45),
  (5, 2, 'FME001-S5-T2', 'Competency Evaluation', 'Evaluate competency demonstration', 'review', 90),
  (5, 3, 'FME001-S5-T3', 'Certification Processing', 'Process certifications', 'automated', 30),
  (5, 4, 'FME001-S5-T4', 'Program Evaluation', 'Evaluate program effectiveness', 'manual', 60)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-FME-001' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-RSR-001: Regulatory Strategy Review Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Regulatory Landscape Analysis', 'Analyze current regulatory landscape and requirements', true, 12),
  (2, 'Strategy Assessment', 'Assess current regulatory strategy effectiveness', true, 16),
  (3, 'Gap Analysis', 'Identify gaps and risks in regulatory approach', true, 12),
  (4, 'Strategy Optimization', 'Develop optimized regulatory strategy', true, 12),
  (5, 'Implementation Planning', 'Plan strategy implementation', true, 8)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-RSR-001'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 1, 'RSR001-S1-T1', 'Regulatory Intelligence Gathering', 'Gather regulatory intelligence', 'automated', 120),
  (1, 2, 'RSR001-S1-T2', 'Guidance Document Review', 'Review relevant guidance documents', 'manual', 180),
  (1, 3, 'RSR001-S1-T3', 'Competitor Regulatory Analysis', 'Analyze competitor regulatory approaches', 'automated', 90),
  (1, 4, 'RSR001-S1-T4', 'Regulatory Trend Analysis', 'Identify regulatory trends', 'automated', 60),
  (2, 1, 'RSR001-S2-T1', 'Current Strategy Documentation', 'Document current regulatory strategy', 'manual', 120),
  (2, 2, 'RSR001-S2-T2', 'Timeline Assessment', 'Assess regulatory timelines', 'manual', 90),
  (2, 3, 'RSR001-S2-T3', 'Resource Evaluation', 'Evaluate regulatory resources', 'manual', 60),
  (2, 4, 'RSR001-S2-T4', 'Stakeholder Interviews', 'Conduct stakeholder interviews', 'manual', 180),
  (3, 1, 'RSR001-S3-T1', 'Compliance Gap Identification', 'Identify compliance gaps', 'automated', 90),
  (3, 2, 'RSR001-S3-T2', 'Risk Assessment', 'Assess regulatory risks', 'manual', 120),
  (3, 3, 'RSR001-S3-T3', 'Opportunity Identification', 'Identify regulatory opportunities', 'manual', 90),
  (3, 4, 'RSR001-S3-T4', 'Gap Prioritization', 'Prioritize gaps by impact', 'review', 60),
  (4, 1, 'RSR001-S4-T1', 'Strategy Option Development', 'Develop strategy options', 'manual', 180),
  (4, 2, 'RSR001-S4-T2', 'Option Evaluation', 'Evaluate strategy options', 'review', 120),
  (4, 3, 'RSR001-S4-T3', 'Recommended Strategy', 'Develop recommended strategy', 'manual', 120),
  (4, 4, 'RSR001-S4-T4', 'Strategy Approval', 'Obtain strategy approval', 'approval', 60),
  (5, 1, 'RSR001-S5-T1', 'Implementation Roadmap', 'Create implementation roadmap', 'manual', 120),
  (5, 2, 'RSR001-S5-T2', 'Resource Planning', 'Plan resource requirements', 'manual', 90),
  (5, 3, 'RSR001-S5-T3', 'Milestone Definition', 'Define implementation milestones', 'manual', 60),
  (5, 4, 'RSR001-S5-T4', 'Communication Plan', 'Develop communication plan', 'manual', 45)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-RSR-001' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- WF-RWE-001: Real-World Evidence Generation Workflow
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'RWE Study Design', 'Design real-world evidence study', true, 24),
  (2, 'Data Source Selection', 'Identify and evaluate data sources', true, 16),
  (3, 'Data Acquisition & Processing', 'Acquire and process real-world data', true, 32),
  (4, 'Analysis Execution', 'Execute RWE analysis', true, 24),
  (5, 'Evidence Synthesis', 'Synthesize and report findings', true, 16),
  (6, 'Regulatory Submission Prep', 'Prepare RWE for regulatory submission', true, 8)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-RWE-001'
ON CONFLICT (template_id, stage_number) DO UPDATE SET stage_name = EXCLUDED.stage_name;

INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 1, 'RWE001-S1-T1', 'Research Question Definition', 'Define research questions and objectives', 'manual', 180),
  (1, 2, 'RWE001-S1-T2', 'Study Protocol Development', 'Develop RWE study protocol', 'manual', 360),
  (1, 3, 'RWE001-S1-T3', 'Statistical Analysis Plan', 'Create statistical analysis plan', 'manual', 240),
  (1, 4, 'RWE001-S1-T4', 'Protocol Review', 'Scientific review of protocol', 'review', 120),
  (2, 1, 'RWE001-S2-T1', 'Data Source Inventory', 'Inventory available data sources', 'automated', 90),
  (2, 2, 'RWE001-S2-T2', 'Data Quality Assessment', 'Assess data source quality', 'manual', 180),
  (2, 3, 'RWE001-S2-T3', 'Feasibility Analysis', 'Conduct data feasibility analysis', 'automated', 120),
  (2, 4, 'RWE001-S2-T4', 'Data Use Agreement', 'Negotiate data use agreements', 'manual', 240),
  (3, 1, 'RWE001-S3-T1', 'Data Extraction', 'Extract data from sources', 'automated', 180),
  (3, 2, 'RWE001-S3-T2', 'Data Harmonization', 'Harmonize data across sources', 'automated', 240),
  (3, 3, 'RWE001-S3-T3', 'Data Validation', 'Validate extracted data', 'automated', 120),
  (3, 4, 'RWE001-S3-T4', 'Cohort Definition', 'Define study cohorts', 'manual', 180),
  (3, 5, 'RWE001-S3-T5', 'Variable Derivation', 'Derive analysis variables', 'automated', 240),
  (4, 1, 'RWE001-S4-T1', 'Descriptive Analysis', 'Conduct descriptive analysis', 'automated', 120),
  (4, 2, 'RWE001-S4-T2', 'Primary Analysis', 'Execute primary analysis', 'automated', 240),
  (4, 3, 'RWE001-S4-T3', 'Sensitivity Analysis', 'Conduct sensitivity analyses', 'automated', 180),
  (4, 4, 'RWE001-S4-T4', 'Subgroup Analysis', 'Perform subgroup analyses', 'automated', 180),
  (4, 5, 'RWE001-S4-T5', 'Results Validation', 'Validate analysis results', 'review', 120),
  (5, 1, 'RWE001-S5-T1', 'Results Interpretation', 'Interpret analysis results', 'manual', 180),
  (5, 2, 'RWE001-S5-T2', 'Study Report Writing', 'Write RWE study report', 'manual', 360),
  (5, 3, 'RWE001-S5-T3', 'Publication Development', 'Develop publication manuscript', 'manual', 240),
  (5, 4, 'RWE001-S5-T4', 'Report Review', 'Review and finalize report', 'review', 120),
  (6, 1, 'RWE001-S6-T1', 'Regulatory Package Prep', 'Prepare regulatory submission package', 'manual', 180),
  (6, 2, 'RWE001-S6-T2', 'FDA RWE Framework Alignment', 'Align with FDA RWE framework', 'review', 120),
  (6, 3, 'RWE001-S6-T3', 'Submission Documentation', 'Finalize submission documentation', 'manual', 90)
) AS t(stage_num, task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-RWE-001' AND ws.stage_number = t.stage_num
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- ADD AGENTS TO ALL NEW TASKS
-- ============================================================================

-- WF-DH-002 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('DH002-S1-T1', 'Value Assessment Expert', 'AGT-VAE', 'Assesses clinical value', 'primary', 1),
  ('DH002-S1-T2', 'Health Economist', 'AGT-HE', 'Develops economic models', 'primary', 1),
  ('DH002-S2-T1', 'CEA Modeler', 'AGT-CEA', 'Conducts cost-effectiveness analysis', 'primary', 1),
  ('DH002-S2-T2', 'Budget Impact Analyst', 'AGT-BIA', 'Develops budget impact models', 'primary', 1),
  ('DH002-S3-T1', 'Payer Intelligence Agent', 'AGT-PIA', 'Analyzes payer landscape', 'primary', 1),
  ('DH002-S4-T1', 'Dossier Writer', 'AGT-DW', 'Compiles value dossier', 'primary', 1),
  ('DH002-S5-T1', 'Payer Relations Lead', 'AGT-PRL', 'Manages payer relationships', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-DH-003 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('DH003-S1-T1', 'DCT Strategy Expert', 'AGT-DCT', 'Designs DCT strategy', 'primary', 1),
  ('DH003-S2-T1', 'ePRO Specialist', 'AGT-EPRO', 'Evaluates ePRO platforms', 'primary', 1),
  ('DH003-S3-T1', 'Site Network Manager', 'AGT-SNM', 'Manages site network', 'primary', 1),
  ('DH003-S4-T1', 'eConsent Developer', 'AGT-ECON', 'Develops eConsent', 'primary', 1),
  ('DH003-S5-T1', 'UAT Coordinator', 'AGT-UAT', 'Coordinates testing', 'primary', 1),
  ('DH003-S6-T1', 'Launch Manager', 'AGT-LM', 'Manages trial launch', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-DH-004 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('DH004-S1-T1', 'Product Classifier', 'AGT-PC', 'Classifies SaMD products', 'primary', 1),
  ('DH004-S2-T1', 'Q-Sub Specialist', 'AGT-QS', 'Prepares Q-submissions', 'primary', 1),
  ('DH004-S3-T1', 'Software Documentation Expert', 'AGT-SDE', 'Documents software requirements', 'primary', 1),
  ('DH004-S3-T3', 'Cybersecurity Expert', 'AGT-CSE', 'Develops cybersecurity docs', 'primary', 1),
  ('DH004-S4-T1', 'Clinical Data Specialist', 'AGT-CDS', 'Summarizes clinical data', 'primary', 1),
  ('DH004-S5-T1', 'Submission Assembler', 'AGT-SA', 'Assembles eCopy', 'primary', 1),
  ('DH004-S6-T3', 'FDA Response Expert', 'AGT-FRE', 'Responds to FDA queries', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-MAI-002 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('MAI002-S1-T1', 'Search Strategist', 'AGT-SS', 'Defines search strategy', 'primary', 1),
  ('MAI002-S2-T1', 'Literature Crawler', 'AGT-LC', 'Executes database searches', 'primary', 1),
  ('MAI002-S3-T1', 'ML Screening Agent', 'AGT-MLS', 'Applies ML screening', 'primary', 1),
  ('MAI002-S3-T2', 'Medical Reviewer', 'AGT-MR', 'Reviews flagged articles', 'reviewer', 1),
  ('MAI002-S4-T1', 'Insight Extractor', 'AGT-IE', 'Extracts key findings', 'primary', 1),
  ('MAI002-S5-T1', 'Newsletter Generator', 'AGT-NG', 'Generates newsletters', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-MAI-003 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('MAI003-S1-T1', 'Requirements Analyst', 'AGT-RA', 'Gathers requirements', 'primary', 1),
  ('MAI003-S1-T3', 'Attribution Modeler', 'AGT-AM', 'Designs attribution model', 'primary', 1),
  ('MAI003-S2-T1', 'Data Collector', 'AGT-DC', 'Collects activity data', 'primary', 1),
  ('MAI003-S3-T1', 'Impact Analyst', 'AGT-IA', 'Analyzes KOL impact', 'primary', 1),
  ('MAI003-S4-T1', 'ROI Calculator', 'AGT-ROI', 'Calculates ROI metrics', 'primary', 1),
  ('MAI003-S5-T1', 'Dashboard Builder', 'AGT-DB', 'Builds executive dashboard', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-FME-001 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('FME001-S1-T1', 'Competency Analyst', 'AGT-CA', 'Analyzes competency gaps', 'primary', 1),
  ('FME001-S2-T1', 'Curriculum Designer', 'AGT-CD', 'Designs curriculum', 'primary', 1),
  ('FME001-S3-T1', 'Content Developer', 'AGT-CONT', 'Develops scientific content', 'primary', 1),
  ('FME001-S3-T4', 'MedLegal Reviewer', 'AGT-MLR', 'Reviews for compliance', 'reviewer', 1),
  ('FME001-S4-T2', 'Training Facilitator', 'AGT-TF', 'Delivers training', 'primary', 1),
  ('FME001-S5-T1', 'Assessment Agent', 'AGT-AA', 'Conducts assessments', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-RSR-001 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('RSR001-S1-T1', 'Regulatory Intelligence Agent', 'AGT-RIA', 'Gathers regulatory intel', 'primary', 1),
  ('RSR001-S2-T1', 'Strategy Documenter', 'AGT-SD', 'Documents strategy', 'primary', 1),
  ('RSR001-S3-T1', 'Compliance Auditor', 'AGT-COMP', 'Identifies compliance gaps', 'primary', 1),
  ('RSR001-S4-T1', 'Strategy Developer', 'AGT-STRD', 'Develops strategy options', 'primary', 1),
  ('RSR001-S5-T1', 'Implementation Planner', 'AGT-IP', 'Creates implementation roadmap', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- WF-RWE-001 Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('RWE001-S1-T1', 'RWE Study Designer', 'AGT-RSD', 'Designs RWE studies', 'primary', 1),
  ('RWE001-S1-T3', 'Biostatistician', 'AGT-BIO', 'Creates SAP', 'primary', 1),
  ('RWE001-S2-T1', 'Data Source Analyst', 'AGT-DSA', 'Inventories data sources', 'primary', 1),
  ('RWE001-S3-T1', 'Data Extraction Agent', 'AGT-DEA', 'Extracts RWD', 'primary', 1),
  ('RWE001-S4-T1', 'Statistical Analyst', 'AGT-STAT', 'Conducts analyses', 'primary', 1),
  ('RWE001-S5-T1', 'Results Interpreter', 'AGT-RI', 'Interprets results', 'primary', 1),
  ('RWE001-S6-T1', 'Regulatory Writer', 'AGT-RW', 'Prepares regulatory package', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO NOTHING;

-- ============================================================================
-- ADD TOOLS TO ALL NEW TASKS
-- ============================================================================

INSERT INTO workflow_task_tools (task_id, tool_name, is_required)
SELECT wt.id, t.tool_name, t.is_required
FROM workflow_tasks wt
CROSS JOIN (VALUES
  -- DH002 Tools
  ('DH002-S1-T2', 'Economic Model Builder', true),
  ('DH002-S2-T1', 'CEA Modeling Software', true),
  ('DH002-S2-T2', 'Budget Impact Calculator', true),
  ('DH002-S3-T1', 'Payer Database', true),
  ('DH002-S4-T2', 'AMCP Template Generator', true),
  -- DH003 Tools
  ('DH003-S2-T1', 'ePRO Platform Suite', true),
  ('DH003-S2-T3', 'Telemedicine Platform', true),
  ('DH003-S3-T2', 'DTP Logistics System', true),
  ('DH003-S4-T1', 'eConsent Builder', true),
  -- DH004 Tools
  ('DH004-S1-T2', 'FDA 510k Database', true),
  ('DH004-S3-T1', 'Requirements Management Tool', true),
  ('DH004-S3-T3', 'Cybersecurity Assessment Tool', true),
  ('DH004-S5-T1', 'eCTD Publishing Tool', true),
  -- MAI002 Tools
  ('MAI002-S1-T2', 'PubMed Alert System', true),
  ('MAI002-S2-T1', 'Literature Search Engine', true),
  ('MAI002-S3-T1', 'ML Screening Model', true),
  ('MAI002-S4-T2', 'Trend Analysis Dashboard', true),
  -- MAI003 Tools
  ('MAI003-S2-T1', 'Activity Tracker', true),
  ('MAI003-S3-T1', 'Impact Analytics Engine', true),
  ('MAI003-S4-T1', 'ROI Calculator', true),
  ('MAI003-S5-T1', 'Dashboard Builder', true),
  -- FME001 Tools
  ('FME001-S2-T1', 'Curriculum Design Tool', true),
  ('FME001-S3-T3', 'Interactive Content Builder', true),
  ('FME001-S4-T3', 'LMS Platform', true),
  ('FME001-S5-T1', 'Assessment Platform', true),
  -- RSR001 Tools
  ('RSR001-S1-T1', 'Regulatory Intelligence Platform', true),
  ('RSR001-S3-T1', 'Compliance Checker', true),
  ('RSR001-S4-T1', 'Strategy Planning Tool', true),
  -- RWE001 Tools
  ('RWE001-S2-T1', 'Data Source Catalog', true),
  ('RWE001-S3-T1', 'Data Extraction Pipeline', true),
  ('RWE001-S3-T2', 'Data Harmonization Tool', true),
  ('RWE001-S4-T1', 'Statistical Analysis Suite', true),
  ('RWE001-S4-T2', 'SAS/R Analytics', true)
) AS t(task_code, tool_name, is_required)
WHERE wt.task_code = t.task_code
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  wt.code as workflow_code,
  wt.name as workflow_name,
  COUNT(DISTINCT ws.id) as stages,
  COUNT(DISTINCT wtask.id) as tasks,
  COUNT(DISTINCT wta.id) as agents,
  COUNT(DISTINCT wtt.id) as tools
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_tasks wtask ON wtask.stage_id = ws.id
LEFT JOIN workflow_task_agents wta ON wta.task_id = wtask.id
LEFT JOIN workflow_task_tools wtt ON wtt.task_id = wtask.id
GROUP BY wt.id, wt.code, wt.name
ORDER BY wt.code;

