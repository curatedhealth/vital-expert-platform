-- ============================================================================
-- AgentOS 3.0: Enrich Missing Agent Descriptions (CLEAN VERSION)
-- File: 20251126_enrich_descriptions_v2.sql
-- ============================================================================

-- Step 1: Update taglines
WITH tagline_data AS (
    SELECT 
        a.id,
        CASE 
            WHEN al.level_number = 1 THEN 'Strategic ' || COALESCE(f.name, 'Domain') || ' orchestrator managing complex initiatives'
            WHEN al.level_number = 2 THEN 'Deep ' || COALESCE(f.name, 'domain') || ' specialist with advanced analytical capabilities'
            WHEN al.level_number = 3 THEN 'Focused ' || COALESCE(d.name, 'technical') || ' expert for specialized tasks'
            WHEN al.level_number = 4 THEN 'Stateless task executor for ' || COALESCE(f.name, 'general') || ' operations'
            WHEN al.level_number = 5 THEN 'Automated tool for specific functions'
            ELSE 'Expert agent for specialized tasks'
        END as new_tagline
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    LEFT JOIN org_functions f ON a.primary_function_id = f.id
    LEFT JOIN org_departments d ON a.primary_department_id = d.id
    WHERE a.tagline IS NULL OR a.tagline = ''
)
UPDATE agents
SET tagline = tagline_data.new_tagline
FROM tagline_data
WHERE agents.id = tagline_data.id;

-- Step 2: Update short descriptions
WITH short_desc_data AS (
    SELECT 
        a.id,
        CASE 
            WHEN al.level_number = 1 THEN 
                'L1 Master agent responsible for strategic oversight and orchestration of ' || 
                COALESCE(f.name, 'domain') || ' operations. Manages complex initiatives and delegates to expert agents.'
            WHEN al.level_number = 2 THEN
                'L2 Expert agent with deep domain knowledge in ' || COALESCE(f.name, 'specialized area') || 
                '. Performs advanced analysis and provides authoritative guidance.'
            WHEN al.level_number = 3 THEN
                'L3 Specialist agent focused on ' || COALESCE(d.name, 'specific subdomain') || 
                '. Delivers highly focused expertise for well-defined technical tasks.'
            WHEN al.level_number = 4 THEN
                'L4 Worker agent from the shared pool. Executes routine tasks in a stateless, reusable manner.'
            WHEN al.level_number = 5 THEN
                'L5 Tool agent providing automated capabilities. Deterministic and highly optimized.'
            ELSE 'Specialized agent for domain-specific tasks'
        END as new_short_desc
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    LEFT JOIN org_functions f ON a.primary_function_id = f.id
    LEFT JOIN org_departments d ON a.primary_department_id = d.id
    WHERE a.short_description IS NULL OR a.short_description = ''
)
UPDATE agents
SET short_description = short_desc_data.new_short_desc
FROM short_desc_data
WHERE agents.id = short_desc_data.id;

-- Step 3: Update long descriptions
WITH long_desc_data AS (
    SELECT 
        a.id,
        CASE 
            WHEN al.level_number = 1 THEN 
                'This L1 MASTER agent serves as the strategic orchestrator. Key responsibilities: Strategic planning, delegation to L2 EXPERT and L3 SPECIALIST agents, cross-functional coordination, risk assessment, and resource allocation. Operates at the highest level of abstraction with evidence-based reasoning and complete audit trails.'
            WHEN al.level_number = 2 THEN
                'This L2 EXPERT agent possesses deep domain expertise. Core capabilities: Advanced analysis and synthesis, coordination with L3 SPECIALIST agents, direct access to L4 WORKER pool, evidence-based recommendations with citations, and quality assurance. Combines technical depth with strategic thinking. Token budget: 1500-2000.'
            WHEN al.level_number = 3 THEN
                'This L3 SPECIALIST agent delivers focused expertise. Primary functions: Deep technical analysis within narrow scope, utilization of L4 WORKER pool and L5 TOOL registry, precision execution, detailed reporting with evidence trails, and quality validation. Optimized for accuracy. Token budget: 1000-1500.'
            WHEN al.level_number = 4 THEN
                'This L4 WORKER agent is part of the shared execution pool. Characteristics: Stateless (no memory between tasks), tenant-agnostic, fast execution (sub-10 second response), tool-enabled, and highly monitored. Executes routine tasks with structured output. Token budget: 300-500.'
            WHEN al.level_number = 5 THEN
                'This L5 TOOL agent provides automated capabilities. Properties: Deterministic, schema-validated, ultra-fast (sub-5 second), stateless pure function, and reusable. Part of shared tool registry accessible across all tenants. Token budget: 100-200.'
            ELSE 
                'This agent provides specialized capabilities for domain-specific operations with evidence-based reasoning and complete audit trails.'
        END as new_long_desc
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    LEFT JOIN org_functions f ON a.primary_function_id = f.id
    LEFT JOIN org_departments d ON a.primary_department_id = d.id
    WHERE a.long_description IS NULL OR a.long_description = '' OR LENGTH(a.long_description) < 100
)
UPDATE agents
SET long_description = long_desc_data.new_long_desc
FROM long_desc_data
WHERE agents.id = long_desc_data.id;

-- Verification
DO $$
DECLARE
    v_total INT;
    v_with_tagline INT;
    v_with_short INT;
    v_with_long INT;
BEGIN
    SELECT COUNT(*) INTO v_total FROM agents;
    SELECT COUNT(*) INTO v_with_tagline FROM agents WHERE tagline IS NOT NULL AND tagline != '';
    SELECT COUNT(*) INTO v_with_short FROM agents WHERE short_description IS NOT NULL AND short_description != '';
    SELECT COUNT(*) INTO v_with_long FROM agents WHERE long_description IS NOT NULL AND LENGTH(long_description) >= 100;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ AGENT DESCRIPTIONS ENRICHED';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total agents:              %', v_total;
    RAISE NOTICE 'With tagline:              % (%.1f%%)', v_with_tagline, (v_with_tagline::FLOAT / v_total * 100);
    RAISE NOTICE 'With short description:    % (%.1f%%)', v_with_short, (v_with_short::FLOAT / v_total * 100);
    RAISE NOTICE 'With long description:     % (%.1f%%)', v_with_long, (v_with_long::FLOAT / v_total * 100);
    RAISE NOTICE '════════════════════════════════════════════════════════';
    
    IF v_with_tagline = v_total AND v_with_short = v_total AND v_with_long = v_total THEN
        RAISE NOTICE '🎉 ALL AGENT DESCRIPTIONS COMPLETE!';
    END IF;
END $$;
