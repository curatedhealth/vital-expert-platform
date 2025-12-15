-- =============================================================================
-- VITAL Platform - CDC Triggers for Neo4j Sync
-- =============================================================================
-- Creates database triggers that invoke the CDC Edge Function on changes.
--
-- Run via Supabase Dashboard: SQL Editor
-- =============================================================================

-- Create a generic CDC function that calls our Edge Function
CREATE OR REPLACE FUNCTION notify_cdc_neo4j()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  edge_function_url TEXT := 'https://bomltkhixeatxuoxmolq.supabase.co/functions/v1/cdc-neo4j';
BEGIN
  -- Build payload based on operation type
  IF TG_OP = 'INSERT' THEN
    payload := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)::jsonb,
      'old_record', NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload := jsonb_build_object(
      'type', 'UPDATE',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)::jsonb,
      'old_record', row_to_json(OLD)::jsonb
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object(
      'type', 'DELETE',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', NULL,
      'old_record', row_to_json(OLD)::jsonb
    );
  END IF;

  -- Use pg_net extension to call Edge Function asynchronously
  -- This is non-blocking and won't slow down the original transaction
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
    ),
    body := payload
  );

  -- Return appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CREATE TRIGGERS FOR ONTOLOGY TABLES
-- =============================================================================

-- org_functions
DROP TRIGGER IF EXISTS cdc_org_functions ON org_functions;
CREATE TRIGGER cdc_org_functions
  AFTER INSERT OR UPDATE OR DELETE ON org_functions
  FOR EACH ROW
  EXECUTE FUNCTION notify_cdc_neo4j();

-- org_departments
DROP TRIGGER IF EXISTS cdc_org_departments ON org_departments;
CREATE TRIGGER cdc_org_departments
  AFTER INSERT OR UPDATE OR DELETE ON org_departments
  FOR EACH ROW
  EXECUTE FUNCTION notify_cdc_neo4j();

-- org_roles
DROP TRIGGER IF EXISTS cdc_org_roles ON org_roles;
CREATE TRIGGER cdc_org_roles
  AFTER INSERT OR UPDATE OR DELETE ON org_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_cdc_neo4j();

-- personas
DROP TRIGGER IF EXISTS cdc_personas ON personas;
CREATE TRIGGER cdc_personas
  AFTER INSERT OR UPDATE OR DELETE ON personas
  FOR EACH ROW
  EXECUTE FUNCTION notify_cdc_neo4j();

-- agents
DROP TRIGGER IF EXISTS cdc_agents ON agents;
CREATE TRIGGER cdc_agents
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION notify_cdc_neo4j();

-- =============================================================================
-- ALTERNATIVE: Using Supabase Realtime (simpler, already built-in)
-- =============================================================================
-- If pg_net extension is not enabled, you can use Supabase Realtime instead.
-- The tables are already enabled for Realtime in the Supabase Dashboard.
--
-- To enable Realtime for a table:
-- ALTER PUBLICATION supabase_realtime ADD TABLE org_functions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE org_departments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE org_roles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE personas;
-- ALTER PUBLICATION supabase_realtime ADD TABLE agents;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check triggers are created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'cdc_%'
ORDER BY event_object_table;

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================
-- DROP TRIGGER IF EXISTS cdc_org_functions ON org_functions;
-- DROP TRIGGER IF EXISTS cdc_org_departments ON org_departments;
-- DROP TRIGGER IF EXISTS cdc_org_roles ON org_roles;
-- DROP TRIGGER IF EXISTS cdc_personas ON personas;
-- DROP TRIGGER IF EXISTS cdc_agents ON agents;
-- DROP FUNCTION IF EXISTS notify_cdc_neo4j();
