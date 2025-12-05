-- ============================================================================
-- Migration 031: Medical Affairs Agent Responsibilities - Explicit Mapping
-- Date: 2025-12-02
-- Purpose: Explicitly assign role-specific responsibilities to each MA agent
-- ============================================================================
--
-- Responsibilities define what each agent is ACCOUNTABLE for
-- They are more specific than capabilities and tied to organizational roles
--
-- ============================================================================

-- ============================================================================
-- PART 1: L1 MASTER RESPONSIBILITIES
-- ============================================================================

-- VP Medical Affairs
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Strategic Direction', 'Set overall Medical Affairs strategy and vision aligned with corporate objectives', 1, 'strategy', 'owns'),
  ('Cross-Functional Leadership', 'Lead cross-functional alignment with R&D, Commercial, Regulatory, and Legal', 2, 'leadership', 'owns'),
  ('Budget Authority', 'Approve departmental budgets and major expenditures for all MA functions', 3, 'finance', 'owns'),
  ('Escalation Resolution', 'Resolve escalated decisions from L2 Department Heads', 4, 'escalation', 'owns'),
  ('Stakeholder Management', 'Manage relationships with executive leadership and external stakeholders', 5, 'external', 'owns'),
  ('Compliance Oversight', 'Ensure enterprise-wide compliance with regulatory and ethical standards', 6, 'compliance', 'owns'),
  ('Resource Allocation', 'Allocate resources across MA departments based on strategic priorities', 7, 'operations', 'owns'),
  ('Performance Accountability', 'Hold L2 Department Heads accountable for departmental KPIs', 8, 'performance', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'vp-medical-affairs'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 2: L2 EXPERT (DEPARTMENT HEAD) RESPONSIBILITIES
-- ============================================================================

-- Head of MSL Operations
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('MSL Team Strategy', 'Develop and execute MSL deployment strategy and territory optimization', 1, 'strategy', 'owns'),
  ('KOL Engagement Oversight', 'Oversee KOL engagement strategy and relationship management', 2, 'external', 'owns'),
  ('Field Insights Program', 'Lead field medical insights collection and synthesis program', 3, 'intelligence', 'owns'),
  ('MSL Training & Development', 'Ensure MSL team training, certification, and professional development', 4, 'training', 'owns'),
  ('Compliance Monitoring', 'Monitor and ensure compliant field medical activities', 5, 'compliance', 'owns'),
  ('CRM Data Quality', 'Maintain data quality standards in Veeva CRM', 6, 'data', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-msl'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of Medical Information
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Medical Inquiry Management', 'Oversee medical inquiry response program and SLA compliance', 1, 'operations', 'owns'),
  ('Response Library Governance', 'Govern standard response library content and approval process', 2, 'content', 'owns'),
  ('HCP Communication Quality', 'Ensure quality and accuracy of all HCP communications', 3, 'quality', 'owns'),
  ('Fair Balance Oversight', 'Ensure fair balance in all medical communications', 4, 'compliance', 'owns'),
  ('Inquiry Analytics', 'Analyze medical inquiry trends and report to leadership', 5, 'analytics', 'owns'),
  ('Off-Label Protocol', 'Maintain compliant off-label inquiry handling protocols', 6, 'compliance', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-medinfo'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of Medical Communications
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Publication Strategy', 'Develop and execute publication planning strategy', 1, 'strategy', 'owns'),
  ('Manuscript Oversight', 'Oversee manuscript development and journal submissions', 2, 'content', 'owns'),
  ('Congress Planning', 'Lead medical society congress abstract and presentation strategy', 3, 'external', 'owns'),
  ('Author Relationships', 'Manage external author and KOL relationships for publications', 4, 'external', 'owns'),
  ('MLR Coordination', 'Coordinate medical/legal/regulatory review process', 5, 'compliance', 'owns'),
  ('ICMJE Compliance', 'Ensure ICMJE and GPP3 guideline compliance', 6, 'compliance', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-medcomms'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of Pharmacovigilance
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Safety Monitoring Program', 'Lead post-marketing safety surveillance and signal detection program', 1, 'safety', 'owns'),
  ('Regulatory Reporting', 'Ensure timely and compliant adverse event reporting (ICSRs, PSURs)', 2, 'regulatory', 'owns'),
  ('Signal Management', 'Oversee signal evaluation, assessment, and regulatory actions', 3, 'safety', 'owns'),
  ('Benefit-Risk Management', 'Lead benefit-risk assessment and communication', 4, 'safety', 'owns'),
  ('Audit Readiness', 'Maintain inspection readiness for PV audits', 5, 'compliance', 'owns'),
  ('QPPV Accountability', 'Support Qualified Person for Pharmacovigilance (QPPV) activities', 6, 'regulatory', 'owns'),
  ('Safety Database Integrity', 'Ensure safety database data integrity and quality', 7, 'data', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-safety'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of HEOR
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Value Evidence Strategy', 'Develop global value evidence generation strategy', 1, 'strategy', 'owns'),
  ('HTA Submissions', 'Lead HTA submission strategy and execution (NICE, SMC, ICER)', 2, 'regulatory', 'owns'),
  ('Economic Modeling', 'Oversee cost-effectiveness and budget impact model development', 3, 'analytics', 'owns'),
  ('RWE Program', 'Lead real-world evidence generation program', 4, 'research', 'owns'),
  ('Payer Value Communication', 'Develop payer value propositions and AMCP dossiers', 5, 'external', 'owns'),
  ('Model Validation', 'Ensure model transparency, validation, and reproducibility', 6, 'quality', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-heor'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of KOL Management
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('KOL Strategy', 'Develop global KOL engagement and development strategy', 1, 'strategy', 'owns'),
  ('Advisory Board Program', 'Lead advisory board program design and execution', 2, 'external', 'owns'),
  ('Speaker Bureau', 'Manage speaker bureau recruitment, training, and compliance', 3, 'external', 'owns'),
  ('KOL Mapping', 'Maintain comprehensive KOL mapping and tiering', 4, 'intelligence', 'owns'),
  ('Congress Strategy', 'Lead congress engagement and KOL interaction strategy', 5, 'external', 'owns'),
  ('FMV Compliance', 'Ensure fair market value compliance for KOL engagements', 6, 'compliance', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-kol'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of Medical Education
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Medical Education Strategy', 'Develop and execute medical education strategy', 1, 'strategy', 'owns'),
  ('CME/CPD Programs', 'Lead CME/CPD program development and accreditation', 2, 'education', 'owns'),
  ('Faculty Management', 'Manage faculty speaker identification and training', 3, 'training', 'owns'),
  ('Educational Content', 'Oversee educational content development and approval', 4, 'content', 'owns'),
  ('Grant Administration', 'Manage educational grant program administration', 5, 'finance', 'owns'),
  ('Outcomes Assessment', 'Measure and report educational outcomes and impact', 6, 'analytics', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-meded'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Head of Medical Strategy
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Medical Strategy Development', 'Develop integrated medical strategy aligned with brand strategy', 1, 'strategy', 'owns'),
  ('Competitive Intelligence', 'Lead competitive intelligence program and analysis', 2, 'intelligence', 'owns'),
  ('Launch Planning', 'Lead medical launch readiness planning and execution', 3, 'operations', 'owns'),
  ('Pipeline Support', 'Support pipeline development with medical strategy input', 4, 'strategy', 'owns'),
  ('Lifecycle Management', 'Provide medical input for lifecycle management decisions', 5, 'strategy', 'owns'),
  ('Cross-Functional Alignment', 'Ensure medical strategy alignment across functions', 6, 'leadership', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'head-of-medstrategy'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 3: L3 SPECIALIST RESPONSIBILITIES
-- ============================================================================

-- MSL Specialist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Scientific Exchange Delivery', 'Conduct compliant scientific exchange with HCPs in territory', 1, 'execution', 'owns'),
  ('KOL Relationship Management', 'Manage relationships with assigned KOLs', 2, 'external', 'owns'),
  ('Insight Collection', 'Collect and report field medical insights', 3, 'intelligence', 'contributes'),
  ('Congress Support', 'Support medical society congress activities', 4, 'external', 'contributes'),
  ('Internal Training', 'Provide medical training to commercial teams', 5, 'training', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'msl-specialist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Medical Information Scientist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Inquiry Response', 'Draft accurate and timely responses to medical inquiries', 1, 'execution', 'owns'),
  ('Literature Review', 'Conduct literature reviews to support inquiry responses', 2, 'research', 'owns'),
  ('Response Library Updates', 'Create and update standard response documents', 3, 'content', 'owns'),
  ('Quality Review', 'Review inquiry responses for accuracy and compliance', 4, 'quality', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'medinfo-scientist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Medical Writer
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Manuscript Development', 'Draft and revise manuscripts for peer-reviewed publications', 1, 'content', 'owns'),
  ('Congress Materials', 'Create posters, abstracts, and presentations', 2, 'content', 'owns'),
  ('Regulatory Documents', 'Write CSRs, IBs, and regulatory submissions', 3, 'regulatory', 'owns'),
  ('Author Coordination', 'Coordinate with authors and reviewers', 4, 'coordination', 'owns'),
  ('Reference Management', 'Maintain accurate reference citations', 5, 'quality', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'medical-writer'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Safety Scientist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Signal Evaluation', 'Evaluate and assess potential safety signals', 1, 'safety', 'owns'),
  ('Case Assessment', 'Assess individual case safety reports for causality', 2, 'safety', 'owns'),
  ('Literature Monitoring', 'Monitor scientific literature for safety signals', 3, 'surveillance', 'owns'),
  ('Aggregate Report Authoring', 'Author PSUR/PBRER sections', 4, 'regulatory', 'contributes'),
  ('Risk Minimization', 'Propose risk minimization measures', 5, 'safety', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'safety-scientist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Health Economist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Model Development', 'Build cost-effectiveness and budget impact models', 1, 'analytics', 'owns'),
  ('HTA Dossier Authoring', 'Author economic sections of HTA submissions', 2, 'regulatory', 'owns'),
  ('Value Communication', 'Develop value messages for payer audiences', 3, 'content', 'owns'),
  ('Model Validation', 'Validate models and respond to HTA reviewer queries', 4, 'quality', 'owns'),
  ('RWE Analysis', 'Analyze real-world evidence for economic outcomes', 5, 'research', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'health-economist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- KOL Strategist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('KOL Identification', 'Identify and profile key opinion leaders', 1, 'intelligence', 'owns'),
  ('Engagement Planning', 'Develop KOL engagement plans and tactics', 2, 'strategy', 'owns'),
  ('Advisory Board Execution', 'Plan and execute advisory board meetings', 3, 'execution', 'owns'),
  ('Speaker Nomination', 'Identify and nominate speaker candidates', 4, 'operations', 'owns'),
  ('Relationship Tracking', 'Track and report KOL interactions and outcomes', 5, 'analytics', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'kol-strategist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Medical Education Specialist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Program Development', 'Develop medical education programs and curricula', 1, 'education', 'owns'),
  ('Faculty Coordination', 'Coordinate faculty speakers and trainers', 2, 'coordination', 'owns'),
  ('Content Creation', 'Create educational content and materials', 3, 'content', 'owns'),
  ('Outcomes Measurement', 'Measure educational program outcomes', 4, 'analytics', 'contributes'),
  ('Accreditation Support', 'Support CME accreditation requirements', 5, 'compliance', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'meded-specialist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Medical Strategy Analyst
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Competitive Analysis', 'Conduct competitive landscape and pipeline analysis', 1, 'intelligence', 'owns'),
  ('Strategy Support', 'Support medical strategy development with analysis', 2, 'strategy', 'contributes'),
  ('Launch Tracking', 'Track medical launch readiness milestones', 3, 'operations', 'owns'),
  ('Trend Analysis', 'Analyze industry and therapeutic area trends', 4, 'analytics', 'owns'),
  ('Reporting', 'Create strategic reports and presentations', 5, 'content', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'medstrategy-analyst'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Medical Affairs Generalist
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('General Medical Support', 'Provide general medical affairs support across functions', 1, 'execution', 'owns'),
  ('Cross-Functional Liaison', 'Serve as liaison between MA departments', 2, 'coordination', 'owns'),
  ('Ad Hoc Research', 'Conduct ad hoc research and literature reviews', 3, 'research', 'owns'),
  ('Document Preparation', 'Prepare medical documents and presentations', 4, 'content', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'medaffairs-generalist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 4: L4 CONTEXT ENGINEER RESPONSIBILITIES
-- ============================================================================

-- All Context Engineers share data retrieval responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Data Retrieval', 'Retrieve relevant data from assigned sources and tools', 1, 'execution', 'owns'),
  ('Query Optimization', 'Optimize queries for accuracy and completeness', 2, 'quality', 'owns'),
  ('Context Assembly', 'Assemble context from multiple sources for L3 specialists', 3, 'coordination', 'owns'),
  ('Worker Coordination', 'Coordinate with L4 workers for task execution', 4, 'coordination', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug IN (
    'msl-context-engineer',
    'medinfo-context-engineer',
    'medcomms-context-engineer',
    'safety-context-engineer',
    'heor-context-engineer',
    'kol-context-engineer',
    'meded-context-engineer',
    'medstrategy-context-engineer',
    'generic-context-engineer'
  )
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 5: L4 WORKER RESPONSIBILITIES
-- ============================================================================

-- MSL Activity Coordinator
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Activity Logging', 'Log MSL activities and engagements in CRM', 1, 'execution', 'owns'),
  ('CRM Data Entry', 'Enter and maintain CRM data accurately', 2, 'data', 'owns'),
  ('Scheduling Support', 'Support scheduling of MSL activities', 3, 'operations', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'msl-activity-coordinator'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Medical Information Specialist (Worker)
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Inquiry Logging', 'Log medical inquiries in tracking system', 1, 'execution', 'owns'),
  ('Response Processing', 'Process and route inquiry responses', 2, 'operations', 'owns'),
  ('SLA Monitoring', 'Monitor and flag SLA compliance', 3, 'compliance', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'medical-information-specialist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Publication Coordinator
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Manuscript Tracking', 'Track manuscript status and milestones', 1, 'operations', 'owns'),
  ('Author Forms', 'Collect and manage author forms and disclosures', 2, 'administration', 'owns'),
  ('Deadline Alerts', 'Alert team to upcoming deadlines', 3, 'operations', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'publication-coordinator'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Safety Case Processor
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Case Entry', 'Enter adverse event cases into safety database', 1, 'execution', 'owns'),
  ('MedDRA Coding', 'Code adverse events using MedDRA terminology', 2, 'execution', 'owns'),
  ('Expedited Flag', 'Flag cases requiring expedited reporting', 3, 'compliance', 'owns'),
  ('Data Quality', 'Ensure case data quality and completeness', 4, 'quality', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'safety-case-processor'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- HEOR Coordinator
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Model Input Entry', 'Enter model inputs and parameters', 1, 'execution', 'owns'),
  ('HTA Tracking', 'Track HTA submission timelines and status', 2, 'operations', 'owns'),
  ('Data Collection', 'Collect and organize data for economic analyses', 3, 'data', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'heor-coordinator'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- KOL Engagement Coordinator
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Interaction Logging', 'Log KOL interactions in CRM', 1, 'execution', 'owns'),
  ('Profile Updates', 'Update KOL profiles with new information', 2, 'data', 'owns'),
  ('Follow-up Scheduling', 'Schedule follow-up activities', 3, 'operations', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'kol-engagement-coordinator'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- MedEd Coordinator
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Program Logging', 'Log educational program activities', 1, 'execution', 'owns'),
  ('Attendance Tracking', 'Track program attendance and participation', 2, 'operations', 'owns'),
  ('Assessment Collection', 'Collect and organize assessment results', 3, 'data', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'meded-coordinator'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- Strategy Coordinator
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Intel Logging', 'Log competitive intelligence findings', 1, 'execution', 'owns'),
  ('Landscape Updates', 'Update competitive landscape databases', 2, 'data', 'owns'),
  ('Report Generation', 'Generate routine strategy reports', 3, 'operations', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'strategy-coordinator'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 6: L5 TOOL RESPONSIBILITIES
-- ============================================================================

-- All L5 tools have atomic execution responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Query Execution', 'Execute queries against assigned data source', 1, 'execution', 'owns'),
  ('Result Formatting', 'Format results in standardized structure', 2, 'execution', 'owns'),
  ('Error Handling', 'Handle errors gracefully and report issues', 3, 'quality', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 7: VERIFICATION
-- ============================================================================

-- Summary by level
SELECT
  al.level_number,
  al.level_name,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT ar.id) as responsibility_links,
  ROUND(COUNT(DISTINCT ar.id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 1) as avg_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_responsibilities ar ON ar.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;

-- Top responsibilities by category
SELECT
  category,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT responsibility ORDER BY responsibility) as responsibilities
FROM agent_responsibilities ar
JOIN agents a ON ar.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY category
ORDER BY count DESC;

-- Migration summary
SELECT
  'Migration 031: Responsibilities' as migration,
  (SELECT COUNT(DISTINCT ar.agent_id)
   FROM agent_responsibilities ar
   JOIN agents a ON ar.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as ma_agents_with_responsibilities,
  (SELECT COUNT(*)
   FROM agent_responsibilities ar
   JOIN agents a ON ar.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as total_links;
