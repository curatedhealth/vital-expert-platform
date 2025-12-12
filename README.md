# VITAL Platform

**Version**: 4.1 | **Architecture**: World-Class Modular Monolith
**Status**: ✅ Production-Ready | **Audit**: A (93/100) - December 2025

AI-powered healthcare intelligence platform with multi-tenant architecture, visual workflow designer, and enterprise-grade security.

---

## 📊 Codebase Inventory (December 2025)

| Layer | Active Files | Test Files | Archive | Total |
|-------|-------------|------------|---------|-------|
| Backend (Python) | 425 | 47 | 96 | 568 |
| Frontend (TypeScript) | 1,394 | 18 | 0 | 1,412 |
| Packages (TypeScript) | 223 | 0 | 0 | 223 |
| **Grand Total** | **2,042** | **65** | **96** | **2,203** |

**Canonical Audit Report**: [`.claude/docs/services/ask-expert/ASK_EXPERT_UNIFIED_AUDIT.md`](.claude/docs/services/ask-expert/ASK_EXPERT_UNIFIED_AUDIT.md)

---

## ⚠️ AI Agents: File Creation Rules

**DO NOT create files in project root or random locations!**

| File Type | ✅ Correct Location | ❌ Wrong Location |
|-----------|---------------------|-------------------|
| Internal Docs | `/.claude/docs/` | `/`, `/docs/` |
| Public Docs | `/docs/guides/` | `/`, `/.claude/docs/` |
| Python Code | `/services/ai-engine/src/` | `/`, `/scripts/` |
| SQL Files | `/database/migrations/` | `/`, `/docs/` |

See `STRUCTURE.md` or `.claude.md` for complete rules.

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
make dev

# Or use Docker
make docker-up
```

**📚 Documentation**: See [`docs/`](docs/) for public docs or [`.claude/docs/`](.claude/docs/) for internal documentation.

---

## 🏗️ Architecture

```
vital-platform/
├── apps/                           # Frontend (Next.js 14)
│   └── vital-system/               # Main application
│
├── packages/                       # Shared packages
│   └── protocol/                   # Type definitions (Zod schemas)
│
├── services/                       # Backend services
│   └── ai-engine/                  # Python FastAPI + LangGraph
│       ├── src/
│       │   ├── api/                # Routes & middleware
│       │   ├── modules/            # Business logic
│       │   │   ├── translator/     # React Flow → LangGraph
│       │   │   ├── execution/      # Workflow runner
│       │   │   ├── expert/         # Ask Expert service
│       │   │   └── panels/         # Panel discussions
│       │   ├── workers/            # Celery async tasks
│       │   ├── domain/             # Entities & services
│       │   └── infrastructure/     # LLM, DB, cache
│       └── tests/
│
├── database/                       # SQL migrations & policies
│   ├── migrations/                 # Schema migrations
│   └── policies/                   # RLS policies
│
├── infrastructure/                 # Deployment configs
│   ├── docker/                     # Docker Compose + Dockerfiles
│   └── terraform/                  # AWS infrastructure
│
├── tests/                          # E2E & performance tests
│   ├── e2e/                        # Playwright tests
│   └── performance/                # k6 load tests
│
└── docs/                           # Public documentation
    ├── architecture/               # System design
    ├── api/                        # OpenAPI spec
    └── guides/                     # Getting started
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Ask Expert** | 4-mode AI assistant (quick, smart, deep, panel) |
| **Workflow Designer** | Visual builder with React Flow → LangGraph |
| **Multi-tenant** | Row-Level Security with `organization_id` |
| **Type-Safe** | Zod (TS) → Pydantic (Python) sync |
| **Async Processing** | Celery workers for long tasks |
| **Token Budgeting** | Cost control per organization |

---

## 📦 Commands

```bash
# Development
make dev                  # Start all services
make dev-api             # Backend only
make dev-web             # Frontend only

# Docker
make docker-up           # Start containers
make docker-down         # Stop containers
make docker-logs         # View logs

# Testing
make test                # All tests
make test-api            # Backend tests

# Build
make build               # Build all
make sync-types          # Generate Pydantic from Zod
```

---

## 📚 Documentation

| Document | Location |
|----------|----------|
| **Architecture** | [`.claude/docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md`](.claude/docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) |
| **API Reference** | [`docs/api/openapi.yaml`](docs/api/openapi.yaml) |
| **Getting Started** | [`docs/guides/getting-started.md`](docs/guides/getting-started.md) |
| **Development** | [`docs/guides/development.md`](docs/guides/development.md) |
| **Deployment** | [`docs/guides/deployment.md`](docs/guides/deployment.md) |
| **Internal Docs** | [`.claude/docs/`](.claude/docs/) |

---

## 🛠️ Tech Stack

**Frontend**: Next.js 14, React Flow, TanStack Query, Tailwind CSS
**Backend**: FastAPI, LangGraph, Celery, Pydantic
**Database**: Supabase (PostgreSQL + RLS), Pinecone (vectors)
**Infrastructure**: Docker, Terraform, AWS EKS

---

## 🗂️ Directory Structure (Keep vs Archive)

### ✅ KEEP - Production Code

| Directory | Files | Purpose |
|-----------|-------|---------|
| `services/ai-engine/src/agents/` | 66 | L1-L5 agent hierarchy |
| `services/ai-engine/src/api/` | 66 | FastAPI routes & schemas |
| `services/ai-engine/src/langgraph_workflows/` | 40 | Mode 1-4 workflows |
| `services/ai-engine/src/services/` | 71 | Business logic |
| `apps/vital-system/src/app/` | 281 | Next.js pages & API |
| `apps/vital-system/src/features/` | 344 | Feature modules |
| `apps/vital-system/src/components/` | 385 | UI components |
| `packages/vital-ai-ui/` | 141 | VITAL AI UI library |

### 🗑️ ARCHIVE - Safe to Remove

| Directory | Files | Reason |
|-----------|-------|--------|
| `services/ai-engine/src/_backup_phase1/` | 27 | Phase 1 refactoring backups |
| `services/ai-engine/src/_legacy_archive/` | 69 | Deprecated implementations |

---

## 📄 License

Proprietary - All Rights Reserved

---

**Last Updated**: December 12, 2025
