# Agent-Workflow Integration Coordination Guide

**For:** All Specialized Agents
**Purpose:** Coordinate implementation across multiple agents
**Date:** 2025-11-21

---

## Quick Reference

| Component | Owner Agent | Files to Modify | Dependencies |
|-----------|-------------|-----------------|--------------|
| **Sidebar Agents List** | `ux-ui-architect` | `sidebar-view-content.tsx` | API: `/api/user-agents` |
| **Agent Node Component** | `reactflow-architect` | `WorkflowBuilder.tsx`, new `AgentNode.tsx` | Agent data structure |
| **Drop Handler** | `reactflow-architect` | `WorkflowBuilder.tsx` | Sidebar drag events |
| **Property Panel** | `ux-ui-architect` | `NodePropertiesPanel.tsx` | Agent node data |
| **Execution Engine** | `langgraph-orchestration-architect` | Backend workflow executor | Agent contexts |
| **API Enhancements** | Backend agent | `/api/langgraph-gui/execute` | Agent profile data |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Designer Page (/ask-panel-v1)            │
│                                                             │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │   Sidebar    │  │  Canvas         │  │ Property      │ │
│  │              │  │  (ReactFlow)    │  │ Panel         │ │
│  │ ┌──────────┐ │  │                 │  │               │ │
│  │ │ My Agents│ │  │  [Agent Node]   │  │ Agent Config  │ │
│  │ │  - Dr. A │─┼─▶│  - Avatar       │◀─┤ - Role        │ │
│  │ │  - Dr. B │ │  │  - Name         │  │ - Tools       │ │
│  │ │  - Dr. C │ │  │  - Specialty    │  │ - Prompt      │ │
│  │ └──────────┘ │  │                 │  │ - Model       │ │
│  │              │  │  [RAG Node]     │  └───────────────┘ │
│  │ [Modes]      │  │  [Tool Node]    │                    │
│  │ [Templates]  │  │  [Output Node]  │                    │
│  │ [Library]    │  │                 │                    │
│  └──────────────┘  └─────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Execution Layer                         │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Extract     │───▶│ Fetch Agent  │───▶│ Execute      │  │
│  │ Agent Nodes │    │ Profiles     │    │ Workflow     │  │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│                              │                              │
│                              ▼                              │
│                     ┌──────────────┐                        │
│                     │ agents table │                        │
│                     │ user_agents  │                        │
│                     └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Agent Loading (Page Mount)
```
User opens /ask-panel-v1
     │
     ▼
SidebarDesignerContent mounts
     │
     ▼
Fetch /api/user-agents?userId={id}
     │
     ▼
Display agent list in sidebar
```

### 2. Agent to Canvas (Drag & Drop)
```
User drags "Dr. Sarah Mitchell" from sidebar
     │
     ▼
onDragStart: Set agent data in event.dataTransfer
     │
     ▼
User drops on canvas
     │
     ▼
onDrop: Read agent data from event.dataTransfer
     │
     ▼
Create agent node with full profile
     │
     ▼
Add node to ReactFlow
```

### 3. Agent Configuration
```
User clicks agent node
     │
     ▼
NodePropertiesPanel opens
     │
     ▼
Display agent-specific properties:
  - Agent Profile (read-only)
  - Workflow Role (editable)
  - Model Settings (overridable)
  - Tools & Access (configurable)
  - System Prompt (overridable)
     │
     ▼
User modifies settings
     │
     ▼
Update node.data in ReactFlow
```

### 4. Workflow Execution
```
User clicks "Execute Workflow"
     │
     ▼
Extract all agent nodes from workflow
     │
     ▼
Build agent contexts map:
  nodeId -> {
    agentId,
    system_prompt,
    model,
    temperature,
    tools,
    rag_enabled,
    knowledge_domains
  }
     │
     ▼
POST /api/langgraph-gui/execute
  { workflow, query, agentContexts }
     │
     ▼
Backend fetches full agent profiles
     │
     ▼
Execute LangGraph workflow
     │
     ▼
For each agent node:
  - Initialize LLM with agent's model
  - Use agent's system_prompt
  - Apply agent's temperature/max_tokens
  - Enable agent's tools
  - Access agent's knowledge domains
     │
     ▼
Stream results back to frontend
```

---

## Component Specifications

### 1. SidebarAgentsContent Component

**File:** `/src/components/sidebar-view-content.tsx`

**Responsibilities:**
- Fetch user's agents
- Display agent list
- Implement search/filter
- Enable drag-and-drop

