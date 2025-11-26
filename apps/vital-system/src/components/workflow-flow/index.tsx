'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, EndNode, WorkflowHeaderNode, TaskNode } from './custom-nodes';
import { WorkflowEdge, TaskEdge, StartEdge, EndEdge } from './custom-edges';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow as WorkflowIcon, GitBranch, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Register custom node types - using Object.freeze to prevent recreation
const nodeTypes = Object.freeze({
  start: StartNode,
  end: EndNode,
  workflowHeader: WorkflowHeaderNode,
  task: TaskNode,
});

// Register custom edge types - using Object.freeze to prevent recreation
const edgeTypes = Object.freeze({
  workflow: WorkflowEdge,
  task: TaskEdge,
  start: StartEdge,
  end: EndEdge,
});

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

interface WorkflowFlowVisualizerProps {
  workflows: Workflow[];
  tasksByWorkflow: Record<string, Task[]>;
  useCaseTitle: string;
}

export function WorkflowFlowVisualizer({
  workflows,
  tasksByWorkflow,
  useCaseTitle,
}: WorkflowFlowVisualizerProps) {
  // Generate nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const HORIZONTAL_SPACING = 500;
    const VERTICAL_SPACING = 200;
    const TASK_SPACING = 320;
    
    let currentY = 80;
    let previousNodeId: string | null = null;
    let previousNodeType: string | null = null;

    // Add START node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: HORIZONTAL_SPACING - 50, y: currentY },
      data: { label: useCaseTitle },
      draggable: false,
    });
    previousNodeId = 'start';
    previousNodeType = 'start';
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
        position: { x: HORIZONTAL_SPACING - 100, y: currentY },
        data: {
          name: workflow.name,
          position: workflow.position,
        },
        draggable: false,
      });

      // Connect previous node to workflow header
      if (previousNodeId) {
        const edgeType = previousNodeType === 'start' ? 'start' : 'workflow';
        edges.push({
          id: `${previousNodeId}-${workflowHeaderId}`,
          source: previousNodeId,
          target: workflowHeaderId,
          type: edgeType,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: previousNodeType === 'start' ? '#22c55e' : '#9333ea',
            width: 20,
            height: 20,
          },
        });
      }

      previousNodeId = workflowHeaderId;
      previousNodeType = 'workflow';
      currentY += VERTICAL_SPACING;

      // Add tasks for this workflow
      const sortedTasks = [...workflowTasks].sort((a, b) => a.position - b.position);
      
      sortedTasks.forEach((task, taskIdx) => {
        const taskNodeId = `task-${task.id}`;
        
        // Alternate task positions slightly for visual variety
        const xOffset = taskIdx % 2 === 0 ? 0 : 100;
        
        nodes.push({
          id: taskNodeId,
          type: 'task',
          position: { x: HORIZONTAL_SPACING - 50 + xOffset, y: currentY },
          data: {
            ...task,
            workflowPosition: workflow.position,
            agents: task.agents || [],
            tools: task.tools || [],
            rags: task.rags || [],
          },
          draggable: true,
        });

        // Connect to previous node
        if (previousNodeId) {
          const edgeType = previousNodeType === 'workflow' ? 'workflow' : 'task';
          edges.push({
            id: `${previousNodeId}-${taskNodeId}`,
            source: previousNodeId,
            target: taskNodeId,
            type: edgeType,
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: previousNodeType === 'workflow' ? '#9333ea' : '#3b82f6',
              width: 16,
              height: 16,
            },
          });
        }

        previousNodeId = taskNodeId;
        previousNodeType = 'task';
        currentY += TASK_SPACING;
      });

      // Add some space between workflows
      currentY += 60;
    });

    // Add END node
    nodes.push({
      id: 'end',
      type: 'end',
      position: { x: HORIZONTAL_SPACING - 50, y: currentY },
      data: { label: 'All tasks completed' },
      draggable: false,
    });

    // Connect last task to end
    if (previousNodeId && previousNodeId !== 'start') {
      edges.push({
        id: `${previousNodeId}-end`,
        source: previousNodeId,
        target: 'end',
        type: 'end',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ef4444',
          width: 20,
          height: 20,
        },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [workflows, tasksByWorkflow, useCaseTitle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const totalTasks = useMemo(
    () => Object.values(tasksByWorkflow).reduce((sum, tasks) => sum + tasks.length, 0),
    [tasksByWorkflow]
  );

  const totalAgents = useMemo(() => {
    let count = 0;
    Object.values(tasksByWorkflow).forEach(tasks => {
      tasks.forEach(task => {
        count += task.agents?.length || 0;
      });
    });
    return count;
  }, [tasksByWorkflow]);

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  End-to-End Workflow Visualization
                </h3>
                <p className="text-sm text-gray-600">
                  Complete flow from start to finish with all dependencies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{workflows.length}</p>
                <p className="text-xs text-gray-600">Workflows</p>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{totalTasks}</p>
                <p className="text-xs text-gray-600">Tasks</p>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">{totalAgents}</p>
                <p className="text-xs text-gray-600">Agents</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* React Flow Canvas */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-0">
          <div className="w-full h-[800px] bg-gray-50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="bottom-right"
              minZoom={0.1}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
              connectionLineType={ConnectionLineType.Bezier}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                color="#e5e7eb"
                gap={20}
                size={1}
                className="bg-gray-50"
              />
              <Controls
                showZoom
                showFitView
                showInteractive
                position="top-left"
                className="bg-white border-2 border-gray-200 rounded-lg shadow-lg"
              />
              <MiniMap
                nodeColor={(node) => {
                  if (node.type === 'start') return '#22c55e';
                  if (node.type === 'end') return '#ef4444';
                  if (node.type === 'workflowHeader') return '#9333ea';
                  return '#3b82f6';
                }}
                maskColor="rgba(255, 255, 255, 0.85)"
                className="!bg-white !border-2 !border-gray-200 !rounded-lg !shadow-lg"
                position="bottom-right"
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-600 rounded" />
            Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Start</p>
                <p className="text-[10px] text-gray-500">Use case begins</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Workflow</p>
                <p className="text-[10px] text-gray-500">Major phase</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border-2 border-blue-400 bg-white shadow-md" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Task</p>
                <p className="text-[10px] text-gray-500">Individual action</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">End</p>
                <p className="text-[10px] text-gray-500">Complete</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="w-12 h-0.5 bg-blue-500" />
                <div className="w-12 h-0.5 bg-purple-500" />
                <div className="w-12 h-0.5 bg-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Connections</p>
                <p className="text-[10px] text-gray-500">Flow direction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

