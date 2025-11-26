-- ============================================================================
-- Medical Affairs: Agent Capability Assignments
-- File: 20251127-assign-medical-affairs-capabilities.sql
-- Purpose: Assign 60 capabilities (39 role-specific + 21 cross-cutting) to 158 Medical Affairs agents
-- Strategy: Each agent gets 8-12 capabilities based on role + level
-- ============================================================================

-- ============================================================================
-- STEP 1: Seed Capabilities Table
-- ============================================================================

-- Role-Specific Capabilities (39)
INSERT INTO capabilities (id, name, description, category, created_at, updated_at)
VALUES
-- Leadership & Strategic (4)
('CAP-MA-001', 'C-Suite Medical Leadership', 'Executive-level medical leadership across enterprise, setting medical vision, strategy, and priorities.', 'Leadership', NOW(), NOW()),
('CAP-MA-002', 'VP-Level Medical Strategy', 'Development and execution of regional/global medical affairs strategy across multiple therapeutic areas.', 'Leadership', NOW(), NOW()),
('CAP-MA-003', 'Medical Affairs Directorate Management', 'Leading medical affairs function or therapeutic area at director level with multiple teams and budgets.', 'Leadership', NOW(), NOW()),
('CAP-MA-004', 'Medical Governance & Compliance Leadership', 'Establishing and overseeing medical governance frameworks and compliance programs.', 'Governance', NOW(), NOW()),

-- Field Medical (6)
('CAP-MA-005', 'MSL Core Competency - KOL Engagement', 'Building and maintaining deep scientific relationships with key opinion leaders and thought leaders.', 'Field Medical', NOW(), NOW()),
('CAP-MA-006', 'MSL Territory & Account Management', 'Strategic management of assigned geographic territory or key accounts.', 'Field Medical', NOW(), NOW()),
('CAP-MA-007', 'MSL Scientific Presentation & Education', 'Delivering high-quality scientific presentations at institutions, conferences, and advisory boards.', 'Field Medical', NOW(), NOW()),
('CAP-MA-008', 'MSL Clinical Trial Support', 'Supporting clinical trial recruitment, site selection, and investigator engagement.', 'Field Medical', NOW(), NOW()),
('CAP-MA-009', 'Field Medical Team Leadership', 'Leading teams of MSLs across territories or therapeutic areas.', 'Field Medical', NOW(), NOW()),
('CAP-MA-010', 'Congress & Conference Management', 'Planning and executing congress strategies including booth presence and symposia.', 'Field Medical', NOW(), NOW()),

-- Medical Writing & Publications (5)
('CAP-MA-011', 'Regulatory Medical Writing', 'Writing and reviewing regulatory documents including CSRs, IBs, and regulatory submissions.', 'Medical Writing', NOW(), NOW()),
('CAP-MA-012', 'Clinical Manuscript Development', 'Developing peer-reviewed manuscripts for scientific journals.', 'Medical Writing', NOW(), NOW()),
('CAP-MA-013', 'Congress Abstract & Poster Creation', 'Creating abstracts and posters for scientific congresses and conferences.', 'Medical Writing', NOW(), NOW()),
('CAP-MA-014', 'Publication Planning & Strategy', 'Developing strategic publication plans aligned with medical and commercial objectives.', 'Publications', NOW(), NOW()),
('CAP-MA-015', 'Scientific Communications Development', 'Creating scientific communication materials including slide decks and messaging documents.', 'Communications', NOW(), NOW()),

-- Medical Information (4)
('CAP-MA-016', 'Medical Inquiry Response Management', 'Responding to unsolicited medical inquiries with accurate, balanced, compliant information.', 'Medical Information', NOW(), NOW()),
('CAP-MA-017', 'Medical Information Database Management', 'Building and maintaining medical information reference library and standard responses.', 'Medical Information', NOW(), NOW()),
('CAP-MA-018', 'Adverse Event Processing & Reporting', 'Identifying, documenting, and reporting adverse events per regulatory timelines.', 'Medical Information', NOW(), NOW()),
('CAP-MA-019', 'Medical Information Operations', 'Managing medical information operations including call center and metrics tracking.', 'Medical Information', NOW(), NOW()),

