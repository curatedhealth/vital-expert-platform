# VITAL Path - 4 Modes Architecture Diagram

## Complete System Flow: Frontend → Middleware → Backend

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Next.js React)                             │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Ask Expert UI Component                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Mode 1     │  │   Mode 2     │  │   Mode 3     │  │   Mode 4    │  │  │
│  │  │   Manual     │  │  Automatic   │  │ Autonomous-  │  │ Autonomous- │  │  │
│  │  │ Interactive  │  │   Agent      │  │  Automatic   │  │   Manual    │  │  │
│  │  │              │  │  Selection   │  │              │  │             │  │  │
│  │  │ User Selects│  │  System      │  │ System Select│  │ User Selects│  │  │
│  │  │   Agent      │  │   Selects    │  │ + Autonomous │  │ + Autonomous│  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │  │
│  │         │                  │                 │                 │          │  │
│  │         └──────────────────┴─────────────────┴─────────────────┘          │  │
│  │                              │                                              │  │
│  │                              ▼                                              │  │
│  │                    ┌──────────────────────┐                                │  │
│  │                    │  executeMode1()     │                                │  │
│  │                    │  executeMode2()     │                                │  │
│  │                    │  executeMode3()     │                                │  │
│  │                    │  executeMode4()     │                                │  │
│  │                    └──────────┬───────────┘                                │  │
│  └────────────────────────────────┼──────────────────────────────────────────┘  │
│                                   │                                               │
│                                   │ HTTP POST                                     │
│                                   ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js API Route                                     │  │
│  │              /api/ask-expert/orchestrate                                  │  │
│  │                                                                           │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  switch (mode) {                                                   │ │  │
│  │  │    case 'manual':        → executeMode1()                          │ │  │
│  │  │    case 'automatic':     → executeMode2()                          │ │  │
│  │  │    case 'autonomous':    → executeMode3()                          │ │  │
│  │  │    case 'multi-expert':  → executeMode4()                          │ │  │
│  │  │  }                                                                 │ │  │
│  │  └────────────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────┼──────────────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────────────┘
                                    │
                                    │ fetch() call
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE (API Gateway - Node.js)                      │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Express.js API Gateway                                │  │
│  │                         (Port 3001)                                      │  │
│  │                                                                           │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │  │
│  │  │ POST /api/       │  │ POST /api/       │  │ POST /api/       │        │  │
│  │  │ mode1/manual     │  │ mode2/automatic  │  │ mode3/autonomous │        │  │
│  │  │                  │  │                  │  │ -automatic       │        │  │
│  │  │ Timeout: 60s     │  │ Timeout: 90s     │  │                  │        │  │
│  │  └────────┬─────────┘  └────────┬─────────┘  │ Timeout: 120s     │        │  │
│  │           │                      │            └────────┬─────────┘        │  │
│  │           │                      │                     │                  │  │
│  │           │                      │  ┌──────────────────┘                  │  │
│  │           │                      │  │                                     │  │
│  │           │                      │  ▼                                     │  │
│  │           │            ┌──────────────────┐                              │  │
│  │           │            │ POST /api/       │                              │  │
│  │           │            │ mode4/autonomous │                              │  │
│  │           │            │ -manual          │                              │  │
│  │           │            │                  │                              │  │
│  │           │            │ Timeout: 120s     │                              │  │
│  │           │            └────────┬─────────┘                              │  │
│  │           │                     │                                         │  │
│  │           └─────────────────────┴─────────────────────────────────────────┘  │
│  │                                  │                                            │  │
│  │                                  │ axios.post()                               │  │
│  │                                  │                                            │  │
│  │                                  ▼                                            │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    │ to Python AI Engine
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Python AI Engine - FastAPI)                       │
│                              (Port 8000)                                        │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Endpoints                                      │  │
│  │                                                                           │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │ POST /api/       │  │ POST /api/       │  │ POST /api/       │         │  │
│  │  │ mode1/manual     │  │ mode2/automatic  │  │ mode3/autonomous │         │  │
│  │  │                  │  │                  │  │ -automatic       │         │  │
│  │  │ ✅ User provides │  │ ✅ System selects│  │ ✅ System selects│         │  │
│  │  │    agent_id      │  │    agent         │  │    agent +       │         │  │
│  │  │ ✅ Direct exec   │  │ ✅ Agent select  │  │    Autonomous    │         │  │
│  │  │ ✅ RAG enabled   │  │ ✅ RAG enabled   │  │    reasoning     │         │  │
│  │  │ ✅ Tools option  │  │ ✅ Tools option  │  │ ✅ RAG enabled    │         │  │
│  │  └────────┬─────────┘  └────────┬─────────┘  │ ✅ Tools enabled  │         │  │
│  │           │                      │            └────────┬─────────┘         │  │
│  │           │                      │                     │                  │  │
│  │           │                      │  ┌──────────────────┘                  │  │
│  │           │                      │  │                                     │  │
│  │           │                      │  ▼                                     │  │
│  │           │            ┌──────────────────┐                              │  │
│  │           │            │ POST /api/       │                              │  │
│  │           │            │ mode4/autonomous │                              │  │
│  │           │            │ -manual          │                              │  │
│  │           │            │                  │                              │  │
│  │           │            │ ✅ User provides │                              │  │
│  │           │            │    agent_id      │                              │  │
│  │           │            │ ✅ Autonomous    │                              │  │
│  │           │            │    reasoning     │                              │  │
│  │           │            │ ✅ RAG enabled   │                              │  │
│  │           │            │ ✅ Tools enabled  │                              │  │
│  │           │            └────────┬─────────┘                              │  │
│  │           │                     │                                         │  │
│  │           └─────────────────────┴─────────────────────────────────────────┘  │
│  │                                  │                                            │  │
│  │                                  ▼                                            │  │
│  │                    ┌──────────────────────────────────────┐                  │  │
│  │                    │     Agent Orchestrator              │                  │  │
│  │                    │      (Python Service)              │                  │  │
│  │                    └──────────────────┬───────────────────┘                  │  │
│  │                                       │                                        │  │
│  │                    ┌──────────────────┴───────────────────┐                  │  │
│  │                    │                                       │                  │  │
│  │                    ▼                                       ▼                  │  │
│  │      ┌─────────────────────────────┐    ┌─────────────────────────────┐      │  │
│  │      │   LLM Service (Python)     │    │   RAG Service (Python)      │      │  │
│  │      │                            │    │                             │      │  │
│  │      │ • OpenAI GPT-4             │    │ • Unified RAG Service       │      │  │
│  │      │ • Claude (via API)         │    │ • Pinecone Vector Search    │      │  │
│  │      │ • HuggingFace (local)      │    │ • Supabase Metadata         │      │  │
│  │      │ • Embeddings (HF/OpenAI)   │    │ • Domain Filtering          │      │  │
│  │      └────────────────────────────┘    └────────────────────────────┘      │  │
│  │                    │                                       │                  │  │
│  │                    │                                       │                  │  │
│  │                    └───────────────────┬───────────────────┘                  │  │
│  │                                        │                                      │  │
│  │                                        ▼                                      │  │
│  │                        ┌─────────────────────────┐                            │  │
│  │                        │   Response Generation  │                            │  │
│  │                        │   with Citations       │                            │  │
│  │                        └─────────────────────────┘                            │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────────────┘
                                    │
                                    │ JSON Response
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE FLOW                                      │
│                                                                                  │
│  Python AI Engine → API Gateway → Next.js Route → Frontend Component           │
│                                                                                  │
│  Streaming Response (SSE) with:                                                  │
│  • Agent selection metadata (Modes 2, 3)                                         │
│  • Autonomous reasoning steps (Modes 3, 4)                                       │
│  • RAG sources and citations                                                     │
│  • Final response content                                                        │
│  • Confidence scores                                                             │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Mode-Specific Flows

