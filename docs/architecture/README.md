# VITAL Platform Architecture Documentation

**Version:** 2.4  
**Last Updated:** December 14, 2025  
**Purpose:** Centralized architecture, deployment, and file organization documentation

---

## 📚 Quick Navigation

| Category | Document | Purpose |
|----------|----------|---------|
| **🏗️ Architecture** | [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) | Canonical v4.1 architecture (A+ grade) |
| **📋 Deployment** | [DEPLOYMENT_CHECKLIST.md](../guides/DEPLOYMENT_CHECKLIST.md) | Production deployment checklist (Vercel + Railway) |
| **📁 File Organization** | [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md) | Complete file organization, tagging, and naming standard |
| **🗄️ Multi-Database** | [MULTI_DATABASE_ORGANIZATION_STANDARD.md](./MULTI_DATABASE_ORGANIZATION_STANDARD.md) | ⭐ **NEW** - Multi-database organization standard (Postgres/Neo4j/Pinecone) |
| **🏷️ Quick Reference** | [FILE_TAGGING_QUICK_REFERENCE.md](./FILE_TAGGING_QUICK_REFERENCE.md) | Quick reference for file tagging |
| **📊 Registry** | [PRODUCTION_FILE_REGISTRY.md](./PRODUCTION_FILE_REGISTRY.md) | Production file registry with tags |

---

## 📖 Canonical Documents

### Core Architecture

| Document | Version | Status | Purpose |
|----------|---------|--------|---------|
| [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) | v4.1 | ✅ Active | **Single source of truth** - Complete architecture specification |
| [PRODUCTION_STRUCTURE_AUDIT.md](./PRODUCTION_STRUCTURE_AUDIT.md) | 1.0 | ✅ Active | **NEW** - Comprehensive audit for production deployment readiness |
| [REORGANIZATION_ACTION_PLAN.md](./REORGANIZATION_ACTION_PLAN.md) | 1.0 | ✅ Active | **NEW** - Quick action plan for reorganization |
| [overview.md](./overview.md) | 1.0 | ✅ Active | High-level architecture overview (public developer doc) |

### File Organization & Standards

| Document | Version | Status | Purpose |
|----------|---------|--------|---------|
| [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md) | 1.0 | ✅ Active | **Complete standard** - File location, naming, tagging, versioning |
| [FILE_TAGGING_QUICK_REFERENCE.md](./FILE_TAGGING_QUICK_REFERENCE.md) | 1.0 | ✅ Active | Quick reference for file headers and tags |
| [PRODUCTION_FILE_REGISTRY.md](./PRODUCTION_FILE_REGISTRY.md) | 2.1 | ✅ Active | Registry of all production-ready files with tags |

### Deployment Documentation

| Document | Version | Status | Purpose |
|----------|---------|--------|---------|
| [DEPLOYMENT_CHECKLIST.md](../guides/DEPLOYMENT_CHECKLIST.md) | 1.0 | ✅ Active | **Production deployment checklist** - Vercel + Railway |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 1.0 | ✅ Active | General deployment procedures |
| [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) | 1.0 | ✅ Active | Production deployment specifics |
| [SERVICES_DEPLOYMENT_STATUS.md](./SERVICES_DEPLOYMENT_STATUS.md) | 1.0 | ✅ Active | Current service deployment status |

### Code Organization

| Document | Version | Status | Purpose |
|----------|---------|--------|---------|
| [BACKEND_REPOSITORY_STRUCTURE.md](./BACKEND_REPOSITORY_STRUCTURE.md) | 1.1 | ✅ Active | Backend code organization (L0-L6 hierarchy) |
| [CODEBASE_FILE_STATUS_REGISTRY.md](./CODEBASE_FILE_STATUS_REGISTRY.md) | 2.2 | ✅ Active | File status tracking (PROD, LEGACY, DEPRECATED) |

### Platform Features

