# File Organization Plan

## Analysis Summary
After analyzing the codebase, I've identified numerous files that can be organized and cleaned up. The project has accumulated many temporary scripts, test files, and documentation during development.

## File Categories

### 1. KEEP (Essential Files)
These files are actively used by the application:

#### Core Application Files
- `src/` - Main application source code
- `package.json`, `package-lock.json` - Dependencies
- `next.config.js`, `tsconfig.json`, `tailwind.config.ts` - Configuration
- `components.json` - UI component configuration
- `vercel.json` - Deployment configuration
- `cypress.config.ts` - Testing configuration
- `postcss.config.js` - CSS processing

#### Essential Documentation
- `README.md` - Main project documentation
- `LICENSE` - License file
- `SECURITY.md` - Security documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history

#### Database & Infrastructure
- `database/` - Database schemas and migrations
- `supabase/` - Supabase configuration
- `k8s/` - Kubernetes configurations
- `infrastructure/` - Infrastructure as code

### 2. ARCHIVE (Important but Not Currently Used)
These files contain valuable information but are not actively used:

#### Migration Scripts (Archive to `archive/migrations/`)
- `add-agent-org-columns.js`
- `apply-agent-org-migration.js`
- `apply-cloud-rag-migration.js`
- `apply-key-updates.js`
- `apply-migration-cli.js`
- `apply-migration-direct.js`
- `apply-migration-with-service-key.js`
- `create-agent-org-mapping.js`
- `create-complete-digital-health-agents.js`
- `create-comprehensive-mock-agents.js`
- `create-prompt-starters.js`
- `create-rag-tables.js`
- `create-tables-direct.js`
- `create-test-user.js`
- `create-user-hicham.js`
- `create-working-user.js`
- `deprecate-local-supabase.js`
- `disable-email-confirmation.js`
- `import-agents-robust.js`
- `import-agents-unique-names.js`
- `import-agents-with-uuid.js`
- `import-comprehensive-agents-fixed.js`
- `import-comprehensive-agents.js`
- `import-digital-health-agents-fixed.js`
- `import-digital-health-agents.js`
- `import-market-access-agents.js`
- `import-medical-affairs-agents.js`
- `import-prism-prompts.js`
- `link-prompts-to-agents.js`
- `map-agents-to-org-structure.js`
- `migrate-all-data-to-cloud.js`
- `migrate-avatar-icons-base64.js`
- `migrate-avatar-icons-to-cloud.js`
- `migrate-complete-agents.js`
- `migrate-comprehensive-org-structure.js`
- `migrate-general-icons-to-cloud.js`
- `migrate-simple.js`
- `refine-digital-health-agents.js`
- `setup-agent-mappings.js`
- `setup-agent-relationships-fixed.js`
- `setup-agent-relationships.js`
- `setup-cloud-rag-direct.js`
- `setup-cloud-rag-system.js`
- `setup-org-structure.js`
- `setup-prompt-performance-tracking.js`
- `setup-rag-system-configuration.js`
- `setup-vector-extension.js`
- `sync-agents-to-environments.js`
- `update-supabase-cloud.js`
- `update-supabase-env.js`
- `upload-to-supabase-cloud.js`

#### Verification Scripts (Archive to `archive/verification/`)
- `check-agent-org-mapping.js`
- `check-agent-schema.js`
- `check-agents-schema.js`
- `check-org-schema.js`
- `check-relationship-tables.js`
- `check-table-schema.js`
- `check-user-status.js`
- `comprehensive-digital-health-verification.js`
- `comprehensive-supabase-check.js`
- `comprehensive-supabase-fix.js`
- `detailed-org-verification.js`
- `final-agent-import-summary.js`
- `final-agent-org-summary.js`
- `final-verification.js`
- `verify-agent-org-mapping.js`
- `verify-comprehensive-org-structure.js`
- `verify-digital-health-complete.js`
- `verify-migration.js`
- `verify-org-structure.js`

