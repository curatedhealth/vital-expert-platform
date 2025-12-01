# VITAL Platform - Test Execution Guide

**Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Active
**Owner**: VITAL QA Team

---

## Quick Start

```bash
# Run all tests
pnpm test

# Run security tests only
pnpm test apps/vital-system/src/__tests__/security

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Running Tests Locally](#2-running-tests-locally)
3. [Running Tests in CI/CD](#3-running-tests-in-cicd)
4. [Test Debugging](#4-test-debugging)
5. [Test Performance](#5-test-performance)

---

## 1. Test Environment Setup

### Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start local Supabase
npx supabase start

# 3. Run migrations
./scripts/run-security-migrations.sh local

# 4. Verify setup
pnpm test --version
```

### Environment Variables

Create `.env.test.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from-supabase-start-output]
SUPABASE_SERVICE_ROLE_KEY=[from-supabase-start-output]

# Test Configuration
NODE_ENV=test
ALLOW_DEV_BYPASS=false
```

---

## 2. Running Tests Locally

### Test Commands

```bash
# All tests
pnpm test

# Specific directory
pnpm test apps/vital-system/src/__tests__/security

# Specific file
pnpm test apps/vital-system/src/__tests__/security/multi-tenant-isolation.test.ts

# Specific test (by name)
pnpm test -t "should ignore x-tenant-id header"

# Watch mode (re-run on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Update snapshots
pnpm test -u
```

### Test Filtering

```bash
# Run only tests matching pattern
pnpm test --testNamePattern="Fix #1"

# Run tests in specific file
pnpm test multi-tenant-isolation

# Run tests with tag
pnpm test --testPathPattern=security

# Skip tests
pnpm test --testPathIgnorePatterns=integration
```

---

## 3. Running Tests in CI/CD

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to `main` and `develop`
- Manual workflow dispatch

### CI/CD Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: ./scripts/run-security-migrations.sh local

      - name: Run tests
        run: pnpm test:ci
```

### Staging Environment Tests

```bash
# Run against staging database
NEXT_PUBLIC_SUPABASE_URL=$STAGING_SUPABASE_URL \
NEXT_PUBLIC_SUPABASE_ANON_KEY=$STAGING_ANON_KEY \
pnpm test
```

---

## 4. Test Debugging

### Verbose Output

```bash
# Show detailed test output
pnpm test --verbose

# Show console.log statements
pnpm test --silent=false

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasename}",
        "--config",
        "jest.config.js",
        "--runInBand"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Issues

#### Issue: "Cannot connect to database"

**Solution**:
```bash
# Restart Supabase
npx supabase stop
npx supabase start

# Check status
npx supabase status
```

#### Issue: "Migration failed"

**Solution**:
```bash
# Reset database
npx supabase db reset

# Run migrations manually
./scripts/run-security-migrations.sh local
```

#### Issue: "Test timeout"

**Solution**:
```bash
# Increase timeout
pnpm test --testTimeout=30000
```

---

## 5. Test Performance

### Performance Monitoring

```bash
# Run tests with performance profiling
pnpm test --logHeapUsage

# Show test execution times
pnpm test --verbose --testLocationInResults
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Total test suite** | <5 minutes | ~3 minutes |
| **Security tests** | <2 minutes | ~1.5 minutes |
| **Single test** | <500ms | ~200ms avg |
| **Membership validation** | <50ms | ~24ms |
| **RLS context setting** | <10ms | ~6ms |

### Optimizing Slow Tests

```bash
# Identify slow tests
pnpm test --verbose | grep -E '\([0-9]+ ms\)'

# Run specific slow test
pnpm test -t "slow-test-name" --verbose
```

---

## Appendix A: Test Scripts

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:security": "jest apps/vital-system/src/__tests__/security",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

---

**Document Classification**: Internal
**Contact**: qa@vital.ai
