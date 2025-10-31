# Golden Rule Violations - Complete Audit Report

## 🎯 Golden Rule

**ALL AI/ML related services MUST be in Python and accessed via API Gateway**

---

## 📋 Executive Summary

**Total Violations Found:** 19+ files with direct AI/ML calls

**Status:**
- 🔴 **CRITICAL:** 8 files (must fix immediately)
- 🟠 **HIGH:** 6 files (fix soon)
- 🟡 **MEDIUM:** 5+ files (review and migrate)

---

## ❌ Detailed Violations List

### **🔴 CRITICAL VIOLATIONS (Must Fix Immediately)**

#### **1. Agent Selector Service** 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/agent-selector-service.ts`

**Violations:**
- **Line 91:** `private openaiApiKey: string;` - Direct OpenAI API key usage
- **Line 110:** `this.openaiApiKey = process.env.OPENAI_API_KEY!;` - Direct API key access
- **Line 142-169:** Direct `fetch()` call to `https://api.openai.com/v1/chat/completions` for query analysis
- **Line 790-800:** Direct `fetch()` call to `https://api.openai.com/v1/embeddings` for embedding generation

**Status:** ⚠️ **ACTIVE** - Still imported in Mode handlers

**Action Required:**
- ✅ Migrate `analyzeQuery()` to Python service
- ✅ Migrate `generateEmbedding()` to Python service
- ✅ Remove or deprecate this service
- ✅ Update Mode handlers to remove dependency

---

#### **2. ReAct Engine** 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/react-engine.ts`

**Violations:**
- **Line 8:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 29:** `private llm: ChatOpenAI;` - Direct LangChain OpenAI usage
- **Line 35-39:** Direct OpenAI LLM instantiation

**Status:** ⚠️ **ACTIVE** - Used in Mode 3 and Mode 4 (though modes were updated, imports may still exist)

**Action Required:**
- ✅ Remove LangChain OpenAI usage
- ✅ All ReAct logic should be in Python
- ✅ Check if still used after Mode 3/4 updates

---

#### **3. Chain-of-Thought Engine** 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/chain-of-thought-engine.ts`

**Violations:**
- **Line 8:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 69:** `private llm: ChatOpenAI;` - Direct LangChain OpenAI usage
- **Line 72-76:** Direct OpenAI LLM instantiation

**Status:** ⚠️ **ACTIVE** - Used in Mode 3 and Mode 4 (though modes were updated, imports may still exist)

**Action Required:**
- ✅ Remove LangChain OpenAI usage
- ✅ All CoT logic should be in Python
- ✅ Check if still used after Mode 3/4 updates

---

#### **4. Ask Expert Chat Route** 🔴
**File:** `apps/digital-health-startup/src/app/api/ask-expert/chat/route.ts`

**Violations:**
- **Line 13:** `import OpenAI from 'openai';` - Direct OpenAI import
- **Line 21-23:** Direct OpenAI instantiation: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })`
- **Line 152-156:** Direct `openai.embeddings.create()` call for embedding generation
- **Line 200+:** Likely uses OpenAI for chat completions (needs full audit)

**Status:** ⚠️ **ACTIVE** - This is a legacy route, check if still in use

**Action Required:**
- ✅ Migrate to use Python services via API Gateway
- ✅ Or disable if replaced by `/api/ask-expert/orchestrate`
- ✅ Remove all direct OpenAI calls

---

#### **5. OpenAI Embedding Service** 🔴
**File:** `apps/digital-health-startup/src/lib/services/embeddings/openai-embedding-service.ts`

**Violations:**
- **Line 6:** `import { OpenAI } from 'openai';` - Direct OpenAI import
- **Line 31:** `private client: OpenAI;` - Direct OpenAI client
- **Line 91-95:** Direct `client.embeddings.create()` call

**Status:** ⚠️ **ACTIVE** - Used by other services (RAG, agent selection)

**Action Required:**
- ✅ All embedding generation should use Python service via API Gateway
- ✅ Update callers to use Python services
- ✅ This service should become a thin wrapper to Python

---

#### **6. HuggingFace Embedding Service** 🔴
**File:** `apps/digital-health-startup/src/lib/services/embeddings/huggingface-embedding-service.ts`

**Violations:**
- **Line 211:** `private hf: HfInference;` - Direct HuggingFace client
- **Line 284-287:** Direct HuggingFace API calls via `hf.featureExtraction()`

**Status:** ⚠️ **ACTIVE** - Used by other services

**Action Required:**
- ✅ Migrate to Python service (already exists in Python)
- ✅ Update callers to use Python services via API Gateway

---

#### **7. Supabase RAG Service** 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/supabase-rag-service.ts`

