# Agent-Workflow Integration Architecture Summary

**Quick Reference for All Teams**

---

## Current State (Before Integration)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SEPARATED SYSTEMS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENTS SYSTEM                    WORKFLOW SYSTEM               │
│  ┌──────────────┐                ┌──────────────┐             │
│  │ /agents      │                │ /ask-panel-v1│             │
│  │              │                │              │             │
│  │ Browse       │                │ Template     │             │
│  │ Create       │                │ Workflows    │             │
│  │ Manage       │                │              │             │
│  │              │                │ Hardcoded    │             │
│  │ agents table │                │ Experts      │             │
│  └──────────────┘                └──────────────┘             │
│        ❌ NO CONNECTION ❌                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target State (After Integration)

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTEGRATED SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                WORKFLOW DESIGNER (/ask-panel-v1)        │   │
│  │                                                         │   │
│  │  ┌────────────┐   ┌──────────────┐   ┌─────────────┐  │   │
│  │  │  Sidebar   │   │    Canvas    │   │  Properties │  │   │
│  │  │            │   │  (ReactFlow) │   │    Panel    │  │   │
│  │  │ ┌────────┐ │   │              │   │             │  │   │
│  │  │ │My Agents├─┼──▶│ [Agent Node] │◀──┤ Configure   │  │   │
│  │  │ └────────┘ │   │ [RAG Node]   │   │ Agent       │  │   │
│  │  │ [Modes]    │   │ [Tool Node]  │   │             │  │   │
│  │  │ [Templates]│   │ [Output]     │   │             │  │   │
│  │  └────────────┘   └──────────────┘   └─────────────┘  │   │
│  │                           │                            │   │
│  │                           ▼                            │   │
│  │                   ┌───────────────┐                    │   │
│  │                   │ Execute       │                    │   │
│  │                   │ with Agent    │                    │   │
│  │                   │ Profiles      │                    │   │
│  │                   └───────────────┘                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│                      ┌──────────────┐                          │
│                      │ agents table │                          │
│                      │ user_agents  │                          │
│                      └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Sidebar ↔ API
```
SidebarDesignerContent
     │
     │ useQuery(['user-agents', userId])
     ▼
GET /api/user-agents?userId={uuid}
     │
     ▼
{ agents: [...] }
```

### 2. Sidebar ↔ Canvas
```
AgentListItem (draggable)
     │
     │ onDragStart: setData('agent', agentProfile)
     ▼
Canvas (dropzone)
     │
     │ onDrop: createAgentNode(agentProfile)
     ▼
AgentNode (ReactFlow)
```

### 3. Canvas ↔ Properties Panel
```
User clicks AgentNode
     │
     ▼
setSelectedNode(agentNode)
     │
     ▼
NodePropertiesPanel
     │
     │ if (node.type === 'agent')
     ▼
AgentPropertiesView
     │
     │ User modifies config
     ▼
updateNodeData({ config: {...} })
```

### 4. Workflow ↔ Execution
```
User clicks "Execute"
     │
     │ extractAgentNodes(workflow)
     ▼
Build agentContexts: {
  "agent-node-1": {
    agentId: "uuid",
    system_prompt: "...",
    model: "gpt-4o",
    temperature: 0.7,
    tools: ["fda"],
    rag_enabled: true
  }
}
     │
     │ POST /api/langgraph-gui/execute
     ▼
Backend Execution Engine
     │
     │ For each agent node:
     │   - Fetch full agent profile
     │   - Initialize LLM with agent config
     │   - Use agent's system prompt
     │   - Apply agent's tools & RAG
     ▼
Stream results
```

---

## Data Structures