| Document | Version | Status | Purpose |
|----------|---------|--------|---------|
| [KNOWLEDGE_SYSTEM_ARCHITECTURE.md](./KNOWLEDGE_SYSTEM_ARCHITECTURE.md) | 1.0 | ✅ Active | Knowledge system architecture |
| [MISSION_FAMILIES_TEMPLATES_RUNNERS.md](./MISSION_FAMILIES_TEMPLATES_RUNNERS.md) | 1.0 | ✅ Active | Mission templates and runners documentation |
| [FRONTEND_DEPLOYMENT_PRODUCTION_READINESS.md](./FRONTEND_DEPLOYMENT_PRODUCTION_READINESS.md) | 1.0 | ✅ Active | Frontend production readiness assessment |

### Planning & Consolidation

| Document | Version | Status | Purpose |
|----------|---------|--------|---------|
| [ARCHITECTURE_CONSOLIDATION_PLAN.md](./ARCHITECTURE_CONSOLIDATION_PLAN.md) | 1.0 | ✅ Active | Plan to consolidate architecture docs |
| [CONSOLIDATION_SUMMARY.md](./CONSOLIDATION_SUMMARY.md) | 1.0 | ✅ Active | Quick reference for consolidation |
| [DEPLOYMENT_AND_TAGGING_RECOMMENDATIONS.md](./DEPLOYMENT_AND_TAGGING_RECOMMENDATIONS.md) | 1.0 | ✅ Active | Recommendations for deployment and tagging |
| [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) | 1.0 | ✅ Active | Summary of completed implementations |

---

## 📜 Architecture Version History

Located in `./versions/`:

| Version | Document | Date | Key Decision |
|---------|----------|------|--------------|
| v1.0 | [WORLD_CLASS_PROJECT_STRUCTURE.md](./versions/WORLD_CLASS_PROJECT_STRUCTURE.md) | Nov 2025 | Initial enterprise structure |
| v2.0 | [VITAL_WORLD_CLASS_STRUCTURE_V2.md](./versions/VITAL_WORLD_CLASS_STRUCTURE_V2.md) | Dec 2025 | **Modular Monolith** chosen over microservices |
| Audit | [MONOREPO_STRUCTURE_AUDIT.md](./versions/MONOREPO_STRUCTURE_AUDIT.md) | Dec 2025 | Current state audit (4/10 health score) |
| **v4.1** | [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) | Dec 5, 2025 | **FINAL** - A+ grade architecture |

---

## 📋 Recent Updates

### December 14, 2025 - Infrastructure & Root Cleanup
- ✅ Removed `infrastructure/monitoring/` (monitoring in Terraform)
- ✅ Created `terraform.tfvars.example` files for dev/prod
- ✅ Fixed infrastructure docker-compose.yml database path
- ✅ Fixed Makefile references (`apps/web` → `apps/vital-system`)
- ✅ Reviewed all root-level files (all necessary)
- See: [INFRASTRUCTURE_CLEANUP_COMPLETE.md](./INFRASTRUCTURE_CLEANUP_COMPLETE.md) and [ROOT_LEVEL_CLEANUP_COMPLETE.md](./ROOT_LEVEL_CLEANUP_COMPLETE.md)

### December 14, 2025 - .claude/ Reorganization
- ✅ Schema files moved to `database/postgres/schemas/`
- ✅ Historical files archived to `.claude/docs/_historical/`
- ✅ Governance files moved to `.claude/docs/coordination/`
- ✅ `.claude/` root cleaned (16 → 7 files)
- ✅ SQL files reorganized (388 files categorized and moved)
- See: [CLAUDE_DOCS_REORGANIZATION_COMPLETE.md](./CLAUDE_DOCS_REORGANIZATION_COMPLETE.md)

## 🎯 Key Architecture Decisions

### 1. Modular Monolith (v2.0 Decision)
**Why:** For AI orchestration platforms, microservices create more problems:
- LangGraph state serialization hell over HTTP
- 50-200ms latency per service hop
- Complex K8s orchestration

**Chosen:** Modular monolith with logical separation, physical colocation.

