-- =====================================================
-- HIERARCHICAL AGENTS SEED DATA
-- AgentOS 3.0 - Phase 2 Task 7
-- 
-- Creates example hierarchical agent configurations based on:
-- - Deep Agents Integration Guide
-- - VITAL Platform Vision (Medical Affairs use cases)
-- =====================================================

-- Prerequisites: Run after phase0_schema_completion.sql

\echo ''
\echo '=================================================='
\echo 'Seeding Hierarchical Agent Configurations'
\echo '=================================================='
\echo ''

-- =====================================================
-- Example 1: FDA 510(k) Regulatory Expert
-- =====================================================

\echo 'Creating FDA 510(k) Regulatory Expert with 3 sub-agents...'

-- Parent Agent: FDA 510(k) Expert
DO $$
DECLARE
    v_fda_expert_id UUID;
    v_predicate_search_id UUID;
    v_equivalence_analyst_id UUID;
    v_testing_specialist_id UUID;
BEGIN
    -- Create FDA 510(k) Expert (parent)
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        filesystem_backend_type,
        memory_enabled,
        subagent_spawning_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'fda-510k-expert',
        'FDA 510(k) Regulatory Expert',
        'Expert in FDA 510(k) premarket submissions. Specializes in predicate device identification, substantial equivalence analysis, and regulatory strategy.',
        'You are Dr. Sarah Mitchell, an FDA 510(k) regulatory expert with 15+ years experience and 500+ successful submissions.

Your expertise:
- Predicate device identification and comparison
- Substantial equivalence determination
- Testing requirements and validation protocols
- Submission strategy and timeline development

You have specialized sub-agents available:
- Predicate Search Specialist: Searches FDA database for appropriate predicates
- Substantial Equivalence Analyst: Analyzes device comparisons
- Testing Requirements Specialist: Determines validation needs

Use sub-agents for specialized analysis to keep your context focused on strategy.

File organization:
- Save device specs to /working/device/specifications.md
- Store predicate analysis in /working/predicates/
- Keep substantial equivalence in /working/analysis/
- Final strategy in /memories/strategies/

Memory:
- Check /memories/organization/previous_submissions.md for successful approaches
- Save winning strategies to /memories/strategies/ for future reference',
        'gpt-4-turbo-preview',
        0.3,
        true,  -- deep_agents_enabled
        'composite',  -- filesystem_backend_type
        true,  -- memory_enabled
        true,  -- subagent_spawning_enabled
        3,  -- Tier 3 (Executive/Strategic)
        true
    )
    RETURNING id INTO v_fda_expert_id;
    
    -- Sub-Agent 1: Predicate Search Specialist
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'predicate-search-specialist',
        'Predicate Device Search Specialist',
        'Expert at searching FDA database for appropriate predicate devices. Analyzes device classifications and identifies potential predicates for 510(k) submissions.',
        'You are a predicate device search specialist.

When given a device description:
1. Use fda_database_search to find similar devices
2. Analyze device classifications (product codes)
3. Identify 510(k) clearance status
4. Return top 3-5 potential predicates with 510(k) numbers

Save results to /working/predicates/search_results.md for parent agent reference.',
        'gpt-4-turbo-preview',
        0.2,
        false,
        2,  -- Tier 2 (Specialist)
        true
    )
    RETURNING id INTO v_predicate_search_id;
    
    -- Sub-Agent 2: Substantial Equivalence Analyst
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'substantial-equivalence-analyst',
        'Substantial Equivalence Analyst',
        'Expert at analyzing substantial equivalence between subject and predicate devices. Compares technological characteristics and intended use.',
        'You are a substantial equivalence analyst.

When comparing subject device to predicate:
1. Read device specs from /working/device/specifications.md
2. Analyze technological characteristics (materials, design, performance)
3. Assess intended use equivalence
4. Identify any differences requiring additional testing
5. Generate detailed comparison table

Output: /working/analysis/substantial_equivalence_assessment.md

