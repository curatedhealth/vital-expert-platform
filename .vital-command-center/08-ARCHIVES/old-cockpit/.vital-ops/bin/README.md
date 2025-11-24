# bin/ - Executable Scripts

**Quick-access executable scripts for common operations.**

---

## Available Commands

### health-check
**Check system health status**

```bash
./bin/health-check
```

- ✅ Checks all services
- ✅ Tests database connectivity
- ✅ Validates environment variables
- ✅ Checks disk space and memory
- ✅ Quick diagnostic overview

### setup-environment
**Setup environment for development/staging/production**

```bash
./bin/setup-environment <dev|staging|prod>
```

**Examples:**
```bash
# Setup development
./bin/setup-environment dev

# Setup staging
./bin/setup-environment staging

# Setup production
./bin/setup-environment prod
```

**What it does:**
- Loads environment-specific configuration
- Checks for required dependencies
- Installs pnpm dependencies
- Tests database connection
- Provides next steps

---

## Usage Patterns

### Quick Health Check
```bash
# Run before starting work
./bin/health-check

# Check if everything is working
```

### Environment Setup
```bash
# First time setup
./bin/setup-environment dev

# After pulling new changes
./bin/setup-environment dev

# Before deploying to staging
./bin/setup-environment staging
```

---

## Creating New bin/ Scripts

### Requirements
1. **Executable**: `chmod +x bin/script-name`
2. **Shebang**: Start with `#!/usr/bin/env bash`
3. **No extension**: Name without `.sh` extension
4. **Error handling**: Use `set -euo pipefail`
5. **Common functions**: Source `lib/shell/common.sh`

### Template
```bash
#!/usr/bin/env bash
# Script Name - Brief description

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VITAL_OPS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source common functions
source "$VITAL_OPS_ROOT/lib/shell/common.sh"

print_header "Script Name"

# Your script logic here

log_success "Complete!"
```

### Adding to bin/
1. Create script in `bin/`
2. Make executable: `chmod +x bin/script-name`
3. Test: `./bin/script-name`
4. Document in this README
5. Add to CATALOG.md

---

## bin/ vs scripts/

### Use bin/ for:
- ✅ Frequently used commands
- ✅ One-line entry points
- ✅ User-facing operations
- ✅ Common workflows

### Use scripts/ for:
- 📁 Implementation details
- 📁 Multiple related scripts
- 📁 Environment-specific scripts
- 📁 Helper/utility scripts

**Pattern**: `bin/` scripts often call `scripts/` for implementation

**Example:**
```bash
# bin/deploy-production
./scripts/deployment/production/deploy.sh
```

---

## Future bin/ Scripts

### Planned
- `bin/deploy-production` - Deploy to production
- `bin/run-migrations` - Run database migrations
- `bin/start-services` - Start all services
- `bin/run-tests` - Run full test suite
- `bin/create-backup` - Create database backup
- `bin/view-logs` - View service logs

### When to Add
Add a bin/ script when you find yourself typing the same command frequently or when you want to simplify a complex operation for team members.

---

## Related

- **Scripts**: `../scripts/` - Detailed implementation scripts
- **Tools**: `../tools/` - Custom utilities and CLI
- **Docs**: `../docs/runbooks/` - Operational runbooks
- **CATALOG**: `../CATALOG.md` - Complete command reference

---

**Last Updated**: November 21, 2024  
**Maintained By**: DevOps Team
