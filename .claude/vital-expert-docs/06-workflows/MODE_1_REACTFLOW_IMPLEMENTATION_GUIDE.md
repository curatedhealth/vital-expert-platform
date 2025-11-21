# Ask Expert Mode 1: ReactFlow Implementation Guide

**Version**: 1.0
**Date**: November 20, 2025
**Implementation Status**: ✅ Complete

---

## Overview

This guide documents the ReactFlow implementation of **Ask Expert Mode 1: Interactive Manual** workflow in the VITAL Designer (ask-panel-v1 page).

## Implementation Architecture

### File Structure

```
apps/digital-health-startup/src/
├── app/(app)/ask-panel-v1/
│   └── page.tsx                          # Designer page entry point
│
├── components/langgraph-gui/
│   ├── WorkflowBuilder.tsx               # Main ReactFlow canvas
│   ├── NodePalette.tsx                   # Node library
│   ├── TaskNode.tsx                      # Custom node rendering
│   │
│   ├── panel-workflows/
│   │   ├── mode1-ask-expert.ts          # Mode 1 panel configuration ⭐
│   │   ├── panel-definitions.ts          # Registry (updated to include Mode 1)
│   │   ├── workflow-factory.ts           # Factory for creating workflows
│   │   └── types.ts                      # TypeScript interfaces
│   │
│   └── workflows/
│       ├── mode1-workflow.ts             # Standalone workflow definition ⭐
│       └── README.md                     # Documentation ⭐
│
└── .claude/vital-expert-docs/
    ├── 04-services/ask-expert/
    │   └── MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md  # Original spec
    │
    └── 06-workflows/
        └── MODE_1_REACTFLOW_IMPLEMENTATION_GUIDE.md   # This file ⭐
```

---

## Quick Start

### Method 1: Load via Panel Workflows (Recommended)

```typescript
import { createDefaultPanelWorkflow } from '@/components/langgraph-gui/panel-workflows';

// Create the workflow
const workflow = createDefaultPanelWorkflow('mode1_ask_expert');

// Use in WorkflowBuilder
<WorkflowBuilder
  initialNodes={workflow.nodes}
  initialEdges={workflow.edges}
  apiBaseUrl="/api/langgraph-gui"
/>
```

### Method 2: Load via Standalone Workflow

```typescript
import { createMode1Workflow } from '@/components/langgraph-gui/workflows/mode1-workflow';

// Create the workflow
const { nodes, edges, metadata } = createMode1Workflow();

// Use in WorkflowBuilder
<WorkflowBuilder
  initialNodes={nodes}
  initialEdges={edges}
  apiBaseUrl="/api/langgraph-gui"
/>
```

### Method 3: Load via Designer UI (User-facing)

1. Open VITAL application
2. Navigate to **Designer** (ask-panel-v1)
3. Click **"Load Template"** or **"New Workflow"**
4. Select **"Ask Expert Mode 1: Interactive Manual"**
5. Workflow loads automatically

---

## Workflow Components

### Nodes (13 Total)

#### 1. Control Nodes (2)
- **START** - Entry point, user sends message
- **END** - Exit point, ready for next message

#### 2. LangGraph Nodes (8)

| Node ID | Label | Phase | Duration | Description |
|---------|-------|-------|----------|-------------|
| `load_agent` | 1️⃣ Load Agent | Initialization | 1-2s | Fetch agent profile, persona, knowledge bases |
| `load_context` | 2️⃣ Load Context | Initialization | 2-3s | Load conversation history (10 turns) |
| `update_context` | 3️⃣ Update Context (RAG) | Context Enrichment | 3-5s | Hybrid RAG search (semantic + keyword) |
| `agent_reasoning` | 4️⃣ Agent Reasoning | Reasoning | 3-5s | Chain-of-thought analysis |
| `spawn_specialists` | 5️⃣ Spawn Specialists | Sub-Agent Orchestration | 2-3s | Spawn Level 3 specialist agents |
| `tool_execution` | 6️⃣ Tool Execution | Tool Execution | 3-7s | Execute tools (FDA API, Standards DB) |
| `generate_response` | 7️⃣ Generate Response | Response Generation | 5-10s | Synthesize expert response (streaming) |
| `update_memory` | 8️⃣ Update Memory | Persistence | 1-2s | Persist conversation to database |

#### 3. Conditional Nodes (3)

