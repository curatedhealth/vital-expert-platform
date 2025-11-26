-- ============================================================================
-- Medical Affairs: Agent Responsibility Assignments
-- File: 20251127-assign-medical-affairs-responsibilities.sql
-- Purpose: Assign 60 responsibilities (39 role-specific + 21 cross-cutting) to 158 Medical Affairs agents
-- Strategy: Each agent gets 8-12 responsibilities based on role + level
-- ============================================================================

-- ============================================================================
-- STEP 1: Seed Responsibilities Table
-- ============================================================================

-- Role-Specific Responsibilities (39)
INSERT INTO responsibilities (id, name, description, category, accountability_metrics, created_at, updated_at)
VALUES
-- Leadership & Strategic (4)
('RESP-MA-001', 'Enterprise Medical Strategy Execution', 'Own and execute comprehensive medical affairs strategy across all therapeutic areas, geographies, and stakeholder groups.', 'Leadership', 'Strategic plan completion, objective achievement, stakeholder alignment, P&L performance', NOW(), NOW()),
('RESP-MA-002', 'Regional/Global Medical Leadership', 'Lead medical affairs function for region or global portfolio with full P&L accountability and team management.', 'Leadership', 'Regional goals achievement, budget management, team performance, compliance', NOW(), NOW()),
('RESP-MA-003', 'Therapeutic Area Medical Directorate', 'Direct all medical affairs activities for assigned therapeutic area with budget and team accountability.', 'Leadership', 'TA objectives, budget adherence, team engagement, scientific leadership', NOW(), NOW()),
('RESP-MA-004', 'Governance Framework Establishment', 'Establish and maintain medical governance frameworks, policies, and compliance oversight programs.', 'Governance', 'Policy implementation, audit results, compliance rate, risk management', NOW(), NOW()),

-- Field Medical (6)
('RESP-MA-005', 'KOL Relationship Development', 'Build and maintain trusted relationships with top-tier KOLs and thought leaders in assigned territory.', 'Field Medical', 'KOL satisfaction, interaction quality, scientific depth, partnership outcomes', NOW(), NOW()),
('RESP-MA-006', 'Territory Scientific Coverage', 'Achieve comprehensive scientific coverage of assigned territory including institutions, practices, and conferences.', 'Field Medical', 'Call targets, geography coverage, scientific discussions, insights generation', NOW(), NOW()),
('RESP-MA-007', 'Clinical Trial Investigator Support', 'Support clinical trial success through site identification, feasibility, investigator engagement, and enrollment.', 'Field Medical', 'Enrollment targets, site activation, investigator satisfaction, protocol adherence', NOW(), NOW()),
('RESP-MA-008', 'Medical Insights Collection', 'Systematically collect and report medical insights from KOLs and customers to inform strategy.', 'Field Medical', 'Insight volume, quality ratings, actionability, strategic impact', NOW(), NOW()),
('RESP-MA-009', 'MSL Team Leadership & Development', 'Lead, develop, and performance-manage team of MSLs across assigned geography or therapeutic area.', 'Field Medical', 'Team performance, engagement scores, capability development, turnover', NOW(), NOW()),
('RESP-MA-010', 'Congress Strategy & Execution', 'Own congress strategy and execution including booth presence, symposia, investigator meetings.', 'Field Medical', 'Congress coverage, booth traffic, symposia attendance, ROI', NOW(), NOW()),

-- Medical Writing & Publications (5)
('RESP-MA-011', 'Regulatory Document Authoring', 'Author regulatory documents including CSRs, IBs, protocols, investigator brochures per timelines.', 'Medical Writing', 'Document quality, timeline adherence, regulatory acceptance, revision cycles', NOW(), NOW()),
('RESP-MA-012', 'Manuscript Development & Submission', 'Develop manuscripts for peer review and manage through submission and publication process.', 'Medical Writing', 'Publications achieved, journal tier, acceptance rate, timeline adherence', NOW(), NOW()),
('RESP-MA-013', 'Congress Materials Creation', 'Create abstracts, posters, and presentations for submission to scientific congresses.', 'Medical Writing', 'Submission success, acceptance rate, presentation quality, deadline adherence', NOW(), NOW()),
('RESP-MA-014', 'Publication Plan Execution', 'Execute strategic publication plans aligned with medical and commercial objectives and timelines.', 'Publications', 'Plan adherence, publication targets, strategic alignment, impact factor', NOW(), NOW()),
('RESP-MA-015', 'Scientific Communication Development', 'Develop scientific communication materials including slide decks, FAQs, and core messaging documents.', 'Communications', 'Material completeness, scientific accuracy, approval cycle time, usage', NOW(), NOW()),

