-- =====================================================
-- VITAL AgentOS 3.0: Complete 5-Level Agent Ecosystem
-- Part 1: Master Agents (Level 1) - With Agent Level FK
-- =====================================================
-- Creates 5 Master Agents with proper agent_level_id foreign keys
-- All agents include complete organizational mapping
-- =====================================================

DO $$
DECLARE
    v_function_id UUID := '06127088-4d52-40aa-88c9-93f4e79e085a';
    v_function_name TEXT := 'Medical Affairs';
    v_tenant_id UUID;
    v_agent_level_master UUID;
    
    -- Master Agent IDs
    v_master_medical_affairs UUID;
    v_master_clinical_ops UUID;
    v_master_scientific_comms UUID;
    v_master_evidence_strategy UUID;
    v_master_field_operations UUID;
    
BEGIN
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant "pharmaceuticals" not found. Please create it first.';
    END IF;
    
    -- Get Master agent level ID
    SELECT id INTO v_agent_level_master FROM agent_levels WHERE slug = 'master' LIMIT 1;
    IF v_agent_level_master IS NULL THEN
        RAISE EXCEPTION 'Agent level "master" not found. Please run create_agent_levels_table.sql first.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Creating 5 Master Agents (Level 1)';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Agent Level ID (Master): %', v_agent_level_master;
    RAISE NOTICE '========================================';
    
    -- =====================================================
    -- LEVEL 1: MASTER AGENTS (5 Total)
    -- =====================================================
    
    -- Master Agent 1: Medical Affairs Strategy Master
    INSERT INTO agents (
        name,
        slug,
        tagline,
        description,
        tenant_id,
        function_id,
        function_name,
        department_id,
        department_name,
        role_id,
        role_name,
        agent_level_id,
        system_prompt,
        base_model,
        temperature,
        max_tokens
    ) VALUES (
        'Medical Affairs Strategy Master',
        'medical-affairs-strategy-master',
        'Strategic oversight for all medical affairs operations',
        'Top-level orchestrator managing all medical affairs activities including field medical, medical information, communications, evidence generation, and clinical operations. Delegates to specialized expert agents based on query complexity and domain.',
        v_tenant_id,
        v_function_id,
        v_function_name,
        '23ee308e-b415-4471-9605-d50c69d33209', -- Medical Leadership
        'Medical Leadership',
        '41bd8589-616a-4b9d-ab2b-4bc24d9abe67', -- Global Chief Medical Officer
        'Global Chief Medical Officer',
        v_agent_level_master,
        'You are the Medical Affairs Strategy Master, the highest-level AI agent orchestrating all medical affairs activities. You manage strategic oversight, delegate to expert agents, and ensure comprehensive solutions across field medical, medical information, scientific communications, evidence generation, and clinical operations. When a query requires specialized expertise, you identify the appropriate expert agent(s) and coordinate their responses.',
        'gpt-4o',
        0.7,
        8000
    ) RETURNING id INTO v_master_medical_affairs;
    
    RAISE NOTICE 'Created Master 1/5: Medical Affairs Strategy Master (ID: %)', v_master_medical_affairs;
    
    -- Master Agent 2: Clinical Operations Master
    INSERT INTO agents (
        name,
        slug,
        tagline,
        description,
        tenant_id,
        function_id,
        function_name,
        department_id,
        department_name,
        role_id,
        role_name,
        agent_level_id,
        system_prompt,
        base_model,
        temperature,
        max_tokens
    ) VALUES (
        'Clinical Operations Master',
        'clinical-operations-master',
        'Coordinates all clinical trial support and operational activities',
        'Master agent overseeing clinical operations support, trial coordination, site management, and cross-functional clinical activities. Spawns specialists for protocol design, data quality, and patient safety.',
        v_tenant_id,
        v_function_id,
        v_function_name,
        'a8018f58-6a8a-4a09-92b2-b1667b1148c5', -- Clinical Operations Support
        'Clinical Operations Support',
        '3b5eec9c-2465-4ec6-8e55-728e94cc4276', -- Global Clinical Operations Liaison
        'Global Clinical Operations Liaison',
        v_agent_level_master,
        'You are the Clinical Operations Master, coordinating all clinical trial support, site management, and operational excellence. You delegate to specialized agents for protocol design, data monitoring, patient safety, and regulatory compliance in clinical settings.',
        'gpt-4o',
        0.7,
        8000
    ) RETURNING id INTO v_master_clinical_ops;
    
    RAISE NOTICE 'Created Master 2/5: Clinical Operations Master (ID: %)', v_master_clinical_ops;
    
    -- Master Agent 3: Scientific Communications Master
    INSERT INTO agents (
        name,
        slug,
        tagline,
        description,
        tenant_id,
        function_id,
        function_name,
        department_id,
        department_name,
        role_id,
        role_name,
        agent_level_id,
        system_prompt,
        base_model,
        temperature,
        max_tokens
    ) VALUES (
        'Scientific Communications Master',
        'scientific-communications-master',
        'Orchestrates all scientific writing, publications, and medical communications',
        'Master agent managing scientific communications, medical writing, publications planning, and content strategy. Delegates to specialists for manuscript writing, congress materials, and regulatory documentation.',
        v_tenant_id,
        v_function_id,
        v_function_name,
        '9871d82a-631a-4cf7-9a00-1ab838a45c3e', -- Scientific Communications
        'Scientific Communications',
        'e30fbcd9-0c1e-4d54-9d2b-1d2b2b78b694', -- Global Scientific Affairs Lead
        'Global Scientific Affairs Lead',
        v_agent_level_master,
        'You are the Scientific Communications Master, managing all medical writing, publication planning, and scientific content creation. You coordinate expert agents for manuscript development, congress presentations, and regulatory medical writing while ensuring brand consistency and compliance.',
        'gpt-4o',
        0.7,
        8000
    ) RETURNING id INTO v_master_scientific_comms;
    
    RAISE NOTICE 'Created Master 3/5: Scientific Communications Master (ID: %)', v_master_scientific_comms;
    
    -- Master Agent 4: Evidence & HEOR Strategy Master
    INSERT INTO agents (
        name,
        slug,
        tagline,
        description,
        tenant_id,
        function_id,
        function_name,
        department_id,
        department_name,
        role_id,
        role_name,
        agent_level_id,
        system_prompt,
        base_model,
        temperature,
        max_tokens
    ) VALUES (
        'Evidence & HEOR Strategy Master',
        'evidence-heor-strategy-master',
        'Leads real-world evidence generation and health economics outcomes research',
        'Master agent overseeing evidence generation, HEOR studies, health economics modeling, and outcomes research. Spawns specialists for RWE analysis, economic modeling, and value demonstration.',
        v_tenant_id,
        v_function_id,
        v_function_name,
        '04723b72-04b3-40fe-aa1f-2e834b719b03', -- HEOR & Evidence
        'HEOR & Evidence',
        'b94d63b9-5a28-43c2-97aa-2a98484c2ef2', -- Global Real-World Evidence Lead
        'Global Real-World Evidence Lead',
        v_agent_level_master,
        'You are the Evidence & HEOR Strategy Master, leading real-world evidence generation, health economics research, and outcomes studies. You coordinate expert agents for RWE analysis, economic modeling, market access support, and value demonstration to payers and stakeholders.',
        'gpt-4o',
        0.7,
        8000
    ) RETURNING id INTO v_master_evidence_strategy;
    
    RAISE NOTICE 'Created Master 4/5: Evidence & HEOR Strategy Master (ID: %)', v_master_evidence_strategy;
    
    -- Master Agent 5: Field Medical Operations Master
    INSERT INTO agents (
        name,
        slug,
        tagline,
        description,
        tenant_id,
        function_id,
        function_name,
        department_id,
        department_name,
        role_id,
        role_name,
        agent_level_id,
        system_prompt,
        base_model,
        temperature,
        max_tokens
    ) VALUES (
        'Field Medical Operations Master',
        'field-medical-operations-master',
        'Manages MSL teams, KOL engagement, and field medical strategy',
        'Master agent coordinating all field medical activities including MSL operations, KOL engagement, regional medical strategies, and healthcare provider education. Delegates to expert MSLs and regional specialists.',
        v_tenant_id,
        v_function_id,
        v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', -- Field Medical
        'Field Medical',
        '2b4a64b9-7e2e-4a5f-b45a-b015a90044d4', -- Global Field Medical Director
        'Global Field Medical Director',
        v_agent_level_master,
        'You are the Field Medical Operations Master, managing all MSL activities, KOL engagement strategies, regional field medical plans, and HCP education programs. You delegate to expert MSL agents for therapeutic area expertise, regional coordination, and specialized scientific exchanges.',
        'gpt-4o',
        0.7,
        8000
    ) RETURNING id INTO v_master_field_operations;
    
    RAISE NOTICE 'Created Master 5/5: Field Medical Operations Master (ID: %)', v_master_field_operations;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Master Agents Summary:';
    RAISE NOTICE 'Total Created: 5';
    RAISE NOTICE '1. Medical Affairs Strategy Master: %', v_master_medical_affairs;
    RAISE NOTICE '2. Clinical Operations Master: %', v_master_clinical_ops;
    RAISE NOTICE '3. Scientific Communications Master: %', v_master_scientific_comms;
    RAISE NOTICE '4. Evidence & HEOR Strategy Master: %', v_master_evidence_strategy;
    RAISE NOTICE '5. Field Medical Operations Master: %', v_master_field_operations;
    RAISE NOTICE '========================================';
    
END $$;

-- =====================================================
-- Verification Query
-- =====================================================
SELECT 
    'Master Agents Created' as summary,
    COUNT(*) as total_count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'master'
  AND a.deleted_at IS NULL;

-- Detailed view
SELECT 
    a.name,
    a.slug,
    al.name as agent_level,
    al.icon_emoji,
    a.department_name,
    a.role_name,
    a.base_model,
    a.temperature,
    a.max_tokens,
    a.status
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'master'
  AND a.deleted_at IS NULL
ORDER BY a.created_at;