| Node ID | Label | Condition | Routes |
|---------|-------|-----------|--------|
| `check_specialist_need` | 🔀 Specialists? | `needs_specialists == true` | spawn_specialists / check_tools_need |
| `check_tools_need` | 🔀 Tools? | `needs_tools == true` | tool_execution / generate_response |
| `check_continuation` | 🔀 Continue? | `continue && !error` | end |

### Edges (12 Total)

```
start → load_agent → load_context → update_context → agent_reasoning
                                                            ↓
                                                  check_specialist_need
                                                     ↓              ↓
                                          spawn_specialists    check_tools_need
                                                     ↓              ↓
                                                     └→ check_tools_need
                                                            ↓              ↓
                                                   tool_execution   generate_response
                                                            ↓              ↓
                                                            └→ generate_response
                                                                      ↓
                                                               update_memory
                                                                      ↓
                                                            check_continuation
                                                                      ↓
                                                                    end
```

---

## Workflow Execution Flow

### Typical Execution Path (With Specialists and Tools)

```
Time: 0s ────────────────────────────────────── 25s

User sends message
    ↓ 0-2s
[Load Agent] ────────► Load FDA 510(k) Expert profile
    ↓ 2-4s
[Load Context] ──────► Fetch last 10 conversation turns
    ↓ 4-9s
[Update Context] ────► RAG search: 5 relevant knowledge chunks
    ↓ 9-14s
[Agent Reasoning] ───► Determine: needs_specialists=true, needs_tools=true
    ↓ 14-17s
[Spawn Specialists] ─► Spawn Testing Requirements + Predicate Search specialists
    ↓ 17-24s
[Tool Execution] ────► Execute: predicate_device_search + regulatory_database_query
    ↓ 24-32s
[Generate Response] ─► Stream expert response (1200 tokens)
    ↓ 32-34s
[Update Memory] ─────► Save messages to ask_expert_messages table
    ↓
[END]
```

**Total Time**: ~25 seconds (typical with specialists + tools)

### Fast Path (No Specialists, No Tools)

```
Time: 0s ────────────────────────── 15s

User sends message
    ↓ 0-2s
[Load Agent]
    ↓ 2-4s
[Load Context]
    ↓ 4-9s
[Update Context]
    ↓ 9-14s
[Agent Reasoning] ───► Determine: needs_specialists=false, needs_tools=false
    ↓ (skip specialists)
    ↓ (skip tools)
    ↓ 14-22s
[Generate Response]
    ↓ 22-24s
[Update Memory]
    ↓
[END]
```

**Total Time**: ~15 seconds (fast path)

---

## Configuration Deep Dive

### Expert Configuration

Located in: `panel-workflows/mode1-ask-expert.ts`

```typescript
experts: [
  {
    id: 'fda_510k_expert',
    type: 'expert',
    label: 'FDA 510(k) Regulatory Expert',
    expertType: 'regulatory_expert',
    context: {
      expertise: [
        'FDA 510(k) premarket notifications',
        'Predicate device selection',
        'Substantial equivalence determination',
        'Testing protocol development',
        'FDA response strategies'
      ],
      display_name: 'Dr. Sarah Mitchell',
      specialty: 'FDA 510(k) Premarket Notification',
      system_prompt: `You are Dr. Sarah Mitchell, a regulatory affairs expert...`,
      knowledge_base_ids: [
        'fda-510k-database',
        'fda-guidance-library',
        'cfr-title-21',
        'iso-iec-standards',
        'device-classification'
      ],
      sub_agents: [
        'testing_requirements_specialist',
        'predicate_search_specialist',
        'substantial_equivalence_specialist',
        'fda_response_specialist'
      ]
    }
  }
]
```

### Node Configuration Example

```typescript
{
  id: 'agent_reasoning',
  type: 'task',
  taskId: 'chain_of_thought_reasoning',
  label: '4️⃣ Agent Reasoning',
  position: { x: 250, y: 510 },
  parameters: {
    duration: '3-5s',
    operations: [
      'Build reasoning prompt',
      'LLM analyzes query',
      'Determine tool needs',
      'Determine specialist needs',
      'Plan response strategy'
    ]
  },
  data: {
    description: 'Chain-of-thought analysis, plan response',
    icon: '🧠',
    phase: 'reasoning',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      reasoning_mode: 'chain_of_thought'
    }
  }
}
```

