# Agent Orchestration Visual Guide

**Purpose**: Visual diagrams and flowcharts for agent orchestration architecture

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │
│  │ Agent         │  │ Agent Pool    │  │ Chat          │          │
│  │ Selector UI   │  │ Browser       │  │ Interface     │          │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘          │
│          │                  │                  │                    │
│          │ selected_agent_id│                  │ query              │
│          └──────────────────┴──────────────────┘                    │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
                    POST /api/ask-expert/orchestrate
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                    BACKEND (Python LangGraph)                       │
├─────────────────────────────┼───────────────────────────────────────┤
│                             │                                       │
│  ┌──────────────────────────▼─────────────────────────┐            │
│  │           UnifiedAgentLoader                       │            │
│  │  ┌──────────────────────────────────────────┐     │            │
│  │  │ load_agent_by_id(agent_id, tenant_id)   │     │            │
│  │  │   ↓                                       │     │            │
│  │  │ Query Supabase agents table             │     │            │
│  │  │   ↓                                       │     │            │
│  │  │ Validate tenant access (RLS)            │     │            │
│  │  │   ↓                                       │     │            │
│  │  │ Build AgentProfile                      │     │            │
│  │  │   ↓                                       │     │            │
│  │  │ Load sub_agent_pool (if any)            │     │            │
│  │  │   ↓                                       │     │            │
│  │  │ Return AgentProfile                     │     │            │
│  │  └──────────────────────────────────────────┘     │            │
│  └────────────────────────────────────────────────────┘            │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────┐           │
│  │             LangGraph Workflow                      │           │
│  │  ┌──────────────────────────────────────────┐      │           │
│  │  │ START                                     │      │           │
│  │  │   ↓                                       │      │           │
│  │  │ load_agent (inject AgentProfile)         │      │           │
│  │  │   ↓                                       │      │           │
│  │  │ load_context (conversation history)      │      │           │
│  │  │   ↓                                       │      │           │
│  │  │ update_context (RAG retrieval)           │      │           │
│  │  │   ↓                                       │      │           │
│  │  │ agent_reasoning (CoT analysis)           │      │           │
│  │  │   ↓                                       │      │           │
│  │  │ spawn_specialists? ──yes──►              │      │           │
│  │  │   │                          SubAgentSpawner    │           │
│  │  │   no                         │                  │           │
│  │  │   ↓                          │                  │           │
│  │  │ execute_tools? ──yes──► ToolRegistry           │           │
│  │  │   │                                             │           │
│  │  │   no                                            │           │
│  │  │   ↓                                             │           │
│  │  │ generate_response (LLM with context)           │           │
│  │  │   ↓                                             │           │
│  │  │ update_memory (persist to DB)                  │           │
│  │  │   ↓                                             │           │
│  │  │ END                                             │           │
│  │  └──────────────────────────────────────────┘      │           │
│  └─────────────────────────────────────────────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase/PostgreSQL)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   agents    │  │   sessions   │  │   messages   │              │
│  │             │  │              │  │              │              │
│  │ - id        │  │ - session_id │  │ - message_id │              │
│  │ - name      │  │ - agent_id   │  │ - session_id │              │
│  │ - tenant_id │  │ - user_id    │  │ - agent_id   │              │
│  │ - metadata  │  │ - state      │  │ - content    │              │
│  └─────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Loading Flow

