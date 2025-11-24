-- ============================================================================
-- MAP 165 MEDICAL AFFAIRS AGENTS TO SKILLS
-- ============================================================================
-- Purpose: Create agent_skills mappings for all Medical Affairs agents
-- Strategy:
--   - Level 1 (Masters): 5-7 strategic & leadership skills
--   - Level 2 (Experts): 5-8 domain-specific skills
--   - Level 3 (Specialists): 3-5 specialized skills
--   - Level 4 (Workers): 1-2 task-specific skills  
--   - Level 5 (Tools): 1 atomic skill
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MAPPING 165 MEDICAL AFFAIRS AGENTS TO SKILLS';
    RAISE NOTICE '=================================================================';
END $$;

-- ============================================================================
-- LEVEL 1: MASTER AGENTS (9 agents) → Strategic & Leadership Skills
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Mapping Level 1: Master Agents...'; END $$;

-- Map all Master agents to core leadership skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 1
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.category = 'Leadership & Management'
    AND s.name IN ('Strategic Thinking', 'Team Leadership', 'People Management', 'Decision Making', 'Vision Setting', 'Project Management', 'Change Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Add domain-specific skills for each Master based on department
-- Clinical Operations Support Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Clinical Operations Support Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Clinical Research Knowledge', 'Clinical Protocol Development', 'Clinical Data Analysis', 'Medical Monitoring')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Field Medical Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Field Medical Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('MSL Operations', 'KOL Management', 'Scientific Exchange', 'Insights Generation')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- HEOR & Evidence Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'HEOR & Evidence Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Health Economics', 'Real-World Evidence', 'Evidence Synthesis', 'Biostatistics')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Education Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Medical Education Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Scientific Communication', 'Presentation Skills', 'Field Force Training', 'Medical Writing')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Excellence & Compliance Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Medical Excellence & Compliance Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Regulatory Compliance', 'Quality Assurance', 'SOPs & Governance', 'Risk Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Information Services Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Medical Information Services Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Medical Information Management', 'Medical Literature Review', 'Scientific Writing', 'Medical Information Systems')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Leadership Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Medical Leadership Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Strategic Thinking', 'Vision Setting', 'Business Acumen', 'Stakeholder Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Publications Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Publications Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Publication Planning', 'Scientific Writing', 'Medical Literature Review', 'Medical Writing')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Scientific Communications Master
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 1
    AND a.name = 'Scientific Communications Master'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Scientific Communication', 'Medical Writing', 'Scientific Writing', 'Presentation Skills')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- ============================================================================
-- LEVEL 2: EXPERT AGENTS (45 agents) → Domain-Specific Skills
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Mapping Level 2: Expert Agents...'; END $$;

-- All Experts get core scientific skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'advanced' as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 2
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.category = 'Scientific & Clinical'
    AND s.name IN ('Clinical Research Knowledge', 'Medical Literature Review', 'Scientific Writing', 'Evidence Synthesis')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Field Medical Experts → KOL & Engagement Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Field Medical'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('KOL Management', 'Scientific Exchange', 'MSL Operations', 'Insights Generation', 'Relationship Building')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Clinical Operations Support Experts → Clinical Trial Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Clinical Operations Support'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Clinical Protocol Development', 'Medical Monitoring', 'Clinical Data Analysis', 'Regulatory Compliance', 'Project Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- HEOR & Evidence Experts → HEOR Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'HEOR & Evidence'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Health Economics', 'Real-World Evidence', 'Biostatistics', 'Evidence Synthesis', 'Data Analysis')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Education Experts → Education Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Medical Education'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Field Force Training', 'Presentation Skills', 'Scientific Communication', 'Medical Writing', 'Mentoring')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Excellence & Compliance Experts → Compliance Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Medical Excellence & Compliance'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Regulatory Compliance', 'Quality Assurance', 'SOPs & Governance', 'Risk Management', 'Audit Readiness')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Information Services Experts → Information Management Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Medical Information Services'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Medical Information Management', 'Medical Literature Review', 'Medical Information Systems', 'Scientific Writing', 'Medical Writing')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Publications Experts → Publication Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Publications'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Publication Planning', 'Scientific Writing', 'Medical Writing', 'Medical Literature Review', 'Project Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Scientific Communications Experts → Communication Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Scientific Communications'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Scientific Communication', 'Medical Writing', 'Scientific Writing', 'Presentation Skills', 'Congress Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Medical Leadership Experts → Leadership Skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 2
    AND a.department_name = 'Medical Leadership'
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Strategic Thinking', 'Team Leadership', 'Business Acumen', 'Decision Making', 'Stakeholder Management')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- ============================================================================
-- LEVEL 3: SPECIALIST AGENTS (43 agents) → Specialized Skills
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Mapping Level 3: Specialist Agents...'; END $$;