**Interface:**
```typescript
interface SidebarAgentsContentProps {
  userId: string;
  onAgentDrag?: (agent: Agent, event: DragEvent) => void;
}

function SidebarAgentsContent({ userId, onAgentDrag }: SidebarAgentsContentProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch agents
  useEffect(() => {
    fetch(`/api/user-agents?userId=${userId}`)
      .then(r => r.json())
      .then(data => setAgents(data.agents))
      .finally(() => setLoading(false));
  }, [userId]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent =>
      agent.display_name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [agents, search]);

  // Drag handler
  const handleDragStart = (agent: Agent, event: DragEvent) => {
    event.dataTransfer?.setData('application/reactflow', JSON.stringify({
      type: 'agent',
      agentData: agent
    }));
    onAgentDrag?.(agent, event);
  };

  return (
    <Collapsible defaultOpen>
      <SidebarGroup>
        <SidebarGroupLabel>My Agents ({agents.length})</SidebarGroupLabel>
        <SidebarGroupContent>
          {/* Search */}
          <div className="px-2 pb-2">
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Agent List */}
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div>Loading agents...</div>
            ) : filteredAgents.length === 0 ? (
              <div>No agents found</div>
            ) : (
              <SidebarMenu>
                {filteredAgents.map(agent => (
                  <AgentListItem
                    key={agent.id}
                    agent={agent}
                    onDragStart={handleDragStart}
                  />
                ))}
              </SidebarMenu>
            )}
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>
    </Collapsible>
  );
}
```

---

### 2. AgentListItem Component

**File:** `/src/components/sidebar-view-content.tsx` (inline) or new file

**Responsibilities:**
- Display agent card
- Enable dragging
- Show agent status

**Interface:**
```typescript
interface AgentListItemProps {
  agent: Agent;
  onDragStart: (agent: Agent, event: DragEvent) => void;
}

function AgentListItem({ agent, onDragStart }: AgentListItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        draggable
        onDragStart={(e) => onDragStart(agent, e as any)}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 w-full">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: agent.color + '20' }}
          >
            {agent.avatar.startsWith('http') ? (
              <img src={agent.avatar} alt={agent.display_name} className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-lg">{agent.avatar}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{agent.display_name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {agent.capabilities[0] || 'General'}
            </div>
          </div>

          {/* Tier Badge */}
          <Badge variant="outline" className="text-xs">
            Tier {agent.tier}
          </Badge>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
```

---

### 3. AgentNode Component

**File:** `/src/components/langgraph-gui/AgentNode.tsx` (new file)

**Responsibilities:**
- Render agent node on canvas
- Display agent info
- Handle selection
- Show connection handles

**Interface:**
```typescript
import { Node, NodeProps, Handle, Position } from 'reactflow';
import { Badge } from '@/components/ui/badge';

export interface AgentNodeData {
  type: 'agent';
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  agent: Agent;
  label?: string;
  roleDescription?: string;
  config?: {
    temperature?: number;
    max_tokens?: number;
    tools?: string[];
    rag_enabled?: boolean;
    system_prompt_override?: string;
  };
}

export function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  return (
    <div
      className={cn(
        "agent-node bg-white rounded-lg shadow-lg border-2 min-w-[200px]",
        selected ? "border-primary" : "border-gray-200"
      )}
      style={{ borderColor: selected ? data.agentColor : undefined }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />

      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: data.agentColor + '20' }}
        >
          {data.agentAvatar.startsWith('http') ? (
            <img src={data.agentAvatar} alt={data.agentName} className="w-10 h-10 rounded-full" />
          ) : (
            <span className="text-2xl">{data.agentAvatar}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{data.label || data.agentName}</div>
          <div className="text-xs text-muted-foreground truncate">
            {data.agent.tier === 1 ? 'Expert' : data.agent.tier === 2 ? 'Advanced' : 'Standard'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {data.roleDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.roleDescription}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {data.agent.capabilities.slice(0, 2).map(cap => (
            <Badge key={cap} variant="secondary" className="text-xs">
              {cap}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.agent.model}</span>
        {data.config?.rag_enabled && <span className="text-primary">RAG</span>}
      </div>
    </div>
  );
}
```

---

### 4. WorkflowBuilder Drop Handler

**File:** `/src/components/langgraph-gui/WorkflowBuilder.tsx`

**Modifications:**
```typescript
// Add agent node type to nodeTypes
const nodeTypes = useMemo(() => ({
  task: TaskNode,
  agent: AgentNode, // NEW
  input: InputNode,
  output: OutputNode,
  orchestrator: OrchestratorNode,
}), []);

// Update onDrop handler
const onDrop = useCallback((event: React.DragEvent) => {
  event.preventDefault();

  const type = event.dataTransfer.getData('application/reactflow');
  if (!type) return;

  const data = JSON.parse(type);
  const position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  // Handle agent drop
  if (data.type === 'agent') {
    const agent = data.agentData;
    const newNode: Node = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      position,
      data: {
        type: 'agent',
        agentId: agent.id,
        agentName: agent.display_name,
        agentAvatar: agent.avatar,
        agentColor: agent.color,
        agent: agent,
        label: agent.display_name,
        config: {
          temperature: agent.temperature,
          max_tokens: agent.max_tokens,
          tools: [],
          rag_enabled: false,
        }
      }
    };

    setNodes((nds) => [...nds, newNode]);
    return;
  }

  // Handle task drop (existing logic)
  if (data.type === 'task') {
    // ... existing code
  }
}, [screenToFlowPosition, setNodes]);
```

