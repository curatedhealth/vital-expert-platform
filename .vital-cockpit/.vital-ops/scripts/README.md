# scripts/ - Automation Scripts

All automation scripts organized by function.

## Structure

```
scripts/
├── database/          - Database operations
│   ├── migrations/   - Migration automation
│   ├── backups/      - Backup scripts
│   ├── queries/      - Query execution
│   ├── seeds/        - Data seeding
│   └── maintenance/  - DB maintenance
├── deployment/        - Deployment automation
│   ├── dev/          - Development deployment
│   ├── staging/      - Staging deployment
│   ├── production/   - Production deployment
│   └── rollback/     - Rollback procedures
├── services/          - Service management
│   ├── start/        - Start services
│   ├── stop/         - Stop services
│   └── health/       - Health checks
├── setup/             - Initial setup scripts
├── monitoring/        - Monitoring scripts
├── data-management/   - Data import/export/sync
│   ├── import/       - Import scripts
│   ├── export/       - Export scripts
│   └── sync/         - Sync scripts
├── testing/           - Testing automation
│   ├── integration/  - Integration tests
│   ├── e2e/          - End-to-end tests
│   └── performance/  - Performance tests
├── utilities/         - Helper scripts
│   ├── cleanup/      - Cleanup utilities
│   ├── validation/   - Validation scripts
│   └── transformers/ - Data transformers
└── ci/                - CI/CD scripts (future)
```

## Usage

### Database Scripts

```bash
# Run migrations
./scripts/database/migrations/run-all.sh

# Create backup
./scripts/database/backups/create-backup.sh

# Seed development data
./scripts/database/seeds/seed-dev.sh
```

### Deployment Scripts

```bash
# Deploy to development
./scripts/deployment/dev/deploy.sh

# Deploy to production
./scripts/deployment/production/deploy.sh

# Rollback deployment
./scripts/deployment/rollback/rollback-prod.sh
```

### Service Management

```bash
# Start all services
./scripts/services/start/start-all.sh

# Stop all services
./scripts/services/stop/stop-all.sh

# Health check
./scripts/services/health/health-check.sh
```

### Data Management

```bash
# Import agents
./scripts/data-management/import/import-agents.sh <file>

# Export data
./scripts/data-management/export/export-all.sh

# Sync environments
./scripts/data-management/sync/sync-staging-to-dev.sh
```

### Testing

```bash
# Run integration tests
./scripts/testing/integration/run-all.sh

# Run E2E tests
./scripts/testing/e2e/run-e2e.sh

# Performance tests
./scripts/testing/performance/load-test.sh
```

## Best Practices

### Script Guidelines

1. **Use shared library**: Source `../../lib/shell/common.sh` for common functions
2. **Add help text**: Include `--help` flag with usage information
3. **Validate inputs**: Use validation functions from common.sh
4. **Log properly**: Use `log_info`, `log_error`, etc.
5. **Handle errors**: Exit with appropriate codes
6. **Document**: Add comments explaining complex logic

### Example Script Template

```bash
#!/bin/bash
# Description: What this script does
# Usage: ./script-name.sh [options]

# Load shared library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../lib/shell/common.sh"

# Validate environment
validate_environment "$1"

# Main logic
log_info "Starting operation..."
# ... your code ...
log_success "Operation complete!"
```

### Environment Variables

Scripts may require environment variables. Load them using:

```bash
source ../../config/environments/.env.dev
```

## Naming Conventions

- Use kebab-case: `deploy-production.sh`
- Be descriptive: `create-database-backup.sh` not `backup.sh`
- Add action prefix: `start-`, `stop-`, `check-`, `deploy-`, etc.
- Add environment suffix where applicable: `-dev.sh`, `-prod.sh`

## Testing Scripts

Before committing:

1. Test in development environment first
2. Verify error handling
3. Check log output
4. Test with invalid inputs
5. Document any prerequisites

## Archived Scripts

Old or deprecated scripts are moved to `../_archive/2024-q4/`

## Quick Reference

For complete command catalog, see `../CATALOG.md`

---

**Note**: This directory was consolidated from `scripts/` and `scripts-root/` as part of the DevOps restructure (Phase 2).