### Tool Configuration

Tools available for execution:

```typescript
tools: [
  'predicate_device_search',    // FDA 510(k) database search
  'regulatory_database_query',  // Internal regulatory DB
  'standards_search',           // ISO/IEC standards library
  'web_search',                 // External research
  'document_analysis'           // Analyze uploaded PDFs
]
```

### Phase Organization

The workflow is organized into 7 visual phases:

```typescript
phases: {
  nodes: [
    {
      id: 'phase_initialization',
      type: 'phase_group',
      config: {
        label: 'Phase 1: Initialization',
        color: '#3b82f6',
        nodes: ['load_agent', 'load_context']
      }
    },
    {
      id: 'phase_context',
      type: 'phase_group',
      config: {
        label: 'Phase 2: Context Enrichment',
        color: '#8b5cf6',
        nodes: ['update_context']
      }
    },
    // ... 5 more phases
  ]
}
```

---

## State Schema

The workflow maintains a comprehensive state object throughout execution:

```typescript
interface Mode1State {
  // Session Context
  session_id: string;
  user_id: string;
  tenant_id: string;
  mode: 'mode_1_interactive_manual';

  // Agent Selection
  agent_id: string;
  agent: AgentProfile;
  agent_persona: string;
  sub_agent_pool: Agent[];

  // Conversation State
  messages: BaseMessage[];
  current_message: string;
  conversation_history: Message[];
  turn_count: number;

  // Context Management
  context_window: string;
  rag_context: RAGChunk[];
  multimodal_context?: MultimodalContext;
  uploaded_documents: Document[];

  // Sub-Agent Orchestration
  needs_specialists: boolean;
  specialists_to_spawn: string[];
  spawned_specialist_ids: string[];
  specialist_results: SpecialistResult[];

  // Tool Execution
  needs_tools: boolean;
  tools_to_use: string[];
  tool_results: ToolResult[];

  // Reasoning & Generation
  thinking_steps: ThinkingStep[];
  reasoning_mode: 'chain_of_thought' | 'tree_of_thoughts';
  response: string;
  citations: Citation[];
  confidence_score: number;

  // Workflow Control
  workflow_step: string;
  continue_conversation: boolean;
  error?: string;

  // Metadata & Analytics
  tokens_used: TokenUsage;
  estimated_cost: number;
  response_time_ms: number;
  timestamp: string;
}
```

---

## Visual Customization

### Node Styling

Nodes are styled based on their phase:

```css
/* Phase colors */
.phase-initialization { border-color: #3b82f6; }  /* Blue */
.phase-context { border-color: #8b5cf6; }         /* Purple */
.phase-reasoning { border-color: #ec4899; }       /* Pink */
.phase-orchestration { border-color: #f59e0b; }   /* Amber */
.phase-tools { border-color: #10b981; }           /* Green */
.phase-generation { border-color: #06b6d4; }      /* Cyan */
.phase-persistence { border-color: #6366f1; }     /* Indigo */
```

### Edge Animation

```typescript
// Animated edges show active data flow
animated: true

// Conditional edges use colors
style: { stroke: '#10b981' }  // Green for "true" path
style: { stroke: '#6b7280' }  // Gray for "false" path
```

---

## API Integration

### Backend Endpoints

The workflow communicates with these API endpoints:

```typescript
// Session management
POST /api/ask-expert/mode-1/sessions
GET  /api/ask-expert/mode-1/sessions/:session_id

// Message streaming
POST /api/ask-expert/mode-1/chat/stream

// History retrieval
GET  /api/ask-expert/mode-1/sessions/:session_id/messages
```

### SSE Events

The workflow sends real-time events via Server-Sent Events:

```typescript
// Node execution
data: {"type": "thinking", "data": {"step": "load_agent", "description": "Loading expert profile"}}

// Token streaming
data: {"type": "token", "data": {"token": "Based"}}
data: {"type": "token", "data": {"token": " on"}}

// Completion
data: {"type": "complete", "data": {"message_id": "...", "cost": 0.047, ...}}
```

---

## Testing Guide

### 1. Visual Testing

**Objective**: Verify workflow renders correctly

