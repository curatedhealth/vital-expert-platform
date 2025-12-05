'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Bot, Wrench, Database, Workflow as WorkflowIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  code: string;
  title: string;
  position: number;
  agents?: Array<{
    id: string;
    name: string;
    code: string;
    assignment_type: string;
    execution_order: number;
  }>;
  tools?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  rags?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface Workflow {
  id: string;
  name: string;
  position: number;
}

interface EndToEndVisualizerProps {
  workflows: Workflow[];
  tasksByWorkflow: Record<string, Task[]>;
  useCaseTitle: string;
}

// Workflow Group Header Node
function WorkflowHeaderNode({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg min-w-[300px]">
      <div className="flex items-center gap-2">
        <WorkflowIcon className="h-5 w-5" />
        <div>
          <p className="text-xs font-medium opacity-90">Workflow {data.position}</p>
          <h3 className="font-bold text-sm">{data.name}</h3>
        </div>
      </div>
    </div>
  );
}

// Task Node
function TaskNode({ data }: { data: any }) {
  const hasAssignments = (data.agents?.length > 0) || (data.tools?.length > 0) || (data.rags?.length > 0);
  
  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg shadow-md min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg">
        <div className="flex items-center justify-between mb-1">
          <Badge className="bg-white/20 text-white text-xs">
            Task {data.position}
          </Badge>
          <span className="text-xs font-mono opacity-90">{data.workflowPosition}.{data.position}</span>
        </div>
        <h3 className="font-semibold text-sm leading-tight">{data.title}</h3>
      </div>

      {/* Body - Only show if there are assignments */}
      {hasAssignments && (
        <div className="p-3 space-y-2 bg-neutral-50">
          {/* Agents */}
          {data.agents && data.agents.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Bot className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-semibold text-neutral-700">
                  {data.agents.length} Agent{data.agents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.agents.slice(0, 2).map((agent: any) => (
                  <Badge key={agent.id} variant="outline" className="text-[10px] bg-blue-50">
                    {agent.name}
                  </Badge>
                ))}
                {data.agents.length > 2 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{data.agents.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tools */}
          {data.tools && data.tools.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Wrench className="h-3 w-3 text-green-600" />
                <span className="text-xs font-semibold text-neutral-700">
                  {data.tools.length} Tool{data.tools.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* RAG Sources */}
          {data.rags && data.rags.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-semibold text-neutral-700">
                  {data.rags.length} Source{data.rags.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Start/End Nodes
function StartNode() {
  return (
    <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2">
      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
      START USE CASE
    </div>
  );
}

function EndNode() {
  return (
    <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2">
      COMPLETE
      <div className="w-3 h-3 bg-white rounded-full"></div>
    </div>
  );
}

const nodeTypes = {
  workflowHeader: WorkflowHeaderNode,
  task: TaskNode,
  start: StartNode,
  end: EndNode,
};

export function EndToEndWorkflowVisualizer({
  workflows,
  tasksByWorkflow,
  useCaseTitle,
}: EndToEndVisualizerProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const HORIZONTAL_SPACING = 400;
    const VERTICAL_SPACING = 200;
    const TASK_SPACING = 280;
    
    let currentY = 100;
    let previousNodeId: string | null = null;

    // Add START node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: HORIZONTAL_SPACING, y: currentY },
      data: { label: 'Start' },
      sourcePosition: Position.Bottom,
    });
    previousNodeId = 'start';
    currentY += VERTICAL_SPACING;

    // Sort workflows by position
    const sortedWorkflows = [...workflows].sort((a, b) => a.position - b.position);

    sortedWorkflows.forEach((workflow, workflowIdx) => {
      const workflowTasks = tasksByWorkflow[workflow.id] || [];
      
      if (workflowTasks.length === 0) return;

      // Add workflow header node
      const workflowHeaderId = `workflow-header-${workflow.id}`;
      nodes.push({
        id: workflowHeaderId,
        type: 'workflowHeader',
        position: { x: HORIZONTAL_SPACING - 50, y: currentY },
        data: {
          name: workflow.name,
          position: workflow.position,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Connect previous node to workflow header
      if (previousNodeId) {
        edges.push({
          id: `${previousNodeId}-${workflowHeaderId}`,
          source: previousNodeId,
          target: workflowHeaderId,
          animated: true,
          style: { stroke: '#9333ea', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#9333ea',
          },
        });
      }

      previousNodeId = workflowHeaderId;
      currentY += VERTICAL_SPACING;

      // Add tasks for this workflow
      const sortedTasks = [...workflowTasks].sort((a, b) => a.position - b.position);
      
      sortedTasks.forEach((task, taskIdx) => {
        const taskNodeId = `task-${task.id}`;
        
        // Alternate task positions slightly for visual variety
        const xOffset = taskIdx % 2 === 0 ? 0 : 80;
        
        nodes.push({
          id: taskNodeId,
          type: 'task',
          position: { x: HORIZONTAL_SPACING + xOffset, y: currentY },
          data: {
            ...task,
            workflowPosition: workflow.position,
            agents: task.agents || [],
            tools: task.tools || [],
            rags: task.rags || [],
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Connect to previous node
        if (previousNodeId) {
          edges.push({
            id: `${previousNodeId}-${taskNodeId}`,
            source: previousNodeId,
            target: taskNodeId,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          });
        }

        previousNodeId = taskNodeId;
        currentY += TASK_SPACING;
      });

      // Add some space between workflows
      currentY += 80;
    });

    // Add END node
    nodes.push({
      id: 'end',
      type: 'end',
      position: { x: HORIZONTAL_SPACING, y: currentY },
      data: { label: 'End' },
      targetPosition: Position.Top,
    });

    // Connect last task to end
    if (previousNodeId && previousNodeId !== 'start') {
      edges.push({
        id: `${previousNodeId}-end`,
        source: previousNodeId,
        target: 'end',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ef4444',
        },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [workflows, tasksByWorkflow]);

  const totalTasks = Object.values(tasksByWorkflow).reduce((sum, tasks) => sum + tasks.length, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-deep-charcoal mb-2">
          End-to-End Workflow Visualization
        </h3>
        <div className="flex items-center gap-6 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <WorkflowIcon className="h-4 w-4 text-purple-600" />
            <span>{workflows.length} Workflow{workflows.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>{totalTasks} Task{totalTasks !== 1 ? 's' : ''}</span>
          </div>
          <div className="text-xs text-neutral-500 ml-auto">
            Scroll to navigate • Use controls to zoom
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="w-full h-[1000px] border-2 border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'start') return '#22c55e';
              if (node.type === 'end') return '#ef4444';
              if (node.type === 'workflowHeader') return '#9333ea';
              return '#3b82f6';
            }}
            maskColor="rgba(255, 255, 255, 0.8)"
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold text-sm text-neutral-700 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span>Workflow Phase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-400"></div>
            <span>Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span>Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

