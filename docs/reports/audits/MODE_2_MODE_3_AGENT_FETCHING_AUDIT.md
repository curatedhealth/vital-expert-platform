# 🔍 Mode 2 & Mode 3 Agent Orchestrator Audit

## Audit Date: January 2025

This document audits how Mode 2 (Automatic Agent Selection) and Mode 3 (Autonomous-Automatic) fetch and select agents, including logic, criteria, and potential issues.

---

## 📋 **Executive Summary**

### **Mode 2: Automatic Agent Selection**
- ✅ Uses `AgentSelectorService` for intelligent agent selection
- ✅ Implements Pinecone semantic search (GraphRAG)
- ⚠️ **Issue:** Not using the new GraphRAG hybrid search we just built
- ⚠️ **Issue:** Missing domain-based filtering
- ⚠️ **Issue:** Falls back to basic DB queries if Pinecone fails

### **Mode 3: Autonomous-Automatic**
- ✅ Uses same `AgentSelectorService` as Mode 2
- ✅ Same agent selection logic
- ✅ Adds autonomous reasoning layer on top
- ⚠️ **Same issues as Mode 2**

---

## 🔍 **Mode 2: Agent Fetching Flow**

### **Workflow Steps:**

```
1. analyze_query
   ↓
2. find_candidates (AgentSelectorService.findCandidateAgents)
   ↓
3. rank_and_select (AgentSelectorService.rankAgents)
   ↓
4. execute_mode1 (delegates to Mode 1 handler)
```

### **File:** `mode2-automatic-agent-selection.ts`

#### **Step 1: Query Analysis**
```typescript
// Line 198-234: analyzeQueryNode
const analysis = await agentSelectorService.analyzeQuery(state.query);
// Returns: QueryAnalysis with intent, domains, complexity, keywords
```

**Status:** ✅ Working  
**Method:** Uses OpenAI GPT-4 to classify query

---

#### **Step 2: Find Candidate Agents**
```typescript
// Line 239-263: findCandidatesNode
const candidates = await agentSelectorService.findCandidateAgents(
  state.query,          // User query text
  state.detectedDomains, // Domains from analysis
  10                    // Limit to 10 candidates
);
```

**Status:** ⚠️ **NOT OPTIMAL**  
**Issue:** Uses old Pinecone search, not GraphRAG hybrid search

---

#### **Step 3: Rank & Select**
```typescript
// Line 268-312: rankAndSelectNode
const rankings = agentSelectorService.rankAgents(
  state.candidateAgents,
  state.query,
  state.queryAnalysis
);
const selectedAgent = rankings[0]; // Takes top-ranked agent
```

**Status:** ✅ Working but could be better

---

## 🔍 **Mode 3: Agent Fetching Flow**

### **Workflow Steps:**

```
1. understand_goal (Chain-of-Thought)
   ↓
2. select_agent (AgentSelectorService)
   ↓
3. decompose_goal
   ↓
4. create_plan
   ↓
5. execute_react
   ↓
6. synthesize_answer
```

### **File:** `mode3-autonomous-automatic.ts`

#### **Agent Selection Node**
```typescript
// Line 168-206: selectAgentNode
const queryAnalysis = await agentSelectorService.analyzeQuery(state.query);
const candidateAgents = await agentSelectorService.findCandidateAgents(
  state.query,
  queryAnalysis.domains,
  5 // Get top 5 candidates (fewer than Mode 2)
);
const rankedAgents = agentSelectorService.rankAgents(
  candidateAgents,
  state.query,
  queryAnalysis.intent,
  queryAnalysis.domains
);
const selectedAgent = rankedAgents[0];
```

**Status:** ⚠️ **SAME ISSUES AS MODE 2**

---

## 🔎 **AgentSelectorService Implementation**

### **File:** `agent-selector-service.ts`

#### **1. findCandidateAgents()** (Line 163-234)

