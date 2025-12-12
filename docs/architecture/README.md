# VITAL Platform Architecture Documentation

**Last Updated:** December 12, 2025
**Purpose:** Centralized architecture and deployment documentation for traceability and audit

---

## Canonical Documents (Current)

| Document | Purpose | Status |
|----------|---------|--------|
| [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) | **Canonical v4.0 Architecture** - Single source of truth | Active |
| [DEPLOYMENT_READY_STRUCTURE.md](./DEPLOYMENT_READY_STRUCTURE.md) | Cleanup plan to achieve deployment readiness | Active |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | General deployment procedures | Active |
| [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) | Production deployment specifics | Active |
| [SERVICES_DEPLOYMENT_STATUS.md](./SERVICES_DEPLOYMENT_STATUS.md) | Current service deployment status | Active |
| [BACKEND_REPOSITORY_STRUCTURE.md](./BACKEND_REPOSITORY_STRUCTURE.md) | Backend code organization | Active |
| [overview.md](./overview.md) | Architecture overview | Active |

---

## Architecture Version History

Located in `./versions/`:

| Version | Document | Date | Key Decision |
|---------|----------|------|--------------|
| v1.0 | [WORLD_CLASS_PROJECT_STRUCTURE.md](./versions/WORLD_CLASS_PROJECT_STRUCTURE.md) | Nov 2025 | Initial enterprise structure |
| v2.0 | [VITAL_WORLD_CLASS_STRUCTURE_V2.md](./versions/VITAL_WORLD_CLASS_STRUCTURE_V2.md) | Dec 2025 | **Modular Monolith** chosen over microservices |
| Audit | [MONOREPO_STRUCTURE_AUDIT.md](./versions/MONOREPO_STRUCTURE_AUDIT.md) | Dec 2025 | Current state audit (4/10 health score) |
| v4.0 | [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) | Dec 5, 2025 | **FINAL** - A+ grade architecture |

---

## Related Audit Reports

Located in `../audits/`:

| Report | Purpose |
|--------|---------|
| [DEPLOYMENT_READINESS_COMPREHENSIVE_AUDIT.md](../audits/DEPLOYMENT_READINESS_COMPREHENSIVE_AUDIT.md) | Full deployment readiness assessment |
| [VERCEL_DEPLOYMENT_READINESS_REPORT.md](../audits/VERCEL_DEPLOYMENT_READINESS_REPORT.md) | Frontend Vercel deployment status |
| [VERCEL_DEPLOYMENT_IMPLEMENTATION_PLAN.md](../audits/VERCEL_DEPLOYMENT_IMPLEMENTATION_PLAN.md) | Vercel deployment action items |
| [WORLD_CLASS_PROJECT_STRUCTURE.md](../audits/WORLD_CLASS_PROJECT_STRUCTURE.md) | Project structure analysis |
| [UNIFIED_FRONTEND_AUDIT_REPORT.md](../audits/UNIFIED_FRONTEND_AUDIT_REPORT.md) | Frontend codebase audit |
| [COMPREHENSIVE_FRONTEND_AUDIT_DETAILED_REPORT.md](../audits/COMPREHENSIVE_FRONTEND_AUDIT_DETAILED_REPORT.md) | Detailed frontend analysis |
| [BACKEND_AUDIT_REPORT_2025_Q4.md](../audits/BACKEND_AUDIT_REPORT_2025_Q4.md) | Backend Q4 2025 audit |
| [FRONTEND_AUDIT_REPORT.md](../audits/FRONTEND_AUDIT_REPORT.md) | Frontend audit report |
| [AGENTS_UNIFIED_AUDIT_REPORT.md](../audits/AGENTS_UNIFIED_AUDIT_REPORT.md) | Agent system audit |
| [PHASE_5_BACKEND_INTEGRATION_PLAN.md](../audits/PHASE_5_BACKEND_INTEGRATION_PLAN.md) | Backend integration plan |

---

## Key Architecture Decisions

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

---

## Directory Structure

```
docs/
├── architecture/
│   ├── README.md                              # This file
│   ├── VITAL_WORLD_CLASS_STRUCTURE_FINAL.md   # Canonical v4.0
│   ├── DEPLOYMENT_READY_STRUCTURE.md          # Cleanup plan
│   ├── DEPLOYMENT_GUIDE.md                    # Deployment procedures
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md         # Production specifics
│   ├── SERVICES_DEPLOYMENT_STATUS.md          # Service status
│   ├── BACKEND_REPOSITORY_STRUCTURE.md        # Backend organization
│   ├── overview.md                            # Architecture overview
│   └── versions/                              # Historical versions
│       ├── WORLD_CLASS_PROJECT_STRUCTURE.md   # v1.0
│       ├── VITAL_WORLD_CLASS_STRUCTURE_V2.md  # v2.0
│       └── MONOREPO_STRUCTURE_AUDIT.md        # Current state audit
│
├── audits/                                    # Audit reports
│   ├── DEPLOYMENT_READINESS_*.md
│   ├── VERCEL_DEPLOYMENT_*.md
│   ├── *_AUDIT_REPORT.md
│   └── ...
│
├── guides/                                    # Developer guides
├── api/                                       # API documentation
└── platform/                                  # Platform documentation
```

---

## Quick Links

- **Architecture Source of Truth:** [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md)
- **Deployment Cleanup:** [DEPLOYMENT_READY_STRUCTURE.md](./DEPLOYMENT_READY_STRUCTURE.md)
- **CLAUDE.md Reference:** References v4.0 as canonical (100% wired)

---

*Generated: December 12, 2025*
*For: VITAL Platform Deployment Preparation*
