# 🚀 LANGGRAPH COMPLETE MIGRATION PLAN

**Objective:** Migrate ALL AI/ML logic and workflows to LangGraph/LangChain architecture

**Status:** Migration in Progress
**Target Date:** Complete by end of sprint
**Priority:** CRITICAL

---

## 📋 Migration Checklist

### Phase 1: Core Orchestration (HIGH PRIORITY) ✅ IN PROGRESS

- [x] ✅ Ask Expert Graph - Already LangGraph
- [x] ✅ Panel Orchestrator - Already LangGraph
- [x] ✅ Advisory Board - Already LangGraph
- [x] ✅ Enhanced LangChain Service - Already LangChain
- [ ] 🔄 Master Orchestrator → LangGraph
- [ ] 🔄 Automatic Orchestrator → LangGraph
- [ ] 🔄 Expert Orchestrator → Delete (use Panel instead)

### Phase 2: Intent & Selection (MEDIUM PRIORITY)

- [ ] 🔄 Intent Classifier → LangGraph node
- [ ] 🔄 Agent Selector → LangGraph node
- [ ] 🔄 Domain Detector → LangGraph node
- [ ] 🔄 Agent Ranker → LangGraph node
- [ ] 🔄 Confidence Calculator → LangGraph node

### Phase 3: Response Processing (MEDIUM PRIORITY)

- [ ] 🔄 Response Synthesizer → LangGraph node
- [ ] 🔄 Consensus Builder → LangGraph node
- [ ] 🔄 Voting System → LangGraph node

### Phase 4: Specialized Services (LOW PRIORITY)

- [ ] 🔄 Digital Health Router → LangGraph conditional
- [ ] 🔄 Knowledge Domain Detector → LangGraph node
- [ ] 🔄 Board Composer → LangGraph workflow

---

## 🏗️ Architecture Vision

### Current State (Hybrid)
```
User Query
   ↓
TypeScript Orchestrator (master-orchestrator.ts)
   ├─→ TypeScript Intent Classifier
   ├─→ TypeScript Agent Selector
   └─→ LangGraph Ask Expert (isolated)
```

### Target State (Pure LangGraph)
```
User Query
   ↓
UNIFIED LANGGRAPH ORCHESTRATOR
   ↓
┌─────────────────────────────────┐
│      StateGraph Workflow        │
│  ┌──────────────────────────┐  │
│  │  classify_intent (node)  │  │
│  └──────────────────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  detect_domains (node)   │  │
│  └──────────────────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  select_agents (node)    │  │
│  └──────────────────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  route (conditional)     │  │
│  └──────────────────────────┘  │
│        ↓           ↓            │
│    single      multi-agent     │
│    agent       (panel)          │
│        ↓           ↓            │
│  ┌──────────────────────────┐  │
│  │  synthesize (node)       │  │
│  └──────────────────────────┘  │
│             ↓                   │
│         Response                │
└─────────────────────────────────┘
```

---

## 📐 Unified State Definition

```typescript
/**
 * Universal orchestration state for ALL AI/ML workflows
 * This state supports single agent, multi-agent, and panel modes
 */
const UnifiedOrchestrationState = Annotation.Root({
  // ===== INPUT =====
  query: Annotation<string>(),
  userId: Annotation<string>(),
  sessionId: Annotation<string>(),
  conversationId: Annotation<string | null>(),
  mode: Annotation<'single' | 'multi' | 'panel' | 'autonomous'>(),

  // ===== CONTEXT =====
  chatHistory: Annotation<Message[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  tenantId: Annotation<string | null>(),
  complianceLevel: Annotation<'standard' | 'hipaa' | 'gdpr'>(),

  // ===== INTENT & CLASSIFICATION =====
  intent: Annotation<IntentResult | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  domains: Annotation<string[]>({
    reducer: (current, update) => [...new Set([...current, ...update])],
    default: () => []
  }),
  confidence: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0
  }),

  // ===== AGENT SELECTION =====
  candidateAgents: Annotation<Agent[]>({
    reducer: (_, update) => update,
    default: () => []
  }),
  selectedAgents: Annotation<Agent[]>({
    reducer: (_, update) => update,
    default: () => []
  }),
  rankedAgents: Annotation<RankedAgent[]>({
    reducer: (_, update) => update,
    default: () => []
  }),

  // ===== EXECUTION =====
  agentResponses: Annotation<Map<string, AgentResponse>>({
    reducer: (current, update) => new Map([...current, ...update]),
    default: () => new Map()
  }),
  toolCalls: Annotation<ToolCall[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),

  // ===== CONSENSUS & SYNTHESIS =====
  consensusReached: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false
  }),
  consensus: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  dissent: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),

  // ===== RAG & KNOWLEDGE =====
  retrievedContext: Annotation<Document[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  sources: Annotation<Source[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  citations: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),

  // ===== OUTPUT =====
  finalResponse: Annotation<string>({
    reducer: (_, update) => update,
    default: () => ''
  }),
  metadata: Annotation<Record<string, any>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({})
  }),

  // ===== HUMAN-IN-THE-LOOP =====
  interruptReason: Annotation<string | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  humanApproval: Annotation<boolean | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  humanFeedback: Annotation<string | null>({
    reducer: (_, update) => update,
    default: () => null
  }),

  // ===== MONITORING =====
  tokenUsage: Annotation<TokenUsage>({
    reducer: (current, update) => ({
      prompt: (current?.prompt || 0) + (update?.prompt || 0),
      completion: (current?.completion || 0) + (update?.completion || 0),
      total: (current?.total || 0) + (update?.total || 0)
    }),
    default: () => ({ prompt: 0, completion: 0, total: 0 })
  }),
  performance: Annotation<PerformanceMetrics>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({
      intentClassification: 0,
      domainDetection: 0,
      agentSelection: 0,
      execution: 0,
      synthesis: 0,
      total: 0
    })
  }),
  logs: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  })
});
```