---

### 5. NodePropertiesPanel Enhancement

**File:** `/src/components/langgraph-gui/NodePropertiesPanel.tsx`

**Modifications:**
```typescript
// Add agent node handling
if (selectedNode?.type === 'agent') {
  const agentData = selectedNode.data as AgentNodeData;

  return (
    <div className="p-4 space-y-6">
      {/* Agent Profile Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Agent Profile</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: agentData.agentColor + '20' }}
            >
              {agentData.agentAvatar.startsWith('http') ? (
                <img src={agentData.agentAvatar} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <span className="text-2xl">{agentData.agentAvatar}</span>
              )}
            </div>
            <div>
              <h4 className="font-semibold">{agentData.agentName}</h4>
              <p className="text-sm text-muted-foreground">
                Tier {agentData.agent.tier} • {agentData.agent.model}
              </p>
            </div>
          </div>
          <p className="text-sm">{agentData.agent.description}</p>
          <div className="flex flex-wrap gap-2">
            {agentData.agent.capabilities.map(cap => (
              <Badge key={cap} variant="outline">{cap}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Role Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Workflow Role</h3>
        <div className="space-y-3">
          <div>
            <Label>Label (Display Name)</Label>
            <Input
              value={agentData.label}
              onChange={(e) => updateNodeData({ label: e.target.value })}
              placeholder="e.g., Primary Reviewer"
            />
          </div>
          <div>
            <Label>Role Description</Label>
            <Textarea
              value={agentData.roleDescription || ''}
              onChange={(e) => updateNodeData({ roleDescription: e.target.value })}
              placeholder="Describe this agent's specific responsibilities in this workflow..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Model Settings Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Model Settings</h3>
        <div className="space-y-3">
          <div>
            <Label>Temperature: {agentData.config?.temperature ?? agentData.agent.temperature}</Label>
            <Slider
              value={[agentData.config?.temperature ?? agentData.agent.temperature]}
              onValueChange={([temp]) => updateNodeConfig({ temperature: temp })}
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Max Tokens</Label>
            <Input
              type="number"
              value={agentData.config?.max_tokens ?? agentData.agent.max_tokens}
              onChange={(e) => updateNodeConfig({ max_tokens: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </section>

      {/* Tools & Capabilities Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Tools & Access</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rag"
              checked={agentData.config?.rag_enabled}
              onCheckedChange={(checked) => updateNodeConfig({ rag_enabled: checked as boolean })}
            />
            <Label htmlFor="rag">Enable RAG (Knowledge Base Access)</Label>
          </div>
          <div>
            <Label>Available Tools</Label>
            <Select
              value={agentData.config?.tools?.[0] || ''}
              onValueChange={(tool) => {
                const tools = agentData.config?.tools || [];
                updateNodeConfig({ tools: [...tools, tool] });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add tool..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pubmed">PubMed Search</SelectItem>
                <SelectItem value="fda">FDA Database</SelectItem>
                <SelectItem value="clinical_trials">Clinical Trials</SelectItem>
                <SelectItem value="web_search">Web Search</SelectItem>
              </SelectContent>
            </Select>
            {agentData.config?.tools && agentData.config.tools.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {agentData.config.tools.map(tool => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => {
                        const tools = agentData.config!.tools!.filter(t => t !== tool);
                        updateNodeConfig({ tools });
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* System Prompt Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">System Prompt</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Override the agent's default system prompt for workflow-specific instructions.
        </p>
        <Textarea
          value={agentData.config?.system_prompt_override || agentData.agent.system_prompt}
          onChange={(e) => updateNodeConfig({ system_prompt_override: e.target.value })}
          rows={8}
          className="font-mono text-xs"
        />
      </section>
    </div>
  );
}
```

---

## Testing Checklist

### Unit Tests
- [ ] `SidebarAgentsContent` renders agent list
- [ ] `AgentListItem` enables drag-and-drop
- [ ] `AgentNode` renders with correct data
- [ ] `WorkflowBuilder` handles agent drop
- [ ] `NodePropertiesPanel` displays agent properties

### Integration Tests
- [ ] Agents fetch from `/api/user-agents`
- [ ] Agent drag transfers correct data
- [ ] Agent drop creates valid node
- [ ] Property changes update node data
- [ ] Workflow execution includes agent contexts

