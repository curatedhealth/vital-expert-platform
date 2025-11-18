# Hierarchical Workflows System

> **Complete hierarchical workflow management system with two complementary visualization tools: an interactive node-based editor and an end-to-end flow diagram visualizer.**

---

## 🎯 What Is This?

The **Hierarchical Workflows System** provides enterprise-grade workflow management with drill-down navigation through complex, multi-level workflows.

### Two Complementary Tools:

1. **Workflow Editor** - Interactive node-based editor for designing workflows
2. **Workflow Flow Visualizer** - End-to-end flow diagram for visualizing and executing workflows

Both support hierarchical navigation through **Workflows → Tasks → Steps** with breadcrumb navigation, drill-down, and back navigation.

---

## ✨ Key Features

### 🎨 Visual Workflow Design
- Drag-and-drop node creation
- Free-form canvas layout
- Color-coded hierarchy levels
- Properties panel editing

### 🧭 Hierarchical Navigation
- Drill into nodes to view children
- Breadcrumb navigation for quick jumps
- Back button to go up levels
- Keyboard shortcuts (Esc)
- Floating navigation helper

### 📊 Flow Visualization
- Vertical end-to-end flow diagrams
- Start → Workflows → Tasks → Steps → End
- Animated edges showing flow direction
- Minimap with color-coded nodes

### 🔧 Configuration Management
- Assign agents to tasks
- Configure tools and RAG sources
- Add user prompts for AI execution
- Estimate time per step

### 🏥 Digital Health Focus
- Clinical Development workflows (UC_CD_001)
- Regulatory Affairs processes
- Medical Affairs workflows
- FDA compliance support

---

## 🚀 Quick Start

### Installation

The system is already integrated into your Next.js application at:

```
/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/
```

### Option 1: Use Workflow Editor

```tsx
import { WorkflowEditor } from '@/components/workflow-editor/WorkflowEditor';

function MyPage() {
  return (
    <WorkflowEditor
      mode="create"
      workflowId={null}
      useCaseId={null}
    />
  );
}
```

### Option 2: Use Workflow Flow Visualizer

```tsx
import { HierarchicalWorkflowFlowVisualizer } from '@/components/workflow-flow/HierarchicalWorkflowFlowVisualizer';

function MyPage() {
  const workflows = [
    { id: 'wf-1', name: 'Foundation Phase', position: 1 }
  ];

  const tasksByWorkflow = {
    'wf-1': [
      {
        id: 't-1-1',
        code: 'T1.1',
        title: 'Define Clinical Context',
        position: 1,
        agents: [...],
        steps: [...]
      }
    ]
  };

  return (
    <HierarchicalWorkflowFlowVisualizer
      workflows={workflows}
      tasksByWorkflow={tasksByWorkflow}
      useCaseTitle="My Use Case"
      editable={true}
    />
  );
}
```

### Option 3: Use Complete Examples

```tsx
// UC_CD_001 Flow Visualizer Example
import { UC_CD_001_HierarchicalExample } from '@/components/workflow-flow/examples/UC_CD_001_HierarchicalExample';

<UC_CD_001_HierarchicalExample />

// Patient Onboarding Editor Example
import { HierarchicalWorkflowExample } from '@/components/workflow-editor/examples/HierarchicalWorkflowExample';

<HierarchicalWorkflowExample />

// UC_CD_001 Editor Example
import { DigitalHealthHierarchicalWorkflow } from '@/components/workflow-editor/examples/DigitalHealthHierarchicalWorkflow';

<DigitalHealthHierarchicalWorkflow />
```

---

## 📁 Project Structure

```
apps/digital-health-startup/src/
├── components/
│   ├── workflow-editor/                    # Interactive node editor
│   │   ├── WorkflowEditor.tsx             # Main editor container
│   │   ├── EditorCanvas.tsx               # ReactFlow canvas
│   │   ├── HierarchyBreadcrumbs.tsx       # Navigation breadcrumbs
│   │   ├── NavigationHelper.tsx           # Floating helper widget
│   │   ├── nodes/
│   │   │   └── node-types/
│   │   │       ├── ProcessNode.tsx        # Purple process nodes
│   │   │       ├── ActivityNode.tsx       # Indigo activity nodes
│   │   │       ├── TaskNode.tsx           # Blue task nodes
│   │   │       └── StepNode.tsx           # Teal step nodes
│   │   ├── properties/
│   │   │   ├── PropertiesPanel.tsx        # Properties container
│   │   │   ├── HierarchyNodeProperties.tsx # Hierarchical editor
│   │   │   └── NodeProperties.tsx         # Property router
│   │   ├── node-palette/
│   │   │   └── ComponentsPalette.tsx      # Node palette
│   │   └── examples/
│   │       ├── HierarchicalWorkflowExample.tsx
│   │       └── DigitalHealthHierarchicalWorkflow.tsx
│   │
│   └── workflow-flow/                      # Flow diagram visualizer
│       ├── HierarchicalWorkflowFlowVisualizer.tsx  # Main visualizer
│       ├── hierarchical-custom-nodes.tsx           # Node components
│       ├── InteractiveWorkflowFlowVisualizer.tsx   # Original (preserved)
│       ├── custom-nodes.tsx                        # Original nodes
│       ├── custom-edges.tsx                        # Edge components
│       └── examples/
│           └── UC_CD_001_HierarchicalExample.tsx
│
├── features/workflow-designer/types/
│   └── workflow.ts                         # Type definitions
│
└── lib/stores/
    └── workflow-editor-store.ts            # Zustand state management
```