---

## 🔧 Implementation Strategy

### Step 1: Create Unified LangGraph Orchestrator

**File:** `src/features/chat/services/unified-langgraph-orchestrator.ts`

**Features:**
- Single entry point for ALL AI/ML workflows
- Supports all modes: single agent, multi-agent, panel, autonomous
- Built-in HITL checkpoints
- Comprehensive state persistence
- Visual workflow debugging
- Production-ready monitoring

### Step 2: Create LangGraph Nodes

Each TypeScript service becomes a LangGraph node:

```typescript
// Before (TypeScript class)
class IntentClassifier {
  async classifyIntent(query: string): Promise<IntentResult> {
    // logic
  }
}

// After (LangGraph node)
async function classifyIntent(state: UnifiedState): Promise<Partial<UnifiedState>> {
  const result = await llm.invoke([
    { role: 'system', content: INTENT_SYSTEM_PROMPT },
    { role: 'user', content: state.query }
  ]);

  return {
    intent: parseIntent(result),
    logs: [`✅ Intent classified: ${result.primaryIntent}`]
  };
}
```

### Step 3: Migrate Orchestrators One by One

**Priority Order:**
1. Master Orchestrator → `unified-langgraph-orchestrator.ts`
2. Automatic Orchestrator → Use unified orchestrator with mode='auto'
3. Delete Expert Orchestrator → Use panel orchestrator

### Step 4: Update API Routes

All API routes point to unified LangGraph orchestrator:

```typescript
// /api/chat/route.ts
import { unifiedOrchestrator } from '@/features/chat/services/unified-langgraph-orchestrator';

export async function POST(req: Request) {
  const { message, agentId, mode } = await req.json();

  const result = await unifiedOrchestrator.execute({
    query: message,
    mode: mode || 'single',
    selectedAgents: agentId ? [agentId] : [],
    // ... other params
  });

  return new Response(result.stream);
}
```

---

## 📊 Migration Progress Tracking

| Component | Current | Target | Status | ETA |
|-----------|---------|--------|--------|-----|
| Ask Expert | LangGraph | LangGraph | ✅ Done | - |
| Panel Orchestrator | LangGraph | LangGraph | ✅ Done | - |
| Advisory Board | LangGraph | LangGraph | ✅ Done | - |
| Master Orchestrator | TypeScript | LangGraph | 🔄 In Progress | Day 1-2 |
| Automatic Orchestrator | TypeScript | LangGraph | ⏳ Pending | Day 2-3 |
| Intent Classifier | TypeScript | LangGraph Node | ⏳ Pending | Day 3 |
| Agent Selector | TypeScript | LangGraph Node | ⏳ Pending | Day 3 |
| Domain Detector | TypeScript | LangGraph Node | ⏳ Pending | Day 4 |
| Response Synthesizer | TypeScript | LangGraph Node | ⏳ Pending | Day 4 |
| Unified Entry Point | N/A | LangGraph | 🔄 In Progress | Day 1 |

---

## 🎯 Success Criteria

### Technical Requirements
- [ ] 100% of AI/ML logic in LangGraph/LangChain
- [ ] Zero TypeScript orchestration classes
- [ ] Single unified orchestrator entry point
- [ ] All workflows have visual debugging
- [ ] Comprehensive state persistence
- [ ] HITL gates on critical operations

### Performance Requirements
- [ ] Intent classification < 200ms
- [ ] Agent selection < 300ms
- [ ] Total orchestration < 500ms (excluding LLM)
- [ ] Memory overhead < 100MB per session

### Quality Requirements
- [ ] Unit tests for all nodes
- [ ] Integration tests for workflows
- [ ] E2E tests for complete flows
- [ ] Performance benchmarks
- [ ] Visual workflow documentation

---

## 🚨 Migration Rules (ENFORCE STRICTLY)

