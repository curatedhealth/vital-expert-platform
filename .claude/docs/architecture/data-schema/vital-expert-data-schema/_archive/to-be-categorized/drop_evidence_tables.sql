-- Clean up any existing evidence tables before running create_evidence_system.sql
DROP VIEW IF EXISTS v_role_evidence_summary CASCADE;
DROP VIEW IF EXISTS v_persona_evidence_summary CASCADE;
DROP TABLE IF EXISTS persona_evidence_sources CASCADE;
DROP TABLE IF EXISTS role_evidence_sources CASCADE;
DROP TABLE IF EXISTS evidence_links CASCADE;
DROP TABLE IF EXISTS evidence_sources CASCADE;
DROP FUNCTION IF EXISTS link_evidence_to_object CASCADE;
DROP FUNCTION IF EXISTS get_object_evidence CASCADE;
DROP FUNCTION IF EXISTS update_evidence_search_vector CASCADE;

-- Now you can run create_evidence_system.sql

