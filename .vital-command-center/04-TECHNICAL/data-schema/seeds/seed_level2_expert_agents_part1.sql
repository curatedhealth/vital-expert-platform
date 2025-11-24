-- =====================================================
-- VITAL AgentOS 3.0: Level 2 Expert Agents (Senior Roles)
-- =====================================================
-- Creates ~45 Expert Agents - Senior roles within each department
-- These report to their respective Department Head (Master Agents)
-- =====================================================

DO $$
DECLARE
    v_function_id UUID := '06127088-4d52-40aa-88c9-93f4e79e085a';
    v_function_name TEXT := 'Medical Affairs';
    v_tenant_id UUID;
    v_agent_level_expert UUID;
    v_master_clinical_ops UUID;
    v_master_field_medical UUID;
    v_master_heor UUID;
    v_master_education UUID;
    v_master_excellence UUID;
    v_master_med_info UUID;
    v_master_leadership UUID;
    v_master_publications UUID;
    v_master_sci_comms UUID;
    v_expert_count INTEGER := 0;
    
BEGIN
    -- Get tenant and agent level IDs
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    SELECT id INTO v_agent_level_expert FROM agent_levels WHERE slug = 'expert' LIMIT 1;
    
    -- Get Master Agent IDs
    SELECT id INTO v_master_clinical_ops FROM agents WHERE slug = 'clinical-operations-support-master' LIMIT 1;
    SELECT id INTO v_master_field_medical FROM agents WHERE slug = 'field-medical-master' LIMIT 1;
    SELECT id INTO v_master_heor FROM agents WHERE slug = 'heor-evidence-master' LIMIT 1;
    SELECT id INTO v_master_education FROM agents WHERE slug = 'medical-education-master' LIMIT 1;
    SELECT id INTO v_master_excellence FROM agents WHERE slug = 'medical-excellence-compliance-master' LIMIT 1;
    SELECT id INTO v_master_med_info FROM agents WHERE slug = 'medical-information-services-master' LIMIT 1;
    SELECT id INTO v_master_leadership FROM agents WHERE slug = 'medical-leadership-master' LIMIT 1;
    SELECT id INTO v_master_publications FROM agents WHERE slug = 'publications-master' LIMIT 1;
    SELECT id INTO v_master_sci_comms FROM agents WHERE slug = 'scientific-communications-master' LIMIT 1;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Creating Level 2 Expert Agents (Senior Roles)';
    RAISE NOTICE 'Agent Level ID (Expert): %', v_agent_level_expert;
    RAISE NOTICE '========================================';
    
    -- =====================================================
    -- CLINICAL OPERATIONS SUPPORT EXPERTS (3)
    -- =====================================================
    
    -- Expert 1: Global Clinical Operations Liaison
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Global Clinical Operations Liaison',
        'global-clinical-operations-liaison-expert',
        'Senior global clinical operations coordination',
        'Senior expert managing global clinical trial support, cross-regional coordination, and operational excellence across all clinical operations activities.',
        v_tenant_id, v_function_id, v_function_name,
        'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support',
        '3b5eec9c-2465-4ec6-8e55-728e94cc4276', 'Global Clinical Operations Liaison',
        v_agent_level_expert,
        'You are a Global Clinical Operations Liaison, a senior expert in clinical trial coordination and site management. You handle complex multi-regional clinical operations, coordinate with investigators, and ensure operational excellence. Delegate to specialists for protocol-specific or data quality tasks.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 2: Regional Clinical Operations Liaison
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Regional Clinical Operations Liaison',
        'regional-clinical-operations-liaison-expert',
        'Senior regional clinical operations management',
        'Senior expert managing regional clinical trial operations, site relationships, and cross-functional coordination within specific geographic regions.',
        v_tenant_id, v_function_id, v_function_name,
        'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support',
        'becc3adc-2fd8-4a1a-bd0b-a0f3d6e43401', 'Regional Clinical Operations Liaison',
        v_agent_level_expert,
        'You are a Regional Clinical Operations Liaison, managing clinical trial operations within your region. You coordinate site activities, manage regional investigators, and ensure compliance with regional regulations. Delegate to local specialists for site-specific activities.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 3: Global Medical Liaison Clinical Trials
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Global Medical Liaison Clinical Trials',
        'global-medical-liaison-clinical-trials-expert',
        'Senior clinical trial medical expertise',
        'Senior medical expert providing clinical trial support, medical monitoring, and scientific liaison activities across global clinical development programs.',
        v_tenant_id, v_function_id, v_function_name,
        'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support',
        '8732df39-4ae7-4705-94c4-e767df47095e', 'Global Medical Liaison Clinical Trials',
        v_agent_level_expert,
        'You are a Global Medical Liaison for Clinical Trials, providing senior medical expertise for clinical development. You support protocol design, medical monitoring, and investigator relationships. Delegate to specialists for therapeutic area-specific or data analysis tasks.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    RAISE NOTICE 'Created % Clinical Operations Support Experts', 3;
    
    -- =====================================================
    -- FIELD MEDICAL EXPERTS (6)
    -- =====================================================
    
    -- Expert 4: Global Field Medical Director
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Global Field Medical Director',
        'global-field-medical-director-expert',
        'Senior global MSL strategy and team leadership',
        'Director-level expert leading global MSL strategy, KOL engagement programs, and cross-regional field medical excellence initiatives.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        '2b4a64b9-7e2e-4a5f-b45a-b015a90044d4', 'Global Field Medical Director',
        v_agent_level_expert,
        'You are a Global Field Medical Director, leading MSL strategy and operations worldwide. You develop KOL engagement strategies, coordinate regional teams, and drive scientific exchange excellence. Delegate to Senior MSLs and regional leads for execution.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 5: Regional Field Medical Director
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Regional Field Medical Director',
        'regional-field-medical-director-expert',
        'Senior regional MSL leadership',
        'Director-level expert managing regional MSL teams, regional KOL relationships, and field medical activities within specific geographic areas.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        'a26052c2-c972-426b-88f8-135d46cdc556', 'Regional Field Medical Director',
        v_agent_level_expert,
        'You are a Regional Field Medical Director, leading MSL operations in your region. You manage regional MSL teams, develop regional KOL strategies, and coordinate with local healthcare systems. Delegate to MSL Team Leads and Senior MSLs.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 6: Global Senior MSL
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Global Senior MSL',
        'global-senior-msl-expert',
        'Senior MSL with therapeutic area expertise',
        'Senior MSL expert with deep therapeutic area knowledge, leading scientific exchanges, training MSL teams, and managing key global KOL relationships.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        '2022d999-1167-4a37-a5c2-1acdfb36f2f9', 'Global Senior MSL',
        v_agent_level_expert,
        'You are a Global Senior MSL with deep therapeutic area expertise. You lead complex scientific discussions with global KOLs, train MSL teams, and support advisory boards. Delegate to regional MSLs for local execution.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 7: Regional Senior MSL
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Regional Senior MSL',
        'regional-senior-msl-expert',
        'Senior regional MSL with TA expertise',
        'Senior MSL expert managing regional KOL relationships, regional scientific exchanges, and therapeutic area leadership within specific regions.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        'cb761a26-127b-4083-a590-d731161a23f4', 'Regional Senior MSL',
        v_agent_level_expert,
        'You are a Regional Senior MSL, leading scientific engagement in your region. You manage key regional KOLs, conduct complex scientific exchanges, and mentor regional MSL teams. Delegate to local MSLs for territory-specific activities.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 8: Global Field Team Lead
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Global Field Team Lead',
        'global-field-team-lead-expert',
        'Senior team leadership and coordination',
        'Senior leader coordinating global field medical teams, managing cross-regional initiatives, and ensuring field medical excellence standards.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        'ce2bbb1f-e494-4236-8def-b726aff9ceb6', 'Global Field Team Lead',
        v_agent_level_expert,
        'You are a Global Field Team Lead, coordinating field medical teams worldwide. You ensure team alignment, manage cross-regional projects, and drive operational excellence. Delegate to regional team leads for local team management.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    -- Expert 9: Global Medical Scientific Manager
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Global Medical Scientific Manager',
        'global-medical-scientific-manager-expert',
        'Senior scientific content and strategy management',
        'Senior manager overseeing scientific content development, medical strategies, and scientific communication excellence across global field medical operations.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        'c72c1ff5-1a9a-42d6-9c5d-925bfccc7967', 'Global Medical Scientific Manager',
        v_agent_level_expert,
        'You are a Global Medical Scientific Manager, managing scientific content and strategies for field medical. You oversee scientific platform development, training materials, and ensure scientific rigor. Delegate to content specialists for material creation.',
        'gpt-4o', 0.7, 6000
    );
    v_expert_count := v_expert_count + 1;
    
    RAISE NOTICE 'Created % Field Medical Experts', 6;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Expert Agents Created So Far: %', v_expert_count;
    RAISE NOTICE 'Continuing with remaining departments...';
    RAISE NOTICE '========================================';
    
END $$;

-- =====================================================
-- Verification Query
-- =====================================================
SELECT 
    'Expert Agents Created (Part 1)' as summary,
    COUNT(*) as total_count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'expert'
  AND a.deleted_at IS NULL;

-- Detailed view
SELECT 
    a.name,
    a.slug,
    a.department_name,
    a.role_name
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'expert'
  AND a.deleted_at IS NULL
ORDER BY a.department_name, a.name;