-- Medical Information (4)
('RESP-MA-016', 'Medical Inquiry Response Excellence', 'Respond to all unsolicited medical inquiries within SLA with accurate, balanced, compliant responses.', 'Medical Information', 'Response time (SLA <48h), accuracy rate (>98%), customer satisfaction, compliance', NOW(), NOW()),
('RESP-MA-017', 'MI Reference Library Curation', 'Build and maintain comprehensive medical information reference library and standard response documents.', 'Medical Information', 'Library completeness, document currency, usage rate, quality scores', NOW(), NOW()),
('RESP-MA-018', 'Adverse Event Management', 'Identify, document, and report adverse events per regulatory requirements and internal timelines.', 'Medical Information', 'AE reporting timeliness (100%), accuracy, compliance, zero late submissions', NOW(), NOW()),
('RESP-MA-019', 'MI Operations Management', 'Manage medical information operations including call center, metrics, and process optimization.', 'Medical Information', 'Call volume handling, SLA achievement, cost per inquiry, quality scores', NOW(), NOW()),

-- Medical Education (4)
('RESP-MA-020', 'Medical Education Strategy', 'Develop and execute comprehensive medical education strategy for internal and external audiences.', 'Medical Education', 'Strategy completion, program reach, impact assessment, stakeholder satisfaction', NOW(), NOW()),
('RESP-MA-021', 'Sales Force Medical Training', 'Design and deliver medical training programs for sales force to ensure scientific accuracy.', 'Medical Education', 'Training completion (100%), knowledge assessment scores, application rate, compliance', NOW(), NOW()),
('RESP-MA-022', 'Digital Education Content Creation', 'Create engaging digital medical education content including e-learning, webinars, and modules.', 'Medical Education', 'Content completion, engagement metrics, satisfaction scores, learning outcomes', NOW(), NOW()),
('RESP-MA-023', 'HCP Education Program Delivery', 'Plan and execute external medical education programs for healthcare professionals.', 'Medical Education', 'Program reach, HCP satisfaction, knowledge improvement, impact assessment', NOW(), NOW()),

-- HEOR & RWE (4)
('RESP-MA-024', 'Economic Model Development', 'Develop health economic models including CEA, CUA, and BIA to support value demonstration.', 'HEOR', 'Model completion, technical quality, stakeholder acceptance, strategic impact', NOW(), NOW()),
('RESP-MA-025', 'RWE Study Execution', 'Design and execute real-world evidence studies including patient registries and observational studies.', 'HEOR', 'Study completion, enrollment targets, data quality, publication outcomes', NOW(), NOW()),
('RESP-MA-026', 'PRO Assessment & Analysis', 'Measure and analyze patient-reported outcomes to support value propositions.', 'HEOR', 'Assessment completion, data quality, analysis depth, strategic application', NOW(), NOW()),
('RESP-MA-027', 'Market Access Evidence Generation', 'Generate evidence to support pricing, reimbursement, and formulary access decisions.', 'HEOR', 'Evidence package completion, payer acceptance, access success rate, timeline', NOW(), NOW()),

-- Clinical Operations (2)
('RESP-MA-028', 'Clinical Site Support & Liaison', 'Serve as medical liaison for clinical sites supporting feasibility, start-up, and ongoing operations.', 'Clinical Operations', 'Site activation, enrollment support, investigator satisfaction, protocol compliance', NOW(), NOW()),
('RESP-MA-029', 'Clinical Data Analysis & Reporting', 'Analyze clinical trial data and develop medical analyses to support evidence generation.', 'Clinical Operations', 'Analysis quality, timeline adherence, strategic value, stakeholder satisfaction', NOW(), NOW()),