-- Medical Education (4)
('CAP-MA-020', 'Medical Education Strategy & Planning', 'Developing comprehensive medical education strategy and evaluation frameworks.', 'Medical Education', NOW(), NOW()),
('CAP-MA-021', 'Internal Sales Force Training', 'Designing and delivering medical training programs for commercial teams.', 'Medical Education', NOW(), NOW()),
('CAP-MA-022', 'Digital Medical Education Development', 'Creating digital medical education content including e-learning and webinars.', 'Medical Education', NOW(), NOW()),
('CAP-MA-023', 'HCP Education Program Execution', 'Planning and executing external medical education programs for HCPs.', 'Medical Education', NOW(), NOW()),

-- HEOR (4)
('CAP-MA-024', 'Economic Modeling & Analysis', 'Building health economic models including cost-effectiveness and budget impact analyses.', 'HEOR', NOW(), NOW()),
('CAP-MA-025', 'Real-World Evidence Study Design', 'Designing and executing real-world evidence studies and patient registries.', 'HEOR', NOW(), NOW()),
('CAP-MA-026', 'Health Outcomes Assessment', 'Measuring patient-reported outcomes, quality of life, and treatment satisfaction.', 'HEOR', NOW(), NOW()),
('CAP-MA-027', 'Value & Market Access Evidence Generation', 'Generating evidence to support pricing, reimbursement, and formulary access.', 'HEOR', NOW(), NOW()),

-- Clinical Operations (2)
('CAP-MA-028', 'Clinical Trial Site Support', 'Serving as liaison for site identification, feasibility, and investigator relationships.', 'Clinical Operations', NOW(), NOW()),
('CAP-MA-029', 'Clinical Study Data Analysis & Interpretation', 'Analyzing clinical trial data to support medical strategy and evidence generation.', 'Clinical Operations', NOW(), NOW()),

-- Compliance & Governance (3)
('CAP-MA-030', 'Medical Compliance Monitoring & Audit', 'Monitoring medical affairs activities for compliance and conducting audits.', 'Compliance', NOW(), NOW()),
('CAP-MA-031', 'Promotional Review & MLR', 'Reviewing promotional materials for accuracy, balance, and compliance.', 'Compliance', NOW(), NOW()),
('CAP-MA-032', 'Medical Affairs Quality Management', 'Establishing quality management systems for medical affairs.', 'Compliance', NOW(), NOW()),

-- Scientific Affairs (2)
('CAP-MA-033', 'Scientific Strategy & Thought Leadership', 'Establishing scientific leadership through strategic initiatives and external engagement.', 'Scientific Affairs', NOW(), NOW()),
('CAP-MA-034', 'Cross-Functional Medical Leadership', 'Providing medical leadership across commercial, regulatory, and R&D functions.', 'Scientific Affairs', NOW(), NOW()),

