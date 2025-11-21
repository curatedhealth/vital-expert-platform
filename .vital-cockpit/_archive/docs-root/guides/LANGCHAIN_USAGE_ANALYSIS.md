# LangChain/LangGraph/LangSmith Usage Analysis - Ask Expert Service

## 📊 Current Usage Summary

### What We're Actually Using

Based on code analysis, here's what we're using from LangChain ecosystem for the **Ask Expert** chat service:

---

## 🎯 LangChain Packages Installed

```json
{
  "@langchain/community": "^0.3.56",
  "@langchain/core": "^0.3.77",
  "@langchain/langgraph": "^0.4.9",
  "@langchain/langgraph-checkpoint-sqlite": "^0.2.1",
  "@langchain/openai": "^0.6.12",
  "langchain": "^0.3.34"
}
```

---

## 🔍 What's Actually Being Used in Ask Expert Service

### ✅ **ACTIVELY USED** Components:

#### 1. **Vector Store & Embeddings** (RAG)
**File**: [`src/features/chat/services/langchain-service.ts`](src/features/chat/services/langchain-service.ts)

```typescript
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
```

**Usage**:
- `OpenAIEmbeddings` - Converts text to embeddings (text-embedding-ada-002)
- `SupabaseVectorStore` - Vector similarity search in Supabase
- Powers RAG (Retrieval Augmented Generation)

**Purpose**: Search knowledge base and retrieve relevant context

---

#### 2. **Document Processing**
```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { Document } from 'langchain/document';
```

**Usage**:
- `RecursiveCharacterTextSplitter` - Splits documents into chunks (2000 chars, 300 overlap)
- `WebPDFLoader` - Loads and parses PDF documents
- `Document` - LangChain document format

**Purpose**: Process uploaded PDFs/documents for knowledge base

---

#### 3. **LLM Integration**
```typescript
import { ChatOpenAI } from '@langchain/openai';
```

**Usage**:
- `ChatOpenAI` - OpenAI GPT integration (gpt-3.5-turbo)
- Used for generating responses with RAG context

**Purpose**: Generate AI responses

---

#### 4. **Conversational Chain (NOT ACTIVELY USED)**
```typescript
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
```

**Status**: ⚠️ **CODE EXISTS BUT NOT USED**
- `createConversationalChain()` method defined but never called
- Chat API uses direct `llm.invoke()` instead

---

### ❌ **NOT USED** Components:

#### 1. **LangGraph**
**Installed**: `@langchain/langgraph`, `@langchain/langgraph-checkpoint-sqlite`

**Status**: ❌ **NOT USED IN ASK EXPERT**
- No imports in chat service
- No graph-based workflows
- No state management with LangGraph

**Found In**: Some panel/workflow files have LangGraph references but not in main chat:
- `src/lib/services/langgraph-orchestrator.ts`
- `src/features/chat/services/langgraph-panel-orchestrator.ts`

---

#### 2. **LangSmith**
**Environment Variables**:
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=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
LANGCHAIN_PROJECT=vital-advisory-board
```

**Status**: ⚠️ **CONFIGURED BUT UNUSED IN CODE**
- No explicit LangSmith imports
- Tracing may work passively if LangChain detects env vars
- No active monitoring/logging code

---

## 📋 Current Ask Expert Chat Flow

**File**: [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts:57)

```typescript
// 1. User sends message
const { message, agent, chatHistory } = body;

// 2. Query knowledge base with RAG
const ragResult = await langchainRAGService.queryKnowledge(
  message,
  agent.id,
  chatHistory,
  agent,
  sessionId
);

// 3. Build prompt with RAG context
const prompt = `
  ${agent.systemPrompt}

  Context from knowledge base:
  ${ragContext}

  Chat History:
  ${chatHistory}

  User Question: ${message}
`;

// 4. Call LLM directly (NOT using chains)
const result = await this.llm.invoke(prompt);

// 5. Stream response back
```

---

## 🎯 What We're Actually Using vs What We Have

### ✅ **Core Features We USE**:
1. **Embeddings** - OpenAI text-embedding-ada-002
2. **Vector Store** - Supabase vector similarity search
3. **Document Loaders** - PDF processing
4. **Text Splitters** - Chunk documents
5. **ChatOpenAI** - Direct LLM calls

### ❌ **Features We DON'T USE**:
1. **Conversational Chains** - Defined but not called
2. **Memory/Buffer** - Not implemented in chat flow
3. **LangGraph** - Installed but unused for Ask Expert
4. **LangSmith Tracing** - Configured but not actively used
5. **Agents** - No LangChain agent framework
6. **Tools** - No LangChain tool integration

---

## 💡 What This Means

### Current Architecture:
```
User Message
  ↓
