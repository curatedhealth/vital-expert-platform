'use client';

import { useCallback, useMemo, useState } from 'react';
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
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, EndNode, WorkflowHeaderNode, InteractiveTaskNode } from './custom-nodes';
import { WorkflowEdge, TaskEdge, StartEdge, EndEdge } from './custom-edges';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Workflow as WorkflowIcon, Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// Register custom node types with interactive task node
const nodeTypes = {
  start: StartNode,
  end: EndNode,
  workflowHeader: WorkflowHeaderNode,
  task: InteractiveTaskNode,
};

// Register custom edge types
const edgeTypes = {
  workflow: WorkflowEdge,
  task: TaskEdge,
  start: StartEdge,
  end: EndEdge,
};

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
  extra?: {
    userPrompt?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  position: number;
}

interface InteractiveWorkflowFlowVisualizerProps {
  workflows: Workflow[];
  tasksByWorkflow: Record<string, Task[]>;
  useCaseTitle: string;
  editable?: boolean;
}

export function InteractiveWorkflowFlowVisualizer({
  workflows,
  tasksByWorkflow,
  useCaseTitle,
  editable = true,
}: InteractiveWorkflowFlowVisualizerProps) {
  const [isEditMode, setIsEditMode] = useState(editable);

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

    // Process each workflow
    workflows
      .sort((a, b) => a.position - b.position)
      .forEach((workflow) => {
        const workflowTasks = tasksByWorkflow[workflow.id] || [];
        
        if (workflowTasks.length === 0) return;

        // Add Workflow Header Node
        const workflowHeaderId = `workflow-header-${workflow.id}`;
        nodes.push({
          id: workflowHeaderId,
          type: 'workflowHeader',
          position: { x: 100, y: currentY },
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
            },
          });
        }

        previousNodeId = workflowHeaderId;
        previousNodeType = 'workflowHeader';
        currentY += VERTICAL_SPACING;

        // Add Task Nodes
        workflowTasks
          .sort((a, b) => a.position - b.position)
          .forEach((task) => {
            const taskNodeId = `task-${task.id}`;
            
            nodes.push({
              id: taskNodeId,
              type: 'task',
              position: { x: HORIZONTAL_SPACING - 180, y: currentY },
              data: {
                taskId: task.id,
                title: task.title,
                position: task.position,
                workflowPosition: workflow.position,
                agents: task.agents || [],
                tools: task.tools || [],
                rags: task.rags || [],
                userPrompt: task.extra?.userPrompt || '',
                onUpdate: (updatedData: any) => {
                  // Handle task update
                  console.log('Task updated:', task.id, updatedData);
                },
              },
              draggable: false,
            });

            // Connect to previous node
            if (previousNodeId) {
              const edgeType = previousNodeType === 'workflowHeader' ? 'workflow' : 'task';
              edges.push({
                id: `${previousNodeId}-${taskNodeId}`,
                source: previousNodeId,
                target: taskNodeId,
                type: edgeType,
                animated: true,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: previousNodeType === 'workflowHeader' ? '#9333ea' : '#3b82f6',
                },
              });
            }

            previousNodeId = taskNodeId;
            previousNodeType = 'task';
            currentY += TASK_SPACING;
          });
      });

    // Add END node
    if (previousNodeId) {
      const endNodeId = 'end';
      nodes.push({
        id: endNodeId,
        type: 'end',
        position: { x: HORIZONTAL_SPACING - 50, y: currentY },
        data: {},
        draggable: false,
      });

      edges.push({
        id: `${previousNodeId}-${endNodeId}`,
        source: previousNodeId,
        target: endNodeId,
        type: 'end',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ef4444',
        },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [workflows, tasksByWorkflow, useCaseTitle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Calculate total counts
  const totalTasks = Object.values(tasksByWorkflow).reduce(
    (sum, tasks) => sum + tasks.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header with Mode Toggle */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <WorkflowIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Interactive Workflow Designer
                </h3>
                <p className="text-sm text-gray-600">
                  {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} • {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {editable && (
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={cn(
                  "gap-2",
                  isEditMode && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isEditMode ? (
                  <>
                    <Edit className="w-4 h-4" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    View Mode
                  </>
                )}
              </Button>
            )}
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
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-gray-600">Workflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Task</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">End</span>
            </div>
          </div>
          {isEditMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                💡 <strong>Edit Mode Active:</strong> Click the edit icon on any task node to configure agents, tools, RAG sources, and user prompts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

