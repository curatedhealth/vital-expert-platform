# VITAL Platform Scripts

<<<<<<< Updated upstream
Organized collection of scripts for managing the VITAL platform development, deployment, and operations.

## Quick Reference

### Scripts Reduced: 328 → 0 files in root
**All scripts are now organized into logical subdirectories.**

## Directory Structure

```
scripts/
├── README.md                    # This file
├── package.json                 # Node.js dependencies
├── requirements.txt             # Python dependencies
├── components.json              # Component configuration
│
├── core/                        # Core operational scripts
│   ├── setup/                   # Environment and service setup
│   ├── deployment/              # Deployment automation
│   ├── monitoring/              # Health checks and monitoring
│   ├── knowledge/               # Knowledge base management
│   └── langchain/               # LangChain utilities
│
├── database/                    # Database operations
│   ├── migrations/              # Schema migrations
│   ├── seeds/                   # Data seeding scripts
│   ├── backups/                 # Backup and restore
│   ├── queries/                 # Utility queries
│   └── ask-panel/               # Ask panel database setup
│
├── data-management/             # Data import/export
│   ├── import/                  # Data imports
│   │   ├── agents/              # Agent data imports
│   │   ├── organizations/       # Organization structure
│   │   └── knowledge/           # Knowledge base data
│   ├── export/                  # Data exports
│   └── sync/                    # Data synchronization
│
├── development/                 # Development utilities
│   ├── code-quality/            # Linting and code fixes
│   ├── analysis/                # Code and data analysis
│   └── generators/              # Code generators
│
├── testing/                     # Testing scripts
│   └── (test scripts)           # Unit, integration, and E2E tests
│
├── validation/                  # Validation & verification
│   ├── data/                    # Data integrity checks
│   ├── schema/                  # Schema validation
│   └── security/                # Security audits
│
├── utilities/                   # General utilities
│   ├── cleanup/                 # Cleanup scripts
│   ├── transformers/            # Data transformers
│   └── helpers/                 # Helper functions
│
├── archive/                     # Archived/deprecated scripts
│   ├── 2024-q4/                 # Time-based archival
│   └── deprecated/              # Deprecated one-off scripts
│
├── deployment/                  # Deployment configurations
├── maintenance/                 # Maintenance scripts
├── setup/                       # Legacy setup scripts
├── sql/                         # SQL utilities
├── tools/                       # Tool integrations
└── notion/                      # Notion integration scripts
```

## Common Tasks

### Environment Setup

```bash
# Setup cloud environment
node core/setup/setup-cloud-env.js

# Setup local environment
bash core/setup/setup-env-from-local.sh

# Validate environment configuration
bash validation/data/validate-env.sh
```

### Database Operations

```bash
# Run migrations
node database/migrations/run-migrations.ts

# Seed database
node database/seeds/seed-basic-agents.js

# Backup database
bash database/backups/backup-database.sh

# Restore database
bash database/backups/restore-database.sh
```

### Data Management

```bash
# Import agent data
node data-management/import/agents/import-comprehensive-agents.ts

# Import organizational structure
node data-management/import/organizations/import-organizational-data.js

# Sync data
node data-management/sync/sync-notion-to-supabase.js

# Export data
node data-management/export/export-data-to-json.js
```

### Development

```bash
# Run code quality checks
node development/code-quality/auto_fix_eslint.js

# Analyze codebase
python development/analysis/analyze_agents_capabilities.py

# Generate code
python development/generators/generate_capabilities_migration.py
```

### Testing

```bash
# Run comprehensive test workflow
node testing/test-complete-workflow.js

# Test specific features
bash testing/test-ask-expert-fixes.sh
bash testing/test-autonomous-modes.sh
```

### Validation

```bash
# Verify database schema
node validation/schema/check-supabase-schema.ts

# Validate data integrity
node validation/data/verify-agent-org-data.ts

# Check architecture
node validation/data/verify-architecture.js

# Verify deployment
bash validation/data/verify-rls.sh
```

### Monitoring

```bash
# Health checks
bash core/monitoring/backend-health-check.sh

# Start monitoring stack
bash core/monitoring/setup-monitoring-stack.sh

# Check service status
node core/monitoring/supabase-cloud-status.js
```

