# Workflow Designer

A modern, React Flow-based workflow designer for building and testing AI-powered workflows with LangGraph integration.

## Overview

The Workflow Designer is a visual tool for creating, editing, and testing multi-agent AI workflows. It provides:

- **Visual Canvas**: Drag-and-drop interface for building workflows
- **Node Library**: Pre-built nodes for agents, tools, conditions, and more
- **Template System**: Pre-configured workflow templates for common use cases
- **Live Testing**: Test workflows with real AI agents from your agent store
- **LangGraph Integration**: Seamless backend integration with Python LangGraph workflows
- **Mode Detection**: Automatic workflow mode detection (Mode 1-4) from backend

## Features

### 🎨 Visual Workflow Builder

- **React Flow Canvas**: Powered by React Flow for smooth node manipulation
- **Node Types**:
  - `start`: Entry point of the workflow
  - `end`: Exit point of the workflow
  - `agent`: AI agent that processes information
  - `tool`: External tool or API integration
  - `condition`: Branching logic based on conditions
  - `parallel`: Execute multiple branches simultaneously
  - `human`: Human-in-the-loop interaction
  - `subgraph`: Nested workflow
  - `input`: Workflow input node
  - `output`: Workflow output node
  - `orchestrator`: Multi-agent orchestration

### 📚 Node Library

Located in the sidebar, the Node Library contains:

1. **Node Palette**: Built-in React Flow node types
2. **Node Library**: Custom nodes from your database (98+ nodes)
   - Clinical Operations nodes
   - Medical Information nodes
   - Regulatory Affairs nodes
   - Data Analysis nodes
   - And many more...

### 📋 Template System

Pre-built workflow templates accessible from the toolbar:

#### Ask Expert Templates (4 Modes)

1. **Mode 1: Manual-Interactive**
   - User selects a specific expert
   - Multi-turn conversation with context retention
   - Requires agent selection
   - Features: feedback, memory, RAG, tools

2. **Mode 2: Auto-Interactive**
   - AI selects best expert(s) automatically
   - Multi-turn conversation with dynamic expert switching
   - Features: multi-agent, auto-selection, dynamic switching

3. **Mode 3: Manual-Autonomous**
   - User selects expert
   - Autonomous multi-step execution
   - Human-in-the-loop approval
   - Features: multi-step, goal-driven, artifact generation

4. **Mode 4: Auto-Autonomous**
   - AI assembles expert team (up to 4 experts)
   - Collaborative autonomous execution
   - Features: multi-expert, team coordination, parallel execution

#### Ask Panel Templates (6 Modes)

Pre-configured panel discussion workflows with multiple experts.

### 🧪 Test Workflow Modal

Test your workflows with real AI agents:

- **Agent Selection**: Choose from 319+ active agents in your store
- **Mode Detection**: Automatically detects workflow mode from LangGraph backend
- **Real-time Execution**: Execute workflows and see results in real-time
- **Export Results**: Export conversation history as Markdown or Text
- **Show Logs**: View detailed execution logs

### 🔧 Toolbar Actions

- **Templates**: Load pre-built workflow templates
- **Code View**: View workflow as JSON/code
- **Test Workflow**: Open test modal to execute workflow
- **Export**: Export workflow definition
- **Import**: Import workflow from file
- **Save**: Save workflow to database
- **Settings**: Configure workflow settings

## Architecture

### Frontend Stack

- **React 18**: UI framework
- **Next.js 15**: Application framework
- **React Flow**: Visual workflow canvas
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library
- **React Query**: Data fetching and caching

### Backend Integration

- **Supabase**: Database and authentication
  - Database: `https://bomltkhixeatxuoxmolq.supabase.co`
  - Tables: `workflows`, `node_library`, `templates`, `agents`, `user_agents`

- **Python AI Engine**: LangGraph workflow execution
  - Location: `services/ai-engine/`
  - Framework: FastAPI + LangGraph
  - Workflows: `services/ai-engine/src/langgraph_workflows/`
    - `mode1_manual_interactive.py` - Mode 1 workflows
    - `mode2_auto_interactive.py` - Mode 2 workflows
    - `mode3_manual_autonomous.py` - Mode 3 workflows
    - `mode4_auto_autonomous.py` - Mode 4 workflows

### Key Files

```
apps/vital-system/src/features/workflow-designer/
├── components/
│   ├── designer/
│   │   ├── WorkflowDesignerEnhanced.tsx      # Main designer component
│   │   ├── EnhancedWorkflowToolbar.tsx       # Toolbar with actions
│   │   └── WorkflowCanvas.tsx                # React Flow canvas
│   ├── modals/
│   │   ├── WorkflowTestModal.tsx             # Test workflow modal
│   │   ├── TemplatesDialog.tsx               # Template selection
│   │   └── CodeViewDialog.tsx                # Code view modal
│   └── nodes/
│       ├── WorkflowNode.tsx                  # Custom node component
│       └── CustomEdge.tsx                    # Custom edge component
├── constants/
│   ├── node-types.ts                         # Node type definitions
│   └── templates.ts                          # Template configurations
├── types/
│   └── workflow.ts                           # TypeScript types
├── hooks/
│   ├── useWorkflowExecution.ts               # Workflow execution logic
│   └── useWorkflowValidation.ts              # Validation logic
└── utils/
    ├── workflow-converter.ts                 # Legacy to modern conversion
    └── layout.ts                             # Auto-layout algorithms
```