#### Test Scripts (Archive to `archive/tests/`)
- `test-ask-expert-functionality.js`
- `test-cloud-rag-system.js`
- `test-complete-prompt-system-with-performance.js`
- `test-complete-prompt-system.js`
- `test-direct-connection.ts`
- `test-enhanced-rag-system.js`
- `test-frontend-data-loading.js`
- `test-langchain-comprehensive.js`
- `test-langchain-functional.js`
- `test-prompt-crud.js`
- `test-prompt-enhancement-modal.js`
- `test-prompt-functionality.js`
- `test-prompt-starters.js`
- `test-prompts-api.js`
- `test-supabase-connection.js`
- `test_token_tracking.py`

#### Fix Scripts (Archive to `archive/fixes/`)
- `comprehensive_eslint_fix.js`
- `fix-all-supabase-automated.js`
- `fix-all-supabase-routes.js`
- `fix-sql-syntax-error.js`
- `fix_all_eslint_issues.js`

#### Data Files (Archive to `archive/data/`)
- `🤖 AI Agents Registry 65d441afe2f24fbbad9465ee79e513ae_all.csv`
- `Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv`
- `Functions 2753dedf985680178336f15f9342a9a7_all.csv`
- `Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv`
- `Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv`
- `agent-sync-report.json`
- `ask-expert-test-report.json`
- `functional-test-results.json`
- `phase2-test-report.json`
- `test-results.json`
- `vital_agents_registry_250_complete.json`

#### SQL Files (Archive to `archive/sql/`)
- `apply-enhanced-fields-simple.sql`
- `apply-schema-first.sql`
- `check-agents-schema.sql`
- `check-knowledge-domains-schema.sql`
- `check-llm-providers-schema.sql`
- `check-schema.sql`
- `CREATE_KNOWLEDGE_DOMAINS.sql`
- `create-prompt-usage-table.sql`
- `cloud-rag-migration-clean.sql`
- `cloud-rag-migration-simple.sql`
- `cloud-rag-migration.sql`
- `enable-vector-extension.sql`
- `insert-correct-schema.sql`
- `insert-data-clean.sql`
- `insert-data-final.sql`
- `insert-data-only.sql`
- `insert-data.sql`
- `insert-final-correct.sql`
- `insert-working.sql`
- `local_schema.sql`
- `minimal-insert.sql`
- `restore-254-agents-complete.sql`
- `restore-all-agents.sql`
- `schema_dump.sql`
- `seed-agents-clean.sql`
- `simple-insert.sql`
- `setup-performance-tracking-database.sql`
- `supabase-migration-langchain-updated.sql`
- `supabase-setup.sql`

### 3. DELETE (Temporary/Unused Files)
These files can be safely deleted:

#### Log Files
- `dev.log`
- `prod.log`

#### Temporary Files
- `checkpoints.sqlite`
- `checkpoints.sqlite-shm`
- `checkpoints.sqlite-wal`
- `tsconfig.tsbuildinfo`

#### Shell Scripts (if not needed)
- `apply-direct-sql.sh`
- `apply-migration.sh`
- `fix_all_eslint.sh`
- `fix_common_issues.sh`
- `fix_console.sh`
- `fix_critical_issues.sh`
- `fix_eslint_comprehensive.sh`
- `fix_imports_and_unused.sh`
- `fix_targeted_eslint.sh`
- `fix_typescript_issues.sh`
- `fix_unused_vars.sh`
- `run-migration-cli.sh`
- `setup-complete-migration.sh`
- `setup-complete.sh`
- `setup-json-migration.sh`
- `setup-supabase-cli.sh`
- `setup-supabase.sh`
- `show-migration.sh`
- `sync-github.sh`
- `sync-to-notion.sh`

#### Duplicate/Backup Files
- `DIGITAL_HEALTH_AGENTS_15 (1).json`
- `DIGITAL_HEALTH_AGENTS_30_COMPLETE (1).json`
- `DIGITAL_HEALTH_AGENTS_30_COMPLETE (2).json`
- `DIGITAL_HEALTH_EXPANDED_STRUCTURE_30 (1).md`
- `LANGCHAIN_FULL_IMPLEMENTATION_COMPLET.md` (duplicate)
- `package-simple.json` (backup)