-- Compliance & Governance (3)
('RESP-MA-030', 'Medical Compliance Oversight', 'Monitor medical affairs activities for compliance and conduct audits per risk-based plan.', 'Compliance', 'Audit completion, compliance rate (>95%), finding remediation, risk mitigation', NOW(), NOW()),
('RESP-MA-031', 'Promotional Material Review (MLR)', 'Review promotional materials for scientific accuracy, balance, and regulatory compliance.', 'Compliance', 'Review turnaround time, accuracy, compliance rate (100%), stakeholder satisfaction', NOW(), NOW()),
('RESP-MA-032', 'Quality Management System', 'Establish and maintain quality management system for medical affairs including SOPs and training.', 'Compliance', 'SOP currency, training completion, audit readiness, continuous improvement', NOW(), NOW()),

-- Scientific Affairs (2)
('RESP-MA-033', 'Scientific Thought Leadership', 'Establish scientific thought leadership through strategic initiatives, publications, and external engagement.', 'Scientific Affairs', 'Publication impact, external recognition, scientific partnerships, influence', NOW(), NOW()),
('RESP-MA-034', 'Cross-Functional Medical Strategy', 'Provide medical leadership across commercial, regulatory, market access, and R&D functions.', 'Scientific Affairs', 'Cross-functional satisfaction, strategic influence, alignment, collaboration', NOW(), NOW()),