**Current Implementation:**
```typescript
async findCandidateAgents(
  query: string,
  domains: string[],
  limit: number = 10
): Promise<Agent[]> {
  // 1. Generate query embedding
  const queryEmbedding = await this.generateEmbedding(query);

  // 2. Search Pinecone
  const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);
  
  const searchParams: any = {
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true
  };

  // 3. Add domain filter (if domains provided)
  if (domains.length > 0) {
    searchParams.filter = {
      knowledge_domains: { $in: domains }
    };
  }

  const searchResults = await index.query(searchParams);

  // 4. Extract agent IDs
  const agentIds = searchResults.matches
    .map(match => match.metadata?.agent_id)
    .filter(Boolean);

  // 5. Fetch full agent details from Supabase
  const { data: agents } = await this.supabase
    .from('agents')
    .select('...')
    .in('id', agentIds);

  return agents || [];
}
```

**Issues Found:**

❌ **Issue 1: Not Using GraphRAG Hybrid Search**
- Currently uses basic Pinecone vector search
- Should use `agentGraphRAGService.hybridAgentSearch()` we just built
- Missing Supabase metadata filtering benefits

❌ **Issue 2: Namespace Not Specified**
- Searches default namespace, not `'agents'` namespace
- We synced agents to `'agents'` namespace, so search won't find them!

❌ **Issue 3: Weak Fallback**
- Falls back to basic DB query if Pinecone fails
- No domain/capability filtering in fallback

❌ **Issue 4: Domain Filter Syntax**
- Uses `knowledge_domains: { $in: domains }` 
- Pinecone metadata filtering syntax may not match array fields correctly

---

#### **2. rankAgents()** (Line 300+)

**Current Implementation:**
```typescript
rankAgents(
  candidates: Agent[],
  query: string,
  analysis: QueryAnalysis
): AgentRanking[] {
  // Multi-criteria scoring:
  // 1. Semantic similarity (from Pinecone)
  // 2. Domain relevance
  // 3. Tier preference
  // 4. Capability match
}
```

**Status:** ✅ Logic appears sound, but depends on candidates being correctly fetched

---

## 🔴 **Critical Issues**

### **Issue 1: Not Using Agents Namespace**

**Problem:**
```typescript
// Current (WRONG):
const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);
const searchResults = await index.query(searchParams);
// ↑ Searches default namespace (''), not 'agents' namespace
```

**Fix Required:**
```typescript
// Should be:
const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);
const agentsNamespace = index.namespace('agents');
const searchResults = await agentsNamespace.query(searchParams);
```

**Impact:** ⚠️ **HIGH** - Agent searches will fail or return wrong results

---

### **Issue 2: Not Using GraphRAG Hybrid Search**

**Problem:**
- Mode 2 & Mode 3 use basic Pinecone search
- Don't benefit from hybrid search we just built (`agentGraphRAGService`)
- Missing metadata filtering (tier, status, business_function)

**Fix Required:**
Replace `findCandidateAgents()` with:
```typescript
import { agentGraphRAGService } from '@/lib/services/agents/agent-graphrag-service';

const results = await agentGraphRAGService.searchAgents({
  query,
  topK: limit,
  filters: {
    knowledge_domain: domains[0],
    status: 'active',
    tier: 1,
  },
});
```

**Impact:** ⚠️ **MEDIUM** - Missing better search accuracy and filtering

---

### **Issue 3: Fallback Too Weak**

**Current Fallback:**
```typescript
private async fallbackAgentSearch(...) {
  // Just gets ANY agents, no filtering
  const { data: agents } = await this.supabase
    .from('agents')
    .select('...')
    .limit(limit);
  // ↑ No domain, tier, or capability filtering
}
```

**Impact:** ⚠️ **LOW** - Only affects edge cases when Pinecone fails

---

## ✅ **What Works Well**

1. **Query Analysis:** ✅ Excellent use of OpenAI for intent/domain extraction
2. **Ranking Logic:** ✅ Multi-criteria scoring is well-designed
3. **Error Handling:** ✅ Fallbacks in place
4. **Architecture:** ✅ Clean separation of concerns

---

## 🔧 **Recommended Fixes**

### **Priority 1: Fix Namespace Issue** 🔴

**File:** `agent-selector-service.ts`

```typescript
async findCandidateAgents(...) {
  // FIX: Use agents namespace
  const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);
  const agentsNamespace = index.namespace('agents'); // ← ADD THIS
  
  const searchParams = {
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true
  };
  
  const searchResults = await agentsNamespace.query(searchParams); // ← USE NAMESPACE
  // ... rest of code
}
```

