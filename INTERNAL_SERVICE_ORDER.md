# 🏗️ INTERNAL SERVICE ORDER & ARCHITECTURE

**TAG: SERVICE_ARCHITECTURE**

## 📊 Service Dependency Hierarchy

### Level 1: Foundation (No Dependencies)
```
┌─────────────────────────────────────────────────────────────┐
│                     CORE LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  • Models (Pydantic)         - Data structures              │
│  • Exceptions                - Error handling               │
│  • Config                    - Environment settings         │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies**: None (Pure Python/Pydantic)

**Files**:
- `vital_ai_services/core/models.py`
- `vital_ai_services/core/exceptions.py`

---

### Level 2: Infrastructure (Depends on Core)
```
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  • Supabase Client           - Database access              │
│  • Redis Cache               - Caching layer                │
│  • OpenAI Client             - LLM access                   │
│  • Pinecone Client           - Vector DB access             │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies**: Core models/exceptions

**External APIs**:
- Supabase (PostgreSQL + Auth)
- Redis (Caching)
- OpenAI (Embeddings + Chat)
- Pinecone (Vector search)
- Tavily (Web search)

---

### Level 3: Base Services (Depends on Core + Infrastructure)
```
┌─────────────────────────────────────────────────────────────┐
│                   BASE SERVICES LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • EmbeddingService          - Text → Vectors               │
│  • RAGCacheManager           - RAG result caching           │
│  • BaseTool                  - Abstract tool interface      │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies**: Core + Infrastructure clients

**Files**:
- `vital_ai_services/rag/embedding.py`
- `vital_ai_services/rag/cache.py`
- `vital_ai_services/tools/base.py`

---

### Level 4: Domain Services (Depends on Base Services)
```
┌─────────────────────────────────────────────────────────────┐
│                  DOMAIN SERVICES LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │         RAG SERVICE                                │      │
│  │  • UnifiedRAGService                              │      │
│  │    - Uses: EmbeddingService, RAGCacheManager      │      │
│  │    - Provides: query()                            │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │         AGENT SERVICE                              │      │
│  │  • AgentSelectorService                           │      │
│  │    - Uses: OpenAI, Redis                          │      │
│  │    - Provides: select_agent()                     │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │         TOOL SERVICE                               │      │
│  │  • ToolRegistry                                   │      │
│  │    - Uses: BaseTool implementations               │      │
│  │    - Provides: execute(), register()              │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │         PROMPT SERVICE                             │      │
│  │  • PromptService (basic)                          │      │
│  │    - Uses: Supabase                               │      │
│  │    - Provides: get_prompt(), render()             │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies**: Base Services + Infrastructure

**Files**:
- `vital_ai_services/rag/service.py`
- `vital_ai_services/agent/selector.py`
- `vital_ai_services/tools/registry.py`
- `vital_ai_services/prompt/service.py`

---

### Level 5: Specialized Tools (Depends on Domain Services)
```
┌─────────────────────────────────────────────────────────────┐
│                 SPECIALIZED TOOLS LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  • WebSearchTool         (uses Tavily API)                  │
│  • RAGTool              (wraps UnifiedRAGService)           │
│  • CalculatorTool       (standalone, no deps)               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies**: Domain Services (RAGTool needs RAG service)

**Files**:
- `vital_ai_services/tools/web_search.py`
- `vital_ai_services/tools/rag_tool.py`
- `vital_ai_services/tools/calculator.py`

---

### Level 6: Composite Services (Depends on Domain Services)
```
┌─────────────────────────────────────────────────────────────┐
│                  COMPOSITE SERVICES LAYER                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  • DynamicPromptComposer                                     │
│    - Uses: Supabase (agent data)                            │
│    - Uses: ToolRegistry (tool info)                         │
│    - Uses: UnifiedRAGService (RAG config)                   │
│    - Provides: compose_agent_prompt()                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies**: All Domain Services

**Files**:
- `vital_ai_services/prompt/composer.py`

---

## 🔄 Service Initialization Order

### Correct Initialization Sequence