### Agent (from database)
```typescript
{
  id: string;                    // UUID
  display_name: string;          // "Dr. Sarah Mitchell"
  description: string;           // "FDA 510(k) Regulatory Expert"
  system_prompt: string;         // Agent's core prompt
  capabilities: string[];        // ["regulatory", "fda", "510k"]
  knowledge_domains: string[];   // ["regulatory", "medical-devices"]
  tier: number;                  // 1-3 (Expert, Advanced, Standard)
  model: string;                 // "gpt-4o"
  avatar: string;                // "/icons/avatars/avatar_0001.png"
  color: string;                 // "#3B82F6"
  temperature: number;           // 0.7
  max_tokens: number;            // 2000
  metadata: object;              // Additional config
}
```

### AgentNode (on canvas)
```typescript
{
  id: string;                    // "agent-1732123456789"
  type: "agent";
  position: { x: number, y: number };
  data: {
    type: "agent";
    agentId: string;             // References agents.id
    agentName: string;           // Display name
    agentAvatar: string;         // Visual representation
    agentColor: string;          // Theme color
    agent: Agent;                // Full agent profile
    label?: string;              // Node label (overridable)
    roleDescription?: string;    // Role in this workflow
    config?: {
      temperature?: number;      // Override agent default
      max_tokens?: number;       // Override agent default
      tools?: string[];          // Enabled tools
      rag_enabled?: boolean;     // Enable RAG
      system_prompt_override?: string; // Override prompt
    }
  }
}
```

### AgentContext (during execution)
```typescript
{
  agentId: string;               // UUID from database
  system_prompt: string;         // Final prompt (with overrides)
  model: string;                 // LLM model
  temperature: number;           // Temperature setting
  max_tokens: number;            // Max tokens
  tools: string[];               // Available tools
  rag_enabled: boolean;          // RAG flag
  knowledge_domains: string[];   // Accessible knowledge bases
}
```

---

## Component Ownership

| Component | Primary Agent | Files |
|-----------|---------------|-------|
| **Sidebar Agent List** | ux-ui-architect | `sidebar-view-content.tsx` |
| **Agent List Item** | ux-ui-architect | `sidebar-view-content.tsx` |
| **Agent Node** | reactflow-architect | `AgentNode.tsx` (new) |
| **Drop Handler** | reactflow-architect | `WorkflowBuilder.tsx` |
| **Properties Panel** | ux-ui-architect | `NodePropertiesPanel.tsx` |
| **Execution Engine** | langgraph-orchestration-architect | Backend workflow executor |
| **API Enhancement** | Backend agent | `/api/langgraph-gui/execute` |

---

## Key Workflows

### Workflow 1: Add Agent to Canvas
```
1. User opens /ask-panel-v1
2. Sidebar loads user's agents
3. User searches for "FDA expert"
4. User drags "Dr. Sarah Mitchell" to canvas
5. Canvas creates agent node
6. Node displays avatar, name, capabilities
```

### Workflow 2: Configure Agent
```
1. User clicks agent node
2. Properties panel opens
3. User sees:
   - Agent profile (read-only)
   - Workflow role (editable)
   - Model settings (overridable)
   - Tools & access (configurable)
4. User enables RAG, adds FDA tool
5. Changes save to node data
```

### Workflow 3: Execute Workflow
```
1. User builds workflow:
   - Input node
   - Agent node (Dr. Sarah)
   - RAG node
   - Tool node (FDA)
   - Output node
2. User clicks "Execute"
3. System extracts agent node
4. System builds agent context
5. Backend fetches agent profile
6. Backend executes with:
   - Dr. Sarah's system prompt
   - gpt-4o model
   - Temperature 0.7
   - FDA tool enabled
   - RAG enabled
7. Results stream back
```

### Workflow 4: Multi-Agent Collaboration
```
1. User builds workflow:
   - Input node
   - Agent 1: Regulatory Expert
   - Agent 2: Clinical Expert
   - Moderator node
   - Output node
2. Connections:
   - Input → Moderator
   - Moderator → Agent 1
   - Moderator → Agent 2
   - Agent 1 → Output
   - Agent 2 → Output
3. User clicks "Execute"
4. System orchestrates:
   - Moderator poses question
   - Agent 1 responds (regulatory view)
   - Agent 2 responds (clinical view)
   - Moderator synthesizes
5. Output shows combined expertise
```

