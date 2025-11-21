# Golden Rule Violations Audit

## 🎯 Golden Rule

**ALL AI/ML related services MUST be in Python and accessed via API Gateway**

---

## ❌ Violations Found

### **Category 1: Direct OpenAI API Calls** (HIGH PRIORITY)

#### **1. Agent Selector Service** 🔴
**File:** `apps/digital-health-startup/src/features/chat/services/agent-selector-service.ts`

**Violations:**
- **Line 91:** `private openaiApiKey: string;` - Direct OpenAI API key usage
- **Line 110:** `this.openaiApiKey = process.env.OPENAI_API_KEY!;` - Direct API key access
- **Line 142-169:** Direct `fetch()` call to `https://api.openai.com/v1/chat/completions` for query analysis
- **Line 790-800:** Direct `fetch()` call to `https://api.openai.com/v1/embeddings` for embedding generation

**Status:** ⚠️ **ACTIVE** - Still imported in Mode 2 and Mode 3 handlers (though handlers were updated to use Python, imports may still exist)

**Action Required:**
- Migrate `analyzeQuery()` to Python service
- Migrate `generateEmbedding()` to Python service
- Remove this service or mark as deprecated
- Update Mode handlers to remove dependency on this service

---

#### **2. ReAct Engine**
**File:** `apps/digital-health-startup/src/features/chat/services/react-engine.ts`

**Violations:**
- Line 29: `private llm: ChatOpenAI;` - Direct LangChain OpenAI usage
- Line 35-39: Direct OpenAI LLM instantiation

**Status:** ⚠️ **ACTIVE** - Used in Mode 3 and Mode 4 (though modes were updated, imports may still exist)

**Action Required:**
- Remove LangChain OpenAI usage
- All ReAct logic should be in Python

---

#### **3. Chain-of-Thought Engine**
**File:** `apps/digital-health-startup/src/features/chat/services/chain-of-thought-engine.ts`

**Violations:**
- Line 69: `private llm: ChatOpenAI;` - Direct LangChain OpenAI usage
- Line 72-76: Direct OpenAI LLM instantiation

**Status:** ⚠️ **ACTIVE** - Used in Mode 3 and Mode 4 (though modes were updated, imports may still exist)

**Action Required:**
- Remove LangChain OpenAI usage
- All CoT logic should be in Python

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
- Migrate to use Python services via API Gateway
- Or disable if replaced by `/api/ask-expert/orchestrate`
- Remove all direct OpenAI calls

---

#### **5. LLM Provider Service**
**File:** `apps/digital-health-startup/src/services/llm-provider.service.ts`
**File:** `apps/digital-health-startup/src/shared/services/llm/llm-provider.service.ts`

**Violations:**
- Line 595-647: `callOpenAI()` method with direct `fetch()` to OpenAI API
- Line 649-698: `callAnthropic()` method with direct API calls

**Status:** ⚠️ **CHECK USAGE** - Check if this service is actively used

**Action Required:**
- If used: Migrate to Python service
- If unused: Mark as deprecated or remove

---

### **Category 2: Direct Embedding Generation** (HIGH PRIORITY)

#### **6. OpenAI Embedding Service**
**File:** `apps/digital-health-startup/src/lib/services/embeddings/openai-embedding-service.ts`

**Violations:**
- Line 31: `private client: OpenAI;` - Direct OpenAI client
- Line 91-95: Direct `client.embeddings.create()` call

**Status:** ⚠️ **ACTIVE** - Used by other services (RAG, agent selection)

**Action Required:**
- All embedding generation should use Python service via API Gateway
- Update callers to use Python services

---

#### **7. HuggingFace Embedding Service**
**File:** `apps/digital-health-startup/src/lib/services/embeddings/huggingface-embedding-service.ts`

**Violations:**
- Line 211: `private hf: HfInference;` - Direct HuggingFace client
- Line 284-287: Direct HuggingFace API calls

**Status:** ⚠️ **ACTIVE** - Used by other services

**Action Required:**
- Migrate to Python service (already exists in Python)
- Update callers to use Python services

---

#### **8. Supabase RAG Service**
**File:** `apps/digital-health-startup/src/features/chat/services/supabase-rag-service.ts`

