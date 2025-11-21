# VITAL AI Platform - Complete Architecture Map

## Core Ask Expert System (Phase 3 - Working)

### 1. Main Orchestration Engine
- **`/api/ask-expert/orchestrate`** ✅ Phase 3 - SimplifiedOrchestrator
  - Uses: `/src/lib/orchestration/simplified-orchestrator.ts`
  - Tested: 26/26 integration tests passing
  - Modes: query_automatic, query_manual, chat_automatic, chat_manual, agent

### 2. Frontend Interface
- **`/app/(app)/ask-expert/page.tsx`** ✅ Updated to use Phase 3
  - Calls: `/api/ask-expert/orchestrate`
  - UI: 2 toggles (Automatic/Autonomous)

### 3. Supporting Routes
- **`/api/ask-expert/chat`** - Chat endpoint
- **`/api/ask-expert/generate-document`** - Document generation

## Essential Generation & Extraction Features

### 4. Document Generation
- **`/api/generate/structured`** ⚠️ Has type errors - NEEDS FIX
  - Purpose: Generate structured documents from extracted entities
  - Types: clinical_summary, regulatory_document, research_report, market_access
  - Uses: Schema-driven generation
  
### 5. Entity Extraction & Verification
- **`/api/extractions/verify`** - Verify extracted entities
- **`/api/extractions/[id]`** - Get extraction details
  - Purpose: Quality control for medical entity extraction

### 6. AI Enhancement Features
- **`/api/generate-persona`** ⚠️ Needs review
  - Purpose: Generate AI agent personas
  - Connection: Should integrate with agent system

- **`/api/generate-system-prompt`** ⚠️ Needs review
  - Purpose: Generate system prompts for agents
  - Connection: Should integrate with Phase 3 orchestration

## Agent Management System

### 7. Agent Operations
- **`/api/agents`** ✅ Working - Agent listing
- **`/api/agents-crud`** ✅ Working - CRUD operations
- **`/api/agent-bulk`** - Bulk agent operations

## Knowledge & RAG System

### 8. Knowledge Base
- **`/api/knowledge`** ✅ Working - Knowledge management
- **`/api/rag`** ✅ Working - RAG queries
- **`/api/rag-metrics`** - RAG performance metrics

### 9. Prompt System
- **`/api/prompt-starters`** ✅ Working - Prompt suggestions
- **`/api/prompts`** - Prompt management
- **`/api/prompts-crud`** - Prompt CRUD

## Integration Points Needed

### Phase 3 → Generation Pipeline
```
Orchestrator Output → Entity Extraction → Document Generation
```

### Phase 3 → Agent Enhancement
```
Agent Selection → Persona Generation → System Prompt Generation
```

### Phase 3 → Knowledge Base
```
Query → RAG Retrieval → Context Enhancement → Response
```

## Current Issues to Fix

1. **`/api/generate/structured/route.ts:125`** - Missing SchemaType properties
2. Check if extractions routes have errors
3. Connect generation features to Phase 3 orchestration
4. Ensure persona/prompt generation integrates with agent system

