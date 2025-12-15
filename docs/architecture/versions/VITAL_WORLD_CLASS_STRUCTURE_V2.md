# VITAL Path - World-Class Project Structure v2.0

**Version:** 2.0  
**Date:** December 5, 2025  
**Type:** AI Healthcare Platform - Modular Monolith Architecture

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Monorepo Structure](#monorepo-structure)
4. [Backend Architecture (Modular Monolith)](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Shared Protocol Package](#shared-protocol-package)
7. [Database & Multi-Tenancy](#database--multi-tenancy)
8. [Infrastructure](#infrastructure)
9. [Documentation](#documentation)
10. [File Naming Standards](#file-naming-standards)
11. [Migration Roadmap](#migration-roadmap)

---

## Design Philosophy

### Why Modular Monolith over Microservices?

For AI orchestration platforms like VITAL, **microservices create more problems than they solve**:

| Aspect | Microservices | Modular Monolith |
|--------|---------------|------------------|
| LangGraph State | Serialization hell over HTTP | Direct memory sharing |
| Latency | 50-200ms per service hop | Sub-millisecond function calls |
| Context Windows | Must serialize large arrays | Native Python objects |
| Deployment | Complex orchestration | Single deployment unit |
| Debugging | Distributed tracing required | Simple stack traces |
| Development | Multiple repos/containers | Single codebase |

### Core Principles

1. **Modular Monolith** - Logical separation, physical colocation
2. **Domain-Driven Design** - Organized by business capability
3. **Contract-First** - Shared protocol between frontend & backend
4. **Multi-Tenancy Native** - RLS enforced at database layer
5. **AI-First Architecture** - Built for streaming, state, and memory
6. **Visual-to-Code Bridge** - Explicit translator for React Flow → LangGraph

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VITAL PATH PLATFORM v2.0                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           FRONTEND LAYER                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  Designer   │  │ Ask Expert  │  │ Ask Panels  │  │  Ontology   │   │  │
│  │  │  (React     │  │  (Modes     │  │  (Multi-    │  │  Explorer   │   │  │
│  │  │   Flow)     │  │   1-4)      │  │   Agent)    │  │             │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │  │
│  │         │                │                │                │          │  │
│  │  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐   │  │
│  │  │              Shared Protocol (JSON Contracts)                   │   │  │
│  │  └──────┬────────────────┬────────────────┬────────────────┬──────┘   │  │
│  └─────────┼────────────────┼────────────────┼────────────────┼──────────┘  │
│            │                │                │                │              │
│            ▼                ▼                ▼                ▼              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    API GATEWAY (Next.js BFF)                           │  │
│  │         Authentication │ Rate Limiting │ Tenant Context                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   MODULAR MONOLITH (Python/FastAPI)                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        MODULE LAYER                              │  │  │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │  │  │
│  │  │  │Translator │ │ Execution │ │  Expert   │ │  Panels   │        │  │  │
│  │  │  │ (RF→LG)   │ │  Engine   │ │  Modes    │ │  Orchestr │        │  │  │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │  │  │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │  │  │
│  │  │  │ Ontology  │ │ Companion │ │ Solutions │ │ Knowledge │        │  │  │
│  │  │  │ Discovery │ │  Observer │ │  Builder  │ │   (RAG)   │        │  │  │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                  │                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     DOMAIN LAYER (Pure Logic)                    │  │  │
│  │  │    Entities │ Value Objects │ Domain Events │ Business Rules     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                  │                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   INFRASTRUCTURE LAYER                           │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │   LLM   │ │Database │ │ Vector  │ │  Cache  │ │External │   │  │  │
│  │  │  │ Clients │ │  Repos  │ │  Store  │ │ (Redis) │ │  APIs   │   │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         DATA LAYER (RLS Enforced)                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  Supabase   │  │   Vector    │  │    Redis    │  │   Neo4j     │   │  │
│  │  │  (Postgres) │  │    Store    │  │    Cache    │  │   (Graph)   │   │  │
│  │  │  + RLS      │  │  + Tenant   │  │             │  │             │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
vital-path/
│
├── 📁 apps/                          # Deployable Applications
│   └── vital-system/                 # Next.js 14+ Frontend
│
├── 📁 services/                      # Backend Services
│   └── ai-engine/                    # 🔥 MODULAR MONOLITH (Single Python Runtime)
│
├── 📁 packages/                      # Shared NPM Packages
│   ├── protocol/                     # 🔥 JSON Contract (Frontend ↔ Backend)
│   ├── ui/                           # React Component Library
│   ├── sdk/                          # TypeScript Client SDK
│   └── config/                       # Shared ESLint/TS/Prettier configs
│
├── 📁 database/                      # Database Management
│   ├── migrations/                   # Supabase SQL migrations
│   ├── policies/                     # 🔥 RLS Policies (Critical!)
│   ├── functions/                    # Postgres functions
│   ├── seeds/                        # Seed data by environment
│   └── schemas/                      # Schema documentation
│
├── 📁 docs/                          # Documentation
│   ├── architecture/                 # Architecture decisions (ADRs)
│   ├── api/                          # API documentation
│   ├── guides/                       # Developer guides
│   └── runbooks/                     # Operations playbooks
│
├── 📁 infrastructure/                # Infrastructure as Code
│   ├── docker/                       # Docker configurations
│   └── terraform/                    # Cloud infrastructure
│
├── 📁 scripts/                       # Utility Scripts
│   ├── dev/                          # Development utilities
│   ├── build/                        # Build scripts
│   └── deploy/                       # Deployment scripts
│
├── 📁 tests/                         # Cross-Cutting Tests
│   ├── e2e/                          # End-to-end (Playwright)
│   ├── integration/                  # Integration tests
│   └── performance/                  # Load/stress tests
│
├── 📁 .github/                       # GitHub Configuration
│   ├── workflows/                    # CI/CD pipelines
│   └── ISSUE_TEMPLATE/               # Issue templates
│
├── 📄 Root Configuration
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git ignore rules
│   ├── package.json                  # Root package.json
│   ├── pnpm-workspace.yaml           # Workspace definition
│   ├── turbo.json                    # Turborepo config
│   ├── Makefile                      # Common commands
│   ├── README.md                     # Project overview
│   ├── CONTRIBUTING.md               # Contribution guide
│   └── SECURITY.md                   # Security policy
│
└── 📁 .claude/                       # AI Assistant Context
    └── docs/                         # AI-readable documentation
```

---

## Backend Architecture

### services/ai-engine/ - The Modular Monolith

```
services/ai-engine/
│
├── 📁 src/
│   │
│   ├── 📄 main.py                    # FastAPI app entry (SMALL - ~50 lines)
│   ├── 📄 __init__.py
│   │
│   ├── 📁 api/                       # API Layer (HTTP Interface)
│   │   ├── __init__.py
│   │   │
│   │   ├── routes/                   # Route Definitions
│   │   │   ├── __init__.py
│   │   │   ├── health.py             # GET /health, /ready
│   │   │   ├── workflows.py          # POST /workflows/compile, /workflows/execute
│   │   │   ├── expert.py             # POST /expert/chat (Modes 1-4)
│   │   │   ├── panels.py             # POST /panels/execute
│   │   │   ├── knowledge.py          # POST /knowledge/query, /knowledge/ingest
│   │   │   └── ontology.py           # GET /ontology/discover
│   │   │
│   │   ├── middleware/               # HTTP Middleware Stack
│   │   │   ├── __init__.py
│   │   │   ├── tenant.py             # 🔥 CRITICAL: Extract & validate tenant_id
│   │   │   ├── auth.py               # JWT validation
│   │   │   ├── rate_limit.py         # Per-tenant rate limiting
│   │   │   ├── logging.py            # Structured request logging
│   │   │   └── errors.py             # Global error handler
│   │   │
│   │   ├── schemas/                  # Pydantic Request/Response
│   │   │   ├── __init__.py
│   │   │   ├── workflow_schemas.py   # Workflow API contracts
│   │   │   ├── expert_schemas.py     # Expert API contracts
│   │   │   ├── panel_schemas.py      # Panel API contracts
│   │   │   └── common.py             # Shared schemas (Pagination, etc.)
│   │   │
│   │   └── deps.py                   # FastAPI dependencies (DI)
│   │
│   ├── 📁 modules/                   # 🔥 FEATURE MODULES (The "Glue")
│   │   ├── __init__.py
│   │   │
│   │   ├── translator/               # 🔥 REACT FLOW → LANGGRAPH BRIDGE
│   │   │   ├── __init__.py
│   │   │   ├── parser.py             # Parse React Flow JSON
│   │   │   ├── validator.py          # Validate graph structure
│   │   │   ├── compiler.py           # Compile to LangGraph StateGraph
│   │   │   ├── registry.py           # Map UI nodes → Python functions
│   │   │   └── schemas.py            # Translator-specific types
│   │   │
│   │   ├── execution/                # WORKFLOW RUNTIME ENGINE
│   │   │   ├── __init__.py
│   │   │   ├── runner.py             # Execute compiled graphs
│   │   │   ├── state.py              # State management
│   │   │   ├── checkpointer.py       # Postgres state persistence
│   │   │   ├── streaming.py          # SSE event streaming
│   │   │   └── memory.py             # Conversation memory
│   │   │
│   │   ├── expert/                   # ASK EXPERT DOMAIN
│   │   │   ├── __init__.py
│   │   │   ├── core/                 # Shared expert logic
│   │   │   │   ├── __init__.py
│   │   │   │   ├── state.py          # Expert state schema
│   │   │   │   ├── memory.py         # Expert memory management
│   │   │   │   └── routing.py        # Expert selection logic
│   │   │   │
│   │   │   ├── modes/                # Mode Implementations
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py           # Base mode interface
│   │   │   │   ├── mode_1_instant.py        # Quick answers
│   │   │   │   ├── mode_2_standard.py       # Standard research
│   │   │   │   ├── mode_3_deep_research.py  # Deep autonomous
│   │   │   │   └── mode_4_autonomous.py     # Full autonomous
│   │   │   │
│   │   │   └── agents/               # Expert Agent Definitions
│   │   │       ├── __init__.py
│   │   │       ├── base_expert.py
│   │   │       ├── medical_expert.py
│   │   │       └── research_expert.py
│   │   │
│   │   ├── panels/                   # ASK PANELS DOMAIN
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py       # Multi-agent coordination
│   │   │   ├── consensus.py          # Response synthesis
│   │   │   ├── router.py             # Panel routing logic
│   │   │   └── templates/            # Panel templates
│   │   │       ├── __init__.py
│   │   │       └── medical_panel.py
│   │   │
│   │   ├── knowledge/                # KNOWLEDGE / RAG DOMAIN
│   │   │   ├── __init__.py
│   │   │   ├── retriever.py          # Vector search
│   │   │   ├── embedder.py           # Embedding generation
│   │   │   ├── chunker.py            # Document chunking
│   │   │   ├── ranker.py             # Result reranking
│   │   │   └── ingestion.py          # Document ingestion
│   │   │
│   │   ├── ontology/                 # AI ONTOLOGY DOMAIN
│   │   │   ├── __init__.py
│   │   │   ├── discovery.py          # Opportunity discovery agent
│   │   │   ├── personalization.py    # User adaptation
│   │   │   └── graph.py              # Knowledge graph management
│   │   │
│   │   ├── companion/                # AI COMPANION DOMAIN
│   │   │   ├── __init__.py
│   │   │   ├── observer.py           # User action observer
│   │   │   └── suggestions.py        # Proactive suggestions
│   │   │
│   │   └── solutions/                # SOLUTION BUILDER DOMAIN
│   │       ├── __init__.py
│   │       ├── composer.py           # Bundle workflows + UI + permissions
│   │       ├── exporter.py           # Export solutions
│   │       └── marketplace.py        # Solution marketplace logic
│   │
│   ├── 📁 domain/                    # 🔥 PURE DOMAIN LAYER (No Dependencies!)
│   │   ├── __init__.py
│   │   │
│   │   ├── entities/                 # Domain Entities
│   │   │   ├── __init__.py
│   │   │   ├── agent.py              # Agent entity
│   │   │   ├── workflow.py           # Workflow entity
│   │   │   ├── expert.py             # Expert entity
│   │   │   ├── panel.py              # Panel entity
│   │   │   ├── conversation.py       # Conversation entity
│   │   │   └── solution.py           # Solution entity
│   │   │
│   │   ├── value_objects/            # Value Objects (Immutable)
│   │   │   ├── __init__.py
│   │   │   ├── tenant_id.py          # Tenant identifier
│   │   │   ├── user_id.py            # User identifier
│   │   │   ├── message.py            # Chat message
│   │   │   └── evidence.py           # Evidence/citation
│   │   │
│   │   ├── events/                   # Domain Events
│   │   │   ├── __init__.py
│   │   │   ├── workflow_events.py
│   │   │   ├── expert_events.py
│   │   │   └── panel_events.py
│   │   │
│   │   ├── services/                 # Domain Services (Pure Logic)
│   │   │   ├── __init__.py
│   │   │   ├── agent_selector.py     # Agent selection rules
│   │   │   ├── mode_selector.py      # Mode selection rules
│   │   │   └── evidence_detector.py  # Citation extraction rules
│   │   │
│   │   └── exceptions.py             # Domain exceptions
│   │
│   ├── 📁 infrastructure/            # 🔥 INFRASTRUCTURE LAYER (Adapters)
│   │   ├── __init__.py
│   │   │
│   │   ├── database/                 # Database Adapters
│   │   │   ├── __init__.py
│   │   │   ├── connection.py         # Supabase connection
│   │   │   ├── repositories/         # Repository implementations
│   │   │   │   ├── __init__.py
│   │   │   │   ├── agent_repo.py
│   │   │   │   ├── workflow_repo.py
│   │   │   │   ├── conversation_repo.py
│   │   │   │   └── base.py           # Base repository with tenant filtering
│   │   │   └── unit_of_work.py       # Transaction management
│   │   │
│   │   ├── vector/                   # Vector Store Adapters
│   │   │   ├── __init__.py
│   │   │   ├── supabase_vectors.py   # Supabase pgvector
│   │   │   └── embeddings.py         # Embedding client
│   │   │
│   │   ├── llm/                      # LLM Adapters
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # LLM interface
│   │   │   ├── openai_client.py      # OpenAI adapter
│   │   │   ├── anthropic_client.py   # Anthropic adapter
│   │   │   ├── factory.py            # LLM factory
│   │   │   └── router.py             # Model routing by domain
│   │   │
│   │   ├── cache/                    # Cache Adapters
│   │   │   ├── __init__.py
│   │   │   ├── redis_client.py       # Redis connection
│   │   │   └── cache_service.py      # Caching logic
│   │   │
│   │   ├── messaging/                # Message Queue Adapters
│   │   │   ├── __init__.py
│   │   │   ├── publisher.py          # Event publishing
│   │   │   └── consumer.py           # Event consuming
│   │   │
│   │   └── external/                 # External API Adapters
│   │       ├── __init__.py
│   │       ├── tavily.py             # Web search
│   │       ├── pubmed.py             # Medical literature
│   │       └── semantic_scholar.py   # Academic papers
│   │
│   └── 📁 core/                      # Core Utilities
│       ├── __init__.py
│       ├── config.py                 # Pydantic Settings
│       ├── logging.py                # Structured logging (structlog)
│       ├── metrics.py                # Prometheus metrics
│       ├── tracing.py                # OpenTelemetry tracing
│       ├── security.py               # Security utilities
│       └── context.py                # Request context (tenant, user)
│
├── 📁 tests/
│   ├── __init__.py
│   ├── conftest.py                   # Pytest fixtures
│   │
│   ├── unit/                         # Unit Tests
│   │   ├── domain/
│   │   │   ├── test_agent_selector.py
│   │   │   └── test_evidence_detector.py
│   │   ├── modules/
│   │   │   ├── test_translator_parser.py
│   │   │   ├── test_translator_compiler.py
│   │   │   └── test_execution_runner.py
│   │   └── infrastructure/
│   │       └── test_llm_router.py
│   │
│   ├── integration/                  # Integration Tests
│   │   ├── test_api_workflows.py
│   │   ├── test_api_expert.py
│   │   └── test_database.py
│   │
│   └── fixtures/                     # Test Fixtures
│       ├── sample_workflows.py
│       └── sample_agents.py
│
├── 📄 Configuration Files
│   ├── pyproject.toml                # Poetry config + dependencies
│   ├── poetry.lock                   # Lock file
│   ├── Dockerfile                    # Container definition
│   ├── .env.example                  # Environment template
│   └── pytest.ini                    # Pytest configuration
│
└── 📄 README.md                      # Service documentation
```

### Key Backend Design Decisions

#### 1. The Translator Module (Most Critical!)

```python
# modules/translator/compiler.py

from langgraph.graph import StateGraph
from .parser import parse_react_flow_json
from .validator import validate_graph
from .registry import NodeRegistry

class WorkflowCompiler:
    """Converts React Flow JSON to executable LangGraph."""
    
    def __init__(self, registry: NodeRegistry):
        self.registry = registry
    
    def compile(self, react_flow_json: dict) -> StateGraph:
        # 1. Parse the React Flow JSON
        parsed = parse_react_flow_json(react_flow_json)
        
        # 2. Validate graph structure
        validate_graph(parsed)
        
        # 3. Build LangGraph StateGraph
        graph = StateGraph(WorkflowState)
        
        for node in parsed.nodes:
            # Map UI node type to Python function
            node_fn = self.registry.get_node_function(node.type)
            graph.add_node(node.id, node_fn)
        
        for edge in parsed.edges:
            if edge.is_conditional:
                graph.add_conditional_edges(
                    edge.source,
                    self.registry.get_condition(edge.condition),
                    edge.targets
                )
            else:
                graph.add_edge(edge.source, edge.target)
        
        graph.set_entry_point(parsed.entry_node)
        
        return graph.compile()
```

#### 2. Node Registry (Maps UI → Python)

```python
# modules/translator/registry.py

from typing import Callable, Dict
from domain.entities.agent import Agent

class NodeRegistry:
    """Maps visual node types to executable Python functions."""
    
    _nodes: Dict[str, Callable] = {}
    _conditions: Dict[str, Callable] = {}
    
    @classmethod
    def register_node(cls, node_type: str):
        """Decorator to register a node handler."""
        def decorator(fn: Callable):
            cls._nodes[node_type] = fn
            return fn
        return decorator
    
    @classmethod
    def get_node_function(cls, node_type: str) -> Callable:
        if node_type not in cls._nodes:
            raise ValueError(f"Unknown node type: {node_type}")
        return cls._nodes[node_type]

# Usage in modules/expert/agents/medical_expert.py
@NodeRegistry.register_node("expert_node")
async def expert_node(state: WorkflowState) -> WorkflowState:
    """Execute an expert agent."""
    # ... implementation
```

#### 3. Tenant Context Middleware (Critical for Security!)

```python
# api/middleware/tenant.py

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from core.context import set_tenant_context

class TenantMiddleware(BaseHTTPMiddleware):
    """Extract and validate tenant context from every request."""
    
    async def dispatch(self, request: Request, call_next):
        # Extract tenant from JWT claims
        tenant_id = request.state.user.get("tenant_id")
        
        if not tenant_id:
            raise HTTPException(
                status_code=403,
                detail="Tenant context required. Access denied."
            )
        
        # Set tenant context for entire request lifecycle
        set_tenant_context(tenant_id)
        
        try:
            response = await call_next(request)
            return response
        finally:
            # Clear context after request
            clear_tenant_context()
```

---

## Frontend Architecture

### apps/vital-system/ - Next.js 14+ Frontend

```
apps/vital-system/
│
├── 📁 public/                        # Static Assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── 📁 src/
│   │
│   ├── 📁 app/                       # Next.js App Router
│   │   │
│   │   ├── (auth)/                   # Auth Route Group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Main App Route Group
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   │
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   │
│   │   │   ├── designer/             # 🔥 WORKFLOW DESIGNER
│   │   │   │   ├── page.tsx          # Designer home
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Edit specific workflow
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      # Create new workflow
│   │   │   │
│   │   │   ├── expert/               # ASK EXPERT
│   │   │   │   ├── page.tsx          # Expert home
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx      # Specific conversation
│   │   │   │
│   │   │   ├── panels/               # ASK PANELS
│   │   │   │   ├── page.tsx          # Panels home
│   │   │   │   └── [panelId]/
│   │   │   │       └── page.tsx      # Execute panel
│   │   │   │
│   │   │   ├── agents/               # AGENT MANAGEMENT
│   │   │   │   ├── page.tsx          # Agent list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Edit agent
│   │   │   │
│   │   │   ├── knowledge/            # KNOWLEDGE BASE
│   │   │   │   ├── page.tsx          # Knowledge home
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx      # Upload documents
│   │   │   │
│   │   │   ├── ontology/             # AI ONTOLOGY
│   │   │   │   └── page.tsx          # Ontology explorer
│   │   │   │
│   │   │   └── settings/             # SETTINGS
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       ├── team/
│   │   │       └── billing/
│   │   │
│   │   ├── api/                      # BFF API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── workflows/
│   │   │   │   └── route.ts
│   │   │   └── expert/
│   │   │       └── stream/
│   │   │           └── route.ts      # SSE streaming endpoint
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── loading.tsx               # Global loading
│   │   ├── error.tsx                 # Global error
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── 📁 features/                  # 🔥 FEATURE MODULES (Domain-Driven)
│   │   │
│   │   ├── designer/                 # 🔥 VISUAL WORKFLOW DESIGNER
│   │   │   ├── components/
│   │   │   │   ├── canvas/           # React Flow Canvas
│   │   │   │   │   ├── FlowCanvas.tsx
│   │   │   │   │   ├── FlowControls.tsx
│   │   │   │   │   └── MiniMap.tsx
│   │   │   │   │
│   │   │   │   ├── nodes/            # 🔥 Custom Visual Nodes
│   │   │   │   │   ├── BaseNode.tsx
│   │   │   │   │   ├── ExpertNode.tsx
│   │   │   │   │   ├── ToolNode.tsx
│   │   │   │   │   ├── RouterNode.tsx
│   │   │   │   │   ├── ConditionNode.tsx
│   │   │   │   │   ├── StartNode.tsx
│   │   │   │   │   ├── EndNode.tsx
│   │   │   │   │   └── index.ts      # Node registry
│   │   │   │   │
│   │   │   │   ├── edges/            # Custom Edges
│   │   │   │   │   ├── ConditionalEdge.tsx
│   │   │   │   │   └── DefaultEdge.tsx
│   │   │   │   │
│   │   │   │   ├── panels/           # Side Panels
│   │   │   │   │   ├── NodeConfigPanel.tsx
│   │   │   │   │   ├── WorkflowSettingsPanel.tsx
│   │   │   │   │   └── TestPanel.tsx
│   │   │   │   │
│   │   │   │   └── toolbar/          # Designer Toolbar
│   │   │   │       ├── NodePalette.tsx
│   │   │   │       ├── ActionBar.tsx
│   │   │   │       └── ZoomControls.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useFlow.ts        # React Flow state management
│   │   │   │   ├── useFlowValidation.ts  # 🔥 Client-side validation
│   │   │   │   ├── useAutoLayout.ts  # Dagre/Elk auto-layout
│   │   │   │   ├── useWorkflowSave.ts
│   │   │   │   └── useWorkflowTest.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   └── designer.store.ts # Zustand store for designer state
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── workflow.service.ts
│   │   │   │   └── generator.ts      # 🔥 Generate JSON payload
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── designer.types.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── graph-utils.ts
│   │   │   │   └── layout-utils.ts
│   │   │   │
│   │   │   └── index.ts              # Public exports
│   │   │
│   │   ├── expert/                   # ASK EXPERT FEATURE
│   │   │   ├── components/
│   │   │   │   ├── ExpertChat.tsx
│   │   │   │   ├── ModeSelector.tsx
│   │   │   │   ├── ExpertSelector.tsx
│   │   │   │   │
│   │   │   │   └── streaming/        # 🔥 AI STREAMING COMPONENTS
│   │   │   │       ├── StreamContainer.tsx
│   │   │   │       ├── ThoughtProcess.tsx    # "Thinking..." accordion
│   │   │   │       ├── ArtifactRenderer.tsx  # Generated documents
│   │   │   │       ├── CitationCard.tsx      # Evidence citations
│   │   │   │       ├── StreamingText.tsx     # Animated text
│   │   │   │       └── StreamError.tsx       # Error handling
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useExpert.ts
│   │   │   │   ├── useAIStream.ts    # 🔥 LangChain stream handler
│   │   │   │   └── useConversation.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   └── expert.store.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── expert.service.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── expert.types.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── panels/                   # ASK PANELS FEATURE
│   │   │   ├── components/
│   │   │   │   ├── PanelSelector.tsx
│   │   │   │   ├── PanelExecution.tsx
│   │   │   │   ├── ConsensusView.tsx
│   │   │   │   └── AgentResponses.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── usePanel.ts
│   │   │   │   └── usePanelExecution.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   └── panels.store.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── agents/                   # AGENT MANAGEMENT FEATURE
│   │   │   ├── components/
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   ├── AgentList.tsx
│   │   │   │   ├── AgentForm.tsx
│   │   │   │   └── AgentWizard.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   └── useAgent.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── knowledge/                # KNOWLEDGE BASE FEATURE
│   │   │   ├── components/
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   ├── UploadZone.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   └── useKnowledge.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── ontology/                 # ONTOLOGY EXPLORER FEATURE
│   │   │   ├── components/
│   │   │   │   ├── OntologyGraph.tsx
│   │   │   │   └── DiscoveryFeed.tsx
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   └── auth/                     # AUTHENTICATION FEATURE
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   └── TenantSwitcher.tsx
│   │       │
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       │
│   │       └── index.ts
│   │
│   ├── 📁 components/                # SHARED COMPONENTS
│   │   │
│   │   ├── ui/                       # Base UI (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout Components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── forms/                    # Form Components
│   │   │   ├── FormField.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   └── FormSwitch.tsx
│   │   │
│   │   ├── data-display/             # Data Display Components
│   │   │   ├── DataTable.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   │
│   │   ├── feedback/                 # Feedback Components
│   │   │   ├── Alert.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   └── ai/                       # AI Components (Shared)
│   │       ├── ChatInput.tsx
│   │       ├── MarkdownRenderer.tsx
│   │       └── CodeBlock.tsx
│   │
│   ├── 📁 hooks/                     # GLOBAL HOOKS
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useTheme.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   │
│   ├── 📁 lib/                       # CORE LIBRARIES
│   │   │
│   │   ├── api/                      # API Client
│   │   │   ├── client.ts             # Base fetch wrapper
│   │   │   ├── interceptors.ts       # Auth/error interceptors
│   │   │   └── types.ts
│   │   │
│   │   ├── auth/                     # Auth Utilities
│   │   │   ├── AuthProvider.tsx
│   │   │   └── auth.utils.ts
│   │   │
│   │   ├── supabase/                 # Supabase Client
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts
│   │   │
│   │   └── utils/                    # Utility Functions
│   │       ├── cn.ts                 # Class name utility
│   │       ├── format.ts             # Formatting utilities
│   │       └── validation.ts
│   │
│   ├── 📁 stores/                    # GLOBAL STORES (Zustand)
│   │   ├── auth.store.ts
│   │   ├── tenant.store.ts
│   │   ├── ui.store.ts
│   │   └── index.ts
│   │
│   ├── 📁 types/                     # GLOBAL TYPES
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   └── index.ts
│   │
│   ├── 📁 styles/                    # GLOBAL STYLES
│   │   ├── globals.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   └── 📁 config/                    # CONFIGURATION
│       ├── constants.ts
│       ├── routes.ts
│       ├── navigation.ts
│       └── env.ts
│
├── 📁 __tests__/                     # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── 📄 Configuration Files
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── playwright.config.ts
│   └── package.json
│
└── 📄 README.md
```

---

## Shared Protocol Package

### packages/protocol/ - The Contract

```
packages/protocol/
│
├── 📁 src/
│   │
│   ├── 📁 schemas/                   # 🔥 ZOD SCHEMAS (Single Source of Truth)
│   │   │
│   │   ├── workflow.schema.ts        # Workflow JSON schema
│   │   ├── nodes.schema.ts           # Node definitions
│   │   ├── edges.schema.ts           # Edge definitions
│   │   ├── expert.schema.ts          # Expert request/response
│   │   ├── panel.schema.ts           # Panel request/response
│   │   └── streaming.schema.ts       # SSE event schemas
│   │
│   ├── 📁 types/                     # Generated TypeScript Types
│   │   ├── workflow.types.ts
│   │   ├── nodes.types.ts
│   │   ├── expert.types.ts
│   │   └── index.ts
│   │
│   ├── 📁 constants/                 # Shared Constants
│   │   ├── node-types.ts             # All node type identifiers
│   │   ├── modes.ts                  # Expert modes (1-4)
│   │   └── events.ts                 # SSE event types
│   │
│   └── index.ts                      # Public exports
│
├── 📄 package.json
└── 📄 tsconfig.json
```

### Example: Workflow Schema

```typescript
// packages/protocol/src/schemas/workflow.schema.ts

import { z } from 'zod';
import { NodeSchema } from './nodes.schema';
import { EdgeSchema } from './edges.schema';

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  
  // React Flow data
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  
  // Viewport state
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number().min(0.1).max(2),
  }).optional(),
  
  // Metadata
  metadata: z.object({
    entryNodeId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().uuid(),
  }),
  
  // Tenant isolation
  tenantId: z.string().uuid(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// Validation function
export function validateWorkflow(data: unknown): Workflow {
  return WorkflowSchema.parse(data);
}
```

### Example: Node Schema

```typescript
// packages/protocol/src/schemas/nodes.schema.ts

import { z } from 'zod';
import { NODE_TYPES } from '../constants/node-types';

const BaseNodeSchema = z.object({
  id: z.string(),
  type: z.enum(NODE_TYPES),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.unknown()),
});

// Expert Node
export const ExpertNodeSchema = BaseNodeSchema.extend({
  type: z.literal('expert'),
  data: z.object({
    agentId: z.string().uuid(),
    mode: z.enum(['mode_1', 'mode_2', 'mode_3', 'mode_4']),
    systemPrompt: z.string().optional(),
    temperature: z.number().min(0).max(2).default(0.7),
  }),
});

// Tool Node
export const ToolNodeSchema = BaseNodeSchema.extend({
  type: z.literal('tool'),
  data: z.object({
    toolId: z.string(),
    config: z.record(z.unknown()).optional(),
  }),
});

// Router Node (Conditional)
export const RouterNodeSchema = BaseNodeSchema.extend({
  type: z.literal('router'),
  data: z.object({
    conditions: z.array(z.object({
      id: z.string(),
      expression: z.string(),
      targetNodeId: z.string(),
    })),
    defaultTargetNodeId: z.string(),
  }),
});

// Union of all nodes
export const NodeSchema = z.discriminatedUnion('type', [
  ExpertNodeSchema,
  ToolNodeSchema,
  RouterNodeSchema,
  // ... other node types
]);

export type WorkflowNode = z.infer<typeof NodeSchema>;
```

---

## Database & Multi-Tenancy

### database/ Structure

```
database/
│
├── 📁 migrations/                    # Supabase Migrations
│   ├── 00001_initial_schema.sql
│   ├── 00002_create_tenants.sql
│   ├── 00003_create_users.sql
│   ├── 00004_create_agents.sql
│   ├── 00005_create_workflows.sql
│   ├── 00006_create_conversations.sql
│   ├── 00007_create_knowledge.sql
│   └── 00008_create_solutions.sql
│
├── 📁 policies/                      # 🔥 ROW LEVEL SECURITY (Critical!)
│   ├── tenants.policy.sql
│   ├── users.policy.sql
│   ├── agents.policy.sql
│   ├── workflows.policy.sql
│   ├── conversations.policy.sql
│   ├── knowledge.policy.sql
│   └── vectors.policy.sql            # 🔥 Vector namespace isolation
│
├── 📁 functions/                     # Postgres Functions
│   ├── auth_functions.sql            # Auth helpers
│   ├── tenant_functions.sql          # Tenant helpers
│   └── match_vectors.sql             # 🔥 Tenant-filtered vector search
│
├── 📁 triggers/                      # Database Triggers
│   ├── updated_at.sql                # Auto-update timestamps
│   └── audit_log.sql                 # Audit trail
│
├── 📁 seeds/                         # Seed Data
│   ├── dev/                          # Development seeds
│   │   ├── 01_tenants.sql
│   │   ├── 02_users.sql
│   │   └── 03_agents.sql
│   └── prod/                         # Production seeds
│       └── 01_system_agents.sql
│
├── 📁 schemas/                       # Schema Documentation
│   ├── erd.md                        # Entity relationship diagram
│   ├── tenants.md
│   ├── agents.md
│   └── workflows.md
│
└── 📄 README.md
```

### Example: RLS Policy

```sql
-- database/postgres/policies/workflows.policy.sql

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see workflows in their tenant
CREATE POLICY "tenant_isolation_select" ON workflows
    FOR SELECT
    USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Policy: Users can only insert workflows in their tenant
CREATE POLICY "tenant_isolation_insert" ON workflows
    FOR INSERT
    WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

-- Policy: Users can only update their tenant's workflows
CREATE POLICY "tenant_isolation_update" ON workflows
    FOR UPDATE
    USING (tenant_id = auth.jwt() ->> 'tenant_id')
    WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

-- Policy: Users can only delete their tenant's workflows
CREATE POLICY "tenant_isolation_delete" ON workflows
    FOR DELETE
    USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

### Example: Tenant-Filtered Vector Search

```sql
-- database/functions/match_vectors.sql

CREATE OR REPLACE FUNCTION match_vectors(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_tenant_id uuid;
BEGIN
    -- 🔥 Extract tenant from JWT
    current_tenant_id := (auth.jwt() ->> 'tenant_id')::uuid;
    
    IF current_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant context required for vector search';
    END IF;
    
    RETURN QUERY
    SELECT
        v.id,
        v.content,
        v.metadata,
        1 - (v.embedding <=> query_embedding) as similarity
    FROM knowledge_vectors v
    WHERE 
        v.tenant_id = current_tenant_id  -- 🔥 Tenant isolation
        AND 1 - (v.embedding <=> query_embedding) > match_threshold
    ORDER BY v.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

## Infrastructure

### infrastructure/ Structure

```
infrastructure/
│
├── 📁 docker/
│   ├── Dockerfile.web                # Frontend container
│   ├── Dockerfile.ai-engine          # Backend container
│   ├── docker-compose.yml            # Local development
│   ├── docker-compose.test.yml       # Testing environment
│   └── docker-compose.prod.yml       # Production (reference)
│
├── 📁 terraform/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   └── variables.tf
│   │   ├── staging/
│   │   └── production/
│   │
│   ├── modules/
│   │   ├── networking/
│   │   ├── database/
│   │   ├── compute/
│   │   └── monitoring/
│   │
│   └── main.tf
│
└── 📁 monitoring/
    ├── prometheus/
    │   └── prometheus.yml
    ├── grafana/
    │   └── dashboards/
    └── alerts/
        └── rules.yml
```

---

## Documentation

### docs/ Structure

```
docs/
│
├── 📁 architecture/                  # Architecture Documentation
│   ├── overview.md                   # System overview
│   ├── modular-monolith.md           # Why modular monolith
│   ├── translator.md                 # React Flow → LangGraph
│   ├── multi-tenancy.md              # Tenancy strategy
│   └── security.md                   # Security architecture
│
├── 📁 api/                           # API Documentation
│   ├── overview.md
│   ├── authentication.md
│   ├── workflows.md
│   ├── expert.md
│   ├── panels.md
│   └── errors.md
│
├── 📁 guides/                        # Developer Guides
│   ├── getting-started.md
│   ├── local-development.md
│   ├── adding-nodes.md               # How to add new node types
│   ├── adding-modes.md               # How to add expert modes
│   ├── testing.md
│   └── deployment.md
│
├── 📁 runbooks/                      # Operations Runbooks
│   ├── incident-response.md
│   ├── database-maintenance.md
│   ├── scaling.md
│   └── monitoring.md
│
├── 📁 adrs/                          # Architecture Decision Records
│   ├── 0001-modular-monolith.md
│   ├── 0002-translator-pattern.md
│   ├── 0003-rls-tenancy.md
│   ├── 0004-protocol-package.md
│   └── template.md
│
└── 📄 README.md
```

---

## File Naming Standards

### Universal Rules

| Type | Convention | Example |
|------|------------|---------|
| Directories | kebab-case | `ask-expert/` |
| React Components | PascalCase.tsx | `ExpertNode.tsx` |
| Hooks | camelCase.ts | `useAIStream.ts` |
| Services | kebab-case.service.ts | `workflow.service.ts` |
| Stores | kebab-case.store.ts | `designer.store.ts` |
| Types | kebab-case.types.ts | `expert.types.ts` |
| Schemas | kebab-case.schema.ts | `workflow.schema.ts` |
| Python modules | snake_case.py | `mode_3_deep_research.py` |
| Tests (TS) | *.test.ts(x) | `ExpertNode.test.tsx` |
| Tests (Python) | test_*.py | `test_translator_compiler.py` |
| SQL migrations | NNNNN_description.sql | `00005_create_workflows.sql` |
| SQL policies | table.policy.sql | `workflows.policy.sql` |

### Feature Module Structure

Every feature module follows the same pattern:

```
features/{feature-name}/
├── components/           # React components
├── hooks/                # Feature hooks
├── stores/               # Zustand stores
├── services/             # API services
├── types/                # TypeScript types
├── utils/                # Utilities
└── index.ts              # Public exports
```

### Backend Module Structure

Every backend module follows the same pattern:

```
modules/{module-name}/
├── __init__.py           # Module exports
├── {core-file}.py        # Main logic
├── schemas.py            # Pydantic schemas (if needed)
└── exceptions.py         # Module exceptions (if needed)
```

---

## Migration Roadmap

### Phase 1: Foundation (Week 1)

| Task | Priority | Effort |
|------|----------|--------|
| Create new directory structure | P0 | 2h |
| Set up `packages/protocol` | P0 | 4h |
| Define Zod schemas for workflows | P0 | 4h |
| Set up Turborepo build system | P1 | 2h |

### Phase 2: Backend Restructure (Week 2)

| Task | Priority | Effort |
|------|----------|--------|
| Create `modules/translator` | P0 | 8h |
| Implement parser.py | P0 | 4h |
| Implement compiler.py | P0 | 8h |
| Create node registry | P0 | 4h |
| Migrate expert modes | P1 | 8h |
| Add RLS policies | P0 | 4h |

### Phase 3: Frontend Restructure (Week 3)

| Task | Priority | Effort |
|------|----------|--------|
| Create `features/designer` structure | P0 | 4h |
| Implement custom nodes | P0 | 8h |
| Add `useFlowValidation` hook | P0 | 4h |
| Create `features/expert/streaming` | P1 | 8h |
| Integrate protocol package | P0 | 4h |

### Phase 4: Testing & Documentation (Week 4)

| Task | Priority | Effort |
|------|----------|--------|
| Add translator unit tests | P0 | 8h |
| Add integration tests | P1 | 8h |
| Write ADRs | P1 | 4h |
| Update API documentation | P1 | 4h |
| Create developer guides | P2 | 8h |

---

## Summary

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular Monolith** | Avoid microservice latency for AI workloads |
| **Translator Module** | Clean separation between visual and executable |
| **Protocol Package** | Single source of truth for JSON contracts |
| **RLS-First Tenancy** | Database-level security, not application-level |
| **Feature Modules** | Domain-driven, self-contained frontend features |
| **Streaming Components** | Specialized UI for AI output rendering |

### What Makes This "World-Class"

1. **VITAL-Specific** - Designed for LangGraph, React Flow, and AI streaming
2. **Security-Native** - RLS enforced at database layer
3. **Scalable** - Can evolve to microservices if needed
4. **Testable** - Clean boundaries enable thorough testing
5. **Maintainable** - Clear module boundaries and naming conventions
6. **Developer-Friendly** - Consistent patterns across the codebase

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-05 | AI Engineering | Initial generic structure |
| 2.0 | 2025-12-05 | AI Engineering | VITAL-specific enhancements |
