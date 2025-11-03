# Shared Multi-Framework Architecture

## 🏗️ NEW Architecture (Decoupled & Reusable)

```
┌─────────────────────────────────────────────────────────────────┐
│                        VITAL Services                            │
├────────────────┬────────────────┬───────────────┬───────────────┤
│                │                │               │               │
│  Ask Expert    │   Ask Panel    │  Workflow     │  Solution     │
│                │                │  Designer     │  Builder      │
│                │                │               │               │
└────────┬───────┴────────┬───────┴───────┬───────┴───────┬───────┘
         │                │               │               │
         └────────────────┴───────────────┴───────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │   Multi-Framework Orchestrator         │
         │   (Shared Resource)                    │
         │                                        │
         │   • Framework Selection Logic          │
         │   • Execution Routing                  │
         │   • Code Generation                    │
         │   • Result Normalization               │
         └────────────────┬───────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │LangGraph │    │ AutoGen  │    │ CrewAI   │
    │ Adapter  │    │ Adapter  │    │ Adapter  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┴───────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │      Python AI Engine (Shared)         │
         │                                        │
         │  /frameworks/langgraph/execute        │
         │  /frameworks/autogen/execute          │
         │  /frameworks/crewai/execute           │
         └────────────────────────────────────────┘
```

---

## ✅ Benefits of Shared Architecture

### 1. **Loose Coupling**
- ❌ **Before**: AutoGen tightly coupled to Ask Panel
- ✅ **After**: Any service can use any framework

### 2. **Reusability**
```typescript
// Ask Expert can use LangGraph
await executeExpert("Healthcare CEO", prompt, message);

// Ask Panel can use AutoGen
await executePanel(experts, question);

// Workflow Designer can use ANY framework
await executeWorkflow(agents, input, { preferredFramework: 'crewai' });

// Solution Builder can use CrewAI
await executeSolutionBuilder(tasks, requirements);
```

### 3. **Framework Flexibility**
```typescript
// System recommends best framework automatically
const framework = orchestrator.recommendFramework({
  agentCount: 5,
  needsConversation: true,
  needsState: false,
  needsDelegation: true,
  complexity: 'high'
});
// → Returns: AutoGen (best for 5-agent conversations)
```

### 4. **Unified API**
```typescript
// Single endpoint for all frameworks
POST /api/frameworks/execute
{
  "workflow": {
    "framework": "autogen" | "langgraph" | "crewai",
    "agents": [...],
    "mode": "conversational"
  },
  "input": { "message": "..." },
  "metadata": { "source": "ask-panel" }
}
```

---

## 🎯 How Each Service Uses Shared Resources

### 1. Ask Expert (LangGraph)
```typescript
// Before: Custom LangGraph implementation
// After: Uses shared orchestrator

import { executeExpert } from '@/lib/orchestration/multi-framework-orchestrator';

export async function handleAskExpert(mode: Mode, message: string) {
  return await executeExpert(
    EXPERT_ROLES[mode],
    EXPERT_PROMPTS[mode],
    message,
    { model: 'gpt-4o', temperature: 0.7 }
  );
}
```

### 2. Ask Panel (AutoGen OR LangGraph)
```typescript
// Before: Tightly coupled to AutoGen
// After: Can use AutoGen OR LangGraph based on config

import { executePanel } from '@/lib/orchestration/multi-framework-orchestrator';

export async function handleAskPanel(
  experts: string[],
  question: string,
  mode: 'sequential' | 'collaborative'
) {
  // System automatically chooses:
  // - LangGraph for sequential
  // - AutoGen for collaborative
  return await executePanel(
    experts.map(type => EXPERT_TEMPLATES[type]),
    question,
    { maxRounds: 10 }
  );
}
```

### 3. Workflow Designer (All 3 Frameworks)
```typescript
// Uses shared orchestrator for ANY framework

import { executeWorkflow } from '@/lib/orchestration/multi-framework-orchestrator';

export async function executeCustomWorkflow(workflow: WorkflowDefinition) {
  return await executeWorkflow(
    workflow.agents,
    { messages: workflow.inputs },
    {
      preferredFramework: workflow.framework, // User's choice
      mode: workflow.mode,
      source: 'workflow-designer'
    }
  );
}
```

