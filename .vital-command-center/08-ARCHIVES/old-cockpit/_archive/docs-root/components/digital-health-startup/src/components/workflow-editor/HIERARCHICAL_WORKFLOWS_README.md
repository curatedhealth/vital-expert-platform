# Hierarchical Workflow Feature

## Overview

The Hierarchical Workflow feature enables you to create nested, multi-level workflows with a drill-down navigation system. This allows you to organize complex processes into a clear hierarchy:

**Process → Activities → Tasks → Steps**

## Key Features

### 1. **Hierarchical Node Types**
- **Process**: Top-level container for organizing major business processes
- **Activity**: Mid-level grouping of related tasks within a process
- **Task**: Actionable work items that contain individual steps
- **Step**: Granular actions that make up a task

### 2. **Drill-Down Navigation**
- Click the "Open" button on any node to view its children
- Navigate through nested levels seamlessly
- Breadcrumb navigation shows your current location in the hierarchy

### 3. **Visual Hierarchy**
Each node type has a distinct color scheme:
- **Process**: Purple gradient (`#9333ea`)
- **Activity**: Indigo gradient (`#4f46e5`)
- **Task**: Blue gradient (`#3b82f6`)
- **Step**: Teal gradient (`#14b8a6`)

### 4. **Expand/Collapse**
- Click the chevron icon on nodes to expand/collapse children inline
- See child count badges on parent nodes
- Quickly understand the structure without drilling in

## Usage

### Creating a Hierarchical Workflow

#### Method 1: Using the Node Palette

1. **Start with a Process node**:
   - Drag a "Process" node from the palette onto the canvas
   - Give it a meaningful name (e.g., "Patient Onboarding")

2. **Add Activities**:
   - Click "Open" on the Process node to enter its context
   - Drag "Activity" nodes onto the canvas
   - These automatically become children of the Process

3. **Add Tasks to Activities**:
   - Click "Open" on an Activity node
   - Drag "Task" nodes onto the canvas
   - These become children of the Activity

4. **Add Steps to Tasks**:
   - Click "Open" on a Task node
   - Drag "Step" nodes onto the canvas
   - These become the final level of detail

#### Method 2: Using the Properties Panel

1. **Select a parent node** (Process, Activity, or Task)
2. In the Properties Panel, click "Add Activity/Task/Step"
3. The child node is automatically created and linked
4. Click "Open and View Children" to navigate to it

### Navigation

#### Breadcrumb Navigation
- Located at the top of the editor
- Shows your current location: `Root > Process > Activity > Task`
- Click any breadcrumb to jump to that level
- Click "Home" to return to the root view

#### Drill-Down Navigation
- Click "Open" button on any hierarchical node
- View only the children of that node
- Use breadcrumbs to navigate back

### Editing Hierarchical Nodes

#### In the Properties Panel

When you select a hierarchical node, you'll see:

1. **Basic Properties**:
   - Name/Label
   - Description
   - Hierarchy level badge

2. **Children Management**:
   - List of all child nodes
   - "Add" button to create new children
   - "Open" button to drill into each child
   - "Delete" button to remove children

3. **Parent Information**:
   - Shows the parent node ID (if applicable)

#### Node-Specific Features

**Process Nodes**:
- Can contain: Activities
- Shows activity count
- Purple theme

**Activity Nodes**:
- Can contain: Tasks
- Shows task count
- Indigo theme

**Task Nodes**:
- Can contain: Steps
- Shows step count
- Blue theme
- Also supports agents, tools, and RAG integrations

**Step Nodes**:
- Cannot have children (leaf nodes)
- Can show step numbers
- Can show estimated time
- Teal theme

## Example Workflow Structure

```
Patient Onboarding Process (PROCESS)
├── Patient Registration (ACTIVITY)
│   ├── Collect Patient Demographics (TASK)
│   │   ├── Verify Identity (STEP)
│   │   ├── Collect Contact Information (STEP)
│   │   └── Update Emergency Contacts (STEP)
│   └── Insurance Verification (TASK)
│       ├── Scan Insurance Card (STEP)
│       └── Verify Coverage (STEP)
├── Medical History Collection (ACTIVITY)
│   └── Complete Health Questionnaire (TASK)
│       ├── Review Current Medications (STEP)
│       └── Review Allergies (STEP)
└── Initial Clinical Assessment (ACTIVITY)
    └── Measure Vital Signs (TASK)
        ├── Blood Pressure (STEP)
        ├── Temperature (STEP)
        └── Weight & Height (STEP)
```

## Loading the Example

To see the hierarchical workflow in action:

```tsx
import { HierarchicalWorkflowExample } from '@/components/workflow-editor/examples/HierarchicalWorkflowExample';

function WorkflowEditorPage() {
  return (
    <>
      <HierarchicalWorkflowExample />
      <WorkflowEditor mode="create" />
    </>
  );
}
```

