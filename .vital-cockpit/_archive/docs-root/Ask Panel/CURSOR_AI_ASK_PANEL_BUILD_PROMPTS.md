# 🎯 Cursor AI Build Prompts: Ask Panel Services Foundation

**Version**: 1.0  
**Created**: November 1, 2025  
**Purpose**: Step-by-step prompts to guide Cursor AI in building VITAL Ask Panel Services  
**Architecture**: Domain-Driven Design with Shared Kernel Pattern

---

## 📋 TABLE OF CONTENTS

1. [Overview & Prerequisites](#overview--prerequisites)
2. [Phase 1: Shared Kernel Foundation](#phase-1-shared-kernel-foundation)
3. [Phase 2: Ask Panel Service Core](#phase-2-ask-panel-service-core)
4. [Phase 3: Panel Orchestration Logic](#phase-3-panel-orchestration-logic)
5. [Phase 4: API & Streaming](#phase-4-api--streaming)
6. [Phase 5: Testing & Deployment](#phase-5-testing--deployment)
7. [Validation & Quality Checks](#validation--quality-checks)

---

## 🎓 OVERVIEW & PREREQUISITES

### Architecture Context

We're building a **Domain-Driven Design (DDD)** architecture with:
- **Shared Kernel**: Common resources (agents, prompts, RAG, tools)
- **Bounded Contexts**: Independent services per tier
- **Event-Driven**: Inter-service communication
- **Multi-Tenant**: Isolated tenant data at all layers

### Project Structure

```
VITAL/
├── services/
│   ├── shared-kernel/              # Shared resources
│   ├── ask-expert-service/         # $2K/month tier
│   ├── ask-panel-service/          # $10K/month tier ⭐ PRIMARY FOCUS
│   ├── jtbd-service/               # $15K/month tier
│   └── solution-builder-service/   # $50K+ tier
```

### Before You Start

1. **Read Documentation**: Review `ASK_PANEL_COMPREHENSIVE_DOCUMENTATION.md`
2. **Understand DDD**: Familiarize with Domain-Driven Design principles
3. **Know LangGraph**: Understand state machines and workflows
4. **Modal.com**: Review serverless deployment patterns

---

## 🔷 PHASE 1: SHARED KERNEL FOUNDATION

### Why Shared Kernel?

All four services (Ask Expert, Ask Panel, JTBD, Solution Builder) need:
- Same 136+ AI expert agents
- Same prompt templates
- Same RAG engine
- Same infrastructure utilities

Instead of duplicating across 4 services, we create ONE shared Python package.

---

### PROMPT 1.1: Create Shared Kernel Project Structure

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the VITAL platform backend using Domain-Driven Design. I need to create a shared kernel package that will be used by all services (Ask Expert, Ask Panel, JTBD, Solution Builder).

TASK:
Create the complete project structure for the shared-kernel package with the following requirements:

DIRECTORY STRUCTURE:
services/shared-kernel/
├── src/
│   └── vital_shared_kernel/
│       ├── __init__.py
│       ├── agents/
│       │   ├── __init__.py
│       │   ├── registry/
│       │   │   ├── __init__.py
│       │   │   ├── agent_registry.py
│       │   │   ├── agent_loader.py
│       │   │   └── agent_versioning.py
│       │   ├── definitions/
│       │   │   ├── __init__.py
│       │   │   └── base_agent.py
│       │   ├── capabilities/
│       │   │   ├── __init__.py
│       │   │   ├── capability_matcher.py
│       │   │   └── skill_scorer.py
│       │   └── metadata/
│       │       ├── __init__.py
│       │       └── agent_metadata.py
│       ├── prompts/
│       │   ├── __init__.py
│       │   ├── registry/
│       │   │   ├── __init__.py
│       │   │   └── prompt_registry.py
│       │   ├── templates/
│       │   │   ├── __init__.py
│       │   │   ├── medical/
│       │   │   ├── regulatory/
│       │   │   ├── clinical/
│       │   │   └── commercial/
│       │   └── builders/
│       │       ├── __init__.py
│       │       ├── system_prompt_builder.py
│       │       └── context_prompt_builder.py
│       ├── rag/
│       │   ├── __init__.py
│       │   ├── engine/
│       │   │   ├── __init__.py
│       │   │   ├── rag_engine.py
│       │   │   └── retriever.py
│       │   ├── vectorstore/
│       │   │   ├── __init__.py
│       │   │   └── supabase_vectorstore.py
│       │   └── embeddings/
│       │       ├── __init__.py
│       │       └── embedding_manager.py
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── medical/
│       │   ├── regulatory/
│       │   └── analysis/
│       ├── infrastructure/
│       │   ├── __init__.py
│       │   ├── config/
│       │   │   ├── __init__.py
│       │   │   └── settings.py
│       │   ├── database/
│       │   │   ├── __init__.py
│       │   │   ├── supabase_client.py
│       │   │   └── redis_client.py
│       │   ├── monitoring/
│       │   │   ├── __init__.py
│       │   │   ├── metrics.py
│       │   │   └── logging.py
│       │   └── security/
│       │       ├── __init__.py
│       │       ├── tenant_context.py
│       │       └── auth_validator.py
│       └── domain/
│           ├── __init__.py
│           ├── value_objects/
│           │   ├── __init__.py
│           │   ├── tenant_id.py
│           │   ├── agent_id.py
│           │   └── confidence_score.py
│           ├── events/
│           │   ├── __init__.py
│           │   └── domain_event.py
│           └── exceptions/
│               ├── __init__.py
│               └── domain_exceptions.py
├── tests/
│   ├── __init__.py
│   ├── agents/
│   ├── prompts/
│   ├── rag/
│   └── infrastructure/
├── setup.py
├── requirements.txt
├── README.md
└── .gitignore

REQUIREMENTS:
1. Create ALL directories and __init__.py files
2. Generate setup.py with proper package configuration
3. Create requirements.txt with all dependencies
4. Add comprehensive README.md
5. Include proper .gitignore for Python projects

DEPENDENCIES NEEDED:
- langchain>=0.1.0
- langchain-openai>=0.0.5
- langgraph>=0.0.20
- pydantic>=2.0.0
- supabase>=2.0.0
- redis>=5.0.0
- openai>=1.0.0
- anthropic>=0.7.0
- numpy>=1.24.0
- pytest>=7.4.0
- pytest-asyncio>=0.21.0

PACKAGE NAME: vital-shared-kernel
VERSION: 0.1.0
AUTHOR: VITAL Platform
PYTHON REQUIRES: >=3.11

Create the complete structure with proper Python packaging setup.
```

**Expected Output**: Complete directory structure with all files created

---

### PROMPT 1.2: Implement Base Agent Class

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the shared kernel for VITAL platform. I need to create the base agent class that all 136+ AI expert agents will inherit from.

FILE: services/shared-kernel/src/vital_shared_kernel/agents/definitions/base_agent.py

TASK:
Create a comprehensive base agent class with the following requirements:

AGENT PROPERTIES:
1. id: Unique identifier (e.g., "fda_expert", "clinical_researcher")
2. name: Display name (e.g., "Dr. FDA Regulatory Expert")
3. domain: Primary domain (medical, regulatory, clinical, commercial, technical)
4. sub_domains: List of sub-specializations
5. expertise_areas: Specific expertise (e.g., ["510k submissions", "Class II devices"])
6. years_experience: Simulated experience level (5-30 years)
7. credentials: Educational background and certifications
8. system_prompt: Base system prompt template
9. model: LLM model to use (gpt-4, claude-3-opus, etc.)
10. temperature: Generation temperature (0.0-1.0)
11. max_tokens: Maximum response tokens
12. capabilities: List of agent capabilities
13. tools: Available tools for this agent

METHODS REQUIRED:
1. generate_response(query: str, context: dict) -> str
2. async_generate_response(query: str, context: dict) -> str
3. validate_query(query: str) -> bool
4. build_context_prompt(context: dict) -> str
5. calculate_confidence(response: str) -> float
6. get_metadata() -> dict
7. supports_capability(capability: str) -> bool

CODE REQUIREMENTS:
- Use Pydantic BaseModel for validation
- Include comprehensive type hints
- Add detailed docstrings
- Implement error handling
- Support both OpenAI and Anthropic models
- Include logging
- Multi-tenant context support

INTEGRATION:
- Must work with LangChain
- Must work with LangGraph state machines
- Must support streaming responses

Example usage should be:
```python
from vital_shared_kernel.agents.definitions.base_agent import BaseAgent

class FDAExpert(BaseAgent):
    def __init__(self):
        super().__init__(
            id="fda_expert",
            name="Dr. FDA Regulatory Expert",
            domain="regulatory",
            expertise_areas=["510k", "PMA", "Class II devices"]
        )
```

Create the complete, production-ready implementation.
```

**Expected Output**: Complete `base_agent.py` with all methods implemented

---

### PROMPT 1.3: Implement Agent Registry

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the shared kernel for VITAL platform. I need to create a central agent registry that manages all 136+ AI expert agents.

FILE: services/shared-kernel/src/vital_shared_kernel/agents/registry/agent_registry.py

TASK:
Create a comprehensive agent registry with the following requirements:

REGISTRY FEATURES:
1. Singleton pattern - only one registry instance
2. Agent registration and discovery
3. Search agents by criteria (domain, capabilities, expertise)
4. Semantic search for best agent match
5. Load agents dynamically from definitions
6. Version management for agents
7. Caching for performance

METHODS REQUIRED:
1. register(agent: BaseAgent) -> None
2. get_agent(agent_id: str) -> Optional[BaseAgent]
3. get_agents_by_domain(domain: str) -> List[BaseAgent]
4. search_agents(query: str, filters: dict) -> List[BaseAgent]
5. find_best_agents(query: str, num_agents: int) -> List[BaseAgent]
6. list_all_agents() -> List[BaseAgent]
7. get_agent_metadata(agent_id: str) -> dict
8. reload_agents() -> None

SEARCH CAPABILITIES:
- Semantic search using embeddings
- Filter by domain, sub-domain, expertise
- Score agents by relevance
- Support multi-criteria matching

CACHING:
- Cache agent instances
- Cache search results (5 min TTL)
- Invalidate on agent updates

ERROR HANDLING:
- AgentNotFoundError
- DuplicateAgentError
- InvalidAgentError

INTEGRATION:
- Use Redis for caching
- Use vector similarity for semantic search
- Support lazy loading of agents

Example usage:
```python
from vital_shared_kernel.agents.registry import AgentRegistry

registry = AgentRegistry()

# Get specific agent
agent = registry.get_agent("fda_expert")

# Find best agents for query
agents = registry.find_best_agents(
    "I need help with 510k submission for Class II device",
    num_agents=3
)

# Search with filters
regulatory_agents = registry.search_agents(
    query="FDA submission",
    filters={"domain": "regulatory", "years_experience": ">10"}
)
```

DEPENDENCIES:
- vital_shared_kernel.agents.definitions.base_agent
- vital_shared_kernel.infrastructure.database.redis_client
- sentence-transformers or openai embeddings

Create the complete, production-ready implementation with comprehensive error handling and testing.
```

**Expected Output**: Complete `agent_registry.py` with singleton pattern and search

---

### PROMPT 1.4: Implement RAG Engine

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the shared kernel for VITAL platform. I need to create a RAG (Retrieval-Augmented Generation) engine that will be used by all services for document search and context retrieval.

FILE: services/shared-kernel/src/vital_shared_kernel/rag/engine/rag_engine.py

TASK:
Create a comprehensive RAG engine with the following requirements:

RAG ENGINE FEATURES:
1. Document ingestion and chunking
2. Vector embedding generation
3. Semantic search and retrieval
4. Context building for LLM prompts
5. Multi-tenant document isolation
6. Hybrid search (vector + keyword)
7. Result reranking

METHODS REQUIRED:
1. ingest_document(document: Document, tenant_id: str) -> str
2. search(query: str, tenant_id: str, top_k: int) -> List[Document]
3. hybrid_search(query: str, tenant_id: str, filters: dict) -> List[Document]
4. build_context(query: str, documents: List[Document]) -> str
5. delete_document(doc_id: str, tenant_id: str) -> bool
6. update_document(doc_id: str, document: Document, tenant_id: str) -> bool
7. get_document_stats(tenant_id: str) -> dict

CHUNKING STRATEGIES:
- Fixed size chunking (512 tokens default)
- Semantic chunking (paragraph/section boundaries)
- Overlapping chunks (20% overlap)
- Metadata preservation

VECTOR STORE:
- Use Supabase pgvector
- Store embeddings and metadata
- Multi-tenant row-level security
- Fast approximate nearest neighbor search

EMBEDDING MODELS:
- Support OpenAI text-embedding-3-large
- Support sentence-transformers
- Batch embedding for efficiency

RERANKING:
- Cross-encoder reranking for top results
- Diversity-based reranking
- Relevance scoring

MULTI-TENANT SECURITY:
- ALL queries filtered by tenant_id
- Row-level security enforcement
- Audit logging

Example usage:
```python
from vital_shared_kernel.rag.engine import RAGEngine

rag = RAGEngine()

# Ingest document
doc_id = await rag.ingest_document(
    document=Document(
        content="FDA 510k submission guidelines...",
        metadata={"source": "fda.gov", "type": "regulatory"}
    ),
    tenant_id="tenant-123"
)

# Search
results = await rag.search(
    query="510k submission requirements for Class II device",
    tenant_id="tenant-123",
    top_k=5
)

# Build context for LLM
context = rag.build_context(
    query="What are the requirements?",
    documents=results
)
```

DEPENDENCIES:
- langchain.text_splitter
- langchain.embeddings
- supabase (for pgvector)
- vital_shared_kernel.infrastructure.database.supabase_client

CODE REQUIREMENTS:
- Async/await for all I/O operations
- Comprehensive error handling
- Logging and monitoring
- Type hints and Pydantic models
- Unit tests included

Create the complete, production-ready implementation.
```

**Expected Output**: Complete `rag_engine.py` with vector search and multi-tenant support

---

### PROMPT 1.5: Implement Shared Infrastructure

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the shared kernel for VITAL platform. I need to create shared infrastructure utilities for database connections, caching, monitoring, and security.

TASKS:
Create the following infrastructure components:

1. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/config/settings.py

REQUIREMENTS:
- Use Pydantic Settings for environment variables
- Load from .env file
- Validate all required settings
- Support multiple environments (dev, staging, prod)

SETTINGS NEEDED:
- SUPABASE_URL, SUPABASE_KEY
- REDIS_URL
- OPENAI_API_KEY, ANTHROPIC_API_KEY
- ENVIRONMENT (dev/staging/prod)
- LOG_LEVEL
- MODAL_TOKEN_ID, MODAL_TOKEN_SECRET

---

2. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/database/supabase_client.py

REQUIREMENTS:
- Singleton Supabase client
- Connection pooling
- Auto-reconnection on failure
- Multi-tenant context injection
- Query logging

METHODS:
- get_client() -> Client
- execute_query(query: str, params: dict, tenant_id: str) -> dict
- execute_rpc(function: str, params: dict, tenant_id: str) -> dict

---

3. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/database/redis_client.py

REQUIREMENTS:
- Redis connection with connection pooling
- Caching utilities
- TTL management
- Multi-tenant key namespacing

METHODS:
- get(key: str, tenant_id: str) -> Optional[str]
- set(key: str, value: str, tenant_id: str, ttl: int) -> bool
- delete(key: str, tenant_id: str) -> bool
- exists(key: str, tenant_id: str) -> bool

---

4. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/security/tenant_context.py

REQUIREMENTS:
- Tenant context management
- Context propagation through async calls
- Thread-local storage for tenant_id

METHODS:
- set_tenant_context(tenant_id: str) -> None
- get_tenant_context() -> str
- clear_tenant_context() -> None
- validate_tenant(tenant_id: str) -> bool

---

5. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/monitoring/logging.py

REQUIREMENTS:
- Structured logging (JSON format)
- Log levels (DEBUG, INFO, WARNING, ERROR)
- Correlation IDs for request tracing
- Tenant ID in all logs

SETUP:
- Configure logging for all modules
- Support both console and file logging
- Integration with LangFuse for LLM tracing

Example usage:
```python
from vital_shared_kernel.infrastructure.config import settings
from vital_shared_kernel.infrastructure.database import supabase_client, redis_client
from vital_shared_kernel.infrastructure.security import tenant_context
from vital_shared_kernel.infrastructure.monitoring import logger

# Settings
print(settings.SUPABASE_URL)

# Supabase
client = supabase_client.get_client()
result = await client.execute_query(
    "SELECT * FROM panels WHERE tenant_id = %s",
    {"tenant_id": "tenant-123"},
    tenant_id="tenant-123"
)

# Redis
redis = redis_client.get_client()
await redis.set("key", "value", tenant_id="tenant-123", ttl=300)

# Tenant context
tenant_context.set_tenant_context("tenant-123")
current = tenant_context.get_tenant_context()

# Logging
logger.info("Processing panel request", extra={"panel_id": "panel-123"})
```

Create all 5 files with complete, production-ready implementations.
```

**Expected Output**: 5 complete infrastructure files

---

### PROMPT 1.6: Create Shared Kernel Package Configuration

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the shared kernel package for VITAL platform. I need to create the package configuration files so it can be installed and used by all services.

TASKS:
Create the following package files:

1. FILE: services/shared-kernel/setup.py

REQUIREMENTS:
- Package name: vital-shared-kernel
- Version: 0.1.0
- Python requires: >=3.11
- Include all dependencies
- Entry points for CLI tools (if any)

---

2. FILE: services/shared-kernel/requirements.txt

INCLUDE ALL DEPENDENCIES:
# LangChain & AI
langchain>=0.1.0
langchain-openai>=0.0.5
langchain-anthropic>=0.0.5
langgraph>=0.0.20
openai>=1.0.0
anthropic>=0.7.0

# Database & Caching
supabase>=2.0.0
redis>=5.0.0
pgvector>=0.2.0

# Data & ML
numpy>=1.24.0
pandas>=2.0.0
sentence-transformers>=2.2.0
scikit-learn>=1.3.0

# API & Web
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0

# Monitoring
langfuse>=2.0.0
prometheus-client>=0.19.0

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0

---

3. FILE: services/shared-kernel/README.md

INCLUDE:
- Package overview
- Installation instructions
- Quick start guide
- Architecture overview
- API documentation
- Examples for each major component
- Development setup
- Testing instructions
- Contributing guidelines

---

4. FILE: services/shared-kernel/.gitignore

PYTHON GITIGNORE with:
- __pycache__/
- *.py[cod]
- .env
- .venv/
- dist/
- build/
- *.egg-info/
- .pytest_cache/
- .coverage

---

5. FILE: services/shared-kernel/pyproject.toml

MODERN PYTHON PACKAGING:
- build-system configuration
- project metadata
- tool configurations (pytest, mypy, black)

Example installation:
```bash
# Install in development mode
cd services/shared-kernel
pip install -e .

# Use in other services
pip install ../shared-kernel

# Import in code
from vital_shared_kernel.agents import AgentRegistry
from vital_shared_kernel.rag import RAGEngine
from vital_shared_kernel.infrastructure import settings
```

Create all files with complete, production-ready configurations.
```

**Expected Output**: Complete package configuration ready for installation

---

### ✅ PHASE 1 VALIDATION CHECKLIST

After completing Phase 1, verify:

```bash
# 1. Install shared kernel
cd services/shared-kernel
pip install -e .

# 2. Test imports
python -c "from vital_shared_kernel.agents import AgentRegistry; print('✅ Agents OK')"
python -c "from vital_shared_kernel.rag import RAGEngine; print('✅ RAG OK')"
python -c "from vital_shared_kernel.infrastructure import settings; print('✅ Infrastructure OK')"

# 3. Run tests
pytest tests/ -v

# 4. Check code quality
mypy src/
black --check src/
```

**Success Criteria:**
- [ ] All directories and files created
- [ ] Package installs without errors
- [ ] All imports work
- [ ] Tests pass (>80% coverage)
- [ ] No type errors
- [ ] Code formatted properly

---

## 🎭 PHASE 2: ASK PANEL SERVICE CORE

### Overview

Now that we have the shared kernel, we'll build the Ask Panel service which provides virtual advisory board capabilities with 6 panel orchestration types.

---

### PROMPT 2.1: Create Ask Panel Service Structure

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service for VITAL platform ($10K/month tier). This service orchestrates multi-expert AI discussions using 6 different panel types. It uses Domain-Driven Design architecture.

TASK:
Create the complete project structure for ask-panel-service with the following requirements:

DIRECTORY STRUCTURE:
services/ask-panel-service/
├── src/
│   ├── __init__.py
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── panel.py              # Aggregate root
│   │   │   ├── panel_member.py       # Entity
│   │   │   ├── discussion.py         # Entity
│   │   │   ├── consensus.py          # Value object
│   │   │   ├── panel_type.py         # Enum
│   │   │   └── panel_status.py       # Enum
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── panel_orchestrator.py
│   │   │   ├── consensus_builder.py
│   │   │   ├── swarm_intelligence.py
│   │   │   ├── quantum_consensus.py
│   │   │   └── expert_coordinator.py
│   │   ├── strategies/
│   │   │   ├── __init__.py
│   │   │   ├── base_strategy.py
│   │   │   ├── structured_panel.py
│   │   │   ├── open_panel.py
│   │   │   ├── socratic_panel.py
│   │   │   ├── adversarial_panel.py
│   │   │   ├── delphi_panel.py
│   │   │   └── hybrid_panel.py
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   └── panel_repository.py
│   │   └── events/
│   │       ├── __init__.py
│   │       ├── panel_events.py
│   │       └── event_handlers.py
│   ├── application/
│   │   ├── __init__.py
│   │   ├── use_cases/
│   │   │   ├── __init__.py
│   │   │   ├── create_panel.py
│   │   │   ├── execute_panel.py
│   │   │   ├── stream_panel.py
│   │   │   ├── get_panel.py
│   │   │   └── list_panels.py
│   │   ├── workflows/
│   │   │   ├── __init__.py
│   │   │   ├── panel_workflows.py
│   │   │   └── consensus_workflows.py
│   │   └── dto/
│   │       ├── __init__.py
│   │       ├── panel_request.py
│   │       ├── panel_response.py
│   │       └── consensus_dto.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── panels.py
│   │   │       └── health.py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── tenant_validator.py
│   │   │   ├── auth_middleware.py
│   │   │   └── error_handler.py
│   │   └── main.py
│   └── infrastructure/
│       ├── __init__.py
│       ├── persistence/
│       │   ├── __init__.py
│       │   ├── panel_repo_impl.py
│       │   └── state_checkpointer.py
│       ├── messaging/
│       │   ├── __init__.py
│       │   └── event_publisher.py
│       └── streaming/
│           ├── __init__.py
│           └── sse_manager.py
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/
│   │   └── api/
│   └── fixtures/
│       └── test_data.py
├── Dockerfile
├── modal_config.py
├── requirements.txt
├── pytest.ini
└── README.md

REQUIREMENTS:
1. Create ALL directories and __init__.py files
2. Follow Domain-Driven Design (DDD) principles
3. Separate domain logic from infrastructure
4. Use dependency injection
5. Support multi-tenant architecture

DEPENDENCIES (requirements.txt):
# Shared kernel
vital-shared-kernel @ file:../shared-kernel

# FastAPI & API
fastapi>=0.104.0
uvicorn>=0.24.0
python-multipart>=0.0.6
sse-starlette>=1.6.5

# LangGraph & State Management
langgraph>=0.0.20
langchain>=0.1.0

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.25.0

Create the complete structure with proper Python packaging.
```

**Expected Output**: Complete ask-panel-service directory structure

---

### PROMPT 2.2: Implement Domain Models

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service domain layer. I need to create the core domain models following Domain-Driven Design principles.

TASKS:
Create the following domain model files:

1. FILE: services/ask-panel-service/src/domain/models/panel_type.py

REQUIREMENTS:
Create an Enum for 6 panel types:
- STRUCTURED: Sequential moderated discussion
- OPEN: Parallel collaborative exploration
- SOCRATIC: Iterative questioning methodology
- ADVERSARIAL: Structured debate format
- DELPHI: Anonymous iterative rounds
- HYBRID: Combined human + AI experts

Include metadata for each type (duration_estimate, min_experts, max_experts)

---

2. FILE: services/ask-panel-service/src/domain/models/panel_status.py

REQUIREMENTS:
Create an Enum for panel lifecycle:
- CREATED: Initial state
- QUEUED: Waiting for execution
- ASSIGNING_EXPERTS: Finding best agents
- IN_PROGRESS: Discussion ongoing
- BUILDING_CONSENSUS: Calculating agreement
- COMPLETED: Finished successfully
- FAILED: Error occurred
- CANCELLED: User cancelled

---

3. FILE: services/ask-panel-service/src/domain/models/consensus.py

REQUIREMENTS:
Create a value object for consensus results:

PROPERTIES:
- level: float (0.0-1.0) - Agreement level
- dimensions: dict - Multi-dimensional scores (technical, regulatory, market)
- confidence: float - Confidence in consensus
- minority_opinions: List[str] - Dissenting views
- reasoning: str - Explanation of consensus
- metadata: dict - Additional context

METHODS:
- is_strong_consensus() -> bool  (level >= 0.8)
- is_weak_consensus() -> bool    (0.5 <= level < 0.8)
- has_dissent() -> bool
- to_dict() -> dict

---

4. FILE: services/ask-panel-service/src/domain/models/panel_member.py

REQUIREMENTS:
Create an entity for panel members:

PROPERTIES:
- member_id: str
- agent_id: str
- agent_name: str
- role: str (expert, moderator, facilitator)
- position: Optional[str] (pro/con for adversarial)
- responses: List[dict]
- confidence_scores: List[float]
- is_human: bool (for hybrid panels)

METHODS:
- add_response(content: str, confidence: float) -> None
- get_average_confidence() -> float
- has_responded() -> bool

---

5. FILE: services/ask-panel-service/src/domain/models/discussion.py

REQUIREMENTS:
Create an entity for discussion rounds:

PROPERTIES:
- round_number: int
- round_type: str (opening, deliberation, rebuttal, closing)
- messages: List[dict]
- consensus_level: float
- started_at: datetime
- completed_at: Optional[datetime]
- duration_seconds: int

METHODS:
- add_message(member_id: str, content: str) -> None
- calculate_round_consensus() -> float
- is_complete() -> bool
- get_summary() -> str

---

6. FILE: services/ask-panel-service/src/domain/models/panel.py

REQUIREMENTS:
Create the aggregate root for Panel:

PROPERTIES:
- panel_id: str (UUID)
- tenant_id: str
- user_id: str
- query: str
- panel_type: PanelType
- status: PanelStatus
- members: List[PanelMember]
- discussions: List[Discussion]
- consensus: Optional[Consensus]
- final_recommendation: Optional[str]
- metadata: dict
- created_at: datetime
- updated_at: datetime
- completed_at: Optional[datetime]

METHODS:
- add_member(member: PanelMember) -> None
- start_discussion() -> None
- add_discussion_round(discussion: Discussion) -> None
- update_consensus(consensus: Consensus) -> None
- complete(recommendation: str) -> None
- fail(error: str) -> None
- calculate_estimated_duration() -> int (seconds)
- to_dict() -> dict

BUSINESS RULES:
- Panel must have 3-12 members
- Cannot add members after discussion starts
- Consensus only calculated when all members respond
- Panel cannot be modified after completion

Example usage:
```python
from domain.models.panel import Panel
from domain.models.panel_type import PanelType

panel = Panel(
    panel_id="panel-123",
    tenant_id="tenant-456",
    user_id="user-789",
    query="What are the FDA requirements for Class II devices?",
    panel_type=PanelType.STRUCTURED
)

panel.add_member(member1)
panel.add_member(member2)
panel.start_discussion()
```

CODE REQUIREMENTS:
- Use Pydantic BaseModel for validation
- Include comprehensive type hints
- Add docstrings for all methods
- Implement validation rules
- Include audit fields (created_at, updated_at)
- Support serialization to/from dict

Create all 6 files with complete, production-ready implementations following DDD principles.
```

**Expected Output**: 6 complete domain model files

---

### PROMPT 2.3: Implement Panel Repository

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. I need to create the repository interface and implementation for persisting panels to Supabase.

TASKS:
Create the following repository files:

1. FILE: services/ask-panel-service/src/domain/repositories/panel_repository.py

REQUIREMENTS:
Create an abstract base class (interface) for panel persistence:

METHODS (all async):
- create(panel: Panel) -> Panel
- get_by_id(panel_id: str, tenant_id: str) -> Optional[Panel]
- update(panel: Panel) -> Panel
- delete(panel_id: str, tenant_id: str) -> bool
- list_by_user(user_id: str, tenant_id: str, limit: int, offset: int) -> List[Panel]
- list_by_status(status: PanelStatus, tenant_id: str) -> List[Panel]
- count_by_tenant(tenant_id: str) -> int

Use ABC (Abstract Base Class) pattern

---

2. FILE: services/ask-panel-service/src/infrastructure/persistence/panel_repo_impl.py

REQUIREMENTS:
Create the concrete implementation using Supabase:

IMPLEMENTATION:
- Inherit from abstract panel_repository
- Use supabase_client from shared kernel
- Enforce multi-tenant row-level security
- Handle serialization/deserialization
- Implement optimistic locking (version field)
- Add comprehensive error handling

DATABASE SCHEMA NEEDED:
Table: panels
Columns:
- id (uuid, primary key)
- tenant_id (uuid, not null, indexed)
- user_id (uuid, not null)
- query (text, not null)
- panel_type (text, not null)
- status (text, not null)
- members (jsonb)
- discussions (jsonb)
- consensus (jsonb)
- final_recommendation (text)
- metadata (jsonb)
- version (int, for optimistic locking)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- completed_at (timestamp with time zone)

Indexes:
- tenant_id, user_id
- tenant_id, status
- tenant_id, created_at

Row Level Security:
- All queries filtered by tenant_id
- Users can only access their own panels

METHODS IMPLEMENTATION:
```python
async def create(self, panel: Panel) -> Panel:
    """Create new panel in database"""
    data = {
        "id": panel.panel_id,
        "tenant_id": panel.tenant_id,
        "user_id": panel.user_id,
        "query": panel.query,
        "panel_type": panel.panel_type.value,
        "status": panel.status.value,
        "members": [m.dict() for m in panel.members],
        "discussions": [d.dict() for d in panel.discussions],
        "consensus": panel.consensus.dict() if panel.consensus else None,
        "final_recommendation": panel.final_recommendation,
        "metadata": panel.metadata,
        "version": 1,
        "created_at": panel.created_at.isoformat(),
        "updated_at": panel.updated_at.isoformat()
    }
    
    result = await self.supabase.table("panels").insert(data).execute()
    return panel

async def get_by_id(self, panel_id: str, tenant_id: str) -> Optional[Panel]:
    """Get panel by ID with tenant isolation"""
    result = await self.supabase.table("panels")\
        .select("*")\
        .eq("id", panel_id)\
        .eq("tenant_id", tenant_id)\
        .single()\
        .execute()
    
    if not result.data:
        return None
    
    return self._to_domain(result.data)
```

ERROR HANDLING:
- PanelNotFoundError
- TenantMismatchError
- OptimisticLockError (version conflicts)
- DatabaseConnectionError

LOGGING:
- Log all database operations
- Include tenant_id in logs
- Track query performance

Example usage:
```python
from infrastructure.persistence import PanelRepositoryImpl

repo = PanelRepositoryImpl()

# Create panel
panel = await repo.create(panel)

# Get panel
panel = await repo.get_by_id("panel-123", "tenant-456")

# List user panels
panels = await repo.list_by_user(
    user_id="user-789",
    tenant_id="tenant-456",
    limit=20,
    offset=0
)
```

Create both files with complete, production-ready implementations.
```

**Expected Output**: Complete repository interface and Supabase implementation

---

### PROMPT 2.4: Implement Domain Services

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service domain layer. I need to create domain services that contain business logic for panel orchestration and consensus building.

TASKS:
Create the following domain service files:

1. FILE: services/ask-panel-service/src/domain/services/expert_coordinator.py

REQUIREMENTS:
Service for coordinating expert agent selection and assignment

METHODS:
- async select_experts(query: str, panel_type: PanelType, num_experts: int) -> List[str]
- async assign_experts(panel: Panel, agent_ids: List[str]) -> Panel
- async validate_expert_composition(agents: List[str], panel_type: PanelType) -> bool
- async get_expert_diversity_score(agents: List[str]) -> float

LOGIC:
- Use AgentRegistry from shared kernel
- Semantic search for relevant experts
- Ensure domain diversity
- Balance expertise levels
- Consider panel type requirements
- Score experts by relevance

Example:
```python
coordinator = ExpertCoordinator()
agent_ids = await coordinator.select_experts(
    query="FDA 510k submission for Class II device",
    panel_type=PanelType.STRUCTURED,
    num_experts=5
)
# Returns: ["fda_expert", "regulatory_strategist", "clinical_researcher", ...]
```

---

2. FILE: services/ask-panel-service/src/domain/services/consensus_builder.py

REQUIREMENTS:
Service for building consensus from expert responses

METHODS:
- async calculate_consensus(responses: List[dict]) -> Consensus
- async analyze_dimensions(responses: List[dict]) -> dict
- async identify_minority_opinions(responses: List[dict], consensus_level: float) -> List[str]
- async calculate_confidence(responses: List[dict]) -> float
- async generate_reasoning(responses: List[dict], consensus_level: float) -> str

CONSENSUS ALGORITHM:
1. Extract key themes from all responses
2. Calculate agreement on each theme
3. Compute multi-dimensional scores (technical, regulatory, market, clinical)
4. Identify outlier opinions
5. Calculate overall consensus level
6. Generate explanation

DIMENSIONS:
- technical_feasibility: 0.0-1.0
- regulatory_compliance: 0.0-1.0
- market_viability: 0.0-1.0
- clinical_efficacy: 0.0-1.0
- financial_feasibility: 0.0-1.0

Example:
```python
builder = ConsensusBuilder()
consensus = await builder.calculate_consensus([
    {"agent_id": "fda_expert", "content": "Requires 510k...", "confidence": 0.9},
    {"agent_id": "clinical_expert", "content": "Clinical trials needed...", "confidence": 0.85},
    ...
])
# Returns: Consensus(level=0.82, dimensions={...}, confidence=0.87)
```

---

3. FILE: services/ask-panel-service/src/domain/services/swarm_intelligence.py

REQUIREMENTS:
Service implementing swarm intelligence patterns for emergent solutions

METHODS:
- async apply_swarm_pattern(responses: List[dict], iterations: int) -> dict
- async calculate_emergence_score(responses: List[dict]) -> float
- async identify_emergent_solutions(responses: List[dict]) -> List[str]
- async refine_through_swarm(initial_solution: str, responses: List[dict]) -> str

SWARM PATTERNS:
1. Pheromone trails: Track solution popularity
2. Stigmergy: Indirect coordination through responses
3. Self-organization: Solutions emerge from interactions
4. Collective intelligence: Group wisdom > individual

Example:
```python
swarm = SwarmIntelligence()
emergent = await swarm.identify_emergent_solutions([
    {"agent": "expert1", "solution": "Approach A"},
    {"agent": "expert2", "solution": "Approach A with modification"},
    {"agent": "expert3", "solution": "Approach B"},
])
# Returns: ["Hybrid Approach A+B", "Modified Approach A"]
```

---

4. FILE: services/ask-panel-service/src/domain/services/quantum_consensus.py

REQUIREMENTS:
Service implementing quantum-inspired consensus (superposition of expert states)

METHODS:
- async calculate_quantum_consensus(responses: List[dict]) -> dict
- async measure_entanglement(responses: List[dict]) -> float
- async collapse_superposition(responses: List[dict]) -> str
- async calculate_coherence(responses: List[dict]) -> float

QUANTUM CONCEPTS:
1. Superposition: Multiple valid solutions coexist
2. Entanglement: Responses influence each other
3. Collapse: Final recommendation emerges
4. Coherence: Consistency across expert states

Example:
```python
quantum = QuantumConsensus()
result = await quantum.calculate_quantum_consensus([
    {"state": "recommend_510k", "amplitude": 0.7},
    {"state": "recommend_pma", "amplitude": 0.3},
])
# Returns: {"dominant_state": "recommend_510k", "coherence": 0.85}
```

---

5. FILE: services/ask-panel-service/src/domain/services/panel_orchestrator.py

REQUIREMENTS:
Main orchestration service that coordinates all panel activities

METHODS:
- async orchestrate_panel(panel: Panel, strategy: BasePanelStrategy) -> Panel
- async execute_round(panel: Panel, round_number: int) -> Discussion
- async coordinate_responses(panel: Panel, round: Discussion) -> List[dict]
- async build_final_consensus(panel: Panel) -> Consensus
- async generate_recommendation(panel: Panel, consensus: Consensus) -> str

ORCHESTRATION FLOW:
1. Validate panel setup
2. Execute panel strategy (structured, open, socratic, etc.)
3. Coordinate expert responses in rounds
4. Build consensus after each round
5. Determine if more rounds needed
6. Generate final recommendation
7. Compile report

INTEGRATION:
- Uses ExpertCoordinator for agent selection
- Uses ConsensusBuilder for agreement calculation
- Uses SwarmIntelligence for emergent solutions
- Uses QuantumConsensus for final recommendation

Example:
```python
orchestrator = PanelOrchestrator()
completed_panel = await orchestrator.orchestrate_panel(
    panel=panel,
    strategy=StructuredPanelStrategy()
)
```

CODE REQUIREMENTS for all files:
- Async/await for all I/O operations
- Comprehensive type hints
- Detailed docstrings
- Error handling
- Logging
- Unit testable (dependency injection)
- Use shared kernel components (AgentRegistry, RAGEngine)

Create all 5 files with complete, production-ready implementations.
```

**Expected Output**: 5 complete domain service files with business logic

---

### ✅ PHASE 2 VALIDATION CHECKLIST

After completing Phase 2, verify:

```bash
# 1. Check structure
ls -R services/ask-panel-service/src/

# 2. Test imports
python -c "from src.domain.models import Panel, PanelType; print('✅ Models OK')"
python -c "from src.domain.services import PanelOrchestrator; print('✅ Services OK')"

# 3. Run domain tests
pytest services/ask-panel-service/tests/unit/domain/ -v

# 4. Validate domain logic
pytest services/ask-panel-service/tests/unit/domain/test_panel.py -v
```

**Success Criteria:**
- [ ] All domain models created
- [ ] Repository interface and implementation complete
- [ ] All domain services implemented
- [ ] Unit tests passing (>80% coverage)
- [ ] No circular dependencies
- [ ] Domain logic isolated from infrastructure

---

## 🔄 PHASE 3: PANEL ORCHESTRATION LOGIC

### Overview

Implement the 6 panel strategies and LangGraph workflows for panel execution.

---

### PROMPT 3.1: Implement Base Panel Strategy

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. I need to create a base strategy pattern for different panel types (Structured, Open, Socratic, Adversarial, Delphi, Hybrid).

FILE: services/ask-panel-service/src/domain/strategies/base_strategy.py

TASK:
Create an abstract base class for panel strategies using the Strategy pattern.

REQUIREMENTS:

ABSTRACT METHODS:
- async execute(panel: Panel) -> Panel
- async prepare_round(panel: Panel, round_number: int) -> dict
- async execute_round(panel: Panel, round_config: dict) -> Discussion
- async should_continue(panel: Panel) -> bool
- get_estimated_duration(num_experts: int) -> int
- get_recommended_expert_count() -> tuple[int, int]  # (min, max)
- get_round_types() -> List[str]

STRATEGY PROPERTIES:
- name: str
- description: str
- min_experts: int
- max_experts: int
- typical_rounds: int
- supports_parallel: bool
- requires_moderator: bool

COMMON METHODS (implemented in base):
- async validate_panel_setup(panel: Panel) -> bool
- async initialize_panel(panel: Panel) -> Panel
- async finalize_panel(panel: Panel) -> Panel
- async log_strategy_metrics(panel: Panel) -> None

EXECUTION FLOW:
```python
async def execute(self, panel: Panel) -> Panel:
    # 1. Validate setup
    await self.validate_panel_setup(panel)
    
    # 2. Initialize
    panel = await self.initialize_panel(panel)
    
    # 3. Execute rounds
    round_number = 1
    while await self.should_continue(panel):
        round_config = await self.prepare_round(panel, round_number)
        discussion = await self.execute_round(panel, round_config)
        panel.add_discussion_round(discussion)
        round_number += 1
    
    # 4. Finalize
    panel = await self.finalize_panel(panel)
    
    return panel
```

Example usage:
```python
from domain.strategies.base_strategy import BasePanelStrategy

class StructuredPanelStrategy(BasePanelStrategy):
    def __init__(self):
        super().__init__(
            name="structured",
            min_experts=3,
            max_experts=5,
            typical_rounds=3
        )
    
    async def execute(self, panel: Panel) -> Panel:
        # Implementation
        pass
```

CODE REQUIREMENTS:
- Use ABC (Abstract Base Class)
- Comprehensive type hints
- Detailed docstrings
- Error handling
- Logging hooks
- Extensible for new strategies

Create the complete base strategy class.
```

**Expected Output**: Complete `base_strategy.py` with abstract methods

---

### PROMPT 3.2: Implement Structured Panel Strategy

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. I need to implement the Structured Panel strategy - sequential moderated discussion for regulatory strategy and FDA submissions.

FILE: services/ask-panel-service/src/domain/strategies/structured_panel.py

TASK:
Implement the Structured Panel strategy following this pattern:

STRATEGY CHARACTERISTICS:
- Sequential turn-based discussion
- Moderator-led process
- 3-5 expert agents
- 3 rounds: Opening, Deliberation, Closing
- Consensus-focused
- 10-15 minutes duration

EXECUTION FLOW:
1. **Opening Round**: Each expert presents initial analysis
2. **Deliberation Round**: Experts respond to each other, moderated
3. **Closing Round**: Final positions and consensus building

IMPLEMENTATION:

```python
class StructuredPanelStrategy(BasePanelStrategy):
    def __init__(self):
        super().__init__(
            name="structured",
            description="Sequential moderated discussion for regulatory strategy",
            min_experts=3,
            max_experts=5,
            typical_rounds=3,
            supports_parallel=False,
            requires_moderator=True
        )
    
    async def execute(self, panel: Panel) -> Panel:
        """Execute structured panel discussion"""
        # Validate setup
        await self.validate_panel_setup(panel)
        
        # Initialize panel
        panel.status = PanelStatus.IN_PROGRESS
        
        # Round 1: Opening statements
        opening = await self._execute_opening_round(panel)
        panel.add_discussion_round(opening)
        
        # Round 2: Deliberation
        deliberation = await self._execute_deliberation_round(panel)
        panel.add_discussion_round(deliberation)
        
        # Round 3: Closing statements
        closing = await self._execute_closing_round(panel)
        panel.add_discussion_round(closing)
        
        # Build final consensus
        panel.status = PanelStatus.BUILDING_CONSENSUS
        consensus = await self._build_consensus(panel)
        panel.update_consensus(consensus)
        
        # Generate recommendation
        recommendation = await self._generate_recommendation(panel, consensus)
        panel.complete(recommendation)
        
        return panel
    
    async def _execute_opening_round(self, panel: Panel) -> Discussion:
        """Each expert provides opening analysis"""
        discussion = Discussion(
            round_number=1,
            round_type="opening",
            started_at=datetime.now()
        )
        
        # Get responses from each expert sequentially
        for member in panel.members:
            if member.role == "moderator":
                continue
            
            # Build prompt for expert
            prompt = self._build_opening_prompt(panel.query, member)
            
            # Get agent from registry
            agent = agent_registry.get_agent(member.agent_id)
            
            # Generate response
            response = await agent.async_generate_response(
                query=prompt,
                context={"panel_query": panel.query}
            )
            
            # Add to discussion
            discussion.add_message(
                member_id=member.member_id,
                content=response
            )
            
            # Update member
            member.add_response(response, confidence=0.8)
        
        discussion.completed_at = datetime.now()
        return discussion
    
    async def _execute_deliberation_round(self, panel: Panel) -> Discussion:
        """Experts respond to each other's points"""
        # Implementation
        pass
    
    async def _execute_closing_round(self, panel: Panel) -> Discussion:
        """Final positions and consensus"""
        # Implementation
        pass
    
    def _build_opening_prompt(self, query: str, member: PanelMember) -> str:
        """Build context-aware prompt for opening statement"""
        return f"""
        You are {member.agent_name}, participating in a structured panel discussion.
        
        PANEL QUERY: {query}
        
        INSTRUCTIONS:
        - Provide your expert analysis (2-3 paragraphs)
        - Focus on your domain expertise
        - Be specific and actionable
        - Consider regulatory, clinical, and market factors
        
        Provide your opening statement:
        """
```

ROUND LOGIC:
- **Opening**: Sequential, no cross-talk
- **Deliberation**: Sequential with references to previous statements
- **Closing**: Sequential with consensus-building language

CONSENSUS BUILDING:
- After closing round, analyze all responses
- Use ConsensusBuilder service
- Calculate multi-dimensional agreement
- Identify minority opinions
- Generate final recommendation

REQUIREMENTS:
- Inherit from BasePanelStrategy
- Implement all abstract methods
- Use domain services (ConsensusBuilder, ExpertCoordinator)
- Use AgentRegistry from shared kernel
- Handle errors gracefully
- Log all steps
- Support SSE streaming

Example usage:
```python
strategy = StructuredPanelStrategy()
completed_panel = await strategy.execute(panel)
```

Create the complete implementation.
```

**Expected Output**: Complete `structured_panel.py` implementation

---

### PROMPT 3.3: Implement Remaining Panel Strategies

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. I need to implement the remaining 5 panel strategies: Open, Socratic, Adversarial, Delphi, and Hybrid.

TASKS:
Create the following strategy files:

1. FILE: services/ask-panel-service/src/domain/strategies/open_panel.py

STRATEGY: Open Panel
CHARACTERISTICS:
- Parallel collaborative exploration
- 5-8 experts
- No fixed order
- Multiple perspectives
- 5-10 minutes
- Good for brainstorming

EXECUTION PATTERN:
- All experts respond in parallel (async)
- One round of synthesis
- Collect diverse perspectives
- No forced consensus

---

2. FILE: services/ask-panel-service/src/domain/strategies/socratic_panel.py

STRATEGY: Socratic Panel
CHARACTERISTICS:
- Iterative questioning methodology
- 3-4 experts
- Deep exploration
- 15-20 minutes
- Socratic dialogue pattern

EXECUTION PATTERN:
Round 1: Initial question posed
Round 2: Expert answers
Round 3: Follow-up questions based on answers
Round 4: Deeper exploration
Round 5: Synthesis and insights

---

3. FILE: services/ask-panel-service/src/domain/strategies/adversarial_panel.py

STRATEGY: Adversarial Panel
CHARACTERISTICS:
- Structured debate format
- 4-6 experts (split pro/con)
- Critical evaluation
- 10-15 minutes
- Risk assessment

EXECUTION PATTERN:
Round 1: Pro side presents arguments
Round 2: Con side presents counter-arguments
Round 3: Rebuttals
Round 4: Judge/moderator synthesis

---

4. FILE: services/ask-panel-service/src/domain/strategies/delphi_panel.py

STRATEGY: Delphi Panel
CHARACTERISTICS:
- Anonymous iterative rounds
- 5-12 experts
- Consensus convergence
- 15-25 minutes
- Forecasting and prediction

EXECUTION PATTERN:
Round 1: Anonymous individual responses
Round 2: Share aggregate results, get refined responses
Round 3: Share updated aggregate, final responses
Calculate consensus convergence across rounds

---

5. FILE: services/ask-panel-service/src/domain/strategies/hybrid_panel.py

STRATEGY: Hybrid Human-AI Panel
CHARACTERISTICS:
- Combined human + AI experts
- 3-8 members (mixed)
- Critical decisions
- 20-30 minutes
- Human validation

EXECUTION PATTERN:
Round 1: AI experts provide analysis
Round 2: Human experts review and respond
Round 3: Interactive discussion (human-AI)
Round 4: Human-validated recommendation

SPECIAL REQUIREMENTS for Hybrid:
- Support for human participants (WebSocket for real-time)
- Async wait for human responses
- Timeout handling for human input
- UI notifications for human turn

---

COMMON REQUIREMENTS FOR ALL STRATEGIES:

1. Inherit from BasePanelStrategy
2. Implement all abstract methods:
   - execute()
   - prepare_round()
   - execute_round()
   - should_continue()
   - get_estimated_duration()
   - get_recommended_expert_count()
   - get_round_types()

3. Use domain services:
   - ConsensusBuilder
   - ExpertCoordinator
   - SwarmIntelligence (for Open and Delphi)
   - QuantumConsensus (for final recommendations)

4. Support SSE streaming:
   - Emit events for each expert response
   - Emit round completion events
   - Emit consensus updates

5. Error handling:
   - Agent failures
   - Timeout handling
   - Partial responses

6. Logging:
   - Log each round
   - Log consensus calculations
   - Log performance metrics

Example usage for each:
```python
# Open Panel
strategy = OpenPanelStrategy()
panel = await strategy.execute(panel)

# Socratic Panel
strategy = SocraticPanelStrategy()
panel = await strategy.execute(panel)

# Adversarial Panel
strategy = AdversarialPanelStrategy()
panel = await strategy.execute(panel)

# Delphi Panel
strategy = DelphiPanelStrategy()
panel = await strategy.execute(panel)

# Hybrid Panel
strategy = HybridPanelStrategy()
panel = await strategy.execute(panel)
```

Create all 5 strategy files with complete, production-ready implementations.
```

**Expected Output**: 5 complete panel strategy implementations

---

### PROMPT 3.4: Implement LangGraph Workflows

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. I need to implement LangGraph state machine workflows for panel orchestration with state persistence and checkpointing.

FILE: services/ask-panel-service/src/application/workflows/panel_workflows.py

TASK:
Create LangGraph state machine workflows for panel execution with the following requirements:

STATE DEFINITION:
```python
from typing import TypedDict, List, Dict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.checkpoint import MemorySaver

class PanelState(TypedDict):
    # Panel identification
    panel_id: str
    tenant_id: str
    user_id: str
    
    # Panel configuration
    query: str
    panel_type: str
    strategy_config: dict
    
    # Execution state
    status: str
    current_round: int
    max_rounds: int
    
    # Agents and responses
    assigned_agents: List[dict]
    round_responses: List[dict]
    all_responses: List[dict]
    
    # Consensus tracking
    consensus_level: float
    consensus_history: List[float]
    
    # Results
    final_consensus: dict
    final_recommendation: str
    dissenting_opinions: List[str]
    
    # Metadata
    started_at: str
    error: str
    metadata: dict
```

WORKFLOW GRAPH:
```
START
  ↓
ASSIGN_EXPERTS → Load expert agents based on query
  ↓
EXECUTE_ROUND → Execute current discussion round
  ↓
CALCULATE_CONSENSUS → Calculate agreement level
  ↓
CHECK_COMPLETION → Should we continue?
  ↓ (no)          ↓ (yes)
  ↓              back to EXECUTE_ROUND
  ↓
GENERATE_RECOMMENDATION → Create final recommendation
  ↓
COMPILE_REPORT → Generate comprehensive report
  ↓
END
```

IMPLEMENTATION:

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint import MemorySaver

class PanelWorkflow:
    def __init__(self):
        self.checkpointer = MemorySaver()
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build LangGraph state machine"""
        workflow = StateGraph(PanelState)
        
        # Add nodes
        workflow.add_node("assign_experts", self._assign_experts_node)
        workflow.add_node("execute_round", self._execute_round_node)
        workflow.add_node("calculate_consensus", self._calculate_consensus_node)
        workflow.add_node("check_completion", self._check_completion_node)
        workflow.add_node("generate_recommendation", self._generate_recommendation_node)
        workflow.add_node("compile_report", self._compile_report_node)
        
        # Add edges
        workflow.set_entry_point("assign_experts")
        workflow.add_edge("assign_experts", "execute_round")
        workflow.add_edge("execute_round", "calculate_consensus")
        workflow.add_edge("calculate_consensus", "check_completion")
        
        # Conditional edge from check_completion
        workflow.add_conditional_edges(
            "check_completion",
            self._should_continue,
            {
                "continue": "execute_round",
                "finish": "generate_recommendation"
            }
        )
        
        workflow.add_edge("generate_recommendation", "compile_report")
        workflow.add_edge("compile_report", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _assign_experts_node(self, state: PanelState) -> dict:
        """Assign expert agents to panel"""
        # Use ExpertCoordinator to select agents
        coordinator = ExpertCoordinator()
        agents = await coordinator.select_experts(
            query=state["query"],
            panel_type=state["panel_type"],
            num_experts=5
        )
        
        return {
            "assigned_agents": agents,
            "status": "agents_assigned"
        }
    
    async def _execute_round_node(self, state: PanelState) -> dict:
        """Execute one round of discussion"""
        # Get panel strategy
        strategy = self._get_strategy(state["panel_type"])
        
        # Prepare round configuration
        round_config = await strategy.prepare_round(
            panel=self._state_to_panel(state),
            round_number=state["current_round"]
        )
        
        # Execute round
        responses = []
        for agent_info in state["assigned_agents"]:
            agent = agent_registry.get_agent(agent_info["agent_id"])
            response = await agent.async_generate_response(
                query=state["query"],
                context={
                    "round": state["current_round"],
                    "previous_responses": state["all_responses"]
                }
            )
            responses.append({
                "agent_id": agent_info["agent_id"],
                "agent_name": agent_info["name"],
                "content": response,
                "round": state["current_round"]
            })
        
        return {
            "round_responses": responses,
            "all_responses": state["all_responses"] + responses,
            "current_round": state["current_round"] + 1,
            "status": "round_complete"
        }
    
    async def _calculate_consensus_node(self, state: PanelState) -> dict:
        """Calculate consensus after round"""
        builder = ConsensusBuilder()
        consensus = await builder.calculate_consensus(
            responses=state["round_responses"]
        )
        
        consensus_history = state.get("consensus_history", [])
        consensus_history.append(consensus.level)
        
        return {
            "consensus_level": consensus.level,
            "consensus_history": consensus_history,
            "status": "consensus_calculated"
        }
    
    def _should_continue(self, state: PanelState) -> str:
        """Determine if more rounds needed"""
        # Check max rounds
        if state["current_round"] >= state["max_rounds"]:
            return "finish"
        
        # Check consensus threshold
        if state["consensus_level"] >= 0.8:
            return "finish"
        
        # Check consensus convergence
        history = state["consensus_history"]
        if len(history) >= 2:
            improvement = history[-1] - history[-2]
            if improvement < 0.05:  # Converged
                return "finish"
        
        return "continue"
    
    async def _generate_recommendation_node(self, state: PanelState) -> dict:
        """Generate final recommendation"""
        quantum = QuantumConsensus()
        recommendation = await quantum.collapse_superposition(
            responses=state["all_responses"]
        )
        
        return {
            "final_recommendation": recommendation,
            "status": "recommendation_generated"
        }
    
    async def _compile_report_node(self, state: PanelState) -> dict:
        """Compile final report"""
        # Implementation
        return {
            "status": "completed"
        }
    
    async def execute(self, initial_state: PanelState) -> PanelState:
        """Execute workflow with checkpointing"""
        config = {"configurable": {"thread_id": initial_state["panel_id"]}}
        
        final_state = await self.workflow.ainvoke(
            initial_state,
            config=config
        )
        
        return final_state
```

CHECKPOINTING:
- Save state after each node
- Support resume from any point
- Enable workflow inspection
- Persist to Redis or database

STREAMING SUPPORT:
- Stream events as workflow progresses
- Emit state updates
- Real-time progress tracking

ERROR HANDLING:
- Retry failed nodes
- Rollback on errors
- Error state in graph

Example usage:
```python
workflow = PanelWorkflow()

initial_state = {
    "panel_id": "panel-123",
    "tenant_id": "tenant-456",
    "query": "FDA 510k requirements?",
    "panel_type": "structured",
    "current_round": 1,
    "max_rounds": 3,
    "all_responses": [],
    "consensus_history": []
}

final_state = await workflow.execute(initial_state)
print(final_state["final_recommendation"])
```

Create the complete workflow implementation with state persistence.
```

**Expected Output**: Complete LangGraph workflow with checkpointing

---

### ✅ PHASE 3 VALIDATION CHECKLIST

After completing Phase 3, verify:

```bash
# 1. Test panel strategies
pytest services/ask-panel-service/tests/unit/domain/strategies/ -v

# 2. Test workflows
pytest services/ask-panel-service/tests/unit/application/workflows/ -v

# 3. Integration test
python -c "
from src.domain.strategies import StructuredPanelStrategy
from src.application.workflows import PanelWorkflow
print('✅ Strategies and workflows OK')
"

# 4. Run end-to-end panel test
pytest services/ask-panel-service/tests/integration/test_panel_execution.py -v
```

**Success Criteria:**
- [ ] All 6 panel strategies implemented
- [ ] LangGraph workflows working
- [ ] State persistence functional
- [ ] Strategy tests passing
- [ ] Workflow tests passing
- [ ] Integration tests passing

---

## 🌐 PHASE 4: API & STREAMING

### Overview

Implement FastAPI endpoints and Server-Sent Events (SSE) for real-time streaming of panel discussions.

---

### PROMPT 4.1: Implement API Routes

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. I need to implement FastAPI routes for panel management with multi-tenant security.

FILE: services/ask-panel-service/src/api/routes/v1/panels.py

TASK:
Create comprehensive FastAPI routes for panel operations.

ENDPOINTS REQUIRED:

1. POST /api/v1/panels
   Create a new panel

2. POST /api/v1/panels/{panel_id}/stream
   Execute panel with SSE streaming

3. GET /api/v1/panels/{panel_id}
   Get panel results

4. GET /api/v1/panels/user/{user_id}
   List user's panels

5. DELETE /api/v1/panels/{panel_id}
   Cancel/delete panel

IMPLEMENTATION:

```python
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from typing import List
from pydantic import BaseModel

from src.application.use_cases import (
    CreatePanelUseCase,
    ExecutePanelUseCase,
    GetPanelUseCase,
    ListPanelsUseCase
)
from src.api.middleware.tenant_validator import validate_tenant
from src.api.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/v1/panels", tags=["panels"])

# DTOs
class CreatePanelRequest(BaseModel):
    query: str
    panel_type: str  # structured, open, socratic, adversarial, delphi, hybrid
    agents: List[str] = []  # Optional specific agents
    configuration: dict = {}

class PanelResponse(BaseModel):
    panel_id: str
    status: str
    estimated_duration: int
    created_at: str

# Dependencies
async def get_tenant_id(x_tenant_id: str = Header(..., alias="X-Tenant-ID")) -> str:
    await validate_tenant(x_tenant_id)
    return x_tenant_id

# Routes
@router.post("/", response_model=PanelResponse)
async def create_panel(
    request: CreatePanelRequest,
    tenant_id: str = Depends(get_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    """Create a new panel discussion"""
    try:
        use_case = CreatePanelUseCase()
        panel = await use_case.execute(
            tenant_id=tenant_id,
            user_id=current_user["id"],
            query=request.query,
            panel_type=request.panel_type,
            agents=request.agents,
            configuration=request.configuration
        )
        
        return PanelResponse(
            panel_id=panel.panel_id,
            status=panel.status.value,
            estimated_duration=panel.calculate_estimated_duration(),
            created_at=panel.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{panel_id}/stream")
async def stream_panel_execution(
    panel_id: str,
    tenant_id: str = Depends(get_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    """Execute panel with Server-Sent Events streaming"""
    
    async def event_generator():
        try:
            use_case = ExecutePanelUseCase()
            
            # Start panel execution
            yield f"event: panel_started\n"
            yield f"data: {json.dumps({'panel_id': panel_id, 'status': 'started'})}\n\n"
            
            # Stream panel execution
            async for event in use_case.execute_with_streaming(
                panel_id=panel_id,
                tenant_id=tenant_id
            ):
                yield f"event: {event['type']}\n"
                yield f"data: {json.dumps(event['data'])}\n\n"
            
            # Panel complete
            yield f"event: panel_complete\n"
            yield f"data: {json.dumps({'panel_id': panel_id, 'status': 'completed'})}\n\n"
            
        except Exception as e:
            yield f"event: error\n"
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@router.get("/{panel_id}")
async def get_panel(
    panel_id: str,
    tenant_id: str = Depends(get_tenant_id),
    current_user: dict = Depends(get_current_user)
):
    """Get panel results"""
    use_case = GetPanelUseCase()
    panel = await use_case.execute(panel_id, tenant_id)
    
    if not panel:
        raise HTTPException(status_code=404, detail