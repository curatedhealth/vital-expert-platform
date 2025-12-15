-- ============================================================================
-- Migration: Simplify RLS Policies for Single-Tenant Architecture
-- Date: 2025-12-01
-- Description: Updates all tenant-based RLS policies to work with single-tenant
--              architecture where all data belongs to one tenant with industry-based
--              filtering instead of multi-tenant isolation.
--
-- APPROACH: Instead of complex tenant_id checks, policies now:
-- 1. Allow all authenticated users to access data (single tenant)
-- 2. Keep service_role bypass for admin operations
-- 3. Maintain user-specific policies where needed (e.g., user_id = auth.uid())
-- ============================================================================

-- ============================================================================
-- SECTION 1: AGENTS TABLE POLICIES
-- ============================================================================

-- Drop the complex multi_level_privacy policy and replace with simpler one
DROP POLICY IF EXISTS "multi_level_privacy_agents" ON agents;
DROP POLICY IF EXISTS "single_tenant_agents_read" ON agents;

CREATE POLICY "single_tenant_agents_read" ON agents
FOR SELECT USING (
    -- Public agents visible to all
    is_public = true
    -- Private agents only to creator
    OR (is_private_to_user = true AND created_by = auth.uid())
    -- Non-private agents visible to all authenticated users in single tenant
    OR ((is_private_to_user = false OR is_private_to_user IS NULL) AND auth.uid() IS NOT NULL)
    -- Service role and anonymous access (for API)
    OR auth.role() = 'service_role'
    OR (auth.uid() IS NULL AND auth.role() = 'anon')
);

-- Simplify the update policy
DROP POLICY IF EXISTS "users_can_update_accessible_agents" ON agents;
DROP POLICY IF EXISTS "users_can_update_agents" ON agents;

CREATE POLICY "users_can_update_agents" ON agents
FOR UPDATE USING (
    -- Super admins can update all
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    -- Or any authenticated admin/tenant_admin can update in single tenant
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'tenant_admin'))
    -- Or service role
    OR auth.role() = 'service_role'
);

-- ============================================================================
-- SECTION 2: AGENT_TENANT_ACCESS TABLE (SIMPLIFIED)
-- ============================================================================

DROP POLICY IF EXISTS "tenant_can_see_their_access" ON agent_tenant_access;

DROP POLICY IF EXISTS "single_tenant_agent_access" ON agent_tenant_access;
CREATE POLICY "single_tenant_agent_access" ON agent_tenant_access
FOR SELECT USING (
    -- All authenticated users can see in single tenant
    auth.uid() IS NOT NULL
    -- Or service role
    OR auth.role() = 'service_role'
    -- Or anonymous API access
    OR auth.uid() IS NULL
);

-- ============================================================================
-- SECTION 3: DOMAIN TABLES (Already permissive, just ensure consistency)
-- ============================================================================

-- domain_therapeutic_areas
DROP POLICY IF EXISTS "domain_therapeutic_areas_tenant_policy" ON domain_therapeutic_areas;
DROP POLICY IF EXISTS "domain_therapeutic_areas_open_access" ON domain_therapeutic_areas;
CREATE POLICY "domain_therapeutic_areas_open_access" ON domain_therapeutic_areas
FOR ALL USING (true) WITH CHECK (true);

-- domain_diseases
DROP POLICY IF EXISTS "domain_diseases_tenant_policy" ON domain_diseases;
DROP POLICY IF EXISTS "domain_diseases_open_access" ON domain_diseases;
CREATE POLICY "domain_diseases_open_access" ON domain_diseases
FOR ALL USING (true) WITH CHECK (true);

-- domain_products
DROP POLICY IF EXISTS "domain_products_tenant_policy" ON domain_products;
DROP POLICY IF EXISTS "domain_products_open_access" ON domain_products;
CREATE POLICY "domain_products_open_access" ON domain_products
FOR ALL USING (true) WITH CHECK (true);