### 2. Protocol Package (v4.0)
**What:** Single source of truth for frontend-backend contracts
- Zod schemas (TypeScript) → JSON Schema → Pydantic (Python)
- 12 JSON schemas, 12 Pydantic models

### 3. Translator Module (v4.0)
**What:** Converts React Flow diagrams to LangGraph StateGraphs
- Enables visual workflow design
- Production-ready code generation

### 4. RLS-Native Multi-Tenancy
**What:** Row Level Security enforced at database layer
- 8 RLS policy files
- Tenant isolation without application-level checks

### 5. File Organization Standard (v1.0 - Dec 2025)
**What:** Comprehensive file organization, tagging, and naming system
- 7 production tags (PRODUCTION_READY, PRODUCTION_CORE, etc.)
- Standardized file headers with metadata
- Consistent naming conventions
- Dependency tracking

---

## 📁 Directory Structure

```
docs/architecture/
├── README.md                              # This file
│
├── Core Architecture
│   ├── VITAL_WORLD_CLASS_STRUCTURE_FINAL.md   # Canonical v4.1 (A+ grade)
│   └── overview.md                            # High-level overview
│
├── File Organization & Standards
│   ├── FILE_ORGANIZATION_STANDARD.md          # Complete standard
│   ├── FILE_TAGGING_QUICK_REFERENCE.md        # Quick reference
│   └── PRODUCTION_FILE_REGISTRY.md            # File registry
│
├── Deployment Documentation
│   ├── DEPLOYMENT_GUIDE.md                    # General procedures
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md          # Production specifics
│   └── SERVICES_DEPLOYMENT_STATUS.md           # Service status
│   └── [DEPLOYMENT_CHECKLIST.md](../guides/DEPLOYMENT_CHECKLIST.md)  # Production checklist
│
├── Code Organization
│   ├── BACKEND_REPOSITORY_STRUCTURE.md        # Backend structure
│   └── CODEBASE_FILE_STATUS_REGISTRY.md       # File status tracking
│
├── Platform Features
│   ├── KNOWLEDGE_SYSTEM_ARCHITECTURE.md
│   ├── MISSION_FAMILIES_TEMPLATES_RUNNERS.md
│   └── FRONTEND_DEPLOYMENT_PRODUCTION_READINESS.md
│
├── Planning & Consolidation
│   ├── ARCHITECTURE_CONSOLIDATION_PLAN.md
│   ├── CONSOLIDATION_SUMMARY.md
│   ├── DEPLOYMENT_AND_TAGGING_RECOMMENDATIONS.md
│   └── IMPLEMENTATION_COMPLETE.md
│
└── versions/                                  # Historical versions
    ├── WORLD_CLASS_PROJECT_STRUCTURE.md       # v1.0
    ├── VITAL_WORLD_CLASS_STRUCTURE_V2.md      # v2.0
    └── MONOREPO_STRUCTURE_AUDIT.md            # Audit
```

---

## 🔗 Related Documentation

### Audit Reports
Located in `../audits/`:

| Report | Purpose |
|--------|---------|
| [DEPLOYMENT_READINESS_COMPREHENSIVE_AUDIT.md](../audits/DEPLOYMENT_READINESS_COMPREHENSIVE_AUDIT.md) | Full deployment readiness assessment |
| [VERCEL_DEPLOYMENT_READINESS_REPORT.md](../audits/VERCEL_DEPLOYMENT_READINESS_REPORT.md) | Frontend Vercel deployment status |
| [VERCEL_DEPLOYMENT_IMPLEMENTATION_PLAN.md](../audits/VERCEL_DEPLOYMENT_IMPLEMENTATION_PLAN.md) | Vercel deployment action items |
| [BACKEND_AUDIT_REPORT_2025_Q4.md](../audits/BACKEND_AUDIT_REPORT_2025_Q4.md) | Backend Q4 2025 audit |
| [AGENTS_UNIFIED_AUDIT_REPORT.md](../audits/AGENTS_UNIFIED_AUDIT_REPORT.md) | Agent system audit |