### E2E Tests
- [ ] User can browse agents in sidebar
- [ ] User can search/filter agents
- [ ] User can drag agent to canvas
- [ ] User can configure agent in panel
- [ ] User can execute workflow with agents
- [ ] Workflow output uses agent's expertise

---

## Communication Protocol

### Issue Coordination
Use GitHub issues with labels:
- `agent-integration` - All integration issues
- `frontend` - UI/UX changes
- `backend` - API/execution changes
- `needs-review` - Ready for review
- `blocked` - Waiting on dependency

### Daily Standup Template
```
Agent: [Your Agent Name]
Working On: [Component/Feature]
Progress: [% Complete]
Blockers: [List dependencies or issues]
Next Steps: [Next tasks]
```

### Code Review Requirements
- All agent-related code must be reviewed by at least one other agent
- Include screenshots for UI changes
- Include test coverage report
- Document API changes in OpenAPI spec

---

## Rollout Plan

### Phase 1: Foundation (Week 1)
**Goal:** Basic sidebar integration
- Implement `SidebarAgentsContent`
- Add agent fetching
- Enable drag-and-drop
- **Testing:** Can drag agents to canvas

### Phase 2: Canvas Integration (Week 2)
**Goal:** Agent nodes work on canvas
- Create `AgentNode` component
- Implement drop handler
- Add to ReactFlow nodeTypes
- **Testing:** Agent nodes render correctly

### Phase 3: Configuration (Week 2-3)
**Goal:** Agent properties editable
- Extend `NodePropertiesPanel`
- Add agent configuration UI
- Implement property updates
- **Testing:** Can configure agents

### Phase 4: Execution (Week 3)
**Goal:** Workflows execute with agents
- Update workflow execution engine
- Add agent context extraction
- Implement backend integration
- **Testing:** Workflows use agent profiles

### Phase 5: Polish (Week 4)
**Goal:** Production-ready
- Add connection validation
- Implement error handling
- Add loading states
- Update documentation
- **Testing:** Full E2E tests pass

---

## Success Criteria

✅ **User can see their agents** in the sidebar
✅ **User can search and filter** agents
✅ **User can drag agents** onto the canvas
✅ **Agent nodes display** rich profile information
✅ **User can configure** agent behavior in workflows
✅ **Workflows execute** using agent's system prompts and settings
✅ **Multi-agent workflows** coordinate correctly
✅ **Error states** are handled gracefully
✅ **Performance** is acceptable (no lag, smooth drag-and-drop)
✅ **Documentation** is complete and accurate

---

## Resources

### Documentation
- [Main Requirements Doc](/Users/amine/Desktop/vital/.claude/vital-expert-docs/06-workflows/AGENT_WORKFLOW_INTEGRATION_REQUIREMENTS.md)
- [Mode 1 Workflow Spec](/Users/amine/Desktop/vital/.claude/vital-expert-docs/06-workflows/MODE_1_REACTFLOW_IMPLEMENTATION_GUIDE.md)
- [ReactFlow Docs](https://reactflow.dev/docs)

### API Endpoints
- `GET /api/user-agents?userId={uuid}` - Fetch user's agents
- `GET /api/agents-crud` - Fetch all agents
- `POST /api/langgraph-gui/execute` - Execute workflow

### Key Files
- `/src/components/sidebar-view-content.tsx` - Sidebar content
- `/src/components/langgraph-gui/WorkflowBuilder.tsx` - Main workflow designer
- `/src/components/langgraph-gui/NodePropertiesPanel.tsx` - Node config panel
- `/src/components/langgraph-gui/TaskLibrary.tsx` - Task definitions

---

## Questions & Answers

**Q: Can users modify agent profiles from the workflow designer?**
A: No. Agent profiles are read-only in the workflow designer. Users can only configure workflow-specific overrides (temperature, tools, etc.). To modify the agent profile itself, users must go to the /agents page.

**Q: What happens if an agent is deleted while being used in a workflow?**
A: The workflow will fail validation before execution. We should add a warning UI showing "Agent not found" with an option to select a replacement agent.

**Q: Can multiple workflow nodes use the same agent?**
A: Yes. The same agent can appear in multiple nodes with different configurations (e.g., different roles, different tool access).

**Q: How do we handle agent versioning?**
A: For MVP, we use the current agent profile. Future: Add versioning to `agents` table and allow workflows to pin to specific versions.

**Q: Can workflows be shared between users with different agents?**
A: Workflow templates can be shared. When a user imports a template, they must select their own agents to fill the roles. We should add an "agent mapping" step during import.

---

## Contact

For questions or clarifications, tag the appropriate agent:
- **Frontend/UI:** @ux-ui-architect, @reactflow-architect
- **Backend/Orchestration:** @langgraph-orchestration-architect
- **Database:** [Database team lead]
- **Testing:** [QA team lead]
