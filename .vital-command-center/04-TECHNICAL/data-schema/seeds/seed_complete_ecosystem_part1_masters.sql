-- =====================================================
-- COMPLETE AGENT ECOSYSTEM - COMPREHENSIVE SEED
-- =====================================================
-- Version: 1.0
-- Date: 2025-11-22
-- Description: Seeds entire 5-level agent hierarchy with complete org mapping
-- Total Agents: 133 (5 Master + 35 Expert + 25 Specialist + 18 Worker + 50 Tool)
-- 
-- Includes for EVERY agent:
-- ✅ tenant_id
-- ✅ function_id + function_name
-- ✅ department_id + department_name  
-- ✅ role_id + role_name (where applicable)
-- ✅ master_agent_id (for L2-L5)
-- ✅ agent_level (master/expert/specialist/worker/tool)
-- ✅ industry_vertical (pharmaceuticals)
-- ✅ Complete system prompts
-- ✅ Reasoning capabilities
-- ✅ Domain expertise arrays
-- =====================================================

\set ON_ERROR_STOP on

DO $$ 
DECLARE
    -- Counters
    v_count INTEGER := 0;
    v_master_count INTEGER := 0;
    v_expert_count INTEGER := 0;
    v_specialist_count INTEGER := 0;
    v_worker_count INTEGER := 0;
    v_tool_count INTEGER := 0;
    
    -- Core org IDs
    v_tenant_id UUID;
    v_pharma_function_id UUID;
    
    -- Departments
    v_dept_field_medical UUID;
    v_dept_med_info UUID;
    v_dept_med_comm UUID;
    v_dept_evidence_heor UUID;
    v_dept_clinical_ops UUID;
    v_dept_excellence_gov UUID;
    v_dept_strategy_ops UUID;
    
    -- Master Agents (Level 1)
    v_master_medical_affairs UUID;
    v_master_clinical UUID;
    v_master_evidence UUID;
    v_master_communications UUID;
    v_master_operations UUID;
    
    -- Expert Agents (Level 2) - will be populated as created
    v_expert_msl UUID;
    v_expert_regional_dir UUID;
    v_expert_ta_lead UUID;
    v_expert_trainer UUID;
    v_expert_med_info UUID;
    v_expert_librarian UUID;
    v_expert_content_mgr UUID;
    v_expert_pub_lead UUID;
    v_expert_med_ed UUID;
    v_expert_sci_writer UUID;
    v_expert_reg_writer UUID;
    v_expert_comm_mgr UUID;
    v_expert_editor UUID;
    v_expert_events UUID;
    v_expert_rwe UUID;
    v_expert_heor UUID;
    v_expert_biostat UUID;
    v_expert_epi UUID;
    v_expert_outcomes UUID;
    v_expert_csl UUID;
    v_expert_med_monitor UUID;
    v_expert_data_mgr UUID;
    v_expert_disclosure UUID;
    v_expert_excellence UUID;
    v_expert_review_coord UUID;
    v_expert_qa UUID;
    v_expert_strategist UUID;
    v_expert_ta_expert UUID;
    v_expert_global UUID;
    v_expert_ops UUID;
    v_expert_analytics_dir UUID;
    v_expert_rwe_analyst UUID;
    v_expert_data_scientist UUID;
    v_expert_market_insights UUID;
    v_expert_hcp_analytics UUID;
    
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE '         COMPLETE AGENT ECOSYSTEM SEEDING';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Target: 133 agents (5+35+25+18+50) with full org mapping';
    RAISE NOTICE '================================================================';
    RAISE NOTICE '';
    
    -- =====================================================
    -- STEP 1: SETUP ORGANIZATIONAL STRUCTURE
    -- =====================================================
    RAISE NOTICE '[STEP 1] Setting up organizational structure...';
    
    -- Get tenant
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found. Please create it first.';
    END IF;
    RAISE NOTICE '  ✓ Tenant: pharmaceuticals';
    
    -- Get/Create Medical Affairs Function
    SELECT id INTO v_pharma_function_id FROM functions WHERE slug = 'medical-affairs' LIMIT 1;
    IF v_pharma_function_id IS NULL THEN
        INSERT INTO functions (name, slug, description) 
        VALUES ('Medical Affairs', 'medical-affairs', 'Medical Affairs functional area')
        RETURNING id INTO v_pharma_function_id;
        RAISE NOTICE '  ✓ Created Function: Medical Affairs';
    ELSE
        RAISE NOTICE '  ✓ Function: Medical Affairs (existing)';
    END IF;
    
    -- Create/Get Departments
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Field Medical', 'field-medical', 'Field medical and MSL activities', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_field_medical;
    
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Medical Information', 'medical-information', 'Medical information services', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_med_info;
    
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Medical Communications & Writing', 'medical-communications-writing', 'Publications and medical education', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_med_comm;
    
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Evidence Generation & HEOR', 'evidence-generation-heor', 'RWE and health economics', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_evidence_heor;
    
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Clinical Operations Support', 'clinical-operations-support', 'Clinical trial support', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_clinical_ops;
    
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Medical Excellence & Governance', 'medical-excellence-governance', 'Quality and governance', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_excellence_gov;
    
    INSERT INTO departments (name, slug, description, function_id) 
    VALUES ('Medical Strategy & Operations', 'medical-strategy-operations', 'Strategy and operations', v_pharma_function_id)
    ON CONFLICT (slug) DO UPDATE SET function_id = EXCLUDED.function_id 
    RETURNING id INTO v_dept_strategy_ops;
    
    RAISE NOTICE '  ✓ Created/Updated 7 departments';
    RAISE NOTICE '';
    
    -- =====================================================
    -- STEP 2: CREATE MASTER AGENTS (Level 1) - 5 agents
    -- =====================================================
    RAISE NOTICE '[STEP 2] Creating Level 1: Master Agents...';
    RAISE NOTICE '---------------------------------------------------------------';
    
    -- Master 1: Medical Affairs Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, -- Masters don't map to single roles
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, can_spawn_workers,
        max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id,
        'Master Medical Affairs Orchestrator',
        'master-medical-affairs-orchestrator',
        'Strategic orchestrator for field medical activities',
        'Top-level orchestrator coordinating MSLs, regional directors, TA leads, and field medical training across all regions and therapeutic areas.',
        'Master Orchestrator - Medical Affairs',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_field_medical, 'Field Medical',
        NULL, NULL, -- role_id, role_name
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Medical Affairs Orchestrator, coordinating all field medical activities. Analyze queries and route to MSL Advisor, Regional Director, TA Lead, or Trainer experts based on context. Use Tree-of-Thoughts for complex orchestration decisions.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true, "constitutional_ai": true}'::jsonb,
        true, true, 10,
        ARRAY['field-medical', 'msl-strategy', 'kol-engagement', 'regional-coordination'],
        'development'
    ) RETURNING id INTO v_master_medical_affairs;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
    VALUES (v_master_medical_affairs, 'medical_excellence', 'semantic_routing_with_capability_matching', 6, true);
    
    v_count := v_count + 1;
    v_master_count := v_master_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 1: Medical Affairs Orchestrator', v_count;
    
    -- Master 2: Clinical Excellence Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, can_spawn_workers,
        max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id,
        'Master Clinical Excellence Orchestrator',
        'master-clinical-excellence-orchestrator',
        'Strategic orchestrator for clinical operations',
        'Top-level orchestrator coordinating clinical study liaisons, medical monitors, data managers, and disclosure specialists.',
        'Master Orchestrator - Clinical Excellence',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_clinical_ops, 'Clinical Operations Support',
        NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Clinical Excellence Orchestrator, coordinating all clinical operations. Route to Clinical Study Liaison, Medical Monitor, Data Manager, or Disclosure Manager based on query context.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 8,
        ARRAY['clinical-trials', 'medical-monitoring', 'data-management', 'investigator-relations'],
        'development'
    ) RETURNING id INTO v_master_clinical;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
    VALUES (v_master_clinical, 'clinical', 'semantic_routing_with_capability_matching', 5, true);
    
    v_count := v_count + 1;
    v_master_count := v_master_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 2: Clinical Excellence Orchestrator', v_count;
    
    -- Master 3: Evidence Generation Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, can_spawn_workers,
        max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id,
        'Master Evidence Generation Orchestrator',
        'master-evidence-generation-orchestrator',
        'Strategic orchestrator for RWE and HEOR',
        'Top-level orchestrator coordinating RWE specialists, health economists, biostatisticians, epidemiologists, and outcomes researchers.',
        'Master Orchestrator - Evidence Generation',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_evidence_heor, 'Evidence Generation & HEOR',
        NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Evidence Generation Orchestrator, coordinating all evidence and HEOR activities. Route to RWE, HEOR, Biostatistics, Epidemiology, or Outcomes experts based on methodology needs.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 10,
        ARRAY['real-world-evidence', 'health-economics', 'biostatistics', 'epidemiology'],
        'development'
    ) RETURNING id INTO v_master_evidence;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
    VALUES (v_master_evidence, 'strategic', 'semantic_routing_with_capability_matching', 7, true);
    
    v_count := v_count + 1;
    v_master_count := v_master_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 3: Evidence Generation Orchestrator', v_count;
    
    -- Master 4: Medical Communications Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, can_spawn_workers,
        max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id,
        'Master Medical Communications Orchestrator',
        'master-medical-communications-orchestrator',
        'Strategic orchestrator for publications and education',
        'Top-level orchestrator coordinating publication strategy, medical education, scientific/regulatory writing, communications, editing, and congress activities.',
        'Master Orchestrator - Medical Communications',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_med_comm, 'Medical Communications & Writing',
        NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Medical Communications Orchestrator, coordinating all medical communications. Route to Publication, Medical Education, Writing, Communications, Editing, or Events experts based on content type.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 12,
        ARRAY['publications', 'medical-writing', 'medical-education', 'congress-planning'],
        'development'
    ) RETURNING id INTO v_master_communications;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
    VALUES (v_master_communications, 'strategic', 'semantic_routing_with_capability_matching', 8, true);
    
    v_count := v_count + 1;
    v_master_count := v_master_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 4: Medical Communications Orchestrator', v_count;
    
    -- Master 5: Medical Strategy & Operations Orchestrator
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, can_spawn_workers,
        max_spawned_agents, domain_expertise, status
    ) VALUES (
        v_tenant_id,
        'Master Medical Strategy & Operations Orchestrator',
        'master-medical-strategy-operations-orchestrator',
        'Strategic orchestrator for strategy and operations',
        'Top-level orchestrator coordinating medical information, excellence, governance, strategy, TA expertise, global coordination, and operations.',
        'Master Orchestrator - Strategy & Operations',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_strategy_ops, 'Medical Strategy & Operations',
        NULL, NULL,
        'expert', 'master', 'pharmaceuticals',
        'You are the Master Strategy & Operations Orchestrator, coordinating medical strategy, governance, and operations. Route to Medical Info, Excellence, Governance, Strategy, TA, Global, or Operations experts.',
        'gpt-4o', 0.5, 8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true, true, 12,
        ARRAY['medical-strategy', 'governance', 'quality-assurance', 'operations', 'global-coordination'],
        'development'
    ) RETURNING id INTO v_master_operations;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, is_active)
    VALUES (v_master_operations, 'operations', 'semantic_routing_with_capability_matching', 10, true);
    
    v_count := v_count + 1;
    v_master_count := v_master_count + 1;
    RAISE NOTICE '  ✓ [%/133] Master 5: Strategy & Operations Orchestrator', v_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '  Summary: Created % Master Agents', v_master_count;
    RAISE NOTICE '';
    
    -- =====================================================
    -- TO BE CONTINUED IN NEXT CONTEXT WINDOW
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE 'File too large - continuing with 35 Experts in part 2...';
    RAISE NOTICE 'Run seed_complete_ecosystem_part2.sql next';
    RAISE NOTICE '';
    
END $$;

