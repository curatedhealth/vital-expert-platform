-- ============================================================================
-- ASSIGN SKILLS TO AGENTS BY BUSINESS FUNCTION
-- ============================================================================
-- This script creates agent-skill assignments based on agent roles and
-- business functions. Skills are assigned with appropriate proficiency levels.
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER: Get Agent IDs by Function/Role Pattern
-- ============================================================================

-- Medical Affairs & Regulatory Agents
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level,
    true as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Medical Information%' OR
        a.name ILIKE '%Regulatory%' OR
        a.name ILIKE '%Clinical%' OR
        a.name ILIKE '%Pharmacovigilance%'
    )
    AND s.name IN ('Scientific Databases', 'Scientific Packages', 'Scientific Thinking')
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- Document Processing Skills for Medical Writers
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level,
    true as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Medical Writer%' OR
        a.name ILIKE '%Medical Writing%' OR
        a.name ILIKE '%Document%'
    )
    AND s.name IN (
        'DOCX Creation, Editing, and Analysis',
        'PDF Processing Guide',
        'PPTX Creation, Editing, and Analysis',
        'Content Research Writer',
        'Article Extractor'
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- Data Analysis Skills for Biostatistics/HEOR
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level,
    true as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Biostatistics%' OR
        a.name ILIKE '%HEOR%' OR
        a.name ILIKE '%Real-World Evidence%' OR
        a.name ILIKE '%Data%' OR
        a.name ILIKE '%Analytics%'
    )
    AND s.name IN (
        'XLSX Requirements for Outputs',
        'CSV Data Summarizer',
        'Root Cause Tracing',
        'Scientific Packages'
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: LEGAL & COMPLIANCE
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    CASE 
        WHEN s.name LIKE '%PDF%' THEN 'expert'
        WHEN s.name LIKE '%DOCX%' THEN 'expert'
        ELSE 'advanced'
    END as proficiency_level,
    CASE 
        WHEN s.name LIKE '%PDF%' OR s.name LIKE '%DOCX%' THEN true
        ELSE false
    END as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Legal%' OR
        a.name ILIKE '%Compliance%' OR
        a.name ILIKE '%Regulatory Affairs%'
    )
    AND s.name IN (
        'PDF Processing Guide',
        'DOCX Creation, Editing, and Analysis',
        'Article Extractor',
        'Root Cause Tracing',
        'Systematic Debugging'
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: FINANCE & ACCOUNTING
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level,
    true as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Finance%' OR
        a.name ILIKE '%Accounting%' OR
        a.name ILIKE '%Financial%' OR
        a.name ILIKE '%Budget%'
    )
    AND s.name IN (
        'XLSX Requirements for Outputs',
        'CSV Data Summarizer',
        'Invoice Organizer',
        'File Organizer',
        'PDF Processing Guide'
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: MARKETING & COMMUNICATIONS
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    CASE 
        WHEN s.category = 'Creative & Design' THEN 'expert'
        WHEN s.name LIKE '%Content%' THEN 'expert'
        ELSE 'advanced'
    END as proficiency_level,
    CASE 
        WHEN s.category = 'Creative & Design' OR s.name LIKE '%Content%' THEN true
        ELSE false
    END as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Marketing%' OR
        a.name ILIKE '%Communications%' OR
        a.name ILIKE '%Brand%' OR
        a.name ILIKE '%Content%'
    )
    AND (
        s.category = 'Creative & Design' OR
        s.name IN (
            'Content Research Writer',
            'PPTX Creation, Editing, and Analysis',
            'Internal Comms',
            'Brainstorming',
            'Image Enhancer',
            'Video Downloader',
            'Youtube Transcript'
        )
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: IT & ENGINEERING
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level,
    true as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Developer%' OR
        a.name ILIKE '%Engineer%' OR
        a.name ILIKE '%Technical%' OR
        a.name ILIKE '%IT%' OR
        a.name ILIKE '%DevOps%'
    )
    AND s.category IN ('Development & Code', 'Security & Web Testing')
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: OPERATIONS & ADMINISTRATION
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'advanced' as proficiency_level,
    false as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Operations%' OR
        a.name ILIKE '%Admin%' OR
        a.name ILIKE '%Coordinator%' OR
        a.name ILIKE '%Manager%'
    )
    AND s.name IN (
        'File Organizer',
        'DOCX Creation, Editing, and Analysis',
        'XLSX Requirements for Outputs',
        'Internal Comms',
        'Meeting Insights Analyzer'
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: HUMAN RESOURCES
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'advanced' as proficiency_level,
    false as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Human Resources%' OR
        a.name ILIKE '%HR%' OR
        a.name ILIKE '%Talent%' OR
        a.name ILIKE '%Recruitment%'
    )
    AND s.name IN (
        'DOCX Creation, Editing, and Analysis',
        'XLSX Requirements for Outputs',
        'Internal Comms',
        'File Organizer'
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- BUSINESS FUNCTION: RESEARCH & DEVELOPMENT
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'expert' as proficiency_level,
    true as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    (
        a.name ILIKE '%Research%' OR
        a.name ILIKE '%Scientist%' OR
        a.name ILIKE '%R&D%' OR
        a.name ILIKE '%Development%'
    )
    AND (
        s.category = 'Scientific & Research' OR
        s.name IN (
            'CSV Data Summarizer',
            'Root Cause Tracing',
            'Brainstorming',
            'Article Extractor',
            'Scientific Databases'
        )
    )
    AND s.is_active = true
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary;

-- ============================================================================
-- UNIVERSAL SKILLS: Assign to ALL agents (lower proficiency)
-- ============================================================================
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, assigned_at)
SELECT 
    a.id as agent_id,
    s.id as skill_id,
    'intermediate' as proficiency_level,
    false as is_primary,
    NOW() as assigned_at
FROM agents a
CROSS JOIN skills s
WHERE 
    s.name IN (
        'File Organizer',
        'Brainstorming',
        'Internal Comms',
        'Systematic Debugging'
    )
    AND s.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM agent_skill_assignments asa
        WHERE asa.agent_id = a.id AND asa.skill_id = s.id
    )
ON CONFLICT (agent_id, skill_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Total assignments
SELECT COUNT(*) as total_assignments
FROM agent_skill_assignments;

-- Assignments by proficiency
SELECT 
    proficiency_level,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM agent_skill_assignments
GROUP BY proficiency_level
ORDER BY count DESC;

-- Top skills by assignment count
SELECT 
    s.name,
    s.category,
    COUNT(asa.agent_id) as agent_count
FROM skills s
LEFT JOIN agent_skill_assignments asa ON s.id = asa.skill_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.category
ORDER BY agent_count DESC
LIMIT 20;

-- Agents with most skills
SELECT 
    a.name,
    a.agent_level_id,
    COUNT(asa.skill_id) as skill_count,
    COUNT(CASE WHEN asa.is_primary THEN 1 END) as primary_skills
FROM agents a
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
GROUP BY a.id, a.name, a.agent_level_id
ORDER BY skill_count DESC
LIMIT 20;