#### HTML Files (if not needed)
- `vital-expert-brand-identity.html`
- `vital-expert-framework-page.html`
- `vital-expert-landing-page.html`
- `vital-expert-platform-page.html`
- `vital-expert-services-page.html`

### 4. ORGANIZE DOCUMENTATION
Move documentation files to organized folders:

#### Move to `docs/status/`
- `AGENT_AUDIT_REPORT.md`
- `AGENT_ORCHESTRATOR_ANALYSIS.md`
- `AGENT_SYSTEM_COMPLETE.md`
- `AGENT_TRANSFORMATION_ACTION_PLAN.md`
- `AGENT_TRANSFORMATION_COMPLETE.md`
- `AGENT_UPGRADE_COMPLETE.md`
- `AGENT_UPGRADE_SUMMARY.md`
- `AUTHENTICATION_SYSTEM_READY.md`
- `AUTONOMOUS_AGENT_ARCHITECTURE.md`
- `AUTONOMOUS_AGENT_INTEGRATION_COMPLETE.md`
- `AUTONOMOUS_MODE_FIXED.md`
- `DATABASE_AND_UI_ADDITIONS.md`
- `DATABASE_FUNCTIONS_FIXED.md`
- `DATABASE_LINKS.md`
- `DATABASE_SAFETY.md`
- `DATABASE_SETUP_COMPLETE.md`
- `DEPLOYMENT_SUCCESS_SUMMARY.md`
- `DEVELOPMENT_ACCESS_FIXED.md`
- `DEVELOPMENT_ACCESS_READY.md`
- `DEVELOPMENT_PRODUCTION_WORKFLOW.md`
- `DOCUMENTATION_WIKI_COMPLETE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `INTEGRATION_TEST_RESULTS.md`
- `LOCAL_SUPABASE_DEPRECATED.md`
- `MIGRATION_COMPLETE.md`
- `MVP_DEPLOYMENT_GUIDE.md`
- `PHASE_1_WEEK_1_COMPLETE.md`
- `PHASE_1_WEEK_2_COMPLETE.md`
- `PRISM_PROMPT_LIBRARY_COMPLETE.md`
- `PRODUCTION_DEPLOYMENT_GUIDE.md`
- `PROMPT_CRUD_COMPLETE.md`
- `PROMPT_ENHANCEMENT_MODAL_COMPLETE.md`
- `PROMPT_PERFORMANCE_TRACKING_COMPLETE.md`
- `REALITY_CHECK_ASSESSMENT.md`
- `SUPABASE_AUTHENTICATION_READY.md`
- `SUPABASE_EMAIL_CONFIRMATION_FIX.md`
- `SUPABASE_SETUP.md`
- `TOKEN_TRACKING_COMPLETE_SETUP.md`
- `TOKEN_TRACKING_SETUP_COMPLETE.md`
- `TOOL_REGISTRY_INTEGRATION_COMPLETE.md`
- `TOOLS_INTEGRATION_COMPLETE.md`
- `VERCEL_DEPLOYMENT_COMPLETE.md`

#### Move to `docs/guides/`
- `ASK_EXPERT_COMPLETE_DOCUMENTATION.md`
- `ASK_EXPERT_FUNCTIONALITY_ASSESSMENT.md`
- `ASK_EXPERT_SETUP_GUIDE.md`
- `CLOUD_RAG_SETUP_FIXED.md`
- `CLOUD_RAG_SETUP_GUIDE.md`
- `CLOUD_RAG_SYSTEM_COMPLETE.md`
- `DUAL_MODE_DEPLOYMENT_PLAN.md`
- `KNOWLEDGE_DOMAINS_SETUP.md`
- `KNOWLEDGE_DOMAINS_SUMMARY.md`
- `KNOWLEDGE_RAG_ANALYSIS.md`
- `LANGCHAIN_ENHANCED_FEATURES.md`
- `LANGCHAIN_FULL_IMPLEMENTATION_COMPLETE.md`
- `LANGCHAIN_FULL_INTEGRATION_MANUAL_AUTOMATIC.md`
- `LANGCHAIN_INTEGRATION_TEST_SUMMARY.md`
- `LANGCHAIN_UNUSED_CAPABILITIES.md`
- `LANGCHAIN_USAGE_ANALYSIS.md`
- `manual-upload-guide.md`
- `NEXT_STEPS.md`
- `QUICK_REFERENCE.md`
- `QUICK_SETUP_INSTRUCTIONS.md`
- `QUICK_START_GUIDE_LANGCHAIN.md`
- `QUICK_START_LANGCHAIN.md`
- `quick-database-setup.md`
- `RAG_ENHANCEMENTS.md`
- `RAG_ENHANCEMENTS_COMPLETE.md`
- `RECOMMENDED_KNOWLEDGE_DOMAINS.md`
- `setup-database-manual.md`
- `TEST_LANGCHAIN_FEATURES.md`
- `VERCEL_DEPLOYMENT_GUIDE.md`

#### Move to `docs/technical/`
- `AI_AGENT_TEMPLATE_FIELD_ANALYSIS.md`
- `ALTERNATIVE_ACCESS_METHOD.md`
- `apply-migration-manual.md`
- `apply-sql-manual.md`
- `claude.md`
- `DOMAIN_BASED_LLM_ROUTING.md`
- `eslint_detailed.json`
- `fix-authentication.md`
- `fix-navigation-auth-complete.md`
- `get-anon-key.md`
- `get-real-anon-key.md`
- `get-supabase-keys.md`
- `NOTION_QUICK_COMMANDS.md`
- `NOTION_SETUP_COMPLETE.md`
- `PROMPT_ENHANCEMENT_QUICK_REFERENCE.md`
- `PROMPT_ENHANCEMENT_TECHNICAL_GUIDE.md`
- `PROMPT_ENHANCEMENT_USER_GUIDE.md`
- `SHARE_PARENT_PAGE.md`
- `vital-token-tracking-langchain-updated.md`

#### Move to `docs/reports/`
- `FINAL_LANGCHAIN_STATUS_REPORT.md`
- `FINAL_RAG_SYSTEM_DOCUMENTATION.md`

## Proposed Directory Structure

```
vital-expert-platform/
├── src/                          # Main application code
├── docs/                         # Organized documentation
│   ├── status/                   # Status reports
│   ├── guides/                   # User guides
│   ├── technical/                # Technical documentation
│   └── reports/                  # Analysis reports
├── archive/                      # Archived files
│   ├── migrations/               # Migration scripts
│   ├── verification/             # Verification scripts
│   ├── tests/                    # Test scripts
│   ├── fixes/                    # Fix scripts
│   ├── data/                     # Data files
│   └── sql/                      # SQL files
├── database/                     # Active database files
├── supabase/                     # Supabase configuration
├── k8s/                          # Kubernetes configs
├── infrastructure/               # Infrastructure as code
├── tests/                        # Active test files
├── cypress/                      # E2E tests
├── public/                       # Static assets
├── node_modules/                 # Dependencies
├── .next/                        # Next.js build output
├── coverage/                     # Test coverage
├── exports/                      # Export outputs
├── sample-knowledge/             # Sample knowledge base
├── notion-setup/                 # Notion integration
├── tools/                        # Development tools
├── scripts/                      # Active scripts
├── config/                       # Configuration files
├── backend/                      # Backend services
├── frontend/                     # Frontend components
├── shared/                       # Shared utilities
├── mock-database/                # Mock database
├── data/                         # Data files
├── backups/                      # Backup files
└── [config files]               # Root config files
```

## Next Steps
1. Create the archive directory structure
2. Move files to appropriate locations
3. Delete confirmed unused files
4. Update any references to moved files
5. Test the application to ensure nothing is broken
