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
  Panel,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, EndNode, WorkflowHeaderNode, TaskNode, StageNode } from './custom-nodes';
import { WorkflowEdge, TaskEdge, StartEdge, EndEdge } from './custom-edges';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow as WorkflowIcon, 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Layers,
  Grid3X3,
  LayoutGrid,
  Bot,
  Wrench,
  Database,
  Clock,
  ChevronRight
} from 'lucide-react';

// Register custom node types - using Object.freeze to prevent recreation
const nodeTypes = Object.freeze({
  start: StartNode,
  end: EndNode,
  workflowHeader: WorkflowHeaderNode,
  stage: StageNode,
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
  code?: string;
  unique_id?: string;
  title: string;
  objective?: string;
  position: number;
  extra?: {
    task_type?: string;
    estimated_duration_minutes?: number;
  };
  agents?: Array<{
    id: string;
    name: string;
    code?: string;
    assignment_type?: string;
    execution_order?: number;
  }>;
  tools?: Array<{
    id: string;
    name: string;
    code?: string;
    category?: string;
  }>;
  rags?: Array<{
    id: string;
    name: string;
    code?: string;
    source_type?: string;
    description?: string;
  }>;
}

interface Workflow {
  id: string;
  name: string;
  unique_id?: string;
  description?: string;
  position: number;
  metadata?: {
    estimated_duration_hours?: number;
    is_mandatory?: boolean;
  };
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
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');

  // Generate nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const isHorizontal = layoutMode === 'horizontal';
    
    // Layout constants
    const STAGE_WIDTH = 360;
    const TASK_WIDTH = 320;
    const VERTICAL_GAP = 180;
    const HORIZONTAL_GAP = 450;
    const TASK_GAP = 280;
    
    let currentX = 100;
    let currentY = 80;
    let previousNodeId: string | null = null;
    let previousNodeType: string | null = null;

    // Add START node
    nodes.push({
      id: 'start',
      type: 'start',
      position: isHorizontal ? { x: currentX, y: 300 } : { x: 400, y: currentY },
      data: { label: useCaseTitle },
      draggable: false,
    });
    previousNodeId = 'start';
    previousNodeType = 'start';
    
    if (isHorizontal) {
      currentX += HORIZONTAL_GAP;
    } else {
      currentY += VERTICAL_GAP;
    }

    // Sort workflows by position
    const sortedWorkflows = [...workflows].sort((a, b) => a.position - b.position);

    // If no workflows, just show start -> end
    if (sortedWorkflows.length === 0) {
      nodes.push({
        id: 'end',
        type: 'end',
        position: isHorizontal ? { x: currentX, y: 300 } : { x: 400, y: currentY },
        data: { label: 'No stages defined' },
        draggable: false,
      });
      
      edges.push({
        id: 'start-end',
        source: 'start',
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
      
      return { initialNodes: nodes, initialEdges: edges };
    }

    sortedWorkflows.forEach((workflow, workflowIdx) => {
      const workflowTasks = tasksByWorkflow[workflow.id] || [];
      
      // Add stage/workflow header node
      const stageNodeId = `stage-${workflow.id}`;
      const taskCount = workflowTasks.length;
      const estimatedHours = workflow.metadata?.estimated_duration_hours || 0;
      
      nodes.push({
        id: stageNodeId,
        type: 'stage',
        position: isHorizontal 
          ? { x: currentX, y: 300 - 60 }
          : { x: 400 - STAGE_WIDTH/2 + 50, y: currentY },
        data: {
          name: workflow.name,
          description: workflow.description,
          position: workflow.position,
          unique_id: workflow.unique_id,
          taskCount,
          estimatedHours,
          isMandatory: workflow.metadata?.is_mandatory ?? true,
        },
        draggable: true,
      });

      // Connect previous node to stage
      if (previousNodeId) {
        const edgeType = previousNodeType === 'start' ? 'start' : 'workflow';
        edges.push({
          id: `${previousNodeId}-${stageNodeId}`,
          source: previousNodeId,
          target: stageNodeId,
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

      previousNodeId = stageNodeId;
      previousNodeType = 'stage';
      
      if (isHorizontal) {
        currentX += HORIZONTAL_GAP;
      } else {
        currentY += VERTICAL_GAP;
      }

      // Add tasks for this workflow (if any)
      if (workflowTasks.length > 0) {
        const sortedTasks = [...workflowTasks].sort((a, b) => a.position - b.position);
        
        sortedTasks.forEach((task, taskIdx) => {
          const taskNodeId = `task-${task.id}`;
          
          // Alternate task positions for visual variety in vertical mode
          const xOffset = isHorizontal ? 0 : (taskIdx % 2 === 0 ? -30 : 30);
          
          nodes.push({
            id: taskNodeId,
            type: 'task',
            position: isHorizontal
              ? { x: currentX, y: 300 }
              : { x: 400 - TASK_WIDTH/2 + 50 + xOffset, y: currentY },
            data: {
              ...task,
              workflowPosition: workflow.position,
              stageId: workflow.id,
              stageName: workflow.name,
              agents: task.agents || [],
              tools: task.tools || [],
              rags: task.rags || [],
            },
            draggable: true,
          });

          // Connect to previous node
          if (previousNodeId) {
            const edgeType = previousNodeType === 'stage' ? 'workflow' : 'task';
            edges.push({
              id: `${previousNodeId}-${taskNodeId}`,
              source: previousNodeId,
              target: taskNodeId,
              type: edgeType,
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: previousNodeType === 'stage' ? '#9333ea' : '#3b82f6',
                width: 16,
                height: 16,
              },
            });
          }

          previousNodeId = taskNodeId;
          previousNodeType = 'task';
          
          if (isHorizontal) {
            currentX += HORIZONTAL_GAP * 0.8;
          } else {
            currentY += TASK_GAP;
          }
        });
      }

      // Add spacing between workflows
      if (!isHorizontal) {
        currentY += 40;
      }
    });

    // Add END node
    nodes.push({
      id: 'end',
      type: 'end',
      position: isHorizontal 
        ? { x: currentX, y: 300 }
        : { x: 400, y: currentY },
      data: { label: 'Workflow Complete' },
      draggable: false,
    });

    // Connect last node to end
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
  }, [workflows, tasksByWorkflow, useCaseTitle, layoutMode]);

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

  const totalTools = useMemo(() => {
    let count = 0;
    Object.values(tasksByWorkflow).forEach(tasks => {
      tasks.forEach(task => {
        count += task.tools?.length || 0;
      });
    });
    return count;
  }, [tasksByWorkflow]);

  const estimatedTotalHours = useMemo(() => {
    return workflows.reduce((sum, w) => sum + (w.metadata?.estimated_duration_hours || 0), 0);
  }, [workflows]);

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-slate-50 via-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <GitBranch className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  Workflow Designer View
                </h3>
                <p className="text-sm text-gray-600">
                  Interactive visualization • Drag nodes to rearrange
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center px-4 py-2 bg-white/60 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 justify-center">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <p className="text-2xl font-bold text-indigo-600">{workflows.length}</p>
                </div>
                <p className="text-xs text-gray-600 font-medium">Stages</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/60 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 justify-center">
                  <Grid3X3 className="h-4 w-4 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-600">{totalTasks}</p>
                </div>
                <p className="text-xs text-gray-600 font-medium">Tasks</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/60 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 justify-center">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600">{totalAgents}</p>
                </div>
                <p className="text-xs text-gray-600 font-medium">Agents</p>
              </div>
              {estimatedTotalHours > 0 && (
                <div className="text-center px-4 py-2 bg-white/60 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 justify-center">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <p className="text-2xl font-bold text-amber-600">{estimatedTotalHours}h</p>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Est. Duration</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* React Flow Canvas */}
      <Card className="border-2 border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full h-[700px] bg-gradient-to-br from-slate-50 to-gray-100">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              attributionPosition="bottom-right"
              minZoom={0.1}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
              connectionLineType={ConnectionLineType.Bezier}
              proOptions={{ hideAttribution: true }}
              snapToGrid
              snapGrid={[20, 20]}
            >
              <Background
                variant={BackgroundVariant.Dots}
                color="#cbd5e1"
                gap={24}
                size={2}
              />
              <Controls
                showZoom
                showFitView
                showInteractive
                position="top-left"
                className="!bg-white !border-2 !border-gray-200 !rounded-xl !shadow-lg"
              />
              <MiniMap
                nodeColor={(node) => {
                  if (node.type === 'start') return '#22c55e';
                  if (node.type === 'end') return '#ef4444';
                  if (node.type === 'stage') return '#8b5cf6';
                  if (node.type === 'workflowHeader') return '#9333ea';
                  return '#3b82f6';
                }}
                maskColor="rgba(255, 255, 255, 0.9)"
                className="!bg-white !border-2 !border-gray-200 !rounded-xl !shadow-lg"
                position="bottom-right"
                pannable
                zoomable
              />
              
              {/* Layout Toggle Panel */}
              <Panel position="top-right" className="!m-4">
                <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 flex gap-2">
                  <Button
                    variant={layoutMode === 'vertical' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLayoutMode('vertical')}
                    className="gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Vertical
                  </Button>
                  <Button
                    variant={layoutMode === 'horizontal' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLayoutMode('horizontal')}
                    className="gap-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Horizontal
                  </Button>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border border-gray-200">
        <CardContent className="p-5">
          <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded" />
            Flow Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md ring-2 ring-green-200">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Start</p>
                <p className="text-[10px] text-gray-500">Entry point</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Stage</p>
                <p className="text-[10px] text-gray-500">Major phase</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border-2 border-blue-400 bg-white shadow-md flex items-center justify-center">
                <div className="w-5 h-5 rounded bg-blue-100" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Task</p>
                <p className="text-[10px] text-gray-500">Work item</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-md ring-2 ring-red-200">
                <div className="w-3 h-3 bg-white rounded-sm" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">End</p>
                <p className="text-[10px] text-gray-500">Complete</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="w-10 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded" />
                <div className="w-10 h-0.5 bg-gradient-to-r from-purple-500 to-violet-400 rounded" />
                <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Flow</p>
                <p className="text-[10px] text-gray-500">Connections</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-blue-600" />
                </div>
                <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                  <Wrench className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Resources</p>
                <p className="text-[10px] text-gray-500">Agents & Tools</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
