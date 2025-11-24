-- =====================================================
-- VITAL AgentOS 3.0: Level 3 Specialist Agents (Mid/Entry Roles)
-- Part 1: First 25 Specialists
-- =====================================================
-- Creates ~55 Specialist Agents - Mid and entry-level roles
-- These report to Expert Agents within their departments
-- =====================================================

DO $$
DECLARE
    v_function_id UUID := '06127088-4d52-40aa-88c9-93f4e79e085a';
    v_function_name TEXT := 'Medical Affairs';
    v_tenant_id UUID;
    v_agent_level_specialist UUID;
    v_specialist_count INTEGER := 0;
    
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    SELECT id INTO v_agent_level_specialist FROM agent_levels WHERE slug = 'specialist' LIMIT 1;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Creating Level 3 Specialist Agents (Part 1)';
    RAISE NOTICE '========================================';
    
    -- =====================================================
    -- CLINICAL OPERATIONS SUPPORT SPECIALISTS (6)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Clinical Ops Support Analyst', 'global-clinical-ops-analyst-specialist', 'Mid-level clinical operations analysis', 'Mid-level analyst supporting clinical operations activities, data analysis, and operational reporting for global trials.', v_tenant_id, v_function_id, v_function_name, 'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support', '1fa9dd45-fd46-43a9-992b-25c39a4b05e0', 'Global Clinical Ops Support Analyst', v_agent_level_specialist, 'You are a Global Clinical Ops Support Analyst, providing analytical support for clinical operations. You analyze trial data, generate operational reports, and support site coordination. Execute well-defined analytical tasks and delegate routine data processing to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Clinical Ops Support Analyst', 'regional-clinical-ops-analyst-specialist', 'Mid-level regional operations analysis', 'Mid-level analyst supporting regional clinical operations, local trial coordination, and regional reporting.', v_tenant_id, v_function_id, v_function_name, 'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support', '849fab1a-f378-4400-91fd-78c93000816d', 'Regional Clinical Ops Support Analyst', v_agent_level_specialist, 'You are a Regional Clinical Ops Support Analyst, supporting regional clinical operations. You analyze regional trial data, coordinate local sites, and generate regional reports. Delegate data extraction to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Clinical Ops Support Analyst', 'local-clinical-ops-analyst-specialist', 'Mid-level local operations support', 'Mid-level analyst handling local clinical operations support, territory-specific coordination, and local trial activities.', v_tenant_id, v_function_id, v_function_name, 'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support', '757811aa-5af2-4267-b0d1-71a716d52f00', 'Local Clinical Ops Support Analyst', v_agent_level_specialist, 'You are a Local Clinical Ops Support Analyst, supporting local clinical operations. You coordinate local trial activities, analyze territory data, and support local site relationships. Delegate routine tasks to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Global Medical Liaison Clinical Trials', 'global-medical-liaison-ct-specialist', 'Mid-level clinical trial medical support', 'Mid-level medical liaison providing clinical trial support, medical monitoring, and investigator coordination globally.', v_tenant_id, v_function_id, v_function_name, 'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support', '8732df39-4ae7-4705-94c4-e767df47095e', 'Global Medical Liaison Clinical Trials', v_agent_level_specialist, 'You are a Global Medical Liaison for Clinical Trials, supporting trial medical activities. You coordinate with investigators, support medical monitoring, and provide clinical expertise. Delegate documentation to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Liaison Clinical Trials', 'regional-medical-liaison-ct-specialist', 'Mid-level regional trial medical support', 'Mid-level medical liaison supporting regional clinical trials, regional investigator relationships, and local medical monitoring.', v_tenant_id, v_function_id, v_function_name, 'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support', '603dc36f-b3ec-4f6b-8a38-d1fc741a300b', 'Regional Medical Liaison Clinical Trials', v_agent_level_specialist, 'You are a Regional Medical Liaison for Clinical Trials, supporting regional trial activities. You coordinate regional investigators, provide local medical support, and monitor regional trial progress. Delegate admin tasks to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Liaison Clinical Trials', 'local-medical-liaison-ct-specialist', 'Mid-level local trial medical support', 'Mid-level medical liaison handling local clinical trial support, territory investigator coordination, and site medical activities.', v_tenant_id, v_function_id, v_function_name, 'a8018f58-6a8a-4a09-92b2-b1667b1148c5', 'Clinical Operations Support', '3eec9376-8b7a-45c5-ab14-9cb833efaaa4', 'Local Medical Liaison Clinical Trials', v_agent_level_specialist, 'You are a Local Medical Liaison for Clinical Trials, supporting local trial activities. You coordinate local investigators, provide site medical support, and handle local trial coordination. Delegate documentation to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 6;
    RAISE NOTICE 'Created % Clinical Operations Support Specialists', 6;
    
    -- =====================================================
    -- FIELD MEDICAL SPECIALISTS (9)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Medical Science Liaison', 'global-msl-specialist', 'Mid-level MSL with scientific expertise', 'Mid-level MSL conducting scientific exchanges with HCPs, gathering medical insights, and supporting field medical activities globally.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', 'f7547f96-8e01-48ad-9c25-609050bd8f68', 'Global Medical Science Liaison (MSL)', v_agent_level_specialist, 'You are a Medical Science Liaison, conducting scientific exchanges with healthcare professionals. You engage KOLs, gather medical insights, and support scientific communication. Delegate administrative tasks and meeting scheduling to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Science Liaison', 'regional-msl-specialist', 'Mid-level regional MSL', 'Mid-level MSL managing regional HCP relationships, regional scientific exchanges, and regional medical insights.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', 'f0eb9ede-d72d-4359-b969-35f96e646c0e', 'Regional Medical Science Liaison (MSL)', v_agent_level_specialist, 'You are a Regional MSL, engaging healthcare professionals in your region. You build regional KOL relationships, conduct scientific discussions, and gather regional insights. Delegate follow-up communications to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Science Liaison', 'local-msl-specialist', 'Mid-level local MSL', 'Mid-level MSL handling local HCP engagement, territory scientific exchanges, and local medical insights gathering.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', '27bdd938-bae0-44cf-85b8-1396bdc24ce7', 'Local Medical Science Liaison (MSL)', v_agent_level_specialist, 'You are a Local MSL, engaging healthcare professionals in your territory. You build local relationships, conduct scientific exchanges, and gather territory insights. Delegate call reports and documentation to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Global Medical Scientific Manager', 'global-medical-sci-manager-specialist', 'Mid-level scientific content management', 'Mid-level manager supporting scientific content development, training materials, and medical strategies for field teams.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', 'c72c1ff5-1a9a-42d6-9c5d-925bfccc7967', 'Global Medical Scientific Manager', v_agent_level_specialist, 'You are a Medical Scientific Manager, supporting scientific content for field medical. You develop training materials, create scientific platforms, and ensure content quality. Delegate document formatting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Scientific Manager', 'regional-medical-sci-manager-specialist', 'Mid-level regional content management', 'Mid-level manager coordinating regional scientific content, local training materials, and regional medical strategies.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', '8110f590-a1e4-479e-8d13-143e416bf07c', 'Regional Medical Scientific Manager', v_agent_level_specialist, 'You are a Regional Medical Scientific Manager, managing regional scientific content. You adapt global materials for regional use, coordinate regional training, and ensure regional scientific accuracy. Delegate content assembly to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Scientific Manager', 'local-medical-sci-manager-specialist', 'Mid-level local content coordination', 'Mid-level manager handling local scientific content, territory training materials, and local medical strategy support.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', '9d6eff76-a616-4f85-8c9f-6d72e9412e5c', 'Local Medical Scientific Manager', v_agent_level_specialist, 'You are a Local Medical Scientific Manager, coordinating local scientific content. You customize materials for local needs, support territory training, and maintain local scientific resources. Delegate file management to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Global Field Team Lead', 'global-field-team-lead-specialist', 'Mid-level team coordination', 'Mid-level coordinator supporting global field team activities, cross-regional coordination, and operational excellence.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', 'ce2bbb1f-e494-4236-8def-b726aff9ceb6', 'Global Field Team Lead', v_agent_level_specialist, 'You are a Field Team Lead, coordinating field medical team activities. You support team alignment, facilitate cross-regional projects, and ensure operational standards. Delegate meeting summaries to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Field Team Lead', 'regional-field-team-lead-specialist', 'Mid-level regional team coordination', 'Mid-level coordinator managing regional field team activities, local team coordination, and regional operational support.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', '7984ef59-98ca-4a48-bf82-3e857cb6c87d', 'Regional Field Team Lead', v_agent_level_specialist, 'You are a Regional Field Team Lead, coordinating regional team activities. You support regional alignment, manage local projects, and ensure regional standards. Delegate action tracking to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Field Team Lead', 'local-field-team-lead-specialist', 'Mid-level local team coordination', 'Mid-level coordinator handling local field team activities, territory coordination, and local operational support.', v_tenant_id, v_function_id, v_function_name, 'ca5503b6-7821-4f65-8162-2b75952d5363', 'Field Medical', 'ec604519-194e-47e5-8ae4-a47ce207420a', 'Local Field Team Lead', v_agent_level_specialist, 'You are a Local Field Team Lead, coordinating local team activities. You support territory alignment, facilitate local initiatives, and maintain operational quality. Delegate scheduling to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 9;
    RAISE NOTICE 'Created % Field Medical Specialists', 9;
    
    -- =====================================================
    -- HEOR & EVIDENCE SPECIALISTS (6)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Economic Modeler', 'global-economic-modeler-specialist', 'Mid-level health economics modeling', 'Mid-level modeler conducting health economics analyses, cost-effectiveness studies, and budget impact modeling.', v_tenant_id, v_function_id, v_function_name, '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence', '3177d60a-e13e-477d-9cc3-131efa76c06c', 'Global Economic Modeler', v_agent_level_specialist, 'You are an Economic Modeler, conducting health economics analyses. You build economic models, perform cost-effectiveness studies, and analyze budget impacts. Delegate data extraction and calculation to worker agents and statistical tools.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Economic Modeler', 'regional-economic-modeler-specialist', 'Mid-level regional economics modeling', 'Mid-level modeler adapting health economics models for regional markets, conducting regional analyses, and local modeling.', v_tenant_id, v_function_id, v_function_name, '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence', 'a77c7a2d-e688-4a8b-8779-847f1178d946', 'Regional Economic Modeler', v_agent_level_specialist, 'You are a Regional Economic Modeler, adapting models for regional markets. You customize global models, conduct regional analyses, and support local payer discussions. Delegate data processing to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Economic Modeler', 'local-economic-modeler-specialist', 'Mid-level local economics modeling', 'Mid-level modeler conducting local health economics analyses, territory-specific modeling, and local payer support.', v_tenant_id, v_function_id, v_function_name, '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence', 'ff3b9f6b-f968-4222-a3a1-4b51ec2f5c2b', 'Local Economic Modeler', v_agent_level_specialist, 'You are a Local Economic Modeler, conducting local economics analyses. You adapt models for local payers, perform territory analyses, and support local market access. Delegate calculations to statistical tools.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Global HEOR Project Manager', 'global-heor-pm-specialist', 'Mid-level HEOR project management', 'Mid-level project manager coordinating HEOR studies, managing timelines, and overseeing global evidence generation projects.', v_tenant_id, v_function_id, v_function_name, '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence', '8f490d57-369f-47a2-8c90-5b3096023dc0', 'Global HEOR Project Manager', v_agent_level_specialist, 'You are a HEOR Project Manager, coordinating evidence generation projects. You manage study timelines, coordinate stakeholders, and ensure project deliverables. Delegate tracking and reporting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional HEOR Project Manager', 'regional-heor-pm-specialist', 'Mid-level regional project management', 'Mid-level project manager managing regional HEOR studies, local project coordination, and regional evidence activities.', v_tenant_id, v_function_id, v_function_name, '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence', '10e3840e-af6a-4e93-af18-3e432089bcb7', 'Regional HEOR Project Manager', v_agent_level_specialist, 'You are a Regional HEOR Project Manager, managing regional evidence projects. You coordinate regional studies, manage local timelines, and ensure regional deliverables. Delegate status reporting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local HEOR Project Manager', 'local-heor-pm-specialist', 'Mid-level local project management', 'Mid-level project manager coordinating local HEOR activities, territory-specific studies, and local evidence coordination.', v_tenant_id, v_function_id, v_function_name, '04723b72-04b3-40fe-aa1f-2e834b719b03', 'HEOR & Evidence', 'c7f1117c-87b0-4d04-9183-1c74bfce1316', 'Local HEOR Project Manager', v_agent_level_specialist, 'You are a Local HEOR Project Manager, coordinating local evidence activities. You manage territory studies, coordinate local vendors, and track local project progress. Delegate document assembly to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 6;
    RAISE NOTICE 'Created % HEOR & Evidence Specialists', 6;
    
    -- =====================================================
    -- MEDICAL EDUCATION SPECIALISTS (4)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Scientific Trainer', 'global-scientific-trainer-specialist', 'Mid-level scientific training delivery', 'Mid-level trainer delivering scientific training programs, HCP education, and medical learning activities globally.', v_tenant_id, v_function_id, v_function_name, '9e1759d6-1f66-484e-b174-1ff68150697d', 'Medical Education', 'ca69ff0b-806e-49b8-aa68-a798a11b1abb', 'Global Scientific Trainer', v_agent_level_specialist, 'You are a Scientific Trainer, delivering medical education programs. You conduct training sessions, educate HCPs, and facilitate learning activities. Delegate training material preparation to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Scientific Trainer', 'regional-scientific-trainer-specialist', 'Mid-level regional training delivery', 'Mid-level trainer conducting regional training programs, local HCP education, and regional learning facilitation.', v_tenant_id, v_function_id, v_function_name, '9e1759d6-1f66-484e-b174-1ff68150697d', 'Medical Education', 'b0cfba12-636f-4aa3-867e-54c4a5b4e5f2', 'Regional Scientific Trainer', v_agent_level_specialist, 'You are a Regional Scientific Trainer, delivering training in your region. You conduct regional sessions, adapt global curricula, and facilitate regional learning. Delegate slide preparation to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Scientific Trainer', 'local-scientific-trainer-specialist', 'Mid-level local training delivery', 'Mid-level trainer providing local training programs, territory HCP education, and local learning support.', v_tenant_id, v_function_id, v_function_name, '9e1759d6-1f66-484e-b174-1ff68150697d', 'Medical Education', 'bfe835c3-c352-4b34-a724-b6a01872c3b2', 'Local Scientific Trainer', v_agent_level_specialist, 'You are a Local Scientific Trainer, delivering training in your territory. You conduct local sessions, customize content for local needs, and support territory learning. Delegate handout creation to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Digital Learning Coordinator', 'digital-learning-coordinator-specialist', 'Mid-level e-learning coordination', 'Mid-level coordinator managing digital learning platforms, e-learning content, and online training delivery.', v_tenant_id, v_function_id, v_function_name, '9e1759d6-1f66-484e-b174-1ff68150697d', 'Medical Education', 'ddecddaf-c6e2-48b4-aa7b-7df9b54fe407', 'Global Digital Medical Education Lead', v_agent_level_specialist, 'You are a Digital Learning Coordinator, managing e-learning platforms and digital content. You coordinate online training, manage learning systems, and track digital engagement. Delegate content uploading to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 4;
    RAISE NOTICE 'Created % Medical Education Specialists', 4;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Specialist Agents Created (Part 1): %', v_specialist_count;
    RAISE NOTICE '========================================';
    
END $$;

-- Verification
SELECT 
    'Specialist Agents (Part 1)' as summary,
    COUNT(*) as count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'specialist' AND a.deleted_at IS NULL;