```
User Selects Agent "FDA 510(k) Expert"
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: POST /api/ask-expert/orchestrate             │
│  {                                                       │
│    "agent_selection": {                                 │
│      "selected_agent_id": "uuid-fda-510k-expert"       │
│    }                                                     │
│  }                                                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Backend: UnifiedAgentLoader.load_agent_by_id()         │
│                                                          │
│  Step 1: Query Database                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ SELECT * FROM agents                            │    │
│  │ WHERE id = 'uuid-fda-510k-expert'              │    │
│  │   AND status IN ('active', 'testing')          │    │
│  │   AND tenant_id IN ('platform', 'user-tenant') │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 2: Validate Access                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ if agent.tenant_id != user.tenant_id:          │    │
│  │   if agent.tenant_id != 'platform':            │    │
│  │     raise AgentLoadError("Not accessible")     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 3: Parse Metadata                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ metadata = agent.metadata (JSONB)              │    │
│  │ knowledge_base_ids = metadata['knowledge_...'] │    │
│  │ sub_agents = metadata['sub_agents']            │    │
│  │ domain = metadata['domain_expertise']          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 4: Build AgentProfile                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │ profile = AgentProfile(                        │    │
│  │   id=agent.id,                                 │    │
│  │   display_name=metadata['display_name'],       │    │
│  │   system_prompt=agent.system_prompt,           │    │
│  │   model=metadata['model'],                     │    │
│  │   capabilities=agent.specializations,          │    │
│  │   knowledge_base_ids=...,                      │    │
│  │   sub_agent_pool=...                           │    │
│  │ )                                               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 5: Load Sub-Agents (if any)                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ for sub_agent_id in profile.sub_agent_pool:    │    │
│  │   sub_agent = load_agent_by_id(sub_agent_id)  │    │
│  │   sub_agents.append(sub_agent)                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Return to Workflow                                      │
│                                                          │
│  state["agent"] = profile.dict()                         │
│  state["agent_persona_message"] = SystemMessage(...)    │
│  state["sub_agent_pool"] = [sa.dict() for sa in ...]    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Automatic Agent Selection Flow (Mode 2)

```
User Asks: "What are the FDA requirements for my device?"
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: POST /api/ask-expert/orchestrate             │
│  {                                                       │
│    "agent_selection": {                                 │
│      "auto_select": true,                               │
│      "preferred_domain": "regulatory"                   │
│    }                                                     │
│  }                                                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Backend: AgentPoolManager.get_agent_for_domain_auto()  │
│                                                          │
│  Step 1: Get Available Agents                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ SELECT id FROM agents                           │    │
│  │ WHERE status = 'active'                         │    │
│  │   AND (tenant_id = 'platform'                   │    │
│  │        OR tenant_id = 'user-tenant')            │    │
│  │   AND metadata->>'domain_expertise' =           │    │
│  │       'regulatory'                              │    │
│  │ ORDER BY metadata->>'priority' DESC             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Result: [agent1, agent2, agent3, ...]                  │
│                                                          │
│  Step 2: Score Each Agent                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │ for agent in available_agents:                  │    │
│  │   score = 0.0                                   │    │
│  │                                                 │    │
│  │   # Check capability matches                   │    │
│  │   if "FDA" in query and "FDA" in               │    │
│  │      agent.capabilities:                       │    │
│  │     score += 0.3                               │    │
│  │                                                 │    │
│  │   # Check domain keywords                      │    │
│  │   if "requirements" in query and               │    │
│  │      "regulatory" in agent.domain:             │    │
│  │     score += 0.4                               │    │
│  │                                                 │    │
│  │   # Tier bonus                                 │    │
│  │   if agent.tier == 1: score += 0.2            │    │
│  │                                                 │    │
│  │   scored_agents.append((agent, score))        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 3: Sort and Select                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ scored_agents.sort(key=lambda x: x[1],         │    │
│  │                    reverse=True)                │    │
│  │                                                 │    │
│  │ Results:                                        │    │
│  │   1. FDA 510(k) Expert      : 0.95             │    │
│  │   2. Regulatory Strategist  : 0.72             │    │
│  │   3. General Regulatory     : 0.51             │    │
│  │                                                 │    │
│  │ best_agent = scored_agents[0][0]               │    │
│  │ confidence = scored_agents[0][1]               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Return Selected Agent                                   │
│                                                          │
│  state["selected_agent_id"] = best_agent.id              │
│  state["agent"] = best_agent.dict()                      │
│  state["agent_selection_confidence"] = 0.95              │
│  state["agent_selection_reasoning"] =                    │
│    "Selected based on FDA expertise and regulatory..."   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Sub-Agent Spawning Flow

