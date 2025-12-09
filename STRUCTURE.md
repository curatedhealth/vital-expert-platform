# VITAL Platform - Project Structure

**Version**: 4.1  
**Last Updated**: December 6, 2025

---

## ⚠️ FILE CREATION RULES (MANDATORY FOR ALL AI AGENTS)

### ❌ NEVER Create Files In:
- **Project root** (`/`) - No .md, .sql, .py, .ts files
- **`/docs/`** - Only for PUBLIC developer guides (no internal docs)
- **Random locations** - Always use designated directories

### ✅ Correct File Locations:

| File Type | Location |
|-----------|----------|
| Internal Documentation | `/.claude/docs/` |
| Public Developer Docs | `/docs/guides/`, `/docs/api/` |
| SQL Migrations | `/database/migrations/` |
| Python Backend | `/services/ai-engine/src/` |
| Frontend Code | `/apps/vital-system/src/` |
| Build Scripts | `/scripts/codegen/`, `/scripts/build/` |

---

## Root Directory

```
vital-platform/
│
├── 📱 apps/                    # Frontend applications
│   └── vital-system/           # Main Next.js application
│
├── 📦 packages/                # Shared packages
│   └── protocol/               # Type definitions (Zod → JSON Schema → Pydantic)
│
├── 🔧 services/                # Backend services
│   └── ai-engine/              # Python FastAPI backend
│
├── 🗄️ database/                # Database assets
│   ├── migrations/             # SQL migrations
│   └── policies/               # RLS policies
│
├── 🏗️ infrastructure/          # Deployment infrastructure
│   ├── docker/                 # Docker Compose + Dockerfiles
│   └── terraform/              # AWS Terraform modules
│
├── 🧪 tests/                   # Test suites
│   ├── e2e/                    # Playwright E2E tests
│   └── performance/            # k6 load tests
│
├── 📚 docs/                    # ⚠️ PUBLIC documentation ONLY
│   ├── architecture/           # System architecture overview
│   ├── api/                    # OpenAPI specification
│   └── guides/                 # Developer getting-started guides
│
├── 📝 scripts/                 # Build & utility scripts (use subdirs)
│   ├── codegen/               # Code generation scripts
│   └── build/                 # Build scripts
│
├── 🤖 .claude/                 # AI assistant configuration + INTERNAL docs
│   ├── VITAL.md               # Master reference
│   ├── CLAUDE.md              # Claude guidelines
│   └── docs/                   # ⭐ ALL internal documentation here
│       ├── architecture/      # Architecture decisions
│       ├── services/          # Service PRDs/ARDs
│       ├── platform/          # Platform features
│       └── operations/        # Deployment & security
│
├── 📁 archive/                 # Archived files
│
└── [Config Files]              # Project configuration (root is OK)
    ├── Makefile
    ├── package.json
    ├── pnpm-workspace.yaml
    ├── railway.toml
    └── docker-compose.yml
```

---

## Backend Structure (`services/ai-engine/src/`)

```
src/
├── api/                        # API Layer
│   ├── routes/                 # FastAPI endpoints
│   │   ├── health.py          # Health checks
│   │   ├── expert.py          # Ask Expert API
│   │   ├── workflows.py       # Workflow API
│   │   ├── jobs.py            # Async job API
│   │   └── streaming.py       # SSE endpoints
│   ├── middleware/            # Request middleware
│   │   ├── auth.py            # JWT authentication
│   │   ├── organization.py    # Tenant context
│   │   └── budget.py          # Token budget checks
│   └── schemas/               # API schemas
│       └── _generated/        # Auto-generated Pydantic
│
├── modules/                    # Business Logic
│   ├── translator/            # React Flow → LangGraph
│   │   ├── parser.py          # JSON parsing
│   │   ├── compiler.py        # Graph compilation
│   │   ├── registry.py        # Node handlers
│   │   └── validator.py       # Workflow validation
│   ├── execution/             # Workflow execution
│   │   ├── runner.py          # Main runner
│   │   ├── context.py         # Execution context
│   │   └── metrics.py         # Execution metrics
│   ├── expert/                # Ask Expert service
│   │   ├── service.py         # ExpertService
│   │   ├── modes.py           # Mode 1-4 handlers
│   │   └── bridge.py          # Legacy bridge
│   └── panels/                # Panel discussions
│
├── workers/                    # Async Task Queue
│   ├── config.py              # Celery configuration
│   └── tasks/                 # Task definitions
│       ├── execution_tasks.py # Workflow execution
│       ├── ingestion_tasks.py # Document ingestion
│       └── discovery_tasks.py # Ontology discovery
│
├── domain/                     # Domain Layer
│   ├── entities/              # Business entities
│   ├── services/              # Domain services
│   │   └── budget_service.py  # Token budgeting
│   └── exceptions.py          # Domain exceptions
│
├── infrastructure/             # Infrastructure Layer
│   ├── llm/                   # LLM clients
│   │   ├── client.py          # Unified LLM client
│   │   ├── tokenizer.py       # Token counting
│   │   └── tracking.py        # Usage tracking
│   ├── database/              # Database access
│   │   └── repositories/      # Data repositories
│   └── cache/                 # Redis cache
│
├── core/                       # Shared utilities
│   ├── config.py              # Configuration
│   ├── context.py             # Request context
│   └── logging.py             # Structured logging
│
├── monitoring/                 # Observability
│   └── prometheus_metrics.py  # Metrics
│
└── main.py                     # Application entry
```

---

## Frontend Structure (`apps/vital-system/src/`)

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth pages
│   ├── (dashboard)/           # Dashboard pages
│   ├── ask-expert/            # Ask Expert page
│   └── workflow-designer/     # Workflow builder
│
├── features/                   # Feature modules
│   ├── ask-expert/            # Ask Expert feature
│   ├── workflow/              # Workflow builder
│   └── panels/                # Panel discussions
│
├── components/                 # Shared components
│   ├── ui/                    # shadcn/ui components
│   ├── streaming/             # Streaming components
│   └── workflow/              # Workflow components
│
├── lib/                        # Utilities
│   ├── api/                   # API client
│   ├── hooks/                 # React hooks
│   └── stores/                # State stores
│
└── styles/                     # Global styles
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `Makefile` | Development commands |
| `package.json` | Root package config |
| `pnpm-workspace.yaml` | Workspace definition |
| `docker-compose.yml` | Local Docker setup |
| `railway.toml` | Railway deployment |
| `.mcp.json` | Claude MCP config |

---

## Key Directories

| Directory | Purpose | Files |
|-----------|---------|-------|
| `.claude/` | AI assistant config | VITAL.md, CLAUDE.md, docs/ |
| `archive/` | Archived/historical files | Old migrations, docs |
| `docs/` | Public documentation | Guides, API spec |
| `infrastructure/` | Deployment configs | Docker, Terraform |
| `tests/` | Test suites | E2E, performance |

---

**See Also**: [`.claude/docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md`](.claude/docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md)
