/**
 * LangGraph Workflow Visualizer
 * 
 * A visual workflow designer/editor similar to LangGraph Studio
 * for viewing and potentially editing LangGraph workflows.
 * 
 * Features:
 * - Visual node graph display
 * - Real-time state visualization
 * - Execution path highlighting
 * - Interactive exploration
 * - Export/import capabilities
 */

'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  Brain,
  Settings,
  Download,
  Upload,
} from 'lucide-react';
// NOTE: Commenting out server-side import to prevent 'fs' module error in client component
// import { getLangGraphState } from '@/features/chat/services/langgraph-mode-orchestrator';

// Custom Node Component for LangGraph workflow nodes
function LangGraphNode({ data }: { data: any }) {
  const getNodeColor = (status?: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'pending':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-purple-500 bg-purple-50';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Square className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-md min-w-[200px] ${getNodeColor(
        data.status
      )}`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(data.status)}
          <span className="font-semibold text-sm">{data.label}</span>
        </div>
        {data.duration && (
          <Badge variant="secondary" className="text-xs">
            {data.duration}ms
          </Badge>
        )}
      </div>

      {/* Node Description */}
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}

      {/* Node Metadata */}
      {data.metadata && (
        <div className="space-y-1 mt-2 pt-2 border-t border-gray-200">
          {data.metadata.tokens && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Brain className="w-3 h-3" />
              <span>{data.metadata.tokens} tokens</span>
            </div>
          )}
          {data.metadata.sources && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Database className="w-3 h-3" />
              <span>{data.metadata.sources} sources</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom node types
const nodeTypes = {
  langGraphNode: LangGraphNode,
};

interface LangGraphVisualizerProps {
  sessionId?: string;
  workflowState?: any;
  mode?: 'viewer' | 'editor';
  onNodeClick?: (node: Node) => void;
  onExecute?: () => void;
}

export function LangGraphWorkflowVisualizer({
  sessionId,
  workflowState,
  mode = 'viewer',
  onNodeClick,
  onExecute,
}: LangGraphVisualizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState(workflowState);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  // NOTE: Commented out to prevent server-side import issue
  // Load state from sessionId if provided
  // useEffect(() => {
  //   if (sessionId && !workflowState) {
  //     setIsLoading(true);
  //     getLangGraphState(sessionId)
  //       .then((loadedState) => {
  //         if (loadedState) {
  //           setState(loadedState.values);
  //         }
  //       })
  //       .finally(() => setIsLoading(false));
  //   }
  // }, [sessionId, workflowState]);

  // Generate nodes and edges from LangGraph workflow structure
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Define the LangGraph workflow structure
    const workflowNodes = [
      {
        id: 'start',
        label: 'START',
        description: 'Workflow initialization',
        position: { x: 250, y: 50 },
      },
      {
        id: 'validate',
        label: 'Validate Input',
        description: 'Validate mode, message, and parameters',
        position: { x: 250, y: 180 },
        status: state?.currentStep === 'validated' ? 'completed' : state?.currentStep === 'validating' ? 'running' : 'pending',
      },
      {
        id: 'execute',
        label: 'Execute Mode',
        description: 'Run selected mode handler (1-4)',
        position: { x: 250, y: 320 },
        status: state?.currentStep === 'completed' ? 'completed' : state?.currentStep === 'executing' ? 'running' : 'pending',
        metadata: {
          tokens: state?.totalTokens,
          sources: state?.metadata?.sources?.length,
        },
      },
      {
        id: 'finalize',
        label: 'Finalize',
        description: 'Add metrics, logging, cleanup',
        position: { x: 250, y: 460 },
        status: state?.currentStep === 'finalized' ? 'completed' : state?.currentStep === 'finalizing' ? 'running' : 'pending',
        duration: state?.endTime && state?.startTime ? state.endTime - state.startTime : undefined,
      },
      {
        id: 'end',
        label: 'END',
        description: 'Workflow complete',
        position: { x: 250, y: 600 },
      },
    ];

    // Create nodes
    workflowNodes.forEach((node) => {
      nodes.push({
        id: node.id,
        type: node.id === 'start' || node.id === 'end' ? 'default' : 'langGraphNode',
        position: node.position,
        data: {
          label: node.label,
          description: node.description,
          status: node.status,
          duration: node.duration,
          metadata: node.metadata,
        },
        sourcePosition: node.id === 'end' ? undefined : Position.Bottom,
        targetPosition: node.id === 'start' ? undefined : Position.Top,
      });
    });

    // Create edges
    const connections = [
      { source: 'start', target: 'validate', animated: true, color: '#22c55e' },
      { source: 'validate', target: 'execute', animated: true, color: '#3b82f6' },
      { source: 'execute', target: 'finalize', animated: true, color: '#8b5cf6' },
      { source: 'finalize', target: 'end', animated: true, color: '#ef4444' },
    ];

    connections.forEach(({ source, target, animated, color }) => {
      const isActive = 
        state?.currentStep === target ||
        (state?.currentStep === 'completed' && target === 'end');

      edges.push({
        id: `${source}-${target}`,
        source,
        target,
        animated: isActive,
        style: {
          stroke: isActive ? color : '#d1d5db',
          strokeWidth: isActive ? 3 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? color : '#d1d5db',
        },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [state]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when state changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const data = {
      nodes,
      edges,
      state,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    if (typeof document === 'undefined') {
      console.warn('Workflow export is only available in the browser environment.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `langgraph-workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, state]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading workflow state...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-purple-600" />
              <div>
                <CardTitle>LangGraph Workflow Visualizer</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {mode === 'editor' ? 'Interactive workflow designer' : 'Real-time workflow visualization'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onExecute && (
                <Button onClick={onExecute} size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  Execute
                </Button>
              )}
              <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* State Info */}
      {state && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Current Step</p>
                <Badge variant="secondary">{state.currentStep || 'Idle'}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Mode</p>
                <Badge>{state.mode || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Tokens</p>
                <p className="font-semibold">{state.totalTokens || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-semibold">
                  {state.endTime && state.startTime
                    ? `${state.endTime - state.startTime}ms`
                    : 'In progress...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Canvas */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-0">
          <div className="w-full h-[600px] bg-gray-50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => onNodeClick?.(node)}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              minZoom={0.3}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              connectionLineType={ConnectionLineType.SmoothStep}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e5e7eb" gap={20} size={1} />
              <Controls
                showZoom
                showFitView
                showInteractive={mode === 'editor'}
                position="top-left"
              />
              <MiniMap
                nodeColor={(node) => {
                  const status = node.data?.status;
                  if (status === 'running') return '#3b82f6';
                  if (status === 'completed') return '#22c55e';
                  if (status === 'error') return '#ef4444';
                  return '#9333ea';
                }}
                maskColor="rgba(255, 255, 255, 0.85)"
                position="bottom-right"
              />
              
              {/* Status Panel */}
              <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg border">
                <div className="space-y-2">
                  <p className="font-semibold text-sm mb-3">Legend</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Square className="w-3 h-3 text-gray-400" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Running</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span>Error</span>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* State Details */}
      {state?.finalResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Final Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="text-gray-700 whitespace-pre-wrap">
                {state.finalResponse.substring(0, 500)}
                {state.finalResponse.length > 500 && '...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
