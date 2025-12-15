# VITAL Path - World-Class Project Structure

**Version:** 1.0  
**Date:** December 5, 2025  
**Standard:** Enterprise Healthcare AI Platform

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Target Architecture](#target-architecture)
3. [Monorepo Structure](#monorepo-structure)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Shared Packages](#shared-packages)
7. [Database Layer](#database-layer)
8. [DevOps & Tooling](#devops--tooling)
9. [Documentation Standards](#documentation-standards)
10. [Naming Conventions](#naming-conventions)
11. [Migration Path](#migration-path)

---

## Design Principles

### 1. **Separation of Concerns**
Every module has ONE responsibility. No God objects, no mixed concerns.

### 2. **Domain-Driven Design (DDD)**
Code organized by business domain, not technical layer.

### 3. **Clean Architecture**
Dependencies point inward. Core business logic has zero external dependencies.

### 4. **Microservices Ready**
Each service can be deployed independently.

### 5. **Type Safety End-to-End**
Shared types between frontend and backend. No `any` types.

### 6. **Observable by Default**
Every service has logging, metrics, and tracing built-in.

### 7. **Security First**
HIPAA-compliant patterns baked into architecture.

### 8. **Developer Experience**
Fast feedback loops, clear patterns, excellent documentation.

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VITAL PATH PLATFORM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Web App   │  │ Mobile App  │  │   Admin     │  │  External   │    │
│  │  (Next.js)  │  │  (Future)   │  │   Portal    │  │    APIs     │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐    │
│  │                        API Gateway                              │    │
│  │                    (Authentication, Rate Limiting)              │    │
│  └──────┬────────────────┬────────────────┬────────────────┬──────┘    │
│         │                │                │                │            │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐   │
│  │ AI Engine   │  │  Workflow   │  │  Knowledge  │  │   Agent     │   │
│  │  Service    │  │  Service    │  │   Service   │  │   Service   │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐    │
│  │                     Shared Kernel                               │    │
│  │         (Auth, Logging, Config, Types, Utilities)               │    │
│  └──────┬────────────────┬────────────────┬────────────────┬──────┘    │
│         │                │                │                │            │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐   │
│  │  Supabase   │  │   Redis     │  │   Vector    │  │  External   │   │
│  │  (Postgres) │  │   Cache     │  │    Store    │  │    LLMs     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
vital-path/
│
├── 📁 apps/                          # Deployable applications
│   ├── vital-system/                 # Main web application (Next.js 14+)
│   ├── admin/                        # Admin dashboard (optional)
│   └── docs/                         # Documentation site (optional)
│
├── 📁 services/                      # Backend microservices
│   ├── ai-engine/                    # Core AI processing (Python/FastAPI)
│   ├── api-gateway/                  # API gateway (Node.js/Express)
│   ├── workflow-engine/              # LangGraph workflows (Python)
│   ├── knowledge-service/            # RAG & embeddings (Python)
│   └── notification-service/         # Notifications (Node.js) [Future]
│
├── 📁 packages/                      # Shared packages (npm/pip)
│   ├── ui/                           # React component library
│   ├── sdk/                          # Client SDK (TypeScript)
│   ├── types/                        # Shared TypeScript types
│   ├── config/                       # Shared configuration
│   ├── utils/                        # Shared utilities
│   └── contracts/                    # API contracts (OpenAPI/Protobuf)
│
├── 📁 libs/                          # Internal libraries (non-publishable)
│   ├── shared-kernel/                # Python shared code
│   ├── test-utils/                   # Testing utilities
│   └── dev-tools/                    # Development tools
│
├── 📁 infrastructure/                # Infrastructure as Code
│   ├── terraform/                    # Cloud infrastructure
│   ├── kubernetes/                   # K8s manifests (if needed)
│   └── docker/                       # Docker configurations
│
├── 📁 database/                      # Database management
│   ├── migrations/                   # SQL migrations (Supabase)
│   ├── seeds/                        # Seed data
│   ├── schemas/                      # Schema definitions
│   └── scripts/                      # Database utilities
│
├── 📁 docs/                          # Documentation
│   ├── architecture/                 # Architecture decisions
│   ├── api/                          # API documentation
│   ├── guides/                       # Developer guides
│   ├── runbooks/                     # Operations runbooks
│   └── adrs/                         # Architecture Decision Records
│
├── 📁 scripts/                       # Build & utility scripts
│   ├── build/                        # Build scripts
│   ├── deploy/                       # Deployment scripts
│   ├── dev/                          # Development utilities
│   └── ci/                           # CI/CD scripts
│
├── 📁 tests/                         # Cross-cutting tests
│   ├── e2e/                          # End-to-end tests
│   ├── integration/                  # Integration tests
│   ├── performance/                  # Performance tests
│   └── security/                     # Security tests
│
├── 📁 .github/                       # GitHub configuration
│   ├── workflows/                    # CI/CD workflows
│   ├── ISSUE_TEMPLATE/               # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md      # PR template
│
├── 📁 .vscode/                       # VS Code settings
│   ├── settings.json                 # Workspace settings
│   ├── extensions.json               # Recommended extensions
│   └── launch.json                   # Debug configurations
│
├── 📄 Root configuration files
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git ignore rules
│   ├── .prettierrc                   # Code formatting
│   ├── .eslintrc.js                  # Linting rules
│   ├── package.json                  # Root package.json
│   ├── pnpm-workspace.yaml           # Workspace definition
│   ├── turbo.json                    # Turborepo config
│   ├── Makefile                      # Common commands
│   └── README.md                     # Project overview
│
└── 📄 Additional root files
    ├── CONTRIBUTING.md               # Contribution guidelines
    ├── SECURITY.md                   # Security policy
    ├── LICENSE                       # License file
    └── CHANGELOG.md                  # Version history
```

---

## Frontend Architecture

### apps/vital-system/ Structure

```
apps/vital-system/
├── 📁 public/                        # Static assets
│   ├── images/                       # Image assets
│   ├── icons/                        # Icon files
│   └── fonts/                        # Font files
│
├── 📁 src/
│   │
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Main app route group
│   │   │   ├── agents/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── ask-expert/
│   │   │   ├── workflows/
│   │   │   ├── knowledge/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # API routes (BFF)
│   │   │   ├── auth/
│   │   │   ├── agents/
│   │   │   └── workflows/
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── loading.tsx               # Global loading
│   │   ├── error.tsx                 # Global error
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── 📁 features/                  # Feature modules (Domain-driven)
│   │   ├── agents/                   # Agent feature
│   │   │   ├── components/           # Feature-specific components
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   ├── AgentForm.tsx
│   │   │   │   └── AgentList.tsx
│   │   │   ├── hooks/                # Feature-specific hooks
│   │   │   │   ├── useAgent.ts
│   │   │   │   └── useAgentList.ts
│   │   │   ├── services/             # Feature-specific API calls
│   │   │   │   └── agent.service.ts
│   │   │   ├── stores/               # Feature-specific state
│   │   │   │   └── agent.store.ts
│   │   │   ├── types/                # Feature-specific types
│   │   │   │   └── agent.types.ts
│   │   │   ├── utils/                # Feature-specific utils
│   │   │   │   └── agent.utils.ts
│   │   │   └── index.ts              # Public exports
│   │   │
│   │   ├── ask-expert/               # Ask Expert feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   │
│   │   ├── workflows/                # Workflow feature
│   │   │   ├── components/
│   │   │   │   ├── designer/
│   │   │   │   ├── execution/
│   │   │   │   └── library/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   │
│   │   ├── knowledge/                # Knowledge feature
│   │   │   └── ...
│   │   │
│   │   └── chat/                     # Chat feature
│   │       └── ...
│   │
│   ├── 📁 components/                # Shared components
│   │   ├── ui/                       # Base UI components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── FormField.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   └── FormTextarea.tsx
│   │   │
│   │   ├── data-display/             # Data display components
│   │   │   ├── DataTable.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── feedback/                 # Feedback components
│   │   │   ├── Toast.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   └── ai/                       # AI-specific components
│   │       ├── ChatMessage.tsx
│   │       ├── StreamingText.tsx
│   │       └── Citation.tsx
│   │
│   ├── 📁 hooks/                     # Global hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   │
│   ├── 📁 lib/                       # Core libraries
│   │   ├── api/                      # API client
│   │   │   ├── client.ts             # Base API client
│   │   │   ├── interceptors.ts       # Request/response interceptors
│   │   │   └── types.ts              # API types
│   │   │
│   │   ├── auth/                     # Authentication
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── auth.service.ts
│   │   │   └── auth.utils.ts
│   │   │
│   │   ├── supabase/                 # Supabase client
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── analytics/                # Analytics
│   │   │   └── analytics.service.ts
│   │   │
│   │   └── utils/                    # Utility functions
│   │       ├── cn.ts                 # Class name utility
│   │       ├── format.ts             # Formatting utilities
│   │       ├── validation.ts         # Validation utilities
│   │       └── index.ts
│   │
│   ├── 📁 stores/                    # Global state (Zustand)
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   ├── tenant.store.ts
│   │   └── index.ts
│   │
│   ├── 📁 types/                     # TypeScript types
│   │   ├── api.types.ts              # API response types
│   │   ├── models.types.ts           # Domain model types
│   │   ├── ui.types.ts               # UI-specific types
│   │   └── index.ts
│   │
│   ├── 📁 styles/                    # Global styles
│   │   ├── globals.css               # Global CSS
│   │   ├── themes/                   # Theme definitions
│   │   │   ├── light.css
│   │   │   └── dark.css
│   │   └── tokens.css                # Design tokens
│   │
│   ├── 📁 config/                    # Configuration
│   │   ├── constants.ts              # App constants
│   │   ├── routes.ts                 # Route definitions
│   │   ├── navigation.ts             # Navigation config
│   │   └── env.ts                    # Environment config
│   │
│   └── 📁 middleware/                # Next.js middleware
│       └── index.ts
│
├── 📁 __tests__/                     # Tests
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # E2E tests (Playwright)
│
├── 📄 Configuration files
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── playwright.config.ts
│   └── package.json
│
└── 📄 Documentation
    └── README.md
```

### Frontend Feature Module Pattern

Each feature is self-contained:

```typescript
// features/agents/index.ts - Public API
export { AgentCard } from './components/AgentCard';
export { AgentList } from './components/AgentList';
export { useAgent } from './hooks/useAgent';
export { useAgentList } from './hooks/useAgentList';
export type { Agent, AgentConfig } from './types/agent.types';
```

### Frontend File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase.tsx | `AgentCard.tsx` |
| Hooks | camelCase.ts | `useAgent.ts` |
| Services | kebab-case.service.ts | `agent.service.ts` |
| Types | kebab-case.types.ts | `agent.types.ts` |
| Utils | kebab-case.utils.ts | `agent.utils.ts` |
| Stores | kebab-case.store.ts | `agent.store.ts` |
| Tests | *.test.ts(x) | `AgentCard.test.tsx` |

---

## Backend Architecture

### services/ai-engine/ Structure

```
services/ai-engine/
├── 📁 src/
│   │
│   ├── 📁 api/                       # API Layer (Controllers)
│   │   ├── __init__.py
│   │   ├── routes/                   # Route definitions
│   │   │   ├── __init__.py
│   │   │   ├── health.py             # Health check routes
│   │   │   ├── agents.py             # Agent routes
│   │   │   ├── workflows.py          # Workflow routes
│   │   │   ├── chat.py               # Chat routes
│   │   │   └── knowledge.py          # Knowledge routes
│   │   │
│   │   ├── middleware/               # HTTP middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Authentication
│   │   │   ├── rate_limit.py         # Rate limiting
│   │   │   ├── logging.py            # Request logging
│   │   │   ├── error_handler.py      # Error handling
│   │   │   └── tenant.py             # Multi-tenancy
│   │   │
│   │   ├── schemas/                  # Request/Response schemas (Pydantic)
│   │   │   ├── __init__.py
│   │   │   ├── agent_schemas.py
│   │   │   ├── workflow_schemas.py
│   │   │   ├── chat_schemas.py
│   │   │   └── common_schemas.py
│   │   │
│   │   └── deps.py                   # Dependency injection
│   │
│   ├── 📁 domain/                    # Domain Layer (Business Logic)
│   │   ├── __init__.py
│   │   │
│   │   ├── agents/                   # Agent domain
│   │   │   ├── __init__.py
│   │   │   ├── models.py             # Domain models
│   │   │   ├── services.py           # Business logic
│   │   │   ├── repository.py         # Data access interface
│   │   │   ├── events.py             # Domain events
│   │   │   └── exceptions.py         # Domain exceptions
│   │   │
│   │   ├── workflows/                # Workflow domain
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── services.py
│   │   │   ├── repository.py
│   │   │   ├── engine/               # Workflow engine
│   │   │   │   ├── __init__.py
│   │   │   │   ├── executor.py
│   │   │   │   ├── state.py
│   │   │   │   └── nodes.py
│   │   │   └── modes/                # Workflow modes
│   │   │       ├── __init__.py
│   │   │       ├── base.py
│   │   │       ├── mode1_instant.py
│   │   │       ├── mode2_standard.py
│   │   │       ├── mode3_deep.py
│   │   │       └── mode4_autonomous.py
│   │   │
│   │   ├── chat/                     # Chat domain
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── services.py
│   │   │   └── repository.py
│   │   │
│   │   ├── knowledge/                # Knowledge domain
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── services.py
│   │   │   ├── repository.py
│   │   │   └── rag/                  # RAG implementation
│   │   │       ├── __init__.py
│   │   │       ├── retriever.py
│   │   │       ├── embedder.py
│   │   │       ├── ranker.py
│   │   │       └── chunker.py
│   │   │
│   │   └── shared/                   # Shared domain code
│   │       ├── __init__.py
│   │       ├── value_objects.py      # Value objects
│   │       ├── events.py             # Base events
│   │       └── exceptions.py         # Base exceptions
│   │
│   ├── 📁 infrastructure/            # Infrastructure Layer
│   │   ├── __init__.py
│   │   │
│   │   ├── database/                 # Database
│   │   │   ├── __init__.py
│   │   │   ├── connection.py         # DB connection
│   │   │   ├── repositories/         # Repository implementations
│   │   │   │   ├── __init__.py
│   │   │   │   ├── agent_repository.py
│   │   │   │   ├── workflow_repository.py
│   │   │   │   └── chat_repository.py
│   │   │   └── migrations/           # Alembic migrations (if needed)
│   │   │
│   │   ├── cache/                    # Caching
│   │   │   ├── __init__.py
│   │   │   ├── redis_client.py
│   │   │   └── cache_service.py
│   │   │
│   │   ├── vector_store/             # Vector database
│   │   │   ├── __init__.py
│   │   │   ├── supabase_vectors.py
│   │   │   └── embeddings.py
│   │   │
│   │   ├── llm/                      # LLM integrations
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base LLM interface
│   │   │   ├── openai_client.py
│   │   │   ├── anthropic_client.py
│   │   │   ├── factory.py            # LLM factory
│   │   │   └── router.py             # Model routing
│   │   │
│   │   ├── messaging/                # Message queues
│   │   │   ├── __init__.py
│   │   │   ├── publisher.py
│   │   │   └── consumer.py
│   │   │
│   │   └── external/                 # External services
│   │       ├── __init__.py
│   │       ├── tavily_client.py      # Web search
│   │       └── pubmed_client.py      # Medical literature
│   │
│   ├── 📁 core/                      # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py                 # Configuration (Pydantic Settings)
│   │   ├── logging.py                # Structured logging
│   │   ├── metrics.py                # Prometheus metrics
│   │   ├── tracing.py                # OpenTelemetry tracing
│   │   ├── security.py               # Security utilities
│   │   └── exceptions.py             # Global exceptions
│   │
│   ├── 📄 main.py                    # Application entry point (small!)
│   └── 📄 __init__.py
│
├── 📁 tests/
│   ├── __init__.py
│   ├── conftest.py                   # Pytest fixtures
│   ├── unit/                         # Unit tests
│   │   ├── domain/
│   │   │   ├── test_agent_services.py
│   │   │   └── test_workflow_services.py
│   │   └── infrastructure/
│   │       └── test_llm_clients.py
│   ├── integration/                  # Integration tests
│   │   ├── test_api_routes.py
│   │   └── test_database.py
│   └── fixtures/                     # Test fixtures
│       └── sample_data.py
│
├── 📄 Configuration files
│   ├── pyproject.toml                # Project config & dependencies
│   ├── poetry.lock                   # Dependency lock file
│   ├── Dockerfile                    # Container definition
│   ├── .env.example                  # Environment template
│   └── alembic.ini                   # Database migrations (if needed)
│
└── 📄 Documentation
    └── README.md
```

### Backend Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  (Routes, Middleware, Schemas, Input Validation)                 │
│  - Handles HTTP requests/responses                               │
│  - No business logic                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                               │
│  (Models, Services, Repositories, Events)                        │
│  - Contains ALL business logic                                   │
│  - Framework-agnostic                                            │
│  - Defines interfaces (ports)                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                           │
│  (Database, Cache, LLM, External Services)                       │
│  - Implements domain interfaces (adapters)                       │
│  - Handles external dependencies                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Backend File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Modules | snake_case.py | `agent_service.py` |
| Classes | PascalCase | `AgentService` |
| Functions | snake_case | `get_agent_by_id` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Tests | test_*.py | `test_agent_service.py` |

---

## Shared Packages

### packages/ Structure

```
packages/
│
├── 📁 ui/                            # React Component Library
│   ├── src/
│   │   ├── components/               # UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   ├── hooks/                    # Shared hooks
│   │   ├── utils/                    # UI utilities
│   │   └── index.ts                  # Public exports
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 sdk/                           # Client SDK
│   ├── src/
│   │   ├── client.ts                 # Main client
│   │   ├── agents/                   # Agent API
│   │   ├── workflows/                # Workflow API
│   │   ├── chat/                     # Chat API
│   │   └── types/                    # SDK types
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 types/                         # Shared TypeScript Types
│   ├── src/
│   │   ├── models/                   # Domain model types
│   │   │   ├── agent.ts
│   │   │   ├── workflow.ts
│   │   │   ├── chat.ts
│   │   │   └── user.ts
│   │   ├── api/                      # API types
│   │   │   ├── requests.ts
│   │   │   └── responses.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 config/                        # Shared Configuration
│   ├── src/
│   │   ├── eslint/                   # ESLint configs
│   │   ├── typescript/               # TS configs
│   │   └── prettier/                 # Prettier configs
│   └── package.json
│
├── 📁 utils/                         # Shared Utilities
│   ├── src/
│   │   ├── date.ts
│   │   ├── string.ts
│   │   ├── array.ts
│   │   └── validation.ts
│   ├── package.json
│   └── tsconfig.json
│
└── 📁 contracts/                     # API Contracts
    ├── openapi/                      # OpenAPI specs
    │   └── api.yaml
    └── package.json
```

---

## Database Layer

### database/ Structure

```
database/
│
├── 📁 migrations/                    # Supabase migrations
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240102000000_add_agents_table.sql
│   └── ...
│
├── 📁 seeds/                         # Seed data
│   ├── 01_tenants.sql
│   ├── 02_users.sql
│   ├── 03_agents.sql
│   ├── 04_workflows.sql
│   └── 05_knowledge_domains.sql
│
├── 📁 schemas/                       # Schema documentation
│   ├── agents.sql                    # Agent schema reference
│   ├── workflows.sql                 # Workflow schema reference
│   └── erd.md                        # Entity relationship diagram
│
├── 📁 functions/                     # Database functions
│   ├── rls_policies.sql              # Row Level Security
│   ├── triggers.sql                  # Database triggers
│   └── procedures.sql                # Stored procedures
│
├── 📁 scripts/                       # Utility scripts
│   ├── backup.sh
│   ├── restore.sh
│   ├── migrate.sh
│   └── seed.sh
│
└── 📄 README.md                      # Database documentation
```

---

## DevOps & Tooling

### infrastructure/ Structure

```
infrastructure/
│
├── 📁 docker/                        # Docker configurations
│   ├── Dockerfile.web                # Web app Dockerfile
│   ├── Dockerfile.ai-engine          # AI engine Dockerfile
│   ├── docker-compose.yml            # Local development
│   └── docker-compose.prod.yml       # Production compose
│
├── 📁 terraform/                     # Infrastructure as Code
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   ├── modules/
│   │   ├── networking/
│   │   ├── database/
│   │   └── compute/
│   └── main.tf
│
└── 📁 kubernetes/                    # K8s manifests (if needed)
    ├── base/
    ├── overlays/
    │   ├── dev/
    │   ├── staging/
    │   └── production/
    └── kustomization.yaml
```

### .github/workflows/ Structure

```
.github/
├── 📁 workflows/
│   ├── ci.yml                        # CI pipeline
│   ├── cd-staging.yml                # Deploy to staging
│   ├── cd-production.yml             # Deploy to production
│   ├── codeql.yml                    # Security scanning
│   ├── dependency-review.yml         # Dependency checks
│   └── release.yml                   # Release automation
│
├── 📁 ISSUE_TEMPLATE/
│   ├── bug_report.yml
│   ├── feature_request.yml
│   └── config.yml
│
├── 📄 PULL_REQUEST_TEMPLATE.md
├── 📄 CODEOWNERS
└── 📄 dependabot.yml
```

---

## Documentation Standards

### docs/ Structure

```
docs/
│
├── 📁 architecture/                  # Architecture documentation
│   ├── overview.md                   # System overview
│   ├── frontend.md                   # Frontend architecture
│   ├── backend.md                    # Backend architecture
│   ├── database.md                   # Database design
│   └── security.md                   # Security architecture
│
├── 📁 api/                           # API documentation
│   ├── overview.md                   # API overview
│   ├── authentication.md             # Auth documentation
│   ├── agents.md                     # Agent API
│   ├── workflows.md                  # Workflow API
│   └── errors.md                     # Error codes
│
├── 📁 guides/                        # Developer guides
│   ├── getting-started.md            # Quick start
│   ├── development.md                # Development setup
│   ├── testing.md                    # Testing guide
│   ├── deployment.md                 # Deployment guide
│   └── contributing.md               # Contribution guide
│
├── 📁 runbooks/                      # Operations runbooks
│   ├── incident-response.md
│   ├── database-maintenance.md
│   ├── scaling.md
│   └── monitoring.md
│
├── 📁 adrs/                          # Architecture Decision Records
│   ├── 0001-use-nextjs.md
│   ├── 0002-use-fastapi.md
│   ├── 0003-use-supabase.md
│   └── template.md
│
└── 📄 README.md
```

### ADR Template

```markdown
# ADR-XXXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue that we're seeing that is motivating this decision?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or more difficult to do because of this change?]
```

---

## Naming Conventions

### General Rules

| Item | Convention | Example |
|------|------------|---------|
| Directories | kebab-case | `api-gateway/` |
| TypeScript files | kebab-case or PascalCase | `agent.service.ts`, `AgentCard.tsx` |
| Python files | snake_case | `agent_service.py` |
| React components | PascalCase | `AgentCard.tsx` |
| Hooks | camelCase with use prefix | `useAgent.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Environment vars | UPPER_SNAKE_CASE | `DATABASE_URL` |

### Feature Module Naming

```
features/
├── agents/                 # Plural noun
├── workflows/              # Plural noun
├── chat/                   # Singular (uncountable)
├── knowledge/              # Singular (uncountable)
└── ask-expert/             # Kebab-case for multi-word
```

### API Route Naming

```
/api/v1/agents              # Collection
/api/v1/agents/:id          # Resource
/api/v1/agents/:id/actions  # Sub-resource
/api/v1/workflows/execute   # Action
```

---

## Migration Path

### Phase 1: Foundation (Week 1-2)

1. Create new directory structure
2. Set up tooling (ESLint, Prettier, Husky)
3. Configure workspaces (pnpm, Turborepo)
4. Set up CI/CD pipelines

### Phase 2: Backend Migration (Week 3-4)

1. Reorganize into domain/infrastructure layers
2. Split large files
3. Consolidate duplicate services
4. Add comprehensive tests

### Phase 3: Frontend Migration (Week 5-6)

1. Reorganize into feature modules
2. Consolidate duplicate components
3. Split large components
4. Add component tests

### Phase 4: Documentation (Week 7)

1. Create ADRs for major decisions
2. Write API documentation
3. Create developer guides
4. Set up documentation site

### Phase 5: Cleanup (Week 8)

1. Remove all deprecated code
2. Delete backup files
3. Organize root files
4. Final verification

---

## Summary

### Key Differences from Current State

| Aspect | Current | Target |
|--------|---------|--------|
| Root files | 191 loose files | ~10 config files |
| Organization | Technical layers | Domain-driven |
| Duplication | Multiple copies | Single source of truth |
| Testing | Scattered | Colocated with code |
| Documentation | Scattered | Centralized in docs/ |
| Naming | Inconsistent | Standardized |

### Benefits of New Structure

1. **Discoverability** - Find any file in seconds
2. **Scalability** - Add new features without restructuring
3. **Maintainability** - Clear ownership and boundaries
4. **Testability** - Tests live with the code they test
5. **Onboarding** - New developers productive in hours, not days
6. **Deployment** - Each service deploys independently

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-05 | AI Engineering | Initial world-class design |