### Database Schema

#### `workflows` Table

Stores workflow definitions:

```sql
- id: uuid (primary key)
- name: text
- description: text
- workflow_type: text (jtbd_execution, ask_expert, ask_panel)
- workflow_definition: jsonb (nodes, edges, metadata)
- is_template: boolean
- is_public: boolean
- tags: text[]
- created_by: uuid (foreign key to profiles)
- created_at: timestamp
- updated_at: timestamp
```

#### `node_library` Table

Custom node definitions:

```sql
- id: uuid (primary key)
- node_slug: text (unique)
- node_name: text
- display_name: text
- description: text
- node_type: text
- node_category: text
- icon: text
- is_builtin: boolean
- is_public: boolean
- node_config: jsonb
- tags: text[]
- created_at: timestamp
```

#### `agents` Table

AI agent definitions (319 active agents):

```sql
- id: uuid (primary key)
- name: text
- slug: text
- description: text
- tagline: text
- expertise_level: text (beginner, intermediate, expert)
- avatar_url: text
- system_prompt: text
- base_model: text (gpt-4, gpt-4o, etc.)
- temperature: float
- max_tokens: integer
- status: text (active, inactive, development)
- role_name: text
- function_name: text
- department_name: text
- metadata: jsonb
- created_at: timestamp
- updated_at: timestamp
```

## API Endpoints

### Workflow API

- `GET /api/workflows` - Fetch all workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/:id` - Fetch workflow by ID
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Agent API

- `GET /api/agents` - Fetch all agents (319 active agents)
  - Query params: `status=active|inactive|development`
  - Returns: `{ success: true, agents: Agent[], count: number }`

- `GET /api/user-agents` - Fetch user's selected agents
  - Requires authentication
  - Returns user-specific agent preferences

### Node Library API

- `GET /api/node-library` - Fetch all custom nodes
- `POST /api/node-library` - Create new node
- `GET /api/node-library/:slug` - Fetch node by slug
- `PUT /api/node-library/:slug` - Update node
- `DELETE /api/node-library/:slug` - Delete node

### LangGraph API

- `POST /api/langgraph-gui/workflow/inspect` - Inspect workflow mode
  - Body: `{ nodes: Node[], edges: Edge[] }`
  - Returns: `{ detected_mode: string, mode_metadata: object, confidence: number }`

- `POST /api/langgraph-gui/panels/execute` - Execute panel workflow
  - Body: `{ query: string, panel_type: string, selected_agent_ids: string[] }`
  - Returns: Server-Sent Events (SSE) stream

- `POST /api/langgraph-gui/execute` - Execute general workflow
  - Body: `{ query: string, workflow_definition: object }`
  - Returns: Server-Sent Events (SSE) stream

## Usage

### Starting the Designer

1. **Start the Frontend Server**:
   ```bash
   cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
   pnpm --filter @vital/vital-system dev
   ```
   Access at: http://localhost:3000/designer

2. **Start the AI Engine Backend**:
   ```bash
   cd services/ai-engine
   ./start-ai-engine.sh
   ```
   Runs at: http://localhost:8000

### Creating a Workflow

1. **From Scratch**:
   - Drag nodes from the Node Palette/Library onto the canvas
   - Connect nodes by dragging from output handles to input handles
   - Configure node properties in the sidebar
   - Save workflow using the toolbar

2. **From Template**:
   - Click "Templates" in the toolbar
   - Select a template (e.g., "Mode 1: Manual-Interactive")
   - Modify the loaded workflow as needed
   - Save as a new workflow

### Testing a Workflow

1. Click "Test Workflow" in the toolbar
2. For Mode 1 workflows:
   - Select an expert agent from the dropdown (319 agents available)
   - Required for Manual-Interactive mode
3. Enter your query/question
4. Click the send button (purple arrow)
5. View results in real-time
6. Export conversation if needed

### Converting Legacy Workflows

Legacy `WorkflowBuilder` workflows are automatically converted when loaded:

- `type: 'task'` → `type: 'agent'`
- Legacy phase structure → Modern node structure
- Task connections → Node edges
- Metadata preserved in node data

## Workflow Modes

The system supports 4 main workflow modes, automatically detected by the backend:

### Mode 1: Manual-Interactive
- **Selection**: User manually selects expert
- **Interaction**: Interactive multi-turn chat
- **Agent Selection**: **Required** ✅
- **HITL**: Not supported
- **Features**: feedback, memory, RAG, tools

### Mode 2: Auto-Interactive
- **Selection**: AI automatically selects expert(s)
- **Interaction**: Interactive multi-turn chat
- **Agent Selection**: Not required
- **HITL**: Not supported
- **Features**: multi-agent, auto-selection, dynamic switching

### Mode 3: Manual-Autonomous
- **Selection**: User manually selects expert
- **Interaction**: Autonomous multi-step execution
- **Agent Selection**: **Required** ✅
- **HITL**: Supported (human approval)
- **Features**: multi-step, goal-driven, artifact generation

### Mode 4: Auto-Autonomous
- **Selection**: AI assembles expert team
- **Interaction**: Autonomous collaborative execution
- **Agent Selection**: Not required
- **HITL**: Supported (human approval)
- **Features**: multi-expert, team coordination, parallel execution

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Supabase (NEW SUPABASE - where agents are stored)
NEW_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEW_SUPABASE_ANON_KEY=your_anon_key
NEW_SUPABASE_SERVICE_KEY=your_service_key

# OpenAI (for AI agents)
OPENAI_API_KEY=your_openai_key

# AI Engine Backend
AI_ENGINE_URL=http://localhost:8000

# Optional: Ollama (for local LLMs)
OLLAMA_BASE_URL=http://localhost:11434
```

