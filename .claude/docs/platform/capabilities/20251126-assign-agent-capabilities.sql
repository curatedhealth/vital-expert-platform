-- ============================================================================
-- AgentOS 3.0: Assign Capabilities to Agents
-- File: 20251126_assign_agent_capabilities.sql
-- Purpose: Link agents to relevant capabilities based on level and role
-- ============================================================================

-- First, ensure we have capabilities (they should exist from normalization)
DO $$ 
DECLARE
    v_cap_count INT;
BEGIN
    SELECT COUNT(*) INTO v_cap_count FROM capabilities;
    
    IF v_cap_count = 0 THEN
        RAISE EXCEPTION 'No capabilities found! Run capability seeding first.';
    END IF;
    
    RAISE NOTICE '✅ Found % capabilities', v_cap_count;
END $$;

-- Clear existing assignments to avoid duplicates
DELETE FROM agent_capabilities WHERE TRUE;

-- Assign capabilities to L1 MASTER agents (most comprehensive)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT DISTINCT
    a.id as agent_id,
    c.id as capability_id,
    'expert' as proficiency_level,
    (ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY c.name)) <= 3 as is_primary
FROM agents a
CROSS JOIN capabilities c
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 1
  AND (
    -- Strategic capabilities for all L1
    c.name ILIKE '%strategic%' OR
    c.name ILIKE '%planning%' OR
    c.name ILIKE '%coordination%' OR
    c.name ILIKE '%analysis%' OR
    c.name ILIKE '%decision%' OR
    c.name ILIKE '%communication%'
  );

-- Assign capabilities to L2 EXPERT agents (domain-focused)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT DISTINCT
    a.id as agent_id,
    c.id as capability_id,
    'advanced' as proficiency_level,
    (ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY c.name)) <= 5 as is_primary
FROM agents a
CROSS JOIN capabilities c
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN org_functions f ON a.function_id = f.id
WHERE al.level_number = 2
  AND (
    -- Domain-specific and analytical capabilities
    c.name ILIKE '%analysis%' OR
    c.name ILIKE '%research%' OR
    c.name ILIKE '%evaluation%' OR
    c.name ILIKE '%synthesis%' OR
    c.name ILIKE '%interpretation%' OR
    -- Function-specific matching
    (f.name IS NOT NULL AND c.name ILIKE '%' || f.name || '%')
  );

-- Assign capabilities to L3 SPECIALIST agents (technical focus)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT DISTINCT
    a.id as agent_id,
    c.id as capability_id,
    'expert' as proficiency_level,
    (ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY c.name)) <= 3 as is_primary
FROM agents a
CROSS JOIN capabilities c
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN org_departments d ON a.department_id = d.id
WHERE al.level_number = 3
  AND (
    -- Technical and specialized capabilities
    c.name ILIKE '%technical%' OR
    c.name ILIKE '%specialist%' OR
    c.name ILIKE '%expert%' OR
    c.name ILIKE '%analysis%' OR
    c.name ILIKE '%validation%' OR
    -- Department-specific matching
    (d.name IS NOT NULL AND c.name ILIKE '%' || d.name || '%')
  );

-- Assign capabilities to L4 WORKER agents (execution focus)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT DISTINCT
    a.id as agent_id,
    c.id as capability_id,
    'intermediate' as proficiency_level,
    (ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY c.name)) <= 2 as is_primary
FROM agents a
CROSS JOIN capabilities c
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 4
  AND (
    -- Execution and operational capabilities
    c.name ILIKE '%execution%' OR
    c.name ILIKE '%processing%' OR
    c.name ILIKE '%computation%' OR
    c.name ILIKE '%extraction%' OR
    c.name ILIKE '%automation%'
  );

-- Assign capabilities to L5 TOOL agents (function-specific)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT DISTINCT
    a.id as agent_id,
    c.id as capability_id,
    'basic' as proficiency_level,
    true as is_primary
FROM agents a
CROSS JOIN capabilities c
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 5
  AND (
    -- Tool-specific capabilities
    c.name ILIKE '%tool%' OR
    c.name ILIKE '%function%' OR
    c.name ILIKE '%automation%' OR
    c.name ILIKE '%api%'
  )
LIMIT 1000; -- Limit for L5 tools

-- Verification report
DO $$
DECLARE
    v_total_agents INT;
    v_agents_with_caps INT;
    v_total_assignments INT;
    v_l1_avg_caps FLOAT;
    v_l2_avg_caps FLOAT;
    v_l3_avg_caps FLOAT;
    v_l4_avg_caps FLOAT;
    v_l5_avg_caps FLOAT;
BEGIN
    SELECT COUNT(*) INTO v_total_agents FROM agents;
    SELECT COUNT(DISTINCT agent_id) INTO v_agents_with_caps FROM agent_capabilities;
    SELECT COUNT(*) INTO v_total_assignments FROM agent_capabilities;
    
    SELECT AVG(cap_count) INTO v_l1_avg_caps FROM (
        SELECT COUNT(*) as cap_count 
        FROM agent_capabilities ac
        JOIN agents a ON ac.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 1
        GROUP BY ac.agent_id
    ) sub;
    
    SELECT AVG(cap_count) INTO v_l2_avg_caps FROM (
        SELECT COUNT(*) as cap_count 
        FROM agent_capabilities ac
        JOIN agents a ON ac.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 2
        GROUP BY ac.agent_id
    ) sub;
    
    SELECT AVG(cap_count) INTO v_l3_avg_caps FROM (
        SELECT COUNT(*) as cap_count 
        FROM agent_capabilities ac
        JOIN agents a ON ac.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 3
        GROUP BY ac.agent_id
    ) sub;
    
    SELECT AVG(cap_count) INTO v_l4_avg_caps FROM (
        SELECT COUNT(*) as cap_count 
        FROM agent_capabilities ac
        JOIN agents a ON ac.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 4
        GROUP BY ac.agent_id
    ) sub;
    
    SELECT AVG(cap_count) INTO v_l5_avg_caps FROM (
        SELECT COUNT(*) as cap_count 
        FROM agent_capabilities ac
        JOIN agents a ON ac.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 5
        GROUP BY ac.agent_id
    ) sub;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ CAPABILITIES ASSIGNED TO AGENTS';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total agents:                %', v_total_agents;
    RAISE NOTICE 'Agents with capabilities:    % (%.1f%%)', v_agents_with_caps, (v_agents_with_caps::FLOAT / v_total_agents * 100);
    RAISE NOTICE 'Total capability assignments: %', v_total_assignments;
    RAISE NOTICE '';
    RAISE NOTICE 'Average capabilities per level:';
    RAISE NOTICE '  L1 MASTER:       %.1f', COALESCE(v_l1_avg_caps, 0);
    RAISE NOTICE '  L2 EXPERT:       %.1f', COALESCE(v_l2_avg_caps, 0);
    RAISE NOTICE '  L3 SPECIALIST:   %.1f', COALESCE(v_l3_avg_caps, 0);
    RAISE NOTICE '  L4 WORKER:       %.1f', COALESCE(v_l4_avg_caps, 0);
    RAISE NOTICE '  L5 TOOL:         %.1f', COALESCE(v_l5_avg_caps, 0);
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

