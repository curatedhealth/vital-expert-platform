# VITAL Shared Library

**Version:** 1.0.0  
**Author:** VITAL Path Team  
**License:** MIT

Shared services, models, and utilities for VITAL AI platform.

## Overview

`vital-shared` is a Python library that provides common functionality used across all VITAL AI services, including Ask Expert (all 4 modes), Ask Panel, Pharma Intelligence, and other platform services.

### Benefits

- **Build once, use everywhere** - Shared code eliminates duplication
- **Consistent behavior** - Same logic across all services
- **Easy testing** - Test components independently
- **Single source of truth** - One place to fix bugs and add features

## Installation

```bash
# From source
cd services/ai-engine/src/vital_shared
pip install -e .

# With development dependencies
pip install -e ".[dev]"

# With test dependencies
pip install -e ".[test]"
```

## Architecture

```
vital_shared/
├── interfaces/          # Abstract base classes (contracts)
├── services/           # Service implementations
├── models/             # Pydantic data models
├── database/           # Database clients and utilities
├── monitoring/         # Logging, metrics, tracing
├── errors/             # Exception classes and handlers
├── utils/              # Utility functions
├── workflows/          # BaseWorkflow template
└── registry/           # Service registry (dependency injection)
```

## Quick Start

### Using Services

```python
from vital_shared import (
    ServiceRegistry,
    initialize_services,
    AgentService,
    UnifiedRAGService,
)

# Initialize all services
db_client = get_supabase_client()
config = {"pinecone": pinecone_client}
initialize_services(db_client, config)

# Get services from registry
registry = ServiceRegistry.get_instance()
agent_service = registry.get_agent_service()
rag_service = registry.get_rag_service()

# Use services
agent = await agent_service.load_agent(
    agent_id="agent-123",
    tenant_id="tenant-456"
)

rag_response = await rag_service.query(
    query_text="What are FDA 510(k) requirements?",
    domain_ids=["regulatory"],
    max_results=10
)
```

### Using Models

```python
from vital_shared.models import Citation, RAGResponse, AgentProfile

# Standardized citation
citation = Citation(
    id="citation_1",
    title="FDA 510(k) Guidance",
    content="The 510(k) premarket notification...",
    preview="The 510(k) premarket...",
    source_type="fda",
    source_url="https://fda.gov/...",
    source_name="FDA.gov",
    similarity_score=0.95,
    inline_ref="[1]",
)

# RAG response with citations
rag_response = RAGResponse(
    answer="Based on FDA guidance [1], the 510(k) process...",
    citations=[citation],
    total_sources=5,
    search_strategy="hybrid",
    confidence=0.92,
    domains_searched=["regulatory"],
)

# Convert to API format
api_response = rag_response.to_dict()
```

### Building a Workflow

```python
from vital_shared.workflows import BaseWorkflow
from vital_shared.models import BaseWorkflowState
from langgraph.graph import StateGraph, END

class MyCustomWorkflow(BaseWorkflow[BaseWorkflowState]):
    """Custom workflow inheriting from BaseWorkflow"""
    
    def build_graph(self) -> StateGraph:
        workflow = StateGraph(BaseWorkflowState)
        
        # Add shared nodes (inherited from BaseWorkflow)
        workflow.add_node("load_agent", self.load_agent_node)
        workflow.add_node("rag_retrieval", self.rag_retrieval_node)
        workflow.add_node("tool_execution", self.tool_execution_node)
        
        # Add custom node
        workflow.add_node("custom_processing", self._custom_node)
        
        # Define flow
        workflow.set_entry_point("load_agent")
        workflow.add_edge("load_agent", "rag_retrieval")
        workflow.add_edge("rag_retrieval", "custom_processing")
        workflow.add_edge("custom_processing", END)
        
        return workflow.compile()
    
    async def _custom_node(self, state):
        # Your custom logic here
        return {**state, "custom_data": "processed"}
    
    async def execute(self, input_data):
        if not self.graph:
            self.graph = self.build_graph()
        return await self.graph.ainvoke(input_data)
```

## Core Services

### AgentService

Manages agent profiles, access control, and usage tracking.

```python
from vital_shared import AgentService

agent_service = AgentService(db_client)

# Load agent
agent = await agent_service.load_agent(
    agent_id="agent-123",
    tenant_id="tenant-456"
)

# Validate access
has_access = await agent_service.validate_access(
    agent_id="agent-123",
    user_id="user-789",
    tenant_id="tenant-456"
)

# Track usage
await agent_service.track_usage(
    agent_id="agent-123",
    session_id="session-abc",
    metrics={
        "tokens_used": 1500,
        "cost_usd": 0.03,
        "response_time_ms": 2500,
    }
)
```

