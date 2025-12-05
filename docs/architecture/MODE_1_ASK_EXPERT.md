# Mode 1: Ask Expert - Complete Architecture Documentation

## Overview

Mode 1 ("Ask Expert") is VITAL's 1:1 AI consultation service where users interact directly with a single specialized expert agent. This document captures the complete architecture, implementation details, and learnings from building this feature.

---

## Table of Contents

1. [Concept & Purpose](#concept--purpose)
2. [Architecture Overview](#architecture-overview)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Data Flow](#data-flow)
6. [Key Features](#key-features)
7. [Technical Learnings](#technical-learnings)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Troubleshooting](#troubleshooting)

---

## Concept & Purpose

### What is Mode 1?

Mode 1 provides a **direct 1:1 conversation** with a specialized AI expert agent. Unlike Mode 3 (panel of experts) or Mode 4 (workflows), Mode 1 focuses on deep expertise from a single agent.

### Use Cases

- Regulatory guidance from an FDA specialist
- Clinical trial design consultation
- HEOR analysis with a health economist
- Pharmacovigilance queries with a safety expert

### Key Characteristics

| Aspect | Mode 1 Behavior |
|--------|-----------------|
| Agents | Single expert agent |
| Interaction | Conversational chat |
| Subagents | None |
| RAG | Yes (knowledge retrieval) |
| Tools | Optional (agent-specific) |
| Streaming | Real-time SSE |
| Citations | Inline with sources |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                    /apps/vital-system/src/app/(chat)/expert/[agentId]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐  │
│   │  Agent Selector │──▶│  Chat Interface │──▶│  useAskExpertStream()  │  │
│   │  (Card Grid)    │   │  (Messages)     │   │  (SSE Hook)            │  │
│   └─────────────────┘   └─────────────────┘   └───────────┬─────────────┘  │
│                                                            │                │
└────────────────────────────────────────────────────────────┼────────────────┘
                                                             │
                              HTTP POST + SSE Stream         │
                                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI ENGINE (FastAPI)                                │
│                    /services/ai-engine/src/main.py                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Endpoint: POST /api/mode1/manual/stream                                   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    LangGraph State Machine                           │  │
│   │                                                                       │  │
│   │   START                                                               │  │
│   │     │                                                                 │  │
│   │     ▼                                                                 │  │
│   │   load_session ──▶ validate_tenant ──▶ load_agent_profile            │  │
│   │                                              │                        │  │
│   │                                              ▼                        │  │
│   │                              load_conversation_history                │  │
│   │                                              │                        │  │
│   │                                              ▼                        │  │
│   │                              analyze_query_complexity                 │  │
│   │                                    │                                  │  │
│   │                    ┌───────────────┼───────────────┐                 │  │
│   │                    ▼               ▼               ▼                 │  │
│   │             should_use_rag?  should_use_tools?  (conditional)        │  │
│   │                    │               │                                  │  │
│   │                    ▼               ▼                                  │  │
│   │             rag_retrieval    execute_tools                           │  │
│   │             (+ fallback)                                              │  │
│   │                    │               │                                  │  │
│   │                    └───────┬───────┘                                  │  │
│   │                            ▼                                          │  │
│   │                   execute_expert_agent                                │  │
│   │                   (LLM with system prompt)                            │  │
│   │                            │                                          │  │
│   │                            ▼                                          │  │
│   │                generate_streaming_response                            │  │
│   │                (tag filtering + token streaming)                      │  │
│   │                            │                                          │  │
│   │                            ▼                                          │  │
│   │   validate_human_review ──▶ save_message ──▶ update_session_metadata │  │
│   │                                                        │              │  │
│   │                                                        ▼              │  │
│   │                                                       END             │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   Supabase   │  │   Pinecone   │  │   OpenAI/    │
            │   (Agents,   │  │   (Vector    │  │   Anthropic  │
            │    Sessions) │  │    Search)   │  │   (LLM)      │
            └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Backend Implementation

### File Location

```
/services/ai-engine/src/main.py
```

### LangGraph Workflow Definition

The Mode 1 workflow is defined using LangGraph's StateGraph:

```python
from langgraph.graph import StateGraph, END

# State definition
class Mode1State(TypedDict):
    session_id: str
    agent_id: str
    tenant_id: str
    message: str
    agent_profile: Optional[Dict]
    conversation_history: List[Dict]
    rag_sources: List[Dict]
    tool_results: List[Dict]
    response: str
    citations: List[Dict]
    confidence: float
    error: Optional[str]

# Graph construction
graph = StateGraph(Mode1State)

# Add nodes
graph.add_node("load_session", load_session_node)
graph.add_node("validate_tenant", validate_tenant_node)
graph.add_node("load_agent_profile", load_agent_profile_node)
graph.add_node("load_conversation_history", load_history_node)
graph.add_node("analyze_query_complexity", analyze_complexity_node)
graph.add_node("rag_retrieval", rag_retrieval_node)
graph.add_node("execute_tools", execute_tools_node)
graph.add_node("execute_expert_agent", execute_agent_node)
graph.add_node("generate_streaming_response", streaming_response_node)
graph.add_node("save_message", save_message_node)

# Define edges
graph.add_edge("load_session", "validate_tenant")
graph.add_edge("validate_tenant", "load_agent_profile")
# ... conditional edges based on query analysis
```

### Key Nodes Explained

#### 1. load_session
- Retrieves or creates session from Supabase
- Initializes conversation state
- Returns session metadata

#### 2. validate_tenant
- Verifies tenant_id from x-tenant-id header
- Checks agent belongs to tenant
- Returns 403 if unauthorized

#### 3. load_agent_profile
- Fetches agent configuration from `agents` table
- Includes: system_prompt, model, temperature, skills
- Caches frequently accessed agents

#### 4. rag_retrieval
- Queries Pinecone vector store
- Uses tenant-specific namespace
- **Fallback logic**: If no results, triggers WebSearch/PubMed

```python
async def rag_retrieval_node(state: Mode1State) -> Mode1State:
    # Query Pinecone
    results = await pinecone_client.query(
        vector=embed(state["message"]),
        namespace=f"tenant_{state['tenant_id']}",
        top_k=10
    )

    # Fallback if no results
    if not results or len(results) == 0:
        web_results = await web_search(state["message"])
        results = format_web_results(web_results)

    state["rag_sources"] = results
    return state
```

#### 5. execute_expert_agent
- Constructs prompt with agent personality + sources
- Instructs LLM to use `<thinking>` tags for reasoning
- Generates response with inline citations `[1]`, `[2]`

#### 6. generate_streaming_response
- Uses `astream_events(version="v2")` for real-time streaming
- Implements tag filtering state machine
- Sends SSE events to frontend

### Tag Filtering Implementation

The LLM is instructed to use `<thinking>...</thinking>` for internal reasoning. These tags must be filtered from the streamed output:

```python
class TagFilterState(Enum):
    NORMAL = "normal"
    IN_THINKING = "in_thinking"
    BUFFERING = "buffering"

async def stream_with_tag_filter(response_generator):
    state = TagFilterState.NORMAL
    buffer = ""

    async for token in response_generator:
        buffer += token

        if state == TagFilterState.NORMAL:
            if "<thinking>" in buffer:
                # Enter thinking mode - don't stream
                state = TagFilterState.IN_THINKING
                # Emit any content before the tag
                pre_tag = buffer.split("<thinking>")[0]
                if pre_tag:
                    yield {"type": "token", "content": pre_tag}
                buffer = buffer.split("<thinking>", 1)[1]
            else:
                # Check for partial tags
                partial_patterns = ['<', '<t', '<th', '<thi', '<thin',
                                   '<think', '<thinki', '<thinkin', '<thinking']
                if any(buffer.endswith(p) for p in partial_patterns):
                    continue  # Wait for more tokens
                yield {"type": "token", "content": buffer}
                buffer = ""

        elif state == TagFilterState.IN_THINKING:
            if "</thinking>" in buffer:
                # Exit thinking mode
                state = TagFilterState.NORMAL
                buffer = buffer.split("</thinking>", 1)[1]
```

### SSE Event Types

| Event Type | Payload | Purpose |
|------------|---------|---------|
| `thinking` | `{step, status, message}` | Workflow progress |
| `token` | `{content}` | Streaming text |
| `sources` | `[{title, url, type}]` | Retrieved sources |
| `done` | `{content, citations, confidence}` | Final response |
| `error` | `{message, code}` | Error handling |

---

## Frontend Implementation

### File Locations

```
/apps/vital-system/src/
├── app/(chat)/expert/[agentId]/
│   └── page.tsx              # Main chat page
├── components/chat/
│   ├── ChatMessage.tsx       # Message rendering
│   ├── ThinkingIndicator.tsx # Workflow progress
│   └── CitationBadge.tsx     # Clickable citations
├── hooks/
│   └── useAskExpertStream.ts # SSE connection hook
└── lib/
    └── ask-expert-client.ts  # API client
```

### useAskExpertStream Hook

```typescript
interface StreamState {
  isStreaming: boolean;
  isThinking: boolean;
  thinkingStep: string;
  content: string;
  sources: Source[];
  citations: Citation[];
  error: string | null;
}

export function useAskExpertStream() {
  const [state, setState] = useState<StreamState>(initialState);

  const sendMessage = async (params: SendMessageParams) => {
    const eventSource = new EventSource(
      `/api/mode1/manual/stream?${queryString}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'thinking':
          setState(s => ({
            ...s,
            isThinking: true,
            thinkingStep: data.message
          }));
          break;

        case 'token':
          setState(s => ({
            ...s,
            content: s.content + data.content
          }));
          break;

        case 'sources':
          setState(s => ({ ...s, sources: data.sources }));
          break;

        case 'done':
          setState(s => ({
            ...s,
            isStreaming: false,
            citations: data.citations,
            content: data.content
          }));
          eventSource.close();
          break;
      }
    };
  };

  return { ...state, sendMessage };
}
```

### Citation Rendering

Citations in the response text (`[1]`, `[2]`) are rendered as clickable badges:

```typescript
function renderContentWithCitations(content: string, citations: Citation[]) {
  // Regex to find [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;

  return content.split(citationRegex).map((part, index) => {
    const citationNum = parseInt(part);
    if (!isNaN(citationNum) && citations[citationNum - 1]) {
      return (
        <CitationBadge
          key={index}
          number={citationNum}
          citation={citations[citationNum - 1]}
        />
      );
    }
    return part;
  });
}
```

---

## Data Flow

### Request Flow

```
1. User types message in chat
2. Frontend calls POST /api/mode1/manual/stream
3. Backend validates tenant + agent
4. LangGraph workflow executes
5. RAG retrieval (+ fallback to websearch)
6. LLM generates response with <thinking> tags
7. Tag filter removes thinking content
8. Tokens streamed via SSE
9. Frontend renders in real-time
10. Done event includes citations
11. Message saved to database
```

### Citation Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  RAG Retrieval   │────▶│  Source Indexing │────▶│  LLM Prompt      │
│  - Pinecone      │     │  [1] FDA Guide   │     │  "Use [1] to     │
│  - WebSearch     │     │  [2] PubMed      │     │   cite sources"  │
│  - PubMed        │     │  [3] Internal KB │     │                  │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Frontend        │◀────│  Done Event      │◀────│  LLM Response    │
│  [1] clickable   │     │  citations: [    │     │  "...process [1] │
│  badge links to  │     │    {title, url}  │     │   requires [2]"  │
│  source          │     │  ]               │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Key Features

### 1. Real-Time Streaming

- Uses Server-Sent Events (SSE) for unidirectional streaming
- Tokens appear as they're generated
- Better UX than waiting for complete response

### 2. AI Reasoning Display

- LLM uses `<thinking>` tags for chain-of-thought
- Reasoning is captured but NOT streamed to user
- "Thinking" indicator shows workflow progress
- Final reasoning available in response metadata

### 3. Source Attribution

- All claims backed by sources
- Inline citation badges `[1]`, `[2]`, `[3]`
- Sources panel shows full references
- Click badge to see source details

### 4. Fallback Search

- If RAG returns no results:
  1. Try WebSearch (DuckDuckGo/Google)
  2. Try PubMed for medical queries
  3. Combine results with relevance scoring

### 5. Multi-Tenant Isolation

- Agents scoped to tenants
- RAG namespace per tenant
- Session isolation
- RLS policies in Supabase

---

## Technical Learnings

### 1. Tag Filtering Complexity

**Problem**: LLM tokenizers don't respect XML tag boundaries. A token might be `<thinking` (without closing `>`).

**Solution**: Expanded partial tag detection to include ALL possible partial sequences:

```python
partial_patterns = [
    '<', '<t', '<th', '<thi', '<thin', '<think', '<thinki', '<thinkin', '<thinking',
    '</t', '</th', '</thi', '</thin', '</think', '</thinki', '</thinkin', '</thinking',
    '<a', '<an', '<ans', '<answ', '<answe', '<answer',
    '</a', '</an', '</ans', '</answ', '</answe', '</answer'
]
```

### 2. Citation Title Extraction

**Problem**: Sources showing as "unknown" in citations.

**Solution**: Proper metadata extraction with fallback chain:

```python
title = (
    source.get("title") or
    source.get("metadata", {}).get("title") or
    source.get("page_content", "")[:50] + "..." or
    "Unknown Source"
)
```

### 3. SSE vs WebSocket

**Why SSE?**
- Simpler for unidirectional streaming
- Works through HTTP proxies
- Auto-reconnects on disconnect
- Native browser support via EventSource

**Why not WebSocket?**
- Bidirectional not needed for streaming
- More complex connection management
- Overkill for this use case

### 4. LangGraph Event Streaming

**Key API**: `astream_events(version="v2")`

```python
async for event in graph.astream_events(input, version="v2"):
    if event["event"] == "on_chat_model_stream":
        token = event["data"]["chunk"].content
        yield token
