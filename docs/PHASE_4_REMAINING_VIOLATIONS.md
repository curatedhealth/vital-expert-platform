# Phase 4 - Remaining Violations Audit

## 🎯 Golden Rule

**ALL AI/ML related services MUST be in Python and accessed via API Gateway**

---

## 📋 Summary

This document lists remaining services and API routes that still have direct AI/ML calls.

---

## ❌ Remaining Violations

### **Category 1: Panel Services** (HIGH PRIORITY - ACTIVELY USED)

#### 1. Risk Assessment Service 🔴
**File:** `apps/digital-health-startup/src/lib/services/risk-assessment.ts`
- **Line 9:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 144, 255:** Multiple `llm.invoke()` calls

**Status:** ⚠️ **ACTIVE** - Used by `/api/panel/risk-assessment/route.ts`

**Action Required:**
- ❌ **REMOVE**: All LangChain OpenAI usage
- ✅ **MIGRATE**: Create Python endpoint `/api/panel/risk-assessment`
- ✅ **UPDATE**: TypeScript service to call API Gateway

---

#### 2. Action Item Extractor Service 🔴
**File:** `apps/digital-health-startup/src/lib/services/action-item-extractor.ts`
- **Line 12:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 169:** `await this.llm.invoke(prompt);` - Direct LLM invocation

**Status:** ⚠️ **ACTIVE** - Used by `/api/panel/action-items/route.ts`

**Action Required:**
- ❌ **REMOVE**: All LangChain OpenAI usage
- ✅ **MIGRATE**: Create Python endpoint `/api/panel/action-items`
- ✅ **UPDATE**: TypeScript service to call API Gateway

---

#### 3. Board Composer Service 🟡
**File:** `apps/digital-health-startup/src/lib/services/board-composer.ts`
- **Line 8:** `import { ChatOpenAI } from '@langchain/openai';` - LangChain OpenAI import
- **Line 163, 340:** Multiple `llm.invoke()` calls

**Status:** ⚠️ **NOT ACTIVELY USED** - Only imported in `board-composer.ts.bak.tmp`

**Action Required:**
- ✅ **VERIFY**: Check if actively used
- ✅ **MIGRATE**: If used, create Python endpoint
- ✅ **DEPRECATE**: If unused, add deprecation notice

---

### **Category 2: API Routes** (HIGH PRIORITY - ACTIVELY USED)

#### 4. Agents Recommend Route 🔴
**File:** `apps/digital-health-startup/src/app/api/agents/recommend/route.ts`
- **Line 2:** `import { OpenAI } from 'openai';` - Direct OpenAI import
- **Line 7-9:** `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });` - Direct OpenAI instantiation
- **Line 185:** `const completion = await openai.chat.completions.create({` - Direct OpenAI call

**Status:** ⚠️ **ACTIVE ROUTE** - Agent recommendation endpoint

**Action Required:**
- ❌ **REMOVE**: All direct OpenAI calls
- ✅ **REPLACE**: Call Python AI Engine via API Gateway `/v1/chat/completions`

---

#### 5. Ask Expert Generate Document Route 🔴
**File:** `apps/digital-health-startup/src/app/api/ask-expert/generate-document/route.ts`
- **Line 10:** `import OpenAI from 'openai';` - Direct OpenAI import
- **Line 17-19:** `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });` - Direct OpenAI instantiation
- **Line 142:** `const completion = await openai.chat.completions.create({` - Direct OpenAI call

**Status:** ⚠️ **ACTIVE ROUTE** - Document generation endpoint

**Action Required:**
- ❌ **REMOVE**: All direct OpenAI calls
- ✅ **REPLACE**: Call Python AI Engine via API Gateway `/v1/chat/completions`

---

### **Category 3: Orchestrators & Patterns** (MEDIUM PRIORITY - DOCUMENTED)

#### 6. Unified LangGraph Orchestrator 🟡
**File:** `apps/digital-health-startup/src/features/chat/services/unified-langgraph-orchestrator.ts`
- **Status:** ✅ **ALREADY DOCUMENTED** in Phase 2.2
- Uses ChatOpenAI and OpenAIEmbeddings
- **Action:** Mark as deprecated, plan Python migration

---

#### 7. Agent Pattern Services 🟡
**Files:**
- `lib/services/agents/patterns/cot-consistency.ts`
- `lib/services/agents/patterns/mixture-of-experts.ts`
- `lib/services/agents/patterns/adversarial-agents.ts`
- `lib/services/agents/patterns/constitutional-ai.ts`
- `lib/services/agents/patterns/tree-of-thoughts.ts`

**Status:** ✅ **DOCUMENTED** - Pattern services for future migration

**Action Required:**
- ✅ **VERIFY**: Check if actively used
- ✅ **DEPRECATE**: If unused, add deprecation notices
- ✅ **MIGRATE**: If used, plan Python migration

---

#### 8. Deep Agent System 🟡
**File:** `apps/digital-health-startup/src/lib/services/agents/deep-agent-system.ts`
- **Line 23:** `import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';`
- **Status:** ✅ **DOCUMENTED** - Used by master-orchestrator (Phase 3.2)

**Action Required:**
- ✅ **MIGRATE**: If used, create Python equivalents
- ✅ **DEPRECATE**: Add deprecation notice if not actively used

---

## 📊 Priority Summary

**HIGH PRIORITY (Active Routes/Services):**
1. Risk Assessment Service (used by panel API)
2. Action Item Extractor Service (used by panel API)
3. Agents Recommend Route (active API route)
4. Ask Expert Generate Document Route (active API route)

**MEDIUM PRIORITY (Documented/Deprecated):**
5. Board Composer Service (not actively used)
6. Unified LangGraph Orchestrator (already documented)
7. Agent Pattern Services (documented)
8. Deep Agent System (documented)

---

## ✅ Next Steps

1. **Migrate Panel Services** (Risk Assessment, Action Item Extractor)
   - Create Python endpoints
   - Update API routes to call API Gateway
   - Update TypeScript services

2. **Migrate API Routes** (Agents Recommend, Generate Document)
   - Replace OpenAI calls with API Gateway calls
   - Use `/v1/chat/completions` endpoint

3. **Deprecate Unused Services** (Board Composer, etc.)
   - Add deprecation notices
   - Mark for removal in future cleanup

4. **Document Orchestrators** (Unified LangGraph, Deep Agent System)
   - Add deprecation notices
   - Plan Python migration roadmap

---

**Last Updated:** Phase 4 Audit
**Status:** Remaining violations documented and prioritized

