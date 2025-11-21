# 🔴 Golden Rule Complete Audit Report

**Date:** January 31, 2025  
**Audit Scope:** Complete backend codebase audit for AI/ML services  
**Golden Rule:** **ALL AI/ML related services MUST be in Python and accessed via API Gateway**

---

## Executive Summary

This audit identified **147+ violations** across the codebase where AI/ML services are implemented in TypeScript/JavaScript instead of Python. These violations are categorized by priority and type.

---

## 🚨 Critical Violations (Immediate Action Required)

### Category 1: Direct OpenAI API Calls (HIGH PRIORITY)

#### 1.1 OpenAI Embedding Service 🔴
**File:** `apps/digital-health-startup/src/lib/services/embeddings/openai-embedding-service.ts`
- **Line 6:** `import { OpenAI } from 'openai';` - Direct OpenAI import
- **Line 31-32:** `private client: OpenAI;` - Direct OpenAI client instantiation
- **Line 45-49:** Direct OpenAI client initialization
- **Line 91-95:** `await this.client.embeddings.create()` - Direct embedding API call

**Status:** ⚠️ **ACTIVELY USED** - Called by:
- `unified-rag-service.ts`
- `pinecone-vector-service.ts`
- `agent-embedding-service.ts`
- `agent-graphrag-service.ts`
- `agent-selector-service.ts`

**Action Required:**
- ❌ **REMOVE**: All direct OpenAI embedding calls
- ✅ **REPLACE**: Call Python AI-engine via API Gateway: `POST /api/metadata/process` or `/api/rag/query`
- ✅ **MIGRATE**: Logic to `services/ai-engine/src/services/huggingface_embedding_service.py` or similar

---

#### 1.2 Ask Expert Chat Route 🔴
**File:** `apps/digital-health-startup/src/app/api/ask-expert/chat/route.ts`
- **Line 13:** `import OpenAI from 'openai';` - Direct OpenAI import
- **Line 21-23:** `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });` - Direct OpenAI instantiation
- **Line 152-156:** `await openai.embeddings.create()` - Direct embedding API call
- **Line 275+:** Likely uses OpenAI for chat completions (needs full audit)

**Status:** ⚠️ **ACTIVE ROUTE** - Legacy endpoint, check if still in use

**Action Required:**
- ❌ **DISABLE** or **MIGRATE**: Should use Python AI-engine via API Gateway
- ✅ **REPLACE**: All OpenAI calls with API Gateway routes (`/api/mode1/manual`, `/api/mode2/automatic`, etc.)

---

#### 1.3 Agent Selector Service 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/agent-selector-service.ts`
- **Line 91:** `private openaiApiKey: string;` - Direct OpenAI API key usage
- **Line 110:** `this.openaiApiKey = process.env.OPENAI_API_KEY!;` - Direct API key access
- **Line 142-169:** Direct `fetch()` to `https://api.openai.com/v1/chat/completions` for query analysis
- **Line 790-800:** Direct `fetch()` to `https://api.openai.com/v1/embeddings` for embedding generation

**Status:** ⚠️ **ACTIVE** - Used in Mode 2 and Mode 3 handlers (though handlers were updated to use Python, imports may still exist)

**Action Required:**
- ❌ **REMOVE**: All direct OpenAI API calls
- ✅ **MIGRATE**: `analyzeQuery()` to Python service
- ✅ **MIGRATE**: `generateEmbedding()` to Python service
- ✅ **UPDATE**: Mode handlers to remove dependency on this service

---

#### 1.4 LLM Provider Service 🔴
**File:** `apps/digital-health-startup/src/services/llm-provider.service.ts`
- **Line 595-647:** `callOpenAI()` method with direct `fetch()` to OpenAI API
- **Line 649-698:** `callAnthropic()` method with direct API calls

**File:** `apps/digital-health-startup/src/shared/services/llm/llm-provider.service.ts`
- Same violations as above

**Status:** ⚠️ **CHECK USAGE** - Check if this service is actively used

**Action Required:**
- ✅ **IF USED**: Migrate to Python service
- ✅ **IF UNUSED**: Mark as deprecated or remove

---