**Violations:**
- Line 340-368: `generateEmbedding()` method with fallback to direct OpenAI call
- Line 356-360: Direct `this.openai.embeddings.create()` call

**Status:** ⚠️ **ACTIVE** - Used by RAG services

**Action Required:**
- Remove direct OpenAI embedding calls
- Use Python embedding service via API Gateway

---

### **Category 3: LangChain Usage** (MEDIUM PRIORITY)

#### **9. Unified LangGraph Orchestrator**
**File:** `apps/digital-health-startup/src/features/chat/services/unified-langgraph-orchestrator.ts`

**Violations:**
- Multiple `ChatOpenAI` instantiations
- LangGraph workflow execution in TypeScript

**Status:** ⚠️ **CHECK USAGE** - May be deprecated in favor of Python services

**Action Required:**
- Verify if still in use
- If unused: Mark as deprecated
- If used: Migrate to Python

---

#### **10. Simplified LangGraph Orchestrator**
**File:** `apps/digital-health-startup/src/features/chat/services/simplified-langgraph-orchestrator.ts`

**Violations:**
- `ChatOpenAI` usage
- `OpenAIEmbeddings` usage
- LangGraph workflows

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- Verify if still in use
- Migrate or deprecate

---

#### **11. Enhanced LangChain Service**
**File:** `apps/digital-health-startup/src/features/chat/services/enhanced-langchain-service.ts`

**Violations:**
- `ChatOpenAI` usage
- `OpenAIEmbeddings` usage

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- Verify if still in use
- Migrate or deprecate

---

#### **12. Cloud RAG Service**
**File:** `apps/digital-health-startup/src/features/chat/services/cloud-rag-service.ts`

**Violations:**
- `ChatOpenAI` usage
- `OpenAIEmbeddings` usage

**Status:** ⚠️ **CHECK USAGE**

**Action Required:**
- Verify if still in use
- Migrate or deprecate

---

### **Category 4: API Routes with LLM Calls** (HIGH PRIORITY)

#### **13. Generate System Prompt Route**
**File:** `apps/digital-health-startup/src/app/api/generate-system-prompt/route.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for direct LLM calls

**Action Required:**
- Audit file for OpenAI/Anthropic calls
- Migrate to Python if found

---

#### **14. Generate Persona Route**
**File:** `apps/digital-health-startup/src/app/api/generate-persona/route.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for direct LLM calls

**Action Required:**
- Audit file for OpenAI/Anthropic calls
- Migrate to Python if found

---

#### **15. RAG Search Hybrid Route**
**File:** `apps/digital-health-startup/src/app/api/rag/search-hybrid/route.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for embedding/LLM calls

**Action Required:**
- Audit file for embedding/LLM calls
- Migrate to Python if found

---

#### **16. Knowledge Process Route** 🔴
**File:** `apps/digital-health-startup/src/app/api/knowledge/process/route.ts`

**Violations:**
- **Line 263-266:** Direct `openai.embeddings.create()` call for embedding generation
- **Line 263:** `const embeddingResponse = await openai.embeddings.create({ model: 'text-embedding-ada-002', input: chunk.content })`

**Status:** ⚠️ **ACTIVE** - Used for processing knowledge documents

**Action Required:**
- Migrate to Python embedding service via API Gateway
- Update to use Python services

---

### **Category 5: Agent Services** (MEDIUM PRIORITY)

#### **17. Agent Ranker Service**
**File:** `apps/digital-health-startup/src/lib/services/agent-ranker.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for LLM/embedding calls

**Action Required:**
- Audit file
- Migrate if needed

---

#### **18. Knowledge Domain Detector**
**File:** `apps/digital-health-startup/src/lib/services/knowledge-domain-detector.ts`

**Status:** ⚠️ **NEEDS AUDIT** - Check for LLM/embedding calls

**Action Required:**
- Audit file
- Migrate if needed

---

#### **19. Intelligent Agent Router**
**File:** `apps/digital-health-startup/src/features/chat/services/intelligent-agent-router.ts`

