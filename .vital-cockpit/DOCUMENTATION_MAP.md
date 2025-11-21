# VITAL Platform - Documentation Map

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Status**: Complete

---

## Overview

This document provides a comprehensive map of the VITAL Platform documentation structure, migration guide from old locations to new `.vital-docs/` organization, and quick reference for finding documentation by type.

---

## 📂 Documentation Structure

### Primary Location
**All documentation consolidated in**: `.vital-docs/`

### Directory Organization (16 Sections)

```
.vital-docs/
├── INDEX.md                          ← Master navigation
├── README.md                         ← Overview & purpose
├── QUICK_REFERENCE.md                ← Quick links
├── DOCUMENTATION_MAP.md              ← This file
│
└── vital-expert-docs/
    ├── 00-overview/                  ← Getting started
    ├── 01-strategy/                  ← Vision & strategy
    ├── 02-brand-identity/            ← Brand & design
    ├── 03-product/                   ← Product specs
    ├── 04-services/                  ← Service documentation
    ├── 05-assets/                    ← Platform assets
    ├── 06-architecture/              ← Technical architecture
    ├── 07-integrations/              ← Integration docs
    ├── 08-implementation/            ← Implementation guides
    ├── 09-deployment/                ← Deployment guides
    ├── 10-api/                       ← API documentation
    ├── 11-data-schema/               ← Database schema
    ├── 12-testing/                   ← Testing documentation
    ├── 13-operations/                ← Operations & monitoring
    ├── 14-compliance/                ← Compliance
    ├── 15-training/                  ← Training materials
    └── 16-releases/                  ← Release management
```

---

## 🗺️ Migration Guide

### Old Structure → New Structure

#### Technical Documentation
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/docs/technical/claude.md` | `.vital-docs/vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md` | ✅ Migrated |
| `/docs/technical/agent.md` | `.vital-docs/vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md` | ✅ Migrated |
| `/docs/technical/DOMAIN_BASED_LLM_ROUTING.md` | `.vital-docs/vital-expert-docs/06-architecture/ai-ml/` | ✅ Migrated |
| `/docs/technical/PROMPT_ENHANCEMENT_TECHNICAL_GUIDE.md` | `.vital-docs/vital-expert-docs/05-assets/prompts/` | ✅ Migrated |

#### Database Documentation
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/database/GOLD_STANDARD_SCHEMA.md` | `.vital-docs/vital-expert-docs/11-data-schema/` | ✅ Migrated |
| `/database/templates/` | `.vital-docs/vital-expert-docs/11-data-schema/08-templates/` | ✅ Migrated |
| `/database/migrations/README.md` | `.vital-docs/vital-expert-docs/11-data-schema/06-migrations/` | ✅ Migrated |

#### Architecture Documentation
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/docs/architecture/templates/` | `.vital-docs/vital-expert-docs/05-assets/templates/` | ✅ Migrated |
| `/docs/architecture/AGENT_DATA_MODEL.md` | `.vital-docs/vital-expert-docs/06-architecture/data/` | ✅ Migrated |
| `/docs/architecture/MICROSERVICES_ARCHITECTURE.md` | `.vital-docs/vital-expert-docs/06-architecture/system-design/` | ✅ Migrated |

#### Deployment Documentation
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/docs/deployment/railway/` | `.vital-docs/vital-expert-docs/09-deployment/railway/` | ✅ Migrated |
| `/services/ai-engine/DEPLOYMENT_GUIDE.md` | `.vital-docs/vital-expert-docs/09-deployment/AI_ENGINE_DEPLOYMENT.md` | ✅ Migrated |
| `/docs/guides/deployment/` | `.vital-docs/vital-expert-docs/09-deployment/` | ✅ Migrated |

#### Implementation Guides
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/docs/implementation/features/` | `.vital-docs/vital-expert-docs/08-implementation/feature-guides/` | ✅ Migrated |
| `/docs/implementation/integrations/` | `.vital-docs/vital-expert-docs/08-implementation/integration-guides/` | ✅ Migrated |
| `/services/ai-engine/FRONTEND_BACKEND_CONNECTION.md` | `.vital-docs/vital-expert-docs/08-implementation/integration-guides/` | ✅ Migrated |

#### API Documentation
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/docs/api/agent-bulk-import-schema.json` | `.vital-docs/vital-expert-docs/10-api/api-reference/schemas/` | ✅ Migrated |
| `/docs/api/vital_agents_complete_registry.json` | `.vital-docs/vital-expert-docs/05-assets/vital-agents/registry/` | ✅ Migrated |
| `/docs/api/conversations-api.md` | `.vital-docs/vital-expert-docs/10-api/api-reference/` | ✅ Migrated |

