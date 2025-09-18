'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  Position,
  MarkerType,
} from 'reactflow';
import dagre from 'dagre';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EnhancedWorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  EnhancedWorkflowStep,
  WorkflowBuilderState
} from '@/types/workflow-enhanced';
import {
  Play,
  Plus,
  Save,
  Download,
  Upload,
  Trash2,
  Settings,
  GitBranch,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Edit
} from 'lucide-react';

import 'reactflow/dist/style.css';

// Custom node types
const StepNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const step: EnhancedWorkflowStep = data.step;

  return (
    <div
      className={`
        bg-white border-2 rounded-lg p-3 min-w-[200px] shadow-md
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
        ${data.status === 'completed' ? 'bg-green-50 border-green-200' : ''}
        ${data.status === 'running' ? 'bg-blue-50 border-blue-200' : ''}
        ${data.status === 'failed' ? 'bg-red-50 border-red-200' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          Step {step.step_number}
        </Badge>
        <div className="flex items-center gap-1">
          {step.is_parallel && <GitBranch className="h-3 w-3 text-blue-500" />}
          {step.required_capabilities.length > 0 && <Users className="h-3 w-3 text-purple-500" />}
          {step.timeout_config && <Clock className="h-3 w-3 text-orange-500" />}
        </div>
      </div>

      {/* Step name */}
      <h4 className="font-medium text-sm mb-1 text-gray-900">
        {step.step_name}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
        {step.step_description}
      </p>

      {/* Capabilities */}
      {step.required_capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {step.required_capabilities.slice(0, 2).map((capability, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {capability}
            </Badge>
          ))}
          {step.required_capabilities.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{step.required_capabilities.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Status and duration */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{step.estimated_duration}min</span>
        {data.status && (
          <div className="flex items-center gap-1">
            {data.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
            {data.status === 'failed' && <AlertTriangle className="h-3 w-3 text-red-500" />}
            <span className="capitalize">{data.status}</span>
          </div>
        )}
      </div>

      {/* Node handles */}
      <div
        className="absolute top-1/2 -left-2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2"
        style={{ left: '-8px' }}
      />
      <div
        className="absolute top-1/2 -right-2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2"
        style={{ right: '-8px' }}
      />
    </div>
  );
};

const DecisionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div
      className={`
        bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 min-w-[160px] shadow-md
        ${selected ? 'border-yellow-500 shadow-lg' : ''}
      `}
    >
      <div className="text-center">
        <GitBranch className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
        <h4 className="font-medium text-sm text-gray-900">
          {data.label || 'Decision'}
        </h4>
        <p className="text-xs text-gray-600 mt-1">
          Conditional branching
        </p>
      </div>
    </div>
  );
};

const ParallelNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div
      className={`
        bg-purple-50 border-2 border-purple-300 rounded-lg p-3 min-w-[160px] shadow-md
        ${selected ? 'border-purple-500 shadow-lg' : ''}
      `}
    >
      <div className="text-center">
        <div className="flex justify-center mb-1">
          <GitBranch className="h-4 w-4 text-purple-600 transform rotate-90" />
        </div>
        <h4 className="font-medium text-sm text-gray-900">
          {data.label || 'Parallel'}
        </h4>
        <p className="text-xs text-gray-600 mt-1">
          Parallel execution
        </p>
      </div>
    </div>
  );
};

const nodeTypes = {
  step: StepNode,
  decision: DecisionNode,
  parallel: ParallelNode,
};

// Auto-layout function using Dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - 100,
      y: nodeWithPosition.y - 60,
    };
  });

  return { nodes, edges };
};

interface WorkflowBuilderProps {
  workflow?: EnhancedWorkflowDefinition;
  onSave?: (workflow: EnhancedWorkflowDefinition) => void;
  onValidate?: (workflow: EnhancedWorkflowDefinition) => Promise<any>;
  readOnly?: boolean;
}

const WorkflowBuilderContent: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onSave,
  onValidate,
  readOnly = false
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  const { fitView, getNodes, getEdges } = useReactFlow();

  // Initialize workflow from props
  useEffect(() => {
    if (workflow) {
      loadWorkflowIntoBuilder(workflow);
    }
  }, [workflow]);

  const loadWorkflowIntoBuilder = (workflowDef: EnhancedWorkflowDefinition) => {
    const workflowNodes: Node[] = [];
    const workflowEdges: Edge[] = [];

    // Convert workflow steps to nodes
    workflowDef.steps.forEach((step, index) => {
      const nodeData = {
        label: step.step_name,
        step: step,
        status: undefined, // Can be set based on execution state
      };

      workflowNodes.push({
        id: step.id.toString(),
        type: 'step',
        position: step.position || { x: index * 250, y: 0 },
        data: nodeData,
      });
    });

    // Create edges from conditional_next relationships
    workflowDef.steps.forEach((step) => {
      if (step.conditional_next) {
        step.conditional_next.forEach((condition, idx) => {
          workflowEdges.push({
            id: `${step.id}-${condition.next_step_id}-${idx}`,
            source: step.id.toString(),
            target: condition.next_step_id,
            type: 'smoothstep',
            animated: false,
            label: condition.condition,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            data: {
              condition: condition.condition,
            },
          });
        });
      }
    });

    // Add parallel branch handling
    if (workflowDef.parallel_branches) {
      workflowDef.parallel_branches.forEach((branch) => {
        // Add parallel node
        const parallelNodeId = `parallel-${branch.id}`;
        workflowNodes.push({
          id: parallelNodeId,
          type: 'parallel',
          position: { x: 0, y: 0 },
          data: { label: branch.name },
        });

        // Connect to parallel steps
        branch.steps.forEach((stepId) => {
          workflowEdges.push({
            id: `${parallelNodeId}-${stepId}`,
            source: parallelNodeId,
            target: stepId,
            type: 'smoothstep',
            style: { stroke: '#9333ea' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
          });
        });
      });
    }

    // Auto-layout the nodes
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      workflowNodes,
      workflowEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after a short delay to ensure nodes are rendered
    setTimeout(() => fitView(), 100);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;

      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [readOnly, setEdges]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSelectedEdge(null);
    },
    []
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    []
  );

  const addNewStep = () => {
    if (readOnly) return;

    const newStepId = `step-${Date.now()}`;
    const newStep: EnhancedWorkflowStep = {
      id: parseInt(newStepId.split('-')[1]),
      jtbd_id: workflow?.id || '',
      step_number: nodes.length + 1,
      step_name: 'New Step',
      step_description: 'Describe what this step does',
      agent_id: undefined,
      is_parallel: false,
      estimated_duration: 30,
      required_capabilities: [],
      input_schema: { type: 'object', properties: {} },
      output_schema: { type: 'object', properties: {} },
      error_handling: {},
    };

    const newNode: Node = {
      id: newStepId,
      type: 'step',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: newStep.step_name,
        step: newStep,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelectedNode = () => {
    if (readOnly || !selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
  };

  const autoLayout = () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      getNodes(),
      getEdges()
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView(), 100);
  };

  const validateWorkflow = async () => {
    if (!onValidate || !workflow) return;

    setIsValidating(true);
    try {
      const workflowDef = buildWorkflowFromNodes();
      const results = await onValidate(workflowDef);
      setValidationResults(results);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const buildWorkflowFromNodes = (): EnhancedWorkflowDefinition => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const steps: EnhancedWorkflowStep[] = [];

    currentNodes.forEach((node) => {
      if (node.type === 'step' && node.data.step) {
        const step = { ...node.data.step };
        step.position = node.position;

        // Build conditional_next from edges
        const outgoingEdges = currentEdges.filter(edge => edge.source === node.id);
        if (outgoingEdges.length > 0) {
          step.conditional_next = outgoingEdges.map(edge => ({
            condition: edge.data?.condition || 'true',
            next_step_id: edge.target,
            priority: 1,
          }));
        }

        steps.push(step);
      }
    });

    return {
      ...workflow!,
      steps,
    };
  };

  const saveWorkflow = () => {
    if (!onSave || readOnly) return;

    const workflowDef = buildWorkflowFromNodes();
    onSave(workflowDef);
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeStrokeColor="#374151"
          nodeColor="#9CA3AF"
          nodeBorderRadius={8}
        />
        <Background variant="dots" gap={12} size={1} />

        {/* Toolbar */}
        <Panel position="top-right">
          <div className="flex flex-col gap-2 bg-white p-2 rounded-lg shadow-lg border">
            {!readOnly && (
              <>
                <Button size="sm" onClick={addNewStep} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Add Step
                </Button>
                <Button size="sm" variant="outline" onClick={autoLayout} className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  Auto Layout
                </Button>
                {selectedNode && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={deleteSelectedNode}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                )}
                <Button size="sm" onClick={saveWorkflow} className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={validateWorkflow}
              disabled={isValidating}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>
        </Panel>

        {/* Validation Results Panel */}
        {validationResults && (
          <Panel position="bottom-right">
            <Card className="w-80 max-h-60 overflow-y-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {validationResults.is_valid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validationResults.errors?.map((error: any, idx: number) => (
                  <div key={idx} className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                    <strong className="text-red-700">Error:</strong> {error.message}
                  </div>
                ))}
                {validationResults.warnings?.map((warning: any, idx: number) => (
                  <div key={idx} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <strong className="text-yellow-700">Warning:</strong> {warning.message}
                  </div>
                ))}
                {validationResults.is_valid && (
                  <div className="text-xs p-2 bg-green-50 border border-green-200 rounded text-green-700">
                    Workflow is valid and ready for execution!
                  </div>
                )}
              </CardContent>
            </Card>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
};