---

## 📚 Complete Documentation

### 🏆 Start Here

1. **[HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md](./HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)** ⭐
   - Complete project overview
   - Architecture and data models
   - Use case: UC_CD_001
   - Best practices and troubleshooting

2. **[HIERARCHICAL_WORKFLOWS_COMPARISON.md](./HIERARCHICAL_WORKFLOWS_COMPARISON.md)** 🔍
   - Side-by-side comparison of both tools
   - When to use which tool
   - Decision matrix
   - Integration patterns

### 📖 Detailed Guides

3. **[HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md](./HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md)**
   - Workflow Flow Visualizer complete guide
   - Data structure examples
   - Migration from original visualizer
   - Advanced features

4. **[DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md](./DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md)**
   - Digital health specific implementation
   - UC_CD_001 detailed breakdown
   - Database schema mapping
   - Color coding by domain

5. **[HIERARCHICAL_NAVIGATION_GUIDE.md](./HIERARCHICAL_NAVIGATION_GUIDE.md)**
   - All 6 navigation methods
   - Visual guides and examples
   - Keyboard shortcuts
   - Troubleshooting navigation

6. **[HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md](./HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md)**
   - Technical implementation details
   - Files created/modified
   - State management patterns
   - Type definitions

7. **[HIERARCHICAL_WORKFLOW_QUICKSTART.md](./HIERARCHICAL_WORKFLOW_QUICKSTART.md)**
   - 5-minute quick start
   - Common use cases
   - Pro tips

---

## 🎯 Use Cases

### Clinical Development (UC_CD_001)

**DTx Clinical Endpoint Selection & Validation**

```
5 Workflows → 9 Tasks → 33 Steps

Foundation Phase
├── T1.1: Define Clinical Context (4 steps)

Research Phase
├── T2.1: Research DTx Regulatory Precedent (3 steps)
└── T2.2: Conduct Literature Review (3 steps)

Identification Phase
├── T3.1: Identify Primary Endpoint Candidates (3 steps)
└── T3.2: Identify Secondary & Exploratory Endpoints (2 steps)

Validation Phase
├── T4.1: Evaluate Psychometric Properties (4 steps)
└── T4.2: Assess Digital Feasibility (3 steps)

Decision Phase
└── T5.2: Final Recommendation & Stakeholder Alignment (4 steps)
```

**Example Usage:**
```tsx
import { UC_CD_001_HierarchicalExample } from '@/components/workflow-flow/examples/UC_CD_001_HierarchicalExample';

<UC_CD_001_HierarchicalExample />
```

### Patient Onboarding

**3 Workflows → Multiple Tasks → Multiple Steps**

```
Patient Registration
├── Collect Demographics (3 steps)
├── Insurance Verification (2 steps)
└── Create Patient Record (2 steps)

Medical History Collection
├── Current Medications (2 steps)
├── Allergies & Conditions (2 steps)
└── Family History (1 step)

Informed Consent
└── Review & Sign Consent (3 steps)
```

**Example Usage:**
```tsx
import { HierarchicalWorkflowExample } from '@/components/workflow-editor/examples/HierarchicalWorkflowExample';

<HierarchicalWorkflowExample />
```

---

## 🔧 Core Concepts

### Hierarchy Structure

```
📁 PROCESS (Top-level container)
├── 📊 ACTIVITY (Major phase or workstream)
│   ├── ✅ TASK (Specific deliverable)
│   │   ├── 🔹 STEP (Granular action)
│   │   └── 🔹 STEP
│   └── ✅ TASK
│       └── 🔹 STEP
└── 📊 ACTIVITY
    └── ✅ TASK
```

### Navigation Methods

