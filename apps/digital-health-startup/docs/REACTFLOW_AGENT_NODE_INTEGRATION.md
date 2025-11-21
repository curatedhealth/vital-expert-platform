# ReactFlow Agent Node Integration Guide

## Overview

This document describes the integration of AI agents into the ReactFlow workflow builder. Agent nodes allow users to visually incorporate AI agents from the agents store into their LangGraph workflows, providing a seamless frontend-backend integration.

## Architecture

### Component Hierarchy

```
WorkflowBuilder
├── AgentNode (Custom ReactFlow Node)
├── AgentConfigModal (Configuration Dialog)
├── NodePalette (with Agent category)
└── node-builders.ts (Agent node factories)
```

### Key Files

| File | Purpose |
|------|---------|
| `/src/components/langgraph-gui/AgentNode.tsx` | Custom ReactFlow node component for agents |
| `/src/components/langgraph-gui/AgentConfigModal.tsx` | Modal for selecting and configuring agents |
| `/src/components/langgraph-gui/panel-workflows/node-builders.ts` | Factory functions for creating agent nodes |
| `/src/components/langgraph-gui/panel-workflows/types.ts` | TypeScript type definitions |
| `/src/components/langgraph-gui/TaskLibrary.tsx` | Added `agent_node` task definition |
| `/src/components/langgraph-gui/NodePalette.tsx` | Added "Agent" category tab |
| `/src/components/langgraph-gui/WorkflowBuilder.tsx` | Integrated agent node type and handlers |

## Data Flow

### 1. Agent Node Creation

```typescript
// From drag-and-drop in NodePalette
User drags "AI Agent" from palette
  → WorkflowBuilder.onDrop() detects agent_node
  → Creates agent node with type: 'agent'
  → Node added to ReactFlow canvas
```

### 2. Agent Configuration

```typescript
// Click on agent node
User clicks agent node
  → AgentNode.onOpenConfig()
  → WorkflowBuilder.handleOpenAgentConfig()
  → AgentConfigModal opens
  → User selects agent from agents store
  → WorkflowBuilder.handleSelectAgent()
  → Node data updated with agent info
```

### 3. LangGraph Coordination

```typescript
// Agent node data structure for LangGraph
{
  id: "agent-1234567890",
  type: "agent",
  data: {
    agent: Agent,           // Full agent object from store
    agentId: string,        // Agent UUID
    agentName: string,      // Agent name (unique identifier)
    label: string,          // Display name
    configured: boolean,    // Configuration status
    enabled: boolean,       // Execution status
    _original_type: "agent" // Type marker for LangGraph
  }
}
```

## Component Details

### AgentNode Component

**File:** `/src/components/langgraph-gui/AgentNode.tsx`

**Visual Design:**
- **Color Scheme:** Purple/violet theme to distinguish from task nodes (green/blue)
- **Icon:** Robot emoji (🤖) or custom agent avatar
- **Badges:** Shows tier (1, 2, 3), skills count, RAG status
- **Status Indicators:** Checkmark (configured) or AlertCircle (not configured)

**Props:**
```typescript
interface AgentNodeProps {
  id: string;
  data: {
    agent?: Agent;
    agentId?: string;
    agentName?: string;
    label?: string;
    configured?: boolean;
    enabled?: boolean;
  };
  selected?: boolean;
  onOpenConfig?: () => void;
  onDelete?: (nodeId: string) => void;
}
```

**Features:**
- Drag-and-drop compatible
- Click to configure agent
- Delete with confirmation
- Visual feedback for selection and configuration status
- Shows agent metadata (tier, domain, model, capabilities)

### AgentConfigModal Component

**File:** `/src/components/langgraph-gui/AgentConfigModal.tsx`

**Features:**
- Browse all available agents from the agents store
- Filter by tier (All, Tier 1, Tier 2, Tier 3)
- Search by name, description, or domain
- View agent details (capabilities, domain, model)
- Select agent and confirm

**Props:**
```typescript
interface AgentConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAgent: (agent: Agent) => void;
  currentAgent?: Agent | null;
  nodeId?: string;
}
```

