# VITAL AI Services Library

**TAG: SHARED_AI_SERVICES_LIBRARY**

Shared AI services library for VITAL platform providing reusable, production-ready services for:
- Agent Selection & Orchestration
- RAG (Retrieval Augmented Generation)
- Tool Execution & Registry
- Memory & Conversation Management
- Citation & Source Handling
- Cost Tracking & Metrics

## 🎯 Purpose

This library extracts common AI services from individual workflows (Mode 1-4) into a single, well-tested, reusable package that:

1. **Eliminates Code Duplication**: Write once, use across all modes
2. **Ensures Consistency**: Same behavior across all AI workflows
3. **Simplifies Testing**: Test once, trust everywhere
4. **Accelerates Development**: Build new modes faster
5. **Improves Maintainability**: Fix bugs once, deploy everywhere

## 📦 Package Structure

```
vital-ai-services/
├── src/
│   └── vital_ai_services/
│       ├── __init__.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── models.py          # Shared Pydantic models
│       │   ├── exceptions.py      # Custom exceptions
│       │   └── config.py          # Service configuration
│       ├── agent/
│       │   ├── __init__.py
│       │   ├── selector.py        # AgentSelectorService
│       │   ├── orchestrator.py    # AgentOrchestrator
│       │   └── enrichment.py      # Agent enrichment logic
│       ├── rag/
│       │   ├── __init__.py
│       │   ├── service.py         # UnifiedRAGService
│       │   ├── embedding.py       # Embedding services
│       │   └── cache.py           # RAG caching
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── base.py            # BaseTool
│       │   ├── registry.py        # ToolRegistry
│       │   ├── web_search.py      # WebSearchTool
│       │   ├── web_scraper.py     # WebScraperTool
│       │   ├── rag_tool.py        # RAGTool
│       │   └── calculator.py      # CalculatorTool
│       ├── memory/
│       │   ├── __init__.py
│       │   ├── manager.py         # ConversationMemoryManager
│       │   ├── session.py         # SessionMemoryService
│       │   └── analyzer.py        # ConversationAnalyzer
│       ├── citation/
│       │   ├── __init__.py
│       │   ├── extractor.py       # Citation extraction
│       │   └── formatter.py       # Citation formatting
│       ├── cost/
│       │   ├── __init__.py
│       │   └── tracker.py         # Cost tracking
│       └── registry/
│           ├── __init__.py
│           └── service_registry.py # Dependency injection
├── tests/
│   ├── agent/
│   ├── rag/
│   ├── tools/
│   └── integration/
├── pyproject.toml
├── setup.py
└── README.md
```

## 🚀 Quick Start

### Installation

```bash
# From the services/vital-ai-services directory
pip install -e .

# Or install in development mode with dev dependencies
pip install -e ".[dev]"
```

### Usage Example

```python
from vital_ai_services.agent import AgentSelectorService
from vital_ai_services.rag import UnifiedRAGService
from vital_ai_services.tools import ToolRegistry
from vital_ai_services.registry import ServiceRegistry

# Initialize service registry (dependency injection)
registry = ServiceRegistry()

# Register services
registry.register("agent_selector", AgentSelectorService(
    supabase_client=supabase,
    cache_manager=cache
))

registry.register("rag_service", UnifiedRAGService(
    supabase_client=supabase,
    cache_manager=cache
))

registry.register("tool_registry", ToolRegistry())

# Use in your workflow
agent_selector = registry.get("agent_selector")
result = await agent_selector.select_best_agent(
    tenant_id="tenant-123",
    query="What are FDA IND requirements?",
    session_id="session-456"
)
```

## 📚 Core Services

### 1. AgentSelectorService

Intelligent agent selection with:
- ML-powered query analysis
- Performance-based ranking
- Multi-factor scoring (domain match, historical performance, query similarity)
- Feedback loop integration

```python
from vital_ai_services.agent import AgentSelectorService

selector = AgentSelectorService(
    supabase_client=supabase,
    feedback_manager=feedback,
    cache_manager=cache
)

recommendation = await selector.select_best_agent(
    tenant_id="tenant-123",
    query="What are FDA IND requirements?",
    session_id="session-456",
    mode="automatic"
)

print(f"Selected: {recommendation.agent_id}")
print(f"Confidence: {recommendation.confidence}")
print(f"Reason: {recommendation.reason}")
```

### 2. UnifiedRAGService

Production-ready RAG with:
- Multi-namespace Pinecone search
- Supabase metadata enrichment
- Redis caching for performance
- Multiple search strategies (semantic, hybrid, agent-optimized)
- Domain-aware routing

