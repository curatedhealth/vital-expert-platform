# tools/ - Custom Tools and Utilities

**Specialized tools and utilities for VITAL Platform operations.**

---

## Structure

```
tools/
├── validation/         - Configuration and data validation
├── cli/               - Custom CLI tools (future)
├── monitoring/        - Monitoring utilities (future)
└── compliance/        - Compliance tools (future)
```

---

## Available Tools

### validation/

#### validate-config.sh
**Validates environment configuration**

```bash
./tools/validation/validate-config.sh
```

**What it checks:**
- ✅ Required environment variables
- ✅ Recommended environment variables
- ✅ DATABASE_URL format
- ✅ SUPABASE_URL format
- ✅ NODE_ENV value
- ✅ Configuration completeness

**Output:**
- Errors: Missing required variables or invalid formats
- Warnings: Missing recommended variables
- Success: All validation passed

**Exit codes:**
- `0`: Validation passed
- `1`: Validation failed (errors found)

**Usage:**
```bash
# Validate current environment
./tools/validation/validate-config.sh

# Use in CI/CD
./tools/validation/validate-config.sh && ./scripts/deployment/deploy.sh
```

---

## Future Tools

### CLI (tools/cli/)

#### vital-ops
**Unified CLI for VITAL operations**

```bash
# Planned commands
vital-ops catalog                    # View command catalog
vital-ops catalog --update          # Update CATALOG.md
vital-ops deploy --env production   # Deploy to environment
vital-ops health                    # Health check
vital-ops logs --service ai-engine  # View logs
vital-ops backup --create          # Create backup
```

### Monitoring (tools/monitoring/)

#### Performance Analysis
```bash
# Planned
./tools/monitoring/analyze-performance.sh
./tools/monitoring/generate-report.sh
./tools/monitoring/alert-dashboard.sh
```

### Compliance (tools/compliance/)

#### Compliance Scanning
```bash
# Planned
./tools/compliance/scan.sh
./tools/compliance/generate-report.sh
./tools/compliance/check-policy.sh
```

---

## Creating New Tools

### Tool Categories

#### Validation Tools
- Check configuration validity
- Validate data formats
- Verify system state
- Pre-deployment checks

#### Analysis Tools
- Performance analysis
- Log analysis
- Error pattern detection
- Resource usage analysis

#### Generation Tools
- Report generation
- Documentation generation
- Configuration generation
- Test data generation

#### Management Tools
- Resource management
- Cleanup utilities
- Optimization tools
- Maintenance utilities

---

## Tool Development Guidelines

### Requirements
1. **Single purpose**: One tool, one job
2. **Clear output**: User-friendly messages
3. **Exit codes**: 0 for success, non-zero for failure
4. **Error handling**: Use `set -euo pipefail`
5. **Documentation**: Include --help flag
6. **Testing**: Test before committing

### Template
```bash
#!/usr/bin/env bash
# Tool Name - Brief description

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VITAL_OPS_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source common functions
source "$VITAL_OPS_ROOT/lib/shell/common.sh"

# Help message
if [[ "${1:-}" == "--help" ]]; then
    cat << EOF
Tool Name - Brief description

Usage:
    $0 [options]

Options:
    --help      Show this help message

Examples:
    $0
    $0 --option value

Exit Codes:
    0   Success
    1   Error
EOF
    exit 0
fi

print_header "Tool Name"

# Tool logic here

log_success "Complete!"
exit 0
```

### Adding a New Tool

1. **Create tool file**
   ```bash
   touch tools/category/tool-name.sh
   chmod +x tools/category/tool-name.sh
   ```

2. **Implement tool**
   - Use template above
   - Add --help flag
   - Use common functions
   - Handle errors

3. **Test tool**
   ```bash
   ./tools/category/tool-name.sh
   ./tools/category/tool-name.sh --help
   ```

4. **Document tool**
   - Update this README
   - Add to CATALOG.md
   - Add usage examples

5. **Commit**
   ```bash
   git add tools/category/tool-name.sh
   git commit -m "Add tool: tool-name"
   ```

---

## tools/ vs scripts/ vs bin/

### Use tools/ for:
- ✅ Specialized utilities
- ✅ Analysis and reporting
- ✅ Validation and checking
- ✅ One-off operations
- ✅ Development tools

### Use scripts/ for:
- 📁 Operational automation
- 📁 Deployment procedures
- 📁 Service management
- 📁 Data operations
- 📁 Recurring tasks

### Use bin/ for:
- 🎯 Quick-access commands
- 🎯 Frequently used operations
- 🎯 User-friendly wrappers
- 🎯 Common workflows

---

## Common Library

All tools should use shared functions from `lib/shell/common.sh`:

```bash
# Source common functions
source "$VITAL_OPS_ROOT/lib/shell/common.sh"

# Available functions
log_info "Information message"
log_success "Success message"
log_warning "Warning message"
log_error "Error message"
print_header "Section Header"
check_required_commands "command1" "command2"
require_env_var "VAR_NAME"
```

See: `../lib/shell/common.sh` for all available functions.

---

## Examples

### Validation Example
```bash
# Validate before deployment
./tools/validation/validate-config.sh && \
./tools/validation/validate-schema.sh && \
./scripts/deployment/production/deploy.sh
```

### Analysis Example
```bash
# Analyze performance
./tools/monitoring/analyze-performance.sh --since "1 hour ago"

# Generate report
./tools/monitoring/generate-report.sh --output ./reports/
```

### Cleanup Example
```bash
# Clean up old resources
./tools/maintenance/cleanup-old-logs.sh --days 30
./tools/maintenance/cleanup-old-backups.sh --keep 10
```

---

## Related

- **bin/**: `../bin/` - Quick-access commands
- **scripts/**: `../scripts/` - Automation scripts
- **lib/**: `../lib/` - Shared libraries
- **docs/**: `../docs/` - Documentation
- **CATALOG**: `../CATALOG.md` - Complete reference

---

**Last Updated**: November 21, 2024  
**Maintained By**: DevOps Team
