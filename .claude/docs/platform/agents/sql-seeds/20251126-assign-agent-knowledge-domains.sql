-- ============================================================================
-- AgentOS 3.0: Assign Knowledge Domains to Agents
-- File: 20251126_assign_agent_knowledge_domains.sql
-- Purpose: Link agents to relevant knowledge domains based on function/role
-- ============================================================================

-- Verify knowledge domains exist
DO $$ 
DECLARE
    v_domain_count INT;
BEGIN
    SELECT COUNT(*) INTO v_domain_count FROM knowledge_domains;
    
    IF v_domain_count = 0 THEN
        RAISE EXCEPTION 'No knowledge domains found! Run domain seeding first.';
    END IF;
    
    RAISE NOTICE '✅ Found % knowledge domains', v_domain_count;
END $$;

-- Clear existing knowledge domain assignments to avoid duplicates
DELETE FROM agent_knowledge_domains WHERE TRUE;

-- Assign knowledge domains to L1 MASTER agents (broad coverage)
INSERT INTO agent_knowledge_domains (agent_id, domain_name, proficiency_level, is_primary_domain)
SELECT DISTINCT
    a.id as agent_id,
    CASE 
        WHEN a.function_name ILIKE '%regulatory%' THEN 'Regulatory Affairs'
        WHEN a.function_name ILIKE '%clinical%' THEN 'Clinical Development'
        WHEN a.function_name ILIKE '%market%' THEN 'Market Access'
        WHEN a.function_name ILIKE '%medical%' THEN 'Medical Affairs'
        WHEN a.function_name ILIKE '%safety%' THEN 'Pharmacovigilance'
        WHEN a.function_name ILIKE '%commercial%' THEN 'Commercial Operations'
        WHEN a.function_name ILIKE '%manufacturing%' THEN 'Manufacturing & Quality'
        WHEN a.function_name ILIKE '%digital%' THEN 'Digital Health'
        ELSE 'General Healthcare'
    END as domain_name,
    'expert' as proficiency_level,
    true as is_primary_domain
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 1;

-- Assign knowledge domains to L2 EXPERT agents (deep domain knowledge)
INSERT INTO agent_knowledge_domains (agent_id, domain_name, proficiency_level, is_primary_domain)
SELECT DISTINCT
    a.id as agent_id,
    COALESCE(a.department_name, a.function_name, 'General Healthcare') as domain_name,
    'expert' as proficiency_level,
    true as is_primary_domain
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 2;

-- Assign knowledge domains to L3 SPECIALIST agents (narrow expertise)
INSERT INTO agent_knowledge_domains (agent_id, domain_name, proficiency_level, is_primary_domain)
SELECT DISTINCT
    a.id as agent_id,
    COALESCE(a.role_name, a.department_name, 'Specialized Domain') as domain_name,
    'expert' as proficiency_level,
    true as is_primary_domain
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 3;

-- Assign knowledge domains to L4 WORKER agents (operational knowledge)
INSERT INTO agent_knowledge_domains (agent_id, domain_name, proficiency_level, is_primary_domain)
SELECT DISTINCT
    a.id as agent_id,
    'Data Processing & Operations' as domain_name,
    'intermediate' as proficiency_level,
    true as is_primary_domain
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 4;

-- Assign knowledge domains to L5 TOOL agents (functional knowledge)
INSERT INTO agent_knowledge_domains (agent_id, domain_name, proficiency_level, is_primary_domain)
SELECT DISTINCT
    a.id as agent_id,
    'Technical Tools & APIs' as domain_name,
    'basic' as proficiency_level,
    true as is_primary_domain
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 5;

-- Verification report
DO $$
DECLARE
    v_total_agents INT;
    v_agents_with_domains INT;
    v_total_assignments INT;
    v_l1_avg_domains FLOAT;
    v_l2_avg_domains FLOAT;
    v_l3_avg_domains FLOAT;
    v_l4_avg_domains FLOAT;
    v_l5_avg_domains FLOAT;
BEGIN
    SELECT COUNT(*) INTO v_total_agents FROM agents;
    SELECT COUNT(DISTINCT agent_id) INTO v_agents_with_domains FROM agent_knowledge_domains;
    SELECT COUNT(*) INTO v_total_assignments FROM agent_knowledge_domains;
    
    SELECT AVG(domain_count) INTO v_l1_avg_domains FROM (
        SELECT COUNT(*) as domain_count 
        FROM agent_knowledge_domains akd
        JOIN agents a ON akd.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 1
        GROUP BY akd.agent_id
    ) sub;
    
    SELECT AVG(domain_count) INTO v_l2_avg_domains FROM (
        SELECT COUNT(*) as domain_count 
        FROM agent_knowledge_domains akd
        JOIN agents a ON akd.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 2
        GROUP BY akd.agent_id
    ) sub;
    
    SELECT AVG(domain_count) INTO v_l3_avg_domains FROM (
        SELECT COUNT(*) as domain_count 
        FROM agent_knowledge_domains akd
        JOIN agents a ON akd.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 3
        GROUP BY akd.agent_id
    ) sub;
    
    SELECT AVG(domain_count) INTO v_l4_avg_domains FROM (
        SELECT COUNT(*) as domain_count 
        FROM agent_knowledge_domains akd
        JOIN agents a ON akd.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 4
        GROUP BY akd.agent_id
    ) sub;
    
    SELECT AVG(domain_count) INTO v_l5_avg_domains FROM (
        SELECT COUNT(*) as domain_count 
        FROM agent_knowledge_domains akd
        JOIN agents a ON akd.agent_id = a.id
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 5
        GROUP BY akd.agent_id
    ) sub;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ KNOWLEDGE DOMAINS ASSIGNED TO AGENTS';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total agents:                %', v_total_agents;
    RAISE NOTICE 'Agents with knowledge domains: % (%.1f%%)', v_agents_with_domains, (v_agents_with_domains::FLOAT / v_total_agents * 100);
    RAISE NOTICE 'Total domain assignments:    %', v_total_assignments;
    RAISE NOTICE '';
    RAISE NOTICE 'Average domains per level:';
    RAISE NOTICE '  L1 MASTER:       %.1f', COALESCE(v_l1_avg_domains, 0);
    RAISE NOTICE '  L2 EXPERT:       %.1f', COALESCE(v_l2_avg_domains, 0);
    RAISE NOTICE '  L3 SPECIALIST:   %.1f', COALESCE(v_l3_avg_domains, 0);
    RAISE NOTICE '  L4 WORKER:       %.1f', COALESCE(v_l4_avg_domains, 0);
    RAISE NOTICE '  L5 TOOL:         %.1f', COALESCE(v_l5_avg_domains, 0);
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

