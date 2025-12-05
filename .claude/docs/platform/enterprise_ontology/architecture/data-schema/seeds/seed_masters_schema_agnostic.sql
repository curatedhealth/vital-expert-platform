-- =====================================================
-- COMPLETE AGENT ECOSYSTEM - SCHEMA-AGNOSTIC VERSION
-- =====================================================
-- Version: 2.0 (Schema-Agnostic)
-- Works with ANY database schema - creates what's missing
-- Total: 133 agents across 5 levels
-- =====================================================

\set ON_ERROR_STOP on

DO $$ 
DECLARE
    v_count INTEGER := 0;
    
    -- Core IDs
    v_tenant_id UUID;
    v_function_id UUID := NULL;
    v_dept_id UUID := NULL;
    v_role_id UUID := NULL;
    
    -- Master Agents
    v_master_medical_affairs UUID;
    v_master_clinical UUID;
    v_master_evidence UUID;
    v_master_communications UUID;
    v_master_operations UUID;
    
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE '    COMPLETE AGENT ECOSYSTEM - SCHEMA-AGNOSTIC VERSION';
    RAISE NOTICE '================================================================';
    RAISE NOTICE '';
    
    -- =====================================================
    -- STEP 1: DETECT & SETUP ORGANIZATIONAL STRUCTURE
    -- =====================================================
    RAISE NOTICE '[STEP 1] Detecting organizational structure...';
    
    -- Try to get tenant
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharma%' LIMIT 1;
        IF v_tenant_id IS NULL THEN
            -- Try to get any tenant
            SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
        END IF;
        RAISE NOTICE '  ✓ Using tenant_id: %', v_tenant_id;
    ELSE
        RAISE NOTICE '  ⚠ tenants table does not exist - tenant_id will be NULL';
    END IF;
    
    -- Try to create/get function
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'functions') THEN
        SELECT id INTO v_function_id FROM functions WHERE name = 'Medical Affairs' LIMIT 1;
        IF v_function_id IS NULL THEN
            INSERT INTO functions (name, slug, description)
            VALUES ('Medical Affairs', 'medical-affairs', 'Medical Affairs function')
            RETURNING id INTO v_function_id;
            RAISE NOTICE '  ✓ Created function: Medical Affairs';
        ELSE
            RAISE NOTICE '  ✓ Using existing function: Medical Affairs';
        END IF;
    ELSE
        RAISE NOTICE '  ⚠ functions table does not exist - function_id will be NULL';
    END IF;
    
    -- Try to create/get departments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
        RAISE NOTICE '  ✓ departments table exists - will create departments';
    ELSE
        RAISE NOTICE '  ⚠ departments table does not exist - department_id will be NULL';
    END IF;
    
    -- Check if roles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        RAISE NOTICE '  ✓ roles table exists - will attempt role mapping';
    ELSE
        RAISE NOTICE '  ⚠ roles table does not exist - role_id will be NULL';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '  Summary:';
    RAISE NOTICE '    - tenant_id: %', CASE WHEN v_tenant_id IS NOT NULL THEN 'SET' ELSE 'NULL' END;
    RAISE NOTICE '    - function_id: %', CASE WHEN v_function_id IS NOT NULL THEN 'SET' ELSE 'NULL' END;
    RAISE NOTICE '    - Agents will be created with available org context';
    RAISE NOTICE '';
    
    -- =====================================================
    -- STEP 2: CREATE MASTER AGENTS (Level 1) - 5 agents
    -- =====================================================
    RAISE NOTICE '[STEP 2] Creating Level 1: Master Agents (5)...';
    RAISE NOTICE '---------------------------------------------------------------';
    
    -- Master 1: Medical Affairs Orchestrator
    INSERT INTO agents (
        tenant_id,
        name,
        slug,
        tagline,
        description,
        title,
        function_id,
        function_name,
        department_id,
        department_name,
        role_id,
        role_name,
        expertise_level,
        agent_level,
        industry_vertical,
        system_prompt,
        base_model,
        temperature,
        max_tokens,
        reasoning_capabilities,
        can_spawn_specialists,
        can_spawn_workers,
        max_spawned_agents,
        domain_expertise,
        status
    ) VALUES (
        v_tenant_id,
        'Master Medical Affairs Orchestrator',
        'master-medical-affairs-orchestrator',
        'Strategic orchestrator for field medical activities',
        'Top-level orchestrator coordinating MSLs, regional directors, TA leads, and field medical training.',
        'Master Orchestrator - Medical Affairs',
        v_function_id,
        'Medical Affairs',
        NULL, -- department_id will be set if departments exist
        'Field Medical',
        NULL, -- Masters don't map to single roles
        NULL,
        'expert',
        'master',
        'pharmaceuticals',
        'You are the Master Medical Affairs Orchestrator, coordinating all field medical activities. Route queries to MSL Advisor, Regional Director, TA Lead, or Trainer experts based on context.',
        'gpt-4o',
        0.5,
        8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true, "constitutional_ai": true}'::jsonb,
        true,
        true,
        10,
        ARRAY['field-medical', 'msl-strategy', 'kol-engagement', 'regional-coordination'],
        'development'
    ) RETURNING id INTO v_master_medical_affairs;
    
    -- Insert into master_agents table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_agents') THEN
        INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
        VALUES (v_master_medical_affairs, 'medical_excellence', 'semantic_routing_with_capability_matching', 6, true)
        ON CONFLICT (agent_id) DO NOTHING;
    END IF;
    
    v_count := v_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 1: Medical Affairs Orchestrator', v_count;
    
    -- Master 2: Clinical Excellence Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name, role_id, role_name,
        expertise_level, agent_level, industry_vertical, system_prompt,
        base_model, temperature, max_tokens, reasoning_capabilities,
        can_spawn_specialists, can_spawn_workers, max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Master Clinical Excellence Orchestrator', 'master-clinical-excellence-orchestrator',
        'Strategic orchestrator for clinical operations',
        'Top-level orchestrator coordinating clinical study liaisons, medical monitors, data managers, and disclosure specialists.',
        'Master Orchestrator - Clinical Excellence',
        v_function_id, 'Medical Affairs', NULL, 'Clinical Operations Support', NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Clinical Excellence Orchestrator, coordinating all clinical operations. Route to Clinical Study Liaison, Medical Monitor, Data Manager, or Disclosure Manager based on query context.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 8, ARRAY['clinical-trials', 'medical-monitoring', 'data-management'], 'development'
    ) RETURNING id INTO v_master_clinical;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_agents') THEN
        INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
        VALUES (v_master_clinical, 'clinical', 'semantic_routing_with_capability_matching', 5, true)
        ON CONFLICT (agent_id) DO NOTHING;
    END IF;
    
    v_count := v_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 2: Clinical Excellence Orchestrator', v_count;
    
    -- Master 3: Evidence Generation Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name, role_id, role_name,
        expertise_level, agent_level, industry_vertical, system_prompt,
        base_model, temperature, max_tokens, reasoning_capabilities,
        can_spawn_specialists, can_spawn_workers, max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Master Evidence Generation Orchestrator', 'master-evidence-generation-orchestrator',
        'Strategic orchestrator for RWE and HEOR',
        'Top-level orchestrator coordinating RWE specialists, health economists, biostatisticians, epidemiologists.',
        'Master Orchestrator - Evidence Generation',
        v_function_id, 'Medical Affairs', NULL, 'Evidence Generation & HEOR', NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Evidence Generation Orchestrator, coordinating all evidence and HEOR activities. Route based on methodology needs.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 10, ARRAY['real-world-evidence', 'health-economics', 'biostatistics'], 'development'
    ) RETURNING id INTO v_master_evidence;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_agents') THEN
        INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
        VALUES (v_master_evidence, 'strategic', 'semantic_routing_with_capability_matching', 7, true)
        ON CONFLICT (agent_id) DO NOTHING;
    END IF;
    
    v_count := v_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 3: Evidence Generation Orchestrator', v_count;
    
    -- Master 4: Medical Communications Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name, role_id, role_name,
        expertise_level, agent_level, industry_vertical, system_prompt,
        base_model, temperature, max_tokens, reasoning_capabilities,
        can_spawn_specialists, can_spawn_workers, max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Master Medical Communications Orchestrator', 'master-medical-communications-orchestrator',
        'Strategic orchestrator for publications and education',
        'Top-level orchestrator coordinating publication strategy, medical education, writing, and congress activities.',
        'Master Orchestrator - Medical Communications',
        v_function_id, 'Medical Affairs', NULL, 'Medical Communications & Writing', NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Medical Communications Orchestrator, coordinating all medical communications. Route based on content type.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 12, ARRAY['publications', 'medical-writing', 'medical-education'], 'development'
    ) RETURNING id INTO v_master_communications;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_agents') THEN
        INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
        VALUES (v_master_communications, 'strategic', 'semantic_routing_with_capability_matching', 8, true)
        ON CONFLICT (agent_id) DO NOTHING;
    END IF;
    
    v_count := v_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 4: Medical Communications Orchestrator', v_count;
    
    -- Master 5: Medical Strategy & Operations Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name, role_id, role_name,
        expertise_level, agent_level, industry_vertical, system_prompt,
        base_model, temperature, max_tokens, reasoning_capabilities,
        can_spawn_specialists, can_spawn_workers, max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Master Medical Strategy & Operations Orchestrator', 'master-medical-strategy-operations-orchestrator',
        'Strategic orchestrator for strategy and operations',
        'Top-level orchestrator coordinating medical information, excellence, governance, strategy, and operations.',
        'Master Orchestrator - Strategy & Operations',
        v_function_id, 'Medical Affairs', NULL, 'Medical Strategy & Operations', NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Strategy & Operations Orchestrator, coordinating medical strategy, governance, and operations.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 12, ARRAY['medical-strategy', 'governance', 'operations'], 'development'
    ) RETURNING id INTO v_master_operations;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_agents') THEN
        INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
        VALUES (v_master_operations, 'operations', 'semantic_routing_with_capability_matching', 10, true)
        ON CONFLICT (agent_id) DO NOTHING;
    END IF;
    
    v_count := v_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 5: Strategy & Operations Orchestrator', v_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '  ✅ Created % Master Agents successfully', v_count;
    RAISE NOTICE '';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Master Agents creation complete!';
    RAISE NOTICE 'Next: Run part 2 for Expert Agents (35 agents)';
    RAISE NOTICE '================================================================';
    
END $$;