#### 1.5 Intelligent Agent Router 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/intelligent-agent-router.ts`
- **Line 110:** `const completion = await openai.chat.completions.create({` - Direct OpenAI call

**Action Required:**
- ❌ **REMOVE**: Direct OpenAI call
- ✅ **REPLACE**: Use Python AI-engine via API Gateway

---

#### 1.6 Supabase RAG Service 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/supabase-rag-service.ts`
- **Line 119:** `const response = await this.openai.chat.completions.create({` - Direct OpenAI call

**Action Required:**
- ❌ **REMOVE**: Direct OpenAI call
- ✅ **REPLACE**: Use Python AI-engine via API Gateway

---

#### 1.7 API Routes with Direct OpenAI Calls 🔴

**File:** `apps/digital-health-startup/src/app/api/generate-system-prompt/route.ts`
- **Line 61:** `const completion = await openai.chat.completions.create({`

**File:** `apps/digital-health-startup/src/app/api/generate-persona/route.ts`
- **Line 119:** `const completion = await openai.chat.completions.create({`

**File:** `apps/digital-health-startup/src/app/api/agents/recommend/route.ts`
- **Line 185:** `const completion = await openai.chat.completions.create({`

**File:** `apps/digital-health-startup/src/app/api/ask-expert/generate-document/route.ts`
- **Line 142:** `const completion = await openai.chat.completions.create({`

**Action Required:**
- ❌ **REMOVE**: All direct OpenAI calls
- ✅ **REPLACE**: Call Python AI-engine via API Gateway

---

### Category 2: Direct LangChain Usage (HIGH PRIORITY)

#### 2.1 ReAct Engine 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/react-engine.ts`
- **Line 8:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 29:** `private llm: ChatOpenAI;` - Direct LangChain OpenAI usage
- **Line 35-39:** Direct OpenAI LLM instantiation
- **Line 371, 428, 577, 628, 767, 1009, 1056, 1091:** Multiple `llm.invoke()` calls

**Status:** ⚠️ **ACTIVE** - Used in Mode 3 and Mode 4 (though modes were updated, imports may still exist)

**Action Required:**
- ❌ **REMOVE**: All LangChain OpenAI usage
- ✅ **MIGRATE**: All ReAct logic to Python

---

#### 2.2 Chain-of-Thought Engine 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/chain-of-thought-engine.ts`
- **Line 8:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 69:** `private llm: ChatOpenAI;` - Direct LangChain OpenAI usage
- **Line 72-76:** Direct OpenAI LLM instantiation
- **Line 126, 196, 278, 368:** Multiple `llm.invoke()` calls

**Status:** ⚠️ **ACTIVE** - Used in Mode 3 and Mode 4

**Action Required:**
- ❌ **REMOVE**: All LangChain OpenAI usage
- ✅ **MIGRATE**: All CoT logic to Python

---

#### 2.3 Unified LangGraph Orchestrator 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/unified-langgraph-orchestrator.ts`
- **Line 34:** `import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';` - LangChain imports
- **Line 30-39:** Multiple LangChain imports (StateGraph, ChatPromptTemplate, etc.)
- **Line 687:** `new SupabaseVectorStore(this.embeddings, {` - LangChain vector store
- **Line 832, 989, 1682:** Multiple `structuredLLM.invoke()` calls
- **Line 1867:** `await this.workflow.invoke(input, {` - LangGraph workflow invocation

**Status:** ⚠️ **ACTIVE** - Major orchestrator component

**Action Required:**
- ❌ **REMOVE**: All LangChain/LangGraph usage
- ✅ **MIGRATE**: All orchestration logic to Python
- ✅ **REPLACE**: Use Python AI-engine via API Gateway

---

#### 2.4 Unified LangGraph Orchestrator Nodes 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/unified-langgraph-orchestrator-nodes.ts`
- **Line 145-151:** Direct `new ChatOpenAI()` instantiation
- **Line 169:** `const response = await llm.invoke([` - Direct LLM invocation
- **Line 269, 480:** Additional `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: All LangChain LLM usage
- ✅ **MIGRATE**: All node logic to Python

---

#### 2.5 Enhanced LangChain Service 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/enhanced-langchain-service.ts`
- **Line 28:** `private llm: ChatOpenAI;` - LangChain OpenAI
- **Line 29:** `private embeddings: OpenAIEmbeddings;` - LangChain embeddings
- **Line 39-44:** Direct ChatOpenAI instantiation
- **Line 47-50:** Direct OpenAIEmbeddings instantiation
- **Line 65:** LangChain vector store
- **Line 139:** `await this.llm.invoke([` - Direct LLM invocation