-- Operational Support (5)
('CAP-MA-035', 'Document Management & Processing', 'Organizing and maintaining medical documents and reference materials.', 'Operations', NOW(), NOW()),
('CAP-MA-036', 'Literature Search & Monitoring', 'Conducting systematic literature searches and monitoring publications.', 'Operations', NOW(), NOW()),
('CAP-MA-037', 'Data Entry & Validation', 'Accurately entering and validating medical affairs data in systems.', 'Operations', NOW(), NOW()),
('CAP-MA-038', 'Report Generation & Analytics', 'Generating reports, dashboards, and analytics from medical affairs systems.', 'Operations', NOW(), NOW()),
('CAP-MA-039', 'Administrative Coordination', 'Providing administrative support for medical affairs activities.', 'Operations', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Cross-Cutting Capabilities (21)
INSERT INTO capabilities (id, name, description, category, created_at, updated_at)
VALUES
-- Strategic & Planning (4)
('CAP-MA-040', 'Strategic Thinking & Business Acumen', 'Understanding business context and thinking strategically about opportunities.', 'Strategic', NOW(), NOW()),
('CAP-MA-041', 'Project Management & Execution', 'Planning and executing complex projects with multiple stakeholders.', 'Strategic', NOW(), NOW()),
('CAP-MA-042', 'Budget Management & Financial Planning', 'Developing and managing budgets for medical affairs activities.', 'Strategic', NOW(), NOW()),
('CAP-MA-043', 'Change Management & Innovation', 'Leading organizational change and driving innovation.', 'Strategic', NOW(), NOW()),

-- Communication & Collaboration (5)
('CAP-MA-044', 'Stakeholder Management & Influence', 'Identifying, engaging, and influencing key stakeholders.', 'Communication', NOW(), NOW()),
('CAP-MA-045', 'Cross-Functional Team Collaboration', 'Working effectively across medical, commercial, and regulatory teams.', 'Communication', NOW(), NOW()),
('CAP-MA-046', 'Executive Communication & Reporting', 'Communicating complex information to executive audiences.', 'Communication', NOW(), NOW()),
('CAP-MA-047', 'Written Communication Excellence', 'Producing clear, concise written communications.', 'Communication', NOW(), NOW()),
('CAP-MA-048', 'Verbal Communication & Presentation', 'Delivering engaging verbal communications and presentations.', 'Communication', NOW(), NOW()),

-- Technical & Analytical (5)
('CAP-MA-049', 'Data Analysis & Interpretation', 'Analyzing data to identify trends and inform decision-making.', 'Technical', NOW(), NOW()),
('CAP-MA-050', 'Scientific Literature Evaluation', 'Critically evaluating scientific literature for quality and applicability.', 'Technical', NOW(), NOW()),
('CAP-MA-051', 'Clinical & Medical Knowledge Expertise', 'Deep understanding of disease, treatment, and therapeutic landscape.', 'Technical', NOW(), NOW()),
('CAP-MA-052', 'Regulatory & Compliance Knowledge', 'Understanding pharmaceutical regulations and compliance requirements.', 'Technical', NOW(), NOW()),
('CAP-MA-053', 'Technology & Digital Tools Proficiency', 'Proficient use of medical affairs technology platforms.', 'Technical', NOW(), NOW()),

-- Relationship & Interpersonal (3)
('CAP-MA-054', 'Relationship Building & Networking', 'Building and maintaining professional relationships.', 'Interpersonal', NOW(), NOW()),
('CAP-MA-055', 'Customer Focus & Service Excellence', 'Understanding needs and delivering exceptional service.', 'Interpersonal', NOW(), NOW()),
('CAP-MA-056', 'Coaching & Mentoring', 'Developing others through coaching and knowledge transfer.', 'Interpersonal', NOW(), NOW()),

-- Personal Effectiveness (4)
('CAP-MA-057', 'Critical Thinking & Problem Solving', 'Analyzing complex situations and developing effective solutions.', 'Personal', NOW(), NOW()),
('CAP-MA-058', 'Time Management & Prioritization', 'Managing multiple priorities and meeting deadlines.', 'Personal', NOW(), NOW()),
('CAP-MA-059', 'Attention to Detail & Quality Focus', 'Ensuring accuracy and quality in all work products.', 'Personal', NOW(), NOW()),
('CAP-MA-060', 'Adaptability & Resilience', 'Adapting to change and maintaining effectiveness under pressure.', 'Personal', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- STEP 2: Assign Role-Specific Capabilities to Agents
-- ============================================================================

-- Clear existing Medical Affairs capability assignments
DELETE FROM agent_capabilities
WHERE agent_id IN (
    SELECT id FROM agents WHERE function_name = 'Medical Affairs'
);

-- Leadership Roles (C-Suite, VP, Directors)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    'CAP-MA-001' as capability_id,
    'expert'::expertise_level as proficiency_level,
    true as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%Chief Medical Officer%'
    AND a.status = 'active';

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    'CAP-MA-002' as capability_id,
    'expert'::expertise_level as proficiency_level,
    true as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%VP Medical Affairs%'
    AND a.status = 'active';

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    'CAP-MA-003' as capability_id,
    'expert'::expertise_level as proficiency_level,
    true as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Director%' OR a.role_name ILIKE '%Senior Medical Director%')
    AND a.status = 'active';

-- MSL Roles (all MSL capabilities)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    CASE 
        WHEN al.level_number = 2 THEN 'expert'::expertise_level
        WHEN al.level_number = 3 THEN 'advanced'::expertise_level
    END as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('CAP-MA-005', true),   -- KOL Engagement
        ('CAP-MA-006', true),   -- Territory Management
        ('CAP-MA-007', false),  -- Scientific Presentation
        ('CAP-MA-008', false),  -- Clinical Trial Support
        ('CAP-MA-010', false)   -- Congress Management
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%MSL%' OR a.role_name ILIKE '%Medical Science Liaison%')
    AND a.status = 'active';

-- Medical Writer Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'advanced'::expertise_level as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('CAP-MA-011', true),   -- Regulatory Writing
        ('CAP-MA-012', true),   -- Manuscript Development
        ('CAP-MA-013', false),  -- Congress Materials
        ('CAP-MA-015', false)   -- Scientific Communications
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND a.role_name ILIKE '%Medical Writer%'
    AND a.status = 'active';

-- Publications Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'expert'::expertise_level as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('CAP-MA-014', true),   -- Publication Planning
        ('CAP-MA-012', false),  -- Manuscript Development
        ('CAP-MA-013', false)   -- Congress Materials
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Publication%')
    AND a.status = 'active';

-- Medical Information Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    CASE 
        WHEN a.role_name ILIKE '%Manager%' OR a.role_name ILIKE '%Lead%' THEN 'expert'::expertise_level
        ELSE 'advanced'::expertise_level
    END as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('CAP-MA-016', true),   -- Inquiry Response
        ('CAP-MA-017', false),  -- Database Management
        ('CAP-MA-018', false)   -- AE Processing
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Medical Info%' OR a.role_name ILIKE '%MI Operations%')
    AND a.status = 'active';

-- Medical Education Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    CASE 
        WHEN a.role_name ILIKE '%Manager%' OR a.role_name ILIKE '%Strategist%' THEN 'expert'::expertise_level
        ELSE 'advanced'::expertise_level
    END as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('CAP-MA-020', true),   -- Education Strategy
        ('CAP-MA-021', false),  -- Sales Force Training
        ('CAP-MA-023', false)   -- HCP Education
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Medical Education%' OR a.role_name ILIKE '%Scientific Trainer%')
    AND a.status = 'active';

-- HEOR & RWE Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'expert'::expertise_level as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('CAP-MA-024', true),   -- Economic Modeling
        ('CAP-MA-025', true),   -- RWE Study Design
        ('CAP-MA-026', false),  -- Outcomes Assessment
        ('CAP-MA-027', false)   -- Value Evidence
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%HEOR%' OR a.role_name ILIKE '%Real-World Evidence%' OR a.role_name ILIKE '%Economic Model%')
    AND a.status = 'active';

-- Compliance & Governance Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'expert'::expertise_level as proficiency_level,
    c.is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN (
    VALUES 
        ('CAP-MA-004', true),   -- Governance Leadership
        ('CAP-MA-030', true),   -- Compliance Monitoring
        ('CAP-MA-031', false),  -- Promotional Review
        ('CAP-MA-032', false)   -- Quality Management
) c(capability_id, is_primary)
WHERE a.function_name = 'Medical Affairs'
    AND (a.role_name ILIKE '%Compliance%' OR a.role_name ILIKE '%Governance%' OR a.role_name ILIKE '%Excellence%')
    AND a.status = 'active';

-- ============================================================================
-- STEP 3: Assign Cross-Cutting Capabilities Based on Level
-- ============================================================================

-- L1 MASTER: Strategic + Leadership capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'expert'::expertise_level as proficiency_level,
    false as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('CAP-MA-040'),  -- Strategic Thinking
        ('CAP-MA-042'),  -- Budget Management
        ('CAP-MA-044'),  -- Stakeholder Management
        ('CAP-MA-046'),  -- Executive Communication
        ('CAP-MA-051'),  -- Clinical Knowledge
        ('CAP-MA-056')   -- Coaching & Mentoring
) c(capability_id)
WHERE a.function_name = 'Medical Affairs'
    AND al.level_number = 1
    AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- L2 EXPERT: Professional + Technical capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'expert'::expertise_level as proficiency_level,
    false as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('CAP-MA-041'),  -- Project Management
        ('CAP-MA-045'),  -- Cross-Functional Collaboration
        ('CAP-MA-047'),  -- Written Communication
        ('CAP-MA-048'),  -- Verbal Communication
        ('CAP-MA-050'),  -- Literature Evaluation
        ('CAP-MA-051'),  -- Clinical Knowledge
        ('CAP-MA-052')   -- Regulatory Knowledge
) c(capability_id)
WHERE a.function_name = 'Medical Affairs'
    AND al.level_number = 2
    AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- L3 SPECIALIST: Execution + Delivery capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    c.capability_id,
    'advanced'::expertise_level as proficiency_level,
    false as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (
    VALUES 
        ('CAP-MA-047'),  -- Written Communication
        ('CAP-MA-048'),  -- Verbal Communication
        ('CAP-MA-050'),  -- Literature Evaluation
        ('CAP-MA-051'),  -- Clinical Knowledge
        ('CAP-MA-054'),  -- Relationship Building
        ('CAP-MA-057'),  -- Critical Thinking
        ('CAP-MA-058'),  -- Time Management
        ('CAP-MA-059')   -- Attention to Detail
) c(capability_id)
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
    agents_with_caps INTEGER;
    avg_caps_per_agent NUMERIC;