```python
# 1. Initialize infrastructure clients (Level 2)
supabase_client = SupabaseClient()
await supabase_client.initialize()

redis_client = RedisClient()
await redis_client.connect()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pinecone_client = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# 2. Initialize base services (Level 3)
embedding_service = EmbeddingService(openai_client)
rag_cache = RAGCacheManager(redis_client)

# 3. Initialize domain services (Level 4)
rag_service = UnifiedRAGService(
    pinecone_client=pinecone_client,
    openai_client=openai_client,
    supabase_client=supabase_client,
    cache_manager=rag_cache
)
await rag_service.initialize()

agent_selector = AgentSelectorService(
    supabase_client=supabase_client,
    openai_client=openai_client,
    cache_manager=redis_client
)

prompt_service = PromptService(
    supabase_client=supabase_client,
    cache_manager=redis_client
)

# 4. Initialize tool registry and tools (Level 5)
tool_registry = ToolRegistry()
tool_registry.register(WebSearchTool(api_key=os.getenv("TAVILY_API_KEY")))
tool_registry.register(RAGTool(rag_service))
tool_registry.register(CalculatorTool())

# 5. Initialize composite services (Level 6)
prompt_composer = DynamicPromptComposer(
    supabase_client=supabase_client
)
```

---

## 📊 Service Dependency Graph

```
                    ┌─────────────────┐
                    │   Core Models   │
                    │   & Exceptions  │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
        ┌───────▼──────┐ ┌──▼───────┐ ┌─▼──────────┐
        │   Supabase   │ │  Redis   │ │  OpenAI    │
        │   Client     │ │  Cache   │ │  Client    │
        └───────┬──────┘ └──┬───────┘ └─┬──────────┘
                │            │            │
        ┌───────┼────────────┼────────────┘
        │       │            │
        │   ┌───▼─────┐  ┌──▼────────┐
        │   │ Embed   │  │    RAG    │
        │   │ Service │  │   Cache   │
        │   └───┬─────┘  └──┬────────┘
        │       │            │
        │   ┌───▼────────────▼────┐
        │   │  UnifiedRAGService  │
        │   └───┬─────────────────┘
        │       │
    ┌───▼───────▼─────────────┐
    │   AgentSelectorService  │
    └───┬─────────────────────┘
        │
    ┌───▼──────────────┐
    │  PromptService   │
    └───┬──────────────┘
        │
    ┌───▼──────────────────┐
    │  ToolRegistry        │
    │  • WebSearchTool     │
    │  • RAGTool ──────────┼──> UnifiedRAGService
    │  • CalculatorTool    │
    └───┬──────────────────┘
        │
    ┌───▼──────────────────────┐
    │  DynamicPromptComposer   │
    │  (uses all above)         │
    └───────────────────────────┘
```

---

## 🔄 Service Interaction Flows

### Flow 1: Agent Selection
```
User Query
    │
    ▼
AgentSelectorService
    │
    ├─> OpenAI (analyze query)
    │
    ├─> Redis (check cache)
    │
    ├─> Supabase (fetch agents)
    │
    └─> Return AgentSelection
```

### Flow 2: RAG Query
```
Search Query
    │
    ▼
UnifiedRAGService
    │
    ├─> EmbeddingService
    │       └─> OpenAI (create embedding)
    │
    ├─> RAGCacheManager
    │       └─> Redis (check cache)
    │
    ├─> Pinecone (vector search)
    │
    ├─> Supabase (fallback search)
    │
    └─> Return RAGResponse (sources)
```

### Flow 3: Tool Execution
```
Tool Request
    │
    ▼
ToolRegistry
    │
    ├─> Get tool by name
    │
    ├─> Validate tenant access
    │
    ├─> Execute tool
    │   │
    │   ├─> WebSearchTool ──> Tavily API
    │   │
    │   ├─> RAGTool ──> UnifiedRAGService
    │   │
    │   └─> CalculatorTool (pure Python)
    │
    └─> Return ToolOutput
```