### UnifiedRAGService

Retrieval Augmented Generation with standardized citations.

```python
from vital_shared import UnifiedRAGService

rag_service = UnifiedRAGService(db_client, pinecone_client)

# Query with citations
response = await rag_service.query(
    query_text="What are the requirements?",
    strategy="hybrid",  # hybrid, semantic, or keyword
    domain_ids=["regulatory", "clinical"],
    max_results=10,
    similarity_threshold=0.7,
)

# Check if sources found
if response.has_sources():
    print(f"Found {len(response.citations)} sources")
    for citation in response.citations:
        print(f"{citation.inline_ref} {citation.title}")
else:
    # RAGEmptyResponse
    print(f"No sources: {response.reason}")
    print(f"Suggestions: {response.suggestions}")
```

### ToolService

Tool management, execution, and result formatting.

```python
from vital_shared import ToolService

tool_service = ToolService(db_client)

# Suggest tools
suggestions = await tool_service.decide_tools(
    query="Search for latest FDA guidance",
    requested_tools=None,  # Auto-suggest
    agent_capabilities=["web_search", "fda_database"]
)

# Execute tools
results = await tool_service.execute_tools(
    tools=["web_search", "fda_database"],
    context={"query": "FDA 510(k)"}
)

for result in results:
    if result["status"] == "success":
        print(f"Tool: {result['tool']}")
        print(f"Result: {result['result']}")
```

### MemoryService

Conversation storage and context management.

```python
from vital_shared import MemoryService

memory_service = MemoryService(db_client)

# Save conversation turn
await memory_service.save_turn(
    session_id="session-123",
    user_message="What are the requirements?",
    assistant_message="Based on FDA guidance...",
    metadata={
        "agent_id": "agent-456",
        "citations": [...],
        "cost": 0.02,
    }
)

# Retrieve context
history = await memory_service.get_session_history(
    session_id="session-123",
    max_turns=10
)
```

### StreamingService

Server-Sent Events (SSE) formatting and emission.

```python
from vital_shared import StreamingService

streaming_service = StreamingService()

# Format SSE event
sse_chunk = streaming_service.format_sse_event(
    event_type="content",
    data={"content": "Hello world", "tokens": 2}
)

# Yields: "data: {...}\n\n"
```

## Models

All models use Pydantic for validation and serialization.

### Citation Models

```python
from vital_shared.models import Citation, RAGResponse, RAGEmptyResponse, SourceType

citation = Citation(
    id="citation_1",
    title="Document Title",
    content="Full content...",
    preview="Preview text...",
    source_type=SourceType.PUBMED,
    source_url="https://...",
    source_name="PubMed",
    similarity_score=0.92,
    inline_ref="[1]",
    metadata={"author": "John Doe"}
)
```

### Tool Models

```python
from vital_shared.models import (
    ToolMetadata,
    ToolCategory,
    ToolCostTier,
    ToolExecutionSpeed
)

tool = ToolMetadata(
    name="web_search",
    display_name="Web Search",
    description="Search the web",
    icon="globe",
    category=ToolCategory.SEARCH,
    cost_tier=ToolCostTier.LOW,
    speed=ToolExecutionSpeed.FAST,
    requires_confirmation=True,
    estimated_duration_seconds=3.0,
)
```

### Workflow State Models

```python
from vital_shared.models import BaseWorkflowState, Mode1State

# Base state (shared by all modes)
state = BaseWorkflowState(
    user_id="user-123",
    tenant_id="tenant-456",
    session_id="session-789",
    query="What are the requirements?",
    agent_id="agent-abc",
    enable_rag=True,
    enable_tools=True,
    # ... other fields
)

# Mode 1 state (inherits from base)
mode1_state = Mode1State(**state)
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=vital_shared --cov-report=html

# Run specific test file
pytest tests/services/test_agent_service.py

# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Format code
black vital_shared/
ruff check vital_shared/ --fix

# Type checking
mypy vital_shared/

# Run tests
pytest
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests and linters
6. Submit a pull request

## Support

- **Documentation:** https://docs.vitalpath.ai/vital-shared
- **Issues:** https://github.com/vitalpath/vital-shared/issues
- **Email:** team@vitalpath.ai

