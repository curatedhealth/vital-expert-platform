/**
 * Example: How to Use the Interactive Workflow Node
 * 
 * This file shows different ways to integrate the interactive workflow designer
 * into your application.
 */

// ============================================
// OPTION 1: Replace the existing visualizer
// ============================================

// In: src/components/workflow-flow.tsx
// Simply update the re-export to use the interactive version:

export { InteractiveWorkflowFlowVisualizer as WorkflowFlowVisualizer } from './workflow-flow/InteractiveWorkflowFlowVisualizer';

// This makes ALL existing uses of WorkflowFlowVisualizer interactive!
// No other code changes needed.

// ============================================
// OPTION 2: Add as a new tab in workflow detail page
// ============================================

// In: src/app/(app)/workflows/[code]/page.tsx

import { InteractiveWorkflowFlowVisualizer } from '@/components/workflow-flow/InteractiveWorkflowFlowVisualizer';

// Add a new tab trigger:
<TabsList className="bg-gray-100">
  <TabsTrigger value="workflows">
    <WorkflowIcon className="w-4 h-4 mr-2" />
    Workflows & Tasks
  </TabsTrigger>
  <TabsTrigger value="visualization">
    <GitBranch className="w-4 h-4 mr-2" />
    Flow Diagram
  </TabsTrigger>
  <TabsTrigger value="interactive-designer">
    <Edit className="w-4 h-4 mr-2" />
    Interactive Designer
  </TabsTrigger>
  {/* other tabs... */}
</TabsList>

// Add the tab content:
<TabsContent value="interactive-designer" className="space-y-4">
  {workflows.length === 0 ? (
    <Card>
      <CardContent className="py-12 text-center">
        <WorkflowIcon className="h-12 w-12 text-medical-gray mx-auto mb-4 opacity-50" />
        <p className="text-medical-gray">No workflows to design</p>
      </CardContent>
    </Card>
  ) : (
    <InteractiveWorkflowFlowVisualizer
      workflows={workflows}
      tasksByWorkflow={tasks}
      useCaseTitle={useCase.title}
      editable={true}
    />
  )}
</TabsContent>

// ============================================
// OPTION 3: Use in a standalone page
// ============================================

// Create: src/app/(app)/workflows/designer/[code]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { InteractiveWorkflowFlowVisualizer } from '@/components/workflow-flow/InteractiveWorkflowFlowVisualizer';

export default function WorkflowDesignerPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflowData() {
      const response = await fetch(`/api/workflows/usecases/${params.code}/complete`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    }
    fetchWorkflowData();
  }, [params.code]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Workflow not found</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{data.useCase.title}</h1>
      
      <InteractiveWorkflowFlowVisualizer
        workflows={data.workflows}
        tasksByWorkflow={data.tasksByWorkflow}
        useCaseTitle={data.useCase.title}
        editable={true}
      />
    </div>
  );
}

// ============================================
// OPTION 4: Use just the interactive node
// ============================================

// If you want to build your own visualizer but use the interactive node:

import { InteractiveTaskNode } from '@/components/workflow-flow/custom-nodes';
import ReactFlow from 'reactflow';

const nodeTypes = {
  task: InteractiveTaskNode,
  // ... other node types
};

export function MyCustomVisualizer() {
  const nodes = [
    {
      id: 'task-1',
      type: 'task',
      position: { x: 100, y: 100 },
      data: {
        taskId: 'uuid-here',
        title: 'My Task',
        position: 1,
        workflowPosition: 1,
        agents: [],
        tools: [],
        rags: [],
        userPrompt: '',
        onUpdate: (updatedData) => {
          console.log('Task updated:', updatedData);
          // Handle the update in your custom way
        },
      },
    },
  ];

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      // ... other props
    />
  );
}

// ============================================
// API USAGE EXAMPLES
// ============================================

// Fetch available agents
const response = await fetch('/api/workflows/agents');
const { agents } = await response.json();
// Returns: [{ id, code, name, agent_type, framework, status }, ...]

// Fetch available tools
const response = await fetch('/api/workflows/tools');
const { tools } = await response.json();
// Returns: [{ id, code, name, category, tool_type, is_active }, ...]

// Fetch available RAG sources
const response = await fetch('/api/workflows/rags');
const { rags } = await response.json();
// Returns: [{ id, code, name, source_type, description }, ...]

// Update task assignments
const response = await fetch(`/api/workflows/tasks/${taskId}/assignments`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentIds: ['agent-uuid-1', 'agent-uuid-2'],
    toolIds: ['tool-uuid-1'],
    ragIds: ['rag-uuid-1', 'rag-uuid-2'],
    userPrompt: 'Please focus on X, Y, and Z...',
  }),
});
const { success, task } = await response.json();

// Get task with assignments
const response = await fetch(`/api/workflows/tasks/${taskId}/assignments`);
const { task } = await response.json();

// ============================================
// CUSTOMIZATION EXAMPLES
// ============================================

// Change colors:
// Edit InteractiveTaskNode.tsx and update the className props

// Add more fields:
// 1. Add state variable: const [myField, setMyField] = useState('');
// 2. Add UI in the dialog
// 3. Include in save payload
// 4. Update API to handle new field

// Validation example:
const handleSave = async () => {
  // Validate before saving
  if (selectedAgents.length === 0) {
    alert('Please select at least one agent');
    return;
  }
  
  if (selectedTools.length > 10) {
    alert('Maximum 10 tools allowed');
    return;
  }
  
  // Proceed with save...
};

// Custom onUpdate handler:
data: {
  // ... other props
  onUpdate: async (updatedData) => {
    // Custom logic after update
    console.log('Task updated:', updatedData);
    
    // Trigger refresh
    await refetchWorkflow();
    
    // Show success message
    toast.success('Task updated successfully!');
    
    // Update local state
    setTasks(prev => ({
      ...prev,
      [workflowId]: prev[workflowId].map(t =>
        t.id === taskId ? { ...t, ...updatedData } : t
      ),
    }));
  },
}

// ============================================
// TYPESCRIPT TYPES
// ============================================

// Available in the component files, but here for reference:

interface Agent {
  id: string;
  code: string;
  name: string;
  agent_type: string;
  framework?: string;
}

interface Tool {
  id: string;
  code: string;
  name: string;
  category: string;
  tool_type: string;
}

interface RagSource {
  id: string;
  code: string;
  name: string;
  source_type: string;
}

interface TaskAssignment {
  agents: Array<{
    id: string;
    name: string;
    code: string;
    assignment_type?: string;
    execution_order?: number;
  }>;
  tools: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  rags: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  userPrompt?: string;
}