---

## Technical Specifications

### Drag & Drop Protocol
```typescript
// onDragStart (Sidebar)
event.dataTransfer.setData('application/reactflow', JSON.stringify({
  type: 'agent',
  agentData: fullAgentProfile
}));

// onDrop (Canvas)
const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
if (data.type === 'agent') {
  createAgentNode(data.agentData, dropPosition);
}
```

### Node Registration
```typescript
// In WorkflowBuilder
const nodeTypes = {
  task: TaskNode,
  agent: AgentNode,      // NEW
  input: InputNode,
  output: OutputNode,
  orchestrator: OrchestratorNode,
};
```

### Execution Payload
```typescript
POST /api/langgraph-gui/execute
{
  workflow: {
    nodes: [...],
    edges: [...]
  },
  query: "What testing is required?",
  agentContexts: {                    // NEW
    "agent-node-1": {
      agentId: "uuid",
      system_prompt: "You are...",
      model: "gpt-4o",
      temperature: 0.7,
      tools: ["fda", "pubmed"],
      rag_enabled: true,
      knowledge_domains: ["regulatory"]
    }
  }
}
```

---

## Migration Path

### Phase 0: Current (Hardcoded)
```typescript
// Panel template
experts: [
  {
    expertType: 'regulatory_expert',
    context: { expertise: ['510k'] }
  }
]
```

### Phase 1: Hybrid (Template + Agents)
```typescript
// Panel template with agent reference
experts: [
  {
    type: 'agent',
    agentId: 'uuid-from-database',  // NEW
    expertType: 'regulatory_expert',
    context: { expertise: ['510k'] }
  }
]
```

### Phase 2: Full Integration (Agents Only)
```typescript
// Panel template references agents
experts: [
  {
    type: 'agent',
    agentId: 'uuid-from-database'
    // All config from database
  }
]

// Users can override in workflow
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Agent Visibility** | 100% of user's agents shown | Sidebar list count |
| **Agent Discoverability** | < 3 seconds to find agent | Search performance |
| **Drag & Drop Success** | > 95% successful drops | Drop success rate |
| **Node Rendering** | < 100ms render time | React profiler |
| **Configuration Time** | < 30 seconds average | User analytics |
| **Execution Success** | > 90% successful runs | Execution logs |
| **Multi-Agent Workflows** | Support 2-10 agents | Workflow complexity |

---

## Rollout Checklist

- [ ] **Week 1:** Sidebar agents list functional
- [ ] **Week 2:** Agent nodes render on canvas
- [ ] **Week 2:** Properties panel supports agents
- [ ] **Week 3:** Workflow execution uses agents
- [ ] **Week 3:** Connection validation works
- [ ] **Week 4:** Multi-agent workflows tested
- [ ] **Week 4:** Documentation complete
- [ ] **Week 4:** E2E tests pass
- [ ] **Week 5:** Beta release to users
- [ ] **Week 6:** Production rollout

---

## Quick Links

- [Full Requirements Doc](./AGENT_WORKFLOW_INTEGRATION_REQUIREMENTS.md)
- [Coordination Guide](./INTEGRATION_COORDINATION_GUIDE.md)
- [Mode 1 Implementation](./MODE_1_REACTFLOW_IMPLEMENTATION_GUIDE.md)
- [ReactFlow Docs](https://reactflow.dev/)
- [Agents API](../../04-services/agents/)

---

## Questions?

**Frontend Questions:** @ux-ui-architect, @reactflow-architect
**Backend Questions:** @langgraph-orchestration-architect
**General Questions:** Tag all agents in issue

**Office Hours:** Daily at 10 AM (project standup)