-- domain_evidence_types
DROP POLICY IF EXISTS "domain_evidence_types_tenant_policy" ON domain_evidence_types;
DROP POLICY IF EXISTS "domain_evidence_types_open_access" ON domain_evidence_types;
CREATE POLICY "domain_evidence_types_open_access" ON domain_evidence_types
FOR ALL USING (true) WITH CHECK (true);

-- domain_regulatory_frameworks
DROP POLICY IF EXISTS "domain_regulatory_frameworks_tenant_policy" ON domain_regulatory_frameworks;
DROP POLICY IF EXISTS "domain_regulatory_frameworks_open_access" ON domain_regulatory_frameworks;
CREATE POLICY "domain_regulatory_frameworks_open_access" ON domain_regulatory_frameworks
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 4: JTBD TABLES (Simplify tenant isolation)
-- ============================================================================

-- Main jtbd table
DROP POLICY IF EXISTS "jtbd_tenant_isolation" ON jtbd;
DROP POLICY IF EXISTS "jtbd_open_access" ON jtbd;
CREATE POLICY "jtbd_open_access" ON jtbd
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_ai_assessments
DROP POLICY IF EXISTS "jtbd_ai_assessments_tenant_isolation" ON jtbd_ai_assessments;
DROP POLICY IF EXISTS "jtbd_ai_assessments_open_access" ON jtbd_ai_assessments;
CREATE POLICY "jtbd_ai_assessments_open_access" ON jtbd_ai_assessments
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_bau_cycle_activities
DROP POLICY IF EXISTS "jtbd_bau_cycle_activities_tenant_isolation" ON jtbd_bau_cycle_activities;
DROP POLICY IF EXISTS "jtbd_bau_cycle_activities_open_access" ON jtbd_bau_cycle_activities;
CREATE POLICY "jtbd_bau_cycle_activities_open_access" ON jtbd_bau_cycle_activities
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_bau_metadata
DROP POLICY IF EXISTS "jtbd_bau_metadata_tenant_isolation" ON jtbd_bau_metadata;
DROP POLICY IF EXISTS "jtbd_bau_metadata_open_access" ON jtbd_bau_metadata;
CREATE POLICY "jtbd_bau_metadata_open_access" ON jtbd_bau_metadata
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_bau_sla_history
DROP POLICY IF EXISTS "jtbd_bau_sla_history_tenant_isolation" ON jtbd_bau_sla_history;
DROP POLICY IF EXISTS "jtbd_bau_sla_history_open_access" ON jtbd_bau_sla_history;
CREATE POLICY "jtbd_bau_sla_history_open_access" ON jtbd_bau_sla_history
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_enablers
DROP POLICY IF EXISTS "jtbd_enablers_tenant_isolation" ON jtbd_enablers;
DROP POLICY IF EXISTS "jtbd_enablers_open_access" ON jtbd_enablers;
CREATE POLICY "jtbd_enablers_open_access" ON jtbd_enablers
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_outcomes
DROP POLICY IF EXISTS "jtbd_outcomes_tenant_isolation" ON jtbd_outcomes;
DROP POLICY IF EXISTS "jtbd_outcomes_open_access" ON jtbd_outcomes;
CREATE POLICY "jtbd_outcomes_open_access" ON jtbd_outcomes
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_persona_mapping
DROP POLICY IF EXISTS "jtbd_persona_mapping_tenant_isolation" ON jtbd_persona_mapping;
DROP POLICY IF EXISTS "jtbd_persona_mapping_open_access" ON jtbd_persona_mapping;
CREATE POLICY "jtbd_persona_mapping_open_access" ON jtbd_persona_mapping
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_project_deliverables
DROP POLICY IF EXISTS "jtbd_project_deliverables_tenant_isolation" ON jtbd_project_deliverables;
DROP POLICY IF EXISTS "jtbd_project_deliverables_open_access" ON jtbd_project_deliverables;
CREATE POLICY "jtbd_project_deliverables_open_access" ON jtbd_project_deliverables
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_project_metadata
DROP POLICY IF EXISTS "jtbd_project_metadata_tenant_isolation" ON jtbd_project_metadata;
DROP POLICY IF EXISTS "jtbd_project_metadata_open_access" ON jtbd_project_metadata;
CREATE POLICY "jtbd_project_metadata_open_access" ON jtbd_project_metadata
FOR ALL USING (true) WITH CHECK (true);