Be thorough and cite specific FDA guidance documents.',
        'gpt-4-turbo-preview',
        0.2,
        false,
        2,  -- Tier 2 (Specialist)
        true
    )
    RETURNING id INTO v_equivalence_analyst_id;
    
    -- Sub-Agent 3: Testing Requirements Specialist
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'testing-requirements-specialist',
        'Testing Requirements Specialist',
        'Expert in determining testing and validation requirements for 510(k) submissions. Specializes in biocompatibility, performance, and software validation.',
        'You are a testing requirements specialist.

Your expertise:
- Biocompatibility testing (ISO 10993)
- Performance/bench testing
- Software validation (if applicable)
- Shelf-life and sterility testing

When analyzing device:
1. Review device type and patient contact
2. Determine applicable FDA guidance documents
3. Specify required testing per guidance
4. Identify pass/fail criteria
5. Estimate testing timeline and cost

Output: /working/testing/requirements_specification.md',
        'gpt-4-turbo-preview',
        0.2,
        false,
        2,  -- Tier 2 (Specialist)
        true
    )
    RETURNING id INTO v_testing_specialist_id;
    
    -- Create Hierarchies
    INSERT INTO agent_hierarchies (
        parent_agent_id,
        child_agent_id,
        delegation_criteria,
        execution_order,
        aggregation_strategy,
        max_recursion_depth
    ) VALUES
    (
        v_fda_expert_id,
        v_predicate_search_id,
        '{
            "triggers": ["predicate device", "search FDA", "find similar devices"],
            "keywords": ["510(k)", "predicate", "FDA database"],
            "complexity_threshold": 0.5,
            "execution_mode": ["chat_autonomous", "workflow_task"]
        }'::jsonb,
        1,
        'synthesize',
        2
    ),
    (
        v_fda_expert_id,
        v_equivalence_analyst_id,
        '{
            "triggers": ["substantial equivalence", "compare devices", "device comparison"],
            "keywords": ["equivalence", "technological characteristics", "intended use"],
            "complexity_threshold": 0.6,
            "execution_mode": ["chat_autonomous", "workflow_task"]
        }'::jsonb,
        2,
        'synthesize',
        2
    ),
    (
        v_fda_expert_id,
        v_testing_specialist_id,
        '{
            "triggers": ["testing", "validation", "biocompatibility", "performance testing"],
            "keywords": ["test", "validation", "ISO 10993", "bench testing"],
            "complexity_threshold": 0.7,
            "execution_mode": ["chat_autonomous", "workflow_task"]
        }'::jsonb,
        3,
        'synthesize',
        2
    );
    
    RAISE NOTICE 'FDA 510(k) Expert created with 3 sub-agents';
    RAISE NOTICE 'Parent Agent ID: %', v_fda_expert_id;
END $$;

-- =====================================================
-- Example 2: Clinical Trial Designer
-- =====================================================

\echo 'Creating Clinical Trial Designer with 2 sub-agents...'

DO $$
DECLARE
    v_trial_designer_id UUID;
    v_biostatistician_id UUID;
    v_protocol_writer_id UUID;
BEGIN
    -- Parent Agent: Clinical Trial Designer
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        filesystem_backend_type,
        memory_enabled,
        subagent_spawning_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'clinical-trial-designer',
        'Clinical Trial Designer',
        'Expert in clinical trial protocol development. Specializes in study design, statistical planning, and regulatory compliance for FDA/EMA trials.',
        'You are Dr. Lisa Anderson, a clinical trial design expert with 20+ years experience.

Your expertise:
- FDA/EMA trial requirements
- Study design (superiority, non-inferiority, equivalence)
- Endpoint selection and validation
- Patient population definition

You have specialized sub-agents:
- Biostatistician: Sample size, power analysis, statistical design
- Protocol Writer: Formal protocol documentation

Protocol development process:
1. Define objectives and endpoints
2. Delegate statistical design to biostatistician
3. Define population and procedures
4. Delegate protocol writing
5. Review and refine

