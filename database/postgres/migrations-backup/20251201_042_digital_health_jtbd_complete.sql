-- ============================================================================
-- MIGRATION 042: DIGITAL HEALTH INDUSTRY JOBS-TO-BE-DONE (JTBD) SEED
-- Version: 1.0.2 | Date: 2025-12-01
-- Purpose: Seed JTBDs for Digital Health industry
-- Total: 46 JTBDs across Digital Health functions
-- Note: Using standard functional_area enum values
-- ============================================================================

BEGIN;

-- Set tenant context for Digital Health
DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE name ILIKE '%digital health%' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE tenant_key = 'vital-system' LIMIT 1;
    END IF;
    IF v_tenant_id IS NOT NULL THEN
        PERFORM set_config('app.dh_tenant_id', v_tenant_id::text, false);
        RAISE NOTICE 'Using tenant: %', v_tenant_id;
    ELSE
        RAISE EXCEPTION 'No suitable tenant found';
    END IF;
END $$;

-- ============================================================================
-- DIGITAL PLATFORMS & SOLUTIONS JTBDs (mapped to R&D)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DPS-001', 'Digital Therapeutics Product Development', current_setting('app.dh_tenant_id')::uuid, 'When developing pharmaceutical-grade digital therapeutics, I need clinical validation frameworks and regulatory guidance, so I can ensure approval and adoption', 'Medical Affairs', 'strategic', 'very_high', 'weekly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DPS-002', 'Healthcare Platform Interoperability', current_setting('app.dh_tenant_id')::uuid, 'When integrating digital health solutions with existing healthcare IT systems, I need FHIR-compliant APIs and interoperability standards, so I can ensure seamless data exchange', 'Medical Affairs', 'operational', 'high', 'weekly', 'active', 'mixed', 'operational', 'high', 'high', 'high', 'L1_expert', 9.0, 4.0, 14.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DPS-003', 'Patient-Centered UX Design', current_setting('app.dh_tenant_id')::uuid, 'When designing patient-centric digital experiences, I need behavioral science frameworks and testing protocols, so I can drive sustained engagement', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'project', 'operational', 'high', 'high', 'medium', 'L1_expert', 8.5, 3.5, 13.5, 0.82)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DPS-004', 'Scalable Platform Architecture', current_setting('app.dh_tenant_id')::uuid, 'When scaling platform for growth, I need architecture patterns and performance optimization, so I can handle 10x users without degradation', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'high', 'high', 'high', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DPS-005', 'Mobile Health Application Development', current_setting('app.dh_tenant_id')::uuid, 'When developing mobile health applications, I need cross-platform frameworks and device integration capabilities, so I can reach patients on any device', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'project', 'operational', 'high', 'high', 'medium', 'L1_expert', 8.5, 4.0, 13.0, 0.80)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DPS-006', 'Healthcare API Ecosystem Management', current_setting('app.dh_tenant_id')::uuid, 'When building healthcare API ecosystem, I need interoperability standards and developer tools, so I can accelerate digital health innovation', 'Medical Affairs', 'strategic', 'high', 'weekly', 'active', 'mixed', 'strategic', 'high', 'high', 'high', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- COMMERCIALIZATION & MARKET ACCESS JTBDs (mapped to Commercial)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CMA-001', 'Digital Therapeutics Coverage Strategy', current_setting('app.dh_tenant_id')::uuid, 'When securing coverage for digital companions, I need value demonstration frameworks and payer engagement tools, so I can achieve broad access', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'critical', 'critical', 'high', 'L1_expert', 9.5, 2.0, 17.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CMA-002', 'Value-Based Contract Negotiation', current_setting('app.dh_tenant_id')::uuid, 'When negotiating value-based contracts for digital health, I need outcome prediction models and risk assessment tools, so I can structure win-win agreements', 'Medical Affairs', 'strategic', 'very_high', 'quarterly', 'active', 'project', 'strategic', 'high', 'high', 'high', 'L1_expert', 9.0, 2.5, 15.5, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CMA-003', 'Digital Health Pricing Optimization', current_setting('app.dh_tenant_id')::uuid, 'When developing pricing strategies for DTx, I need market analysis and willingness-to-pay research, so I can optimize revenue while ensuring access', 'Medical Affairs', 'strategic', 'very_high', 'quarterly', 'active', 'mixed', 'strategic', 'critical', 'critical', 'high', 'L1_expert', 9.5, 2.0, 17.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CMA-004', 'Digital Health Go-to-Market Strategy', current_setting('app.dh_tenant_id')::uuid, 'When commercializing drug-digital combinations, I need integrated go-to-market strategies and success metrics, so I can maximize value capture', 'Medical Affairs', 'strategic', 'very_high', 'quarterly', 'active', 'project', 'strategic', 'critical', 'critical', 'medium', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CMA-005', 'Sales Force Digital Enablement', current_setting('app.dh_tenant_id')::uuid, 'When training sales force on digital therapeutics, I need clear value propositions and objection handling, so I can drive adoption', 'Medical Affairs', 'operational', 'high', 'monthly', 'active', 'mixed', 'operational', 'high', 'high', 'medium', 'L1_expert', 8.5, 3.0, 14.0, 0.82)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CMA-006', 'Digital Health Market Intelligence', current_setting('app.dh_tenant_id')::uuid, 'When analyzing digital health market trends, I need comprehensive data sources and competitive tracking, so I can identify opportunities', 'Medical Affairs', 'operational', 'medium', 'weekly', 'active', 'bau', 'operational', 'high', 'medium', 'low', 'L1_expert', 8.0, 4.0, 12.0, 0.80)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- PATIENT & PROVIDER EXPERIENCE JTBDs (mapped to Medical Affairs)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-PPE-001', 'Omnichannel Patient Journey Design', current_setting('app.dh_tenant_id')::uuid, 'When designing comprehensive patient support ecosystems, I need integrated digital and human touchpoints, so I can improve adherence and outcomes', 'Medical Affairs', 'strategic', 'very_high', 'quarterly', 'active', 'project', 'strategic', 'critical', 'high', 'medium', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-PPE-002', 'Patient Personalization at Scale', current_setting('app.dh_tenant_id')::uuid, 'When personalizing patient journeys, I need predictive analytics and behavioral insights, so I can deliver right intervention at right time', 'Medical Affairs', 'strategic', 'high', 'weekly', 'active', 'mixed', 'strategic', 'high', 'high', 'medium', 'L1_expert', 9.0, 2.5, 15.5, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-PPE-003', 'Provider Digital Workflow Integration', current_setting('app.dh_tenant_id')::uuid, 'When integrating digital tools into clinical workflow, I need seamless EMR integration and evidence summaries, so I can use them efficiently', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'mixed', 'operational', 'high', 'high', 'high', 'L1_expert', 9.0, 2.0, 16.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-PPE-004', 'Digital Health Literacy Enhancement', current_setting('app.dh_tenant_id')::uuid, 'When creating inclusive health experiences, I need diverse patient input and cultural adaptation tools, so I can ensure equity', 'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 'project', 'operational', 'high', 'high', 'medium', 'L1_expert', 8.5, 2.5, 14.5, 0.82)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-PPE-005', 'Telehealth Experience Optimization', current_setting('app.dh_tenant_id')::uuid, 'When scaling virtual care platform, I need interoperability standards and workflow optimization tools, so I can serve enterprise health systems', 'Medical Affairs', 'operational', 'high', 'weekly', 'active', 'mixed', 'operational', 'high', 'high', 'medium', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- TECHNOLOGY & IT INFRASTRUCTURE JTBDs (mapped to R&D)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-TIT-001', 'HIPAA-Compliant Cloud Infrastructure', current_setting('app.dh_tenant_id')::uuid, 'When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits', 'Medical Affairs', 'operational', 'very_high', 'weekly', 'active', 'mixed', 'operational', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 4.0, 15.0, 0.90)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-TIT-002', 'Healthcare Data Security Management', current_setting('app.dh_tenant_id')::uuid, 'When protecting patient data in digital health, I need zero-trust architectures and privacy controls, so I can prevent breaches', 'Medical Affairs', 'operational', 'very_high', 'daily', 'active', 'bau', 'operational', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 4.0, 15.0, 0.90)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-TIT-003', 'Healthcare System Reliability Engineering', current_setting('app.dh_tenant_id')::uuid, 'When supporting digital health initiatives, I need scalable cloud infrastructure and security frameworks, so I can ensure reliability and compliance', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'bau', 'operational', 'critical', 'high', 'high', 'L1_expert', 9.0, 4.0, 14.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-TIT-004', 'Healthcare DevSecOps Implementation', current_setting('app.dh_tenant_id')::uuid, 'When implementing CI/CD for healthcare applications, I need security-integrated pipelines and compliance automation, so I can deploy safely and quickly', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'mixed', 'operational', 'high', 'high', 'high', 'L1_expert', 8.5, 3.5, 13.5, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- DIGITAL CLINICAL DEVELOPMENT JTBDs (mapped to Clinical Development)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DCD-001', 'Decentralized Clinical Trial Operations', current_setting('app.dh_tenant_id')::uuid, 'When running decentralized clinical trials, I need integrated technology platforms and remote monitoring capabilities, so I can ensure quality and efficiency', 'Medical Affairs', 'strategic', 'very_high', 'weekly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DCD-002', 'Digital Biomarker Validation', current_setting('app.dh_tenant_id')::uuid, 'When validating novel digital biomarkers, I need clinical correlation methods and regulatory acceptance criteria, so I can achieve industry adoption', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 2.0, 17.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DCD-003', 'Electronic Patient-Reported Outcomes Implementation', current_setting('app.dh_tenant_id')::uuid, 'When implementing digital patient-reported outcomes, I need validated instruments and collection platforms, so I can capture meaningful data', 'Medical Affairs', 'operational', 'high', 'weekly', 'active', 'project', 'operational', 'high', 'high', 'high', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DCD-004', 'Digital Clinical Data Integration', current_setting('app.dh_tenant_id')::uuid, 'When integrating digital health data into clinical trials, I need standardization protocols and quality frameworks, so I can ensure data integrity', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'mixed', 'operational', 'high', 'high', 'critical', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- DIGITAL HEALTH STRATEGY & INNOVATION JTBDs (mapped to Corporate Strategy)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSI-001', 'Digital Health Transformation Strategy', current_setting('app.dh_tenant_id')::uuid, 'When building pharma digital health portfolio, I need innovation frameworks and partnership models, so I can accelerate transformation', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'critical', 'critical', 'medium', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSI-002', 'Emerging Healthcare Technology Evaluation', current_setting('app.dh_tenant_id')::uuid, 'When evaluating emerging technologies, I need assessment frameworks and pilot programs, so I can identify strategic opportunities', 'Medical Affairs', 'strategic', 'high', 'monthly', 'active', 'project', 'strategic', 'high', 'high', 'medium', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSI-003', 'Digital Health Partnership Development', current_setting('app.dh_tenant_id')::uuid, 'When evaluating digital health partnerships, I need assessment frameworks and value models, so I can identify strategic fits', 'Medical Affairs', 'strategic', 'high', 'weekly', 'active', 'mixed', 'strategic', 'high', 'high', 'medium', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSI-004', 'Digital Innovation Portfolio Management', current_setting('app.dh_tenant_id')::uuid, 'When managing digital health alliances, I need governance models and performance tracking, so I can ensure mutual success', 'Medical Affairs', 'strategic', 'high', 'weekly', 'active', 'mixed', 'strategic', 'high', 'high', 'low', 'L1_expert', 8.5, 3.5, 13.5, 0.82)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- LEGAL & IP JTBDs (mapped to Legal)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-LIP-001', 'Digital Health IP Strategy & Protection', current_setting('app.dh_tenant_id')::uuid, 'When protecting digital health innovations, I need IP strategy frameworks and patent filing processes, so I can secure competitive advantage', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'high', 'high', 'high', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-LIP-002', 'Digital Health Contract Management', current_setting('app.dh_tenant_id')::uuid, 'When negotiating digital health partnerships, I need template agreements and liability frameworks, so I can protect company interests', 'Medical Affairs', 'operational', 'high', 'weekly', 'active', 'mixed', 'operational', 'high', 'high', 'high', 'L1_expert', 8.5, 3.0, 14.0, 0.82)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-LIP-003', 'Healthcare Data Privacy Compliance', current_setting('app.dh_tenant_id')::uuid, 'When reviewing digital health initiatives for compliance, I need regulatory mapping and risk assessment frameworks, so I can ensure legal protection', 'Medical Affairs', 'operational', 'very_high', 'daily', 'active', 'bau', 'operational', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.90)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-LIP-004', 'Healthcare AI Legal Framework Development', current_setting('app.dh_tenant_id')::uuid, 'When deploying AI in healthcare, I need liability frameworks and algorithmic accountability guidelines, so I can manage legal risk', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'high', 'critical', 'critical', 'L1_expert', 9.0, 2.0, 16.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- DATA SCIENCE & ANALYTICS JTBDs (mapped to R&D)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSA-001', 'Healthcare ML Model Development & Validation', current_setting('app.dh_tenant_id')::uuid, 'When developing healthcare ML models, I need validation frameworks and explainability tools, so I can ensure clinical reliability', 'Medical Affairs', 'strategic', 'very_high', 'weekly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSA-002', 'Privacy-Preserving Healthcare Analytics', current_setting('app.dh_tenant_id')::uuid, 'When generating insights from digital health data, I need privacy-preserving analytics and federated learning approaches, so I can maintain compliance while deriving value', 'Medical Affairs', 'strategic', 'very_high', 'weekly', 'active', 'mixed', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSA-003', 'Predictive Patient Outcome Analytics', current_setting('app.dh_tenant_id')::uuid, 'When predicting patient outcomes from digital biomarkers, I need validated algorithms and clinical correlation, so I can inform treatment decisions', 'Medical Affairs', 'strategic', 'high', 'weekly', 'active', 'mixed', 'strategic', 'high', 'high', 'high', 'L1_expert', 9.0, 2.5, 15.5, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-DSA-004', 'Real-Time Health Data Processing', current_setting('app.dh_tenant_id')::uuid, 'When managing continuous digital endpoint data, I need streaming pipelines and automated validation, so I can handle high volumes efficiently', 'Medical Affairs', 'operational', 'high', 'daily', 'active', 'bau', 'operational', 'high', 'high', 'high', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- REGULATORY, QUALITY & COMPLIANCE JTBDs (mapped to Regulatory)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-RQC-001', 'Software as Medical Device Regulatory Strategy', current_setting('app.dh_tenant_id')::uuid, 'When navigating combo product regulations (drug+digital), I need clear pathways and precedents, so I can ensure timely approval', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 2.0, 17.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-RQC-002', 'Digital Health Quality Management System', current_setting('app.dh_tenant_id')::uuid, 'When building QMS for digital health startup, I need scalable frameworks and automation tools, so I can maintain compliance efficiently', 'Medical Affairs', 'operational', 'very_high', 'daily', 'active', 'mixed', 'operational', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.90)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-RQC-003', 'Digital Health Post-Market Surveillance', current_setting('app.dh_tenant_id')::uuid, 'When managing post-market surveillance for apps, I need automated monitoring and reporting systems, so I can maintain compliance efficiently', 'Medical Affairs', 'operational', 'high', 'weekly', 'active', 'bau', 'operational', 'critical', 'high', 'critical', 'L1_expert', 9.0, 3.0, 15.0, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-RQC-004', 'Global Digital Health Regulatory Harmonization', current_setting('app.dh_tenant_id')::uuid, 'When preparing digital health regulatory submissions, I need comprehensive documentation templates and guidance, so I can meet all requirements globally', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'high', 'high', 'critical', 'L1_expert', 9.0, 2.5, 15.5, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- CLINICAL VALIDATION & RWE JTBDs (mapped to Medical Affairs)
-- ============================================================================

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CVR-001', 'Real-World Evidence from Digital Health Data', current_setting('app.dh_tenant_id')::uuid, 'When generating RWE from digital health data, I need quality assessment frameworks and analytical pipelines, so I can produce regulatory-grade evidence', 'Medical Affairs', 'strategic', 'very_high', 'weekly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CVR-002', 'Digital Biomarker Clinical Correlation', current_setting('app.dh_tenant_id')::uuid, 'When linking digital biomarkers to clinical outcomes, I need validation methodologies and statistical models, so I can establish causal relationships', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'high', 'high', 'critical', 'L1_expert', 9.0, 2.5, 15.5, 0.85)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CVR-003', 'Digital Therapeutics Efficacy Validation', current_setting('app.dh_tenant_id')::uuid, 'When validating digital therapeutics efficacy, I need lean clinical trial designs and efficient recruitment, so I can generate evidence within budget', 'Medical Affairs', 'strategic', 'very_high', 'monthly', 'active', 'project', 'strategic', 'critical', 'critical', 'critical', 'L1_expert', 9.5, 3.0, 16.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO jtbd (code, name, tenant_id, description, functional_area, job_category, complexity, frequency, status, work_pattern, jtbd_type, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer, importance_score, satisfaction_score, opportunity_score, validation_score)
VALUES ('JTBD-CVR-004', 'Digital Health Economics Evidence Generation', current_setting('app.dh_tenant_id')::uuid, 'When developing cost-effectiveness models for DTx, I need economic modeling frameworks and outcomes data, so I can demonstrate value to payers', 'Medical Affairs', 'strategic', 'very_high', 'quarterly', 'active', 'project', 'strategic', 'critical', 'critical', 'high', 'L1_expert', 9.5, 2.0, 17.0, 0.88)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT functional_area, COUNT(*) as jtbd_count, ROUND(AVG(importance_score::numeric), 2) as avg_importance
FROM jtbd WHERE code LIKE 'JTBD-D%' OR code LIKE 'JTBD-C%' OR code LIKE 'JTBD-P%' OR code LIKE 'JTBD-T%' OR code LIKE 'JTBD-L%' OR code LIKE 'JTBD-R%'
GROUP BY functional_area ORDER BY jtbd_count DESC;

SELECT COUNT(*) as total_jtbds, COUNT(DISTINCT functional_area) as functions_covered FROM jtbd
WHERE code LIKE 'JTBD-D%' OR code LIKE 'JTBD-C%' OR code LIKE 'JTBD-P%' OR code LIKE 'JTBD-T%' OR code LIKE 'JTBD-L%' OR code LIKE 'JTBD-R%';
