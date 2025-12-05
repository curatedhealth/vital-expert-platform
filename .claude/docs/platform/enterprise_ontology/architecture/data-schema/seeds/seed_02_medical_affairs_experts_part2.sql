-- =====================================================
-- SEED 02: Expert Agents (Level 2) - PART 2/2
-- =====================================================
-- Continues from Part 1 (Experts 15-35 + 5 existing analytics = 40 total)
-- =====================================================

DO $$ 
DECLARE
    v_tenant_id UUID;
    v_pharma_function_id UUID;
    
    -- Department IDs
    v_dept_evidence_heor UUID;
    v_dept_clinical_ops UUID;
    v_dept_excellence_gov UUID;
    v_dept_strategy_ops UUID;
    
    -- Master Agent IDs
    v_master_clinical UUID;
    v_master_evidence UUID;
    v_master_communications UUID;
    v_master_operations UUID;
    
    v_expert_id UUID;
    v_count INTEGER := 14; -- Starting from 15th agent
BEGIN
    RAISE NOTICE 'Creating Experts 15-35...';
    
    -- Get required IDs
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    SELECT id INTO v_pharma_function_id FROM functions WHERE name = 'Medical Affairs' LIMIT 1;
    
    SELECT id INTO v_master_clinical FROM agents WHERE slug = 'master-clinical-excellence-orchestrator';
    SELECT id INTO v_master_evidence FROM agents WHERE slug = 'master-evidence-generation-orchestrator';
    SELECT id INTO v_master_communications FROM agents WHERE slug = 'master-medical-communications-orchestrator';
    SELECT id INTO v_master_operations FROM agents WHERE slug = 'master-medical-strategy-operations-orchestrator';
    
    SELECT id INTO v_dept_evidence_heor FROM departments WHERE slug = 'evidence-generation-heor';
    SELECT id INTO v_dept_clinical_ops FROM departments WHERE slug = 'clinical-operations-support';
    SELECT id INTO v_dept_excellence_gov FROM departments WHERE slug = 'medical-excellence-governance';
    SELECT id INTO v_dept_strategy_ops FROM departments WHERE slug = 'medical-strategy-operations';
    
    -- =====================================================
    -- EVIDENCE GENERATION & HEOR DEPARTMENT (5 agents)
    -- =====================================================
    
    -- Expert 15: Real-World Evidence Specialist
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name, 
        department_id, department_name, expertise_level, agent_level, master_agent_id, 
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Real-World Evidence Specialist', 'real-world-evidence-specialist',
        'Expert in RWE study design and analysis',
        'Expert in designing and analyzing real-world evidence studies to support product value and clinical effectiveness.',
        'Expert Agent - RWE',
        v_pharma_function_id, 'Medical Affairs', v_dept_evidence_heor, 'Evidence Generation & HEOR',
        'expert', 'expert', v_master_evidence, 'pharmaceuticals',
        'You are a Real-World Evidence Specialist focused on generating insights from real-world data. Design observational studies, analyze healthcare databases, and develop evidence to support product value propositions.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['rwe-study-design', 'database-analysis', 'observational-research', 'evidence-synthesis'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Real-World Evidence Specialist', v_count;
    
    -- Expert 16: Health Economics Specialist
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Health Economics Specialist', 'health-economics-specialist',
        'HEOR expert developing economic models',
        'HEOR expert developing economic models, cost-effectiveness analyses, and value propositions for market access.',
        'Expert Agent - HEOR',
        v_pharma_function_id, 'Medical Affairs', v_dept_evidence_heor, 'Evidence Generation & HEOR',
        'expert', 'expert', v_master_evidence, 'pharmaceuticals',
        'You are a Health Economics Specialist developing economic evidence for product value. Create cost-effectiveness models, budget impact analyses, and support HTA submissions.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['economic-modeling', 'cost-effectiveness', 'budget-impact', 'hta-support'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Health Economics Specialist', v_count;
    
    -- Expert 17: Biostatistician
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Biostatistician', 'biostatistician',
        'Statistical expert for clinical trials and RWE',
        'Statistical expert providing analytical support for clinical trials, real-world studies, and evidence generation.',
        'Expert Agent - Biostatistics',
        v_pharma_function_id, 'Medical Affairs', v_dept_evidence_heor, 'Evidence Generation & HEOR',
        'expert', 'expert', v_master_evidence, 'pharmaceuticals',
        'You are a Senior Biostatistician providing statistical expertise for medical affairs. Design statistical analyses, interpret clinical data, and ensure rigorous methodology in evidence generation.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['statistical-analysis', 'clinical-trial-design', 'sample-size', 'meta-analysis'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Biostatistician', v_count;
    
    -- Expert 18: Epidemiologist
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Epidemiologist', 'epidemiologist',
        'Population health expert studying disease patterns',
        'Population health expert studying disease patterns, risk factors, and epidemiological trends for evidence generation.',
        'Expert Agent - Epidemiology',
        v_pharma_function_id, 'Medical Affairs', v_dept_evidence_heor, 'Evidence Generation & HEOR',
        'expert', 'expert', v_master_evidence, 'pharmaceuticals',
        'You are an Epidemiologist studying disease patterns and population health. Conduct epidemiological research, assess disease burden, and provide insights for medical strategy.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['epidemiology', 'disease-burden', 'population-health', 'pharmaco-epi'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Epidemiologist', v_count;
    
    -- Expert 19: Outcomes Research Manager
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Outcomes Research Manager', 'outcomes-research-manager',
        'Patient outcomes expert focusing on PRO studies',
        'Patient outcomes expert focusing on PRO studies, quality of life assessments, and patient-centered evidence generation.',
        'Expert Agent - Outcomes Research',
        v_pharma_function_id, 'Medical Affairs', v_dept_evidence_heor, 'Evidence Generation & HEOR',
        'expert', 'expert', v_master_evidence, 'pharmaceuticals',
        'You are an Outcomes Research Manager specializing in patient-reported outcomes and quality of life research. Design PRO studies, develop outcome measures, and generate patient-centered evidence.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['pro-studies', 'quality-of-life', 'patient-preferences', 'outcome-measures'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Outcomes Research Manager', v_count;
    
    -- =====================================================
    -- CLINICAL OPERATIONS SUPPORT DEPARTMENT (4 agents)
    -- =====================================================
    
    -- Expert 20: Clinical Study Liaison
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Clinical Study Liaison', 'clinical-study-liaison',
        'Bridge between clinical development and medical affairs',
        'Bridge between clinical development and medical affairs, supporting investigator relationships and study execution.',
        'Expert Agent - Clinical Study Liaison',
        v_pharma_function_id, 'Medical Affairs', v_dept_clinical_ops, 'Clinical Operations Support',
        'expert', 'expert', v_master_clinical, 'pharmaceuticals',
        'You are a Clinical Study Liaison supporting clinical trial execution and investigator engagement. Facilitate study startup, maintain investigator relationships, and ensure smooth collaboration.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['investigator-relations', 'trial-site-support', 'study-startup', 'protocol-training'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Clinical Study Liaison', v_count;
    
    -- Expert 21: Medical Monitor
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Monitor', 'medical-monitor',
        'Clinical expert providing medical oversight for trials',
        'Clinical expert providing medical oversight for clinical trials, ensuring patient safety and protocol compliance.',
        'Expert Agent - Medical Monitoring',
        v_pharma_function_id, 'Medical Affairs', v_dept_clinical_ops, 'Clinical Operations Support',
        'expert', 'expert', v_master_clinical, 'pharmaceuticals',
        'You are a Medical Monitor providing medical oversight for clinical trials. Ensure patient safety, review clinical data, provide protocol guidance, and manage medical aspects of studies.',
        'gpt-4-turbo-preview', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['medical-oversight', 'safety-review', 'protocol-guidance', 'investigator-support'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Medical Monitor', v_count;
    
    -- Expert 22: Clinical Data Manager
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Clinical Data Manager', 'clinical-data-manager',
        'Data expert ensuring clinical trial data quality',
        'Data expert ensuring clinical trial data quality, integrity, and compliance with regulatory standards.',
        'Expert Agent - Clinical Data Management',
        v_pharma_function_id, 'Medical Affairs', v_dept_clinical_ops, 'Clinical Operations Support',
        'expert', 'expert', v_master_clinical, 'pharmaceuticals',
        'You are a Clinical Data Manager responsible for clinical trial data quality and integrity. Manage databases, ensure data standards compliance, and support data analysis.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['database-management', 'data-quality', 'cdisc-standards', 'data-validation'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Clinical Data Manager', v_count;
    
    -- Expert 23: Clinical Trial Disclosure Manager
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Clinical Trial Disclosure Manager', 'clinical-trial-disclosure-manager',
        'Transparency specialist managing trial disclosure',
        'Transparency specialist managing clinical trial registration, results disclosure, and compliance with transparency regulations.',
        'Expert Agent - Trial Disclosure',
        v_pharma_function_id, 'Medical Affairs', v_dept_clinical_ops, 'Clinical Operations Support',
        'expert', 'expert', v_master_clinical, 'pharmaceuticals',
        'You are a Clinical Trial Disclosure Manager ensuring transparency compliance. Manage trial registration, results posting, and maintain compliance with global disclosure requirements.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['trial-registration', 'results-disclosure', 'transparency-compliance', 'clinicaltrials-gov'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Clinical Trial Disclosure Manager', v_count;
    
    -- =====================================================
    -- MEDICAL EXCELLENCE & GOVERNANCE DEPARTMENT (3 agents)
    -- =====================================================
    
    -- Expert 24: Medical Excellence Director
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Excellence Director', 'medical-excellence-director',
        'Leader driving medical affairs excellence',
        'Leader driving medical affairs excellence through best practices, quality frameworks, and continuous improvement initiatives.',
        'Expert Agent - Medical Excellence',
        v_pharma_function_id, 'Medical Affairs', v_dept_excellence_gov, 'Medical Excellence & Governance',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Excellence Director driving best practices and quality in medical affairs. Develop excellence frameworks, implement quality initiatives, and ensure medical affairs optimization.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['excellence-frameworks', 'best-practices', 'quality-improvement', 'capability-building'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Medical Excellence Director', v_count;
    
    -- Expert 25: Medical Review Committee Coordinator
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Review Committee Coordinator', 'medical-review-committee-coordinator',
        'Governance specialist managing review processes',
        'Governance specialist managing medical review processes, approval workflows, and committee coordination.',
        'Expert Agent - Medical Governance',
        v_pharma_function_id, 'Medical Affairs', v_dept_excellence_gov, 'Medical Excellence & Governance',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Review Committee Coordinator managing medical governance processes. Coordinate review committees, manage approval workflows, and ensure compliance with medical standards.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['review-processes', 'committee-coordination', 'approval-workflows', 'compliance-monitoring'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Medical Review Committee Coordinator', v_count;
    
    -- Expert 26: Medical Quality Assurance Manager
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Quality Assurance Manager', 'medical-quality-assurance-manager',
        'Quality expert ensuring medical affairs standards',
        'Quality expert ensuring medical affairs activities meet quality standards and regulatory requirements.',
        'Expert Agent - Medical QA',
        v_pharma_function_id, 'Medical Affairs', v_dept_excellence_gov, 'Medical Excellence & Governance',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Quality Assurance Manager ensuring quality standards in medical affairs. Develop QA processes, conduct audits, and maintain compliance with quality systems.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['quality-systems', 'sops', 'audits', 'capa-management'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Medical Quality Assurance Manager', v_count;
    
    -- =====================================================
    -- MEDICAL STRATEGY & OPERATIONS DEPARTMENT (4 agents + 5 analytics)
    -- =====================================================
    
    -- Expert 27: Medical Affairs Strategist
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Affairs Strategist', 'medical-affairs-strategist',
        'Strategic leader driving medical affairs initiatives',
        'Strategic leader driving medical affairs initiatives aligned with business objectives and scientific priorities.',
        'Expert Agent - Medical Strategy',
        v_pharma_function_id, 'Medical Affairs', v_dept_strategy_ops, 'Medical Strategy & Operations',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Affairs Strategist responsible for developing and implementing strategic medical plans. Align medical activities with business objectives and drive cross-functional collaboration.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['strategic-planning', 'cross-functional-leadership', 'resource-allocation', 'lifecycle-management'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Medical Affairs Strategist', v_count;
    
    -- Expert 28: Therapeutic Area Expert
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Therapeutic Area Expert', 'therapeutic-area-expert',
        'Deep clinical expert providing TA leadership',
        'Deep clinical expert providing therapeutic area leadership and scientific guidance across medical affairs initiatives.',
        'Expert Agent - Therapeutic Area',
        v_pharma_function_id, 'Medical Affairs', v_dept_strategy_ops, 'Medical Strategy & Operations',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Therapeutic Area Expert providing deep clinical and scientific expertise. Guide medical strategy, support clinical development, and serve as the internal medical expert.',
        'gpt-4o', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['therapeutic-area-strategy', 'clinical-expertise', 'kol-management', 'scientific-platforms'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Therapeutic Area Expert', v_count;
    
    -- Expert 29: Global Medical Advisor
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Global Medical Advisor', 'global-medical-advisor',
        'Senior medical leader coordinating global strategies',
        'Senior medical leader coordinating global medical strategies and ensuring consistency across regions.',
        'Expert Agent - Global Medical',
        v_pharma_function_id, 'Medical Affairs', v_dept_strategy_ops, 'Medical Strategy & Operations',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Global Medical Advisor leading international medical affairs initiatives. Coordinate global medical strategies, ensure regional alignment, and manage global KOL relationships.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['global-strategy', 'regional-coordination', 'international-kols', 'global-governance'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Global Medical Advisor', v_count;
    
    -- Expert 30: Medical Affairs Operations Manager
    v_count := v_count + 1;
    INSERT INTO agents (
        tenant_id, name, slug, tagline, description, title, function_id, function_name,
        department_id, department_name, expertise_level, agent_level, master_agent_id,
        industry_vertical, system_prompt, base_model, temperature, max_tokens,
        reasoning_capabilities, can_spawn_specialists, domain_expertise, status
    ) VALUES (
        v_tenant_id, 'Medical Affairs Operations Manager', 'medical-affairs-operations-manager',
        'Operations leader ensuring efficient MA processes',
        'Operations leader ensuring efficient medical affairs processes, resource management, and cross-functional coordination.',
        'Expert Agent - Medical Operations',
        v_pharma_function_id, 'Medical Affairs', v_dept_strategy_ops, 'Medical Strategy & Operations',
        'expert', 'expert', v_master_operations, 'pharmaceuticals',
        'You are a Medical Affairs Operations Manager optimizing operational excellence. Manage budgets, streamline processes, coordinate resources, and ensure smooth execution of medical affairs initiatives.',
        'claude-3-opus', 0.7, 4000,
        '{"chain_of_thought": true}'::jsonb, true,
        ARRAY['operations-management', 'budget-management', 'process-optimization', 'vendor-management'],
        'development'
    );
    RAISE NOTICE '✓ [%/35] Created: Medical Affairs Operations Manager', v_count;
    
    -- =====================================================
    -- ANALYTICS EXPERTS (5 additional - already created earlier)
    -- =====================================================
    
    -- Update existing 5 analytics agents to Expert level and assign to master
    UPDATE agents 
    SET 
        agent_level = 'expert',
        master_agent_id = v_master_evidence,
        department_id = v_dept_strategy_ops,
        department_name = 'Medical Strategy & Operations'
    WHERE name IN (
        'Director of Medical Analytics',
        'Real-World Evidence Analyst',
        'Clinical Data Scientist',
        'Market Insights Analyst',
        'HCP Engagement Analytics Specialist'
    );
    
    RAISE NOTICE '✓ Updated 5 existing Analytics agents to Expert level';
    
    -- =====================================================
    -- Summary
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Expert Agents (Level 2) Creation Complete!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Total Expert Agents: 35 (30 new + 5 existing)';
    RAISE NOTICE '  - Field Medical: 4';
    RAISE NOTICE '  - Medical Information: 3';
    RAISE NOTICE '  - Medical Communications: 7';
    RAISE NOTICE '  - Evidence Generation & HEOR: 5';
    RAISE NOTICE '  - Clinical Operations: 4';
    RAISE NOTICE '  - Excellence & Governance: 3';
    RAISE NOTICE '  - Strategy & Operations: 9 (4 new + 5 analytics)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run seed_03_specialist_agents.sql (25 Specialist Agents)';
    RAISE NOTICE '';
END $$;

