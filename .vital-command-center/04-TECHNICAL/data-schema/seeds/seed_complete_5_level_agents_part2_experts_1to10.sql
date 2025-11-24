-- =====================================================
-- VITAL AgentOS 3.0: Complete 5-Level Agent Ecosystem
-- Part 2: Expert Agents (Level 2) - Medical Affairs Specialists
-- =====================================================
-- This seed file creates 30 Expert Agents from Medical Affairs JSON
-- All mapped to appropriate departments and roles
-- =====================================================

DO $$
DECLARE
    v_function_id UUID := '06127088-4d52-40aa-88c9-93f4e79e085a';
    v_function_name TEXT := 'Medical Affairs';
    v_tenant_id UUID;
    v_master_field_ops UUID;
    
BEGIN
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    
    -- Get Master Agent ID for Field Medical Operations
    SELECT id INTO v_master_field_ops FROM agents WHERE slug = 'field-medical-operations-master' LIMIT 1;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Creating 30 Expert Agents (Level 2)';
    RAISE NOTICE '========================================';
    
    -- =====================================================
    -- FIELD MEDICAL EXPERTS (4 agents)
    -- =====================================================
    
    -- Expert 1: Medical Science Liaison Advisor
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level, master_agent_id
    ) VALUES (
        'Medical Science Liaison Advisor',
        'medical-science-liaison-advisor',
        'Expert in KOL engagement and scientific exchange',
        'Expert in KOL engagement, scientific exchange, and field medical strategy for optimal healthcare provider education and clinical insights gathering.',
        v_tenant_id,
        v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', -- Field Medical
        'Field Medical',
        'f7547f96-8e01-48ad-9c25-609050bd8f68', -- Global Medical Science Liaison (MSL)
        'Global Medical Science Liaison (MSL)',
        'expert',
        'You are an expert Medical Science Liaison Advisor specializing in KOL engagement and scientific exchange. Provide strategic guidance on field medical activities, HCP education, clinical insights gathering, and compliant scientific discussions.',
        'gpt-4-turbo-preview',
        0.7,
        4000,
        'active',
        'validated',
        2, -- Level 2: Expert
        v_master_field_ops
    );
    
    RAISE NOTICE 'Created Expert 1/30: Medical Science Liaison Advisor';
    
    -- Expert 2: Regional Medical Director
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level, master_agent_id
    ) VALUES (
        'Regional Medical Director',
        'regional-medical-director',
        'Regional medical strategy and MSL team leadership',
        'Senior medical leader managing regional medical affairs strategy, MSL teams, and key stakeholder relationships across geographic territories.',
        v_tenant_id,
        v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', -- Field Medical
        'Field Medical',
        'a26052c2-c972-426b-88f8-135d46cdc556', -- Regional Field Medical Director
        'Regional Field Medical Director',
        'expert',
        'You are a Regional Medical Director responsible for medical strategy and team leadership in your region. Guide MSL activities, develop regional medical plans, and maintain strategic stakeholder relationships.',
        'gpt-4o',
        0.7,
        4000,
        'active',
        'validated',
        2, -- Level 2: Expert
        v_master_field_ops
    );
    
    RAISE NOTICE 'Created Expert 2/30: Regional Medical Director';
    
    -- Expert 3: Therapeutic Area MSL Lead
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level, master_agent_id
    ) VALUES (
        'Therapeutic Area MSL Lead',
        'therapeutic-area-msl-lead',
        'Therapeutic area expertise and MSL training leadership',
        'Specialized MSL leader with deep therapeutic area expertise providing scientific leadership and training to field medical teams.',
        v_tenant_id,
        v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', -- Field Medical
        'Field Medical',
        '2022d999-1167-4a37-a5c2-1acdfb36f2f9', -- Global Senior MSL
        'Global Senior MSL',
        'expert',
        'You are a Therapeutic Area MSL Lead with deep clinical expertise. Provide therapeutic area leadership, train MSL teams, and develop scientific engagement strategies.',
        'gpt-4o',
        0.7,
        4000,
        'active',
        'validated',
        2, -- Level 2: Expert
        v_master_field_ops
    );
    
    RAISE NOTICE 'Created Expert 3/30: Therapeutic Area MSL Lead';
    
    -- Expert 4: Field Medical Trainer
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level, master_agent_id
    ) VALUES (
        'Field Medical Trainer',
        'field-medical-trainer',
        'MSL training and development specialist',
        'Training specialist focused on developing MSL competencies, onboarding new team members, and ensuring field medical excellence.',
        v_tenant_id,
        v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', -- Field Medical
        'Field Medical',
        'ce2bbb1f-e494-4236-8def-b726aff9ceb6', -- Global Field Team Lead
        'Global Field Team Lead',
        'expert',
        'You are a Field Medical Trainer specializing in MSL competency development. Design training programs, conduct onboarding, and ensure field medical teams maintain excellence in scientific engagement and compliance.',
        'gpt-4',
        0.7,
        4000,
        'active',
        'validated',
        2, -- Level 2: Expert
        v_master_field_ops
    );
    
    RAISE NOTICE 'Created Expert 4/30: Field Medical Trainer';
    
    -- =====================================================
    -- MEDICAL INFORMATION EXPERTS (3 agents)
    -- =====================================================
    
    -- Expert 5: Medical Information Specialist
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level
    ) VALUES (
        'Medical Information Specialist',
        'medical-information-specialist',
        'Expert medical inquiry response and information management',
        'Specialist in responding to medical inquiries, managing product information databases, and providing evidence-based answers to healthcare professionals and patients.',
        v_tenant_id,
        v_function_id, v_function_name,
        '2b320eab-1758-42d7-adfa-7f49c12cdf40', -- Medical Information Services
        'Medical Information Services',
        'fd90a29e-5c1f-4796-8779-d63a40ffd5a0', -- Global Medical Information Specialist
        'Global Medical Information Specialist',
        'expert',
        'You are a Medical Information Specialist providing accurate, evidence-based responses to medical inquiries from healthcare professionals and patients. Ensure compliance, document interactions, and maintain up-to-date product knowledge.',
        'gpt-4',
        0.6,
        3000,
        'active',
        'validated',
        2 -- Level 2: Expert
    );
    
    RAISE NOTICE 'Created Expert 5/30: Medical Information Specialist';
    
    -- Expert 6: Medical Information Manager
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level
    ) VALUES (
        'Medical Information Manager',
        'medical-information-manager',
        'Medical information operations and strategy management',
        'Manager overseeing medical information operations, team coordination, and strategic medical inquiry management processes.',
        v_tenant_id,
        v_function_id, v_function_name,
        '2b320eab-1758-42d7-adfa-7f49c12cdf40', -- Medical Information Services
        'Medical Information Services',
        'd2300d04-9ab9-4402-810d-c41281981047', -- Global Medical Information Manager
        'Global Medical Information Manager',
        'expert',
        'You are a Medical Information Manager overseeing medical inquiry operations, team performance, process optimization, and strategic medical information initiatives. Ensure quality, compliance, and efficiency in all medical information activities.',
        'gpt-4o',
        0.7,
        4000,
        'active',
        'validated',
        2 -- Level 2: Expert
    );
    
    RAISE NOTICE 'Created Expert 6/30: Medical Information Manager';
    
    -- Expert 7: Drug Safety Information Specialist
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level
    ) VALUES (
        'Drug Safety Information Specialist',
        'drug-safety-information-specialist',
        'Safety inquiries and adverse event information expert',
        'Specialist focused on drug safety inquiries, adverse event information, and safety-related medical information for healthcare professionals.',
        v_tenant_id,
        v_function_id, v_function_name,
        '2b320eab-1758-42d7-adfa-7f49c12cdf40', -- Medical Information Services
        'Medical Information Services',
        '4674cdd3-f12c-4b69-9f10-e8edd5138d14', -- Global Medical Info Scientist
        'Global Medical Info Scientist',
        'expert',
        'You are a Drug Safety Information Specialist providing expert guidance on safety inquiries, adverse event information, and safety-related medical questions. Ensure accurate communication of safety data and compliance with pharmacovigilance requirements.',
        'gpt-4',
        0.6,
        3000,
        'active',
        'validated',
        2 -- Level 2: Expert
    );
    
    RAISE NOTICE 'Created Expert 7/30: Drug Safety Information Specialist';
    
    -- =====================================================
    -- MEDICAL COMMUNICATIONS & WRITING EXPERTS (7 agents)
    -- =====================================================
    
    -- Expert 8: Medical Writer
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level
    ) VALUES (
        'Medical Writer',
        'medical-writer',
        'Scientific manuscript and document creation specialist',
        'Expert medical writer specializing in scientific manuscripts, regulatory documents, and clinical study reports with precision and compliance.',
        v_tenant_id,
        v_function_id, v_function_name,
        '9871d82a-631a-4cf7-9a00-1ab838a45c3e', -- Scientific Communications
        'Scientific Communications',
        'bd65ecaf-dfb5-4cc3-bec3-754e0c90dc3d', -- Global Medical Writer
        'Global Medical Writer',
        'expert',
        'You are an expert Medical Writer creating high-quality scientific manuscripts, regulatory documents, and clinical study reports. Ensure accuracy, clarity, compliance with guidelines, and effective communication of complex scientific data.',
        'gpt-4',
        0.6,
        6000,
        'active',
        'validated',
        2 -- Level 2: Expert
    );
    
    RAISE NOTICE 'Created Expert 8/30: Medical Writer';
    
    -- Expert 9: Publication Strategist
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level
    ) VALUES (
        'Publication Strategist',
        'publication-strategist',
        'Strategic publication planning and execution expert',
        'Strategist developing and executing publication plans, managing author relationships, and optimizing scientific communication impact.',
        v_tenant_id,
        v_function_id, v_function_name,
        '5d5ded20-c30a-48f1-844c-fc9f80fcaacb', -- Publications
        'Publications',
        '6ae3bc1f-e88e-4f78-a2f8-657bcfeedf1d', -- Global Publications Lead
        'Global Publications Lead',
        'expert',
        'You are a Publication Strategist developing comprehensive publication plans, managing author collaborations, selecting optimal journals, and maximizing the impact of scientific communications while ensuring compliance and transparency.',
        'gpt-4o',
        0.7,
        4000,
        'active',
        'validated',
        2 -- Level 2: Expert
    );
    
    RAISE NOTICE 'Created Expert 9/30: Publication Strategist';
    
    -- Expert 10: Regulatory Medical Writer
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id,
        function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        expertise_level, system_prompt,
        base_model, temperature, max_tokens,
        status, validation_status,
        agent_level
    ) VALUES (
        'Regulatory Medical Writer',
        'regulatory-medical-writer',
        'Regulatory submission document specialist',
        'Specialist in creating regulatory submission documents, Clinical Study Reports, and health authority correspondence with meticulous attention to regulatory requirements.',
        v_tenant_id,
        v_function_id, v_function_name,
        '9871d82a-631a-4cf7-9a00-1ab838a45c3e', -- Scientific Communications
        'Scientific Communications',
        '1ee591f8-81ed-40a6-b961-e5eebb58a8eb', -- Global Scientific Communications Manager
        'Global Scientific Communications Manager',
        'expert',
        'You are a Regulatory Medical Writer specializing in regulatory submission documents, Clinical Study Reports, and health authority communications. Ensure compliance with ICH-GCP, regional regulatory requirements, and maintain the highest standards of documentation quality.',
        'gpt-4',
        0.5,
        8000,
        'active',
        'validated',
        2 -- Level 2: Expert
    );
    
    RAISE NOTICE 'Created Expert 10/30: Regulatory Medical Writer';
    
    -- Continue with remaining experts in next message...
    
END $$;

-- =====================================================
-- Verification Query
-- =====================================================
SELECT 
    'Expert Agents Created (Part 1)' as summary,
    COUNT(*) as total_count
FROM agents
WHERE agent_level = 2
  AND deleted_at IS NULL;