-- jtbd_success_criteria
DROP POLICY IF EXISTS "jtbd_success_criteria_tenant_isolation" ON jtbd_success_criteria;
DROP POLICY IF EXISTS "jtbd_success_criteria_open_access" ON jtbd_success_criteria;
CREATE POLICY "jtbd_success_criteria_open_access" ON jtbd_success_criteria
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 5: OKR TABLES
-- ============================================================================

-- okr
DROP POLICY IF EXISTS "okr_tenant_isolation" ON okr;
DROP POLICY IF EXISTS "okr_open_access" ON okr;
CREATE POLICY "okr_open_access" ON okr
FOR ALL USING (true) WITH CHECK (true);

-- okr_jtbd_mapping
DROP POLICY IF EXISTS "okr_jtbd_mapping_tenant_isolation" ON okr_jtbd_mapping;
DROP POLICY IF EXISTS "okr_jtbd_mapping_open_access" ON okr_jtbd_mapping;
CREATE POLICY "okr_jtbd_mapping_open_access" ON okr_jtbd_mapping
FOR ALL USING (true) WITH CHECK (true);

-- okr_key_result_outcome_mapping
DROP POLICY IF EXISTS "kr_outcome_mapping_tenant_isolation" ON okr_key_result_outcome_mapping;
DROP POLICY IF EXISTS "okr_key_result_outcome_mapping_open_access" ON okr_key_result_outcome_mapping;
CREATE POLICY "okr_key_result_outcome_mapping_open_access" ON okr_key_result_outcome_mapping
FOR ALL USING (true) WITH CHECK (true);

-- key_result
DROP POLICY IF EXISTS "key_result_tenant_isolation" ON key_result;
DROP POLICY IF EXISTS "key_result_open_access" ON key_result;
CREATE POLICY "key_result_open_access" ON key_result
FOR ALL USING (true) WITH CHECK (true);

-- key_result_update
DROP POLICY IF EXISTS "key_result_update_tenant_isolation" ON key_result_update;
DROP POLICY IF EXISTS "key_result_update_open_access" ON key_result_update;
CREATE POLICY "key_result_update_open_access" ON key_result_update
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 6: PERSONA TABLES (Many tables with JWT tenant_id check)
-- ============================================================================

-- persona_annual_conferences
DROP POLICY IF EXISTS "tenant_isolation_annual_conferences" ON persona_annual_conferences;
DROP POLICY IF EXISTS "persona_annual_conferences_open_access" ON persona_annual_conferences;
CREATE POLICY "persona_annual_conferences_open_access" ON persona_annual_conferences
FOR ALL USING (true) WITH CHECK (true);

-- persona_career_trajectory
DROP POLICY IF EXISTS "tenant_isolation_career_trajectory" ON persona_career_trajectory;
DROP POLICY IF EXISTS "persona_career_trajectory_open_access" ON persona_career_trajectory;
CREATE POLICY "persona_career_trajectory_open_access" ON persona_career_trajectory
FOR ALL USING (true) WITH CHECK (true);

-- persona_case_studies
DROP POLICY IF EXISTS "tenant_isolation_case_studies" ON persona_case_studies;
DROP POLICY IF EXISTS "persona_case_studies_open_access" ON persona_case_studies;
CREATE POLICY "persona_case_studies_open_access" ON persona_case_studies
FOR ALL USING (true) WITH CHECK (true);

-- persona_case_study_investments
DROP POLICY IF EXISTS "tenant_isolation_case_investments" ON persona_case_study_investments;
DROP POLICY IF EXISTS "persona_case_study_investments_open_access" ON persona_case_study_investments;
CREATE POLICY "persona_case_study_investments_open_access" ON persona_case_study_investments
FOR ALL USING (true) WITH CHECK (true);

