# Hierarchical Workflow Flow Visualization - Integration Guide

## 🎯 Overview

This guide explains how to use the **Hierarchical Workflow Flow Visualizer** - an enhanced version of the workflow flow diagram that supports **drill-down navigation** through Workflows → Tasks → Steps.

## 🆕 What's New

### Original InteractiveWorkflowFlowVisualizer
- **Linear vertical flow** of workflows and tasks
- **Static view** - all content visible at once
- **No drill-down** capability
- Task nodes with agents, tools, and RAG sources

### New HierarchicalWorkflowFlowVisualizer
- ✅ **Hierarchical navigation** - drill into workflows to see tasks, drill into tasks to see steps
- ✅ **Breadcrumb navigation** - jump to any level instantly
- ✅ **Context-aware display** - show only relevant nodes based on current level
- ✅ **Back navigation** - keyboard shortcuts (Esc) and UI buttons
- ✅ **Enhanced node types** - Process, Activity, Task, and Step nodes
- ✅ **Maintains all existing features** - agents, tools, RAG sources, edit mode

---

## 📁 File Structure

### New Files Created

```
src/components/workflow-flow/
├── HierarchicalWorkflowFlowVisualizer.tsx     # Main hierarchical visualizer component
├── hierarchical-custom-nodes.tsx              # Process, Activity, Step node components
└── examples/
    └── UC_CD_001_HierarchicalExample.tsx      # Complete digital health example
```

### Existing Files (Unchanged)

```
src/components/workflow-flow/
├── InteractiveWorkflowFlowVisualizer.tsx      # Original visualizer (still available)
├── custom-nodes.tsx                            # Original node components
├── custom-edges.tsx                            # Edge components (reused)
└── InteractiveTaskNode.tsx                     # Interactive task node (reused)
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { HierarchicalWorkflowFlowVisualizer } from '@/components/workflow-flow/HierarchicalWorkflowFlowVisualizer';

function MyPage() {
  const workflows = [
    {
      id: 'workflow-1',
      name: 'Foundation Phase',
      position: 1,
      description: 'Establish clinical context',
    },
    // ... more workflows
  ];

  const tasksByWorkflow = {
    'workflow-1': [
      {
        id: 'task-1-1',
        code: 'T1.1',
        title: 'Define Clinical Context',
        position: 1,
        agents: [...],
        tools: [...],
        rags: [...],
        steps: [
          {
            id: 'step-1-1-1',
            title: 'Define Disease Burden',
            description: 'Characterize prevalence and impact',
            stepNumber: 1,
            estimatedTime: '10 min',
          },
          // ... more steps
        ],
      },
      // ... more tasks
    ],
  };

  return (
    <HierarchicalWorkflowFlowVisualizer
      workflows={workflows}
      tasksByWorkflow={tasksByWorkflow}
      useCaseTitle="UC_CD_001: DTx Endpoint Selection"
      editable={true}
      hierarchyMode="workflow-task"
    />
  );
}
```

### Using the UC_CD_001 Example

```tsx
import { UC_CD_001_HierarchicalExample } from '@/components/workflow-flow/examples/UC_CD_001_HierarchicalExample';

function MyPage() {
  return <UC_CD_001_HierarchicalExample />;
}
```

---

## 🎨 Component Props

### HierarchicalWorkflowFlowVisualizer Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `workflows` | `Workflow[]` | ✅ Yes | - | Array of workflow objects |
| `tasksByWorkflow` | `Record<string, Task[]>` | ✅ Yes | - | Tasks organized by workflow ID |
| `useCaseTitle` | `string` | ✅ Yes | - | Title displayed in start node |
| `editable` | `boolean` | ❌ No | `true` | Enable/disable edit mode toggle |
| `hierarchyMode` | `'process-activity' \| 'workflow-task' \| 'full'` | ❌ No | `'workflow-task'` | Hierarchy structure mode |

### Workflow Object

```typescript
interface Workflow {
  id: string;                    // Unique workflow ID
  name: string;                  // Workflow name
  position: number;              // Display order
  description?: string;          // Optional description
}
```

### Task Object

```typescript
interface Task {
  id: string;                    // Unique task ID
  code: string;                  // Task code (e.g., 'T1.1')
  title: string;                 // Task title
  position: number;              // Display order within workflow
  agents?: Agent[];              // Assigned agents
  tools?: Tool[];                // Required tools
  rags?: RAGSource[];            // RAG knowledge sources
  extra?: {
    userPrompt?: string;         // User prompt for AI execution
  };
  steps?: Step[];                // Child steps (NEW!)
}
```