**Data Source:**
- Uses `useAgentsStore` from `/src/lib/stores/agents-store.ts`
- Loads only active/testing agents
- Displays agent metadata: tier, domain_expertise, capabilities, model, RAG status

### Node Builder Functions

**File:** `/src/components/langgraph-gui/panel-workflows/node-builders.ts`

```typescript
/**
 * Creates an agent node
 */
export function createAgentNode(
  id: string,
  agent?: Agent,
  agentId?: string,
  label?: string,
  position?: { x: number; y: number }
): Node;

/**
 * Creates an agent node from a minimal configuration
 */
export function createAgentNodeFromId(
  nodeId: string,
  agentId: string,
  label?: string,
  position?: { x: number; y: number }
): Node;
```

**Usage Examples:**

```typescript
// Create agent node with full agent object
const agentNode = createAgentNode(
  'agent-1',
  agent,
  undefined,
  undefined,
  { x: 300, y: 200 }
);

// Create agent node with just an ID
const agentNodeFromId = createAgentNodeFromId(
  'agent-2',
  'agent-uuid-123',
  'Medical Expert',
  { x: 500, y: 200 }
);

// In workflow configuration
const nodes: PanelNodeConfig[] = [
  {
    id: 'agent-1',
    type: 'agent',
    label: 'Clinical Research Agent',
    position: { x: 400, y: 300 },
    data: {
      agentId: 'clinical-research-agent-id',
    },
  },
];
```

## NodePalette Integration

### Changes Made

