# VITAL Backend Python Code Audit: Complete System Analysis
## Comprehensive Audit Including All Services, Modes, and Integrations

**Version**: 1.0  
**Date**: October 24, 2025  
**Purpose**: Complete technical audit of VITAL Python backend covering 5 Ask Expert modes, LangGraph/LangChain orchestration, and all shared platform services  
**Auditor Role**: Senior LangChain/LangGraph Python Architect

---

## 📋 TABLE OF CONTENTS

1. [Auditor Role & Expertise](#auditor-role--expertise)
2. [Audit Scope & Objectives](#audit-scope--objectives)
3. [Part 1: 5 Ask Expert Modes (Core Business Logic)](#part-1-5-ask-expert-modes-core-business-logic)
4. [Part 2: Shared Platform Services](#part-2-shared-platform-services)
5. [Part 3: LangGraph/LangChain Architecture](#part-3-langgraphlangchain-architecture)
6. [Part 4: Code Quality & Patterns](#part-4-code-quality--patterns)
7. [Audit Deliverables](#audit-deliverables)
8. [Analysis Methodology](#analysis-methodology)
9. [Success Criteria](#success-criteria)
10. [Output Format Guidelines](#output-format-guidelines)

---

## 🎯 Auditor Role & Expertise

### You Are Acting As:
A **senior LangChain/LangGraph Python architect** with deep expertise in:

**Core Technologies**:
- ✅ LangGraph StateGraph patterns and agentic workflow orchestration
- ✅ LangChain tool integration, RAG pipelines, and chain composition  
- ✅ ReAct (Reasoning + Acting) and Chain-of-Thought implementation patterns
- ✅ Asynchronous Python patterns, streaming architectures, and SSE

**Platform Architecture**:
- ✅ Multi-mode agent systems with sophisticated state management
- ✅ Production-grade AI service implementation with shared service patterns
- ✅ Enterprise RAG systems with vector databases (pgvector, Pinecone)
- ✅ Microservices architecture with shared service patterns

**Quality & Operations**:
- ✅ Production deployment readiness assessment
- ✅ Code quality analysis and best practices
- ✅ Multi-tenant architecture and data isolation
- ✅ Performance optimization and scaling patterns

---

## 🔍 Audit Scope & Objectives

### What You Are Auditing

This audit covers the **complete VITAL Python backend**, including:

#### Core Business Logic
1. ✅ **5 Ask Expert Modes** - Complete mode implementation validation
2. ✅ **LangGraph/LangChain Architecture** - Orchestration patterns and quality
3. ✅ **Production Readiness** - Mock code elimination and deployment readiness

#### Shared Platform Services
4. ✅ **Agent Registry Service** - 136+ agent catalog and selection system
5. ✅ **Prompt Library Service** - Template management and versioning
6. ✅ **RAG Service** - Vector search, retrieval, and knowledge base
7. ✅ **Capability Manager** - Agent capabilities and matching system
8. ✅ **Tool Registry** - Tool integration and execution framework

#### Infrastructure & Quality
9. ✅ **Integration Patterns** - Service-to-service communication
10. ✅ **Multi-Tenant Isolation** - Data security and tenant separation
11. ✅ **Code Quality** - Architecture patterns, error handling, testing

### Audit Objectives

**Primary Goals**:
- ✅ Verify all 5 Ask Expert modes are fully implemented
- ✅ Validate Agent Mode (Mode 5) exists with checkpoints - CRITICAL
- ✅ Assess all shared services are real (not mock/placeholder)
- ✅ Evaluate LangGraph/LangChain implementation quality
- ✅ Identify critical production blockers
- ✅ Provide actionable remediation roadmap

**Critical Questions to Answer**:
- ❓ Are all 5 modes implemented? (Especially Mode 5)
- ❓ Are shared services connected to real databases?
- ❓ Is RAG service functional with vector search?
- ❓ Are integrations complete or placeholder?
- ❓ Is the code production-ready?
- ❓ What's the realistic timeline to fix critical issues?

---

## 🚀 PART 1: 5 Ask Expert Modes (Core Business Logic)

### Overview

VITAL platform must support **5 distinct consultation modes** that combine two dimensions:

**Dimensions**:
- **Query vs Chat**: Single-shot vs multi-turn conversations
- **Automatic vs Manual**: System-selected vs user-selected experts
- **Agent Mode**: Goal-oriented autonomous execution (unique 5th mode)

```
                    AUTOMATIC Selection  │  MANUAL Selection
                    (System Picks)       │  (User Picks)
                                        │
QUERY         ┌────────────────────────┼────────────────────────┐
(One-shot)    │     MODE 1             │      MODE 2            │
              │  Query-Automatic       │  Query-Manual          │
              │  Quick Answer          │  Targeted Answer       │
              └────────────────────────┼────────────────────────┘
                                        │
CHAT          ┌────────────────────────┼────────────────────────┐
(Multi-turn)  │     MODE 3             │      MODE 4            │
              │  Chat-Automatic        │  Chat-Manual           │
              │  Guided Conversation   │  Expert Chat           │
              └────────────────────────┼────────────────────────┘

              ┌─────────────────────────────────────────────────┐
              │              MODE 5: AGENT MODE                 │
              │          (True Autonomous Execution)            │
              │                                                 │
              │  • Goal-oriented planning                       │
              │  • Multi-step task execution                    │
              │  • Tool usage (search, APIs, DB)               │
              │  • Human-in-the-loop checkpoints               │
              │  • Iteration & self-correction                  │
              │  • Progress tracking                            │
              │                                                 │
              │  Like: AutoGPT, ChatGPT Operator, Devin        │
              └─────────────────────────────────────────────────┘
```

---

### Mode 1: Query-Automatic

**Type**: One-shot query  
**Selection**: System auto-selects best expert via semantic search  
**User Experience**: "Just ask and get an answer"

#### Expected Workflow
```
User Query → Agent Selector (Vector Search) → Agent Selection → 
RAG Context Retrieval → Prompt Building → LLM Generation → Response
```

#### Required Components
- ✅ **Agent Selector**: Semantic search over agent registry
- ✅ **RAG Integration**: Knowledge retrieval for context
- ✅ **Prompt Builder**: Mode-specific prompt templates
- ✅ **Single Response Handler**: No conversation state needed

#### Files to Check
```
📁 modes/query_automatic.py or autonomous_mode.py
📁 orchestration/agent_selector.py
📁 orchestration/query_classifier.py
📁 services/rag_service.py
```

#### Critical Validations
- [ ] Agent selection logic exists and uses vector search
- [ ] RAG service integration is real (not mock)
- [ ] Top-k agent ranking with confidence scores
- [ ] Prompt template specific to query-automatic mode
- [ ] Response includes citations from RAG sources
- [ ] No conversation state persistence needed
- [ ] Proper error handling for no matching agents

#### Common Issues to Flag
- 🔴 Agent selector returns None or hardcoded agent
- 🔴 RAG service is mocked/placeholder
- 🟡 No confidence threshold filtering
- 🟡 Missing citation extraction
- 🟢 No telemetry/logging

---

### Mode 2: Query-Manual

**Type**: One-shot query  
**Selection**: User manually selects specific expert from UI  
**User Experience**: "Pick your expert, then ask"

#### Expected Workflow
```
User Selects Agent ID → Agent Loading → User Query → 
RAG Context Retrieval → Prompt Building → LLM Generation → Response
```

#### Required Components
- ✅ **Agent Loader**: Load specific agent by ID
- ✅ **RAG Integration**: Knowledge retrieval for context
- ✅ **Prompt Builder**: Mode-specific prompt templates
- ✅ **Single Response Handler**: No conversation state needed

#### Files to Check
```
📁 modes/query_manual.py or interactive_mode.py
📁 services/agent_service.py
📁 orchestration/prompt_builder.py
```

#### Critical Validations
- [ ] Agent loading by ID from registry
- [ ] Validation that agent_id exists and is active
- [ ] RAG service integration for context
- [ ] Prompt template specific to query-manual mode
- [ ] Agent persona/system prompt properly loaded
- [ ] Response includes agent identity
- [ ] Proper error handling for invalid agent_id

#### Common Issues to Flag
- 🔴 Agent loading returns mock/hardcoded data
- 🔴 No validation of agent_id existence
- 🟡 Missing agent persona in prompt
- 🟡 No error message for inactive agents
- 🟢 No user feedback on agent selection

---

### Mode 3: Chat-Automatic

**Type**: Multi-turn conversation  
**Selection**: System manages expert selection per message  
**User Experience**: "Ongoing conversation with intelligent routing"

#### Expected Workflow
```
User Message → Context Loading → Agent Re-selection (per turn) → 
RAG Context Retrieval → Prompt with History → LLM Generation → 
Response → State Persistence → Repeat
```

#### Required Components
- ✅ **Conversation State Manager**: Session and message history
- ✅ **Dynamic Agent Selector**: Re-evaluate best agent per turn
- ✅ **Memory Manager**: Context window management
- ✅ **RAG Integration**: Knowledge retrieval per turn
- ✅ **Prompt Builder**: Includes conversation history

#### Files to Check
```
📁 modes/chat_automatic.py
📁 state/conversation_state.py
📁 memory/conversation_memory.py
📁 orchestration/context_loader.py
```

#### Critical Validations
- [ ] Conversation state persisted in database/cache
- [ ] Session management with session_id
- [ ] Message history included in prompts
- [ ] Agent re-selection logic per turn
- [ ] Context window management (token limits)
- [ ] Memory summarization for long conversations
- [ ] Proper LangChain memory integration
- [ ] Multi-tenant isolation in state storage

#### Common Issues to Flag
- 🔴 No conversation state persistence
- 🔴 Agent selection only happens once (first turn)
- 🔴 Message history not included in prompts
- 🟡 No context window management
- 🟡 No memory summarization strategy
- 🟢 No conversation cleanup/expiry

---

### Mode 4: Chat-Manual

**Type**: Multi-turn conversation  
**Selection**: User selects expert for entire session  
**User Experience**: "Extended conversation with chosen expert"

#### Expected Workflow
```
User Selects Agent → Session Start → User Message → 
Context Loading → RAG Context Retrieval → 
Prompt with History → LLM Generation → Response → 
State Persistence → Repeat
```

#### Required Components
- ✅ **Conversation State Manager**: Session and message history
- ✅ **Agent Persistence**: Same agent throughout session
- ✅ **Memory Manager**: Context window management
- ✅ **RAG Integration**: Knowledge retrieval per turn
- ✅ **Prompt Builder**: Includes conversation history

#### Files to Check
```
📁 modes/chat_manual.py
📁 state/conversation_state.py
📁 memory/conversation_memory.py
```

#### Critical Validations
- [ ] Agent locked to session (no re-selection)
- [ ] Conversation state persisted
- [ ] Session management with session_id + agent_id
- [ ] Message history included in prompts
- [ ] Context window management (token limits)
- [ ] Memory summarization for long conversations
- [ ] Agent persona consistent across messages
- [ ] Multi-tenant isolation in state storage

#### Common Issues to Flag
- 🔴 Agent changes mid-conversation
- 🔴 No conversation state persistence
- 🔴 Message history not included in prompts
- 🟡 No context window management
- 🟡 No memory summarization strategy
- 🟢 No conversation cleanup/expiry

---

### Mode 5: Agent (CRITICAL - Often Missing) 🚨

**Type**: Goal-oriented autonomous execution  
**Selection**: System orchestrates multiple tools/experts dynamically  
**User Experience**: "Set a goal and let the AI work autonomously"

> **⚠️ CRITICAL**: This mode is MOST OFTEN MISSING in implementations. It requires the most sophisticated architecture with LangGraph checkpoints, tool orchestration, and human-in-the-loop patterns.

#### Expected Workflow
```
User Goal → Goal Parser → Task Decomposition → Planning →
[CHECKPOINT: Plan Approval] → Task Execution Loop:
  ├─ Select Tool/Agent
  ├─ Execute Action
  ├─ Observe Result
  ├─ Reflect on Progress
  ├─ [CHECKPOINT: Decision Points]
  └─ Continue or Finish
→ [CHECKPOINT: Quality Review] → Final Deliverable
```

#### Required Components
- ✅ **Goal Parser**: Understanding complex user goals
- ✅ **Task Decomposer**: Breaking goals into executable steps
- ✅ **Planning Engine**: Creating multi-step execution plans
- ✅ **Checkpoint Manager**: Human approval workflows
- ✅ **Tool Orchestrator**: Dynamic tool selection and execution
- ✅ **State Persistence**: LangGraph checkpointing
- ✅ **Progress Tracker**: Real-time status updates
- ✅ **Self-Correction**: Reflection and iteration logic
- ✅ **Multi-Agent Coordination**: Orchestrating multiple experts

#### Files to Check
```
📁 modes/agent_mode.py              # CRITICAL - Often missing!
📁 planning/goal_parser.py
📁 planning/task_decomposer.py
📁 planning/planner.py
📁 checkpoint/checkpoint_manager.py  # CRITICAL
📁 checkpoint/approval_workflows.py
📁 graphs/agent_workflow.py          # LangGraph implementation
📁 tools/tool_orchestrator.py
📁 state/agent_state.py
```

#### Critical Validations

**Core Agent Mode Architecture**:
- [ ] Agent mode handler exists (not just modes 1-4)
- [ ] Goal parser extracts user intent and objectives
- [ ] Task decomposer breaks goals into executable steps
- [ ] Multi-step planning engine creates execution plan
- [ ] Plan includes: steps, dependencies, estimated costs, success criteria

**Checkpoint System** (CRITICAL):
- [ ] Checkpoint manager implementation exists
- [ ] Checkpoint types: plan_approval, decision, cost_gate, quality_review, error
- [ ] Human approval workflow (async waiting)
- [ ] Rejection handling and replanning
- [ ] Checkpoint state persistence
- [ ] Resume from checkpoint capability

**Tool Orchestration**:
- [ ] Tool registry with 5+ tools minimum
- [ ] Dynamic tool selection based on task
- [ ] Tool execution with error handling
- [ ] Retry logic for failed tool calls
- [ ] Tool result validation
- [ ] Tools include: web_search, database_query, api_call, code_execution

**LangGraph Integration**:
- [ ] StateGraph for agent workflow
- [ ] Agent state includes: goal, plan, current_step, tool_results, checkpoints
- [ ] Conditional edges for decision points
- [ ] Checkpointer for state persistence
- [ ] Resumable from any checkpoint
- [ ] Proper node functions: plan → execute → observe → reflect → synthesize

**Execution Loop**:
- [ ] Iterative execution (not just single action)
- [ ] Progress tracking with percentage/steps
- [ ] Self-reflection after each action
- [ ] Decision to continue or finish
- [ ] Error recovery and replanning
- [ ] Cost tracking and budget enforcement

**Integration Requirements**:
- [ ] Uses Agent Registry for expert selection
- [ ] Uses RAG Service for knowledge retrieval
- [ ] Uses Tool Registry for action execution
- [ ] Uses Prompt Library for reasoning prompts
- [ ] Multi-tenant isolation throughout

#### Agent Mode Implementation Patterns

**Example State Structure**:
```python
class AgentState(TypedDict):
    # Core
    goal: str
    plan: Dict[str, Any]
    current_step: int
    status: Literal["planning", "executing", "paused", "completed", "failed"]
    
    # Execution
    tool_results: List[Dict]
    observations: List[str]
    reflections: List[str]
    
    # Checkpoints
    checkpoints: List[Dict]
    awaiting_checkpoint: bool
    checkpoint_type: Optional[str]
    
    # Tracking
    progress: float  # 0.0 to 1.0
    cost_used: float
    cost_limit: float
    
    # Multi-tenant
    tenant_id: str
    user_id: str
    session_id: str
```

**Example LangGraph Implementation**:
```python
def create_agent_workflow() -> StateGraph:
    workflow = StateGraph(AgentState)
    
    # Planning phase
    workflow.add_node("parse_goal", parse_goal_node)
    workflow.add_node("create_plan", create_plan_node)
    workflow.add_node("checkpoint_plan", checkpoint_plan_node)
    
    # Execution phase
    workflow.add_node("select_action", select_action_node)
    workflow.add_node("execute_action", execute_action_node)
    workflow.add_node("observe_result", observe_result_node)
    workflow.add_node("reflect", reflect_node)
    
    # Conditional routing
    workflow.add_conditional_edges(
        "checkpoint_plan",
        check_approval,
        {
            "approved": "select_action",
            "rejected": "create_plan",
            "waiting": END  # Pause until human approval
        }
    )
    
    workflow.add_conditional_edges(
        "reflect",
        should_continue,
        {
            "continue": "select_action",
            "checkpoint": "checkpoint_decision",
            "finish": "synthesize_result"
        }
    )
    
    # Add checkpointer for persistence
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)
```

#### Common Issues to Flag

**🔴 CRITICAL (Blockers)**:
- Mode 5 completely missing (no agent_mode.py file)
- No checkpoint system implementation
- No LangGraph checkpointer/persistence
- No tool orchestration (just mock tools)
- No multi-step planning logic
- Agent mode is just a renamed Mode 1

**🟡 HIGH PRIORITY**:
- Checkpoint system exists but no approval workflows
- Tools exist but no dynamic selection
- No self-reflection or iteration
- No cost tracking or budget enforcement
- Planning is single-step (not true decomposition)
- No progress tracking
- State persistence incomplete

**🟢 MEDIUM PRIORITY**:
- Limited tool variety (< 5 tools)
- No error recovery logic
- Missing some checkpoint types
- No telemetry/observability
- Documentation incomplete

---

### Mode Routing & Dispatcher

#### Expected Implementation

A **mode router/dispatcher** should exist that:

```python
class ModeRouter:
    async def route_request(
        self,
        mode: ConsultationMode,
        query: str,
        agent_id: Optional[str] = None,
        session_id: Optional[str] = None,
        tenant_id: str,
        user_id: str
    ) -> Response:
        """Route request to appropriate mode handler"""
        
        if mode == "query_automatic":
            return await self.query_auto_handler.handle(query, tenant_id, user_id)
        elif mode == "query_manual":
            return await self.query_manual_handler.handle(query, agent_id, tenant_id, user_id)
        elif mode == "chat_automatic":
            return await self.chat_auto_handler.handle(query, session_id, tenant_id, user_id)
        elif mode == "chat_manual":
            return await self.chat_manual_handler.handle(query, agent_id, session_id, tenant_id, user_id)
        elif mode == "agent":
            return await self.agent_mode_handler.handle(query, tenant_id, user_id)
        else:
            raise ValueError(f"Unknown mode: {mode}")
```

#### Files to Check
```
📁 orchestration/mode_manager.py
📁 routes/consultation.py (API endpoint routing)
```

#### Critical Validations
- [ ] Mode router/dispatcher exists
- [ ] All 5 modes are supported in routing logic
- [ ] Proper validation of mode parameter
- [ ] Mode-specific parameter validation (e.g., agent_id for manual)
- [ ] Error handling for invalid modes
- [ ] Logging of mode selection

---

## 🔧 PART 2: Shared Platform Services

All Ask Expert modes depend on **5 core shared services**. These must be fully implemented (not mock/placeholder) for the system to function.

---

### Service 1: Agent Registry Service

**Purpose**: Central catalog of 136+ specialized healthcare AI agents

**Why Critical**: 
- Modes 1 & 3 depend on this for automatic agent selection
- Modes 2 & 4 depend on this for agent loading
- Mode 5 depends on this for multi-agent orchestration

#### Directory Structure to Check
```
📁 backend/python-ai-services/
├── 📁 agent_registry/                    # Main service directory
│   ├── 📁 models/
│   │   ├── agent.py                      # Agent data model
│   │   ├── capability.py                 # Capability definitions
│   │   └── expertise.py                  # Expertise taxonomy
│   ├── 📁 services/
│   │   ├── agent_store.py                # CRUD operations
│   │   ├── agent_selector.py             # Selection algorithms
│   │   ├── agent_matcher.py              # Capability matching
│   │   └── agent_versioning.py           # Version management
│   ├── 📁 search/
│   │   ├── vector_search.py              # Semantic agent search
│   │   ├── filter_engine.py              # Multi-dimensional filtering
│   │   └── ranking.py                    # Relevance scoring
│   └── 📁 connectors/
│       ├── supabase.py                   # Database integration
│       └── cache.py                      # Redis caching
```

#### Agent Data Model - Required Fields

```python
@dataclass
class Agent:
    # Identity
    id: UUID
    name: str                              # e.g., "Dr. Sarah Mitchell"
    display_name: str                      # UI-friendly name
    role: str                              # e.g., "FDA Regulatory Expert"
    
    # Expertise & Domain
    expertise: List[str]                   # ["FDA", "510(k)", "SaMD"]
    industry: List[str]                    # ["digital_health"]
    specialties: List[str]                 # ["regulatory", "clinical"]
    domain: str                            # "healthcare_regulatory"
    
    # Persona
    credentials: str                       # "PhD, 15+ years FDA experience"
    bio: str                               # Short biography
    avatar_url: Optional[str]              # Profile image
    personality_traits: List[str]          # ["analytical", "detail-oriented"]
    
    # AI Configuration
    system_prompt: str                     # Full system prompt
    model: str                             # "gpt-4" or "claude-3"
    temperature: float                     # 0.0 - 1.0
    max_tokens: int                        # Response length limit
    tools: List[str]                       # ["rag", "search", "calculator"]
    
    # Knowledge
    knowledge_base_ids: List[UUID]         # Linked document collections
    example_interactions: List[Dict]       # Few-shot examples
    
    # Metadata
    version: str                           # "1.0.0"
    status: str                            # "active" | "inactive" | "deprecated"
    tags: List[str]                        # Searchable tags
    created_at: datetime
    updated_at: datetime
    
    # Multi-tenant
    tenant_id: Optional[UUID]              # None = shared, UUID = tenant-specific
```

#### Critical Validations

**1. Database Integration**:
- [ ] Supabase client properly initialized (not None)
- [ ] Real database queries (not returning mock data)
- [ ] Connection pooling configured
- [ ] Error handling for database failures
- [ ] Query timeout handling

**2. Agent Storage**:
```python
# Should see real implementations like:
class AgentStore:
    async def get_agent_by_id(self, agent_id: UUID, tenant_id: UUID) -> Agent:
        """NOT returning mock data"""
        result = await self.supabase.from_("agents").select("*").eq("id", agent_id).execute()
        return Agent(**result.data[0])
    
    async def list_agents(self, filters: Dict, tenant_id: UUID) -> List[Agent]:
        """Real database query with tenant isolation"""
        query = self.supabase.from_("agents").select("*").eq("tenant_id", tenant_id)
        # Apply filters...
        return [Agent(**row) for row in result.data]
```

**Validations**:
- [ ] NOT returning hardcoded agent objects
- [ ] NOT returning None or empty lists always
- [ ] Tenant isolation enforced (tenant_id filtering)
- [ ] Proper error handling
- [ ] Logging of queries

**3. Agent Selection (Semantic Search)**:
```python
class AgentSelector:
    async def select_best_agent(
        self,
        query: str,
        tenant_id: UUID,
        top_k: int = 5,
        min_confidence: float = 0.5
    ) -> List[Tuple[Agent, float]]:
        """
        Semantic search for best matching agents
        Returns: [(agent, confidence_score), ...]
        """
        # Generate query embedding
        query_embedding = await self.embedding_service.embed(query)
        
        # Vector similarity search
        results = await self.vector_search.search(
            embedding=query_embedding,
            tenant_id=tenant_id,
            top_k=top_k
        )
        
        # Filter by confidence
        filtered = [(agent, score) for agent, score in results if score >= min_confidence]
        
        return filtered
```

**Validations**:
- [ ] Embedding generation implemented (OpenAI/Cohere)
- [ ] Vector similarity search working
- [ ] Confidence threshold filtering
- [ ] Top-k ranking
- [ ] Tenant isolation in search
- [ ] NOT using simple keyword matching
- [ ] NOT returning random agents

**4. Multi-Dimensional Filtering**:
```python
class FilterEngine:
    async def apply_filters(
        self,
        agents: List[Agent],
        domain: Optional[str] = None,
        expertise: Optional[List[str]] = None,
        industry: Optional[List[str]] = None,
        capabilities: Optional[List[str]] = None,
        status: str = "active"
    ) -> List[Agent]:
        """Apply multiple filters to agent list"""
        # Implementation filters agents by criteria
```

**Validations**:
- [ ] Domain filtering works
- [ ] Expertise filtering (partial match)
- [ ] Industry filtering
- [ ] Capability filtering
- [ ] Status filtering (active only by default)
- [ ] Combined filter logic (AND/OR)

**5. Caching Layer**:
```python
class AgentCache:
    async def get_cached_agent(self, agent_id: UUID) -> Optional[Agent]:
        """Check Redis cache before database"""
        cached = await self.redis.get(f"agent:{agent_id}")
        if cached:
            return Agent(**json.loads(cached))
        return None
    
    async def cache_agent(self, agent: Agent, ttl: int = 3600):
        """Cache agent for 1 hour"""
        await self.redis.setex(
            f"agent:{agent.id}",
            ttl,
            json.dumps(asdict(agent))
        )
```

**Validations**:
- [ ] Redis client initialized
- [ ] Cache-aside pattern implemented
- [ ] TTL configured appropriately
- [ ] Cache invalidation on updates
- [ ] Fallback to database on cache miss

**6. Agent Versioning**:
- [ ] Version field in agent model
- [ ] Version comparison logic
- [ ] Active version tracking
- [ ] Version history if needed

#### Common Issues to Flag

**🔴 CRITICAL (Blockers)**:
- `agent_store.py` returns None or hardcoded agents
- Supabase client is None (not initialized)
- No vector search implementation (uses simple filtering)
- No embedding generation
- No tenant isolation in queries
- Agent selection returns random agent

**🟡 HIGH PRIORITY**:
- No caching layer (slow repeated queries)
- Missing error handling on database failures
- No connection pooling
- Vector search not using pgvector
- Confidence scores are hardcoded
- No logging of agent selection

**🟢 MEDIUM PRIORITY**:
- Limited filtering options
- No version management
- Missing agent health monitoring
- No usage analytics
- Documentation incomplete

#### Database Schema to Verify

Should exist in Supabase:

```sql
-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    display_name VARCHAR(500) NOT NULL,
    role VARCHAR(500) NOT NULL,
    expertise TEXT[] NOT NULL,
    industry TEXT[] NOT NULL,
    specialties TEXT[],
    domain VARCHAR(100),
    
    credentials TEXT,
    bio TEXT,
    avatar_url TEXT,
    
    system_prompt TEXT NOT NULL,
    model VARCHAR(50) NOT NULL,
    temperature FLOAT DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    tools TEXT[],
    
    version VARCHAR(50) DEFAULT '1.0.0',
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[],
    
    tenant_id UUID,  -- NULL = shared across tenants
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CHECK (status IN ('active', 'inactive', 'deprecated'))
);

-- Indexes for performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_domain ON agents(domain);
CREATE INDEX idx_agents_tenant ON agents(tenant_id);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);

-- Agent embeddings for vector search
CREATE TABLE agent_embeddings (
    agent_id UUID PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
    embedding vector(1536),  -- OpenAI ada-002 dimension
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_embeddings_vector 
    ON agent_embeddings 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
```

---

### Service 2: Prompt Library Service

**Purpose**: Centralized prompt template management and versioning

**Why Critical**:
- All 5 modes need mode-specific prompt templates
- ReAct and CoT patterns require specialized prompts
- Consistency across agent responses
- A/B testing and optimization

#### Directory Structure to Check
```
📁 backend/python-ai-services/
├── 📁 prompt_library/                     # Main service directory
│   ├── 📁 models/
│   │   ├── template.py                    # Prompt template model
│   │   ├── version.py                     # Version control
│   │   └── variable.py                    # Template variables
│   ├── 📁 services/
│   │   ├── template_store.py              # CRUD operations
│   │   ├── template_builder.py            # Prompt construction
│   │   ├── variable_resolver.py           # Variable substitution
│   │   └── version_manager.py             # Version control
│   ├── 📁 categories/
│   │   ├── expert_prompts.py              # 5 mode prompts
│   │   ├── panel_prompts.py               # Panel discussion prompts
│   │   ├── workflow_prompts.py            # Workflow execution prompts
│   │   └── reasoning_prompts.py           # ReAct/CoT prompts
│   └── 📁 analytics/
│       └── usage_tracker.py               # Prompt performance metrics
```

#### Prompt Template Model - Required Fields

```python
@dataclass
class PromptTemplate:
    # Identity
    id: UUID
    name: str                              # e.g., "expert_query_automatic_v1"
    display_name: str                      # "Expert Query - Automatic Mode"
    description: str
    
    # Category
    category: str                          # "expert_consultation" | "reasoning" | "panel"
    subcategory: Optional[str]             # "query_automatic" | "react" | etc.
    
    # Template Content
    template: str                          # Jinja2 template string
    variables: List[VariableDefinition]    # Required variables
    
    # Version Control
    version: str                           # "1.0.0"
    is_active: bool                        # Active version flag
    status: str                            # "draft" | "active" | "deprecated"
    
    # Metadata
    tags: List[str]                        # Searchable tags
    author: str
    changelog: Optional[str]               # Version changes
    
    # Performance
    avg_tokens: Optional[int]              # Average token usage
    success_rate: Optional[float]          # 0.0 - 1.0
    
    # Dates
    created_at: datetime
    updated_at: datetime
```

#### Required Prompt Templates

**Must exist for all 5 modes**:

1. **Query-Automatic Prompt**:
```python
EXPERT_QUERY_AUTOMATIC = """
You are {agent_name}, a {agent_role}.

Your credentials: {agent_credentials}

Context from knowledge base:
{rag_context}

User query: {user_query}

Provide a comprehensive answer based on your expertise and the provided context.
Include citations using [Source X] format.

Answer:
"""
```

2. **Query-Manual Prompt**:
```python
EXPERT_QUERY_MANUAL = """
You are {agent_name}, a {agent_role}.

The user specifically requested your expertise for this question.

Your credentials: {agent_credentials}

Context from knowledge base:
{rag_context}

User query: {user_query}

Provide a detailed answer leveraging your specialized knowledge.
Include citations using [Source X] format.

Answer:
"""
```

3. **Chat-Automatic Prompt**:
```python
EXPERT_CHAT_AUTOMATIC = """
You are {agent_name}, a {agent_role}.

Your credentials: {agent_credentials}

Conversation history:
{conversation_history}

Context from knowledge base:
{rag_context}

Current user message: {user_message}

Continue the conversation naturally, building on previous context.
Include citations when referencing sources.

Response:
"""
```

4. **Chat-Manual Prompt**:
```python
EXPERT_CHAT_MANUAL = """
You are {agent_name}, a {agent_role}.

The user chose to have an extended conversation with you specifically.

Your credentials: {agent_credentials}

Conversation history:
{conversation_history}

Context from knowledge base:
{rag_context}

Current user message: {user_message}

Continue the conversation, maintaining your expert persona and leveraging previous context.
Include citations when referencing sources.

Response:
"""
```

5. **Agent Mode Prompts** (Multiple):

**Goal Understanding Prompt**:
```python
AGENT_GOAL_PARSER = """
Analyze the user's goal and extract:
1. Primary objective
2. Success criteria
3. Constraints (time, budget, quality)
4. Implicit requirements

User goal: {user_goal}

Output as JSON:
{
  "objective": "...",
  "success_criteria": [...],
  "constraints": {...},
  "requirements": [...]
}
"""
```

**Task Decomposition Prompt**:
```python
AGENT_TASK_DECOMPOSER = """
Break down this goal into executable steps:

Goal: {goal}
Success criteria: {success_criteria}

Create a detailed execution plan with:
- Numbered steps
- Dependencies between steps
- Required tools/agents for each step
- Estimated time/cost per step
- Success verification for each step

Output as JSON:
{
  "steps": [
    {
      "step_number": 1,
      "description": "...",
      "dependencies": [],
      "required_tools": [...],
      "required_capabilities": [...],
      "estimated_cost": 0.0,
      "success_criteria": "..."
    }
  ]
}
"""
```

**ReAct Thinking Prompt**:
```python
REACT_THINKING = """
Think step-by-step about the current situation:

Goal: {goal}
Current step: {current_step}
Previous actions: {previous_actions}
Observations: {observations}

What should I do next?
1. Analyze the current situation
2. Consider available tools: {available_tools}
3. Reason about the best next action
4. Explain your reasoning

Thought:
"""
```

**Reflection Prompt**:
```python
AGENT_REFLECTION = """
Reflect on the execution so far:

Goal: {goal}
Steps completed: {completed_steps}
Current results: {results}
Observations: {observations}

Evaluate:
1. Progress toward goal (0-100%)
2. Quality of results so far
3. Any errors or issues encountered
4. Should we continue, adjust plan, or finish?

Reflection:
"""
```

#### Critical Validations

**1. Template Storage**:
- [ ] Database/file storage for templates
- [ ] NOT hardcoded in Python files
- [ ] Template CRUD operations work
- [ ] Version control for templates
- [ ] Active version tracking

**2. Variable Resolution**:
```python
class VariableResolver:
    def resolve(self, template: str, variables: Dict[str, Any]) -> str:
        """Resolve template variables"""
        # Jinja2 rendering
        template_obj = Template(template)
        rendered = template_obj.render(**variables)
        return rendered
    
    def validate_variables(self, template: PromptTemplate, variables: Dict[str, Any]):
        """Ensure all required variables provided"""
        required = {var.name for var in template.variables if var.required}
        provided = set(variables.keys())
        missing = required - provided
        if missing:
            raise ValueError(f"Missing required variables: {missing}")
```

**Validations**:
- [ ] Jinja2 or similar template engine used
- [ ] Variable validation before rendering
- [ ] Error handling for missing variables
- [ ] Type validation for variables
- [ ] Default values for optional variables

**3. Template Categories**:
- [ ] All 5 expert mode templates exist
- [ ] ReAct reasoning templates exist (think, plan, act, observe, reflect)
- [ ] Agent mode templates exist (goal, decompose, execute, reflect)
- [ ] Panel discussion templates (if panel service exists)
- [ ] Properly categorized and tagged

**4. Version Management**:
```python
class VersionManager:
    async def create_version(self, template_id: UUID, new_template: str, changelog: str) -> Version:
        """Create new version of template"""
        # Increment version number
        # Mark old version as inactive
        # Set new version as active
        
    async def get_active_version(self, template_name: str) -> PromptTemplate:
        """Get currently active version"""
        
    async def rollback_version(self, template_id: UUID, target_version: str):
        """Rollback to previous version"""
```

**Validations**:
- [ ] Version increment logic (semantic versioning)
- [ ] Only one active version per template
- [ ] Version history preserved
- [ ] Rollback capability
- [ ] Changelog documentation

**5. Performance Analytics**:
- [ ] Token usage tracking per template
- [ ] Success rate monitoring
- [ ] Response quality metrics
- [ ] A/B testing support (if multiple versions active)

#### Common Issues to Flag

**🔴 CRITICAL (Blockers)**:
- Prompts hardcoded in mode handlers (not in library)
- Missing prompts for Agent Mode (Mode 5)
- No variable substitution (static prompts)
- Template storage returns None
- No version control

**🟡 HIGH PRIORITY**:
- Missing ReAct reasoning prompts
- No validation of required variables
- Templates not using Jinja2/proper engine
- No error handling for template rendering
- Missing some mode-specific templates

**🟢 MEDIUM PRIORITY**:
- No performance analytics
- Missing A/B testing support
- No template categorization
- Limited template reusability
- Documentation incomplete

#### Database Schema to Verify

```sql
-- Prompt templates table
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL UNIQUE,
    display_name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    tags TEXT[] DEFAULT '{}',
    author VARCHAR(255),
    changelog TEXT,
    avg_tokens INTEGER,
    success_rate FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (status IN ('draft', 'active', 'deprecated'))
);

-- Indexes
CREATE INDEX idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX idx_prompt_templates_status ON prompt_templates(status);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(is_active);

-- Template versions table
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    template TEXT NOT NULL,
    variables JSONB NOT NULL,
    changelog TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (template_id, version)
);

-- Usage analytics
CREATE TABLE prompt_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES prompt_templates(id),
    agent_id UUID,
    mode VARCHAR(50),
    execution_time_ms INTEGER,
    token_count INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompt_usage_template ON prompt_usage_analytics(template_id);
CREATE INDEX idx_prompt_usage_created ON prompt_usage_analytics(created_at);
```

---

### Service 3: RAG Service (Retrieval-Augmented Generation)

**Purpose**: Knowledge retrieval and context augmentation for AI responses

**Why Critical**:
- All modes need context from knowledge base
- Enables citation and source attribution
- Improves response accuracy and relevance
- Multi-tenant document isolation

#### Directory Structure to Check
```
📁 backend/python-ai-services/
├── 📁 rag_service/                        # Main service directory
│   ├── 📁 pipeline/
│   │   ├── retriever.py                   # Document retrieval
│   │   ├── ranker.py                      # Re-ranking results
│   │   ├── chunker.py                     # Document chunking
│   │   └── embedder.py                    # Text embedding
│   ├── 📁 storage/
│   │   ├── vector_store.py                # pgvector operations
│   │   ├── document_store.py              # Document metadata
│   │   └── cache.py                       # Result caching
│   ├── 📁 search/
│   │   ├── semantic_search.py             # Vector similarity
│   │   ├── hybrid_search.py               # Vector + keyword
│   │   └── query_expansion.py             # Query enrichment
│   ├── 📁 connectors/
│   │   ├── supabase_rag.py                # Database connector
│   │   ├── pinecone.py                    # Vector DB (if used)
│   │   └── embedding_service.py           # OpenAI/Cohere APIs
│   └── 📁 quality/
│       ├── relevance_scorer.py            # Result quality
│       └── citation_extractor.py          # Source attribution
```

#### RAG Pipeline Architecture

```
User Query
    ↓
Query Embedding (OpenAI ada-002)
    ↓
Vector Similarity Search (pgvector)
    ↓
[Optional] Keyword Search
    ↓
Hybrid Results Fusion
    ↓
Re-ranking (by relevance)
    ↓
Top-K Results (5-10 chunks)
    ↓
Citation Extraction
    ↓
Context Assembly
    ↓
Return to LLM Prompt
```

#### Critical Validations

**1. Vector Database Integration**:

Should use **pgvector** in Supabase:
```python
class VectorStore:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    async def similarity_search(
        self,
        query_embedding: List[float],
        tenant_id: UUID,
        top_k: int = 10,
        similarity_threshold: float = 0.7
    ) -> List[Dict]:
        """
        Vector similarity search with tenant isolation
        """
        # Convert to pgvector format
        embedding_str = f"[{','.join(map(str, query_embedding))}]"
        
        # Query with cosine similarity
        result = await self.supabase.rpc(
            'match_knowledge_chunks',
            {
                'query_embedding': embedding_str,
                'match_threshold': similarity_threshold,
                'match_count': top_k,
                'tenant_id_filter': str(tenant_id)
            }
        ).execute()
        
        return result.data
```

**Validations**:
- [ ] Supabase client initialized (not None)
- [ ] pgvector extension enabled in database
- [ ] Real vector similarity search (not keyword search)
- [ ] Cosine similarity function used
- [ ] Tenant isolation in queries
- [ ] Configurable top_k and threshold
- [ ] Returns similarity scores

**2. Embedding Generation**:
```python
class EmbeddingService:
    def __init__(self, openai_api_key: str):
        self.client = OpenAI(api_key=openai_api_key)
        self.model = "text-embedding-ada-002"
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for text"""
        response = await self.client.embeddings.create(
            input=text,
            model=self.model
        )
        return response.data[0].embedding
    
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        response = await self.client.embeddings.create(
            input=texts,
            model=self.model
        )
        return [item.embedding for item in response.data]
```

**Validations**:
- [ ] OpenAI API key configured
- [ ] Using ada-002 model (1536 dimensions)
- [ ] Batch embedding support for efficiency
- [ ] Error handling for API failures
- [ ] Rate limiting handling
- [ ] NOT using mock/random embeddings

**3. Document Chunking**:
```python
class DocumentChunker:
    def chunk_document(
        self,
        content: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        separator: str = "\n\n"
    ) -> List[Dict]:
        """
        Split document into overlapping chunks
        """
        # Implementation using RecursiveCharacterTextSplitter or similar
        chunks = []
        # ... chunking logic
        return chunks
```

**Validations**:
- [ ] Configurable chunk size
- [ ] Overlap between chunks (continuity)
- [ ] Semantic chunking (paragraph/section boundaries)
- [ ] Metadata preserved per chunk (document_id, chunk_index)
- [ ] NOT using fixed-length character splits only

**4. Hybrid Search (Vector + Keyword)**:
```python
class HybridSearch:
    async def search(
        self,
        query: str,
        tenant_id: UUID,
        top_k: int = 10
    ) -> List[Dict]:
        """
        Combine vector similarity and keyword search
        """
        # Vector search
        query_embedding = await self.embedder.embed_text(query)
        vector_results = await self.vector_store.similarity_search(
            query_embedding, tenant_id, top_k * 2
        )
        
        # Keyword search (BM25 or full-text)
        keyword_results = await self.keyword_search(query, tenant_id, top_k * 2)
        
        # Fusion (RRF - Reciprocal Rank Fusion)
        fused_results = self.fuse_results(vector_results, keyword_results)
        
        return fused_results[:top_k]
```

**Validations**:
- [ ] Vector search implemented
- [ ] Keyword search implemented (full-text or BM25)
- [ ] Result fusion algorithm (RRF recommended)
- [ ] Configurable weights for vector vs keyword
- [ ] Deduplication of results

**5. Re-ranking**:
```python
class ResultRanker:
    async def rerank(
        self,
        query: str,
        results: List[Dict],
        top_k: int = 5
    ) -> List[Dict]:
        """
        Re-rank results for improved relevance
        """
        # Cross-encoder scoring or LLM-based reranking
        scores = []
        for result in results:
            score = await self.score_relevance(query, result['content'])
            scores.append((result, score))
        
        # Sort by score
        sorted_results = sorted(scores, key=lambda x: x[1], reverse=True)
        return [result for result, score in sorted_results[:top_k]]
```

**Validations**:
- [ ] Re-ranking implemented (not just vector scores)
- [ ] Cross-encoder or LLM-based scoring
- [ ] Improves relevance over raw similarity
- [ ] Configurable top_k after reranking

**6. Citation Extraction**:
```python
class CitationExtractor:
    def extract_citations(
        self,
        response: str,
        sources: List[Dict]
    ) -> Tuple[str, List[Citation]]:
        """
        Extract citations from LLM response
        Match [Source X] with actual sources
        """
        citations = []
        # Parse response for [Source X] markers
        # Map to actual source documents
        # Create Citation objects
        return response, citations

@dataclass
class Citation:
    id: UUID
    source_id: UUID
    source_title: str
    source_url: Optional[str]
    chunk_content: str
    relevance_score: float
    position_in_response: int
```

**Validations**:
- [ ] Citation markers properly parsed
- [ ] Citations linked to source documents
- [ ] Source metadata included (title, URL)
- [ ] Chunk content included for context
- [ ] Relevance scores preserved

**7. Caching Layer**:
```python
class RAGCache:
    async def get_cached_results(
        self,
        query_hash: str,
        tenant_id: UUID
    ) -> Optional[List[Dict]]:
        """Check cache for query results"""
        cache_key = f"rag:{tenant_id}:{query_hash}"
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        return None
    
    async def cache_results(
        self,
        query_hash: str,
        tenant_id: UUID,
        results: List[Dict],
        ttl: int = 3600
    ):
        """Cache results for 1 hour"""
        cache_key = f"rag:{tenant_id}:{query_hash}"
        await self.redis.setex(
            cache_key,
            ttl,
            json.dumps(results)
        )
```

**Validations**:
- [ ] Redis client initialized
- [ ] Query hash for cache key
- [ ] Tenant isolation in cache keys
- [ ] TTL configured appropriately
- [ ] Cache invalidation on document updates

**8. Multi-Tenant Isolation**:

Every query MUST filter by tenant_id:
```python
# CORRECT - Tenant isolated
results = await supabase.from_("knowledge_chunks")\
    .select("*")\
    .eq("tenant_id", tenant_id)\
    .execute()

# WRONG - No tenant isolation (security vulnerability!)
results = await supabase.from_("knowledge_chunks")\
    .select("*")\
    .execute()
```

**Validations**:
- [ ] ALL queries include tenant_id filter
- [ ] Row Level Security (RLS) policies enabled
- [ ] No cross-tenant data leakage possible
- [ ] Tenant validation in API layer

#### Common Issues to Flag

**🔴 CRITICAL (Blockers)**:
- RAG connector returns None or mock data
- No vector embeddings in database
- Supabase client not initialized
- No tenant isolation in queries (SECURITY RISK)
- Using keyword search only (no vector search)
- No embedding generation

**🟡 HIGH PRIORITY**:
- No re-ranking (just using raw similarity)
- No hybrid search (vector + keyword)
- No caching layer (repeated queries)
- Hardcoded similarity thresholds
- No error handling for OpenAI API failures
- Missing citation extraction
- No chunking strategy (using full documents)

**🟢 MEDIUM PRIORITY**:
- No query expansion
- Limited metadata in results
- No result quality monitoring
- Missing performance metrics
- Documentation incomplete

#### Database Schema to Verify

Must exist in Supabase:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base documents
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title TEXT NOT NULL,
    source_type VARCHAR(50),  -- 'fda_guidance', 'clinical_study', etc.
    source_url TEXT,
    file_path TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with embeddings
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI ada-002 dimension
    chunk_index INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast similarity search
CREATE INDEX idx_knowledge_chunks_embedding 
    ON knowledge_chunks 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_knowledge_chunks_tenant 
    ON knowledge_chunks(tenant_id);

CREATE INDEX idx_knowledge_documents_tenant 
    ON knowledge_documents(tenant_id);

-- Full-text search index for hybrid search
CREATE INDEX idx_knowledge_chunks_content_fts 
    ON knowledge_chunks 
    USING gin(to_tsvector('english', content));

-- RLS Policies for multi-tenant isolation
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_documents 
    ON knowledge_documents 
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation_chunks 
    ON knowledge_chunks 
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**Stored Procedure for Vector Search**:
```sql
-- Function for vector similarity search with tenant isolation
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    tenant_id_filter uuid
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        knowledge_chunks.id,
        knowledge_chunks.document_id,
        knowledge_chunks.content,
        1 - (knowledge_chunks.embedding <=> query_embedding) as similarity,
        knowledge_chunks.metadata
    FROM knowledge_chunks
    WHERE 
        knowledge_chunks.tenant_id = tenant_id_filter
        AND 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
    ORDER BY knowledge_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

### Service 4: Capability Manager Service

**Purpose**: Agent capability definition, discovery, and matching

**Why Critical**:
- Enables sophisticated agent selection beyond keywords
- Powers Agent Mode (Mode 5) task-to-agent matching
- Supports multi-agent orchestration
- Dependency resolution for complex tasks

#### Directory Structure to Check
```
📁 backend/python-ai-services/
├── 📁 capability_manager/                 # Main service directory
│   ├── 📁 models/
│   │   ├── capability.py                  # Capability definitions
│   │   ├── requirement.py                 # Capability requirements
│   │   └── dependency.py                  # Capability dependencies
│   ├── 📁 services/
│   │   ├── capability_store.py            # CRUD operations
│   │   ├── matcher.py                     # Capability matching
│   │   ├── validator.py                   # Requirement validation
│   │   └── dependency_resolver.py         # Dependency management
│   ├── 📁 registry/
│   │   ├── healthcare_capabilities.py     # Healthcare domain
│   │   ├── regulatory_capabilities.py     # Regulatory domain
│   │   ├── clinical_capabilities.py       # Clinical domain
│   │   └── technical_capabilities.py      # Technical capabilities
│   └── 📁 scoring/
│       └── match_scorer.py                # Scoring algorithms
```

#### Capability Model

```python
@dataclass
class Capability:
    # Identity
    id: UUID
    name: str                              # e.g., "fda_regulatory_filing"
    display_name: str                      # "FDA Regulatory Filing"
    description: str
    
    # Taxonomy
    domain: str                            # "regulatory" | "clinical" | "technical"
    category: str                          # "compliance" | "analysis" | "execution"
    level: str                             # "basic" | "intermediate" | "expert"
    
    # Characteristics
    requires_tools: List[str]              # ["web_search", "document_analysis"]
    requires_knowledge: List[str]          # ["fda_guidelines", "510k_process"]
    output_type: str                       # "report" | "analysis" | "decision"
    
    # Dependencies
    prerequisites: List[UUID]              # Other capabilities needed first
    complements: List[UUID]                # Capabilities that work well together
    
    # Metadata
    tags: List[str]
    created_at: datetime
```

```python
@dataclass
class AgentCapability:
    # Links agent to capability
    agent_id: UUID
    capability_id: UUID
    proficiency: float                     # 0.0 - 1.0
    evidence: List[str]                    # Training data, examples
    last_used: Optional[datetime]
    success_rate: Optional[float]          # Historical performance
```

#### Critical Validations

**1. Capability Taxonomy**:

Should have well-defined capability hierarchy:
```python
# Example capabilities for healthcare domain
HEALTHCARE_CAPABILITIES = {
    "regulatory": {
        "fda_510k_filing": {
            "name": "FDA 510(k) Submission",
            "level": "expert",
            "requires_tools": ["document_generation", "regulatory_search"],
            "requires_knowledge": ["510k_process", "predicate_devices"]
        },
        "clinical_trial_design": {
            "name": "Clinical Trial Design",
            "level": "expert",
            "requires_tools": ["statistical_analysis"],
            "requires_knowledge": ["clinical_protocols", "fda_guidance"]
        }
    },
    "clinical": {
        "medical_research": {
            "name": "Medical Research & Literature Review",
            "level": "intermediate",
            "requires_tools": ["web_search", "document_analysis"],
            "requires_knowledge": ["medical_literature", "research_methods"]
        }
    },
    # ... more capabilities
}
```

**Validations**:
- [ ] Comprehensive capability taxonomy defined
- [ ] Categories cover all agent domains
- [ ] Proficiency levels standardized
- [ ] Tool requirements specified
- [ ] Knowledge requirements specified

**2. Agent-Capability Mapping**:
```python
class CapabilityStore:
    async def get_agent_capabilities(
        self,
        agent_id: UUID
    ) -> List[Capability]:
        """Get all capabilities for an agent"""
        result = await self.supabase.from_("agent_capabilities")\
            .select("*, capabilities(*)")\
            .eq("agent_id", agent_id)\
            .execute()
        return [Capability(**row['capabilities']) for row in result.data]
    
    async def get_agents_by_capability(
        self,
        capability_id: UUID,
        min_proficiency: float = 0.5
    ) -> List[Tuple[Agent, float]]:
        """Get agents with specific capability"""
        # Returns [(agent, proficiency), ...]
```

**Validations**:
- [ ] Agent-capability relationships stored
- [ ] Proficiency scores tracked
- [ ] Bidirectional queries work (agent→capabilities, capability→agents)
- [ ] Filtering by proficiency threshold

**3. Capability Matching**:
```python
class CapabilityMatcher:
    async def match_capabilities(
        self,
        required_capabilities: List[str],
        tenant_id: UUID,
        min_proficiency: float = 0.6
    ) -> List[Tuple[Agent, float]]:
        """
        Find agents matching required capabilities
        Returns: [(agent, match_score), ...]
        """
        matched_agents = []
        
        for capability_name in required_capabilities:
            # Find agents with this capability
            agents = await self.get_agents_by_capability(
                capability_name,
                min_proficiency
            )
            matched_agents.extend(agents)
        
        # Aggregate scores
        agent_scores = {}
        for agent, score in matched_agents:
            if agent.id in agent_scores:
                agent_scores[agent.id] = max(agent_scores[agent.id], score)
            else:
                agent_scores[agent.id] = score
        
        # Sort by score
        sorted_agents = sorted(
            agent_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [(agent, score) for agent_id, score in sorted_agents]
```

**Validations**:
- [ ] Matching algorithm implemented
- [ ] Supports multiple required capabilities
- [ ] Score aggregation logic (AND vs OR)
- [ ] Proficiency threshold filtering
- [ ] Returns ranked results

**4. Dependency Resolution**:
```python
class DependencyResolver:
    async def resolve_dependencies(
        self,
        capability: Capability
    ) -> List[Capability]:
        """
        Resolve capability dependencies
        Returns: [prerequisite_cap1, prerequisite_cap2, ..., capability]
        """
        resolved = []
        visited = set()
        
        async def resolve_recursive(cap: Capability):
            if cap.id in visited:
                return
            visited.add(cap.id)
            
            # Resolve prerequisites first
            for prereq_id in cap.prerequisites:
                prereq = await self.get_capability(prereq_id)
                await resolve_recursive(prereq)
            
            resolved.append(cap)
        
        await resolve_recursive(capability)
        return resolved
```

**Validations**:
- [ ] Dependency resolution implemented
- [ ] Circular dependency detection
- [ ] Topological sorting of dependencies
- [ ] Returns execution order

**5. Match Scoring**:
```python
class MatchScorer:
    def calculate_match_score(
        self,
        agent: Agent,
        required_capabilities: List[str],
        required_tools: List[str],
        task_complexity: str  # "simple" | "moderate" | "complex"
    ) -> float:
        """
        Calculate match score for agent to task
        Score: 0.0 (no match) to 1.0 (perfect match)
        """
        scores = []
        
        # Capability coverage
        cap_score = self.score_capability_coverage(agent, required_capabilities)
        scores.append(cap_score * 0.5)  # 50% weight
        
        # Tool availability
        tool_score = self.score_tool_availability(agent, required_tools)
        scores.append(tool_score * 0.3)  # 30% weight
        
        # Complexity match
        complexity_score = self.score_complexity_match(agent, task_complexity)
        scores.append(complexity_score * 0.2)  # 20% weight
        
        return sum(scores)
```

**Validations**:
- [ ] Multi-factor scoring algorithm
- [ ] Weighted scoring components
- [ ] Normalized scores (0.0 - 1.0)
- [ ] Configurable weights

#### Common Issues to Flag

**🔴 CRITICAL (Blockers)**:
- No capability definitions exist
- Agents have no capabilities assigned
- No matching algorithm (uses random selection)
- No database storage for capabilities
- No agent-capability relationships

**🟡 HIGH PRIORITY**:
- Limited capability taxonomy (< 20 capabilities)
- No proficiency tracking
- No dependency resolution
- Matching uses simple keyword matching
- No scoring algorithm
- Missing tool requirements

**🟢 MEDIUM PRIORITY**:
- No historical performance tracking
- Missing evidence/examples
- No capability versioning
- Limited analytics
- Documentation incomplete

#### Database Schema to Verify

```sql
-- Capabilities table
CREATE TABLE capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    level VARCHAR(50),  -- 'basic' | 'intermediate' | 'expert'
    requires_tools TEXT[] DEFAULT '{}',
    requires_knowledge TEXT[] DEFAULT '{}',
    output_type VARCHAR(100),
    prerequisites UUID[] DEFAULT '{}',  -- Other capability IDs
    complements UUID[] DEFAULT '{}',     -- Complementary capability IDs
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent-Capability mapping
CREATE TABLE agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    proficiency FLOAT NOT NULL CHECK (proficiency >= 0.0 AND proficiency <= 1.0),
    evidence JSONB DEFAULT '[]',
    last_used TIMESTAMPTZ,
    success_rate FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (agent_id, capability_id)
);

-- Indexes
CREATE INDEX idx_capabilities_domain ON capabilities(domain);
CREATE INDEX idx_capabilities_level ON capabilities(level);
CREATE INDEX idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX idx_agent_capabilities_capability ON agent_capabilities(capability_id);
CREATE INDEX idx_agent_capabilities_proficiency ON agent_capabilities(proficiency);
```

---

### Service 5: Tool Registry Service

**Purpose**: Tool integration, execution, and management for Agent Mode

**Why Critical**:
- Agent Mode (Mode 5) REQUIRES tools to function
- Enables autonomous task execution
- Provides actions beyond LLM generation
- Core of ReAct pattern implementation

#### Directory Structure to Check
```
📁 backend/python-ai-services/
├── 📁 tool_registry/                      # Main service directory
│   ├── 📁 tools/
│   │   ├── web_search.py                  # Web search tool
│   │   ├── database_query.py              # Database operations
│   │   ├── api_caller.py                  # External API calls
│   │   ├── code_executor.py               # Safe code execution
│   │   ├── file_operations.py             # File I/O
│   │   ├── calculator.py                  # Calculations
│   │   └── document_generator.py          # Document creation
│   ├── 📁 registry/
│   │   ├── tool_store.py                  # Tool catalog
│   │   ├── tool_loader.py                 # Dynamic loading
│   │   └── tool_validator.py              # Tool validation
│   ├── 📁 execution/
│   │   ├── executor.py                    # Tool execution
│   │   ├── sandbox.py                     # Isolated execution
│   │   ├── retry_handler.py               # Retry logic
│   │   └── timeout_manager.py             # Timeout handling
│   └── 📁 integration/
│       ├── langchain_tools.py             # LangChain integration
│       └── custom_tools.py                # Custom tool adapters
```

#### Tool Interface

```python
class Tool(ABC):
    """Base class for all tools"""
    
    name: str
    description: str
    parameters: Dict[str, Any]
    return_type: str
    
    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """Execute the tool"""
        pass
    
    @abstractmethod
    def validate_params(self, **kwargs) -> bool:
        """Validate parameters before execution"""
        pass
```

#### Required Tools (Minimum)

**1. Web Search Tool**:
```python
class WebSearchTool(Tool):
    name = "web_search"
    description = "Search the web for information"
    parameters = {
        "query": {
            "type": "string",
            "description": "Search query",
            "required": True
        },
        "num_results": {
            "type": "integer",
            "description": "Number of results to return",
            "default": 5
        }
    }
    
    async def execute(self, query: str, num_results: int = 5) -> Dict:
        """Execute web search"""
        # Implementation using SerpAPI, Brave Search, or similar
        results = await self.search_api.search(query, num_results)
        return {
            "results": results,
            "query": query,
            "timestamp": datetime.now()
        }
```

**2. Database Query Tool**:
```python
class DatabaseQueryTool(Tool):
    name = "database_query"
    description = "Query the database for information"
    parameters = {
        "query": {
            "type": "string",
            "description": "SQL-like query (safe subset)",
            "required": True
        },
        "table": {
            "type": "string",
            "description": "Table to query",
            "required": True
        }
    }
    
    async def execute(self, query: str, table: str) -> Dict:
        """Execute database query with safety checks"""
        # Validate query is safe (no DROP, DELETE, etc.)
        # Execute against tenant-isolated database
        # Return results
```

**3. RAG Search Tool**:
```python
class RAGSearchTool(Tool):
    name = "rag_search"
    description = "Search internal knowledge base"
    parameters = {
        "query": {
            "type": "string",
            "description": "Search query",
            "required": True
        },
        "top_k": {
            "type": "integer",
            "description": "Number of results",
            "default": 5
        }
    }
    
    async def execute(self, query: str, top_k: int = 5) -> Dict:
        """Search RAG knowledge base"""
        results = await self.rag_service.search(query, top_k)
        return {
            "results": results,
            "sources": [r['source'] for r in results]
        }
```

**4. Calculator Tool**:
```python
class CalculatorTool(Tool):
    name = "calculator"
    description = "Perform mathematical calculations"
    parameters = {
        "expression": {
            "type": "string",
            "description": "Mathematical expression",
            "required": True
        }
    }
    
    async def execute(self, expression: str) -> Dict:
        """Safely evaluate mathematical expression"""
        # Use safe evaluation (ast.literal_eval or similar)
        result = safe_eval(expression)
        return {
            "expression": expression,
            "result": result
        }
```

**5. API Call Tool**:
```python
class APICallTool(Tool):
    name = "api_call"
    description = "Call external APIs"
    parameters = {
        "url": {
            "type": "string",
            "description": "API endpoint URL",
            "required": True
        },
        "method": {
            "type": "string",
            "description": "HTTP method",
            "enum": ["GET", "POST"],
            "default": "GET"
        },
        "body": {
            "type": "object",
            "description": "Request body for POST"
        }
    }
    
    async def execute(self, url: str, method: str = "GET", body: Dict = None) -> Dict:
        """Make HTTP request"""
        # Validate URL is whitelisted
        # Make request with timeout
        # Return response
```

#### Critical Validations

**1. Tool Registry**:
```python
class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
    
    def register_tool(self, tool: Tool):
        """Register a tool"""
        self.tools[tool.name] = tool
    
    def get_tool(self, name: str) -> Optional[Tool]:
        """Get tool by name"""
        return self.tools.get(name)
    
    def list_tools(self) -> List[Dict]:
        """List all available tools"""
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters
            }
            for tool in self.tools.values()
        ]
```

**Validations**:
- [ ] Tool registry exists and is populated
- [ ] At least 5 tools registered
- [ ] Tools properly inherit from base Tool class
- [ ] Tool registration happens at startup
- [ ] Dynamic tool loading supported

**2. Tool Execution with Error Handling**:
```python
class ToolExecutor:
    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        timeout: int = 30
    ) -> Dict:
        """Execute tool with error handling"""
        tool = self.registry.get_tool(tool_name)
        if not tool:
            raise ValueError(f"Tool not found: {tool_name}")
        
        # Validate parameters
        if not tool.validate_params(**parameters):
            raise ValueError(f"Invalid parameters for {tool_name}")
        
        try:
            # Execute with timeout
            result = await asyncio.wait_for(
                tool.execute(**parameters),
                timeout=timeout
            )
            return {
                "success": True,
                "result": result,
                "tool": tool_name
            }
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": f"Tool execution timed out after {timeout}s",
                "tool": tool_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tool": tool_name
            }
```

**Validations**:
- [ ] Tool execution wrapped in try-except
- [ ] Timeout enforcement
- [ ] Parameter validation before execution
- [ ] Structured error responses
- [ ] Logging of tool execution

**3. Retry Logic**:
```python
class RetryHandler:
    async def execute_with_retry(
        self,
        tool: Tool,
        parameters: Dict,
        max_retries: int = 3,
        backoff_factor: float = 2.0
    ) -> Dict:
        """Execute tool with exponential backoff retry"""
        for attempt in range(max_retries):
            try:
                result = await tool.execute(**parameters)
                return result
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                wait_time = backoff_factor ** attempt
                await asyncio.sleep(wait_time)
                logger.warning(f"Retry {attempt + 1}/{max_retries} after {wait_time}s")
```

**Validations**:
- [ ] Retry logic implemented
- [ ] Exponential backoff strategy
- [ ] Configurable max retries
- [ ] Logging of retries
- [ ] Final exception raised after max retries

**4. LangChain Integration**:
```python
# Convert custom tools to LangChain tools
from langchain.tools import Tool as LangChainTool

def to_langchain_tool(custom_tool: Tool) -> LangChainTool:
    """Convert custom tool to LangChain tool"""
    return LangChainTool(
        name=custom_tool.name,
        description=custom_tool.description,
        func=custom_tool.execute,
        coroutine=custom_tool.execute,  # For async
        args_schema=custom_tool.parameters
    )

# Register with LangChain agent
tools = [to_langchain_tool(tool) for tool in tool_registry.list_tools()]
agent = create_react_agent(llm, tools, prompt)
```

**Validations**:
- [ ] Tools compatible with LangChain
- [ ] Conversion function exists
- [ ] Async execution supported
- [ ] Tools work with ReAct agent
- [ ] Tool descriptions optimized for LLM

**5. Sandboxed Execution** (for code execution tools):
```python
class Sandbox:
    async def execute_code(
        self,
        code: str,
        language: str = "python",
        timeout: int = 10
    ) -> Dict:
        """Execute code in sandboxed environment"""
        # Use Docker container or restricted execution
        # Limit resources (CPU, memory, time)
        # No network access
        # No file system access
        # Return stdout, stderr, result
```

**Validations**:
- [ ] Code execution is sandboxed (if offered)
- [ ] Resource limits enforced
- [ ] No access to host filesystem
- [ ] No network access from sandbox
- [ ] Timeout enforcement

#### Common Issues to Flag

**🔴 CRITICAL (Blockers)**:
- No tools implemented (empty registry)
- Tools return mock/hardcoded results
- No tool execution logic
- No error handling in tool execution
- Tools have direct system access (security risk)

**🟡 HIGH PRIORITY**:
- Less than 5 tools available
- No retry logic for failures
- No timeout handling
- Missing LangChain integration
- No parameter validation
- Tools not async (blocking calls)

**🟢 MEDIUM PRIORITY**:
- Limited tool variety
- No tool usage analytics
- Missing tool documentation
- No sandboxing for code execution
- No rate limiting on external APIs

#### Tool Integration Example

```python
# Example: Using tools in ReAct graph
from langgraph.prebuilt import create_react_agent

# Get tools from registry
tool_registry = ToolRegistry()
tool_registry.register_tool(WebSearchTool())
tool_registry.register_tool(RAGSearchTool())
tool_registry.register_tool(CalculatorTool())
tool_registry.register_tool(DatabaseQueryTool())
tool_registry.register_tool(APICallTool())

# Convert to LangChain tools
langchain_tools = [
    to_langchain_tool(tool) 
    for tool in tool_registry.tools.values()
]

# Create ReAct agent with tools
llm = ChatOpenAI(model="gpt-4")
agent = create_react_agent(llm, langchain_tools)

# Execute with tools
result = await agent.ainvoke({
    "messages": [HumanMessage(content="What are the FDA requirements for glucose monitors?")]
})
```

---

## 🏗️ PART 3: LangGraph/LangChain Architecture

### Overview

The orchestration layer must use **LangGraph** for stateful agent workflows, not just basic LangChain chains.

### Why LangGraph is Required

- ✅ **Stateful Workflows**: Maintain state across multiple steps
- ✅ **Conditional Logic**: Route based on execution results
- ✅ **Checkpoints**: Pause and resume execution (critical for Mode 5)
- ✅ **Multi-Step Reasoning**: ReAct and CoT patterns
- ✅ **Human-in-the-Loop**: Await approvals in workflow
- ✅ **Tool Orchestration**: Manage tool calls in execution loop

### LangGraph vs LangChain

```python
# ❌ INSUFFICIENT: Basic LangChain chain
from langchain.chains import LLMChain

chain = LLMChain(llm=llm, prompt=prompt)
result = await chain.ainvoke({"query": user_query})

# ✅ CORRECT: LangGraph StateGraph
from langgraph.graph import StateGraph

workflow = StateGraph(AgentState)
workflow.add_node("think", think_node)
workflow.add_node("act", act_node)
workflow.add_conditional_edges("think", should_continue)
app = workflow.compile(checkpointer=checkpointer)
```

---

### Critical Components

#### 1. StateGraph Construction

**Expected Pattern**:
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    query: str
    agent_id: Optional[str]
    context: str
    answer: str
    # ... more fields

def create_expert_graph() -> StateGraph:
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("load_agent", load_agent_node)
    workflow.add_node("retrieve_context", retrieve_context_node)
    workflow.add_node("generate_response", generate_response_node)
    
    # Add edges
    workflow.set_entry_point("load_agent")
    workflow.add_edge("load_agent", "retrieve_context")
    workflow.add_edge("retrieve_context", "generate_response")
    workflow.add_edge("generate_response", END)
    
    return workflow.compile()
```

**Validations**:
- [ ] StateGraph imported and instantiated
- [ ] State TypedDict properly defined
- [ ] Nodes registered with `add_node()`
- [ ] Edges defined (entry point, transitions, end)
- [ ] Graph compiled with `compile()`
- [ ] Returns compiled graph

**Files to Check**:
```
📁 graphs/
├── react_graph.py              # ReAct pattern
├── cot_graph.py                # Chain-of-Thought
├── mode_aware_graph.py         # Mode routing
└── agent_workflow.py           # Agent mode (Mode 5)
```

---

#### 2. Node Functions

**Expected Pattern**:
```python
async def think_node(state: AgentState) -> AgentState:
    """
    Reasoning node - analyze situation and decide next action
    """
    # Extract current state
    messages = state["messages"]
    query = state["query"]
    
    # Generate reasoning
    prompt = get_prompt("react_thinking")
    response = await llm.ainvoke(prompt.format(query=query))
    
    # Update state
    return {
        **state,
        "reasoning": response.content,
        "messages": [*messages, AIMessage(content=response.content)]
    }

async def plan_node(state: AgentState) -> AgentState:
    """
    Planning node - create execution plan
    """
    # ... planning logic
    return {**state, "plan": plan}

async def act_node(state: AgentState) -> AgentState:
    """
    Action node - execute tool or generate response
    """
    # ... action logic
    return {**state, "action_result": result}
```

**Required Node Functions** (for ReAct/Agent mode):
- [ ] `think` - Reasoning about the problem
- [ ] `plan` - Creating execution plan
- [ ] `act` - Tool selection and execution
- [ ] `execute_tools` - Tool orchestration
- [ ] `observe` - Result interpretation
- [ ] `reflect` - Self-assessment
- [ ] `synthesize` - Final answer generation

**Validations**:
- [ ] All nodes are async functions
- [ ] Nodes accept state and return updated state
- [ ] State immutability (return new dict)
- [ ] Error handling in nodes
- [ ] Logging of node execution
- [ ] Type hints on parameters and return

---

#### 3. Conditional Edges

**Expected Pattern**:
```python
def should_continue(state: AgentState) -> str:
    """
    Routing function - decide next node based on state
    """
    if state.get("awaiting_checkpoint"):
        return "checkpoint"
    elif state.get("error"):
        return "error_handler"
    elif state.get("reflection") == "finish":
        return "synthesize"
    else:
        return "think"

# Add to graph
workflow.add_conditional_edges(
    "reflect",  # Source node
    should_continue,  # Routing function
    {
        "checkpoint": "await_approval",
        "error_handler": "handle_error",
        "synthesize": "generate_final_answer",
        "think": "think"
    }
)
```

**Validations**:
- [ ] Conditional edges used for branching logic
- [ ] Routing functions return string keys
- [ ] All routing paths defined in mapping
- [ ] DEFAULT or fallback path exists
- [ ] Routing based on state values (not random)

---

#### 4. State Management

**Expected State Structure**:
```python
class ConsultationState(TypedDict):
    # Core
    messages: Annotated[Sequence[BaseMessage], operator.add]
    query: str
    mode: str  # "query_automatic" | "query_manual" | "chat_automatic" | "chat_manual" | "agent"
    
    # Agent Selection
    selected_agent: Optional[Dict]
    agent_id: Optional[str]
    suggested_agents: List[Dict]
    
    # Context
    rag_results: List[Dict]
    context: str
    sources: List[Dict]
    
    # Results
    answer: str
    citations: List[Citation]
    
    # Agent Mode Specific
    goal: Optional[str]
    plan: Optional[Dict]
    current_step: int
    tool_results: List[Dict]
    checkpoints: List[Dict]
    awaiting_checkpoint: bool
    
    # Progress
    status: str  # "planning" | "executing" | "completed" | "failed"
    progress: float  # 0.0 to 1.0
    
    # Metadata
    tenant_id: str
    user_id: str
    session_id: Optional[str]
    cost_used: float
    tokens_used: int
```

**Validations**:
- [ ] Comprehensive state definition
- [ ] Uses TypedDict for type safety
- [ ] Annotated types for list accumulation
- [ ] Optional fields for conditional data
- [ ] Tenant/user isolation fields
- [ ] Mode-specific fields included

---

#### 5. Checkpointer for Agent Mode

**CRITICAL for Mode 5**:
```python
from langgraph.checkpoint.memory import MemorySaver
# OR
from langgraph.checkpoint.postgres import PostgresSaver

# In-memory (development)
checkpointer = MemorySaver()

# Persistent (production)
checkpointer = PostgresSaver(connection_string=db_url)

# Compile with checkpointer
app = workflow.compile(checkpointer=checkpointer)

# Execute with thread_id for resumption
result = await app.ainvoke(
    initial_state,
    config={"configurable": {"thread_id": session_id}}
)

# Resume from checkpoint
result = await app.ainvoke(
    None,  # No new input
    config={"configurable": {"thread_id": session_id}}
)
```

**Validations**:
- [ ] Checkpointer instantiated (MemorySaver or PostgresSaver)
- [ ] Graph compiled with checkpointer parameter
- [ ] thread_id used in config for resumption
- [ ] Checkpoint saving after each node
- [ ] Resumption from checkpoint works

---

#### 6. Streaming Support

**Expected Pattern**:
```python
# Streaming with astream_events
async def stream_agent_execution(query: str, mode: str):
    initial_state = {
        "messages": [HumanMessage(content=query)],
        "query": query,
        "mode": mode,
        # ... other fields
    }
    
    async for event in app.astream_events(initial_state, version="v1"):
        event_type = event["event"]
        
        if event_type == "on_chain_start":
            # Node started
            node_name = event["name"]
            yield {"type": "node_start", "node": node_name}
        
        elif event_type == "on_chain_end":
            # Node completed
            node_name = event["name"]
            output = event["data"]["output"]
            yield {"type": "node_end", "node": node_name, "output": output}
        
        elif event_type == "on_llm_stream":
            # LLM token streaming
            token = event["data"]["chunk"]
            yield {"type": "token", "content": token}
```

**Validations**:
- [ ] astream_events used for streaming
- [ ] Event types properly handled
- [ ] Token streaming for LLM responses
- [ ] Node execution events emitted
- [ ] State updates streamed
- [ ] SSE endpoint for frontend

---

### Common Architecture Issues

**🔴 CRITICAL (Blockers)**:
- Using LangChain chains instead of LangGraph
- No StateGraph implementation
- No checkpointer for Agent mode
- No conditional edges (linear flow only)
- State not properly typed

**🟡 HIGH PRIORITY**:
- Missing node functions (incomplete ReAct)
- No streaming support
- Hardcoded routing (no conditional logic)
- No error handling in nodes
- State mutation instead of immutability

**🟢 MEDIUM PRIORITY**:
- No logging of graph execution
- Missing telemetry/tracing
- No visualization of graph
- Limited state fields
- Documentation incomplete

---

## 🎨 PART 4: Code Quality & Patterns

### Architecture Patterns

#### 1. Dependency Injection

**❌ BAD - Hardcoded Dependencies**:
```python
class AgentSelector:
    def __init__(self):
        self.supabase = create_client(URL, KEY)  # Hardcoded
        self.llm = ChatOpenAI(model="gpt-4")     # Hardcoded
```

**✅ GOOD - Dependency Injection**:
```python
class AgentSelector:
    def __init__(
        self,
        database: SupabaseClient,
        embedding_service: EmbeddingService,
        cache: RedisClient
    ):
        self.database = database
        self.embedding_service = embedding_service
        self.cache = cache
```

**Validations**:
- [ ] Dependencies injected via constructor
- [ ] No hardcoded client initialization
- [ ] Interfaces/protocols for dependencies
- [ ] Easy to mock for testing

#### 2. Configuration Management

**❌ BAD - Hardcoded Values**:
```python
similarity_threshold = 0.7  # Hardcoded
top_k = 5                   # Hardcoded
temperature = 0.7           # Hardcoded
```

**✅ GOOD - Configuration Object**:
```python
@dataclass
class AgentSelectorConfig:
    similarity_threshold: float = 0.7
    top_k: int = 5
    min_confidence: float = 0.5

config = AgentSelectorConfig()
selector = AgentSelector(database, config)
```

**Validations**:
- [ ] Configuration classes/objects
- [ ] Environment variable support
- [ ] Config validation on load
- [ ] No magic numbers in code

#### 3. Error Handling

**❌ BAD - No Error Handling**:
```python
async def get_agent(agent_id: UUID) -> Agent:
    result = await db.query(agent_id)
    return Agent(**result[0])  # Can crash!
```

**✅ GOOD - Proper Error Handling**:
```python
async def get_agent(agent_id: UUID) -> Optional[Agent]:
    try:
        result = await db.query(agent_id)
        if not result:
            logger.warning(f"Agent not found: {agent_id}")
            return None
        return Agent(**result[0])
    except DatabaseError as e:
        logger.error(f"Database error fetching agent: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
```

**Validations**:
- [ ] Try-except blocks around external calls
- [ ] Specific exception types
- [ ] Logging of errors
- [ ] Graceful degradation where possible
- [ ] Error messages are informative

#### 4. Async Patterns

**❌ BAD - Blocking Calls**:
```python
def get_agent(agent_id: UUID) -> Agent:
    result = db.query(agent_id)  # Blocks event loop!
    return result
```

**✅ GOOD - Async/Await**:
```python
async def get_agent(agent_id: UUID) -> Agent:
    result = await db.query(agent_id)
    return result

# Concurrent execution
agents = await asyncio.gather(
    get_agent(id1),
    get_agent(id2),
    get_agent(id3)
)
```

**Validations**:
- [ ] Async functions throughout
- [ ] await on I/O operations
- [ ] No blocking calls in async context
- [ ] Concurrent execution where appropriate
- [ ] Proper event loop handling

#### 5. Type Safety

**❌ BAD - No Type Hints**:
```python
def select_agent(query, tenant_id):
    # What are the types???
    return agent
```

**✅ GOOD - Full Type Hints**:
```python
async def select_agent(
    query: str,
    tenant_id: UUID,
    min_confidence: float = 0.5
) -> Optional[Tuple[Agent, float]]:
    """
    Select best agent for query
    
    Args:
        query: User query string
        tenant_id: Tenant UUID
        min_confidence: Minimum confidence threshold
        
    Returns:
        Tuple of (agent, confidence) or None if no match
    """
    # Implementation
```

**Validations**:
- [ ] Type hints on all functions
- [ ] Return type annotations
- [ ] Generic types (List, Dict, Optional)
- [ ] TypedDict for structured data
- [ ] mypy or similar type checker passes

#### 6. Logging

**❌ BAD - Print Statements**:
```python
print("Agent selected:", agent.name)  # Bad!
```

**✅ GOOD - Structured Logging**:
```python
import logging

logger = logging.getLogger(__name__)

logger.info(
    "Agent selected",
    extra={
        "agent_id": str(agent.id),
        "agent_name": agent.name,
        "confidence": confidence,
        "tenant_id": str(tenant_id)
    }
)
```

**Validations**:
- [ ] logging module used (not print)
- [ ] Appropriate log levels (DEBUG, INFO, WARNING, ERROR)
- [ ] Structured logging with context
- [ ] Sensitive data not logged (API keys, etc.)
- [ ] Log aggregation configured (production)

---

### Integration Patterns

#### 1. Database Connections

**Validations**:
- [ ] Connection pooling configured
- [ ] Connections properly closed
- [ ] Retry logic for transient failures
- [ ] Timeout configuration
- [ ] Connection health checks

#### 2. External API Calls

**Validations**:
- [ ] Timeout on all HTTP requests
- [ ] Retry with exponential backoff
- [ ] Rate limiting respected
- [ ] Error handling for API failures
- [ ] API keys from environment/config

#### 3. Cache Usage

**Validations**:
- [ ] Cache-aside pattern implemented
- [ ] TTL configured appropriately
- [ ] Cache invalidation on updates
- [ ] Graceful fallback on cache miss
- [ ] Cache key namespacing by tenant

---

### Security Patterns

#### 1. Multi-Tenant Isolation

**CRITICAL**:
```python
# ✅ ALWAYS filter by tenant_id
async def get_agents(tenant_id: UUID) -> List[Agent]:
    return await db.query(
        "SELECT * FROM agents WHERE tenant_id = $1",
        tenant_id
    )

# ❌ NEVER query without tenant filter
async def get_agents() -> List[Agent]:
    return await db.query("SELECT * FROM agents")  # SECURITY RISK!
```

**Validations**:
- [ ] ALL database queries filter by tenant_id
- [ ] Tenant_id validated in API layer
- [ ] Row Level Security (RLS) policies enabled
- [ ] No cross-tenant data access possible
- [ ] Audit logging of tenant access

#### 2. Input Validation

**Validations**:
- [ ] User input sanitized
- [ ] SQL injection prevention
- [ ] NoSQL injection prevention
- [ ] Path traversal prevention
- [ ] XSS prevention in outputs

#### 3. Authentication & Authorization

**Validations**:
- [ ] JWT token validation
- [ ] Role-based access control (RBAC)
- [ ] API key rotation support
- [ ] Rate limiting per tenant/user
- [ ] Audit logging of auth failures

---

## 📊 AUDIT DELIVERABLES

Your comprehensive audit report should include:

### 1. Executive Summary (1 page)

```
# VITAL Backend Audit: Executive Summary

**Overall Score**: __/100

**Production Readiness**: 
[ ] Ready  [ ] Partially Ready  [ ] Not Ready

**Critical Findings**:
- Critical Blockers: __ issues
- High Priority: __ issues
- Medium Priority: __ issues

**Key Strengths**:
1. ...
2. ...
3. ...

**Critical Gaps**:
1. ...
2. ...
3. ...

**Recommended Actions**:
Week 1 (Critical): ...
Week 2 (High): ...
Week 3 (Medium): ...

**Estimated Remediation**: __ weeks with __ developers

**Business Impact**:
- Risk Level: High / Medium / Low
- Launch Readiness: ___%
- User Impact: ...
```

---

### 2. Service Health Dashboard

Visual status for all services:

```
SERVICE STATUS DASHBOARD
========================

Core Business Logic:
  Mode 1 (Query-Auto)  : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Mode 2 (Query-Manual): [✅ Complete] [⚠️ Partial] [❌ Missing]
  Mode 3 (Chat-Auto)   : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Mode 4 (Chat-Manual) : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Mode 5 (Agent) 🚨    : [✅ Complete] [⚠️ Partial] [❌ Missing]

Shared Services:
  Agent Registry       : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Prompt Library       : [✅ Complete] [⚠️ Partial] [❌ Missing]
  RAG Service          : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Capability Manager   : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Tool Registry        : [✅ Complete] [⚠️ Partial] [❌ Missing]

Architecture:
  LangGraph Integration: [✅ Complete] [⚠️ Partial] [❌ Missing]
  StateGraph Patterns  : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Checkpointing        : [✅ Complete] [⚠️ Partial] [❌ Missing]
  Streaming            : [✅ Complete] [⚠️ Partial] [❌ Missing]

Integration:
  Database (Supabase)  : [✅ Real] [⚠️ Partial] [❌ Mock]
  Vector Search        : [✅ Real] [⚠️ Partial] [❌ Mock]
  Embeddings           : [✅ Real] [⚠️ Partial] [❌ Mock]
  Tools                : [✅ Real] [⚠️ Partial] [❌ Mock]

Code Quality:
  Type Safety          : Score: __/10
  Error Handling       : Score: __/10
  Async Patterns       : Score: __/10
  Multi-Tenant Security: Score: __/10
  
Overall Health: [🟢 Healthy] [🟡 Needs Work] [🔴 Critical Issues]
```

---

### 3. Mode Implementation Matrix

Detailed analysis per mode:

| Mode | Status | LangGraph | Services Used | Missing Components | Severity | Est. Fix |
|------|--------|-----------|---------------|-------------------|----------|----------|
| Mode 1: Query-Auto | ✅/⚠️/❌ | ✅/⚠️/❌ | Agent Registry, RAG, Prompts | List missing items | 🔴/🟡/🟢 | X days |
| Mode 2: Query-Manual | ✅/⚠️/❌ | ✅/⚠️/❌ | Agent Registry, Prompts | List missing items | 🔴/🟡/🟢 | X days |
| Mode 3: Chat-Auto | ✅/⚠️/❌ | ✅/⚠️/❌ | Agent Registry, RAG, Memory | List missing items | 🔴/🟡/🟢 | X days |
| Mode 4: Chat-Manual | ✅/⚠️/❌ | ✅/⚠️/❌ | Agent Registry, Memory | List missing items | 🔴/🟡/🟢 | X days |
| Mode 5: Agent 🚨 | ✅/⚠️/❌ | ✅/⚠️/❌ | All + Tools + Checkpoints | List missing items | 🔴/🟡/🟢 | X days |

**For each mode, provide**:
- Current implementation status
- LangGraph integration quality
- Which services are properly connected
- What's missing or broken
- Severity of issues
- Estimated fix time

---

### 4. Critical Issues Matrix

Prioritized issues with actionable details:

| # | Issue Description | Severity | Service/Mode | Impact | File/Location | Fix Effort | Priority |
|---|------------------|----------|--------------|--------|---------------|------------|----------|
| 1 | Mode 5 completely missing | 🔴 Critical | Agent Mode | Cannot execute autonomous tasks | N/A | 40 hours | P0 |
| 2 | Agent Registry returns mock data | 🔴 Critical | Agent Registry | All modes broken | agent_store.py:45 | 8 hours | P0 |
| 3 | No vector search in RAG | 🔴 Critical | RAG Service | Poor context quality | rag_service.py:120 | 16 hours | P0 |
| 4 | Missing checkpoint system | 🟡 High | Agent Mode | Cannot resume execution | N/A | 24 hours | P1 |
| 5 | No tenant isolation in queries | 🔴 Critical | All Services | SECURITY RISK | Multiple files | 4 hours | P0 |
| ... | ... | ... | ... | ... | ... | ... | ... |

---

### 5. Service Integration Map

Visual representation:

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE INTEGRATION MAP                   │
└─────────────────────────────────────────────────────────────┘

Ask Expert Modes
├─ Mode 1 (Query-Auto)
│  ├─✅ Agent Registry [CONNECTED]
│  ├─⚠️ RAG Service [PARTIAL - No vector search]
│  └─✅ Prompt Library [CONNECTED]
│
├─ Mode 2 (Query-Manual)
│  ├─❌ Agent Registry [MOCK DATA]
│  └─✅ Prompt Library [CONNECTED]
│
├─ Mode 3 (Chat-Auto)
│  ├─✅ Agent Registry [CONNECTED]
│  ├─⚠️ RAG Service [PARTIAL]
│  ├─❌ Memory Manager [MISSING]
│  └─✅ Prompt Library [CONNECTED]
│
├─ Mode 4 (Chat-Manual)
│  ├─✅ Agent Registry [CONNECTED]
│  ├─❌ Memory Manager [MISSING]
│  └─✅ Prompt Library [CONNECTED]
│
└─ Mode 5 (Agent) 🚨
   ├─❌ Agent Mode Handler [MISSING ENTIRELY]
   ├─❌ Checkpoint Manager [MISSING]
   ├─❌ Tool Orchestrator [MISSING]
   └─❌ Planning Engine [MISSING]

Shared Services Status
├─ Agent Registry      : ⚠️ PARTIAL (Mock data in places)
├─ Prompt Library      : ✅ COMPLETE
├─ RAG Service         : ⚠️ PARTIAL (No vector search)
├─ Capability Manager  : ❌ MISSING
└─ Tool Registry       : ❌ MISSING

Database Integration
├─ Supabase Connection : ✅ WORKING
├─ pgvector Extension  : ❌ NOT ENABLED
├─ RLS Policies        : ⚠️ PARTIAL
└─ Multi-Tenant Filter : ❌ MISSING IN QUERIES

Legend:
✅ Fully Implemented & Working
⚠️ Partially Implemented / Needs Work
❌ Missing or Broken
🚨 Critical Component
```

---

### 6. Actionable Roadmap

Week-by-week remediation plan:

```
REMEDIATION ROADMAP
===================

WEEK 1: CRITICAL BLOCKERS (P0) - 40 hours
─────────────────────────────────────────
Day 1-2: Agent Mode Foundation (16 hours)
  [ ] Create agent_mode.py with basic structure
  [ ] Implement goal parser
  [ ] Implement task decomposer
  [ ] Create agent state definition
  Files: modes/agent_mode.py, planning/

Day 3: Checkpoint System (8 hours)
  [ ] Create checkpoint manager
  [ ] Implement checkpoint types
  [ ] Add approval workflow stubs
  Files: checkpoint/checkpoint_manager.py

Day 4: Fix Agent Registry (8 hours)
  [ ] Replace mock data with real DB queries
  [ ] Add tenant isolation to all queries
  [ ] Test agent selection
  Files: agent_registry/services/agent_store.py

Day 5: Fix RAG Service (8 hours)
  [ ] Enable pgvector extension
  [ ] Implement vector similarity search
  [ ] Add embedding generation
  Files: rag_service/storage/vector_store.py


WEEK 2: HIGH PRIORITY (P1) - 40 hours
──────────────────────────────────────
Day 1-2: Tool Registry (16 hours)
  [ ] Implement 5 core tools
  [ ] Add tool execution framework
  [ ] LangChain integration
  Files: tool_registry/

Day 3: Mode Integration (8 hours)
  [ ] Integrate agent mode with orchestrator
  [ ] Update mode router
  [ ] Add API endpoints
  Files: orchestration/mode_manager.py, routes/

Day 4: Memory Manager (8 hours)
  [ ] Implement conversation state
  [ ] Add memory persistence
  [ ] Context window management
  Files: memory/conversation_memory.py

Day 5: Testing & Integration (8 hours)
  [ ] End-to-end testing of all modes
  [ ] Integration tests
  [ ] Fix critical bugs


WEEK 3: MEDIUM PRIORITY (P2) - 40 hours
────────────────────────────────────────
Day 1-2: Capability Manager (16 hours)
  [ ] Define capability taxonomy
  [ ] Agent-capability mapping
  [ ] Matching algorithms
  Files: capability_manager/

Day 3: Prompt Library Enhancement (8 hours)
  [ ] Add all mode-specific prompts
  [ ] Variable resolution
  [ ] Version management
  Files: prompt_library/

Day 4: Code Quality (8 hours)
  [ ] Add type hints throughout
  [ ] Improve error handling
  [ ] Add logging
  Files: Multiple

Day 5: Documentation & Deployment (8 hours)
  [ ] Update technical documentation
  [ ] Deployment guide
  [ ] Monitoring setup


TOTAL ESTIMATED EFFORT: 120 hours (3 weeks, 1 developer)
Or: 60 hours (1.5 weeks, 2 developers)
```

---

### 7. Code Examples

For top 10 critical issues, provide:

#### Issue #1: Agent Mode Missing

**Current State**:
```python
# modes/ directory
# ❌ NO agent_mode.py file exists
```

**Problem**:
Mode 5 (Agent) is completely missing from the implementation. This is the most sophisticated mode and is critical for autonomous task execution.

**Recommended Fix**:
```python
# Create: modes/agent_mode.py

from typing import Optional, Dict, Any
from uuid import UUID
from dataclasses import dataclass
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

@dataclass
class AgentModeHandler:
    """Handler for Agent Mode (Mode 5) - Autonomous Execution"""
    
    def __init__(
        self,
        agent_registry: AgentRegistry,
        tool_registry: ToolRegistry,
        rag_service: RAGService,
        checkpoint_manager: CheckpointManager
    ):
        self.agent_registry = agent_registry
        self.tool_registry = tool_registry
        self.rag_service = rag_service
        self.checkpoint_manager = checkpoint_manager
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build LangGraph workflow for agent mode"""
        workflow = StateGraph(AgentState)
        
        # Planning phase
        workflow.add_node("parse_goal", self.parse_goal_node)
        workflow.add_node("decompose_tasks", self.decompose_tasks_node)
        workflow.add_node("create_plan", self.create_plan_node)
        workflow.add_node("checkpoint_plan", self.checkpoint_plan_node)
        
        # Execution phase
        workflow.add_node("select_action", self.select_action_node)
        workflow.add_node("execute_action", self.execute_action_node)
        workflow.add_node("observe_result", self.observe_result_node)
        workflow.add_node("reflect", self.reflect_node)
        
        # Final phase
        workflow.add_node("synthesize", self.synthesize_node)
        
        # Edges
        workflow.set_entry_point("parse_goal")
        workflow.add_edge("parse_goal", "decompose_tasks")
        workflow.add_edge("decompose_tasks", "create_plan")
        workflow.add_edge("create_plan", "checkpoint_plan")
        
        workflow.add_conditional_edges(
            "checkpoint_plan",
            self.check_plan_approval,
            {
                "approved": "select_action",
                "rejected": "create_plan",
                "waiting": END
            }
        )
        
        workflow.add_edge("select_action", "execute_action")
        workflow.add_edge("execute_action", "observe_result")
        workflow.add_edge("observe_result", "reflect")
        
        workflow.add_conditional_edges(
            "reflect",
            self.should_continue,
            {
                "continue": "select_action",
                "checkpoint": "checkpoint_decision",
                "finish": "synthesize"
            }
        )
        
        workflow.add_edge("synthesize", END)
        
        # Compile with checkpointer
        checkpointer = MemorySaver()
        return workflow.compile(checkpointer=checkpointer)
    
    async def execute(
        self,
        goal: str,
        tenant_id: UUID,
        user_id: UUID
    ) -> Dict[str, Any]:
        """Execute agent mode workflow"""
        initial_state = {
            "goal": goal,
            "tenant_id": str(tenant_id),
            "user_id": str(user_id),
            "status": "planning",
            "progress": 0.0,
            # ... more fields
        }
        
        session_id = str(uuid4())
        config = {"configurable": {"thread_id": session_id}}
        
        result = await self.workflow.ainvoke(initial_state, config)
        return result
    
    # Node functions would be implemented here...
    async def parse_goal_node(self, state: AgentState) -> AgentState:
        """Parse user goal and extract objectives"""
        # Implementation...
        pass
    
    async def decompose_tasks_node(self, state: AgentState) -> AgentState:
        """Decompose goal into executable tasks"""
        # Implementation...
        pass
    
    # ... more node functions
```

**Files to Create**:
- `modes/agent_mode.py` (main handler)
- `planning/goal_parser.py` (goal understanding)
- `planning/task_decomposer.py` (task breakdown)
- `checkpoint/checkpoint_manager.py` (human approvals)

**Estimated Effort**: 40 hours (5 days)

---

[Continue with Issues #2-10 in same format]

---

## 🔬 ANALYSIS METHODOLOGY

Follow this systematic approach:

### Phase 1: Service Discovery (30 minutes)

**Steps**:
1. List all directories under `backend/python-ai-services/`
2. Identify which services exist vs documented
3. Check for placeholder/mock files
4. Map directory structure to expected architecture

**Deliverable**: Service inventory list

---

### Phase 2: Core Modes Validation (60 minutes)

**Steps**:
1. Check for files: `modes/query_automatic.py`, `query_manual.py`, `chat_automatic.py`, `chat_manual.py`, **`agent_mode.py`**
2. For each mode found, check:
   - [ ] Has handler class/function
   - [ ] Integrates with services
   - [ ] Has tests
3. **CRITICAL**: Verify Mode 5 (Agent) exists and has:
   - [ ] Goal parsing
   - [ ] Task decomposition
   - [ ] Checkpoint system
   - [ ] Tool orchestration
   - [ ] LangGraph workflow

**Deliverable**: Mode implementation matrix

---

### Phase 3: Service Deep Dive (90 minutes)

**For each shared service**:

1. **Agent Registry** (20 min):
   - Check database integration
   - Verify vector search
   - Test agent selection
   - Validate caching

2. **Prompt Library** (15 min):
   - Count templates (need 10+)
   - Check variable resolution
   - Verify versioning

3. **RAG Service** (25 min):
   - Check pgvector integration
   - Test vector search query
   - Verify embedding generation
   - Check caching

4. **Capability Manager** (15 min):
   - Check capability definitions
   - Verify matching logic
   - Test agent-capability mapping

5. **Tool Registry** (15 min):
   - Count tools (need 5+)
   - Test tool execution
   - Check error handling

**Deliverable**: Service health dashboard

---

### Phase 4: Integration Analysis (60 minutes)

**Steps**:
1. Trace a request through Mode 1:
   - API endpoint → Mode handler → Agent selector → RAG → Prompt → LLM
2. Identify integration points
3. Check for mock/placeholder connections
4. Verify multi-tenant isolation
5. Test data flow

**Deliverable**: Integration map

---

### Phase 5: Code Quality Review (60 minutes)

**Check**:
1. Architecture patterns (DI, config, etc.)
2. Error handling coverage
3. Type hints completeness
4. Async patterns correctness
5. Security (tenant isolation, input validation)
6. Testing coverage

**Deliverable**: Code quality assessment

---

## ✅ SUCCESS CRITERIA

The audit definitively answers:

### Core Functionality
- ✅ Are all 5 Ask Expert modes fully implemented?
- ✅ Is Mode 5 (Agent) present with checkpoints and tools?
- ✅ Does LangGraph orchestrate workflows (not just LangChain)?

### Shared Services
- ✅ Are all 5 shared services implemented (not mock)?
- ✅ Is Agent Registry connected to real database with vector search?
- ✅ Is RAG service functional with pgvector and embeddings?
- ✅ Is Prompt Library properly integrated with templates?
- ✅ Are Tool Registry tools real and executable?
- ✅ Is Capability Manager defining and matching capabilities?

### Architecture & Quality
- ✅ Is LangGraph properly used for state management?
- ✅ Are integrations complete (not placeholder)?
- ✅ Is multi-tenant isolation enforced everywhere?
- ✅ Is code production-ready (error handling, types, logging)?

### Timeline & Planning
- ✅ What's the realistic timeline to production readiness?
- ✅ What are the critical blockers?
- ✅ What's the estimated effort to fix issues?

---

## 📋 OUTPUT FORMAT GUIDELINES

### Structure Your Audit Report

```
VITAL Backend Audit Report
==========================

1. EXECUTIVE SUMMARY (1 page)
   - Overall score and readiness
   - Key findings summary
   - Critical recommendations
   - Timeline estimate

2. SERVICE HEALTH DASHBOARD (1 page)
   - Visual status indicators
   - Service-by-service health
   - Integration status

3. MODE IMPLEMENTATION MATRIX (2 pages)
   - Detailed mode analysis
   - LangGraph integration quality
   - Service dependencies
   - Missing components

4. CRITICAL ISSUES MATRIX (2-3 pages)
   - Prioritized issue list
   - Severity, impact, location
   - Fix effort estimates
   - Priority assignments

5. SERVICE INTEGRATION MAP (1 page)
   - Visual service connections
   - Integration completeness
   - Data flow diagram

6. ACTIONABLE ROADMAP (2 pages)
   - Week-by-week plan
   - Specific tasks with estimates
   - Resource requirements
   - Dependencies

7. CODE EXAMPLES (5-10 pages)
   - Top 10 critical issues
   - Current state
   - Problem explanation
   - Recommended fix with code
   - Files to create/modify

8. APPENDICES
   - Full file inventory
   - Database schema review
   - Configuration checklist
   - Testing recommendations
```

### Use Clear Visual Indicators

- ✅ Implemented correctly and working
- ⚠️ Partially implemented / needs work
- ❌ Missing or broken
- 🚨 Critical component (high priority)
- 🔴 Critical severity (immediate action)
- 🟡 High priority (urgent)
- 🟢 Medium priority (important)

### Be Specific and Actionable

**❌ BAD - Vague**:
"The Agent Mode needs work."

**✅ GOOD - Specific**:
"Mode 5 (Agent) is completely missing. No `agent_mode.py` file exists. This requires creating: (1) Agent mode handler with LangGraph workflow, (2) Goal parser, (3) Task decomposer, (4) Checkpoint manager, (5) Tool orchestrator. Estimated effort: 40 hours across 5 files."

### Include Code References

Always provide:
- Exact file paths
- Line numbers if relevant
- Current code (if exists)
- Recommended fix
- Explanation of why it's wrong

---

## 🎯 BEGIN YOUR AUDIT

You now have complete instructions to conduct a thorough audit of the VITAL Python backend.

**Start by**:
1. Exploring the directory structure
2. Checking if Mode 5 exists (critical!)
3. Testing one service integration (Agent Registry recommended)
4. Following the systematic methodology above
5. Creating comprehensive deliverables

**Remember**:
- Be thorough but efficient
- Provide actionable recommendations
- Include code examples
- Give realistic timelines
- Prioritize critical issues

**Your audit should enable the development team to**:
- Understand exactly what's missing
- Know what to fix first
- Have code examples to follow
- Estimate effort accurately
- Track progress systematically

---

**Good luck with your audit! Be systematic, thorough, and actionable.** 🚀