**Violations:**
- **Line 340-368:** `generateEmbedding()` method with fallback to direct OpenAI call
- **Line 356-360:** Direct `this.openai.embeddings.create()` call

**Status:** ⚠️ **ACTIVE** - Used by RAG services

**Action Required:**
- ✅ Remove direct OpenAI embedding calls
- ✅ Use Python embedding service via API Gateway

---

#### **8. Intelligent Agent Router** 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/intelligent-agent-router.ts`

**Violations:**
- **Line 13:** `import OpenAI from 'openai';` - Direct OpenAI import
- **Line 15:** `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })` - Direct instantiation
- **Line 110:** Direct OpenAI API call: `openai.chat.completions.create()`

**Status:** ⚠️ **ACTIVE** - Uses OpenAI for agent selection

**Action Required:**
- ✅ Migrate agent routing logic to Python
- ✅ Use Python services via API Gateway

---

#### **9. Generate System Prompt Route** 🔴
**File:** `apps/digital-health-startup/src/app/api/generate-system-prompt/route.ts`

**Violations:**
- **Line 2:** `import OpenAI from 'openai';` - Direct OpenAI import
- **Line 5-7:** Direct OpenAI instantiation: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })`
- **Line 61-69:** Direct `openai.chat.completions.create()` call for prompt generation

**Status:** ⚠️ **ACTIVE** - Used for generating system prompts

**Action Required:**
- ✅ Migrate to Python service via API Gateway
- ✅ Create Python endpoint: `/api/prompts/generate-system-prompt`
- ✅ Update route to call Python service

---

#### **10. Generate Persona Route** 🔴
**File:** `apps/digital-health-startup/src/app/api/generate-persona/route.ts`

**Violations:**
- **Line 2:** `import OpenAI from 'openai';` - Direct OpenAI import
- **Line 5-7:** Direct OpenAI instantiation: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })`
- **Line 119-128:** Direct `openai.chat.completions.create()` call for persona generation

**Status:** ⚠️ **ACTIVE** - Used for generating agent personas

**Action Required:**
- ✅ Migrate to Python service via API Gateway
- ✅ Create Python endpoint: `/api/prompts/generate-persona`
- ✅ Update route to call Python service

---

#### **11. Knowledge Process Route** 🔴
**File:** `apps/digital-health-startup/src/app/api/knowledge/process/route.ts`

