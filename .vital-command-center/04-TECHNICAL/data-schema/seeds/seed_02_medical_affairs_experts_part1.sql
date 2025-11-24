-- =====================================================
-- SEED 02: Expert Agents (Level 2) - 35 Medical Affairs Experts
-- =====================================================
-- Creates 35 Expert Agents from MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json
-- Plus 5 additional analytics experts already seeded
-- Maps each to appropriate Master Agent
-- =====================================================

DO $$ 
DECLARE
    v_tenant_id UUID;
    v_pharma_function_id UUID;
    
    -- Department IDs
    v_dept_field_medical UUID;
    v_dept_med_info UUID;
    v_dept_med_comm UUID;
    v_dept_evidence_heor UUID;
    v_dept_clinical_ops UUID;
    v_dept_excellence_gov UUID;
    v_dept_strategy_ops UUID;
    
    -- Master Agent IDs
    v_master_medical_affairs UUID;
    v_master_clinical UUID;
    v_master_evidence UUID;
    v_master_communications UUID;
    v_master_operations UUID;
    
    -- Expert Agent IDs (will be populated as we create them)
    v_expert_id UUID;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Creating 35 Expert Agents (Level 2)';
    RAISE NOTICE '==================================================';
    
    -- Get tenant and function
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    SELECT id INTO v_pharma_function_id FROM functions WHERE name = 'Medical Affairs' LIMIT 1;
    
    -- Get Master Agent IDs
    SELECT id INTO v_master_medical_affairs FROM agents WHERE slug = 'master-medical-affairs-orchestrator';
    SELECT id INTO v_master_clinical FROM agents WHERE slug = 'master-clinical-excellence-orchestrator';
    SELECT id INTO v_master_evidence FROM agents WHERE slug = 'master-evidence-generation-orchestrator';
    SELECT id INTO v_master_communications FROM agents WHERE slug = 'master-medical-communications-orchestrator';
    SELECT id INTO v_master_operations FROM agents WHERE slug = 'master-medical-strategy-operations-orchestrator';
    
    -- Get Department IDs (create if not exist)
    INSERT INTO departments (name, slug, description) VALUES ('Field Medical', 'field-medical', 'Field medical and MSL activities')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_field_medical;
    
    INSERT INTO departments (name, slug, description) VALUES ('Medical Information', 'medical-information', 'Medical information and inquiry response')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_med_info;
    
    INSERT INTO departments (name, slug, description) VALUES ('Medical Communications & Writing', 'medical-communications-writing', 'Publications, writing, and medical education')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_med_comm;
    
    INSERT INTO departments (name, slug, description) VALUES ('Evidence Generation & HEOR', 'evidence-generation-heor', 'Real-world evidence and health economics')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_evidence_heor;
    
    INSERT INTO departments (name, slug, description) VALUES ('Clinical Operations Support', 'clinical-operations-support', 'Clinical trial support and operations')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_clinical_ops;
    
    INSERT INTO departments (name, slug, description) VALUES ('Medical Excellence & Governance', 'medical-excellence-governance', 'Quality, governance, and excellence')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_excellence_gov;
    
    INSERT INTO departments (name, slug, description) VALUES ('Medical Strategy & Operations', 'medical-strategy-operations', 'Strategy, planning, and operations')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_dept_strategy_ops;
    
    RAISE NOTICE 'Departments prepared. Creating Expert Agents...';
    RAISE NOTICE '';
    
    -- =====================================================
    -- FIELD MEDICAL DEPARTMENT (4 agents)
    -- =====================================================
    
    -- Expert 1: Medical Science Liaison Advisor
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Science Liaison Advisor', 'medical-science-liaison-advisor',
        'Expert in KOL engagement and scientific exchange',
        'Expert in KOL engagement, scientific exchange, and field medical strategy for optimal healthcare provider education and clinical insights gathering.',
        'Expert Agent - MSL Advisory',
        v_pharma_function_id, 'Medical Affairs', v_dept_field_medical, 'Field Medical',
        'expert', 'expert', v_master_medical_affairs, 'pharmaceuticals',
        'You are an expert Medical Science Liaison Advisor specializing in KOL engagement and scientific exchange. Provide strategic guidance on field medical activities, HCP education, clinical insights gathering, and compliant scientific discussions.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['kol-engagement', 'scientific-exchange', 'hcp-education', 'clinical-insights', 'advisory-boards'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Science Liaison Advisor', v_count;
    
    -- Expert 2: Regional Medical Director
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Regional Medical Director', 'regional-medical-director',
        'Senior medical leader managing regional strategies',
        'Senior medical leader managing regional medical affairs strategy, MSL teams, and key stakeholder relationships across geographic territories.',
        'Expert Agent - Regional Medical Leadership',
        v_pharma_function_id, 'Medical Affairs', v_dept_field_medical, 'Field Medical',
        'expert', 'expert', v_master_medical_affairs, 'pharmaceuticals',
        'You are a Regional Medical Director responsible for medical strategy and team leadership in your region. Guide MSL activities, develop regional medical plans, and maintain strategic stakeholder relationships.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['regional-strategy', 'team-management', 'kol-relations', 'healthcare-partnerships'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Regional Medical Director', v_count;
    
    -- Expert 3: Therapeutic Area MSL Lead
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Therapeutic Area MSL Lead', 'therapeutic-area-msl-lead',
        'Specialized MSL leader with deep therapeutic area expertise',
        'Specialized MSL leader with deep therapeutic area expertise providing scientific leadership and training to field medical teams.',
        'Expert Agent - Therapeutic Area Leadership',
        v_pharma_function_id, 'Medical Affairs', v_dept_field_medical, 'Field Medical',
        'expert', 'expert', v_master_medical_affairs, 'pharmaceuticals',
        'You are a Therapeutic Area MSL Lead with deep clinical expertise. Provide therapeutic area leadership, train MSL teams, and develop scientific engagement strategies.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['therapeutic-area-expertise', 'scientific-leadership', 'msl-training', 'clinical-trials'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Therapeutic Area MSL Lead', v_count;
    
    -- Expert 4: Field Medical Trainer
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Field Medical Trainer', 'field-medical-trainer',
        'Training specialist focused on MSL development',
        'Training specialist focused on developing MSL competencies, onboarding new team members, and ensuring field medical excellence.',
        'Expert Agent - Field Medical Training',
        v_pharma_function_id, 'Medical Affairs', v_dept_field_medical, 'Field Medical',
        'expert', 'expert', v_master_medical_affairs, 'pharmaceuticals',
        'You are a Field Medical Trainer responsible for MSL education and development. Design training programs, assess competencies, and ensure field medical teams have the knowledge and skills for success.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['training-development', 'competency-assessment', 'onboarding', 'coaching'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Field Medical Trainer', v_count;
    
    -- =====================================================
    -- MEDICAL INFORMATION DEPARTMENT (3 agents)
    -- =====================================================
    
    -- Expert 5: Medical Information Specialist
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Information Specialist', 'medical-information-specialist',
        'Expert in responding to medical inquiries',
        'Expert in responding to medical inquiries from healthcare providers with accurate, balanced, and compliant medical information.',
        'Expert Agent - Medical Information',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_info, 'Medical Information',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Information Specialist providing accurate, balanced, and evidence-based responses to medical inquiries. Ensure all responses are compliant with FDA regulations and include appropriate safety information.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['medical-inquiries', 'literature-search', 'adverse-events', 'fda-compliance'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Information Specialist', v_count;
    
    -- Expert 6: Medical Librarian
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Librarian', 'medical-librarian',
        'Information scientist managing medical literature',
        'Information scientist managing medical literature surveillance, database resources, and research support for medical affairs teams.',
        'Expert Agent - Medical Library Services',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_info, 'Medical Information',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Librarian providing expert literature search and information management services. Support medical affairs with comprehensive literature surveillance, database management, and research assistance.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['literature-search', 'database-management', 'reference-management', 'research-support'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Librarian', v_count;
    
    -- Expert 7: Medical Content Manager
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Content Manager', 'medical-content-manager',
        'Digital content strategist for medical information',
        'Digital content strategist managing medical information assets, knowledge management systems, and content governance.',
        'Expert Agent - Medical Content Strategy',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_info, 'Medical Information',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Content Manager responsible for medical information assets and digital content strategy. Manage content governance, digital platforms, and knowledge management systems.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['content-strategy', 'digital-assets', 'knowledge-management', 'governance'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Content Manager', v_count;
    
    -- =====================================================
    -- MEDICAL COMMUNICATIONS & WRITING DEPARTMENT (7 agents)
    -- =====================================================
    
    -- Expert 8: Publication Strategy Lead
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Publication Strategy Lead', 'publication-strategy-lead',
        'Strategic expert in scientific publication planning',
        'Strategic expert in scientific publication planning, author engagement, and ensuring timely dissemination of clinical research findings.',
        'Expert Agent - Publication Strategy',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Publication Strategy Lead specializing in scientific publication planning and execution. Guide publication strategy, author engagement, journal selection, and ensure compliance with ICMJE and GPP guidelines.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['publication-planning', 'author-engagement', 'journal-selection', 'gpp-compliance'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Publication Strategy Lead', v_count;
    
    -- Expert 9: Medical Education Director
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Education Director', 'medical-education-director',
        'Leader in developing CME programs',
        'Leader in developing and implementing continuing medical education programs that advance clinical knowledge and improve patient care.',
        'Expert Agent - Medical Education',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Medical Education Director responsible for developing accredited CME programs. Design educational curricula, manage faculty relationships, ensure ACCME compliance, and measure educational outcomes.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['cme-programs', 'accreditation', 'faculty-management', 'educational-outcomes'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Education Director', v_count;
    
    -- Expert 10: Medical Writer - Scientific
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Writer - Scientific', 'medical-writer-scientific',
        'Expert medical writer for scientific publications',
        'Expert medical writer specializing in scientific manuscripts, abstracts, posters, and peer-reviewed publications.',
        'Expert Agent - Scientific Writing',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Senior Medical Writer specializing in scientific publications. Create high-quality manuscripts, abstracts, and posters while ensuring scientific accuracy and compliance with publication guidelines.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['manuscript-writing', 'abstracts', 'posters', 'data-interpretation', 'icmje-gpp-compliance'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Writer - Scientific', v_count;
    
    -- Expert 11: Medical Writer - Regulatory
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Writer - Regulatory', 'medical-writer-regulatory',
        'Specialized medical writer for regulatory documents',
        'Specialized medical writer creating regulatory documents including clinical study reports, protocols, and investigator brochures.',
        'Expert Agent - Regulatory Writing',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Regulatory Medical Writer creating critical regulatory documents. Develop CSRs, protocols, IBs, and other regulatory submissions with precision and compliance to regulatory standards.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['regulatory-writing', 'clinical-study-reports', 'protocols', 'ich-guidelines'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Writer - Regulatory', v_count;
    
    -- Expert 12: Medical Communications Manager
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Communications Manager', 'medical-communications-manager',
        'Expert in developing medical communication strategies',
        'Expert in developing and executing medical communication strategies for internal and external stakeholders.',
        'Expert Agent - Medical Communications',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Medical Communications Manager responsible for strategic medical content development. Create compelling medical narratives, manage congress activities, and ensure message consistency.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['communication-strategy', 'congress-planning', 'vendor-management', 'stakeholder-alignment'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Communications Manager', v_count;
    
    -- Expert 13: Medical Editor
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Editor', 'medical-editor',
        'Senior editor ensuring quality and accuracy',
        'Senior editor ensuring quality, accuracy, and consistency of all medical content and publications.',
        'Expert Agent - Medical Editing',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Senior Medical Editor responsible for editorial excellence. Review and edit medical content for accuracy, clarity, consistency, and compliance with style guidelines.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['editing', 'quality-control', 'fact-checking', 'style-guide-management'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Medical Editor', v_count;
    
    -- Expert 14: Congress & Events Manager
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title,
        function_id, function_name, department_id, department_name,
        expertise_level, agent_level, master_agent_id, industry_vertical,
        system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Congress & Events Manager', 'congress-events-manager',
        'Event specialist managing medical congresses',
        'Event specialist managing medical congress participation, symposia, and scientific meetings.',
        'Expert Agent - Congress & Events',
        v_pharma_function_id, 'Medical Affairs', v_dept_med_comm, 'Medical Communications & Writing',
        'expert', 'expert', v_master_communications, 'pharmaceuticals',
        'You are a Congress & Events Manager coordinating medical congress participation and scientific meetings. Manage event logistics, vendor relationships, and ensure successful medical event execution.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['congress-planning', 'event-coordination', 'vendor-management', 'logistics'],
        'development'
    ) RETURNING id INTO v_expert_id;
    v_count := v_count + 1;
    RAISE NOTICE '✓ [%/35] Created: Congress & Events Manager', v_count;
    
    -- =====================================================
    -- Continue in next comment due to length...
    -- =====================================================
    
END $$;