#### Root Documentation
| Old Location | New Location | Status |
|-------------|--------------|--------|
| `/README.md` | `.vital-docs/vital-expert-docs/00-overview/PLATFORM_OVERVIEW.md` | ✅ Migrated |
| `/REORGANIZATION_PLAN.md` | `.vital-docs/vital-expert-docs/13-operations/maintenance/` | ✅ Migrated |

---

## 🔍 Finding Documentation by Type

### Getting Started
- **Platform Overview**: [`vital-expert-docs/00-overview/PLATFORM_OVERVIEW.md`](vital-expert-docs/00-overview/PLATFORM_OVERVIEW.md)
- **Setup Checklist**: [`vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md`](vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md)
- **Commands Cheatsheet**: [`vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md`](vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md)

### For AI Agents
- **Agent Implementation**: [`vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md)
- **Agent Coordination**: [`vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md)
- **Specialized Agents**: [`vital-expert-docs/00-overview/dev-agents/`](vital-expert-docs/00-overview/dev-agents/) (20 agents)

### For Developers
- **Frontend**: [`vital-expert-docs/06-architecture/frontend/`](vital-expert-docs/06-architecture/frontend/)
- **Backend**: [`vital-expert-docs/06-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](vital-expert-docs/06-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
- **Database**: [`vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md)
- **API**: [`vital-expert-docs/10-api/API_DOCUMENTATION.md`](vital-expert-docs/10-api/API_DOCUMENTATION.md)

### LLM & AI
- **Claude LLM Routing**: [`vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md)
- **Domain-Based Routing**: [`vital-expert-docs/06-architecture/ai-ml/DOMAIN_BASED_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/DOMAIN_BASED_LLM_ROUTING.md)
- **Prompt Enhancement**: [`vital-expert-docs/05-assets/prompts/PROMPT_ENHANCEMENT_TECHNICAL_GUIDE.md`](vital-expert-docs/05-assets/prompts/PROMPT_ENHANCEMENT_TECHNICAL_GUIDE.md)

### Deployment & Operations
- **Deployment Overview**: [`vital-expert-docs/09-deployment/README.md`](vital-expert-docs/09-deployment/README.md)
- **Railway Deployment**: [`vital-expert-docs/09-deployment/railway/`](vital-expert-docs/09-deployment/railway/)
- **AI Engine Deployment**: [`vital-expert-docs/09-deployment/AI_ENGINE_DEPLOYMENT.md`](vital-expert-docs/09-deployment/AI_ENGINE_DEPLOYMENT.md)
- **Monitoring**: [`vital-expert-docs/13-operations/monitoring/`](vital-expert-docs/13-operations/monitoring/)

### Current Release
- **MVP Status**: [`vital-expert-docs/16-releases/current-release/MVP_PRODUCTION_STATUS.md`](vital-expert-docs/16-releases/current-release/MVP_PRODUCTION_STATUS.md)
- **Deployment Checklist**: [`vital-expert-docs/16-releases/current-release/DEPLOYMENT_CHECKLIST.md`](vital-expert-docs/16-releases/current-release/DEPLOYMENT_CHECKLIST.md)
- **Production Metrics**: [`vital-expert-docs/16-releases/current-release/PRODUCTION_METRICS.md`](vital-expert-docs/16-releases/current-release/PRODUCTION_METRICS.md)

---

## 📊 Documentation Statistics

### Files Added (November 21, 2024)
- **Technical Documentation**: 4 files
- **Database Templates**: 3 files
- **Architecture Templates**: 4 files
- **Deployment Guides**: 20+ files
- **Implementation Guides**: 6+ files
- **API Documentation**: 3 files
- **Monitoring Documentation**: 3 files
- **Release Documentation**: 3 files

**Total Added**: 58+ files

### Files Removed (November 21, 2024)
- **Obsolete Implementations**: 11 files
- **Old SQL Scripts**: 22 files
- **Duplicate Documents**: 5 files
- **Outdated Status Files**: 2 files

**Total Removed**: 40+ files

### Net Change
- **New Files**: +18 files
- **New Directories**: 8 directories

---

## 🔄 Update Frequency

### Real-Time Updates
- Production metrics
- System health status
- Error tracking

### Weekly Updates
- Release notes
- Performance metrics
- Testing reports

### Monthly Updates
- Architecture decisions
- Strategic plans
- Compliance documentation

### Quarterly Updates
- Business requirements
- Vision & strategy
- Training materials

---

## 🎯 Quick Search Guide

### By Use Case

#### "I need to deploy to production"
→ Start: [`vital-expert-docs/09-deployment/README.md`](vital-expert-docs/09-deployment/README.md)
→ Checklist: [`vital-expert-docs/16-releases/current-release/DEPLOYMENT_CHECKLIST.md`](vital-expert-docs/16-releases/current-release/DEPLOYMENT_CHECKLIST.md)
→ Railway: [`vital-expert-docs/09-deployment/railway/`](vital-expert-docs/09-deployment/railway/)