### **MODE 1: Manual Interactive**
```
User
 │
 │ Selects Agent
 ▼
Frontend (mode1-manual-interactive.ts)
 │
 │ fetch('/api/mode1/manual')
 ▼
API Gateway (/api/mode1/manual)
 │
 │ axios.post(AI_ENGINE_URL + '/api/mode1/manual')
 ▼
Python AI Engine
 │
 │ Uses provided agent_id
 │ Executes query directly
 │ RAG retrieval (if enabled)
 │ Tool execution (if enabled)
 ▼
Response: { agent_id, content, confidence, citations, metadata }
```

### **MODE 2: Automatic Agent Selection**
```
User
 │
 │ Provides query only
 ▼
Frontend (mode2-automatic-agent-selection.ts)
 │
 │ fetch('/api/mode2/automatic')
 ▼
API Gateway (/api/mode2/automatic)
 │
 │ axios.post(AI_ENGINE_URL + '/api/mode2/automatic')
 ▼
Python AI Engine
 │
 │ 1. Query agents table
 │ 2. Simple agent selection (enhanceable)
 │ 3. Execute query with selected agent
 │ 4. RAG retrieval (if enabled)
 │ 5. Tool execution (if enabled)
 ▼
Response: { 
   agent_id, 
   content, 
   confidence, 
   citations, 
   agent_selection: {
     selected_agent_id,
     selected_agent_name,
     selection_method,
     selection_confidence
   }
 }
```