```

### 5. Buffer State Machine

Managing partial tags requires a state machine approach:

```
NORMAL ──[sees '<']──▶ BUFFERING ──[completes tag]──▶ IN_THINKING
                            │                              │
                            │                              │
                      [not a tag]                    [sees '</']
                            │                              │
                            ▼                              ▼
                         NORMAL ◀──────────────────── BUFFERING
```

---

## API Reference

### POST /api/mode1/manual/stream

**Request Headers:**
```
Content-Type: application/json
x-tenant-id: <tenant-uuid>
```

**Request Body:**
```json
{
  "agent_id": "uuid",
  "message": "What is FDA 510k?",
  "session_id": "uuid (optional)",
  "enable_rag": true,
  "enable_tools": false
}
```

**Response:** Server-Sent Events stream

**Event Examples:**

```
data: {"event": "thinking", "step": "rag_retrieval", "status": "running", "message": "Searching knowledge base..."}

data: {"event": "token", "content": "The FDA 510(k)"}

data: {"event": "token", "content": " is a premarket"}

data: {"event": "done", "content": "...", "citations": [...], "sources": [...], "confidence": 0.85}
```

---

## Database Schema

### Key Tables

#### agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  tenant_id UUID REFERENCES tenants(id),
  system_prompt TEXT,
  model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL DEFAULT 0.7,
  status TEXT DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### chat_sessions
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  citations JSONB,
  sources JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Troubleshooting

### Common Issues

#### 1. Tags appearing in output

**Symptom**: `<thinking>` or `<answer>` visible in chat

**Cause**: Partial tag detection incomplete

**Fix**: Ensure all partial patterns are in the detection list

#### 2. Citations showing "unknown"

**Symptom**: Source badges show "Unknown Source"

**Cause**: Metadata extraction not finding title field

**Fix**: Check source structure, add fallback chain

#### 3. SSE connection dropping

**Symptom**: Stream stops mid-response

**Cause**: Proxy timeout or network issue

**Fix**: Increase proxy timeout, implement reconnection logic

#### 4. No RAG results

**Symptom**: Agent responds without citing sources

**Cause**: Empty Pinecone namespace or wrong tenant filter

**Fix**: Verify namespace exists, check tenant_id in query

---

## Future Enhancements

1. **Conversation Memory**: Long-term memory across sessions
2. **Agent Handoff**: Transfer to specialist mid-conversation
3. **Voice Input/Output**: Speech-to-text integration
4. **Collaborative Mode**: Multiple users in same session
5. **Export/Share**: Save conversations as documents

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12 | Initial implementation |
| 1.1.0 | 2024-12 | Added tag filtering for <thinking> |
| 1.2.0 | 2024-12 | Fixed citation title extraction |
| 1.3.0 | 2024-12 | Added websearch/PubMed fallback |

---

*Last Updated: December 2024*
*Maintainer: VITAL Platform Team*