---

### **Priority 2: Integrate GraphRAG Hybrid Search** 🟡

**Option A: Replace Entire Method**
```typescript
import { agentGraphRAGService } from '@/lib/services/agents/agent-graphrag-service';

async findCandidateAgents(query: string, domains: string[], limit: number) {
  const results = await agentGraphRAGService.searchAgents({
    query,
    topK: limit,
    minSimilarity: 0.6,
    filters: {
      knowledge_domain: domains.length > 0 ? domains[0] : undefined,
      status: 'active',
    },
  });
  
  return results.map(r => r.agent);
}
```

**Option B: Use Hybrid Search with Fallback**
```typescript
try {
  // Try GraphRAG first
  const results = await agentGraphRAGService.searchAgents({...});
  return results.map(r => r.agent);
} catch (error) {
  // Fallback to current implementation
  return await this.fallbackAgentSearch(query, domains, limit);
}
```

---

### **Priority 3: Improve Fallback Logic** 🟢

```typescript
private async fallbackAgentSearch(query: string, domains: string[], limit: number) {
  let query = this.supabase
    .from('agents')
    .select('...')
    .eq('status', 'active')  // ← Add status filter
    .order('tier', { ascending: true }) // ← Prefer higher tier
    .limit(limit);
  
  // Add domain filtering if available
  if (domains.length > 0) {
    query = query.overlaps('knowledge_domains', domains);
  }
  
  const { data } = await query;
  return data || [];
}
```

---

## 📊 **Comparison: Current vs Recommended**

| Aspect | Current | Recommended | Impact |
|--------|---------|-------------|--------|
| **Search Method** | Basic Pinecone | GraphRAG Hybrid | 🔴 High |
| **Namespace** | Default (`''`) | `'agents'` | 🔴 High |
| **Metadata Filtering** | None | Tier, Status, Domain | 🟡 Medium |
| **Fallback** | Basic DB query | Filtered DB query | 🟢 Low |

---

## 🎯 **Action Items**

1. ✅ **Fix namespace in `findCandidateAgents()`** - Use `'agents'` namespace
2. ✅ **Integrate GraphRAG hybrid search** - Replace or augment current search
3. ✅ **Improve fallback logic** - Add filtering to fallback queries
4. ✅ **Test Mode 2 with GraphRAG** - Verify agent selection works
5. ✅ **Test Mode 3 with GraphRAG** - Verify agent selection works
6. ✅ **Monitor search performance** - Compare old vs new approach

---

## 📝 **Code Changes Required**

### **File 1: `agent-selector-service.ts`**

**Change 1: Fix Namespace**
```typescript
// Line ~178
const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);
const agentsNamespace = index.namespace('agents'); // ← ADD

// Line ~193
const searchResults = await agentsNamespace.query(searchParams); // ← CHANGE
```

**Change 2: Integrate GraphRAG (Recommended)**
```typescript
// Replace findCandidateAgents() entirely
async findCandidateAgents(query: string, domains: string[], limit: number) {
  try {
    const { agentGraphRAGService } = await import('@/lib/services/agents/agent-graphrag-service');
    
    const results = await agentGraphRAGService.searchAgents({
      query,
      topK: limit,
      minSimilarity: 0.6,
      filters: {
        knowledge_domain: domains.length > 0 ? domains[0] : undefined,
        status: 'active',
      },
    });
    
    return results.map(r => r.agent);
  } catch (error) {
    console.warn('GraphRAG search failed, using fallback:', error);
    return await this.fallbackAgentSearch(query, domains, limit);
  }
}
```

---

## ✅ **Testing Checklist**

After fixes, verify:

- [ ] Mode 2 agent selection finds agents in Pinecone
- [ ] Mode 3 agent selection finds agents in Pinecone
- [ ] Domain filtering works correctly
- [ ] Tier/status filtering works
- [ ] Fallback works when Pinecone unavailable
- [ ] Ranking still produces good results
- [ ] Performance is acceptable (<500ms)

---

**Status:** ⚠️ **NEEDS FIXES** - Critical namespace issue must be fixed before production

**Impact:** Without fixes, Mode 2 & Mode 3 agent selection will fail or return incorrect agents

