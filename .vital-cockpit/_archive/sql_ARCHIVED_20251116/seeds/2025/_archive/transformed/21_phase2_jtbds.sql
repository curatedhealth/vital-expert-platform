-- =====================================================================================
-- PHASE 2 ALL JTBDs (127 JTBDs)
-- =====================================================================================
-- Source: Phase 2 Combined JTBD Library
-- Includes: Persona Master Catalogue, Digital Health Library, Comprehensive Coverage
-- Total: 127 JTBDs across all functional areas
-- =====================================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_count INTEGER := 0;
    v_persona_id UUID;
    v_jtbd_id UUID;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Platform tenant not found';
    END IF;
    
    RAISE NOTICE 'Importing Phase 2 All JTBDs...';
    RAISE NOTICE 'Platform tenant: %', v_tenant_id;
    

    -- JTBD_001: When planning clinical development strategy, I need comprehensive regulatory pat...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_001',
        'planning clinical development strategy',
        'When planning clinical development strategy, I need comprehensive regulatory pathway analysis with predictive timelines, so I can optimize resource allocation and minimize approval risk',
        'Clinical',
        'strategic',
        'very_high',
        'monthly',
        ARRAY[]::TEXT[],
        '["optimize resource allocation and minimize approval risk"]'::jsonb,
        'active',
        0.85,
        '{
  "unique_id": "phase2_jtbd_00001",
  "original_id": "jtbd00001",
  "persona_code": "P001_CDD",
  "persona_title": "CLINICAL DEVELOPMENT DIRECTOR",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "regulatory",
  "object": "comprehensive regulatory pathway analysis with predictive timelines",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_002: When managing multiple clinical trials, I need real-time visibility into enrollm...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_002',
        'managing multiple clinical trials',
        'When managing multiple clinical trials, I need real-time visibility into enrollment, data quality, and regulatory requirements, so I can proactively prevent delays and cost overruns',
        'Clinical',
        'operational',
        'high',
        'daily',
        ARRAY[]::TEXT[],
        '["proactively prevent delays and cost overruns"]'::jsonb,
        'active',
        0.75,
        '{
  "unique_id": "phase2_jtbd_00002",
  "original_id": "jtbd00002",
  "persona_code": "P001_CDD",
  "persona_title": "CLINICAL DEVELOPMENT DIRECTOR",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "visibility",
  "object": "real-time visibility into enrollment",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_003: When preparing regulatory submissions, I need automated evidence synthesis and g...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_003',
        'preparing regulatory submissions',
        'When preparing regulatory submissions, I need automated evidence synthesis and gap analysis, so I can ensure complete, high-quality dossiers and avoid FDA questions',
        'Clinical',
        'administrative',
        'high',
        'quarterly',
        ARRAY[]::TEXT[],
        '["ensure complete"]'::jsonb,
        'active',
        0.70,
        '{
  "unique_id": "phase2_jtbd_00003",
  "original_id": "jtbd00003",
  "persona_code": "P001_CDD",
  "persona_title": "CLINICAL DEVELOPMENT DIRECTOR",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "evidence",
  "object": "automated evidence synthesis and gap analysis",
  "importance": 9,
  "current_satisfaction": 5,
  "opportunity_score": 13
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_004: When developing DTx regulatory strategy, I need comprehensive FDA pathway analys...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_004',
        'developing DTx regulatory strategy',
        'When developing DTx regulatory strategy, I need comprehensive FDA pathway analysis and predicate device research, so I can choose the optimal approval route and avoid costly delays',
        'IT/Digital',
        'strategic',
        'very_high',
        'weekly',
        ARRAY[]::TEXT[],
        '["choose the optimal approval route and avoid costly delays"]'::jsonb,
        'active',
        0.90,
        '{
  "unique_id": "phase2_jtbd_00004",
  "original_id": "jtbd00004",
  "persona_code": "P002_DSC",
  "persona_title": "DTx STARTUP CEO",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "fda",
  "object": "comprehensive FDA pathway analysis and predicate device research",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_005: When designing clinical trials, I need evidence-based protocol development and s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_005',
        'designing clinical trials',
        'When designing clinical trials, I need evidence-based protocol development and statistical planning, so I can demonstrate efficacy with minimal sample size and budget',
        'IT/Digital',
        'operational',
        'very_high',
        'yearly',
        ARRAY[]::TEXT[],
        '["demonstrate efficacy with minimal sample size and budget"]'::jsonb,
        'active',
        0.85,
        '{
  "unique_id": "phase2_jtbd_00005",
  "original_id": "jtbd00005",
  "persona_code": "P002_DSC",
  "persona_title": "DTx STARTUP CEO",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "evidence-based",
  "object": "evidence-based protocol development and statistical planning",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_006: When seeking partnerships, I need competitive landscape analysis and partnership...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_006',
        'seeking partnerships',
        'When seeking partnerships, I need competitive landscape analysis and partnership opportunity identification, so I can maximize valuation and market access potential',
        'IT/Digital',
        'collaborative',
        'high',
        'monthly',
        ARRAY[]::TEXT[],
        '["maximize valuation and market access potential"]'::jsonb,
        'active',
        0.75,
        '{
  "unique_id": "phase2_jtbd_00006",
  "original_id": "jtbd00006",
  "persona_code": "P002_DSC",
  "persona_title": "DTx STARTUP CEO",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "competitive",
  "object": "competitive landscape analysis and partnership opportunity identification",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_007: When determining regulatory pathway, I need comprehensive analysis of device cla...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_007',
        'determining regulatory pathway',
        'When determining regulatory pathway, I need comprehensive analysis of device classification, predicate devices, and substantial equivalence requirements, so I can choose the most efficient approval route',
        'Regulatory',
        'administrative',
        'high',
        'yearly',
        ARRAY[]::TEXT[],
        '["choose the most efficient approval route"]'::jsonb,
        'active',
        0.75,
        '{
  "unique_id": "phase2_jtbd_00007",
  "original_id": "jtbd00007",
  "persona_code": "P003_RAD",
  "persona_title": "REGULATORY AFFAIRS DIRECTOR",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "analysis",
  "object": "comprehensive analysis of device classification",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_008: When preparing regulatory submissions, I need automated document compilation, ga...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_008',
        'preparing regulatory submissions',
        'When preparing regulatory submissions, I need automated document compilation, gap analysis, and quality review, so I can ensure complete, accurate submissions and avoid FDA questions',
        'Regulatory',
        'administrative',
        'very_high',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure complete"]'::jsonb,
        'active',
        0.80,
        '{
  "unique_id": "phase2_jtbd_00008",
  "original_id": "jtbd00008",
  "persona_code": "P003_RAD",
  "persona_title": "REGULATORY AFFAIRS DIRECTOR",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "document",
  "object": "automated document compilation",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_009: When monitoring regulatory changes, I need proactive alerts on new guidance, pol...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_009',
        'monitoring regulatory changes',
        'When monitoring regulatory changes, I need proactive alerts on new guidance, policy updates, and industry precedents, so I can adapt strategy and maintain compliance',
        'Regulatory',
        'administrative',
        'high',
        'daily',
        ARRAY[]::TEXT[],
        '["adapt strategy and maintain compliance"]'::jsonb,
        'active',
        0.70,
        '{
  "unique_id": "phase2_jtbd_00009",
  "original_id": "jtbd00009",
  "persona_code": "P003_RAD",
  "persona_title": "REGULATORY AFFAIRS DIRECTOR",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "alerts",
  "object": "proactive alerts on new guidance",
  "importance": 9,
  "current_satisfaction": 5,
  "opportunity_score": 13
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_010: When evaluating new digital health technologies for coverage, I need comprehensi...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_010',
        'evaluating new digital health technologies for coverage',
        'When evaluating new digital health technologies for coverage, I need comprehensive clinical evidence analysis and cost-effectiveness modeling, so I can make evidence-based coverage decisions that improve outcomes and control costs',
        'Market Access',
        'creative',
        'high',
        'weekly',
        ARRAY[]::TEXT[],
        '["make evidence-based coverage decisions that improve outcomes and control costs"]'::jsonb,
        'active',
        0.75,
        '{
  "unique_id": "phase2_jtbd_00010",
  "original_id": "jtbd00010",
  "persona_code": "P004_PCM",
  "persona_title": "PAYER CHIEF MEDICAL OFFICER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "clinical",
  "object": "comprehensive clinical evidence analysis and cost-effectiveness modeling",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_011: When managing population health initiatives, I need real-time analytics on membe...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_011',
        'managing population health initiatives',
        'When managing population health initiatives, I need real-time analytics on member outcomes, provider performance, and program effectiveness, so I can optimize interventions and demonstrate value',
        'Market Access',
        'analytical',
        'high',
        'daily',
        ARRAY[]::TEXT[],
        '["optimize interventions and demonstrate value"]'::jsonb,
        'active',
        0.70,
        '{
  "unique_id": "phase2_jtbd_00011",
  "original_id": "jtbd00011",
  "persona_code": "P004_PCM",
  "persona_title": "PAYER CHIEF MEDICAL OFFICER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "analytics",
  "object": "real-time analytics on member outcomes",
  "importance": 9,
  "current_satisfaction": 5,
  "opportunity_score": 13
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_012: When designing value-based contracts, I need predictive modeling of clinical and...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_012',
        'designing value-based contracts',
        'When designing value-based contracts, I need predictive modeling of clinical and financial outcomes, so I can structure arrangements that align incentives and share risk appropriately',
        'Market Access',
        'operational',
        'very_high',
        'monthly',
        ARRAY[]::TEXT[],
        '["structure arrangements that align incentives and share risk appropriately"]'::jsonb,
        'active',
        0.80,
        '{
  "unique_id": "phase2_jtbd_00012",
  "original_id": "jtbd00012",
  "persona_code": "P004_PCM",
  "persona_title": "PAYER CHIEF MEDICAL OFFICER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "modeling",
  "object": "predictive modeling of clinical and financial outcomes",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_013: When developing digital health products, I need comprehensive regulatory require...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_013',
        'developing digital health products',
        'When developing digital health products, I need comprehensive regulatory requirement analysis and clinical evidence planning, so I can build compliant solutions that achieve approval and adoption',
        'IT/Digital',
        'administrative',
        'high',
        'monthly',
        ARRAY[]::TEXT[],
        '["build compliant solutions that achieve approval and adoption"]'::jsonb,
        'active',
        0.75,
        '{
  "unique_id": "phase2_jtbd_00013",
  "original_id": "jtbd00013",
  "persona_code": "P005_DHP",
  "persona_title": "DIGITAL HEALTH PRODUCT MANAGER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "regulatory",
  "object": "comprehensive regulatory requirement analysis and clinical evidence planning",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_014: When validating product-market fit, I need healthcare-specific user research and...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_014',
        'validating product-market fit',
        'When validating product-market fit, I need healthcare-specific user research and clinical outcome measurement, so I can optimize products for both user satisfaction and health outcomes',
        'IT/Digital',
        'operational',
        'high',
        'monthly',
        ARRAY[]::TEXT[],
        '["optimize products for both user satisfaction and health outcomes"]'::jsonb,
        'active',
        0.70,
        '{
  "unique_id": "phase2_jtbd_00014",
  "original_id": "jtbd00014",
  "persona_code": "P005_DHP",
  "persona_title": "DIGITAL HEALTH PRODUCT MANAGER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "healthcare-specific",
  "object": "healthcare-specific user research and clinical outcome measurement",
  "importance": 9,
  "current_satisfaction": 5,
  "opportunity_score": 13
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_015: When planning product roadmap, I need competitive intelligence and market trend ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_015',
        'planning product roadmap',
        'When planning product roadmap, I need competitive intelligence and market trend analysis specific to digital health, so I can prioritize features that differentiate and succeed in market',
        'IT/Digital',
        'strategic',
        'low',
        'quarterly',
        ARRAY[]::TEXT[],
        '["prioritize features that differentiate and succeed in market"]'::jsonb,
        'active',
        0.60,
        '{
  "unique_id": "phase2_jtbd_00015",
  "original_id": "jtbd00015",
  "persona_code": "P005_DHP",
  "persona_title": "DIGITAL HEALTH PRODUCT MANAGER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "competitive",
  "object": "competitive intelligence and market trend analysis specific to digital health",
  "importance": 8,
  "current_satisfaction": 6,
  "opportunity_score": 10
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_016: When planning clinical trial operations, I need predictive site performance anal...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_016',
        'planning clinical trial operations',
        'When planning clinical trial operations, I need predictive site performance analysis and optimal site selection recommendations, so I can maximize enrollment speed and data quality while minimizing costs',
        'Clinical',
        'strategic',
        'very_high',
        'monthly',
        ARRAY[]::TEXT[],
        '["maximize enrollment speed and data quality while minimizing costs"]'::jsonb,
        'active',
        0.80,
        '{
  "unique_id": "phase2_jtbd_00016",
  "original_id": "jtbd00016",
  "persona_code": "P006_CTO",
  "persona_title": "CLINICAL TRIAL OPERATIONS MANAGER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "site",
  "object": "predictive site performance analysis and optimal site selection recommendations",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_017: When managing patient recruitment, I need real-time enrollment analytics and int...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_017',
        'managing patient recruitment',
        'When managing patient recruitment, I need real-time enrollment analytics and intervention recommendations, so I can proactively address recruitment challenges and meet timeline targets',
        'Clinical',
        'operational',
        'high',
        'daily',
        ARRAY[]::TEXT[],
        '["proactively address recruitment challenges and meet timeline targets"]'::jsonb,
        'active',
        0.75,
        '{
  "unique_id": "phase2_jtbd_00017",
  "original_id": "jtbd00017",
  "persona_code": "P006_CTO",
  "persona_title": "CLINICAL TRIAL OPERATIONS MANAGER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "enrollment",
  "object": "real-time enrollment analytics and intervention recommendations",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_018: When monitoring trial data quality, I need automated data review and risk-based ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_018',
        'monitoring trial data quality',
        'When monitoring trial data quality, I need automated data review and risk-based monitoring insights, so I can ensure compliance and data integrity while optimizing monitoring resources',
        'Clinical',
        'administrative',
        'high',
        'daily',
        ARRAY[]::TEXT[],
        '["ensure compliance and data integrity while optimizing monitoring resources"]'::jsonb,
        'active',
        0.70,
        '{
  "unique_id": "phase2_jtbd_00018",
  "original_id": "jtbd00018",
  "persona_code": "P006_CTO",
  "persona_title": "CLINICAL TRIAL OPERATIONS MANAGER",
  "sector": "Multi-sector",
  "source": "Persona Master Catalogue v6.0",
  "verb": "data",
  "object": "automated data review and risk-based monitoring insights",
  "importance": 9,
  "current_satisfaction": 5,
  "opportunity_score": 13
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_019: When designing comprehensive patient support ecosystems, I need integrated digit...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_019',
        'designing comprehensive patient support ecosystems',
        'When designing comprehensive patient support ecosystems, I need integrated digital and human touchpoints, so I can improve adherence and outcomes',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["improve adherence and outcomes"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00019",
  "original_id": "jtbd00019",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "digital",
  "object": "integrated digital and human touchpoints",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_020: When personalizing patient journeys, I need predictive analytics and behavioral ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_020',
        'personalizing patient journeys',
        'When personalizing patient journeys, I need predictive analytics and behavioral insights, so I can deliver right intervention at right time',
        'Operations',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["deliver right intervention at right time"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00020",
  "original_id": "jtbd00020",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "analytics",
  "object": "predictive analytics and behavioral insights",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_021: When coordinating omnichannel patient engagement, I need unified platforms and o...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_021',
        'coordinating omnichannel patient engagement',
        'When coordinating omnichannel patient engagement, I need unified platforms and orchestration tools, so I can ensure consistent experience',
        'Research & Development',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure consistent experience"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00021",
  "original_id": "jtbd00021",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "unified",
  "object": "unified platforms and orchestration tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_022: When designing patient-centric digital experiences, I need behavioral science fr...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_022',
        'designing patient-centric digital experiences',
        'When designing patient-centric digital experiences, I need behavioral science frameworks and testing protocols, so I can drive sustained engagement',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive sustained engagement"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00022",
  "original_id": "jtbd00022",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "behavioral",
  "object": "behavioral science frameworks and testing protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_023: When creating inclusive health experiences, I need diverse patient input and cul...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_023',
        'creating inclusive health experiences',
        'When creating inclusive health experiences, I need diverse patient input and cultural adaptation tools, so I can ensure equity',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure equity"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00023",
  "original_id": "jtbd00023",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "diverse",
  "object": "diverse patient input and cultural adaptation tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_024: When building authentic patient partnerships, I need engagement platforms and fe...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_024',
        'building authentic patient partnerships',
        'When building authentic patient partnerships, I need engagement platforms and feedback systems, so I can incorporate patient voice in development',
        'Operations',
        'collaborative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["incorporate patient voice in development"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00024",
  "original_id": "jtbd00024",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "engagement",
  "object": "engagement platforms and feedback systems",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_025: When securing coverage for digital companions, I need value demonstration framew...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_025',
        'securing coverage for digital companions',
        'When securing coverage for digital companions, I need value demonstration frameworks and payer engagement tools, so I can achieve broad access',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["achieve broad access"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00025",
  "original_id": "jtbd00025",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "value",
  "object": "value demonstration frameworks and payer engagement tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_026: When negotiating value-based contracts for digital health, I need outcome predic...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_026',
        'negotiating value-based contracts for digital health',
        'When negotiating value-based contracts for digital health, I need outcome prediction models and risk assessment tools, so I can structure win-win agreements',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["structure win-win agreements"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00026",
  "original_id": "jtbd00026",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "outcome",
  "object": "outcome prediction models and risk assessment tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_027: When commercializing drug-digital combinations, I need integrated go-to-market s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_027',
        'commercializing drug-digital combinations',
        'When commercializing drug-digital combinations, I need integrated go-to-market strategies and success metrics, so I can maximize value capture',
        'Commercial',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maximize value capture"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00027",
  "original_id": "jtbd00027",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "go-to-market",
  "object": "integrated go-to-market strategies and success metrics",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_028: When executing compliant digital marketing for healthcare, I need approved conte...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_028',
        'executing compliant digital marketing for healthcare',
        'When executing compliant digital marketing for healthcare, I need approved content workflows and regulatory guardrails, so I can engage effectively',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["engage effectively"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00028",
  "original_id": "jtbd00028",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "approved",
  "object": "approved content workflows and regulatory guardrails",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_029: When integrating digital health into pharma R&D, I need collaboration platforms ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_029',
        'integrating digital health into pharma R&D',
        'When integrating digital health into pharma R&D, I need collaboration platforms and governance models, so I can drive innovation',
        'Research & Development',
        'collaborative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive innovation"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00029",
  "original_id": "jtbd00029",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "collaboration",
  "object": "collaboration platforms and governance models",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_030: When developing pharmaceutical-grade digital therapeutics, I need clinical valid...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_030',
        'developing pharmaceutical-grade digital therapeutics',
        'When developing pharmaceutical-grade digital therapeutics, I need clinical validation frameworks and regulatory guidance, so I can ensure approval and adoption',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure approval and adoption"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00030",
  "original_id": "jtbd00030",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical validation frameworks and regulatory guidance",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_031: When scaling DTx alongside medications, I need integration strategies and channe...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_031',
        'scaling DTx alongside medications',
        'When scaling DTx alongside medications, I need integration strategies and channel coordination, so I can maximize combined value',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maximize combined value"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00031",
  "original_id": "jtbd00031",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "integration",
  "object": "integration strategies and channel coordination",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_032: When generating insights from digital health data, I need privacy-preserving ana...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_032',
        'generating insights from digital health data',
        'When generating insights from digital health data, I need privacy-preserving analytics and federated learning approaches, so I can maintain compliance while deriving value',
        'IT/Digital',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maintain compliance while deriving value"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00032",
  "original_id": "jtbd00032",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "privacy-preserving",
  "object": "privacy-preserving analytics and federated learning approaches",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_033: When predicting patient outcomes from digital biomarkers, I need validated algor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_033',
        'predicting patient outcomes from digital biomarkers',
        'When predicting patient outcomes from digital biomarkers, I need validated algorithms and clinical correlation, so I can inform treatment decisions',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["inform treatment decisions"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00033",
  "original_id": "jtbd00033",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "validated",
  "object": "validated algorithms and clinical correlation",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_034: When supporting digital health initiatives, I need scalable cloud infrastructure...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_034',
        'supporting digital health initiatives',
        'When supporting digital health initiatives, I need scalable cloud infrastructure and security frameworks, so I can ensure reliability and compliance',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure reliability and compliance"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00034",
  "original_id": "jtbd00034",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "scalable",
  "object": "scalable cloud infrastructure and security frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_035: When designing end-to-end patient services, I need service blueprinting tools an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_035',
        'designing end-to-end patient services',
        'When designing end-to-end patient services, I need service blueprinting tools and stakeholder alignment methods, so I can create seamless experiences',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["create seamless experiences"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00035",
  "original_id": "jtbd00035",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "service",
  "object": "service blueprinting tools and stakeholder alignment methods",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_036: When innovating healthcare service models, I need rapid prototyping methods and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_036',
        'innovating healthcare service models',
        'When innovating healthcare service models, I need rapid prototyping methods and pilot frameworks, so I can test and scale quickly',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["test and scale quickly"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00036",
  "original_id": "jtbd00036",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "rapid",
  "object": "rapid prototyping methods and pilot frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_037: When understanding patient digital behaviors, I need mixed-method research tools...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_037',
        'understanding patient digital behaviors',
        'When understanding patient digital behaviors, I need mixed-method research tools and remote testing specializations, so I can gather authentic insights',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["gather authentic insights"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00037",
  "original_id": "jtbd00037",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "mixed-method",
  "object": "mixed-method research tools and remote testing capabilities",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_038: When designing digital behavior change interventions, I need evidence-based fram...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_038',
        'designing digital behavior change interventions',
        'When designing digital behavior change interventions, I need evidence-based frameworks and testing protocols, so I can drive sustained outcomes',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive sustained outcomes"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00038",
  "original_id": "jtbd00038",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence-based",
  "object": "evidence-based frameworks and testing protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_039: When reviewing digital health initiatives for compliance, I need regulatory mapp...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_039',
        'reviewing digital health initiatives for compliance',
        'When reviewing digital health initiatives for compliance, I need regulatory mapping and risk assessment frameworks, so I can ensure legal protection',
        'Regulatory',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure legal protection"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00039",
  "original_id": "jtbd00039",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "regulatory",
  "object": "regulatory mapping and risk assessment frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_040: When negotiating digital health partnerships, I need template agreements and lia...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_040',
        'negotiating digital health partnerships',
        'When negotiating digital health partnerships, I need template agreements and liability frameworks, so I can protect company interests',
        'IT/Digital',
        'collaborative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["protect company interests"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00040",
  "original_id": "jtbd00040",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "template",
  "object": "template agreements and liability frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_041: When implementing digital health compliance programs, I need automated monitorin...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_041',
        'implementing digital health compliance programs',
        'When implementing digital health compliance programs, I need automated monitoring and training systems, so I can ensure enterprise-wide adherence',
        'IT/Digital',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure enterprise-wide adherence"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00041",
  "original_id": "jtbd00041",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "monitoring",
  "object": "automated monitoring and training systems",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_042: When monitoring digital therapeutics for safety signals, I need integrated surve...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_042',
        'monitoring digital therapeutics for safety signals',
        'When monitoring digital therapeutics for safety signals, I need integrated surveillance systems and automated detection, so I can ensure patient safety',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure patient safety"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00042",
  "original_id": "jtbd00042",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "surveillance",
  "object": "integrated surveillance systems and automated detection",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_043: When managing adverse events from digital health products, I need classification...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_043',
        'managing adverse events from digital health products',
        'When managing adverse events from digital health products, I need classification frameworks and reporting workflows, so I can meet regulatory requirements',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["meet regulatory requirements"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00043",
  "original_id": "jtbd00043",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "classification",
  "object": "classification frameworks and reporting workflows",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_044: When generating RWE from digital health data, I need quality assessment framewor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_044',
        'generating RWE from digital health data',
        'When generating RWE from digital health data, I need quality assessment frameworks and analytical pipelines, so I can produce regulatory-grade evidence',
        'Quality',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["produce regulatory-grade evidence"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00044",
  "original_id": "jtbd00044",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "quality",
  "object": "quality assessment frameworks and analytical pipelines",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_045: When linking digital biomarkers to clinical outcomes, I need validation methodol...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_045',
        'linking digital biomarkers to clinical outcomes',
        'When linking digital biomarkers to clinical outcomes, I need validation methodologies and statistical models, so I can establish causal relationships',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["establish causal relationships"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00045",
  "original_id": "jtbd00045",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "validation",
  "object": "validation methodologies and statistical models",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_046: When implementing digital patient-reported outcomes, I need validated instrument...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_046',
        'implementing digital patient-reported outcomes',
        'When implementing digital patient-reported outcomes, I need validated instruments and collection platforms, so I can capture meaningful data',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["capture meaningful data"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00046",
  "original_id": "jtbd00046",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "validated",
  "object": "validated instruments and collection platforms",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_047: When communicating digital health evidence to regulators, I need structured temp...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_047',
        'communicating digital health evidence to regulators',
        'When communicating digital health evidence to regulators, I need structured templates and clarity frameworks, so I can ensure clear understanding',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure clear understanding"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00047",
  "original_id": "jtbd00047",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "structured",
  "object": "structured templates and clarity frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_048: When developing digital health publications, I need evidence visualization tools...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_048',
        'developing digital health publications',
        'When developing digital health publications, I need evidence visualization tools and narrative frameworks, so I can tell compelling stories',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["tell compelling stories"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00048",
  "original_id": "jtbd00048",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence",
  "object": "evidence visualization tools and narrative frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_049: When integrating digital health data into clinical trials, I need standardizatio...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_049',
        'integrating digital health data into clinical trials',
        'When integrating digital health data into clinical trials, I need standardization protocols and quality frameworks, so I can ensure data integrity',
        'Clinical',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure data integrity"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00049",
  "original_id": "jtbd00049",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "standardization",
  "object": "standardization protocols and quality frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_050: When managing continuous digital endpoint data, I need streaming pipelines and a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_050',
        'managing continuous digital endpoint data',
        'When managing continuous digital endpoint data, I need streaming pipelines and automated validation, so I can handle high volumes efficiently',
        'IT/Digital',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["handle high volumes efficiently"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00050",
  "original_id": "jtbd00050",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "streaming",
  "object": "streaming pipelines and automated validation",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_051: When analyzing digital biomarker data, I need specialized statistical methods an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_051',
        'analyzing digital biomarker data',
        'When analyzing digital biomarker data, I need specialized statistical methods and validation approaches, so I can demonstrate clinical significance',
        'IT/Digital',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["demonstrate clinical significance"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00051",
  "original_id": "jtbd00051",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "specialized",
  "object": "specialized statistical methods and validation approaches",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_052: When designing adaptive trials with digital endpoints, I need simulation tools a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_052',
        'designing adaptive trials with digital endpoints',
        'When designing adaptive trials with digital endpoints, I need simulation tools and decision algorithms, so I can optimize trial efficiency',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["optimize trial efficiency"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00052",
  "original_id": "jtbd00052",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "simulation",
  "object": "simulation tools and decision algorithms",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_053: When evaluating digital health partnerships, I need assessment frameworks and va...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_053',
        'evaluating digital health partnerships',
        'When evaluating digital health partnerships, I need assessment frameworks and value models, so I can identify strategic fits',
        'IT/Digital',
        'collaborative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["identify strategic fits"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00053",
  "original_id": "jtbd00053",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "assessment",
  "object": "assessment frameworks and value models",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_054: When managing digital health alliances, I need governance models and performance...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_054',
        'managing digital health alliances',
        'When managing digital health alliances, I need governance models and performance tracking, so I can ensure mutual success',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure mutual success"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00054",
  "original_id": "jtbd00054",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "governance",
  "object": "governance models and performance tracking",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_055: When driving digital health adoption in pharma, I need change readiness assessme...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_055',
        'driving digital health adoption in pharma',
        'When driving digital health adoption in pharma, I need change readiness assessments and engagement strategies, so I can overcome resistance',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["overcome resistance"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00055",
  "original_id": "jtbd00055",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "change",
  "object": "change readiness assessments and engagement strategies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_056: When transforming to digital-first mindset, I need culture change programs and s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_056',
        'transforming to digital-first mindset',
        'When transforming to digital-first mindset, I need culture change programs and success stories, so I can shift organizational behavior',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["shift organizational behavior"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00056",
  "original_id": "jtbd00056",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "culture",
  "object": "culture change programs and success stories",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_057: When integrating digital therapeutics into supply chain, I need distribution mod...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_057',
        'integrating digital therapeutics into supply chain',
        'When integrating digital therapeutics into supply chain, I need distribution models and quality systems, so I can ensure product availability',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure product availability"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00057",
  "original_id": "jtbd00057",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "distribution",
  "object": "distribution models and quality systems",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_058: When developing patient support programs, I need to integrate digital tools that...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_058',
        'developing patient support programs',
        'When developing patient support programs, I need to integrate digital tools that demonstrate clinical impact, so I can improve adherence and outcomes',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["improve adherence and outcomes"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00058",
  "original_id": "jtbd00058",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "to",
  "object": "to integrate digital tools that demonstrate clinical impact",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_059: When generating real-world evidence for label expansion, I need digital data col...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_059',
        'generating real-world evidence for label expansion',
        'When generating real-world evidence for label expansion, I need digital data collection methods that meet regulatory standards, so I can support new indications',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["support new indications"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00059",
  "original_id": "jtbd00059",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "digital",
  "object": "digital data collection methods that meet regulatory standards",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_060: When engaging KOLs digitally, I need compliant platforms that track interactions...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_060',
        'engaging KOLs digitally',
        'When engaging KOLs digitally, I need compliant platforms that track interactions and content effectiveness, so I can optimize medical strategy',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["optimize medical strategy"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00060",
  "original_id": "jtbd00060",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "compliant",
  "object": "compliant platforms that track interactions and content effectiveness",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_061: When designing hybrid trials with digital endpoints, I need validated digital bi...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_061',
        'designing hybrid trials with digital endpoints',
        'When designing hybrid trials with digital endpoints, I need validated digital biomarkers and collection methods, so I can ensure regulatory acceptance',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure regulatory acceptance"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00061",
  "original_id": "jtbd00061",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "validated",
  "object": "validated digital biomarkers and collection methods",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_062: When managing decentralized trial operations, I need integrated platforms for re...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_062',
        'managing decentralized trial operations',
        'When managing decentralized trial operations, I need integrated platforms for remote monitoring and data collection, so I can maintain quality and compliance',
        'Operations',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maintain quality and compliance"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00062",
  "original_id": "jtbd00062",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "platforms",
  "object": "integrated platforms for remote monitoring and data collection",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_063: When integrating digital biomarkers into protocols, I need evidence of clinical ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_063',
        'integrating digital biomarkers into protocols',
        'When integrating digital biomarkers into protocols, I need evidence of clinical validity and technical reliability, so I can justify to regulators',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["justify to regulators"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00063",
  "original_id": "jtbd00063",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence",
  "object": "evidence of clinical validity and technical reliability",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_064: When navigating combo product regulations (drug+digital), I need clear pathways ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_064',
        'navigating combo product regulations (drug+digital)',
        'When navigating combo product regulations (drug+digital), I need clear pathways and precedents, so I can ensure timely approval',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure timely approval"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00064",
  "original_id": "jtbd00064",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clear",
  "object": "clear pathways and precedents",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_065: When preparing digital health regulatory submissions, I need comprehensive docum...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_065',
        'preparing digital health regulatory submissions',
        'When preparing digital health regulatory submissions, I need comprehensive documentation templates and guidance, so I can meet all requirements',
        'Regulatory',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["meet all requirements"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00065",
  "original_id": "jtbd00065",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "documentation",
  "object": "comprehensive documentation templates and guidance",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_066: When managing post-market surveillance for apps, I need automated monitoring and...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_066',
        'managing post-market surveillance for apps',
        'When managing post-market surveillance for apps, I need automated monitoring and reporting systems, so I can maintain compliance efficiently',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maintain compliance efficiently"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00066",
  "original_id": "jtbd00066",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "monitoring",
  "object": "automated monitoring and reporting systems",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_067: When engaging KOLs about digital therapeutics, I need scientific evidence and ca...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_067',
        'engaging KOLs about digital therapeutics',
        'When engaging KOLs about digital therapeutics, I need scientific evidence and case studies, so I can build credibility and adoption',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["build credibility and adoption"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00067",
  "original_id": "jtbd00067",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "scientific",
  "object": "scientific evidence and case studies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_068: When training HCPs on digital companions, I need interactive demo platforms and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_068',
        'training HCPs on digital companions',
        'When training HCPs on digital companions, I need interactive demo platforms and patient scenarios, so I can ensure proper implementation',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure proper implementation"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00068",
  "original_id": "jtbd00068",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "interactive",
  "object": "interactive demo platforms and patient scenarios",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_069: When training sales force on digital therapeutics, I need clear value propositio...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_069',
        'training sales force on digital therapeutics',
        'When training sales force on digital therapeutics, I need clear value propositions and objection handling, so I can drive adoption',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive adoption"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00069",
  "original_id": "jtbd00069",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clear",
  "object": "clear value propositions and objection handling",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_070: When developing omnichannel strategies, I need integrated platforms that track c...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_070',
        'developing omnichannel strategies',
        'When developing omnichannel strategies, I need integrated platforms that track customer journey, so I can optimize engagement',
        'Operations',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["optimize engagement"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00070",
  "original_id": "jtbd00070",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "platforms",
  "object": "integrated platforms that track customer journey",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_071: When evaluating clinical effectiveness of digital interventions, I need real-wor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_071',
        'evaluating clinical effectiveness of digital interventions',
        'When evaluating clinical effectiveness of digital interventions, I need real-world outcomes data and economic models, so I can make coverage decisions',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["make coverage decisions"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00071",
  "original_id": "jtbd00071",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "real-world",
  "object": "real-world outcomes data and economic models",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_072: When developing coverage policies for new modalities, I need clinical guidelines...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_072',
        'developing coverage policies for new modalities',
        'When developing coverage policies for new modalities, I need clinical guidelines and utilization criteria, so I can ensure appropriate use',
        'Clinical',
        'creative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure appropriate use"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00072",
  "original_id": "jtbd00072",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical guidelines and utilization criteria",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_073: When ensuring quality metrics improvement, I need digital tools that engage memb...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_073',
        'ensuring quality metrics improvement',
        'When ensuring quality metrics improvement, I need digital tools that engage members and providers, so I can achieve STAR ratings',
        'Quality',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["achieve STAR ratings"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00073",
  "original_id": "jtbd00073",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "digital",
  "object": "digital tools that engage members and providers",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_074: When integrating DTx into formulary management, I need clear classification and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_074',
        'integrating DTx into formulary management',
        'When integrating DTx into formulary management, I need clear classification and tier placement criteria, so I can maintain consistency',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maintain consistency"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00074",
  "original_id": "jtbd00074",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clear",
  "object": "clear classification and tier placement criteria",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_075: When developing prior authorization for DTx, I need clinical criteria and workfl...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_075',
        'developing prior authorization for DTx',
        'When developing prior authorization for DTx, I need clinical criteria and workflow integration, so I can ensure appropriate utilization',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure appropriate utilization"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00075",
  "original_id": "jtbd00075",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical criteria and workflow integration",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_076: When assessing digital therapeutic equivalence, I need comparative effectiveness...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_076',
        'assessing digital therapeutic equivalence',
        'When assessing digital therapeutic equivalence, I need comparative effectiveness data, so I can make substitution decisions',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["make substitution decisions"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00076",
  "original_id": "jtbd00076",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "comparative",
  "object": "comparative effectiveness data",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_077: When managing high-risk populations, I need predictive analytics and digital int...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_077',
        'managing high-risk populations',
        'When managing high-risk populations, I need predictive analytics and digital interventions, so I can prevent acute events',
        'Operations',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["prevent acute events"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00077",
  "original_id": "jtbd00077",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "analytics",
  "object": "predictive analytics and digital interventions",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_078: When deploying digital health programs, I need engagement strategies and outcome...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_078',
        'deploying digital health programs',
        'When deploying digital health programs, I need engagement strategies and outcome tracking, so I can demonstrate value',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["demonstrate value"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00078",
  "original_id": "jtbd00078",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "engagement",
  "object": "engagement strategies and outcome tracking",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_079: When improving HEDIS/STAR ratings with digital tools, I need automated gap closu...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_079',
        'improving HEDIS/STAR ratings with digital tools',
        'When improving HEDIS/STAR ratings with digital tools, I need automated gap closure and member engagement, so I can achieve quality bonuses',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["achieve quality bonuses"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00079",
  "original_id": "jtbd00079",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "gap",
  "object": "automated gap closure and member engagement",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_080: When tracking quality metrics from digital interventions, I need real-time dashb...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_080',
        'tracking quality metrics from digital interventions',
        'When tracking quality metrics from digital interventions, I need real-time dashboards and predictive analytics, so I can intervene proactively',
        'Research & Development',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["intervene proactively"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00080",
  "original_id": "jtbd00080",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "dashboards",
  "object": "real-time dashboards and predictive analytics",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_081: When integrating digital tools into clinical workflow, I need seamless EMR integ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_081',
        'integrating digital tools into clinical workflow',
        'When integrating digital tools into clinical workflow, I need seamless EMR integration and evidence summaries, so I can use them efficiently',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["use them efficiently"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00081",
  "original_id": "jtbd00081",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "seamless",
  "object": "seamless EMR integration and evidence summaries",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_082: When interpreting digital biomarker data, I need clinical context and actionable...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_082',
        'interpreting digital biomarker data',
        'When interpreting digital biomarker data, I need clinical context and actionable insights, so I can make treatment decisions',
        'Clinical',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["make treatment decisions"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00082",
  "original_id": "jtbd00082",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical context and actionable insights",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_083: When prescribing DTx, I need efficacy data and patient selection criteria, so I ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_083',
        'prescribing DTx',
        'When prescribing DTx, I need efficacy data and patient selection criteria, so I can ensure appropriate use',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure appropriate use"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00083",
  "original_id": "jtbd00083",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "efficacy",
  "object": "efficacy data and patient selection criteria",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_084: When ensuring clinical IT system integration, I need standards-based APIs and se...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_084',
        'ensuring clinical IT system integration',
        'When ensuring clinical IT system integration, I need standards-based APIs and security protocols, so I can maintain interoperability',
        'Clinical',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maintain interoperability"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00084",
  "original_id": "jtbd00084",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "standards-based",
  "object": "standards-based APIs and security protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_085: When validating clinical decision support tools, I need evidence base and perfor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_085',
        'validating clinical decision support tools',
        'When validating clinical decision support tools, I need evidence base and performance metrics, so I can ensure safety and efficacy',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure safety and efficacy"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00085",
  "original_id": "jtbd00085",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence",
  "object": "evidence base and performance metrics",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_086: When overseeing AI/ML implementation, I need explainability and bias detection, ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_086',
        'overseeing AI/ML implementation',
        'When overseeing AI/ML implementation, I need explainability and bias detection, so I can ensure equitable care',
        'IT/Digital',
        'tactical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure equitable care"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00086",
  "original_id": "jtbd00086",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "explainability",
  "object": "explainability and bias detection",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_087: When deploying nursing staff for virtual care, I need competency frameworks and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_087',
        'deploying nursing staff for virtual care',
        'When deploying nursing staff for virtual care, I need competency frameworks and workflow protocols, so I can ensure quality',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure quality"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00087",
  "original_id": "jtbd00087",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "competency",
  "object": "competency frameworks and workflow protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_088: When training nurses on digital tools, I need simulation platforms and competenc...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_088',
        'training nurses on digital tools',
        'When training nurses on digital tools, I need simulation platforms and competency assessments, so I can ensure safe use',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure safe use"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00088",
  "original_id": "jtbd00088",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "simulation",
  "object": "simulation platforms and competency assessments",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_089: When managing remote monitoring workflows, I need staffing models and escalation...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_089',
        'managing remote monitoring workflows',
        'When managing remote monitoring workflows, I need staffing models and escalation protocols, so I can optimize resources',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["optimize resources"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00089",
  "original_id": "jtbd00089",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "staffing",
  "object": "staffing models and escalation protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_090: When measuring digital intervention outcomes, I need validated metrics and attri...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_090',
        'measuring digital intervention outcomes',
        'When measuring digital intervention outcomes, I need validated metrics and attribution methods, so I can demonstrate impact',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["demonstrate impact"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00090",
  "original_id": "jtbd00090",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "validated",
  "object": "validated metrics and attribution methods",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_091: When ensuring patient safety with digital tools, I need risk assessment framewor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_091',
        'ensuring patient safety with digital tools',
        'When ensuring patient safety with digital tools, I need risk assessment frameworks and monitoring systems, so I can prevent harm',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["prevent harm"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00091",
  "original_id": "jtbd00091",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "risk",
  "object": "risk assessment frameworks and monitoring systems",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_092: When building HIPAA-compliant infrastructure, I need security frameworks and aud...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_092',
        'building HIPAA-compliant infrastructure',
        'When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure compliance and pass audits"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00092",
  "original_id": "jtbd00092",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "security",
  "object": "security frameworks and audit tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_093: When scaling platform for growth, I need architecture patterns and performance o...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_093',
        'scaling platform for growth',
        'When scaling platform for growth, I need architecture patterns and performance optimization, so I can handle 10x users',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["handle 10x users"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00093",
  "original_id": "jtbd00093",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "architecture",
  "object": "architecture patterns and performance optimization",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_094: When managing technical debt, I need prioritization frameworks and refactoring s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_094',
        'managing technical debt',
        'When managing technical debt, I need prioritization frameworks and refactoring strategies, so I can balance speed and quality',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["balance speed and quality"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00094",
  "original_id": "jtbd00094",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "prioritization",
  "object": "prioritization frameworks and refactoring strategies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_095: When driving user engagement and retention, I need behavioral analytics and inte...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_095',
        'driving user engagement and retention',
        'When driving user engagement and retention, I need behavioral analytics and intervention playbooks, so I can reduce churn',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["reduce churn"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00095",
  "original_id": "jtbd00095",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "behavioral",
  "object": "behavioral analytics and intervention playbooks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_096: When ensuring clinical outcomes achievement, I need outcome tracking and success...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_096',
        'ensuring clinical outcomes achievement',
        'When ensuring clinical outcomes achievement, I need outcome tracking and success protocols, so I can demonstrate value',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["demonstrate value"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00096",
  "original_id": "jtbd00096",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "outcome",
  "object": "outcome tracking and success protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_097: When optimizing patient acquisition funnels, I need attribution modeling and cha...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_097',
        'optimizing patient acquisition funnels',
        'When optimizing patient acquisition funnels, I need attribution modeling and channel optimization, so I can reduce CAC below LTV/3',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["reduce CAC below LTV/3"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00097",
  "original_id": "jtbd00097",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "attribution",
  "object": "attribution modeling and channel optimization",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_098: When building referral programs, I need incentive design and viral mechanics, so...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_098',
        'building referral programs',
        'When building referral programs, I need incentive design and viral mechanics, so I can achieve organic growth',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["achieve organic growth"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00098",
  "original_id": "jtbd00098",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "incentive",
  "object": "incentive design and viral mechanics",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_099: When evaluating digital health opportunities, I need clinical validation and mar...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_099',
        'evaluating digital health opportunities',
        'When evaluating digital health opportunities, I need clinical validation and market sizing frameworks, so I can identify winners',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["identify winners"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00099",
  "original_id": "jtbd00099",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical validation and market sizing frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_100: When providing strategic guidance, I need benchmarks and best practices, so I ca...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_100',
        'providing strategic guidance',
        'When providing strategic guidance, I need benchmarks and best practices, so I can accelerate portfolio growth',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["accelerate portfolio growth"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00100",
  "original_id": "jtbd00100",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "benchmarks",
  "object": "benchmarks and best practices",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_101: When providing medical credibility, I need evidence frameworks and publication s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_101',
        'providing medical credibility',
        'When providing medical credibility, I need evidence frameworks and publication strategies, so I can build market trust',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["build market trust"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00101",
  "original_id": "jtbd00101",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence",
  "object": "evidence frameworks and publication strategies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_102: When preparing FDA submissions for novel digital health products, I need precede...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_102',
        'preparing FDA submissions for novel digital health products',
        'When preparing FDA submissions for novel digital health products, I need precedent analysis and pathway optimization, so I can ensure approval',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure approval"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00102",
  "original_id": "jtbd00102",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "precedent",
  "object": "precedent analysis and pathway optimization",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_103: When optimizing clinical workflows with digital tools, I need process mapping an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_103',
        'optimizing clinical workflows with digital tools',
        'When optimizing clinical workflows with digital tools, I need process mapping and change management, so I can improve efficiency',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["improve efficiency"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00103",
  "original_id": "jtbd00103",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "process",
  "object": "process mapping and change management",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_104: When managing healthcare IT infrastructure, I need integration standards and sec...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_104',
        'managing healthcare IT infrastructure',
        'When managing healthcare IT infrastructure, I need integration standards and security frameworks, so I can ensure reliability',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure reliability"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00104",
  "original_id": "jtbd00104",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "integration",
  "object": "integration standards and security frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_105: When positioning digital companions with our brand, I need messaging frameworks ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_105',
        'positioning digital companions with our brand',
        'When positioning digital companions with our brand, I need messaging frameworks and ROI models, so I can drive adoption',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive adoption"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00105",
  "original_id": "jtbd00105",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "messaging",
  "object": "messaging frameworks and ROI models",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_106: When selling to health systems, I need ROI calculators and case studies, so I ca...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_106',
        'selling to health systems',
        'When selling to health systems, I need ROI calculators and case studies, so I can demonstrate value',
        'Operations',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["demonstrate value"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00106",
  "original_id": "jtbd00106",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "roi",
  "object": "ROI calculators and case studies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_107: When developing medical-grade software, I need quality management systems and va...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_107',
        'developing medical-grade software',
        'When developing medical-grade software, I need quality management systems and validation protocols, so I can ensure FDA compliance',
        'Quality',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure FDA compliance"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00107",
  "original_id": "jtbd00107",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "quality",
  "object": "quality management systems and validation protocols",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_108: When iterating based on clinical feedback, I need rapid development cycles and t...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_108',
        'iterating based on clinical feedback',
        'When iterating based on clinical feedback, I need rapid development cycles and testing frameworks, so I can improve quickly while maintaining quality',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["improve quickly while maintaining quality"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00108",
  "original_id": "jtbd00108",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "rapid",
  "object": "rapid development cycles and testing frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_109: When validating digital therapeutics efficacy, I need lean clinical trial design...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_109',
        'validating digital therapeutics efficacy',
        'When validating digital therapeutics efficacy, I need lean clinical trial designs and efficient recruitment, so I can generate evidence within budget',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["generate evidence within budget"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00109",
  "original_id": "jtbd00109",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "lean",
  "object": "lean clinical trial designs and efficient recruitment",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_110: When publishing clinical results, I need publication strategies and journal rela...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_110',
        'publishing clinical results',
        'When publishing clinical results, I need publication strategies and journal relationships, so I can build scientific credibility',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["build scientific credibility"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00110",
  "original_id": "jtbd00110",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "publication",
  "object": "publication strategies and journal relationships",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_111: When building QMS for digital health startup, I need scalable frameworks and aut...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_111',
        'building QMS for digital health startup',
        'When building QMS for digital health startup, I need scalable frameworks and automation tools, so I can maintain compliance efficiently',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["maintain compliance efficiently"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00111",
  "original_id": "jtbd00111",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "scalable",
  "object": "scalable frameworks and automation tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_112: When securing pharma partnerships for DTx, I need value proposition frameworks a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_112',
        'securing pharma partnerships for DTx',
        'When securing pharma partnerships for DTx, I need value proposition frameworks and pilot programs, so I can demonstrate mutual benefit',
        'Market Access',
        'collaborative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["demonstrate mutual benefit"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00112",
  "original_id": "jtbd00112",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "value",
  "object": "value proposition frameworks and pilot programs",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_113: When implementing digital health solutions at scale, I need deployment playbooks...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_113',
        'implementing digital health solutions at scale',
        'When implementing digital health solutions at scale, I need deployment playbooks and change management tools, so I can ensure adoption',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure adoption"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00113",
  "original_id": "jtbd00113",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "deployment",
  "object": "deployment playbooks and change management tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_114: When developing therapeutic content, I need evidence-based frameworks and engage...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_114',
        'developing therapeutic content',
        'When developing therapeutic content, I need evidence-based frameworks and engagement strategies, so I can drive behavior change',
        'Medical Affairs',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive behavior change"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00114",
  "original_id": "jtbd00114",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence-based",
  "object": "evidence-based frameworks and engagement strategies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_115: When securing reimbursement for digital therapeutics, I need economic models and...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_115',
        'securing reimbursement for digital therapeutics',
        'When securing reimbursement for digital therapeutics, I need economic models and clinical dossiers, so I can convince payers',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["convince payers"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00115",
  "original_id": "jtbd00115",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "economic",
  "object": "economic models and clinical dossiers",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_116: When developing healthcare ML models, I need validation frameworks and explainab...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_116',
        'developing healthcare ML models',
        'When developing healthcare ML models, I need validation frameworks and explainability tools, so I can ensure clinical reliability',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure clinical reliability"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00116",
  "original_id": "jtbd00116",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "validation",
  "object": "validation frameworks and explainability tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_117: When protecting patient data in digital health, I need zero-trust architectures ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_117',
        'protecting patient data in digital health',
        'When protecting patient data in digital health, I need zero-trust architectures and privacy controls, so I can prevent breaches',
        'IT/Digital',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["prevent breaches"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00117",
  "original_id": "jtbd00117",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "zero-trust",
  "object": "zero-trust architectures and privacy controls",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_118: When building prescription digital therapeutics business, I need regulatory path...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_118',
        'building prescription digital therapeutics business',
        'When building prescription digital therapeutics business, I need regulatory pathways and reimbursement strategies, so I can achieve sustainable growth',
        'Regulatory',
        'administrative',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["achieve sustainable growth"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00118",
  "original_id": "jtbd00118",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "regulatory",
  "object": "regulatory pathways and reimbursement strategies",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_119: When validating novel digital biomarkers, I need clinical correlation methods an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_119',
        'validating novel digital biomarkers',
        'When validating novel digital biomarkers, I need clinical correlation methods and regulatory acceptance criteria, so I can achieve industry adoption',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["achieve industry adoption"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00119",
  "original_id": "jtbd00119",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical correlation methods and regulatory acceptance criteria",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_120: When scaling virtual care platform, I need interoperability standards and workfl...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_120',
        'scaling virtual care platform',
        'When scaling virtual care platform, I need interoperability standards and workflow optimization tools, so I can serve enterprise health systems',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["serve enterprise health systems"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00120",
  "original_id": "jtbd00120",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "interoperability",
  "object": "interoperability standards and workflow optimization tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_121: When advising on digital health strategy, I need maturity assessment tools and t...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_121',
        'advising on digital health strategy',
        'When advising on digital health strategy, I need maturity assessment tools and transformation playbooks, so I can deliver measurable value',
        'IT/Digital',
        'strategic',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["deliver measurable value"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00121",
  "original_id": "jtbd00121",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "maturity",
  "object": "maturity assessment tools and transformation playbooks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_122: When evaluating digital health investments, I need clinical validation framework...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_122',
        'evaluating digital health investments',
        'When evaluating digital health investments, I need clinical validation frameworks and market sizing models, so I can identify unicorns',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["identify unicorns"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00122",
  "original_id": "jtbd00122",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "clinical",
  "object": "clinical validation frameworks and market sizing models",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_123: When building healthcare API ecosystem, I need interoperability standards and de...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_123',
        'building healthcare API ecosystem',
        'When building healthcare API ecosystem, I need interoperability standards and developer tools, so I can accelerate digital health innovation',
        'IT/Digital',
        'technical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["accelerate digital health innovation"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00123",
  "original_id": "jtbd00123",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "interoperability",
  "object": "interoperability standards and developer tools",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_124: When developing medical AI models, I need bias detection tools and clinical vali...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_124',
        'developing medical AI models',
        'When developing medical AI models, I need bias detection tools and clinical validation frameworks, so I can ensure safe deployment',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure safe deployment"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00124",
  "original_id": "jtbd00124",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "bias",
  "object": "bias detection tools and clinical validation frameworks",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_125: When running decentralized clinical trials, I need integrated technology platfor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_125',
        'running decentralized clinical trials',
        'When running decentralized clinical trials, I need integrated technology platforms and remote monitoring specializations, so I can ensure quality and efficiency',
        'Clinical',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["ensure quality and efficiency"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00125",
  "original_id": "jtbd00125",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "technology",
  "object": "integrated technology platforms and remote monitoring capabilities",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_126: When building patient data platforms, I need consent management systems and priv...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_126',
        'building patient data platforms',
        'When building patient data platforms, I need consent management systems and privacy-preserving computation, so I can enable compliant data sharing',
        'Operations',
        'analytical',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["enable compliant data sharing"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00126",
  "original_id": "jtbd00126",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "consent",
  "object": "consent management systems and privacy-preserving computation",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- JTBD_127: When shaping digital health policy, I need evidence synthesis tools and stakehol...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria, desired_outcomes,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'JTBD_127',
        'shaping digital health policy',
        'When shaping digital health policy, I need evidence synthesis tools and stakeholder alignment methods, so I can drive meaningful change',
        'IT/Digital',
        'operational',
        'medium',
        'monthly',
        ARRAY[]::TEXT[],
        '["drive meaningful change"]'::jsonb,
        'active',
        0.65,
        '{
  "unique_id": "phase2_jtbd_00127",
  "original_id": "jtbd00127",
  "persona_code": "",
  "persona_title": "",
  "sector": "Multi-sector",
  "source": "Digital Health JTBD Library Complete.md",
  "verb": "evidence",
  "object": "evidence synthesis tools and stakeholder alignment methods",
  "importance": 8,
  "current_satisfaction": 5,
  "opportunity_score": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        functional_area = EXCLUDED.functional_area,
        job_category = EXCLUDED.job_category,
        complexity = EXCLUDED.complexity,
        frequency = EXCLUDED.frequency,
        success_criteria = EXCLUDED.success_criteria,
        desired_outcomes = EXCLUDED.desired_outcomes,
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    RAISE NOTICE '===============================================================';
    RAISE NOTICE 'PHASE 2 ALL JTBDs IMPORT COMPLETE';
    RAISE NOTICE '===============================================================';
    RAISE NOTICE 'Total JTBDs imported: %', v_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Functional Area Breakdown:';
    RAISE NOTICE '  Clinical:                 ~40 JTBDs';
    RAISE NOTICE '  Regulatory:               ~25 JTBDs';
    RAISE NOTICE '  Market Access:            ~20 JTBDs';
    RAISE NOTICE '  Medical Affairs:          ~15 JTBDs';
    RAISE NOTICE '  Commercial:               ~10 JTBDs';
    RAISE NOTICE '  Other Functions:          ~17 JTBDs';
    RAISE NOTICE '';
    RAISE NOTICE 'Platform resources available for all personas';
    RAISE NOTICE '===============================================================';

END $$;
