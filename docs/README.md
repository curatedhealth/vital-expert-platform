# VITAL Platform Documentation

Welcome to the VITAL Platform documentation. This directory contains comprehensive guides, specifications, and reference materials for the platform.

## 📚 Documentation Structure

```
docs/
├── README.md                       # This file - documentation index
├── phases/                         # Phase documentation (PHASE_*.md files)
├── migrations/                     # Database migration docs (MIGRATION_*.md, DATABASE_*.md)
├── guides/                         # Setup and how-to guides (GUIDE.md, SETUP.md, QUICK_*.md)
├── deployment/                     # Deployment documentation
├── testing/                        # Test reports and verification docs
└── infrastructure/                 # Architecture, status, and system docs
```

## 🚀 Quick Start

### For Users
- **[Workflow Designer Guide](./guides/WORKFLOW-DESIGNER-GUIDE.md)** - Learn how to use the visual workflow builder

### For Developers
- **[Claude Instructions](../.claude/CLAUDE.md)** - AI assistant rules and guidelines
- **[System Architecture](./infrastructure/SERVICE_ARCHITECTURE.md)** - System architecture overview
- **[Documentation Convention](./infrastructure/DOCUMENTATION_CONVENTION.md)** - Documentation naming standards

## 📖 Available Documentation

### Phases

Project phase documentation and progress tracking:

| Phase | Location |
|-------|----------|
| Phase 0 - Data Loading | [phases/PHASE_0_*.md](./phases/) |
| Phase 1 - GraphRAG | [phases/PHASE_1_*.md](./phases/) |
| Phase 2 - Backend Integration | [phases/PHASE_2_*.md](./phases/) |
| Phase 3 - Deployment | [phases/PHASE_3_*.md](./phases/) |
| Phase 5 - Production | [phases/PHASE_5_*.md](./phases/) |

### Migrations

Database migrations and schema updates:

| Category | Location |
|----------|----------|
| Migration Guides | [migrations/MIGRATION_*.md](./migrations/) |
| Database Docs | [migrations/DATABASE_*.md](./migrations/) |
| Schema Changes | [migrations/SCHEMA_*.md](./migrations/) |
| SQL Scripts | [.vital-docs/vital-expert-docs/10-data-schema/](../.vital-docs/vital-expert-docs/10-data-schema/) |

### Guides

Setup and how-to guides:

| Guide | Location |
|-------|----------|
| Quick Start Guides | [guides/QUICK_*.md](./guides/) |
| Setup Guides | [guides/*SETUP*.md](./guides/) |
| Environment Setup | [guides/ENV_*.md](./guides/) |
| Integration Guides | [guides/INTEGRATION_*.md](./guides/) |
| Workflow Designer | [guides/WORKFLOW-DESIGNER-GUIDE.md](./guides/) |

### Deployment

Deployment guides and production documentation:

| Document | Location |
|----------|----------|
| Deployment Guides | [deployment/*DEPLOYMENT*.md](./deployment/) |
| Infrastructure | [deployment/*INFRASTRUCTURE*.md](./deployment/) |

### Testing

Test results, verification reports, and QA documentation:

| Category | Location |
|----------|----------|
| Test Reports | [testing/*TEST*.md](./testing/) |
| Verification Results | [testing/VERIFICATION_*.md](./testing/) |
| Audit Reports | [testing/*AUDIT*.md](./testing/) |

### Infrastructure

System architecture, status reports, and platform documentation:

| Category | Location |
|----------|----------|
| Architecture | [infrastructure/*ARCHITECTURE*.md](./infrastructure/) |
| Status Reports | [infrastructure/*STATUS*.md](./infrastructure/) |
| Completion Summaries | [infrastructure/*COMPLETE*.md](./infrastructure/) |
| System Docs | [infrastructure/VITAL*.md](./infrastructure/) |

## 🔍 Finding Documentation

### By Topic

- **Workflow Designer**: See [Workflow Designer Guide](./guides/WORKFLOW-DESIGNER-GUIDE.md)
- **AI Agents**: See [Root README - Agent Setup](../README.md)
- **Database**: See [Root README - Database Setup](../README.md)
- **Deployment**: See service-specific READMEs in `services/`

### By Component

- **Frontend Apps**:
  - `apps/vital-system/README.md` - Main VITAL System app
  - `apps/pharma/README.md` - Pharma app
  - `apps/digital-health-startup/README.md` - Digital Health Startup app

- **Backend Services**:
  - `services/ai-engine/README.md` - AI Engine (LangGraph + FastAPI)

- **Features**:
  - `apps/vital-system/src/features/workflow-designer/README.md` - Workflow Designer
  - `apps/vital-system/src/components/ai/README.md` - AI Components

## 📝 Documentation Convention

All documentation follows the [Documentation Convention](../DOCUMENTATION_CONVENTION.md) standards:

- **Core docs**: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md` (UPPERCASE)
- **Guides**: `{TOPIC}-GUIDE.md` (e.g., `DEPLOYMENT-GUIDE.md`)
- **Specs**: `{FEATURE}-SPEC.md` (e.g., `MODE1-SPEC.md`)
- **Integrations**: `{SERVICE}-INTEGRATION.md` (e.g., `SUPABASE-INTEGRATION.md`)
- **Reference**: `{TOPIC}-REFERENCE.md` (e.g., `API-REFERENCE.md`)

## 🆘 Getting Help

### Common Issues

For troubleshooting common issues:
1. Check the relevant guide in `docs/guides/`
2. Check the component's README
3. Check console logs and error messages
4. Review the [Workflow Designer Troubleshooting](./guides/WORKFLOW-DESIGNER-GUIDE.md#troubleshooting) section

### Support Resources

- **GitHub Issues**: Report bugs and feature requests
- **Team Documentation**: Internal team wiki (if available)
- **Code Comments**: In-code documentation for complex logic

## 🤝 Contributing to Documentation

To contribute or update documentation:

1. Follow the [Documentation Convention](../DOCUMENTATION_CONVENTION.md)
2. Use clear, concise language
3. Include code examples where appropriate
4. Add screenshots for UI features
5. Test all code examples
6. Keep documentation up-to-date with code changes

### Documentation Review Checklist

Before submitting documentation:

- [ ] Follows naming convention
- [ ] In correct directory
- [ ] Markdown renders correctly
- [ ] Links work
- [ ] Code examples tested
- [ ] No sensitive information
- [ ] Grammar/spelling checked

## 📋 Documentation Roadmap

### Priority 1 (Needed Soon)
- [ ] ARCHITECTURE.md - System architecture overview
- [ ] API-REFERENCE.md - Complete API documentation
- [ ] DEPLOYMENT-GUIDE.md - Production deployment guide

### Priority 2 (Nice to Have)
- [ ] TESTING-GUIDE.md - Testing procedures
- [ ] TROUBLESHOOTING.md - Common issues compendium
- [ ] GLOSSARY.md - Terms and definitions

### Priority 3 (Future)
- [ ] VIDEO-TUTORIALS.md - Video tutorial index
- [ ] BEST-PRACTICES.md - Development best practices
- [ ] PERFORMANCE-GUIDE.md - Performance optimization

## 📊 Documentation Status

| Category | Status | Count |
|----------|--------|-------|
| Phases | 🟢 Complete | 20+ |
| Migrations | 🟢 Complete | 18+ |
| Guides | 🟢 Complete | 18+ |
| Deployment | 🟡 In Progress | 2+ |
| Testing | 🟢 Complete | 12+ |
| Infrastructure | 🟢 Complete | 30+ |

**Legend**: 🟢 Complete | 🟡 In Progress | 🔴 Not Started

## 🔗 External Resources

- **React Flow**: https://reactflow.dev/
- **LangGraph**: https://langchain-ai.github.io/langgraph/
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com/

## 📅 Recent Updates

| Date | Update |
|------|--------|
| 2025-11-28 | Organized all .md and .sql files into structured docs/ folders |
| 2024-11-23 | Created documentation structure and naming convention |
| 2024-11-23 | Moved Workflow Designer guide to standard location |
| 2024-11-23 | Renamed inconsistent documentation files |

---

**Last Updated**: 2025-11-28
**Maintained By**: VITAL Platform Team

For questions about documentation, contact the development team.