## API Reference

### Store Methods

#### `drillIntoNode(nodeId: string)`
Navigate into a node to view its children.

```typescript
const { drillIntoNode } = useWorkflowEditorStore();
drillIntoNode('process-1');
```

#### `navigateToNode(nodeId: string | null)`
Navigate to a specific node in the hierarchy (or root if null).

```typescript
const { navigateToNode } = useWorkflowEditorStore();
navigateToNode('activity-1'); // Go to activity
navigateToNode(null);          // Go to root
```

#### `toggleNodeExpansion(nodeId: string)`
Expand or collapse a node's children inline.

```typescript
const { toggleNodeExpansion } = useWorkflowEditorStore();
toggleNodeExpansion('process-1');
```

#### `addChildNode(parentId: string, childNode: Node)`
Add a child node to a parent.

```typescript
const { addChildNode } = useWorkflowEditorStore();

const newActivity = {
  id: 'activity-new',
  type: 'activity',
  position: { x: 100, y: 100 },
  data: {
    label: 'New Activity',
    hierarchyLevel: 'activity',
  },
};

addChildNode('process-1', newActivity);
```

#### `getVisibleNodes(): Node[]`
Get the nodes visible in the current context.

```typescript
const { getVisibleNodes } = useWorkflowEditorStore();
const visibleNodes = getVisibleNodes();
```

#### `getVisibleEdges(): Edge[]`
Get the edges visible in the current context.

```typescript
const { getVisibleEdges } = useWorkflowEditorStore();
const visibleEdges = getVisibleEdges();
```

## Node Data Structure

### Hierarchical Node Properties

```typescript
interface HierarchicalNodeData {
  label: string;
  description?: string;
  hierarchyLevel: 'process' | 'activity' | 'task' | 'step';
  parentId?: string;           // Parent node ID
  children?: string[];         // Array of child node IDs
  childrenCount?: number;      // Number of children
  isExpanded?: boolean;        // Expansion state

  // Callbacks (automatically injected)
  onExpand?: () => void;       // Expand/collapse handler
  onDrillInto?: () => void;    // Drill-down handler

  // Step-specific
  stepNumber?: number;         // For step nodes
  estimatedTime?: string;      // For step nodes
}
```

## Best Practices

### 1. **Logical Grouping**
- Group related activities under a process
- Group related tasks under an activity
- Break complex tasks into clear steps

### 2. **Meaningful Names**
- Use descriptive names that clearly indicate purpose
- Follow naming conventions: "Verb + Noun" (e.g., "Verify Identity")

### 3. **Appropriate Depth**
- Don't create too many levels (4 is the maximum: Process → Activity → Task → Step)
- If you find yourself needing more levels, consider breaking the process differently

### 4. **Visual Organization**
- Use the canvas space effectively when positioning nodes
- Keep related items close together
- Use edges to show flow between siblings

### 5. **Documentation**
- Add descriptions to nodes to explain their purpose
- Use the description field for context and instructions

## Troubleshooting

### "Node doesn't show children"
- Ensure the parent has `children` array populated
- Check that child nodes have the correct `parentId`
- Verify you're in the correct context (use breadcrumbs)

### "Can't drill into a node"
- Make sure the node is a hierarchical type (Process, Activity, or Task)
- Step nodes cannot be drilled into (they're leaf nodes)
- Check that the node has children defined

### "Breadcrumbs not showing"
- Breadcrumbs only appear when you've drilled into at least one node
- They're hidden at the root level

## Components Reference

### Created Files

1. **Node Components**:
   - `ProcessNode.tsx` - Process node component
   - `ActivityNode.tsx` - Activity node component
   - `StepNode.tsx` - Step node component
   - `TaskNode.tsx` - Updated task node with hierarchy support

2. **Navigation**:
   - `HierarchyBreadcrumbs.tsx` - Breadcrumb navigation component

3. **Properties**:
   - `HierarchyNodeProperties.tsx` - Properties panel for hierarchical nodes

4. **Examples**:
   - `HierarchicalWorkflowExample.tsx` - Demo workflow with full hierarchy

5. **Store Updates**:
   - `workflow-editor-store.ts` - Added hierarchical navigation methods

6. **Type Definitions**:
   - `workflow.ts` - Extended with hierarchical node types

## Future Enhancements

Potential future improvements:
- Drag-and-drop to reorder nodes within a level
- Copy/paste subtrees (node + all children)
- Search/filter across all levels
- Export hierarchy as outline or diagram
- Templates for common hierarchical patterns
- Automatic layout algorithms for hierarchies
- Collapse all / Expand all actions
- Zoom to fit current level

## Support

For questions or issues with hierarchical workflows, please:
1. Check this documentation
2. Review the example workflow
3. Inspect the store methods and component props
4. Reach out to the development team