File organization:
/working/protocol/ - Protocol sections
/working/statistics/ - Statistical plans
/memories/organization/previous_trials.md - Learn from past trials',
        'gpt-4-turbo-preview',
        0.5,
        true,
        'composite',
        true,
        true,
        3,  -- Tier 3 (Strategic)
        true
    )
    RETURNING id INTO v_trial_designer_id;
    
    -- Sub-Agent: Biostatistician
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'biostatistician',
        'Clinical Biostatistician',
        'Expert in clinical trial statistics. Performs sample size calculations, power analysis, and statistical plan development.',
        'You are Dr. Robert Chen, a biostatistician.

When asked for statistical design:
1. Clarify study objectives (superiority, non-inferiority, equivalence)
2. Use sample_size_calculator for power calculations
3. Recommend appropriate statistical tests
4. Specify interim analysis plan
5. Define stopping rules

Output detailed statistical analysis plan to /working/statistics/sap.md',
        'gpt-4-turbo-preview',
        0.3,
        false,
        2,
        true
    )
    RETURNING id INTO v_biostatistician_id;
    
    -- Sub-Agent: Protocol Writer
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'protocol-writer',
        'Clinical Protocol Writer',
        'Expert at writing formal clinical trial protocols in ICH E6 GCP format.',
        'You are a clinical protocol writer.

When given study design:
1. Format protocol per ICH E6 guidelines
2. Include all required sections
3. Use precise medical terminology
4. Cite relevant regulatory guidance
5. Ensure internal consistency

Output: /working/protocol/complete_protocol.docx',
        'gpt-4-turbo-preview',
        0.2,
        false,
        2,
        true
    )
    RETURNING id INTO v_protocol_writer_id;
    
    -- Create Hierarchies
    INSERT INTO agent_hierarchies (
        parent_agent_id,
        child_agent_id,
        delegation_criteria,
        execution_order,
        aggregation_strategy,
        max_recursion_depth
    ) VALUES
    (
        v_trial_designer_id,
        v_biostatistician_id,
        '{
            "triggers": ["sample size", "statistical", "power analysis", "statistical plan"],
            "keywords": ["statistics", "sample size", "power", "analysis"],
            "complexity_threshold": 0.6,
            "execution_mode": ["chat_autonomous", "workflow_task"]
        }'::jsonb,
        1,
        'synthesize',
        2
    ),
    (
        v_trial_designer_id,
        v_protocol_writer_id,
        '{
            "triggers": ["write protocol", "protocol document", "formal protocol"],
            "keywords": ["protocol", "write", "document", "ICH"],
            "complexity_threshold": 0.5,
            "execution_mode": ["chat_autonomous", "workflow_task"]
        }'::jsonb,
        2,
        'synthesize',
        2
    );
    
    RAISE NOTICE 'Clinical Trial Designer created with 2 sub-agents';
    RAISE NOTICE 'Parent Agent ID: %', v_trial_designer_id;
END $$;

-- =====================================================
-- Example 3: Medical Information Specialist
-- =====================================================

\echo 'Creating Medical Information Specialist with 3 sub-agents...'

DO $$
DECLARE
    v_med_info_id UUID;
    v_drug_safety_id UUID;
    v_pharmacology_id UUID;
    v_dosing_id UUID;