### 4. Solution Builder (CrewAI)
```typescript
// Before: Didn't exist
// After: Uses shared CrewAI adapter

import { executeSolutionBuilder } from '@/lib/orchestration/multi-framework-orchestrator';

export async function buildSolution(requirements: SolutionRequirements) {
  const tasks = [
    { role: 'Researcher', goal: 'Research', backstory: '...' },
    { role: 'Strategist', goal: 'Strategize', backstory: '...' },
    { role: 'Implementer', goal: 'Implement', backstory: '...' }
  ];
  
  return await executeSolutionBuilder(tasks, requirements);
}
```

---

## 📁 File Structure (Shared Resources)

```
apps/digital-health-startup/
├── src/
│   ├── lib/
│   │   └── orchestration/
│   │       ├── multi-framework-orchestrator.ts  ← Shared orchestrator
│   │       └── framework-utils.ts               ← Shared utilities
│   │
│   ├── app/api/
│   │   └── frameworks/
│   │       └── execute/
│   │           └── route.ts                     ← Shared API endpoint
│   │
│   ├── features/
│   │   ├── ask-expert/
│   │   │   └── services/
│   │   │       └── ask-expert-service.ts        ← Uses shared orchestrator
│   │   │
│   │   ├── ask-panel/
│   │   │   └── services/
│   │   │       └── ask-panel-service.ts         ← Uses shared orchestrator
│   │   │
│   │   ├── workflow-designer/
│   │   │   ├── adapters/                        ← Code generators only
│   │   │   │   ├── LangGraphAdapter.ts
│   │   │   │   ├── AutoGenAdapter.ts
│   │   │   │   └── CrewAIAdapter.ts
│   │   │   └── services/
│   │   │       └── workflow-execution.ts        ← Uses shared orchestrator
│   │   │
│   │   └── solution-builder/
│   │       └── services/
│   │           └── solution-builder-service.ts  ← Uses shared orchestrator
│   │
│   └── shared/                                   ← NEW: Shared resources
│       └── templates/
│           ├── expert-templates.ts              ← Shared expert configs
│           ├── agent-templates.ts               ← Shared agent templates
│           └── framework-configs.ts             ← Shared framework configs

services/ai-engine/
└── app/api/frameworks/                          ← Shared Python endpoints
    ├── langgraph/
    │   └── execute.py
    ├── autogen/
    │   └── execute.py
    └── crewai/
        └── execute.py
```

---

## 🔧 Migration Strategy

### Phase 1: Create Shared Resources ✅ (DONE)
- ✅ `multi-framework-orchestrator.ts`
- ✅ `/api/frameworks/execute/route.ts`
- ✅ Shared types and interfaces

### Phase 2: Refactor Services
```typescript
// Ask Expert - Use shared orchestrator
import { executeExpert } from '@/lib/orchestration';

// Ask Panel - Use shared orchestrator  
import { executePanel } from '@/lib/orchestration';

// Workflow Designer - Already uses adapters correctly

// Solution Builder - Use shared orchestrator
import { executeSolutionBuilder } from '@/lib/orchestration';
```

### Phase 3: Python AI Engine
```python
# services/ai-engine/app/api/frameworks/
@router.post("/frameworks/langgraph/execute")
@router.post("/frameworks/autogen/execute")
@router.post("/frameworks/crewai/execute")
```

---

## 📊 Comparison: Before vs After

| Aspect | Before (Coupled) | After (Shared) |
|--------|------------------|----------------|
| **AutoGen Usage** | Only Ask Panel | All services |
| **LangGraph Usage** | Ask Expert + some workflows | All services |
| **CrewAI Usage** | Only Workflow Designer | All services |
| **Code Duplication** | High (each service implements own) | Low (shared orchestrator) |
| **Flexibility** | Low (hard-coded per service) | High (dynamic framework selection) |
| **Maintenance** | Hard (changes in multiple places) | Easy (change once, affects all) |
| **Testing** | Must test each service separately | Test orchestrator once |

---

## 🚀 Next Steps

1. ✅ Created shared `MultiFrameworkOrchestrator`
2. ✅ Created shared `/api/frameworks/execute` endpoint
3. 🔄 TODO: Update Ask Panel to use shared orchestrator
4. 🔄 TODO: Update Ask Expert to use shared orchestrator
5. 🔄 TODO: Create Python AI Engine shared endpoints
6. 🔄 TODO: Create shared expert templates
7. 🔄 TODO: Add shared configuration management

---

**Key Insight**: Frameworks are **shared infrastructure**, not service-specific dependencies! 🎯