Vector Search (LangChain VectorStore)
  ↓
Retrieve Context
  ↓
Build Prompt Manually
  ↓
Direct LLM Call (ChatOpenAI.invoke)
  ↓
Stream Response
```

### What LangChain Offers (But We're Not Using):
```
User Message
  ↓
ConversationalRetrievalQAChain
  ↓ (handles all of this automatically)
  - Memory management
  - Context retrieval
  - Prompt templating
  - Response generation
  ↓
Structured Response
```

---

## 📊 Usage Breakdown

| Component | Installed? | Used? | Purpose | Used In |
|-----------|-----------|-------|---------|---------|
| OpenAIEmbeddings | ✅ | ✅ | Generate embeddings | RAG search |
| SupabaseVectorStore | ✅ | ✅ | Vector similarity search | Knowledge retrieval |
| ChatOpenAI | ✅ | ✅ | LLM responses | Response generation |
| Document Loaders | ✅ | ✅ | Load PDFs | Knowledge upload |
| Text Splitters | ✅ | ✅ | Chunk documents | Knowledge processing |
| ConversationalChain | ✅ | ❌ | Conversation management | **Not used** |
| BufferMemory | ✅ | ❌ | Chat history | **Not used** |
| PromptTemplate | ✅ | ❌ | Prompt engineering | **Not used** |
| LangGraph | ✅ | ❌ | Workflow orchestration | **Not in Ask Expert** |
| LangSmith | ✅ | ⚠️ | Tracing/monitoring | **Passive only** |

---

## 🔧 Simplified Implementation

### What We Could Do Without LangChain:

```typescript
// 1. Embeddings - Direct OpenAI API
const embedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: query
});

// 2. Vector Search - Direct Supabase RPC
const { data } = await supabase.rpc('match_documents', {
  query_embedding: embedding.data[0].embedding,
  match_count: 5
});

// 3. LLM Call - Direct OpenAI API
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: query }
  ]
});
```

**Result**: Same functionality, fewer dependencies

---

## 💰 Token Tracking Integration

### Current Gap:
- LangChain `ChatOpenAI` doesn't expose token usage
- Our token tracking system can't capture usage

### Solution Options:

#### Option 1: Use Direct OpenAI SDK
```typescript
// Switch from LangChain ChatOpenAI to direct OpenAI
const response = await openai.chat.completions.create({...});
const tokens = {
  prompt: response.usage.prompt_tokens,
  completion: response.usage.completion_tokens,
  total: response.usage.total_tokens
};
// ✅ Can track tokens
```

#### Option 2: Keep LangChain, Add Callbacks
```typescript
import { LangChainTracer } from "langchain/callbacks";

const callbacks = [
  new LangChainTracer({
    onLLMEnd: (output) => {
      // Track tokens here
      trackTokenUsage(output.llmOutput);
    }
  })
];

await llm.invoke(prompt, { callbacks });
// ✅ Can track via callbacks
```

---

## 📈 Recommendations

### Option A: **Keep LangChain (Current Approach)**
**Pros**:
- Already implemented
- Easy vector search integration
- Document processing utilities
- Future-proof for advanced features

**Cons**:
- Extra dependencies
- Not using full capabilities
- Token tracking harder
- More complex than needed

**Action Items**:
1. ✅ Add LangChain callbacks for token tracking
2. ✅ Implement conversation memory properly
3. ✅ Use ConversationalRetrievalQAChain
4. ✅ Enable LangSmith tracing for debugging

---

### Option B: **Remove LangChain (Simplified)**
**Pros**:
- Simpler codebase
- Direct token tracking
- Full control over flow
- Fewer dependencies
- Better performance

**Cons**:
- Need to rewrite vector search
- Lose document processing utils
- Manual prompt management
- More code to maintain

**Action Items**:
1. ❌ Replace OpenAIEmbeddings with direct API
2. ❌ Replace SupabaseVectorStore with direct Supabase RPC
3. ❌ Replace ChatOpenAI with direct OpenAI SDK
4. ❌ Implement document processing manually

---

### Option C: **Hybrid Approach (Recommended)**
**Pros**:
- Use LangChain for utilities (embeddings, doc processing)
- Use direct OpenAI for LLM calls (token tracking)
- Best of both worlds

**Action Items**:
1. ✅ Keep LangChain for embeddings & vector search
2. ✅ Keep LangChain for document processing
3. ✅ Switch to direct OpenAI SDK for LLM calls
4. ✅ Integrate with token tracking system

**Code Change**:
```typescript
// Keep for RAG
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

