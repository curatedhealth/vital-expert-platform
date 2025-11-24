-- VITAL Path Database - Complete Migration Runner
-- Run this file to apply all migrations in the correct order

-- Core Schema
\echo 'Setting up core schema...'
\i schema/main_schema.sql

\echo 'Applying 2024 migrations...'
-- Apply 2024 migrations in order
\i migrations/2024/20240101000000_initial_schema.sql
\i migrations/2024/20240101000001_rls_policies.sql
\i migrations/2024/20240102000000_agents_schema.sql
\i migrations/2024/20240102000002_capabilities_schema.sql
\i migrations/2024/20240102000003_capabilities_seed.sql
\i migrations/2024/20240102000005_rag_vector_schema.sql
\i migrations/2024/20240103000001_chat_and_knowledge_schema.sql
\i migrations/2024/20241218000000_create_icons_table.sql

\echo 'Applying 2025 migrations...'
-- Apply 2025 migrations in order
\i migrations/2025/20250120000000_healthcare_compliance_enhancement.sql
\i migrations/2025/20250120000001_healthcare_capabilities_seed.sql
\i migrations/2025/20250120000002_add_missing_agent_columns.sql
\i migrations/2025/20250120000003_fix_foreign_key_types.sql
\i migrations/2025/20250918120000_fix_agent_rls.sql
\i migrations/2025/20250918130000_allow_agent_updates.sql
\i migrations/2025/20250918_enhance_workflow_system.sql
\i migrations/2025/20250919120000_create_jtbd_core_table.sql
\i migrations/2025/20250919130000_comprehensive_agents_schema.sql
\i migrations/2025/20250919140000_llm_providers_schema.sql
\i migrations/2025/20250919141000_add_prompts_table.sql
\i migrations/2025/20250919150000_user_roles_rbac.sql
\i migrations/2025/20250919160000_create_jobs_table.sql
\i migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql
\i migrations/2025/20250919180000_resolve_table_naming_conflicts.sql
\i migrations/2025/20250919190000_create_prompts_table.sql
\i migrations/2025/20250920000000_add_user_agent_ownership.sql

\echo 'Applying functions...'
\i functions/vector-search-function.sql

\echo 'Applying RLS policies...'
\i policies/20240101000001_rls_policies.sql

\echo 'Loading seed data...'
\i seeds/initial_seed.sql

\echo 'Database setup complete!'
\echo 'All migrations applied successfully.'