-- persona_case_study_metrics
DROP POLICY IF EXISTS "tenant_isolation_case_metrics" ON persona_case_study_metrics;
DROP POLICY IF EXISTS "persona_case_study_metrics_open_access" ON persona_case_study_metrics;
CREATE POLICY "persona_case_study_metrics_open_access" ON persona_case_study_metrics
FOR ALL USING (true) WITH CHECK (true);

-- persona_case_study_results
DROP POLICY IF EXISTS "tenant_isolation_case_results" ON persona_case_study_results;
DROP POLICY IF EXISTS "persona_case_study_results_open_access" ON persona_case_study_results;
CREATE POLICY "persona_case_study_results_open_access" ON persona_case_study_results
FOR ALL USING (true) WITH CHECK (true);

-- persona_customer_relationships
DROP POLICY IF EXISTS "tenant_isolation_customer_relationships" ON persona_customer_relationships;
DROP POLICY IF EXISTS "persona_customer_relationships_open_access" ON persona_customer_relationships;
CREATE POLICY "persona_customer_relationships_open_access" ON persona_customer_relationships
FOR ALL USING (true) WITH CHECK (true);

-- persona_evidence_summary
DROP POLICY IF EXISTS "tenant_isolation_evidence_summary" ON persona_evidence_summary;
DROP POLICY IF EXISTS "persona_evidence_summary_open_access" ON persona_evidence_summary;
CREATE POLICY "persona_evidence_summary_open_access" ON persona_evidence_summary
FOR ALL USING (true) WITH CHECK (true);

-- persona_expert_opinions
DROP POLICY IF EXISTS "tenant_isolation_expert_opinions" ON persona_expert_opinions;
DROP POLICY IF EXISTS "persona_expert_opinions_open_access" ON persona_expert_opinions;
CREATE POLICY "persona_expert_opinions_open_access" ON persona_expert_opinions
FOR ALL USING (true) WITH CHECK (true);

-- persona_external_stakeholders
DROP POLICY IF EXISTS "tenant_isolation_external_stakeholders" ON persona_external_stakeholders;
DROP POLICY IF EXISTS "persona_external_stakeholders_open_access" ON persona_external_stakeholders;
CREATE POLICY "persona_external_stakeholders_open_access" ON persona_external_stakeholders
FOR ALL USING (true) WITH CHECK (true);

-- persona_industry_relationships
DROP POLICY IF EXISTS "tenant_isolation_industry_relationships" ON persona_industry_relationships;
DROP POLICY IF EXISTS "persona_industry_relationships_open_access" ON persona_industry_relationships;
CREATE POLICY "persona_industry_relationships_open_access" ON persona_industry_relationships
FOR ALL USING (true) WITH CHECK (true);

-- persona_industry_reports
DROP POLICY IF EXISTS "tenant_isolation_industry_reports" ON persona_industry_reports;
DROP POLICY IF EXISTS "persona_industry_reports_open_access" ON persona_industry_reports;
CREATE POLICY "persona_industry_reports_open_access" ON persona_industry_reports
FOR ALL USING (true) WITH CHECK (true);

-- persona_internal_networks
DROP POLICY IF EXISTS "tenant_isolation_internal_networks" ON persona_internal_networks;
DROP POLICY IF EXISTS "persona_internal_networks_open_access" ON persona_internal_networks;
CREATE POLICY "persona_internal_networks_open_access" ON persona_internal_networks
FOR ALL USING (true) WITH CHECK (true);

-- persona_internal_stakeholders
DROP POLICY IF EXISTS "tenant_isolation_internal_stakeholders" ON persona_internal_stakeholders;
DROP POLICY IF EXISTS "persona_internal_stakeholders_open_access" ON persona_internal_stakeholders;
CREATE POLICY "persona_internal_stakeholders_open_access" ON persona_internal_stakeholders
FOR ALL USING (true) WITH CHECK (true);

-- persona_month_in_life
DROP POLICY IF EXISTS "tenant_isolation_milo" ON persona_month_in_life;
DROP POLICY IF EXISTS "persona_month_in_life_open_access" ON persona_month_in_life;
CREATE POLICY "persona_month_in_life_open_access" ON persona_month_in_life
FOR ALL USING (true) WITH CHECK (true);

