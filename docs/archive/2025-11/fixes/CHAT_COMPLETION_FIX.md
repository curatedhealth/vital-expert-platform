# Chat Completion Issue - Root Cause & Solution

## Problem Summary

When trying to query an agent, you're getting:
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Root Cause Analysis

### Issue 1: Wrong Service
- **Current Setup**: Frontend → AI Engine (port 8000)
- **Problem**: AI Engine (port 8000) only has hybrid search endpoints (`/api/v1/search`)
- **Missing**: Mode 1 manual interactive endpoints (`/mode1/manual`)

### Issue 2: API Gateway Authentication
- **Setup**: API Gateway (port 3001) requires authentication
- **Problem**: Frontend doesn't pass auth tokens
- **Result**: Returns HTML login page instead of JSON

## Current Service Architecture

```
Frontend (port 3000)
    ↓ calls /api/ask-expert/orchestrate
    ↓
Orchestrate Route 
    ↓ calls Mode 1 service
    ↓
Mode 1 Service 
    ↓ tries to call /mode1/manual
    ↓
❌ AI Engine (port 8000) - DOESN'T HAVE THIS ENDPOINT
❌ API Gateway (port 3001) - REQUIRES AUTH
```

## What Services Are Running

1. ✅ **AI Engine** (port 8000): Hybrid search only
   - Endpoints: `/api/v1/search/*`
   - Status: Healthy
   - Purpose: Agent search/ranking

2. ✅ **API Gateway** (port 3001): Requires authentication
   - Status: Running but redirects to login
   - Purpose: Route requests to Python services

3. ✅ **Frontend** (port 3000): Next.js app
   - Status: Running
   - Has: `/api/ask-expert/orchestrate` endpoint

## Solution Options

### Option 1: Use Built-in Orchestrate Endpoint (RECOMMENDED)
The frontend already has a complete orchestration system that doesn't need external services.

**Current Flow** (BROKEN):
```
Frontend → Orchestrate API → Mode 1 Service → External AI Engine ❌
```

**Fixed Flow** (WORKING):
```
Frontend → Orchestrate API → Built-in LLM → Response ✅
```

**Implementation**:
```typescript
// The orchestrate endpoint already handles everything internally
// No external AI Engine needed for basic Mode 1
```

### Option 2: Mock Mode 1 Responses for Development
Create a mock endpoint that returns test responses.

### Option 3: Set up Complete Python AI Services Stack
This requires:
1. Starting the full Python AI services with Mode 1 endpoints
2. Configuring authentication properly
3. More complex setup

## Recommended Fix (Option 1 - Simplest)

The orchestrate endpoint at `/api/ask-expert/orchestrate` should work independently without needing external Python services for Mode 1.

Let me check if the Mode 1 handler is trying to call external services unnecessarily:

### Files to Check/Fix:
1. `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts`
2. `apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts`

### Current Mode 1 Handler Issues:
```typescript
// ❌ PROBLEM: Trying to call external AI Engine
const API_GATEWAY_URL = 'http://localhost:8000';
const response = await fetch(`${API_GATEWAY_URL}/mode1/manual`, {
  // This endpoint doesn't exist!
});
```

### Proposed Fix:
```typescript
// ✅ SOLUTION: Use built-in LLM service
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  modelName: config.model || "gpt-4",
  temperature: config.temperature || 0.7,
});

// Stream response directly without external service
```

## Agent Display Name Issue

**Status**: ✅ FIXED (needs page refresh)

The agent display name cleaning is now implemented in `ask-expert-context.tsx`:
```typescript
displayName = String(displayName)
  .replace(/\[bea\]d-_agent_avatar_/gi, '')  // Remove malformed prefixes  
  .replace(/^[^a-zA-Z]+/, '')                 // Remove leading non-letters
  .trim();
```

## Immediate Actions Needed

### Step 1: Verify Current Setup
```bash
# Check what's actually running
lsof -ti:8000  # AI Engine
lsof -ti:3001  # API Gateway  
lsof -ti:3000  # Frontend

# Test AI Engine
curl http://localhost:8000/health

# Test what endpoints AI Engine has
curl http://localhost:8000/docs
```

### Step 2: Check Mode 1 Implementation
The Mode 1 handler should NOT require external Python services for basic chat completion.

**Check if Mode 1 is using**:
- ❌ External API calls (breaks if service unavailable)
- ✅ Built-in LangChain LLM (works independently)

### Step 3: Temporary Workaround
Until proper fix, you can use Mode 2 (Automatic Agent Selection) which might have different routing.

## Expected vs Actual

### Expected Behavior:
1. User selects agent
2. User types message
3. Frontend calls `/api/ask-expert/orchestrate`
4. Orchestrate calls Mode 1 handler
5. Mode 1 uses built-in LLM
6. Response streams back to user ✅

### Actual Behavior:
1. User selects agent ✅
2. User types message ✅
3. Frontend calls `/api/ask-expert/orchestrate` ✅
4. Orchestrate calls Mode 1 handler ✅
5. Mode 1 tries to call external service ❌
6. External service doesn't have endpoint ❌
7. Error returned ❌

## Next Investigation Steps

1. **Check Mode 1 implementation**: Does it really need external Python service?
2. **Check orchestrate route**: Is it properly configured to use built-in LLM?
3. **Check environment variables**: Are LLM API keys configured?

```bash
# Check if OpenAI key is set
echo $OPENAI_API_KEY

# Check .env.local
cat .env.local | grep OPENAI
```

## Long-term Solution

The system should work like this:

**For Simple Chat (Mode 1)**:
```
Frontend → Orchestrate → Built-in LLM (LangChain) → Response
```

**For Advanced Features (RAG, Tools)**:
```
Frontend → Orchestrate → Built-in LLM + RAG Service → Response
```

**External Python Services Only For**:
- Vector search/embeddings
- Complex graph operations
- Heavy ML workloads

**NOT for**:
- Simple chat completions
- Basic agent conversations
- Streaming responses

## Files That Need Review

1. `mode1-manual-interactive.ts` - Currently trying to call external service
2. `orchestrate/route.ts` - Should handle Mode 1 internally  
3. `.env.local` - Need to verify OpenAI key is set

## Quick Test

Try this command to see if Mode 1 can work without external services:

```bash
cd apps/digital-health-startup
# Check if OpenAI key exists
grep OPENAI_API_KEY .env.local

# If key exists, Mode 1 should work without external services
```

If OpenAI key is configured, Mode 1 should use it directly via LangChain without needing the Python AI Engine.

