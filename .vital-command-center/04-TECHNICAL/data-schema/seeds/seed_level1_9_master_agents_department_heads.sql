-- =====================================================
-- VITAL AgentOS 3.0: Level 1 Master Agents (Department Heads)
-- =====================================================
-- Creates 9 Master Agents - One per Medical Affairs Department
-- Each Master Agent is a department head with strategic oversight
-- =====================================================

DO $$
DECLARE
    v_function_id UUID := '06127088-4d52-40aa-88c9-93f4e79e085a';
    v_function_name TEXT := 'Medical Affairs';
    v_tenant_id UUID;
    v_agent_level_master UUID;
    
    -- Master Agent IDs (9 department heads)
    v_master_clinical_ops UUID;
    v_master_field_medical UUID;
    v_master_heor UUID;
    v_master_education UUID;
    v_master_excellence UUID;
    v_master_med_info UUID;
    v_master_leadership UUID;
    v_master_publications UUID;
    v_master_sci_comms UUID;
    
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
    RAISE NOTICE 'Creating 9 Master Agents (Department Heads)';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Agent Level ID (Master): %', v_agent_level_master;
    RAISE NOTICE '========================================';
    
    -- =====================================================
    -- LEVEL 1: MASTER AGENTS (9 Department Heads)
    -- =====================================================
    
    -- MASTER 1: Clinical Operations Support Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Clinical Operations Support Master',
        'clinical-operations-support-master',
        'Strategic oversight for clinical operations and trial support',
        'Department head managing all clinical operations support activities including trial coordination, site management, protocol design, data quality, and patient safety. Delegates to senior liaisons and specialists for execution.',
        v_tenant_id, v_function_id, v_function_name,
        'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support',
        '3b5eec9c-2465-4ec6-8e55-728e94cc4276', 'Global Clinical Operations Liaison',
        v_agent_level_master,
        'You are the Clinical Operations Support Master, head of the Clinical Operations Support department. You provide strategic oversight for all clinical trial support, site coordination, protocol optimization, and operational excellence. Delegate to your team of Clinical Operations Liaisons and Medical Liaisons for specialized clinical activities.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_clinical_ops;
    RAISE NOTICE 'Created Master 1/9: Clinical Operations Support Master (ID: %)', v_master_clinical_ops;
    
    -- MASTER 2: Field Medical Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Field Medical Master',
        'field-medical-master',
        'Strategic leadership for MSL operations and KOL engagement',
        'Department head overseeing all field medical activities including MSL teams, KOL engagement strategies, regional coordination, HCP education programs, and scientific exchange. Delegates to Field Medical Directors and Senior MSLs.',
        v_tenant_id, v_function_id, v_function_name,
        'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical',
        '2b4a64b9-7e2e-4a5f-b45a-b015a90044d4', 'Global Field Medical Director',
        v_agent_level_master,
        'You are the Field Medical Master, head of the Field Medical department. You lead strategic MSL operations, KOL engagement, regional medical plans, and scientific exchange programs. Delegate to your Field Medical Directors, Team Leads, and Senior MSLs for regional and therapeutic area execution.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_field_medical;
    RAISE NOTICE 'Created Master 2/9: Field Medical Master (ID: %)', v_master_field_medical;
    
    -- MASTER 3: HEOR & Evidence Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'HEOR & Evidence Master',
        'heor-evidence-master',
        'Strategic leadership for evidence generation and health economics',
        'Department head leading all real-world evidence generation, HEOR studies, health economics modeling, outcomes research, and value demonstration. Delegates to RWE Leads, Economic Modelers, and HEOR Project Managers.',
        v_tenant_id, v_function_id, v_function_name,
        '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence',
        'b94d63b9-5a28-43c2-97aa-2a98484c2ef2', 'Global Real-World Evidence Lead',
        v_agent_level_master,
        'You are the HEOR & Evidence Master, head of the HEOR & Evidence department. You drive evidence generation strategy, real-world evidence studies, health economics modeling, and market access support. Delegate to your Real-World Evidence Leads, Economic Modelers, and HEOR specialists for technical execution.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_heor;
    RAISE NOTICE 'Created Master 3/9: HEOR & Evidence Master (ID: %)', v_master_heor;
    
    -- MASTER 4: Medical Education Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Medical Education Master',
        'medical-education-master',
        'Strategic leadership for medical education and training programs',
        'Department head managing all medical education strategies, digital learning initiatives, scientific training programs, and HCP education. Delegates to Medical Education Strategists, Managers, and Scientific Trainers.',
        v_tenant_id, v_function_id, v_function_name,
        '9e1759d6-1f66-484e-b174-1ff68150697d', 'Medical Education',
        'ee8def47-bf92-4d1b-b2db-3e07de92df7b', 'Global Medical Education Strategist',
        v_agent_level_master,
        'You are the Medical Education Master, head of the Medical Education department. You lead educational strategy development, digital learning programs, scientific training, and HCP education initiatives. Delegate to your Medical Education Strategists, Managers, and Scientific Trainers for program design and delivery.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_education;
    RAISE NOTICE 'Created Master 4/9: Medical Education Master (ID: %)', v_master_education;
    
    -- MASTER 5: Medical Excellence & Compliance Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Medical Excellence & Compliance Master',
        'medical-excellence-compliance-master',
        'Strategic leadership for medical excellence and regulatory compliance',
        'Department head overseeing medical excellence standards, governance frameworks, compliance programs, and quality assurance. Delegates to Medical Excellence Leads, Governance Officers, and Compliance Specialists.',
        v_tenant_id, v_function_id, v_function_name,
        'bffee306-7ed9-4ea9-aa1d-9d3d01c46741', 'Medical Excellence & Compliance',
        '9b6484c2-1270-455a-a401-ffebbc0d4aa7', 'Global Medical Excellence Lead',
        v_agent_level_master,
        'You are the Medical Excellence & Compliance Master, head of the Medical Excellence & Compliance department. You ensure medical excellence, regulatory compliance, governance frameworks, and quality standards across all medical affairs activities. Delegate to your Medical Excellence Leads, Governance Officers, and Compliance Specialists for program implementation.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_excellence;
    RAISE NOTICE 'Created Master 5/9: Medical Excellence & Compliance Master (ID: %)', v_master_excellence;
    
    -- MASTER 6: Medical Information Services Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Medical Information Services Master',
        'medical-information-services-master',
        'Strategic leadership for medical inquiry response and information management',
        'Department head managing all medical information operations, inquiry response systems, product information databases, and HCP/patient communication. Delegates to Medical Information Managers, Scientists, and Specialists.',
        v_tenant_id, v_function_id, v_function_name,
        '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services',
        'd2300d04-9ab9-4402-810d-c41281981047', 'Global Medical Information Manager',
        v_agent_level_master,
        'You are the Medical Information Services Master, head of the Medical Information Services department. You lead medical inquiry operations, information management systems, and evidence-based communication to HCPs and patients. Delegate to your Medical Information Managers, Scientists, and Specialists for inquiry response and information delivery.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_med_info;
    RAISE NOTICE 'Created Master 6/9: Medical Information Services Master (ID: %)', v_master_med_info;
    
    -- MASTER 7: Medical Leadership Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Medical Leadership Master',
        'medical-leadership-master',
        'C-suite and executive leadership for Medical Affairs',
        'Top executive leadership providing strategic direction for entire Medical Affairs function. Coordinates cross-departmental initiatives, organizational strategy, and executive decision-making. Delegates to VPs, Directors, and Senior Medical Directors.',
        v_tenant_id, v_function_id, v_function_name,
        '23ee308e-b415-4471-9605-d50c69d33209', 'Medical Leadership',
        '41bd8589-616a-4b9d-ab2b-4bc24d9abe67', 'Global Chief Medical Officer',
        v_agent_level_master,
        'You are the Medical Leadership Master, representing C-suite and executive leadership for Medical Affairs. You provide strategic direction, coordinate cross-departmental initiatives, and guide organizational priorities. Delegate to your VPs, Medical Affairs Directors, and Senior Medical Directors for strategic execution.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_leadership;
    RAISE NOTICE 'Created Master 7/9: Medical Leadership Master (ID: %)', v_master_leadership;
    
    -- MASTER 8: Publications Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Publications Master',
        'publications-master',
        'Strategic leadership for publication planning and execution',
        'Department head managing all publication strategies, manuscript planning, author relationships, journal selection, and scientific dissemination. Delegates to Publications Leads, Managers, and Publication Planners.',
        v_tenant_id, v_function_id, v_function_name,
        '5d5ded20-c30a-48f1-844c-fc9f80fcaacb', 'Publications',
        '6ae3bc1f-e88e-4f78-a2f8-657bcfeedf1d', 'Global Publications Lead',
        v_agent_level_master,
        'You are the Publications Master, head of the Publications department. You drive publication strategy, manage scientific dissemination, coordinate author relationships, and ensure high-impact journal placement. Delegate to your Publications Leads, Managers, and Planners for execution.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_publications;
    RAISE NOTICE 'Created Master 8/9: Publications Master (ID: %)', v_master_publications;
    
    -- MASTER 9: Scientific Communications Master
    INSERT INTO agents (
        name, slug, tagline, description,
        tenant_id, function_id, function_name,
        department_id, department_name,
        role_id, role_name,
        agent_level_id, system_prompt, base_model, temperature, max_tokens
    ) VALUES (
        'Scientific Communications Master',
        'scientific-communications-master',
        'Strategic leadership for medical writing and scientific content',
        'Department head managing all medical writing, scientific content creation, congress materials, regulatory documentation, and communication strategies. Delegates to Scientific Communications Managers, Medical Writers, and Communications Specialists.',
        v_tenant_id, v_function_id, v_function_name,
        '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications',
        'e30fbcd9-0c1e-4d54-9d2b-1d2b2b78b694', 'Global Scientific Affairs Lead',
        v_agent_level_master,
        'You are the Scientific Communications Master, head of the Scientific Communications department. You lead medical writing strategy, scientific content creation, congress materials development, and regulatory medical writing. Delegate to your Scientific Communications Managers, Medical Writers, and Communications Specialists for content development.',
        'gpt-4o', 0.7, 8000
    ) RETURNING id INTO v_master_sci_comms;
    RAISE NOTICE 'Created Master 9/9: Scientific Communications Master (ID: %)', v_master_sci_comms;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Master Agents Summary (Department Heads):';
    RAISE NOTICE 'Total Created: 9';
    RAISE NOTICE '1. Clinical Operations Support Master: %', v_master_clinical_ops;
    RAISE NOTICE '2. Field Medical Master: %', v_master_field_medical;
    RAISE NOTICE '3. HEOR & Evidence Master: %', v_master_heor;
    RAISE NOTICE '4. Medical Education Master: %', v_master_education;
    RAISE NOTICE '5. Medical Excellence & Compliance Master: %', v_master_excellence;
    RAISE NOTICE '6. Medical Information Services Master: %', v_master_med_info;
    RAISE NOTICE '7. Medical Leadership Master: %', v_master_leadership;
    RAISE NOTICE '8. Publications Master: %', v_master_publications;
    RAISE NOTICE '9. Scientific Communications Master: %', v_master_sci_comms;
    RAISE NOTICE '========================================';
    
END $$;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Summary count
SELECT 
    'Master Agents Created (Department Heads)' as summary,
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
    al.icon_name,
    a.department_name,
    a.role_name,
    a.base_model,
    a.temperature,
    a.max_tokens
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'master'
  AND a.deleted_at IS NULL
ORDER BY a.department_name;