**Action Required:**
- ❌ **REMOVE**: All LangChain usage
- ✅ **REPLACE**: Use Python AI-engine via API Gateway

---

#### 2.6 LangGraph Orchestrator 🔴
**File:** `apps/digital-health-startup/src/lib/services/langgraph-orchestrator.ts`
- **Line 207, 288:** `await app.invoke(` - LangGraph invocation
- **Line 353:** `app.stream(` - LangGraph streaming
- **Line 925, 990:** Additional LangGraph/LLM calls

**Action Required:**
- ❌ **REMOVE**: All LangGraph usage
- ✅ **MIGRATE**: To Python AI-engine

---

### Category 3: Agent Pattern Services (MEDIUM PRIORITY)

#### 3.1 Chain-of-Thought Consistency 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/patterns/cot-consistency.ts`
- **Line 25:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Line 105:** `private llm: ChatOpenAI | ChatAnthropic;`
- **Line 125-128, 583-587:** Direct LLM instantiation
- **Line 311:** `await this.llm.invoke([`

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

#### 3.2 Mixture of Experts 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/patterns/mixture-of-experts.ts`
- **Line 25:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Line 125, 153:** Direct LLM instantiation
- **Line 209, 456, 589, 674:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

#### 3.3 Adversarial Agents 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/patterns/adversarial-agents.ts`
- **Line 25:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Line 142-144:** Multiple LLM instances
- **Line 161-175:** Direct LLM instantiation
- **Line 327, 402, 479, 591:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

#### 3.4 Constitutional AI 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/patterns/constitutional-ai.ts`
- **Line 25:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Line 208:** `private llm: ChatOpenAI | ChatAnthropic;`
- **Line 231-234, 583-587:** Direct LLM instantiation
- **Line 371, 571, 672:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

#### 3.5 Tree of Thoughts 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/patterns/tree-of-thoughts.ts`
- **Line 24:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Line 136:** `private llm: ChatOpenAI | ChatAnthropic;`
- **Line 157-160, 150-154:** Direct LLM instantiation
- **Line 275, 401:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

#### 3.6 Deep Agent System 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/deep-agent-system.ts`
- **Line 23:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Line 169:** `protected readonly llm: ChatOpenAI | ChatAnthropic;`
- **Line 192-196:** Direct LLM instantiation
- **Line 236, 283, 454:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

#### 3.7 Master Orchestrator 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/master-orchestrator.ts`
- **Line 262, 615, 679:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **MIGRATE**: To Python

---

### Category 4: Embedding Services (HIGH PRIORITY)

#### 4.1 OpenAI Embedding Service (Already Listed Above) 🔴
See Category 1.1

---

#### 4.2 HuggingFace Embedding Service ⚠️
**File:** `apps/digital-health-startup/src/lib/services/embeddings/huggingface-embedding-service.ts`

**Note:** This service uses local HuggingFace models, which is acceptable. However, it should still be migrated to Python for consistency.

**Action Required:**
- ⚠️ **OPTIONAL**: Migrate to Python for consistency (already exists in Python)
- ✅ **IF KEEPING**: Ensure it's only used as fallback when Python service is unavailable

---

#### 4.3 Agent Embedding Service 🔴
**File:** `apps/digital-health-startup/src/lib/services/agents/agent-embedding-service.ts`
- **Line 7:** `import { embeddingService } from '@/lib/services/embeddings/openai-embedding-service';`
- **Line 125:** `const embeddingResult = await embeddingService.generateEmbedding(`

**Action Required:**
- ❌ **REMOVE**: Direct embedding service calls
- ✅ **REPLACE**: Call Python AI-engine via API Gateway

---

#### 4.4 Vector Services Using Embeddings 🔴

