-- ============================================================================
-- AgentOS 3.0: Enrich Missing Agent Descriptions (v3 - Column Names Fixed)
-- File: 20251126_enrich_descriptions_v3.sql
-- ============================================================================

-- Step 1: Update taglines
WITH tagline_data AS (
    SELECT 
        a.id,
        CASE 
            WHEN al.level_number = 1 THEN 'Strategic orchestrator managing complex initiatives'
            WHEN al.level_number = 2 THEN 'Deep domain specialist with advanced analytical capabilities'
            WHEN al.level_number = 3 THEN 'Focused expert for specialized tasks'
            WHEN al.level_number = 4 THEN 'Stateless task executor for routine operations'
            WHEN al.level_number = 5 THEN 'Automated tool for specific functions'
            ELSE 'Expert agent for specialized tasks'
        END as new_tagline
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
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
                'L1 Master agent responsible for strategic oversight and orchestration of operations. Manages complex initiatives and delegates to expert agents.'
            WHEN al.level_number = 2 THEN
                'L2 Expert agent with deep domain knowledge. Performs advanced analysis and provides authoritative guidance.'
            WHEN al.level_number = 3 THEN
                'L3 Specialist agent focused on specific technical tasks. Delivers highly focused expertise for well-defined operations.'
            WHEN al.level_number = 4 THEN
                'L4 Worker agent from the shared pool. Executes routine tasks in a stateless, reusable manner.'
            WHEN al.level_number = 5 THEN
                'L5 Tool agent providing automated capabilities. Deterministic and highly optimized for specific operations.'
            ELSE 'Specialized agent for domain-specific tasks'
        END as new_short_desc
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
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
                'This L1 MASTER agent serves as the strategic orchestrator for organizational operations. Key responsibilities include strategic planning and initiative prioritization, delegation to L2 EXPERT and L3 SPECIALIST agents, cross-functional coordination and stakeholder management, risk assessment and mitigation strategy, and resource allocation and optimization. This agent operates at the highest level of abstraction, making decisions that impact entire organizational domains and requiring comprehensive understanding of business context, regulatory requirements, and operational constraints. Uses evidence-based reasoning with complete audit trails.'
                
            WHEN al.level_number = 2 THEN
                'This L2 EXPERT agent possesses deep domain expertise in specialized fields. Core capabilities include advanced analysis and synthesis of complex information, coordination with L3 SPECIALIST agents for focused tasks, direct access to L4 WORKER pool for execution tasks, evidence-based recommendations with complete citations, and cross-reference validation and quality assurance. This agent combines technical depth with strategic thinking, providing authoritative guidance while maintaining awareness of broader organizational goals. Operates with moderate autonomy, escalating to L1 MASTER when strategic decisions are required. Token budget: 1500-2000.'
                
            WHEN al.level_number = 3 THEN
                'This L3 SPECIALIST agent delivers focused expertise in specific technical domains. Primary functions include deep technical analysis within narrow scope, utilization of L4 WORKER pool and L5 TOOL registry, precision execution of well-defined tasks, detailed reporting with evidence trails, and quality validation and accuracy verification. This agent is highly focused and operates with clear boundaries. Cannot spawn other agents but has full access to shared resources (workers and tools). Optimized for accuracy over speed, with comprehensive error handling. Token budget: 1000-1500.'
                
            WHEN al.level_number = 4 THEN
                'This L4 WORKER agent is part of the shared execution pool serving all tenants. Key characteristics: Stateless with no memory between task executions, tenant-agnostic serving all organizations equally, fast execution optimized for sub-10 second response, tool-enabled with direct access to L5 TOOL registry, and highly monitored with complete audit trail for all actions. Executes routine tasks including data extraction, computation, file processing, and API calls. Returns structured, validated output with comprehensive error handling. Does not make strategic decisions or maintain context. Token budget: 300-500.'
                
            WHEN al.level_number = 5 THEN
                'This L5 TOOL agent provides automated capabilities for specific functions. Key properties: Deterministic where same input produces same output, schema-validated with strict input/output contracts, ultra-fast with sub-5 second execution target, stateless as a pure function with no side effects, and reusable being called by any agent or worker. Implements a single, well-defined operation with comprehensive error codes and validation. Part of the shared tool registry accessible across all tenants and agent levels. Optimized for reliability and consistency. Token budget: 100-200.'
                
            ELSE 
                'This agent provides specialized capabilities for domain-specific operations. Designed for precision and reliability within its scope of responsibility. Uses evidence-based reasoning and maintains complete audit trails for all actions performed. Operates according to established protocols and escalates when appropriate.'
        END as new_long_desc
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
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
