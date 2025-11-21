# Hierarchical Workflow - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Load the Example Workflow

Add this to your workflow editor page:

```tsx
import { HierarchicalWorkflowExample } from '@/components/workflow-editor/examples/HierarchicalWorkflowExample';
import { WorkflowEditor } from '@/components/workflow-editor/WorkflowEditor';

export default function WorkflowEditorPage() {
  return (
    <>
      <HierarchicalWorkflowExample />
      <WorkflowEditor mode="create" />
    </>
  );
}
```

### Step 2: Navigate the Hierarchy

1. **You'll see a "Patient Onboarding Process" node** (purple box)
2. **Click the "Open" button** on it to see its Activities
3. **Click "Open" on an Activity** to see its Tasks
4. **Click "Open" on a Task** to see its Steps

### Step 3: Use the Breadcrumbs

At the top of the editor, you'll see breadcrumbs like:
```
Home > Patient Onboarding Process > Patient Registration > Collect Demographics
```

- Click any breadcrumb to jump to that level
- Click "Home" to return to the root

### Step 4: Create Your Own Hierarchy

#### Using the Node Palette:

1. **Start at root** (click "Home" in breadcrumbs)
2. **Drag a "Process" node** from the left palette
3. **Click "Open"** on your Process node
4. **Drag "Activity" nodes** - they'll auto-parent to the Process
5. **Click "Open" on an Activity**
6. **Drag "Task" nodes** - they'll auto-parent to the Activity
7. **Click "Open" on a Task**
8. **Drag "Step" nodes** - they'll auto-parent to the Task

#### Using the Properties Panel:

1. **Select a node** (Process, Activity, or Task)
2. **In the right panel**, find "Activities/Tasks/Steps" section
3. **Click "Add Activity/Task/Step"** button
4. **A child is created automatically!**
5. **Click "Open" to view it**

## 🎨 Visual Hierarchy

Each level has a unique color:

| Level    | Color  | Icon        | Can Contain |
|----------|--------|-------------|-------------|
| Process  | Purple | FolderTree  | Activities  |
| Activity | Indigo | Layers      | Tasks       |
| Task     | Blue   | CheckSquare | Steps       |
| Step     | Teal   | GitBranch   | Nothing     |

## 🔑 Key Interactions

### On Nodes:
- **Open Button**: Drill into the node
- **Chevron Icon**: Expand/collapse children inline
- **Badge**: Shows child count

### In Properties Panel:
- **Add Button**: Create a new child
- **Open Button** (per child): Navigate to that child
- **Delete Button**: Remove a child
- **"Open and View Children"**: Drill into the node

## 📝 Example Structure

```
📁 Patient Onboarding Process
  ├── 📊 Patient Registration
  │     ├── ✅ Collect Demographics
  │     │     ├── 🔹 Verify Identity
  │     │     ├── 🔹 Collect Contact Info
  │     │     └── 🔹 Update Emergency Contacts
  │     └── ✅ Insurance Verification
  │           ├── 🔹 Scan Insurance Card
  │           └── 🔹 Verify Coverage
  ├── 📊 Medical History
  │     └── ✅ Health Questionnaire
  │           ├── 🔹 Review Medications
  │           └── 🔹 Review Allergies
  └── 📊 Initial Assessment
        └── ✅ Measure Vital Signs
              ├── 🔹 Blood Pressure
              ├── 🔹 Temperature
              └── 🔹 Weight & Height
```

## 🎯 Common Use Cases

### Healthcare Processes
```
Patient Care Process
├── Intake & Registration
├── Diagnosis & Assessment
├── Treatment Planning
└── Follow-up Care
```

### Software Development
```
Feature Development Process
├── Requirements Gathering
├── Design & Architecture
├── Implementation
└── Testing & Deployment
```

### Business Operations
```
Customer Onboarding Process
├── Account Setup
├── Product Training
├── Configuration
└── Go-Live Support
```

## 💡 Pro Tips

1. **Start Simple**: Create the Process and Activities first, then drill down
2. **Use Descriptions**: Add descriptions to nodes for documentation
3. **Logical Grouping**: Group related tasks under the same activity
4. **Breadcrumbs**: Use breadcrumbs instead of back button for faster navigation
5. **Properties Panel**: Most powerful for managing children programmatically

## 🐛 Troubleshooting

**Q: I don't see breadcrumbs**
- A: Breadcrumbs only appear after you drill into a node. At root level, they're hidden.

**Q: My new node isn't showing up as a child**
- A: Make sure you're in the parent's context before creating the node (use "Open" first)

**Q: Can't click "Open" on a Step node**
- A: Correct! Steps are leaf nodes and can't have children.

**Q: How do I get back to root?**
- A: Click "Home" in the breadcrumbs (top left)

## 📚 Learn More

- **Full Documentation**: [HIERARCHICAL_WORKFLOWS_README.md](./src/components/workflow-editor/HIERARCHICAL_WORKFLOWS_README.md)
- **Implementation Details**: [HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md](./HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md)
- **Example Code**: [HierarchicalWorkflowExample.tsx](./src/components/workflow-editor/examples/HierarchicalWorkflowExample.tsx)

## 🎉 You're Ready!

Start building hierarchical workflows and organize your complex processes with ease!

### Quick Actions:
1. ✅ Load the example
2. ✅ Navigate through the hierarchy
3. ✅ Create your first Process node
4. ✅ Add Activities, Tasks, and Steps
5. ✅ Enjoy organized workflows!
