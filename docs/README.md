# VITAL Platform Documentation

Welcome to the VITAL Platform documentation. This directory contains comprehensive guides, specifications, and reference materials for the platform.

## 📚 Documentation Structure

```
docs/
├── README.md                       # This file - documentation index
├── guides/                         # Step-by-step guides
│   └── WORKFLOW-DESIGNER-GUIDE.md  # Workflow Designer usage guide
├── specs/                          # Feature specifications
└── integrations/                   # Integration documentation
```

## 🚀 Quick Start

### For Users
- **[Workflow Designer Guide](./guides/WORKFLOW-DESIGNER-GUIDE.md)** - Learn how to use the visual workflow builder

### For Developers
- **[Root README](../README.md)** - Project overview and setup
- **[Documentation Convention](../DOCUMENTATION_CONVENTION.md)** - Documentation naming standards
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute (if exists)

## 📖 Available Documentation

### Guides

Detailed step-by-step guides for using VITAL Platform features:

| Guide | Description |
|-------|-------------|
| [Workflow Designer Guide](./guides/WORKFLOW-DESIGNER-GUIDE.md) | Complete guide to using the visual workflow designer |

**Coming Soon:**
- Getting Started Guide
- Agent Setup Guide
- Deployment Guide
- Testing Guide

### Specifications

Technical specifications for platform features:

**Coming Soon:**
- Mode 1 Enhanced Specification
- Agent Selection Specification
- Workflow Execution Specification

### Integrations

Documentation for external integrations:

**Coming Soon:**
- LangGraph Integration
- Supabase Integration
- OpenAI Integration

### Reference

API and technical reference documentation:

**Coming Soon:**
- API Reference
- Database Schema Reference
- Architecture Overview

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
| Guides | 🟡 In Progress | 1 |
| Specifications | 🔴 Not Started | 0 |
| Integrations | 🔴 Not Started | 0 |
| Reference | 🔴 Not Started | 0 |

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
| 2024-11-23 | Created documentation structure and naming convention |
| 2024-11-23 | Moved Workflow Designer guide to standard location |
| 2024-11-23 | Renamed inconsistent documentation files |

---

**Last Updated**: 2024-11-23  
**Maintained By**: VITAL Platform Team

For questions about documentation, contact the development team.













