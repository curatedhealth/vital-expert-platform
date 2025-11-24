#!/usr/bin/env bash
# Config Validator - Validates environment configuration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VITAL_OPS_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source common functions
source "$VITAL_OPS_ROOT/lib/shell/common.sh"

print_header "Configuration Validation"

# Required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "OPENAI_API_KEY"
    "NODE_ENV"
)

# Optional but recommended
RECOMMENDED_VARS=(
    "SUPABASE_SERVICE_ROLE_KEY"
    "LANGCHAIN_API_KEY"
    "JWT_SECRET"
    "SESSION_SECRET"
)

errors=0
warnings=0

# Check required variables
log_info "Checking required variables..."
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        log_error "$var is NOT set (REQUIRED)"
        ((errors++))
    else
        log_success "$var is set"
    fi
done

echo ""

# Check recommended variables
log_info "Checking recommended variables..."
for var in "${RECOMMENDED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        log_warning "$var is NOT set (recommended)"
        ((warnings++))
    else
        log_success "$var is set"
    fi
done

echo ""

# Validate DATABASE_URL format
if [ -n "${DATABASE_URL:-}" ]; then
    if [[ "$DATABASE_URL" =~ ^postgresql:// ]]; then
        log_success "DATABASE_URL format is valid"
    else
        log_error "DATABASE_URL format is invalid (should start with postgresql://)"
        ((errors++))
    fi
fi

# Validate SUPABASE_URL format
if [ -n "${SUPABASE_URL:-}" ]; then
    if [[ "$SUPABASE_URL" =~ ^https:// ]]; then
        log_success "SUPABASE_URL format is valid"
    else
        log_error "SUPABASE_URL format is invalid (should start with https://)"
        ((errors++))
    fi
fi

# Validate NODE_ENV
if [ -n "${NODE_ENV:-}" ]; then
    if [[ "$NODE_ENV" =~ ^(development|staging|production)$ ]]; then
        log_success "NODE_ENV is valid: $NODE_ENV"
    else
        log_warning "NODE_ENV is unusual: $NODE_ENV (expected: development/staging/production)"
        ((warnings++))
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary:"
echo "  Errors: $errors"
echo "  Warnings: $warnings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $errors -gt 0 ]; then
    log_error "Configuration validation FAILED"
    exit 1
else
    log_success "Configuration validation PASSED"
    if [ $warnings -gt 0 ]; then
        log_warning "$warnings warnings found (review recommended)"
    fi
    exit 0
fi