### Flow 4: Dynamic Prompt Composition
```
Agent ID
    │
    ▼
DynamicPromptComposer
    │
    ├─> Supabase (fetch agent data)
    │
    ├─> Compose sections:
    │   ├─> Identity
    │   ├─> Capabilities
    │   ├─> Tools
    │   ├─> Knowledge (RAG)
    │   ├─> Guidelines
    │   └─> Behavior
    │
    └─> Return Enhanced Prompt
```

---

## 🎯 Service Interface Contracts

### AgentSelectorService
```python
Input: RAGQuery
Output: AgentSelection
Dependencies: Supabase, OpenAI, Redis
```

### UnifiedRAGService
```python
Input: RAGQuery
Output: RAGResponse (with sources)
Dependencies: Pinecone, OpenAI, Supabase, Redis
```

### ToolRegistry
```python
Input: tool_name, input_data, context
Output: ToolOutput
Dependencies: Registered tools
```

### DynamicPromptComposer
```python
Input: agent_id, tenant_id, agent_data (optional)
Output: {base_prompt, enhanced_prompt, sections, metadata}
Dependencies: Supabase
```

---

## 🚀 Usage in LangGraph Workflows

### Recommended Pattern

```python
from vital_ai_services.agent import AgentSelectorService
from vital_ai_services.rag import UnifiedRAGService
from vital_ai_services.tools import ToolRegistry, WebSearchTool, RAGTool
from vital_ai_services.prompt import DynamicPromptComposer

class Mode1Workflow:
    def __init__(self):
        # Initialize in correct order
        self.supabase = SupabaseClient()
        self.openai = OpenAI(api_key=...)
        self.redis = RedisClient()
        
        self.rag_service = UnifiedRAGService(...)
        self.agent_selector = AgentSelectorService(...)
        self.tool_registry = ToolRegistry()
        self.prompt_composer = DynamicPromptComposer(...)
        
    async def run(self, user_query: str):
        # 1. Select agent
        agent = await self.agent_selector.select_agent(user_query)
        
        # 2. Compose system prompt
        prompt_data = await self.prompt_composer.compose_agent_prompt(
            agent_id=agent.agent_id
        )
        
        # 3. Retrieve context
        rag_response = await self.rag_service.query(
            RAGQuery(query_text=user_query, ...)
        )
        
        # 4. Execute tools if needed
        tool_output = await self.tool_registry.execute(
            tool_name="web_search",
            input_data=user_query
        )
        
        # 5. Generate response with LangGraph
        # ... (use prompt_data, rag_response, tool_output)
```

---

## 📝 Key Design Principles

### 1. Dependency Injection
Each service receives dependencies via constructor:
```python
service = UnifiedRAGService(
    pinecone_client=pinecone,
    openai_client=openai,
    supabase_client=supabase,
    cache_manager=cache
)
```

### 2. Single Responsibility
Each service has one clear purpose:
- AgentSelector: Select the best agent
- RAGService: Retrieve relevant context
- ToolRegistry: Manage and execute tools
- PromptComposer: Build structured prompts

### 3. Separation of Concerns
- **Infrastructure**: External API clients
- **Base Services**: Reusable utilities
- **Domain Services**: Business logic
- **Composite Services**: Orchestration

### 4. Testability
All services can be tested independently with mocked dependencies.

---

## 🔧 Service Configuration

### Environment Variables Required

```bash
# Database
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Caching
REDIS_URL=...

# AI Services
OPENAI_API_KEY=...
TAVILY_API_KEY=...

# Vector Database
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
```

---

## 📊 Service Health Check Order

When debugging, check services in this order:

1. ✅ **Core Models** - Always available
2. ✅ **Supabase Client** - Database connection
3. ✅ **Redis Client** - Cache connection
4. ✅ **OpenAI Client** - API key valid
5. ✅ **EmbeddingService** - Can create embeddings
6. ✅ **RAGService** - Can query vectors
7. ✅ **AgentSelector** - Can select agents
8. ✅ **ToolRegistry** - Tools registered
9. ✅ **PromptComposer** - Can fetch agent data

---

**Status**: ✅ Architecture Documented | 🏗️ 6 Layers | 🔄 Clear Dependencies

