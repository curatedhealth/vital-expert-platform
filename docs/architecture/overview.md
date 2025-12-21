# VITAL Platform Architecture Overview

## System Architecture

VITAL Platform is built as a **Modular Monolith** optimized for AI workloads.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VITAL PATH PLATFORM v3.0                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                            FRONTEND LAYER                              │  │
│  │    Next.js 14+ │ React Flow │ TanStack Query │ Tailwind CSS           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         PROTOCOL PACKAGE                               │  │
│  │         Zod Schemas → JSON Schema → Pydantic (Type Sync)              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    BACKEND (Python/FastAPI)                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        API LAYER                                 │  │  │
│  │  │    Routes │ Middleware (Auth, Tenant, Budget) │ SSE Streaming   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      MODULE LAYER                                │  │  │
│  │  │  Translator │ Execution │ Expert │ Panels │ Ontology │ Knowledge│  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      DOMAIN LAYER                                │  │  │
│  │  │  Entities │ Services (Budget, Token) │ Exceptions                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     WORKERS LAYER (Celery)                       │  │  │
│  │  │  Execution Tasks │ Ingestion Tasks │ Discovery Tasks             │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   INFRASTRUCTURE LAYER                           │  │  │
│  │  │  LLM Clients │ Database │ Vector Store │ Cache │ Tokenizer      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          DATA LAYER                                    │  │
│  │  Supabase (PostgreSQL + RLS) │ Pinecone (Vectors) │ Redis (Cache)     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### Frontend

- **Framework**: Next.js 14+ with App Router
- **UI**: React Flow for workflow designer, TanStack Query for data fetching
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: Zustand for global state

### Backend

- **Framework**: FastAPI with Python 3.11+
- **AI Orchestration**: LangGraph 1.0 for agentic workflows
- **Async Tasks**: Celery with Redis broker
- **API**: REST + SSE streaming

### Data

- **Primary Database**: Supabase (PostgreSQL with RLS)
- **Vector Store**: Pinecone for semantic search
- **Cache**: Redis for sessions and task queue
- **Graph (Optional)**: Neo4j for knowledge graph

## Design Principles

1. **Modular Monolith** - Logical separation, physical colocation
2. **Contract-First** - Protocol package is the source of truth
3. **Type-Safe** - Full type sync between TypeScript and Python
4. **RLS-Native** - Multi-tenancy at database layer
5. **Cost-Aware** - Token budgeting prevents runaway costs
6. **AI-First** - Built for streaming, state, and memory

## Module Dependencies

```
api/
 └── modules/
      ├── translator/  → Uses: domain/, infrastructure/
      ├── execution/   → Uses: translator/, domain/, infrastructure/
      ├── expert/      → Uses: execution/, domain/
      └── panels/      → Uses: expert/, domain/
```

## Data Flow

### Ask Expert (Mode 1-2)

```
User → Frontend → API → Expert Module → LangGraph → LLM → Response
```

### Ask Expert (Mode 3-4)

```
User → Frontend → API → Job Created → Celery Worker → LangGraph → LLM → Job Complete
                          ↓
                     SSE Updates → Frontend
```

### Workflow Execution

```
Frontend (React Flow JSON)
    ↓
Protocol Package (Validate)
    ↓
Translator (Parse → Compile to LangGraph)
    ↓
Execution Engine (Run with budget/timeout)
    ↓
SSE Stream → Frontend
```

## Security

- **Authentication**: Supabase Auth with JWT
- **Authorization**: Row-Level Security (RLS) policies
- **Multi-tenancy**: `organization_id` isolation
- **Secrets**: AWS Secrets Manager / Environment variables
- **Rate Limiting**: Per-tenant token budgets

## Scalability

| Component | Scaling Strategy |
|-----------|------------------|
| API | Horizontal (K8s replicas) |
| Workers | Horizontal (Celery concurrency) |
| Redis | Cluster mode |
| Database | Supabase managed scaling |
| Vectors | Pinecone serverless |

---

**See Also**:
- [Architecture Decisions](decisions/) - ADRs
- [API Reference](../api/openapi.yaml) - OpenAPI spec
- [Deployment Guide](../guides/deployment.md) - How to deploy

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025



