## Troubleshooting

### Agent Selector Not Showing

1. Check console logs for `[WorkflowTestModal]` entries
2. Verify agents are loaded: `[WorkflowTestModal] Loaded agents: 319`
3. Check mode detection: `[WorkflowTestModal] Agent selector should show: YES ✅`
4. Verify Supabase connection to NEW_SUPABASE

### Workflow Execution Fails

1. Check AI Engine is running: http://localhost:8000/docs
2. Verify OpenAI API key is set
3. Check agent selection (required for Mode 1 and Mode 3)
4. View execution logs in the Test Modal

### Template Not Loading

1. Check workflow exists in `workflows` table
2. Verify workflow_definition JSON is valid
3. Check console for conversion errors
4. Ensure node types are defined in `node-types.ts`

### Empty Node Library

1. Run migration: `database/migrations/026_seed_all_nodes_FULL.sql`
2. Verify `node_library` table has data
3. Check `/api/node-library` endpoint
4. Refresh the page

## Development

### Adding New Node Types

1. Define node type in `constants/node-types.ts`:
   ```typescript
   export const NODE_TYPE_DEFINITIONS: Record<NodeType, NodeTypeDefinition> = {
     my_new_node: {
       label: 'My New Node',
       description: 'Description of my node',
       icon: MyIcon,
       color: '#hex-color',
       category: 'Category Name',
       defaultData: { /* default properties */ },
     },
   };
   ```

2. Add to `types/workflow.ts`:
   ```typescript
   export type NodeType = 'agent' | 'tool' | 'my_new_node' | ...;
   ```

3. Seed to database (optional):
   ```sql
   INSERT INTO node_library (node_slug, node_name, node_type, ...)
   VALUES ('my_new_node', 'My New Node', 'custom', ...);
   ```

### Adding New Templates

1. Create template configuration in `apps/vital-system/src/components/langgraph-gui/panel-workflows/`:
   ```typescript
   export const MY_TEMPLATE_CONFIG: PanelWorkflowConfig = {
     id: 'my_template',
     name: 'My Template',
     description: 'Template description',
     icon: MyIcon,
     metadata: {
       mode: 'mode1',
       requires_agent_selection: true,
       // ... other metadata
     },
     phases: [/* phase definitions */],
   };
   ```

2. Add to template registry in `constants/templates.ts`

3. Seed to database:
   ```sql
   INSERT INTO workflows (name, description, workflow_type, workflow_definition, is_template)
   VALUES ('My Template', 'Description', 'jtbd_execution', '{...}', true);
   ```

## Migration from Legacy Designer

The modern designer is backward compatible with the legacy `WorkflowBuilder`:

- Legacy URL: `/ask-panel-v1` (preserved for comparison)
- Modern URL: `/designer` (current)

All legacy workflows have been migrated to the modern system with:
- ✅ All node types converted
- ✅ All templates imported
- ✅ All functionalities preserved
- ✅ Enhanced with new features (mode detection, agent selection, etc.)

## Testing

### Manual Testing Checklist

- [ ] Load designer page at `/designer`
- [ ] Open Node Palette - verify built-in nodes
- [ ] Open Node Library - verify 98+ custom nodes
- [ ] Load template - verify nodes appear correctly
- [ ] Test workflow - verify agent selector appears (Mode 1)
- [ ] Select agent - verify 319 agents available
- [ ] Execute workflow - verify results appear
- [ ] Export workflow - verify JSON is valid
- [ ] Import workflow - verify it loads correctly

### API Testing

```bash
# Test agents endpoint
curl http://localhost:3000/api/agents?status=active | jq '.count'
# Should return: 319

# Test node library
curl http://localhost:3000/api/node-library | jq '.nodes | length'
# Should return: 98+

# Test workflow inspection
curl -X POST http://localhost:3000/api/langgraph-gui/workflow/inspect \
  -H "Content-Type: application/json" \
  -d '{"nodes": [...], "edges": [...]}'
```

## Resources

- **React Flow Documentation**: https://reactflow.dev/
- **LangGraph Documentation**: https://langchain-ai.github.io/langgraph/
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review console logs for detailed error messages
3. Check the AI Engine logs: `services/ai-engine/logs/`
4. Verify all environment variables are set correctly

## License

Proprietary - VITAL Platform
