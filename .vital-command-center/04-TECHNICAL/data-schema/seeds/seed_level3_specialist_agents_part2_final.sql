-- =====================================================
-- VITAL AgentOS 3.0: Level 3 Specialist Agents (Part 2 - Final)
-- Remaining 18 Specialists for 5 departments
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
    RAISE NOTICE 'Creating Level 3 Specialist Agents (Part 2 - Final)';
    RAISE NOTICE '========================================';
    
    -- =====================================================
    -- MEDICAL EXCELLENCE & COMPLIANCE SPECIALISTS (3)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Compliance Specialist', 'global-compliance-specialist', 'Mid-level compliance oversight', 'Mid-level specialist ensuring global compliance, conducting audits, and supporting regulatory adherence across medical affairs.', v_tenant_id, v_function_id, v_function_name, 'bffee306-7ed9-4ea9-aa1d-9d3d01c46741', 'Medical Excellence & Compliance', '071d9c62-2de1-45f7-83c2-0b55bd5bf52f', 'Global Compliance Specialist', v_agent_level_specialist, 'You are a Compliance Specialist, ensuring medical affairs compliance. You conduct audits, review activities for adherence, and support compliance training. Delegate audit documentation to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Compliance Specialist', 'regional-compliance-specialist', 'Mid-level regional compliance', 'Mid-level specialist managing regional compliance programs, local audits, and regional regulatory adherence.', v_tenant_id, v_function_id, v_function_name, 'bffee306-7ed9-4ea9-aa1d-9d3d01c46741', 'Medical Excellence & Compliance', '6c231e4b-69fa-4361-bc58-a3f523345ce6', 'Regional Compliance Specialist', v_agent_level_specialist, 'You are a Regional Compliance Specialist, managing regional compliance. You conduct regional audits, ensure local adherence, and support regional training. Delegate compliance tracking to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Compliance Specialist', 'local-compliance-specialist', 'Mid-level local compliance oversight', 'Mid-level specialist handling local compliance activities, territory audits, and local regulatory support.', v_tenant_id, v_function_id, v_function_name, 'bffee306-7ed9-4ea9-aa1d-9d3d01c46741', 'Medical Excellence & Compliance', 'e42f4128-f2cf-4718-ac59-1abe1bef3068', 'Local Compliance Specialist', v_agent_level_specialist, 'You are a Local Compliance Specialist, ensuring local compliance. You support territory audits, review local activities, and maintain local compliance records. Delegate record-keeping to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 3;
    RAISE NOTICE 'Created % Medical Excellence & Compliance Specialists', 3;
    
    -- =====================================================
    -- MEDICAL INFORMATION SERVICES SPECIALISTS (6)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Medical Information Specialist', 'global-med-info-specialist', 'Mid-level medical inquiry response', 'Mid-level specialist responding to medical inquiries, providing product information, and supporting evidence-based communication.', v_tenant_id, v_function_id, v_function_name, '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services', 'fd90a29e-5c1f-4796-8779-d63a40ffd5a0', 'Global Medical Information Specialist', v_agent_level_specialist, 'You are a Medical Information Specialist, responding to medical inquiries from HCPs and patients. You provide evidence-based answers, cite appropriate references, and ensure accuracy. Delegate reference formatting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Information Specialist', 'regional-med-info-specialist', 'Mid-level regional inquiry response', 'Mid-level specialist handling regional medical inquiries, local information requests, and regional communication.', v_tenant_id, v_function_id, v_function_name, '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services', '10439276-39a3-488a-8c49-2531934fe511', 'Regional Medical Information Specialist', v_agent_level_specialist, 'You are a Regional Medical Information Specialist, responding to regional inquiries. You provide regionally relevant information, adapt global responses, and ensure regional accuracy. Delegate response drafting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Information Specialist', 'local-med-info-specialist', 'Mid-level local inquiry response', 'Mid-level specialist managing local medical inquiries, territory information requests, and local HCP communication.', v_tenant_id, v_function_id, v_function_name, '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services', 'c15316a2-2b06-4d31-890a-86a3f056a68c', 'Local Medical Information Specialist', v_agent_level_specialist, 'You are a Local Medical Information Specialist, handling local inquiries. You provide territory-specific information, support local HCPs, and maintain local inquiry records. Delegate email drafting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Global Medical Info Associate', 'global-med-info-associate-specialist', 'Entry-level medical information support', 'Entry-level associate supporting medical information activities, basic inquiry response, and information database management.', v_tenant_id, v_function_id, v_function_name, '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services', '702f6a9f-372c-49f6-8d4a-3efc8dec8902', 'Global Medical Info Associate', v_agent_level_specialist, 'You are a Medical Info Associate, supporting medical information operations. You handle routine inquiries, maintain databases, and support information requests. Delegate data entry to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Info Associate', 'regional-med-info-associate-specialist', 'Entry-level regional MI support', 'Entry-level associate supporting regional medical information, local inquiry assistance, and regional database maintenance.', v_tenant_id, v_function_id, v_function_name, '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services', '1f7e4517-2e32-4108-b10c-8dc4bf1fa589', 'Regional Medical Info Associate', v_agent_level_specialist, 'You are a Regional Medical Info Associate, supporting regional MI activities. You assist with regional inquiries, update regional databases, and support regional information needs. Delegate file management to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Info Associate', 'local-med-info-associate-specialist', 'Entry-level local MI support', 'Entry-level associate handling local medical information support, territory inquiry assistance, and local information coordination.', v_tenant_id, v_function_id, v_function_name, '2b320eab-1758-42d7-adfa-7f49c12cdf40', 'Medical Information Services', 'f9fdae17-b752-4211-8ba0-55b0b6423941', 'Local Medical Info Associate', v_agent_level_specialist, 'You are a Local Medical Info Associate, supporting local MI operations. You assist with territory inquiries, maintain local records, and coordinate local information activities. Delegate document organization to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 6;
    RAISE NOTICE 'Created % Medical Information Services Specialists', 6;
    
    -- =====================================================
    -- PUBLICATIONS SPECIALISTS (3)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Publication Planner', 'global-publication-planner-specialist', 'Mid-level publication planning', 'Mid-level planner coordinating publication timelines, managing manuscript tracking, and supporting publication execution.', v_tenant_id, v_function_id, v_function_name, '5d5ded20-c30a-48f1-844c-fc9f80fcaacb', 'Publications', '8f0ca356-76bd-4b00-8844-e4ac00083f22', 'Global Publication Planner', v_agent_level_specialist, 'You are a Publication Planner, coordinating publication activities. You track manuscript timelines, coordinate submissions, and manage publication schedules. Delegate timeline tracking to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Publication Planner', 'regional-publication-planner-specialist', 'Mid-level regional publication planning', 'Mid-level planner managing regional publications, local manuscript coordination, and regional publication tracking.', v_tenant_id, v_function_id, v_function_name, '5d5ded20-c30a-48f1-844c-fc9f80fcaacb', 'Publications', '908b1ed7-29d6-4f6d-aadf-ae84125926af', 'Regional Publication Planner', v_agent_level_specialist, 'You are a Regional Publication Planner, coordinating regional publications. You track regional manuscripts, manage local authors, and ensure regional publication timelines. Delegate status reporting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Publication Planner', 'local-publication-planner-specialist', 'Mid-level local publication planning', 'Mid-level planner handling local publication coordination, territory manuscript support, and local publication activities.', v_tenant_id, v_function_id, v_function_name, '5d5ded20-c30a-48f1-844c-fc9f80fcaacb', 'Publications', 'e686d05d-8143-439c-b034-c73b81f437dc', 'Local Publication Planner', v_agent_level_specialist, 'You are a Local Publication Planner, supporting local publications. You coordinate territory manuscripts, track local submissions, and maintain local publication records. Delegate document assembly to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 3;
    RAISE NOTICE 'Created % Publications Specialists', 3;
    
    -- =====================================================
    -- SCIENTIFIC COMMUNICATIONS SPECIALISTS (6)
    -- =====================================================
    
    INSERT INTO agents (name, slug, tagline, description, tenant_id, function_id, function_name, department_id, department_name, role_id, role_name, agent_level_id, system_prompt, base_model, temperature, max_tokens)
    VALUES 
    ('Global Medical Communications Specialist', 'global-med-comms-specialist', 'Mid-level medical communications', 'Mid-level specialist creating medical communications content, developing scientific materials, and supporting content strategy.', v_tenant_id, v_function_id, v_function_name, '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications', 'd39afed7-6cf4-4146-8737-40b21738a795', 'Global Medical Communications Specialist', v_agent_level_specialist, 'You are a Medical Communications Specialist, creating scientific content and communications. You develop medical materials, create congress content, and ensure scientific accuracy. Delegate formatting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Communications Specialist', 'regional-med-comms-specialist', 'Mid-level regional communications', 'Mid-level specialist adapting medical communications for regional use, creating local content, and regional scientific materials.', v_tenant_id, v_function_id, v_function_name, '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications', '3202b466-4f2e-4eba-8547-b88354bbc3c3', 'Regional Medical Communications Specialist', v_agent_level_specialist, 'You are a Regional Medical Communications Specialist, adapting content for regional needs. You customize global materials, create regional content, and ensure regional appropriateness. Delegate translation coordination to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Communications Specialist', 'local-med-comms-specialist', 'Mid-level local communications', 'Mid-level specialist handling local medical communications, territory content development, and local scientific materials.', v_tenant_id, v_function_id, v_function_name, '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications', '6cbddb0a-4ecc-4dad-9885-74072cc4dac0', 'Local Medical Communications Specialist', v_agent_level_specialist, 'You are a Local Medical Communications Specialist, creating local content. You develop territory materials, adapt for local audiences, and maintain local content library. Delegate file organization to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Global Medical Writer', 'global-medical-writer-specialist', 'Mid-level medical writing', 'Mid-level writer creating scientific manuscripts, regulatory documents, and medical content with precision and compliance.', v_tenant_id, v_function_id, v_function_name, '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications', 'bd65ecaf-dfb5-4cc3-bec3-754e0c90dc3d', 'Global Medical Writer', v_agent_level_specialist, 'You are a Medical Writer, creating high-quality scientific documents. You write manuscripts, develop clinical documents, and ensure scientific accuracy. Delegate reference management to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Regional Medical Writer', 'regional-medical-writer-specialist', 'Mid-level regional medical writing', 'Mid-level writer creating regional scientific documents, adapting global content, and regional medical writing.', v_tenant_id, v_function_id, v_function_name, '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications', '15cd4978-60e3-4a80-81aa-43e56216c540', 'Regional Medical Writer', v_agent_level_specialist, 'You are a Regional Medical Writer, creating regional scientific content. You adapt global documents, write regional materials, and ensure regional compliance. Delegate document formatting to worker agents.', 'gpt-4-turbo', 0.6, 4000),
    
    ('Local Medical Writer', 'local-medical-writer-specialist', 'Mid-level local medical writing', 'Mid-level writer handling local scientific writing, territory content creation, and local medical documentation.', v_tenant_id, v_function_id, v_function_name, '9871d82a-631a-4cf7-9a00-1ab838a45c3e', 'Scientific Communications', '6b09c934-6bcc-4ea0-90af-b616b5543cee', 'Local Medical Writer', v_agent_level_specialist, 'You are a Local Medical Writer, creating local scientific content. You write territory materials, customize for local needs, and maintain local documentation. Delegate proofreading to worker agents.', 'gpt-4-turbo', 0.6, 4000);
    
    v_specialist_count := v_specialist_count + 6;
    RAISE NOTICE 'Created % Scientific Communications Specialists', 6;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Level 3 Specialist Agents COMPLETE!';
    RAISE NOTICE 'Total Specialist Agents Created (Part 2): %', v_specialist_count;
    RAISE NOTICE '========================================';
    
END $$;

-- Final Verification
SELECT 
    'Total Specialist Agents (All Parts)' as summary,
    COUNT(*) as total_count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'specialist' AND a.deleted_at IS NULL;

-- Summary by department
SELECT 
    a.department_name,
    COUNT(*) as specialist_count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'specialist' AND a.deleted_at IS NULL
GROUP BY a.department_name
ORDER BY a.department_name;

