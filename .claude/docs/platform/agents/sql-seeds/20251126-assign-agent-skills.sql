-- ============================================================================
-- AgentOS 3.0: Assign Skills to Agents
-- File: 20251126_assign_agent_skills.sql
-- Purpose: Link agents to relevant granular skills based on level and role
-- ============================================================================

-- Verify skills exist
DO $$ 
DECLARE
    v_skill_count INT;
BEGIN
    SELECT COUNT(*) INTO v_skill_count FROM skills;
    
    IF v_skill_count = 0 THEN
        RAISE EXCEPTION 'No skills found! Run skill seeding first.';
    END IF;
    
    RAISE NOTICE '✅ Found % skills', v_skill_count;
END $$;

-- Clear existing skill assignments to avoid duplicates
DELETE FROM agent_skills WHERE TRUE;

-- Assign skills to L1 MASTER agents (strategic + oversight skills)
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT DISTINCT
    a.id as agent_id,
    s.id as skill_id,
    'expert'::expertise_level as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN capabilities c ON s.capability_id = c.id
WHERE al.level_number = 1
  AND (
    -- Strategic and leadership skills
    s.name ILIKE '%planning%' OR
    s.name ILIKE '%strategy%' OR
    s.name ILIKE '%decision%' OR
    s.name ILIKE '%coordination%' OR
    s.name ILIKE '%oversight%' OR
    s.name ILIKE '%resource%' OR
    s.name ILIKE '%stakeholder%' OR
    -- High-level capabilities
    c.name ILIKE '%strategic%' OR
    c.name ILIKE '%leadership%'
  );

-- Assign skills to L2 EXPERT agents (analytical + domain skills)
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT DISTINCT
    a.id as agent_id,
    s.id as skill_id,
    'advanced'::expertise_level as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN capabilities c ON s.capability_id = c.id
LEFT JOIN org_functions f ON a.function_id = f.id
WHERE al.level_number = 2
  AND (
    -- Analytical and research skills
    s.name ILIKE '%analysis%' OR
    s.name ILIKE '%research%' OR
    s.name ILIKE '%evaluation%' OR
    s.name ILIKE '%synthesis%' OR
    s.name ILIKE '%assessment%' OR
    s.name ILIKE '%interpretation%' OR
    s.name ILIKE '%validation%' OR
    s.name ILIKE '%review%' OR
    -- Domain-specific
    (f.name IS NOT NULL AND (
        s.name ILIKE '%' || f.name || '%' OR
        c.name ILIKE '%' || f.name || '%'
    ))
  );

-- Assign skills to L3 SPECIALIST agents (technical + specialized skills)
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT DISTINCT
    a.id as agent_id,
    s.id as skill_id,
    'expert'::expertise_level as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN capabilities c ON s.capability_id = c.id
LEFT JOIN org_departments d ON a.department_id = d.id
LEFT JOIN org_roles r ON a.role_id = r.id
WHERE al.level_number = 3
  AND (
    -- Technical and specialist skills
    s.name ILIKE '%technical%' OR
    s.name ILIKE '%specialist%' OR
    s.name ILIKE '%expert%' OR
    s.name ILIKE '%detailed%' OR
    s.name ILIKE '%precision%' OR
    s.name ILIKE '%specific%' OR
    -- Department/role specific
    (d.name IS NOT NULL AND (
        s.name ILIKE '%' || d.name || '%' OR
        c.name ILIKE '%' || d.name || '%'
    )) OR
    (r.name IS NOT NULL AND (
        s.name ILIKE '%' || r.name || '%'
    ))
  );

-- Assign skills to L4 WORKER agents (execution + operational skills)
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT DISTINCT
    a.id as agent_id,
    s.id as skill_id,
    'intermediate'::expertise_level as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN capabilities c ON s.capability_id = c.id