1. **Drill-Down** - Click "Open" or "View" buttons on nodes
2. **Breadcrumbs** - Click any level to jump directly
3. **Back Button** - Go up one level
4. **Home Button** - Return to root instantly
5. **Keyboard Shortcuts** - Press `Esc` to go back
6. **Floating Helper** - Quick navigation widget (Editor only)

### Color Coding

| Level | Color | Hex |
|-------|-------|-----|
| Process | Purple | `#9333ea` |
| Activity | Indigo | `#6366f1` |
| Workflow | Purple | `#9333ea` |
| Task | Blue | `#3b82f6` |
| Step | Teal | `#14b8a6` |

---

## 🎨 Screenshots

### Workflow Editor

```
┌────────────────────────────────────────────────────────────┐
│ [Breadcrumbs: Home > Foundation Phase > T1.1]             │
├──────────────┬──────────────────────────┬──────────────────┤
│ Node Palette │ Canvas (ReactFlow)       │ Properties Panel │
│              │                          │                  │
│ □ Process    │  ┌─────────────────┐    │ Node Properties  │
│ □ Activity   │  │   Activity      │    │                  │
│ □ Task       │  │  Foundation     │    │ Name: [____]     │
│ □ Step       │  └─────────────────┘    │ Type: Activity   │
│              │          │               │                  │
│              │          ▼               │ Children:        │
│              │  ┌─────────────────┐    │ • Task T1.1      │
│              │  │     Task        │    │   [Open] [Del]   │
│              │  │  T1.1: Define   │    │                  │
│              │  └─────────────────┘    │ [Add Task]       │
└──────────────┴──────────────────────────┴──────────────────┘
│ Floating Helper: [Back] [Home] Press Esc                  │
└────────────────────────────────────────────────────────────┘
```

### Workflow Flow Visualizer

```
┌────────────────────────────────────────────────────────────┐
│ Hierarchical Workflow Visualizer                           │
│ 5 workflows • 9 tasks • Tasks                              │
│ [Edit Mode] [View Mode]                                    │
├────────────────────────────────────────────────────────────┤
│ [Back] [Home]  |  Home > Foundation Phase                  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│                   ┌────────────────┐                        │
│                   │ Foundation     │                        │
│                   │ Phase          │ [View]                 │
│                   └────────┬───────┘                        │
│                            │                                │
│                            ▼                                │
│                   ┌────────────────┐                        │
│                   │ Task T1.1      │ [View]                 │
│                   │ Define Context │                        │
│                   │ 🤖 2 agents    │                        │
│                   │ 🔧 1 tool      │                        │
│                   └────────┬───────┘                        │
│                            │                                │
│                            ▼                                │
│                   ┌────────────────┐                        │
│                   │ Task T1.2      │                        │
│                   │ Alignment      │                        │
│                   └────────────────┘                        │
│                                                             │
├────────────────────────────────────────────────────────────┤
│ Legend: 🟢 Start  🟣 Workflow  🔵 Task  🟢 Step  🔴 End    │
└────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### State Management (Zustand)

```typescript
interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  currentContextNodeId: string | null;
  breadcrumbs: Breadcrumb[];
}

