/**
 * Enhanced Workflow Visualizer with Real-time Execution Monitoring
 * 
 * Extends the existing LangGraph visualizer with:
 * - Real-time node state updates
 * - Animated execution flow
 * - Live progress tracking
 * - Execution metrics display
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';
import { getNodeTypeDefinition } from '../../constants/node-types';
import type { WorkflowDefinition, ExecutionState, NodeExecutionState } from '../../types/workflow';

interface ExecutionVisualizerProps {
  workflow: WorkflowDefinition;
  executionId?: string;
  autoStart?: boolean;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function ExecutionVisualizer({
  workflow,
  executionId,
  autoStart = false,
  onComplete,
  onError,
}: ExecutionVisualizerProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    startTime: 0,
    elapsedTime: 0,
    totalTokens: 0,
    estimatedCost: 0,
  });

  // Convert workflow to React Flow nodes with execution state
  const initialNodes: Node[] = workflow.nodes.map(node => {
    const nodeDef = getNodeTypeDefinition(node.type);
    const nodeState = executionState?.nodeStates[node.id];
    
    return {
      id: node.id,
      type: 'default',
      position: node.position,
      data: {
        ...node,
        status: nodeState?.status || 'pending',
        label: node.label,
      },
      style: {
        backgroundColor: nodeDef.bgColor,
        borderColor: getNodeBorderColor(nodeState?.status),
        borderWidth: nodeState?.status === 'running' ? 3 : 2,
        boxShadow: nodeState?.status === 'running' 
          ? `0 0 20px ${nodeDef.color}`
          : undefined,
      },
      className: nodeState?.status === 'running' ? 'animate-pulse' : '',
    };
  });

  const initialEdges: Edge[] = workflow.edges.map(edge => {
    const sourceNode = workflow.nodes.find(n => n.id === edge.source);
    const targetNode = workflow.nodes.find(n => n.id === edge.target);
    const sourceState = executionState?.nodeStates[edge.source];
    const targetState = executionState?.nodeStates[edge.target];
    
    const isActive = 
      sourceState?.status === 'completed' && 
      (targetState?.status === 'running' || targetState?.status === 'completed');
    
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: isActive,
      style: {
        stroke: isActive ? '#8b5cf6' : '#d1d5db',
        strokeWidth: isActive ? 3 : 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? '#8b5cf6' : '#d1d5db',
      },
    };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when execution state changes
  useEffect(() => {
    if (!executionState) return;

    // Update nodes
    setNodes(prevNodes => prevNodes.map(node => {
      const nodeState = executionState.nodeStates[node.id];
      if (!nodeState) return node;

      const nodeDef = getNodeTypeDefinition(node.data.type);
      
      return {
        ...node,
        data: {
          ...node.data,
          status: nodeState.status,
        },
        style: {
          ...node.style,
          borderColor: getNodeBorderColor(nodeState.status),
          borderWidth: nodeState.status === 'running' ? 3 : 2,
          boxShadow: nodeState.status === 'running' 
            ? `0 0 20px ${nodeDef.color}`
            : undefined,
        },
        className: nodeState.status === 'running' ? 'animate-pulse' : '',
      };
    }));

    // Update edges
    setEdges(prevEdges => prevEdges.map(edge => {
      const sourceState = executionState.nodeStates[edge.source];
      const targetState = executionState.nodeStates[edge.target];
      
      const isActive = 
        sourceState?.status === 'completed' && 
        (targetState?.status === 'running' || targetState?.status === 'completed');
      
      return {
        ...edge,
        animated: isActive,
        style: {
          ...edge.style,
          stroke: isActive ? '#8b5cf6' : '#d1d5db',
          strokeWidth: isActive ? 3 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#8b5cf6' : '#d1d5db',
        },
      };
    }));

    // Update progress
    const totalNodes = Object.keys(executionState.nodeStates).length;
    const completedNodes = Object.values(executionState.nodeStates)
      .filter(state => state.status === 'completed').length;
    setProgress((completedNodes / totalNodes) * 100);

    // Update current node
    const runningNode = Object.entries(executionState.nodeStates)
      .find(([_, state]) => state.status === 'running');
    setCurrentNodeId(runningNode ? runningNode[0] : null);
  }, [executionState, setNodes, setEdges]);

  // Monitor execution via Server-Sent Events
  useEffect(() => {
    if (!executionId || !isExecuting) return;

    const eventSource = new EventSource(`/api/executions/${executionId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'state_update') {
          setExecutionState(data.state);
        } else if (data.type === 'metrics') {
          setMetrics(prev => ({
            ...prev,
            ...data.metrics,
          }));
        } else if (data.type === 'complete') {
          setIsExecuting(false);
          eventSource.close();
          onComplete?.(data.result);
        } else if (data.type === 'error') {
          setIsExecuting(false);
          eventSource.close();
          onError?.(data.error);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      setIsExecuting(false);
      eventSource.close();
      onError?.('Connection lost');
    };

    return () => {
      eventSource.close();
    };
  }, [executionId, isExecuting, onComplete, onError]);

  // Update elapsed time
  useEffect(() => {
    if (!isExecuting || !metrics.startTime) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        elapsedTime: Date.now() - prev.startTime,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isExecuting, metrics.startTime]);

  const handleStart = useCallback(async () => {
    setIsExecuting(true);
    setMetrics({
      startTime: Date.now(),
      elapsedTime: 0,
      totalTokens: 0,
      estimatedCost: 0,
    });

    // Initialize execution state
    setExecutionState({
      nodeStates: workflow.nodes.reduce((acc, node) => ({
        ...acc,
        [node.id]: {
          status: 'pending',
          startTime: undefined,
          endTime: undefined,
        },
      }), {}),
    });

    // Start execution
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {},
          streaming: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      // Response will be handled by SSE listener
    } catch (error) {
      setIsExecuting(false);
      onError?.(error instanceof Error ? error.message : 'Execution failed');
    }
  }, [workflow, onError]);

  const handleStop = useCallback(() => {
    setIsExecuting(false);
    // TODO: Implement cancellation endpoint
  }, []);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isExecuting) {
      handleStart();
    }
  }, [autoStart]); // eslint-disable-line

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header with Metrics */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-sm">Workflow Execution</h3>
                <p className="text-xs text-gray-600">{workflow.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isExecuting ? (
                <Button onClick={handleStart} size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              ) : (
                <Button onClick={handleStop} variant="destructive" size="sm" className="gap-2">
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <Badge variant={isExecuting ? 'default' : 'secondary'}>
                {isExecuting ? 'Running' : 'Idle'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="text-sm font-semibold">
                {formatDuration(metrics.elapsedTime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Current Node</p>
              <p className="text-sm font-semibold truncate">
                {currentNodeId ? workflow.nodes.find(n => n.id === currentNodeId)?.label : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Tokens</p>
              <p className="text-sm font-semibold">
                {metrics.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              minZoom={0.3}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e5e7eb" gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const status = node.data?.status;
                  if (status === 'running') return '#3b82f6';
                  if (status === 'completed') return '#22c55e';
                  if (status === 'error') return '#ef4444';
                  return '#9ca3af';
                }}
                maskColor="rgba(255, 255, 255, 0.85)"
              />
              
              {/* Status Legend */}
              <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg border">
                <div className="space-y-2">
                  <p className="font-semibold text-xs mb-2">Status</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>Running</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Error</span>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get node border color based on status
function getNodeBorderColor(status?: string): string {
  switch (status) {
    case 'running':
      return '#3b82f6';
    case 'completed':
      return '#22c55e';
    case 'error':
      return '#ef4444';
    case 'pending':
    default:
      return '#d1d5db';
  }
}