**Violations:**
- **Line 5:** `import { OpenAI } from 'openai';` - Direct OpenAI import
- **Line 10-12:** Direct OpenAI instantiation: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })`
- **Line 263-266:** Direct `openai.embeddings.create()` call for embedding generation

**Status:** ⚠️ **ACTIVE** - Used for processing knowledge documents

**Action Required:**
- ✅ Migrate to Python embedding service via API Gateway
- ✅ Update to use Python services

---

### **🟠 HIGH PRIORITY VIOLATIONS (Fix Soon)**

#### **12. Unified RAG Service** 🟠
**File:** `apps/digital-health-startup/src/lib/services/rag/unified-rag-service.ts`

**Violations:**
- **Line 11:** `import { getEmbeddingService, EmbeddingServiceFactory } from '../embeddings/embedding-service-factory';` - Uses TypeScript embedding factory
- **Line 380, 867:** Uses `getEmbeddingService()` which creates TypeScript embedding services (not Python)

**Status:** ⚠️ **ACTIVE** - Uses TypeScript embedding services instead of Python

**Action Required:**
- ✅ Update to use Python embedding service via API Gateway
- ✅ Replace `getEmbeddingService()` calls with Python service client

---

#### **13. Pinecone Vector Service** 🟠
**File:** `apps/digital-health-startup/src/lib/services/vectorstore/pinecone-vector-service.ts`

**Violations:**
- **Line 9:** `import { embeddingService } from '../embeddings/openai-embedding-service';` - Direct import of TypeScript embedding service
- Uses TypeScript embedding service instead of Python

**Status:** ⚠️ **ACTIVE** - Uses TypeScript embedding service

**Action Required:**
- ✅ Update to use Python embedding service via API Gateway
- ✅ Replace embedding service import with Python service client

---

#### **14. LLM Provider Service** 🟠
**File:** `apps/digital-health-startup/src/services/llm-provider.service.ts`
**File:** `apps/digital-health-startup/src/shared/services/llm/llm-provider.service.ts`

**Violations:**
- **Line 595-647:** `callOpenAI()` method with direct `fetch()` to OpenAI API
- **Line 649-698:** `callAnthropic()` method with direct API calls

**Status:** ⚠️ **CHECK USAGE** - Check if this service is actively used

**Action Required:**
- ✅ If used: Migrate to Python service
- ✅ If unused: Mark as deprecated or remove

---

#### **15. Unified LangGraph Orchestrator** 🟠
**File:** `apps/digital-health-startup/src/features/chat/services/unified-langgraph-orchestrator.ts`

**Violations:**
- Multiple `ChatOpenAI` instantiations
- LangGraph workflow execution in TypeScript
- OpenAI embeddings usage

**Status:** ⚠️ **CHECK USAGE** - May be deprecated in favor of Python services

**Action Required:**
- ✅ Verify if still in use
- ✅ If unused: Mark as deprecated
- ✅ If used: Migrate to Python

---

#### **16. Simplified LangGraph Orchestrator** 🟠
**File:** `apps/digital-health-startup/src/features/chat/services/simplified-langgraph-orchestrator.ts`

**Violations:**
- `ChatOpenAI` usage
- `OpenAIEmbeddings` usage
- LangGraph workflows

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- ✅ Verify if still in use
- ✅ Migrate or deprecate

---

#### **17. Enhanced LangChain Service** 🟠
**File:** `apps/digital-health-startup/src/features/chat/services/enhanced-langchain-service.ts`

**Violations:**
- `ChatOpenAI` usage
- `OpenAIEmbeddings` usage

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- ✅ Verify if still in use
- ✅ Migrate or deprecate

---

#### **18. Cloud RAG Service** 🟠
**File:** `apps/digital-health-startup/src/features/chat/services/cloud-rag-service.ts`

**Violations:**
- `ChatOpenAI` usage
- `OpenAIEmbeddings` usage

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- ✅ Verify if still in use
- ✅ Migrate or deprecate

---

#### **19. RAG Search Hybrid Route** 🟠
**File:** `apps/digital-health-startup/src/app/api/rag/search-hybrid/route.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for embedding/LLM calls

**Action Required:**
- ✅ Audit file for embedding/LLM calls
- ✅ Migrate to Python if found

---

### **🟡 MEDIUM PRIORITY VIOLATIONS (Review and Migrate)**

#### **20. Master Orchestrator** 🟡
**File:** `apps/digital-health-startup/src/lib/services/agents/master-orchestrator.ts`

**Violations:**
- Uses DeepAgent system which may have LLM calls
- LangChain imports

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- ✅ Audit file for LLM calls
- ✅ Migrate if needed

---

