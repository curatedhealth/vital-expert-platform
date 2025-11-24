-- =====================================================
-- Agent Skills Seed Data
-- =====================================================
-- Seeds executable skills for Medical Affairs Analytics agents
-- based on AgentOS 2.0+ schema
-- =====================================================

DO $$
DECLARE
    v_director_id UUID;
    v_rwe_analyst_id UUID;
    v_clinical_ds_id UUID;
    v_market_insights_id UUID;
    v_hcp_analytics_id UUID;
    
    v_skill_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Seeding Agent Skills';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';

    -- Get agent IDs
    SELECT id INTO v_director_id FROM agents WHERE name = 'Director of Medical Analytics';
    SELECT id INTO v_rwe_analyst_id FROM agents WHERE name = 'Real-World Evidence Analyst';
    SELECT id INTO v_clinical_ds_id FROM agents WHERE name = 'Clinical Data Scientist';
    SELECT id INTO v_market_insights_id FROM agents WHERE name = 'Market Insights Analyst';
    SELECT id INTO v_hcp_analytics_id FROM agents WHERE name = 'HCP Engagement Analytics Specialist';

    -- =====================================================
    -- CORE SKILLS (Shared)
    -- =====================================================
    
    -- Skill: Data Analysis
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Advanced Data Analysis',
        'Expertise in statistical analysis, data visualization, and insight generation',
        'analytical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    
    -- Assign to all agents
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_director_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_rwe_analyst_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_clinical_ds_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_market_insights_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_hcp_analytics_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ Skill: Advanced Data Analysis (assigned to all agents)';

    -- Skill: Report Generation
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Executive Reporting',
        'Create clear, actionable reports and presentations for stakeholders',
        'communication',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_director_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_rwe_analyst_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_clinical_ds_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_market_insights_id, v_skill_id) ON CONFLICT DO NOTHING;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_hcp_analytics_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ Skill: Executive Reporting (assigned to all agents)';

    -- =====================================================
    -- RWE ANALYST SPECIALIZED SKILLS
    -- =====================================================
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Real-World Evidence Analysis',
        'Analyze RWD from claims, EHR, registries using epidemiological methods',
        'domain_expertise',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_rwe_analyst_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Health Economics & Outcomes Research',
        'Conduct HEOR studies, cost-effectiveness analysis, and budget impact models',
        'domain_expertise',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_rwe_analyst_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Propensity Score Methods',
        'Apply propensity score matching, weighting, and stratification for causal inference',
        'technical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_rwe_analyst_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ RWE Analyst: 3 specialized skills assigned';

    -- =====================================================
    -- CLINICAL DATA SCIENTIST SPECIALIZED SKILLS
    -- =====================================================
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Clinical Trial Analytics',
        'Analyze clinical trial data with regulatory-compliant statistical methods',
        'domain_expertise',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_clinical_ds_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Machine Learning & Predictive Modeling',
        'Build and validate ML models for clinical prediction and patient stratification',
        'technical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_clinical_ds_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Biomarker Analysis',
        'Identify, validate, and assess performance of clinical biomarkers',
        'domain_expertise',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_clinical_ds_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ Clinical Data Scientist: 3 specialized skills assigned';

    -- =====================================================
    -- MARKET INSIGHTS ANALYST SPECIALIZED SKILLS
    -- =====================================================
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Pharmaceutical Market Analysis',
        'Analyze market dynamics, trends, and competitive landscape in pharma',
        'domain_expertise',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_market_insights_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Competitive Intelligence',
        'Gather and analyze competitive data, positioning, and pipeline',
        'analytical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_market_insights_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Launch Analytics',
        'Model and track product launch performance and uptake trajectories',
        'analytical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_market_insights_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ Market Insights Analyst: 3 specialized skills assigned';

    -- =====================================================
    -- HCP ANALYTICS SPECIALIST SPECIALIZED SKILLS
    -- =====================================================
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'HCP Engagement Analytics',
        'Analyze HCP behavior, engagement patterns, and omnichannel interactions',
        'domain_expertise',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_hcp_analytics_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'MSL Effectiveness Measurement',
        'Track and optimize MSL activity, productivity, and impact',
        'analytical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_hcp_analytics_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'KOL Identification & Mapping',
        'Identify key opinion leaders and map influence networks',
        'analytical',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_hcp_analytics_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ HCP Analytics Specialist: 3 specialized skills assigned';

    -- =====================================================
    -- DIRECTOR SPECIALIZED SKILLS
    -- =====================================================
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Strategic Synthesis',
        'Synthesize insights from multiple domains into strategic recommendations',
        'leadership',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_director_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO skills (name, description, skill_type, is_active)
    VALUES (
        'Team Coordination & Delegation',
        'Coordinate specialist teams and delegate work based on complexity and domain',
        'leadership',
        true
    )
    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_skill_id;
    INSERT INTO agent_skills (agent_id, skill_id) VALUES (v_director_id, v_skill_id) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ Director: 2 leadership skills assigned';

    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Skills Seeding Complete!';
    RAISE NOTICE '==================================================';

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show skill assignments per agent
SELECT 
    a.name as agent_name,
    COUNT(DISTINCT s.id) as total_skills,
    STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name) as skills
FROM agents a
JOIN agent_skills ags ON a.id = ags.agent_id
JOIN skills s ON ags.skill_id = s.id
WHERE a.name IN (
    'Director of Medical Analytics',
    'Real-World Evidence Analyst',
    'Clinical Data Scientist',
    'Market Insights Analyst',
    'HCP Engagement Analytics Specialist'
)
GROUP BY a.name
ORDER BY 
    CASE 
        WHEN a.name = 'Director of Medical Analytics' THEN 1
        ELSE 2
    END,
    a.name;

