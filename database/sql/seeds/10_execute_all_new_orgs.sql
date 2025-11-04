-- ============================================================================
-- EXECUTE ALL NEW ORGANIZATIONS
-- Creates 5 new organizations and maps all agents
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║         🏢 EXPANDING TO 7 TOTAL ORGANIZATIONS                                ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

\echo 'Existing Organizations:'
\echo '  ✅ Pharmaceutical Company'
\echo '  ✅ Digital Health Startup'
\echo ''

\echo 'Creating 5 New Organizations...'
\echo ''

\echo 'Step 1/5: Creating Biotech Organization...'
\i database/sql/seeds/04_biotech_organization.sql

\echo ''
\echo 'Step 2/5: Creating MedTech Organization...'
\i database/sql/seeds/05_medtech_organization.sql

\echo ''
\echo 'Step 3/5: Creating Payer Organization...'
\i database/sql/seeds/06_payer_organization.sql

\echo ''
\echo 'Step 4/5: Creating Consulting Organization...'
\i database/sql/seeds/07_consulting_organization.sql

\echo ''
\echo 'Step 5/5: Creating Individual/Freelancer Organization...'
\i database/sql/seeds/08_individual_organization.sql

\echo ''
\echo 'Mapping all 254 agents to new organizations...'
\i database/sql/seeds/09_map_agents_to_all_new_orgs.sql

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                   ✅ ALL 7 ORGANIZATIONS COMPLETE!                           ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'