```
Agent Reasoning: "Query requires specialist knowledge"
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  Workflow State                                          │
│  {                                                       │
│    "agent": {                                            │
│      "display_name": "FDA 510(k) Expert",               │
│      "sub_agent_pool": [                                │
│        "predicate_search_specialist_uuid",              │
│        "testing_requirements_specialist_uuid"           │
│      ]                                                   │
│    },                                                    │
│    "needs_specialists": true,                           │
│    "specialists_to_spawn": [                            │
│      "predicate_search_specialist"                      │
│    ]                                                     │
│  }                                                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Node: spawn_specialists                                 │
│                                                          │
│  Step 1: Load Sub-Agent Profiles                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │ for specialist_name in specialists_to_spawn:    │    │
│  │   # Find in pre-loaded pool                     │    │
│  │   specialist = next(                            │    │
│  │     sa for sa in state["sub_agent_pool"]        │    │
│  │     if sa["name"] == specialist_name            │    │
│  │   )                                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 2: Spawn Sub-Agent                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ sub_agent_spawner.spawn_specialist(             │    │
│  │   parent_agent_id=agent.id,                     │    │
│  │   task="Find 510(k) predicates",                │    │
│  │   specialty="Predicate Search",                 │    │
│  │   context={                                      │    │
│  │     "query": state["current_message"],          │    │
│  │     "rag_context": state["rag_context"]         │    │
│  │   },                                             │    │
│  │   model=specialist["model"]                     │    │
│  │ )                                                │    │
│  │                                                 │    │
│  │ Returns: sub_agent_id = "specialist_xyz_123"   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 3: Execute Sub-Agent                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ # Build specialist-specific prompt              │    │
│  │ specialist_llm = ChatOpenAI(                    │    │
│  │   model=specialist["model"]                     │    │
│  │ )                                                │    │
│  │                                                 │    │
│  │ messages = [                                     │    │
│  │   SystemMessage(specialist.system_prompt),      │    │
│  │   HumanMessage(task)                            │    │
│  │ ]                                                │    │
│  │                                                 │    │
│  │ result = await specialist_llm.ainvoke(messages) │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Step 4: Collect Results                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ specialist_results.append({                     │    │
│  │   "sub_agent_id": sub_agent_id,                 │    │
│  │   "specialty": "Predicate Search",              │    │
│  │   "result": result.content,                     │    │
│  │   "confidence": 0.87                            │    │
│  │ })                                               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Update Workflow State                                   │
│                                                          │
│  state["spawned_specialist_ids"] = [sub_agent_id]       │
│  state["specialist_results"] = [result_dict]            │
│                                                          │
│  Next: Proceed to generate_response with specialist     │
│        results included in context                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Mode1State                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Session Context                                        │
│  ├── session_id: "uuid"                                 │
│  ├── user_id: "uuid"                                    │
│  └── tenant_id: "uuid" ◄─────────── Golden Rule #3     │
│                                                         │
│  Agent Selection                                        │
│  ├── selected_agent_id: "uuid" ◄──── From frontend     │
│  ├── agent: AgentProfile ◄────────── Loaded by loader  │
│  │   ├── display_name                                   │
│  │   ├── system_prompt                                  │
│  │   ├── model                                          │
│  │   ├── capabilities[]                                 │
│  │   └── sub_agent_pool[]                               │
│  └── agent_persona_message: SystemMessage               │
│                                                         │
│  Conversation                                           │
│  ├── messages[] ◄───────────────────── LangChain msgs   │
│  ├── current_message: "query"                           │
│  └── conversation_history[] ◄────────── From DB         │
│                                                         │
│  Context                                                │
│  ├── rag_context[] ◄────────────────── RAG retrieval   │
│  └── context_window: "summary"                          │
│                                                         │
│  Sub-Agent Orchestration                                │
│  ├── needs_specialists: bool                            │
│  ├── specialists_to_spawn[] ◄───────── Agent reasoning  │
│  ├── spawned_specialist_ids[] ◄─────── After spawning  │
│  └── specialist_results[] ◄─────────── Specialist exec  │
│                                                         │
│  Tool Execution                                         │
│  ├── needs_tools: bool                                  │
│  ├── tools_to_use[]                                     │
│  └── tool_results[]                                     │
│                                                         │
│  Generation                                             │
│  ├── thinking_steps[]                                   │
│  ├── response: "final response"                         │
│  ├── citations[]                                        │
│  └── confidence_score: 0.92                             │
│                                                         │
│  Workflow Control                                       │
│  ├── workflow_step: "current_node"                      │
│  └── error: Optional[str]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Agent Load Error
      │
      ▼
┌─────────────────────────┐
│ AgentLoadError raised   │
└───────┬─────────────────┘
        │
        ├──► Agent not found
        │    └──► Return 404 to frontend
        │         "Agent not found or inactive"
        │
        ├──► Agent not accessible (tenant)
        │    └──► Return 403 to frontend
        │         "Agent not accessible to tenant"
        │
        ├──► Database error
        │    └──► Retry once
        │         │
        │         ├──► Success: Continue
        │         └──► Fail: Load fallback agent
        │
        └──► Fallback Strategy
             │
             ▼
        ┌───────────────────────────┐
        │ Load default agent for    │
        │ domain (e.g., "general")  │
        └─────────┬─────────────────┘
                  │
                  ├──► Found: Use default agent
                  └──► Not found: Use minimal fallback
                       │
                       ▼
                  ┌───────────────────────────┐
                  │ Return hardcoded          │
                  │ "General Assistant"       │
                  │ with basic capabilities   │
                  └───────────────────────────┘
```