**File:** `apps/digital-health-startup/src/lib/services/vectorstore/pinecone-vector-service.ts`
- **Line 9:** `import { embeddingService } from '../embeddings/openai-embedding-service';`
- **Line 163-168:** Uses embedding service
- **Line 612-616:** Uses embedding service

**File:** `apps/digital-health-startup/src/lib/services/rag/unified-rag-service.ts`
- **Line 380-383:** Uses embedding service
- **Line 866-872:** Uses embedding service

**Action Required:**
- ❌ **REMOVE**: Direct embedding service calls
- ✅ **REPLACE**: Call Python AI-engine via API Gateway

---

### Category 5: RAG Services (HIGH PRIORITY)

#### 5.1 Unified RAG Service 🔴
**File:** `apps/digital-health-startup/src/lib/services/rag/unified-rag-service.ts`
- Uses embedding services (see Category 4)
- Should use Python RAG service instead

**Action Required:**
- ✅ **REPLACE**: Use Python AI-engine `/api/rag/query` endpoint
- ✅ **REMOVE**: All local embedding calls

---

#### 5.2 LangChain RAG Service 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/langchain-service.ts`
- Uses LangChain for RAG operations

**Action Required:**
- ❌ **REMOVE**: LangChain usage
- ✅ **REPLACE**: Use Python AI-engine

---

#### 5.3 Supabase RAG Service 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/supabase-rag-service.ts`
- **Line 119:** Direct OpenAI call (see Category 1.6)
- Uses embeddings for vector search

**Action Required:**
- ❌ **REMOVE**: Direct OpenAI calls
- ✅ **REPLACE**: Use Python AI-engine

---

### Category 6: Mode Handlers (PARTIALLY COMPLIANT)

#### 6.1 Mode 2 Handler ⚠️
**File:** `apps/digital-health-startup/src/features/chat/services/mode2-automatic-agent-selection.ts`
- **Status:** ✅ **UPDATED** - Now calls Python AI-engine via API Gateway
- ⚠️ **CHECK**: Ensure no remaining LangChain imports

**Action Required:**
- ✅ **VERIFY**: No remaining LangChain/OpenAI direct calls
- ✅ **CONFIRM**: All calls go through API Gateway

---

#### 6.2 Mode 3 Handler ⚠️
**File:** `apps/digital-health-startup/src/features/chat/services/mode3-autonomous-automatic.ts`
- **Status:** ✅ **UPDATED** - Now calls Python AI-engine via API Gateway
- ⚠️ **CHECK**: Ensure no remaining LangChain imports

**Action Required:**
- ✅ **VERIFY**: No remaining LangChain/OpenAI direct calls
- ✅ **CONFIRM**: All calls go through API Gateway

---

#### 6.3 Mode 4 Handler ⚠️
**File:** `apps/digital-health-startup/src/features/chat/services/mode4-autonomous-manual.ts`
- **Status:** ✅ **UPDATED** - Now calls Python AI-engine via API Gateway
- ⚠️ **CHECK**: Ensure no remaining LangChain imports

**Action Required:**
- ✅ **VERIFY**: No remaining LangChain/OpenAI direct calls
- ✅ **CONFIRM**: All calls go through API Gateway

---

### Category 7: Other Services (MEDIUM PRIORITY)

#### 7.1 Cloud RAG Service 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/cloud-rag-service.ts`
- **Line 527:** `await this.llm.invoke(prompt);` - Direct LLM invocation

**Action Required:**
- ❌ **REMOVE**: Direct LLM calls
- ✅ **REPLACE**: Use Python AI-engine

---

#### 7.2 Risk Assessment Service 🔴
**File:** `apps/digital-health-startup/src/lib/services/risk-assessment.ts`
- **Line 144, 255:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: Direct LLM calls
- ✅ **REPLACE**: Use Python AI-engine

---

#### 7.3 Action Item Extractor 🔴
**File:** `apps/digital-health-startup/src/lib/services/action-item-extractor.ts`
- **Line 169:** `await this.llm.invoke(prompt);`

**Action Required:**
- ❌ **REMOVE**: Direct LLM calls
- ✅ **REPLACE**: Use Python AI-engine

