-- ============================================================================
-- AgentOS 3.0: Link All Agents to System Prompt Templates
-- File: 20251126_link_agents_to_templates.sql
-- Purpose: Automatically assign correct template to each agent based on level
-- ============================================================================

-- First, verify our templates exist
DO $$ 
DECLARE
    v_template_count INT;
BEGIN
    SELECT COUNT(*) INTO v_template_count FROM system_prompt_templates WHERE is_active = true;
    
    IF v_template_count < 5 THEN
        RAISE EXCEPTION 'Not all system prompt templates exist! Found: %, Expected: 5', v_template_count;
    END IF;
    
    RAISE NOTICE '✅ All 5 system prompt templates confirmed';
END $$;

-- Link agents to templates based on their level
UPDATE agents a
SET system_prompt_template_id = spt.id
FROM agent_levels al
JOIN system_prompt_templates spt ON al.level_name = spt.agent_level_name
WHERE a.agent_level_id = al.id
  AND a.system_prompt_template_id IS NULL;

-- Verify the linking
DO $$
DECLARE
    v_total_agents INT;
    v_linked_agents INT;
    v_l1_linked INT;
    v_l2_linked INT;
    v_l3_linked INT;
    v_l4_linked INT;
    v_l5_linked INT;
BEGIN
    SELECT COUNT(*) INTO v_total_agents FROM agents;
    SELECT COUNT(*) INTO v_linked_agents FROM agents WHERE system_prompt_template_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_l1_linked 
    FROM agents a 
    JOIN agent_levels al ON a.agent_level_id = al.id 
    WHERE al.level_name = 'MASTER' AND a.system_prompt_template_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_l2_linked 
    FROM agents a 
    JOIN agent_levels al ON a.agent_level_id = al.id 
    WHERE al.level_name = 'EXPERT' AND a.system_prompt_template_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_l3_linked 
    FROM agents a 
    JOIN agent_levels al ON a.agent_level_id = al.id 
    WHERE al.level_name = 'SPECIALIST' AND a.system_prompt_template_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_l4_linked 
    FROM agents a 
    JOIN agent_levels al ON a.agent_level_id = al.id 
    WHERE al.level_name = 'WORKER' AND a.system_prompt_template_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_l5_linked 
    FROM agents a 
    JOIN agent_levels al ON a.agent_level_id = al.id 
    WHERE al.level_name = 'TOOL' AND a.system_prompt_template_id IS NOT NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ AGENTS LINKED TO SYSTEM PROMPT TEMPLATES';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total agents:         %', v_total_agents;
    RAISE NOTICE 'Agents now linked:    % (%.1f%%)', v_linked_agents, (v_linked_agents::FLOAT / v_total_agents * 100);
    RAISE NOTICE '';
    RAISE NOTICE 'By Level:';
    RAISE NOTICE '  L1 MASTER:          %', v_l1_linked;
    RAISE NOTICE '  L2 EXPERT:          %', v_l2_linked;
    RAISE NOTICE '  L3 SPECIALIST:      %', v_l3_linked;
    RAISE NOTICE '  L4 WORKER:          %', v_l4_linked;
    RAISE NOTICE '  L5 TOOL:            %', v_l5_linked;
    RAISE NOTICE '════════════════════════════════════════════════════════';
    
    IF v_linked_agents = v_total_agents THEN
        RAISE NOTICE '🎉 ALL AGENTS SUCCESSFULLY LINKED!';
    ELSE
        RAISE WARNING '⚠️  % agents still unlinked', (v_total_agents - v_linked_agents);
    END IF;
END $$;

