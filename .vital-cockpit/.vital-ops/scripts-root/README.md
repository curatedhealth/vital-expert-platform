# VITAL Platform Scripts

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