-- persona_monthly_objectives
DROP POLICY IF EXISTS "tenant_isolation_monthly_objectives" ON persona_monthly_objectives;
DROP POLICY IF EXISTS "persona_monthly_objectives_open_access" ON persona_monthly_objectives;
CREATE POLICY "persona_monthly_objectives_open_access" ON persona_monthly_objectives
FOR ALL USING (true) WITH CHECK (true);

-- persona_monthly_stakeholders
DROP POLICY IF EXISTS "tenant_isolation_monthly_stakeholders" ON persona_monthly_stakeholders;
DROP POLICY IF EXISTS "persona_monthly_stakeholders_open_access" ON persona_monthly_stakeholders;
CREATE POLICY "persona_monthly_stakeholders_open_access" ON persona_monthly_stakeholders
FOR ALL USING (true) WITH CHECK (true);

-- persona_public_research
DROP POLICY IF EXISTS "tenant_isolation_public_research" ON persona_public_research;
DROP POLICY IF EXISTS "persona_public_research_open_access" ON persona_public_research;
CREATE POLICY "persona_public_research_open_access" ON persona_public_research
FOR ALL USING (true) WITH CHECK (true);

-- persona_regulatory_stakeholders
DROP POLICY IF EXISTS "tenant_isolation_regulatory_stakeholders" ON persona_regulatory_stakeholders;
DROP POLICY IF EXISTS "persona_regulatory_stakeholders_open_access" ON persona_regulatory_stakeholders;
CREATE POLICY "persona_regulatory_stakeholders_open_access" ON persona_regulatory_stakeholders
FOR ALL USING (true) WITH CHECK (true);

-- persona_research_quantitative_results
DROP POLICY IF EXISTS "tenant_isolation_research_quantitative" ON persona_research_quantitative_results;
DROP POLICY IF EXISTS "persona_research_quantitative_results_open_access" ON persona_research_quantitative_results;
CREATE POLICY "persona_research_quantitative_results_open_access" ON persona_research_quantitative_results
FOR ALL USING (true) WITH CHECK (true);

-- persona_stakeholder_influence_map
DROP POLICY IF EXISTS "tenant_isolation_influence_map" ON persona_stakeholder_influence_map;
DROP POLICY IF EXISTS "persona_stakeholder_influence_map_open_access" ON persona_stakeholder_influence_map;
CREATE POLICY "persona_stakeholder_influence_map_open_access" ON persona_stakeholder_influence_map
FOR ALL USING (true) WITH CHECK (true);

-- persona_stakeholder_journey
DROP POLICY IF EXISTS "tenant_isolation_stakeholder_journey" ON persona_stakeholder_journey;
DROP POLICY IF EXISTS "persona_stakeholder_journey_open_access" ON persona_stakeholder_journey;
CREATE POLICY "persona_stakeholder_journey_open_access" ON persona_stakeholder_journey
FOR ALL USING (true) WITH CHECK (true);

-- persona_stakeholder_value_exchange
DROP POLICY IF EXISTS "tenant_isolation_value_exchange" ON persona_stakeholder_value_exchange;
DROP POLICY IF EXISTS "persona_stakeholder_value_exchange_open_access" ON persona_stakeholder_value_exchange;
CREATE POLICY "persona_stakeholder_value_exchange_open_access" ON persona_stakeholder_value_exchange
FOR ALL USING (true) WITH CHECK (true);

-- persona_statistic_history
DROP POLICY IF EXISTS "tenant_isolation_statistic_history" ON persona_statistic_history;
DROP POLICY IF EXISTS "persona_statistic_history_open_access" ON persona_statistic_history;
CREATE POLICY "persona_statistic_history_open_access" ON persona_statistic_history
FOR ALL USING (true) WITH CHECK (true);