**Violations:**
- Line 15: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`
- Line 110: Direct OpenAI API call

**Status:** ⚠️ **ACTIVE** - Uses OpenAI for agent selection

**Action Required:**
- Migrate agent routing logic to Python
- Use Python services via API Gateway

---

## 📊 Summary by Priority

### **🔴 CRITICAL (Must Fix Immediately)**
1. `agent-selector-service.ts` - Direct OpenAI calls (4 violations)
   - Lines: 91, 110, 142-169, 790-800
2. `ask-expert/chat/route.ts` - Direct OpenAI calls (3+ violations)
   - Lines: 13, 21-23, 152-156, +more
3. `openai-embedding-service.ts` - Direct OpenAI embedding calls
   - Lines: 6, 31, 91-95
4. `supabase-rag-service.ts` - Direct OpenAI embedding fallback
   - Lines: 340-368, 356-360
5. `intelligent-agent-router.ts` - Direct OpenAI calls
   - Lines: 15, 110
6. `generate-system-prompt/route.ts` - Direct OpenAI calls
   - Lines: 2, 5-7, 61-69
7. `generate-persona/route.ts` - Direct OpenAI calls
   - Lines: 2, 5-7, 119-128
8. `knowledge/process/route.ts` - Direct OpenAI embedding calls
   - Lines: 263-266

### **🟠 HIGH (Fix Soon)**
6. `react-engine.ts` - LangChain OpenAI usage
7. `chain-of-thought-engine.ts` - LangChain OpenAI usage
8. `llm-provider.service.ts` - Direct API calls
9. `huggingface-embedding-service.ts` - Direct HF API calls
10. `generate-system-prompt/route.ts` - Needs audit
11. `generate-persona/route.ts` - Needs audit
12. `rag/search-hybrid/route.ts` - Needs audit
13. `knowledge/process/route.ts` - Needs audit

### **🟡 MEDIUM (Review and Migrate)**
14. `unified-langgraph-orchestrator.ts` - LangGraph workflows
15. `simplified-langgraph-orchestrator.ts` - LangChain usage
16. `enhanced-langchain-service.ts` - LangChain usage
17. `cloud-rag-service.ts` - LangChain usage
18. `agent-ranker.ts` - Needs audit
19. `knowledge-domain-detector.ts` - Needs audit

---

## 📋 Files to Audit

These files contain references but need verification if they're actively used:

### **Test Files (May be OK)**
- `__tests__/unit/agent-selector-service.test.ts`
- `__tests__/unit/mode2-integration.test.ts`
- Other test files

### **Disabled/Backup Files (Ignore)**
- Files with `.disabled` extension
- Files with `.bak` or `.bak.tmp` extension
- Files in `backup/` directories

### **Type Definitions (Usually OK)**
- Files in `types/` directories (usually just type definitions)
- Configuration files

---

## ✅ Compliant Files

These files are already compliant (no direct LLM calls):

1. ✅ `mode1-manual-interactive.ts` - Uses API Gateway
2. ✅ `mode2-automatic-agent-selection.ts` - Uses API Gateway (main handler)
3. ✅ `mode3-autonomous-automatic.ts` - Uses API Gateway (main handler)
4. ✅ `mode4-autonomous-manual.ts` - Uses API Gateway (main handler)
5. ✅ `langchain-service.ts` - Uses Python services with fallback
6. ✅ `unified-rag-service.ts` - Uses Python services
7. ✅ `pinecone-vector-service.ts` - No direct LLM calls
8. ✅ `domain-specific-rag-service.ts` - No direct LLM calls

---

## 🎯 Action Plan

### **Phase 1: Critical Violations (Week 1)**
1. Migrate `agent-selector-service.ts` to Python
2. Remove/deprecate `ask-expert/chat/route.ts` or migrate
3. Update all embedding services to use Python
4. Fix `intelligent-agent-router.ts`

### **Phase 2: High Priority (Week 2)**
5. Migrate ReAct and CoT engines to Python (or remove if unused)
6. Audit and migrate API routes
7. Update LLM provider service or deprecate

### **Phase 3: Medium Priority (Week 3)**
8. Audit LangGraph orchestrators
9. Migrate or deprecate unused services
10. Clean up legacy code

---

## 📝 Notes

- **Backup Files**: Many files with `.bak`, `.tmp`, or `.disabled` extensions can be ignored
- **Test Files**: Test files may use mocks or may need updates
- **Type Definitions**: Type definition files are usually OK
- **Configuration**: Config files referencing OpenAI keys are OK if they're just for Python services

---

**Last Updated:** 2025-01-31
**Audit Status:** Initial Complete

