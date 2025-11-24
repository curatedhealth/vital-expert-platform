-- =====================================================================
-- MASTER JTBD NORMALIZATION EXECUTION SCRIPT
-- =====================================================================
-- Purpose: Execute all JTBD normalization migrations in sequence
-- Version: 2.0
-- Last Updated: 2024-11-21
-- 
-- This script orchestrates the complete JTBD schema normalization:
-- 1. Cleanup JTBD core (remove violations)
-- 2. Create org mapping tables (junction tables with ID+NAME)
-- 3. Auto-sync triggers (keep names in sync)
-- 4. Value layer (value categories & drivers)
-- 5. AI layer (AI suitability & opportunities)
-- 6. Unified workflows (consolidate 4 workflow systems)
-- 7. Comprehensive views (aggregated query views)
--
-- Prerequisites:
-- - PostgreSQL 12+
-- - Existing org_functions, org_departments, org_roles tables
-- - Existing jtbd table (will be cleaned up)
--
-- Execution:
-- psql $DATABASE_URL -f 00_EXECUTE_JTBD_NORMALIZATION.sql
--
-- OR execute via Supabase MCP:
-- Run each phase file individually through the MCP tool
-- =====================================================================

\echo ''
\echo '======================================================================='
\echo '          JTBD NORMALIZATION - MASTER EXECUTION SCRIPT'
\echo '======================================================================='
\echo ''
\echo 'This script will execute all 6 phases of JTBD normalization:'
\echo '  Phase 1: Cleanup JTBD core table'
\echo '  Phase 2: Create org mapping junction tables'
\echo '  Phase 3: Create auto-sync triggers'
\echo '  Phase 4: Create value layer'
\echo '  Phase 5: Create AI layer'
\echo '  Phase 6: Create unified workflow system'
\echo '  Phase 7: Create comprehensive views'
\echo ''
\echo 'Estimated time: 5-10 seconds'
\echo ''

-- Phase 1: Cleanup JTBD Core
\echo ''
\echo '--- PHASE 1: Cleanup JTBD Core ---'
\echo 'Removing normalization violations from jtbd table...'
\i migrations/01_cleanup_jtbd_core.sql

-- Phase 2: Create Org Mapping Tables
\echo ''
\echo '--- PHASE 2: Create Org Mapping Tables ---'
\echo 'Creating junction tables for JTBD → Function/Dept/Role...'
\i migrations/02_create_jtbd_org_mappings.sql

-- Phase 3: Create Auto-Sync Triggers
\echo ''
\echo '--- PHASE 3: Create Auto-Sync Triggers ---'
\echo 'Creating triggers to sync _name columns...'
\i migrations/03_jtbd_name_sync_triggers.sql

-- Phase 4: Create Value Layer
\echo ''
\echo '--- PHASE 4: Create Value Layer ---'
\echo 'Creating value categories & drivers...'
\i migrations/04_create_value_layer.sql

-- Phase 5: Create AI Layer
\echo ''
\echo '--- PHASE 5: Create AI Layer ---'
\echo 'Creating AI suitability & opportunities tables...'
\i migrations/05_create_ai_layer.sql

-- Phase 6: Create Unified Workflows
\echo ''
\echo '--- PHASE 6: Create Unified Workflow System ---'
\echo 'Creating unified workflow templates...'
\i migrations/06_create_unified_workflows.sql

-- Phase 7: Create Comprehensive Views
\echo ''
\echo '--- PHASE 7: Create Comprehensive Views ---'
\echo 'Creating aggregated query views...'
\i views/jtbd_comprehensive_views.sql

-- Final Summary
\echo ''
\echo '======================================================================='
\echo '                    NORMALIZATION COMPLETE!'
\echo '======================================================================='
\echo ''
\echo 'Summary:'
\echo '  ✓ JTBD core table cleaned (no org columns, no JSONB/arrays)'
\echo '  ✓ Junction tables created (jtbd_functions, jtbd_departments, jtbd_roles)'
\echo '  ✓ Auto-sync triggers enabled (ID+NAME pattern)'
\echo '  ✓ Value layer created (6 categories, 13 drivers)'
\echo '  ✓ AI layer created (suitability scores, opportunities)'
\echo '  ✓ Unified workflow system created (templates → stages → tasks)'
\echo '  ✓ Comprehensive views created (v_jtbd_complete, v_persona_jtbd_inherited)'
\echo ''
\echo 'Next Steps:'
\echo '  1. Verify migration: SELECT * FROM v_jtbd_complete LIMIT 5;'
\echo '  2. Populate seed data for value/AI layers'
\echo '  3. Map existing JTBDs to roles via jtbd_roles table'
\echo '  4. Create workflow templates for key JTBDs'
\echo ''
\echo 'Documentation: See jtbds/README.md for complete reference'
\echo '======================================================================='
\echo ''
