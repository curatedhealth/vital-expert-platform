# Tables with Tenant ID - Summary Report

**Generated:** Based on Supabase database query  
**Total Tables with tenant_id:** 259 tables

## Key Findings

### Nullable vs Non-Nullable tenant_id

**Non-Nullable (NOT NULL) tenant_id:** 150+ tables
- These tables require tenant_id for proper multi-tenant isolation
- Examples: `agents`, `conversations`, `user_panels`, `jtbd`, `personas`, etc.

**Nullable (NULL allowed) tenant_id:** 100+ tables
- These tables allow NULL tenant_id, which may indicate:
  - Global/shared data that can be accessed across tenants
  - Legacy data that hasn't been migrated
  - System-level tables that don't need tenant isolation
- Examples: `agents` (nullable), `jtbd_core` (nullable), `personas` (nullable)

## Table Categories

### Core Multi-Tenant Tables
- `tenants` (the tenant table itself)
- `tenant_agents`
- `tenant_apps`
- `tenant_configurations`
- `tenant_feature_flags`
- `tenant_members`
- `tenant_organizations`
- `tenant_usage_tracking`

### Agent-Related Tables (50+ tables)
- `agents`, `agent_sessions`, `agent_metrics`, `agent_ratings`
- `agent_graphs`, `agent_workflows`, `agent_roles`
- `agent_interaction_logs`, `agent_selection_logs`
- `agent_tenant_access`, `agent_tenants`
- And many more...

### JTBD (Jobs To Be Done) Tables (40+ tables)
- `jtbd`, `jtbd_core`, `jtbd_outcomes`
- `jtbd_ai_assessments`, `jtbd_pain_points`
- `jtbd_competitive_alternatives`, `jtbd_competitive_strengths`
- `jtbd_workflow_activities`, `jtbd_workflow_stages`
- And many more...

### Persona Tables (40+ tables)
- `personas`
- `persona_annual_conferences`, `persona_career_trajectory`
- `persona_case_studies`, `persona_communication_channels`
- `persona_education`, `persona_expert_opinions`
- And many more...

### Organizational Structure Tables
- `org_functions`, `org_departments`, `org_roles`
- `org_responsibilities`, `org_hierarchy`
- `org_locations`, `org_teams`
- `function_tenants`, `department_tenants`, `role_tenants`

### User & Session Tables
- `user_panels`, `user_sessions`, `user_roles`
- `user_role_assignments`, `profiles`
- `ask_expert_sessions`, `conversations`
- `mode3_sessions`, `agent_sessions`

### Strategic Planning Tables
- `strategic_themes`, `strategic_pillars`, `strategic_priorities`
- `okr`, `key_result`, `key_result_update`
- `value_drivers`, `value_insights`
- `missions`

### Project & Process Tables
- `projects`, `project_phases`, `project_deliverables`
- `processes`, `process_activities`, `process_kpis`
- `work_packages`, `tasks`, `deliverables`

### Knowledge & Domain Tables
- `knowledge_documents`, `knowledge_domains`, `knowledge_sources`
- `domains`, `domain_diseases`, `domain_products`
- `domain_therapeutic_areas`, `domain_regulatory_frameworks`

### Compliance & Security Tables
- `compliance_records`, `gdpr_consent_records`
- `gdpr_data_subject_requests`, `gdpr_retention_policies`
- `data_encryption_keys`, `data_retention_policies`
- `audit_log`, `mode3_audit_log`

### Analytics & Metrics Tables
- `analytics_events`, `performance_metrics`
- `agent_metrics`, `feature_usage`
- `token_usage_summary`, `quota_tracking`
- `worker_pool_metrics`, `tool_execution_log`

### Panel & Discussion Tables
- `user_panels`, `panel_discussions`
- `panel_configurations`, `panel_templates`
- `panel_facilitator_configs`, `panel_response_templates`
- `votes`

### Workflow & Template Tables
- `workflow_templates`, `templates`, `template_library`
- `node_library`, `node_collections`
- `services_registry`, `routing_policies`

### Backup Tables
- `agents_backup_pre_agentos2`
- `capabilities_backup_phase6`
- `jtbd_backup_phase1`, `jtbd_backup_phase5`
- `jtbd_backup_pre_normalization`
- `jtbd_competitive_alternatives_backup_phase7`
- `jtbd_core_backup_phase5`, `jtbd_core_deprecated`
- `jtbd_roles_backup`
- `personas_backup_phase7`

### View Tables (with tenant_id)
- `v_active_sessions`
- `v_agent_complete`
- `v_ai_opportunity_ranking`
- `v_bau_jtbd_dashboard`
- `v_jtbd_ai_summary`
- `v_jtbd_by_org`
- `v_jtbd_completeness`
- `v_mode3_active_sessions`
- `v_mode3_session_summary`
- `v_odi_opportunity_dashboard`
- `v_okr_progress`
- `v_operations_hierarchy`
- `v_persona_archetype_dashboard`
- `v_project_jtbd_dashboard`
- `v_projects_hierarchy`
- `v_strategic_cascade`
- `v_strategic_hierarchy`
- `v_tenant_benefit_summary`
- `v_tenant_value_investigation_summary`

## Tables WITHOUT tenant_id (Notable)

These are reference/lookup tables that are typically shared across tenants:
- `tenants` (the tenant table itself doesn't have tenant_id)
- `organizations` (base organization table)
- `feature_flags` (global feature definitions)
- `users`, `user_profiles`
- `prompts`, `tools`, `workflows` (base definitions)
- `knowledge_base` (global knowledge)
- Reference tables: `therapeutic_areas`, `disease_areas`, `countries`, etc.
- Junction tables for many-to-many relationships
- System tables: `migration_tracking`, `health_checks`, etc.

## Recommendations

1. **Review Nullable tenant_id Columns**: Consider making tenant_id NOT NULL where appropriate for better data isolation
2. **Add Missing Foreign Keys**: Ensure all tenant_id columns have proper foreign key constraints to `tenants(id)`
3. **Add Indexes**: Verify indexes exist on tenant_id columns for query performance
4. **RLS Policies**: Ensure Row Level Security (RLS) policies are enabled and correct for all tenant-scoped tables
5. **Backup Tables**: Consider archiving or removing backup tables after migration verification
6. **Views**: Review views with tenant_id to ensure they properly filter by tenant

## Next Steps

1. Run foreign key constraint check
2. Verify RLS policies on all tenant-scoped tables
3. Check for missing indexes on tenant_id columns
4. Review nullable tenant_id columns for data integrity
5. Audit backup tables for cleanup