### **MODE 3: Autonomous-Automatic**
```
User
 │
 │ Provides query only
 ▼
Frontend (mode3-autonomous-automatic.ts)
 │
 │ fetch('/api/mode3/autonomous-automatic')
 ▼
API Gateway (/api/mode3/autonomous-automatic)
 │
 │ axios.post(AI_ENGINE_URL + '/api/mode3/autonomous-automatic')
 ▼
Python AI Engine
 │
 │ 1. Query agents table
 │ 2. Agent selection (automatic)
 │ 3. Autonomous reasoning (simplified)
 │    - Query understanding
 │    - Context retrieval (enhanced RAG)
 │    - Response generation
 │ 4. RAG retrieval (enabled)
 │ 5. Tool execution (enabled)
 ▼
Response: { 
   agent_id, 
   content, 
   confidence, 
   citations,
   autonomous_reasoning: {
     iterations,
     tools_used,
     reasoning_steps,
     confidence_threshold,
     max_iterations
   },
   agent_selection: {
     selected_agent_id,
     selected_agent_name,
     selection_method,
     selection_confidence
   }
 }
```

### **MODE 4: Autonomous-Manual**
```
User
 │
 │ Selects Agent + Provides query
 ▼
Frontend (mode4-autonomous-manual.ts)
 │
 │ fetch('/api/mode4/autonomous-manual')
 ▼
API Gateway (/api/mode4/autonomous-manual)
 │
 │ axios.post(AI_ENGINE_URL + '/api/mode4/autonomous-manual')
 ▼
Python AI Engine
 │
 │ 1. Uses provided agent_id
 │ 2. Autonomous reasoning (simplified)
 │    - Query understanding
 │    - Context retrieval (enhanced RAG)
 │    - Response generation
 │ 3. RAG retrieval (enabled)
 │ 4. Tool execution (enabled)
 ▼
Response: { 
   agent_id, 
   content, 
   confidence, 
   citations,
   autonomous_reasoning: {
     iterations,
     tools_used,
     reasoning_steps,
     confidence_threshold,
     max_iterations
   }
 }
```

---

## Key Components

### **Frontend (Next.js)**
- **Components**: React UI components for each mode
- **Handlers**: `executeMode1()`, `executeMode2()`, `executeMode3()`, `executeMode4()`
- **Route**: `/api/ask-expert/orchestrate` (orchestrates mode selection)
- **Communication**: HTTP fetch to API Gateway

### **Middleware (API Gateway - Node.js)**
- **Framework**: Express.js
- **Purpose**: Route requests to Python AI Engine
- **Features**: 
  - Request validation
  - Error handling
  - Timeout protection
  - Tenant ID management
- **Routes**:
  - `/api/mode1/manual` → Python `/api/mode1/manual`
  - `/api/mode2/automatic` → Python `/api/mode2/automatic`
  - `/api/mode3/autonomous-automatic` → Python `/api/mode3/autonomous-automatic`
  - `/api/mode4/autonomous-manual` → Python `/api/mode4/autonomous-manual`

### **Backend (Python AI Engine)**
- **Framework**: FastAPI
- **Services**:
  - **Agent Orchestrator**: Main orchestration service
  - **LLM Service**: OpenAI, Claude, HuggingFace integration
  - **RAG Service**: Unified RAG with Pinecone + Supabase
  - **Embedding Service**: OpenAI or HuggingFace embeddings
- **Endpoints**:
  - `POST /api/mode1/manual`
  - `POST /api/mode2/automatic`
  - `POST /api/mode3/autonomous-automatic`
  - `POST /api/mode4/autonomous-manual`

---

## Golden Rule Compliance ✅

**ALL AI/ML services are in Python and accessed via API Gateway:**

- ✅ No direct OpenAI/Anthropic calls from TypeScript
- ✅ No LangChain imports in Mode handlers
- ✅ All LLM calls in Python
- ✅ All embedding generation in Python
- ✅ All RAG retrieval in Python
- ✅ All agent orchestration in Python

---

## Data Flow Summary

```
Frontend Request
    ↓
Next.js API Route (/api/ask-expert/orchestrate)
    ↓
Mode Handler (TypeScript - thin wrapper)
    ↓
API Gateway (Node.js - routes to Python)
    ↓
Python AI Engine (FastAPI - all AI/ML logic)
    ↓
Agent Orchestrator (Python)
    ↓
LLM Service + RAG Service (Python)
    ↓
Response (JSON with citations, metadata)
    ↓
API Gateway (forwards response)
    ↓
Next.js Route (streams to frontend)
    ↓
Frontend Component (displays response)
```

---

**All 4 modes follow the same architecture pattern, ensuring consistency and Golden Rule compliance!** ✅