// Replace this:
// const result = await this.llm.invoke(prompt);

// With direct OpenAI:
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [...],
});

// ✅ Now we have token usage
const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
```

---

## 🎯 Final Verdict

### **Current State**:
We're using **~30%** of LangChain's capabilities:
- ✅ Embeddings
- ✅ Vector store
- ✅ Document processing
- ❌ Chains
- ❌ Memory
- ❌ Agents
- ❌ LangGraph
- ⚠️ LangSmith (passive)

### **Recommended Action** (Option C - Hybrid):

1. **Keep LangChain for**:
   - Embeddings (`OpenAIEmbeddings`)
   - Vector search (`SupabaseVectorStore`)
   - Document loading (`WebPDFLoader`)
   - Text splitting (`RecursiveCharacterTextSplitter`)

2. **Replace with Direct API**:
   - LLM calls: Use OpenAI SDK directly
   - Token tracking: Built into OpenAI response
   - Memory: Manual implementation (we already do this)

3. **Remove**:
   - `ConversationalRetrievalQAChain` (unused)
   - `BufferMemory` (unused)
   - LangGraph (not needed for simple chat)

4. **Add**:
   - Direct OpenAI SDK integration
   - Token tracking middleware
   - Custom conversation memory

---

## 📝 Implementation Plan

### Phase 1: Token Tracking (Immediate)
```typescript
// File: src/features/chat/services/openai-chat-service.ts
import OpenAI from 'openai';
import { trackTokenUsage } from '@/lib/token-tracking';

export async function generateResponse(prompt, agent, sessionId) {
  const response = await openai.chat.completions.create({
    model: agent.model || 'gpt-3.5-turbo',
    messages: buildMessages(prompt, agent),
  });

  // Track tokens
  await trackTokenUsage({
    service_type: '1:1_conversation',
    agent_id: agent.id,
    user_id: sessionId,
    provider: 'openai',
    model_name: response.model,
    prompt_tokens: response.usage.prompt_tokens,
    completion_tokens: response.usage.completion_tokens,
    total_tokens: response.usage.total_tokens,
    // Calculate cost based on model pricing
  });

  return response.choices[0].message.content;
}
```

### Phase 2: Keep RAG with LangChain
```typescript
// Keep existing RAG search
const searchResults = await langchainRAGService.vectorStore
  .similaritySearchWithScore(query, 5);

// Use results in direct OpenAI call
const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: buildSystemPrompt(agent, searchResults) },
    ...chatHistory,
    { role: 'user', content: query }
  ]
});
```

### Phase 3: Clean Up Unused
```bash
# Remove if not using LangGraph for Ask Expert
npm uninstall @langchain/langgraph @langchain/langgraph-checkpoint-sqlite

# Or keep if using elsewhere (panel orchestration, etc.)
```

---

## 📊 Cost Impact

### Current (with LangChain):
- Embeddings: $0.0001 per 1K tokens (text-embedding-ada-002)
- LLM: $0.0015 per 1K tokens (gpt-3.5-turbo)
- **No token tracking** ❌

### Recommended (Hybrid):
- Embeddings: $0.0001 per 1K tokens (same, via LangChain)
- LLM: $0.0015 per 1K tokens (same, via direct API)
- **Full token tracking** ✅
- **Budget enforcement** ✅
- **Cost analytics** ✅

**Result**: Same cost, better visibility and control

---

## 🔗 Related Files

### Currently Using LangChain:
- [`src/features/chat/services/langchain-service.ts`](src/features/chat/services/langchain-service.ts) - RAG service
- [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) - Chat API
- [`src/app/api/knowledge/upload/route.ts`](src/app/api/knowledge/upload/route.ts) - Document upload

### Token Tracking System:
- [`vital_langchain_tracker_complete.py`](vital_langchain_tracker_complete.py) - Python tracker
- [`database/sql/migrations/2025/supabase-migration-langchain-updated.sql`](database/sql/migrations/2025/supabase-migration-langchain-updated.sql) - DB schema
- [`TOKEN_TRACKING_SETUP_COMPLETE.md`](TOKEN_TRACKING_SETUP_COMPLETE.md) - Setup docs

---

**Status**: ✅ Analysis Complete

**Next Step**: Choose implementation option (A, B, or C) and proceed with integration

Last Updated: 2025-10-04
