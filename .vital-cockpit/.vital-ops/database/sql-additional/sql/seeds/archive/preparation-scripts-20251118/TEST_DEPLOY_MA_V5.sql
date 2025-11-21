-- DRY RUN TEST - Will rollback at the end


-- =====================================================
-- Medical Affairs Personas v5.0 Extension Deployment
-- =====================================================
-- Generated: 2025-11-17T12:04:06.209182
-- Source: /Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json
-- Personas: 31
-- Tenant: f7aa6fd4-0af9-4706-8b31-034f1f7accda
-- =====================================================

BEGIN;

-- Set tenant context
SET app.current_tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';


-- ==================== Dr. Sarah Chen ====================

-- Get persona_id for Dr. Sarah Chen
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-sarah-chen-cmo' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-sarah-chen-cmo' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Sarah Chen' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-sarah-chen-cmo (name: Dr. Sarah Chen)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-sarah-chen-cmo', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('91870773-6b89-4d9a-bfe3-8a6f4aa4ba69', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('df9db872-218a-4f5f-a920-a08d5ca86fef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('33e755bc-8ed2-4e90-9c44-6ea6de59a7b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('331b3d65-b643-4f16-88e3-1cef56514708', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('8c88d9b5-172b-4a62-9a71-efea7bb44dbf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('cd6f9105-cb32-412e-8d06-674c84cc8f6c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('6660d048-e3bd-4ef0-a522-40b2afb528ed', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('384b8da4-9e61-4458-a108-a93684477df2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('bcbddca8-daa0-437f-9947-615230470491', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('0761cc36-0888-4506-8678-2956aa0cbd07', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('419a5fc8-e50f-42cd-81c3-4e3f5cbdca92', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('84e9bd4e-fca4-4e7c-82f8-10a1dfecdad1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('90159ee2-32bc-43ff-bcba-bf7c7b3b304f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('cfcf83b6-d0f7-4777-bae4-1a72f16c4157', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('073c9e64-5bd9-4831-9886-f32a5b84b15a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('5f357a3e-17c1-4dbc-8550-489dcf82fcd0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('4831db9b-b8cf-4959-ac3d-72a86d4cc312', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('39dd56df-b2a4-4347-af29-72d7a8723c09', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7d4f1eff-8d01-47fc-8793-7249d776dd99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('d0cb91ac-ee71-4219-b3bd-bf27a1dd84af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('02f20398-d6f1-45de-8acd-8669568ac12c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('3765856e-5a1a-4509-a7fd-1d4eeff4f3ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('9e4307db-a9ea-42b3-8d11-97eed9c0d40f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('431aa021-8a15-4bc0-b302-8b901e3e7a78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('50b41be9-6267-4fba-aba1-cb19320d5c6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('5d205092-ace7-44c6-b585-baf51b496ec8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('15fd5949-0680-4916-8448-7dde9ef46eb7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('4f5ddef9-cbab-485d-893d-ec3904852dbe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('be8af197-e485-4af9-a218-48ced6c48238', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fdb3e51a-aabc-45fc-8f29-adb7987c926e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f1a23182-4c19-4635-b821-206999227991', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('79ffd958-0775-4be0-bffb-d36c57a2d3fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c387766a-8e27-4d06-9529-3ea6e270aca3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('f6c5212e-9bfe-404c-a602-73bc8e63c68b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('ad089eff-91cb-4c3b-aac0-67ac35816386', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('838241e9-e159-40ea-b326-32949b733e20', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d20e121c-13e4-4713-8b03-6256592ce91d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f4718572-3982-4817-a99d-5e7bfc7a0415', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a60dddf6-45b5-4670-8e0d-c4be574a7b14', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('faec7a06-64b5-455e-a33b-f6197b3cd507', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b39a7460-e274-45c3-8eaf-f60010dbbecf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a26453ae-6010-40e1-b1eb-524efdac8353', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('cda4d2c4-6530-4071-863d-176c93e91d32', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('c94533c8-b47c-4498-9b42-96571174dd8b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('a251efbe-71eb-48f6-a3b7-91329cfea967', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('939adedb-ac5c-4e13-93b6-95be5006e5e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('a6fc0c01-1a20-4a4a-8ae4-b923b1c32abf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('e26e6a23-61c8-474f-bd8b-1cd2c8c4ac34', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('c13d5b6e-9e6d-416a-83ca-f6b2ba6a2d20', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9331f0f2-a385-4bdc-a209-6320fd15bf3d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0786316b-b2d5-4aa1-85ba-89265e81daf0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('f8792a79-9835-4df8-a84d-d5964b36a2b4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('ea62a864-ecf2-4100-a922-4112e7de61c3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Michael Torres ====================

-- Get persona_id for Dr. Michael Torres
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-michael-torres-vp-ma' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-michael-torres-vp-ma' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Michael Torres' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-michael-torres-vp-ma (name: Dr. Michael Torres)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-michael-torres-vp-ma', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('410ea2ca-e5b8-446f-8431-f9477a78575c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('66ef3886-ca8d-4150-9a00-b5460800f43f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('089aa270-07b2-4c82-9347-bfd4c94fb9d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('16538a6a-da26-4313-9274-56a1892fedf7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('01767b5e-3522-46c8-b7d2-276c0d0085a8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('a70ef6bc-dd2d-499e-a713-41e260510c6b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('21370856-fe20-4611-af63-7ea294b07eb7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('9350a5a3-3bcc-427a-9c35-aae7d8558249', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('8666c516-da00-4654-b05b-ce5179c3fe95', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('47dbf7d6-3476-4cb1-b969-3475be00e354', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('91ded765-5c7e-49cd-9f52-d26338e865ab', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ec520df9-adda-43ec-8793-54faccb2cdc8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('3b1cdff4-b705-43b8-a29c-a4b7866d3c85', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('61ec090e-0c96-42ae-baf4-abbd0413c72b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('4ddbe623-a6f5-492f-97e1-fbe5669d14b1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('65ca79a3-f8a6-47af-bf5a-9abe94e36c3f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('52930a9e-9a28-477a-a93f-043a3e504d9a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('88620b22-42fb-4aed-8a0c-8b809abfd801', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('64dfadc5-b9c3-4488-b438-9d7306785876', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0250f589-ea93-4d63-9727-13fd348a4f5d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('bafa5a6f-beaa-49f3-b7f8-4225c7c02cb2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('30953441-edae-4d40-8cdf-1dfa7959155f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('b70b75be-28ac-474d-9d36-948566e50a03', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('d440dff8-9bf8-47e8-a4e8-8b0e8cbea5f7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('976cde1e-4764-4f0e-8fc0-9d147682e97c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('746d4665-63b1-466c-a69b-9398a211a676', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('80971057-46bc-4528-9760-a78ae56703e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('fc8190a1-333d-4f2e-b83c-4f1bb70d6a23', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9ab2db97-2a69-4ceb-a584-ec85e7a1bd1b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('23440b79-7739-457d-8cfb-c2ef250cafa1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d160292d-5e67-4ef0-be26-c0f0fa4fd5fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('5fb26cac-9f99-45ba-98f1-0df822c03f92', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('26dec492-b729-4bfa-9be6-d713ca63bc5a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('76b37a97-bb51-4370-b92b-e10f0f1c00d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('078991c1-edec-441a-b26f-3281f875cf6f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('b5ae48b0-f56d-45f7-a83e-45f1b52376c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('cc9aeed9-0148-41e6-8b89-cfe089b084be', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('233c01e1-674a-4b8b-ba4b-94aa9c90aa98', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('ba6aab27-0ba7-4a47-96e0-19ba7208a532', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('57040b51-931a-4862-b78d-c29e64cd14da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('134401a8-bc19-486f-a4b4-255757261a6e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('e68e38b5-d5d5-488b-87ca-9a07e32381f5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('e66b9222-2e40-4b7a-8c63-d3d165d7d9de', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('cb3f1487-4bb1-418a-8826-ca05ecfe9d2b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('5e23c3fa-215b-4c0a-93e5-07dae4870060', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('5077035d-bd99-4523-9ee2-e94253e2c06b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('30dabc60-d6ac-4cac-bd3c-f9679bafc12d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('d29936bd-0d0d-4477-b2bb-af1acf13d258', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f653314f-ad5d-42eb-aa5f-811834003929', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8f33bc61-f398-462c-859b-54cddebb5747', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('3d10af64-99bf-42aa-a025-92267c191011', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('542736b9-a359-4054-9b2b-1f2e60e472df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('331cff4e-8575-4181-a7e2-4b2fdac542c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Elena Rodriguez ====================

-- Get persona_id for Dr. Elena Rodriguez
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-elena-rodriguez-md' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-elena-rodriguez-md' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Elena Rodriguez' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-elena-rodriguez-md (name: Dr. Elena Rodriguez)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-elena-rodriguez-md', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('dd01e284-92e9-40a8-a7c1-39ef0cbd7d2f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ed3d45c3-463c-41e9-9ea3-9c3888e9b627', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('59ac2a9e-6b33-41ad-91af-bbffc1b4b6c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('e08ad11b-f1fa-44d5-8674-6c6ce7b0a8a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('3fc3f0e5-fc2d-401c-814f-47777bd56ac7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('1aed6533-d5aa-45df-95a3-78a40da33ac8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c8623b5a-444d-4908-af75-9f8219c9a4df', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('fd97e9b6-c4d4-4293-af76-88058e36ba04', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('96075217-291c-40fa-92ea-92deb6d30c80', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('c4db8f02-11f9-4a4f-8fd0-3c73170d3153', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('fc594679-bdd6-4d63-9fe1-9115195d12f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('ce6c72f4-eeaf-40e9-ab37-438c24815b52', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('a24755be-00d9-4580-a23a-656bb7fddf09', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b48abdf7-a582-49a4-839e-d7d66e9d1c2d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('c1bf6a7b-ab39-4ab0-87a5-415a4c28d197', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('6856c474-6fd3-48a5-9e68-015e5ca117ab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('d18625c6-a384-4440-a68e-a9e541f37606', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('ade26136-b497-451c-95a0-68f922173cc3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('9a323424-822d-4101-a1da-b46a6701d5d3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('49cc416c-4a65-4614-bbe4-b724c231db84', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('4eb45a30-eae6-449e-9587-a57a43e798c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('1fbe19a9-f51a-44bb-9572-8ee67ae11c4e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('46a582a3-8947-47f2-8d82-09d1084f9ad7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('be92aaed-b3d9-467b-b0b1-74acbad50596', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3b5e8c6a-06d7-4e57-b8e3-954212905296', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b269466e-8544-424a-821a-20a675ce764c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f64830ad-f119-461c-9292-4ec792fd4c23', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c9637cc1-4b44-4f5a-b023-2193c647cf77', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('e83869f4-3c9c-42ff-a6b0-f682013ead76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('e46b61f7-bcb8-47db-b89e-7ebb9a8002df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('23aff7f8-60cb-4760-a40b-bc4fcdc5b081', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('77473c47-8b80-4734-81b1-13e8ab6e5d9d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('645f3e72-4407-4dd1-badd-01310f0a463a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('615c3fb7-b9dc-4685-9938-9b8d569f3ac2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('aedec625-35ed-4041-ac32-04520a4fb8de', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('bfa714d8-fdb0-4652-93d0-3ad61821318b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('bfb398e0-5422-4e50-af8f-72dbc3f80006', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('3906d5dc-599f-42c9-a03c-7e43c852cc09', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('949be067-4303-41e6-ad0c-37e7ab9cbd3b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('ab76aa3d-9eae-4f90-bc11-ef829491a7e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('94eab51e-f1f3-42be-b191-fe24dea0cfb2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('2762b5fa-d792-4dfb-8b52-15157c98c415', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('61f23d34-d575-4e48-a4cd-92ccc6647863', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('aa692dca-68d2-4636-b37b-6e9313d9c7bf', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('3181f50c-54cf-413d-bcaf-5c3403b5400b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('aab91425-8036-4eb6-ace9-789000812677', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('16b33fe0-067a-4a27-a3cf-5d011f280768', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. James Patterson ====================

-- Get persona_id for Dr. James Patterson
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-james-patterson-hfm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-james-patterson-hfm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. James Patterson' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-james-patterson-hfm (name: Dr. James Patterson)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-james-patterson-hfm', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('7790ef74-b5ac-457e-a527-32e846ae1001', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('fb27916d-ddc9-4d7c-8d65-e86fcc3d8061', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('a7ab2de2-2e8d-4d65-af6a-8721b3efb2d1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('56a36ff0-5f5a-4ac6-8855-8bcf8076f73a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('db3a081f-ef80-4ca7-8b5c-45fc43f582f3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('b14d332a-6be5-4033-a5af-f43b111926f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('19b1940f-4b0c-40d3-b9e8-d3257e5fdab2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('cabc5c0d-2121-4040-b91f-567b899e6cfe', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c346ffcc-3be4-4d8d-aa75-7fd5ea56214b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('9a86677c-407b-482c-a491-318179c8dc8a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('d257d72e-e0a2-4c3c-b451-b76e0a3b2be7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('92cab59b-efb2-462e-a7b5-77f45a4b7e60', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('475ecd31-f8c7-4ec4-b0e4-de0ef24537e7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('4f5434ac-6ad9-4608-8048-7a9630e20951', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('f54a18da-a55b-4fd5-a276-08d58d32f88c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('e769adf5-3fce-4fa0-87b3-34f4b06bb0b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('85e2ce2f-462c-4efb-a369-746b490b2800', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('47ad5d93-1b32-4ef4-a2ef-96d6518812b9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('33ce583e-ba94-4965-8c45-b09630fe3e33', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('8228b6ff-58b2-4b62-867f-f31056a13768', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('01dc5954-08fc-4197-9720-70563790816e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('02c085ea-5d0e-4204-8860-c9cadfca7d43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('ba4146ba-8d2c-429c-9a0c-a443e591c978', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f10a2c85-e243-47e8-b2b8-65105d08fa91', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('d5a389c9-92d7-489c-b7d2-82ebf24eaa17', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ba194acb-b028-4f4f-a9ab-7b8d794f32cc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('4ab1bef3-94c4-45b8-95b9-038ee2f5133f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('a79ab247-fc45-4ca7-9b60-dba8ef1d36f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('63298af2-cb0f-431f-a156-a06b20180b4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f6193a61-f838-440e-9693-49aff2bb609d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7a35cf61-4413-40fb-a3ad-995fdf1216e4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('25fbb6ad-7e2c-4300-80ef-01f9e0127ba5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d3d2ded3-2275-4980-bc3e-494fe96e85a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('242f2c3e-e7f5-4480-acf3-498b148ce5f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('3487e31c-249b-4182-9630-91b00d47fc66', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1aa047e5-4d7c-4070-8090-920dd4e80894', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('83fa1e44-bc9b-45c1-9816-64b963895c41', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('ed47ae18-f685-4963-88fa-702e2f65dcf3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('129caf03-d255-45ad-8ba8-311e3766e708', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d151335b-8cda-4065-bde1-4387b8f392dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('61e64630-8768-49c8-96e2-2a17d4d47b18', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8061458c-d80e-41d3-b886-c46d72bf2291', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('e85c854f-ee48-40e0-b7dc-d87777ff5a49', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('0c05b764-fa0d-41cb-b693-d4e87ed80e19', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('39ecd79b-2f88-429a-a1b4-d1f50206a097', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('9f633c2f-a124-4b62-b288-8f48b7790839', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('32a2337f-56ac-45da-bf44-21d3e0b73d30', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('152bb732-a04b-4cb9-b333-1707afefa0ff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0b26e4af-25e8-4858-b005-b43032c92ab7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8322b008-1e0f-435a-9d01-5059d84ca134', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f7325922-b3e3-453b-b9b8-7b704790515a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('a1cb4207-db74-41c3-9038-92806baebab2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('266e3e2c-60fe-4134-863a-eb338964634d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Priya Sharma ====================

-- Get persona_id for Dr. Priya Sharma
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-priya-sharma-rmd' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-priya-sharma-rmd' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Priya Sharma' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-priya-sharma-rmd (name: Dr. Priya Sharma)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-priya-sharma-rmd', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('98089da1-430c-442f-a1fc-7647f490103e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('88c324b6-d99c-4687-99d0-29c4b3f8910c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('55bf4858-9b61-4825-9f79-a9e89d87dd7a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('ec8294fb-422e-4393-9936-73f5937ab725', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('58f98785-23a2-438c-8049-fa222150be98', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('57d3886b-aa71-4c88-980a-6948ead65803', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('899c1dcc-394a-441a-8564-4817d51f590c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('01a05136-0cf4-4bf6-88f9-b6ae5a0eeeb1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('7dae5240-279c-4e96-addf-8bc06b92aadd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('f1602a11-c8a0-4d73-a054-564516c4bc56', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('f4331aba-ef22-41d9-9f26-7b1c3441642f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('f8db82bb-f1f5-4633-ae30-e6506b37361d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('17d3fb60-d9ac-4dda-9913-ee7cc4cd6ab5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f7281a77-7e44-49ba-8301-a02e05c3ed5e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('0e80d271-8f55-48c8-b9ed-a8d5524db972', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c326f775-a8c8-40f9-90dc-96d6cadf0224', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('71f56ddd-15d8-4262-805d-495a487b39de', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('b9761c6e-4cff-47be-a05e-2092dd822a4f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('dd1220e2-92fb-4fec-ac3d-b491a69c8b7f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('7b831362-e910-4a3d-b543-f7274c674654', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('d49856e9-4090-407d-b539-db3f4bad7b4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('68da999b-0283-4bf7-91a7-8f441c06ea81', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6dff27d3-2f7e-4958-bdee-6e111f55c29b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('99d97986-f973-48fd-b361-355fd2a2ec06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8d9815ab-5297-4782-8877-89eb82f97d8c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6244a37a-29d9-4f9f-bdb1-79d34a0e398e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('45287a00-87c7-416c-9b79-ffcb70ed7648', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('97008838-68f1-44d4-aa8c-73c0004667cf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('41cefc35-5621-48ef-85e1-9f84ff638e1a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a9838f28-88de-4b53-9cbf-b164d7d2423d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a2ab52d7-df6c-4436-bc60-25d9ba5219fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d6ebd65f-ff67-48e4-94f7-c47bf3c0a713', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('deb7fac9-cd18-474f-9a35-926fef951aa7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('78eb3452-33cd-45ca-9f8c-9a6407a7f911', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b3eec908-a792-4177-966d-dff42df5cf4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('89fa5e91-b545-44c0-ad69-c9400086ebdf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('7b0b395f-86ad-4d03-98f4-beaa996ebdbb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('f018405f-3522-4eb6-93fe-31ed081a1f0f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c07ae7e7-88e1-4d80-8ff9-237c0acfcb60', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c36e204e-45cf-4ed6-8b24-b3222ce92993', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('6021d89b-5af7-4bc3-a088-d810240c14f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('f2a1bf90-816c-46ca-83ed-c273384c5676', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('acc2b317-9310-43f1-b095-dabb53ba8dcf', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('d288aa84-92ed-4e12-bdca-bc70bdee3ac4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f722f3df-31dd-4273-9c78-fd24f04cf947', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('e62bd623-26ef-4c4a-9279-39680cce6ac0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('05daf563-3e11-4d7d-8f36-8462176ac291', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Robert Kim ====================

-- Get persona_id for Dr. Robert Kim
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-robert-kim-msl-mgr' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-robert-kim-msl-mgr' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Robert Kim' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-robert-kim-msl-mgr (name: Dr. Robert Kim)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-robert-kim-msl-mgr', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('39557b29-10d8-4ae5-b7f4-e881de7ceb99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('d5b53482-9477-4908-9329-a05cbd0354a2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('43474d59-1bba-437a-b10e-f5b48ca5fd43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('d6cd2e97-702d-4e8b-95f1-434dbf705712', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5161e8ae-4acb-4e61-8b03-fb42e4099608', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('932e2657-dba4-4744-a33f-3cb9dfe87af1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('b9134dab-a8e2-49a0-8a20-2c13725aca85', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('96c66a9b-4258-47c3-ae19-ef8023852549', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('26a274a4-bafd-4d87-a729-15317500da08', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('663dc71b-5638-43c8-bc91-ee20b3e730f7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('c3656308-3074-49d1-b482-ff7c64bc7049', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('edd38236-0b32-4302-a557-c1f47650052c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('90d01afe-9897-40f8-ab61-68b3f4c56018', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('2d5240f7-dc67-4243-97b3-05ff5ae70325', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('62820b23-9c5b-49cc-9c6d-11f876aeb917', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('63849088-81b4-45e2-9fe4-26bcb8c2c4e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('3737904c-be26-4b9a-bd12-04b0f0b202da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('f9338076-44f7-48ce-89f9-e5a324432e61', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('88e775c5-ef62-424f-8c71-ded2ffea06ae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('a80f2720-1785-4223-93ad-f8a791f45127', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('98500ec3-69b4-498f-b60e-2fceae9e6210', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('025fe417-d898-45b0-a29e-6a4ba87a4a13', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('b25e2be8-8d1a-4bea-ae5e-d096c9cf19fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8af135ce-3b9a-4a2e-bded-e8a02fa9713b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6089c09e-5636-4651-aa32-6466d511ced4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f2b574e9-5cee-46ab-84ad-8aedeae29b49', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7c5b82df-ad12-497f-9e29-39c369c9da01', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('507b316c-a06b-4730-b793-675c54530902', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('36b4bb69-bd7e-469e-90d8-b394dd632850', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c1c20bdd-adad-42cf-81f9-a25d2c67831e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('6e8b4fd1-4953-412d-b634-761c14d0d8ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7770e968-b9f2-411c-b859-d912d7c78b6a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d585fa36-02c6-43a5-9e1f-8f1f02556b6c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('617fe10d-d734-4437-97a4-f1db4af1e51f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('35dee3c4-ba5f-4d85-9726-10bdc975dcf7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5fc637fb-3429-42cf-b5fb-d0a521c9b96d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('5665a617-b2f5-419e-bd4d-c980d0f7b0de', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('9be7c437-e288-4b2f-a54b-77be05905cf3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('dbf31337-7093-4524-9b80-c48acf610b1f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c5927b95-145b-4a85-8ce5-55d4c9da9497', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('185946fc-d7cb-4417-8c21-27518f58473d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('ab38382e-2586-4ccc-b826-cee4a1977820', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8a0dd9fe-c739-4635-9274-929c51af5531', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('007bb798-cc52-41b7-b1a6-c630aa3a1fa9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('266e8d07-351c-4809-b7b1-bc99d4028c35', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2a3e3ce1-0467-4d75-a18d-25804e1db3a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('bf2c5f5d-58c8-4a90-8d0b-bff1b91eaa4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Lisa Chang ====================

-- Get persona_id for Dr. Lisa Chang
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-lisa-chang-ta-msl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-lisa-chang-ta-msl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Lisa Chang' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-lisa-chang-ta-msl (name: Dr. Lisa Chang)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-lisa-chang-ta-msl', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('a9515d68-c363-4656-b2e0-2384cfce9f7b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('967ad6ff-4f26-460a-9894-abafa8cb2e64', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('9de4d17d-b0a2-411a-bc2f-0566b7ccd36c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('11375d64-0864-45ab-961b-335e4fe0edff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('8ed73f6f-6379-4a19-8409-8f4617e7a69c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('689f5c04-4776-4010-8cc7-6ee8a73dd9b4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('27a62879-a755-4a67-8185-be4fe4ed802b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f675018e-6634-4424-ba46-ba75a2cbf3f0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('dfeb30ac-014d-49b1-bf69-a6b9092ce4da', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('66b48f20-219a-4db8-9018-23a2376085c4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('8299f849-fac1-44a0-bce3-e139de7954e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('aee459e9-59e6-4790-988f-9b5dd8bad010', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('5d8816fa-f9d8-4891-8559-72893d6c9cc2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('2953a035-bd0c-463a-a471-4f5814a15732', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b5d777f1-1236-4cb5-8ced-e5e422c6fe80', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('763196d9-cd4b-4c3f-8339-525cf5d256a7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c41f1537-3d66-437d-871d-92042e989404', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('44025487-374f-4f28-89fe-ca71cdbbd01b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('134f35dc-8aa8-464d-933d-d4b7f923ad87', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('90ea1561-f033-4f78-bd2e-7ca1bd9f5f63', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8c2112ad-1d2d-4e42-87f2-c846d3f63140', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('8024edde-5684-48de-a688-c483532c4e92', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('aaf399f2-9f25-405d-8800-17a18c4fa5be', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f6db53f8-88f2-468e-9fd1-554b92886b75', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('29780df3-fd19-49b4-8fa7-feebcb198cbd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('cee98d35-277a-4a87-a982-2f0245d2a0db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('18f76233-fbe0-464a-9bd9-8b08c863ac40', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d22c3090-169a-4db3-a9b8-d6bd218e4923', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d5867e7d-1702-4361-908d-197979de2eae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('58200145-8a5a-495a-9f1f-8180f5d86cb5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('8fc32482-cd8c-4e90-847f-b158d0d5dbeb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('33c5cc45-49a9-434c-b9b5-157a6c33f600', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('3ea60131-aa85-4b92-ac4e-ddf47c9f0ace', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('040bc42c-fc72-4eaf-a4e5-2636b824bb68', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d7399942-5d7f-472a-a46c-938231b0a703', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('70d2865c-ab1f-45dc-8d54-231cff8e410d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('e1af8d99-e49c-422d-adf7-2cafa35be4cf', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('969e7d7d-6468-4cf7-af16-cc36cace9579', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('a74066bd-3657-44fe-97cf-432f5d5343e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('7d9dfd28-075a-4813-bd81-27da8b8c5ee2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('fd138d80-248c-40a0-b5fd-4d2b0c8625b7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('86a3851b-9749-40bd-a569-7d54edd9e9ee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('a5755dd7-e1d8-43a4-924b-5ae09d00d7b3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('70831d34-8ce4-452a-a546-ab93b05e0bc5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('df8bd055-3fb8-47c6-a961-c26a5cf60d0e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7a8a93f7-2391-45cb-ad2f-8ec3f3911791', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('3a08fe63-3679-4850-96d7-8989147f23c9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Marcus Johnson ====================

-- Get persona_id for Dr. Marcus Johnson
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-marcus-johnson-sr-msl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-marcus-johnson-sr-msl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Marcus Johnson' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-marcus-johnson-sr-msl (name: Dr. Marcus Johnson)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-marcus-johnson-sr-msl', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ae2421d5-4523-45c3-b038-b2f3fe848c3b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('d211780d-ab9c-46c3-b3df-2ed6331111a9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('59983117-2bec-43df-b5bc-678bb2553d94', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('33249e5f-d806-4778-aba7-d7dbce063de8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c5ededd7-c7e7-4b68-b169-159abf515db9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('cf6a9a65-269c-4079-8fbc-d0255415ded8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('af9a1d2b-7779-4279-afa6-fdf5bf5bcbd2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('af9cf123-bd8b-4fff-986b-6612529ecc40', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('e7563983-bd11-46af-ab99-479bac628c51', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('41142491-c232-44db-b3cf-13b4717d0a81', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('65ef268f-2357-49e7-933a-e30c391a870f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('1a558e03-9c60-484e-b22c-e9147fd37322', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('ce6dfff7-b41a-4e3a-855b-0d1e512a16a9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('895d401b-f737-40d4-998c-7f5fbefbfd73', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b77bcaff-f8dc-41ed-909f-5a388fb17e6a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('02edfc65-8c3c-4f74-83d9-69fffbf98f14', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('29779930-98e1-4373-9edf-ba4367b8ff1b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('757ec161-62b1-4b6a-895d-1a134ed2d81e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('7b0de563-3710-4bb7-83be-74275f18429e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('b3d0c527-50d1-4689-ac7a-54fd39862d60', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8e23d136-b5cd-4414-9eea-12cbe27d37a2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('d2372674-f60b-4179-8053-fe071a81e22b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('c1c3cbe6-3e24-419b-94a5-47fd558f804e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fa2dc28e-8b0d-4dff-9669-98e5a12131d3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6e37d19f-2639-4d6b-bfe7-3c8e6a2e7437', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0fa5f29c-2147-4897-b26b-08915095cfc4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6b66ec0a-e8e7-4f4b-ab6b-8555f3d43c35', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('29d75f6d-7bae-4260-8aea-8c37bf9a4d8c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('ed09c549-62ab-4279-ab8c-d23ce0e0931f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('4627001b-fbfd-48d1-90f9-4bb1c9f6e1d3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2da21699-7d72-4fe8-b1c5-572a9b3d5015', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('0c317dfa-be04-46ee-93e4-d1783e28ebac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('efe02a15-d200-4799-83ea-62b238e7167f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('017d62f0-713c-4334-9697-ae2b7fa705a3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b1ce8d28-05cb-4870-887c-4c0b3e0c8e01', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a0a2edd0-a5e5-4379-87ee-164d6c81722b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('a4513cb8-5ccb-4fab-8944-ca0d8e5f2a0d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('632001b9-f82b-4abf-9f28-8dfead4a2ca4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('846a5663-e9ab-410a-9c70-7942d83e25b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c789e706-54c8-44fc-ae88-3012b54515d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('87f21982-dd31-4e33-9a9b-70fd3734992d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('39c66321-59b3-45bb-a935-eecd548843af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8961155a-d252-4454-aa43-f59f9717fce9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('59cd07e1-1c1e-465e-a24b-105cbef5ca97', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('81e2b406-f9ea-4344-bb84-fb0127c08f8a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('f0db345d-c44e-4dce-82e0-4cae942bba4e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('fd968794-872e-4fdd-8423-794c0c7c626e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Amy Zhang ====================

-- Get persona_id for Dr. Amy Zhang
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-amy-zhang-msl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-amy-zhang-msl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Amy Zhang' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-amy-zhang-msl (name: Dr. Amy Zhang)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-amy-zhang-msl', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('6c533103-43b6-4822-9beb-887717faf880', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('bb3c6650-a1a5-45ae-a296-17f468f251d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('d9c00c86-9ac0-40cd-a150-804c2d52c2a9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('660dd14b-b498-4721-9848-25267ff67017', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('8f889874-1949-45c1-abef-70fc81a727c3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('86b28af8-891c-401c-a608-1e29c2220675', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('da7f3a6c-e44f-4bc7-a490-0da7921d4198', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f46fbe22-fc15-4eb6-9e3b-8269f1fc8b26', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('bb4e062d-6719-48eb-80da-92b0e30d4355', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('b69cafb4-e48d-4ed1-8085-13999efe467f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('fe902be6-1f8b-459c-a00a-a6c1d070bb78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('3fe197f8-0483-4cf1-a062-293cfd7ca794', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('1c5198c0-468b-4cb2-b75e-d49d42effda7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7a7a0978-ba34-4b2a-b3d0-4520ca8c682c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('63fc0064-d4f2-4089-a4ca-fbd74b500163', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('84fe2d7f-fc4f-4e3f-bad1-ef51432e5180', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7da777db-046a-41e0-8c81-818936da419d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a7c6795f-a9fe-404d-9781-311e79460ee3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('411e1f07-5461-4870-8d3a-0fa17db9a238', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('b75b061f-8cae-474b-98e6-44144778b277', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('4642ad85-74f1-421e-9972-202236bb41ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('141bdf3d-f7e9-48f7-a801-080c488d43cb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6788e964-8dcb-4040-9502-2afd3ed33c6f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('65dd6c00-ee01-427a-b1d1-cc612a1b557c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1d62df18-d53f-4720-b312-81bcc33b2264', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('5ee16ce2-f4ca-4162-8865-4e78da389646', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('06a1b0c7-2956-4f1f-9114-a170e6f49944', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('51732ff2-b928-4253-a386-fd3529ea2767', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('8d0b5c97-20a5-4248-9979-225134b312cc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('adcc06ce-a632-4b0d-b960-a3945ac87790', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('24acbafe-7872-4a70-b671-2abf992e598a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d8879ab2-ac51-496b-ba50-9e22f4374e87', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('2b930cf4-a6c5-4c8b-84ac-a67dcc9b28d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('ec901200-a66a-46f4-91d1-ea00d2a8b647', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('912a6a15-0cdd-4596-8db5-8a3dfaf7ae37', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('90db81ce-108b-4845-b269-e6e778795073', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('0108c073-4b35-4717-bca2-2abf6be6b69a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('583d7df6-e767-4ff7-b21b-bc033f78c035', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('fe9aab80-04f2-4864-bb70-290fbbf81124', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('2339bf7e-1ef5-45e4-be14-b276d6bf6db2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('27b61664-675e-41f7-9858-b0351d8f8343', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('eca5bae3-ff4c-49e9-9ada-c561b7695e34', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8b8d5deb-169f-41cd-8f30-f6f597667958', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4d4167c5-e3b5-4df0-96b0-556ee7703717', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('20561c3e-d907-4516-9c4a-0af9471aa87d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('00005fa2-12c3-41bc-b274-3c30e06bf947', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('35c53a21-23ac-445a-82b7-6e73ad8d4a19', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Jennifer Martinez ====================

-- Get persona_id for Jennifer Martinez
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'jennifer-martinez-fmt' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-jennifer-martinez-fmt' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Jennifer Martinez' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: jennifer-martinez-fmt (name: Jennifer Martinez)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('jennifer-martinez-fmt', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('13dbba62-9c6c-4641-8cdb-0880e5d58d19', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('3dea5892-d1dc-48f8-ab81-f0bd35f77d70', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('fe3473df-fd62-4e34-9161-1321318ad391', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('8fd70988-0c41-4ccf-8694-42dd404bbbd0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('8e85adeb-bd03-4cb7-a062-990de8487f8d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('822dab19-7fc5-4cd2-80e8-6255451d982c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c82315b0-0d35-433e-9d2a-cb7af29db2d6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('8d2d1930-1c6a-423f-a1b2-7de98a0cf647', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('b177bb20-3d90-4495-829c-ca90dd06edb0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('f950de3e-fb40-425d-ba39-f3e02447e5f0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('154eaeef-6e4b-4f48-a168-fbd557fab997', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('815f00cd-45d7-4a75-b668-9a8ec3765af0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('723dd14b-064d-469c-9c15-d95b26f63cf6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('2404e964-fb4c-4a1a-bcf5-f1db273ca8c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d0a07b1c-b8db-42ed-ac83-7d65539564f6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('287fbea3-59b1-4df4-bbf3-f14b1f40ab42', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('6159ef00-296a-4fd6-aa37-83f1b42fe9ea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1c45157a-a15e-4da2-837d-955ae3942569', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('2ec7efbc-829b-418d-a4c3-dce41fff1830', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('9149b972-7529-453e-bee8-c49df55d996a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('a0f4d5bd-e138-4e65-b3d7-46282a52bc7b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('b43d9027-8d8f-43a9-9524-69c29753a53f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('aeab6b93-3977-44ec-9a2f-d2d29c4844cc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('412c41dc-a9a7-4b09-ab84-6a6264e6c78a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d72a38f1-ccff-485f-a847-ad9430cec76d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9ed15aab-8152-4754-af17-01bc25c18eef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('98b32aa0-6c9c-4164-ad1b-1d032e38e372', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('5953ce47-99f5-4afa-ad95-422fc530662d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('18c821f6-f490-43c4-bd90-226b8cb21c1a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7eaa4d46-300a-42ab-a944-1a6c9d6b3ca8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('e22d92c2-d686-4501-9902-8a4025cf93d1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('3d2a668a-6281-4f61-abd1-5b5ef4171b5d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d813d354-47b5-48b5-9b41-875d30bd857a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d9f4a6ed-e8aa-4809-bb4a-b500589b1af7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('bf19aea5-b4b9-4546-9986-dd20fc7d108e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('ca7f7c82-7fbd-4eda-8192-65c19e526eb9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('396ac91f-a9dd-4882-b22a-9b0f9b08cc42', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('20aa4898-5259-4ae9-8fdb-f31b21f39cc6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('329b944b-1432-4d5b-8662-78af2f94a2d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('8f597d5a-1872-4758-b29b-d6d6a806a6c9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('7eefcb6e-9404-4c3f-be47-4c0cd29c1bb0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('780d7285-8bbb-43fa-935b-e4a1aaaac2f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('974f2a80-b66a-4a2c-994a-06b9f1b170f6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('060593de-1f49-4f13-9799-ab7d0bb5fed0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('2c154a6d-ae3f-4305-b810-18b09c764de3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('ebde0f38-c9d7-40a2-bed5-42fa30155f90', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('8c14abfd-0d4a-4cc5-967d-b2e718be1c6b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Thomas Williams ====================

-- Get persona_id for Dr. Thomas Williams
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-thomas-williams-hmi' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-thomas-williams-hmi' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Thomas Williams' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-thomas-williams-hmi (name: Dr. Thomas Williams)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-thomas-williams-hmi', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('34b35050-1672-4fb6-b3b3-9dd05b7d64b9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('241b21d6-7358-4049-81c8-52874d4c1d83', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('122738c0-5b89-4daf-9f88-d46099b2f55b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('2c0c74cb-2d9b-4857-9bd7-fa43d07891bc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('9b9910cb-2ae2-43ad-a3be-8d7574ddfa8c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('3a8f5735-e2ef-4060-a338-b2202f475125', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c74fb9e3-3c81-4c02-bad8-355e8db9f784', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c9fef211-acbd-48de-9266-543fde34af78', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('abc1855d-f379-42d9-9cf2-f33ad4be250b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('e98607a5-1f61-4479-b1f2-6f5b6ae6e521', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('a6f5b7eb-77d6-4270-b8f9-764dd481101b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('1703587d-e04d-4604-8db7-690bee2b0eb2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('09ba9c82-37bf-4486-a06b-237ff346cf9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('400cf03a-eb6a-4cad-b720-12a9974aa284', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('1880f97b-19f1-496a-9197-440a1b32934b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('76f0e4b1-6b02-4a80-86ee-5134dfb6516a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('931d727c-65aa-4e79-8306-96964c7a563a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('75cca5ef-229c-4718-a5f8-5abe8196e9a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7941ca60-f162-4891-84d4-eae3713d0426', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('740a7178-4725-448a-a2b9-286f7e527e21', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7c843e2f-5e37-4c39-a4cc-acfb079b0d25', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1f6ae9f2-b998-4ca6-9cb1-7165e95d0dc8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('12a15742-3dbe-4689-b69f-543eb8f97260', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('1ad5df05-1358-42f7-b9a7-348f55abc67a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('26668195-08de-40d1-a2ca-72c5db90ecfe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('4d374603-7173-4c42-a5b0-2fc88bc648af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ccef3745-08f2-4d46-ae91-f0c11996ac34', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('7e990efe-9112-45b6-9556-df1b28930f1c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3140e918-76b8-40c6-9a2e-76b976e1a19c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('69619388-4348-4a4c-9758-9697fcae6063', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('75ef4668-6dfd-43aa-8696-adc329749dd9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7be6a63f-ca76-44ba-a023-0e5aa215b943', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('92d0479b-f9da-47b8-acbf-1833cd559c49', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('56ac7699-7f6b-48a4-9cb5-00286f010fdc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('4638b92e-3f5e-43ad-8532-e7b90392c132', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('5bf02000-d231-402c-ad35-677da607d153', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('9dd2ff8a-ac77-4554-896f-4679a0b70a7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d58fcfe5-d931-48ac-a26c-8a6fea450bc4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('de2c8c0f-ceb5-4b50-9815-29cd5dedc04d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('7732d855-5e85-4384-b181-5add1ed1a32a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8c2d84f8-16cf-4691-a8c7-1b4ef7dce106', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5c2d8fab-6212-49cf-b2e2-49e33fc71866', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('fa55ddb6-ce8c-47be-aaaf-342dfc27d284', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('2e2e8b62-3b82-41d9-9a58-766eebd15e16', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('7592c06f-0ae3-45b0-ac02-37ac9c727d9f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('910a4b81-34e9-4bab-b7e6-175ca5b159d5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('8f23c749-062c-4b25-88e4-9332c783f2e2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('be2e51c9-128a-40c6-aec1-a5ba91fbd0bb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b398eb13-ed16-4cdc-9338-5867f936f765', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('502b7ec3-298c-4ead-b343-b8a14ca1aa06', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('bfd1ddb9-ed32-4e66-89e2-a2b8ae653a02', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2be28bb2-ae29-44e4-bd3d-e280a4b0b02a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('825f9fe7-ffb1-43d1-8cca-c566e4fc0be7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Susan Lee ====================

-- Get persona_id for Dr. Susan Lee
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-susan-lee-mi-mgr' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-susan-lee-mi-mgr' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Susan Lee' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-susan-lee-mi-mgr (name: Dr. Susan Lee)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-susan-lee-mi-mgr', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('4d667e2b-b67b-4a6f-8974-d59b9c48bda6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('9214bebb-803b-4af0-8a65-15a1d9f79fbc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('142dc7a9-e3f4-4855-ade3-df463dea0436', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('b359cf11-2fa6-4922-ac93-d78568794ed3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('0e9b20b7-88f8-4058-ae0b-f98ea2725717', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('97cfaeca-ae4a-4a4d-b40a-5879dd470ba6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('350c7ef4-759d-42a6-99a7-e2f89c4fce4a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('6d57bcaf-a378-4da4-984f-e5971dc5a453', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('d31dae2e-4500-4d9d-8189-bb386b0af579', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ecc637e9-256a-42ac-b051-9c1db9a1d4df', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('165d2f5b-6e34-484e-9ad2-b2c7b3e709b0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('e6994b82-07a3-4767-b709-55df86421cca', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('9d6bfd8d-35fb-4b2f-8eb1-54648d73b37e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('63651e13-6b9a-46fb-87a6-921c227b3d8a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('3e317c4d-1feb-4a8c-8298-892179d3ad37', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('83a237b0-9694-495b-b7bb-d858b2570ef1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('6a715395-fedd-4714-99b9-a7f35e5a04a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('d4a79d49-c0b8-456a-98a4-2117b9342b17', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('707d7070-4979-47c6-b680-5578f004468d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('7bed5e6f-dd3f-4fc0-b2ef-a2afe5d5546a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f5b54e1c-674b-47d4-9971-2916fcc56a86', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('5363bc48-2acb-4bd7-aced-257acf0e81fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('7681f5ac-c4ee-46af-897b-ab3dd26318fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('058d6717-9245-4eb6-bafe-653046db3771', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('dca3814b-8068-4cbc-90c2-d216c8a7c552', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('950ad1f5-3c77-43ac-b50e-101e037b1534', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6c5af877-0b75-42d3-a404-d83e80a65948', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('2e845f02-0f86-40ca-b43e-ae6c5498079e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('3c07b819-d37f-42d6-90b3-b23939fae300', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7a96267b-431e-40f4-a4d4-4ae86de93430', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f4d65ccd-724d-40b4-8b4f-dcea90a3893f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('84374ea0-42ad-4eb0-a0ac-686229b47d43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('0151251b-ed20-43ac-8589-ec3f5ccb6e10', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('ca469ec9-0261-4524-942a-a20a3bb6d87d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d7cf7bb5-f9b1-4e84-89be-d4a34b153b61', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('e2b09a5d-9244-41e5-be0c-888ffc694d15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('be5e515e-404f-4b9f-ba60-1c9f64fcd61b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('e2dc7204-675f-42e8-bb0a-7082f118abbe', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('53d38be4-77cb-433d-b0a8-bf419e524ee7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('f7d33e84-f32d-44ea-aeb5-18b502ee6cd6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('84a9171f-c151-4e05-909a-bcaec02f4d3c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('1fd76142-4b50-4bcb-b917-9c68e74a153a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('a3311938-e80c-4eeb-8634-1e6a9a214120', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('016578a7-5a45-4409-9dda-d3cea0bae8d6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('e5e37b44-3c4f-433f-b8f7-f14e84c4d958', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('29a89ad1-824d-4d0a-a840-fb9758c23ff4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('b330fd5b-c406-4a79-bfe4-da983020b8df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Kevin Brown ====================

-- Get persona_id for Dr. Kevin Brown
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-kevin-brown-sr-mis' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-kevin-brown-sr-mis' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Kevin Brown' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-kevin-brown-sr-mis (name: Dr. Kevin Brown)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-kevin-brown-sr-mis', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ceb9597b-2fa4-4d8e-a6e0-a738a8042196', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ef415f5e-1668-40c3-97a4-ed8fb4e03954', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('15619841-5bcf-4734-a385-db4b50577a4c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('c0238350-b349-47e8-bbc1-f664d306191e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('99b33d0a-f6a3-4438-b10e-2802d05b21eb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a77ae7a5-cb46-49e0-b16d-bedfd73c5a44', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('1f012b08-4c81-481c-918a-f43e8b7a0827', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('9139f6fc-45ff-48bd-946f-6e86f0acf9be', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('0f38925b-80b4-43eb-b7ff-567eef94f2c9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('d4d6e273-4fd5-407f-b833-462cb6423acd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('8319e38b-5805-4186-b3ad-0e1c03dc2cad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('03bf4037-1457-4747-a86e-fad759b641c3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('8b7c9a12-227a-4782-ad91-4023a5ab4f37', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d786180f-f45a-4c54-a7af-bb2f8c29b856', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b85f43e7-243e-4150-b1bd-992ae426462b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('547d007c-35fa-404a-8493-caecc49c068e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('26d065d7-924c-4f32-9f1e-34b4b5bf2a70', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('450517f9-383a-42f0-be1d-34b3a2be8670', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('f1983ada-eb44-4c6b-b8a3-bfce7b14f607', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('7aa830c3-f3ec-4911-ba59-8e1e569d1e43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('798dca76-6dd8-498a-b897-84a14e69df53', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('c0bf8e60-5992-42c0-9ef2-3871f48c09a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('5ac94131-c056-426e-8958-de2d7d715c78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('e0354daa-fee7-4872-afcf-02c1e7c5372b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a08190ee-4bb4-4bf4-8018-63fde64015e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a05d37c0-5b6a-4ae0-bbf3-0205a49f9a09', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('5e62fca3-4582-4703-8ded-e98ccd7620a7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1e8a1d75-3a21-4f6e-884f-159114ab77dd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1a59bc03-ba2c-436c-b5ba-b6a5ad207a7d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('9f4d0de9-b162-43f5-ae13-6f464e1fd509', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('10ef9f35-5fa1-4a9e-a929-012ba833e54e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d8dea86a-369d-4699-881e-c06aab1b8c7f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('766b81b8-2443-467f-aa2c-fc284b4f387b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('56af8845-61c5-49f0-86ad-03715812845a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('0dac2c26-758b-4b2c-bd96-413ce8bc4615', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5e5335bb-4100-49d3-9502-02321d5dc2f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('b3139214-a88d-4dcf-a2a2-0d6fa011c016', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('d9d9d4cc-eb49-4e8f-8fd1-49a6cae83f49', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('97bc31e1-f2ba-4701-ab73-696ce256be9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('66b27db8-14ff-4b13-a90d-e64b8630b6bb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('9f69154f-7666-4b38-a1c3-94cc3213bb5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('1d50631f-16c3-4674-9542-c36e847d441f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b0f109e5-25cf-46a8-9b05-5536c17a9d54', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ca795b55-3935-4f34-b43f-de06f0972878', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('090335a5-8c57-4fb3-9687-0589e8fbaf3e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('01824442-e7e8-4462-8e3c-81d8b800e834', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('0751e13e-def2-494d-9b30-c344c9489e7a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Michelle Davis ====================

-- Get persona_id for Michelle Davis
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'michelle-davis-mis' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-michelle-davis-mis' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Michelle Davis' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: michelle-davis-mis (name: Michelle Davis)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('michelle-davis-mis', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('cc8ade1d-b7af-4f26-8352-910f0595091c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('6c2fc26c-c551-462f-9741-0e2ea45f1c7b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('5a1255e2-8a69-44e5-860b-49543ad2474e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('8eaada37-d276-43f3-b27a-3e670184d5d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('f2f879e0-b5c7-40f2-9f16-b4ae213142b9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ee3bbdd6-682a-453f-b94e-99a8a60ca34d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('7e454ca4-0739-45fa-8cea-c678e1d845f1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('75ad0425-d215-41a4-b40f-d7ab6b3340e5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('c0f8e13b-6702-4421-b5fb-938bac2f1f11', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('4dae7e77-0c95-45b2-adec-c9b94d39eb79', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('0179216d-b2e2-4e27-aabe-a1b04b11744d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('9da784cb-acc9-4b7d-b14c-c099a59baeab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('ae12426e-a491-47c2-9c9d-2f5fc2c94277', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f412adb8-69a2-4863-b3e2-92d872a9da0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('a8364406-5779-460d-acbc-5ecd235d8b2f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('453b5e94-5fe2-42e9-9818-a5c6777a3a74', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('3c24b592-d559-4976-8be9-f91042603967', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1c9fef5a-65d7-439f-8938-d287f6bc0fea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('e0d643a6-c2ab-43fd-96bc-b075a48fd000', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('cd965778-9d4d-43ae-a993-e6cc3f33de6e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6912ee25-6335-4030-b5f2-9e50a49beb9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('16f7807c-af2c-438f-9cf6-a40494b5a1b2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('dae0a538-84d0-497c-8d78-87d0b674c44f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('215077d2-0da9-4a70-814f-0e6e6ad6fe1a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7ec7139f-5b00-4ac7-bc05-4e0d73f54bea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f59af9a0-03e5-470a-ad59-0f9232c1772d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('58eea7a4-a7fb-4c1e-b0ce-7002f2534f88', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('3ca10a6b-22bf-4644-bcb2-bc264d22cc4f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c3a9a80c-ad42-4e78-a015-c0797647a3ab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('99906f3d-2baa-4436-9957-aa85e589d88f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('90b94c05-28fa-4b35-8a7d-3a0bfa38a2ab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a63713e9-87f6-4625-bc91-8958b8278923', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('f7d4e8c0-92f3-465a-aa20-b676048fcd82', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('cf578192-ace9-4750-9ca2-14e4b7d63fd6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a3159887-dc4d-461c-b9ce-110fc521d7a9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b39ab35a-cb4f-4450-8254-0c9357b6a243', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1285ce71-765e-4ebd-80af-46bd0e6eba6c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('d735e86d-1df2-4305-8137-04878e8055e0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('678ddb28-2132-4c2f-944e-6cffbdc551fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c1df60c4-92d7-4801-a30d-640f482a4d2a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('af1c8716-02a2-4cd2-8b74-de085b374b97', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('20e45618-cd41-4f56-8866-cde049b9c3eb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('907f7250-e36f-4ccc-a171-d95a875a3372', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('37eb122a-2e39-47a3-99f8-a1eec1adb004', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('640d72bb-2a67-4a39-9814-1efb64b56126', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('fa85e631-1ab2-48aa-beed-cce61c3bd1d8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('1ceb90d6-d67e-4172-9e26-b331cdf78ed3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Sarah Thompson ====================

-- Get persona_id for Sarah Thompson
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'sarah-thompson-lib' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-sarah-thompson-lib' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Sarah Thompson' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: sarah-thompson-lib (name: Sarah Thompson)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('sarah-thompson-lib', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('82c4949e-b2a3-4e26-abc1-7490984b8bc1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('e0c6cd90-8fd8-408e-bc35-2326da3cca58', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('b2ff5507-9aa5-4af5-918e-6805412f13ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('aa5c1369-d5a4-41b1-b23e-51cec8dd79c8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5af70cc0-c07f-4431-aa21-50008ceb359f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5676f903-abd2-4ef9-a60c-6cdb7c577f43', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('0b07b3b4-999c-481c-837c-bfc2c11ae8df', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('8e50599a-1c23-4af0-9558-d6a9e8211060', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('e72a2a7e-e320-4d73-8fe9-3852eeed633d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('85732f62-6e16-4fe2-8aca-4d695d080502', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('240cee9e-a5ba-46b6-ae95-9bd78e3e6606', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('b1d1c22a-2fa1-4d65-87d9-cbdb017290ff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('fb56caca-7338-4568-8333-4e0cf80d5f07', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('2765a125-8ef3-4831-866a-b4687427f6e7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('4a869164-69e0-4532-b978-0a72adef5792', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c1f231a4-db13-4f48-9b0c-851f90e8887f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c949818e-45f1-4252-a85c-332582f351c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('cbf273dd-5fb0-4332-9b1c-5dcfa3a22b7a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('98b82f42-94f8-4c37-b2ad-ed272832fb93', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('a35914f0-5312-469a-b6ad-454a38ed7a76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('3612626e-a0d8-432e-834b-1509866359c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('fdd58ebe-8fbf-4cf7-89ae-d8f8d68bc29b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ba154a9d-8ece-45db-8955-f3147ca5cd95', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ed8a7c7c-6bca-4ea7-b1d2-7b4e0ad145bf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c47c2d2f-6a17-41d3-892c-d33d936db74d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('02957130-0a3a-4bb0-b3e2-0dbe376e11f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('905c4dd0-01c6-4e77-9974-7998f8996607', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1212b4fd-4241-4ada-a28d-b72b644286e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('98a32e7a-3c39-4750-8346-d6847643e05e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('5037a893-57d6-4021-891c-f7b7b0e063fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('68af6ab6-8682-49af-af16-8499b6f8e711', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f403df35-7763-46b9-840b-ac141500b282', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('5969720a-268c-4f91-82b5-6c567c953911', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a6ce66d7-f9f0-4c07-a7de-573c9d5e8c14', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('6012f256-8e2b-4bcd-a466-ff75d3336c23', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d40cdacf-f850-49e8-832f-8829692f040a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('35c8bc45-fc79-4829-979b-cabbe0b9d778', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('7d481468-ce22-416a-9fc0-1beaad8df283', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('15636a82-e828-4e87-8924-5e700bba56ec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('e1992a41-6dc5-4c73-8c22-2e1bd1705c40', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('3bc86aca-74ac-4ba6-a66f-26e989aec176', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('5120ff9a-cbf8-4620-9cb7-ed562d6dd4dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('76e51449-23bf-4550-ae67-39a560041665', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('935add7c-dc60-42d7-b470-e494fb2aaf52', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('e37912ba-6c82-4681-813e-0e52243a59c6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('caaf7bf9-9f34-4731-9781-0b00aa52b873', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('00741e2d-f636-4264-8bf9-16e10f83fd71', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== David Wilson ====================

-- Get persona_id for David Wilson
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'david-wilson-mcm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-david-wilson-mcm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'David Wilson' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: david-wilson-mcm (name: David Wilson)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('david-wilson-mcm', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('83c6a38c-2855-45c1-8ab1-7ec6fa6b2698', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('81769925-afc8-4a58-a44f-a8a1f9443cec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('f55b4a27-bf92-4102-810e-b2e6cada55b5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('75805a23-0a24-4764-9316-0653db67a580', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a6d0b0c1-c77e-4109-8c23-05e7144fcebc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c8254276-903e-4476-af29-a6dea5488452', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('e45baf20-8cf7-4cd9-8615-f5bebf193d99', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('1ae1a9b2-cb2f-4ee6-b2c5-30a520c73b08', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('9fe2c1a1-c1d5-458d-b558-2522f51019ea', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('8322c9bf-715e-4574-90f5-7b13f3123e24', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('40c968d5-6787-4142-b235-0f1acdfa7e4b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('5814b9cb-fa14-45f9-b539-04a34a1d5a15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('9a45cafe-d3b5-4712-ad7d-48a83636e5db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('97628957-b63e-4975-9c76-c62a49efb64a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('dd47a4a7-831d-4996-a757-b7d55a942522', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('4bd89a80-bda8-45f0-a91e-e1f5a5800225', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('ded90ef5-018f-4570-998c-999ec500f633', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('5f055e29-ba27-4c92-9c0a-164c2f349a1b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('567307f6-1f45-4dc3-b4b7-79b1fda15a41', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('44062e5c-8805-41b9-b207-ebd226015bd5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8f920dc1-f9aa-49f3-9843-cea5869c63f2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('4db84bac-fb8c-48ad-af8a-873bed4eb8a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('5c013f81-4a4e-4e2e-97fd-6b3cfd2a7f84', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('98424658-00de-4365-8a14-f58ce2ab9bd2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3fd81e72-eb70-4d5b-a122-4551073d32d0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('34b1b351-82b5-4b34-9e5c-8a8472440eb3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c05dd603-7534-498e-9614-d5c8956926b1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('7c528d38-c478-49cc-9df3-4867d5ad2ec7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('271c4fe4-26e5-4516-a693-fc415dba5ebc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('10fbf619-5ef5-4a0b-aa06-782209bc7197', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('3924cc59-d1fd-4b70-b6f7-32996fcb1e6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('679fec9b-ce01-4801-9bbd-3155b5a3b621', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('64b4b8b3-cf45-4258-9f70-bb346dfeb302', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('27b9f463-1410-477f-bc3a-677a2d5ab7fc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('10edf83f-4ca8-47d9-82dd-6542c8db47fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8de64780-c0cc-4f16-b4ff-63f8cf0599e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('7e86c2fd-34cc-468a-b5f4-36c9b3e926f9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('e547fb23-fe11-43e4-86ad-f0c6f55550f4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c082dda3-d8e5-4f98-bc17-21b2db5e9a87', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('f6823778-8bde-42c8-ab7f-64baae372e99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('bb4c4c1f-67c2-478c-b149-95b59bcc517a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('1af9581e-1d76-4a60-87ee-19cc5dd32331', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0e78c096-bf51-47ac-ad31-b1d1f2607298', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('3d95e247-850f-4f50-91db-cfc1242f0a7d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0fcbcd03-816a-45e7-8e0c-f8817bdde1c0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('f1ba46a1-c233-484b-961f-03528dab27cf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('e1e0df10-ec43-41c8-bc4a-998084b81655', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Patricia Garcia ====================

-- Get persona_id for Dr. Patricia Garcia
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-patricia-garcia-mem' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-patricia-garcia-mem' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Patricia Garcia' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-patricia-garcia-mem (name: Dr. Patricia Garcia)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-patricia-garcia-mem', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('8de225de-afe4-443f-b118-4c44b74e119d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('f60cf050-8f2e-46f7-a476-2313d1cddede', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('c2e5de29-d5ae-4846-8ad9-d6caaa01913e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('c1d0cb7d-3e41-4c48-882f-26e88fa92929', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('fb959ca8-55be-4282-bce4-93b50da9b4d9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('98891f0d-970c-4888-ac30-8b2ff9d288dd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('a62679ca-7ed2-45fd-bb16-fad925d55cf6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('91dcd537-4c95-40c9-b4bb-2114cf912901', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('fa739a69-aca1-4569-b461-018f5aae3bc5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('dd610880-1950-40c1-89d7-0c21b100fe19', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('81ba654d-109a-4c3d-b915-3a4bb05aa243', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('d2666496-f17f-48be-90c6-de7382823ef2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('8f139eec-2c3d-4ad3-bca8-debbfd986f6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b69b26cf-c70c-4d2a-a88a-8b110378fbdf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('3dea37ff-7b5c-4b8e-949d-1ed07fcb244b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('85e9d76f-8d31-4ff6-9ab9-d9f61f5ff0df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('97fa0b16-c3d3-42d9-a41e-88d9294668a9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('4de3048f-60ab-49d7-8c59-a23c96666adc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('6b50a5b0-2869-4184-81a3-423daaa5ecd9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('7f122f90-9acb-4d2b-8ecf-5944fb6d7e36', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('16dc01b9-64b9-4520-b1f3-46c1f2a72d41', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('aa048474-d998-4a29-9243-f8a232d8fab8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('8c226f3a-a2e9-420d-a6d9-a74be916de93', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('49b690e1-0a99-453f-8378-a2de72de5def', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c6bdbf84-4ea7-421a-810b-9972521c6612', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fbfdc229-ec0e-452d-a969-7fff50137d76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b286a1e4-f135-4204-a24d-d3f4ffb385c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d6b3e12e-8ec4-47b4-99e7-dedb46ca9425', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('62b580fd-974e-4608-b805-be98c2cab84d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('853061e9-292b-40b9-b5ab-8000ccfd564e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('0a518c88-a133-464a-99d4-13ee983e7f29', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1091eb89-da94-46e1-96c7-4042c411a958', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('aa18aa89-3ae2-4890-9178-44cfd2ab701e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('eb86136a-f4f8-4745-9b65-4958533b8779', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('12aafdef-5b79-4b4b-b936-c4e05769e496', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('869b512b-cc7f-4eff-9ca8-ebf9988de577', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('ad866f35-df84-4e0a-90e9-2f1705bec1b3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('dec0f8fe-8841-4fd7-b0ca-20d87178f390', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('de987161-340e-4414-a307-db4cc8e3cec7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('34a0eef2-6153-47cb-9afe-54ae1e32912a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('00098fdd-10f1-4052-beaa-07a0f694c97c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('db3c7d45-63d6-4df6-abf8-ff54e04179fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('5f575da8-7224-44d2-90a1-c88af193ee8d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('33d774f2-2261-4a8d-b4c0-1cd2f0f8c137', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('21320036-ae23-43ba-83a5-48eaafc6d065', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('646b5478-68e0-4940-80a2-3c583d59b2c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('924a3684-d48c-4466-913c-2125049a6946', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Richard Phillips ====================

-- Get persona_id for Dr. Richard Phillips
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-richard-phillips-maml' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-richard-phillips-maml' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Richard Phillips' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-richard-phillips-maml (name: Dr. Richard Phillips)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-richard-phillips-maml', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('7acc951d-b472-49ed-8ec0-1edde651852b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('bcdf4e4f-a376-48f0-93b8-c027a98f42f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('3f131c7a-cec6-444d-9f95-50e117d37b61', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('db72549d-3a27-4ab4-8bd4-b6c2ff12173e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('86d3b86f-da86-40d0-9655-a4a9b09e0d9c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('99cd5e23-e754-455e-bb27-f5037d8242a7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('d78d2037-9d3f-4ed6-8c4b-e98f0b8a3448', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c2985cec-ff24-424b-ad07-33b8754c3561', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('493dcdaf-171f-4033-85c1-763eaae1683a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('d0970dc3-fc4b-4c58-8561-685f76ba00a4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('b063fdfa-a273-4fb4-83a8-51d2f038a325', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('8cc71742-bd7f-4372-877a-52f53b941961', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('4ba8396d-0a3b-4a83-9e13-1fe05e0bf3b9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('55ba114d-2747-4724-9605-56b48e1fff09', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('68304536-6a8c-45b7-98f7-241a4cfae377', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('d686b05a-ddf7-4209-a4e4-77ac5d3be7a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c1967fe8-c6cd-4826-bd56-e3ac9daf3284', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('c8ccc185-266d-405a-b334-2e2eaf446dec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('ec94daa2-1af8-4eb0-b84a-a3374ce615fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('dd6cff32-41d7-4403-b83f-098faad36d5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('cd496d22-cd4c-4eb3-8ec4-140da36f315f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('491b06f5-d6f2-4ebd-b468-b6db50e72ecc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('56c23584-b15a-4011-bc65-b46a9c0b7de1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ec1b7f29-6471-446b-854f-eadf2fd4d79b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1aff2b59-3e1c-4c6b-8bec-ab58b23dc244', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('592e8675-cdd3-4ee5-913b-c559223295d0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1a73790e-1376-4d00-8685-1f5dcf3192e4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1384e8f5-8554-4c44-b468-b6555ed75be0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c0780648-d40e-4211-aaf7-0f1d19c01fb1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('22ca7c0c-ab38-476b-9d67-acc75e08c0db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('87a424a5-0b55-46f3-8255-addc0275cf93', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('ea419ddd-f303-4a1a-a470-50f915da64fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('05a8ad2e-252e-4783-bdf1-8891f3d8a923', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('579f899a-85b0-4f14-8241-13f64db435a7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('24ce4b35-ab9f-4290-8f21-ac33721c71ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('935177e9-2c6b-4400-a889-37dd1074dc44', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('3514e233-5f2f-4805-9172-229a1a85236a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('bd938ac7-368e-449b-95ea-7578b3826549', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('934b3044-8b21-464c-9fe4-f4a63cebc68b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('7d21eb9e-d7e0-4694-abc6-f9067766cafb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('75a2c5a6-ca19-4d98-88d7-e4579ed7b077', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('f5607582-1389-4b37-bb9b-fd3ee8a35f97', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('002bcfcf-b2d7-4470-b1d0-e0c16b608bec', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('fe55dc7a-041b-4d74-b16b-6139b1541770', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('02d61fad-afb5-4b81-8921-7e60295caf85', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('25862ef1-30a9-4abf-b374-6767593c0efc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('90405c4e-a757-42c2-b054-799ad45eb47b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Steven Campbell ====================

-- Get persona_id for Dr. Steven Campbell
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-steven-campbell-mm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-steven-campbell-mm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Steven Campbell' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-steven-campbell-mm (name: Dr. Steven Campbell)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-steven-campbell-mm', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('de10d5fb-afea-4f4d-9c72-1304e54c72d8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('e02d4c37-f5b0-44fb-91be-a3282a9b73f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('ffc3406c-04e6-4a5d-a6f4-53dd1242a752', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('f99b4512-9b0e-470b-9712-0c1b5c1dc9c5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('65bb615d-0baa-47b6-b0b3-958299b88f2b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('537b851a-5fef-400d-b888-649fb557ae6d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('3842daf9-4a7e-4705-b2a2-5fa44c81ddde', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('8c5eb9cf-8514-440a-bb62-c22cdd07b737', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('b94de08f-e499-4b4b-b4af-955e0433b3af', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('1eddf4b8-3acf-4d78-8a2f-ea8aacd539f6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('0f9c2ed9-8806-4ed3-ba37-d3b32c456f8e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('629d6d66-63d7-48fd-bde3-e4cec60ae9b2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('26d165e9-12f9-404b-9935-6bb4e6b8589a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('a2085baa-17cc-43b3-a763-aa59a7e96bb7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('05164e3b-4b08-4bd4-9599-50f7e5026faa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('1da0bafa-56e3-4393-9c81-e50fa6aec398', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('11a65f3c-79ea-4cce-b59e-13c736fd04c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('4d3a26c5-64ec-47b5-9559-d6b1906b965e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('6225d768-3333-4235-9078-c7565b5ad7c3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('85687a24-52e9-4b26-b7a6-4ebe34a89482', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('64efdb7f-6284-4464-9d6d-1c851fdce0fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('9ef881a5-547d-48e3-b1fa-bbef14384891', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('0cecfe8e-ca8f-48fd-bf1a-0dd9d8ee8fbe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ba23d7f0-65f3-4fed-b4a5-4493fa715988', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('552173b0-a5c1-481e-919d-1c986a47c91e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fadd18f4-f195-4477-9adc-3649a7fa38c9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c058d37b-0cfa-4e9a-ade0-9b3862aa1a28', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('30111740-b1e2-4d41-8e0c-535bdd14f637', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('da155a40-b5c4-4460-8211-915c325e0e31', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('42cbb0e9-c788-4c8e-bd51-2a9224a04621', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('dd6da7be-2588-4e76-9ef0-8ca299be700b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c1c68edf-5937-4a1f-975d-7dbefbfbc70a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('2c2a1c9e-c689-4adb-94ea-2b81986d8589', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('51f97cbb-7a72-483c-bebe-dec894b66c02', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('7ca8fb41-1bd6-41a0-8eff-c4925687b0d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('27c8e4e2-fa23-42d3-b415-fcb3f6ef1db1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('ed510c51-0953-4e1d-9838-d0b02de4ae2c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('dc67da9b-414b-418c-aa45-6072fe7eab7c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('d8b92488-b78a-4e04-8921-653763750ef2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('90f03ad3-2b1b-49a1-a85a-d3da08d150c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('bf8e5bab-0d7d-44be-a8d9-038ecfb651db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('84b57635-327b-49d3-99da-1937cb49307a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('53f5805a-f607-4e5d-ab65-0f9e7918f11b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('69eaddd1-4c04-4159-ae78-d760910b68e5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('25ce2ed2-8eeb-498f-80f2-bd60853a7bdb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('1f36db00-469e-44d4-8a53-b2a5f6619f54', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('16d0fad5-c222-4451-9a5c-dd6db3bc7065', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Maria Rodriguez ====================

-- Get persona_id for Dr. Maria Rodriguez
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-maria-rodriguez-sp' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-maria-rodriguez-sp' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Maria Rodriguez' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-maria-rodriguez-sp (name: Dr. Maria Rodriguez)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-maria-rodriguez-sp', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('047e43bd-4eea-4624-a7fe-fead1565b538', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('3d66f9e9-9c27-4c6a-be99-f0007e7b15c1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('34185209-f7c1-4bfe-be19-cd3746482f62', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('9c06994b-637f-4124-8a25-7cc6d6a92b77', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('fa1e44b2-bedf-42b3-8f5b-2b0b03663328', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a795a157-43de-4363-86eb-c2148f3e4123', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('302be85e-401d-47d5-abbd-2dbc3555dec9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('01b0a3d8-24fe-4f32-8762-06c683a2bed0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('74542862-b079-4b8d-9f43-0aa5b028d07f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('c0755b46-74c0-4341-bc98-cf526bab3c8a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('1146ddcb-7d11-43c3-ac47-a28869907ed6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('583bad6a-58aa-469e-afbe-0f26b6b95685', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('e73a9d9c-ab26-452d-acf2-7259d8a9ab31', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d8227235-8785-4574-bfac-34a70af371a2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('a2ba3f38-874c-40dd-9ea2-de000bcc49a2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('8b0b2a51-52ce-4d1e-8848-78a76f509b0e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('5ffd20aa-ea8e-4d87-87d7-19abf47a9b0c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('d26db10c-0948-4ff3-9ad6-e07109c2575e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('92cb2839-b60f-4022-ab0c-160c3e420208', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('e5120879-8cd1-427c-aac4-648407875c0a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('966933e0-df95-47e9-9c8e-55b2cb9d5d4d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('a91d1143-457a-4a24-946e-e647ef0f9d32', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('391306fb-4993-45b7-9633-9f788f799a98', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fb98464a-4fcf-4d75-a9b3-14418e9b8ecb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('85adc58a-e346-4afc-b217-298010c66a22', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('656509c0-ad25-444d-85d3-f51b91a1fb05', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8115d1a4-163d-4b13-98f8-e2035e8f3ab4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('5ab69cf8-9e30-4de4-9ca6-58387b9b1864', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d24b9843-e075-481e-a17e-8529ab2f8a26', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7d11b60d-fe14-4969-a011-75021f2744fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c076f1f4-cc2a-45b6-96e5-db8d5274b893', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('327bd959-a7ee-403b-a11a-a47fa58fc64d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('59d9241f-8ff8-494d-966b-9e5fe88b98c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('08268a36-a99a-498e-8be7-ea6d5e9facd5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('dde6ef71-17ac-4e6d-ac21-8b05a4bc5737', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5bdd577e-396b-4562-bffe-4b84e147ce76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('35bfb188-b339-49b9-b90e-d88b3eaf88a3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('024f9c1f-7b5f-4b46-ba52-71bea072ec56', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('f6e3360f-9096-4b9c-8d58-990f92a8d22f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('1c07e934-dfa7-44f3-a953-dac71541a3a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('42637c78-b8c6-4614-8db5-4b78c85e2324', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('617ca38b-5078-4d83-925d-be6bcd750995', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('cdc09a05-d3da-43b4-b631-26f7bcce6993', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('eb34e8ba-3bd6-4764-86b7-0bc541a91c87', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('3d65f857-5caa-4ff0-ade4-1ac319184368', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7f2fd0c3-b0ec-468b-a305-ed70ff8de7bc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('75d64b17-aaca-4f04-9b87-7ad89cd2d162', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Jonathan Wright ====================

-- Get persona_id for Dr. Jonathan Wright
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-jonathan-wright-ctp' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-jonathan-wright-ctp' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Jonathan Wright' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-jonathan-wright-ctp (name: Dr. Jonathan Wright)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-jonathan-wright-ctp', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('aee35a2f-8131-42cf-95b5-38b7cd2586cb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('99b7e0b9-b498-44c2-8a76-5a42668f8491', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('3abc6c82-1b32-4a5c-bb2a-4017edb75b91', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('ed5a78df-ca1b-4460-b8e3-1e5bc7441290', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ac644c4b-d550-421e-9d7f-4075458b2273', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('4701aa59-5221-4bcd-b88f-f47eda0836dd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('11d119b3-f461-4321-b22f-97805f546778', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('a1b34599-24ed-4153-a219-0ef353c3f75c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('6da82eff-bd6d-40c0-85fb-e6d7b95f8492', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('460f6b29-4e04-4868-be2b-376f6d89978b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('7e975423-b5b6-4019-b7c1-962505eb6b9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('46d6dfa7-2e7a-4d0d-94eb-cfb17bb6dcd2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('52d358d3-efec-4d3d-9464-efd6716bfcb9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('597c9a9a-70b1-4f3a-bc77-0201d2a6fe1c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('379a9b01-977a-4ebc-bcfc-43e9d1f808a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('95d3b155-2ae5-40f2-9391-d21875deed4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('ddf03f16-3c1e-48a6-bfcc-47a46ac23711', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('b2a12e66-f1a4-4299-91d7-fe4a4ee5920b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1d34ecca-48d8-4bbd-99a7-0dbf064a98e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f789c02b-3a58-4578-9a32-9099776902c5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('bada1642-e7d1-48a9-b228-ee59349c2f96', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('58364085-9dae-4183-83db-66438643af0c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('e0003856-26af-44c2-9cda-10fcc2ab930e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9ccda7e2-f0f0-4a24-a654-60f08860033d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('17451f74-7f4c-4582-a6e3-d5176a56ec1e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('957d648c-298e-4810-9417-91e3ca75b2e7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a4b159b8-3fca-4eb1-a8a8-914fea9a8da0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('5ccc9aee-f057-4df0-9614-6d95a9a74b53', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('7466ad7d-db25-468a-84f3-34bd08266d90', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f5f79f4d-8925-43ba-80ad-f921226b025b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('79aad586-3065-4e37-b7f6-cfcf59192eea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('0cd069df-63f8-4175-8cc5-fcefee2d0383', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d86c486d-fe2f-4e5b-b25e-8050f1f5e78d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('ed0138e8-f2b2-4da2-bfd7-344f9531b480', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8a3832df-a2a2-4d7c-af01-0c4d034005be', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('689676f8-41d1-414c-ac1c-3f205eade62a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('60cd3765-9f35-4b74-bd80-34130dbf14ed', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('a15e33f5-7211-4176-9566-73b49bf48c0e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('920c4dd1-2c16-4338-9e5c-3c1e5d7c7e4e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('0c871623-7701-4fed-88f9-3d5a96a8fbd2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('419bb432-0a56-4d27-b06a-ac2fa8816bb8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('23540a39-d9c9-406d-a419-bc9ad114c198', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('bc6f7885-5de9-49d3-92dc-a9f6627f174d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('34b727f9-dfa0-4638-bcf6-9c70f06c0421', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('36bf846e-d4a3-4b05-b3ff-87c7e8512004', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('d923a452-6d47-4736-9745-fbfe2cec7885', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('099d13a0-317a-4f51-9367-ee03293519ec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Angela Turner ====================

-- Get persona_id for Dr. Angela Turner
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-angela-turner-ssml' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-angela-turner-ssml' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Angela Turner' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-angela-turner-ssml (name: Dr. Angela Turner)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-angela-turner-ssml', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('bdb39c0e-adc6-432e-9f03-4b603584aa37', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('5175f792-26a4-413e-9d89-0a6b12427c56', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('e280632c-c292-4eb7-aeb5-f6bd654c439c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('df845af4-1419-42d1-a2b6-2124af387645', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('bf706e51-06b4-4692-b27f-4e9746012fb8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('04fad9a9-5645-4fe6-82df-159f063bc593', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('2082075e-ef4d-4d98-8c62-9bef54777596', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('ad25811b-313e-42e3-a282-d515a7b85f3c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('500116be-dc44-4ea5-a048-b7e7385345b9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('da9daa33-1274-40dd-a71f-56b3e34bc94c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('a869b30e-ba90-4367-b567-d546faa112d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('e0d45669-588e-433b-b7bb-505c9114e0a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('7e860abb-bac6-4398-8c52-2a2dabd3606b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('604d4a01-f147-4d82-81ee-090b33250578', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f61dc59d-7566-4f5a-ac4f-d30b0c964516', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('67d3e283-6263-4306-aa20-655ea251c582', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c2717128-41a2-48b9-8827-953bcacc601d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('ec36b8c8-62ea-4deb-80c8-f42a2ad5da5e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('69e98b4d-8eff-4f19-86a6-275a58473748', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('1c821877-21cf-4a82-9ac0-3dc451175493', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('911f03a9-eeea-4387-8d1d-6a1bd28100f8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('05f5d084-da0c-47bd-aa11-823a95603c22', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('2cff6841-2515-4536-a25e-3a37bbbd4966', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a0eb5a39-6801-4135-96a1-1bcbbb972fe2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('047b8663-6c05-4882-a17a-e224a0fb64e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('17c50b8c-bbd3-46cf-ab82-7cf4b32295cf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('88285b32-7d51-4851-bb64-14764cdb5219', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('96b68a8b-4be8-4a54-8232-c9d7f6d4ae5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('13f9c9e8-2550-48b3-99c3-0557d0d6d7c5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2290b7b5-90d7-4330-94a5-2c64d68ad83e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1932778e-5534-4c5d-b883-a9d972340847', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('0bc5f174-9b85-463c-b0c7-583615039ee9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('7ac026db-a74c-4ca1-a91d-7ac069ed6add', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('8da0f3b4-3c4e-453a-8edb-edbdf1fe6de4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('cd38832a-9c34-4567-b7d5-9d5c457b784c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5c8d2cd5-b943-4bd2-a98b-1d5e11b8707f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('09f5c34f-2229-4e65-a2be-6ca810298bfb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('c361723d-ff36-44df-b7f0-50d15cb10e34', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('fbd62bf4-4c25-42d7-9643-2b61b4af4dd1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('0fd04ed2-18b4-4d4f-9ebe-ef38ff23cd86', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('415a064a-134c-4a1d-b290-5a2ba96c5dcc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('a7167876-4fb4-4f8d-a3f0-0cf92c3984a2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('676a4820-86fb-407c-9ecb-dacc572902fa', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('298e16a8-89a3-4612-892b-5cdca049944b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8f111cb4-0194-45eb-b1cd-ed2d456ccb28', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2b0dbff5-44ba-4ba8-8b83-46f72b4c4ddb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('108deb0d-7e14-4051-afdd-c4c9cee05109', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Sarah Mitchell ====================

-- Get persona_id for Sarah Mitchell
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'sarah-mitchell-macl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-sarah-mitchell-macl' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Sarah Mitchell' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: sarah-mitchell-macl (name: Sarah Mitchell)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('sarah-mitchell-macl', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('b4507069-158b-4052-a29d-fa54260f241f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('daf43417-4907-4fa6-aa04-22b2932fece6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('9b438a55-f61f-4bc2-b6f3-d968ebace4ce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('63bb3bae-ecd9-4847-8f52-6bc10ea1bc73', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('3448c62f-b8a6-415e-997f-1cd9b9f3db48', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('7b91eed0-2cee-4c7d-adc2-d56476720b4b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('3efe1ece-563e-4f19-83f2-01a79a77eebe', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('2b1f9298-34f4-43c1-85a2-41a04e1ab923', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('e13a9d03-f4a8-43c1-a9f7-328462335919', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('f111b6e0-3289-4f49-ae6c-16fcd18e582b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('726cd60e-9870-4844-8b23-c3b45c8da96c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('180012e7-a64a-4a2f-aa58-6c6a66d1fcf3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('c289e8e2-3975-46f0-b743-314dffb02ed4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('411f50e6-4934-4de3-996d-3d88a688718c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('25447c7a-08d5-4a50-b543-53a10674a335', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('5ceec130-bb93-4352-b383-d08a5ee7b25e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('bc4db201-1436-4ed4-902a-b1a8a106c21b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('95a92dc1-ef9c-439b-af2d-309fd51c0a8c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('ef6ff98b-1b2e-4d4c-9c53-df9237be5316', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('546fc149-f365-4b92-9e8b-306d02d48d4c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('3453ca07-b23a-45e0-bbde-89a80fee8453', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('9e53e764-f212-42f5-a195-f67093ad45a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('5b82c53f-ade4-45b2-9de1-48ce1142d6e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b8afb796-3e0b-43f6-89d2-a989990a3618', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('e7ffff7e-5a88-42e4-98fd-f0d0c67d427b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6fa9aadc-98ee-4300-8626-aac0b72c95bd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('eaaa53ad-8eb0-4422-b230-392eae4dc826', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('0464893b-4117-4698-8ee4-cb4b78697a7f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('2c7231b7-28f7-4de6-9e9f-838e08c404c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('ecf27735-81d3-463c-9958-5c1f2d57826c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('75e4ef36-5eaa-4fae-96fa-feffe1f8cdb9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('95e318a8-8f4a-4e7f-84ca-183daf2ba907', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('0ebaaf51-d9a2-4b0c-9621-82827578f416', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('8e919773-e607-48ab-b640-bbe09c93abfa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('ca631c8e-1751-4d21-911d-6c5163da7418', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8c7a3aff-76b3-416d-98aa-9fa91cfe5086', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('8ee5903f-25f8-46f4-a52a-e00689907222', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('316c5004-9f59-40cb-bdfe-cb5c9a4a3c4a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('b81a5518-f768-4e6d-84fd-f5e6cc70e7dd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('79661ec5-7042-4e8b-8f4c-62185c719645', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('21ef3646-6728-4b7a-ba26-9ff57e4396fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('44a0e23c-8201-4481-9ed4-217086c34896', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9667d2b8-a6f6-4c08-aef7-f3e18e33cc2d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9f5afa2f-332e-41e6-9329-7e8569461064', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('47f74e81-cfa3-451a-8584-415dfd9e0605', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('bf28ed39-db7a-4cad-a1f3-3a37a4b91614', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('e4c1264b-7bf1-4352-9d65-dd90e7b69e04', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Elizabeth Collins ====================

-- Get persona_id for Dr. Elizabeth Collins
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-elizabeth-collins-hme' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-elizabeth-collins-hme' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Elizabeth Collins' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-elizabeth-collins-hme (name: Dr. Elizabeth Collins)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-elizabeth-collins-hme', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('72e519fa-161d-4520-b51e-0cb1ce56333a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('d78d31bc-10a4-4e6a-b7f6-e01779b60823', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('5f28b414-bbdc-4057-bf31-04a0abb5f0bf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('a09d3c8b-5b6c-4837-8e18-0ca2b03edb0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('0fe21065-8dbd-4559-bffc-3b336b5d72a6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a6819edc-f0e9-45c2-93f2-17c64f474025', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('ca203571-d480-4ead-a207-8157f36eeafa', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('27db40a1-5ae3-422c-ba94-1631543711b8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('c1557593-c6fe-442b-aa8b-6f3e7f1cb1cf', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('371c5d9a-9e3c-4074-83e7-4eba5744117b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('561a72ba-45d2-4573-aa08-73ffe33d8704', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('e44740a2-5d60-4717-a10c-9f8bd3736919', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('56328b0f-66c0-4940-8c73-1fa99fc555eb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b244422b-805f-4d46-8403-ff510a736c83', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b5d26686-ffef-4af8-be70-1bea9a35ebe7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('94470da4-b891-4cf8-8462-4aeedd647483', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7bdb67d9-4bb0-4c4f-8375-6f48a7c3f683', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('84e30483-f0f5-4197-8679-9e668d6bcd72', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a8b33f31-570f-490c-9852-80182aa7e972', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('eb866df0-232f-4a7c-a106-e59e3532a247', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('58133d45-198b-47a3-944b-b7d904497585', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('d3c98757-37d3-4f9d-8003-a98cf1d57c42', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('1e30207b-6b88-41ef-9ad5-0c12186cc2c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6e8b40e5-125b-46af-ab34-f0791d368ea0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('bfa328fb-bc4a-44c4-8450-e3c5ee389fc8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('23517347-7fdf-444f-bdb1-1ab86b88e43b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('2203e96b-3e14-4bf0-aeb3-3912f8d007ec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('90e0a1be-fc86-44e5-8823-4f407014aebf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('de221a81-1c64-4870-8ecb-fcf3dcb7cab6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('6dc71d88-91da-485e-b7e7-1c7da481e3c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7b3372ae-20ed-465c-8479-9d08b371537d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('780ecb10-cf61-4007-8123-1325bb46510d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('35d01d24-2b9f-4601-91df-fa510ccbe0b4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('fb98e06f-2484-4dae-a86a-81095ae2c6f2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('f7a9393c-3d0e-421c-babe-eb042a7fbbf6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('76f62749-0685-4e04-abbd-7734358998ca', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('bf555c58-cbfe-4928-8a5b-fb2ceef9e2ad', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('64e54972-f91d-4750-a25c-22455b8be04f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('8d709ba8-0f46-4ffc-85a1-8585f518cbf6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('15d00b5b-a3da-4dc8-b868-945aa990d69d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('1f80ab52-7b8a-4d57-ad6e-740d8d798c5a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('660eede9-aa53-45cf-9c7a-d59a27776172', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('6e5e74ac-6002-4231-a41d-df46f92a0546', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8a3d32e6-31f0-4a33-a019-cbf4b5503347', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('15c11c78-6f16-4daa-8735-bbca4809e87c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2f9acb28-3460-4412-b289-2a2b524a0394', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('178b13d8-1634-4dc3-93c1-8634cfb4ed78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Linda Stewart ====================

-- Get persona_id for Linda Stewart
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'linda-stewart-mcm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-linda-stewart-mcm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Linda Stewart' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: linda-stewart-mcm (name: Linda Stewart)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('linda-stewart-mcm', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('4ef2530a-2ee2-4964-90a3-2dc394000fd0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('5eaa95df-e10c-4e45-b25d-14d899ee8f5a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('5e05b05d-1925-4748-b768-25b3c096e2c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('f590807f-d9aa-4a19-90b6-ac2173a0a888', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('14997066-c06d-4f91-bdba-a4267f22514e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('be500fde-fd96-4cc9-9d2b-29a54026875c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('58e9c7ac-9d7d-4a15-9e15-6c999c91e774', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('1f582631-12d6-42fb-9aa0-2caa44092aae', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('73218730-f72a-4720-b9ea-15d5891db45a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('e6091238-bc22-4eeb-bcf0-5e167f8854ac', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('74611300-326b-4421-bbfc-82b4fabc1420', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('f5b59af5-bc39-4c42-bc4f-5da4bf6879f3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('790d40d2-7865-4f23-ae1b-9330e96e6910', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('08a18a46-382e-4c32-82ff-399470f97a92', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('844ebe9d-1d0c-4946-b159-3a245adaceda', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('1935b7ba-ca71-4703-aac6-6053301754a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('b51cd4b0-96b0-4a53-b1eb-0a4e9d2f97ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('6a7c77c3-3378-4934-adab-97b658006d93', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('2addb0a8-f308-466a-9deb-64b453e6f8c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('e727b7cd-a125-4199-a5f4-f4244666fa91', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('708ab4ea-3f03-4db2-a88c-480c0eca5ea1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('7c5c716c-1425-4dc9-bb7d-a67d6876b4f8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('3be53e2a-7106-4785-bddb-ee3b0f9057e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('04648c19-fc52-4792-8489-2f5543770702', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('957a02a2-f258-4798-9189-2ed91591cf57', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8e6a6dd4-aa0f-41e9-832c-81a21a385ff5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('518a6638-b056-4393-9ff7-597aead152f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('eb984123-2487-4332-8573-176d85e3ef1b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('25cb532c-dcee-4200-93f7-48f9079a5d17', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('0d6154ec-49e9-417f-88e5-22acbd430aac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('30ac8713-14da-43a6-9dcb-06fd37af32fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('14e1e78e-67b1-4e8f-9485-ee2d9d1f6f57', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a1239c0d-47cf-4c88-91a1-7d540dac8066', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('8072e0e1-3a3c-4e45-87e4-73a4ee748675', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('7929b0ae-825c-429c-9b1e-8cf37d6f5c5d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('382bc394-e951-4f7a-8622-aecbf0cad5c9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('002a6185-bd71-4444-bb78-f3000128b5fa', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('200fea12-88db-4785-935d-10e8a09b86c2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('ee0f54d9-332a-4827-ba60-619c10d12186', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('2ed69e4d-53db-4a15-9b26-5b4975fa788d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('74f62a76-dda1-4dc3-a2ca-102b2aabea86', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('eae60927-b7d3-4933-b32d-4bb5552aef66', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('dc8c590a-3034-406d-afe5-6da79d837ef8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('6ba7f1a5-62ee-489f-960c-33f282c23e77', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('62454402-81e4-45ab-9409-b29f9bdad0fa', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('d39b60f8-4973-4773-848c-fbd1b5905206', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('b737c726-5373-495a-9d2f-49cf6eb1ecb6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Robert Martinez ====================

-- Get persona_id for Robert Martinez
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'robert-martinez-mqm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-robert-martinez-mqm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Robert Martinez' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: robert-martinez-mqm (name: Robert Martinez)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('robert-martinez-mqm', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('5450569b-12ae-4076-9391-32aa19ef56ab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('2acfae3c-1def-4759-a748-96526ca93a37', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('c92d49ec-44f1-4a73-ac51-0ce0b064ff5d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('c1418b03-c6cd-4381-8330-72d52955f653', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('df8209fc-ecd9-4898-9957-9f40076811f9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('d1fe21d8-4429-4a39-ac07-b769dad51351', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('e2e47769-2552-41fe-9ff5-51ac2d2278f7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('ecf3ed04-ce28-4a49-b76d-9fe50c31c99d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('892951c5-186c-4cf3-b7de-a503727e5417', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ef68fc40-a3c9-4175-9f0a-b6e1a022dfdd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('4ff36b2a-6b93-44a5-bbe1-d272e91ed45c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('434d14d2-7d2a-4350-8ce8-8799883d961f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('95d2611a-bfc8-4a4f-ad44-483038a9b382', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('437b041f-84bd-434f-8b6b-b21623056bc2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d3dfacc2-439d-4ee6-b436-5453cff3a3d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('f177c19a-880d-470d-995c-c7c373a9caf3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('b0c8c1bd-fa79-4c81-a4f8-6440f7dd760b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('cba94275-8cb7-4a9a-85a4-f18deaa4e87d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('04566fb7-c851-49ff-81d8-795f7e2298e8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('42676954-1b9b-4aba-8a26-f0c236a4e802', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('3512bea9-1ba0-435a-92ba-208584fe931b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6e7fc3e9-895b-4fb0-9dd3-94572d55710b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('339c4b8f-aab0-4d75-b728-bc3992f705cc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a784cbf5-cac1-43dd-9c85-716a58530420', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0be72cc5-a316-41f7-802c-b1b5e3c822e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('2630b2b3-2869-4dda-bc83-f40c43acd1f6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d0fd1f7e-694a-452f-982e-6ffc2f9332cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('89924f78-5c8c-4204-83ab-6f1c6cbcc72b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('a597defd-7ae9-408d-a18c-a05d0d237909', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c3ae38b0-c2dd-4081-8e66-471584806007', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('52bbf1d3-ccc0-4f3b-b44b-7c298f844999', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('815d3f22-ee12-46b8-9eb0-0043638b2e32', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('727065a5-6ef1-4164-bc4a-9052e6237780', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('272c3550-4c9a-4cf0-9440-deecdb47b72c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('4cc30888-cbe0-4f98-a0f8-bed8f7c3e17c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('52ea94a7-1422-4d18-892a-b6b8b3c18574', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('446ac93c-d68c-4fb9-9114-e22a0093579d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('0c785f21-02c8-4cf6-bb4f-7b78fae540a3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('43179e35-a579-49d6-9ca0-319bf665ed97', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('85dc614b-b64f-4a73-a1ff-a1d3adf0ef6b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('13e3b1ed-6986-4cb7-9b6a-bbc98c6ddae5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('edbb69d6-6c5f-4bec-8d77-503f500ba66b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8d437205-2f4f-4b66-a389-e384ff3c2f65', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('d97a4c32-11a7-4694-8ca7-281ee2546e88', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4df34c93-3df7-40bf-a826-c2e2f9a6fcbc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('6018528f-0516-4cbf-af89-01d568b40b1d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('58b10623-bbeb-4846-95ac-924dca2a9611', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Jennifer Green ====================

-- Get persona_id for Jennifer Green
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'jennifer-green-mtm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-jennifer-green-mtm' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Jennifer Green' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: jennifer-green-mtm (name: Jennifer Green)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('jennifer-green-mtm', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('c6b3bc96-36b7-414b-9bc5-f326ba20919e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ffe6c6f6-e800-4308-b3ed-52c6b4db929a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('df8209b9-93c0-4102-998d-c782c8ed2eed', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('e51144af-d0da-4dda-be4e-a87bb510e422', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('51f49029-29b6-4d66-be9e-3aa798b9a944', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('28fed9dc-6d12-4bae-b55e-5e8b91154772', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('2d3a666c-5215-4f3a-968a-fcf159b99940', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('d8f2df8e-25ee-419d-af69-f694a9009d93', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('2f1c2511-c3aa-40b8-8898-ff2bc8bdbcab', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('05685060-6f60-418a-babf-e3bfe3e838f1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('4259dde6-7325-4a41-becd-74b7125d3f72', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('6d949edc-a91e-42e8-b7c9-b3c16257710f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('0a74a4b4-35ef-4d8e-b28b-edf6dfb0423d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('3f75d5ed-a71d-4230-bc92-6750d1f4bdd4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7a5ad6b9-051d-421d-8abc-3cbc617ee03f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7b384f42-60fd-46c0-b293-9038cbcfda66', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('86adae4f-590a-4d0a-9482-39fcbb7cd2e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('fddd5bb0-a5e8-47a9-b35a-dcd05515ff21', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('7a4a36ba-710f-4073-9971-6961cd53614e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('bc0db5b9-6fd9-400f-bcd8-fe0a7ad9ed8b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('5f183c1e-293e-41eb-961a-4664890b17ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('26920d71-7cbd-4502-8284-db6a53d24dbe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('9adee1ab-4fc3-443d-aa55-d5b5f6f55229', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1e1c3499-b16e-4484-8b02-a61db28675c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('2eb935c8-4d36-48ba-887e-8fa30467edc5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('08e2390e-fa2b-40cb-80b4-95a3525d67e8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6a223360-76f1-41bc-b559-29e264971c06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d0309cc9-9498-464a-95cd-92b23d2942b5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('0b650d37-f8e2-46fd-af3a-65789fa368f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('8ff9f796-b943-42f8-9b50-3f6318dfe027', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2699e7c4-4a53-45fe-a920-79ad86217880', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('85086e29-a004-405d-9b61-ea41809c891b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('f8f99ef9-f07a-4ca4-ad0f-2bc6a2509647', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a0ff5ca0-23b6-48d2-a4eb-d24d9272feb7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('432b7b66-8d6c-4376-a343-57896d6dfca1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a9a2bf5b-59d3-4953-80e0-693997a24bd5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('9e473417-6e03-4b89-877e-4ca6e39a0111', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('87f0b2dc-12d5-4439-8afc-101a9abb1ad1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('26e67ba3-5519-4d9f-b8b1-c36b04b253bd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('8da8504f-e763-498c-9839-f6eb990aa5e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('a4b57e26-f1e1-40a0-8fee-79135decd6ee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('9679a20a-a91a-4b81-8669-bf567552db4f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0b0ee707-b6b6-4940-afc7-02ceea71bd66', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8de76b2a-ff1c-42e7-b8f5-e32833e90c73', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('60497086-27c4-46ad-8253-24cc6d804fa6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('c5b6cb83-bc24-4f4d-a8af-59ad6a49b087', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('f2e1c79b-bd19-4e77-83b7-3b6bbbc6d59b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. William Baker ====================

-- Get persona_id for Dr. William Baker
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-william-baker-hms' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-william-baker-hms' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. William Baker' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-william-baker-hms (name: Dr. William Baker)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-william-baker-hms', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('6485bae3-28a3-4233-ab36-eac35cceff29', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('565a2a5e-ea24-44cf-be3d-b702e11e6862', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('61a73197-03aa-40b7-9919-c9c182b6b02e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('0ae81313-09ad-40e8-8662-d6fb4161fe75', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('cd23bc2e-428f-433b-848f-9eda626684a8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('a8467116-4a3e-400d-b5ed-8f11a4c27fd3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('2ce29ae2-046a-4364-b146-afcac6869dde', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a8689be6-37bc-436a-923a-88d15d39c483', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('e9dbe862-756a-4393-a4e5-ce1fed39048e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('7338f325-64fa-4969-b44e-1eb901961d65', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ab22ebba-b0da-4f47-9213-682c383b70ca', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('10132045-748a-4bdf-9a1a-4aed707df69a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('5e5a8a41-57f1-43fc-afb6-731f4221c24c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('15f91709-f875-4f46-ba65-053a534b31f2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('ca39ebfb-433c-4fcc-899b-a559b8575eb8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('0162efa9-57fc-47ac-943f-484083666ca1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('8ee43d8b-4f80-476e-b81d-b5dc9783f317', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('245fe307-eb53-493a-8c36-e1c676460de0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('12b0d3fe-997e-41af-801d-1322bb5f61c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('44b0e295-1312-4cc0-8131-a9fc8a862343', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('8f2b0cd2-f002-4eb2-9816-6c439ed4a2b0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('f1e99990-5b87-4f03-a42c-901cfe415c06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('4564fd64-eb80-49fa-a1b1-4d1cd16f1c17', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('ffeff1b5-08d5-4189-aa5b-5ec3db6c0909', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('3f8ccbab-b66a-42a3-8aec-e3c507c05bd5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('1552b330-7cb2-40a2-b7b6-776765a7d1f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6f5ff098-08fb-4607-a55d-fb624cb9a7c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('a6f34f1d-6243-4c79-bd69-5334c4aef0b0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1f3facd6-45da-40d0-9541-98a2ebbe4db9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8010b56b-bbb8-464d-bcc1-89ff038d970f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7a3f0b89-3763-4ffb-a295-1b28649152b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('44295299-7792-4691-9b48-d84027b81df1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('5ae8dc59-a45b-44d4-875b-c8f289cea8ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('3c28a0c8-838e-407a-b09e-d6d1df393964', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('a4f0fe65-0df9-42c5-93ea-b851cb295e1a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('772fcd9a-ef68-4742-aa51-d4788780a554', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2c864276-d95b-41ed-81db-aa97059b316d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('afb8fa86-c8d9-4499-951d-3814bd5046cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('e55ba30f-acd2-4319-9c09-2316865c4206', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('342701d7-093d-41c2-b9b1-f8dd3d2f567d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('94298681-8bfc-457a-a34b-bff3fc75f50f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('c67cce77-0b5e-41ad-94f2-ce7668a28f15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('3d7d0bef-0512-4e0a-8a0a-4e4491a9b9cc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('845730d5-b508-4787-a0d6-d81b440e6bd1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('4c3970df-2f85-403d-b354-56c00e57f6b5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('579114d9-cb9e-4e8d-be62-02d1a0e47e9c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('85094788-ded5-4b2d-b974-e71b6763fbf6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('efeae49d-fd99-4342-8941-ce541742d75f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0c138711-bce4-466c-81d7-fb34a7074694', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('5631b78b-7969-42d9-a5ca-5463e816f3a3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('2d28962e-bd56-4a3c-b968-053e7fb53021', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('59ed92fc-5ed7-4cc5-b263-fe59015e15a0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('a0938612-0616-4fe2-b718-145e8610ce06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Michelle Torres ====================

-- Get persona_id for Michelle Torres
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'michelle-torres-mom' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-michelle-torres-mom' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Michelle Torres' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: michelle-torres-mom (name: Michelle Torres)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('michelle-torres-mom', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('aee45299-5c59-4028-886c-915f6c2fcea3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('90963b20-40aa-4d96-a8a4-313c2f6db60a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('0f668441-deb3-4706-b82f-1ba5755a17bd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('2ea6538f-fd82-4dd3-8ca0-65444a1f3a05', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('7ebc0234-0319-4528-b3c9-cff2027289ee', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5c250391-729a-4e35-b8ca-1f52726f92da', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('1a7c1924-2a9e-4a6c-ba0c-a191db240fbb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('5cb2eb82-1d56-4e7f-ac9e-d4e09e1aca61', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('4590ea0a-84b7-41f3-b075-c888e2d87129', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('bc64caf0-4010-42a8-85e3-6f4944437f11', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('b8155d82-938d-47ed-a6ef-e86da30a39bd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('e01150dc-3113-4b0b-98a7-3f5f513b06c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('b0d53ddc-123c-475e-97c1-dff1bb92422f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('ee0673e8-5370-4ad4-85b8-e1d74c4d26e1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('55c14537-7978-46c2-8fa2-290aff374f1f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('3e36fcc1-3df2-4b97-9069-9bb80c2f1e43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('a8833c7a-8636-499d-87b4-830bd167d326', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('cfbdfaa0-7383-4907-a42c-6bfb00037b00', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('08e9dd56-a8f4-4b3d-b3a3-711f00c3a122', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('4d234920-3235-4504-afe4-b4ce56fca89a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('dd71a3bc-0a2c-4b36-9063-9d200928b877', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('32025c4e-2e5e-4664-bffc-88655db8a86c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('4979a4b3-1950-49fa-ae53-b5d873a587ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('633ce645-c62b-4b48-9f68-c3d6d19583a8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1ef7e12d-980d-446b-888e-a59eaca23f94', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3525bb32-4fee-4ea0-8163-efdf44023e9b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c9b01924-853a-49fa-8be5-d6e0c5856e70', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('25f69e74-4563-47f1-a095-04f2d4c6d163', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('55a0c8e2-fe77-4f02-aa83-f54070decaf0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2dfd448f-0c40-436c-8173-d3bfc5f78a15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('6105a9e4-c998-4601-b2a3-ca46c6315995', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('daf376df-9b6a-4cc2-a916-7faad63d1169', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('686222a0-180e-4900-8524-778de5e4d99e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a31e3039-babf-4d6c-bf18-1992bd8a9672', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a203d2bb-bfbf-4d36-aa6e-be9a52b55a81', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('0983d65f-961b-45ae-8b0b-68e712721394', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('fcfc6cb8-95fa-40d5-bfba-7a8ee9826662', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('5701ed02-c8e9-488f-801f-2245b02203bd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('ac3f863e-b0f1-4446-be13-0bc05db42732', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('cdd931c4-d7eb-495b-b2e0-299a3563cead', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('4d7b26ef-4c31-478f-ad7b-47a3f2cb641e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('e9c10c20-2457-4a04-a875-b671241effa9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b96ca6ad-c6e4-47c3-b170-7a56007704e0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('379f3f53-10ad-445c-9aa1-6688ce2ab2e7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('68554b25-c393-4295-9476-5f8d3a809d46', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('68e9fe21-3698-42eb-82a4-bba7ce80797f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('699f7e4b-f33b-4563-ba26-c793dba3fc99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Kevin Nguyen ====================

-- Get persona_id for Dr. Kevin Nguyen
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-kevin-nguyen-mam' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-kevin-nguyen-mam' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Kevin Nguyen' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-kevin-nguyen-mam (name: Dr. Kevin Nguyen)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-kevin-nguyen-mam', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('c759b541-6672-4fae-b929-5fddc0dd0eb7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('93c4d377-9c93-44dc-b9db-eb91c3eaaa0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('1940c0e4-687b-4c21-801e-4d71c3655a60', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('5af2a19e-a0fa-4641-84ee-7a68c5cb0884', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('30ceff0f-ce7a-4100-bab5-6b225ac6b7ba', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ef271ec0-31fb-489e-aeed-041e4248a9b9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('02905010-adf0-4769-a093-5fd10e95c906', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('a379b19c-0b3e-47e7-b252-88318b526f57', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('5e63a1f4-01b5-4a2b-a33d-5d59faec09b7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('c8957af5-a3da-4be0-8c59-ca50d8be4c6c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('a17767f9-295b-4d28-997c-48f0f60f42f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('564a5a94-10c5-4d15-b8b9-6e7c7e00e033', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('10cd046b-b65c-48d5-bdf7-a1a9b120a896', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('cfa1f6b7-4d97-406b-9bd2-e947ac7ac069', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('c6b35892-c89a-499f-9947-91e88ee45e32', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('f317b37b-4ac3-4b2d-ae35-c8da09617b2e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('13456027-396e-4fca-a8ac-a5e32e30fa28', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('e79f814c-6280-4641-a862-ce2b41c67ee2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('c242addd-89d1-454d-b335-15d1dc30965a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('ec484737-40de-4f4a-89b4-33d7f9c1694c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('bf723086-fef3-41c3-9d38-b27292cb179d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('e2b3a12b-7d90-4c84-bac4-e0c218d06195', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('743a1f9e-6322-4d73-becb-030a34915f4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('17e8a8e6-f840-41cc-925e-a43109e54998', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('45b2f3a4-190c-47e6-933a-13be85594c59', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d8b7b21a-a87a-4a57-966c-aea3689e3dd9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('bc355e26-57fb-4b6e-b9d8-df5fbdcda3a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c4cce46a-83c9-41b7-a7bf-33550892c03c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('04be7b5f-3bbf-4ab9-b3a9-1f48440f4ce4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2ef18c62-0ce9-4d08-baeb-2bbb61715a87', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2f20929e-5160-44cb-9855-7d55f1fb8ac7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('dc53fab0-a804-4027-9bc4-3232270dc470', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('12b0235e-fcd3-43d7-bf2d-a8c4f22c7651', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('0c8a0646-935c-4db9-acdc-5f9177e188d5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('70b9c8df-e7dc-4c20-a58c-a03c6e1ff431', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('0819c8b7-04ba-45c8-ac61-6b20a46416fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('73da6386-cf10-450c-ab6d-bc3362607adb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('646b78bc-62cf-4b02-9bf7-de2140c2dacd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('b3252aa2-4b85-4ad3-a293-0093eb06463e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('6bb1ae94-e786-493c-9e2f-dc3769d960e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('6f53bde3-2a55-452c-b000-7ccfec63bde2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('3fab2f58-689b-42b3-89f5-7fb79962083f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('1d1ce6eb-e7c3-46bf-95a6-bd9331d0cb30', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('16151d13-0b71-464f-ac6f-0f8d6a8bfd8f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b8ecd8ae-01c8-4687-a97f-64b4781127f4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('e81bd433-009f-44d7-89ec-c58c45bdbb1a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('c2661e48-403d-47de-81ec-19deb219a5ac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== Dr. Sophia Anderson ====================

-- Get persona_id for Dr. Sophia Anderson
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = 'dr-sophia-anderson-mbp' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-dr-sophia-anderson-mbp' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = 'Dr. Sophia Anderson' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: dr-sophia-anderson-mbp (name: Dr. Sophia Anderson)';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('dr-sophia-anderson-mbp', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;

-- annual_conferences -> persona_annual_conferences
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('f5b7b9ca-d981-4d86-8359-68149be6ef14', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('c714b218-5b7a-4efe-aefc-0533dff8ab62', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('a9f2b3da-b0f1-4b71-826c-c591aebe010b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('5526a386-efce-42d2-997f-422a22fd17bf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('4640bab6-e588-49ba-ac6f-8a23049f2843', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a80ff135-ff91-4011-9608-60979257d1ad', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c5103812-078e-4d76-8800-b47714fd94bb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('1a53222e-5c9b-4ed9-9ee4-88546cb2d4c1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('8c179ba7-7b7a-4196-a005-b92c18894358', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ec2fd130-e5ff-4912-b5df-c0dc61fce439', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('62cbb752-12b6-4f65-8d19-ef8dcdf7c783', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('ba021f9e-58a5-42cd-8602-6f514cb8ab4b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('06d03cff-e8e9-47f4-91cd-9836c5a80456', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('6a88ea3e-328b-480c-9ddf-fdb7010b80ac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('172d3041-a178-4449-9189-5a48b1e8ae60', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('d648e4fb-df89-4ad5-b64e-264f6e849957', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0f552eba-7a64-40b5-8bfd-ecccaebf0aab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('767621c9-c87a-4ac8-b4f0-e69ef5ef35f3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a6ed957a-cbac-42e1-9594-9c93793660af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('7a2b9d04-1e03-4044-be18-3a8092dc1830', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('c120787f-eb62-477c-8146-e99dda3b072a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('38e9fd49-2f6d-4694-abc0-724e34caaad4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('1f07e3f4-8018-4d6d-ace9-3ce9707b5abf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('80098e94-32de-4fcc-9227-f191a87b13fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ddd974de-dcbd-40ad-ae80-ac83ddef1bec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('20613c88-b928-46ba-9473-e2559fe29d46', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a150f7ad-f86f-4f7d-86ec-91a2ba232765', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('cd67bc7d-30d8-498f-82c1-a7159bac3309', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('20758822-4c3b-4a01-ad7e-1c80a35a8916', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('01af33bd-d8ed-4dc2-9286-4864aecdad18', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a9b2b5bd-cf74-48b4-9f84-d4a449805f99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('120c630c-ea61-48d4-93c9-f535a28647ed', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('64bfc08e-7404-4fc1-8be7-dd000c53fd80', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('efe5c2e7-0614-42f4-9e93-ad40f5f1ddf6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d9ae2fa0-1055-4423-a249-d441e1214597', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('874bc2d0-0e47-46e7-b567-3e2fddd3c6ae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1b8e7b89-67f6-41aa-8ee8-b39fa3b24cf0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('416ebc86-0ce6-48b8-b2cc-33f85ea5cde9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('11c8bdc1-f06a-416c-8a1f-43b497efff91', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('20d42dd1-acd8-4f27-9d38-af361f926931', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('a54dd3e3-531f-48c6-9e49-e8b19d24573d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('8afc6f55-0acc-4a8a-bcbb-d43b91422a8a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('7da5a4c2-eed7-4f65-a2eb-e3be94be4f35', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('08fe96f2-43c1-4863-bf4c-493c4cb23240', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('1b51dad5-86d1-4cc7-96be-8f75a869454a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('d8e2b112-34ab-4173-9b04-94bfc23501cc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2b2a86d2-e4c5-48ac-bbdd-d8486a21bbf6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Clean up temporary tables
DROP TABLE IF EXISTS temp_persona_ids;

-- Commit transaction
ROLLBACK; -- DRY RUN - No changes made

-- =====================================================
-- Deployment Complete
-- =====================================================
