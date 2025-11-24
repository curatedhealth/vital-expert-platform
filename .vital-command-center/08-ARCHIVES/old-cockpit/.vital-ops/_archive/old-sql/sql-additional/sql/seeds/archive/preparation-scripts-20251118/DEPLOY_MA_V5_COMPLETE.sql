
-- =====================================================
-- Medical Affairs Personas v5.0 Extension Deployment
-- =====================================================
-- Generated: 2025-11-17T12:13:50.996575
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
VALUES ('617ce01c-2dc7-4b0f-b641-20b2478bddc5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('92c3e315-572c-47e3-ab40-9da038747275', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('d9f92003-2de0-4bd1-8ce5-644337b6246c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('41858ba7-7b2f-448f-a94a-b1bd31d2f40b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('af821e46-f0f3-4725-9e64-ba1de1108fe5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('03679ed5-39e9-46d6-b6b7-4e562f2291a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('754ce0ea-cc8a-4710-a996-fcceca72131e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('3c14c124-fb6b-467f-88f6-4d7979f9130f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('22f0575f-489d-45ef-aeb1-c5e56f72773b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f797cf4a-736b-490b-a1ca-efe6e355ff65', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('3ad74931-b038-4e2e-abab-0d86d3febc7b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('0cfa068c-b664-47e6-a433-ed6813df6b4b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('5c0041d2-9fba-4af0-83f5-bb212873a563', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('5b1c9093-58a6-4ff5-9d19-67f5d1afa434', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('daf2e512-b281-4242-9928-b9cbf42593bd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('11203726-cd9e-4ea2-9bde-27f01dad0745', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d6a49d95-d818-47ee-b5f2-1c4e7d72aa51', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('e74d2bc6-380a-407e-8c7c-95fb8c696dca', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d3756a19-f414-4e37-8c99-5701c24369fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('45e31b88-b45c-4e71-a8aa-dc2f1d35ff5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('e6c6cf07-76c7-4272-8d3c-f6c3e6b639bf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('25b326f6-f6f2-4a56-930b-181501dc32ce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('58f442de-c793-4764-8fa9-fa51d28abae6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('5c21cd70-27c5-45b4-b1c6-7dc6440f7515', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('ae50fc2f-726d-4ca4-ac22-6564281fdb06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6c5c9061-ea1f-45d8-b08e-b1a1e612d0fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('159c0a11-fbf3-45c8-bead-3bbe086909ce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('3c04ec90-cac6-40f9-9de3-783284ab5863', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3108311d-a7a6-4104-89a1-e5ca4fce412f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0b0f8c70-62d1-4d9a-96e2-7aa7e53de28b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ce284110-fb01-4ded-b0b7-b50dbf135359', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d9ef02cc-09e6-4b91-ae63-2f5c661b66db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('8222329c-24ec-4ad2-a2ab-753b3642be78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('d9174f0c-2bb0-4832-9f16-9e4ec30b8d12', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('41ebb251-c78e-4305-8e0a-24586451d188', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('4878ff86-a254-4453-abd2-449313b85950', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('5923eb65-bb3f-41a3-be5b-0963f4f40cbe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c276e1e0-a825-4b6d-a9af-9789539832a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('4e64394f-c075-4aab-8e10-de71c07ecce1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('edbf6f16-7a72-4aca-a9e3-e8b6a4baaaa0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('61b2eb67-306c-4a6f-ab13-8ddac73532cc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('678f1d1d-724f-4308-bae3-bb4a24fac761', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('9989c1f9-6043-465c-818b-b4e8b95c858e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1999f41c-5260-4aab-8715-85e6a09fae9d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('76f24b33-58d5-4b23-acbf-baf8ca5be692', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('218ff930-cf85-4426-bb45-6a0e32a1083b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('593c4f44-8209-4881-8249-1117f406fc2c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('09d92a9d-b75d-49b2-a362-52ca6f8b13fc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('af9099c1-e6c5-4235-8ea8-877ef6d81762', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('68d65cc6-4e9c-4de3-9aff-7d2eee935748', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('428843da-40be-4b05-98f5-a9566dd95eca', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('c75f02bf-b133-4a7c-a73d-d65f7e82c164', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('a6481502-de7c-4abe-b8ad-bffb56e1d059', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sarah-chen-cmo'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('fd2a5540-eeba-4f52-b4de-9b3219cb72ac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('e05041a1-b223-4490-962c-a90375f31a6a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ed933c31-3d52-408e-8adb-bb539c37918d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('6428e8c0-d0ba-4159-9ea0-e3d0aafe0d4e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('34c850ca-4f5e-4c3f-93c7-3e84ac406bbc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('7e9737d6-05f4-4ced-b765-f3f01d0d2c33', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('97f08202-eee8-4b23-83cf-9dfc780fe2f5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('3dde8b81-40f1-465a-8937-4348daf68200', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c7e36b02-6406-4b62-b9b4-f3c1553e07b1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('b6d3bde3-f37e-499b-bb07-bff9b8c6306f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ff1cd63b-bcc1-4199-97d5-e117556b905e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('a2f9b989-8605-442c-92d1-6b25c5abff76', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('e9d38d73-58ac-4ef1-a190-8722cec5ff0e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('342ef063-e1b2-48a0-8d71-ae46753e40f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('38a2e962-fdd2-4ae1-a0ba-a14f86ebafae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f42f05ea-3c35-488d-a44d-6e36d9ccde42', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('eec81248-0536-4083-85cc-333368b67506', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('6764465d-680d-4c05-a973-dad2b7571210', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('55471038-3d1d-4885-9563-9486e5c23157', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7cc87d7e-29c4-45f6-a6cf-3c51d307423d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c390e5aa-e8ea-4b42-bfda-cddd4a752480', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('83316b79-c66e-48a7-b060-4ae8be660dc2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1ad7b560-591e-4ac4-b447-285854988889', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('cf7fc841-6673-43ff-9b33-7f6360569317', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('5f976447-2490-4f48-ada9-89e503b056ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('61dcac52-1825-4863-802d-96b5c52ee799', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('c1b93737-1645-48e0-b4cf-3eac48915d29', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('e5fc9c3d-c5dd-44b4-8482-c8bdcea2fb3d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9617141a-3094-48bf-9c8b-92fd5367ec81', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('39a3ae85-b065-4afc-8fd8-116531aa0e58', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b4a6b676-bac6-4937-a83c-433424699d11', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('61b34ced-b284-4554-aaf3-ceb96122ad06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('60530f89-328d-4839-899d-01bec0572cdf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('30140822-a1b3-4866-9207-678d38356258', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('633995dd-5ac3-44fe-946c-4515473e0f81', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a4a8a664-a0cd-44f9-83b3-403c391be807', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('9ca61d07-e643-4bcf-bc51-b006838398eb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('675fca63-fa36-4f26-9310-e73476a47c0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('8c36105f-8891-4160-b36a-5b39cc107e49', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('16ecb090-e36e-4896-99a3-d48a706a9835', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('dfca3153-364c-4fa0-ac7a-a077f8468da2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a5436985-fad2-462b-927b-f37855844446', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('84af9667-81ad-498d-81f4-6bc99dfc5124', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('f3e3bf14-625a-4293-ad80-b4dfbfa7bc05', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('7180526d-bbc1-40aa-ae69-44dc2b75f352', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('14bd9541-276b-4ef4-8eb3-7bb9ffb160af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('d0b504de-963f-43ea-a98c-5d1bff5a5711', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('501a46ec-641f-454c-8522-f5b738b6f09e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('064ef0c2-a386-49a5-8770-1f76f519165c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f869e17a-9706-40c4-a690-449c38ca74aa', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('7aba3882-d1ae-4fbc-949f-c5208ad2ecd2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7d9a5a94-991f-47ae-a8fb-884ea67d91f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('edefa2dc-75b3-489f-83fe-4c81b6bfc6e4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-michael-torres-vp-ma'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('378e3ee3-3653-4d41-b88d-66e5e0217547', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('eda85b64-7188-43b7-888a-c2ed983529aa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('d2f10435-b05a-492d-9322-a2464c77e0fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('fdcdd7b0-ce3c-456a-9204-bdaa17d3c180', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('97709c43-57a0-4df2-91a7-74f8ec257e7c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('2f9e150a-aecb-4f3d-887d-4d453b943036', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('4c053f20-3307-49e3-8146-c25b720044b2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('b0b12d79-810b-491f-a195-287c1e5e3418', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('d80d2bc0-b706-4840-a042-71b9b8a92670', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('2f32b6f2-e90a-4410-8ce9-e54aa60b1982', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('8ad044c3-0b88-4907-8544-9ccd201b8c26', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('aa7e031e-0fc0-408c-9b31-ab49894a8c90', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('0489cff5-9e5c-4213-bb8e-79fcedec685f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('94eb1f55-123d-430b-a6bb-9b79b1b6bdfd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('9de799c8-ebee-439e-8e47-1ccfbe012e3d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('d6ab5c9d-caf0-447a-ac46-75bb7a6babe1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('5acce571-b046-411b-9322-5561b20a7059', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a21bc0be-94be-4ee3-907c-f7cf23343b06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('9f8fe042-f108-45c4-98f4-e8b72b301e8f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('93d2114a-fe1c-4152-9238-5156f52293b4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('7c4c5ec7-9795-45fc-ac9c-fea58b27b3da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('b660e222-d61e-43e9-a4ee-776946eb522c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('d0833926-9bb3-4397-9b86-c0d3108134aa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b089cd25-c22e-4c09-a1b4-1764b2c85553', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('19ad3257-dcbf-4d02-86ff-b98970b631fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('95b56494-8f38-4885-a281-640e673e5732', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6cc0e2e3-6d1b-48a8-b82d-7103f600e00f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('2b1b37f7-6f34-4f16-b6ee-7205623309e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('551eacb1-0581-49f7-9e02-5281d27e609d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a74983f5-a864-4345-a425-79bcc653997b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('475c351b-d956-4b73-9611-bed38c30a057', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a65bc74b-2c67-434d-a27a-ca4192e6bef2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('dfacb95f-f43c-45b7-bb29-cb3d72e60572', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('005780d4-4210-4f95-8323-02ef257ce1e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d9554ad4-efba-4c5f-8d62-4454222314d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('726d60f3-7dda-4ced-a712-340924421fde', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('6c7c98c4-57b7-442e-a53d-5362f10b4454', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('cc01acf1-dfb6-4f6a-b997-49a34e33e8c9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('38471beb-1265-44e3-b478-543d7bc8c125', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c7123f96-9ca0-4e88-b4ba-1fcb40f67740', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('414f37b1-8b90-4d6d-9a16-3a7663efd863', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('429ae505-e15b-44cb-b0cb-e1cf8128bf30', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('83b1725f-4a80-4eb7-b83c-7eab1d3e6716', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('e99a992f-3ced-4eee-bffe-ac0e4f04193a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ac34565a-7e7c-4a3b-a448-b78bada4cf4d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('6eb3a8d0-e6d9-4417-bd8f-60072ebaee8f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('fad80f77-d118-4438-922d-80db562374ea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elena-rodriguez-md'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('18b33548-bdf6-40f5-b96e-f4734511c9e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('eb62f60a-280f-4aa4-b0ec-24fc22a97614', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('c7bfdde1-bb13-45c2-92e6-bcfce9070b6c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('f38e47ec-935f-4d5e-9d62-853bd31ba6a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('ec25bff3-dcd4-40aa-9255-94c73ccc0f1f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('fcdb802a-46ba-47d6-9039-b473ecaec06b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('4c278f72-11e4-434c-921e-9b7a8680b387', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('67286bfc-ff92-4dbc-b089-31a7723f7c26', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('3e18b5a6-4e3b-4969-a760-e95b7c7c4ea9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('446b448a-7257-454c-ad5b-d05dee4a4a24', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('1a4c922e-d683-419b-bcd8-78bf2acfe002', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('7c1ec331-2a65-47bf-8eab-3be490f26073', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('7cb57181-9fb5-4bc1-8f77-53307cebf1ba', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('47b2bee1-278f-4f38-8c8c-26044ffc2e6f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('92257d65-7d2f-47b8-9308-14498d839278', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('a8a0b358-30fa-4824-b97f-f46673e6fef2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('196f56d2-d143-4fac-ad49-7cc498586c76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('4b3e7a43-5de2-473f-a88d-860351696197', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7ee9d519-5b7e-415e-a192-6abb7d983dc5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('4ba32453-e8ae-4fe4-933c-8e3284d2633d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('1759648c-aa6e-472c-b661-963c1ad6b10e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('6f0ce5c0-81c2-4060-9e76-5b599b41272e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('80a82e7f-ced4-46ea-a24d-eef334b8470b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8bcb3b8b-5d0f-44e7-8397-94054f78b121', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f0efae89-3d58-4402-b7df-4f4a351fab34', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('316673b8-9669-4d00-8401-54b7b58e1912', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('1ce35133-3ffc-4cae-a533-72bf482c6c87', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('0bef203c-3e94-42a1-948c-a7dc38af675f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('49123860-f58e-43e2-a979-57e54fc5659f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('12546be2-6234-4a0c-9b85-123c49a1975f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('af917ee4-3117-4572-8a79-67e45232645d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('91d2c012-7b8b-4a08-8f98-7393d60e6cf8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('ba71e21f-4a70-4c23-96a8-e06777994b04', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('6cc578ba-3a9c-4e67-8e43-5701d4606bdf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('90cb47ec-6bc9-41c0-a54b-1257d70d604b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7bef2b92-b466-483c-9bab-f8dcb4d53bef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('838658b9-c640-4c2c-bd09-d5c14a0f095d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('96683cf5-1721-41d3-9e7c-509bdefddcc9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('dbef00e6-290c-4c3b-a773-752fefe9dbcb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c65e577e-8682-44c6-8501-0356b1d864a7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('2af94c5e-2f65-4654-b464-b8ba1b038c7d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('f011987e-bb9e-4258-82fd-349bac67146c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('3f2dcddd-cec2-4bf2-95aa-ed25f032d456', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('10592af8-b357-414d-9e97-e71ad3b809ec', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('93c6df35-b9f0-445b-82b0-b84a0b102f7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('740d96d5-0ac4-4667-9450-59e1669743fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('de9d782d-a7a6-4e8b-8e20-67d0d6a1eb67', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('60a598f7-2188-42c3-b656-9b4e4905d615', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('cf34fbea-d078-4983-8721-851928b98356', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('26dc65be-7068-46c1-8f8c-6b55c1aa58ed', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9f2f73bf-db8b-46ee-abd6-a99ee5b9211f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('16d21210-7607-4282-9112-4df87ea1403c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('fed51b76-e9e0-40c8-860c-a6f11a55288d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-james-patterson-hfm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('58c520bd-922f-4f41-8a9e-aeebe38b7b1b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('a314b5ba-526f-4461-9609-3a5a227ad9ae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('b5bcc0ab-181e-4303-9331-086957a34691', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('f2bc5053-b92b-4014-8691-26d4d81c52bb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('6bc199a2-3658-4a7f-8f8f-76af6e738e23', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ebe62fcf-e565-4e92-bf33-5fb61a27a16d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('4217dbf8-5cfd-4397-a9fa-59adc94bcba6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('fcaa8ee1-5925-43d5-887f-92cc2ab8f008', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('b9bb3031-3680-454f-9082-d0f96eac534d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('0c785bfd-ba08-4646-bde3-26118e2bef50', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('c05f8bcd-834b-46e3-8c93-4cf2f089ce4f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('5008903e-295a-4c61-8cec-6d92896159c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('28810ffd-14eb-4379-a42c-29904246ddf1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('5d5b9e07-86a5-4251-817f-ee0cb4396f5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('deeab98e-a16c-415a-9fd1-cb870e330286', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('a442a5b3-855b-4736-92d2-7bb65cdb2ad7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('f4b435ad-a0dc-4ed5-ab17-16dc6f6944d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a84ebb1c-98da-48c4-ad09-213c766f559b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a37855b4-8709-4e33-9fb7-579eeb49792c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('5ad2654e-55b1-4cdb-b592-822347af8baa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('cb93ca19-2f01-45a2-983d-322a9aca6d6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('feb0ba55-6601-4650-9bc2-d773a16fd6d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('c1c0a90b-ccb5-4bf3-b1c0-f939e0fad9e2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8c438dd0-0d05-4a43-8fcf-f68ec31a6630', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3caa007e-3fa1-49a6-9782-3a337ab3f624', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('87c18654-3af3-4c77-a98e-dac0650c860f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c0b669e0-2201-458a-b947-5afc8e7c437c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('7a62ba5a-79de-4d99-ab63-d9d33d666a2b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('24b1f861-4450-43cb-8af6-f884141cd224', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f6bd55ed-7cdf-4626-8b3d-30e4bbea8903', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('af5b579f-5ed7-4e82-b294-97d6a3d35804', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('767c871c-a5db-48b4-9724-6543cf085029', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('afda4a20-dab6-485e-b203-922cf6198069', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('ee404597-7503-4cf2-8275-50602b48c263', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('99e29601-b714-4dce-86ed-485120606c96', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8739db6b-f342-4e6e-8b38-222f77b5f29b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('f4c7accc-9569-437e-ba0e-f13fd2e3c579', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('0e7dfb7f-bc57-4f35-87b1-85882c931211', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('98286222-518e-4c1a-8c2a-4103ef1278fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('4d370327-2b3b-43f1-a9d5-66b14a317a73', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('5fb7ea42-6637-4d4b-b3d3-bef9f6885d7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('b6e88dae-3642-4a21-a597-da04135ccc11', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('307a5e7a-657e-40b2-9b13-c5ca7f0229b4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('6fe490ed-0168-441d-ae3b-ceeee6271d93', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('2e07e76f-6826-4760-b8e0-f282a7cc32c0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('00baccfb-cbb9-4837-b0c5-373f6b4e0441', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('74602f6e-ca38-43ea-8016-841f4332d995', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-priya-sharma-rmd'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('4ffab459-00e7-4dba-a062-53bfca70db67', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('61783b70-73ed-446f-ad2e-597167a8c337', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('60bdee50-a516-473a-b848-3f1f92d4de59', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('38d90ddf-98ad-4664-bf86-584da442a6e1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('9d2a3709-6a3c-486e-96e0-4d1b85005505', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('8a36314c-9f65-4f3b-8624-a6cbbb69f434', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('6bdadabe-92db-4af5-9f8b-3f2174b59a72', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('322ccdfa-8001-4a78-99cc-f4fcfd230eb0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('e2e2eb2c-e802-4101-b961-fb12d8ff1770', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('7f9cf989-6e1b-4631-98a0-5bf76d33648e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('6c9b4cf0-bbac-4db6-b738-16cef568681c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('1a5ab216-7925-4d62-b056-7eee5495f5e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('3f31fc0f-7c2e-406a-9ce6-265a38381680', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('db711a43-0390-4263-8233-e4a12646a6e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('452c1a05-5c1d-48ab-83d6-190506bd6689', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('01095972-eee3-4cb2-9db3-68d42183dc75', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0822a774-36a4-4383-a610-5f19a1e8651e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('8d75b1b6-4eda-44f8-9a36-093ba717a5d1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('0b53391e-ab51-42ca-9a0b-b7e1d00744a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('cf04cf7d-181a-4bd8-93a9-4a12124a6a01', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('cc9d7216-82bb-40b3-8081-42528ee0e3a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('3c16544b-f5d2-4d21-8c16-ba61d0278258', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('3735fa57-5cb8-4497-bf3d-8cb342101002', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('77513195-04d5-4e06-b67c-4347506a4964', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('76afb2f8-0922-43a2-a987-11dcab175a40', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0ebbe8f8-e024-45b0-b84e-3e7d5a1a7e54', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('cf6d7a86-7893-4e3b-9b60-27c4da73a3fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('af657ce9-e4e8-4f21-ae4e-236487451d2f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c6f87992-7e08-4e7b-bd20-adc095c6461f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a0459d27-4366-4f1c-a917-57dcc83fdcda', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d8e40c6a-3b92-45f2-a613-13b31cb95912', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f0239812-1767-485d-bc07-2011fc82e2c6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('3042d79b-f2cf-45a8-856e-28a5d057e302', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('7d9736a3-16dd-4d5b-b9da-9cc4e6938129', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('71e9c969-ebfe-4720-8abc-5e235c8fd2e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('503b6898-9328-41df-b28e-c645bdfc8f4f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('cb45e4d3-21a3-478d-8354-5c1336b48007', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('42bea94c-6c3e-4b13-808d-f4c00bf1213a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('530047c7-93e5-46f5-92c0-b9b5e02c386b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('3d2a59d7-2e8d-4451-8092-d95f018b742f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('c310d893-e51c-4117-afcb-4435737df45f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('a61d10ba-4073-45bf-ba0a-537e376f4b3f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('dc4c97c4-6e6c-4f07-8b9f-9277cecbdaf7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('52ff76af-1e28-435e-9790-12d89f024a38', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('a0ca92b0-4f0f-4b1f-9c09-a6c0c43dbcb3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('c8867b16-b377-416d-aa08-a2b9103f5ba3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7654f4b5-3567-4f34-9e50-64f0c4093109', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-robert-kim-msl-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('8c17b625-72f1-4024-8d66-ce57a2bee5a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('198a30c2-dff0-4c19-b713-2ea4d81d57f5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('5000f45f-bab4-428a-9223-f03375b29fd7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('c079688d-521c-4dc2-939d-cea47515442d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('312bf44d-dd94-48e7-9f25-e102c71e8fbe', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('9b7cfa04-8ade-4e06-967d-2c5b773e0411', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('d6328b55-35ec-4e46-b2e3-6363cf999908', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c2ae6a6a-9ff0-4b74-a6df-8b12b3b343ad', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('5052871f-a3df-4926-ba30-32b121777ece', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('2fe62359-df4a-4f7b-a773-085e299f4a17', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('ac3845cd-01e5-4a40-8606-df3d30068b5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('54609268-92bd-4ef1-8a34-b82cac8a0c4e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('415c99a6-f1d2-4d9d-9fbe-330ea16722d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('064e5c3e-5d33-4a32-8584-0e674b246eb1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('424aa142-9069-4ae1-94f4-3f3ebd2c57d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('30c074ca-4b70-4b54-9429-fc77cf272207', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('8ad26ccd-2d01-4aff-a37e-3d3917265a18', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('9172a0ec-aad0-48fd-af91-c77650f3bf97', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('7daa9aec-230a-4caa-b324-3f07b500cb74', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('afb48a4c-c430-4559-be64-0a8114cee581', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f2c4c1fe-42f3-4d43-87be-ee9f924a9212', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('a4a5df51-b001-4d09-9c6f-087e1096a081', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('8efec9ff-f4ff-42e4-8154-691202f90cb2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('56fba37b-a309-4c60-a646-f3150fc6b60f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3a9fd867-489e-48f9-ad8a-ee06f6c1261e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c106c862-0f7f-47ef-8d58-17c1fdbea3ee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f6d40d2f-189c-498e-9f6d-b93d95b143c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('60ace8a2-7665-43d6-a308-a45e503b9921', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('25880632-32d1-480d-910e-f64ba1a93380', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('6912bfc4-2a14-42e0-a673-89c0ddc4082d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('b9101969-1e9f-4144-b8d3-f0d4b61565f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('756ef780-4c3e-4133-855b-1e67a3c613fc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('66748f3b-2114-4dce-bc26-3d18da8dd660', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('e8c910bf-77ee-443f-8280-9fa5f6a65ef6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('516d0037-4f31-423e-a64f-838e4268ae0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('79b1baee-1bda-4ca3-9acb-38e78e36315d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('ccfb4cd2-df75-4a60-8496-ee476ddc946b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('2c9bc01a-d139-4f71-a93a-3cf6ece2808d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('0581c91f-980f-4225-8e45-b57305f0f26f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('49deac85-0cc2-4aef-9096-80dea4e5312a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('8fa1d4ac-97b9-45e3-80e2-21bd2cc24bfb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('bf4517f6-3aaf-4e26-ae91-e0db8c13336e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('1d671fc8-2d63-47ee-a344-f2b0a0d0d11d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('d0bd68fb-eee5-4335-a61f-c8d866348646', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4b5fdcec-a540-4e01-9795-301014bf8a91', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('59d04f0b-dbbb-4def-98f7-3bc7b3fa658a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('51cba37a-68ad-4181-89d1-d1f8cd970971', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-lisa-chang-ta-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('d290ecb2-b1ec-4fd7-b210-691851f38d94', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('efc6ce5c-fbf4-443b-9a9f-b0602cf5d71c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('1d23b538-db28-4a1d-bcd9-4f9e021f7c0e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('c22b905a-8bfe-4ca9-80b8-1681f8d401e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('dd7c1cfe-0043-4b79-b824-eceedcb0afee', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('2e31f78c-2588-4bba-be24-77d89f92bdbb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f7504063-81c7-4d55-aacc-97e5b492817c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('cba53cb5-5b0d-4753-b68f-e47ab90253e9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('972d2e92-db51-4521-b212-4588a4e784cd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('e124fb31-6a2c-4bd7-be15-9c64888783c7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('208a4d37-f70a-4d43-b4f0-54abbfeb3f43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('b60a4a40-1748-4628-afe4-983f2d055421', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('2795bfe5-6a33-401f-9c5e-4bdcafe03344', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('58817c3e-7814-4217-bf5c-df4f7afc70dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('3a625eda-e9bb-4b88-8a0e-b07f125e8819', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('a76fbbbd-6886-48cb-bc80-64a264139bc7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('e8f62239-eb84-427f-b6da-8712ce38e7ea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('efef4b43-c211-481f-aa74-13d2c7d3d129', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('a06d24c7-1a9d-4119-91e1-72fd80d27928', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6fef3fc3-62ef-48b0-911f-82a3853855e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f5cad6ef-81aa-4e0c-8225-c702199f691e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('99a4503b-5afc-4ad9-9ef6-6941ea8a3bd4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('40b1af25-e8b7-4a61-803f-bb47abc61715', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c8a301c0-7ee4-409c-a782-96f3e4ddbd77', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b56ebd99-ef6c-4872-aa5b-d42560c62f90', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('cff91870-84a5-460a-aee4-2aadc88bce2e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('21ff896a-47fa-4696-8bb2-f65ca0968133', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('837917c6-e558-4c84-bfdf-2ca59d6123e6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('460311d3-7814-48ca-8106-c71e05e5f234', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('804c609c-a9fd-4a79-a044-1c14992bc797', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('47678ca3-24fe-4c74-827e-ef7641d4feef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7b6524e8-74a9-4d6c-bd2c-aceca728cedd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d2e196fc-1c50-4d8f-a8e6-84fa2ca6339f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c09cd695-072e-40cd-8d09-773e20a9bafc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('be1265bd-e74b-4119-aadf-9de4b0b04dba', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('ebdac0cb-12b6-4860-be44-6df131f853f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('4acef76e-fd07-4ad8-befa-a48c9c29dbec', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('6f5c4082-d318-4de5-a0ff-f19664d00af9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('4fc31711-3ae5-45b5-a91c-09c3586275af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('13d003b7-2d5d-4e6e-a183-fc7e0b034c0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('751027c1-ab82-4533-be4f-88a4331b4013', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('67b8c51b-30d5-428e-94e7-74ffdcd391dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f6e76dfa-403e-4e77-b44e-05c6e2dfcbc4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('e0e2dee2-931b-4b60-bbbc-a6cfdd4bbf34', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0e6696d8-e8c4-4816-87e1-e92a9a0d5666', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('4f11ed98-9e00-4c3d-9e32-89c87469fa54', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('3fa888e8-fe6d-47ad-b70f-3c67c6dcabf3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-marcus-johnson-sr-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('43a02a2b-14dd-44e8-adb8-2056f9d75fdf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('7cfaac82-ad36-4b99-903b-6931bcbeca76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('4fd3f27d-7657-44a2-80fa-6eb69c1e4a99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('e9781874-3a1a-4679-947d-3587ce1159ee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('d12f0b30-241e-4bac-a0af-a9c9cf55141b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('db2efd64-a17b-4cfb-8081-047072e78a7d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('0f1e1af7-41e7-40e6-82d0-eb31573efcc3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('0e3b2bee-4cc7-4ac3-b15c-c4173136d268', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('1f6bfdc7-cd5f-4ccb-a6b1-92ef7a65c8a8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('dd24cc65-4133-4794-a84c-740fee6eb9a8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('722ab657-b536-48e6-bf72-e6d4e6fa3c85', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('ee273296-f5cc-4d4d-9c12-8174c318a1d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('a4a35ecf-7d19-42cb-8a3a-e8a22ef80e49', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('e4c92e4f-e85f-478c-927a-d38ac2910977', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d7fb892c-62d6-4bf6-b096-c6a892e80036', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('706624eb-8167-434e-bc2d-fd573ba19412', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('85ff29fc-7055-4d2d-a10b-46e6e976859c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('2a6cef5b-7115-494d-9f83-d4e509ff7a9d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('f57d3c9a-5918-4ec1-8240-dadeddf7a9cb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('722978d7-909e-462d-87e3-0d03c398a7a8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('17717658-62e0-421d-80d8-4e31b9b69dba', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('2a730fff-e547-41ac-bed3-d1a639de7751', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('4042098f-4c24-4498-9136-58a2c79b6ccc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('dbf18a51-c436-4b79-bca4-58fc79ba3660', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f0ba5e8c-aef0-49a7-93f1-a40efcbb6883', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0a4b74d0-e06e-4174-8208-1276f82d7929', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('37bdfef6-07e9-416b-a44f-29130f8f8939', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('f25a1c1a-c9bc-4ac1-8ae0-66e08672e4d4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('4f4b36c1-1883-4b71-b349-4906b6e751f8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('e1f984f8-3659-4792-a47e-3d250102ea03', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('79f7bcd7-5911-4797-9c22-285c16fb62f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('871638d4-7bb4-4d51-8d67-b435df48a7f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c1818f14-1b98-4e53-8cc0-cdf30cc52ccd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c5c21dc0-fbe2-4585-969f-ab7579fd1325', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('efbd97db-fb43-4358-897c-4df13fb60ec6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b2ae8241-aa2c-42c0-96b7-ef4a9a1344fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('c6954a4d-31e1-41e2-bfca-ea337a1e928d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('5e669a03-990d-411b-b841-6dd596905e67', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('cae701f4-f448-4a48-98ed-977c351bf343', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('09a329cd-abb7-4999-904c-02517f8a505b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('138cea1b-ca95-4ac5-849c-0a8b42b1eb6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('74748618-1109-4f22-b568-79d72dd6ce23', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('64516a0e-9406-489e-8e42-7242a942fef9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4c649f89-4ecf-4c2e-bb31-cf0ca1bcf0d3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('2d408570-0b13-437f-aa76-f499a1607bca', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('78066b46-ebe2-469c-bf14-104e5c3dadee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('36275709-28b2-4c38-8b14-d4789b970c6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-amy-zhang-msl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('10d536d2-77d0-48f8-9e8f-bb219f11a521', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('28529a6f-34d0-4324-9ed0-ba3d558d9886', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('49c58621-7f31-45e9-82a7-4b2b9303aed5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('f0d728c8-94ca-49e6-858c-9230be835cf5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('9c2d0d8e-4401-4eeb-bd92-701a3f23bdfb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('31ed4ae6-07b4-4f05-8de8-7f08d0009968', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('4cd0bbb4-4df3-47a7-b853-c01c8a3bae9e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('e458bd90-96d1-47c7-acf7-151aa488569f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('290da2b9-5055-4870-a155-25cf9fe07ab7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('262dfbeb-973b-46af-ba25-9137f255dfad', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('0e68ba38-2f07-41f3-a143-7d7eabc1736a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('9033849b-bdb5-4989-92e0-32b36328283a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('41c02ba5-322e-4019-bc70-a27217b7352d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b397e178-84d3-43fb-8e3e-c01b41890036', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('da1db15f-d480-43f8-8c7b-ce40f284a8a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('e2f9fd14-0e5b-4358-b51a-e2413cc7abd9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('bdb09520-6e38-4ead-bf4d-fd4e76ddd94f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('433c6fac-0b88-4ae3-8e86-49ed6480924a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('76194d8f-2fa6-435b-aa62-88bfdc7cfc1e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('78d910ae-c4b9-47ce-8da3-86aeb464025a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6dad6b2d-c485-4ff9-81da-13f8b4191228', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('e6b86733-21cb-4d99-b581-079edbeb0bdd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('58309b0c-d941-4f3d-b2ee-cf5340e6f471', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b1325adb-17b2-46d7-ab5b-0e6934f72d22', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('39901ee3-cb77-4bac-bbf4-531a14c8f66d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a863defa-435d-4035-9fc8-e7cd59f66845', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7c63b48e-a240-4c80-a7ae-4b7be2faf5d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('5f7338a7-a94c-45d3-9e19-09f252534ff0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('17fefa95-629d-4fe5-a61b-b642ceb10fe0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2ac63dad-60d4-48fc-b6b8-a255f3e3cb5a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2078ac08-1d63-41b3-8775-15c80fed38ba', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('9857e627-5ce6-43a3-aeb0-a4d82f2d28dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('53e8e2d0-1032-45e9-9f2e-e38452d79ceb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('802d20f5-7313-4c0c-88ec-c658f7c1f42d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('613b06f2-c97c-4197-acbd-0c67f609e63c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('281140de-2e6c-4979-b03c-0e8015bf8577', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('e78c2ef7-949c-4892-aa1a-5f842ac44efa', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('3398725d-710c-4df5-be10-362a624c8b58', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('68acb102-05a7-4ed0-a02d-3cdb8105d170', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('2f8f4f08-d4fb-4192-94ce-d2a69c262227', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('b3ea3e92-e58c-4d16-9b31-e1d46ee20009', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('71181eca-212a-4b53-babc-380a471647c3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9a8bacbb-55dd-4968-9f44-46d712e2d22f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ec6943b8-81fe-4f04-951d-456d6caf616e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ebcac719-7cdd-4dc4-8007-7abc50402de1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('37c98e79-7679-43df-803a-a4afbf0da321', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2d65586c-980c-49ff-b9b4-b993a94d4f43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-martinez-fmt'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('4089bd29-d7d9-401d-8beb-31a4677cba51', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('0129d8ff-b326-430c-b173-38e93832ba5c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('ef4d0690-7091-49cf-9d81-c4feb9aecd78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('45961b35-ff47-4e19-8b8e-3e33c7b8d2ec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('d4bab467-c34b-468f-be2c-526aa5ed8f54', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('2ba749bc-b003-4c5f-99f6-e664332df7b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('84d19391-398f-4b7d-ad9b-2f19bae7b037', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('a50d2406-e415-4ca9-a53c-2ce5d39b0c30', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('6da6723e-0089-4d34-86cd-ed8d33a74d83', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('3b165b27-c2dd-4648-a662-1223c4eea8cc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('1536d0f1-e04c-4aba-ada6-dcdfe796aba8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('562958b6-04d8-4662-85eb-134554106129', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('dd591e07-cfc5-4f6a-a41a-d15e6ce76d88', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('4c87782a-c028-42d2-a174-c1c23147c9f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('c91b86a4-1f80-45bf-85fd-507e0c15c719', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('43def29c-d36e-4e41-a8bd-56e30be4f9e8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d7a19d4b-c18d-4bd0-9464-11a5d57a8c13', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('cc4e5bfa-011a-4df9-b0e4-979bc777b64b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('3a207d42-e494-4847-9597-0caebec95c12', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('cf34f7fe-393d-43fe-a714-037b6678fd50', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7965d120-d77f-4cfb-af07-694a43ca4f1b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('8f9a7787-b3cb-4f9f-8c7c-da29eeddff78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('2b583883-a987-4a98-9465-64844863c0f3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('e5f24b86-653b-4370-ae4d-c885a2bf4a61', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('9af2de9a-31e3-4cad-8cc2-75f00be222ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ca8ea060-7d3c-443c-b471-97bbb3c7288f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('d4bae617-4124-4f57-9738-f433f5152f70', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('fbb5ddd8-9809-447e-8399-b71dd0f25b99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('67696c8c-0a45-4a49-9f9e-8123ff90f1c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('da0493a5-32b3-4419-870d-23a6877e01df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9380dcff-51bb-4580-a40a-cbf825e04b12', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('940d2a10-0906-4fd0-8c91-b83dc2beff64', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('b1326063-5028-4fb4-adcc-b4c44bb64047', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('864985b5-7afd-40ff-a576-7dd6b31cf73a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('e5f25c1f-5a18-4d83-b50e-97aa85252017', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1c400298-525b-4b67-9dfd-6495b28af7f3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('bf737e45-4e0e-4444-8bda-e6bc415b6ad5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('55e92141-7123-4a9c-ad32-205636aef841', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c292a8e7-48a7-48a9-802a-715c299eb5c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('788acc63-3f0e-463f-8d0c-a1dd4d434de7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('7af9ee18-d099-4a06-943e-6f0d4081431c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('e01fe5f3-ca31-45ef-85fa-b3b971e5242a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('2ab28e99-3bf2-4438-8c25-df157079127e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('76d42684-0589-46da-89fa-67233ddcc066', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('9899269f-e504-4aef-b46b-a2a8b71b398a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('cea7152c-3c47-428e-a73a-bdf78c2539dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('beb89d4d-a91c-4371-8910-91324fccc745', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('f3f48a64-bc4c-40da-8044-03b30eda1aa9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8e984348-5642-4f69-9e5a-a57ceac4ac50', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('56044e24-c17e-4f84-b8ef-01d72c4ba5dd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8b8c1133-8c50-4ff3-81fd-1ea948dbab27', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('b98646ab-21a8-4284-9476-30b7de2c0d10', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('d1c4bc42-cf10-46cb-bd91-b35853ab8866', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-thomas-williams-hmi'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('35ae16d8-78d2-40ac-a342-2456af397bd2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('099fa365-cef2-4260-826b-3fcdc47dff6f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('a9b32443-722e-4869-a863-0654ff76ab06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('7825f6ba-5082-4b62-8af9-5ff66c406b01', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('f5c4f48b-cb60-47ee-a95e-12f31b8c8adb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ecf8067b-4553-4e5c-a5d6-09a40c20795e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('304c9bfc-b47f-407b-82bf-ffd67ffe6001', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('872ec91a-c63c-41be-8ba5-40cbdcc88ff1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('dd57d461-b9d0-43b6-95e5-4f2d022d361c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('4ab668f3-c91e-48f8-8502-57de92d62b91', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('2153d2d9-f273-4512-ba9c-dff229d6a418', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('529a45d1-da2d-4da0-b5ac-1e00d6176565', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('2fca49b5-b533-43e2-9e5e-aab79327cc15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f063e0ce-c204-4ecf-b5f2-6d24fea0b171', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('73e03ff5-dff7-4c0c-980d-dc54652643ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('e52e76de-520b-4d52-a367-cfd299f953da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('2838c0e5-71f5-4c02-9b60-644dcededc2f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('c2bf4634-81b8-4bcb-a7b9-9705b6c78c7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('dca07e7e-f585-487b-bfc5-516f8384584d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f8e57be2-16b4-4846-baf4-ba151950e22f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f21c2936-76c0-42ea-bf58-8ca1482b5b29', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6ac8b66b-0351-400f-9668-c96b334fae76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('518040f4-e4f2-4602-8c99-365da3fb745f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('11010266-40ad-491e-b400-9c6a0fb8e533', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ff6d6a81-a67e-4926-b979-49073c712b1e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7f9c4c8f-eac9-4976-aa43-99d841d9abc3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6058039d-c113-4d30-9a8c-7eb4665510ea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('ca2aac55-0d4a-4f10-8e30-3a5a991485b4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1389a9df-0d7e-4d3d-9310-823d9c82ba43', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('169ecf88-794c-4010-afdc-821a2b49b5c3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a93518bc-1ae0-483d-ad26-e0443c36f297', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('ce6d2589-cb6b-4ba3-8a00-f32eb9b573a2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('df5eac22-3ca2-4985-98bc-5b64e6a962e7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('7ea12f7d-557f-4cb7-bfa4-33831e08ca51', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5fe2b8ea-89a9-4137-a863-167138a7daae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('f0297d36-af58-4dff-9e32-1e6d0e50f802', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('27482a02-e285-41ba-8d96-9454f3c0b809', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('8c266b0b-86cb-4092-85a2-3673872ce1c3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('43fb6ca7-2942-418d-bf4c-0957948d73d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('8f8cd69a-c49a-45f5-adf9-4a480169dad9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('f6541676-0f6e-48d1-a3ea-953851d2d1a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('c696dca9-adad-4507-9d22-e90a1dd3b75d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('628a4831-aee1-4afa-8e1f-cd6c25f9eba9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f8b9c212-9933-489f-8472-96fac593107c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8f2c489e-5bbe-4aa6-80ca-1d95338cce9e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('99014ad7-987b-43eb-9444-10859b3dc2b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('922e4c25-71d4-466f-900a-ca29303debc4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-susan-lee-mi-mgr'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('882cf599-a7ec-4108-9ff6-f72aeda1f5cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('08458068-16e6-4925-ae92-677aff83509b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('c6c3d89c-681e-4bfd-a0a0-f2d3795ce92f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('4700218c-e8c2-437e-8751-0d49bf53e434', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ce88f328-8c1a-420b-8ce8-8f2a40ce6f9e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c0385bcf-5ee7-4aa0-97a2-39ac015f212a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('3e2d8e64-ecaf-47fb-bb36-ae1a6f12f262', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('d380d19c-bb07-4968-b237-1b0c168e3155', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('7629b46f-0ddb-4e16-8f31-3dfaa75343bd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('5609d870-ba57-40a4-9f6c-4aaafe18ffbe', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('35dbfa82-f296-4afb-8f1e-41d980fa3a17', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('20c57cdc-e41b-4fc8-b9b6-2a214210a543', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('8773a7d1-5135-4ca5-bb8a-2c3b3fa2dbb6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('91d8e2b7-6492-4901-b702-8588f5780b68', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('cdb6d3bc-4c27-429e-8885-53d239adca1a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('f9bfcb05-4afb-4a61-8e75-8fc4bfd058e2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('8e96d647-b22e-453b-9265-16da308e26ea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('77750f3f-bdad-458d-97ed-a739c69bad84', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1cd00fec-a68a-4e4d-848a-471d938cf6bd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8d3072e7-6f67-43f3-a1d2-38ac6831762b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('80c710fd-b497-4348-90b6-c0990b3586d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('893a9c23-c87a-4c0c-be04-556e529619b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('10157c20-7149-4795-ac5f-59561df69e9c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8235b1a9-0b4f-4871-b841-32518840afdf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a99a96e5-6044-4162-9548-74c75d6f2ee1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0dc9b85a-a330-4325-9753-006200aab7be', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('60cd455b-24f5-4d3b-baa8-7bba9e57a643', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('2d4c3f70-6995-4912-832a-ff74ff5af0a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('6ab60814-e656-498e-8f70-f0c2500f3919', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('35559081-70cd-4cee-a9c4-a91dc5b13c7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('6cfcdfa7-c466-49d3-ad4d-1051ae1cf841', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('527e4f9a-01a6-4119-9bae-00c57d14ad0b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('b5310900-a981-45bc-9fad-b8d4ce83e3b5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('30666b4d-bc6b-4c5b-a23e-7113ae11d477', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('3bf7596b-3f4b-4b2f-8881-5536f1e154df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('41c86db7-c9eb-4d2c-9b79-5b08161add95', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('618b4ce4-a0b2-4ecc-b579-726bb6220770', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('baf78868-1f76-4328-ba90-932b82ac91f8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('355c823e-6bfc-487d-90de-11c2fa0b691f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('15912069-3a20-426c-b2b9-02b8a5c6c1e6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('a96cfc65-0b47-4b7a-a6e8-2cb445563c26', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('0e4ed04e-9e56-4c38-be30-db94f7dcf462', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('a6cae7f2-20c3-4db5-aef9-c8838e5fd7c5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9667314c-6166-4fc4-b9ee-c204b55bb878', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('6737b6e7-5d8e-4006-b3fb-c22d5aa51f33', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('e8da0cc0-3a0a-4b58-a0c1-eb0ae6b7ba84', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('b72e588b-d315-4962-a02e-910aa923c5e6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-brown-sr-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('f85653c4-fda4-43cb-aafa-5bbb261a02af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('7685b4c4-5a1e-49a5-812a-9b28c3eefc25', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('0c0e49e3-fece-4884-b851-9dd10daf9657', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('139ff0db-e062-4619-af98-f5cdfe3bd1e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('335a757b-eb8b-44b1-8a2f-e0ac5041f0e1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('25f8a625-de80-4c9f-99b8-60187a1dd859', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f5159f60-9a2f-4986-9411-54c3fa3c4142', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('b9845968-7706-4611-bcd1-245e83add444', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('8c0d6437-dcf2-4ed5-9a25-90fa1fc1f341', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('4185f661-15f6-435e-9afb-5c21566a4b85', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('a8109647-7b4d-4ef1-9f80-7147b693a246', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('843e170b-cf30-4e7c-b563-1b4a26fc5bdd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('49c776ab-f0b8-421b-b32e-7b6c50b14ad0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('1ea089ee-9641-4460-be82-22b1db56c3f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('afb36764-648b-429e-b188-d6f5ac8e778a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('63363740-c47f-42d9-ad3c-4744c7e164a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('154a408e-332f-4bfd-92bc-a5f939510d92', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('037b2dfb-d8a5-4d11-a9d9-2ad25e3ed098', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('3d6aca6d-3b7e-454b-9acd-52f24633b3c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('a4b0ce43-9d9e-4a10-95b1-e2552874c8b0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('180ccd0e-946e-44e9-9bf8-0da60a222bcc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ca0a02ff-ceba-4751-90b7-7fe6fa998c13', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ca2a1bb0-8419-418e-b57b-2923f180eb57', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d6d53c9b-78b9-43b1-9756-a405312ac1be', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('2c041cad-5ee5-4341-a91c-cd897044dcdd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('80c3212b-6bbb-49ca-916b-3aa8cf37b64c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9e4116e6-cd0e-4861-806a-ab6cf7d4d19c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('199c13d6-97eb-46eb-9063-3b3fa192a335', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('866fe572-4dc3-45b1-a0b1-dd1130672532', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7e95f432-f28a-4d0a-9a49-b52ca102820d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f562d83b-a308-4ea8-8e05-1677a3e3948a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('358b38eb-0519-453e-a611-66a204d11d3d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('4492ea35-f75c-472b-8bd2-977c4c317c2a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('6cce14a6-0826-407d-a491-c3ec5d588dce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('60340937-71c0-4449-8f93-d2e1fedc0e34', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('fe6641c0-08a3-4b97-8129-1cb09af08a29', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('8399260a-6010-4e43-8632-26cf8fd34270', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('8f4386f4-5c90-41e7-8a0f-7f7c3f9710e7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c1ac73fc-1aff-4bf2-9945-18ae2e590e72', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('f92133d8-67f5-4e2b-88ce-b46d7a3f620e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('cb1bc13d-66f1-412d-96ca-b2a36fd26dec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('e72ca9df-d563-4b75-a8a7-6e10e9b2cb20', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4fe6aaff-cac5-45ea-a27e-ecc91247e46e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4799a6fb-94fe-43ae-8686-4a1977727873', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0145ddc1-7736-40ec-b547-d80dc7239317', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('33ce41e8-2a2f-4de5-84d8-b8d1c4be3a15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2ae80cf2-ead6-45a2-9bc4-81dc280ef463', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-davis-mis'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('091606ee-b0d2-4cef-9c3c-eb42e670abab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('d041dc51-2b68-4123-b2fc-c263092473c6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('abbcdbb7-6ca4-4108-9224-1b021a656d0f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('90306dd6-734e-4fb9-a66e-8aceaf03baf4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('dcf6706a-0328-46e2-b03b-be0583799dde', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('444425ec-f05d-423a-bd8b-008c5bb6963a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('35d396f4-0b4d-4c72-bb77-42d30e6983d1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('2ae66408-116f-4329-b9cb-4a277fbb0842', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('a98dba70-ff4e-4274-ba2f-f19a4f2e6a87', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('03f6394d-cca7-45d1-98e7-5ff01b17ea41', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('714190e7-9928-4e33-91ed-9b297867cfaa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('31c5d6b2-0830-474d-b6a0-c53752a78c71', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('c662329c-d478-48f1-8e19-75488ecfbe2b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('6dd8b40d-1993-45af-8476-fbf66df5d90a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('8cffa9ad-d30e-410b-b049-04061e3e69d0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('37244c49-5cfa-4a31-9e2f-620af480094a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('82097a58-6461-4b79-b288-16a4b4957faf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('38cd998c-0222-4624-89b7-08acfaff33b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('219b6b27-9962-4d29-b233-1481c0e944a9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8d0970a0-cb7e-4df9-9e12-78e075e86430', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('da2a2401-b071-4059-ae55-2c1ffe8da6da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('02833a0b-21d9-4731-b76f-383557b0dc01', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6846ce9a-2a45-4e57-b11c-9dbf7dd2e017', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('15506966-6107-45eb-8ed5-3c6977be1f16', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('93a4747f-7a33-4eab-838e-b020325be1d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7e7eef08-29e3-4a90-b1a1-0f39a1d3795b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6785c8a3-74f6-4b27-87aa-f17f100e480f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('e613a814-a99d-4794-a49d-5f75e17ade68', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('57956aa9-f286-4705-938a-267e6e0a1be7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('2c82b4f2-2af1-4b7f-a354-c75ce9cf9a5b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('3e43eea8-9a8d-4590-bd48-4e968f9ea184', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('38468d6e-d56e-4724-aebc-b838e164049f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('b6fbdb9d-c5ec-49b5-ba4e-b8f1f2a70508', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('4538eaa7-4826-4b1c-85ae-c957cdc0d009', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('5f49c665-0d8b-4e34-8e27-5720ef973d06', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('52418a9d-a0af-4f83-ba90-f615da60e7f3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('55acf1e0-624d-42aa-ab5f-687544d5e5ef', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('c0e950d4-68f6-4b54-9f33-518febc37661', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('cb5ddad3-5511-4fb7-adc6-b8f1a22a7085', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('acaae832-186d-4035-ab4d-2f3749b0af10', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('f5ea7229-207f-4fa3-a235-91945c587773', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('1f4b091a-89e6-4de1-ae99-992b3edb4c19', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('5b14a272-7d9d-4445-b968-5b93623c5eab', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ac3f30c6-70c1-4376-b388-8baf53f6a694', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('24b9a107-aadb-4b45-ac20-269d66246f1e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('b438910c-5aa4-4061-89e5-f12665f37ac3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('cf386d86-37e1-48de-928f-f3fc0a90231f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-thompson-lib'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('cacea2c9-3735-4435-ae20-d7bb3d9b8f4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('9616cd44-4c6f-4b7f-84bf-7486b513d1d8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('53916eff-1739-4c9f-a72a-8fc32415580c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('49b6024b-85b5-42db-a50e-36c8abc8bfb3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5d9a297b-1f31-4765-a36a-aacb6f6884e0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5e456cdc-1c66-40b0-8af6-0abd158c720e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('b21150f0-b32c-48da-95df-95290f4ed258', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('7a1b703f-4068-42a1-bc61-95ad51d7d46e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('78ba3a11-9fc3-4a13-8dec-8fae528a3d6c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('7250a12f-423d-48ae-b0cf-8bdcf04439bc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('8fe110c6-357d-461e-91ac-78f320f9d86e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('04f0c812-3661-41d3-8a94-bd5a7dd513da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('48b5603c-3888-44af-9192-749745b68ecb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('8bdb6324-5821-4f04-bddd-4e899f9bc270', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('5a8e214f-f648-4531-9d7c-122bed5904f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('49261434-cb31-472f-a488-3bec2db3ba9b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('1524b59b-e0c5-4b74-a157-da54fc784199', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('8a76dc4c-c3cd-49f1-bf31-0dcf3695a874', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('b7996f02-fb44-4769-857f-63a73d6719f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('d7466c55-8fe4-4be0-883b-a1e21cd5c699', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('98c2c077-5c49-47eb-9047-9fc33b3b74e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('3ffe3c51-4f29-40a3-9265-6ffdf7df8a56', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('6e76af8f-474d-4817-a011-cf321d8a247a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('91ce2d5a-6be7-4900-b8cc-04c76df8287c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7bbe87ff-86cc-404a-b27f-631f75330da5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('20fdc0b4-9b8b-4823-acd0-0b8018e0ef41', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9af4c604-2c91-4d29-adcc-9599f46e4db6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c46a1fb3-af56-400e-b876-33087798557b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('90a6ddc4-e086-440c-88cd-8c828b524945', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('32095458-e400-4379-98b4-9a029bf6fac6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c01d2a44-52d4-4c3b-995e-f249b2a9cbc9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1419203a-12f7-4264-8626-08ab3b1a43d5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c77c0011-459f-4fef-b480-632ab3e8bf22', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c5d81631-5e3d-42a1-a371-870e1018a948', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('7518b2b9-824d-4711-b322-e8d2ef9982e2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d4f30353-38aa-4e1d-989d-0dc06bdcd703', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('c4a3a8e5-3de7-4fb9-9265-3d50acca1280', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('268038a4-6b9b-41df-a084-e156700c4331', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('5cf74ff7-959b-4a2a-b973-976dacc02549', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('49fe1433-9027-49b3-9afd-dd9cf999e38e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('d0b9b72b-987c-4bc6-8f71-69be5ea181d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('a2d3c4b6-84ef-4a42-b81f-7900ae0c9154', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('34349f67-6a7a-4bce-a99a-0b4ba50f30a6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('7c9e3821-6226-4c8a-93c2-9ce227cba36c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('d68d16df-35fe-4317-8150-1acbc5c4828b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('4b9ddddc-df9a-4827-8bff-f3aac7731016', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2bfa50bb-dbd7-4141-accf-80a7de599b16', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'david-wilson-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('0bcad0df-0863-47fa-ba33-a8c5e568142a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('17b3038f-f43e-4921-8463-a0cf15ccbedc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('e950fe5d-5ffe-40d3-871e-28b381abe122', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('7ca99fae-0607-4128-ad63-59ca6efac60c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('739bfc7b-8668-467f-a6fc-1ddee0e7b80e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('825d7b33-6cae-462c-aff2-c4a3cac65d72', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('d4a432c4-e803-4e02-bb9e-e036e3bd4388', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('21fcc06a-3684-4adc-a581-2039b8857179', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('2ad21470-bb0d-48ea-9c1f-7737e439a241', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('685b1995-526c-43e8-ae35-97c029245410', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('6a90cc99-4335-46f6-9d79-cdb81ae6cde8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('cbe53230-244a-46b1-8215-f2edd9de75af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('63688852-5d03-4168-9be9-9c90520646e1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f9f9eecf-f568-46af-a7f9-c0da8a14132d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7f4ba18e-86d7-45aa-a20b-c221667a0988', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('e9c17288-a2bc-49a5-81a8-6474886d73a8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('a5b3bbae-63b0-4ffb-b2e1-a5a59f18a8f1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('24804f62-a320-4741-95a3-410e84e43a12', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('21d1e1b1-341e-471e-acc9-80836c86ddfa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('88c8b53c-18c9-42ee-92e1-3744a5e4c88b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('859594f9-1525-4fb7-8434-53056b52f507', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('fac45ec8-5509-41e2-a648-178a2c96b30f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('35e3d78f-1301-4cd3-8622-2dfbb02989b5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('041c2338-084f-4d86-acdc-7571ff7843b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('d8615e20-ff52-4576-a7a3-921d69bc0f93', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c566a373-7a83-4cbf-81ec-bd967a2eec33', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('5a6a1012-2bf2-4f83-85ec-2e76de7cb8ee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('abb3bd2d-3846-4829-be74-5c0246ef2b05', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1039aa04-5d55-42a7-87fa-ba35e74965d5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('38efd7b8-a7f5-43a3-8789-d1e322382fd0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('589b2d51-4f08-4102-8071-d24c71abecca', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('40b39ac7-33f4-4b38-a413-c91bdf9dc9c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('5c830118-e409-43d5-b836-1ffb64f84044', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('b3aa413c-78a9-40e5-a962-6dc6387f047e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('0aed08d1-9015-4c96-bd7d-207456448014', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('2bedf257-2d0a-4afe-945c-6ba70a3d7959', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1fbbd1f5-719d-4221-b57d-71cdc4bd9942', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('231b7573-432a-4fe1-afc1-47df8d0b253f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('ad173fd7-12b3-4f7a-a90c-00e455ff1f38', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('0280755b-11c6-446c-90e5-d8e4b88fd02d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('d929aeaf-7d9a-422b-85c3-c6d37f3026e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('bc57404d-9243-437d-80a8-cbc026e0fde8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0f919a9f-2f75-4a94-9be6-c235e3dcd770', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ede7edac-e0ba-4458-96bd-5beafa93ddac', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0d5de988-424d-4461-86c5-796c3541a208', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('9310ff6d-33e0-4fed-9e3d-f56f8e77357a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('62d175b7-ce8e-406f-8628-249261f074d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-patricia-garcia-mem'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('295bc429-93f3-464e-a2a3-04d5518ae622', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('a975dd6c-068d-487d-88ec-ffd62b7ed112', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('578d7b17-075d-4023-b6f5-c85cda51270e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('b15414a7-e0f5-4af0-9abb-638021b3b243', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('ceb9c023-c3fd-46fc-a0e6-d0732a7fc396', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('d468c9ef-9587-4c0d-a6ce-531258cf141d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('cf5e3725-63a2-4414-a762-e3ac9d55b4f6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('ef7a73f2-a3a3-439b-ae7a-bdbab8317210', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ad7744ef-a6c3-4441-8446-770b42191834', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('8cd9eaa2-deab-456a-a68a-82d6e1822cee', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('4ad855d9-be88-4625-b8e7-253547520322', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('5a238005-db62-4c13-ad75-e443eed09473', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('db8a589f-2ab2-4b10-a7ff-9a16eece6f8a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('efb1a79d-cd6e-4b6d-abe7-62c2f096dfad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('31c7c3d9-c719-47c9-b935-523ef85eebd8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('a88ed8f6-173d-42fb-be2f-7d6ecc60ecce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('ce5e624a-57c2-4273-a9c0-1173f9987d76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('c8445533-4bd8-431f-bb64-7083e9b3064d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('b6ba014a-96cf-4d84-a87d-cbf48dff75db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('e13e132c-f195-4070-b6d5-7564c97690e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6aa6cd7f-5eb5-4ef8-8f5a-98e42e549e94', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('494de535-d2d0-445d-b632-6f7d8ecd9222', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('64512f7f-96bc-4c05-aba2-0016443035e4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('72135ab8-70e4-4f00-850f-7a89071d8fde', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fe37de9a-829e-434f-aa5e-c104f15f1493', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('669d5f93-c5b8-4243-8ac5-9c36426c15a7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('55b8ecf4-c33a-4653-a731-90b3de79f9f5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('22f23760-8dc3-477c-bec8-1b7f76872627', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('9c7734ec-c7f6-4fa4-86e8-4f6c1e55b825', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('ea3f24e7-efc4-41f1-87d6-c8015bbe43de', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('aacfe756-00cb-45bb-ade4-1db557755534', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('68c16b0f-c831-42c7-9f2a-92587c2c42d8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('cf51765f-e730-402d-8e65-80604f6e86e8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('163cdad4-f561-4bf2-bc0a-c4cb093ecbed', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('cd02b80b-0d5b-4cd5-be34-1943eb854345', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('8e997103-318c-49b9-a750-65b7ee63c781', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('12d190eb-69c6-48be-a89d-e4e2d6e1770d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1ea23eb5-2a28-4330-8799-cebd5ef8e559', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('1920d538-a920-4471-a3fc-582e949206c1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('17f601c5-06cf-49b1-b0c7-5e2371b2650a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('72a61aa3-7b93-469f-9246-9b0d60e80e67', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('08160de1-1133-49e7-b889-f8ebe98d20e5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('d08cc249-3b1f-4b85-862e-54272c1e8a5f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f2a57e16-7cab-471a-8ed0-18157224e24a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('de3ae7e5-216d-4be4-b0ec-1c298894050f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7d115863-bd01-4668-afec-a40ee279abd0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7c42f1c6-197c-4daf-a037-83419b5f23bc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-richard-phillips-maml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('33bc1f0d-09ab-4197-9537-29b3179d1136', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('abb7bea4-714e-4f50-92c7-84305deaee93', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('14c7b7c0-f54f-4043-bacb-96de18892c70', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('4e97c2f3-954e-480f-abb9-a7dfab207257', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('18bfa20c-78a9-4709-8cf3-fff28900ade9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('f06bf01d-39bc-4665-b4f5-a52f9bf3f115', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('28cd037d-1fd3-419d-9dea-b4ae1fca1013', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('8f83efc3-f2d8-4a18-a01c-9e67371422b5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('97f93c45-a1e4-481c-8ed6-62c5fb1a3b68', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('df64a211-a9bc-4a27-8173-17a2737eb724', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('0de5a531-5d97-4199-94db-8738fa24f351', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('3808dbc4-9276-41e8-8de5-a55adf9d6e4a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('6a40a021-4fc8-41bd-9b1b-7716db4f39ce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d2572dae-5eef-4097-be30-fa83bdce68f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('5bda9c71-880e-4515-8f59-5ce47da5915e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('18b38efb-8114-4508-82bd-33da4b8fd481', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('06d54e25-1075-4e8f-b0aa-021ce0555e18', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('650a72b8-2ca1-4c50-b602-fffb8cd4db9b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('cce8be04-9607-4e61-ada3-8128e62434ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('0d2139d4-b0d2-4cdb-b6e4-b86dc09c9b7b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('0271ca4b-2db3-4cf5-afd7-5082138e873f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('ce707ab3-a04d-4635-a444-009387aa34b5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('7d16f1d7-3eec-4a72-ab21-41fab835762d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('88387658-a1bb-46e9-b3e6-cb99565012cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('36428845-08bb-4b67-8b17-e202320593a0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('070c118f-4d63-4e09-a1e3-4402eef796fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('61606c27-67ad-4bdc-a05b-4e46c39d8ff5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('25a318dd-9888-4eef-8564-ca5964c46ff3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('cb0ef500-3942-45fd-a9eb-3b7eaed31e9c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('fff4135e-97f6-4444-904e-3eeef15de632', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('559b9c00-d522-4ab5-afdb-ce50516bed5d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1fa6e548-bb55-47bc-b4b1-42a28d125488', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('e52606b3-d6a3-45be-a898-05f75ad8278d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('570fbd7d-f87a-4f04-9f9b-35900365aa16', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('32cd1634-d906-4ec5-ac6e-5b54652848d0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('afbab01c-7fe5-4266-a19f-905ceddbde64', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('931e83f2-be10-4c10-9d04-17043dcdd2c9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('a65c3311-e5eb-4f6e-8a73-cc5437e85661', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('33584d6f-3ed6-412f-8710-6297ba08f16e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('1cb0043d-32c9-4b5d-8766-5e85a6af3d3b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('709d60fe-7a47-479b-ad3d-930b4a64e83b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('411427df-59a5-4d52-82b2-97e051084a6c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('23af6ba0-2bdb-489c-8318-798467eea360', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b03364b1-1dcf-4bdb-88ea-4c100c6c479f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8c193d93-77d5-4557-a95a-afb658bad97b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('4b53a405-28c9-4ba9-812c-f38f479b751b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('655d50aa-a7e5-413b-b2b7-32777ffdb240', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-steven-campbell-mm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('7b1b2114-6b28-41d7-94ee-a0b2cd9e74c1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('96b4002c-2768-48ac-8eb3-3635286ae492', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('642c44f0-8864-461d-acac-faface741b02', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('42c6af4d-2943-4e70-923b-d54a4acf5e9b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('9eadde4b-11c2-48ad-8a33-4f607c1a1af0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('4ba4ed64-e95a-4471-b9e3-b39d4df1c63d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('a1115981-dda0-425b-ba39-27ee6ff8e63b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('2c36bc39-f27b-417e-a4c7-954b81bd0fdc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('3bba97af-ffd1-4eef-81ef-929912f5a5f3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('9d603b4b-cf73-4c57-b1ec-f15e6fb3476d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('027ab710-47f6-4b01-ab95-d38eb0499070', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('89666abd-ea58-4648-b080-7c07ceeffce3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('34671e21-5e44-445b-af25-b0fb3e9fd3c8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('535fe47e-b829-47dc-94f9-8d90c2a54f40', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('54ebd106-0bd1-4dbf-acd5-4d30e2d24ce8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('d4dc70cb-98c4-47ee-94e6-f3d3d32cff1e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0fadcebe-a766-4344-b277-802f7f05aafa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('c4d9e0ec-a529-4110-bbdd-f8e7a44728ab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('72bde08b-6420-4a32-809b-29ff2c27915b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('fcbd00d3-76fa-4518-8562-c6f545f7cab2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('858ee531-af67-4ea3-9811-520aab2572a0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('f1a0b7b4-7dab-452a-b0b7-23ec9b22ec92', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('47430e2c-f945-4d09-8f27-6436cc4b215d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3c961447-0069-4bf2-b9a3-fe732658c981', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1126b95a-30ea-49fb-b069-63ab6718ac99', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1abf5af5-ddd4-4877-a240-b9556181b84a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9aafdd65-8aab-4e3c-a428-bda3b7fc51c4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('e82794d3-d1a2-4777-9ee7-36b0537d48c7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('1a0fd1eb-4404-494e-a234-3cc3c0506a53', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('fd3f8897-c774-4f3e-a41a-ef7ca9d18656', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a2b04f0e-f4ea-40bd-babc-e4d343791163', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('56ad4ce6-a558-4396-99df-35ae78c5234c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c0ff47ea-8aaa-469d-9497-ca4ad321c573', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('343b8e77-647d-4a44-881f-820a76bc6129', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('6fc902fa-c546-407e-b849-04dd34ebee76', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a5b3087e-fa2c-4e94-a1d0-ac8a8804862f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('5c15c741-9c0d-4a9d-9974-8ff958d01714', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('ca2ead7e-0fb3-4785-8f08-8af0a74d0524', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('a3ef80ac-f5ee-4966-8faf-b711f337c8cb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('2063b5de-92fb-4970-8441-2c2c104d9459', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('797b2728-8951-4fdc-9e4a-e31c97589342', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('645932a4-8fff-4d21-9976-6fa57088bcde', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('45874576-9636-4a98-adc6-1d2a07fecf08', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('f6c5306c-b3af-4b18-be63-31708eed8ef3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('e108829a-c7b9-4ede-963b-1282d323729b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('271d583c-4cd2-43be-a814-e6ac36391c34', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('6d073bd8-6a01-4b6e-964b-54f3bffcebe9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-maria-rodriguez-sp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('8630dd31-0c3f-49df-a1b3-ed1e1b8c33e1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('a8fbe6c8-f7dd-4c49-b6fd-8bc6fc8bc1ce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('a89871c4-ae07-4cae-8df6-490cababa534', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('89ec0d6b-2d4b-443e-80f1-7876e7d70626', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('44344c5f-efde-41b9-ac4e-4c010103aebb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('bb51717d-8536-4aa3-9925-d7f84ed3fd1d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('16bdf14a-a20a-4e13-9a12-8511c5ba2c1b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('a6486452-8eb7-40c9-b1cb-bad7e41d1f4a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('b9a52554-2249-4083-9ce9-1146a56267a2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ffd48fa8-b649-4dc6-aabf-473a147d00c1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('ff4256b0-69e4-4b3f-9968-0c4b6562e61c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('c00e7c68-e48d-40b0-9f9c-c9f2f6f86e28', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('7648e3ea-78c4-4a99-8cb4-9fb624533cd3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('ece8b55d-cf12-443a-b548-b3ecd3d7e9ea', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('c6d7fc0e-62fa-4523-b72c-6f5c2a245de1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('2f77ae4f-8987-40fb-b1ca-9bd513fa1319', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('68e64ef4-d009-4663-8d8a-e87d6c1ae758', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('47406e37-b0e8-4fea-953a-9bbf1353da1e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('9590f4fd-3c44-4071-ab4d-54385378c0ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('5d481ed8-3c3a-4390-b7b8-6b7d7abf86ac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6dd0860a-3c61-4f02-921f-52efff5c1101', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('66d69a52-820f-4453-ac50-ff2a267d2d0e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('cfe26614-6a3f-4749-98b3-3d114c05d4d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('dc7a5d62-a599-4fc2-8713-ea43f6f8c90c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('79fd0cc4-6f11-4ca1-b6c6-bc3b91f28461', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('17d60ba0-4a86-4926-b668-5e720ec464e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('aba80e09-1ef6-4158-a19c-01d840ab8fec', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('23786347-d710-4ad7-9ff6-87b4ea3ab2d8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('e0c86a26-ce77-4d24-b064-08e2435d31ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('106aaf87-cc21-4cd5-b2c5-4497a2e0e25b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('f451a62d-fb39-44e0-87c3-24baea358a9b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('4c60f5fa-578a-478f-98c5-22882cb6ee28', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('1d9c1e23-8f26-4c08-88dd-81908c58ece9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('8348856a-45ef-4b01-a5e6-868262eb4370', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('685d2d75-1f9e-4947-a22f-458217685afe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('2d8ec5ae-f558-42ca-9ba3-415d338794c1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('6154e469-d965-4539-967b-4d2cad1beece', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('ca38b045-75c8-4974-a753-ad0ae06f5ce3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('845c8713-a931-45a0-b717-88703a5c12d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('e2c6e34f-5971-4b89-94fa-11079b9942e8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('09b1ed49-6306-4522-8183-7ec2f637f703', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('9e5d9b98-b0e1-442e-83bf-9b415146ca5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('ede15d12-cef1-445f-a8d9-f39dd5454304', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('546690a6-f163-42a3-a19e-8e0f6cb8deb3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('05add4cb-93f3-45bf-ad38-3f551e7c7f20', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('01033614-f9d4-41ab-8d0b-62c89558d84a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('68c9b1d3-9e26-4efe-8796-0e5617f2ffb3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-jonathan-wright-ctp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('b8be87f5-5172-4680-b82f-6c57085a0ab2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('14739582-c0d9-418c-abce-54e7f548a0e0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('4e05e41a-cfb3-4a18-be33-b973a1d36a9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('20d2f5e6-9cf7-41b0-a4fa-b2ced4025d96', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c830e44a-318b-4d91-8a1a-fce47dd67403', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('5284230e-a057-427d-b09b-55396581b637', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f6a80f44-89da-40ae-8830-a31abb65fafd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('effa8f85-9f9b-48ed-a1aa-1d6d748a948c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('bd738ac4-652b-452c-90d4-b17d7a3e2f5f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('58be78b0-e99f-44cb-a836-45434d086fb2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('1ef65807-c377-40e3-96ba-a981d9ee60b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('4bd36b5c-fc38-49aa-b471-9cd76b062955', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('f1f3fd68-497a-4aab-9a27-68948e61a038', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('0c4b50b4-854d-41b4-9106-dc2e24691bbc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('eb1806ce-c9dd-47c3-b431-9d676e960bff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('59749308-ee60-47de-97ea-2f43369a3cc3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0bd9d41c-1fe4-4b00-b50a-44572944a721', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('3ded26f9-25a9-488a-acb9-e8c0c85ca197', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('c4297df9-fbcb-4a11-916a-e6a0dcf8f70b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('e9fde8c6-79f8-4b6e-ad1f-d9cb35a4e9f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('c1561781-2621-44cc-a1d7-60185ad224f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('a577ab0b-0127-48b6-8235-5ff331baa278', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('2855a6cd-3f61-491e-b21c-f421bec08656', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ff7f24c8-723e-4084-a660-f64bc5f19707', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('545e0e5d-235f-4dcf-9bd2-ef7e09a8e27a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('78b70d55-ec83-42dc-9e13-fd35f1460c26', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f8230c81-404f-498f-bbc4-73f96c4a9474', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('dd5b454c-efe4-4179-a6a3-2d5ca79161e2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('a4bc6ae7-dc2a-4671-9b28-4d154988a1a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('99dde367-54e4-4bf8-9b6a-9db737b4e16a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('533ce2dc-676f-4e2b-b243-4c09a7c4ce30', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d4623cb4-2357-48e8-81c0-7fe8344e34e4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('4865740b-1e25-44d2-a54c-1a2b45da3e1f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('8ad695b6-60c9-46be-8c66-e772563f238e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('88c8e512-bb31-4fa5-b18b-1e9eb1661d58', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('14f2c530-ccc2-4723-aa3a-280b3ba1c917', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('b72cbd98-66b4-4482-99a7-2840822f0252', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('69564270-3426-4f00-963d-a5cc7c2eed4e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('2becfaf8-4be1-460f-bf7e-82be90c3a4c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('c54b8a35-b61f-489f-8644-c86a972b9148', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('407ad266-f948-4f60-b9fa-aacfc54a5276', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('26d89ff7-b71e-451c-8b10-3fde394113f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('0583368b-e54c-496d-be48-e31a99e5cab8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('53d40138-9d16-4f80-a411-06363fd8d7b4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('d59e9748-819d-43d7-981d-8e8be1ef5366', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('15d6320f-88f5-4859-a51c-16d50ac65098', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('ec066a06-490a-406d-96c1-67b89e6790a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-angela-turner-ssml'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('954f83ea-d67b-4b33-b960-0165597c0e5b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('c2b62fe8-2f8a-46f8-acdb-d20cbedfbb8e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('f5fba898-df05-4af1-9ee7-9ac7eca04814', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('f487f06a-1bb2-44dc-badc-7f7cb732cd14', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('f7de3aea-8452-4acb-b4a6-79ae66e5d7d3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('779742a0-93ab-45f7-a426-d57a737b05b5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('775ad6d1-8727-4fda-b2d1-0198c9745476', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('72e8c2c4-d6ed-4629-8e19-3b20a9a0c9ce', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('cca3fc60-9230-42df-9fb9-679aacb290eb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('6e482faa-e639-4eeb-8d7a-05c8f9b38489', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('f525dac3-ada3-4ea2-8fd2-931dd2f9c6fc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('efd9faa6-afe8-40de-aabb-662bd5120606', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('73ee5e83-0f44-4cda-9127-1cefa0883658', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('424cf23d-8577-48c0-9af0-94d9e8f63adc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('6a68fa77-14fb-419d-beae-88200255d426', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0056f92e-d36f-46db-a969-427e16bcfa12', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('8e2be8d8-d725-497c-8f8b-b33f3d4bf21f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('647635b6-b415-42b1-a0f9-429798ebb2ee', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('6648163b-c884-42fa-a70f-d3160694f230', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('e39516ba-843a-4e1f-b7f2-7372b37f2d1d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('1f56b071-5529-4064-a1f6-532114320797', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('e806402d-f7fd-4294-b39f-92b00d221bb4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('5a2897c7-4b36-4aa7-a6a6-afed1b2655c6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('4e99e5c7-4ef6-457f-8a84-b41a5760514e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1c9b75a9-481c-4b51-b677-02818ed6b5d9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a176c687-65bb-45a9-8022-a3ec14496683', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('5fbf66ac-ac9e-4560-838d-83f09d2a15c9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('fafe60f3-c85d-4858-870b-f0a79833c866', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('09fe5b64-2323-4d26-9866-cab47ce690e3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a635c2de-6e3d-4618-b16d-843b36cf7c9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('33811efe-4601-48e0-9fe1-3fbc339727d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('25dcf677-f7e6-4d3a-aea1-6632edd24f64', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('1ea27508-3b8a-472c-9272-77b2149fbc7d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('b2c8fde6-9c32-470f-afbf-98575cc89584', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('3ea2b599-a7dc-4f7a-b487-41f3f005e930', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('f6552702-9a45-4301-aca8-a8621fa197ff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('82c901dc-4213-4cca-a5a6-a5b2ac47bfb1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1d8ef0be-448b-42f0-9820-6a56e079443d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('28189562-1edf-4e7a-929e-4806eabb7902', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('2c49545a-060e-4ebc-b6b5-0d78049a3618', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('5ba30f63-e1c5-4557-b312-b419cae878e4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('59e1b2dd-32ae-4e38-8206-e01aaf91aa72', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('c5ce490d-0282-4f21-b349-c9d30543e84e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b2b3d07e-5f4c-465d-b25f-a4399fcc6d0b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('28cbb4de-3c50-4959-a986-a14862e11290', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('c35a51b7-04ff-42a4-a9f7-6e6c7bc991c2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2811e474-af4c-4f32-b63e-53f4d08fdd65', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'sarah-mitchell-macl'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('57cae329-78ae-4d61-a6ba-0ef6713aef10', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('9f313fe1-f918-4de8-a7aa-dc3b37c85136', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('0adbd606-5031-48ac-9302-e82ee85ba467', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('4daf0a93-a3f4-4c26-9a5d-c1888aff629a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('644d5773-07f9-4d62-bf1e-a744e162b4cd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('b2f0e99e-269a-40d2-a8f5-5107652ea6cb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('1ef2877f-6313-43cc-b7ff-c32c7e67ccb7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('c95853c0-e732-40af-912e-1b0f4f9d21a5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('138bfefd-3286-4e48-a1cf-48d434dbe675', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('9d98c682-9e30-44e3-9591-5b92fc18e761', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('dbe8f752-e2c2-4a54-a5b7-c393debad953', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('9fae44ae-fdbc-4c70-97a7-437da33f60eb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('87d60616-f258-4515-a1f7-63b3f057e18c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('4ecb371e-ada2-4d20-b718-a277fa4b59ff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('d18c82b5-919a-4f60-9d8f-c97335726b0d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('291aaa24-2890-4407-87fb-557351d12f14', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('c37dcdd6-08a3-4cbd-82aa-9716ca5f52dd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('d0f78d40-ed88-4629-b9eb-f2c0ae1bd922', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('efd3e599-e84a-46cb-844e-6bf5b9884abf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('8ca74341-b138-4aef-9854-e9a98f0b6057', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('d66984a9-c080-434a-afda-14a569ba35b9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('7102dfae-b0bc-41be-b7a4-92df4731b91d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('f1a52f98-62e8-4c76-ab42-da4a8d2c7e8d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('e0f95bb5-bdd9-4c94-9992-10bb356cdb45', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('0993aed0-f77a-4568-b707-9bec1d99bde7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('fa33abd2-533a-49bd-a60e-96bc6a91d803', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b5ce30fe-1e32-49b6-a2c0-663ac4b65d7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('6ebaff79-4eaf-4b19-ad51-64e80e733c97', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('22a71437-2ac8-4ab1-a83c-51cbb38d9b81', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('4b257c76-2970-45fd-8aae-b4be72993ead', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('fd622c68-cda5-406a-80d3-5a54b0a8bb46', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a63abfe2-d934-41d8-94db-8c6df18426a5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('1bd4b851-05a8-49d8-8a54-235ce2065499', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('bf582aeb-e912-4ebb-a554-0738b5f65eb6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('f05fac2e-8793-4951-9fe2-3711ab12174b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('4909d162-2525-4250-8dbe-0fd13a74dcff', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('57aeecc7-e33f-4f5f-9e1a-bc3861336ca0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('2869cc7f-5dfe-47f4-a722-98c66c192a46', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('14654033-40fa-4db7-b1da-d2469c206719', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('f7268126-7b2a-4fb9-b2c3-a45217200325', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('5a94029d-89fb-4c73-8a73-f21dc8fc82f9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('bfaf4ecd-4830-4a55-abc7-83c94da94fe8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('af89fc0e-025d-4631-a717-f421740474ae', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('4bcc1252-bb71-4c23-9292-eb50cc7c3c95', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('af3ce9ed-0c28-4b7e-acf5-dc1372aa66fe', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('51a34b7b-790d-45fc-8697-fc4b648ba5a8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('051a696b-a54c-4054-9099-ea777b9d6765', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-elizabeth-collins-hme'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('bbbd536e-5538-4173-8d59-270f238c512a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('acba56cd-755c-40c4-ad35-c04c04fc8d94', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('534fb416-3179-4cc1-88cb-39f890ad2483', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('c6f593ac-4b27-4ef0-9cd6-47ef10c8fb3b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('6234df4d-b25d-4a34-835e-a0e20b228097', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('c3ad7df8-5177-400d-a4f5-61d3fd68318e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('ee81afe5-b54d-4e34-99b3-ee176b5b1a38', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('2fa64ce9-f157-4827-a75b-6915de5915b8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('43571017-9ce4-4244-8771-82fa4568b3c2', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('5038cfb6-32ee-4f21-8034-ed83565e1a59', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('b24eff0b-8a55-46f6-8e7e-5f353f91dc75', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('d8e8cad4-0f42-428a-bc42-1a6b5191d291', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('36124436-8fb9-4893-bf71-522fbbe2c117', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('0ff71ff7-a0f7-4b9e-a386-fe08a442b2dc', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('ca706efa-c5ab-466b-8fb3-3200081c70a4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('2ebe5a35-ad3f-4535-93ec-970f137ab369', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('497b3a12-439f-4f33-9640-1f1e4cbded6e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('0ee3ffac-e654-4cbc-bee7-9d0f9b382670', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('250e4fc1-3a6b-4b39-bee2-a81c68da9de4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('ec9185b1-fb65-4e53-bbd9-aac6f8225e78', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('9246984c-96ea-4426-ba94-b1c82185ff9e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('70564ee0-ebed-4f94-a0b1-bd1048ca5f15', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('63cebaaa-9b95-4f1d-b7e4-4357c6b07ea0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6e2967fa-654c-4332-8839-ad3a3fbed1a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a3c85018-abcd-45cd-a3b7-2570dc7c82f7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7752b1a6-3245-469b-b701-c4dec2913b2e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b2820e22-3b51-4aa9-9491-e5ffda46053c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('0800b7a7-2985-49a0-8be1-cb1fa3ef4e7f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('49355c69-0581-4d2c-9653-c8baa06483df', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('90c6c4cf-c78f-4e2d-99be-7b615cafd398', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('726c2a08-fad3-4408-843b-c27538b652ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('877fdb9b-8850-49b6-8124-8bd2c2006b72', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a00356c3-116d-416d-98bf-1fcfaf5c8aaa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a8177cfe-769a-4c94-892c-d95e8bdf6d10', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('52434a35-3dd6-43b1-8532-735229ab0989', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('c9c240da-752b-4caf-8693-6406cb48d6b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('48d893c3-41d7-4eee-a021-166bde049a78', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('0356dbda-4ffe-4e1c-af6d-62c260db728f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('1a1da306-e38b-4cdd-8018-6bc6f2a1bfef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('5b310da0-8281-4219-b2ef-16a00b1eb80b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('6c1bd31a-9d3f-45b7-a177-7f9652130df6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('5d833ce5-bd05-49f1-a9ef-693d6f0a1286', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9cd6d0c0-da71-4add-8e8f-8cceb970b21f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('e56dc773-3698-4f36-bab9-e017f58a4c7d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('899f5944-a027-42f2-911d-ad14d8075846', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('de5172de-7721-48b6-b63a-e1420c634657', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('4a436ea2-8548-4c8e-86c0-fcb36374306a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'linda-stewart-mcm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('a9f1c9ca-0eaa-43f7-acbe-d4635e8bf6eb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('90a91346-5af2-456f-b791-21b34bd74693', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('ade1aed8-777b-4b45-9db8-157e5b630ec1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('db57df42-8b03-49d4-9bba-9f33b9c8d356', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('6745e87f-5df4-4c53-9951-6ae01ddbe492', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('56282ebb-3ac3-479f-bc06-d560debebe6e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('68102c92-a6e0-4eec-9001-9dcc32093568', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('0ec3bf48-41f5-48e3-966a-cfcd6b5e3b31', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('c3171c2b-1f91-4b55-802d-9989be974c0a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('10315983-4f5b-4099-ac33-c9f6c0e93999', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('77a9743e-09fe-49d5-a7ea-930cc8fabaa9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('b0d89c68-d347-494f-952a-9d8cc8a8513a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('c19dfc90-360b-4952-8ced-df8db98340c3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('3765d4e3-4a7e-48b7-a433-36802da0cdb7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('6018dd23-b508-4c3d-87f3-504f79e1c6b7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('0ca508a4-01f5-4c2c-a865-11d1b9962dfb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('870695a7-f5c0-483c-be62-e6a8b31e7275', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('fcf7999c-ecde-4b08-85d6-165899fd3a7c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('25203166-bcfd-4dd4-8616-9fb263f9660d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('54934915-c60d-499b-bd88-091253028da2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('115ded32-d8f5-4abb-9199-c69a1bacdc9b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('bd0d3937-db49-450c-a3a5-02f4b28aefe3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('47efd366-2f43-465d-b5c9-bd8acd8baf9d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8f2d8459-4b02-471d-bb90-25919b2cd52c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('806707a0-acbb-45c4-9e34-b9889e27c1e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('61ff40c9-63a0-46bc-9b11-9cef22483881', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('872cd576-cff4-426e-83c0-6697fc5c2fb6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('6ccdecb5-2066-4928-bdb0-3ab6d33b07f4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('fd5d07e3-5098-4742-a34c-1dec8f2d60cf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('1dbf9d0a-267c-455d-9f9c-53dbd6581c6f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('5e7aa46e-cf34-48f0-a05b-dd274aef557a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7e95207d-a7d4-4710-9171-a4f2fc7bf8b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('e9aee875-2876-4875-b16d-dccd55fc6e6d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('cffa4ca5-f464-44ea-bdce-b6a39c57493f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('69f4696a-8dc4-49f9-8a62-89c510d01e64', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('22440d73-18ed-4eab-a522-2d54c8e57a25', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('94ce0a97-4946-4f67-b388-0ec16dee2f2d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('d4f25bdf-bbb3-43cb-8a8b-fbb2c5dfb78b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('33bc668b-d827-488d-8150-3b8e90b97aae', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('b55ff295-19c6-4635-8922-0424041ebe05', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('4995b26e-0200-4bd0-8770-14785959f9f2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('3e5669f1-6ee9-4291-ab15-1b3b4d4f6e77', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('8cac2fbd-a6b9-4565-8be3-d295237b101f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('defefa7f-2e1b-4800-8f40-becc913514a9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('2cf590dd-5a0c-4fed-b3e7-6dc56f26cf4f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('edda2535-badd-4da6-854b-ade6966c83af', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('5fce7bd0-7b1b-482a-ad6a-d9bdd195fab5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'robert-martinez-mqm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('818df182-bb50-4385-b599-c4bebf132524', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('7c1e4c22-737d-463c-9e69-80ef9add74be', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('149b1092-2bd5-44ae-9be2-7edb4f211759', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('86dfd955-ae49-40ab-8f99-4425bdfcbc94', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('3910408c-bfe9-4812-90fa-952629f4f097', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('17b300c5-1295-4053-aa58-63ef0689f1bc', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('ee145ae1-7e7d-49cc-ad96-f4717553cf7f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('20a8c3fd-c2e9-49cd-b422-394f32adff45', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('cd0c4489-3eba-456a-aa22-0fe6a7e05b52', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('7af3079d-c260-4267-a34d-3bf93e8175d6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('dfdfb17b-3b2b-447d-a472-42fe1968524c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('5617a614-a85e-4e9e-b380-1e2e95f5352b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('b9516bd9-de35-41d9-98a2-74bb17028569', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b784d9ee-a5cb-49b1-968c-422d7b4274bf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('bd712a60-467a-4aca-9ed2-3dedde52697d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('7be1f56b-0956-46a8-aa12-e75c960fb933', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('9e86ba1c-c3bc-48d5-8d30-6be292146896', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('9788c659-6152-4e68-b9ac-400640c4c4cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('5b183597-c637-4819-a276-4de4161ff923', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('5b869f85-2dc5-44c1-af80-153eb59a73fa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6dd9ad53-9657-4a4a-b221-fa5c91252fb6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('67523a38-a236-42f2-840b-db3909dd7108', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('13f387ba-910d-427c-8a61-1b39a28464b6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('c1992ee8-dfa0-4d39-9b43-013e6ef8eaac', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3ff07c73-d10d-4167-98ce-a444dc5daae1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6d7ee74f-a8f6-4f07-8bdd-1891e50f45ba', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('1ac6b705-76a9-4a83-bdac-19321dfee181', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('a6b74e1e-67ff-4af3-93b7-fb6f6837a4f5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c580098c-f755-4c2b-a731-c54095c3af5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('63ffb0a4-1007-4e0b-bc82-5e3f1dfb1fa2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('d8d396b3-8f99-43ee-9148-1cc3721b62cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('4ed3b634-cb16-4d7f-909d-68e85d2af327', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('a879925d-7a98-4e9c-a089-02bf36fc0b5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('b8d05e55-3a2b-491d-a6c0-2fc0d1d9cff2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b8ef142f-a8ea-413f-ad9c-99c4144b698e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('e0300e57-26f4-4330-a401-17e373ed7756', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('579ce3be-e17c-47fd-b6fd-466ad85b759e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('8acea30a-6576-422b-97ed-b0d47ca7cfeb', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('f50e342c-7a26-49fe-9943-bd5cbee6578b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('9720fdb2-4dbb-4a52-8e27-670a5336cf75', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('cd9ba6ec-fbb9-4eba-a4bc-137a08874279', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('64d6980d-f4de-43b8-9eae-a62b07c6169c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('422cb0f1-759a-45f6-a904-0b304e7bf509', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('b6e2acde-bb17-4151-9704-208896f1e91d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('a7bb9ddf-fce1-4ed2-93aa-db2e6e406e41', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('7ba3b419-10d3-48dd-9968-78071dc5fb9c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('387a5139-b2c8-4c8e-91e0-8172102ac1de', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'jennifer-green-mtm'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('861b818c-4eac-4be7-9b20-4e3bd4a43d91', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('6db4280b-6c21-4f66-af7f-71bbc9b16301', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'speaker', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('24b3bfc1-b6bc-4917-9461-f21a83e1444c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'J.P. Morgan Healthcare Conference', 'industry', 'speaker', 'Investor relations and industry trends', 'critical', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('28b7cebc-233a-4fac-9d2a-b6792ad13167', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'DIA Global Annual Meeting', 'regulatory', 'speaker', 'Regulatory strategy and innovation', 'high', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('63e5a497-74c9-457e-b24f-bf0381e6c3a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 5, 'Board member or advisory roles', ARRAY['Board governance', 'M&A strategy', 'Digital health transformation']::TEXT[], ARRAY['Board certification updates', 'Executive leadership programs']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('916699be-07fd-4a20-997d-75cb257645e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('54b6e816-fef8-4f2c-9d34-f3392054b956', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('758fc146-197b-4e8a-8988-cf43285bfeac', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('fb1853b7-1158-425e-9e02-359b8fb82dd0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('146f48fa-9e1c-459b-8daf-91e3d3b2a806', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('8e0293ea-742c-4cff-aefb-e5ee5c1be378', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('006783cd-9430-4ac4-9092-11693328ef74', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('5ffde368-79f4-4b62-b7e2-ab311f1105da', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('6e6aabeb-62e1-47a2-b514-f6fc8d713a26', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('3542cd55-c908-4844-9f99-90490dc61ffd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('4316abac-977d-4941-b522-a403d946144f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('f681220e-393e-40ea-928b-79dfce379898', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('7534a8e5-1c3f-418e-8b9b-06be3f63b984', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Leadership', 'regulator', 'critical', 'face_to_face', 'Regulatory guidance ↔ Clinical data transparency', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('c43b80f9-fdca-430f-8af6-696e3e628213', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Major Payer Organizations', 'client', 'high', 'face_to_face', 'Formulary access ↔ Value evidence', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('493a5664-658f-446e-a97e-ec8a5e1e1fb4', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'board_member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('a247c170-b339-42f2-ab79-63b961f51a75', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'active_member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('34da2beb-4965-4936-a06a-a97ed4df5bc1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('f9dcba8e-6967-4efb-abd5-a2cba49dbfe0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('f3197e35-d3c8-4b3a-aebd-1dd5edbef38b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'leader', 'high', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('9562fd16-ca36-47de-bd1f-97d30eaefec9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('84d302c3-0a65-4dfc-ae11-f777be31c629', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'reports_to', 'daily', 'very_high', ARRAY['Strategic decisions', 'Board reporting', 'Enterprise initiatives']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('07a4b7ee-001b-4404-bb8d-8c06d2f55d71', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CFO', 'peer', 'weekly', 'high', ARRAY['Budget', 'Financial planning', 'ROI analysis']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('cec8c6a2-f705-49b9-87fe-1997224a6f86', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Chief Scientific Officer', 'peer', 'daily', 'very_high', ARRAY['R&D strategy', 'Clinical development', 'Pipeline decisions']::TEXT[], 'very_high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('9a370a91-a54e-4358-9bdb-e4a67b7e29e9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('3e094005-b529-43fd-b55d-b3baf65ba90c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('eedc5d51-d39b-4d07-b944-2a670230e8fb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('13ba6e2c-83f9-47a5-bd02-77c7004faf77', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c835cb88-2a74-43ba-ba55-6cd7e562d47b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Achieve strategic goals aligned with annual plan', '90% goal completion', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('c9a88e4a-6613-42db-859c-e91f044f3376', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain stakeholder satisfaction above 90%', 'Stakeholder NPS score', 92, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('26af7086-c610-491e-ba98-3e450997d45f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Execute on enterprise initiatives', 'Initiative milestones met', 88, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('07de3759-e436-42a8-af94-e5dacb7c816b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('5ebbc271-48bb-46bc-8eeb-a56457ede34b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('fc4ba3a3-4847-4a4e-ad50-2cedf77b3984', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('232cd436-8864-44d8-8397-26c105473762', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('c2136318-290f-4b77-b700-8934738ef7d7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('e8654351-1e00-40a5-a0ee-b6814190ef13', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('d69658c5-cce7-4d00-9f2b-3ced9f70386a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('dc4ea870-0df1-47d9-af4c-beb931244a05', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('d584fb16-f655-475f-b823-5c908a4ab474', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('4bbf783a-b211-4b2f-b63e-9dc667147ce5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('8aa08118-60dd-41bb-b9d8-4b393fa6ef8f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('33160c45-c441-45e6-9558-0b6e39f882f8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('f19ec5f2-c834-4537-9f53-df88d01d8b50', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('c302143a-25bc-4e40-97dc-e0566f1bdb42', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('aeab79ff-549d-4c67-803f-591124d3347c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('100839ca-ee81-4b71-b04a-638ffc8dfdcd', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('daf10bc1-b1c9-4eab-8235-9d8250c0c98a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('84af7f82-1e92-4035-80b0-03c61816dd48', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-william-baker-hms'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('ea2e24fd-5246-4ac2-ac2f-fcd2bb4bcdc7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('74f4d62f-1741-4487-8ebe-dc2db5a5afa7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('c076494e-9f39-4999-ada9-1544f425ba48', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('d5dc8245-514d-4887-a3ec-d199d513cdf5', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('1ff050bd-7bf7-45ed-8b86-096c783556ce', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('8783b7a3-a796-42ea-b14d-130df5553694', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('336c3413-2ee1-4e24-aea1-3e564b8523df', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('442803be-64e1-4131-912e-2511e4f362f1', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('3646f517-11cc-48ab-ae82-16974446ed6f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('a1b676cd-6a98-4c63-a444-db381a7e35b6', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('15f20eaa-6efa-4630-8a4c-b3a74154aa32', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('db6f1a4a-b6e3-4741-b949-ed8aeb0d781e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('770e379a-1ba4-4505-a041-adf3b82b6557', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('387d8b85-9ed6-4437-b22d-cfc9810b67f2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('6539f936-f834-4519-98fc-7029ddf2a69a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('ae7dcd03-1de6-4590-8b40-58f4e81826d8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('fc98b3ee-f493-46b1-8bb6-72e9b376e70e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('cfb65b27-0d82-4296-8de1-b515a797b6cd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1d8c1e7d-9c3e-4848-9612-31c3ea37b997', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('62962111-a20c-4694-a002-955e996fa032', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('326d7d5c-b3a4-49ff-ad7e-fda6f7788e5c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('52ef1949-ae7b-4233-8deb-53b94d107dbf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('12274ead-6cec-4945-8701-4d3ea01ec4b8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('01ba46ff-c236-4a5a-ba65-b29ba1a1557c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('6ebc9d53-d3e9-40ee-a431-db0d51069400', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('f5ec5306-9abc-4bdf-8bca-c2933d0260aa', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('8f38127e-3e01-44a8-bb71-bb03ee3e7182', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('5c1fef97-a613-46c6-88cc-a80b6bf6fd57', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('f15417a9-3b6d-4928-899a-befe586aae24', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('fa9fe522-3987-4c6d-94c7-793453e73b33', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('a5a6f9e2-b0b1-4068-aa7e-32612e9b1a67', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('74c1fd62-1aab-4bd5-8c9d-0560333ef099', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('ea3a1c1e-55d8-4317-b034-82565e1a531d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('d0f87a97-bd0f-4bf6-9be1-8e21bdcbdc1c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('e82015e7-5b78-4fae-8494-df52f380461e', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('623b3a56-3710-4ded-a1b5-28ced8c79200', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('a2cec9a3-117d-475a-b263-a4ec8052760c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('ecd92dbf-6224-4223-bd1a-fab7584e22f4', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('73bda34d-6111-4f5d-8850-eb1f7d1854d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('76efc77f-9ba7-4b99-804e-de61e8b1decb', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('9a11cb97-4b82-4654-9dc3-3e9350b2b5f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('7c57bcbf-be34-4843-aa8a-705e6e8845fe', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('6a819cca-7a6e-4132-a699-716c5916485c', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('87d3f2a6-b778-4154-a4ca-a481a6c16d70', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('3a08a07a-13cb-4beb-947a-565ad1491453', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('1a981d96-963d-498c-8140-189550b0a2d1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('9e7fc1a7-b182-43ca-93cd-44cc5c321c17', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'michelle-torres-mom'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('eec2bf68-b9c4-4fa5-b71a-d4c8f5bc79b3', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('d9973643-9a29-404a-b050-ecd629d5a245', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('ee4ae807-efd5-48d5-baeb-97c43c59b0f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2, 'Senior role or management within 2-4 years', ARRAY['Technical expertise', 'Leadership skills', 'Project management']::TEXT[], ARRAY['Professional certifications', 'Advanced degree consideration']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('f156bc91-9dff-456d-b09a-5e5841baabda', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('4b63658d-5ef3-478f-a0ca-f030c4987336', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('f0cd6f98-2706-432d-887d-b8d61b754c89', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('f32d4ca8-f963-4c25-8f2f-9d11d01440d9', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('a5b7a386-e448-41a2-8cf5-69b4517498f5', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('89c0de4f-5c53-47da-a29a-8450e4d4b8c7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('46373af1-688f-4bd9-8e23-1a8cdf764394', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('4637e0ed-cbc3-4d62-a041-c3f3bd2248c9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('db109528-a5c6-443a-a1ac-83ad493484b0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('eec8feb3-89f1-41cc-b28e-563d3afa57a0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('5b37b61d-4062-496e-b889-d849417a3075', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('b9fcb088-f118-4eb7-8b47-da2af97043ad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('ea68916f-c1c3-448e-8619-d5f297f07575', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('11cf1884-e488-4699-b7be-3e6f0e310998', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('3f833881-5e8d-4971-b06f-0e49bf6e93a6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('733940c9-9def-4b5b-a776-314f7acf93d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('1c62e794-3bda-46b0-9a4c-b725e0224c89', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('6225af34-e889-4d8d-a3cb-2392fe6d12f7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('b2e483c7-ec54-44ec-a241-816834256a7a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('14a8de50-76b1-46b7-9fd2-0c530e4ba677', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('13dec64b-35b9-402a-8ca9-8195ace6d609', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('a52d2d9c-de6b-4031-bb71-731f36f28b88', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('ec72ca9a-e39c-412d-b6fa-9605c0c50ffd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('065c7bf6-98ee-4bc9-a5c0-79d9689f31d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('253d4ef2-6ab6-4bae-985f-41ddc20da7fd', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('cced2339-2528-4aa6-9e40-f738585d9992', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('7ce0bf1d-c27e-4a93-abfb-b2ff7067e459', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('6ab6bc1a-a03b-4c3b-8b8b-d50afa96b8c1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('3292e89a-8387-457e-acd1-369baceb75c0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('862a7bae-ffd8-4ac2-85c3-4c3e5129764a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('0035fe15-737e-4bb6-a092-a5451c0679bf', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('c4ab5547-742e-4d4a-9cf7-8d450065dbad', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('69005a8a-5558-4c76-b480-9989137e08b2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('04d29fd8-ac78-4b5b-9167-647218b331f0', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('1ea9413f-c06f-45d8-84d1-60ed30f4f739', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('7e520d5c-c2fa-448e-bec6-7ee699ae05e8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('30bec614-713b-48e1-a9bc-e5fda6aef38b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('c7a8385a-57b4-45c3-942e-39854a47ef65', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('20bd8dc7-cd48-4920-a576-aac37f989ece', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('7fa466c0-805f-4715-be7a-82231257342f', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('feafdefd-1285-4ec7-bf14-4359bb90c642', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('9caaca02-ac37-42db-ba83-247ce93df80d', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('2ed3fa9a-2dc9-4ff1-a60e-b5f158552644', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('bb668a01-c447-4161-87a4-30884ccdf3ed', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-kevin-nguyen-mam'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
VALUES ('61bfe6a7-3298-4f79-9252-6e2378d4300a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'ASCO Annual Meeting', 'technical', 'attendee', 'Latest oncology research and KOL engagement', 'critical', 'Q2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_annual_conferences (id, persona_id, tenant_id, conference_name, conference_type, role, value_derived, networking_importance, typical_quarter, created_at, updated_at)
VALUES ('9088f113-0427-4a32-8023-0c97cd1265d2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS) Annual Meeting', 'leadership', 'attendee', 'Medical affairs best practices and networking', 'high', 'Q1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- career_trajectory -> persona_career_trajectory
INSERT INTO persona_career_trajectory (id, persona_id, tenant_id, year_in_role, expected_progression, skill_development, certification_targets, created_at, updated_at)
VALUES ('78060b0e-ed8b-4eef-9923-c767f720f6e1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 3, 'VP or Executive Director role within 2-3 years', ARRAY['Strategic leadership', 'Cross-functional management', 'P&L ownership']::TEXT[], ARRAY['MBA consideration', 'Executive education']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_studies -> persona_case_studies
INSERT INTO persona_case_studies (id, persona_id, tenant_id, case_study_title, organization_name, industry, case_type, challenge_addressed, solution_implemented, outcomes_achieved, roi_achieved, relevance_to_persona, relevance_score, created_at, updated_at)
VALUES ('47144826-9fa0-4cbd-bd58-5fd4f05f02db', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Successful Launch of Novel Immunotherapy: A Medical Affairs Perspective', 'Leading Pharma Company', 'Healthcare/Pharmaceutical', 'success_story', 'Launch product in highly competitive oncology market', 'Comprehensive medical affairs strategy with KOL engagement, RWE generation, and payer education', ARRAY['20% market share in year 1', '$500M revenue', 'Strong HCP satisfaction scores']::TEXT[], 300, 'Highly relevant to medical affairs role', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- case_study_investments -> persona_case_study_investments
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('863b8d4a-0f5e-4463-98eb-76901b6396a3', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Team', 5000000, 'USD', 25, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_investments (id, tenant_id, category, amount, currency, percentage_of_total, created_at)
VALUES ('48a0dfcb-ea4f-4e99-8dd3-3a38296eb9ca', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'KOL Engagement Programs', 3000000, 'USD', 15, CURRENT_TIMESTAMP);

-- case_study_metrics -> persona_case_study_metrics
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('946b8c88-8bc8-48bb-8fe6-bd4a536d3971', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Awareness', 15.0, 85.0, 467, CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_metrics (id, tenant_id, metric_name, before_value, after_value, improvement_percentage, created_at)
VALUES ('e46acd86-d8c8-47df-9866-24c43ce140c7', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'HCP Satisfaction', 60.0, 92.0, 53, CURRENT_TIMESTAMP);

-- case_study_results -> persona_case_study_results
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('29ece795-8771-4786-9f28-8bae3f50630b', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Market Share', 20.0, '20% market share achieved', 'Year 1', CURRENT_TIMESTAMP);
INSERT INTO persona_case_study_results (id, tenant_id, metric_name, numeric_value, text_value, measurement_period, created_at)
VALUES ('ec76a55a-ad73-4f1a-9d69-19bc0a6c4497', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Revenue', 500000000, '$500M revenue', 'Year 1', CURRENT_TIMESTAMP);

-- customer_relationships -> persona_customer_relationships
INSERT INTO persona_customer_relationships (id, persona_id, tenant_id, customer_segment, interaction_type, revenue_responsibility, satisfaction_metric, retention_rate, expansion_opportunities, created_at, updated_at)
VALUES ('82bf6a3a-0a52-49f6-bd7a-2ce3ffb6a8f0', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'healthcare', 'strategic', 0, 'Custom', 95, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- evidence_summary -> persona_evidence_summary
INSERT INTO persona_evidence_summary (id, persona_id, tenant_id, total_sources, case_studies_count, statistics_count, overall_confidence_level, evidence_quality_score, evidence_recency_score, created_at, updated_at)
VALUES ('13fb6192-364d-427b-85c3-732e0c7facc9', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 25, 3, 10, 'very_high', 9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- expert_opinions -> persona_expert_opinions
INSERT INTO persona_expert_opinions (id, persona_id, tenant_id, expert_name, expert_credentials, opinion_type, topic_area, key_insights, validation_points, credibility_score, relevance_score, created_at, updated_at)
VALUES ('61082326-950f-4584-89b5-4b44c4aa0f3b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Dr. John Thompson', 'Chief of Oncology, Memorial Sloan Kettering', 'expert_testimony', 'Medical Affairs', ARRAY['Immunotherapy changing treatment paradigm', 'Biomarker testing critical for patient selection']::TEXT[], ARRAY['20+ years experience', '500+ publications', 'Thought leader in field']::TEXT[], 10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- external_stakeholders -> persona_external_stakeholders
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('0ebc3bb7-aeee-4cbe-b788-8bfee3ad485a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders (Oncology)', 'advisor', 'critical', 'mixed', 'Clinical insights ↔ Scientific data', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_external_stakeholders (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode, value_exchange, contract_value, created_at, updated_at)
VALUES ('ad75f8bf-349e-4a8e-88f5-ec65d751f5ab', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Academic Medical Centers', 'academic', 'high', 'face_to_face', 'Research collaboration ↔ Funding', 500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_relationships -> persona_industry_relationships
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('132f74ef-be8e-4438-a253-e408ef77ce4d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Professional Society (MAPS)', 'professional_association', 'member', 'contributor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_relationships (id, persona_id, tenant_id, organization_name, organization_type, membership_level, involvement_type, thought_leadership_role, created_at, updated_at)
VALUES ('4ea01a39-b2f7-4b19-9a97-e59eabf9f834', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'American Society of Clinical Oncology (ASCO)', 'professional_association', 'member', 'attendee', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- industry_reports -> persona_industry_reports
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('6e030c9a-8b00-4044-b03e-8935a7c83a73', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Oncology Market Analysis 2025', 'IQVIA Institute', 'market_analysis', 2025, 'Healthcare', 200000000000, 8.5, ARRAY['Immunotherapy market growing at 12% CAGR', 'Combination therapies driving growth', 'Emerging markets expansion']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_industry_reports (id, persona_id, tenant_id, report_title, report_publisher, report_type, publication_year, industry_focus, market_size_estimate, growth_rate, key_insights, relevance_score, created_at, updated_at)
VALUES ('1d81b627-f1f0-4678-9a8d-c53ab5c595c8', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Trends and Best Practices 2025', 'Medical Affairs Professional Society', 'trend_report', 2025, 'Healthcare', NULL, NULL, ARRAY['Digital transformation accelerating', 'Real-world evidence becoming standard', 'AI/ML adoption increasing']::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_networks -> persona_internal_networks
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('d611484c-8144-44e9-a7ef-ba4d1cc23752', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Leadership Network', 'functional', 'active_member', 'medium', 'high', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_networks (id, persona_id, tenant_id, network_name, network_type, role_in_network, influence_in_network, strategic_importance, created_at, updated_at)
VALUES ('1fabf0c9-27e7-475e-8fe4-32ab047a6900', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Cross-Functional Innovation Team', 'cross_functional', 'active_member', 'medium', 'medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- internal_stakeholders -> persona_internal_stakeholders
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('b5df5edf-90ec-4758-a78d-c4cc707bd01c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Direct Manager', 'reports_to', 'weekly', 'very_high', ARRAY['Performance', 'Goals', 'Development']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_internal_stakeholders (id, persona_id, tenant_id, stakeholder_role, relationship_type, interaction_frequency, influence_level, collaboration_areas, trust_level, political_alignment, created_at, updated_at)
VALUES ('398622b5-3f00-4c52-8cb2-eb94f0bd73ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Peer Team Members', 'peer', 'daily', 'medium', ARRAY['Projects', 'Knowledge sharing', 'Collaboration']::TEXT[], 'high', 'allied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- month_in_life -> persona_month_in_life
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('e196ec7f-2707-44bd-a97b-22b3cc928bb7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly plan', 'OKR review']::TEXT[], ARRAY['Previous month report']::TEXT[], ARRAY['Team capacity planning', 'Priority setting']::TEXT[], 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('7442ac7c-63ea-4ae5-8f13-7e05c59aeb5c', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Mid-month checkpoint', 'Progress reports']::TEXT[], ARRAY[]::TEXT[], ARRAY['Adjust priorities based on progress']::TEXT[], 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('b5df8f8f-3366-4bd7-979a-156e9ba41349', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Key project milestones']::TEXT[], ARRAY['Stakeholder updates']::TEXT[], ARRAY['Next month preparation']::TEXT[], 8, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_month_in_life (id, persona_id, tenant_id, month_phase, key_deliverables, reporting_obligations, planning_activities, external_engagements, travel_days, created_at, updated_at)
VALUES ('59503e93-6486-404b-be11-0aceb677388b', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'mid', ARRAY['Monthly reports', 'Metrics dashboards']::TEXT[], ARRAY['Monthly business review']::TEXT[], ARRAY['Next month detailed planning']::TEXT[], 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_objectives -> persona_monthly_objectives
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('b14ec999-5bb5-4718-aad8-54828ab0e6ef', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Complete assigned projects on time and quality', 'Project completion rate', 90, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_objectives (id, persona_id, tenant_id, objective_text, success_metric, achievement_rate, carry_forward, created_at, updated_at)
VALUES ('e332e486-b7a9-4f45-add6-6569d7025674', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Maintain team collaboration and communication', 'Team satisfaction score', 85, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- monthly_stakeholders -> persona_monthly_stakeholders
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('5bbe21bc-dfe7-4d8a-8955-8a63b2fbff5f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'internal_leadership', 15, 12, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c160ced6-a3db-4185-adbd-d329fa82e4a1', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'cross_functional_peers', 25, 20, 'high', CURRENT_TIMESTAMP);
INSERT INTO persona_monthly_stakeholders (id, persona_id, tenant_id, stakeholder_type, interaction_count, meeting_hours, importance, created_at)
VALUES ('c7f7081d-f482-4aef-b80e-bfd44b73a89a', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'external_partners', 10, 8, 'medium', CURRENT_TIMESTAMP);

-- public_research -> persona_public_research
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('05cc2e5e-9c24-4d9d-a5f8-0fcef05c2dc2', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Efficacy and Safety of Novel Immunotherapy in Advanced NSCLC: Phase 3 Trial Results', 'academic', 'New England Journal of Medicine', 1200, 'experiment', ARRAY['30% improvement in progression-free survival', 'Manageable safety profile', 'Durable responses in 40% of patients']::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_public_research (id, persona_id, tenant_id, research_title, research_type, publication_source, sample_size, methodology, key_findings, relevance_score, created_at, updated_at)
VALUES ('4248a638-ee01-4c22-9ef5-ed1859f461e7', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Real-World Evidence of Immunotherapy Use in Community Oncology Settings', 'academic', 'Journal of Clinical Oncology', 5000, 'longitudinal', ARRAY['Consistent with clinical trial efficacy', 'Broader patient population benefits', 'Real-world safety profile confirmed']::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- regulatory_stakeholders -> persona_regulatory_stakeholders
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('b6702068-6a7a-409c-b4ec-7e6cde587d26', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'FDA Center for Drug Evaluation and Research', 'submission', 'clinical', 'critical', 'medium', 'annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_regulatory_stakeholders (id, persona_id, tenant_id, regulatory_body, interaction_type, compliance_area, relationship_criticality, compliance_risk, audit_frequency, created_at, updated_at)
VALUES ('a763c385-c2ca-46cc-b8fb-897ea042d29d', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'EMA (European Medicines Agency)', 'submission', 'industry_specific', 'high', 'medium', 'bi_annual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- research_quantitative_results -> persona_research_quantitative_results
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('7c932573-54a8-425d-a253-eca77110904e', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Progression-Free Survival (PFS)', 12.5, 'months', 1200, '95% CI: 10.2-14.8', CURRENT_TIMESTAMP);
INSERT INTO persona_research_quantitative_results (id, tenant_id, metric_name, numeric_value, unit_of_measure, sample_size, confidence_interval, created_at)
VALUES ('d2126e3d-3431-4fc9-a279-903559fad3d8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Overall Response Rate (ORR)', 45.0, 'percent', 1200, '95% CI: 42-48%', CURRENT_TIMESTAMP);

-- stakeholder_influence_map -> persona_stakeholder_influence_map
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('fb50d738-3c9c-4760-957c-de240ea575ce', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'CEO', 'Key Stakeholder', 'partner', 'very_high', 'very_high', 'very_high', 'very_high', 'very_high', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_stakeholder_influence_map (id, persona_id, tenant_id, stakeholder_name, stakeholder_role, stakeholder_type, decision_influence, budget_influence, resource_influence, strategic_influence, political_influence, overall_influence_score, created_at, updated_at)
VALUES ('be032454-1c0f-4cdc-a82a-812a6d05f544', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'Key Stakeholder', 'partner', 'high', 'low', 'medium', 'high', 'medium', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_journey -> persona_stakeholder_journey
INSERT INTO persona_stakeholder_journey (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, journey_stage, stage_entry_date, milestones_achieved, touchpoints_count, sentiment, journey_health, created_at, updated_at)
VALUES ('dc28305f-c381-4d7d-85b3-83d44208f919', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Top KOL - Dr. Smith', 'partner', 'advocacy', '2025-01-01', ARRAY['Initial engagement', 'Advisory board participation', 'Publication co-author']::TEXT[], 24, 'very_positive', 'excellent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- stakeholder_value_exchange -> persona_stakeholder_value_exchange
INSERT INTO persona_stakeholder_value_exchange (id, persona_id, tenant_id, stakeholder_name, stakeholder_type, value_provided_type, value_received_type, exchange_balance, sustainability, created_at, updated_at)
VALUES ('568315f8-9799-47db-a4e5-491c2d1be8d6', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Key Opinion Leaders', 'partner', ARRAY['Clinical data', 'Educational materials', 'Research funding']::TEXT[], ARRAY['Clinical insights', 'Research collaboration', 'Advocacy']::TEXT[], 'balanced', 'sustainable', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- statistic_history -> persona_statistic_history
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('72b39ff3-7d9a-4767-a823-f5f68726c972', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2023, NULL, NULL, 65.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('1db20672-43b0-4671-b5d0-9f70a5ea97a8', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2024, NULL, NULL, 70.0, 'billion USD', CURRENT_TIMESTAMP);
INSERT INTO persona_statistic_history (id, tenant_id, year, quarter, month, value, unit_of_measure, created_at)
VALUES ('1910e309-c1c6-4bfd-8053-f7d0f969f41a', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 2025, NULL, NULL, 75.0, 'billion USD', CURRENT_TIMESTAMP);

-- supporting_statistics -> persona_supporting_statistics
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('e4494caa-b849-4315-86b3-f6e2b6567754', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Global Immunotherapy Market Size', '75 billion USD', 'IQVIA Market Analysis 2025', NULL, NULL, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO persona_supporting_statistics (id, persona_id, tenant_id, statistic_name, statistic_value, data_source, sample_size, confidence_level, relevance_score, created_at, updated_at)
VALUES ('a49c7ddd-7050-4500-9791-1975ad5ddc0f', (SELECT persona_id FROM temp_persona_ids WHERE slug = 'dr-sophia-anderson-mbp'), 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'Medical Affairs Budget as % of Revenue', '3-5%', 'MAPS Industry Benchmarking Survey', 250, NULL, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Clean up temporary tables
DROP TABLE IF EXISTS temp_persona_ids;

-- Commit transaction
COMMIT;

-- =====================================================
-- Deployment Complete
-- =====================================================