1. **Added "Agent" Category:**
   - New tab in category tabs
   - Purple color scheme (#7c3aed)
   - Positioned first for visibility

2. **Added Agent Task Definition:**
   - ID: `agent_node`
   - Icon: 🤖
   - Category: `Agent`
   - Draggable to canvas

3. **Dynamic Agent Loading:**
   - Loads agents from `vitalpath-agents-store` in localStorage
   - Falls back to default agent list if store is empty
   - Shows top 10 agents

**Category Color:**
```typescript
case 'Agent':
  return {
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#c4b5fd'
  };
```

## WorkflowBuilder Integration

### State Management

```typescript
// Agent configuration modal state
const [agentConfigModal, setAgentConfigModal] = useState<{
  isOpen: boolean;
  nodeId: string | null;
  currentAgent: Agent | null;
}>({
  isOpen: false,
  nodeId: null,
  currentAgent: null,
});

// Ref for stable callback
const handleOpenAgentConfigRef = useRef<((nodeId: string) => void) | null>(null);
```

### Event Handlers

```typescript
/**
 * Opens agent configuration modal for a specific node
 */
const handleOpenAgentConfig = useCallback((nodeId: string) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (node && node.type === 'agent') {
    setAgentConfigModal({
      isOpen: true,
      nodeId,
      currentAgent: (node.data as any)?.agent || null,
    });
  }
}, [nodes]);

/**
 * Updates node with selected agent
 */
const handleSelectAgent = useCallback((agent: Agent) => {
  if (agentConfigModal.nodeId) {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === agentConfigModal.nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              agent,
              agentId: agent.id,
              agentName: agent.name,
              label: agent.display_name,
              configured: true,
            },
          };
        }
        return node;
      })
    );
  }
  setAgentConfigModal({ isOpen: false, nodeId: null, currentAgent: null });
}, [agentConfigModal.nodeId, setNodes]);
```

### Node Type Registration

```typescript
const nodeTypes = React.useMemo(() => ({
  orchestrator: OrchestratorNode,
  input: InputNode,
  output: OutputNode,
  task: (props: any) => <TaskNode {...props} />,
  agent: (props: any) => {
    const nodeId = props.id;
    const isSelected = nodeId === selectedNodeIdRef.current;
    return (
      <AgentNode
        {...props}
        selected={isSelected}
        onOpenConfig={() => handleOpenAgentConfigRef.current?.(nodeId)}
        onDelete={(id: string) => handleDeleteNodeRef.current?.(id)}
      />
    );
  },
}), []);
```

### Drag-and-Drop Handler

```typescript
const onDrop = useCallback((event: React.DragEvent) => {
  // ...existing code...

  if (taskData) {
    const task: TaskDefinition = JSON.parse(taskData);

    // Check if this is an agent node
    if (task.id === 'agent_node') {
      const newNode: Node = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        position,
        data: {
          agentId: null,
          agentName: null,
          label: 'AI Agent',
          configured: false,
          enabled: true,
          _original_type: 'agent',
        },
      };
      setNodes((nds) => nds.concat(newNode));
    } else {
      // Regular task node
      // ...existing code...
    }
  }
}, [reactFlowInstance, setNodes, setEdges, nodes, combineTasks]);
```

## LangGraph Integration

### Data Structure Mapping

**ReactFlow → LangGraph Transformation:**

```typescript
// ReactFlow Agent Node
{
  id: "agent-1234567890",
  type: "agent",
  position: { x: 300, y: 200 },
  data: {
    agent: {
      id: "uuid-agent",
      name: "clinical_research_agent",
      display_name: "Clinical Research Agent",
      tier: 2,
      domain_expertise: "medical",
      capabilities: ["pubmed_search", "clinical_trials"],
      rag_enabled: true,
      model: "gpt-4o",
      system_prompt: "...",
      // ...other agent properties
    },
    agentId: "uuid-agent",
    agentName: "clinical_research_agent",
    label: "Clinical Research Agent",
    configured: true,
    enabled: true,
  }
}

// LangGraph Node Configuration
{
  node_id: "agent-1234567890",
  node_type: "agent",
  agent_config: {
    agent_id: "uuid-agent",
    agent_name: "clinical_research_agent",
    model: "gpt-4o",
    system_prompt: "...",
    capabilities: ["pubmed_search", "clinical_trials"],
    rag_enabled: true,
    tier: 2,
  },
  position: { x: 300, y: 200 },
}
```

### Workflow Export Format

When saving a workflow with agent nodes:

```json
{
  "name": "Clinical Research Workflow",
  "nodes": [
    {
      "id": "input-1",
      "type": "input",
      "label": "Research Query",
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "agent-1234567890",
      "type": "agent",
      "label": "Clinical Research Agent",
      "position": { "x": 300, "y": 200 },
      "data": {
        "agentId": "uuid-agent",
        "agentName": "clinical_research_agent",
        "configured": true,
        "agent": {
          "id": "uuid-agent",
          "name": "clinical_research_agent",
          "display_name": "Clinical Research Agent",
          "model": "gpt-4o",
          "system_prompt": "...",
          "capabilities": ["pubmed_search", "clinical_trials"],
          "tier": 2,
          "rag_enabled": true
        }
      }
    },
    {
      "id": "output-1",
      "type": "output",
      "label": "Research Report",
      "position": { "x": 500, "y": 200 }
    }
  ],
  "edges": [
    { "id": "e1", "source": "input-1", "target": "agent-1234567890" },
    { "id": "e2", "source": "agent-1234567890", "target": "output-1" }
  ]
}
```

### LangGraph Execution

The LangGraph orchestrator should:

1. **Parse Agent Nodes:**
   - Extract `agentId` or `agentName` from node data
   - Load full agent configuration from database if needed
   - Validate agent is active and available

2. **Create LangGraph Node:**
   - Map ReactFlow agent node to LangGraph agent node
   - Apply agent's system prompt, model, and tools
   - Enable RAG if `rag_enabled: true`

3. **Execute Workflow:**
   - Route messages to agent nodes based on workflow edges
   - Execute agent with proper context and tools
   - Stream responses back to frontend

**Example LangGraph Integration:**

```python
# In LangGraph backend
from langgraph import StateGraph, Node

def create_agent_node(agent_config: dict) -> Node:
    """Create LangGraph node from agent configuration"""
    agent_id = agent_config.get("agentId") or agent_config.get("agentName")
    agent = load_agent_from_database(agent_id)

    return Node(
        id=agent_config["node_id"],
        agent=agent,
        system_prompt=agent["system_prompt"],
        model=agent["model"],
        tools=agent["capabilities"],
        rag_enabled=agent.get("rag_enabled", False)
    )

def build_workflow_from_reactflow(workflow_data: dict) -> StateGraph:
    """Build LangGraph workflow from ReactFlow export"""
    graph = StateGraph()

    for node in workflow_data["nodes"]:
        if node["type"] == "agent":
            langgraph_node = create_agent_node(node["data"])
            graph.add_node(langgraph_node)
        # ...handle other node types

    for edge in workflow_data["edges"]:
        graph.add_edge(edge["source"], edge["target"])

    return graph
```

## Usage Examples

### Example 1: Simple Agent Workflow

```typescript
import { createAgentNode, createInputNode, createOutputNode } from './panel-workflows/node-builders';
import { useAgentsStore } from '@/lib/stores/agents-store';

const { agents } = useAgentsStore();
const clinicalAgent = agents.find(a => a.name === 'clinical_research_agent');

const nodes = [
  createInputNode('input-1', 'Research Query', '', { x: 100, y: 100 }),
  createAgentNode('agent-1', clinicalAgent, undefined, undefined, { x: 300, y: 200 }),
  createOutputNode('output-1', 'Research Report', 'markdown', { x: 500, y: 200 }),
];

const edges = [
  { id: 'e1', source: 'input-1', target: 'agent-1' },
  { id: 'e2', source: 'agent-1', target: 'output-1' },
];
```

### Example 2: Multi-Agent Collaboration

```typescript
const regulatoryAgent = agents.find(a => a.name === 'regulatory_affairs_agent');
const medicalAgent = agents.find(a => a.name === 'medical_research_agent');

const nodes = [
  createInputNode('input-1', 'Drug Query', '', { x: 100, y: 200 }),
  createAgentNode('agent-medical', medicalAgent, undefined, undefined, { x: 300, y: 100 }),
  createAgentNode('agent-regulatory', regulatoryAgent, undefined, undefined, { x: 300, y: 300 }),
  createTaskNode('task-synthesis', synthesisTask, 'Synthesize Results', {}, { x: 500, y: 200 }),
  createOutputNode('output-1', 'Final Report', 'markdown', { x: 700, y: 200 }),
];

const edges = [
  { id: 'e1', source: 'input-1', target: 'agent-medical' },
  { id: 'e2', source: 'input-1', target: 'agent-regulatory' },
  { id: 'e3', source: 'agent-medical', target: 'task-synthesis' },
  { id: 'e4', source: 'agent-regulatory', target: 'task-synthesis' },
  { id: 'e5', source: 'task-synthesis', target: 'output-1' },
];
```

### Example 3: Programmatic Agent Assignment

```typescript
function createDynamicWorkflow(userQuery: string, requiredDomains: string[]) {
  const { agents } = useAgentsStore();

  // Find best agents for each domain
  const selectedAgents = requiredDomains.map(domain =>
    agents.find(a => a.domain_expertise === domain && a.tier === 1)
  ).filter(Boolean);

  const nodes = [
    createInputNode('input', 'User Query', userQuery, { x: 100, y: 200 }),
    ...selectedAgents.map((agent, i) =>
      createAgentNode(
        `agent-${i}`,
        agent,
        undefined,
        agent.display_name,
        { x: 300, y: 100 + (i * 150) }
      )
    ),
    createOutputNode('output', 'Response', 'markdown', { x: 500, y: 200 }),
  ];

  const edges = [
    ...selectedAgents.map((_, i) => ({
      id: `e-in-${i}`,
      source: 'input',
      target: `agent-${i}`,
    })),
    ...selectedAgents.map((_, i) => ({
      id: `e-out-${i}`,
      source: `agent-${i}`,
      target: 'output',
    })),
  ];

  return { nodes, edges };
}
```

## Testing Checklist

### Frontend Testing

- [ ] Agent node appears in NodePalette under "Agent" category
- [ ] Agent node can be dragged from palette to canvas
- [ ] Agent node renders with correct styling (purple theme)
- [ ] Click on agent node opens AgentConfigModal
- [ ] AgentConfigModal loads agents from store
- [ ] Search and filter work in AgentConfigModal
- [ ] Selecting agent updates node with agent data
- [ ] Configured agent node shows check icon and agent details
- [ ] Delete button removes agent node from canvas
- [ ] Edges can connect to/from agent nodes
- [ ] Agent node can be selected and highlighted
- [ ] Workflow can be saved with agent nodes
- [ ] Workflow can be loaded with agent nodes

### Integration Testing

- [ ] Agent node data exports correctly in workflow JSON
- [ ] Agent node can be recreated from saved workflow
- [ ] Multiple agent nodes can exist in same workflow
- [ ] Agent nodes work with input/output/task nodes
- [ ] Agent configuration persists across save/load cycles

### LangGraph Coordination

- [ ] LangGraph backend can parse agent node data
- [ ] Agent execution uses correct model and system prompt
- [ ] Agent capabilities/tools are properly configured
- [ ] RAG is enabled/disabled based on agent config
- [ ] Agent responses stream back to frontend correctly

## Future Enhancements

### Planned Features

1. **Agent Templates:**
   - Pre-configured agent workflows
   - Industry-specific agent combinations
   - Quick-start templates

2. **Agent Performance Metrics:**
   - Show agent usage statistics in node
   - Display success rate and response time
   - Confidence level indicator

3. **Advanced Configuration:**
   - Override agent parameters per workflow
   - Custom tools per workflow instance
   - Dynamic agent selection based on input

4. **Agent Collaboration Patterns:**
   - Sequential routing
   - Parallel processing
   - Hierarchical delegation
   - Consensus-based decision making

5. **Visual Enhancements:**
   - Agent activity indicator during execution
   - Streaming response visualization
   - Agent-to-agent communication paths

## Troubleshooting

### Common Issues

**Issue:** Agent node not appearing in palette
- **Solution:** Check that `agent_node` is added to `TASK_DEFINITIONS` in TaskLibrary.tsx
- **Solution:** Verify "Agent" category is added to NodePalette category tabs

**Issue:** AgentConfigModal shows no agents
- **Solution:** Ensure agents store is loaded: `useAgentsStore().loadAgents(false)`
- **Solution:** Check browser localStorage for `vitalpath-agents-store`
- **Solution:** Verify API endpoint `/api/agents-crud` is working

**Issue:** Agent node not clickable/configurable
- **Solution:** Check that `handleOpenAgentConfigRef` is set in WorkflowBuilder
- **Solution:** Verify `onOpenConfig` callback is passed to AgentNode
- **Solution:** Ensure AgentConfigModal is rendered in WorkflowBuilder

**Issue:** Agent data not persisting in workflow save
- **Solution:** Check workflow export includes `data` field for agent nodes
- **Solution:** Verify agent object is serializable (no circular references)
- **Solution:** Ensure workflow save handler includes agent node data

**Issue:** LangGraph can't find agent
- **Solution:** Verify `agentId` or `agentName` is included in node data
- **Solution:** Check agent still exists in database (not deleted/deprecated)
- **Solution:** Ensure LangGraph backend has access to agents database

## Conclusion

The agent node integration provides a seamless way to incorporate AI agents from the VITAL system into visual workflows. The architecture ensures:

- **Clean Separation:** ReactFlow handles visualization, agents store handles data
- **Type Safety:** Full TypeScript support for agent data structures
- **Extensibility:** Easy to add new agent types and configurations
- **LangGraph Compatibility:** Data structure designed for backend coordination

For questions or issues, refer to:
- `/src/features/agents/services/agent-service.ts` - Agent data access
- `/src/lib/stores/agents-store.ts` - Agent state management
- `.claude/agents/langgraph-orchestration-architect.md` - LangGraph coordination
- `.claude/agents/reactflow-architect.md` - ReactFlow patterns