```bash
# Start development server
npm run dev

# Navigate to:
http://localhost:3000/ask-panel-v1

# Actions:
1. Click "Load Template"
2. Select "Ask Expert Mode 1"
3. Verify:
   - All 13 nodes render
   - All 12 edges connect correctly
   - Node labels are readable
   - Phase colors are distinct
   - Conditional nodes have decision icons
```

### 2. Execution Testing

**Objective**: Verify workflow executes correctly

```typescript
// Test query
const testQuery = "What testing is required for a Class II device similar to the Smith Cardiac Monitor?";

// Expected behavior:
// 1. All nodes execute in sequence
// 2. Conditional edges route correctly
// 3. Specialists spawn if needed
// 4. Tools execute if needed
// 5. Response streams in real-time
// 6. Message persists to database
```

### 3. Performance Testing

**Objective**: Measure response times

```typescript
// Metrics to track:
const metrics = {
  load_agent: expect('<2s'),
  load_context: expect('<3s'),
  update_context: expect('<5s'),
  agent_reasoning: expect('<5s'),
  spawn_specialists: expect('<3s'),
  tool_execution: expect('<7s'),
  generate_response: expect('<10s'),
  update_memory: expect('<2s'),
  total: expect('<25s')
};
```

---

## Deployment Checklist

- [ ] Workflow definition files created
- [ ] Panel workflow configuration added
- [ ] PANEL_CONFIGS registry updated
- [ ] Expert configuration validated
- [ ] Node positions optimized for readability
- [ ] Edge routing verified
- [ ] Phase colors assigned
- [ ] Tool integrations tested
- [ ] Database schema supports all fields
- [ ] API endpoints implement SSE streaming
- [ ] Frontend renders nodes correctly
- [ ] Error handling implemented
- [ ] Monitoring/logging added
- [ ] Documentation complete
- [ ] Performance benchmarks met

---

## Troubleshooting

### Issue: Workflow doesn't load

**Solution:**
```typescript
// Check if workflow is registered
import { getAvailablePanelTypes } from '@/components/langgraph-gui/panel-workflows';
console.log(getAvailablePanelTypes());
// Should include 'mode1_ask_expert'
```

### Issue: Nodes render incorrectly

**Solution:**
```typescript
// Verify node positions are set
nodes.forEach(node => {
  console.log(`${node.id}: x=${node.position.x}, y=${node.position.y}`);
});
```

### Issue: Edges don't connect

**Solution:**
```typescript
// Verify source/target node IDs match
edges.forEach(edge => {
  const sourceExists = nodes.find(n => n.id === edge.source);
  const targetExists = nodes.find(n => n.id === edge.target);
  console.log(`${edge.id}: source=${!!sourceExists}, target=${!!targetExists}`);
});
```

### Issue: Workflow executes slowly

**Solution:**
1. Check database query performance (add indexes)
2. Optimize RAG search (reduce top_k)
3. Enable parallel tool execution
4. Cache frequently-used data (Redis)
5. Use faster LLM models for reasoning

---

## Future Enhancements

### Planned Features

1. **Visual State Inspection**
   - Real-time state viewer during execution
   - Hover over nodes to see current state
   - Timeline view of execution history

2. **Dynamic Node Addition**
   - Add custom nodes via UI
   - Configure tool integrations visually
   - Create custom conditional logic

3. **Workflow Templates**
   - Save custom workflow variants
   - Share workflows between teams
   - Import/export workflow definitions

4. **Performance Optimization**
   - Automatic node parallelization
   - Smart caching strategies
   - Predictive prefetching

5. **Advanced Analytics**
   - Cost breakdown per node
   - Bottleneck identification
   - A/B testing different workflows

---

## Related Documentation

- **[MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md](/.claude/vital-expert-docs/04-services/ask-expert/MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md)** - Original specification
- **[Workflow README](../../apps/digital-health-startup/src/components/langgraph-gui/workflows/README.md)** - Implementation docs
- **[LangGraph State Management](https://python.langgraph.com/docs/concepts/state/)** - LangGraph docs
- **[ReactFlow Documentation](https://reactflow.dev/docs/introduction/)** - ReactFlow API

---

## Support

For questions or issues:

1. Check this implementation guide
2. Review the detailed workflow visualization
3. Test with the Designer visual tool
4. Check backend logs for execution details
5. Contact the VITAL engineering team

---

**Implementation Status**: ✅ Complete
**Version**: 1.0
**Last Updated**: November 20, 2025
**Implemented By**: reactflow-architect agent