### Deployment

```bash
# Deploy complete MVP
node core/deployment/deploy-complete-mvp.js

# Deploy with Docker
bash core/deployment/docker-backend-start.sh

# Verify deployment phases
bash core/deployment/verify-phase2-deployment.sh
```

## Dependencies

### Node.js Packages
Install with: `npm install`

Key dependencies:
- `@supabase/supabase-js` - Supabase client
- `@notionhq/client` - Notion API
- `@pinecone-database/pinecone` - Vector database
- `dotenv` - Environment variables

### Python Packages
Install with: `pip install -r requirements.txt`

Key dependencies:
- `psycopg2-binary` - PostgreSQL adapter
- `python-dotenv` - Environment variables
- `requests` - HTTP client

## Configuration

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Notion (optional)
NOTION_API_KEY=
NOTION_DATABASE_ID=

# Pinecone (optional)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
```

## Best Practices

### Before Running Scripts

1. **Backup**: Always backup data before running migrations or transformations
2. **Test**: Test scripts in development environment first
3. **Validate**: Check prerequisites and environment variables
4. **Document**: Update documentation if modifying scripts

### File Naming Conventions

- Use kebab-case: `my-script.js`
- Prefix with action: `setup-`, `deploy-`, `test-`, `verify-`
- Include purpose: `import-agent-data.js` not `import.js`

### Script Organization

- Place scripts in appropriate subdirectories
- Archive one-off scripts after completion
- Document script purpose and usage in comments
- Use consistent error handling and logging

## Troubleshooting

### Common Issues

**Scripts can't find modules**
```bash
# Install dependencies
npm install
pip install -r requirements.txt
```

**Environment variables not found**
```bash
# Copy example and configure
cp ../.env.example ../.env
# Edit .env with your values
```

**Database connection errors**
```bash
# Verify credentials
bash validation/data/validate-env.sh
# Test connection
node validation/schema/check-supabase-schema.ts
```

**Permission errors**
```bash
# Make scripts executable
chmod +x script-name.sh
```

## Migration from Old Structure

If you have references to old script paths, update them as follows:

- `setup-*.js` → `core/setup/setup-*.js`
- `deploy*.js` → `core/deployment/deploy*.js`
- `test-*.js` → `testing/test-*.js`
- `verify-*.js` → `validation/data/verify-*.js`
- `import-*.js` → `data-management/import/import-*.js`
- `seed-*.js` → `database/seeds/seed-*.js`

## Contributing

When adding new scripts:

1. Place in appropriate subdirectory
2. Follow naming conventions
3. Add documentation in comments
4. Update this README if adding new categories
5. Test thoroughly before committing

## Related Documentation

- [Main Project README](../README.md)
- [Database Schema Docs](../docs/architecture/schemas/)
- [Deployment Guide](../docs/deployment/)
- [API Documentation](../docs/api/)

## Support

For issues or questions:
- Check script comments for usage instructions
- Review logs in `./data/` directory
- Consult team documentation
- Create issue in project tracker
=======
This directory contains utility scripts for the VITAL Platform, organized by purpose.

## 📁 Directory Structure

### Root Level (Actively Used)
These scripts are referenced in `package.json` or `Makefile` and should remain in the root:

- `check-langchain-imports.js` - Compliance check for LangChain imports (used in `pnpm compliance:langchain`)
- `validate-environment.ts` - Environment validation (used in `pnpm validate:env`)
- `run-migrations.ts` - Database migration runner (used in `pnpm migrate`)

### `organized/` - Active Scripts by Category

#### `docker/` - Docker & Container Management
- `docker-backend-start.sh` - Start all backend services
- `docker-python-start.sh` - Start Python AI Engine only
- `start-services.sh` - Start all services
- `stop-services.sh` - Stop all services
- `start-docker-and-monitoring.sh` - Start Docker and monitoring stack

#### `deployment/` - Deployment & Verification
- `verify-phase2-deployment.sh` - Verify Phase 2 deployment
- `verify-phase3-deployment.sh` - Verify Phase 3 deployment
- `verify-phase4-deployment.sh` - Verify Phase 4 deployment
- `verify-phase4-enhanced-deployment.sh` - Verify enhanced Phase 4
- `deploy-rls.sh` - Deploy Row-Level Security policies
- `deploy.sh` - General deployment script
- `dev.sh` - Development environment setup

#### `database/` - Database Operations
- `verify-rls.sh` - Verify RLS policies (symlinked in root for backward compatibility)
- `deploy-rls.sh` - Deploy RLS policies (symlinked in root for backward compatibility)
- `backup-database.sh` - Backup database
- `backup-db.sh` - Alternative backup script
- `restore-database.sh` - Restore database
- `restore-db.sh` - Alternative restore script

#### `testing/` - Testing & Debugging
- `test-ask-expert-fixes.sh` - Test Ask Expert fixes
- `test-autonomous-modes.sh` - Test autonomous modes
- `test-db-connection.ts` - Test database connection
- `test-metrics-endpoints.sh` - Test metrics endpoints
- `test-mode2-fixes.sh` - Test Mode 2 fixes
- `test-pinecone-namespace.ts` - Test Pinecone namespace
- `test-verification-api-complete.ts` - Complete API verification tests
- `test-verification-ui.ts` - UI verification tests
- `backend-health-check.sh` - Backend health check
- `debug-*.sh`, `debug-*.js` - Debug scripts

#### `validation/` - Validation & Verification
- `validate-env.sh` - Environment validation (shell)
- `validate-org-hierarchy.js` - Organization hierarchy validation
- `verify-agent-org-data.ts` - Verify agent organization data
- `verify-agents.ts` - Verify agents
- `verify-business-function-assignments.ts` - Verify business function assignments
- `verify-migration.ts` - Verify migrations
- `verify-org-structure.ts` - Verify organization structure
- `check-*.ts`, `check-*.js` - Various check scripts
- `quick-audit.sh` - Quick audit script
- `schema-audit.js` - Schema audit

#### `maintenance/` - Maintenance & Analysis
- `analyze-*.js`, `analyze-*.ts` - Analysis scripts
- `query-*.js`, `query-*.ts` - Query scripts

#### `setup/` - Setup & Configuration
- `setup-*.sh`, `setup-*.ts`, `setup-*.mjs` - Setup scripts

#### `utilities/` - General Utilities
- `sync-*.js`, `sync-*.ts` - Synchronization scripts
- `cleanup-*.js` - Cleanup scripts
- `export-*.js` - Export scripts
- `import-*.js` - Import scripts
- Various utility scripts

### `archive/obsolete/` - Obsolete Scripts

Scripts that are no longer actively used but kept for reference:

- `migrations/` - Old migration scripts
- `data-seeding/` - One-time data seeding scripts
- `one-time-fixes/` - One-time fix scripts
- `old-updates/` - Old update scripts

### Existing Subdirectories

- `database/` - Database-specific scripts (RLS, etc.)
- `migration/` - Migration utilities
- `maintenance/` - Maintenance scripts
- `utilities/` - General utilities
- `testing/` - Testing scripts
- `tools/` - Tool-specific scripts
- `setup/` - Setup scripts
- `notion/` - Notion integration scripts
- `langchain/` - LangChain-related scripts

## 🚀 Usage

### Actively Used Scripts

```bash
# Check LangChain compliance
pnpm compliance:langchain

# Validate environment
pnpm validate:env

# Run migrations
pnpm migrate
pnpm migrate:status
pnpm migrate:dry-run

# Start Docker services
./scripts/organized/docker/docker-backend-start.sh
./scripts/organized/docker/docker-python-start.sh

# Verify RLS (symlink in root for backward compatibility)
./scripts/verify-rls.sh dev
# Or use direct path:
./scripts/organized/database/verify-rls.sh dev

# Deploy RLS (symlink in root for backward compatibility)
./scripts/deploy-rls.sh production
# Or use direct path:
./scripts/organized/database/deploy-rls.sh production
```

## 📝 Notes

- Scripts in the root directory are actively used and should not be moved
- Scripts in `organized/` are categorized by purpose
- Scripts in `archive/obsolete/` are kept for reference only
- Always check script dependencies before running
>>>>>>> Stashed changes
