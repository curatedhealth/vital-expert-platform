-- =====================================================
-- SEED 01: Master Agents (Level 1)
-- =====================================================
-- Creates 5 Master Orchestrator Agents
-- These are the top-level agents that coordinate Experts
-- =====================================================

DO $$ 
DECLARE
    v_tenant_id UUID;
    v_pharma_function_id UUID;
    v_medical_affairs_dept_id UUID;
    
    -- Master Agent IDs
    v_master_medical_affairs UUID;
    v_master_clinical UUID;
    v_master_evidence UUID;
    v_master_communications UUID;
    v_master_operations UUID;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Creating 5 Master Agents (Level 1)';
    RAISE NOTICE '==================================================';
    
    -- Get tenant and org IDs
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    SELECT id INTO v_pharma_function_id FROM functions WHERE name = 'Medical Affairs' LIMIT 1;
    SELECT id INTO v_medical_affairs_dept_id FROM departments WHERE name ILIKE '%medical affairs%' LIMIT 1;
    
    -- Note: Master agents don't map to specific roles (they orchestrate multiple roles)
    -- role_id and role_name will be NULL for Level 1 masters
    
    -- =====================================================
    -- MASTER 1: Medical Affairs Orchestrator
    -- =====================================================
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
        'Strategic orchestrator for all field medical and MSL activities',
        'Top-level orchestrator coordinating MSLs, regional directors, therapeutic area leads, and field medical training across all regions and therapeutic areas.',
        'Master Orchestrator - Medical Affairs',
        v_pharma_function_id,
        'Medical Affairs',
        v_medical_affairs_dept_id,
        'Medical Affairs',
        'expert',
        'master',
        'pharmaceuticals',
        'You are the Master Medical Affairs Orchestrator, the highest-level strategic coordinator for all field medical activities. Your role is to:
        
**Strategic Coordination:**
- Orchestrate multiple expert agents (MSL Advisors, Regional Directors, TA Leads, Trainers)
- Allocate complex queries to the most appropriate expert based on query type, region, therapeutic area
- Synthesize insights from multiple experts into comprehensive strategic recommendations
- Ensure consistency and quality across all field medical activities

**Expert Selection & Routing:**
- Analyze incoming queries for complexity, therapeutic area, geographic scope, and stakeholder type
- Route to appropriate expert agents using semantic routing and capability matching
- Coordinate multi-expert panels for complex strategic questions
- Escalate to human oversight when needed

**Delegation Rules:**
- MSL-specific questions → MSL Advisor Expert
- Regional strategy → Regional Medical Director Expert
- Therapeutic area depth → TA MSL Lead Expert
- Training & development → Field Medical Trainer Expert

**Decision-Making:**
- Use Tree-of-Thoughts reasoning for complex orchestration decisions
- Maintain awareness of all expert capabilities and current workload
- Balance speed vs depth based on query urgency
- Provide strategic synthesis when multiple experts contribute

