# 🎯 Architecture Decision: Shared Multi-Framework Resources

## Decision Made
**Date**: November 3, 2025  
**Decision**: Frameworks (LangGraph, AutoGen, CrewAI) are **shared infrastructure**, not service-specific dependencies.

---

## ❌ What We're NOT Doing

```
┌─────────────┐
│ Ask Panel   │──────┐
└─────────────┘      │
                     ▼
              ┌─────────────┐
              │   AutoGen   │  ← Tightly coupled ❌
              └─────────────┘
                     
┌─────────────┐      ┌─────────────┐
│ Ask Expert  │──────│  LangGraph  │  ← Separate implementations ❌
└─────────────┘      └─────────────┘

┌─────────────┐      ┌─────────────┐
│  Workflow   │──────│  All Three  │  ← Isolated usage ❌
└─────────────┘      └─────────────┘
```

**Problems**:
- Code duplication
- Can't reuse AutoGen in Ask Expert
- Can't use LangGraph in Ask Panel
- Tight coupling = brittle system

---

## ✅ What We ARE Doing

```
                    VITAL Platform Services
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Ask Expert  │  │ Ask Panel   │  │  Workflow   │        │
│  │             │  │             │  │  Designer   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │               │
│         └────────────────┴────────────────┘               │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Multi-Framework           │
              │  Orchestrator              │
              │  (Shared Resource)         │
              │                            │
              │  • Framework Selection     │
              │  • Execution Routing       │
              │  • Result Normalization    │
              └────────────┬───────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │LangGraph  │   │ AutoGen   │   │  CrewAI   │
    │ (Shared)  │   │ (Shared)  │   │ (Shared)  │
    └───────────┘   └───────────┘   └───────────┘
         ↑               ↑               ↑
         └───────────────┴───────────────┘
                         │
                         ▼
              ┌────────────────────────────┐
              │  Python AI Engine          │
              │  (Shared Backend)          │
              └────────────────────────────┘
```

**Benefits**:
- ✅ No code duplication
- ✅ Any service can use any framework
- ✅ Loose coupling = flexible system
- ✅ Single source of truth
- ✅ Easy to test and maintain

---

## 🔍 Specific Decisions

### 1. AutoGen is NOT tied to Ask Panel
```typescript
// ❌ BEFORE: AutoGen only in Ask Panel
// services/ask-panel/autogen-executor.ts

// ✅ AFTER: AutoGen available everywhere
// lib/orchestration/multi-framework-orchestrator.ts
import { executePanel } from '@/lib/orchestration';  // Uses AutoGen
import { executeExpert } from '@/lib/orchestration'; // Can also use AutoGen!
```

### 2. LangGraph is NOT tied to Ask Expert
```typescript
// ❌ BEFORE: LangGraph only in Ask Expert
// services/ask-expert/langgraph-executor.ts

// ✅ AFTER: LangGraph available everywhere
await executeExpert(...);    // Uses LangGraph
await executePanel(...);     // Can also use LangGraph!
await executeWorkflow(...);  // Can use any framework
```

### 3. Your AutoGen Fork is a Shared Dependency
```python
# ❌ BEFORE: Installed only for Ask Panel
# services/ask-panel/requirements.txt
pyautogen>=0.2.0

# ✅ AFTER: Installed once, used everywhere
# services/ai-engine/requirements.txt
git+https://github.com/curatedhealth/autogen.git@main
```

---

## 🎯 Use Cases

### Ask Expert
```typescript
// Primary: LangGraph (state management)
// Can use: AutoGen (if multi-perspective needed)
// Can use: CrewAI (if task delegation needed)

await executeExpert("CEO", prompt, message);
// Orchestrator chooses best framework automatically
```

### Ask Panel
```typescript
// Primary: AutoGen (multi-agent conversations)
// Can use: LangGraph (if sequential flow needed)
// Can use: CrewAI (if hierarchical needed)

await executePanel(experts, question);
// Orchestrator uses AutoGen for collaborative discussion
```

### Workflow Designer
```typescript
// User chooses framework via UI
// All 3 frameworks available

await executeWorkflow(agents, input, {
  preferredFramework: userChoice  // 'langgraph' | 'autogen' | 'crewai'
});
```

### Solution Builder
```typescript
// Primary: CrewAI (task delegation)
// Can use: LangGraph (if conditional routing needed)
// Can use: AutoGen (if consensus needed)

await executeSolutionBuilder(tasks, requirements);
// Orchestrator uses CrewAI for hierarchical execution
```

---

## 📊 Framework Selection Logic

The orchestrator automatically recommends the best framework:

```typescript
orchestrator.recommendFramework({
  agentCount: 5,
  needsConversation: true,
  needsState: false,
  needsDelegation: false,
  complexity: 'high'
});
// → Returns: AutoGen (best for 5-agent conversations)

orchestrator.recommendFramework({
  agentCount: 3,
  needsConversation: false,
  needsState: true,
  needsDelegation: false,
  complexity: 'medium'
});
// → Returns: LangGraph (best for state management)

orchestrator.recommendFramework({
  agentCount: 7,
  needsConversation: false,
  needsState: false,
  needsDelegation: true,
  complexity: 'high'
});
// → Returns: CrewAI (best for task delegation)
```

---

## 🏗️ Implementation Details

### Files Created
```
apps/digital-health-startup/
  src/
    lib/orchestration/
      ✅ multi-framework-orchestrator.ts      (Shared orchestrator)
    app/api/frameworks/execute/
      ✅ route.ts                             (Shared API endpoint)

services/ai-engine/
  app/api/
    ✅ frameworks.py                          (Shared Python executors)
```

### Key Interfaces
```typescript
// Shared types for all frameworks
export interface AgentDefinition {
  id: string;
  role: string;
  systemPrompt: string;
  // ... framework-agnostic config
}

export interface ExecutionRequest {
  workflow: WorkflowConfig;  // Includes framework choice
  input: ExecutionInput;
  metadata: ExecutionMetadata;
}

// Works with ALL frameworks
```

---

## 🎉 Summary

**Core Principle**: Frameworks are **shared infrastructure**, like databases or APIs.

**Before**: Each service had its own framework implementation  
**After**: All services share a unified orchestrator

**Your AutoGen Fork**: Integrated as a shared dependency, not tied to Ask Panel

---

**Status**: Architecture implemented, ready for service migration! 🚀

**Next**: Refactor Ask Panel and Ask Expert to use the shared orchestrator.
