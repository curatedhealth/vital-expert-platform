-- ============================================================================
-- COMPLETE DUAL ORGANIZATION SETUP & AGENT MAPPING
-- Execute this single file to set up everything
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║         🏢 DUAL ORGANIZATION SETUP - PHARMA & DIGITAL HEALTH                ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- Run the individual scripts
\echo 'Step 1/3: Creating Pharma Organization...'
\i database/sql/seeds/01_pharma_organization.sql

\echo ''
\echo 'Step 2/3: Creating Digital Health Organization...'
\i database/sql/seeds/02_digital_health_organization.sql

\echo ''
\echo 'Step 3/3: Mapping Agents to Both Organizations...'
\i database/sql/seeds/03_map_agents_to_both_orgs.sql

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                          ✅ SETUP COMPLETE!                                  ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'

