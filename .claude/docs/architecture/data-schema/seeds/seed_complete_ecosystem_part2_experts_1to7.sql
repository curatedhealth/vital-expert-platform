-- =====================================================
-- COMPLETE AGENT ECOSYSTEM - PART 2: EXPERT AGENTS (35)
-- =====================================================
-- Run AFTER seed_complete_ecosystem_part1_masters.sql
-- Creates 35 Expert Agents (Level 2) with complete org mapping
-- Includes: function_id, function_name, department_id, department_name, role_id, role_name, master_agent_id
-- =====================================================

\set ON_ERROR_STOP on

DO $$ 
DECLARE
    v_count INTEGER := 5; -- Starting after 5 masters
    v_expert_count INTEGER := 0;
    
    -- Core IDs
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
    
    -- Master Agents
    v_master_medical_affairs UUID;
    v_master_clinical UUID;
    v_master_evidence UUID;
    v_master_communications UUID;
    v_master_operations UUID;
    
    -- Role IDs (will attempt to find, allow NULL if not exist)
    v_role_id UUID;
    v_role_name TEXT;
    
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE '         LEVEL 2: EXPERT AGENTS (35)';
    RAISE NOTICE '================================================================';
    RAISE NOTICE '';
    
    -- Get core IDs
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals';
    SELECT id INTO v_pharma_function_id FROM functions WHERE slug = 'medical-affairs';
    
    -- Get departments
    SELECT id INTO v_dept_field_medical FROM departments WHERE slug = 'field-medical';
    SELECT id INTO v_dept_med_info FROM departments WHERE slug = 'medical-information';
    SELECT id INTO v_dept_med_comm FROM departments WHERE slug = 'medical-communications-writing';
    SELECT id INTO v_dept_evidence_heor FROM departments WHERE slug = 'evidence-generation-heor';
    SELECT id INTO v_dept_clinical_ops FROM departments WHERE slug = 'clinical-operations-support';
    SELECT id INTO v_dept_excellence_gov FROM departments WHERE slug = 'medical-excellence-governance';
    SELECT id INTO v_dept_strategy_ops FROM departments WHERE slug = 'medical-strategy-operations';
    
    -- Get masters
    SELECT id INTO v_master_medical_affairs FROM agents WHERE slug = 'master-medical-affairs-orchestrator';
    SELECT id INTO v_master_clinical FROM agents WHERE slug = 'master-clinical-excellence-orchestrator';
    SELECT id INTO v_master_evidence FROM agents WHERE slug = 'master-evidence-generation-orchestrator';
    SELECT id INTO v_master_communications FROM agents WHERE slug = 'master-medical-communications-orchestrator';
    SELECT id INTO v_master_operations FROM agents WHERE slug = 'master-medical-strategy-operations-orchestrator';
    
    RAISE NOTICE '[STEP 3] Creating Expert Agents (Level 2)...';
    RAISE NOTICE '---------------------------------------------------------------';
    
    -- =====================================================
    -- FIELD MEDICAL DEPARTMENT (4 experts)
    -- =====================================================
    
    -- Expert 1: Medical Science Liaison Advisor
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE (name ILIKE '%medical science liaison%' OR name ILIKE '%MSL%' OR slug ILIKE '%msl%')
      AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Science Liaison Advisor', 'medical-science-liaison-advisor',
        'Expert in KOL engagement and scientific exchange',
        'Expert in KOL engagement, scientific exchange, and field medical strategy for optimal healthcare provider education and clinical insights gathering.',
        'Expert Agent - MSL Advisory',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_field_medical, 'Field Medical',
        v_role_id, v_role_name,
        v_master_medical_affairs, 'Master Medical Affairs Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are an expert Medical Science Liaison Advisor specializing in KOL engagement and scientific exchange. Provide strategic guidance on field medical activities, HCP education, clinical insights gathering, and compliant scientific discussions.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true, "self_critique": true}'::jsonb,
        true, ARRAY['kol-engagement', 'scientific-exchange', 'hcp-education', 'clinical-insights', 'advisory-boards'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 1: Medical Science Liaison Advisor (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- Expert 2: Regional Medical Director
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE (name ILIKE '%regional%medical%director%' OR name ILIKE '%field medical%director%')
      AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Regional Medical Director', 'regional-medical-director',
        'Senior medical leader managing regional strategies',
        'Senior medical leader managing regional medical affairs strategy, MSL teams, and key stakeholder relationships across geographic territories.',
        'Expert Agent - Regional Medical Leadership',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_field_medical, 'Field Medical',
        v_role_id, v_role_name,
        v_master_medical_affairs, 'Master Medical Affairs Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are a Regional Medical Director responsible for medical strategy and team leadership in your region. Guide MSL activities, develop regional medical plans, and maintain strategic stakeholder relationships.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb,
        true, ARRAY['regional-strategy', 'team-management', 'kol-relations', 'healthcare-partnerships'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 2: Regional Medical Director (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- Expert 3: Therapeutic Area MSL Lead
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE (name ILIKE '%therapeutic area%' OR name ILIKE '%TA%lead%')
      AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Therapeutic Area MSL Lead', 'therapeutic-area-msl-lead',
        'Specialized MSL leader with deep TA expertise',
        'Specialized MSL leader with deep therapeutic area expertise providing scientific leadership and training to field medical teams.',
        'Expert Agent - Therapeutic Area Leadership',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_field_medical, 'Field Medical',
        v_role_id, v_role_name,
        v_master_medical_affairs, 'Master Medical Affairs Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are a Therapeutic Area MSL Lead with deep clinical expertise. Provide therapeutic area leadership, train MSL teams, and develop scientific engagement strategies.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb,
        true, ARRAY['therapeutic-area-expertise', 'scientific-leadership', 'msl-training', 'clinical-trials'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 3: Therapeutic Area MSL Lead (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- Expert 4: Field Medical Trainer
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE (name ILIKE '%trainer%' OR name ILIKE '%training%specialist%')
      AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Field Medical Trainer', 'field-medical-trainer',
        'Training specialist focused on MSL development',
        'Training specialist focused on developing MSL competencies, onboarding new team members, and ensuring field medical excellence.',
        'Expert Agent - Field Medical Training',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_field_medical, 'Field Medical',
        v_role_id, v_role_name,
        v_master_medical_affairs, 'Master Medical Affairs Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are a Field Medical Trainer responsible for MSL education and development. Design training programs, assess competencies, and ensure field medical teams have the knowledge and skills for success.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb,
        true, ARRAY['training-development', 'competency-assessment', 'onboarding', 'coaching'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 4: Field Medical Trainer (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- =====================================================
    -- MEDICAL INFORMATION DEPARTMENT (3 experts)
    -- =====================================================
    
    -- Expert 5: Medical Information Specialist
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE name ILIKE '%medical information%specialist%' AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Information Specialist', 'medical-information-specialist',
        'Expert in responding to medical inquiries',
        'Expert in responding to medical inquiries from healthcare providers with accurate, balanced, and compliant medical information.',
        'Expert Agent - Medical Information',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_med_info, 'Medical Information',
        v_role_id, v_role_name,
        v_master_operations, 'Master Medical Strategy & Operations Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are a Medical Information Specialist providing accurate, balanced, and evidence-based responses to medical inquiries. Ensure all responses are compliant with FDA regulations and include appropriate safety information.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb,
        true, ARRAY['medical-inquiries', 'literature-search', 'adverse-events', 'fda-compliance'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 5: Medical Information Specialist (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- Expert 6: Medical Librarian
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE (name ILIKE '%librarian%' OR name ILIKE '%information scientist%') AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Librarian', 'medical-librarian',
        'Information scientist managing medical literature',
        'Information scientist managing medical literature surveillance, database resources, and research support for medical affairs teams.',
        'Expert Agent - Medical Library Services',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_med_info, 'Medical Information',
        v_role_id, v_role_name,
        v_master_operations, 'Master Medical Strategy & Operations Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are a Medical Librarian providing expert literature search and information management services. Support medical affairs with comprehensive literature surveillance, database management, and research assistance.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb,
        true, ARRAY['literature-search', 'database-management', 'reference-management', 'research-support'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 6: Medical Librarian (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- Expert 7: Medical Content Manager
    SELECT id, name INTO v_role_id, v_role_name FROM roles 
    WHERE name ILIKE '%content%manager%' AND deleted_at IS NULL LIMIT 1;
    
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        role_id, role_name, master_agent_id, master_agent_name,
        expertise_level, agent_level, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Content Manager', 'medical-content-manager',
        'Digital content strategist for medical information',
        'Digital content strategist managing medical information assets, knowledge management systems, and content governance.',
        'Expert Agent - Medical Content Strategy',
        v_pharma_function_id, 'Medical Affairs',
        v_dept_med_info, 'Medical Information',
        v_role_id, v_role_name,
        v_master_operations, 'Master Medical Strategy & Operations Orchestrator',
        'expert', 'expert', 'pharmaceuticals',
        'You are a Medical Content Manager responsible for medical information assets and digital content strategy. Manage content governance, digital platforms, and knowledge management systems.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb,
        true, ARRAY['content-strategy', 'digital-assets', 'knowledge-management', 'governance'],
        'development'
    );
    v_count := v_count + 1; v_expert_count := v_expert_count + 1;
    RAISE NOTICE '  ✓ [%/133] Expert 7: Medical Content Manager (Role: %)', v_count, COALESCE(v_role_name, 'NULL');
    
    -- Due to length, continuing in next part...
    RAISE NOTICE '';
    RAISE NOTICE '  Progress: % experts created so far', v_expert_count;
    RAISE NOTICE '  Continuing with remaining 28 experts in part 3...';
    
END $$;