### Developer Guides
Located in `../guides/`:

| Guide | Purpose |
|-------|---------|
| [DEPLOYMENT_CHECKLIST.md](../guides/DEPLOYMENT_CHECKLIST.md) | Production deployment checklist |
| [deployment.md](../guides/deployment.md) | General deployment guide |
| [development.md](../guides/development.md) | Local development setup |
| [getting-started.md](../guides/getting-started.md) | Quick start guide |

### Internal Documentation
Located in `../../.claude/docs/`:

| Location | Purpose |
|----------|---------|
| `/.claude/docs/architecture/` | Internal architecture decisions |
| `/.claude/docs/operations/deployment/` | Internal deployment operations |
| `/.claude/docs/services/` | Service-specific documentation |

---

## 🚀 Quick Start Guides

### For New Developers
1. Start with [overview.md](./overview.md) - High-level architecture
2. Read [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) - Complete architecture
3. Review [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md) - File organization

### For Deployment
1. Use [DEPLOYMENT_CHECKLIST.md](../guides/DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
2. Reference [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Production specifics
3. Check [SERVICES_DEPLOYMENT_STATUS.md](./SERVICES_DEPLOYMENT_STATUS.md) - Current status

### For File Organization
1. Read [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md) - Complete standard
2. Use [FILE_TAGGING_QUICK_REFERENCE.md](./FILE_TAGGING_QUICK_REFERENCE.md) - Quick reference
3. Update [PRODUCTION_FILE_REGISTRY.md](./PRODUCTION_FILE_REGISTRY.md) - File registry

---

## 📊 Document Status Summary

| Category | Count | Status |
|----------|-------|--------|
| **Core Architecture** | 2 | ✅ Active |
| **File Organization** | 3 | ✅ Active |
| **Deployment** | 4 | ✅ Active |
| **Code Organization** | 2 | ✅ Active |
| **Platform Features** | 3 | ✅ Active |
| **Planning** | 4 | ✅ Active |
| **Version History** | 3 | 📦 Archived |
| **TOTAL** | **21** | |

---

## 🔄 Recent Updates (December 14, 2025)

### ✅ New Documents Created
- `FILE_ORGANIZATION_STANDARD.md` - Comprehensive file organization standard
- `FILE_TAGGING_QUICK_REFERENCE.md` - Quick reference guide
- `DEPLOYMENT_CHECKLIST.md` - Production deployment checklist (in `/docs/guides/`)
- `DEPLOYMENT_AND_TAGGING_RECOMMENDATIONS.md` - Recommendations document
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary

### ✅ Documents Updated
- `PRODUCTION_FILE_REGISTRY.md` - Updated to v2.1, aligned with new standard
- `README.md` - This file, comprehensive update

### 📦 Documents Archived
- `DEPLOYMENT_READY_STRUCTURE.md` → Moved to `/.claude/docs/operations/deployment/cleanup-plan.md`

---

## 📝 Maintenance Notes

### Regular Updates Required
- **PRODUCTION_FILE_REGISTRY.md** - Update when files are tagged/untagged
- **SERVICES_DEPLOYMENT_STATUS.md** - Update deployment status
- **VITAL_WORLD_CLASS_STRUCTURE_FINAL.md** - Update when architecture changes

### Version Control
- All documents use semantic versioning (MAJOR.MINOR.PATCH)
- Update `Last Updated` date when making changes
- Document version history in document headers

---

## 🎯 Key Principles

1. **Single Source of Truth** - VITAL_WORLD_CLASS_STRUCTURE_FINAL.md is canonical
2. **Consistent Standards** - FILE_ORGANIZATION_STANDARD.md defines all standards
3. **Production Ready** - All files must be tagged appropriately
4. **Documentation First** - Document before implementing
5. **Version Control** - Track all changes with versions and dates

---

**Document Version:** 2.0  
**Last Updated:** December 14, 2025  
**Maintained By:** Platform Team  
**Status:** ✅ Active and Current