```python
from vital_ai_services.rag import UnifiedRAGService

rag = UnifiedRAGService(
    supabase_client=supabase,
    cache_manager=cache
)

await rag.initialize()

results = await rag.query(
    query_text="What are FDA IND requirements?",
    strategy="hybrid",
    domain_ids=["regulatory"],
    max_results=10,
    similarity_threshold=0.7
)

for source in results["sources"]:
    print(f"{source['title']}: {source['excerpt']}")
```

### 3. ToolRegistry

Centralized tool management:
- Dynamic tool registration
- Type-safe tool execution
- Cost tracking per tool
- Error handling and retry logic

```python
from vital_ai_services.tools import ToolRegistry, WebSearchTool

registry = ToolRegistry()

# Register tools
registry.register(WebSearchTool())

# Execute tools
result = await registry.execute(
    tool_name="web_search",
    input_data="latest FDA guidance on digital therapeutics",
    context={"max_results": 5}
)

print(result.data)
```

## 🏗️ Architecture Principles

### 1. **Service-Oriented Architecture**
Each service is a self-contained, independently testable unit with clear responsibilities.

### 2. **Dependency Injection**
Services are injected via `ServiceRegistry` for:
- Easy testing (mock dependencies)
- Configuration flexibility
- Loose coupling

### 3. **Tenant Awareness**
All services are multi-tenant aware:
- Tenant ID required for all operations
- Data isolation enforced
- Per-tenant configuration support

### 4. **Production Ready**
- Comprehensive error handling
- Structured logging with correlation IDs
- Performance metrics and monitoring
- Redis caching for scale
- Retry logic with exponential backoff

### 5. **Type Safety**
- Pydantic models for all inputs/outputs
- Full type hints throughout
- Validated at runtime

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=vital_ai_services --cov-report=html

# Run specific test suite
pytest tests/agent/
pytest tests/rag/
pytest tests/tools/

# Run integration tests
pytest tests/integration/
```

## 📖 Mode-Specific Usage

### Mode 1: Manual Interactive (Single-turn, manual agent)
```python
# Agent is pre-selected by user, no agent selection needed
rag_results = await rag_service.query(query_text="...")
tool_result = await tool_registry.execute("web_search", "...")
```

### Mode 2: Automatic Interactive (Single-turn, automatic agent)
```python
# System selects best agent
agent = await agent_selector.select_best_agent(
    tenant_id=tenant_id,
    query=query,
    mode="automatic"
)
rag_results = await rag_service.query(query_text="...")
```

### Mode 3: Manual Chat (Multi-turn, manual agent)
```python
# Agent is pre-selected, memory is crucial
memory = await memory_manager.get_conversation_history(
    session_id=session_id
)
rag_results = await rag_service.query(
    query_text="...",
    context=memory
)
```

### Mode 4: Automatic Chat (Multi-turn, automatic agent)
```python
# System selects agent per turn + memory
memory = await memory_manager.get_conversation_history(
    session_id=session_id
)
agent = await agent_selector.select_best_agent(
    tenant_id=tenant_id,
    query=query,
    mode="automatic",
    conversation_history=memory
)
rag_results = await rag_service.query(
    query_text="...",
    context=memory
)
```

## 🔧 Development

### Adding a New Service

1. Create service module under `src/vital_ai_services/<service_name>/`
2. Define Pydantic models in `core/models.py`
3. Implement service class with:
   - Clear docstrings
   - Type hints
   - Error handling
   - Logging
4. Add unit tests in `tests/<service_name>/`
5. Add integration tests in `tests/integration/`
6. Update `ServiceRegistry` if needed

### Code Style

```bash
# Format code
black src/ tests/

# Lint code
ruff check src/ tests/

# Type check
mypy src/
```

## 📊 Metrics & Monitoring

All services emit structured logs with:
- Correlation IDs for request tracing
- Performance metrics (latency, cache hits, etc.)
- Error rates and types
- Resource usage

Integration with:
- Langfuse for AI observability
- Prometheus for metrics
- Sentry for error tracking

## 🔐 Security

- Tenant isolation enforced at service level
- API keys managed via environment variables
- No secrets in code or logs
- Rate limiting per tenant
- Input validation via Pydantic

## 🚦 Status

- ✅ **Week 1 Days 1-2**: AgentService + RAGService extraction (IN PROGRESS)
- ⏳ **Week 1 Days 3-4**: ToolService + MemoryService extraction
- ⏳ **Week 1 Day 5**: Testing + Integration
- ⏳ **Week 2**: Package structure + Service Registry
- ⏳ **Week 3**: Refactor Mode 1 to use library
- ⏳ **Week 4**: Templates for Modes 2-4

## 📞 Support

For questions or issues, contact the VITAL AI Platform Team.

---

**Built with ❤️ by the VITAL Platform Team**