---

#### 7.4 Board Composer 🔴
**File:** `apps/digital-health-startup/src/lib/services/board-composer.ts`
- **Line 163, 340:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: Direct LLM calls
- ✅ **REPLACE**: Use Python AI-engine

---

#### 7.5 LLM Orchestrator 🔴
**File:** `apps/digital-health-startup/src/lib/llm/orchestrator.ts`
- **Line 239:** `await this.openai.chat.completions.create({`

**Action Required:**
- ❌ **REMOVE**: Direct OpenAI calls
- ✅ **REPLACE**: Use Python AI-engine

---

#### 7.6 RAGAS Evaluator 🔴
**File:** `apps/digital-health-startup/src/features/rag/evaluation/ragas-evaluator.ts`
- **Line 178, 199, 214, 227:** Multiple `llm.invoke()` calls

**Action Required:**
- ❌ **REMOVE**: Direct LLM calls
- ✅ **REPLACE**: Use Python AI-engine

---

## 📊 Summary Statistics

- **Total Violations:** 147+
- **Critical (High Priority):** 45+
- **Medium Priority:** 60+
- **Low Priority:** 42+

**Breakdown by Category:**
- Direct OpenAI/Anthropic API Calls: 28 files
- Direct LangChain Usage: 35 files
- Embedding Services: 8 files
- RAG Services: 12 files
- Agent Pattern Services: 18 files
- Other Services: 46 files

---

## ✅ Compliance Checklist

### Services Already Compliant:
1. ✅ Mode 1 Handler - Uses Python AI-engine via API Gateway
2. ✅ Mode 2 Handler - Uses Python AI-engine via API Gateway
3. ✅ Mode 3 Handler - Uses Python AI-engine via API Gateway
4. ✅ Mode 4 Handler - Uses Python AI-engine via API Gateway
5. ✅ Agent Stats Endpoint - Uses Python AI-engine via API Gateway

### Services Needing Migration:
1. ❌ All embedding services (8 files)
2. ❌ All RAG services (12 files)
3. ❌ All LangChain/LangGraph orchestrators (35 files)
4. ❌ All agent pattern services (18 files)
5. ❌ All API routes with direct OpenAI calls (8 files)
6. ❌ All other LLM services (46 files)

---

## 🎯 Action Plan

### Phase 1: Critical Services (Week 1)
1. Migrate OpenAI Embedding Service to Python
2. Migrate Agent Selector Service to Python
3. Migrate Ask Expert Chat Route to Python or disable
4. Update all embedding callers to use Python via API Gateway

### Phase 2: High Priority Services (Week 2)
1. Remove all LangChain/LangGraph usage
2. Migrate Unified LangGraph Orchestrator to Python
3. Migrate ReAct Engine to Python
4. Migrate Chain-of-Thought Engine to Python

### Phase 3: Medium Priority Services (Week 3-4)
1. Migrate all agent pattern services to Python
2. Migrate all RAG services to Python
3. Migrate all other LLM services to Python

### Phase 4: Cleanup (Week 5)
1. Remove all unused TypeScript AI/ML code
2. Update documentation
3. Verify all services use Python via API Gateway

---

## 📝 Notes

- **Test Files**: Test files (`.test.ts`, `.spec.ts`) may use mocks - these are acceptable
- **Config Files**: Environment variable validation files are acceptable
- **Type Definitions**: Type definition files are acceptable
- **Frontend Components**: Frontend components that call API routes are acceptable (they should call Python via API Gateway)

---

## 🔍 Verification Commands

```bash
# Find all OpenAI imports
grep -r "from 'openai'\|from \"openai\"\|import.*openai" apps/digital-health-startup/src --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec."

# Find all LangChain imports
grep -r "@langchain\|langchain" apps/digital-health-startup/src --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec."

# Find all embedding service calls
grep -r "embeddingService\|generateEmbedding\|createEmbedding" apps/digital-health-startup/src --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec."

# Find all LLM invoke calls
grep -r "\.invoke\(\|llm\.invoke\|chat\.completions\.create" apps/digital-health-startup/src --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec."
```

---

**End of Audit Report**