### Step Object (NEW!)

```typescript
interface Step {
  id: string;                    // Unique step ID
  title: string;                 // Step title
  description?: string;          // Step description
  stepNumber?: number;           // Step sequence number
  estimatedTime?: string;        // Estimated duration (e.g., '10 min')
}
```

---

## 🧭 Navigation Guide

### 1. Root View (All Workflows)

When you first load the visualizer, you see:
- **Start node** with use case title
- **All workflow nodes** displayed as workflow headers
- **End node** at the bottom
- **"View" button** on each workflow (if it has tasks)

**Actions:**
- Click **"View" button** on any workflow → Drill into that workflow's tasks

### 2. Workflow View (Tasks)

After drilling into a workflow, you see:
- **Breadcrumb navigation** at top: `Home > Workflow Name`
- **Workflow header** as context indicator
- **All task nodes** in that workflow
- **"View" button** on tasks that have steps

**Actions:**
- Click **"View" button** on any task → Drill into that task's steps
- Click **"Back" button** → Return to all workflows
- Click **"Home" button** → Jump to root
- Press **Esc** → Go back one level

### 3. Task View (Steps)

After drilling into a task, you see:
- **Breadcrumb navigation**: `Home > Workflow Name > Task Name`
- **Task header** as context indicator
- **All step nodes** in that task
- Steps displayed with step number, estimated time, description

**Actions:**
- Click **"Back" button** → Return to workflow's tasks
- Click **"Home" button** → Jump to root
- Click breadcrumb level → Jump to that specific level
- Press **Esc** → Go back one level

---

## 🎯 Use Cases

### Use Case 1: Clinical Development Workflow (UC_CD_001)

**Structure:**
- 5 Workflows (Foundation → Research → Identification → Validation → Decision)
- 9 Tasks (T1.1, T2.1, T2.2, T3.1, T3.2, T4.1, T4.2, T5.2)
- 33 Steps (granular execution actions)

**Example:**
```typescript
// Foundation Phase → Define Clinical Context → 4 steps
workflows: [
  { id: 'wf-1', name: 'Foundation Phase', position: 1 }
]

tasksByWorkflow: {
  'wf-1': [
    {
      id: 't-1-1',
      code: 'T1.1',
      title: 'Define Clinical Context',
      position: 1,
      steps: [
        { id: 's-1', title: 'Define Disease Burden', stepNumber: 1, estimatedTime: '10 min' },
        { id: 's-2', title: 'Define Target Population', stepNumber: 2, estimatedTime: '10 min' },
        { id: 's-3', title: 'Define Therapeutic Mechanism', stepNumber: 3, estimatedTime: '5 min' },
        { id: 's-4', title: 'Generate Clinical Context Document', stepNumber: 4, estimatedTime: '5 min' },
      ]
    }
  ]
}
```

**Navigation Flow:**
1. **Root View**: See "Foundation Phase", "Research Phase", etc.
2. Click **"View"** on "Foundation Phase"
3. **Workflow View**: See "T1.1: Define Clinical Context"
4. Click **"View"** on T1.1
5. **Task View**: See 4 step nodes with details

### Use Case 2: Patient Onboarding Process

**Structure:**
- 3 Workflows (Registration → Medical History → Consent)
- Multiple tasks per workflow
- Steps for complex tasks

**Example:**
```typescript
workflows: [
  { id: 'wf-reg', name: 'Patient Registration', position: 1 },
  { id: 'wf-hist', name: 'Medical History Collection', position: 2 },
  { id: 'wf-cons', name: 'Informed Consent', position: 3 },
]

tasksByWorkflow: {
  'wf-reg': [
    {
      id: 't-demographics',
      code: 'REG-1',
      title: 'Collect Demographics',
      position: 1,
      steps: [
        { id: 's-name', title: 'Verify Identity', stepNumber: 1, estimatedTime: '2 min' },
        { id: 's-address', title: 'Capture Address', stepNumber: 2, estimatedTime: '3 min' },
        { id: 's-contact', title: 'Record Contact Info', stepNumber: 3, estimatedTime: '2 min' },
      ]
    }
  ]
}
```