---

## Performance Metrics

```
Target Latencies:
┌────────────────────────────────────────────────┐
│ Component              │ Target    │ Measured  │
├────────────────────────┼───────────┼───────────┤
│ Agent Loading          │  <500ms   │    ?      │
│ Sub-Agent Pool Load    │  <1000ms  │    ?      │
│ Auto-Selection Score   │  <1000ms  │    ?      │
│ Total Overhead         │  <2000ms  │    ?      │
└────────────────────────────────────────────────┘

Workflow Timings (Mode 1):
┌────────────────────────────────────────────────┐
│ load_agent             │  0-2s     │           │
│ load_context           │  2-4s     │           │
│ update_context (RAG)   │  4-9s     │           │
│ agent_reasoning        │  9-14s    │           │
│ spawn_specialists      │  14-17s   │           │
│ tool_execution         │  17-24s   │           │
│ generate_response      │  24-32s   │           │
│ update_memory          │  32-34s   │           │
├────────────────────────┼───────────┼───────────┤
│ TOTAL (with all)       │  ~25-34s  │           │
│ TOTAL (fast path)      │  ~15-20s  │           │
└────────────────────────────────────────────────┘
```

---

## Database Entity Relationships

```
┌──────────────┐
│   agents     │◄────────┐
├──────────────┤         │
│ id (PK)      │         │
│ tenant_id    │         │ 1:N
│ name         │         │
│ metadata     │         │
└──────────────┘         │
       │                 │
       │ 1:N             │
       ▼                 │
┌──────────────┐         │
│ sub_agents   │─────────┘
│ (via metadata│
│  field)      │
└──────────────┘

┌──────────────┐
│   sessions   │
├──────────────┤
│ id (PK)      │
│ user_id      │
│ tenant_id    │
│ agent_id     │◄───────┐
└──────────────┘        │
       │                │
       │ 1:N            │ M:1
       ▼                │
┌──────────────┐        │
│   messages   │        │
├──────────────┤        │
│ id (PK)      │        │
│ session_id   │        │
│ agent_id     │────────┘
│ content      │
└──────────────┘

┌──────────────┐
│  executions  │
├──────────────┤
│ id (PK)      │
│ session_id   │
│ agent_id     │
│ specialist_  │
│   ids[]      │
│ tool_        │
│   executions │
└──────────────┘
```

---

**Last Updated**: November 21, 2025
**Status**: Complete