-- Operational Support (5)
('RESP-MA-035', 'Document Management Excellence', 'Organize, maintain, and ensure accessibility of medical documents per compliance requirements.', 'Operations', 'Document accessibility, organization quality, retrieval time, compliance', NOW(), NOW()),
('RESP-MA-036', 'Literature Monitoring & Alerting', 'Conduct systematic literature searches and alert stakeholders to relevant publications.', 'Operations', 'Search completeness, alert timeliness, relevance rate, stakeholder satisfaction', NOW(), NOW()),
('RESP-MA-037', 'Data Entry Accuracy', 'Enter medical affairs data into systems with high accuracy and completeness.', 'Operations', 'Data accuracy (>98%), completeness, timeliness, error rate (<2%)', NOW(), NOW()),
('RESP-MA-038', 'Report Generation & Analytics', 'Generate reports and dashboards from medical affairs systems to support decision-making.', 'Operations', 'Report timeliness, accuracy, insight value, stakeholder satisfaction', NOW(), NOW()),
('RESP-MA-039', 'Meeting & Event Coordination', 'Coordinate logistics for medical meetings and events including venue, materials, and compliance.', 'Operations', 'Event execution quality, budget adherence, attendee satisfaction, compliance', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    accountability_metrics = EXCLUDED.accountability_metrics,
    updated_at = NOW();

-- Cross-Cutting Responsibilities (21)
INSERT INTO responsibilities (id, name, description, category, accountability_metrics, created_at, updated_at)
VALUES
-- Strategic & Leadership (4)
('RESP-MA-040', 'Strategic Planning & Roadmap Development', 'Develop strategic plans and roadmaps for medical affairs initiatives with clear priorities and resources.', 'Strategic', 'Plan completion, objective clarity, stakeholder buy-in, execution success rate', NOW(), NOW()),
('RESP-MA-041', 'Budget Ownership & Financial Performance', 'Own budget for assigned area including forecasting, tracking, and optimizing spend.', 'Strategic', 'Budget adherence (±5%), ROI achievement, cost efficiency, forecast accuracy', NOW(), NOW()),
('RESP-MA-042', 'Team Development & Talent Management', 'Develop team capabilities, manage performance, and build high-performing teams.', 'Strategic', 'Team engagement, performance ratings, retention (>90%), development completion', NOW(), NOW()),
('RESP-MA-043', 'Process Improvement & Innovation Leadership', 'Lead continuous improvement and implement new processes/technologies.', 'Strategic', 'Improvements delivered, efficiency gains, innovation adoption, satisfaction', NOW(), NOW()),

-- Stakeholder Management (4)
('RESP-MA-044', 'Executive Stakeholder Management', 'Manage relationships with C-suite and senior executives.', 'Stakeholder', 'Executive satisfaction, strategic influence, communication effectiveness, trust', NOW(), NOW()),
('RESP-MA-045', 'Cross-Functional Partnership Management', 'Build productive partnerships with commercial, regulatory, and R&D functions.', 'Stakeholder', 'Partnership effectiveness, collaboration scores, joint initiative success', NOW(), NOW()),
('RESP-MA-046', 'Internal Communication & Change Leadership', 'Communicate organizational changes and lead change initiatives.', 'Stakeholder', 'Communication effectiveness, change adoption rate, employee understanding', NOW(), NOW()),
('RESP-MA-047', 'Documentation & Record Management', 'Ensure accurate documentation of medical affairs activities per compliance.', 'Stakeholder', 'Documentation completeness (>95%), audit readiness, compliance, retrieval time', NOW(), NOW()),

-- Performance & Metrics (3)
('RESP-MA-048', 'KPI Achievement & Performance Delivery', 'Achieve or exceed assigned KPIs and implement corrective actions.', 'Performance', 'KPI achievement (≥100%), consistent performance, trend improvement', NOW(), NOW()),
('RESP-MA-049', 'Quality Standards & Compliance Adherence', 'Maintain quality standards and ensure compliance with regulations and SOPs.', 'Performance', 'Quality scores (>90%), compliance rate (100%), zero critical audit findings', NOW(), NOW()),
('RESP-MA-050', 'Metrics Tracking & Reporting', 'Track relevant metrics and report insights to stakeholders.', 'Performance', 'Report timeliness, data accuracy, insight quality, stakeholder satisfaction', NOW(), NOW()),

-- Knowledge & Expertise (3)
('RESP-MA-051', 'Therapeutic Area Expertise Maintenance', 'Maintain deep, current knowledge of assigned therapeutic areas.', 'Knowledge', 'Knowledge assessment (>85%), literature currency, stakeholder credibility', NOW(), NOW()),
('RESP-MA-052', 'Regulatory & Compliance Knowledge Currency', 'Stay current on pharmaceutical regulations and compliance requirements.', 'Knowledge', 'Training completion, regulation application, compliance (100%), assessments', NOW(), NOW()),
('RESP-MA-053', 'Continuous Learning & Professional Development', 'Engage in continuous learning and professional growth.', 'Knowledge', 'Training hours, skill assessments, certifications obtained, application', NOW(), NOW()),

-- Operational Excellence (3)
('RESP-MA-054', 'SOP Adherence & Process Compliance', 'Follow SOPs and established processes, identify gaps.', 'Operations', 'SOP compliance (100%), zero unauthorized deviations, improvements suggested', NOW(), NOW()),
('RESP-MA-055', 'System & Technology Utilization', 'Effectively use medical affairs systems and maintain data quality.', 'Operations', 'System adoption, data quality (>95%), system proficiency, compliance', NOW(), NOW()),
('RESP-MA-056', 'Resource Optimization & Efficiency', 'Optimize use of time, budget, and resources.', 'Operations', 'Efficiency metrics, productivity scores, cost savings, time optimization', NOW(), NOW()),

-- Collaboration & Teamwork (2)
('RESP-MA-057', 'Team Collaboration & Support', 'Actively collaborate with team members and support team objectives.', 'Collaboration', 'Team collaboration scores, peer feedback, knowledge sharing, goal contribution', NOW(), NOW()),
('RESP-MA-058', 'Knowledge Sharing & Best Practice Dissemination', 'Share knowledge and best practices with team and organization.', 'Collaboration', 'Knowledge contributions, presentation delivery, documentation, recognition', NOW(), NOW()),

-- Ethics & Professionalism (2)
('RESP-MA-059', 'Ethical Conduct & Professional Integrity', 'Maintain highest ethical standards in all interactions and decisions.', 'Ethics', 'Ethics compliance (100%), professional conduct, stakeholder trust, zero violations', NOW(), NOW()),
('RESP-MA-060', 'Patient Focus & Scientific Rigor', 'Maintain patient-centric perspective and ensure scientific rigor.', 'Ethics', 'Patient-centric decision-making, scientific accuracy, evidence quality, ethics', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    accountability_metrics = EXCLUDED.accountability_metrics,
    updated_at = NOW();

-- ============================================================================
-- STEP 2: Assign Role-Specific Responsibilities to Agents
-- ============================================================================

-- Note: Using agent_responsibilities junction table (assuming schema similar to agent_capabilities)
-- Clear existing Medical Affairs responsibility assignments
DELETE FROM agent_responsibilities
WHERE agent_id IN (
    SELECT id FROM agents WHERE function_name = 'Medical Affairs'
);

-- Leadership Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    'RESP-MA-001' as responsibility_id,
    1.0 as weight,
    true as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%Chief Medical Officer%'
    AND a.status = 'active';

INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    'RESP-MA-002' as responsibility_id,
    1.0 as weight,
    true as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%VP Medical Affairs%'
    AND a.status = 'active';

INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    'RESP-MA-003' as responsibility_id,
    1.0 as weight,
    true as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Director%')
    AND a.status = 'active';

-- MSL Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-005', 1.0, true),   -- KOL Relationship
        ('RESP-MA-006', 0.9, true),   -- Territory Coverage
        ('RESP-MA-007', 0.8, false),  -- Trial Support
        ('RESP-MA-008', 0.9, true),   -- Insights Collection
        ('RESP-MA-010', 0.7, false)   -- Congress Execution
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%MSL%' OR a.role_name ILIKE '%Medical Science Liaison%')
    AND a.status = 'active';

-- Medical Writer Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-011', 1.0, true),   -- Regulatory Authoring
        ('RESP-MA-012', 0.9, true),   -- Manuscript Development
        ('RESP-MA-013', 0.8, false),  -- Congress Materials
        ('RESP-MA-015', 0.7, false)   -- Scientific Communications
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%Medical Writer%'
    AND a.status = 'active';

-- Publications Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-014', 1.0, true),   -- Publication Plan
        ('RESP-MA-012', 0.8, false),  -- Manuscript Development
        ('RESP-MA-013', 0.7, false)   -- Congress Materials
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%Publication%'
    AND a.status = 'active';

-- Medical Information Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-016', 1.0, true),   -- Inquiry Response
        ('RESP-MA-017', 0.8, false),  -- Library Curation
        ('RESP-MA-018', 0.9, true)    -- AE Management
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Medical Info%' OR a.role_name ILIKE '%MI Operations%')
    AND a.status = 'active';

-- Medical Education Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-020', 1.0, true),   -- Education Strategy
        ('RESP-MA-021', 0.9, false),  -- Sales Training
        ('RESP-MA-023', 0.8, false)   -- HCP Education
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Medical Education%' OR a.role_name ILIKE '%Scientific Trainer%')
    AND a.status = 'active';

-- HEOR & RWE Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-024', 1.0, true),   -- Economic Modeling
        ('RESP-MA-025', 0.9, true),   -- RWE Execution
        ('RESP-MA-026', 0.7, false),  -- PRO Assessment
        ('RESP-MA-027', 0.8, false)   -- Market Access Evidence
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%HEOR%' OR a.role_name ILIKE '%Real-World Evidence%' OR a.role_name ILIKE '%Economic Model%')
    AND a.status = 'active';

-- Compliance & Governance Roles
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    r.weight,
    r.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('RESP-MA-004', 1.0, true),   -- Governance Framework
        ('RESP-MA-030', 1.0, true),   -- Compliance Oversight
        ('RESP-MA-031', 0.9, false),  -- MLR
        ('RESP-MA-032', 0.8, false)   -- QMS
) r(responsibility_id, weight, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Compliance%' OR a.role_name ILIKE '%Governance%' OR a.role_name ILIKE '%Excellence%')
    AND a.status = 'active';

-- ============================================================================
-- STEP 3: Assign Cross-Cutting Responsibilities Based on Level
-- ============================================================================

-- L1 MASTER: Strategic + Leadership responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    0.8 as weight,
    false as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('RESP-MA-040'),  -- Strategic Planning
        ('RESP-MA-041'),  -- Budget Ownership
        ('RESP-MA-042'),  -- Team Development
        ('RESP-MA-044'),  -- Executive Stakeholder
        ('RESP-MA-051'),  -- TA Expertise
        ('RESP-MA-059')   -- Ethical Conduct
) r(responsibility_id)
WHERE a.function_name = 'Medical Affairs'
    AND al.level_number = 1
    AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- L2 EXPERT: Professional + Delivery responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    0.9 as weight,
    false as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('RESP-MA-045'),  -- Cross-Functional Partnership
        ('RESP-MA-047'),  -- Documentation
        ('RESP-MA-048'),  -- KPI Achievement
        ('RESP-MA-049'),  -- Quality & Compliance
        ('RESP-MA-051'),  -- TA Expertise
        ('RESP-MA-052'),  -- Regulatory Knowledge
        ('RESP-MA-059')   -- Ethical Conduct
) r(responsibility_id)
WHERE a.function_name = 'Medical Affairs'
    AND al.level_number = 2
    AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- L3 SPECIALIST: Execution + Operational responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility_id, weight, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    r.responsibility_id,
    0.9 as weight,
    false as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('RESP-MA-047'),  -- Documentation
        ('RESP-MA-048'),  -- KPI Achievement
        ('RESP-MA-049'),  -- Quality & Compliance
        ('RESP-MA-051'),  -- TA Expertise
        ('RESP-MA-054'),  -- SOP Adherence
        ('RESP-MA-055'),  -- System Utilization
        ('RESP-MA-057'),  -- Team Collaboration
        ('RESP-MA-059'),  -- Ethical Conduct
        ('RESP-MA-060')   -- Patient Focus
) r(responsibility_id)
WHERE a.function_name = 'Medical Affairs'
    AND al.level_number = 3
    AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================

