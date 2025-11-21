# docs/ - Operations Documentation  

**Operational documentation, runbooks, and guides for VITAL Platform operations.**

⚠️ **Note**: This is for operational docs. For technical/architectural docs, see `../vital-expert-docs/`

---

## Structure

```
docs/
├── runbooks/           - Operational procedures (CRITICAL)
│   ├── deployment.md
│   ├── incident-response.md
│   ├── rollback.md
│   └── disaster-recovery.md (future)
├── guides/             - How-to operational guides
│   └── setup-development.md
├── deployment-guides/  - Platform deployment guides
│   ├── railway/        - Railway deployment
│   ├── AI_ENGINE_DEPLOYMENT.md
│   └── UNIFIED_DEPLOYMENT_PLAN.md
├── testing/            - Testing documentation
│   ├── test-plans/
│   ├── quality-assurance/
│   └── testing-strategy/
├── troubleshooting/    - Quick-fix guides
└── architecture/       - Operational architecture (future)
```

---

## Documentation Split

### .vital-ops/docs/ (THIS DIRECTORY)
**Operations & DevOps Documentation**

- ✅ Runbooks (deployment, incidents, rollback)
- ✅ Deployment guides
- ✅ Testing documentation  
- ✅ Troubleshooting guides
- ✅ Setup guides
- ✅ Operational procedures

### ../vital-expert-docs/
**Product & Technical Documentation**

- ✅ Strategy & Product (01-03)
- ✅ Services & Assets (04-05)
- ✅ Architecture & Integrations (06-07)
- ✅ Implementation guides (08)
- ✅ API documentation (10)
- ✅ Data schema (11)
- ✅ Compliance & Training (14-15)
- ✅ Releases (16)

---

## Quick Reference

### Emergency Procedures
```bash
# Incident response
cat docs/runbooks/incident-response.md

# Emergency rollback
cat docs/runbooks/rollback.md
./scripts/deployment/rollback/emergency-rollback.sh
```

### Deployment
```bash
# Deployment runbook
cat docs/runbooks/deployment.md

# Railway deployment
cat docs/deployment-guides/railway/README.md

# AI Engine deployment
cat docs/deployment-guides/AI_ENGINE_DEPLOYMENT.md
```

### Setup & Development
```bash
# Setup development environment
cat docs/guides/setup-development.md

# Run setup script
../bin/setup-environment dev
```

### Testing
```bash
# Testing strategy
cat docs/testing/testing-strategy/

# Run tests
../scripts/testing/integration/run-all.sh
```

---

## Runbooks (CRITICAL)

### What are Runbooks?
Runbooks are step-by-step operational procedures for critical tasks and incidents.

### Available Runbooks
1. **deployment.md** - Production deployment procedures
2. **incident-response.md** - Emergency incident handling
3. **rollback.md** - Rollback procedures

### When to Use
- ⚠️ During incidents
- 🚀 During deployments
- 🔄 When rolling back
- 🔥 In emergencies

---

## Guides

### Development Setup
- **setup-development.md** - Complete dev environment setup
- Prerequisites, installation, verification
- Common issues and solutions

### Deployment Guides
- **railway/** - Railway platform deployment
- **AI_ENGINE_DEPLOYMENT.md** - AI Engine specific deployment
- **UNIFIED_DEPLOYMENT_PLAN.md** - Complete deployment strategy

---

## Testing Documentation

### Test Plans
```
docs/testing/test-plans/
├── integration-tests.md
├── e2e-tests.md
└── performance-tests.md
```

### Quality Assurance
```
docs/testing/quality-assurance/
├── test-coverage.md
├── qa-checklist.md
└── bug-tracking.md
```

### Running Tests
```bash
# All tests
../scripts/testing/integration/run-all.sh

# Specific tests
../scripts/testing/e2e/run-e2e.sh
../scripts/testing/performance/load-test.sh
```

---

## Troubleshooting

Quick-fix guides for common issues:
- Service issues
- Database problems
- Deployment failures
- Performance issues

See: `troubleshooting/` directory

---

## Best Practices

### Writing Runbooks

1. **Be concise** - Quick reference, not tutorial
2. **Include commands** - Copy-paste ready
3. **Add context** - When to use
4. **Link to details** - Reference vital-expert-docs for deep dives
5. **Update regularly** - After each incident

### Maintaining Documentation

- Update after incidents
- Review quarterly
- Keep examples current
- Cross-reference properly
- Test commands actually work

---

## Contributing

### Adding New Documentation

1. Choose correct category (runbooks/guides/troubleshooting)
2. Follow existing format
3. Add entry to this README
4. Update cross-references
5. Test all commands

### Updating Existing Docs

1. Update content
2. Update "Last Updated" date
3. Update version if major changes
4. Notify team of changes

---

## Cross-References

### To Technical Docs
For deep technical documentation, see:
- **Architecture**: `../vital-expert-docs/06-architecture/`
- **Implementation**: `../vital-expert-docs/08-implementation/`
- **API**: `../vital-expert-docs/10-api/`
- **Data Schema**: `../vital-expert-docs/11-data-schema/`

### To Operational Tools
For operational scripts and tools:
- **Scripts**: `../scripts/`
- **Tools**: `../tools/`
- **Bin**: `../bin/`

---

## Related

- **Complete Catalog**: `../CATALOG.md` - All commands and tools
- **Expert Docs**: `../vital-expert-docs/` - Technical documentation
- **Scripts**: `../scripts/` - Automation scripts
- **Tools**: `../tools/` - Custom tools

---

**Last Updated**: November 21, 2024  
**Maintained By**: DevOps Team  
**Review Frequency**: Quarterly