#### **21. Agent Ranker Service** 🟡
**File:** `apps/digital-health-startup/src/lib/services/agent-ranker.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for LLM/embedding calls

**Action Required:**
- ✅ Audit file
- ✅ Migrate if needed

---

#### **22. Knowledge Domain Detector** 🟡
**File:** `apps/digital-health-startup/src/lib/services/knowledge-domain-detector.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for LLM/embedding calls

**Action Required:**
- ✅ Audit file
- ✅ Migrate if needed

---

#### **23. Shared Services RAG** 🟡
**File:** `apps/digital-health-startup/src/shared/services/rag/supabase-rag-service.ts`
**File:** `apps/digital-health-startup/src/shared/services/rag/medical-rag-service.ts`
**File:** `apps/digital-health-startup/src/shared/services/rag/rag-service.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for embedding/LLM calls

**Action Required:**
- ✅ Audit files
- ✅ Migrate if needed

---

#### **24. Agent Graph RAG Service** 🟡
**File:** `apps/digital-health-startup/src/lib/services/agents/agent-graphrag-service.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for LLM/embedding calls

**Action Required:**
- ✅ Audit file
- ✅ Migrate if needed

---

#### **25. Agent Embedding Service** 🟡
**File:** `apps/digital-health-startup/src/lib/services/agents/agent-embedding-service.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for embedding calls

**Action Required:**
- ✅ Audit file
- ✅ Migrate if needed

---

#### **12. Unified RAG Service** 🟠
**File:** `apps/digital-health-startup/src/lib/services/rag/unified-rag-service.ts`

**Violations:**
- **Line 11:** `import { getEmbeddingService, EmbeddingServiceFactory } from '../embeddings/embedding-service-factory';` - Uses TypeScript embedding factory
- **Line 380, 867:** Uses `getEmbeddingService()` which creates TypeScript embedding services (not Python)

**Status:** ⚠️ **ACTIVE** - Uses TypeScript embedding services instead of Python

**Action Required:**
- ✅ Update to use Python embedding service via API Gateway
- ✅ Replace `getEmbeddingService()` calls with Python service client

---

#### **13. Pinecone Vector Service** 🟠
**File:** `apps/digital-health-startup/src/lib/services/vectorstore/pinecone-vector-service.ts`

**Violations:**
- **Line 9:** `import { embeddingService } from '../embeddings/openai-embedding-service';` - Direct import of TypeScript embedding service
- Uses TypeScript embedding service instead of Python

**Status:** ⚠️ **ACTIVE** - Uses TypeScript embedding service

**Action Required:**
- ✅ Update to use Python embedding service via API Gateway
- ✅ Replace embedding service import with Python service client

---

## ✅ Compliant Files (Reference)

These files are already compliant (no direct LLM calls):

1. ✅ `mode1-manual-interactive.ts` - Uses API Gateway
2. ✅ `mode2-automatic-agent-selection.ts` - Uses API Gateway (main handler)
3. ✅ `mode3-autonomous-automatic.ts` - Uses API Gateway (main handler)
4. ✅ `mode4-autonomous-manual.ts` - Uses API Gateway (main handler)
5. ✅ `langchain-service.ts` - Uses Python services with fallback
6. ✅ `domain-specific-rag-service.ts` - No direct LLM calls
7. ✅ `python-services-client.ts` - Client to Python services (compliant)

---

## 📊 Violations by Category

### **Direct OpenAI API Calls** (11 files)
1. `agent-selector-service.ts` - 4 violations
2. `ask-expert/chat/route.ts` - 3+ violations
3. `openai-embedding-service.ts` - 3 violations
4. `supabase-rag-service.ts` - 2 violations
5. `intelligent-agent-router.ts` - 3 violations
6. `generate-system-prompt/route.ts` - 3 violations
7. `generate-persona/route.ts` - 3 violations
8. `knowledge/process/route.ts` - 3 violations
9. `llm-provider.service.ts` - 2 violations
10. `shared/services/llm/llm-provider.service.ts` - 2 violations
11. `rag/search-hybrid/route.ts` - Needs audit

### **LangChain Usage** (8+ files)
1. `react-engine.ts` - ChatOpenAI
2. `chain-of-thought-engine.ts` - ChatOpenAI
3. `unified-langgraph-orchestrator.ts` - ChatOpenAI + OpenAIEmbeddings
4. `simplified-langgraph-orchestrator.ts` - ChatOpenAI + OpenAIEmbeddings
5. `enhanced-langchain-service.ts` - ChatOpenAI + OpenAIEmbeddings
6. `cloud-rag-service.ts` - ChatOpenAI + OpenAIEmbeddings
7. `master-orchestrator.ts` - LangChain imports
8. Other agent pattern files - LangChain imports

### **Embedding Generation** (4 files)
1. `openai-embedding-service.ts` - Direct OpenAI embeddings
2. `huggingface-embedding-service.ts` - Direct HF embeddings
3. `supabase-rag-service.ts` - OpenAI embedding fallback
4. `knowledge/process/route.ts` - Direct OpenAI embeddings

---

## 🎯 Action Plan

### **Phase 1: Critical Violations (Week 1)**

1. ✅ Migrate `agent-selector-service.ts` to Python
   - Create Python service: `agent_selection_service.py`
   - Add endpoint: `/api/agents/select`
   - Update Mode handlers

2. ✅ Fix embedding services
   - Update `openai-embedding-service.ts` to call Python
   - Update `huggingface-embedding-service.ts` to call Python
   - Update `supabase-rag-service.ts` to use Python embeddings

3. ✅ Migrate API routes
   - `generate-system-prompt/route.ts` → Python
   - `generate-persona/route.ts` → Python
   - `knowledge/process/route.ts` → Python embeddings
   - `ask-expert/chat/route.ts` → Disable or migrate

4. ✅ Fix intelligent-agent-router
   - Migrate to Python service

### **Phase 2: High Priority (Week 2)**

5. ✅ Audit LangGraph orchestrators
   - Check if still used
   - Migrate or deprecate

6. ✅ Fix ReAct and CoT engines
   - Check if still used after Mode 3/4 updates
   - Migrate or deprecate

7. ✅ Audit LLM provider service
   - Check usage
   - Migrate or deprecate

### **Phase 3: Medium Priority (Week 3)**

8. ✅ Audit remaining services
   - Agent ranker
   - Knowledge domain detector
   - Shared RAG services
   - Agent services

9. ✅ Clean up legacy code
   - Remove unused services
   - Update documentation

---

## 📝 Notes

### **Files to Ignore:**
- Files with `.bak`, `.tmp`, or `.disabled` extensions
- Test files (`__tests__/`, `.test.ts`, `.spec.ts`) - may use mocks
- Type definition files (`types/`, `.d.ts`) - usually OK
- Configuration files - may reference keys but not make calls

### **Files Requiring Further Investigation:**
- `lib/services/rag/unified-rag-service.ts` - Uses embedding factory (check if factory calls Python)
- `lib/services/vectorstore/pinecone-vector-service.ts` - Uses embedding service (check if service calls Python)
- Various agent pattern files - May have LangChain but check if used

---

## ✅ Verification Checklist

- [ ] No direct `new OpenAI()` calls in active code
- [ ] No direct `fetch()` to `api.openai.com`
- [ ] No direct `fetch()` to `api.anthropic.com`
- [ ] No `ChatOpenAI` or `OpenAIEmbeddings` in active code
- [ ] No LangChain workflow execution in TypeScript
- [ ] All embedding generation via Python
- [ ] All LLM calls via Python
- [ ] All agent selection via Python
- [ ] All prompt generation via Python

---

**Last Updated:** 2025-01-31
**Audit Status:** Complete
**Next Review:** After Phase 1 fixes