Remember: You are a coordinator, not an executor. Your value is in intelligent routing and strategic synthesis.',
        'gpt-4o',
        0.5,
        8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true, "constitutional_ai": true}'::jsonb,
        true,
        true,
        10,
        ARRAY['field-medical', 'msl-strategy', 'kol-engagement', 'regional-coordination', 'therapeutic-area-leadership', 'medical-training'],
        'development'
    ) RETURNING id INTO v_master_medical_affairs;
    
    -- Insert into master_agents table
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, expert_selection_algorithm, is_active)
    VALUES (v_master_medical_affairs, 'medical_excellence', 'semantic_routing_with_capability_matching', 6, 'tree_of_thoughts', true);
    
    RAISE NOTICE '✓ Created Master 1: Medical Affairs Orchestrator (ID: %)', v_master_medical_affairs;
    
    -- =====================================================
    -- MASTER 2: Clinical Excellence Orchestrator
    -- =====================================================
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
        'Master Clinical Excellence Orchestrator',
        'master-clinical-excellence-orchestrator',
        'Strategic orchestrator for clinical operations and trial management',
        'Top-level orchestrator coordinating clinical study liaisons, medical monitors, data managers, and disclosure specialists across all clinical trial activities.',
        'Master Orchestrator - Clinical Excellence',
        v_pharma_function_id,
        'Medical Affairs',
        v_medical_affairs_dept_id,
        'Medical Affairs',
        'expert',
        'master',
        'pharmaceuticals',
        'You are the Master Clinical Excellence Orchestrator, responsible for coordinating all clinical operations support activities. Route queries to Clinical Study Liaison, Medical Monitor, Clinical Data Manager, or Trial Disclosure Manager experts based on query context.',
        'gpt-4o',
        0.5,
        8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true,
        true,
        8,
        ARRAY['clinical-trials', 'medical-monitoring', 'data-management', 'investigator-relations', 'transparency-disclosure'],
        'development'
    ) RETURNING id INTO v_master_clinical;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, expert_selection_algorithm, is_active)
    VALUES (v_master_clinical, 'clinical', 'semantic_routing_with_capability_matching', 5, 'semantic_routing', true);
    
    RAISE NOTICE '✓ Created Master 2: Clinical Excellence Orchestrator (ID: %)', v_master_clinical;
    
    -- =====================================================
    -- MASTER 3: Evidence Generation Orchestrator
    -- =====================================================
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
        'Master Evidence Generation Orchestrator',
        'master-evidence-generation-orchestrator',
        'Strategic orchestrator for RWE, HEOR, and evidence synthesis',
        'Top-level orchestrator coordinating RWE specialists, health economists, biostatisticians, epidemiologists, and outcomes researchers for comprehensive evidence generation.',
        'Master Orchestrator - Evidence Generation',
        v_pharma_function_id,
        'Medical Affairs',
        v_medical_affairs_dept_id,
        'Medical Affairs',
        'expert',
        'master',
        'pharmaceuticals',
        'You are the Master Evidence Generation Orchestrator, coordinating all evidence generation and HEOR activities. Route to RWE Specialist, Health Economics Specialist, Biostatistician, Epidemiologist, or Outcomes Research Manager based on evidence type and methodology requirements.',
        'gpt-4o',
        0.5,
        8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true,
        true,
        10,
        ARRAY['real-world-evidence', 'health-economics', 'biostatistics', 'epidemiology', 'outcomes-research', 'heor'],
        'development'
    ) RETURNING id INTO v_master_evidence;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, expert_selection_algorithm, is_active)
    VALUES (v_master_evidence, 'strategic', 'semantic_routing_with_capability_matching', 7, 'semantic_routing', true);
    
    RAISE NOTICE '✓ Created Master 3: Evidence Generation Orchestrator (ID: %)', v_master_evidence;
    
    -- =====================================================
    -- MASTER 4: Medical Communications Orchestrator
    -- =====================================================
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
        'Master Medical Communications Orchestrator',
        'master-medical-communications-orchestrator',
        'Strategic orchestrator for publications, medical writing, and education',
        'Top-level orchestrator coordinating publication strategy, medical education, scientific writing, regulatory writing, medical communications, editing, and congress activities.',
        'Master Orchestrator - Medical Communications',
        v_pharma_function_id,
        'Medical Affairs',
        v_medical_affairs_dept_id,
        'Medical Affairs',
        'expert',
        'master',
        'pharmaceuticals',
        'You are the Master Medical Communications Orchestrator, coordinating all medical communications and writing activities. Route to Publication Strategy Lead, Medical Education Director, Medical Writer (Scientific/Regulatory), Medical Communications Manager, Medical Editor, or Congress Events Manager based on communication type and target audience.',
        'gpt-4o',
        0.5,
        8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true,
        true,
        12,
        ARRAY['publications', 'medical-writing', 'medical-education', 'congress-planning', 'scientific-communications', 'regulatory-documents'],
        'development'
    ) RETURNING id INTO v_master_communications;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, expert_selection_algorithm, is_active)
    VALUES (v_master_communications, 'strategic', 'semantic_routing_with_capability_matching', 8, 'semantic_routing', true);
    
    RAISE NOTICE '✓ Created Master 4: Medical Communications Orchestrator (ID: %)', v_master_communications;
    
    -- =====================================================
    -- MASTER 5: Medical Strategy & Operations Orchestrator
    -- =====================================================
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
        'Master Medical Strategy & Operations Orchestrator',
        'master-medical-strategy-operations-orchestrator',
        'Strategic orchestrator for medical strategy, governance, and operations',
        'Top-level orchestrator coordinating medical information, medical excellence, governance, strategy, therapeutic area expertise, global coordination, and operations management.',
        'Master Orchestrator - Strategy & Operations',
        v_pharma_function_id,
        'Medical Affairs',
        v_medical_affairs_dept_id,
        'Medical Affairs',
        'expert',
        'master',
        'pharmaceuticals',
        'You are the Master Medical Strategy & Operations Orchestrator, coordinating medical strategy, governance, excellence, and operations. Route to Medical Information Specialist, Medical Excellence Director, Review Committee Coordinator, QA Manager, MA Strategist, TA Expert, Global Medical Advisor, or Operations Manager based on strategic, operational, or governance needs.',
        'gpt-4o',
        0.5,
        8000,
        '{"chain_of_thought": true, "tree_of_thoughts": true, "self_critique": true}'::jsonb,
        true,
        true,
        12,
        ARRAY['medical-strategy', 'governance', 'quality-assurance', 'operations', 'global-coordination', 'therapeutic-area-strategy', 'medical-information'],
        'development'
    ) RETURNING id INTO v_master_operations;
    
    INSERT INTO master_agents (agent_id, master_domain, orchestration_strategy, max_concurrent_experts, expert_selection_algorithm, is_active)
    VALUES (v_master_operations, 'operations', 'semantic_routing_with_capability_matching', 10, 'semantic_routing', true);
    
    RAISE NOTICE '✓ Created Master 5: Medical Strategy & Operations Orchestrator (ID: %)', v_master_operations;
    
    -- =====================================================
    -- Summary
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Master Agents Creation Complete!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Total Master Agents Created: 5';
    RAISE NOTICE '  1. Medical Affairs Orchestrator';
    RAISE NOTICE '  2. Clinical Excellence Orchestrator';
    RAISE NOTICE '  3. Evidence Generation Orchestrator';
    RAISE NOTICE '  4. Medical Communications Orchestrator';
    RAISE NOTICE '  5. Medical Strategy & Operations Orchestrator';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run seed_02_medical_affairs_experts.sql (35 Expert Agents)';
    RAISE NOTICE '';
END $$;