-- All Specialists get core operational skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'intermediate' as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 3
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name IN ('Collaboration', 'Problem Solving', 'Project Management', 'Critical Thinking')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Map Specialists to department-specific skills (advanced proficiency)
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 3
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND (
        -- Field Medical Specialists
        (a.department_name = 'Field Medical' AND s.name IN ('Scientific Exchange', 'Relationship Building', 'Scientific Communication')) OR
        -- Clinical Ops Specialists
        (a.department_name = 'Clinical Operations Support' AND s.name IN ('Clinical Data Analysis', 'Medical Monitoring', 'Clinical Research Knowledge')) OR
        -- HEOR Specialists
        (a.department_name = 'HEOR & Evidence' AND s.name IN ('Data Analysis', 'Evidence Synthesis', 'Research Skills')) OR
        -- Med Ed Specialists
        (a.department_name = 'Medical Education' AND s.name IN ('Presentation Skills', 'Scientific Communication', 'Medical Writing')) OR
        -- Med Excellence Specialists
        (a.department_name = 'Medical Excellence & Compliance' AND s.name IN ('Quality Assurance', 'Regulatory Compliance', 'SOPs & Governance')) OR
        -- Med Info Specialists
        (a.department_name = 'Medical Information Services' AND s.name IN ('Medical Literature Review', 'Medical Information Management', 'Medical Writing')) OR
        -- Publications Specialists
        (a.department_name = 'Publications' AND s.name IN ('Scientific Writing', 'Medical Writing', 'Medical Literature Review')) OR
        -- Sci Comms Specialists
        (a.department_name = 'Scientific Communications' AND s.name IN ('Medical Writing', 'Scientific Communication', 'Presentation Skills'))
    )
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- ============================================================================
-- LEVEL 4: WORKER AGENTS (18 agents) → Task-Specific Skills
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Mapping Level 4: Worker Agents...'; END $$;

-- Map Workers to specific task skills
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'intermediate' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 4
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND (
        (a.name LIKE '%Action Item Tracker%' AND s.name = 'Project Management') OR
        (a.name LIKE '%Adverse Event Detector%' AND s.name = 'Pharmacovigilance') OR
        (a.name LIKE '%Citation Formatter%' AND s.name = 'Medical Writing') OR
        (a.name LIKE '%Compliance Checker%' AND s.name = 'Regulatory Compliance') OR
        (a.name LIKE '%Data Extraction%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Document Archiver%' AND s.name = 'Database Management') OR
        (a.name LIKE '%Email Drafter%' AND s.name = 'Technical Writing') OR
        (a.name LIKE '%Literature Search%' AND s.name = 'Medical Literature Review') OR
        (a.name LIKE '%Meeting Notes%' AND s.name = 'Technical Writing') OR
        (a.name LIKE '%Metadata Tagger%' AND s.name = 'Medical Information Systems') OR
        (a.name LIKE '%Off-Label%' AND s.name = 'Regulatory Compliance') OR
        (a.name LIKE '%PDF Generator%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%Quality Reviewer%' AND s.name = 'Quality Assurance') OR
        (a.name LIKE '%Report Compiler%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Slide Builder%' AND s.name = 'Presentation Skills') OR
        (a.name LIKE '%Summary Generator%' AND s.name = 'Scientific Writing') OR
        (a.name LIKE '%Translation%' AND s.name = 'Cross-cultural Communication') OR
        (a.name LIKE '%Version Controller%' AND s.name = 'SOPs & Governance')
    )
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- ============================================================================
-- LEVEL 5: TOOL AGENTS (50 agents) → Atomic Skills
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Mapping Level 5: Tool Agents...'; END $$;

-- Map Tool Agents to one specific atomic skill each
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'foundational' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
WHERE al.level_number = 5
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND (
        -- Text Processing Tools
        (a.name LIKE '%Acronym Expander%' AND s.name = 'Medical Writing') OR
        (a.name LIKE '%Text Cleaner%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Text Splitter%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Word Counter%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%Character Counter%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%Keyword Extractor%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Entity Extractor%' AND s.name = 'Data Analysis') OR
        -- Data Tools
        (a.name LIKE '%CSV Parser%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Excel Parser%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%JSON Parser%' AND s.name = 'Database Management') OR
        (a.name LIKE '%XML Parser%' AND s.name = 'Database Management') OR
        (a.name LIKE '%Table Parser%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Data Filter%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Data Sorter%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Data Aggregator%' AND s.name = 'Data Analysis') OR
        -- Search Tools
        (a.name LIKE '%PubMed Searcher%' AND s.name = 'Medical Literature Review') OR
        (a.name LIKE '%ClinicalTrials%' AND s.name = 'Clinical Research Knowledge') OR
        (a.name LIKE '%Embase%' AND s.name = 'Medical Literature Review') OR
        (a.name LIKE '%Cochrane%' AND s.name = 'Medical Literature Review') OR
        (a.name LIKE '%Google Scholar%' AND s.name = 'Research Skills') OR
        -- NLP Tools
        (a.name LIKE '%Sentiment Analyzer%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Readability Scorer%' AND s.name = 'Medical Writing') OR
        (a.name LIKE '%Text Similarity%' AND s.name = 'Data Analysis') OR
        (a.name LIKE '%Topic Classifier%' AND s.name = 'Data Analysis') OR
        -- Compliance Tools
        (a.name LIKE '%Disclosure Statement%' AND s.name = 'Regulatory Compliance') OR
        (a.name LIKE '%MLR Reference%' AND s.name = 'Regulatory Compliance') OR
        -- File Tools
        (a.name LIKE '%File Converter%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%DOCX Parser%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%PDF Parser%' AND s.name = 'Microsoft Office Suite') OR
        (a.name LIKE '%PowerPoint Parser%' AND s.name = 'Presentation Skills')
    )