BEGIN
    -- Count total Medical Affairs agents
    SELECT COUNT(*) INTO total_agents
    FROM agents
    WHERE function_name = 'Medical Affairs' AND status = 'active';
    
    -- Count agents with capabilities
    SELECT COUNT(DISTINCT agent_id) INTO agents_with_caps
    FROM agent_capabilities ac
    JOIN agents a ON ac.agent_id = a.id
    WHERE a.function_name = 'Medical Affairs' AND a.status = 'active';
    
    -- Calculate average capabilities per agent
    SELECT AVG(cap_count) INTO avg_caps_per_agent
    FROM (
        SELECT COUNT(*) as cap_count
        FROM agent_capabilities ac
        JOIN agents a ON ac.agent_id = a.id
        WHERE a.function_name = 'Medical Affairs' AND a.status = 'active'
        GROUP BY ac.agent_id
    ) sub;
    
    RAISE NOTICE '=== Medical Affairs Capability Assignment Summary ===';
    RAISE NOTICE 'Total Medical Affairs Agents: %', total_agents;
    RAISE NOTICE 'Agents with Capabilities: %', agents_with_caps;
    RAISE NOTICE 'Coverage: % %%', ROUND((agents_with_caps::NUMERIC / total_agents * 100), 2);
    RAISE NOTICE 'Average Capabilities per Agent: %', ROUND(avg_caps_per_agent, 1);
END $$;

-- Show sample assignments
SELECT 
    a.name as agent_name,
    a.role_name,
    al.level_number as level,
    COUNT(ac.capability_id) as capability_count,
    STRING_AGG(c.name, ' | ' ORDER BY ac.is_primary DESC, c.name) as capabilities
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
LEFT JOIN capabilities c ON ac.capability_id = c.id
WHERE a.function_name = 'Medical Affairs'
    AND a.status = 'active'
GROUP BY a.id, a.name, a.role_name, al.level_number
ORDER BY al.level_number, a.role_name
LIMIT 10;