-- persona_supporting_statistics
DROP POLICY IF EXISTS "tenant_isolation_supporting_statistics" ON persona_supporting_statistics;
DROP POLICY IF EXISTS "persona_supporting_statistics_open_access" ON persona_supporting_statistics;
CREATE POLICY "persona_supporting_statistics_open_access" ON persona_supporting_statistics
FOR ALL USING (true) WITH CHECK (true);

-- persona_vendor_relationships
DROP POLICY IF EXISTS "tenant_isolation_vendor_relationships" ON persona_vendor_relationships;
DROP POLICY IF EXISTS "persona_vendor_relationships_open_access" ON persona_vendor_relationships;
CREATE POLICY "persona_vendor_relationships_open_access" ON persona_vendor_relationships
FOR ALL USING (true) WITH CHECK (true);

-- persona_week_in_life
DROP POLICY IF EXISTS "tenant_isolation_wilo" ON persona_week_in_life;
DROP POLICY IF EXISTS "persona_week_in_life_open_access" ON persona_week_in_life;
CREATE POLICY "persona_week_in_life_open_access" ON persona_week_in_life
FOR ALL USING (true) WITH CHECK (true);

-- persona_weekly_meetings
DROP POLICY IF EXISTS "tenant_isolation_weekly_meetings" ON persona_weekly_meetings;
DROP POLICY IF EXISTS "persona_weekly_meetings_open_access" ON persona_weekly_meetings;
CREATE POLICY "persona_weekly_meetings_open_access" ON persona_weekly_meetings
FOR ALL USING (true) WITH CHECK (true);

-- persona_weekly_milestones
DROP POLICY IF EXISTS "tenant_isolation_weekly_milestones" ON persona_weekly_milestones;
DROP POLICY IF EXISTS "persona_weekly_milestones_open_access" ON persona_weekly_milestones;
CREATE POLICY "persona_weekly_milestones_open_access" ON persona_weekly_milestones
FOR ALL USING (true) WITH CHECK (true);

-- persona_year_in_life
DROP POLICY IF EXISTS "tenant_isolation_yilo" ON persona_year_in_life;
DROP POLICY IF EXISTS "persona_year_in_life_open_access" ON persona_year_in_life;
CREATE POLICY "persona_year_in_life_open_access" ON persona_year_in_life
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 7: ROLE TABLES
-- ============================================================================

-- role_kpis
DROP POLICY IF EXISTS "role_kpis_tenant_policy" ON role_kpis;
DROP POLICY IF EXISTS "role_kpis_open_access" ON role_kpis;
CREATE POLICY "role_kpis_open_access" ON role_kpis
FOR ALL USING (true) WITH CHECK (true);

-- role_stakeholder_interactions
DROP POLICY IF EXISTS "role_stakeholder_interactions_tenant_policy" ON role_stakeholder_interactions;
DROP POLICY IF EXISTS "role_stakeholder_interactions_open_access" ON role_stakeholder_interactions;
CREATE POLICY "role_stakeholder_interactions_open_access" ON role_stakeholder_interactions
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 8: STRATEGIC THEMES
-- ============================================================================

DROP POLICY IF EXISTS "strategic_themes_tenant_isolation" ON strategic_themes;
DROP POLICY IF EXISTS "strategic_themes_open_access" ON strategic_themes;
CREATE POLICY "strategic_themes_open_access" ON strategic_themes
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 9: DEEPAGENTS_TOOL_USAGE
-- ============================================================================

DROP POLICY IF EXISTS "deepagents_usage_tenant" ON deepagents_tool_usage;
DROP POLICY IF EXISTS "deepagents_tool_usage_open_access" ON deepagents_tool_usage;
CREATE POLICY "deepagents_tool_usage_open_access" ON deepagents_tool_usage
FOR ALL USING (
    auth.uid() IS NOT NULL
    OR auth.role() = 'service_role'
    OR auth.role() = 'anon'
) WITH CHECK (true);

-- ============================================================================
-- SECTION 10: TENANT_* TABLES (Simplified for single tenant)
-- ============================================================================

