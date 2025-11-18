-- =====================================================================================
-- DIGITAL HEALTH JTBDs (110 JTBDs)
-- =====================================================================================
-- Source: Digital Health JTBD Library Complete v1.0
-- Total: 110 JTBDs across 66 personas
-- Includes: Opportunity scores and success metrics
-- =====================================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Platform tenant not found';
    END IF;
    
    RAISE NOTICE 'Importing Digital Health JTBDs...';
    RAISE NOTICE 'Platform tenant: %', v_tenant_id;
    

    -- DH_GENERAL_PSD_001: When designing comprehensive patient support ecosystems, I need integrated digit...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PSD_001',
        'Patient Solutions Director - Maria Gonzalez',
        'When designing comprehensive patient support ecosystems, I need integrated digital and human touchpoints, so I can improve adherence and outcomes',
        'Commercial',
        'strategic',
        'very_high',
        'quarterly',
        ARRAY['Program enrollment >40%', 'Adherence improved >35%', 'Patient satisfaction >4.5/5', 'Cost per patient optimized', 'Outcomes demonstrated']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_PSD_001",
  "unique_id": "dh_general_psd_001",
  "original_id": "JTBD-PSD-001",
  "persona_title": "Patient Solutions Director - Maria Gonzalez",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PSD_002: When personalizing patient journeys, I need predictive analytics and behavioral ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PSD_002',
        'Patient Solutions Director - Maria Gonzalez',
        'When personalizing patient journeys, I need predictive analytics and behavioral insights, so I can deliver right intervention at right time',
        'Commercial',
        'analytical',
        'very_high',
        'weekly',
        ARRAY['Personalization achieved', 'Intervention timing optimal', 'Engagement sustained >12 months', 'Drop-off reduced 50%', 'ROI clearly demonstrated']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_PSD_002",
  "unique_id": "dh_general_psd_002",
  "original_id": "JTBD-PSD-002",
  "persona_title": "Patient Solutions Director - Maria Gonzalez",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PSD_003: When coordinating omnichannel patient engagement, I need unified platforms and o...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PSD_003',
        'Patient Solutions Director - Maria Gonzalez',
        'When coordinating omnichannel patient engagement, I need unified platforms and orchestration tools, so I can ensure consistent experience',
        'Commercial',
        'collaborative',
        'high',
        'daily',
        ARRAY['Channel integration seamless', 'Patient experience consistent', 'Data unified across touchpoints', 'Response time <24 hours']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_PSD_003",
  "unique_id": "dh_general_psd_003",
  "original_id": "JTBD-PSD-003",
  "persona_title": "Patient Solutions Director - Maria Gonzalez",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PXD_001: When designing patient-centric digital experiences, I need behavioral science fr...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PXD_001',
        'Patient Experience Designer - Sophie Chen',
        'When designing patient-centric digital experiences, I need behavioral science frameworks and testing protocols, so I can drive sustained engagement',
        'Commercial',
        'creative',
        'very_high',
        'monthly',
        ARRAY['User testing validated', 'Behavior change achieved', 'Accessibility AAA compliant', 'Engagement metrics improved', 'Clinical outcomes positive']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_PXD_001",
  "unique_id": "dh_general_pxd_001",
  "original_id": "JTBD-PXD-001",
  "persona_title": "Patient Experience Designer - Sophie Chen",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PXD_002: When creating inclusive health experiences, I need diverse patient input and cul...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PXD_002',
        'Patient Experience Designer - Sophie Chen',
        'When creating inclusive health experiences, I need diverse patient input and cultural adaptation tools, so I can ensure equity',
        'Commercial',
        'operational',
        'very_high',
        'monthly',
        ARRAY['Diverse representation achieved', 'Cultural appropriateness validated', 'Language barriers removed', 'Digital divide addressed']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_PXD_002",
  "unique_id": "dh_general_pxd_002",
  "original_id": "JTBD-PXD-002",
  "persona_title": "Patient Experience Designer - Sophie Chen",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PAL_001: When building authentic patient partnerships, I need engagement platforms and fe...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PAL_001',
        'Patient Advocacy Lead - Dr. Rachel Thompson',
        'When building authentic patient partnerships, I need engagement platforms and feedback systems, so I can incorporate patient voice in development',
        'Commercial',
        'creative',
        'high',
        'weekly',
        ARRAY['Patient input integrated', 'Partnerships sustainable', 'Trust scores improved', 'Co-creation achieved']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_PAL_001",
  "unique_id": "dh_general_pal_001",
  "original_id": "JTBD-PAL-001",
  "persona_title": "Patient Advocacy Lead - Dr.\u00a0Rachel Thompson",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MAD_001: When securing coverage for digital companions, I need value demonstration framew...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MAD_001',
        'Market Access Director - James Williams',
        'When securing coverage for digital companions, I need value demonstration frameworks and payer engagement tools, so I can achieve broad access',
        'Commercial',
        'collaborative',
        'very_high',
        'monthly',
        ARRAY['Coverage achieved >70%', 'Time to coverage <6 months', 'Tier placement optimal', 'Patient access simplified', 'Value story compelling']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_MAD_001",
  "unique_id": "dh_general_mad_001",
  "original_id": "JTBD-MAD-001",
  "persona_title": "Market Access Director - James Williams",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MAD_002: When negotiating value-based contracts for digital health, I need outcome predic...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MAD_002',
        'Market Access Director - James Williams',
        'When negotiating value-based contracts for digital health, I need outcome prediction models and risk assessment tools, so I can structure win-win agreements',
        'Market Access',
        'technical',
        'very_high',
        'quarterly',
        ARRAY['Contract terms favorable', 'Risk appropriately shared', 'Outcomes achievable', 'ROI demonstrated']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_MAD_002",
  "unique_id": "dh_general_mad_002",
  "original_id": "JTBD-MAD-002",
  "persona_title": "Market Access Director - James Williams",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CSL_001: When commercializing drug-digital combinations, I need integrated go-to-market s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CSL_001',
        'Commercial Strategy Lead - Michael Zhang',
        'When commercializing drug-digital combinations, I need integrated go-to-market strategies and success metrics, so I can maximize value capture',
        'IT/Digital',
        'technical',
        'very_high',
        'quarterly',
        ARRAY['Launch success rate >80%', 'Market share captured', 'Digital adoption >50%', 'Revenue targets achieved']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CSL_001",
  "unique_id": "dh_general_csl_001",
  "original_id": "JTBD-CSL-001",
  "persona_title": "Commercial Strategy Lead - Michael Zhang",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DMM_001: When executing compliant digital marketing for healthcare, I need approved conte...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DMM_001',
        'Digital Marketing Manager - Jennifer Park',
        'When executing compliant digital marketing for healthcare, I need approved content workflows and regulatory guardrails, so I can engage effectively',
        'Regulatory',
        'administrative',
        'high',
        'daily',
        ARRAY['Content approved quickly', 'Compliance maintained 100%', 'Engagement rates >5%', 'Conversion improved']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_DMM_001",
  "unique_id": "dh_general_dmm_001",
  "original_id": "JTBD-DMM-001",
  "persona_title": "Digital Marketing Manager - Jennifer Park",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDO_001: When building pharma''s digital health portfolio, I need innovation frameworks a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDO_001',
        'Chief Digital Officer (Pharma) - Dr. David Kim',
        'When building pharma''s digital health portfolio, I need innovation frameworks and partnership models, so I can accelerate transformation',
        'IT/Digital',
        'creative',
        'very_high',
        'monthly',
        ARRAY['Portfolio value >$1B', 'Time to market reduced 50%', 'Partnerships successful', 'Capabilities built', 'ROI demonstrated']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CDO_001",
  "unique_id": "dh_general_cdo_001",
  "original_id": "JTBD-CDO-001",
  "persona_title": "Chief Digital Officer (Pharma) - Dr.\u00a0David Kim",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDO_002: When integrating digital health into pharma R&D, I need collaboration platforms ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDO_002',
        'Chief Digital Officer (Pharma) - Dr. David Kim',
        'When integrating digital health into pharma R&D, I need collaboration platforms and governance models, so I can drive innovation',
        'IT/Digital',
        'creative',
        'high',
        'weekly',
        ARRAY['R&D productivity improved', 'Digital biomarkers adopted', 'Trial timelines reduced', 'Innovation pipeline robust']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_CDO_002",
  "unique_id": "dh_general_cdo_002",
  "original_id": "JTBD-CDO-002",
  "persona_title": "Chief Digital Officer (Pharma) - Dr.\u00a0David Kim",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DHPM_001: When developing pharmaceutical-grade digital therapeutics, I need clinical valid...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DHPM_001',
        'Digital Health Product Manager - Alex Rodriguez',
        'When developing pharmaceutical-grade digital therapeutics, I need clinical validation frameworks and regulatory guidance, so I can ensure approval and adoption',
        'Clinical',
        'administrative',
        'very_high',
        'weekly',
        ARRAY['Clinical efficacy proven', 'Regulatory approval achieved', 'User adoption >40%', 'Health outcomes improved', 'Revenue targets met']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_DHPM_001",
  "unique_id": "dh_general_dhpm_001",
  "original_id": "JTBD-DHPM-001",
  "persona_title": "Digital Health Product Manager - Alex Rodriguez",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DHPM_002: When scaling DTx alongside medications, I need integration strategies and channe...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DHPM_002',
        'Digital Health Product Manager - Alex Rodriguez',
        'When scaling DTx alongside medications, I need integration strategies and channel coordination, so I can maximize combined value',
        'IT/Digital',
        'collaborative',
        'very_high',
        'monthly',
        ARRAY['Integration seamless', 'Adherence improved >30%', 'Synergies realized', 'Channels coordinated']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_DHPM_002",
  "unique_id": "dh_general_dhpm_002",
  "original_id": "JTBD-DHPM-002",
  "persona_title": "Digital Health Product Manager - Alex Rodriguez",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DAL_001: When generating insights from digital health data, I need privacy-preserving ana...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DAL_001',
        'Data & Analytics Lead - Dr. Priya Patel',
        'When generating insights from digital health data, I need privacy-preserving analytics and federated learning approaches, so I can maintain compliance while deriving value',
        'Regulatory',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Privacy maintained 100%', 'Insights actionable', 'Models accurate >90%', 'Value demonstrated', 'Compliance assured']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_DAL_001",
  "unique_id": "dh_general_dal_001",
  "original_id": "JTBD-DAL-001",
  "persona_title": "Data & Analytics Lead - Dr.\u00a0Priya Patel",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DAL_002: When predicting patient outcomes from digital biomarkers, I need validated algor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DAL_002',
        'Data & Analytics Lead - Dr. Priya Patel',
        'When predicting patient outcomes from digital biomarkers, I need validated algorithms and clinical correlation, so I can inform treatment decisions',
        'Commercial',
        'technical',
        'very_high',
        'weekly',
        ARRAY['Predictions accurate >85%', 'Clinical relevance proven', 'Decisions improved', 'Adoption by HCPs']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_DAL_002",
  "unique_id": "dh_general_dal_002",
  "original_id": "JTBD-DAL-002",
  "persona_title": "Data & Analytics Lead - Dr.\u00a0Priya Patel",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_ITL_001: When supporting digital health initiatives, I need scalable cloud infrastructure...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_ITL_001',
        'IT Infrastructure Lead - Thomas Anderson',
        'When supporting digital health initiatives, I need scalable cloud infrastructure and security frameworks, so I can ensure reliability and compliance',
        'Commercial',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Uptime 99.99%', 'Security incidents zero', 'Compliance maintained', 'Scalability proven']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_ITL_001",
  "unique_id": "dh_general_itl_001",
  "original_id": "JTBD-ITL-001",
  "persona_title": "IT Infrastructure Lead - Thomas Anderson",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_SDD_001: When designing end-to-end patient services, I need service blueprinting tools an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_SDD_001',
        'Service Design Director - Emma Watson',
        'When designing end-to-end patient services, I need service blueprinting tools and stakeholder alignment methods, so I can create seamless experiences',
        'Commercial',
        'creative',
        'very_high',
        'monthly',
        ARRAY['Service coherence achieved', 'Touchpoints optimized', 'Pain points eliminated', 'Satisfaction >4.5/5', 'Implementation successful']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_SDD_001",
  "unique_id": "dh_general_sdd_001",
  "original_id": "JTBD-SDD-001",
  "persona_title": "Service Design Director - Emma Watson",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_SDD_002: When innovating healthcare service models, I need rapid prototyping methods and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_SDD_002',
        'Service Design Director - Emma Watson',
        'When innovating healthcare service models, I need rapid prototyping methods and pilot frameworks, so I can test and scale quickly',
        'Operations',
        'operational',
        'high',
        'monthly',
        ARRAY['Prototype cycle <2 weeks', 'Pilot results conclusive', 'Scale decision clear', 'Innovation adopted']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_SDD_002",
  "unique_id": "dh_general_sdd_002",
  "original_id": "JTBD-SDD-002",
  "persona_title": "Service Design Director - Emma Watson",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_UXR_001: When understanding patient digital behaviors, I need mixed-method research tools...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_UXR_001',
        'UX Research Lead - Dr. Lisa Chen',
        'When understanding patient digital behaviors, I need mixed-method research tools and remote testing capabilities, so I can gather authentic insights',
        'Commercial',
        'creative',
        'high',
        'weekly',
        ARRAY['Insights actionable 100%', 'Sample representative', 'Methods rigorous', 'Time to insight <3 weeks']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_UXR_001",
  "unique_id": "dh_general_uxr_001",
  "original_id": "JTBD-UXR-001",
  "persona_title": "UX Research Lead - Dr.\u00a0Lisa Chen",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_BSL_001: When designing digital behavior change interventions, I need evidence-based fram...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_BSL_001',
        'Behavioral Science Lead - Dr. Robert Johnson',
        'When designing digital behavior change interventions, I need evidence-based frameworks and testing protocols, so I can drive sustained outcomes',
        'Clinical',
        'creative',
        'very_high',
        'monthly',
        ARRAY['Behavior change sustained >6 months', 'Intervention efficacy proven', 'Mechanisms understood', 'Personalization achieved']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_BSL_001",
  "unique_id": "dh_general_bsl_001",
  "original_id": "JTBD-BSL-001",
  "persona_title": "Behavioral Science Lead - Dr.\u00a0Robert Johnson",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MLD_001: When reviewing digital health initiatives for compliance, I need regulatory mapp...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MLD_001',
        'Medical Legal Director - Jonathan Pierce',
        'When reviewing digital health initiatives for compliance, I need regulatory mapping and risk assessment frameworks, so I can ensure legal protection',
        'Regulatory',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Compliance violations: Zero', 'Review turnaround: <48 hours', 'Risk mitigation: 100%', 'Audit findings: Minimal', 'Legal exposure: Minimized']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_MLD_001",
  "unique_id": "dh_general_mld_001",
  "original_id": "JTBD-MLD-001",
  "persona_title": "Medical Legal Director - Jonathan Pierce",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MLD_002: When negotiating digital health partnerships, I need template agreements and lia...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MLD_002',
        'Medical Legal Director - Jonathan Pierce',
        'When negotiating digital health partnerships, I need template agreements and liability frameworks, so I can protect company interests',
        'IT/Digital',
        'collaborative',
        'high',
        'weekly',
        ARRAY['Contract clarity: 100%', 'Risk allocation: Appropriate', 'IP protection: Secured', 'Liability limited: Yes']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_MLD_002",
  "unique_id": "dh_general_mld_002",
  "original_id": "JTBD-MLD-002",
  "persona_title": "Medical Legal Director - Jonathan Pierce",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CCO_001: When implementing digital health compliance programs, I need automated monitorin...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CCO_001',
        'Chief Compliance Officer - Digital Health - Sarah Mitchell',
        'When implementing digital health compliance programs, I need automated monitoring and training systems, so I can ensure enterprise-wide adherence',
        'Commercial',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Training completion: 100%', 'Policy adherence: >95%', 'Audit scores: >90%', 'Issues detected early: 100%']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CCO_001",
  "unique_id": "dh_general_cco_001",
  "original_id": "JTBD-CCO-001",
  "persona_title": "Chief Compliance Officer - Digital Health - Sarah Mitchell",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PVD_001: When monitoring digital therapeutics for safety signals, I need integrated surve...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PVD_001',
        'Pharmacovigilance Director - Dr. Amanda Foster',
        'When monitoring digital therapeutics for safety signals, I need integrated surveillance systems and automated detection, so I can ensure patient safety',
        'Commercial',
        'technical',
        'very_high',
        'daily',
        ARRAY['Signal detection: <24 hours', 'False positive rate: <10%', 'Reporting compliance: 100%', 'Patient safety: Protected', 'Regulatory satisfaction: High']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_PVD_001",
  "unique_id": "dh_general_pvd_001",
  "original_id": "JTBD-PVD-001",
  "persona_title": "Pharmacovigilance Director - Dr.\u00a0Amanda Foster",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PVD_002: When managing adverse events from digital health products, I need classification...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PVD_002',
        'Pharmacovigilance Director - Dr. Amanda Foster',
        'When managing adverse events from digital health products, I need classification frameworks and reporting workflows, so I can meet regulatory requirements',
        'Regulatory',
        'administrative',
        'very_high',
        'daily',
        ARRAY['AE processing: <24 hours', 'Classification accuracy: 100%', 'Regulatory compliance: 100%', 'Documentation complete: Yes']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_PVD_002",
  "unique_id": "dh_general_pvd_002",
  "original_id": "JTBD-PVD-002",
  "persona_title": "Pharmacovigilance Director - Dr.\u00a0Amanda Foster",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RWE_001: When generating RWE from digital health data, I need quality assessment framewor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RWE_001',
        'Real-World Evidence Director - Dr. Marcus Chen',
        'When generating RWE from digital health data, I need quality assessment frameworks and analytical pipelines, so I can produce regulatory-grade evidence',
        'Clinical',
        'administrative',
        'very_high',
        'weekly',
        ARRAY['Data quality: >95%', 'Study completion: On time', 'Regulatory acceptance: Achieved', 'Publication success: Top tier', 'Decision impact: Demonstrated']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_RWE_001",
  "unique_id": "dh_general_rwe_001",
  "original_id": "JTBD-RWE-001",
  "persona_title": "Real-World Evidence Director - Dr.\u00a0Marcus Chen",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RWE_002: When linking digital biomarkers to clinical outcomes, I need validation methodol...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RWE_002',
        'Real-World Evidence Director - Dr. Marcus Chen',
        'When linking digital biomarkers to clinical outcomes, I need validation methodologies and statistical models, so I can establish causal relationships',
        'Clinical',
        'technical',
        'very_high',
        'monthly',
        ARRAY['Correlation established: >0.7', 'Clinical validity: Proven', 'Predictive accuracy: >85%', 'Regulatory acceptance: Yes']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_RWE_002",
  "unique_id": "dh_general_rwe_002",
  "original_id": "JTBD-RWE-002",
  "persona_title": "Real-World Evidence Director - Dr.\u00a0Marcus Chen",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_ORM_001: When implementing digital patient-reported outcomes, I need validated instrument...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_ORM_001',
        'Outcomes Research Manager - Jennifer Liu',
        'When implementing digital patient-reported outcomes, I need validated instruments and collection platforms, so I can capture meaningful data',
        'Commercial',
        'analytical',
        'high',
        'monthly',
        ARRAY['Completion rates: >80%', 'Data quality: >95%', 'Patient burden: Minimized', 'Validation complete: Yes']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_ORM_001",
  "unique_id": "dh_general_orm_001",
  "original_id": "JTBD-ORM-001",
  "persona_title": "Outcomes Research Manager - Jennifer Liu",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MWD_001: When communicating digital health evidence to regulators, I need structured temp...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MWD_001',
        'Medical Writing Director - Dr. Elizabeth Taylor',
        'When communicating digital health evidence to regulators, I need structured templates and clarity frameworks, so I can ensure clear understanding',
        'Clinical',
        'technical',
        'very_high',
        'weekly',
        ARRAY['Document clarity: Excellent', 'Review cycles: Minimized', 'Regulatory questions: Few', 'Approval rate: High', 'Time to submission: Reduced']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_MWD_001",
  "unique_id": "dh_general_mwd_001",
  "original_id": "JTBD-MWD-001",
  "persona_title": "Medical Writing Director - Dr.\u00a0Elizabeth Taylor",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MWD_002: When developing digital health publications, I need evidence visualization tools...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MWD_002',
        'Medical Writing Director - Dr. Elizabeth Taylor',
        'When developing digital health publications, I need evidence visualization tools and narrative frameworks, so I can tell compelling stories',
        'Clinical',
        'creative',
        'medium',
        'monthly',
        ARRAY['Acceptance rate: >70%', 'Impact factor: >5', 'Citations: Increasing', 'Clarity scores: High']::TEXT[],
        'active',
        0.65,
        '{
  "jtbd_id": "DH_GENERAL_MWD_002",
  "unique_id": "dh_general_mwd_002",
  "original_id": "JTBD-MWD-002",
  "persona_title": "Medical Writing Director - Dr.\u00a0Elizabeth Taylor",
  "importance": 8,
  "current_satisfaction": 3,
  "opportunity_score": 13,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDM_001: When integrating digital health data into clinical trials, I need standardizatio...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDM_001',
        'Clinical Data Management Lead - Robert Zhang',
        'When integrating digital health data into clinical trials, I need standardization protocols and quality frameworks, so I can ensure data integrity',
        'Clinical',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Data quality: >99%', 'Integration time: <7 days', 'Compliance: 100%', 'Query rate: <5%', 'Database lock: On schedule']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CDM_001",
  "unique_id": "dh_general_cdm_001",
  "original_id": "JTBD-CDM-001",
  "persona_title": "Clinical Data Management Lead - Robert Zhang",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDM_002: When managing continuous digital endpoint data, I need streaming pipelines and a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDM_002',
        'Clinical Data Management Lead - Robert Zhang',
        'When managing continuous digital endpoint data, I need streaming pipelines and automated validation, so I can handle high volumes efficiently',
        'Clinical',
        'analytical',
        'very_high',
        'daily',
        ARRAY['Data latency: <1 hour', 'Processing capacity: Unlimited', 'Quality maintained: >99%', 'Cost per datapoint: Optimized']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_CDM_002",
  "unique_id": "dh_general_cdm_002",
  "original_id": "JTBD-CDM-002",
  "persona_title": "Clinical Data Management Lead - Robert Zhang",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_BSD_001: When analyzing digital biomarker data, I need specialized statistical methods an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_BSD_001',
        'Biostatistics Director - Dr. Michael Wong',
        'When analyzing digital biomarker data, I need specialized statistical methods and validation approaches, so I can demonstrate clinical significance',
        'Clinical',
        'analytical',
        'very_high',
        'monthly',
        ARRAY['Statistical validity: Confirmed', 'Power achieved: >80%', 'Methods accepted: By FDA', 'Results reproducible: 100%', 'Timeline met: Yes']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_BSD_001",
  "unique_id": "dh_general_bsd_001",
  "original_id": "JTBD-BSD-001",
  "persona_title": "Biostatistics Director - Dr. Michael Wong",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_BSD_002: When designing adaptive trials with digital endpoints, I need simulation tools a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_BSD_002',
        'Biostatistics Director - Dr. Michael Wong',
        'When designing adaptive trials with digital endpoints, I need simulation tools and decision algorithms, so I can optimize trial efficiency',
        'Clinical',
        'creative',
        'very_high',
        'quarterly',
        ARRAY['Sample size: Optimized', 'Adaptation success: >90%', 'Time saved: >6 months', 'Cost reduced: >30%']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_BSD_002",
  "unique_id": "dh_general_bsd_002",
  "original_id": "JTBD-BSD-002",
  "persona_title": "Biostatistics Director - Dr. Michael Wong",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DPD_001: When evaluating digital health partnerships, I need assessment frameworks and va...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DPD_001',
        'Digital Partnerships Director - Amanda Wilson',
        'When evaluating digital health partnerships, I need assessment frameworks and value models, so I can identify strategic fits',
        'IT/Digital',
        'collaborative',
        'high',
        'weekly',
        ARRAY['Deal quality: High', 'Success rate: >60%', 'Value realized: >ROI', 'Time to deal: <6 months', 'Partner satisfaction: >4/5']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_DPD_001",
  "unique_id": "dh_general_dpd_001",
  "original_id": "JTBD-DPD-001",
  "persona_title": "Digital Partnerships Director - Amanda Wilson",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DPD_002: When managing digital health alliances, I need governance models and performance...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DPD_002',
        'Digital Partnerships Director - Amanda Wilson',
        'When managing digital health alliances, I need governance models and performance tracking, so I can ensure mutual success',
        'IT/Digital',
        'technical',
        'high',
        'monthly',
        ARRAY['Milestone achievement: >80%', 'Value delivery: On target', 'Relationship health: Strong', 'Issues resolved: Quickly']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_DPD_002",
  "unique_id": "dh_general_dpd_002",
  "original_id": "JTBD-DPD-002",
  "persona_title": "Digital Partnerships Director - Amanda Wilson",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DAL_001: When driving digital health adoption in pharma, I need change readiness assessme...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DAL_001',
        'Digital Adoption Lead - Christopher Davis',
        'When driving digital health adoption in pharma, I need change readiness assessments and engagement strategies, so I can overcome resistance',
        'Commercial',
        'collaborative',
        'very_high',
        'weekly',
        ARRAY['Adoption rate: >70%', 'Time to adoption: <6 months', 'Resistance overcome: Yes', 'Sustainability: Achieved', 'ROI demonstrated: Clear']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_DAL_001",
  "unique_id": "dh_general_dal_001",
  "original_id": "JTBD-DAL-001",
  "persona_title": "Digital Adoption Lead - Christopher Davis",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DAL_002: When transforming to digital-first mindset, I need culture change programs and s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DAL_002',
        'Digital Adoption Lead - Christopher Davis',
        'When transforming to digital-first mindset, I need culture change programs and success stories, so I can shift organizational behavior',
        'IT/Digital',
        'technical',
        'very_high',
        'monthly',
        ARRAY['Culture shift: Measurable', 'Digital fluency: >80%', 'Innovation increased: 2x', 'Engagement high: >70%']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_DAL_002",
  "unique_id": "dh_general_dal_002",
  "original_id": "JTBD-DAL-002",
  "persona_title": "Digital Adoption Lead - Christopher Davis",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DSC_001: When integrating digital therapeutics into supply chain, I need distribution mod...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DSC_001',
        'Digital Supply Chain Director - Michael Thompson',
        'When integrating digital therapeutics into supply chain, I need distribution models and quality systems, so I can ensure product availability',
        'IT/Digital',
        'administrative',
        'very_high',
        'monthly',
        ARRAY['Availability: 99.9%', 'Quality maintained: 100%', 'Distribution efficient: Yes', 'Compliance assured: 100%']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_DSC_001",
  "unique_id": "dh_general_dsc_001",
  "original_id": "JTBD-DSC-001",
  "persona_title": "Digital Supply Chain Director - Michael Thompson",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MAD_001: When developing patient support programs, I need to integrate digital tools that...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MAD_001',
        'Medical Affairs Director - Dr. Sofia Martinez',
        'When developing patient support programs, I need to integrate digital tools that demonstrate clinical impact, so I can improve adherence and outcomes',
        'Commercial',
        'creative',
        'very_high',
        'quarterly',
        ARRAY['Adherence improvement >30%', 'Clinical outcomes tracked', 'Patient satisfaction >4.5/5', 'Regulatory compliance 100%', 'Cost per patient optimized']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_MAD_001",
  "unique_id": "dh_general_mad_001",
  "original_id": "JTBD-MAD-001",
  "persona_title": "Medical Affairs Director - Dr. Sofia Martinez",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MAD_002: When generating real-world evidence for label expansion, I need digital data col...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MAD_002',
        'Medical Affairs Director - Dr. Sofia Martinez',
        'When generating real-world evidence for label expansion, I need digital data collection methods that meet regulatory standards, so I can support new indications',
        'Commercial',
        'administrative',
        'high',
        'monthly',
        ARRAY['Data quality meets FDA standards', 'Collection cost reduced 50%', 'Time to evidence <12 months', 'Multi-country harmonized', 'Publication-ready outputs']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_MAD_002",
  "unique_id": "dh_general_mad_002",
  "original_id": "JTBD-MAD-002",
  "persona_title": "Medical Affairs Director - Dr. Sofia Martinez",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MAD_003: When engaging KOLs digitally, I need compliant platforms that track interactions...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MAD_003',
        'Medical Affairs Director - Dr. Sofia Martinez',
        'When engaging KOLs digitally, I need compliant platforms that track interactions and content effectiveness, so I can optimize medical strategy',
        'Medical Affairs',
        'strategic',
        'medium',
        'weekly',
        ARRAY['KOL engagement rate >60%', 'Content effectiveness measured', 'Compliance documented 100%', 'Insights actionable']::TEXT[],
        'active',
        0.60,
        '{
  "jtbd_id": "DH_GENERAL_MAD_003",
  "unique_id": "dh_general_mad_003",
  "original_id": "JTBD-MAD-003",
  "persona_title": "Medical Affairs Director - Dr. Sofia Martinez",
  "importance": 8,
  "current_satisfaction": 4,
  "opportunity_score": 12,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDL_001: When designing hybrid trials with digital endpoints, I need validated digital bi...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDL_001',
        'Clinical Development Lead - Dr. Robert Harrison',
        'When designing hybrid trials with digital endpoints, I need validated digital biomarkers and collection methods, so I can ensure regulatory acceptance',
        'Clinical',
        'administrative',
        'very_high',
        'monthly',
        ARRAY['Digital endpoints FDA-accepted', 'Data quality >95%', 'Patient burden reduced 40%', 'Site burden minimized', 'Timeline accelerated 6 months']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CDL_001",
  "unique_id": "dh_general_cdl_001",
  "original_id": "JTBD-CDL-001",
  "persona_title": "Clinical Development Lead - Dr. Robert Harrison",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDL_002: When managing decentralized trial operations, I need integrated platforms for re...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDL_002',
        'Clinical Development Lead - Dr. Robert Harrison',
        'When managing decentralized trial operations, I need integrated platforms for remote monitoring and data collection, so I can maintain quality and compliance',
        'Clinical',
        'administrative',
        'high',
        'daily',
        ARRAY['Protocol deviations <5%', 'Data completeness >98%', 'Patient retention >85%', 'Cost per patient reduced 30%', 'Real-time visibility achieved']::TEXT[],
        'active',
        0.70,
        '{
  "jtbd_id": "DH_GENERAL_CDL_002",
  "unique_id": "dh_general_cdl_002",
  "original_id": "JTBD-CDL-002",
  "persona_title": "Clinical Development Lead - Dr. Robert Harrison",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CDL_003: When integrating digital biomarkers into protocols, I need evidence of clinical ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CDL_003',
        'Clinical Development Lead - Dr. Robert Harrison',
        'When integrating digital biomarkers into protocols, I need evidence of clinical validity and technical reliability, so I can justify to regulators',
        'Clinical',
        'technical',
        'very_high',
        'monthly',
        ARRAY['Clinical validity demonstrated', 'Technical reliability >99%', 'Regulatory precedent identified', 'Patient acceptability >80%']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_CDL_003",
  "unique_id": "dh_general_cdl_003",
  "original_id": "JTBD-CDL-003",
  "persona_title": "Clinical Development Lead - Dr. Robert Harrison",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RAM_001: When navigating combo product regulations (drug+digital), I need clear pathways ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RAM_001',
        'Regulatory Affairs Manager - Patricia Thompson',
        'When navigating combo product regulations (drug+digital), I need clear pathways and precedents, so I can ensure timely approval',
        'Regulatory',
        'technical',
        'very_high',
        'quarterly',
        ARRAY['Regulatory pathway clear', 'Submission timeline met', 'First-cycle approval achieved', 'Global alignment secured', 'No major surprises']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_RAM_001",
  "unique_id": "dh_general_ram_001",
  "original_id": "JTBD-RAM-001",
  "persona_title": "Regulatory Affairs Manager - Patricia Thompson",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RAM_002: When preparing digital health regulatory submissions, I need comprehensive docum...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RAM_002',
        'Regulatory Affairs Manager - Patricia Thompson',
        'When preparing digital health regulatory submissions, I need comprehensive documentation templates and guidance, so I can meet all requirements',
        'Regulatory',
        'administrative',
        'high',
        'monthly',
        ARRAY['Submission complete first time', 'Review questions minimized', 'Approval timeline standard', 'Cross-functional aligned', 'Reusable for future']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_RAM_002",
  "unique_id": "dh_general_ram_002",
  "original_id": "JTBD-RAM-002",
  "persona_title": "Regulatory Affairs Manager - Patricia Thompson",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RAM_003: When managing post-market surveillance for apps, I need automated monitoring and...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RAM_003',
        'Regulatory Affairs Manager - Patricia Thompson',
        'When managing post-market surveillance for apps, I need automated monitoring and reporting systems, so I can maintain compliance efficiently',
        'Regulatory',
        'administrative',
        'medium',
        'weekly',
        ARRAY['Adverse events detected quickly', 'Reports automated 80%', 'Compliance maintained 100%', 'Resource needs reduced 50%']::TEXT[],
        'active',
        0.65,
        '{
  "jtbd_id": "DH_GENERAL_RAM_003",
  "unique_id": "dh_general_ram_003",
  "original_id": "JTBD-RAM-003",
  "persona_title": "Regulatory Affairs Manager - Patricia Thompson",
  "importance": 8,
  "current_satisfaction": 3,
  "opportunity_score": 13,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MSL_001: When engaging KOLs about digital therapeutics, I need scientific evidence and ca...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MSL_001',
        'Medical Science Liaison (MSL) - Dr. Jennifer Adams',
        'When engaging KOLs about digital therapeutics, I need scientific evidence and case studies, so I can build credibility and adoption',
        'Clinical',
        'technical',
        'high',
        'weekly',
        ARRAY['KOL interest increased', 'Scientific credibility established', 'Adoption barriers identified', 'Follow-up meetings secured', 'Insights documented']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_MSL_001",
  "unique_id": "dh_general_msl_001",
  "original_id": "JTBD-MSL-001",
  "persona_title": "Medical Science Liaison (MSL) - Dr. Jennifer Adams",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_MSL_002: When training HCPs on digital companions, I need interactive demo platforms and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_MSL_002',
        'Medical Science Liaison (MSL) - Dr. Jennifer Adams',
        'When training HCPs on digital companions, I need interactive demo platforms and patient scenarios, so I can ensure proper implementation',
        'Commercial',
        'tactical',
        'medium',
        'weekly',
        ARRAY['HCP confidence improved', 'Implementation correct', 'Patient enrollment increased', 'Support requests reduced']::TEXT[],
        'active',
        0.60,
        '{
  "jtbd_id": "DH_GENERAL_MSL_002",
  "unique_id": "dh_general_msl_002",
  "original_id": "JTBD-MSL-002",
  "persona_title": "Medical Science Liaison (MSL) - Dr. Jennifer Adams",
  "importance": 8,
  "current_satisfaction": 4,
  "opportunity_score": 12,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CSL_001: When training sales force on digital therapeutics, I need clear value propositio...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CSL_001',
        'Commercial/Sales Leadership - Michael Roberts',
        'When training sales force on digital therapeutics, I need clear value propositions and objection handling, so I can drive adoption',
        'IT/Digital',
        'technical',
        'very_high',
        'monthly',
        ARRAY['Sales confidence >80%', 'Call effectiveness improved', 'Digital product mentions >50%', 'Conversion rate increased', 'Revenue targets met']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CSL_001",
  "unique_id": "dh_general_csl_001",
  "original_id": "JTBD-CSL-001",
  "persona_title": "Commercial/Sales Leadership - Michael Roberts",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CSL_002: When developing omnichannel strategies, I need integrated platforms that track c...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CSL_002',
        'Commercial/Sales Leadership - Michael Roberts',
        'When developing omnichannel strategies, I need integrated platforms that track customer journey, so I can optimize engagement',
        'Commercial',
        'creative',
        'high',
        'weekly',
        ARRAY['Customer journey mapped', 'Channel effectiveness measured', 'ROI per channel clear', 'Personalization achieved']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_CSL_002",
  "unique_id": "dh_general_csl_002",
  "original_id": "JTBD-CSL-002",
  "persona_title": "Commercial/Sales Leadership - Michael Roberts",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CMO_001: When evaluating clinical effectiveness of digital interventions, I need real-wor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CMO_001',
        'Chief Medical Officer (Payer) - Dr. William Chang',
        'When evaluating clinical effectiveness of digital interventions, I need real-world outcomes data and economic models, so I can make coverage decisions',
        'Clinical',
        'analytical',
        'very_high',
        'monthly',
        ARRAY['Clinical evidence robust', 'Economic value demonstrated', 'Coverage policy defensible', 'Provider support secured', 'Member outcomes improved']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_CMO_001",
  "unique_id": "dh_general_cmo_001",
  "original_id": "JTBD-CMO-001",
  "persona_title": "Chief Medical Officer (Payer) - Dr. William Chang",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CMO_002: When developing coverage policies for new modalities, I need clinical guidelines...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CMO_002',
        'Chief Medical Officer (Payer) - Dr. William Chang',
        'When developing coverage policies for new modalities, I need clinical guidelines and utilization criteria, so I can ensure appropriate use',
        'Clinical',
        'creative',
        'high',
        'quarterly',
        ARRAY['Guidelines evidence-based', 'Criteria clear and measurable', 'Provider acceptance >70%', 'Utilization appropriate', 'Outcomes tracked']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_CMO_002",
  "unique_id": "dh_general_cmo_002",
  "original_id": "JTBD-CMO-002",
  "persona_title": "Chief Medical Officer (Payer) - Dr. William Chang",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CMO_003: When ensuring quality metrics improvement, I need digital tools that engage memb...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CMO_003',
        'Chief Medical Officer (Payer) - Dr. William Chang',
        'When ensuring quality metrics improvement, I need digital tools that engage members and providers, so I can achieve STAR ratings',
        'Market Access',
        'administrative',
        'high',
        'weekly',
        ARRAY['HEDIS gaps closed >80%', 'STAR ratings improved', 'Member engagement increased', 'Provider participation high']::TEXT[],
        'active',
        0.70,
        '{
  "jtbd_id": "DH_GENERAL_CMO_003",
  "unique_id": "dh_general_cmo_003",
  "original_id": "JTBD-CMO-003",
  "persona_title": "Chief Medical Officer (Payer) - Dr. William Chang",
  "importance": 9,
  "current_satisfaction": 4,
  "opportunity_score": 14,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PD_001: When integrating DTx into formulary management, I need clear classification and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PD_001',
        'Pharmacy Director - Dr. Lisa Anderson',
        'When integrating DTx into formulary management, I need clear classification and tier placement criteria, so I can maintain consistency',
        'Operations',
        'operational',
        'very_high',
        'monthly',
        ARRAY['Classification framework clear', 'Tier placement justified', 'P&T committee approval', 'Provider understanding', 'Member access appropriate']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_PD_001",
  "unique_id": "dh_general_pd_001",
  "original_id": "JTBD-PD-001",
  "persona_title": "Pharmacy Director - Dr. Lisa Anderson",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PD_002: When developing prior authorization for DTx, I need clinical criteria and workfl...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PD_002',
        'Pharmacy Director - Dr. Lisa Anderson',
        'When developing prior authorization for DTx, I need clinical criteria and workflow integration, so I can ensure appropriate utilization',
        'Clinical',
        'creative',
        'high',
        'weekly',
        ARRAY['PA criteria evidence-based', 'Approval time <24 hours', 'Provider burden minimized', 'Appropriate use ensured', 'Appeals rate <5%']::TEXT[],
        'active',
        0.70,
        '{
  "jtbd_id": "DH_GENERAL_PD_002",
  "unique_id": "dh_general_pd_002",
  "original_id": "JTBD-PD-002",
  "persona_title": "Pharmacy Director - Dr. Lisa Anderson",
  "importance": 8,
  "current_satisfaction": 2,
  "opportunity_score": 14,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PD_003: When assessing digital therapeutic equivalence, I need comparative effectiveness...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PD_003',
        'Pharmacy Director - Dr. Lisa Anderson',
        'When assessing digital therapeutic equivalence, I need comparative effectiveness data, so I can make substitution decisions',
        'IT/Digital',
        'analytical',
        'high',
        'quarterly',
        ARRAY['Therapeutic equivalence established', 'Substitution criteria clear', 'Cost savings documented', 'Clinical outcomes maintained']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_PD_003",
  "unique_id": "dh_general_pd_003",
  "original_id": "JTBD-PD-003",
  "persona_title": "Pharmacy Director - Dr. Lisa Anderson",
  "importance": 8,
  "current_satisfaction": 1,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PHM_001: When managing high-risk populations, I need predictive analytics and digital int...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PHM_001',
        'Population Health Manager - Susan Mitchell',
        'When managing high-risk populations, I need predictive analytics and digital interventions, so I can prevent acute events',
        'IT/Digital',
        'analytical',
        'very_high',
        'daily',
        ARRAY['Risk prediction accurate >85%', 'Interventions timely', 'Admissions reduced 30%', 'ED visits decreased 25%', 'Cost savings achieved']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_PHM_001",
  "unique_id": "dh_general_phm_001",
  "original_id": "JTBD-PHM-001",
  "persona_title": "Population Health Manager - Susan Mitchell",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PHM_002: When deploying digital health programs, I need engagement strategies and outcome...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PHM_002',
        'Population Health Manager - Susan Mitchell',
        'When deploying digital health programs, I need engagement strategies and outcome tracking, so I can demonstrate value',
        'Commercial',
        'tactical',
        'high',
        'weekly',
        ARRAY['Engagement rate >40%', 'Outcomes measurable', 'ROI documented', 'Scalability proven']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_PHM_002",
  "unique_id": "dh_general_phm_002",
  "original_id": "JTBD-PHM-002",
  "persona_title": "Population Health Manager - Susan Mitchell",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_QRM_001: When improving HEDIS/STAR ratings with digital tools, I need automated gap closu...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_QRM_001',
        'Quality/STAR Ratings Manager - David Brown',
        'When improving HEDIS/STAR ratings with digital tools, I need automated gap closure and member engagement, so I can achieve quality bonuses',
        'Commercial',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Gap closure rate >85%', 'STAR rating improved 0.5', 'Member satisfaction >80%', 'Provider burden reduced', 'Bonus payments secured']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_QRM_001",
  "unique_id": "dh_general_qrm_001",
  "original_id": "JTBD-QRM-001",
  "persona_title": "Quality/STAR Ratings Manager - David Brown",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_QRM_002: When tracking quality metrics from digital interventions, I need real-time dashb...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_QRM_002',
        'Quality/STAR Ratings Manager - David Brown',
        'When tracking quality metrics from digital interventions, I need real-time dashboards and predictive analytics, so I can intervene proactively',
        'IT/Digital',
        'administrative',
        'high',
        'weekly',
        ARRAY['Real-time visibility achieved', 'Predictions accurate >80%', 'Interventions timely', 'Metrics improved']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_QRM_002",
  "unique_id": "dh_general_qrm_002",
  "original_id": "JTBD-QRM-002",
  "persona_title": "Quality/STAR Ratings Manager - David Brown",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_FP_001: When integrating digital tools into clinical workflow, I need seamless EMR integ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_FP_001',
        'Frontline Physician - Dr. Emily Johnson',
        'When integrating digital tools into clinical workflow, I need seamless EMR integration and evidence summaries, so I can use them efficiently',
        'Clinical',
        'technical',
        'very_high',
        'daily',
        ARRAY['EMR integration seamless', 'Time per patient unchanged', 'Evidence readily available', 'Patient outcomes improved', 'Documentation automated']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_FP_001",
  "unique_id": "dh_general_fp_001",
  "original_id": "JTBD-FP-001",
  "persona_title": "Frontline Physician - Dr. Emily Johnson",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_FP_002: When interpreting digital biomarker data, I need clinical context and actionable...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_FP_002',
        'Frontline Physician - Dr. Emily Johnson',
        'When interpreting digital biomarker data, I need clinical context and actionable insights, so I can make treatment decisions',
        'Clinical',
        'analytical',
        'very_high',
        'daily',
        ARRAY['Data clinically relevant', 'Insights actionable', 'False positives minimal', 'Time to decision reduced', 'Confidence increased']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_FP_002",
  "unique_id": "dh_general_fp_002",
  "original_id": "JTBD-FP-002",
  "persona_title": "Frontline Physician - Dr. Emily Johnson",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_FP_003: When prescribing DTx, I need efficacy data and patient selection criteria, so I ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_FP_003',
        'Frontline Physician - Dr. Emily Johnson',
        'When prescribing DTx, I need efficacy data and patient selection criteria, so I can ensure appropriate use',
        'Commercial',
        'analytical',
        'medium',
        'weekly',
        ARRAY['Efficacy evidence clear', 'Patient criteria defined', 'Insurance coverage known', 'Monitoring simplified']::TEXT[],
        'active',
        0.65,
        '{
  "jtbd_id": "DH_GENERAL_FP_003",
  "unique_id": "dh_general_fp_003",
  "original_id": "JTBD-FP-003",
  "persona_title": "Frontline Physician - Dr. Emily Johnson",
  "importance": 8,
  "current_satisfaction": 3,
  "opportunity_score": 13,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CMIO_001: When ensuring clinical IT system integration, I need standards-based APIs and se...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CMIO_001',
        'Chief Medical Information Officer (CMIO) - Dr. Richard Park',
        'When ensuring clinical IT system integration, I need standards-based APIs and security protocols, so I can maintain interoperability',
        'Clinical',
        'administrative',
        'very_high',
        'weekly',
        ARRAY['Integration time <30 days', 'FHIR compliance achieved', 'Security standards met', 'Downtime minimal', 'Clinician satisfaction >70%']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CMIO_001",
  "unique_id": "dh_general_cmio_001",
  "original_id": "JTBD-CMIO-001",
  "persona_title": "Chief Medical Information Officer (CMIO) - Dr. Richard Park",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CMIO_002: When validating clinical decision support tools, I need evidence base and perfor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CMIO_002',
        'Chief Medical Information Officer (CMIO) - Dr. Richard Park',
        'When validating clinical decision support tools, I need evidence base and performance metrics, so I can ensure safety and efficacy',
        'Commercial',
        'operational',
        'very_high',
        'monthly',
        ARRAY['Clinical accuracy >95%', 'Alert fatigue minimized', 'Outcomes improvement demonstrated', 'Liability risk managed', 'Physician trust earned']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CMIO_002",
  "unique_id": "dh_general_cmio_002",
  "original_id": "JTBD-CMIO-002",
  "persona_title": "Chief Medical Information Officer (CMIO) - Dr. Richard Park",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CMIO_003: When overseeing AI/ML implementation, I need explainability and bias detection, ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CMIO_003',
        'Chief Medical Information Officer (CMIO) - Dr. Richard Park',
        'When overseeing AI/ML implementation, I need explainability and bias detection, so I can ensure equitable care',
        'Operations',
        'tactical',
        'very_high',
        'quarterly',
        ARRAY['Model explainable', 'Bias detected and mitigated', 'Performance monitored', 'Governance established']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_CMIO_003",
  "unique_id": "dh_general_cmio_003",
  "original_id": "JTBD-CMIO-003",
  "persona_title": "Chief Medical Information Officer (CMIO) - Dr. Richard Park",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_NM_001: When deploying nursing staff for virtual care, I need competency frameworks and ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_NM_001',
        'Nurse Manager/Chief Nursing Officer - Margaret O''Brien',
        'When deploying nursing staff for virtual care, I need competency frameworks and workflow protocols, so I can ensure quality',
        'Operations',
        'administrative',
        'very_high',
        'weekly',
        ARRAY['Competencies defined', 'Training completed 100%', 'Workflows optimized', 'Quality maintained', 'Satisfaction high']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_NM_001",
  "unique_id": "dh_general_nm_001",
  "original_id": "JTBD-NM-001",
  "persona_title": "Nurse Manager/Chief Nursing Officer - Margaret O''Brien",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_NM_002: When training nurses on digital tools, I need simulation platforms and competenc...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_NM_002',
        'Nurse Manager/Chief Nursing Officer - Margaret O''Brien',
        'When training nurses on digital tools, I need simulation platforms and competency assessments, so I can ensure safe use',
        'IT/Digital',
        'technical',
        'high',
        'monthly',
        ARRAY['Training completion 100%', 'Competency demonstrated', 'Error rates reduced', 'Efficiency improved', 'Confidence increased']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_NM_002",
  "unique_id": "dh_general_nm_002",
  "original_id": "JTBD-NM-002",
  "persona_title": "Nurse Manager/Chief Nursing Officer - Margaret O''Brien",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_NM_003: When managing remote monitoring workflows, I need staffing models and escalation...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_NM_003',
        'Nurse Manager/Chief Nursing Officer - Margaret O''Brien',
        'When managing remote monitoring workflows, I need staffing models and escalation protocols, so I can optimize resources',
        'Operations',
        'operational',
        'medium',
        'daily',
        ARRAY['Staffing optimized', 'Response times met', 'Escalations appropriate', 'Outcomes improved']::TEXT[],
        'active',
        0.65,
        '{
  "jtbd_id": "DH_GENERAL_NM_003",
  "unique_id": "dh_general_nm_003",
  "original_id": "JTBD-NM-003",
  "persona_title": "Nurse Manager/Chief Nursing Officer - Margaret O''Brien",
  "importance": 8,
  "current_satisfaction": 3,
  "opportunity_score": 13,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_QSD_001: When measuring digital intervention outcomes, I need validated metrics and attri...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_QSD_001',
        'Quality/Safety Director - Dr. Barbara Wilson',
        'When measuring digital intervention outcomes, I need validated metrics and attribution methods, so I can demonstrate impact',
        'IT/Digital',
        'technical',
        'very_high',
        'monthly',
        ARRAY['Metrics validated', 'Attribution clear', 'Outcomes improved', 'Reports automated', 'Stakeholders convinced']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_QSD_001",
  "unique_id": "dh_general_qsd_001",
  "original_id": "JTBD-QSD-001",
  "persona_title": "Quality/Safety Director - Dr. Barbara Wilson",
  "importance": 9,
  "current_satisfaction": 2,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_QSD_002: When ensuring patient safety with digital tools, I need risk assessment framewor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_QSD_002',
        'Quality/Safety Director - Dr. Barbara Wilson',
        'When ensuring patient safety with digital tools, I need risk assessment frameworks and monitoring systems, so I can prevent harm',
        'Commercial',
        'technical',
        'very_high',
        'weekly',
        ARRAY['Risks identified proactively', 'Adverse events prevented', 'Monitoring continuous', 'Response rapid']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_QSD_002",
  "unique_id": "dh_general_qsd_002",
  "original_id": "JTBD-QSD-002",
  "persona_title": "Quality/Safety Director - Dr. Barbara Wilson",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CTO_001: When building HIPAA-compliant infrastructure, I need security frameworks and aud...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CTO_001',
        'CTO/Technical Co-founder - Alex Kumar',
        'When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits',
        'Regulatory',
        'administrative',
        'very_high',
        'weekly',
        ARRAY['HIPAA compliance achieved', 'Audits passed first time', 'Security incidents zero', 'Documentation complete', 'Cost optimized']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_CTO_001",
  "unique_id": "dh_general_cto_001",
  "original_id": "JTBD-CTO-001",
  "persona_title": "CTO/Technical Co-founder - Alex Kumar",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CTO_002: When scaling platform for growth, I need architecture patterns and performance o...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CTO_002',
        'CTO/Technical Co-founder - Alex Kumar',
        'When scaling platform for growth, I need architecture patterns and performance optimization, so I can handle 10x users',
        'IT/Digital',
        'technical',
        'high',
        'monthly',
        ARRAY['10x scale achieved', 'Performance maintained', 'Costs linear not exponential', 'Reliability 99.99%', 'Team productivity high']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_CTO_002",
  "unique_id": "dh_general_cto_002",
  "original_id": "JTBD-CTO-002",
  "persona_title": "CTO/Technical Co-founder - Alex Kumar",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CTO_003: When managing technical debt, I need prioritization frameworks and refactoring s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CTO_003',
        'CTO/Technical Co-founder - Alex Kumar',
        'When managing technical debt, I need prioritization frameworks and refactoring strategies, so I can balance speed and quality',
        'Operations',
        'administrative',
        'medium',
        'quarterly',
        ARRAY['Debt ratio controlled', 'Velocity maintained', 'Quality improved', 'Team morale high']::TEXT[],
        'active',
        0.65,
        '{
  "jtbd_id": "DH_GENERAL_CTO_003",
  "unique_id": "dh_general_cto_003",
  "original_id": "JTBD-CTO-003",
  "persona_title": "CTO/Technical Co-founder - Alex Kumar",
  "importance": 8,
  "current_satisfaction": 3,
  "opportunity_score": 13,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CS_001: When driving user engagement and retention, I need behavioral analytics and inte...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CS_001',
        'VP Customer Success - Rachel Green',
        'When driving user engagement and retention, I need behavioral analytics and intervention playbooks, so I can reduce churn',
        'Commercial',
        'analytical',
        'very_high',
        'daily',
        ARRAY['Churn reduced to <10%', 'Engagement increased 50%', 'NPS improved to >50', 'Expansion revenue 120%', 'CAC/LTV ratio >3']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CS_001",
  "unique_id": "dh_general_cs_001",
  "original_id": "JTBD-CS-001",
  "persona_title": "VP Customer Success - Rachel Green",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CS_002: When ensuring clinical outcomes achievement, I need outcome tracking and success...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CS_002',
        'VP Customer Success - Rachel Green',
        'When ensuring clinical outcomes achievement, I need outcome tracking and success protocols, so I can demonstrate value',
        'Clinical',
        'operational',
        'high',
        'weekly',
        ARRAY['Outcomes tracked 100%', 'Success rate >80%', 'Case studies developed', 'Renewals secured']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_CS_002",
  "unique_id": "dh_general_cs_002",
  "original_id": "JTBD-CS-002",
  "persona_title": "VP Customer Success - Rachel Green",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_GM_001: When optimizing patient acquisition funnels, I need attribution modeling and cha...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_GM_001',
        'Growth Marketing Lead - Jason Martinez',
        'When optimizing patient acquisition funnels, I need attribution modeling and channel optimization, so I can reduce CAC below LTV/3',
        'Commercial',
        'operational',
        'very_high',
        'daily',
        ARRAY['CAC reduced <$30', 'Conversion rate >5%', 'Channel ROI clear', 'Scale achieved', 'Quality maintained']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_GM_001",
  "unique_id": "dh_general_gm_001",
  "original_id": "JTBD-GM-001",
  "persona_title": "Growth Marketing Lead - Jason Martinez",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_GM_002: When building referral programs, I need incentive design and viral mechanics, so...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_GM_002',
        'Growth Marketing Lead - Jason Martinez',
        'When building referral programs, I need incentive design and viral mechanics, so I can achieve organic growth',
        'Operations',
        'creative',
        'high',
        'monthly',
        ARRAY['Viral coefficient >1.2', 'Referral rate >30%', 'CAC near zero', 'Quality high']::TEXT[],
        'active',
        0.70,
        '{
  "jtbd_id": "DH_GENERAL_GM_002",
  "unique_id": "dh_general_gm_002",
  "original_id": "JTBD-GM-002",
  "persona_title": "Growth Marketing Lead - Jason Martinez",
  "importance": 8,
  "current_satisfaction": 2,
  "opportunity_score": 14,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_VC_001: When evaluating digital health opportunities, I need clinical validation and mar...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_VC_001',
        'VC Partner/Investor - Dr. James Mitchell',
        'When evaluating digital health opportunities, I need clinical validation and market sizing frameworks, so I can identify winners',
        'Clinical',
        'technical',
        'very_high',
        'weekly',
        ARRAY['Deal quality improved', 'Success rate >20%', 'Returns >3x', 'Portfolio diversified', 'Reputation enhanced']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_VC_001",
  "unique_id": "dh_general_vc_001",
  "original_id": "JTBD-VC-001",
  "persona_title": "VC Partner/Investor - Dr. James Mitchell",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_VC_002: When providing strategic guidance, I need benchmarks and best practices, so I ca...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_VC_002',
        'VC Partner/Investor - Dr. James Mitchell',
        'When providing strategic guidance, I need benchmarks and best practices, so I can accelerate portfolio growth',
        'Operations',
        'operational',
        'medium',
        'monthly',
        ARRAY['Portfolio growth accelerated', 'Milestones achieved', 'Next round secured', 'Exits optimized']::TEXT[],
        'active',
        0.60,
        '{
  "jtbd_id": "DH_GENERAL_VC_002",
  "unique_id": "dh_general_vc_002",
  "original_id": "JTBD-VC-002",
  "persona_title": "VC Partner/Investor - Dr. James Mitchell",
  "importance": 8,
  "current_satisfaction": 4,
  "opportunity_score": 12,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CAC_001: When providing medical credibility, I need evidence frameworks and publication s...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CAC_001',
        'Clinical Advisory Board Chair - Dr. Patricia Lee',
        'When providing medical credibility, I need evidence frameworks and publication strategies, so I can build market trust',
        'Clinical',
        'operational',
        'high',
        'monthly',
        ARRAY['Publications achieved', 'KOLs engaged', 'Credibility established', 'Adoption accelerated']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_CAC_001",
  "unique_id": "dh_general_cac_001",
  "original_id": "JTBD-CAC-001",
  "persona_title": "Clinical Advisory Board Chair - Dr. Patricia Lee",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RC_001: When preparing FDA submissions for novel digital health products, I need precede...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RC_001',
        'Regulatory Consultant - Mark Stevens',
        'When preparing FDA submissions for novel digital health products, I need precedent analysis and pathway optimization, so I can ensure approval',
        'Regulatory',
        'analytical',
        'very_high',
        'monthly',
        ARRAY['Pathway optimized', 'Submission complete', 'Questions minimal', 'Approval achieved']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_RC_001",
  "unique_id": "dh_general_rc_001",
  "original_id": "JTBD-RC-001",
  "persona_title": "Regulatory Consultant - Mark Stevens",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_COD_001: When optimizing clinical workflows with digital tools, I need process mapping an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_COD_001',
        'Clinical Operations Director - Nancy White',
        'When optimizing clinical workflows with digital tools, I need process mapping and change management, so I can improve efficiency',
        'Clinical',
        'technical',
        'high',
        'weekly',
        ARRAY['Workflow time reduced 30%', 'Staff satisfaction improved', 'Patient flow optimized', 'Quality maintained']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_COD_001",
  "unique_id": "dh_general_cod_001",
  "original_id": "JTBD-COD-001",
  "persona_title": "Clinical Operations Director - Nancy White",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_ITD_001: When managing healthcare IT infrastructure, I need integration standards and sec...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_ITD_001',
        'IT Director/CIO - Thomas Anderson',
        'When managing healthcare IT infrastructure, I need integration standards and security frameworks, so I can ensure reliability',
        'Operations',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Uptime 99.99%', 'Security incidents zero', 'Integration time reduced', 'Costs optimized']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_ITD_001",
  "unique_id": "dh_general_itd_001",
  "original_id": "JTBD-ITD-001",
  "persona_title": "IT Director/CIO - Thomas Anderson",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_BM_001: When positioning digital companions with our brand, I need messaging frameworks ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_BM_001',
        'Brand Manager (Pharma) - Jessica Taylor',
        'When positioning digital companions with our brand, I need messaging frameworks and ROI models, so I can drive adoption',
        'IT/Digital',
        'technical',
        'high',
        'quarterly',
        ARRAY['Message resonance tested', 'Adoption increased 40%', 'Brand equity enhanced', 'ROI demonstrated']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_BM_001",
  "unique_id": "dh_general_bm_001",
  "original_id": "JTBD-BM-001",
  "persona_title": "Brand Manager (Pharma) - Jessica Taylor",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_SL_001: When selling to health systems, I need ROI calculators and case studies, so I ca...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_SL_001',
        'Sales Leader (Digital Health) - Brian Foster',
        'When selling to health systems, I need ROI calculators and case studies, so I can demonstrate value',
        'IT/Digital',
        'technical',
        'very_high',
        'daily',
        ARRAY['Win rate >30%', 'Deal size increased', 'Cycle time reduced', 'Quota achieved']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_SL_001",
  "unique_id": "dh_general_sl_001",
  "original_id": "JTBD-SL-001",
  "persona_title": "Sales Leader (Digital Health) - Brian Foster",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PDL_001: When developing medical-grade software, I need quality management systems and va...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PDL_001',
        'Product Development Lead - Jason Kim',
        'When developing medical-grade software, I need quality management systems and validation protocols, so I can ensure FDA compliance',
        'Regulatory',
        'administrative',
        'very_high',
        'daily',
        ARRAY['FDA compliance: 100%', 'Quality system: Mature', 'Defect rate: <0.1%', 'Release cycle: Predictable', 'Audit ready: Always']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_PDL_001",
  "unique_id": "dh_general_pdl_001",
  "original_id": "JTBD-PDL-001",
  "persona_title": "Product Development Lead - Jason Kim",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PDL_002: When iterating based on clinical feedback, I need rapid development cycles and t...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PDL_002',
        'Product Development Lead - Jason Kim',
        'When iterating based on clinical feedback, I need rapid development cycles and testing frameworks, so I can improve quickly while maintaining quality',
        'Clinical',
        'administrative',
        'high',
        'weekly',
        ARRAY['Iteration speed: <2 weeks', 'Quality maintained: Yes', 'User satisfaction: >4.5/5', 'Compliance intact: 100%']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_PDL_002",
  "unique_id": "dh_general_pdl_002",
  "original_id": "JTBD-PDL-002",
  "persona_title": "Product Development Lead - Jason Kim",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CRD_001: When validating digital therapeutics efficacy, I need lean clinical trial design...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CRD_001',
        'Clinical Research Director (Startup) - Dr. Nancy Park',
        'When validating digital therapeutics efficacy, I need lean clinical trial designs and efficient recruitment, so I can generate evidence within budget',
        'Clinical',
        'creative',
        'very_high',
        'monthly',
        ARRAY['Primary endpoint met: Yes', 'Timeline achieved: On schedule', 'Budget maintained: Within 10%', 'Quality assured: 100%', 'FDA acceptance: Achieved']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CRD_001",
  "unique_id": "dh_general_crd_001",
  "original_id": "JTBD-CRD-001",
  "persona_title": "Clinical Research Director (Startup) - Dr. Nancy Park",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CRD_002: When publishing clinical results, I need publication strategies and journal rela...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CRD_002',
        'Clinical Research Director (Startup) - Dr. Nancy Park',
        'When publishing clinical results, I need publication strategies and journal relationships, so I can build scientific credibility',
        'Clinical',
        'operational',
        'medium',
        'quarterly',
        ARRAY['Publication accepted: Top tier', 'Time to publication: <6 months', 'Citations growing: Yes', 'KOL engagement: High']::TEXT[],
        'active',
        0.65,
        '{
  "jtbd_id": "DH_GENERAL_CRD_002",
  "unique_id": "dh_general_crd_002",
  "original_id": "JTBD-CRD-002",
  "persona_title": "Clinical Research Director (Startup) - Dr. Nancy Park",
  "importance": 8,
  "current_satisfaction": 3,
  "opportunity_score": 13,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_QRM_001: When building QMS for digital health startup, I need scalable frameworks and aut...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_QRM_001',
        'Quality & Regulatory Manager (Startup) - Linda Chen',
        'When building QMS for digital health startup, I need scalable frameworks and automation tools, so I can maintain compliance efficiently',
        'Regulatory',
        'administrative',
        'very_high',
        'daily',
        ARRAY['QMS maturity: Level 3+', 'Audit findings: Minimal', 'Compliance: 100%', 'Efficiency: Optimized']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_QRM_001",
  "unique_id": "dh_general_qrm_001",
  "original_id": "JTBD-QRM-001",
  "persona_title": "Quality & Regulatory Manager (Startup) - Linda Chen",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_BDD_001: When securing pharma partnerships for DTx, I need value proposition frameworks a...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_BDD_001',
        'Business Development Director (Startup) - Kevin Miller',
        'When securing pharma partnerships for DTx, I need value proposition frameworks and pilot programs, so I can demonstrate mutual benefit',
        'Operations',
        'collaborative',
        'very_high',
        'monthly',
        ARRAY['Partnerships secured: >5/year', 'Deal value: >$5M each', 'Time to close: <6 months', 'Pilot success: >80%']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_BDD_001",
  "unique_id": "dh_general_bdd_001",
  "original_id": "JTBD-BDD-001",
  "persona_title": "Business Development Director (Startup) - Kevin Miller",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_ISM_001: When implementing digital health solutions at scale, I need deployment playbooks...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_ISM_001',
        'Implementation Success Manager - Sarah Johnson',
        'When implementing digital health solutions at scale, I need deployment playbooks and change management tools, so I can ensure adoption',
        'IT/Digital',
        'tactical',
        'very_high',
        'monthly',
        ARRAY['Go-live on time: >90%', 'Adoption rate: >70%', 'User satisfaction: >4/5', 'Issues resolved: <24 hours']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_ISM_001",
  "unique_id": "dh_general_ism_001",
  "original_id": "JTBD-ISM-001",
  "persona_title": "Implementation Success Manager - Sarah Johnson",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_CCD_001: When developing therapeutic content, I need evidence-based frameworks and engage...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_CCD_001',
        'Clinical Content Developer - Dr. Rachel Martinez',
        'When developing therapeutic content, I need evidence-based frameworks and engagement strategies, so I can drive behavior change',
        'Commercial',
        'creative',
        'very_high',
        'weekly',
        ARRAY['Clinical accuracy: 100%', 'Engagement rate: >60%', 'Completion rate: >40%', 'Behavior change: Measurable']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_CCD_001",
  "unique_id": "dh_general_ccd_001",
  "original_id": "JTBD-CCD-001",
  "persona_title": "Clinical Content Developer - Dr. Rachel Martinez",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_RSL_001: When securing reimbursement for digital therapeutics, I need economic models and...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_RSL_001',
        'Reimbursement Strategy Lead - William Davis',
        'When securing reimbursement for digital therapeutics, I need economic models and clinical dossiers, so I can convince payers',
        'Clinical',
        'technical',
        'very_high',
        'monthly',
        ARRAY['Coverage achieved: >50%', 'Time to coverage: <12 months', 'Reimbursement rate: Sustainable', 'CPT codes: Secured']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_RSL_001",
  "unique_id": "dh_general_rsl_001",
  "original_id": "JTBD-RSL-001",
  "persona_title": "Reimbursement Strategy Lead - William Davis",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DSL_001: When developing healthcare ML models, I need validation frameworks and explainab...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DSL_001',
        'Data Science Lead (Startup) - Dr. Anthony Lee',
        'When developing healthcare ML models, I need validation frameworks and explainability tools, so I can ensure clinical reliability',
        'Clinical',
        'creative',
        'very_high',
        'weekly',
        ARRAY['Model accuracy: >92%', 'Explainability: Clear', 'Bias eliminated: Yes', 'Clinical validation: Complete']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_DSL_001",
  "unique_id": "dh_general_dsl_001",
  "original_id": "JTBD-DSL-001",
  "persona_title": "Data Science Lead (Startup) - Dr. Anthony Lee",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_SPO_001: When protecting patient data in digital health, I need zero-trust architectures ...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_SPO_001',
        'Security & Privacy Officer - Michael Brown',
        'When protecting patient data in digital health, I need zero-trust architectures and privacy controls, so I can prevent breaches',
        'Commercial',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Breaches: Zero', 'Compliance: 100%', 'Audit findings: Minimal', 'Privacy preserved: Always']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_SPO_001",
  "unique_id": "dh_general_spo_001",
  "original_id": "JTBD-SPO-001",
  "persona_title": "Security & Privacy Officer - Michael Brown",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DTXC_001: When building prescription digital therapeutics business, I need regulatory path...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DTXC_001',
        'Digital Therapeutics CEO - Dr. Sarah Mitchell',
        'When building prescription digital therapeutics business, I need regulatory pathways and reimbursement strategies, so I can achieve sustainable growth',
        'Regulatory',
        'administrative',
        'very_high',
        'daily',
        ARRAY['FDA clearance achieved', 'CPT codes secured', 'Payer coverage >50%', 'Revenue growing >100% YoY']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_DTXC_001",
  "unique_id": "dh_general_dtxc_001",
  "original_id": "JTBD-DTXC-001",
  "persona_title": "Digital Therapeutics CEO - Dr. Sarah Mitchell",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DBS_001: When validating novel digital biomarkers, I need clinical correlation methods an...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DBS_001',
        'Digital Biomarker Scientist - Dr. Ming Li',
        'When validating novel digital biomarkers, I need clinical correlation methods and regulatory acceptance criteria, so I can achieve industry adoption',
        'Clinical',
        'administrative',
        'very_high',
        'monthly',
        ARRAY['Clinical correlation >0.8', 'FDA qualification achieved', 'Pharma partnerships secured', 'Publications in top journals']::TEXT[],
        'active',
        0.90,
        '{
  "jtbd_id": "DH_GENERAL_DBS_001",
  "unique_id": "dh_general_dbs_001",
  "original_id": "JTBD-DBS-001",
  "persona_title": "Digital Biomarker Scientist - Dr. Ming Li",
  "importance": 10,
  "current_satisfaction": 2,
  "opportunity_score": 18,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_VCP_001: When scaling virtual care platform, I need interoperability standards and workfl...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_VCP_001',
        'Virtual Care Platform CPO - Jennifer Adams',
        'When scaling virtual care platform, I need interoperability standards and workflow optimization tools, so I can serve enterprise health systems',
        'IT/Digital',
        'technical',
        'very_high',
        'weekly',
        ARRAY['Enterprise clients >100', 'Provider satisfaction >4.5/5', 'Patient NPS >60', 'Platform reliability 99.99%']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_VCP_001",
  "unique_id": "dh_general_vcp_001",
  "original_id": "JTBD-VCP-001",
  "persona_title": "Virtual Care Platform CPO - Jennifer Adams",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DHC_001: When advising on digital health strategy, I need maturity assessment tools and t...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DHC_001',
        'Digital Health Consultant - Mark Thompson',
        'When advising on digital health strategy, I need maturity assessment tools and transformation playbooks, so I can deliver measurable value',
        'IT/Digital',
        'strategic',
        'very_high',
        'monthly',
        ARRAY['Client satisfaction >9/10', 'ROI achieved >3x', 'Repeat business >60%', 'Referrals generated']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_DHC_001",
  "unique_id": "dh_general_dhc_001",
  "original_id": "JTBD-DHC-001",
  "persona_title": "Digital Health Consultant - Mark Thompson",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_HTI_001: When evaluating digital health investments, I need clinical validation framework...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_HTI_001',
        'Health Tech Investor - Dr. Rebecca Chen',
        'When evaluating digital health investments, I need clinical validation frameworks and market sizing models, so I can identify unicorns',
        'Clinical',
        'technical',
        'very_high',
        'weekly',
        ARRAY['IRR >30%', 'Portfolio success rate >25%', 'Fund multiple >3x', 'Reputation enhanced']::TEXT[],
        'active',
        0.80,
        '{
  "jtbd_id": "DH_GENERAL_HTI_001",
  "unique_id": "dh_general_hti_001",
  "original_id": "JTBD-HTI-001",
  "persona_title": "Health Tech Investor - Dr. Rebecca Chen",
  "importance": 10,
  "current_satisfaction": 4,
  "opportunity_score": 16,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_HAP_001: When building healthcare API ecosystem, I need interoperability standards and de...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_HAP_001',
        'Healthcare API Platform Lead - Kevin Zhang',
        'When building healthcare API ecosystem, I need interoperability standards and developer tools, so I can accelerate digital health innovation',
        'IT/Digital',
        'strategic',
        'very_high',
        'daily',
        ARRAY['Developer adoption >10K', 'API reliability 99.99%', 'Time to integration <1 week', 'Marketplace GMV >$100M']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_HAP_001",
  "unique_id": "dh_general_hap_001",
  "original_id": "JTBD-HAP-001",
  "persona_title": "Healthcare API Platform Lead - Kevin Zhang",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_AML_001: When developing medical AI models, I need bias detection tools and clinical vali...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_AML_001',
        'AI/ML Healthcare Researcher - Dr. Sophia Kumar',
        'When developing medical AI models, I need bias detection tools and clinical validation frameworks, so I can ensure safe deployment',
        'Clinical',
        'creative',
        'very_high',
        'monthly',
        ARRAY['Model accuracy >95%', 'Bias metrics acceptable', 'Clinical validation complete', 'Regulatory approval achieved']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_AML_001",
  "unique_id": "dh_general_aml_001",
  "original_id": "JTBD-AML-001",
  "persona_title": "AI/ML Healthcare Researcher - Dr. Sophia Kumar",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DCT_001: When running decentralized clinical trials, I need integrated technology platfor...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DCT_001',
        'Digital Clinical Trials Director - Dr. Michael Brown',
        'When running decentralized clinical trials, I need integrated technology platforms and remote monitoring capabilities, so I can ensure quality and efficiency',
        'Clinical',
        'administrative',
        'very_high',
        'monthly',
        ARRAY['Enrollment 2x faster', 'Retention >90%', 'Data quality maintained', 'Cost reduced 30%']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_DCT_001",
  "unique_id": "dh_general_dct_001",
  "original_id": "JTBD-DCT-001",
  "persona_title": "Digital Clinical Trials Director - Dr. Michael Brown",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_PDP_001: When building patient data platforms, I need consent management systems and priv...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_PDP_001',
        'Patient Data Platform Architect - David Lee',
        'When building patient data platforms, I need consent management systems and privacy-preserving computation, so I can enable compliant data sharing',
        'Commercial',
        'administrative',
        'very_high',
        'daily',
        ARRAY['Data quality >99%', 'Query performance <100ms', 'Privacy guaranteed', 'Consent tracked 100%']::TEXT[],
        'active',
        0.85,
        '{
  "jtbd_id": "DH_GENERAL_PDP_001",
  "unique_id": "dh_general_pdp_001",
  "original_id": "JTBD-PDP-001",
  "persona_title": "Patient Data Platform Architect - David Lee",
  "importance": 10,
  "current_satisfaction": 3,
  "opportunity_score": 17,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- DH_GENERAL_DHP_001: When shaping digital health policy, I need evidence synthesis tools and stakehol...
    INSERT INTO jobs_to_be_done (
        tenant_id, code, name, description,
        functional_area, job_category, complexity, frequency,
        success_criteria,
        status, validation_score, metadata
    ) VALUES (
        v_tenant_id,
        'DH_GENERAL_DHP_001',
        'Digital Health Policy Advisor - Patricia Williams',
        'When shaping digital health policy, I need evidence synthesis tools and stakeholder alignment methods, so I can drive meaningful change',
        'Clinical',
        'technical',
        'high',
        'monthly',
        ARRAY['Policy adopted', 'Industry aligned', 'Patient access improved', 'Innovation enabled']::TEXT[],
        'active',
        0.75,
        '{
  "jtbd_id": "DH_GENERAL_DHP_001",
  "unique_id": "dh_general_dhp_001",
  "original_id": "JTBD-DHP-001",
  "persona_title": "Digital Health Policy Advisor - Patricia Williams",
  "importance": 9,
  "current_satisfaction": 3,
  "opportunity_score": 15,
  "source": "Digital Health JTBD Library v1.0"
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
        validation_score = EXCLUDED.validation_score,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    RAISE NOTICE '===============================================================';
    RAISE NOTICE 'DIGITAL HEALTH JTBDs IMPORT COMPLETE';
    RAISE NOTICE '===============================================================';
    RAISE NOTICE 'Total JTBDs imported: %', v_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Category Breakdown:';
    RAISE NOTICE '  Patient Solutions & Services:  ~20 JTBDs';
    RAISE NOTICE '  Clinical & Evidence:           ~25 JTBDs';
    RAISE NOTICE '  Digital Product & Platform:    ~30 JTBDs';
    RAISE NOTICE '  Commercial & Market Access:    ~20 JTBDs';
    RAISE NOTICE '  Regulatory & Compliance:       ~15 JTBDs';
    RAISE NOTICE '';
    RAISE NOTICE 'Platform resources available for Digital Health organizations';
    RAISE NOTICE '===============================================================';

END $$;