---

## 🎨 Visual Design

### Node Color Coding

| Node Type | Color | Usage |
|-----------|-------|-------|
| **Process** | Purple (`#9333ea`) | Top-level processes (future feature) |
| **Activity** | Indigo (`#6366f1`) | Activity groupings (future feature) |
| **Workflow** | Purple (`#9333ea`) | Workflow headers (current) |
| **Task** | Blue (`#3b82f6`) | Task nodes with agents/tools |
| **Step** | Teal (`#14b8a6`) | Granular execution steps |
| **Start** | Green (`#22c55e`) | Start node |
| **End** | Red (`#ef4444`) | End node |

### Node Icons

- **Process**: 📁 FolderTree
- **Activity**: 📊 Layers
- **Workflow**: (purple header)
- **Task**: ✅ CheckSquare
- **Step**: 🔹 GitBranch
- **Start**: ▶️ Play
- **End**: ✓ CheckCircle2

### Breadcrumb Styling

```
[Back] [Home]  |  Home > Foundation Phase > T1.1: Define Clinical Context
 ↑       ↑           ↑           ↑                      ↑
Back   Root    Clickable    Workflow            Current Task
button  jump   breadcrumb    level               (highlighted)
```

---

## 🔧 Advanced Features

### 1. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Go back one level |
| `Cmd/Ctrl + 0` | Fit view to canvas |
| `Scroll` | Pan the canvas |
| `Pinch/Scroll` | Zoom in/out |

### 2. Edit Mode

Toggle edit mode to enable:
- ✏️ Click edit icon on task nodes
- 🤖 Configure agents, tools, RAG sources
- 📝 Edit user prompts
- 💾 Save changes (implementation dependent)

### 3. Dynamic Updates

The visualizer automatically updates when:
- `workflows` prop changes
- `tasksByWorkflow` prop changes
- User navigates (breadcrumbs update)
- User drills into nodes (canvas re-renders)

### 4. Responsive Layout

- **Minimap**: Bottom-right corner with color-coded nodes
- **Controls**: Top-left corner (zoom, fit view)
- **Breadcrumbs**: Top of canvas (when in hierarchy)
- **Legend**: Bottom section with node type explanations

---

## 📊 Data Mapping from JSON Seeds

### From UC_CD_001 JSON to Hierarchical Visualizer

**Original JSON Structure:**
```json
{
  "use_case": {
    "code": "UC_CD_001",
    "title": "DTx Clinical Endpoint Selection & Validation",
    "workflows": [
      {
        "name": "Endpoint Selection & Validation Workflow",
        "tasks": [
          {
            "code": "T1.1",
            "title": "Define Clinical Context",
            "agents": ["P01_CMO", "P10_PATADV"],
            "tools": ["Clinical Context Template"]
          }
        ]
      }
    ]
  }
}
```

**Mapping to Visualizer:**

1. **Break single workflow into multiple phases** (manually or programmatically):
   - Group tasks T1.1 → "Foundation Phase"
   - Group tasks T2.1, T2.2 → "Research Phase"
   - Group tasks T3.1, T3.2 → "Identification Phase"
   - Etc.

2. **Add step definitions** (decompose tasks):
   ```typescript
   {
     id: 'task-1-1',
     code: 'T1.1',
     title: 'Define Clinical Context',
     // ... existing properties
     steps: [
       { id: 'step-1', title: 'Define Disease Burden', stepNumber: 1, estimatedTime: '10 min' },
       { id: 'step-2', title: 'Define Target Population', stepNumber: 2, estimatedTime: '10 min' },
       // ...
     ]
   }
   ```

3. **Convert to visualizer format**:
   ```typescript
   const workflows = [
     { id: 'wf-1', name: 'Foundation Phase', position: 1, description: '...' },
     // ...
   ];

   const tasksByWorkflow = {
     'wf-1': [
       { id: 't-1-1', code: 'T1.1', title: 'Define Clinical Context', steps: [...] }
     ]
   };
   ```

---

## 🔄 Migration from Original Visualizer

### Option 1: Side-by-Side (Recommended)

Keep both visualizers and let users choose:

```tsx
function WorkflowVisualization() {
  const [viewMode, setViewMode] = useState<'linear' | 'hierarchical'>('hierarchical');

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setViewMode('linear')}>Linear View</Button>
        <Button onClick={() => setViewMode('hierarchical')}>Hierarchical View</Button>
      </div>

      {viewMode === 'linear' ? (
        <InteractiveWorkflowFlowVisualizer {...props} />
      ) : (
        <HierarchicalWorkflowFlowVisualizer {...props} />
      )}
    </div>
  );
}
```

### Option 2: Replace Entirely

Simply swap the import:

```typescript
// Before:
import { InteractiveWorkflowFlowVisualizer } from '@/components/workflow-flow/InteractiveWorkflowFlowVisualizer';

// After:
import { HierarchicalWorkflowFlowVisualizer } from '@/components/workflow-flow/HierarchicalWorkflowFlowVisualizer';
```

Add `steps` arrays to tasks where needed.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Load visualizer with sample data
- [ ] Verify all workflows appear at root level
- [ ] Click "View" on a workflow → tasks appear
- [ ] Click "View" on a task (with steps) → steps appear
- [ ] Click "Back" button → navigate up one level
- [ ] Click "Home" button → return to root
- [ ] Click breadcrumb levels → jump correctly
- [ ] Press Esc → go back one level
- [ ] Toggle edit mode → edit functionality works
- [ ] Minimap colors match node types
- [ ] Legend displays correctly

### Sample Test Data

```typescript
const testWorkflows = [
  { id: 'w1', name: 'Test Workflow', position: 1 }
];

const testTasks = {
  'w1': [
    {
      id: 't1',
      code: 'T1',
      title: 'Test Task',
      position: 1,
      steps: [
        { id: 's1', title: 'Step 1', stepNumber: 1, estimatedTime: '5 min' },
        { id: 's2', title: 'Step 2', stepNumber: 2, estimatedTime: '10 min' }
      ]
    }
  ]
};
```

---

## 🎓 Best Practices

### 1. Structure Your Workflows

- **Keep workflows focused** - 3-5 workflows per use case
- **Limit tasks per workflow** - 2-5 tasks for optimal visualization
- **Add steps to complex tasks** - Only add steps where granularity helps

### 2. Naming Conventions

- **Workflows**: Use phase names (Foundation, Research, Validation)
- **Tasks**: Include task codes (T1.1, T2.1) in titles
- **Steps**: Use action verbs (Define, Analyze, Document)

### 3. Metadata Completeness

- **Always provide** `id`, `name`/`title`, `position`
- **Add descriptions** for workflows and activities
- **Estimate times** for steps to help users plan
- **Assign stepNumbers** sequentially (1, 2, 3...)

### 4. Performance

- **Lazy load steps** - Don't render steps until task is opened
- **Limit initial render** - Only show top-level workflows at start
- **Use memoization** - Prevent unnecessary re-renders

---

## 🐛 Troubleshooting

### Problem: Workflows not showing

**Solution**: Verify workflows array has valid objects with `id`, `name`, `position`.

### Problem: "View" button missing on workflow

**Solution**: Ensure workflow ID exists as key in `tasksByWorkflow` with non-empty array.

### Problem: Steps not appearing

**Solution**:
- Check task has `steps` array with valid step objects
- Verify step objects have required fields (`id`, `title`)
- Ensure you clicked "View" on the task node

### Problem: Breadcrumbs not updating

**Solution**: Check that `onDrillInto` callback is properly connected to state updates.

### Problem: Navigation buttons not working

**Solution**:
- Verify `handleGoBack` and `handleNavigateTo` functions are defined
- Check breadcrumbs array is being updated correctly

---

## 📚 Related Documentation

- [HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md](./HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md) - Original workflow editor implementation
- [HIERARCHICAL_NAVIGATION_GUIDE.md](./HIERARCHICAL_NAVIGATION_GUIDE.md) - Navigation patterns
- [DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md](./DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md) - Digital health specific guide
- [ReactFlow Documentation](https://reactflow.dev/) - Underlying library docs

---

## 🚀 Next Steps

1. **Try the example**: Load `UC_CD_001_HierarchicalExample` component
2. **Integrate with your data**: Map your workflow JSON to the new format
3. **Add steps to tasks**: Decompose complex tasks into granular steps
4. **Customize styling**: Adjust colors, fonts, spacing to match your brand
5. **Extend functionality**: Add features like task execution, progress tracking, etc.

---

**Happy hierarchical workflow visualizing!** 🎉