-- tenant_agents - keep existing policies but add open read for single tenant
DROP POLICY IF EXISTS "tenant_agents_user_readable" ON tenant_agents;
DROP POLICY IF EXISTS "Users can read their tenant agents" ON tenant_agents;

DROP POLICY IF EXISTS "tenant_agents_single_tenant_read" ON tenant_agents;
CREATE POLICY "tenant_agents_single_tenant_read" ON tenant_agents
FOR SELECT USING (
    auth.uid() IS NOT NULL
    OR auth.role() = 'service_role'
    OR auth.role() = 'anon'
);

-- tenant_apps - simplify
DROP POLICY IF EXISTS "tenant_apps_user_readable" ON tenant_apps;
DROP POLICY IF EXISTS "Users can read their tenant apps" ON tenant_apps;

DROP POLICY IF EXISTS "tenant_apps_single_tenant_read" ON tenant_apps;
CREATE POLICY "tenant_apps_single_tenant_read" ON tenant_apps
FOR SELECT USING (
    auth.uid() IS NOT NULL
    OR auth.role() = 'service_role'
    OR auth.role() = 'anon'
);

-- tenant_configurations - simplify
DROP POLICY IF EXISTS "tenant_config_user_readable" ON tenant_configurations;

DROP POLICY IF EXISTS "tenant_configurations_single_tenant_read" ON tenant_configurations;
CREATE POLICY "tenant_configurations_single_tenant_read" ON tenant_configurations
FOR SELECT USING (
    auth.uid() IS NOT NULL
    OR auth.role() = 'service_role'
    OR auth.role() = 'anon'
);

-- ============================================================================
-- SECTION 11: KNOWLEDGE DOCUMENTS (Keep user-level security but simplify tenant)
-- ============================================================================

DROP POLICY IF EXISTS "Users can read accessible documents" ON knowledge_documents;

DROP POLICY IF EXISTS "knowledge_documents_single_tenant_read" ON knowledge_documents;
CREATE POLICY "knowledge_documents_single_tenant_read" ON knowledge_documents
FOR SELECT USING (
    -- User owns the document
    auth.uid() = user_id
    -- Or document is public
    OR access_policy = 'public'
    -- Or authenticated user in single tenant can see all non-private docs
    OR (auth.uid() IS NOT NULL AND access_policy != 'private')
    -- Or service role
    OR auth.role() = 'service_role'
);

-- document_chunks - simplify
DROP POLICY IF EXISTS "Users can read accessible chunks" ON document_chunks;

DROP POLICY IF EXISTS "document_chunks_single_tenant_read" ON document_chunks;
CREATE POLICY "document_chunks_single_tenant_read" ON document_chunks
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM knowledge_documents kd
        WHERE kd.id = document_chunks.document_id
        AND (
            auth.uid() = kd.user_id
            OR kd.access_policy = 'public'
            OR (auth.uid() IS NOT NULL AND kd.access_policy != 'private')
            OR auth.role() = 'service_role'
        )
    )
);

-- extracted_entities - simplify
DROP POLICY IF EXISTS "Users can read accessible entities" ON extracted_entities;

DROP POLICY IF EXISTS "extracted_entities_single_tenant_read" ON extracted_entities;
CREATE POLICY "extracted_entities_single_tenant_read" ON extracted_entities
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM knowledge_documents kd
        WHERE kd.id = extracted_entities.document_id
        AND (
            auth.uid() = kd.user_id
            OR kd.access_policy = 'public'
            OR (auth.uid() IS NOT NULL AND kd.access_policy != 'private')
            OR auth.role() = 'service_role'
        )
    )
);

-- ============================================================================
-- SECTION 12: ORG_FUNCTIONS - Add industry-based policy
-- ============================================================================

-- Add open access policy for org_functions (filtering by industry is done in app layer)
DROP POLICY IF EXISTS "org_functions_tenant_policy" ON org_functions;

DROP POLICY IF EXISTS "org_functions_open_access" ON org_functions;
CREATE POLICY "org_functions_open_access" ON org_functions
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify all tenant-based policies have been simplified:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public' AND qual::text LIKE '%tenant%';
