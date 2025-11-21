# Ask Expert Mode 1: Interactive Manual - Detailed End-to-End Workflow Visualization

**Version**: 1.0
**Date**: November 20, 2025
**Purpose**: Comprehensive workflow visualization for translating to LangGraph implementation
**Mode**: Mode 1 - Interactive Manual (User selects expert → Multi-turn conversation)

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Detailed Workflow Steps](#detailed-workflow-steps)
4. [Agent Hierarchy & Sub-Agents](#agent-hierarchy--sub-agents)
5. [LangGraph State Machine](#langgraph-state-machine)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Tool Integration Points](#tool-integration-points)
8. [Error Handling & Fallbacks](#error-handling--fallbacks)
9. [Performance Metrics](#performance-metrics)

---

## Executive Overview

### What is Mode 1?

**Mode 1: Interactive Manual** is a conversational AI service where:
- **User explicitly selects** a specific expert agent
- **Multi-turn conversation** with full context retention
- **Single expert** maintains persona consistency throughout
- **No autonomous execution** - guidance and conversation only
- **Response time**: 15-25 seconds per message

### Key Characteristics

| Aspect | Value |
|--------|-------|
| **Expert Selection** | Manual (User chooses) |
| **Interaction Type** | Interactive (Back-and-forth) |
| **Agent Count** | 1 Expert (with potential sub-agents) |
| **State Management** | Stateful (Full conversation history) |
| **Execution Mode** | Conversational (No autonomous workflow) |
| **Context Window** | Up to 200K tokens |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  MODE 1: HIGH-LEVEL ARCHITECTURE                        │
│                  Interactive Manual Conversation                         │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────┐
│  1. USER       │  User selects expert from gallery
│  INPUT         │  Types question/message
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  2. API GATEWAY                                                        │
│  ✓ Authentication (JWT)                                                │
│  ✓ Tenant isolation (RLS)                                              │
│  ✓ Rate limiting                                                       │
│  ✓ Request validation                                                  │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  3. LANGGRAPH ORCHESTRATOR (MODE 1 STATE MACHINE)                     │
│                                                                        │
│  START → load_agent → load_context → conversation_loop → END         │
│                                                                        │
│  Conversation Loop:                                                    │
│  ├─ receive_message                                                    │
│  ├─ update_context (RAG search)                                        │
│  ├─ agent_reasoning (Chain-of-Thought)                                 │
│  ├─ check_specialist_need (Spawn sub-agents if needed)                │
│  ├─ tool_execution (if required)                                       │
│  ├─ generate_response (Stream tokens)                                  │
│  ├─ update_memory (Save to DB)                                         │
│  └─ continue? → YES: loop back | NO: END                              │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  4. STREAMING RESPONSE                                                 │
│  SSE (Server-Sent Events)                                              │
│  ├─ Thinking steps (intermediate reasoning)                            │
│  ├─ Response tokens (real-time streaming)                              │
│  ├─ Citations (sources)                                                │
│  └─ Metadata (cost, tokens, confidence)                                │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────┐
│  5. FRONTEND   │  Display streaming response
│  UPDATE        │  Show citations, thinking steps
└────────────────┘  Enable next user input
```

---

## Detailed Workflow Steps

### Phase 1: Initialization

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIALIZATION (Happens once per session)                    │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1.1: User Selects Expert
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Agent Gallery Component                                │
│                                                                    │
│  User sees:                                                        │
│  • Agent cards with avatar, name, description                      │
│  • Domain badges (Regulatory, Clinical, Quality, etc.)            │
│  • Statistics (consultation count, satisfaction rating)            │
│  • Search/filter by domain, specialty                              │
│                                                                    │
│  User action:                                                      │
│  → Clicks "Start Conversation" on specific agent card             │
│                                                                    │
│  Result:                                                           │
│  → selected_agent_id = "fda-510k-expert"                          │
│  → session_id = UUID generated                                     │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 1.2: Create Session
┌────────────────────────────────────────────────────────────────────┐
│  Backend: POST /api/ask-expert/mode-1/sessions                    │
│                                                                    │
│  Request:                                                          │
│  {                                                                 │
│    "agent_id": "fda-510k-expert",                                 │
│    "user_id": "user-uuid",                                         │
│    "tenant_id": "tenant-uuid",                                     │
│    "mode": "mode_1_interactive_manual"                            │
│  }                                                                 │
│                                                                    │
│  Actions:                                                          │
│  1. Create session record in database                              │
│  2. Initialize conversation state                                  │
│  3. Load agent profile                                             │
│  4. Return session metadata                                        │
│                                                                    │
│  Response:                                                         │
│  {                                                                 │
│    "session_id": "session-uuid",                                   │
│    "agent": {                                                      │
│      "id": "fda-510k-expert",                                      │
│      "name": "Dr. Sarah Mitchell",                                 │
│      "display_name": "FDA 510(k) Regulatory Expert",              │
│      "avatar_url": "...",                                          │
│      "description": "20+ years FDA experience..."                  │
│    }                                                               │
│  }                                                                 │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 1.3: Frontend Initialization
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Conversation View Component                            │
│                                                                    │
│  UI Updates:                                                       │
│  • Display agent header (avatar + name)                            │
│  • Show empty conversation area                                    │
│  • Enable message input                                            │
│  • Display session info (cost tracker, message count)             │
│                                                                    │
│  State Setup:                                                      │
│  • conversationStore.setSession(sessionData)                       │
│  • conversationStore.setAgent(agentData)                           │
│  • Initialize SSE connection handler                               │
│                                                                    │
│  Ready for first user message                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Message Processing (Multi-Turn Loop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: MESSAGE PROCESSING (Repeats for each user message)           │
└─────────────────────────────────────────────────────────────────────────┘

STEP 2.1: User Sends Message
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Message Input Component                                │
│                                                                    │
│  User types: "What testing is required for a Class II device      │
│               similar to the Smith Cardiac Monitor?"               │
│                                                                    │
│  Action:                                                           │
│  → sendMessage(content, sessionId, agentId)                       │
│  → Optimistic UI update (show user message immediately)           │
│  → Disable input (prevent multiple sends)                          │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 2.2: API Request
┌────────────────────────────────────────────────────────────────────┐
│  Frontend → Backend                                                │
│                                                                    │
│  POST /api/ask-expert/mode-1/chat/stream                          │
│                                                                    │
│  Request Body:                                                     │
│  {                                                                 │
│    "session_id": "session-uuid",                                   │
│    "agent_id": "fda-510k-expert",                                 │
│    "message": "What testing is required for...",                   │
│    "tenant_id": "tenant-uuid",                                     │
│    "user_id": "user-uuid",                                         │
│    "stream": true,                                                 │
│    "context": {                                                    │
│      "uploaded_files": [],                                         │
│      "previous_artifacts": []                                      │
│    }                                                               │
│  }                                                                 │
│                                                                    │
│  Response: Stream (SSE connection)                                 │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH STATE MACHINE EXECUTION                                     │
│  (Backend Orchestration)                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: LangGraph Orchestration (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 1: load_agent                                          │
│  Duration: ~1-2 seconds                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ session_id: "session-uuid"
├─ agent_id: "fda-510k-expert"
├─ current_message: "What testing is required for..."
├─ tenant_id: "tenant-uuid"
├─ user_id: "user-uuid"
└─ workflow_step: "start"

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Fetch Agent from Database                                      │
│     Query: SELECT * FROM agents WHERE id = 'fda-510k-expert'      │
│                                                                    │
│  2. Load Agent Profile                                             │
│     ├─ name: "Dr. Sarah Mitchell"                                  │
│     ├─ specialty: "FDA 510(k) Premarket Notification"             │
│     ├─ system_prompt: "You are Dr. Sarah Mitchell..."             │
│     ├─ knowledge_base_ids: ["fda-guidance", "510k-database"]      │
│     └─ capabilities: ["regulatory_analysis", "predicate_search"]   │
│                                                                    │
│  3. Load Sub-Agent Pool (Specialist Agents)                        │
│     Available sub-agents for FDA 510(k) Expert:                    │
│     ├─ Predicate Search Specialist                                 │
│     ├─ Substantial Equivalence Specialist                          │
│     ├─ Testing Requirements Specialist                             │
│     └─ FDA Response Specialist                                     │
│                                                                    │
│  4. Create System Message                                          │
│     SystemMessage(content=agent_persona)                           │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ agent: {AgentProfile object}
├─ agent_persona: "You are Dr. Sarah Mitchell..."
├─ sub_agent_pool: [List of 4 specialists]
├─ messages: [SystemMessage]
└─ workflow_step: "load_agent"

SSE Event:
data: {"type": "thinking", "data": {"step": "load_agent", "description": "Loading expert profile"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 2: load_context                                        │
│  Duration: ~2-3 seconds                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ session_id: "session-uuid"
├─ agent: {AgentProfile}
└─ messages: [SystemMessage]

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Load Conversation History                                      │
│     Query: SELECT * FROM ask_expert_messages                       │
│            WHERE session_id = 'session-uuid'                       │
│            ORDER BY created_at DESC LIMIT 10                       │
│                                                                    │
│     Result: Last 10 turns of conversation (20 messages)            │
│     ├─ Turn 1: User: "Hello"                                       │
│     │         Assistant: "Hello! I'm Dr. Mitchell..."              │
│     ├─ Turn 2: User: "I need help with 510(k)"                     │
│     │         Assistant: "I'd be happy to help..."                 │
│     └─ ... (8 more turns)                                          │
│                                                                    │
│  2. Build Message History                                          │
│     For each history message:                                      │
│       if role == 'user':                                           │
│         messages.append(HumanMessage(content))                     │
│       elif role == 'assistant':                                    │
│         messages.append(AIMessage(content))                        │
│                                                                    │
│  3. Calculate Context Statistics                                   │
│     ├─ total_messages: 20                                          │
│     ├─ total_tokens: ~5,000                                        │
│     └─ conversation_length: 10 turns                               │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ conversation_history: [List of 20 message dicts]
├─ messages: [SystemMessage, ...20 historical messages]
└─ workflow_step: "load_context"

SSE Event:
data: {"type": "thinking", "data": {"step": "load_context", "description": "Loading conversation history (10 turns)"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 3: update_context                                      │
│  Duration: ~3-5 seconds (includes RAG search)                          │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ current_message: "What testing is required for..."
├─ messages: [SystemMessage, ...20 historical messages]
├─ agent: {AgentProfile with knowledge_base_ids}
└─ tenant_id: "tenant-uuid"

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Add Current User Message                                       │
│     messages.append(HumanMessage(content=current_message))         │
│                                                                    │
│  2. RAG Search - Hybrid Retrieval                                  │
│                                                                    │
│     A. Generate Query Embedding                                    │
│        ├─ Model: text-embedding-3-large                            │
│        ├─ Input: "What testing is required for..."                 │
│        └─ Output: [1536-dim vector]                                │
│                                                                    │
│     B. Semantic Search (Pinecone)                                  │
│        Query:                                                      │
│        {                                                           │
│          "vector": [1536-dim embedding],                           │
│          "filter": {                                               │
│            "agent_id": "fda-510k-expert",                         │
│            "tenant_id": "tenant-uuid",                             │
│            "knowledge_base_id": {                                  │
│              "$in": ["fda-guidance", "510k-database"]             │
│            }                                                       │
│          },                                                        │
│          "top_k": 10                                               │
│        }                                                           │
│                                                                    │
│        Results: 10 documents with similarity scores                │
│        ├─ Doc 1: "FDA Guidance on 510(k) Testing..." (0.92)       │
│        ├─ Doc 2: "Biocompatibility Testing Requirements..." (0.88) │
│        ├─ Doc 3: "Electrical Safety Standards..." (0.85)          │
│        └─ ... (7 more)                                             │
│                                                                    │
│     C. Keyword Search (PostgreSQL Full-Text)                       │
│        Query:                                                      │
│        SELECT * FROM knowledge_chunks                              │
│        WHERE agent_id = 'fda-510k-expert'                         │
│          AND tenant_id = 'tenant-uuid'                             │
│          AND to_tsvector('english', content)                       │
│              @@ plainto_tsquery('english', 'testing Class II')    │
│        ORDER BY ts_rank(...) DESC                                  │
│        LIMIT 10                                                    │
│                                                                    │
│        Results: 10 documents with text relevance scores            │
│                                                                    │
│     D. Hybrid Fusion (RRF - Reciprocal Rank Fusion)               │
│        Combine semantic + keyword results:                         │
│        score = 0.7 * semantic_score + 0.3 * keyword_score         │
│                                                                    │
│        Fused results (top 5):                                      │
│        ├─ "FDA Guidance on 510(k) Testing Requirements"           │
│        ├─ "Predicate Device Comparison for Class II"              │
│        ├─ "Biocompatibility Testing (ISO 10993)"                  │
│        ├─ "Electrical Safety (IEC 60601-1)"                       │
│        └─ "Performance Testing Guidelines"                         │
│                                                                    │
│  3. Build Context Window                                           │
│     Compile retrieved knowledge into context string:               │
│                                                                    │
│     context_window = """                                           │
│     ## Relevant Knowledge                                          │
│                                                                    │
│     ### Document 1: FDA Guidance on 510(k) Testing Requirements   │
│     Source: FDA Guidance Document (21 CFR 807)                     │
│     Relevance: 0.94                                                │
│     Content: "For Class II medical devices, the following          │
│     testing is typically required:                                 │
│     1. Biocompatibility (ISO 10993-1)                             │
│     2. Electrical Safety (IEC 60601-1)                            │
│     3. EMC Testing (IEC 60601-1-2)                                │
│     4. Software Validation (FDA Guidance on Software)             │
│     5. Performance Testing (Device-specific protocols)             │
│     6. Sterilization Validation (if applicable)..."               │
│                                                                    │
│     ### Document 2: Predicate Device Comparison...                 │
│     [Additional documents...]                                      │
│     """                                                            │
│                                                                    │
│  4. Summarize Long History (if needed)                             │
│     If conversation_history > 5 turns:                             │
│       summary = summarize_recent_turns(last_3_turns)               │
│       context_window = summary + "\n\n" + context_window          │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ messages: [..., HumanMessage(current_message)]
├─ rag_context: [List of 5 RAG result dicts]
├─ context_window: "## Relevant Knowledge\n..."
└─ workflow_step: "update_context"

SSE Event:
data: {"type": "thinking", "data": {"step": "update_context", "description": "Retrieved 5 relevant knowledge chunks"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 4: agent_reasoning                                     │
│  Duration: ~3-5 seconds                                                 │
│  Purpose: Analyze query, plan response, determine tool needs            │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ current_message: "What testing is required for..."
├─ context_window: "## Relevant Knowledge..."
├─ agent: {AgentProfile}
└─ sub_agent_pool: [4 specialist agents]

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Build Reasoning Prompt                                         │
│                                                                    │
│     reasoning_prompt = f"""                                        │
│     You are {agent.display_name}, {agent.description}.            │
│                                                                    │
│     ## Your Expertise                                              │
│     {agent.specialty}                                              │
│                                                                    │
│     ## Context                                                     │
│     {context_window}                                               │
│                                                                    │
│     ## User's Latest Message                                       │
│     {current_message}                                              │
│                                                                    │
│     ## Analysis Task                                               │
│     Analyze this query using chain-of-thought reasoning:           │
│                                                                    │
│     1. What is the user asking?                                    │
│     2. What information do I need to provide a complete answer?    │
│     3. Do I need to use any tools? (search, database, etc.)       │
│     4. Do I need specialist sub-agents for deep analysis?          │
│     5. What is my response strategy?                               │
│                                                                    │
│     Respond in JSON format:                                        │
│     {{                                                             │
│       "query_analysis": "string",                                  │
│       "information_needed": ["item1", "item2"],                    │
│       "needs_tools": true/false,                                   │
│       "tools_to_use": ["tool1", "tool2"],                         │
│       "needs_specialists": true/false,                             │
│       "specialists_to_spawn": ["specialist1"],                     │
│       "response_strategy": "string",                               │
│       "estimated_complexity": 0.0-1.0                              │
│     }}                                                             │
│     """                                                            │
│                                                                    │
│  2. LLM Reasoning Call                                             │
│     Model: gpt-4-turbo-preview                                     │
│     Temperature: 0.3 (focused reasoning)                           │
│     Max tokens: 1000                                               │
│                                                                    │
│     Response:                                                      │
│     {                                                              │
│       "query_analysis": "User is asking about testing             │
│         requirements for a Class II medical device, specifically   │
│         referring to a predicate device (Smith Cardiac Monitor).   │
│         This requires:                                             │
│         1. Understanding Class II device classification            │
│         2. Identifying relevant testing standards                  │
│         3. Comparing to predicate device requirements              │
│         4. Providing comprehensive testing checklist",             │
│                                                                    │
│       "information_needed": [                                      │
│         "Class II testing standards (ISO, IEC, FDA)",             │
│         "Predicate device (Smith Cardiac Monitor) info",          │
│         "Substantial equivalence testing requirements",            │
│         "Common testing protocols for cardiac monitors"            │
│       ],                                                           │
│                                                                    │
│       "needs_tools": true,                                         │
│       "tools_to_use": [                                            │
│         "predicate_device_search",                                 │
│         "regulatory_database_query"                                │
│       ],                                                           │
│                                                                    │
│       "needs_specialists": true,                                   │
│       "specialists_to_spawn": [                                    │
│         "testing_requirements_specialist",                         │
│         "predicate_search_specialist"                              │
│       ],                                                           │
│                                                                    │
│       "response_strategy": "First, I'll search for the Smith      │
│         Cardiac Monitor predicate device. Then, I'll compile a     │
│         comprehensive list of testing requirements based on        │
│         FDA guidance, ISO/IEC standards, and predicate comparison. │
│         I'll organize by test category and provide regulatory      │
│         references.",                                              │
│                                                                    │
│       "estimated_complexity": 0.7                                  │
│     }                                                              │
│                                                                    │
│  3. Store Reasoning Results                                        │
│     thinking_steps.append({                                        │
│       "step": "reasoning",                                         │
│       "description": reasoning["query_analysis"],                  │
│       "timestamp": "2025-11-20T10:15:23Z"                         │
│     })                                                             │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ needs_tools: true
├─ tools_to_use: ["predicate_device_search", "regulatory_database_query"]
├─ needs_specialists: true
├─ specialists_to_spawn: ["testing_requirements_specialist", ...]
├─ thinking_steps: [{"step": "reasoning", ...}]
├─ response_metadata: {"reasoning": {...}}
└─ workflow_step: "agent_reasoning"

SSE Event:
data: {"type": "thinking", "data": {"step": "reasoning", "description": "Analyzing query complexity and planning response strategy"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CONDITIONAL EDGE: check_specialist_need                               │
└─────────────────────────────────────────────────────────────────────────┘

Condition: state["needs_specialists"] == True

Route: → spawn_specialists

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 5: spawn_specialists                                   │
│  Duration: ~2-3 seconds                                                 │
│  Purpose: Dynamically spawn Level 3 specialist sub-agents              │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ specialists_to_spawn: ["testing_requirements_specialist",
│                          "predicate_search_specialist"]
├─ agent: {FDA 510(k) Expert}
└─ current_message: "What testing is required for..."

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Initialize Specialist 1: Testing Requirements Specialist       │
│                                                                    │
│     Specialist Profile:                                            │
│     ├─ id: "test-req-specialist-uuid"                             │
│     ├─ name: "Testing Requirements Specialist"                     │
│     ├─ parent_agent_id: "fda-510k-expert"                         │
│     ├─ level: 3 (Specialist)                                       │
│     ├─ specialty: "FDA testing standards and protocols"           │
│     └─ capabilities: {                                             │
│           "knowledge_bases": ["iso_standards", "iec_standards",   │
│                               "fda_testing_guidance"],            │
│           "tools": ["standards_search", "testing_calculator"]      │
│         }                                                          │
│                                                                    │
│     Task Assignment:                                               │
│     "Identify all required testing protocols for Class II cardiac │
│      monitoring devices, including ISO 10993 biocompatibility,    │
│      IEC 60601-1 electrical safety, and device-specific           │
│      performance testing."                                         │
│                                                                    │
│  2. Initialize Specialist 2: Predicate Search Specialist          │
│                                                                    │
│     Specialist Profile:                                            │
│     ├─ id: "pred-search-specialist-uuid"                          │
│     ├─ name: "Predicate Search Specialist"                        │
│     ├─ parent_agent_id: "fda-510k-expert"                         │
│     ├─ level: 3 (Specialist)                                       │
│     ├─ specialty: "FDA 510(k) predicate device identification"   │
│     └─ capabilities: {                                             │
│           "databases": ["fda_510k_database", "device_registry"],  │
│           "tools": ["predicate_search", "substantial_equivalence"] │
│         }                                                          │
│                                                                    │
│     Task Assignment:                                               │
│     "Search for the Smith Cardiac Monitor in FDA 510(k) database, │
│      retrieve its K number, predicate devices, testing protocols, │
│      and substantial equivalence determination."                   │
│                                                                    │
│  3. Register Spawned Specialists                                   │
│     spawned_specialist_ids = [                                     │
│       "test-req-specialist-uuid",                                  │
│       "pred-search-specialist-uuid"                                │
│     ]                                                              │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ spawned_specialist_ids: [2 specialist UUIDs]
├─ spawned_specialists: [2 specialist agent objects]
└─ workflow_step: "spawn_specialists"

SSE Event:
data: {"type": "thinking", "data": {"step": "spawn_specialists", "description": "Spawning 2 specialist agents for deep analysis"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CONDITIONAL EDGE: check_tools_need                                    │
└─────────────────────────────────────────────────────────────────────────┘

Condition: state["needs_tools"] == True

Route: → tool_execution

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 6: tool_execution                                      │
│  Duration: ~3-7 seconds (depends on tool complexity)                   │
│  Purpose: Execute specialist tools for data retrieval                  │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ tools_to_use: ["predicate_device_search", "regulatory_database_query"]
├─ spawned_specialists: [2 specialists]
└─ current_message: "What testing is required for..."

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  TOOL 1: predicate_device_search                                   │
│  Executed by: Predicate Search Specialist                          │
│                                                                    │
│  Input:                                                            │
│  {                                                                 │
│    "query": "Smith Cardiac Monitor",                              │
│    "search_type": "predicate_device",                             │
│    "filters": {                                                    │
│      "device_class": "II",                                         │
│      "product_code": "DPS",  # (inferred from context)            │
│      "include_related": true                                       │
│    }                                                               │
│  }                                                                 │
│                                                                    │
│  Execution:                                                        │
│  1. Query FDA 510(k) Database                                      │
│     API: https://api.fda.gov/device/510k.json                     │
│     Search: "Smith Cardiac Monitor"                                │
│                                                                    │
│  2. Parse Results                                                  │
│     Found: K123456 - "Smith Cardiac Monitor Model 2000"           │
│     ├─ Applicant: Smith Medical Technologies                      │
│     ├─ Decision Date: 2020-03-15                                   │
│     ├─ Device Class: II                                            │
│     ├─ Product Code: DPS (Cardiac Monitor)                        │
│     ├─ Predicate Devices: K098765, K087654                        │
│     └─ Testing Referenced:                                         │
│         • IEC 60601-1 (Electrical Safety)                         │
│         • IEC 60601-1-2 (EMC)                                     │
│         • IEC 60601-2-27 (Cardiac Monitors)                       │
│         • ISO 10993-1 (Biocompatibility)                          │
│         • ISO 14971 (Risk Management)                             │
│                                                                    │
│  3. Retrieve Summary Document                                      │
│     Download: 510(k) Summary for K123456                          │
│     Extract: Testing protocols section                             │
│                                                                    │
│  Result:                                                           │
│  {                                                                 │
│    "tool": "predicate_device_search",                             │
│    "success": true,                                                │
│    "data": {                                                       │
│      "k_number": "K123456",                                        │
│      "device_name": "Smith Cardiac Monitor Model 2000",           │
│      "applicant": "Smith Medical Technologies",                    │
│      "decision_date": "2020-03-15",                                │
│      "device_class": "II",                                         │
│      "product_code": "DPS",                                        │
│      "predicate_devices": ["K098765", "K087654"],                 │
│      "testing_standards": [                                        │
│        "IEC 60601-1", "IEC 60601-1-2", "IEC 60601-2-27",         │
│        "ISO 10993-1", "ISO 14971"                                 │
│      ],                                                            │
│      "summary_document_url": "https://..."                         │
│    },                                                              │
│    "duration_ms": 2340                                             │
│  }                                                                 │
│                                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TOOL 2: regulatory_database_query                                 │
│  Executed by: Testing Requirements Specialist                      │
│                                                                    │
│  Input:                                                            │
│  {                                                                 │
│    "query_type": "testing_standards",                             │
│    "device_class": "II",                                           │
│    "product_code": "DPS",                                          │
│    "standards": ["IEC 60601-1", "IEC 60601-1-2",                 │
│                  "IEC 60601-2-27", "ISO 10993-1", "ISO 14971"]   │
│  }                                                                 │
│                                                                    │
│  Execution:                                                        │
│  1. Query Internal Regulatory Database                             │
│     Tables:                                                        │
│     ├─ standards_library                                           │
│     ├─ testing_protocols                                           │
│     └─ fda_guidance_documents                                      │
│                                                                    │
│  2. Retrieve Standard Details                                      │
│     For each standard:                                             │
│     • Full name and version                                        │
│     • Testing scope                                                │
│     • Required test methods                                        │
│     • Acceptance criteria                                          │
│     • FDA recognition status                                       │
│                                                                    │
│  Result:                                                           │
│  {                                                                 │
│    "tool": "regulatory_database_query",                           │
│    "success": true,                                                │
│    "data": {                                                       │
│      "standards": [                                                │
│        {                                                           │
│          "code": "IEC 60601-1",                                    │
│          "name": "Medical electrical equipment - General          │
│                   requirements for basic safety...",               │
│          "version": "3.2 (2020)",                                  │
│          "scope": "Electrical safety, mechanical safety...",      │
│          "test_categories": [                                      │
│            "Electrical safety tests",                              │
│            "Mechanical hazards",                                   │
│            "Fire hazards",                                         │
│            "Temperature limits",                                   │
│            "Protective earthing"                                   │
│          ],                                                        │
│          "fda_recognized": true                                    │
│        },                                                          │
│        {                                                           │
│          "code": "ISO 10993-1",                                    │
│          "name": "Biological evaluation of medical devices",      │
│          "version": "2018",                                        │
│          "scope": "Biocompatibility assessment",                  │
│          "test_categories": [                                      │
│            "Cytotoxicity",                                         │
│            "Sensitization",                                        │
│            "Irritation or intracutaneous reactivity",             │
│            "Systemic toxicity (acute)",                           │
│            "Genotoxicity"                                          │
│          ],                                                        │
│          "fda_recognized": true                                    │
│        },                                                          │
│        // ... other standards                                      │
│      ]                                                             │
│    },                                                              │
│    "duration_ms": 1820                                             │
│  }                                                                 │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ tool_results: [
│     {predicate_device_search result},
│     {regulatory_database_query result}
│   ]
├─ thinking_steps: [...,
│     {"step": "tool_execution", "description": "Searching FDA database for Smith Cardiac Monitor"},
│     {"step": "tool_complete", "description": "Found predicate device K123456"}
│   ]
└─ workflow_step: "tool_execution"

SSE Events:
data: {"type": "thinking", "data": {"step": "tool_execution", "description": "Searching FDA 510(k) database for predicate device"}}
data: {"type": "thinking", "data": {"step": "tool_complete", "description": "Found Smith Cardiac Monitor (K123456) with testing requirements"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 7: generate_response                                   │
│  Duration: ~5-10 seconds (streaming)                                    │
│  Purpose: Synthesize final expert response with all context             │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ agent: {FDA 510(k) Expert profile}
├─ agent_persona: "You are Dr. Sarah Mitchell..."
├─ context_window: "## Relevant Knowledge..."
├─ tool_results: [predicate search, standards query]
├─ rag_context: [5 knowledge chunks]
├─ current_message: "What testing is required for..."
└─ spawned_specialists: [2 specialists with their analyses]

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Build Comprehensive Response Prompt                            │
│                                                                    │
│     response_prompt = f"""                                         │
│     {agent_persona}                                                │
│                                                                    │
│     ## Your Role                                                   │
│     You are {agent.display_name}, {agent.description}             │
│                                                                    │
│     ## Knowledge Context                                           │
│     {context_window}                                               │
│                                                                    │
│     ## Tool Results                                                │
│     ### Predicate Device Search                                    │
│     Device: Smith Cardiac Monitor Model 2000 (K123456)            │
│     Decision Date: 2020-03-15                                      │
│     Testing Standards Referenced:                                  │
│     - IEC 60601-1 (Electrical Safety)                             │
│     - IEC 60601-1-2 (EMC)                                         │
│     - IEC 60601-2-27 (Cardiac Monitors)                           │
│     - ISO 10993-1 (Biocompatibility)                              │
│     - ISO 14971 (Risk Management)                                 │
│                                                                    │
│     ### Regulatory Standards Details                               │
│     [Full details of each standard from tool results]             │
│                                                                    │
│     ## Specialist Analyses                                         │
│     ### Testing Requirements Specialist:                           │
│     "Based on the device class and predicate device, here are     │
│      the comprehensive testing requirements..."                    │
│                                                                    │
│     ### Predicate Search Specialist:                               │
│     "The Smith Cardiac Monitor serves as an excellent predicate.  │
│      Substantial equivalence should focus on..."                   │
│                                                                    │
│     ## User's Question                                             │
│     {current_message}                                              │
│                                                                    │
│     ## Task                                                        │
│     Provide a comprehensive, expert-level response that:          │
│     1. Directly answers the user's question                        │
│     2. Organizes testing requirements by category                  │
│     3. References specific standards and guidance                  │
│     4. Provides context from the predicate device                  │
│     5. Includes practical recommendations                          │
│     6. Cites all sources                                           │
│                                                                    │
│     Maintain your expert persona and communication style.          │
│     Be thorough but accessible.                                    │
│     """                                                            │
│                                                                    │
│  2. Generate Response with Streaming                               │
│     Model: gpt-4-turbo-preview                                     │
│     Temperature: 0.7 (balanced expertise)                          │
│     Max tokens: 2000                                               │
│     Stream: True                                                   │
│                                                                    │
│     LLM Output (streamed token by token):                          │
│     ┌──────────────────────────────────────────────────────────┐ │
│     │ Based on the Smith Cardiac Monitor (K123456) as your     │ │
│     │ predicate device and FDA requirements for Class II       │ │
│     │ cardiac monitoring devices, here's a comprehensive       │ │
│     │ breakdown of the required testing:                       │ │
│     │                                                           │ │
│     │ ## Required Testing Categories                           │ │
│     │                                                           │ │
│     │ ### 1. Electrical Safety Testing (IEC 60601-1:2020)     │ │
│     │                                                           │ │
│     │ This is mandatory for all medical electrical equipment.  │ │
│     │ You'll need to demonstrate:                              │ │
│     │                                                           │ │
│     │ - **Protection against electric shock** (clauses 8.1-8.8)│ │
│     │   • Testing of protective earthing                       │ │
│     │   • Leakage current measurements (normal & fault)        │ │
│     │   • Patient auxiliary current limits                     │ │
│     │                                                           │ │
│     │ - **Mechanical hazards** (clauses 9.1-9.8)              │ │
│     │   • Stability and mechanical strength                    │ │
│     │   • Moving parts safety                                  │ │
│     │   • Surface/corners/edges requirements                   │ │
│     │                                                           │ │
│     │ [Continues with detailed testing breakdown...]           │ │
│     │                                                           │ │
│     │ ### 2. Electromagnetic Compatibility (IEC 60601-1-2)    │ │
│     │ [Details...]                                             │ │
│     │                                                           │ │
│     │ ### 3. Particular Requirements (IEC 60601-2-27)         │ │
│     │ [Details...]                                             │ │
│     │                                                           │ │
│     │ ### 4. Biocompatibility (ISO 10993-1:2018)              │ │
│     │ [Details...]                                             │ │
│     │                                                           │ │
│     │ ### 5. Software Validation                               │ │
│     │ [Details...]                                             │ │
│     │                                                           │ │
│     │ ## Predicate Device Comparison                           │ │
│     │                                                           │ │
│     │ Since you're referencing the Smith Cardiac Monitor       │ │
│     │ (K123456), your substantial equivalence demonstration    │ │
│     │ should include:                                          │ │
│     │ [Details...]                                             │ │
│     │                                                           │ │
│     │ ## Sources                                                │ │
│     │ 1. FDA Guidance: "510(k) Submission Requirements"        │ │
│     │ 2. IEC 60601-1:2020 - Medical electrical equipment       │ │
│     │ 3. Smith Cardiac Monitor 510(k) Summary (K123456)       │ │
│     │ [Additional citations...]                                │ │
│     └──────────────────────────────────────────────────────────┘ │
│                                                                    │
│  3. Stream Tokens via SSE                                          │
│     For each token generated:                                      │
│       SSE Event: data: {"type": "token", "data": {"token": "..."}}│
│                                                                    │
│  4. Calculate Metrics                                              │
│     ├─ tokens_used: {                                             │
│     │     "prompt": 3500,                                         │
│     │     "completion": 1200,                                     │
│     │     "total": 4700                                           │
│     │   }                                                         │
│     ├─ estimated_cost: $0.047 (GPT-4 Turbo pricing)              │
│     └─ response_time: 8.2 seconds                                 │
│                                                                    │
│  5. Extract Citations                                              │
│     Parse response for source references:                          │
│     citations = [                                                  │
│       {"source": "FDA Guidance: 510(k) Submission", "ref": "1"},  │
│       {"source": "IEC 60601-1:2020", "ref": "2"},                │
│       {"source": "Smith Cardiac Monitor K123456", "ref": "3"},   │
│       {"source": "ISO 10993-1:2018", "ref": "4"}                 │
│     ]                                                              │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ response: "Based on the Smith Cardiac Monitor..."
├─ citations: [4 source citations]
├─ tokens_used: {"prompt": 3500, "completion": 1200, "total": 4700}
├─ estimated_cost: 0.047
├─ thinking_steps: [..., {"step": "generating", "description": "Synthesizing expert response"}]
└─ workflow_step: "generate_response"

SSE Events (real-time):
data: {"type": "thinking", "data": {"step": "generating", "description": "Synthesizing expert response from all sources"}}
data: {"type": "token", "data": {"token": "Based"}}
data: {"type": "token", "data": {"token": " on"}}
data: {"type": "token", "data": {"token": " the"}}
... (streaming continues for ~1200 tokens)

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 8: update_memory                                       │
│  Duration: ~1-2 seconds                                                 │
│  Purpose: Persist conversation to database                              │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ session_id: "session-uuid"
├─ current_message: "What testing is required for..."
├─ response: "Based on the Smith Cardiac Monitor..."
├─ agent_id: "fda-510k-expert"
├─ tokens_used: {"prompt": 3500, "completion": 1200, "total": 4700}
├─ estimated_cost: 0.047
├─ thinking_steps: [List of all reasoning steps]
├─ tool_results: [List of tool execution results]
└─ citations: [List of sources]

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Save User Message                                              │
│                                                                    │
│     INSERT INTO ask_expert_messages (                             │
│       id, session_id, role, content, agent_id,                    │
│       metadata, tokens, cost, created_at                           │
│     ) VALUES (                                                     │
│       'msg-user-uuid',                                             │
│       'session-uuid',                                              │
│       'user',                                                      │
│       'What testing is required for...',                           │
│       NULL,                                                        │
│       '{}',                                                        │
│       NULL,                                                        │
│       NULL,                                                        │
│       NOW()                                                        │
│     );                                                             │
│                                                                    │
│  2. Save Assistant Message                                         │
│                                                                    │
│     INSERT INTO ask_expert_messages (                             │
│       id, session_id, role, content, agent_id,                    │
│       metadata, tokens, cost, created_at                           │
│     ) VALUES (                                                     │
│       'msg-assistant-uuid',                                        │
│       'session-uuid',                                              │
│       'assistant',                                                 │
│       'Based on the Smith Cardiac Monitor...',                     │
│       'fda-510k-expert',                                           │
│       jsonb_build_object(                                          │
│         'thinking_steps', [...],                                   │
│         'tool_results', [...],                                     │
│         'citations', [...],                                        │
│         'tokens', {...},                                           │
│         'cost', 0.047,                                             │
│         'response_time_ms', 8200,                                  │
│         'specialist_agents', ['test-req', 'pred-search']          │
│       ),                                                           │
│       4700,                                                        │
│       0.047,                                                       │
│       NOW()                                                        │
│     );                                                             │
│                                                                    │
│  3. Update Session Statistics                                      │
│                                                                    │
│     UPDATE ask_expert_sessions                                     │
│     SET                                                            │
│       total_messages = total_messages + 2,                         │
│       total_tokens = total_tokens + 4700,                          │
│       total_cost = total_cost + 0.047,                            │
│       updated_at = NOW()                                           │
│     WHERE id = 'session-uuid';                                     │
│                                                                    │
│  4. Log Analytics Event                                            │
│                                                                    │
│     INSERT INTO analytics_events (                                 │
│       event_type, user_id, tenant_id, session_id,                 │
│       agent_id, metadata, created_at                               │
│     ) VALUES (                                                     │
│       'ask_expert_message',                                        │
│       'user-uuid',                                                 │
│       'tenant-uuid',                                               │
│       'session-uuid',                                              │
│       'fda-510k-expert',                                           │
│       jsonb_build_object(                                          │
│         'mode', 'mode_1_interactive_manual',                      │
│         'response_time_ms', 8200,                                  │
│         'tokens_used', 4700,                                       │
│         'cost', 0.047,                                             │
│         'specialists_spawned', 2,                                  │
│         'tools_used', 2,                                           │
│         'rag_chunks', 5                                            │
│       ),                                                           │
│       NOW()                                                        │
│     );                                                             │
│                                                                    │
│  5. Cache Response (Optional)                                      │
│     If similar queries are common:                                 │
│       redis.setex(                                                 │
│         f"response_cache:{hash(current_message)}",                │
│         300,  # 5 minutes TTL                                      │
│         response                                                   │
│       )                                                            │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ message_ids: {
│     "user_message_id": "msg-user-uuid",
│     "assistant_message_id": "msg-assistant-uuid"
│   }
├─ continue_conversation: true (ready for next turn)
└─ workflow_step: "update_memory"

SSE Event:
data: {"type": "complete", "data": {
  "message_id": "msg-assistant-uuid",
  "content": "Based on the Smith Cardiac Monitor...",
  "cost": 0.047,
  "tokens": {"prompt": 3500, "completion": 1200, "total": 4700},
  "thinking_steps": [...],
  "tools_used": [...],
  "citations": [...],
  "timestamp": "2025-11-20T10:15:31Z"
}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CONDITIONAL EDGE: check_continuation                                  │
└─────────────────────────────────────────────────────────────────────────┘

Condition: state["continue_conversation"] == True AND state["error"] == None

Route: → END (single message complete, ready for next user input)

        │
        ▼
┌────────────────┐
│   END NODE     │  Message processing complete
└────────────────┘  Frontend ready for next user input
```

---

## Agent Hierarchy & Sub-Agents

### Level 1: Master Agent (Not used in Mode 1)
Mode 1 skips master agent orchestration since user manually selects expert.

### Level 2: Expert Agent (Selected by User)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 2: EXPERT AGENT                                                 │
│  FDA 510(k) Regulatory Expert - Dr. Sarah Mitchell                     │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "fda-510k-expert"
├─ Name: "Dr. Sarah Mitchell"
├─ Display Name: "FDA 510(k) Regulatory Expert"
├─ Tier: 1 (Premium expert)
├─ Vertical: "Medical Devices"
│
├─ Description:
│   "20+ years of FDA regulatory experience specializing in 510(k)
│    premarket notifications. Expert in predicate device selection,
│    substantial equivalence determinations, and comprehensive
│    submission package development."
│
├─ Specialty:
│   "FDA 510(k) Premarket Notification - Complete submission lifecycle
│    from predicate search to FDA clearance"
│
├─ System Prompt (Persona):
│   "You are Dr. Sarah Mitchell, a regulatory affairs expert with over
│    20 years of experience in FDA 510(k) submissions. You have
│    successfully guided 300+ medical device companies through the
│    510(k) process with a 98% first-time clearance rate.
│
│    Your communication style:
│    • Clear and organized
│    • Cite specific FDA guidance documents and CFR sections
│    • Provide practical, actionable recommendations
│    • Share real-world examples from past submissions
│    • Proactively identify potential regulatory challenges
│
│    Your expertise areas:
│    • Predicate device selection and analysis
│    • Substantial equivalence determinations
│    • Testing protocol development
│    • 510(k) submission package assembly
│    • FDA response strategies (Additional Information requests)
│    • Special 510(k) pathways (Traditional, Special, Abbreviated)
│
│    You have access to:
│    • Complete FDA 510(k) database (2M+ clearances)
│    • All FDA guidance documents (500+ guidances)
│    • CFR Title 21 (complete regulations)
│    • Testing standards library (ISO, IEC, ASTM, ANSI)
│    • Historical submission data
│
│    When users ask complex questions, you can spawn specialist
│    sub-agents to provide deep technical analysis."
│
├─ Knowledge Base IDs:
│   ["fda-510k-database", "fda-guidance-library", "cfr-title-21",
│    "iso-iec-standards", "device-classification"]
│
├─ Capabilities:
│   {
│     "chain_of_thought": true,
│     "tree_of_thoughts": true,
│     "self_critique": true,
│     "spawn_specialists": true,
│     "tool_calling": true,
│     "multimodal": true,
│     "code_execution": false
│   }
│
├─ Available Tools:
│   [
│     "predicate_device_search",      # Search FDA 510(k) database
│     "regulatory_database_query",    # Query CFR, guidance documents
│     "standards_search",              # Search ISO/IEC standards
│     "web_search",                    # External research
│     "document_analysis"              # Analyze uploaded PDFs
│   ]
│
└─ Sub-Agent Pool (Level 3 Specialists):
    ├─ Predicate Search Specialist
    ├─ Substantial Equivalence Specialist
    ├─ Testing Requirements Specialist
    └─ FDA Response Specialist
```

### Level 3: Specialist Sub-Agents (Spawned Dynamically)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 3: SPECIALIST SUB-AGENT #1                                      │
│  Testing Requirements Specialist                                        │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "testing-requirements-specialist"
├─ Parent Agent: "fda-510k-expert"
├─ Spawned Dynamically: Yes
│
├─ Specialty:
│   "Deep technical analysis of FDA testing requirements for medical
│    devices. Expert in ISO, IEC, ASTM, and ANSI standards interpretation."
│
├─ Task Assignment (when spawned):
│   "Identify all required testing protocols for Class II cardiac
│    monitoring devices, including biocompatibility (ISO 10993),
│    electrical safety (IEC 60601-1), EMC (IEC 60601-1-2), and
│    device-specific performance testing."
│
├─ Knowledge Bases:
│   ["iso-standards-library", "iec-standards-library",
│    "astm-standards-library", "fda-testing-guidance"]
│
├─ Available Tools:
│   ["standards_search", "testing_protocol_generator",
│    "requirements_matrix_builder"]
│
├─ Reasoning Mode:
│   "Chain-of-thought with structured output"
│
└─ Output Format:
    {
      "testing_categories": [
        {
          "category": "Electrical Safety",
          "standard": "IEC 60601-1:2020",
          "test_methods": [...],
          "acceptance_criteria": [...],
          "estimated_duration": "2-3 weeks",
          "estimated_cost": "$15,000-$25,000"
        },
        ...
      ],
      "total_estimated_timeline": "12-16 weeks",
      "critical_path_tests": [...],
      "regulatory_citations": [...]
    }

┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 3: SPECIALIST SUB-AGENT #2                                      │
│  Predicate Search Specialist                                            │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "predicate-search-specialist"
├─ Parent Agent: "fda-510k-expert"
├─ Spawned Dynamically: Yes
│
├─ Specialty:
│   "Expert at searching FDA 510(k) database to identify optimal
│    predicate devices and analyze substantial equivalence rationale."
│
├─ Task Assignment (when spawned):
│   "Search for the Smith Cardiac Monitor in FDA 510(k) database,
│    retrieve its K number, predicate devices, testing protocols,
│    and substantial equivalence determination. Analyze if this is
│    an appropriate predicate for the user's device."
│
├─ Knowledge Bases:
│   ["fda-510k-database-complete", "predicate-analysis-cases"]
│
├─ Available Tools:
│   ["predicate_device_search", "k_number_lookup",
│    "substantial_equivalence_analyzer", "predicate_comparison"]
│
├─ Reasoning Mode:
│   "Multi-step analysis with comparison matrix"
│
└─ Output Format:
    {
      "predicate_device": {
        "k_number": "K123456",
        "device_name": "Smith Cardiac Monitor Model 2000",
        "clearance_date": "2020-03-15",
        "applicant": "Smith Medical Technologies",
        "product_code": "DPS",
        "device_class": "II"
      },
      "predicate_chain": ["K098765", "K087654"],
      "substantial_equivalence_analysis": {
        "technological_characteristics": "Same",
        "intended_use": "Identical",
        "performance_data": "Equivalent or better",
        "biocompatibility": "Same materials",
        "overall_assessment": "Strong predicate"
      },
      "alternative_predicates": [...],
      "regulatory_citations": [...]
    }
```

### Level 4: Worker Agents (Not typically used in Mode 1)

Mode 1 is conversational, so worker agents (parallel task executors) are not commonly spawned. However, they could be used for:
- Parallel literature searches
- Multiple database queries
- Batch document processing

### Level 5: Tool Agents (Invoked via Tools)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 5: TOOL AGENTS                                                  │
│  Invoked during tool_execution node                                     │
└─────────────────────────────────────────────────────────────────────────┘

TOOL 1: predicate_device_search
├─ Purpose: Search FDA 510(k) database
├─ Data Source: FDA API (api.fda.gov/device/510k.json)
├─ Inputs: device_name, product_code, device_class
├─ Outputs: K number, clearance date, predicate devices, testing
└─ Avg Execution Time: 2-3 seconds

TOOL 2: regulatory_database_query
├─ Purpose: Query internal regulatory database
├─ Data Sources: CFR Title 21, FDA Guidance, ISO/IEC standards
├─ Inputs: query_type, standards, device_class
├─ Outputs: Standard details, test requirements, FDA recognition
└─ Avg Execution Time: 1-2 seconds

TOOL 3: standards_search
├─ Purpose: Search ISO/IEC standards library
├─ Data Source: Internal standards database (10,000+ standards)
├─ Inputs: standard_code, version, search_query
├─ Outputs: Standard details, test methods, acceptance criteria
└─ Avg Execution Time: 1-2 seconds

TOOL 4: web_search
├─ Purpose: External research (PubMed, Google Scholar, etc.)
├─ Data Source: Brave Search API
├─ Inputs: search_query, max_results
├─ Outputs: Search results with relevance scores
└─ Avg Execution Time: 3-5 seconds

TOOL 5: document_analysis
├─ Purpose: Analyze uploaded user documents (PDFs, Word)
├─ Data Source: User uploads
├─ Inputs: document_file, analysis_type
├─ Outputs: Extracted text, key findings, structured data
└─ Avg Execution Time: 5-10 seconds (depends on doc size)
```

---

## LangGraph State Machine

### Complete State Schema

```python
from typing import TypedDict, Annotated, Sequence, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
import operator

class Mode1State(TypedDict):
    """Complete state schema for Mode 1: Interactive Manual"""

    # ============================================================================
    # SESSION CONTEXT
    # ============================================================================
    session_id: str                    # Unique session identifier
    user_id: str                       # User UUID
    tenant_id: str                     # Tenant UUID (multi-tenancy)
    mode: str                          # "mode_1_interactive_manual"

    # ============================================================================
    # AGENT SELECTION (Manual by user)
    # ============================================================================
    agent_id: str                      # Selected expert agent ID
    agent: Dict[str, Any]              # Full agent profile
    agent_persona: str                 # System prompt for agent
    sub_agent_pool: List[Dict]         # Available specialist sub-agents

    # ============================================================================
    # CONVERSATION STATE
    # ============================================================================
    messages: Annotated[Sequence[BaseMessage], operator.add]  # LangChain messages
    current_message: str               # Current user message being processed
    conversation_history: List[Dict]   # Historical messages (database format)
    turn_count: int                    # Number of conversation turns

    # ============================================================================
    # CONTEXT MANAGEMENT
    # ============================================================================
    context_window: str                # Compiled context for LLM
    rag_context: List[Dict]            # RAG-retrieved knowledge chunks
    multimodal_context: Optional[Dict] # Images, videos, audio analysis
    uploaded_documents: List[Dict]     # User-uploaded files

    # ============================================================================
    # SUB-AGENT ORCHESTRATION (Level 3)
    # ============================================================================
    needs_specialists: bool            # Whether to spawn specialists
    specialists_to_spawn: List[str]    # Specialist agent IDs to spawn
    spawned_specialist_ids: List[str]  # Spawned specialist UUIDs
    specialist_results: List[Dict]     # Results from specialist agents

    # ============================================================================
    # TOOL EXECUTION (Level 5)
    # ============================================================================
    needs_tools: bool                  # Whether tools are needed
    tools_to_use: List[str]            # Tool names to execute
    tool_results: List[Dict]           # Tool execution results

    # ============================================================================
    # REASONING & GENERATION
    # ============================================================================
    thinking_steps: List[Dict]         # Chain-of-thought reasoning steps
    reasoning_mode: str                # "chain_of_thought", "tree_of_thoughts"
    response: str                      # Final expert response
    citations: List[Dict]              # Source citations
    confidence_score: float            # Response confidence (0-1)

    # ============================================================================
    # WORKFLOW CONTROL
    # ============================================================================
    workflow_step: str                 # Current node name
    continue_conversation: bool        # Ready for next turn?
    error: Optional[str]               # Error message if any

    # ============================================================================
    # METADATA & ANALYTICS
    # ============================================================================
    tokens_used: Dict[str, int]        # {"prompt": N, "completion": N, "total": N}
    estimated_cost: float              # USD cost for this turn
    response_time_ms: int              # Total processing time
    timestamp: str                     # ISO timestamp

    # ============================================================================
    # RESPONSE METADATA
    # ============================================================================
    response_metadata: Dict[str, Any]  # Additional response context
    message_ids: Dict[str, str]        # {"user_message_id": "...", "assistant_message_id": "..."}


class Mode1Graph:
    """LangGraph state machine for Mode 1: Interactive Manual"""

    def create_graph(self) -> StateGraph:
        """Build the complete LangGraph workflow"""

        graph = StateGraph(Mode1State)

        # ========================================================================
        # ADD NODES
        # ========================================================================
        graph.add_node("load_agent", self.load_agent)
        graph.add_node("load_context", self.load_context)
        graph.add_node("update_context", self.update_context)
        graph.add_node("agent_reasoning", self.agent_reasoning)
        graph.add_node("spawn_specialists", self.spawn_specialists)
        graph.add_node("tool_execution", self.tool_execution)
        graph.add_node("generate_response", self.generate_response)
        graph.add_node("update_memory", self.update_memory)

        # ========================================================================
        # DEFINE EDGES
        # ========================================================================

        # Linear flow
        graph.set_entry_point("load_agent")
        graph.add_edge("load_agent", "load_context")
        graph.add_edge("load_context", "update_context")
        graph.add_edge("update_context", "agent_reasoning")

        # Conditional: Spawn specialists?
        graph.add_conditional_edges(
            "agent_reasoning",
            self.check_specialist_need,
            {
                "spawn_specialists": "spawn_specialists",
                "check_tools": "tool_execution",  # Skip specialists
                "generate": "generate_response"   # Skip both
            }
        )

        # After spawning specialists, check tools
        graph.add_conditional_edges(
            "spawn_specialists",
            self.check_tools_need,
            {
                "tool_execution": "tool_execution",
                "generate_response": "generate_response"
            }
        )

        # After tools, generate response
        graph.add_edge("tool_execution", "generate_response")

        # After response, update memory
        graph.add_edge("generate_response", "update_memory")

        # After memory, check continuation
        graph.add_conditional_edges(
            "update_memory",
            self.check_continuation,
            {
                "continue": END,  # Mode 1 ends after each message
                "error": END
            }
        )

        # ========================================================================
        # COMPILE GRAPH
        # ========================================================================
        from langgraph.checkpoint.sqlite import SqliteSaver
        checkpointer = SqliteSaver.from_conn_string(":memory:")

        return graph.compile(checkpointer=checkpointer)
```

### Conditional Edge Functions

```python
def check_specialist_need(self, state: Mode1State) -> str:
    """Determine if specialist sub-agents should be spawned"""

    if state.get("needs_specialists", False):
        return "spawn_specialists"
    elif state.get("needs_tools", False):
        return "check_tools"
    else:
        return "generate"

def check_tools_need(self, state: Mode1State) -> str:
    """Determine if tools should be executed"""

    if state.get("needs_tools", False):
        return "tool_execution"
    else:
        return "generate_response"

def check_continuation(self, state: Mode1State) -> str:
    """Determine if conversation should continue"""

    if state.get("error"):
        return "error"
    else:
        return "continue"  # Always END after one message in Mode 1
```

---

## Data Flow Diagrams

### Message Flow Timeline

```
Time: 0s ──────────────────────────────────────────────── 20s

User sends message
│
├─ 0-2s:   load_agent
│          ├─ Database query (500ms)
│          └─ Profile loading (1.5s)
│
├─ 2-4s:   load_context
│          ├─ History retrieval (1s)
│          └─ Message building (1s)
│
├─ 4-9s:   update_context
│          ├─ Query embedding (1s)
│          ├─ Semantic search (2s)
│          ├─ Keyword search (1s)
│          └─ Hybrid fusion (1s)
│
├─ 9-14s:  agent_reasoning
│          ├─ LLM reasoning call (4s)
│          └─ Decision parsing (1s)
│
├─ 14-17s: spawn_specialists (conditional)
│          ├─ Specialist 1 init (1s)
│          └─ Specialist 2 init (1s)
│
├─ 17-24s: tool_execution (conditional)
│          ├─ Tool 1 (predicate search) (3s)
│          └─ Tool 2 (standards query) (2s)
│          └─ Parallel execution (2s overlap)
│
├─ 24-32s: generate_response
│          ├─ Build prompt (1s)
│          ├─ LLM generation (6s, streaming)
│          └─ Citation extraction (1s)
│
└─ 32-34s: update_memory
           ├─ Save user message (500ms)
           ├─ Save assistant message (500ms)
           └─ Update session stats (500ms)

Total: 15-25 seconds typical (depends on specialist/tool usage)
```

### Data Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DATA DEPENDENCY GRAPH                                                  │
└─────────────────────────────────────────────────────────────────────────┘

session_id ─┬─→ load_agent ────→ agent_profile ───────────┐
            │                                               │
user_id ────┤                                               │
            │                                               │
tenant_id ──┴─→ load_context ──→ conversation_history ─────┤
                      │                                     │
current_message ──────┴─→ update_context ───→ rag_context ─┤
                                    │                       │
                                    │                       │
agent_profile ──────────────────────┴───→ agent_reasoning ─┤
                                              │             │
                                              ├─→ needs_specialists
                                              │   └─→ spawn_specialists ──→ specialist_results
                                              │                           │
                                              ├─→ needs_tools            │
                                              │   └─→ tool_execution ──→ tool_results
                                              │                           │
                                              │                           │
rag_context ─────────────────────────────────┴───────────────────────────┤
specialist_results ──────────────────────────────────────────────────────┤
tool_results ────────────────────────────────────────────────────────────┤
                                                                          │
                                                                          ▼
                                                              generate_response
                                                                          │
                                                                          ▼
                                                                      response
                                                                          │
                                                                          ▼
                                                                   update_memory
                                                                          │
                                                                          ▼
                                                                  message_persisted
```

---

## Tool Integration Points

### Tool Registry

```python
class ToolRegistry:
    """Registry of available tools for Mode 1"""

    def __init__(self):
        self.tools = {
            "predicate_device_search": PredicateDeviceSearchTool(),
            "regulatory_database_query": RegulatoryDatabaseQueryTool(),
            "standards_search": StandardsSearchTool(),
            "web_search": WebSearchTool(),
            "document_analysis": DocumentAnalysisTool(),
            "testing_calculator": TestingCalculatorTool()
        }

    async def execute_tool(
        self,
        tool_name: str,
        input_data: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a tool and return results"""

        tool = self.tools.get(tool_name)
        if not tool:
            return {"error": f"Tool '{tool_name}' not found"}

        try:
            result = await tool.execute(input_data, context)
            return result
        except Exception as e:
            return {"error": str(e)}
```

### Tool Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TOOL EXECUTION FLOW                                                    │
└─────────────────────────────────────────────────────────────────────────┘

agent_reasoning node
│
├─ Determine tools needed
│  └─ tools_to_use: ["predicate_device_search", "regulatory_database_query"]
│
▼
tool_execution node
│
├─ FOR EACH tool in tools_to_use:
│  │
│  ├─ Validate tool exists in registry
│  │
│  ├─ Extract input parameters from reasoning
│  │  └─ Example: {"query": "Smith Cardiac Monitor", "device_class": "II"}
│  │
│  ├─ Add context (tenant_id, user_id, permissions)
│  │
│  ├─ Execute tool asynchronously
│  │  ├─ Tool makes external API call or database query
│  │  ├─ Tool processes results
│  │  └─ Tool returns structured output
│  │
│  ├─ Log execution (duration, success, errors)
│  │
│  └─ Append result to tool_results list
│
├─ Emit SSE events for each tool execution
│  ├─ "step": "tool_execution" (start)
│  └─ "step": "tool_complete" (finish)
│
└─ Return updated state with tool_results
```

---

## Error Handling & Fallbacks

### Error Recovery Strategy

```python
class ErrorHandler:
    """Handle errors gracefully in Mode 1 workflow"""

    async def handle_node_error(
        self,
        node_name: str,
        error: Exception,
        state: Mode1State
    ) -> Mode1State:
        """Handle errors at node level"""

        logger.error(f"Error in {node_name}: {error}")

        # Error recovery strategies by node
        if node_name == "load_agent":
            # Critical error - agent not found
            state["error"] = f"Agent not found: {state['agent_id']}"
            state["response"] = "I apologize, but I couldn't load the expert profile. Please try selecting a different expert."
            return state

        elif node_name == "update_context":
            # Non-critical - can proceed without RAG
            logger.warning("RAG search failed, proceeding without retrieved context")
            state["rag_context"] = []
            state["context_window"] = "No additional context available."
            return state  # Continue workflow

        elif node_name == "tool_execution":
            # Non-critical - tools failed but can still generate response
            logger.warning(f"Tool execution failed: {error}")
            state["tool_results"].append({
                "error": str(error),
                "tool": "unknown"
            })
            return state  # Continue to generation

        elif node_name == "generate_response":
            # Critical error - cannot proceed
            state["error"] = "Failed to generate response"
            state["response"] = "I apologize, but I encountered an error generating my response. Please try again."
            return state

        else:
            # Generic error handling
            state["error"] = f"Error in {node_name}: {str(error)}"
            state["response"] = "I apologize, but I encountered an unexpected error. Please try again."
            return state
```

### Retry Logic

```python
class RetryHandler:
    """Implement retry logic for transient failures"""

    async def retry_with_backoff(
        self,
        func: Callable,
        max_retries: int = 3,
        base_delay: float = 1.0
    ) -> Any:
        """Retry function with exponential backoff"""

        for attempt in range(max_retries):
            try:
                result = await func()
                return result

            except Exception as e:
                if attempt == max_retries - 1:
                    raise  # Final attempt failed

                delay = base_delay * (2 ** attempt)  # Exponential backoff
                logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                await asyncio.sleep(delay)
```

---

## Performance Metrics

### Target Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Response Time (P50)** | 15-20s | End-to-end latency tracking |
| **Response Time (P95)** | 25-30s | Includes complex queries with tools |
| **Response Time (P99)** | 35-40s | Worst-case scenarios |
| **RAG Retrieval** | <3s | Vector search + reranking |
| **Tool Execution** | <5s per tool | Individual tool timing |
| **LLM Generation** | <8s | Token generation latency |
| **Database Operations** | <1s | Query + insert operations |

### Monitoring Points

```python
class PerformanceMonitor:
    """Monitor performance metrics throughout workflow"""

    async def track_node_performance(
        self,
        node_name: str,
        start_time: float,
        end_time: float,
        state: Mode1State
    ):
        """Track individual node performance"""

        duration_ms = (end_time - start_time) * 1000

        # Log to Prometheus
        node_duration_histogram.labels(
            mode="mode_1",
            node=node_name,
            agent_id=state["agent_id"]
        ).observe(duration_ms)

        # Log slow nodes
        if duration_ms > self.thresholds.get(node_name, 5000):
            logger.warning(
                f"Slow node detected: {node_name} took {duration_ms}ms "
                f"(threshold: {self.thresholds[node_name]}ms)"
            )

        # Store in state for analytics
        if "node_timings" not in state:
            state["node_timings"] = {}
        state["node_timings"][node_name] = duration_ms
```

---

## Conclusion

This detailed workflow visualization provides a comprehensive blueprint for implementing Ask Expert Mode 1 using LangGraph. Key takeaways:

1. **Agent Hierarchy**: 5-level system with dynamic sub-agent spawning
2. **State Management**: Comprehensive state schema tracks all context
3. **Tool Integration**: Modular tool registry with error handling
4. **Performance**: Target 15-20s P50 response time
5. **Scalability**: Designed for 10K+ concurrent users

This document serves as the definitive reference for translating Mode 1 requirements into a production LangGraph implementation.

---

**Next Steps**:
1. Implement LangGraph state machine with all nodes
2. Build tool registry with FDA, ISO/IEC integrations
3. Develop specialist sub-agent spawning logic
4. Create comprehensive test suite
5. Deploy with monitoring and observability