### ✅ DO:
1. **ALL NEW AI/ML CODE MUST USE LANGGRAPH/LANGCHAIN**
2. Create LangGraph nodes for all logic
3. Use StateGraph for all workflows
4. Implement proper state annotations
5. Add HITL checkpoints for critical decisions
6. Use LangChain for all LLM interactions
7. Persist state with checkpointers
8. Add comprehensive logging

### ❌ DON'T:
1. **NEVER CREATE NEW TYPESCRIPT ORCHESTRATION CLASSES**
2. Don't bypass LangGraph for "quick fixes"
3. Don't duplicate logic outside LangGraph
4. Don't use raw OpenAI API (use LangChain)
5. Don't create manual state management
6. Don't skip state persistence
7. Don't forget HITL gates
8. Don't ignore visual debugging capabilities

---

## 📚 Code Standards

### LangGraph Node Template

```typescript
/**
 * LangGraph Node: [Node Name]
 * Purpose: [Description]
 * Input: [State properties used]
 * Output: [State properties updated]
 */
async function nodeName(
  state: UnifiedOrchestrationState
): Promise<Partial<UnifiedOrchestrationState>> {
  const startTime = Date.now();

  try {
    // 1. Extract inputs from state
    const { query, context } = state;

    // 2. Execute logic (use LangChain)
    const result = await llm.invoke(...);

    // 3. Update state
    return {
      // Updated state properties
      propertyName: result,
      logs: [`✅ ${nodeName} completed in ${Date.now() - startTime}ms`],
      performance: {
        [nodeName]: Date.now() - startTime
      }
    };
  } catch (error) {
    console.error(`❌ ${nodeName} error:`, error);
    return {
      logs: [`❌ ${nodeName} failed: ${error.message}`],
      interruptReason: `${nodeName}_error`
    };
  }
}
```

### LangGraph Workflow Template

```typescript
export function createWorkflow() {
  const workflow = new StateGraph(UnifiedOrchestrationState);

  // Add nodes
  workflow.addNode("node1", node1Function);
  workflow.addNode("node2", node2Function);

  // Add edges
  workflow.addEdge(START, "node1");
  workflow.addConditionalEdges(
    "node1",
    (state) => state.condition ? "node2" : END,
    {
      node2: "node2",
      [END]: END
    }
  );
  workflow.addEdge("node2", END);

  // Compile with checkpointer
  return workflow.compile({
    checkpointer: new SqliteSaver("./checkpoints.db")
  });
}
```

---

## 🔍 Testing Strategy

### Unit Tests (Per Node)
```typescript
describe('classifyIntent node', () => {
  it('should classify query intent correctly', async () => {
    const state = {
      query: 'What are FDA requirements for SaMD?',
      // ... other state
    };

    const result = await classifyIntent(state);

    expect(result.intent?.primaryDomain).toBe('regulatory');
    expect(result.intent?.confidence).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests (Per Workflow)
```typescript
describe('Unified Orchestrator Workflow', () => {
  it('should execute complete single-agent flow', async () => {
    const app = createUnifiedWorkflow();

    const result = await app.invoke({
      query: 'Test query',
      mode: 'single',
      // ... other inputs
    });

    expect(result.finalResponse).toBeTruthy();
    expect(result.logs.length).toBeGreaterThan(0);
  });
});
```

---

## 📖 Documentation Requirements

For each migrated component:

1. **Architecture Diagram** - Visual workflow
2. **State Schema** - Input/output state
3. **Node Documentation** - Purpose, logic, dependencies
4. **Error Handling** - Error cases and recovery
5. **Performance Metrics** - Expected latency
6. **Examples** - Usage examples and patterns

---

## 🎓 Team Training

### Required Reading
1. [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
2. [LangChain TypeScript Docs](https://js.langchain.com/docs/)
3. State machines and graph theory basics
4. This migration plan (this document)

### Workshops
- [ ] Week 1: LangGraph basics and state management
- [ ] Week 2: Building custom nodes and workflows
- [ ] Week 3: HITL and checkpointing
- [ ] Week 4: Testing and debugging LangGraph apps

---

## 🚀 Deployment Strategy

### Phase 1: Canary Deployment
- Deploy unified orchestrator alongside existing
- Route 10% of traffic to new system
- Monitor performance and errors
- Rollback if issues detected

### Phase 2: Gradual Rollout
- Increase to 50% traffic
- Monitor for 48 hours
- Address any issues
- Increase to 100%

### Phase 3: Cleanup
- Delete old TypeScript orchestrators
- Update all documentation
- Archive legacy code
- Celebrate! 🎉

---

## 📞 Support & Questions

**Migration Lead:** [Your Name]
**Slack Channel:** #langgraph-migration
**Office Hours:** Daily 2-3 PM
**Documentation:** `/docs/langgraph/`

---

**Last Updated:** 2025-01-26
**Version:** 1.0.0
**Status:** 🔄 Active Migration