ON CONFLICT (agent_id, skill_id) DO NOTHING;

-- Catch-all for any Tool Agents that didn't match specific patterns
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'foundational' as proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN skills s
LEFT JOIN agent_skills existing ON a.id = existing.agent_id
WHERE al.level_number = 5
    AND a.deleted_at IS NULL
    AND s.deleted_at IS NULL
    AND s.name = 'Digital Collaboration Tools'
    AND existing.agent_id IS NULL;

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
    v_total_mappings INTEGER;
    v_level1_count INTEGER;
    v_level2_count INTEGER;
    v_level3_count INTEGER;
    v_level4_count INTEGER;
    v_level5_count INTEGER;
    v_by_level RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_mappings FROM agent_skills;
    
    SELECT COUNT(DISTINCT as2.agent_id) INTO v_level1_count
    FROM agent_skills as2
    JOIN agents a ON as2.agent_id = a.id
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE al.level_number = 1;
    
    SELECT COUNT(DISTINCT as2.agent_id) INTO v_level2_count
    FROM agent_skills as2
    JOIN agents a ON as2.agent_id = a.id
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE al.level_number = 2;
    
    SELECT COUNT(DISTINCT as2.agent_id) INTO v_level3_count
    FROM agent_skills as2
    JOIN agents a ON as2.agent_id = a.id
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE al.level_number = 3;
    
    SELECT COUNT(DISTINCT as2.agent_id) INTO v_level4_count
    FROM agent_skills as2
    JOIN agents a ON as2.agent_id = a.id
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE al.level_number = 4;
    
    SELECT COUNT(DISTINCT as2.agent_id) INTO v_level5_count
    FROM agent_skills as2
    JOIN agents a ON as2.agent_id = a.id
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE al.level_number = 5;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '✅ AGENT-SKILL MAPPINGS COMPLETED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Total Mappings Created: %', v_total_mappings;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Agents Mapped by Level:';
    RAISE NOTICE '  ├─ Level 1 (Masters): % agents mapped', v_level1_count;
    RAISE NOTICE '  ├─ Level 2 (Experts): % agents mapped', v_level2_count;
    RAISE NOTICE '  ├─ Level 3 (Specialists): % agents mapped', v_level3_count;
    RAISE NOTICE '  ├─ Level 4 (Workers): % agents mapped', v_level4_count;
    RAISE NOTICE '  └─ Level 5 (Tools): % agents mapped', v_level5_count;
    RAISE NOTICE '';
    RAISE NOTICE '📈 Skills per Agent Level:';
    
    FOR v_by_level IN
        SELECT 
            al.name as level_name,
            al.level_number,
            COUNT(DISTINCT as2.agent_id) as agents_with_skills,
            ROUND(AVG(skill_count), 1) as avg_skills_per_agent,
            MIN(skill_count) as min_skills,
            MAX(skill_count) as max_skills
        FROM agent_levels al
        JOIN agents a ON a.agent_level_id = al.id
        LEFT JOIN (
            SELECT agent_id, COUNT(*) as skill_count
            FROM agent_skills
            GROUP BY agent_id
        ) as2 ON a.id = as2.agent_id
        WHERE a.deleted_at IS NULL
        GROUP BY al.name, al.level_number
        ORDER BY al.level_number
    LOOP
        RAISE NOTICE '  ├─ %: % agents, avg % skills/agent (min: %, max: %)',
            v_by_level.level_name,
            v_by_level.agents_with_skills,
            v_by_level.avg_skills_per_agent,
            v_by_level.min_skills,
            v_by_level.max_skills;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

-- Final verification query
SELECT 
    al.name as agent_level,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT CASE WHEN as2.agent_id IS NOT NULL THEN a.id END) as agents_with_skills,
    COALESCE(ROUND(AVG(skill_counts.skill_count), 1), 0) as avg_skills_per_agent
FROM agent_levels al
LEFT JOIN agents a ON a.agent_level_id = al.id AND a.deleted_at IS NULL
LEFT JOIN agent_skills as2 ON a.id = as2.agent_id
LEFT JOIN (
    SELECT agent_id, COUNT(*) as skill_count
    FROM agent_skills
    GROUP BY agent_id
) skill_counts ON a.id = skill_counts.agent_id
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

