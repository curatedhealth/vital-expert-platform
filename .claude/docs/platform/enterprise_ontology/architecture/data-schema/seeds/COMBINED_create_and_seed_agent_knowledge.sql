-- ============================================================================
-- COMBINED: Create Knowledge Sources + Map to Agents
-- Creates Medical Affairs knowledge domains and maps them to 165 agents
-- ============================================================================

DO $$
DECLARE
    v_pharma_tenant_id UUID;
    v_knowledge_count INTEGER := 0;
    v_mapping_count INTEGER := 0;
BEGIN
    RAISE NOTICE '📚 Starting Knowledge Sources Creation and Agent Mapping...';
    RAISE NOTICE '';

    -- Get pharmaceuticals tenant ID
    SELECT id INTO v_pharma_tenant_id 
    FROM tenants 
    WHERE name = 'Pharmaceuticals' 
    LIMIT 1;

    IF v_pharma_tenant_id IS NULL THEN
        v_pharma_tenant_id := '00000000-0000-0000-0000-000000000001'::uuid;
        RAISE NOTICE '⚠️  Using default tenant ID';
    END IF;

    -- ========================================================================
    -- PART 1: CREATE KNOWLEDGE SOURCES
    -- ========================================================================
    RAISE NOTICE '📊 Creating Medical Affairs Knowledge Sources...';

    -- Clinical Operations & Trials
    INSERT INTO knowledge_sources (title, domain, status, tags, metadata, tenant_id, chunk_count)
    VALUES
    ('Clinical Trial Design & Methodology', 'Clinical Operations', 'active', 
     ARRAY['clinical trials', 'methodology', 'protocol'], 
     '{"category": "Clinical Operations", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('ICH-GCP Guidelines', 'Clinical Operations', 'active',
     ARRAY['ich', 'gcp', 'guidelines', 'compliance'],
     '{"category": "Clinical Operations", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Site Management & Monitoring', 'Clinical Operations', 'active',
     ARRAY['site management', 'monitoring', 'clinical operations'],
     '{"category": "Clinical Operations", "expertise_level": "intermediate"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- Field Medical & MSL
    ('MSL Core Competencies', 'Field Medical', 'active',
     ARRAY['msl', 'field medical', 'competencies'],
     '{"category": "Field Medical", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('KOL Engagement Strategies', 'Field Medical', 'active',
     ARRAY['kol', 'engagement', 'stakeholder management'],
     '{"category": "Field Medical", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Therapeutic Area Knowledge', 'Field Medical', 'active',
     ARRAY['therapeutic area', 'disease state', 'medical knowledge'],
     '{"category": "Field Medical", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- HEOR & Evidence
    ('Health Economics Principles', 'HEOR & Evidence', 'active',
     ARRAY['heor', 'health economics', 'value demonstration'],
     '{"category": "HEOR & Evidence", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Real-World Evidence Generation', 'HEOR & Evidence', 'active',
     ARRAY['rwe', 'real-world evidence', 'observational studies'],
     '{"category": "HEOR & Evidence", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Market Access & Reimbursement', 'HEOR & Evidence', 'active',
     ARRAY['market access', 'reimbursement', 'payer strategies'],
     '{"category": "HEOR & Evidence", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- Medical Information
    ('Medical Information Standards', 'Medical Information', 'active',
     ARRAY['medical information', 'inquiry management', 'standards'],
     '{"category": "Medical Information", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Pharmacovigilance & Safety', 'Medical Information', 'active',
     ARRAY['pharmacovigilance', 'safety', 'adverse events'],
     '{"category": "Medical Information", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Drug Information Resources', 'Medical Information', 'active',
     ARRAY['drug information', 'resources', 'databases'],
     '{"category": "Medical Information", "expertise_level": "intermediate"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- Regulatory & Compliance
    ('FDA Regulations & Guidance', 'Regulatory & Compliance', 'active',
     ARRAY['fda', 'regulatory', 'compliance'],
     '{"category": "Regulatory & Compliance", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('EMA Regulations & Guidance', 'Regulatory & Compliance', 'active',
     ARRAY['ema', 'european', 'regulatory'],
     '{"category": "Regulatory & Compliance", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Medical Affairs Compliance Framework', 'Regulatory & Compliance', 'active',
     ARRAY['compliance', 'medical affairs', 'governance'],
     '{"category": "Regulatory & Compliance", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- Publications & Communications
    ('Medical Writing Standards', 'Publications', 'active',
     ARRAY['medical writing', 'scientific writing', 'standards'],
     '{"category": "Publications", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Publication Planning & Strategy', 'Publications', 'active',
     ARRAY['publication planning', 'strategy', 'dissemination'],
     '{"category": "Publications", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Scientific Communication Best Practices', 'Scientific Communications', 'active',
     ARRAY['scientific communication', 'best practices', 'stakeholder engagement'],
     '{"category": "Scientific Communications", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- Medical Education
    ('HCP Education Strategies', 'Medical Education', 'active',
     ARRAY['hcp education', 'training', 'continuing education'],
     '{"category": "Medical Education", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Digital Learning Platforms', 'Medical Education', 'active',
     ARRAY['digital learning', 'elearning', 'platforms'],
     '{"category": "Medical Education", "expertise_level": "intermediate"}'::jsonb,
     v_pharma_tenant_id, 0),

    -- General Medical Affairs
    ('Evidence-Based Medicine', 'General', 'active',
     ARRAY['ebm', 'evidence-based', 'clinical evidence'],
     '{"category": "General", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Biostatistics & Epidemiology', 'General', 'active',
     ARRAY['biostatistics', 'epidemiology', 'data analysis'],
     '{"category": "General", "expertise_level": "advanced"}'::jsonb,
     v_pharma_tenant_id, 0),
    
    ('Medical Affairs Leadership', 'General', 'active',
     ARRAY['leadership', 'strategy', 'medical affairs'],
     '{"category": "General", "expertise_level": "expert"}'::jsonb,
     v_pharma_tenant_id, 0)
    
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_knowledge_count = ROW_COUNT;
    RAISE NOTICE '✅ Created % knowledge sources', v_knowledge_count;
    RAISE NOTICE '';

    -- ========================================================================
    -- PART 2: MAP KNOWLEDGE TO AGENTS BY LEVEL AND DEPARTMENT
    -- ========================================================================
    RAISE NOTICE '📊 Mapping knowledge sources to agents...';

    -- Level 1: Masters get ALL knowledge sources
    INSERT INTO agent_knowledge (agent_id, source_id, relevance_score, is_primary, can_cite)
    SELECT 
        a.id,
        ks.id,
        1.0,
        true,
        true
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    CROSS JOIN knowledge_sources ks
    WHERE al.level_number = 1
        AND a.deleted_at IS NULL
        AND ks.status = 'active'
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_mapping_count = ROW_COUNT;
    RAISE NOTICE '  ├─ Level 1 (Masters): % mappings', v_mapping_count;

    -- Level 2 & 3: Experts and Specialists get department-specific knowledge
    INSERT INTO agent_knowledge (agent_id, source_id, relevance_score, is_primary, can_cite)
    SELECT 
        a.id,
        ks.id,
        CASE 
            WHEN al.level_number = 2 THEN 0.9
            WHEN al.level_number = 3 THEN 0.8
            ELSE 0.7
        END,
        CASE WHEN al.level_number = 2 THEN true ELSE false END,
        true
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN knowledge_sources ks ON (
        (a.department_name ILIKE '%' || ks.domain || '%')
        OR (ks.domain = 'General')
        OR (
            a.department_name ILIKE '%clinical%' AND ks.domain IN ('Clinical Operations', 'General')
        )
        OR (
            a.department_name ILIKE '%field%' AND ks.domain IN ('Field Medical', 'General')
        )
        OR (
            a.department_name ILIKE '%heor%' AND ks.domain IN ('HEOR & Evidence', 'General')
        )
        OR (
            a.department_name ILIKE '%information%' AND ks.domain IN ('Medical Information', 'General')
        )
        OR (
            a.department_name ILIKE '%compliance%' AND ks.domain IN ('Regulatory & Compliance', 'General')
        )
        OR (
            a.department_name ILIKE '%publication%' AND ks.domain IN ('Publications', 'General')
        )
        OR (
            a.department_name ILIKE '%communication%' AND ks.domain IN ('Scientific Communications', 'General')
        )
        OR (
            a.department_name ILIKE '%education%' AND ks.domain IN ('Medical Education', 'General')
        )
    )
    WHERE al.level_number IN (2, 3)
        AND a.deleted_at IS NULL
        AND ks.status = 'active'
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_mapping_count = ROW_COUNT;
    RAISE NOTICE '  ├─ Level 2 & 3 (Experts/Specialists): % mappings', v_mapping_count;

    -- Level 4 & 5: Workers and Tool agents get General knowledge only
    INSERT INTO agent_knowledge (agent_id, source_id, relevance_score, is_primary, can_cite)
    SELECT 
        a.id,
        ks.id,
        0.6,
        false,
        true
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN knowledge_sources ks ON ks.domain = 'General'
    WHERE al.level_number IN (4, 5)
        AND a.deleted_at IS NULL
        AND ks.status = 'active'
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_mapping_count = ROW_COUNT;
    RAISE NOTICE '  └─ Level 4 & 5 (Workers/Tools): % mappings', v_mapping_count;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 Knowledge mapping complete!';
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Summary by agent level
SELECT 
    '=== KNOWLEDGE MAPPINGS BY LEVEL ===' as section,
    al.name as level_name,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT ak.agent_id) as agents_with_knowledge,
    COUNT(ak.id) as total_mappings,
    ROUND(AVG(knowledge_count), 1) as avg_knowledge_per_agent
FROM agent_levels al
LEFT JOIN agents a ON a.agent_level_id = al.id AND a.deleted_at IS NULL
LEFT JOIN agent_knowledge ak ON ak.agent_id = a.id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as knowledge_count
    FROM agent_knowledge
    WHERE agent_id = a.id
) kc ON true
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

-- Knowledge sources by domain
SELECT 
    '=== KNOWLEDGE SOURCES BY DOMAIN ===' as section,
    domain,
    COUNT(*) as source_count,
    COUNT(DISTINCT ak.agent_id) as agents_using
FROM knowledge_sources ks
LEFT JOIN agent_knowledge ak ON ak.source_id = ks.id
WHERE ks.status = 'active'
GROUP BY domain
ORDER BY agents_using DESC;

-- Final summary
SELECT 
    '=== FINAL SUMMARY ===' as section,
    (SELECT COUNT(*) FROM knowledge_sources WHERE status = 'active') as total_knowledge_sources,
    (SELECT COUNT(*) FROM agents WHERE deleted_at IS NULL) as total_agents,
    COUNT(DISTINCT ak.agent_id) as agents_with_knowledge,
    COUNT(DISTINCT ak.source_id) as unique_sources_used,
    COUNT(*) as total_mappings
FROM agent_knowledge ak;