DO $$
DECLARE
    total_agents INTEGER;
    agents_with_resp INTEGER;
    avg_resp_per_agent NUMERIC;
BEGIN
    -- Count total Medical Affairs agents
    SELECT COUNT(*) INTO total_agents
    FROM agents
    WHERE function_name = 'Medical Affairs' AND status = 'active';
    
    -- Count agents with responsibilities
    SELECT COUNT(DISTINCT agent_id) INTO agents_with_resp
    FROM agent_responsibilities ar
    JOIN agents a ON ar.agent_id = a.id
    WHERE a.function_name = 'Medical Affairs' AND a.status = 'active';
    
    -- Calculate average responsibilities per agent
    SELECT AVG(resp_count) INTO avg_resp_per_agent
    FROM (
        SELECT COUNT(*) as resp_count
        FROM agent_responsibilities ar
        JOIN agents a ON ar.agent_id = a.id
        WHERE a.function_name = 'Medical Affairs' AND a.status = 'active'
        GROUP BY ar.agent_id
    ) sub;
    
    RAISE NOTICE '=== Medical Affairs Responsibility Assignment Summary ===';
    RAISE NOTICE 'Total Medical Affairs Agents: %', total_agents;
    RAISE NOTICE 'Agents with Responsibilities: %', agents_with_resp;
    RAISE NOTICE 'Coverage: % %%', ROUND((agents_with_resp::NUMERIC / total_agents * 100), 2);
    RAISE NOTICE 'Average Responsibilities per Agent: %', ROUND(avg_resp_per_agent, 1);
END $$;

-- Show sample assignments
SELECT 
    a.name as agent_name,
    a.role_name,
    al.level_number as level,
    COUNT(ar.responsibility_id) as responsibility_count,
    STRING_AGG(r.name, ' | ' ORDER BY ar.is_primary DESC, r.name) as responsibilities
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_responsibilities ar ON a.id = ar.agent_id
LEFT JOIN responsibilities r ON ar.responsibility_id = r.id
WHERE a.function_name = 'Medical Affairs'
    AND a.status = 'active'
GROUP BY a.id, a.name, a.role_name, al.level_number
ORDER BY al.level_number, a.role_name
LIMIT 10;