interface WorkflowActions {
  drillIntoNode: (nodeId: string) => void;
  navigateToNode: (nodeId: string | null) => void;
  goBack: () => void;
  getVisibleNodes: () => Node[];
}
```

### Data Model

```typescript
interface WorkflowNode {
  id: string;
  type: 'process' | 'activity' | 'task' | 'step';
  label: string;
  position: { x: number; y: number };
  // Hierarchical properties:
  parentId?: string;
  children?: string[];
  hierarchyLevel?: string;
}
```

---

## 🚀 Advanced Features

### Agent Configuration

Assign AI agents to tasks:

```typescript
task: {
  agents: [
    {
      id: 'agent-cmo',
      name: 'Chief Medical Officer',
      code: 'P01_CMO',
      execution_order: 1
    }
  ]
}
```

### Tool Integration

Configure tools per task:

```typescript
task: {
  tools: [
    {
      id: 'tool-fda',
      name: 'FDA De Novo Database',
      code: 'TOOL_FDA'
    }
  ]
}
```

### RAG Knowledge Sources

Add RAG sources for AI context:

```typescript
task: {
  rags: [
    {
      id: 'rag-fda-pro',
      name: 'FDA PRO Guidance (2009)',
      code: 'RAG_FDA_PRO',
      source_type: 'guidance'
    }
  ]
}
```

### Step Time Estimates

Add time estimates to steps:

```typescript
step: {
  id: 'step-1',
  title: 'Define Disease Burden',
  estimatedTime: '10 min'
}
```

---

## 📊 Database Integration

### Schema Mapping

**Process** = `dh_use_case`
```sql
SELECT code, title, summary, domain
FROM dh_use_case
WHERE code = 'UC_CD_001';
```

**Workflow/Activity** = `dh_workflow` or logical grouping
```sql
SELECT id, name, position, description
FROM dh_workflow
WHERE use_case_id = 'UC_CD_001';
```

**Task** = `dh_task`
```sql
SELECT code, title, objective, agents, tools
FROM dh_task
WHERE workflow_id = 'workflow-1';
```

**Step** = Decomposed from tasks (new granularity)
```sql
-- Could add: dh_task_step table
CREATE TABLE dh_task_step (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES dh_task(id),
  title TEXT NOT NULL,
  description TEXT,
  step_number INTEGER,
  estimated_time TEXT
);
```

---

## 🎓 Best Practices

### 1. Workflow Structure

- **Keep workflows focused** - 3-5 workflows per use case
- **Limit tasks per workflow** - 2-5 tasks for optimal visualization
- **Add steps to complex tasks** - Only where granularity helps
- **Use descriptive names** - Clear, action-oriented labels

### 2. Hierarchy Depth

- **Don't go too deep** - 3-4 levels maximum
- **Balance granularity** - Too much detail overwhelms
- **Consider audience** - Executives want high-level, executors want detail

### 3. Navigation UX

- **Provide multiple methods** - Breadcrumbs, buttons, keyboard
- **Show context** - Always indicate current level
- **Make back obvious** - Clear "Back" and "Home" buttons
- **Add visual cues** - Highlight current breadcrumb, show child counts

### 4. Performance

- **Lazy load children** - Don't render until needed
- **Limit nodes per level** - 50 nodes maximum
- **Use memoization** - Prevent unnecessary re-renders
- **Optimize edges** - Only show visible connections

---

## 🐛 Troubleshooting

### Common Issues

**Problem: Nodes not showing**
- Check data structure matches expected format
- Verify IDs are unique
- Check parent-child relationships

**Problem: Navigation not working**
- Check breadcrumbs array updates
- Verify handlers are connected
- Check context state updates

**Problem: Properties panel not showing**
- Verify `onSelectionChange` is connected
- Check `selectedNodes` state
- Ensure PropertiesPanel watches selection

For more troubleshooting, see [HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md](./HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md).

---

## 🔄 Migration Guide

### From Flat Workflows

1. **Identify groupings** - Group related tasks
2. **Create workflow objects** - Define workflow structure
3. **Organize tasks** - Assign to workflows
4. **Add steps** - Decompose complex tasks

See [HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md](./HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md) for detailed migration steps.

---

## 🤝 Contributing

This system is part of the digital health startup application. For modifications:

1. **Workflow Editor changes** → `src/components/workflow-editor/`
2. **Flow Visualizer changes** → `src/components/workflow-flow/`
3. **Type changes** → `src/features/workflow-designer/types/workflow.ts`
4. **State changes** → `src/lib/stores/workflow-editor-store.ts`

---

## 📝 License

Part of the VITAL path digital health startup application.

---

## 🎉 Get Started Now!

**Step 1**: Read the [comparison guide](./HIERARCHICAL_WORKFLOWS_COMPARISON.md) to choose your tool

**Step 2**: Try a complete example:
- [UC_CD_001 Flow Example](./apps/digital-health-startup/src/components/workflow-flow/examples/UC_CD_001_HierarchicalExample.tsx)
- [Patient Onboarding Editor Example](./apps/digital-health-startup/src/components/workflow-editor/examples/HierarchicalWorkflowExample.tsx)

**Step 3**: Build your own workflow!

---

## 📚 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| **HIERARCHICAL_WORKFLOWS_README.md** (this file) | Project overview and quick start | Everyone |
| [HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md](./HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md) | Complete technical summary | Developers |
| [HIERARCHICAL_WORKFLOWS_COMPARISON.md](./HIERARCHICAL_WORKFLOWS_COMPARISON.md) | Tool comparison and decision guide | Decision makers |
| [HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md](./HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md) | Flow visualizer integration | Frontend developers |
| [DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md](./DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md) | Digital health specifics | Domain experts |
| [HIERARCHICAL_NAVIGATION_GUIDE.md](./HIERARCHICAL_NAVIGATION_GUIDE.md) | Navigation patterns | UX designers, Users |
| [HIERARCHICAL_WORKFLOW_QUICKSTART.md](./HIERARCHICAL_WORKFLOW_QUICKSTART.md) | 5-minute quick start | New users |

---

**Ready to build hierarchical workflows!** 🚀

For questions, see the detailed guides or check the code examples in the `examples/` directories.
