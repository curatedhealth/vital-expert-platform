-- =====================================================================
-- COMPLETE DIGITAL HEALTH ORGANIZATIONAL STRUCTURE
-- Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 (VITAL System)
-- Industry: e5f6a7b8-5555-4eee-8005-000000000005 (Digital Health)
-- =====================================================================
-- This migration adds:
-- - 38 missing departments (2 already exist: Clinical Validation, Real-World Evidence)
-- - ~160 roles across all 40 departments
-- - Industry mappings via function_industries junction table
-- =====================================================================

BEGIN;

DO $$
DECLARE
    v_tenant_id uuid := 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
    v_industry_id uuid := 'e5f6a7b8-5555-4eee-8005-000000000005';
    v_func_id uuid;
    v_dept_id uuid;
    v_dept_count INTEGER := 0;
    v_role_count INTEGER := 0;
    v_mapping_count INTEGER := 0;
    v_existing_dept_id uuid;
    v_existing_role_id uuid;
BEGIN
    RAISE NOTICE '=== DIGITAL HEALTH COMPLETE STRUCTURE MIGRATION ===';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Industry ID: %', v_industry_id;
    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 1: MAP FUNCTIONS TO DIGITAL HEALTH INDUSTRY
    -- =====================================================================
    RAISE NOTICE '=== STEP 1: MAPPING FUNCTIONS TO DIGITAL HEALTH INDUSTRY ===';
    
    FOR v_func_id IN 
        SELECT id FROM org_functions 
        WHERE tenant_id = v_tenant_id AND industry = 'Digital Health'
    LOOP
        INSERT INTO function_industries (function_id, industry_id)
        VALUES (v_func_id, v_industry_id)
        ON CONFLICT (function_id, industry_id) DO NOTHING;
        v_mapping_count := v_mapping_count + 1;
    END LOOP;
    RAISE NOTICE '✅ Mapped % functions to Digital Health industry', v_mapping_count;

    -- =====================================================================
    -- STEP 2: CREATE DEPARTMENTS FOR EACH FUNCTION
    -- Using INSERT with existence check instead of ON CONFLICT
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: CREATING DEPARTMENTS ===';

    -- -----------------------------------------------------------------
    -- FUNCTION 1: Digital Health Strategy & Innovation
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'digital-health-strategy-innovation';
    
    IF v_func_id IS NOT NULL THEN
        -- Department: Digital Foresight & R&D
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-foresight-rd';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Foresight & R&D', 'digital-foresight-rd', 'Emerging technology research, innovation labs, and future health solutions', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        -- Department: Digital Product Strategy
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-product-strategy';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Product Strategy', 'digital-product-strategy', 'Product vision, roadmap planning, and digital portfolio management', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        -- Department: Partnership & Ecosystem Development
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'partnership-ecosystem-development';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Partnership & Ecosystem Development', 'partnership-ecosystem-development', 'Strategic partnerships, ecosystem building, and alliance management', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        -- Department: Digital Transformation Office
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-transformation-office';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Transformation Office', 'digital-transformation-office', 'Change management, digital adoption, and organizational transformation', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Digital Health Strategy & Innovation: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 2: Digital Platforms & Solutions
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'digital-platforms-solutions';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'virtual-care-telehealth';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Virtual Care & Telehealth', 'virtual-care-telehealth', 'Telemedicine platforms, virtual consultations, and remote care delivery', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'remote-patient-monitoring-rpm';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Remote Patient Monitoring (RPM)', 'remote-patient-monitoring-rpm', 'Continuous monitoring solutions, wearable integrations, and alert systems', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-therapeutics-dtx';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Therapeutics (DTx)', 'digital-therapeutics-dtx', 'Evidence-based therapeutic interventions delivered through software', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'engagement-behavior-change-platforms';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Engagement & Behavior Change Platforms', 'engagement-behavior-change-platforms', 'Patient engagement tools, gamification, and behavioral health solutions', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'mobile-health-mhealth-apps';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Mobile Health (mHealth) Apps', 'mobile-health-mhealth-apps', 'Consumer and clinical mobile applications for health management', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'connected-devices-wearables';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Connected Devices & Wearables', 'connected-devices-wearables', 'IoT health devices, wearable sensors, and device integration platforms', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Digital Platforms & Solutions: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 3: Data Science & Analytics
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'data-science-analytics';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-biomarkers-rwd';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Biomarkers & Real-World Data', 'digital-biomarkers-rwd', 'Digital biomarker development and real-world data collection', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'ai-ml-predictive-analytics';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'AI/ML & Predictive Analytics', 'ai-ml-predictive-analytics', 'Machine learning models, predictive algorithms, and AI-driven insights', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-evidence-generation';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Evidence Generation', 'digital-evidence-generation', 'Clinical evidence from digital endpoints and real-world studies', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'data-engineering-architecture';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Data Engineering & Architecture', 'data-engineering-architecture', 'Data pipelines, infrastructure, and health data architecture', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'health-outcomes-analytics';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Health Outcomes Analytics', 'health-outcomes-analytics', 'Outcomes measurement, population health analytics, and value assessment', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Data Science & Analytics: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 4: Digital Clinical Development
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'digital-clinical-development';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'decentralized-clinical-trials-dct';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Decentralized Clinical Trials (DCT)', 'decentralized-clinical-trials-dct', 'Remote and hybrid trial designs, virtual site operations', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'econsent-epro-ecoa';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'eConsent & ePRO/eCOA', 'econsent-epro-ecoa', 'Electronic consent, patient-reported outcomes, and clinical outcome assessments', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'site-patient-digital-enablement';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Site & Patient Digital Enablement', 'site-patient-digital-enablement', 'Digital tools for clinical sites and patient engagement in trials', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-protocol-design';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Protocol Design', 'digital-protocol-design', 'Digitally-enabled protocol development and adaptive trial designs', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Digital Clinical Development: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 5: Patient & Provider Experience
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'patient-provider-experience';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'ux-ui-design-research';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'UX/UI Design & Research', 'ux-ui-design-research', 'User experience research, interface design, and usability testing', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-patient-support-programs';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Patient Support Programs', 'digital-patient-support-programs', 'Patient assistance, adherence programs, and digital support services', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'omnichannel-engagement';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Omnichannel Engagement', 'omnichannel-engagement', 'Multi-channel patient and provider engagement strategies', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-medical-education';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Medical Education', 'digital-medical-education', 'E-learning, CME platforms, and digital training for healthcare providers', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-health-literacy';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Health Literacy', 'digital-health-literacy', 'Patient education, health literacy tools, and accessibility', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Patient & Provider Experience: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 6: Regulatory, Quality & Compliance
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'regulatory-quality-compliance';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-health-regulatory-affairs';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Health Regulatory Affairs', 'digital-health-regulatory-affairs', 'FDA/CE submissions, SaMD regulations, and regulatory strategy', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'medical-device-software-qa-qms';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Medical Device/Software QA & QMS', 'medical-device-software-qa-qms', 'Quality management systems, IEC 62304, and software validation', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'data-privacy-digital-ethics';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Data Privacy & Digital Ethics', 'data-privacy-digital-ethics', 'HIPAA, GDPR, data governance, and ethical AI practices', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'cybersecurity-for-health';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Cybersecurity for Health', 'cybersecurity-for-health', 'Healthcare cybersecurity, threat management, and security compliance', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-risk-management';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Risk Management', 'digital-risk-management', 'Risk assessment, mitigation strategies, and compliance monitoring', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Regulatory, Quality & Compliance: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 7: Commercialization & Market Access
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'commercialization-market-access';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-go-to-market-strategy';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Go-to-Market Strategy', 'digital-go-to-market-strategy', 'Launch planning, market positioning, and commercialization strategy', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-health-business-development';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Health Business Development', 'digital-health-business-development', 'Partnership development, licensing, and strategic alliances', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'payer-reimbursement-strategy';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Payer & Reimbursement Strategy', 'payer-reimbursement-strategy', 'Coverage strategies, reimbursement pathways, and payer engagement', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'real-world-value-demonstration';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Real-World Value Demonstration', 'real-world-value-demonstration', 'Value evidence generation, outcomes studies, and ROI analysis', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-adoption-implementation';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Adoption & Implementation', 'digital-adoption-implementation', 'Customer implementation, change management, and adoption support', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Commercialization & Market Access: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 8: Technology & IT Infrastructure
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'technology-it-infrastructure';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'cloud-platforms-saas-ops';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Cloud Platforms & SaaS Ops', 'cloud-platforms-saas-ops', 'Cloud infrastructure, SaaS operations, and platform management', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'interoperability-api-management';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Interoperability & API Management', 'interoperability-api-management', 'Healthcare interoperability, API design, and integration services', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'devops-agile-delivery';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'DevOps & Agile Delivery', 'devops-agile-delivery', 'CI/CD pipelines, agile practices, and release management', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'data-integration-exchange-fhir-hl7';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Data Integration & Exchange (FHIR, HL7)', 'data-integration-exchange-fhir-hl7', 'FHIR/HL7 standards, data exchange, and EHR integrations', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'support-digital-workplace-services';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Support & Digital Workplace Services', 'support-digital-workplace-services', 'IT support, helpdesk, and digital workplace tools', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Technology & IT Infrastructure: departments processed';
    END IF;

    -- -----------------------------------------------------------------
    -- FUNCTION 9: Legal & IP for Digital
    -- -----------------------------------------------------------------
    SELECT id INTO v_func_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND slug = 'legal-ip-digital';
    
    IF v_func_id IS NOT NULL THEN
        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-health-law';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Health Law', 'digital-health-law', 'Healthcare regulations, telemedicine law, and digital health legal advisory', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'software-licensing-ip';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Software Licensing & IP', 'software-licensing-ip', 'Software IP protection, licensing agreements, and patent strategy', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'digital-contracts-data-use-agreements';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Digital Contracts & Data Use Agreements', 'digital-contracts-data-use-agreements', 'Contract management, DUAs, BAAs, and vendor agreements', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        SELECT id INTO v_existing_dept_id FROM org_departments WHERE tenant_id = v_tenant_id AND slug = 'regulatory-watch-digital-policy';
        IF v_existing_dept_id IS NULL THEN
            INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
            VALUES (v_tenant_id, v_func_id, 'Regulatory Watch & Digital Policy', 'regulatory-watch-digital-policy', 'Policy monitoring, regulatory intelligence, and advocacy', NOW(), NOW());
            v_dept_count := v_dept_count + 1;
        END IF;

        RAISE NOTICE '✅ Legal & IP for Digital: departments processed';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Total new departments created: %', v_dept_count;

    -- =====================================================================
    -- STEP 3: CREATE ROLES FOR ALL DEPARTMENTS
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: CREATING ROLES ===';

    -- Create 4 standard roles per department (Entry, Mid, Senior, Director)
    FOR v_dept_id IN 
        SELECT d.id FROM org_departments d
        JOIN org_functions f ON d.function_id = f.id
        WHERE f.industry = 'Digital Health' AND d.tenant_id = v_tenant_id
    LOOP
        DECLARE
            v_dept_name TEXT;
            v_dept_slug TEXT;
            v_role_slug TEXT;
        BEGIN
            SELECT name, slug, function_id INTO v_dept_name, v_dept_slug, v_func_id 
            FROM org_departments WHERE id = v_dept_id;

            -- Entry-level role: Associate
            v_role_slug := v_dept_slug || '-associate';
            SELECT id INTO v_existing_role_id FROM org_roles WHERE tenant_id = v_tenant_id AND slug = v_role_slug;
            IF v_existing_role_id IS NULL THEN
                INSERT INTO org_roles (tenant_id, function_id, department_id, name, slug, description, seniority_level, geographic_scope, created_at, updated_at)
                VALUES (v_tenant_id, v_func_id, v_dept_id, 
                        v_dept_name || ' Associate', 
                        v_role_slug,
                        'Entry-level role supporting ' || v_dept_name || ' initiatives',
                        'entry'::seniority_level_type, 'regional'::geographic_scope_type, NOW(), NOW());
                v_role_count := v_role_count + 1;
            END IF;

            -- Mid-level role: Specialist
            v_role_slug := v_dept_slug || '-specialist';
            SELECT id INTO v_existing_role_id FROM org_roles WHERE tenant_id = v_tenant_id AND slug = v_role_slug;
            IF v_existing_role_id IS NULL THEN
                INSERT INTO org_roles (tenant_id, function_id, department_id, name, slug, description, seniority_level, geographic_scope, created_at, updated_at)
                VALUES (v_tenant_id, v_func_id, v_dept_id, 
                        v_dept_name || ' Specialist', 
                        v_role_slug,
                        'Mid-level specialist in ' || v_dept_name,
                        'mid'::seniority_level_type, 'regional'::geographic_scope_type, NOW(), NOW());
                v_role_count := v_role_count + 1;
            END IF;

            -- Senior role: Lead
            v_role_slug := v_dept_slug || '-lead';
            SELECT id INTO v_existing_role_id FROM org_roles WHERE tenant_id = v_tenant_id AND slug = v_role_slug;
            IF v_existing_role_id IS NULL THEN
                INSERT INTO org_roles (tenant_id, function_id, department_id, name, slug, description, seniority_level, geographic_scope, created_at, updated_at)
                VALUES (v_tenant_id, v_func_id, v_dept_id, 
                        v_dept_name || ' Lead', 
                        v_role_slug,
                        'Senior lead for ' || v_dept_name || ' team',
                        'senior'::seniority_level_type, 'regional'::geographic_scope_type, NOW(), NOW());
                v_role_count := v_role_count + 1;
            END IF;

            -- Director role
            v_role_slug := v_dept_slug || '-director';
            SELECT id INTO v_existing_role_id FROM org_roles WHERE tenant_id = v_tenant_id AND slug = v_role_slug;
            IF v_existing_role_id IS NULL THEN
                INSERT INTO org_roles (tenant_id, function_id, department_id, name, slug, description, seniority_level, geographic_scope, created_at, updated_at)
                VALUES (v_tenant_id, v_func_id, v_dept_id, 
                        'Director of ' || v_dept_name, 
                        v_role_slug,
                        'Director leading ' || v_dept_name || ' department',
                        'director'::seniority_level_type, 'global'::geographic_scope_type, NOW(), NOW());
                v_role_count := v_role_count + 1;
            END IF;

        END;
    END LOOP;

    RAISE NOTICE 'Total new roles created: %', v_role_count;

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
    RAISE NOTICE 'Industry mappings: %', v_mapping_count;
    RAISE NOTICE 'New departments created: %', v_dept_count;
    RAISE NOTICE 'New roles created: %', v_role_count;

END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Count departments by function
SELECT 
    f.name as function_name,
    COUNT(d.id) as department_count
FROM org_functions f
LEFT JOIN org_departments d ON f.id = d.function_id AND d.tenant_id = f.tenant_id
WHERE f.industry = 'Digital Health'
  AND f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.name
ORDER BY f.name;

-- Count roles by function
SELECT 
    f.name as function_name,
    COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_roles r ON f.id = r.function_id AND r.tenant_id = f.tenant_id
WHERE f.industry = 'Digital Health'
  AND f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.name
ORDER BY f.name;

-- Total summary
SELECT 
    'Digital Health Summary' as report,
    (SELECT COUNT(*) FROM org_functions WHERE industry = 'Digital Health' AND tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244') as total_functions,
    (SELECT COUNT(*) FROM org_departments d JOIN org_functions f ON d.function_id = f.id WHERE f.industry = 'Digital Health' AND d.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244') as total_departments,
    (SELECT COUNT(*) FROM org_roles r JOIN org_functions f ON r.function_id = f.id WHERE f.industry = 'Digital Health' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244') as total_roles;