WHERE al.level_number = 4
  AND (
    -- Execution and operational skills
    s.name ILIKE '%execution%' OR
    s.name ILIKE '%processing%' OR
    s.name ILIKE '%computation%' OR
    s.name ILIKE '%extraction%' OR
    s.name ILIKE '%automation%' OR
    s.name ILIKE '%task%' OR
    s.name ILIKE '%operation%' OR
    -- Capability match
    c.name ILIKE '%execution%' OR
    c.name ILIKE '%processing%' OR
    c.name ILIKE '%automation%'
  );

-- Assign skills to L5 TOOL agents (specific function skills)
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT DISTINCT
    a.id as agent_id,
    s.id as skill_id,
    'foundational'::expertise_level as proficiency_level
FROM agents a
CROSS JOIN skills s
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN capabilities c ON s.capability_id = c.id
WHERE al.level_number = 5
  AND (
    -- Tool and API skills
    s.name ILIKE '%tool%' OR
    s.name ILIKE '%api%' OR
    s.name ILIKE '%function%' OR
    s.name ILIKE '%automation%' OR
    s.name ILIKE '%interface%' OR
    -- Capability match
    c.name ILIKE '%tool%' OR
    c.name ILIKE '%api%'
  )
LIMIT 2000; -- Limit for L5 tools

-- Verification report
DO $$
DECLARE
    v_total_agents INT;
    v_agents_with_skills INT;
    v_total_assignments INT;
    v_l1_avg_skills FLOAT;
    v_l2_avg_skills FLOAT;
    v_l3_avg_skills FLOAT;
    v_l4_avg_skills FLOAT;
    v_l5_avg_skills FLOAT;
BEGIN
    SELECT COUNT(*) INTO v_total_agents FROM agents;
    SELECT COUNT(DISTINCT agent_id) INTO v_agents_with_skills FROM agent_skills;
    SELECT COUNT(*) INTO v_total_assignments FROM agent_skills;
    
    SELECT AVG(skill_count) INTO v_l1_avg_skills FROM (
        SELECT COUNT(*) as skill_count 
        FROM agent_skills asa
        JOIN agents a ON asa.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 1
        GROUP BY asa.agent_id
    ) sub;
    
    SELECT AVG(skill_count) INTO v_l2_avg_skills FROM (
        SELECT COUNT(*) as skill_count 
        FROM agent_skills asa
        JOIN agents a ON asa.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 2
        GROUP BY asa.agent_id
    ) sub;
    
    SELECT AVG(skill_count) INTO v_l3_avg_skills FROM (
        SELECT COUNT(*) as skill_count 
        FROM agent_skills asa
        JOIN agents a ON asa.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 3
        GROUP BY asa.agent_id
    ) sub;
    
    SELECT AVG(skill_count) INTO v_l4_avg_skills FROM (
        SELECT COUNT(*) as skill_count 
        FROM agent_skills asa
        JOIN agents a ON asa.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 4
        GROUP BY asa.agent_id
    ) sub;
    
    SELECT AVG(skill_count) INTO v_l5_avg_skills FROM (
        SELECT COUNT(*) as skill_count 
        FROM agent_skills asa
        JOIN agents a ON asa.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 5
        GROUP BY asa.agent_id
    ) sub;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ SKILLS ASSIGNED TO AGENTS';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total agents:            %', v_total_agents;
    RAISE NOTICE 'Agents with skills:      % (%.1f%%)', v_agents_with_skills, (v_agents_with_skills::FLOAT / v_total_agents * 100);
    RAISE NOTICE 'Total skill assignments:  %', v_total_assignments;
    RAISE NOTICE '';
    RAISE NOTICE 'Average skills per level:';
    RAISE NOTICE '  L1 MASTER:       %.1f', COALESCE(v_l1_avg_skills, 0);
    RAISE NOTICE '  L2 EXPERT:       %.1f', COALESCE(v_l2_avg_skills, 0);
    RAISE NOTICE '  L3 SPECIALIST:   %.1f', COALESCE(v_l3_avg_skills, 0);
    RAISE NOTICE '  L4 WORKER:       %.1f', COALESCE(v_l4_avg_skills, 0);
    RAISE NOTICE '  L5 TOOL:         %.1f', COALESCE(v_l5_avg_skills, 0);
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