BEGIN
    -- Parent Agent: Medical Information Specialist
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        temperature,
        deep_agents_enabled,
        filesystem_backend_type,
        memory_enabled,
        subagent_spawning_enabled,
        tier,
        is_active
    ) VALUES (
        gen_random_uuid(),
        'medical-information-specialist',
        'Medical Information Specialist',
        'Expert in providing comprehensive medical information about pharmaceutical products. Responds to HCP inquiries with evidence-based information.',
        'You are Dr. Emily Zhang, a Medical Information Specialist.

Your expertise:
- Product knowledge and clinical data
- Safety profile and adverse events
- Dosing and administration
- Drug interactions

You have specialized sub-agents:
- Drug Safety Expert: Safety profiles, contraindications, warnings
- Pharmacology Expert: Mechanism of action, PK/PD
- Dosing Expert: Dosing adjustments, special populations

For complex inquiries, delegate to appropriate sub-agent(s) then synthesize comprehensive response.

Always maintain regulatory compliance (promotional vs non-promotional).

File organization:
/working/inquiry/ - Current inquiry analysis
/memories/common_questions/ - Frequently asked questions',
        'claude-3-5-sonnet-20241022',
        0.3,
        true,
        'composite',
        true,
        true,
        2,  -- Tier 2 (Strategic)
        true
    )
    RETURNING id INTO v_med_info_id;
    
    -- Sub-Agents...
    INSERT INTO agents (
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        tier,
        is_active
    ) VALUES
    (
        gen_random_uuid(),
        'drug-safety-expert',
        'Drug Safety Expert',
        'Specializes in drug safety profiles, contraindications, warnings, and adverse event data.',
        'You are a drug safety expert. When queried about safety, provide evidence-based information on contraindications, warnings, precautions, and adverse events. Always cite clinical trial data or real-world evidence.',
        'claude-3-5-sonnet-20241022',
        2,
        true
    ),
    (
        gen_random_uuid(),
        'pharmacology-expert',
        'Pharmacology Expert',
        'Specializes in mechanism of action, pharmacokinetics, and pharmacodynamics.',
        'You are a pharmacology expert. Explain mechanism of action, PK/PD, and drug-drug interactions with scientific precision. Use appropriate medical terminology.',
        'claude-3-5-sonnet-20241022',
        2,
        true
    ),
    (
        gen_random_uuid(),
        'dosing-expert',
        'Dosing Expert',
        'Specializes in dosing recommendations, adjustments for special populations, and administration guidance.',
        'You are a dosing expert. Provide precise dosing information including adjustments for renal/hepatic impairment, pediatric/geriatric populations, and drug interactions.',
        'claude-3-5-sonnet-20241022',
        2,
        true
    )
    RETURNING id INTO v_drug_safety_id, v_pharmacology_id, v_dosing_id;
    
    -- Create Hierarchies
    INSERT INTO agent_hierarchies (
        parent_agent_id,
        child_agent_id,
        delegation_criteria,
        execution_order,
        aggregation_strategy
    ) VALUES
    (
        v_med_info_id,
        v_drug_safety_id,
        '{"triggers": ["safety", "adverse events", "contraindications", "warnings"], "keywords": ["safe", "AE", "contraindicated"], "complexity_threshold": 0.5}'::jsonb,
        1,
        'synthesize',
        2
    ),
    (
        v_med_info_id,
        v_pharmacology_id,
        '{"triggers": ["mechanism", "pharmacokinetics", "PK/PD", "how it works"], "keywords": ["mechanism", "PK", "PD", "metabolism"], "complexity_threshold": 0.6}'::jsonb,
        2,
        'synthesize',
        2
    ),
    (
        v_med_info_id,
        v_dosing_id,
        '{"triggers": ["dosing", "dose", "administration", "renal impairment"], "keywords": ["dose", "dosing", "mg", "administration"], "complexity_threshold": 0.5}'::jsonb,
        3,
        'synthesize',
        2
    );
    
    RAISE NOTICE 'Medical Information Specialist created with 3 sub-agents';
    RAISE NOTICE 'Parent Agent ID: %', v_med_info_id;
END $$;

\echo ''
\echo '=================================================='
\echo 'Hierarchical Agents Seeded Successfully!'
\echo '=================================================='
\echo ''
\echo 'Created:'
\echo '  - FDA 510(k) Expert (3 sub-agents)'
\echo '  - Clinical Trial Designer (2 sub-agents)'
\echo '  - Medical Information Specialist (3 sub-agents)'
\echo ''
\echo 'Total: 3 parent agents, 8 sub-agents'
\echo ''

-- Verification Query
SELECT 
    'Hierarchical Agents Summary' as summary,
    COUNT(DISTINCT parent_agent_id) as parent_agents,
    COUNT(DISTINCT child_agent_id) as sub_agents,
    COUNT(*) as total_hierarchies
FROM agent_hierarchies
WHERE is_active = true AND deleted_at IS NULL;