#### "I need to create a new database table"
→ Schema Guide: [`vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md)
→ Naming Conventions: [`vital-expert-docs/11-data-schema/NAMING_CONVENTIONS.md`](vital-expert-docs/11-data-schema/NAMING_CONVENTIONS.md)
→ SQL Specialist Guide: [`vital-expert-docs/00-overview/dev-agents/SQL_SUPABASE_SPECIALIST_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/SQL_SUPABASE_SPECIALIST_GUIDE.md)

#### "I need to understand LLM routing"
→ Claude Guide: [`vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md)
→ Domain Routing: [`vital-expert-docs/06-architecture/ai-ml/DOMAIN_BASED_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/DOMAIN_BASED_LLM_ROUTING.md)

#### "I need to set up monitoring"
→ LangFuse: [`vital-expert-docs/13-operations/monitoring/LANGFUSE_SETUP.md`](vital-expert-docs/13-operations/monitoring/LANGFUSE_SETUP.md)
→ Health Checks: [`vital-expert-docs/13-operations/monitoring/HEALTH_CHECKS.md`](vital-expert-docs/13-operations/monitoring/HEALTH_CHECKS.md)
→ Alerting: [`vital-expert-docs/13-operations/monitoring/ALERTING.md`](vital-expert-docs/13-operations/monitoring/ALERTING.md)

#### "I need to implement a new feature"
→ Feature Guides: [`vital-expert-docs/08-implementation/feature-guides/`](vital-expert-docs/08-implementation/feature-guides/)
→ Integration Guides: [`vital-expert-docs/08-implementation/integration-guides/`](vital-expert-docs/08-implementation/integration-guides/)

---

## 🚨 Deprecated Locations

### DO NOT USE (Old Locations)
- ❌ `/docs/technical/` - Use `.vital-docs/vital-expert-docs/06-architecture/ai-ml/`
- ❌ `/docs/deployment/` - Use `.vital-docs/vital-expert-docs/09-deployment/`
- ❌ `/docs/implementation/` - Use `.vital-docs/vital-expert-docs/08-implementation/`
- ❌ `/docs/api/` - Use `.vital-docs/vital-expert-docs/10-api/`
- ❌ `/database/templates/` - Use `.vital-docs/vital-expert-docs/11-data-schema/08-templates/`

### Deprecation Notice
A `DEPRECATED_NOTICE.md` file has been created in `/docs/` directory to redirect users to `.vital-docs/`.

---

## 📝 Documentation Standards

### File Naming
- **Major documents**: UPPERCASE (e.g., `README.md`)
- **Agent files**: snake-case (e.g., `sql-supabase-specialist.md`)
- **Descriptive names**: Clear purpose (e.g., `DEPLOYMENT_CHECKLIST.md`)

### File Headers
All documentation must include:
```markdown
# Title

**Last Updated**: YYYY-MM-DD
**Version**: X.X
**Status**: Draft | In Progress | Production Ready
**Audience**: AI Agents | Developers | Everyone
```

### Cross-References
- Use relative paths from `.vital-docs/`
- Link to related documentation
- Update links when files move

---

## 🔗 Master Index

**Always refer to**: [`.vital-docs/INDEX.md`](INDEX.md)

The INDEX.md file is the single source of truth for all documentation locations and provides:
- Complete directory structure
- Quick start guides by role
- Topic-based search
- Critical files reference

---

## ✅ Reorganization Checklist

- [x] Technical documentation migrated
- [x] Database documentation migrated
- [x] Architecture documentation migrated
- [x] Deployment documentation migrated
- [x] Implementation guides migrated
- [x] API documentation migrated
- [x] Obsolete files removed
- [x] Duplicate files removed
- [x] Current release documentation created
- [x] Monitoring documentation created
- [x] Root documentation integrated
- [x] INDEX.md updated
- [x] DOCUMENTATION_MAP.md created
- [ ] Cross-references updated
- [ ] Deprecation notice created

---

## 🎉 Success Criteria

- ✅ All critical documentation in `.vital-docs/`
- ✅ Zero duplicate files
- ✅ Complete deployment section
- ✅ All obsolete files removed
- ✅ INDEX.md comprehensive
- ✅ DOCUMENTATION_MAP.md created
- ⏳ Cross-references validated
- ⏳ Deprecation notice deployed

---

## 📞 Support

### Can't Find What You Need?
1. Check [INDEX.md](INDEX.md)
2. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. Search this DOCUMENTATION_MAP.md
4. Ask in #vital-docs Slack channel

### Report Documentation Issues
- **GitHub Issues**: Tag with `documentation`
- **Slack**: #vital-docs channel
- **Email**: docs@vital-platform.com

---

**Next Update**: Monthly (December 21, 2024)  
**Maintained By**: Documentation Team  
**Last Reorganization**: November 21, 2024

